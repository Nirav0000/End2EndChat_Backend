import { Media } from '../models/Media.js';

export class UploadService {
  static async uploadDirect(userId: string, filename: string, contentType: string, base64Data: string) {
    const buffer = Buffer.from(base64Data, 'base64');
    
    const media = new Media({
      filename,
      contentType: contentType || 'application/octet-stream',
      data: buffer,
      size: buffer.length,
      uploaderId: userId
    });
    
    await media.save();
    
    return {
      key: media._id.toString(),
      filename,
      contentType
    };
  }

  static async getMediaById(id: string) {
    if (!id || id.length !== 24) return null;
    return Media.findById(id).lean();
  }

  static async generatePresignedGetUrl(keyOrUrl: string) {
    if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
      return keyOrUrl;
    }
    return keyOrUrl;
  }
}
