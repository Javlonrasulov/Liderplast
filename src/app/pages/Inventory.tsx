import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Pause,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { useERP, type WarehouseProduct } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { TODAY, formatDate } from '../utils/format';
import { SingleDatePicker } from '../components/SingleDatePicker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { InventoryFilters } from './inventory/InventoryFilters';
import { InventoryTable } from './inventory/InventoryTable';
import { InventorySummary } from './inventory/InventorySummary';
import {
  loadInventoryRecords,
  nextDocNumber,
  saveInventoryRecords,
} from './inventory/inventory-storage';
import type {
  InventoryFilterValue,
  InventoryItemCategory,
  InventoryRecord,
  InventoryRow,
  InventoryStatus,
  InventoryWarehouseOption,
} from './inventory/types';

const DEFAULT_WAREHOUSES: InventoryWarehouseOption[] = [
  { id: 'main', name: 'main' },
];

const DEFAULT_FILTER: InventoryFilterValue = {
  dateFrom: '',
  dateTo: '',
  warehouseId: '',
  status: 'ALL',
  docNumber: '',
};

const STATUS_BADGE_CLS: Record<InventoryStatus, string> = {
  NOT_STARTED:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600',
  IN_PROGRESS:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  COMPLETED:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
};

function statusLabel(
  status: InventoryStatus,
  t: ReturnType<typeof useApp>['t'],
): string {
  if (status === 'NOT_STARTED') return t.invStatusNotStarted;
  if (status === 'IN_PROGRESS') return t.invStatusInProgress;
  return t.invStatusCompleted;
}

function deriveCategory(p: WarehouseProduct): InventoryItemCategory {
  if (p.itemType === 'RAW_MATERIAL') return 'RAW_MATERIAL';
  if (p.itemType === 'SEMI_PRODUCT') return 'SEMI_PRODUCT';
  return 'FINISHED_PRODUCT';
}

function unitFor(p: WarehouseProduct): 'kg' | 'pcs' {
  return p.itemType === 'RAW_MATERIAL' ? 'kg' : 'pcs';
}

interface CreateDialogValues {
  docNumber: string;
  warehouseId: string;
  dateFrom: string;
  dateTo: string;
}


export function Inventory() {
  const { state } = useERP();
  const { t } = useApp();

  const [records, setRecords] = useState<InventoryRecord[]>(() =>
    loadInventoryRecords(),
  );
  const [filter, setFilter] = useState<InventoryFilterValue>(DEFAULT_FILTER);
  const [appliedFilter, setAppliedFilter] =
    useState<InventoryFilterValue>(DEFAULT_FILTER);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmFinishId, setConfirmFinishId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string>('');

  const warehouses = DEFAULT_WAREHOUSES;
  const localizedWarehouses = useMemo<InventoryWarehouseOption[]>(
    () =>
      warehouses.map((w) => ({
        id: w.id,
        name: w.id === 'main' ? t.invWarehouseDefault : w.name,
      })),
    [t.invWarehouseDefault, warehouses],
  );

  useEffect(() => {
    saveInventoryRecords(records);
  }, [records]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  /**
   * `warehouseStock` dagi `id` — bu **stock yozuvining ID**'si, kataloq mahsulotining ID'si emas.
   * Shuning uchun mahsulotni `itemType` + `itemName` (yoki `itemName` to'g'ridan-to'g'ri) orqali
   * mos keltiramiz — Warehouse sahifasi ham xuddi shu yondashuvdan foydalanadi.
   */
  const stockByProduct = useMemo(() => {
    const byTypeAndName = new Map<string, number>();
    const byName = new Map<string, number>();
    for (const s of state.warehouseStock ?? []) {
      if (!s.itemName) continue;
      const key = `${s.itemType}::${s.itemName}`;
      byTypeAndName.set(key, (byTypeAndName.get(key) ?? 0) + s.quantity);
      byName.set(s.itemName, (byName.get(s.itemName) ?? 0) + s.quantity);
    }
    return { byTypeAndName, byName };
  }, [state.warehouseStock]);

  const stockForProduct = (p: WarehouseProduct): number => {
    const exact = stockByProduct.byTypeAndName.get(`${p.itemType}::${p.name}`);
    if (exact !== undefined) return exact;
    return stockByProduct.byName.get(p.name) ?? 0;
  };

  const buildRowsFromCatalog = (): InventoryRow[] => {
    const products = state.warehouseProducts ?? [];
    return products.map((p) => {
      const stock = stockForProduct(p);
      const cat = deriveCategory(p);
      return {
        productId: p.id,
        productName: p.name,
        category: cat,
        unit: unitFor(p),
        systemQuantityStart: stock,
        realQuantityStart: stock,
        income: 0,
        expense: 0,
        systemQuantityEnd: stock,
        realQuantityEnd: stock,
      };
    });
  };

  const handleCreate = (values: CreateDialogValues) => {
    const initialRows = buildRowsFromCatalog();
    const warehouse =
      localizedWarehouses.find((w) => w.id === values.warehouseId) ??
      localizedWarehouses[0];
    const newRecord: InventoryRecord = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      docNumber: values.docNumber || nextDocNumber(records),
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      dateFrom: values.dateFrom,
      dateTo: values.dateTo,
      status: 'NOT_STARTED',
      createdAt: new Date().toISOString(),
      rows: initialRows,
    };
    setRecords((prev) => [newRecord, ...prev]);
    setSelectedId(newRecord.id);
    setCreateOpen(false);
    setToast(t.invToastCreated);
  };

  const updateRecord = (
    id: string,
    update: (r: InventoryRecord) => InventoryRecord,
  ) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? update(r) : r)));
  };

  const handleStart = (id: string) => {
    updateRecord(id, (r) => ({ ...r, status: 'IN_PROGRESS' }));
  };

  const handlePause = (id: string) => {
    updateRecord(id, (r) => ({ ...r, status: 'NOT_STARTED' }));
  };

  const handleFinish = (id: string) => {
    updateRecord(id, (r) => {
      const finalRows = r.rows.map((row) => ({
        ...row,
        systemQuantityEnd: row.realQuantityEnd,
      }));
      return {
        ...r,
        rows: finalRows,
        status: 'COMPLETED',
        finishedAt: new Date().toISOString(),
      };
    });
    setConfirmFinishId(null);
    setToast(`${t.invToastFinished} • ${t.invStockUpdated}`);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) setSelectedId(null);
    setConfirmDeleteId(null);
    setToast(t.invToastDeleted);
  };

  const handleRowChange = (
    recordId: string,
    productId: string,
    patch: Partial<InventoryRow>,
  ) => {
    updateRecord(recordId, (r) => ({
      ...r,
      rows: r.rows.map((row) => {
        if (row.productId !== productId) return row;
        const next = { ...row, ...patch };
        if ('income' in patch || 'expense' in patch) {
          next.systemQuantityEnd =
            next.systemQuantityStart + next.income - next.expense;
        }
        return next;
      }),
    }));
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (appliedFilter.dateFrom && r.dateTo && r.dateTo < appliedFilter.dateFrom)
        return false;
      if (appliedFilter.dateTo && r.dateFrom && r.dateFrom > appliedFilter.dateTo)
        return false;
      if (
        appliedFilter.warehouseId &&
        r.warehouseId !== appliedFilter.warehouseId
      )
        return false;
      if (appliedFilter.status !== 'ALL' && r.status !== appliedFilter.status)
        return false;
      if (
        appliedFilter.docNumber &&
        !r.docNumber
          .toLowerCase()
          .includes(appliedFilter.docNumber.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [records, appliedFilter]);

  const selected = selectedId
    ? (records.find((r) => r.id === selectedId) ?? null)
    : null;

  const exportXlsx = (record: InventoryRecord) => {
    const meta: (string | number)[][] = [
      [t.invTitle],
      [t.invCardDocNumber, record.docNumber],
      [t.invCardWarehouse, record.warehouseName],
      [t.invFilterDateFrom, record.dateFrom],
      [t.invFilterDateTo, record.dateTo],
      [t.invFilterStatus, statusLabel(record.status, t)],
      [],
    ];

    const headers = [
      t.invColIndex,
      t.invColProduct,
      `${t.invColPeriodStart} • ${t.invColSystem}`,
      `${t.invColPeriodStart} • ${t.invColReal}`,
      t.invColIncoming,
      t.invColOutgoing,
      `${t.invColPeriodEnd} • ${t.invColSystem}`,
      `${t.invColPeriodEnd} • ${t.invColReal}`,
      t.invColDifference,
    ];

    const dataRows = record.rows.map((row, i) => {
      const diff = row.realQuantityEnd - row.systemQuantityEnd;
      return [
        i + 1,
        row.productName,
        row.systemQuantityStart,
        row.realQuantityStart,
        row.income,
        row.expense,
        row.systemQuantityEnd,
        row.realQuantityEnd,
        diff,
      ];
    });

    const totals = record.rows.reduce(
      (acc, r) => {
        acc.systemStart += r.systemQuantityStart;
        acc.realStart += r.realQuantityStart;
        acc.income += r.income;
        acc.expense += r.expense;
        acc.systemEnd += r.systemQuantityEnd;
        acc.realEnd += r.realQuantityEnd;
        return acc;
      },
      {
        systemStart: 0,
        realStart: 0,
        income: 0,
        expense: 0,
        systemEnd: 0,
        realEnd: 0,
      },
    );
    const totalDiff = totals.realEnd - totals.systemEnd;

    const totalRow = [
      '',
      t.invFooterTotal,
      totals.systemStart,
      totals.realStart,
      totals.income,
      totals.expense,
      totals.systemEnd,
      totals.realEnd,
      totalDiff,
    ];

    const aoa: (string | number)[][] = [...meta, headers, ...dataRows, totalRow];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 36 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `inventory-${record.docNumber}.xlsx`);
  };

  const exportPdf = () => {
    window.print();
  };

  const isCatalogEmpty = (state.warehouseProducts ?? []).length === 0;

  return (
    <div className="space-y-4 p-3 sm:p-5">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30">
            <ClipboardList size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                {t.invTitle}
              </h1>
              {selected && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE_CLS[selected.status]}`}
                >
                  {statusLabel(selected.status, t)}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.invSubtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => selected && exportXlsx(selected)}
            disabled={!selected}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:text-sm"
          >
            <FileSpreadsheet size={14} />
            <span className="hidden min-[420px]:inline">{t.invExportExcel}</span>
            <span className="min-[420px]:hidden">Excel</span>
          </button>
          <button
            type="button"
            onClick={exportPdf}
            disabled={!selected}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:text-sm"
          >
            <FileText size={14} />
            <span className="hidden min-[420px]:inline">{t.invExportPdf}</span>
            <span className="min-[420px]:hidden">PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={isCatalogEmpty}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 px-3 text-xs font-semibold text-white shadow-md shadow-indigo-500/30 transition-transform hover:from-indigo-600 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed sm:px-4 sm:text-sm"
          >
            <Plus size={14} />
            <span className="hidden min-[420px]:inline">{t.invCreateNew}</span>
            <span className="min-[420px]:hidden">+</span>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="print:hidden">
        <InventoryFilters
          value={filter}
          onChange={setFilter}
          onApply={() => setAppliedFilter(filter)}
          onReset={() => {
            setFilter(DEFAULT_FILTER);
            setAppliedFilter(DEFAULT_FILTER);
          }}
          warehouses={localizedWarehouses}
        />
      </div>

      {/* Records list (print-hidden when a record is selected) */}
      {!selected && (
        <RecordsList
          records={filteredRecords}
          allCount={records.length}
          warehouseLabel={t.invCardWarehouse}
          onSelect={(id) => setSelectedId(id)}
          onDelete={(id) => setConfirmDeleteId(id)}
        />
      )}

      {selected && (
        <>
          <SelectedHeader
            record={selected}
            onBack={() => setSelectedId(null)}
            onStart={() => handleStart(selected.id)}
            onPause={() => handlePause(selected.id)}
            onFinish={() => setConfirmFinishId(selected.id)}
            onDelete={() => setConfirmDeleteId(selected.id)}
          />

          <InventoryTable
            record={selected}
            editable={selected.status === 'IN_PROGRESS'}
            onChangeRow={(productId, patch) =>
              handleRowChange(selected.id, productId, patch)
            }
          />

          <InventorySummary record={selected} />
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 z-[200] -translate-x-1/2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-xl shadow-slate-300/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:shadow-black/50">
          {toast}
        </div>
      )}

      {/* Create dialog */}
      <CreateInventoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        nextNumber={nextDocNumber(records)}
        warehouses={localizedWarehouses}
        onSubmit={handleCreate}
      />

      {/* Confirm finish */}
      <AlertDialog
        open={!!confirmFinishId}
        onOpenChange={(o) => !o && setConfirmFinishId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.invConfirmFinishTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.invConfirmFinishDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.invBack}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmFinishId && handleFinish(confirmFinishId)}
            >
              {t.invActionFinish}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(o) => !o && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.invActionDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.invActionDeleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.invBack}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              {t.invActionDeleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface RecordsListProps {
  records: InventoryRecord[];
  allCount: number;
  warehouseLabel: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function RecordsList({
  records,
  allCount,
  warehouseLabel,
  onSelect,
  onDelete,
}: RecordsListProps) {
  const { t } = useApp();

  if (allCount === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
          <ClipboardList size={20} />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-white">
          {t.invSelectRecord}
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {t.invSelectHint}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
          {t.invDocList}
        </h3>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          {t.invShowing}: {records.length} / {allCount}
        </span>
      </div>

      {records.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
          {t.invNoRecords}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((r) => (
            <li
              key={r.id}
              className="group rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-indigo-500"
            >
              <button
                type="button"
                onClick={() => onSelect(r.id)}
                className="block w-full text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {r.docNumber}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE_CLS[r.status]}`}
                  >
                    {statusLabel(r.status, t)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {r.dateFrom ? formatDate(r.dateFrom) : '—'} →{' '}
                  {r.dateTo ? formatDate(r.dateTo) : '—'}
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {warehouseLabel}: {r.warehouseName} · {r.rows.length}{' '}
                  {t.invCardItems}
                </p>
              </button>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(r.id);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                  title={t.invActionDelete}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SelectedHeader({
  record,
  onBack,
  onStart,
  onPause,
  onFinish,
  onDelete,
}: {
  record: InventoryRecord;
  onBack: () => void;
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
  onDelete: () => void;
}) {
  const { t } = useApp();
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-5 print:bg-white print:shadow-none print:border-slate-300">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 print:hidden"
          title={t.invBack}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.invCardDocNumber}
          </p>
          <p className="text-base font-bold text-slate-800 dark:text-white">
            {record.docNumber}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {t.invCardDate}: {record.dateFrom || '—'} → {record.dateTo || '—'}
            </span>
            <span>
              {t.invCardWarehouse}: {record.warehouseName}
            </span>
            <span>
              {record.rows.length} {t.invCardItems}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {record.status === 'NOT_STARTED' && (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-amber-500 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 sm:text-sm"
          >
            <Play size={13} /> {t.invActionStart}
          </button>
        )}
        {record.status === 'IN_PROGRESS' && (
          <>
            <button
              type="button"
              onClick={onPause}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:text-sm"
            >
              <Pause size={13} />
              {t.invStatusNotStarted}
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:text-sm"
            >
              <CheckCircle2 size={13} /> {t.invActionFinish}
            </button>
          </>
        )}
        {record.status === 'COMPLETED' && (
          <span className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 sm:text-sm">
            <CheckCircle2 size={13} />{' '}
            {record.finishedAt
              ? `${t.invFinishedAt}: ${formatDate(record.finishedAt.slice(0, 10))}`
              : t.invStatusCompleted}
          </span>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-900/20 sm:text-sm"
          title={t.invActionDelete}
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">{t.invActionDelete}</span>
        </button>
      </div>
    </section>
  );
}

interface CreateInventoryDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  nextNumber: string;
  warehouses: InventoryWarehouseOption[];
  onSubmit: (values: CreateDialogValues) => void;
}

function CreateInventoryDialog({
  open,
  onOpenChange,
  nextNumber,
  warehouses,
  onSubmit,
}: CreateInventoryDialogProps) {
  const { t } = useApp();
  const [docNumber, setDocNumber] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? 'main');
  const [dateFrom, setDateFrom] = useState(TODAY);
  const [dateTo, setDateTo] = useState(TODAY);

  useEffect(() => {
    if (open) {
      setDocNumber(nextNumber);
      setWarehouseId(warehouses[0]?.id ?? 'main');
      setDateFrom(TODAY);
      setDateTo(TODAY);
    }
  }, [nextNumber, open, warehouses]);

  const submit = () => {
    onSubmit({
      docNumber: docNumber.trim() || nextNumber,
      warehouseId,
      dateFrom,
      dateTo,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <ClipboardList size={18} className="text-indigo-500" />
            {t.invCreateNew}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {t.invSubtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t.invFilterDocNumber}
            </label>
            <input
              type="text"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder={t.invDocNumberPlaceholder}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600 px-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t.invFilterWarehouse}
            </label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger className="h-10 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t.invFilterDateFrom}
              </label>
              <SingleDatePicker
                value={dateFrom}
                onChange={setDateFrom}
                placeholder={t.invFilterDateFrom}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t.invFilterDateTo}
              </label>
              <SingleDatePicker
                value={dateTo}
                onChange={setDateTo}
                placeholder={t.invFilterDateTo}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {t.invBack}
          </button>
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-transform hover:from-indigo-600 hover:to-blue-700 active:scale-[0.98]"
          >
            <Plus size={14} />
            {t.invCreateNew}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
