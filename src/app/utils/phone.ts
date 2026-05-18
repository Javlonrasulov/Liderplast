/** Telefon inputida doim ko‘rinadigan prefiks */
export const UZ_PHONE_INPUT_PREFIX = '+998 ';

export function emptyUzPhoneInput(): string {
  return UZ_PHONE_INPUT_PREFIX;
}

/** Ichki (avtomatik) klient telefoni: +99888XXXXXXXX */
export function isPlaceholderClientPhone(phone: string): boolean {
  const compact = phone.replace(/\s/g, '');
  return compact.includes('__del__') || /^\+99888\d{8}$/.test(compact);
}

/** Ko‘rinish: +998 99 999 99 99 */
export function formatUzPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }
  digits = digits.slice(0, 9);

  if (digits.length === 0) {
    return UZ_PHONE_INPUT_PREFIX;
  }

  let out = '+998';
  if (digits.length > 0) out += ` ${digits.slice(0, 2)}`;
  if (digits.length > 2) out += ` ${digits.slice(2, 5)}`;
  if (digits.length > 5) out += ` ${digits.slice(5, 7)}`;
  if (digits.length > 7) out += ` ${digits.slice(7, 9)}`;
  return out;
}

export function formatUzPhoneDisplay(stored: string | null | undefined): string {
  if (!stored?.trim() || isPlaceholderClientPhone(stored)) {
    return '';
  }
  return formatUzPhoneInput(stored);
}

/** API/DB uchun +998XXXXXXXXX yoki bo‘sh */
export function normalizeUzPhoneForApi(displayOrRaw: string): string | undefined {
  const digits = displayOrRaw.replace(/\D/g, '');
  const national = digits.startsWith('998') ? digits.slice(3) : digits;
  if (national.length === 0) {
    return undefined;
  }
  if (national.length !== 9) {
    return undefined;
  }
  return `+998${national}`;
}

export function uzPhoneTelHref(stored: string): string | undefined {
  const normalized = normalizeUzPhoneForApi(formatUzPhoneDisplay(stored) || stored);
  return normalized ? normalized : undefined;
}
