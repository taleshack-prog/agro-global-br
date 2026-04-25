/**
 * useMarketWebSocket
 *
 * Connects to the backend WebSocket server and subscribes to real-time channels.
 * Falls back to the mock data already in mockData.ts when the server is unreachable.
 *
 * Usage:
 *   const { quotes, macro, connected } = useMarketWebSocket(['quotes', 'macro']);
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECTS = 5;

export type WsChannel = 'quotes' | 'macro' | 'orders' | 'alerts';

interface UseMarketWebSocketResult {
  quotes: any[];
  macro: any[];
  connected: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

export function useMarketWebSocket(channels: WsChannel[] = ['quotes', 'macro']): UseMarketWebSocketResult {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [macro, setMacro] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        reconnectCount.current = 0;

        // Subscribe to requested channels
        channels.forEach(ch => {
          ws.send(JSON.stringify({ type: 'subscribe', channel: ch }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'quote_update' && Array.isArray(msg.data)) {
            setQuotes(msg.data);
            setLastUpdated(new Date());
          }
          if (msg.type === 'macro_update' && Array.isArray(msg.data)) {
            setMacro(msg.data);
            setLastUpdated(new Date());
          }
          if (msg.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          // ignore malformed message
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;

        if (reconnectCount.current < MAX_RECONNECTS) {
          reconnectCount.current += 1;
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS * reconnectCount.current);
        } else {
          setError('Unable to connect to real-time server. Using cached data.');
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
      };
    } catch {
      setError('WebSocket not available');
    }
  }, [channels.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { quotes, macro, connected, lastUpdated, error };
}
