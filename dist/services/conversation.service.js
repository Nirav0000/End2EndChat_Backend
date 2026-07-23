import { Conversation } from '../models/Conversation.js';
import mongoose from 'mongoose';
export class ConversationService {
    static retentionMs = {
        '1d': 24 * 60 * 60 * 1000,
        '3d': 3 * 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
    };
    static async createDirectConversation(userId1, userId2) {
        // Attempt to use statics if defined, else manual search
        let conv = await Conversation.findDirectBetween(userId1, userId2);
        if (!conv) {
            conv = new Conversation({
                type: 'direct',
                participants: [userId1, userId2],
            });
            await conv.save();
        }
        return conv.populate('participants', 'name avatarUrl');
    }
    static async createGroupConversation(creatorId, name, memberIds) {
        const participants = Array.from(new Set([creatorId, ...memberIds]));
        const conv = new Conversation({
            type: 'group',
            participants,
            groupName: name,
            groupAdmins: [creatorId],
        });
        await conv.save();
        return conv;
    }
    static async getConversations(userId) {
        const conversations = await Conversation.find({
            participants: userId,
            hiddenBy: { $ne: new mongoose.Types.ObjectId(userId) }
        })
            .populate('lastMessage')
            .populate('participants', 'name avatarUrl')
            .sort({ updatedAt: -1 })
            .lean();
        for (const conv of conversations) {
            if (conv.lastMessage) {
                const participantCount = conv.participants ? conv.participants.length : 2;
                const recipientsCount = participantCount > 1 ? participantCount - 1 : 1;
                const lastMsg = conv.lastMessage;
                const readCount = Array.isArray(lastMsg.readBy) ? lastMsg.readBy.length : 0;
                const deliveredCount = Array.isArray(lastMsg.deliveredTo) ? lastMsg.deliveredTo.length : 0;
                if (readCount >= recipientsCount) {
                    lastMsg.status = 'read';
                }
                else if (deliveredCount >= recipientsCount) {
                    lastMsg.status = 'delivered';
                }
                else {
                    lastMsg.status = 'sent';
                }
            }
        }
        return conversations;
    }
    static async getConversation(conversationId, userId) {
        const conv = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
        }).lean();
        if (!conv) {
            throw { name: 'ValidationError', message: 'Conversation not found or access denied' };
        }
        return conv;
    }
    static async updateGroup(conversationId, userId, updates) {
        const conv = await Conversation.findOne({ _id: conversationId, type: 'group', groupAdmins: userId });
        if (!conv) {
            throw { name: 'ValidationError', message: 'Only admins can update group details' };
        }
        if (updates.groupName)
            conv.groupName = updates.groupName;
        if (updates.groupAvatarUrl)
            conv.groupAvatarUrl = updates.groupAvatarUrl;
        await conv.save();
        return conv;
    }
    static async addGroupMembers(conversationId, adminId, memberIds) {
        return Conversation.findOneAndUpdate({ _id: conversationId, type: 'group', groupAdmins: adminId }, { $addToSet: { participants: { $each: memberIds } } }, { new: true });
    }
    static async removeGroupMember(conversationId, adminId, memberId) {
        return Conversation.findOneAndUpdate({ _id: conversationId, type: 'group', groupAdmins: adminId }, { $pull: { participants: memberId, groupAdmins: memberId } }, { new: true });
    }
    static async leaveGroup(conversationId, userId) {
        return Conversation.findOneAndUpdate({ _id: conversationId, type: 'group' }, { $pull: { participants: userId, groupAdmins: userId } }, { new: true });
    }
    static async muteConversation(conversationId, userId, mute) {
        if (mute) {
            return Conversation.findByIdAndUpdate(conversationId, { $addToSet: { mutedBy: userId } }, { new: true });
        }
        else {
            return Conversation.findByIdAndUpdate(conversationId, { $pull: { mutedBy: userId } }, { new: true });
        }
    }
    static async updateMessageRetention(conversationId, userId, duration, io) {
        const conv = await Conversation.findOne({ _id: conversationId, participants: userId });
        if (!conv)
            throw { name: 'ValidationError', message: 'Conversation not found or access denied' };
        const now = new Date();
        conv.messageRetention = [];
        conv.disappearingMessages = duration === 'never'
            ? undefined
            : { duration, enabledAt: now, enabledBy: new mongoose.Types.ObjectId(userId) };
        const { Message } = await import('../models/Message.js');
        const { retentionMs } = await import('./message.service.js');
        if (duration === 'never') {
            await Message.updateMany({ conversationId }, { $set: { expiresFor: [] }, $unset: { expiresAt: 1 } });
        }
        else {
            const durMs = retentionMs[duration];
            const allMessages = await Message.find({ conversationId }).lean();
            const expiredIds = [];
            const bulkOps = [];
            for (const msg of allMessages) {
                const expiresAt = new Date(msg.createdAt.getTime() + durMs);
                if (expiresAt <= now) {
                    expiredIds.push(msg._id);
                }
                else {
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: msg._id },
                            update: { $set: { expiresAt, expiresFor: [] } }
                        }
                    });
                }
            }
            if (bulkOps.length > 0) {
                await Message.bulkWrite(bulkOps);
            }
            if (expiredIds.length > 0) {
                await Message.deleteMany({ _id: { $in: expiredIds } });
                const expiredStrIds = expiredIds.map(id => id.toString());
                if (io) {
                    io.to(`conv:${conversationId}`).emit('messages:expired', { messageIds: expiredStrIds });
                }
                if (conv.lastMessage && expiredStrIds.includes(conv.lastMessage.toString())) {
                    const newest = await Message.findOne({ conversationId }).sort({ createdAt: -1 }).lean();
                    conv.lastMessage = newest ? newest._id : undefined;
                }
            }
        }
        await conv.save();
        return conv.toObject();
    }
    static async pinConversation(conversationId, userId, pin) {
        if (pin) {
            return Conversation.findByIdAndUpdate(conversationId, { $addToSet: { pinnedBy: userId } }, { new: true });
        }
        else {
            return Conversation.findByIdAndUpdate(conversationId, { $pull: { pinnedBy: userId } }, { new: true });
        }
    }
    static async favoriteConversation(conversationId, userId, favorite) {
        if (favorite) {
            return Conversation.findByIdAndUpdate(conversationId, { $addToSet: { favoritedBy: userId } }, { new: true });
        }
        else {
            return Conversation.findByIdAndUpdate(conversationId, { $pull: { favoritedBy: userId } }, { new: true });
        }
    }
    static async clearConversation(conversationId, userId) {
        // Add user to deletedFor array of all current messages in this conversation
        const { Message } = await import('../models/Message.js');
        await Message.updateMany({ conversationId, deletedFor: { $ne: new mongoose.Types.ObjectId(userId) } }, { $addToSet: { deletedFor: new mongoose.Types.ObjectId(userId) } });
        return { success: true };
    }
    static async deleteConversation(conversationId, userId) {
        // First clear all messages
        await this.clearConversation(conversationId, userId);
        // Mark conversation as hidden for this user
        await Conversation.findByIdAndUpdate(conversationId, {
            $addToSet: { hiddenBy: new mongoose.Types.ObjectId(userId) }
        });
        return { success: true };
    }
}
//# sourceMappingURL=conversation.service.js.map