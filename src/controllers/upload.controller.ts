import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UploadService } from '../services/upload.service.js';

export class UploadController {
  static async getPresignedUrl(req: AuthRequest, res: Response) {
    const { filename, contentType } = req.body;
    const data = await UploadService.generatePresignedPutUrl(req.userId!, filename, contentType);
    res.json(data);
  }

  static async getFile(req: AuthRequest, res: Response) {
    const { key } = req.query;
    const url = await UploadService.generatePresignedGetUrl(key as string);
    res.json({ url });
  }
}
