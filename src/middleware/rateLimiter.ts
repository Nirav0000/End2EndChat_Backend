import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const defaultHandler = (req: any, res: any) => {
  res.status(429).json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' } });
};

const isDev = env.NODE_ENV === 'development';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 5, // 1000 requests in dev, 5 in prod
  handler: defaultHandler,
});

export const messageLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: isDev ? 1000 : 20, // 1000 requests in dev, 20 in prod
  handler: defaultHandler,
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 5000 : 100, // 5000 requests in dev, 100 in prod
  handler: defaultHandler,
});
