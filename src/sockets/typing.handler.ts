import { Server, Socket } from 'socket.io';

export const setupTypingHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId!;

  socket.on('typing:start', (data) => {
    socket.to(`conv:${data.conversationId}`).emit('typing:update', {
      conversationId: data.conversationId,
      userId,
      isTyping: true
    });
  });

  socket.on('typing:stop', (data) => {
    socket.to(`conv:${data.conversationId}`).emit('typing:update', {
      conversationId: data.conversationId,
      userId,
      isTyping: false
    });
  });
};
