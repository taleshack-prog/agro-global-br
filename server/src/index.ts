import 'dotenv/config';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

import { logger } from './services/logger';
import { checkDbConnection } from './db';
import { marketDataService } from './services/marketData';
import { wsServer } from './websocket/server';

import authRoutes from './routes/auth';
import marketRoutes from './routes/market';
import offersRoutes from './routes/offers';
import contractsRoutes from './routes/contracts';
import paymentsRoutes from './routes/payments';
import farmsRoutes from './routes/farms';

const app = express();
const server = http.createServer(app);

// ─── Security & Middleware ────────────────────────────────────────────────────

app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Stripe webhook needs raw body — must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/farms', farmsRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    wsClients: wsServer.connectedCount,
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Scheduled Jobs ───────────────────────────────────────────────────────────

// Refresh market data cache every 30s even when no WS clients are connected
cron.schedule('*/30 * * * * *', () => {
  marketDataService.refresh().catch(err =>
    logger.warn('Market data refresh failed', { error: err.message })
  );
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

async function bootstrap() {
  const PORT = Number(process.env.PORT) || 3001;

  // DB connection is optional at boot (app works with mock data if DB is absent)
  try {
    await checkDbConnection();
  } catch (err: any) {
    logger.warn('PostgreSQL unavailable — running without persistence', { error: err.message });
  }

  await marketDataService.refresh();

  wsServer.init(server);

  server.listen(PORT, () => {
    logger.info(`AgroGlobal API running`, { port: PORT, env: process.env.NODE_ENV || 'development' });
    logger.info(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error', { error: err.message });
  process.exit(1);
});

export { app, server };
