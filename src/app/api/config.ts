export const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env
    ?.VITE_API_BASE_URL ?? 'http://localhost:3001/api';

export const ACCESS_TOKEN_KEY = 'liderplast_access_token';
export const REFRESH_TOKEN_KEY = 'liderplast_refresh_token';
