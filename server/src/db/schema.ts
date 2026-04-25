import {
  pgTable, uuid, varchar, text, numeric, integer,
  timestamp, boolean, pgEnum, jsonb, index, uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ──────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['producer', 'trader', 'admin']);
export const productEnum = pgEnum('product_type', ['soja', 'milho', 'trigo', 'algodao', 'cafe', 'acucar']);
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'pending', 'signed', 'active', 'settled', 'cancelled']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['basic', 'pro', 'enterprise']);
export const cprStatusEnum = pgEnum('cpr_status', ['active', 'liquidated', 'cancelled']);
export const offerStatusEnum = pgEnum('offer_status', ['active', 'matched', 'expired', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('producer').notNull(),
  cpfCnpj: varchar('cpf_cnpj', { length: 20 }),
  phone: varchar('phone', { length: 20 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  subscriptionPlan: subscriptionPlanEnum('subscription_plan').default('basic'),
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('inactive'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('idx_users_email').on(t.email),
  index('idx_users_stripe').on(t.stripeCustomerId),
]);

// ─── Farms ───────────────────────────────────────────────────────────────────

export const farms = pgTable('farms', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 2 }),
  hectares: numeric('hectares', { precision: 10, scale: 2 }),
  carRegistration: varchar('car_registration', { length: 50 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_farms_user').on(t.userId),
]);

// ─── Market Quotes (time-series cache) ───────────────────────────────────────

export const marketQuotes = pgTable('market_quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  praça: varchar('praca', { length: 100 }),
  product: productEnum('product').notNull(),
  price: numeric('price', { precision: 12, scale: 4 }).notNull(),
  basis: numeric('basis', { precision: 8, scale: 4 }),
  change: numeric('change', { precision: 8, scale: 4 }),
  changePct: numeric('change_pct', { precision: 8, scale: 4 }),
  volume: integer('volume'),
  source: varchar('source', { length: 20 }).default('mock').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (t) => [
  index('idx_quotes_symbol_ts').on(t.symbol, t.timestamp),
  index('idx_quotes_product').on(t.product),
]);

// ─── Offers / Order Book ──────────────────────────────────────────────────────

export const offers = pgTable('offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id').references(() => users.id),
  sellerId: uuid('seller_id').references(() => users.id),
  product: productEnum('product').notNull(),
  volumeSacas: integer('volume_sacas').notNull(),
  pricePerSaca: numeric('price_per_saca', { precision: 10, scale: 2 }).notNull(),
  origem: varchar('origem', { length: 100 }),
  destino: varchar('destino', { length: 100 }),
  deadline: timestamp('deadline'),
  status: offerStatusEnum('status').default('active').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('idx_offers_product_status').on(t.product, t.status),
  index('idx_offers_buyer').on(t.buyerId),
  index('idx_offers_seller').on(t.sellerId),
]);

// ─── Contracts ────────────────────────────────────────────────────────────────

export const contracts = pgTable('contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  offerId: uuid('offer_id').references(() => offers.id),
  buyerId: uuid('buyer_id').references(() => users.id).notNull(),
  sellerId: uuid('seller_id').references(() => users.id).notNull(),
  product: productEnum('product').notNull(),
  volumeSacas: integer('volume_sacas').notNull(),
  pricePerSaca: numeric('price_per_saca', { precision: 10, scale: 2 }).notNull(),
  totalValue: numeric('total_value', { precision: 14, scale: 2 }).notNull(),
  status: contractStatusEnum('status').default('draft').notNull(),
  deliveryDate: timestamp('delivery_date'),
  deliveryLocation: varchar('delivery_location', { length: 255 }),
  signedAt: timestamp('signed_at'),
  settledAt: timestamp('settled_at'),
  documentHash: varchar('document_hash', { length: 64 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('idx_contracts_buyer').on(t.buyerId),
  index('idx_contracts_seller').on(t.sellerId),
  index('idx_contracts_status').on(t.status),
]);

// ─── CPR Digital ──────────────────────────────────────────────────────────────

export const cprs = pgTable('cprs', {
  id: uuid('id').primaryKey().defaultRandom(),
  issuerId: uuid('issuer_id').references(() => users.id).notNull(),
  farmId: uuid('farm_id').references(() => farms.id),
  product: productEnum('product').notNull(),
  quantitySacas: integer('quantity_sacas').notNull(),
  faceValue: numeric('face_value', { precision: 14, scale: 2 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  status: cprStatusEnum('status').default('active').notNull(),
  tokenAddress: varchar('token_address', { length: 66 }),
  tokenChain: varchar('token_chain', { length: 20 }),
  documentHash: varchar('document_hash', { length: 64 }),
  registryNumber: varchar('registry_number', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  liquidatedAt: timestamp('liquidated_at'),
}, (t) => [
  index('idx_cprs_issuer').on(t.issuerId),
  index('idx_cprs_status').on(t.status),
]);

// ─── ESG Records ─────────────────────────────────────────────────────────────

export const esgRecords = pgTable('esg_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  farmId: uuid('farm_id').references(() => farms.id).notNull(),
  period: varchar('period', { length: 10 }).notNull(),
  carbonScore: integer('carbon_score'),
  waterScore: integer('water_score'),
  soilScore: integer('soil_score'),
  biodiversityScore: integer('biodiversity_score'),
  complianceScore: integer('compliance_score'),
  totalScore: integer('total_score'),
  carbonCredits: numeric('carbon_credits', { precision: 10, scale: 2 }),
  certifications: jsonb('certifications'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_esg_farm').on(t.farmId),
  uniqueIndex('idx_esg_farm_period').on(t.farmId, t.period),
]);

// ─── Payments ────────────────────────────────────────────────────────────────

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 100 }),
  stripeSessionId: varchar('stripe_session_id', { length: 100 }),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 3 }).default('brl').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('idx_payments_user').on(t.userId),
  index('idx_payments_stripe_pi').on(t.stripePaymentIntentId),
]);

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entity: varchar('entity', { length: 50 }).notNull(),
  entityId: uuid('entity_id'),
  before: jsonb('before'),
  after: jsonb('after'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_audit_user').on(t.userId),
  index('idx_audit_entity').on(t.entity, t.entityId),
  index('idx_audit_created').on(t.createdAt),
]);

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  farms: many(farms),
  offersAsBuyer: many(offers, { relationName: 'buyer' }),
  offersAsSeller: many(offers, { relationName: 'seller' }),
  contractsAsBuyer: many(contracts, { relationName: 'contractBuyer' }),
  contractsAsSeller: many(contracts, { relationName: 'contractSeller' }),
  cprs: many(cprs),
  payments: many(payments),
}));

export const farmsRelations = relations(farms, ({ one, many }) => ({
  user: one(users, { fields: [farms.userId], references: [users.id] }),
  cprs: many(cprs),
  esgRecords: many(esgRecords),
}));
