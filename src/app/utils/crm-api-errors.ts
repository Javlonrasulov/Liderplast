import type { T } from '../i18n/translations';

export function translateCrmApiError(message: string, t: T): string {
  const m = message.trim();
  if (m === 'Client has been removed') return t.slApiClientRemoved;
  if (m === 'Client not found') return t.slApiClientNotFound;
  if (m === 'Insufficient stock for order item') return t.slStockNotEnough;
  if (m === 'Paid amount cannot exceed order total') return t.slApiPaidExceedsTotal;
  if (m.startsWith('Paid amount is less than')) return t.slApiPaidBelowRecorded;
  return m;
}
