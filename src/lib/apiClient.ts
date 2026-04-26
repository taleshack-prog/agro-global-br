const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const TOKEN_KEY = 'agroglobal_token';

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? body.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const get  = <T>(path: string)                => request<T>(path, { method: 'GET' });
const post = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) });
const del  = <T>(path: string)                => request<T>(path, { method: 'DELETE' });

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'producer' | 'trader' | 'admin';
  subscriptionPlan?: 'basic' | 'pro' | 'enterprise';
  subscriptionStatus?: string;
  phone?: string;
  cpfCnpj?: string;
  createdAt?: string;
}

export interface AuthResponse { token: string; user: AuthUser; }
export interface RegisterPayload {
  email: string; password: string; name: string;
  role?: 'producer' | 'trader'; cpfCnpj?: string; phone?: string;
}

export const authApi = {
  login:    (email: string, password: string) => post<AuthResponse>('/api/auth/login', { email, password }),
  register: (payload: RegisterPayload)        => post<AuthResponse>('/api/auth/register', payload),
  me:       ()                                => get<AuthUser>('/api/auth/me'),
};

export interface MarketQuote {
  symbol: string; praça?: string; produto: string;
  price: number; basis?: number; change: number;
  changePct: number; volume?: number; timestamp: string;
  source: 'b3' | 'cbot' | 'mock';
}

export const marketApi = {
  quotes:  () => get<{ data: MarketQuote[]; timestamp: string }>('/api/market/quotes'),
  macro:   () => get<{ data: MarketQuote[]; timestamp: string }>('/api/market/macro'),
  history: (symbol: string, days = 30) =>
    get<{ data: any[] }>(`/api/market/history?symbol=${encodeURIComponent(symbol)}&days=${days}`),
};

export interface Offer {
  id: string; product: string; volumeSacas: number;
  pricePerSaca: number; origem?: string; destino?: string;
  status: 'active' | 'matched' | 'expired' | 'cancelled';
  notes?: string; deadline?: string; createdAt: string;
}
export interface CreateOfferPayload {
  product: string; volumeSacas: number; pricePerSaca: number;
  origem?: string; destino?: string; deadline?: string; notes?: string;
}
export const offersApi = {
  list:   (product?: string) => get<{ data: Offer[] }>(`/api/offers${product ? `?product=${product}` : ''}`),
  create: (payload: CreateOfferPayload) => post<Offer>('/api/offers', payload),
  cancel: (id: string) => del<{ success: boolean }>(`/api/offers/${id}`),
};

export interface Contract {
  id: string; product: string; volumeSacas: number;
  pricePerSaca: number; totalValue: number;
  status: 'draft' | 'pending' | 'signed' | 'active' | 'settled' | 'cancelled';
  deliveryDate?: string; deliveryLocation?: string; signedAt?: string; createdAt: string;
}
export const contractsApi = {
  list:   () => get<{ data: Contract[] }>('/api/contracts'),
  create: (payload: Partial<Contract>) => post<Contract>('/api/contracts', payload),
  sign:   (id: string) => post<Contract>(`/api/contracts/${id}/sign`, {}),
};

export interface Farm {
  id: string; name: string; city?: string; state?: string;
  hectares?: string; carRegistration?: string;
  latitude?: string; longitude?: string; createdAt: string;
}
export interface CreateFarmPayload { name: string; city?: string; state?: string; hectares?: number; }
export const farmsApi = {
  list:   () => get<{ data: Farm[] }>('/api/farms'),
  create: (payload: CreateFarmPayload) => post<Farm>('/api/farms', payload),
};

export const paymentsApi = {
  checkout: (plan: string, successUrl: string, cancelUrl: string) =>
    post<{ url: string }>('/api/payments/checkout', { plan, successUrl, cancelUrl }),
  history: () => get<{ data: any[] }>('/api/payments/history'),
  cancelSubscription: () => post<{ success: boolean }>('/api/payments/cancel', {}),
};

export const api = { auth: authApi, market: marketApi, offers: offersApi, contracts: contractsApi, farms: farmsApi, payments: paymentsApi, tokenStore };
export default api;
