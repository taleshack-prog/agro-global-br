import { Router, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { farms, esgRecords } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';

const router = Router();

const farmSchema = z.object({
  name: z.string().min(2).max(255),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  hectares: z.number().positive().optional(),
  carRegistration: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const rows = await db.select().from(farms).where(eq(farms.userId, req.user!.id));
  res.json({ data: rows });
});

router.post('/', validate(farmSchema), async (req: AuthenticatedRequest, res: Response) => {
  const [farm] = await db.insert(farms).values({
    userId: req.user!.id,
    name: req.body.name,
    city: req.body.city,
    state: req.body.state,
    hectares: req.body.hectares?.toString(),
    carRegistration: req.body.carRegistration,
    latitude: req.body.latitude?.toString(),
    longitude: req.body.longitude?.toString(),
  }).returning();

  res.status(201).json(farm);
});

router.get('/:id/esg', async (req: AuthenticatedRequest, res: Response) => {
  const [farm] = await db.select({ id: farms.id }).from(farms)
    .where(eq(farms.id as any, req.params.id)).limit(1);

  if (!farm) { res.status(404).json({ error: 'Farm not found' }); return; }

  const records = await db.select().from(esgRecords)
    .where(eq(esgRecords.farmId as any, req.params.id))
    .orderBy(esgRecords.period);

  res.json({ farmId: req.params.id, data: records });
});

export default router;
