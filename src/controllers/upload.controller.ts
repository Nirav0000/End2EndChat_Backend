import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UploadService } from '../services/upload.service.js';

export class UploadController {
  static async getPresignedUrl(req: AuthRequest, res: Response) {
    try {
      const { filename, contentType } = req.body;
      const data = await UploadService.generatePresignedPutUrl(req.userId!, filename, contentType);
      res.json(data);
    } catch (err) {
      const backendUrl = process.env.RENDER_EXTERNAL_URL || 'https://end2endchat-backend.onrender.com';
      res.json({
        url: `${backendUrl}/api/uploads/direct`,
        isDirect: true,
        key: ''
      });
    }
  }

  static async uploadDirect(req: AuthRequest, res: Response) {
    try {
      const rawName = (req.headers['x-filename'] as string) || 'file.bin';
      const filename = decodeURIComponent(rawName);
      const contentType = (req.headers['content-type'] as string) || 'application/octet-stream';
      const buffer = req.body as Buffer;

      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: 'No file content received' });
      }

      const { key } = await UploadService.saveFileDirect(req.userId!, filename, contentType, buffer);
      const url = await UploadService.generatePresignedGetUrl(key);
      res.json({ key, url });
    } catch (err: any) {
      console.error('Direct upload error:', err);
      res.status(500).json({ error: err.message || 'Upload failed' });
    }
  }

  static async getFile(req: AuthRequest, res: Response) {
    try {
      const key = req.query.key as string;
      if (!key) {
        return res.status(400).json({ error: 'Key parameter required' });
      }

      if (key.startsWith('gridfs:')) {
        const { stream, contentType } = await UploadService.getFileStream(key);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return stream.pipe(res);
      }

      const url = await UploadService.generatePresignedGetUrl(key);
      res.json({ url });
    } catch (err: any) {
      res.status(404).json({ error: err.message || 'File not found' });
    }
  }
}
