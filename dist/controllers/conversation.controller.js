import { ConversationService } from '../services/conversation.service.js';
import { MessageService } from '../services/message.service.js';
export class ConversationController {
    static async getConversations(req, res) {
        const conversations = await ConversationService.getConversations(req.userId);
        res.json(conversations);
    }
    static async createConversation(req, res) {
        const { type, participantId, name, memberIds } = req.body;
        let conv;
        if (type === 'direct') {
            conv = await ConversationService.createDirectConversation(req.userId, participantId);
        }
        else if (type === 'group') {
            conv = await ConversationService.createGroupConversation(req.userId, name, memberIds);
        }
        else {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid type' } });
        }
        res.status(201).json(conv);
    }
    static async getMessages(req, res) {
        const id = req.params.id;
        const { before } = req.query;
        await ConversationService.getConversation(id, req.userId);
        const messages = await MessageService.getMessages(id, req.userId, before);
        res.json(messages);
    }
    static async updateConversation(req, res) {
        const id = req.params.id;
        const updated = await ConversationService.updateGroup(id, req.userId, req.body);
        res.json(updated);
    }
    static async leaveConversation(req, res) {
        const id = req.params.id;
        await ConversationService.leaveGroup(id, req.userId);
        res.json({ success: true });
    }
    static async pinConversation(req, res) {
        const id = req.params.id;
        const { pin } = req.body;
        const updated = await ConversationService.pinConversation(id, req.userId, pin);
        res.json(updated);
    }
    static async favoriteConversation(req, res) {
        const id = req.params.id;
        const { favorite } = req.body;
        const updated = await ConversationService.favoriteConversation(id, req.userId, favorite);
        res.json(updated);
    }
    static async muteConversation(req, res) {
        const id = req.params.id;
        const { mute } = req.body;
        const updated = await ConversationService.muteConversation(id, req.userId, mute);
        res.json(updated);
    }
    static async updateMessageRetention(req, res) {
        const id = req.params.id;
        const { duration } = req.body;
        const io = req.app.get('io');
        const updated = await ConversationService.updateMessageRetention(id, req.userId, duration, io);
        io?.to(`conv:${id}`).emit('conversation:disappearing-updated', {
            conversationId: id,
            setting: updated.disappearingMessages || null
        });
        res.json(updated);
    }
    static async clearConversation(req, res) {
        const id = req.params.id;
        const result = await ConversationService.clearConversation(id, req.userId);
        res.json(result);
    }
    static async deleteConversation(req, res) {
        const id = req.params.id;
        const result = await ConversationService.deleteConversation(id, req.userId);
        res.json(result);
    }
}
//# sourceMappingURL=conversation.controller.js.map