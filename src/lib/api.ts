const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface MarketQuote {
  symbol: string;
  praça?: string;
  produto: string;
  price: number;
  basis?: number;
  change: number;
  changePct: number;
  volume?: number;
  timestamp: string;
  source: 'b3' | 'cbot' | 'mock';
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('agroglobal_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...this.getHeaders(), ...options?.headers },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; name: string; role?: string }) {
    return this.request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>('/api/auth/me');
  }

  async getQuotes() {
    return this.request<{ data: MarketQuote[]; timestamp: string }>('/api/market/quotes');
  }

  async getMacro() {
    return this.request<{ data: MarketQuote[]; timestamp: string }>('/api/market/macro');
  }

  async getMarketHistory(symbol: string, days = 30) {
    return this.request<{ data: any[] }>(`/api/market/history?symbol=${encodeURIComponent(symbol)}&days=${days}`);
  }

  async getOffers(product?: string) {
    const qs = product ? `?product=${product}` : '';
    return this.request<{ data: any[] }>(`/api/offers${qs}`);
  }

  async createOffer(data: any) {
    return this.request<any>('/api/offers', { method: 'POST', body: JSON.stringify(data) });
  }

  async cancelOffer(id: string) {
    return this.request<any>(`/api/offers/${id}`, { method: 'DELETE' });
  }

  async getContracts() {
    return this.request<{ data: any[] }>('/api/contracts');
  }

  async createContract(data: any) {
    return this.request<any>('/api/contracts', { method: 'POST', body: JSON.stringify(data) });
  }

  async signContract(id: string) {
    return this.request<any>(`/api/contracts/${id}/sign`, { method: 'POST' });
  }

  async createCheckout(plan: string, successUrl: string, cancelUrl: string) {
    return this.request<{ url: string }>('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan, successUrl, cancelUrl }),
    });
  }

  async getPaymentHistory() {
    return this.request<{ data: any[] }>('/api/payments/history');
  }

  async getFarms() {
    return this.request<{ data: any[] }>('/api/farms');
  }

  async createFarm(data: any) {
    return this.request<any>('/api/farms', { method: 'POST', body: JSON.stringify(data) });
  }

  setToken(token: string) {
    localStorage.setItem('agroglobal_token', token);
  }

  clearToken() {
    localStorage.removeItem('agroglobal_token');
  }
}

export const api = new ApiClient(BASE_URL);
