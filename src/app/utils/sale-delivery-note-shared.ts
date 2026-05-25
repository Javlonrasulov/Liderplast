import type { Sale, SaleOrderItem } from '../store/erp-store';

export const SALE_NOTE_ORG_NAME = '"SAM-BC" MCHJ';

export function saleItemsForDocument(sale: Sale): SaleOrderItem[] {
  if (sale.items && sale.items.length > 0) {
    return sale.items;
  }
  return [
    {
      productCategory: sale.productCategory,
      productType: sale.productType,
      quantity: sale.quantity,
      pricePerUnit: sale.pricePerUnit,
      currency: 'UZS',
      total: sale.total,
    },
  ];
}

/** Barcha sotuvlar bo‘yicha ketma-ket hujjat raqami (000000001 …) */
export function computeSaleDocumentNumber(sale: Sale, allSales: Sale[]): string {
  const sorted = [...allSales].sort((a, b) => {
    const byDate = a.createdAt.localeCompare(b.createdAt);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
  const index = sorted.findIndex((s) => s.id === sale.id);
  const seq = index >= 0 ? index + 1 : sorted.length + 1;
  return String(seq).padStart(9, '0');
}
