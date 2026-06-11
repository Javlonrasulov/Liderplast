import type { InventoryItemCategory } from './types';

export type WarehouseStockSnapshot = {
  itemType: 'RAW_MATERIAL' | 'SEMI_PRODUCT' | 'FINISHED_PRODUCT';
  quantity: number;
  itemName?: string;
};

export type InventoryProductRef = {
  productId: string;
  productName: string;
  category: InventoryItemCategory;
};

function categoryToItemType(
  category: InventoryItemCategory,
): WarehouseStockSnapshot['itemType'] {
  return category;
}

/**
 * `warehouse/stock` javobini katalog `productId` lariga bog‘laydi.
 * Stock yozuvidagi `id` mahsulot ID emas — faqat `itemType` + `itemName`.
 */
export function buildStockByProductId(
  products: InventoryProductRef[],
  stock: WarehouseStockSnapshot[],
): Map<string, number> {
  const byTypeAndName = new Map<string, number>();
  const byName = new Map<string, number>();

  for (const row of stock) {
    if (!row.itemName) continue;
    const key = `${row.itemType}::${row.itemName}`;
    byTypeAndName.set(key, (byTypeAndName.get(key) ?? 0) + row.quantity);
    byName.set(row.itemName, (byName.get(row.itemName) ?? 0) + row.quantity);
  }

  const result = new Map<string, number>();
  for (const p of products) {
    const itemType = categoryToItemType(p.category);
    const exact = byTypeAndName.get(`${itemType}::${p.productName}`);
    const qty = exact !== undefined ? exact : (byName.get(p.productName) ?? 0);
    result.set(p.productId, qty);
  }
  return result;
}
