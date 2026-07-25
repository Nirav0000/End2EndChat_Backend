import { Server, Socket } from 'socket.io';
import { MessageService } from '../services/message.service.js';
import { Conversation } from '../models/Conversation.js';

export const setupMessageHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId!;

  socket.on('message:send', async (data) => {
    try {
      const msg = await MessageService.sendMessage(data.conversationId, userId, data);
      
      io.to(`conv:${data.conversationId}`).emit('message:new', msg);

      const conv = await Conversation.findById(data.conversationId).select('participants').lean();
      if (conv && Array.isArray(conv.participants)) {
        conv.participants.forEach((pId: any) => {
          const pStr = pId.toString();
          if (pStr !== userId) {
            io.to(`user:${pStr}`).emit('message:new', msg);
          }
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  socket.on('message:delivered', async (data) => {
    try {
      await MessageService.markDelivered(data.messageIds, userId);
      io.to(`conv:${data.conversationId}`).emit('message:update', { messageIds: data.messageIds, status: 'delivered', userId });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('message:read', async (data) => {
    try {
      await MessageService.markRead(data.messageIds, userId);
      io.to(`conv:${data.conversationId}`).emit('message:update', { messageIds: data.messageIds, status: 'read', userId });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('message:react', async (data) => {
    try {
      const msg = await MessageService.addReaction(data.messageId, userId, data.emoji);
      io.to(`conv:${msg!.conversationId}`).emit('message:update', { messageIds: [data.messageId], reactions: msg!.reactions });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('message:edit', async (data) => {
    try {
      const msg = await MessageService.editMessage(data.messageId, userId, data.content);
      io.to(`conv:${data.conversationId}`).emit('message:update', {
        messageIds: [data.messageId],
        content: msg.content,
        edited: true,
        editedAt: msg.editedAt
      });
    } catch (err) {
      console.error('Error editing message:', err);
    }
  });

  socket.on('message:delete', async (data) => {
    try {
      const rawIds = data.messageIds || data.messageId;
      const messageIds: string[] = Array.isArray(rawIds) ? rawIds : [rawIds];
      const forEveryone = !!data.forEveryone;
      const processedIds: string[] = [];

      for (const msgId of messageIds) {
        if (!msgId) continue;
        try {
          await MessageService.deleteMessage(msgId, userId, forEveryone);
          processedIds.push(msgId);
        } catch (e) {
          console.error(`Failed to delete message ${msgId}:`, e);
        }
      }

      if (processedIds.length > 0) {
        if (forEveryone) {
          io.to(`conv:${data.conversationId}`).emit('messages:expired', { messageIds: processedIds });
        } else {
          socket.emit('messages:expired', { messageIds: processedIds });
        }
      }
    } catch (err) {
      console.error('Error deleting messages:', err);
    }
  });
};
