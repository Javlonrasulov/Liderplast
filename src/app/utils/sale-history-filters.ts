import type { Sale } from '../store/erp-store';

export type SaleHistoryPaymentFilter = 'all' | 'paid' | 'debt';

export type SaleHistoryFilterValue = {
  dateFrom: string;
  dateTo: string;
  clientIds: string[];
  products: string[];
  payment: SaleHistoryPaymentFilter;
};

export const EMPTY_SALE_HISTORY_FILTER: SaleHistoryFilterValue = {
  dateFrom: '',
  dateTo: '',
  clientIds: [],
  products: [],
  payment: 'all',
};

export function applySaleHistoryFilters(
  sales: Sale[],
  filter: SaleHistoryFilterValue,
  options?: { includeClientFilter?: boolean },
): Sale[] {
  const includeClient = options?.includeClientFilter !== false;
  const clientSet =
    includeClient && filter.clientIds.length > 0 ? new Set(filter.clientIds) : null;
  const productSet = filter.products.length > 0 ? new Set(filter.products) : null;

  return sales.filter((sale) => {
    if (filter.dateFrom && sale.date < filter.dateFrom) return false;
    if (filter.dateTo && sale.date > filter.dateTo) return false;
    if (clientSet && !clientSet.has(sale.clientId)) return false;
    if (productSet) {
      const names =
        sale.items && sale.items.length > 0
          ? sale.items.map((i) => i.productType)
          : [sale.productType];
      if (!names.some((n) => productSet.has(n))) return false;
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
      filter.clientIds.length > 0 ||
      filter.products.length > 0 ||
      filter.payment !== 'all',
  );
}

export type SaleHistoryFilterLabels = {
  allClients: string;
  allProducts: string;
  paymentAll: string;
  paymentPaid: string;
  paymentDebt: string;
  clientsLabel: string;
  productsLabel: string;
  datesLabel: string;
  paymentLabel: string;
  formatDate: (ymd: string) => string;
};

/** PDF xulosasi uchun filtr qatorlari (tarjima allaqachon berilgan) */
export function buildSaleHistoryPdfFilterLines(
  filter: SaleHistoryFilterValue,
  labels: SaleHistoryFilterLabels,
  clientOptions: Array<{ id: string; name: string }>,
): string[] {
  const lines: string[] = [];

  if (filter.dateFrom || filter.dateTo) {
    const from = filter.dateFrom ? labels.formatDate(filter.dateFrom) : '…';
    const to = filter.dateTo ? labels.formatDate(filter.dateTo) : '…';
    lines.push(`${labels.datesLabel}: ${from} - ${to}`);
  }

  if (filter.clientIds.length > 0) {
    const nameById = new Map(clientOptions.map((c) => [c.id, c.name]));
    const names = filter.clientIds
      .map((id) => nameById.get(id) ?? id)
      .filter(Boolean);
    lines.push(`${labels.clientsLabel}: ${names.join(', ')}`);
  } else {
    lines.push(`${labels.clientsLabel}: ${labels.allClients}`);
  }

  if (filter.products.length > 0) {
    lines.push(`${labels.productsLabel}: ${filter.products.join(', ')}`);
  } else {
    lines.push(`${labels.productsLabel}: ${labels.allProducts}`);
  }

  const paymentText =
    filter.payment === 'paid'
      ? labels.paymentPaid
      : filter.payment === 'debt'
        ? labels.paymentDebt
        : labels.paymentAll;
  lines.push(`${labels.paymentLabel}: ${paymentText}`);

  return lines;
}
