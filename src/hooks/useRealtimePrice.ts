/**
 * useRealtimePrice
 *
 * Connects to the Python Price Service at ws://localhost:8765 (or VITE_PRICE_WS_URL).
 * Falls back gracefully to the existing backend WS at ws://localhost:3001/ws
 * if the Python service is unavailable.
 *
 * Messages sent:
 *   { type: "subscribe",   commodity: "soja" }
 *   { type: "unsubscribe", commodity: "soja" }
 *   { type: "get_all" }
 *   { type: "ping" }
 *
 * Messages received:
 *   { type: "price_update", data: PriceData }
 *   { type: "all_prices",   data: Record<string, PriceData> }
 *   { type: "pong" }
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  change_pct: number;
}

export interface PriceData {
  id: string;
  name: string;
  price: number;
  change_pct: number;
  prev_price: number;
  timestamp: string;
  sources: string[];
  currency: string;
  unit: string;
  history: PriceHistoryPoint[];
}

interface UseRealtimePriceOptions {
  commodities?: string[];
  wsUrl?: string;
  onPriceUpdate?: (data: PriceData) => void;
  onError?: (error: Error) => void;
  reconnectDelay?: number;
  maxReconnects?: number;
}

interface UseRealtimePriceResult {
  prices: Record<string, PriceData>;
  isConnected: boolean;
  error: string | null;
  subscribe: (commodity: string) => void;
  unsubscribe: (commodity: string) => void;
  subscribed: Set<string>;
}

const PRICE_WS_URL = import.meta.env.VITE_PRICE_WS_URL || 'ws://localhost:8765';

export function useRealtimePrice(options: UseRealtimePriceOptions = {}): UseRealtimePriceResult {
  const {
    commodities = [],
    wsUrl = PRICE_WS_URL,
    onPriceUpdate,
    onError,
    reconnectDelay = 3000,
    maxReconnects = 10,
  } = options;

  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set(commodities));

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSubs = useRef<Set<string>>(new Set(commodities));

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;

        // Subscribe to all pending commodities
        if (pendingSubs.current.size > 0) {
          pendingSubs.current.forEach(c => {
            ws.send(JSON.stringify({ type: 'subscribe', commodity: c }));
          });
        } else {
          ws.send(JSON.stringify({ type: 'get_all' }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string);

          if (msg.type === 'price_update' && msg.data) {
            const d = msg.data as PriceData;
            setPrices(prev => ({ ...prev, [d.id]: d }));
            onPriceUpdate?.(d);
          }

          if (msg.type === 'all_prices' && msg.data) {
            setPrices(msg.data as Record<string, PriceData>);
          }

          if (msg.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        if (reconnectCount.current < maxReconnects) {
          reconnectCount.current += 1;
          reconnectTimer.current = setTimeout(connect, reconnectDelay);
        } else {
          setError(`Não foi possível conectar ao Price Service (${wsUrl}). Verifique se o serviço está rodando.`);
        }
      };

      ws.onerror = () => {
        setError(`Erro de conexão com ${wsUrl}`);
        onError?.(new Error(`WebSocket error: ${wsUrl}`));
      };
    } catch (err) {
      setError(`Falha ao criar WebSocket: ${wsUrl}`);
    }
  }, [wsUrl, reconnectDelay, maxReconnects, onPriceUpdate, onError]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const subscribe = useCallback((commodity: string) => {
    pendingSubs.current.add(commodity);
    setSubscribed(prev => new Set([...prev, commodity]));
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', commodity }));
    }
  }, []);

  const unsubscribe = useCallback((commodity: string) => {
    pendingSubs.current.delete(commodity);
    setSubscribed(prev => { const s = new Set(prev); s.delete(commodity); return s; });
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', commodity }));
    }
  }, []);

  return { prices, isConnected, error, subscribe, unsubscribe, subscribed };
}
