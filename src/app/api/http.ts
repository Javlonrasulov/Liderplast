import { API_BASE_URL } from './config';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './token-storage';

/** HTTP status kodini saqlovchi xato — chaqiruvchi 403/404 ni alohida ushlay olishi uchun. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isForbiddenApiError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 403;
}

export function isNotFoundApiError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

let refreshPromise: Promise<void> | null = null;

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    throw new Error('No refresh token');
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          clearTokens();
          throw new Error('Unable to refresh session');
        }

        const payload = await response.json();
        setTokens(payload.accessToken, payload.refreshToken);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { retryOnAuth?: boolean } = {},
): Promise<T> {
  const accessToken = getAccessToken();
  const headers = new Headers(init.headers ?? {});

  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && options.retryOnAuth !== false && getRefreshToken()) {
    await tryRefresh();
    return apiRequest<T>(path, init, { retryOnAuth: false });
  }

  if (!response.ok) {
    const raw = await response.text();
    let message = `Request failed with status ${response.status}`;
    if (raw.trim()) {
      try {
        const errorPayload = JSON.parse(raw) as {
          error?: { message?: unknown };
          message?: unknown;
        };
        const pickMsg = (v: unknown): string | undefined => {
          if (Array.isArray(v)) return v.map(String).join(', ');
          if (typeof v === 'string' && v.trim()) return v;
          return undefined;
        };
        const nested = errorPayload?.error?.message;
        const top = errorPayload?.message;
        message = pickMsg(nested) ?? pickMsg(top) ?? message;
      } catch {
        const stripped = raw.trim().slice(0, 280);
        if (stripped.length > 0) message = stripped;
      }
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  if (!raw.trim()) {
    return undefined as T;
  }

  return JSON.parse(raw) as T;
}
