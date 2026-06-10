import type { T } from '../i18n/translations';

/** Backend/class-validator xabarlarini foydalanuvchi tiliga */
export function translateCompanyAssetApiError(message: string, t: T): string {
  const raw = message.trim();
  if (!raw) return t.prEmployeeSaveError;

  const lower = raw.toLowerCase();

  if (lower.includes('request failed with status')) return t.prEmployeeSaveError;

  if (
    lower.includes('entity too large') ||
    lower.includes('payload too large') ||
    lower.includes('request entity too large')
  ) {
    return t.caErrPayloadTooLarge;
  }

  if (
    lower.includes('purchasepriceoriginal') ||
    lower.includes('purchase price') ||
    lower.includes('invalid amounts') ||
    lower.includes('invalid purchase')
  ) {
    return t.caErrPurchasePriceInvalid;
  }

  if (
    lower.includes('fxratetouzs') ||
    lower.includes('exchange rate') ||
    lower.includes('invalid cbu') ||
    lower.includes('invalid exchange')
  ) {
    return t.caErrFxRateInvalid;
  }

  if (lower.includes('inventory number already') || lower.includes('inventorynumber')) {
    return t.caErrInventoryDuplicate;
  }

  if (lower.includes('name')) return t.caErrNameRequired;

  if (lower.includes('purchasedat') || lower.includes('incurredat')) {
    return t.caErrDateInvalid;
  }

  if (lower.includes('assigned user') || lower.includes('user not found')) {
    return t.caErrEmployeeNotFound;
  }

  if (lower.includes('not found')) return t.caErrNotFound;

  if (
    lower.includes('must ') ||
    lower.includes('should ') ||
    lower.includes('conforming') ||
    /^[a-z][a-z0-9_]* must /.test(lower)
  ) {
    return t.caErrValidationGeneric;
  }

  return t.prEmployeeSaveError;
}
