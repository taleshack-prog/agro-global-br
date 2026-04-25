import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { signToken, authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCustomer } from '../services/stripe';
import { AuthenticatedRequest } from '../types';
import { logger } from '../services/logger';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(255),
  role: z.enum(['producer', 'trader']).optional().default('producer'),
  cpfCnpj: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { email, password, name, role, cpfCnpj, phone } = req.body;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db.insert(users).values({
    email,
    passwordHash,
    name,
    role,
    cpfCnpj,
    phone,
  }).returning({ id: users.id, email: users.email, name: users.name, role: users.role });

  // Create Stripe customer asynchronously
  createCustomer(email, name)
    .then(stripeId => db.update(users).set({ stripeCustomerId: stripeId }).where(eq(users.id, user.id)))
    .catch(err => logger.error('Stripe customer creation failed', { error: err.message }));

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, subscriptionPlan: user.subscriptionPlan },
  });
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const [user] = await db
    .select({
      id: users.id, email: users.email, name: users.name, role: users.role,
      subscriptionPlan: users.subscriptionPlan, subscriptionStatus: users.subscriptionStatus,
      phone: users.phone, cpfCnpj: users.cpfCnpj, createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, req.user!.id))
    .limit(1);

  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
});

export default router;
