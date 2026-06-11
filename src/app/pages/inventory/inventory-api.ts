import { apiRequest } from '../../api/http';
import type { InventoryRecord } from './types';
import { loadInventoryRecords, saveInventoryRecords } from './inventory-storage';

export async function fetchInventoryDocuments(): Promise<InventoryRecord[]> {
  return apiRequest<InventoryRecord[]>('/inventory/documents');
}

export async function fetchNextInventoryDocNumber(): Promise<string> {
  const res = await apiRequest<{ docNumber: string }>(
    '/inventory/documents/next-doc-number',
  );
  return res.docNumber;
}

export async function createInventoryDocument(
  payload: Omit<InventoryRecord, 'id' | 'createdAt'> & {
    expenseIds?: string[];
    finishedAt?: string;
  },
): Promise<InventoryRecord> {
  return apiRequest<InventoryRecord>('/inventory/documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateInventoryDocument(
  id: string,
  patch: Partial<
    Pick<
      InventoryRecord,
      | 'warehouseId'
      | 'warehouseName'
      | 'dateFrom'
      | 'dateTo'
      | 'status'
      | 'rows'
      | 'expenseIds'
      | 'finishedAt'
    >
  >,
): Promise<InventoryRecord> {
  return apiRequest<InventoryRecord>(`/inventory/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteInventoryDocument(id: string): Promise<void> {
  await apiRequest(`/inventory/documents/${id}`, { method: 'DELETE' });
}

/** Bir martalik: localStorage dagi hujjatlarni serverga ko‘chirish */
export async function migrateLocalInventoryToServer(): Promise<InventoryRecord[]> {
  const local = loadInventoryRecords();
  if (local.length === 0) return fetchInventoryDocuments();

  for (const rec of local) {
    await createInventoryDocument({
      docNumber: rec.docNumber,
      warehouseId: rec.warehouseId,
      warehouseName: rec.warehouseName,
      dateFrom: rec.dateFrom,
      dateTo: rec.dateTo,
      status: rec.status,
      rows: rec.rows,
      expenseIds: rec.expenseIds,
      finishedAt: rec.finishedAt,
    });
  }
  saveInventoryRecords([]);
  return fetchInventoryDocuments();
}
