import { Router, Request, Response } from 'express';
import { desc, gte, eq } from 'drizzle-orm';
import { db } from '../db';
import { marketQuotes } from '../db/schema';
import { marketDataService } from '../services/marketData';
import { authenticate } from '../middleware/auth';

const router = Router();

/** GET /api/market/quotes — live spot prices by praça */
router.get('/quotes', authenticate, async (_req: Request, res: Response) => {
  const quotes = await marketDataService.getQuotes();
  res.json({ data: quotes, timestamp: new Date().toISOString() });
});

/** GET /api/market/macro — FX + CBOT indices */
router.get('/macro', authenticate, async (_req: Request, res: Response) => {
  const macro = await marketDataService.getMacro();
  res.json({ data: macro, timestamp: new Date().toISOString() });
});

/** GET /api/market/history?symbol=SOJA-PARANAGUA&days=30 */
router.get('/history', authenticate, async (req: Request, res: Response) => {
  const symbol = req.query.symbol as string;
  const days = Math.min(Number(req.query.days) || 30, 365);

  if (!symbol) {
    res.status(400).json({ error: 'symbol is required' });
    return;
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select()
    .from(marketQuotes)
    .where(
      eq(marketQuotes.symbol, symbol) &&
      gte(marketQuotes.timestamp, since)
    )
    .orderBy(desc(marketQuotes.timestamp))
    .limit(1000);

  res.json({ symbol, days, data: rows });
});

/** GET /api/market/status — WebSocket + data source health */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    providers: {
      b3: !!process.env.B3_API_KEY,
      cbot: !!process.env.CBOT_API_KEY,
      mode: process.env.B3_API_KEY ? 'live' : 'mock',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
