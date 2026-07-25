import { minioClient } from '../config/minio.js';
import { env } from '../config/env.js';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

export class UploadService {
  private static getGridFSBucket() {
    if (!mongoose.connection.db) {
      throw new Error('Database not connected');
    }
    return new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  }

  static async generatePresignedPutUrl(userId: string, filename: string, contentType: string) {
    const ext = filename.split('.').pop();
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const key = `uploads/${userId}/${uniqueId}.${ext}`;
    
    const url = await minioClient.presignedPutObject(env.MINIO_BUCKET, key, 60 * 5);
    return { url, key };
  }

  static async saveFileDirect(userId: string, filename: string, contentType: string, buffer: Buffer) {
    const bucket = this.getGridFSBucket();
    const ext = filename.split('.').pop() || 'bin';
    
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { userId, contentType, ext }
    });

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
      uploadStream.end(buffer);
    });

    const key = `gridfs:${uploadStream.id.toString()}`;
    return { key };
  }

  static async getFileStream(key: string) {
    if (key.startsWith('gridfs:')) {
      const fileId = key.replace('gridfs:', '');
      const bucket = this.getGridFSBucket();
      const _id = new ObjectId(fileId);

      const files = await bucket.find({ _id }).toArray();
      if (!files || files.length === 0) {
        throw { name: 'ValidationError', message: 'File not found' };
      }

      const fileDoc = files[0];
      const downloadStream = bucket.openDownloadStream(_id);
      return {
        stream: downloadStream,
        contentType: (fileDoc.metadata?.contentType as string) || 'application/octet-stream',
        filename: fileDoc.filename
      };
    }

    throw { name: 'ValidationError', message: 'Invalid file key format' };
  }

  static async generatePresignedGetUrl(key: string) {
    if (!key) return '';

    // Standardize URL output for GridFS files
    if (key.startsWith('gridfs:')) {
      const backendUrl = process.env.RENDER_EXTERNAL_URL || 'https://end2endchat-backend.onrender.com';
      return `${backendUrl}/api/uploads/files?key=${encodeURIComponent(key)}`;
    }

    // Direct HTTP or data URLs
    if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('data:')) {
      return key;
    }

    try {
      return await minioClient.presignedGetObject(env.MINIO_BUCKET, key, 60 * 60 * 24);
    } catch (err) {
      const backendUrl = process.env.RENDER_EXTERNAL_URL || 'https://end2endchat-backend.onrender.com';
      return `${backendUrl}/api/uploads/files?key=${encodeURIComponent(key)}`;
    }
  }
}
