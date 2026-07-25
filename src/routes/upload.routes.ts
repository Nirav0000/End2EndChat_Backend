import { Router } from 'express';
import express from 'express';
import { UploadController } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

// Public file streaming endpoint (accessible by <img>, <video>, <audio> tags)
router.get('/files', validate(z.object({
  query: z.object({ key: z.string() })
})), UploadController.getFile);

// Protected upload endpoints
router.use(authenticate);

router.post('/direct', express.raw({ limit: '50mb', type: '*/*' }), UploadController.uploadDirect);

router.post('/presign', validate(z.object({
  body: z.object({
    filename: z.string(),
    contentType: z.string(),
  })
})), UploadController.getPresignedUrl);

export default router;
