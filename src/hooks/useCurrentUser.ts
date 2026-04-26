import { useAuth } from '@/contexts/AuthContext';
import type { AuthUser } from '@/lib/apiClient';

export function useCurrentUser(): AuthUser {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser called without authenticated user');
  return user;
}
