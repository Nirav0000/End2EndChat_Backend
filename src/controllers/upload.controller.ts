import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UploadService } from '../services/upload.service.js';

export class UploadController {
  static async directUpload(req: AuthRequest, res: Response) {
    try {
      const { filename, contentType, base64 } = req.body;
      if (!base64 || !filename) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Missing file content' } });
      }

      const result = await UploadService.uploadDirect(req.userId!, filename, contentType, base64);
      
      const headerProto = req.headers['x-forwarded-proto'];
      const protocol = (Array.isArray(headerProto) ? headerProto[0] : headerProto) || req.protocol;
      
      const headerHost = req.headers['x-forwarded-host'];
      const host = (Array.isArray(headerHost) ? headerHost[0] : headerHost) || req.get('host');
      
      const url = `${protocol}://${host}/api/uploads/file/${result.key}`;

      res.json({ url, key: result.key });
    } catch (err: any) {
      console.error('Error in directUpload:', err);
      res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message || 'Upload failed' } });
    }
  }

  static async serveFile(req: Request, res: Response) {
    try {
      const targetId = String(req.params.id || '');
      const media = await UploadService.getMediaById(targetId);
      
      if (!media) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found' } });
      }

      res.setHeader('Content-Type', media.contentType || 'application/octet-stream');
      res.setHeader('Content-Length', media.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      
      return res.send(media.data);
    } catch (err: any) {
      console.error('Error serving file:', err);
      res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to serve file' } });
    }
  }

  static async getPresignedUrl(req: AuthRequest, res: Response) {
    return UploadController.directUpload(req, res);
  }

  static async getFile(req: AuthRequest, res: Response) {
    const key = String(req.query.key || '');
    return res.json({ url: key });
  }
}
