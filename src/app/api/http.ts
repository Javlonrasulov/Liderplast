import { API_BASE_URL } from './config';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './token-storage';

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
    let message = `Request failed with status ${response.status}`;
    try {
      const raw = await response.text();
      if (raw.trim()) {
        const errorPayload = JSON.parse(raw);
        const nested = errorPayload?.error?.message;
        message =
          (Array.isArray(nested) ? nested.join(', ') : nested) ??
          errorPayload?.message ??
          message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
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
