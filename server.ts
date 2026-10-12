import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import rateLimit, { MemoryStore } from 'express-rate-limit';
import { apiRouter } from './src/routes/optimizeRoute.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8080;
  const HOST = process.env.HOST || 'localhost';

  // Global Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite HMR / React dev compatibility
  }));
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
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
    skip: (req) => req.path === '/health' || req.path === '/rate-limit',
    message: {
      success: false,
      error: 'Too Many Requests',
      details: `Rate limit reached: You have used all ${RATE_LIMIT_MAX} scans for this 15-minute window. Please wait before trying again.`,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: true,
  });

  // Rate limit status endpoint (does not consume scans)
  app.get('/api/rate-limit', async (req, res) => {
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
  });

  // Mount API Routes
  app.use('/api', apiLimiter);
  app.use('/api', apiRouter);

  // Vite middleware for development, static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 AI Resume Optimizer server listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
