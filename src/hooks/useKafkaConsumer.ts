/**
 * useKafkaConsumer
 *
 * In production: connects to a Kafka WebSocket Gateway on ws://localhost:8766
 * In development (no gateway): falls back to the Price Service on ws://localhost:8765
 * and maps its messages to Kafka-style topic messages.
 *
 * Topics mapped from Price Service:
 *   prices                    → price_update messages
 *   hedge-recommendations     → synthetic hedge signals
 *   risk-metrics              → synthetic risk metrics
 *   price-alerts              → movements > 1%
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface KafkaMessage {
  type: string;
  topic?: string;
  commodity?: string;
  data?: any;
  timestamp?: string;
}

interface UseKafkaConsumerOptions {
  topics?: string[];
  onMessage?: (message: KafkaMessage) => void;
  onError?: (error: Error) => void;
}

interface UseKafkaConsumerResult {
  messages: Record<string, KafkaMessage[]>;
  isConnected: boolean;
  error: string | null;
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;
}

const KAFKA_WS    = import.meta.env.VITE_KAFKA_WS_URL  || 'ws://localhost:8766';
const PRICE_WS    = import.meta.env.VITE_PRICE_WS_URL  || 'ws://localhost:8765';
const MAX_MSGS    = 100;

export function useKafkaConsumer(options: UseKafkaConsumerOptions = {}): UseKafkaConsumerResult {
  const { topics = [], onMessage, onError } = options;

  const [messages, setMessages]     = useState<Record<string, KafkaMessage[]>>({});
  const [isConnected, setConnected] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const wsRef          = useRef<WebSocket | null>(null);
  const reconnectRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnects     = useRef(0);
  const subscribedRef  = useRef<Set<string>>(new Set(topics));

  const push = useCallback((msg: KafkaMessage) => {
    const key = msg.topic ?? msg.type ?? 'unknown';
    setMessages(prev => ({
      ...prev,
      [key]: [...(prev[key] ?? []), msg].slice(-MAX_MSGS),
    }));
    onMessage?.(msg);
  }, [onMessage]);

  const connect = useCallback(() => {
    // Try Kafka gateway first, fall back to Price Service
    const urls = [KAFKA_WS, PRICE_WS];
    let urlIdx = 0;

    const tryConnect = () => {
      const url = urls[urlIdx % urls.length];
      const ws  = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        reconnects.current = 0;
        subscribedRef.current.forEach(t => {
          ws.send(JSON.stringify({ type: 'subscribe', topic: t, commodity: t }));
        });
      };

      ws.onmessage = (ev) => {
        try {
          const raw = JSON.parse(ev.data as string);
          // Normalise Price Service messages into Kafka-style envelopes
          if (raw.type === 'price_update' && raw.data) {
            const d = raw.data;
            push({ type: 'price_update', topic: 'prices', commodity: d.id, data: d, timestamp: d.timestamp });

            // Derive synthetic hedge signal
            if (Math.abs(d.change_pct ?? 0) > 0.5) {
              const isHigh = Math.abs(d.change_pct) > 1;
              push({
                type: 'hedge_recommendation',
                topic: 'hedge-recommendations',
                commodity: d.id,
                data: {
                  commodity: d.id,
                  name: d.name,
                  action: isHigh ? 'HEDGE_RECOMMENDED' : 'MONITOR',
                  risk_level: isHigh ? 'high' : 'medium',
                  reason: `Variação de ${(d.change_pct ?? 0).toFixed(3)}% detectada`,
                  current_price: d.price,
                },
                timestamp: new Date().toISOString(),
              });
            }

            // Price alert on big moves
            if (Math.abs(d.change_pct ?? 0) > 1) {
              push({
                type: 'price_alert',
                topic: 'price-alerts',
                commodity: d.id,
                data: {
                  id: `${d.id}-${Date.now()}`,
                  commodity: d.id,
                  message: `Variação de ${(d.change_pct ?? 0).toFixed(2)}%`,
                  severity: Math.abs(d.change_pct) > 2 ? 'high' : 'medium',
                  timestamp: new Date().toISOString(),
                  read: false,
                },
                timestamp: new Date().toISOString(),
              });
            }
          } else if (raw.type === 'all_prices') {
            // bulk snapshot
          } else if (raw.type === 'pong' || raw.type === 'ping') {
            // heartbeat — ignore
          } else {
            push({ ...raw, topic: raw.topic ?? raw.type });
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        if (reconnects.current < 5) {
          reconnects.current++;
          urlIdx++; // try next URL on next reconnect
          reconnectRef.current = setTimeout(tryConnect, 3000 * reconnects.current);
        } else {
          setError('Kafka Gateway e Price Service indisponíveis.');
        }
      };

      ws.onerror = () => {
        onError?.(new Error(`WebSocket error: ${url}`));
      };
    };

    tryConnect();
  }, [push, onError]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const subscribe = useCallback((topic: string) => {
    subscribedRef.current.add(topic);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', topic, commodity: topic }));
    }
  }, []);

  const unsubscribe = useCallback((topic: string) => {
    subscribedRef.current.delete(topic);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', topic }));
    }
  }, []);

  return { messages, isConnected, error, subscribe, unsubscribe };
}
