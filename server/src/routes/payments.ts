import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, payments } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  stripe,
  PLANS,
  createCheckoutSession,
  createPaymentIntent,
  cancelSubscription,
  constructWebhookEvent,
} from '../services/stripe';
import { AuthenticatedRequest } from '../types';
import { logger } from '../services/logger';

const router = Router();

const checkoutSchema = z.object({
  plan: z.enum(['basic', 'pro', 'enterprise']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

const paymentIntentSchema = z.object({
  amount: z.number().int().positive(),
  description: z.string(),
  metadata: z.record(z.string()).optional(),
});

/** POST /api/payments/checkout — create Stripe checkout session for subscription */
router.post('/checkout', authenticate, validate(checkoutSchema), async (req: AuthenticatedRequest, res: Response) => {
  const { plan, successUrl, cancelUrl } = req.body;
  const userId = req.user!.id;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
  }

  const priceId = PLANS[plan as keyof typeof PLANS] || PLANS.basic;
  const url = await createCheckoutSession({ customerId, priceId, successUrl, cancelUrl, userId });

  res.json({ url });
});

/** POST /api/payments/intent — create one-time payment intent (ex: contract fee) */
router.post('/intent', authenticate, validate(paymentIntentSchema), async (req: AuthenticatedRequest, res: Response) => {
  const { amount, description, metadata } = req.body;
  const userId = req.user!.id;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.stripeCustomerId) { res.status(400).json({ error: 'No payment method on file' }); return; }

  const intent = await createPaymentIntent({
    amount,
    currency: 'brl',
    customerId: user.stripeCustomerId,
    description,
    metadata: { userId, ...metadata },
  });

  await db.insert(payments).values({
    userId,
    stripePaymentIntentId: intent.id,
    amount,
    currency: 'brl',
    status: 'pending',
    description,
    metadata: metadata as any,
  });

  res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
});

/** POST /api/payments/cancel-subscription */
router.post('/cancel-subscription', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);

  if (!user?.stripeSubscriptionId) {
    res.status(400).json({ error: 'No active subscription found' });
    return;
  }

  await cancelSubscription(user.stripeSubscriptionId);
  await db.update(users)
    .set({ subscriptionStatus: 'cancelled', stripeSubscriptionId: null })
    .where(eq(users.id, req.user!.id));

  res.json({ message: 'Subscription cancelled' });
});

/** GET /api/payments/history */
router.get('/history', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, req.user!.id))
    .limit(50);

  res.json({ data: rows });
});

/** POST /api/payments/webhook — Stripe webhook (raw body required) */
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = constructWebhookEvent(req.body as Buffer, sig);
  } catch (err: any) {
    logger.warn('Stripe webhook signature verification failed', { error: err.message });
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        if (userId && session.subscription) {
          await db.update(users)
            .set({
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: 'active',
              subscriptionPlan: 'pro',
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
          logger.info('Subscription activated', { userId, sub: session.subscription });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = sub.metadata?.userId;
        if (userId) {
          await db.update(users)
            .set({ subscriptionStatus: 'active', updatedAt: new Date() })
            .where(eq(users.id, userId));
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = sub.metadata?.userId;
        if (userId) {
          await db.update(users)
            .set({ subscriptionStatus: 'past_due', updatedAt: new Date() })
            .where(eq(users.id, userId));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (userId) {
          await db.update(users)
            .set({ subscriptionStatus: 'inactive', stripeSubscriptionId: null, updatedAt: new Date() })
            .where(eq(users.id, userId));
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as any;
        await db.update(payments)
          .set({ status: 'paid', updatedAt: new Date() })
          .where(eq(payments.stripePaymentIntentId, pi.id));
        break;
      }

      default:
        logger.debug('Unhandled Stripe event', { type: event.type });
    }
  } catch (err: any) {
    logger.error('Stripe webhook handler error', { error: err.message, event: event.type });
  }

  res.json({ received: true });
});

export default router;
