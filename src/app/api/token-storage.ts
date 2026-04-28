import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './config';

const CACHED_USER_KEY = 'liderplast_cached_user';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(CACHED_USER_KEY);
}

/**
 * Foydalanuvchi profilining keshlangan nusxasi — sahifa yangilanganda
 * `/auth/me` javobini kutmasdan darrov sessiyani tiklash uchun ishlatiladi.
 * Bu yondashuv tarmoq xatosi yoki backend muammosida ham foydalanuvchini
 * loginga otib yubormaydi.
 */
export function getCachedUser<T = unknown>(): T | null {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCachedUser(user: unknown) {
  try {
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
  } catch {
    /* localStorage to‘la / yozib bo‘lmasa — jim o‘tib ketamiz */
  }
}

export function clearCachedUser() {
  localStorage.removeItem(CACHED_USER_KEY);
}
