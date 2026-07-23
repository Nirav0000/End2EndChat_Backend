import { Server, Socket } from 'socket.io';
import { MessageService } from '../services/message.service.js';

export const setupMessageHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId!;

  socket.on('message:send', async (data) => {
    try {
      const msg = await MessageService.sendMessage(data.conversationId, userId, data);
      io.to(`conv:${data.conversationId}`).emit('message:new', msg);
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
};
