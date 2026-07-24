import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
const router = Router();
router.use(authenticate);
router.get('/', ConversationController.getConversations);
const createConvSchema = z.object({
    body: z.object({
        type: z.enum(['direct', 'group']),
        participantId: z.string().optional(),
        name: z.string().optional(),
        memberIds: z.array(z.string()).optional(),
    })
});
router.post('/', validate(createConvSchema), ConversationController.createConversation);
router.get('/:id/messages', ConversationController.getMessages);
const updateGroupSchema = z.object({
    body: z.object({
        groupName: z.string().optional(),
        groupAvatarUrl: z.string().optional(),
    })
});
router.patch('/:id', validate(updateGroupSchema), ConversationController.updateConversation);
router.delete('/:id/leave', ConversationController.leaveConversation);
router.put('/:id/pin', ConversationController.pinConversation);
router.put('/:id/favorite', ConversationController.favoriteConversation);
router.put('/:id/mute', ConversationController.muteConversation);
const retentionSchema = z.object({
    body: z.object({
        duration: z.enum(['1d', '3d', '7d', '30d', 'never']),
    })
});
router.put('/:id/message-retention', validate(retentionSchema), ConversationController.updateMessageRetention);
router.delete('/:id/clear', ConversationController.clearConversation);
router.delete('/:id', ConversationController.deleteConversation);
export default router;
//# sourceMappingURL=conversation.routes.js.map