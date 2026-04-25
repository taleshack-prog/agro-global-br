import { Router, Response } from 'express';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { offers } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';
import { wsServer } from '../websocket/server';

const router = Router();

const createOfferSchema = z.object({
  product: z.enum(['soja', 'milho', 'trigo', 'algodao', 'cafe', 'acucar']),
  volumeSacas: z.number().int().positive(),
  pricePerSaca: z.number().positive(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  deadline: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

router.use(authenticate);

/** GET /api/offers — list active offers (order book) */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const product = req.query.product as string | undefined;

  const conditions = [eq(offers.status, 'active')];
  if (product) conditions.push(eq(offers.product, product as any));

  const rows = await db
    .select()
    .from(offers)
    .where(and(...conditions))
    .orderBy(desc(offers.createdAt))
    .limit(100);

  res.json({ data: rows, total: rows.length });
});

/** POST /api/offers — create new offer */
router.post('/', validate(createOfferSchema), async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const userId = req.user!.id;

  const [offer] = await db.insert(offers).values({
    sellerId: userId,
    product: data.product,
    volumeSacas: data.volumeSacas,
    pricePerSaca: data.pricePerSaca.toString(),
    origem: data.origem,
    destino: data.destino,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    notes: data.notes,
    status: 'active',
  }).returning();

  // Broadcast to order-book channel
  wsServer.broadcast('orders', {
    type: 'order_update',
    channel: 'orders',
    data: { event: 'created', offer },
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(offer);
});

/** DELETE /api/offers/:id — cancel own offer */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const [updated] = await db
    .update(offers)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(and(eq(offers.id as any, req.params.id), eq(offers.sellerId as any, req.user!.id)))
    .returning({ id: offers.id });

  if (!updated) {
    res.status(404).json({ error: 'Offer not found or not owned by you' });
    return;
  }

  wsServer.broadcast('orders', {
    type: 'order_update',
    channel: 'orders',
    data: { event: 'cancelled', offerId: updated.id },
    timestamp: new Date().toISOString(),
  });

  res.json({ message: 'Offer cancelled', id: updated.id });
});

export default router;
