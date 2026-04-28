import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiRequest, ApiError } from '../api/http';
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
  updateCredentials: (payload: {
    currentPassword: string;
    login?: string;
    newPassword?: string;
  }) => Promise<void>;
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
    } catch (err) {
      /**
       * Tokenlarni faqat haqiqiy autentifikatsiya xatosi (401) bo‘lganda tozalaymiz.
       * 403 (ruxsat yetmasligi), tarmoq xatolari yoki backend muammosi sahifa
       * yangilanganda foydalanuvchini tizimdan chiqarib yubormasligi kerak.
       */
      const isAuthError = err instanceof ApiError && err.status === 401;
      if (isAuthError) {
        clearTokens();
        setUser(null);
      } else {
        if (typeof console !== 'undefined' && console.warn) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('[auth] /auth/me failed, sessiya saqlandi:', msg);
        }
      }
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

  const updateCredentials = useCallback(
    async (payload: { currentPassword: string; login?: string; newPassword?: string }) => {
      const res = await apiRequest<{
        user: SessionUser;
        accessToken: string;
        refreshToken: string;
      }>('/auth/credentials', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
    },
    [],
  );

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
      updateCredentials,
      logout,
      hasPermission,
    }),
    [user, loading, login, updateCredentials, logout, hasPermission],
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
