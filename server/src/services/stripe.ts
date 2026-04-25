import Stripe from 'stripe';
import { logger } from './logger';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

export const PLANS = {
  basic: process.env.STRIPE_PRICE_BASIC || 'price_basic',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
};

export async function createCustomer(email: string, name: string): Promise<string> {
  const customer = await stripe.customers.create({ email, name, metadata: { source: 'agroglobal' } });
  return customer.id;
}

export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    payment_method_types: ['card'],
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { userId: params.userId },
    subscription_data: {
      metadata: { userId: params.userId },
    },
    locale: 'pt-BR',
  });
  return session.url!;
}

export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  customerId: string;
  description: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency,
    customer: params.customerId,
    description: params.description,
    metadata: params.metadata || {},
    automatic_payment_methods: { enabled: true },
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.cancel(subscriptionId);
  logger.info('Stripe subscription cancelled', { subscriptionId });
}

export function constructWebhookEvent(payload: Buffer, sig: string): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
