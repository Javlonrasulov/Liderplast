import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiRequest } from '../api/http';
import { clearTokens, getAccessToken, setTokens } from '../api/token-storage';
import type { AppPermissionKey } from './permission-keys';

export type SessionRole =
  | 'ADMIN'
  | 'DIRECTOR'
  | 'ACCOUNTANT'
  | 'MANAGER'
  | 'WORKER';

export interface SessionUser {
  id: string;
  fullName: string;
  phone: string;
  login?: string | null;
  role: SessionRole;
  customRoleLabel?: string | null;
  permissions: string[];
}

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (key: AppPermissionKey) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const me = await apiRequest<SessionUser>('/auth/me');
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (identifier: string, password: string) => {
    const payload = await apiRequest<{
      user: SessionUser;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    setTokens(payload.accessToken, payload.refreshToken);
    setUser(payload.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('liderplast_refresh_token');
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // ignore logout backend errors
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (key: AppPermissionKey) => {
      if (!user) return false;
      if (user.role === 'ADMIN') return true;
      return user.permissions?.includes(key) ?? false;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
      hasPermission,
    }),
    [user, loading, login, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
