import { Redis } from 'ioredis';
import { env } from './env.js';
export const redis = new Redis(env.REDIS_URL, {
    retryStrategy: (times) => {
        if (times > 3) {
            console.warn('Redis reconnection attempts exceeded. Gracefully degrading presence features.');
            return null;
        }
        return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: null
});
let isConnected = false;
redis.on('connect', () => {
    isConnected = true;
    console.log('Redis connected successfully');
});
redis.on('error', (err) => {
    isConnected = false;
    console.warn('Redis connection error:', err.message);
});
export const isRedisConnected = () => isConnected;
//# sourceMappingURL=redis.js.map