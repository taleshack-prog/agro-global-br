import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { authApi, tokenStore, type AuthUser, type RegisterPayload } from '@/lib/apiClient';

interface AuthState { user: AuthUser | null; isLoading: boolean; isHydrated: boolean; }
type AuthAction =
  | { type: 'HYDRATING' }
  | { type: 'SET_USER'; user: AuthUser }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; value: boolean };

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HYDRATING':   return { ...state, isLoading: true };
    case 'SET_USER':    return { ...state, user: action.user, isLoading: false, isHydrated: true };
    case 'CLEAR_USER':  return { user: null, isLoading: false, isHydrated: true };
    case 'SET_LOADING': return { ...state, isLoading: action.value };
    default:            return state;
  }
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload)        => Promise<void>;
  logout:   ()                                => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { user: null, isLoading: false, isHydrated: false });

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) { dispatch({ type: 'CLEAR_USER' }); return; }
    dispatch({ type: 'HYDRATING' });
    authApi.me()
      .then(user => dispatch({ type: 'SET_USER', user }))
      .catch(() => { tokenStore.clear(); dispatch({ type: 'CLEAR_USER' }); });
  }, []);

  useEffect(() => {
    const onExpired = () => { tokenStore.clear(); dispatch({ type: 'CLEAR_USER' }); };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const { token, user } = await authApi.login(email, password);
      tokenStore.set(token); dispatch({ type: 'SET_USER', user });
    } finally { dispatch({ type: 'SET_LOADING', value: false }); }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const { token, user } = await authApi.register(payload);
      tokenStore.set(token); dispatch({ type: 'SET_USER', user });
    } finally { dispatch({ type: 'SET_LOADING', value: false }); }
  }, []);

  const logout = useCallback(() => { tokenStore.clear(); dispatch({ type: 'CLEAR_USER' }); }, []);

  return (
    <AuthContext.Provider value={{ ...state, isAuthenticated: !!state.user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
