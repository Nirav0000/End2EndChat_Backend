import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from '../types/socket.js';
import { setupMessageHandlers } from './message.handler.js';
import { setupTypingHandlers } from './typing.handler.js';
import { setupPresenceHandlers } from './presence.handler.js';
import { setupCallHandlers } from './call.handler.js';
import { PresenceService } from '../services/presence.service.js';

export const setupSocketIO = (io: Server<ClientToServerEvents, ServerToClientEvents, any, SocketData>) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error('No token');
      
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId).lean();
      if (!user) throw new Error('User not found');
      
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId!;
    
    // Join user's personal room
    socket.join(`user:${userId}`);
    
    // Join conversation rooms
    const convs = await Conversation.find({ participants: userId }).select('_id');
    convs.forEach(c => socket.join(`conv:${c._id}`));

    await PresenceService.setOnline(userId);
    setupPresenceHandlers(io, socket);
    socket.broadcast.emit('presence:update', { userId, status: 'online' });

    setupMessageHandlers(io, socket);
    setupTypingHandlers(io, socket);
    setupCallHandlers(io, socket);

    socket.on('disconnect', async () => {
      await PresenceService.setOffline(userId);
      socket.broadcast.emit('presence:update', { userId, status: 'offline', lastSeen: new Date() });
    });
  });
};
