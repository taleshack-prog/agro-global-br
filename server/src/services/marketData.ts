/**
 * Market Data Service
 *
 * Architecture: Adapter pattern with pluggable providers.
 * - Development / missing API key → MockProvider (realistic random-walk data)
 * - B3 provider → wraps B3 REST API (requires B3_API_KEY)
 * - CBOT provider → wraps Barchart API (requires CBOT_API_KEY)
 *
 * All providers emit the same MarketQuote shape, consumed by
 * WebSocket broadcaster and REST endpoints.
 */

import axios from 'axios';
import { MarketQuote } from '../types';
import { logger } from './logger';

// ─── Base class ──────────────────────────────────────────────────────────────

abstract class MarketDataProvider {
  abstract fetchQuotes(): Promise<MarketQuote[]>;
  abstract fetchMacro(): Promise<MarketQuote[]>;
}

// ─── Mock Provider (random-walk simulation) ──────────────────────────────────

const BASE_PRICES: Record<string, number> = {
  'SOJA-PARANAGUA': 142.50,
  'SOJA-SANTOS': 141.80,
  'SOJA-RONDONOPOLIS': 138.20,
  'SOJA-SORRISO': 137.60,
  'MILHO-CASCAVEL': 68.40,
  'MILHO-MARINGA': 67.90,
  'MILHO-UBERLANDIA': 66.50,
  'MILHO-RIO-VERDE': 65.80,
};

const MACRO_BASE: Record<string, { price: number; unit: string }> = {
  'USD/BRL': { price: 5.2340, unit: 'R$' },
  'SOJA-CBOT': { price: 1048.25, unit: 'US¢/bu' },
  'MILHO-CBOT': { price: 462.75, unit: 'US¢/bu' },
  'TRIGO-CBOT': { price: 545.50, unit: 'US¢/bu' },
};

// Current prices with random-walk applied on each tick
const currentPrices = { ...BASE_PRICES };
const currentMacro: Record<string, number> = Object.fromEntries(
  Object.entries(MACRO_BASE).map(([k, v]) => [k, v.price])
);

function randomWalk(price: number, volatility = 0.003): number {
  const delta = price * volatility * (Math.random() * 2 - 1);
  return Math.max(0, price + delta);
}

class MockProvider extends MarketDataProvider {
  async fetchQuotes(): Promise<MarketQuote[]> {
    return Object.entries(currentPrices).map(([key, price]) => {
      const newPrice = randomWalk(price);
      currentPrices[key] = newPrice;

      const [product, ...placeParts] = key.split('-');
      const praça = placeParts.join(' ');
      const change = newPrice - price;
      const changePct = (change / price) * 100;

      return {
        symbol: key,
        praça,
        produto: product,
        price: Number(newPrice.toFixed(2)),
        basis: Number((Math.random() * 6 - 3).toFixed(2)),
        change: Number(change.toFixed(2)),
        changePct: Number(changePct.toFixed(2)),
        volume: Math.floor(Math.random() * 5000 + 500),
        timestamp: new Date(),
        source: 'mock',
      };
    });
  }

  async fetchMacro(): Promise<MarketQuote[]> {
    return Object.entries(currentMacro).map(([symbol, price]) => {
      const newPrice = randomWalk(price, 0.002);
      currentMacro[symbol] = newPrice;
      const change = newPrice - price;

      return {
        symbol,
        produto: symbol,
        price: Number(newPrice.toFixed(4)),
        change: Number(change.toFixed(4)),
        changePct: Number(((change / price) * 100).toFixed(3)),
        timestamp: new Date(),
        source: 'mock',
      };
    });
  }
}

// ─── B3 Provider ─────────────────────────────────────────────────────────────

class B3Provider extends MarketDataProvider {
  private client = axios.create({
    baseURL: process.env.B3_API_URL,
    headers: { Authorization: `Bearer ${process.env.B3_API_KEY}` },
    timeout: 8000,
  });

  // Commodity tickers on B3
  private SYMBOLS = ['SFI', 'CCM', 'BGI', 'ICF'];

  async fetchQuotes(): Promise<MarketQuote[]> {
    try {
      const res = await this.client.get('/quotes', {
        params: { symbols: this.SYMBOLS.join(',') },
      });
      return res.data.results.map((q: any) => ({
        symbol: q.symbol,
        produto: q.description,
        price: q.lastPrice,
        change: q.change,
        changePct: q.changePct,
        volume: q.volume,
        timestamp: new Date(q.tradeTime),
        source: 'b3' as const,
      }));
    } catch (err: any) {
      logger.warn('B3 fetch failed, falling back to mock', { error: err.message });
      return new MockProvider().fetchQuotes();
    }
  }

  async fetchMacro(): Promise<MarketQuote[]> {
    return new MockProvider().fetchMacro();
  }
}

// ─── CBOT (Barchart) Provider ─────────────────────────────────────────────────

class CBOTProvider extends MarketDataProvider {
  private client = axios.create({
    baseURL: process.env.CBOT_API_URL,
    timeout: 8000,
  });

  private SYMBOLS = ['ZSN25', 'ZCN25', 'ZWN25']; // Soy, Corn, Wheat futures

  async fetchQuotes(): Promise<MarketQuote[]> {
    try {
      const res = await this.client.get('/getQuote.json', {
        params: {
          apikey: process.env.CBOT_API_KEY,
          symbols: this.SYMBOLS.join(','),
          fields: 'symbol,name,lastPrice,netChange,percentChange,volume,tradeTime',
        },
      });
      const results = res.data.results?.quotes ?? [];
      return results.map((q: any) => ({
        symbol: q.symbol,
        produto: q.name,
        price: Number(q.lastPrice),
        change: Number(q.netChange),
        changePct: Number(q.percentChange),
        volume: Number(q.volume),
        timestamp: new Date(q.tradeTime),
        source: 'cbot' as const,
      }));
    } catch (err: any) {
      logger.warn('CBOT fetch failed, falling back to mock', { error: err.message });
      return new MockProvider().fetchMacro();
    }
  }

  async fetchMacro(): Promise<MarketQuote[]> {
    return this.fetchQuotes();
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

function buildProvider(): MarketDataProvider {
  if (process.env.B3_API_KEY && process.env.CBOT_API_KEY) {
    logger.info('Market data: using live B3 + CBOT providers');
    return new B3Provider();
  }
  logger.info('Market data: using mock provider (set B3_API_KEY + CBOT_API_KEY for live data)');
  return new MockProvider();
}

class MarketDataService {
  private provider = buildProvider();
  private quotesCache: MarketQuote[] = [];
  private macroCache: MarketQuote[] = [];

  async getQuotes(): Promise<MarketQuote[]> {
    if (this.quotesCache.length === 0) await this.refresh();
    return this.quotesCache;
  }

  async getMacro(): Promise<MarketQuote[]> {
    if (this.macroCache.length === 0) await this.refresh();
    return this.macroCache;
  }

  async refresh(): Promise<void> {
    const [quotes, macro] = await Promise.all([
      this.provider.fetchQuotes(),
      this.provider.fetchMacro(),
    ]);
    this.quotesCache = quotes;
    this.macroCache = macro;
  }

  getQuotesCache() { return this.quotesCache; }
  getMacroCache() { return this.macroCache; }
}

export const marketDataService = new MarketDataService();
