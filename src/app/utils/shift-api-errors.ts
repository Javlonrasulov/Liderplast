import type { T } from '../i18n/translations';

/** Backend {@link production.service} — `applyShiftRecipeAndOutput` xatoliklari */
export function parseShiftInventoryErr(
  message: string,
): { code: string; param?: string } | null {
  if (!message.startsWith('ERR::')) return null;
  const rest = message.slice(5);
  const idx = rest.indexOf('::');
  if (idx === -1) return { code: rest };
  const code = rest.slice(0, idx);
  const encoded = rest.slice(idx + 2);
  try {
    return { code, param: decodeURIComponent(encoded) };
  } catch {
    return { code, param: encoded };
  }
}

export function translateShiftInventoryApiError(message: string, t: T): string {
  const p = parseShiftInventoryErr(message);
  if (!p) return message;
  const { code, param = '' } = p;
  switch (code) {
    case 'PRODUCT_TYPE_REQUIRED':
      return t.apiShiftProductTypeRequired;
    case 'MACHINE_REQUIRED':
      return t.apiShiftMachineRequired;
    case 'SEMI_NOT_FOUND':
      return t.apiShiftSemiNotFound.replace('{label}', param);
    case 'RAW_INSUFFICIENT':
      return t.apiShiftRawInsufficient.replace('{name}', param);
    case 'SEMI_BALANCE_MISSING':
      return t.apiShiftSemiBalanceMissing;
    case 'FINISHED_NOT_FOUND':
      return t.apiShiftFinishedNotFound.replace('{label}', param);
    case 'MACHINE_NOT_LINKED':
      return t.apiShiftMachineNotLinked;
    case 'FINISHED_NO_SEMI_RECIPE':
      return t.apiShiftFinishedNoSemiRecipe;
    case 'INSUFFICIENT_SEMI_STOCK':
      return t.apiShiftInsufficientSemiStock.replace('{name}', param);
    case 'FINISHED_BALANCE_MISSING':
      return t.apiShiftFinishedBalanceMissing;
    default:
      return message;
  }
}
