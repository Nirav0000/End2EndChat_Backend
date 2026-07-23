import { Server, Socket } from 'socket.io';
import { PresenceService } from '../services/presence.service.js';

export const setupPresenceHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId!;

  // When a user requests status for specific users
  socket.on('presence:subscribe', async (userIds: string[]) => {
    try {
      const statuses = await PresenceService.getOnlineStatuses(userIds);
      socket.emit('presence:bulk_update', statuses);
    } catch (err) {
      console.error('Error fetching presence:', err);
    }
  });
};
