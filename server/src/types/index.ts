import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'producer' | 'trader' | 'admin';
    farmId?: string;
  };
}

export interface MarketQuote {
  symbol: string;
  praça?: string;
  produto: string;
  price: number;
  basis?: number;
  change: number;
  changePct: number;
  volume?: number;
  timestamp: Date;
  source: 'b3' | 'cbot' | 'mock';
}

export interface WsMessage {
  type:
    | 'quote_update'
    | 'macro_update'
    | 'weather_alert'
    | 'order_update'
    | 'ping'
    | 'pong'
    | 'subscribe'
    | 'unsubscribe'
    | 'error';
  channel?: string;
  data?: unknown;
  timestamp?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export type ProductType = 'soja' | 'milho' | 'trigo' | 'algodao';
export type ContractStatus = 'draft' | 'pending' | 'signed' | 'active' | 'settled' | 'cancelled';
export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';
