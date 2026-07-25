import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import './config/redis.js';
import { initMinio } from './config/minio.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { setupSocketIO } from './sockets/index.js';
import { MessageExpirationService } from './services/messageExpiration.service.js';

const app = express();

const rawClientUrls = env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, '')).filter(Boolean);

const allowedOriginsList = Array.from(new Set([
  ...rawClientUrls,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://end2end-nu.vercel.app',
]));

const isOriginAllowed = (origin: string): boolean => {
  const normalizedOrigin = origin.trim().replace(/\/$/, '');
  if (allowedOriginsList.includes(normalizedOrigin)) return true;
  if (/\.vercel\.app$/.test(normalizedOrigin)) return true;
  return false;
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Request-Private-Network'],
};

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Access-Control-Request-Private-Network');
    return res.sendStatus(204);
  }
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

app.use('/api', routes);

app.use(errorHandler);

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
});

setupSocketIO(io);
app.set('io', io);

const startServer = async () => {
  try {
    await connectDB();
    try {
      await initMinio();
    } catch (minioError) {
      console.warn('MinIO initialization failed, file uploads will be unavailable:', minioError);
    }
    try {
      await MessageExpirationService.expireDueMessages(io);
    } catch (expError) {
      console.warn('Initial message expiration check failed:', expError);
    }
    setInterval(() => {
      MessageExpirationService.expireDueMessages(io).catch(error => console.error('Message expiration failed:', error));
    }, 60 * 1000);
    
    const port = parseInt(env.PORT, 10);
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
