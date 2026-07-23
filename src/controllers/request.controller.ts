import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { RequestService } from '../services/request.service.js';
import { z } from 'zod';

const sendRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver User ID is required')
});

const respondRequestSchema = z.object({
  status: z.enum(['accepted', 'rejected'])
});

export class RequestController {
  static async send(req: AuthRequest, res: Response) {
    const validated = sendRequestSchema.parse(req.body);
    const request = await RequestService.sendRequest(req.userId!, validated.receiverId);
    
    // We will populate sender details for socket notification
    const populated = await request.populate('senderId', 'name email avatarUrl');
    
    // Emit real-time notification via Socket.IO if recipient is connected
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${validated.receiverId}`).emit('request:new', populated);
    }

    res.status(201).json(populated);
  }

  static async getPending(req: AuthRequest, res: Response) {
    const requests = await RequestService.getPendingRequests(req.userId!);
    res.json(requests);
  }

  static async respond(req: AuthRequest, res: Response) {
    const requestId = req.params.id as string;
    const validated = respondRequestSchema.parse(req.body);
    
    const result = await RequestService.respondToRequest(requestId, req.userId!, validated.status);
    
    // Emit notification to sender about acceptance/rejection
    const io = req.app.get('io');
    if (io && result.request) {
      io.to(`user:${result.request.senderId.toString()}`).emit('request:status-update', {
        requestId: result.request._id,
        status: validated.status,
        conversation: (result as any).conversation
      });
    }

    res.json(result);
  }
}
