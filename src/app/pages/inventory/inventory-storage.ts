import type { InventoryRecord } from './types';

const STORAGE_KEY = 'erp_inventory_records_v1';

function isInventoryRecord(value: unknown): value is InventoryRecord {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.docNumber === 'string' &&
    typeof v.warehouseId === 'string' &&
    typeof v.dateFrom === 'string' &&
    typeof v.dateTo === 'string' &&
    typeof v.status === 'string' &&
    Array.isArray(v.rows)
  );
}

export function loadInventoryRecords(): InventoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isInventoryRecord);
  } catch {
    return [];
  }
}

export function saveInventoryRecords(records: InventoryRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* noop — quota or private mode */
  }
}

export function nextDocNumber(records: InventoryRecord[]): string {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const indexes = records
    .map((r) => r.docNumber)
    .filter((d) => d.startsWith(prefix))
    .map((d) => parseInt(d.slice(prefix.length), 10))
    .filter((n) => Number.isFinite(n));
  const next = (indexes.length === 0 ? 0 : Math.max(...indexes)) + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}
