import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ConversationService } from '../services/conversation.service.js';
import { MessageService } from '../services/message.service.js';

export class ConversationController {
  static async getConversations(req: AuthRequest, res: Response) {
    const conversations = await ConversationService.getConversations(req.userId!);
    res.json(conversations);
  }

  static async createConversation(req: AuthRequest, res: Response) {
    const { type, participantId, name, memberIds } = req.body;
    let conv;
    if (type === 'direct') {
      conv = await ConversationService.createDirectConversation(req.userId!, participantId);
    } else if (type === 'group') {
      conv = await ConversationService.createGroupConversation(req.userId!, name, memberIds);
    } else {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid type' } });
    }
    res.status(201).json(conv);
  }

  static async getMessages(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const { before } = req.query;
    await ConversationService.getConversation(id, req.userId!);
    const messages = await MessageService.getMessages(id, req.userId!, before as string);
    res.json(messages);
  }

  static async updateConversation(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const updated = await ConversationService.updateGroup(id, req.userId!, req.body);
    res.json(updated);
  }

  static async leaveConversation(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    await ConversationService.leaveGroup(id, req.userId!);
    res.json({ success: true });
  }

  static async pinConversation(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const { pin } = req.body;
    const updated = await ConversationService.pinConversation(id, req.userId!, pin);
    res.json(updated);
  }

  static async favoriteConversation(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const { favorite } = req.body;
    const updated = await ConversationService.favoriteConversation(id, req.userId!, favorite);
    res.json(updated);
  }

  static async muteConversation(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const { mute } = req.body;
    const updated = await ConversationService.muteConversation(id, req.userId!, mute);
    res.json(updated);
  }

  static async updateMessageRetention(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const { duration } = req.body;
    const io = req.app.get('io');
    const updated = await ConversationService.updateMessageRetention(id, req.userId!, duration, io);
    io?.to(`conv:${id}`).emit('conversation:disappearing-updated', {
      conversationId: id,
      setting: updated.disappearingMessages || null
    });
    res.json(updated);
  }

  static async clearConversation(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const result = await ConversationService.clearConversation(id, req.userId!);
    res.json(result);
  }

  static async deleteConversation(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const result = await ConversationService.deleteConversation(id, req.userId!);
    res.json(result);
  }
}
