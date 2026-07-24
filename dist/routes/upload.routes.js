import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
const router = Router();
router.use(authenticate);
router.post('/presign', validate(z.object({
    body: z.object({
        filename: z.string(),
        contentType: z.string(),
    })
})), UploadController.getPresignedUrl);
router.get('/files', validate(z.object({
    query: z.object({ key: z.string() })
})), UploadController.getFile);
export default router;
//# sourceMappingURL=upload.routes.js.map