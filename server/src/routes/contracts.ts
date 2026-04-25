import { Router, Response } from 'express';
import { z } from 'zod';
import { eq, or, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db';
import { contracts, auditLog } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';

const router = Router();

const createContractSchema = z.object({
  offerId: z.string().uuid().optional(),
  buyerId: z.string().uuid(),
  product: z.enum(['soja', 'milho', 'trigo', 'algodao', 'cafe', 'acucar']),
  volumeSacas: z.number().int().positive(),
  pricePerSaca: z.number().positive(),
  deliveryDate: z.string().datetime().optional(),
  deliveryLocation: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

router.use(authenticate);

/** GET /api/contracts — my contracts (as buyer or seller) */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const rows = await db
    .select()
    .from(contracts)
    .where(
      or(
        eq(contracts.buyerId as any, userId),
        eq(contracts.sellerId as any, userId)
      )
    )
    .orderBy(desc(contracts.createdAt))
    .limit(200);

  res.json({ data: rows });
});

/** POST /api/contracts — create contract */
router.post('/', validate(createContractSchema), async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const totalValue = (data.volumeSacas * data.pricePerSaca).toFixed(2);

  const [contract] = await db.insert(contracts).values({
    offerId: data.offerId,
    buyerId: data.buyerId,
    sellerId: req.user!.id,
    product: data.product,
    volumeSacas: data.volumeSacas,
    pricePerSaca: data.pricePerSaca.toString(),
    totalValue,
    status: 'pending',
    deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
    deliveryLocation: data.deliveryLocation,
    metadata: data.metadata,
  }).returning();

  await db.insert(auditLog).values({
    userId: req.user!.id,
    action: 'contract.created',
    entity: 'contracts',
    entityId: contract.id,
    after: contract as any,
    ipAddress: req.ip,
  });

  res.status(201).json(contract);
});

/** POST /api/contracts/:id/sign — sign contract (generates document hash) */
router.post('/:id/sign', async (req: AuthenticatedRequest, res: Response) => {
  const [existing] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id as any, req.params.id))
    .limit(1);

  if (!existing) { res.status(404).json({ error: 'Contract not found' }); return; }
  if (existing.buyerId !== req.user!.id && existing.sellerId !== req.user!.id) {
    res.status(403).json({ error: 'Not a party to this contract' });
    return;
  }
  if (existing.status !== 'pending') {
    res.status(409).json({ error: `Cannot sign contract in status: ${existing.status}` });
    return;
  }

  // Deterministic document hash (in production: use eIDAS / DocuSign)
  const docPayload = JSON.stringify({
    id: existing.id,
    buyer: existing.buyerId,
    seller: existing.sellerId,
    product: existing.product,
    volume: existing.volumeSacas,
    price: existing.pricePerSaca,
    signedAt: new Date().toISOString(),
  });
  const documentHash = crypto.createHash('sha256').update(docPayload).digest('hex');

  const [updated] = await db
    .update(contracts)
    .set({ status: 'signed', signedAt: new Date(), documentHash, updatedAt: new Date() })
    .where(eq(contracts.id as any, req.params.id))
    .returning();

  await db.insert(auditLog).values({
    userId: req.user!.id,
    action: 'contract.signed',
    entity: 'contracts',
    entityId: existing.id,
    before: existing as any,
    after: updated as any,
    ipAddress: req.ip,
  });

  res.json({ contract: updated, documentHash });
});

export default router;
