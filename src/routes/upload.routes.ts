import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public route to view/download media files directly in <img>, <audio>, <video>, <a> tags
router.get('/file/:id', UploadController.serveFile);

// Authenticated upload endpoint
router.post('/direct', authenticate, UploadController.directUpload);

export default router;
