import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { UploadService } from './upload.service.js';
import mongoose from 'mongoose';

export const retentionMs: Record<'1d' | '3d' | '7d' | '30d', number> = {
  '1d': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const resolveMessageStatus = (msg: any, participantCount: number) => {
  const recipientsCount = participantCount > 1 ? participantCount - 1 : 1;
  const readCount = msg.readBy ? msg.readBy.length : 0;
  const deliveredCount = msg.deliveredTo ? msg.deliveredTo.length : 0;

  if (readCount >= recipientsCount) {
    return 'read';
  } else if (deliveredCount >= recipientsCount) {
    return 'delivered';
  } else {
    return 'sent';
  }
};

export class MessageService {
  static async sendMessage(conversationId: string, senderId: string, data: any) {
    const conv = await Conversation.findById(conversationId).select('participants disappearingMessages').lean();
    if (!conv || !conv.participants.some(id => id.toString() === senderId)) {
      throw { name: 'ValidationError', message: 'Conversation not found or access denied' };
    }

    const now = new Date();
    const timer = conv.disappearingMessages;
    const durMs = timer?.duration && timer.duration in retentionMs 
      ? retentionMs[timer.duration as keyof typeof retentionMs] 
      : undefined;
    const expiresAt = durMs ? new Date(now.getTime() + durMs) : undefined;

    const message = new Message({
      conversationId,
      senderId,
      ...data,
      deliveredTo: [],
      readBy: [],
      deletedFor: [],
      expiresAt,
      expiresFor: [],
    });
    await message.save();
    
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date(), hiddenBy: [] });
    
    const participantCount = conv ? conv.participants.length : 2;

    const msgObj = message.toObject();
    if (msgObj.mediaUrl) {
      try {
        msgObj.mediaUrl = await UploadService.generatePresignedGetUrl(msgObj.mediaUrl);
      } catch (err) {
        console.error('Failed to generate presigned GET URL on send:', err);
      }
    }
    (msgObj as any).status = resolveMessageStatus(msgObj, participantCount);
    return msgObj;
  }

  static async getMessages(conversationId: string, userId: string, before?: string, limit = 30) {
    const conv = await Conversation.findById(conversationId).select('participants disappearingMessages').lean();
    const participantCount = conv ? conv.participants.length : 2;
    
    const now = new Date();
    const query: any = {
      conversationId,
      deletedFor: { $ne: userId },
      deletedForEveryone: { $ne: true },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } }
      ]
    };

    if (conv?.disappearingMessages?.duration && conv.disappearingMessages.duration !== 'never') {
      const durMs = retentionMs[conv.disappearingMessages.duration as keyof typeof retentionMs];
      if (durMs) {
        const cutoff = new Date(now.getTime() - durMs);
        query.createdAt = { $gt: cutoff };
      }
    }

    if (before) {
      query.createdAt = {
        ...(query.createdAt || {}),
        $lt: new Date(before)
      };
    }
    
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    for (const msg of messages) {
      if (msg.mediaUrl) {
        try {
          msg.mediaUrl = await UploadService.generatePresignedGetUrl(msg.mediaUrl);
        } catch (err) {
          console.error('Failed to generate presigned GET URL on list:', err);
        }
      }
      (msg as any).status = resolveMessageStatus(msg, participantCount);
    }

    return messages;
  }

  static async markDelivered(messageIds: string[], userId: string) {
    return Message.updateMany(
      { _id: { $in: messageIds }, senderId: { $ne: userId } },
      { $addToSet: { deliveredTo: userId } }
    );
  }

  static async markRead(messageIds: string[], userId: string) {
    const result = await Message.updateMany(
      { _id: { $in: messageIds }, senderId: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    try {
      const messages = await Message.find({ _id: { $in: messageIds } }).select('_id conversationId readBy senderId').lean();
      const expiredIds: string[] = [];
      const convCache = new Map<string, any>();

      for (const msg of messages) {
        const convId = msg.conversationId.toString();
        if (!convCache.has(convId)) {
          const conv = await Conversation.findById(convId).select('participants disappearingMessages').lean();
          convCache.set(convId, conv);
        }
        const conv = convCache.get(convId);
        if (conv?.disappearingMessages?.duration === 'after_read') {
          const targetReadCount = conv.participants.length > 1 ? conv.participants.length - 1 : 1;
          const readCount = msg.readBy ? msg.readBy.length : 0;
          if (readCount >= targetReadCount) {
            expiredIds.push(msg._id.toString());
          }
        }
      }

      if (expiredIds.length > 0) {
        await Message.deleteMany({ _id: { $in: expiredIds } });
        const io = (global as any).io;
        if (io) {
          messages.forEach(m => {
            if (expiredIds.includes(m._id.toString())) {
              io.to(`conv:${m.conversationId.toString()}`).emit('messages:expired', { messageIds: [m._id.toString()] });
            }
          });
        }
      }
    } catch (err) {
      console.error('Error in markRead after_read expiration:', err);
    }

    return result;
  }

  static async addReaction(messageId: string, userId: string, emoji: string) {
    await this.removeReaction(messageId, userId); // ensure 1 reaction per user
    return Message.findByIdAndUpdate(
      messageId,
      { $push: { reactions: { userId, emoji } } },
      { new: true }
    );
  }

  static async removeReaction(messageId: string, userId: string) {
    return Message.findByIdAndUpdate(
      messageId,
      { $pull: { reactions: { userId } } },
      { new: true }
    );
  }

  static async editMessage(messageId: string, userId: string, newText: string) {
    const msg = await Message.findOne({ _id: messageId, senderId: userId });
    if (!msg || msg.type !== 'text') {
      throw { name: 'ValidationError', message: 'Cannot edit this message' };
    }
    msg.content = newText;
    msg.edited = true;
    msg.editedAt = new Date();
    await msg.save();
    return msg;
  }

  static async deleteMessage(messageId: string, userId: string, forEveryone: boolean) {
    const msg = await Message.findById(messageId);
    if (!msg) throw { name: 'ValidationError', message: 'Message not found' };

    if (forEveryone) {
      if (msg.senderId.toString() !== userId.toString()) {
        throw { name: 'ValidationError', message: 'Only sender can delete for everyone' };
      }
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (msg.createdAt < oneHourAgo) {
        throw { name: 'ValidationError', message: 'Time limit exceeded for deleting for everyone' };
      }
      msg.deletedForEveryone = true;
      msg.content = '';
      msg.mediaUrl = undefined;
      await msg.save();
      return msg;
    } else {
      msg.deletedFor.push(new mongoose.Types.ObjectId(userId));
      await msg.save();
      return msg;
    }
  }

  static async searchMessages(conversationId: string, query: string, userId: string) {
    return Message.find({
      conversationId,
      content: new RegExp(query, 'i'),
      deletedFor: { $ne: userId },
      deletedForEveryone: { $ne: true },
      type: 'text'
    }).limit(50).lean();
  }
}
