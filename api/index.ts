import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit, { MemoryStore } from 'express-rate-limit';
import { apiRouter } from '../src/routes/optimizeRoute.js';

dotenv.config();

const app = express();

// Global Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging in development/serverless logs
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const rateLimitStore = new MemoryStore();

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  store: rateLimitStore,
  skip: (req) => req.path.endsWith('/health') || req.path.endsWith('/rate-limit'),
  message: {
    success: false,
    error: 'Too Many Requests',
    details: `Rate limit reached: You have used all ${RATE_LIMIT_MAX} scans for this 15-minute window. Please wait before trying again.`,
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: true,
});

// Rate limit status endpoint handler
const rateLimitHandler = async (req: Request, res: Response) => {
  try {
    const clientKey = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const clientRecord = await rateLimitStore.get(clientKey);
    const used = clientRecord?.totalHits || 0;
    const remaining = Math.max(0, RATE_LIMIT_MAX - used);
    const resetTime = clientRecord?.resetTime || new Date(Date.now() + RATE_LIMIT_WINDOW_MS);
    const resetInSeconds = Math.max(0, Math.ceil((new Date(resetTime).getTime() - Date.now()) / 1000));

    res.json({
      success: true,
      limit: RATE_LIMIT_MAX,
      remaining,
      used,
      resetTime: new Date(resetTime).toISOString(),
      resetInSeconds,
      windowMinutes: 15,
    });
  } catch {
    res.json({
      success: true,
      limit: RATE_LIMIT_MAX,
      remaining: RATE_LIMIT_MAX,
      used: 0,
      resetInSeconds: 900,
      windowMinutes: 15,
    });
  }
};

app.get('/api/rate-limit', rateLimitHandler);
app.get('/rate-limit', rateLimitHandler);

// Mount API Routes for both /api/* and root /* (handles Vercel rewrite stripping)
app.use('/api', apiLimiter);
app.use('/api', apiRouter);
app.use('/', apiLimiter);
app.use('/', apiRouter);

export default app;
