import type { Sale } from '../store/erp-store';

export type SaleHistoryPaymentFilter = 'all' | 'paid' | 'debt';

export type SaleHistoryFilterValue = {
  dateFrom: string;
  dateTo: string;
  clientId: string;
  product: string;
  payment: SaleHistoryPaymentFilter;
};

export const EMPTY_SALE_HISTORY_FILTER: SaleHistoryFilterValue = {
  dateFrom: '',
  dateTo: '',
  clientId: '',
  product: '',
  payment: 'all',
};

export function applySaleHistoryFilters(
  sales: Sale[],
  filter: SaleHistoryFilterValue,
  options?: { includeClientFilter?: boolean },
): Sale[] {
  const includeClient = options?.includeClientFilter !== false;
  return sales.filter((sale) => {
    if (filter.dateFrom && sale.date < filter.dateFrom) return false;
    if (filter.dateTo && sale.date > filter.dateTo) return false;
    if (includeClient && filter.clientId && sale.clientId !== filter.clientId) return false;
    if (filter.product) {
      const names =
        sale.items && sale.items.length > 0
          ? sale.items.map((i) => i.productType)
          : [sale.productType];
      if (!names.includes(filter.product)) return false;
    }
    const debt = sale.total - sale.paid;
    if (filter.payment === 'paid' && debt > 0.01) return false;
    if (filter.payment === 'debt' && debt <= 0.01) return false;
    return true;
  });
}

export function collectSaleProductOptions(sales: Sale[]): string[] {
  const set = new Set<string>();
  for (const sale of sales) {
    if (sale.items && sale.items.length > 0) {
      for (const item of sale.items) {
        if (item.productType) set.add(item.productType);
      }
    } else if (sale.productType) {
      set.add(sale.productType);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function isSaleHistoryFilterActive(filter: SaleHistoryFilterValue): boolean {
  return Boolean(
    filter.dateFrom ||
      filter.dateTo ||
      filter.clientId ||
      filter.product ||
      filter.payment !== 'all',
  );
}
