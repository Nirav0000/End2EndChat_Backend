import { Redis } from 'ioredis';
import { env } from './env.js';

let redis: Redis | null = null;
let isConnected = false;

if (env.REDIS_URL) {
  redis = new Redis(env.REDIS_URL, {
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('Redis reconnection attempts exceeded. Gracefully degrading presence features.');
        return null;
      }
      return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: null
  });

  redis.on('connect', () => {
    isConnected = true;
    console.log('Redis connected successfully');
  });

  redis.on('error', (err) => {
    isConnected = false;
    console.warn('Redis connection error:', err.message);
  });
} else {
  console.warn('REDIS_URL not set. Running without Redis — presence features disabled.');
}

export { redis };
export const isRedisConnected = () => isConnected;

