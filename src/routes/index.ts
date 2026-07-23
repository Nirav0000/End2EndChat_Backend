import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import conversationRoutes from './conversation.routes.js';
import uploadRoutes from './upload.routes.js';
import requestRoutes from './request.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/conversations', conversationRoutes);
router.use('/uploads', uploadRoutes);
router.use('/requests', requestRoutes);

export default router;
