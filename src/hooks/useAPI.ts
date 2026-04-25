/**
 * useAPI — typed fetcher for the FastAPI backend
 *
 * Usage:
 *   const { data, loading, error, refetch } = useAPI<CommodityResponse[]>('/api/commodities')
 *
 * Auth: reads token from localStorage key 'agroglobal_token'
 * Base URL: VITE_API_URL (default http://localhost:8000)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  return localStorage.getItem('agroglobal_token');
}

interface UseAPIResult<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useAPI<T>(endpoint: string, options?: RequestInit): UseAPIResult<T> {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string> ?? {}),
    };

    fetch(`${BASE_URL}${endpoint}`, { ...options, headers, signal: ctrl.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((json: T) => { setData(json); setLoading(false); })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message ?? 'Unknown error');
        setLoading(false);
      });

    return () => ctrl.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, tick]);

  return { data, loading, error, refetch };
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
