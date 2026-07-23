import * as Minio from 'minio';
import { env } from './env.js';

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(env.MINIO_BUCKET);
    if (!exists) {
      await minioClient.makeBucket(env.MINIO_BUCKET, 'us-east-1');
      console.log(`MinIO bucket '${env.MINIO_BUCKET}' created successfully.`);
    } else {
      console.log(`MinIO bucket '${env.MINIO_BUCKET}' already exists.`);
    }
  } catch (error) {
    console.error('Error initializing MinIO:', error);
  }
};
