import { minioClient } from '../config/minio.js';
import { env } from '../config/env.js';
import crypto from 'crypto';
export class UploadService {
    static async generatePresignedPutUrl(userId, filename, contentType) {
        const ext = filename.split('.').pop();
        // basic path traversal prevention by creating our own random key
        const uniqueId = crypto.randomBytes(16).toString('hex');
        const key = `uploads/${userId}/${uniqueId}.${ext}`;
        const url = await minioClient.presignedPutObject(env.MINIO_BUCKET, key, 60 * 5); // 5 mins
        return { url, key };
    }
    static async generatePresignedGetUrl(key) {
        // Ensure the key strictly belongs to uploads/ directory
        if (!key.startsWith('uploads/') || key.includes('..')) {
            throw { name: 'ValidationError', message: 'Invalid file key' };
        }
        return minioClient.presignedGetObject(env.MINIO_BUCKET, key, 60 * 60 * 24); // 24 hours
    }
}
//# sourceMappingURL=upload.service.js.map