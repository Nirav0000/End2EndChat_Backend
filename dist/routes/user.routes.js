import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
const router = Router();
router.use(authenticate);
router.get('/search', UserController.search);
router.get('/me', UserController.getMe);
router.patch('/me', validate(z.object({
    body: z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
        lastSeenVisible: z.boolean().optional(),
    })
})), UserController.updateMe);
router.post('/:id/block', UserController.blockUser);
router.delete('/:id/block', UserController.unblockUser);
router.post('/:id/report', validate(z.object({
    body: z.object({ reason: z.string() })
})), UserController.reportUser);
export default router;
//# sourceMappingURL=user.routes.js.map