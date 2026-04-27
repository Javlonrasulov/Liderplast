export type InventoryStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type InventoryItemCategory =
  | 'RAW_MATERIAL'
  | 'SEMI_PRODUCT'
  | 'FINISHED_PRODUCT';

export interface InventoryRow {
  productId: string;
  productName: string;
  category: InventoryItemCategory;
  unit: 'kg' | 'pcs';
  systemQuantityStart: number;
  realQuantityStart: number;
  income: number;
  expense: number;
  systemQuantityEnd: number;
  realQuantityEnd: number;
}

export interface InventoryRecord {
  id: string;
  docNumber: string;
  warehouseId: string;
  warehouseName: string;
  dateFrom: string;
  dateTo: string;
  status: InventoryStatus;
  createdAt: string;
  finishedAt?: string;
  rows: InventoryRow[];
}

export interface InventoryFilterValue {
  dateFrom: string;
  dateTo: string;
  warehouseId: string;
  status: InventoryStatus | 'ALL';
  docNumber: string;
}

export interface InventoryWarehouseOption {
  id: string;
  name: string;
}
