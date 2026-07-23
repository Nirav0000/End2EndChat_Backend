import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { RequestController } from '../controllers/request.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', RequestController.send);
router.get('/pending', RequestController.getPending);
router.put('/:id', RequestController.respond);

export default router;
