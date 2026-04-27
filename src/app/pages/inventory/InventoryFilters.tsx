import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { useApp } from '../../i18n/app-context';
import { SingleDatePicker } from '../../components/SingleDatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import type {
  InventoryFilterValue,
  InventoryStatus,
  InventoryWarehouseOption,
} from './types';

interface InventoryFiltersProps {
  value: InventoryFilterValue;
  onChange: (next: InventoryFilterValue) => void;
  onApply: () => void;
  onReset: () => void;
  warehouses: InventoryWarehouseOption[];
}

const SELECT_TRIGGER_CLS =
  'h-10 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200';

const INPUT_CLS =
  'h-10 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600 px-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400';

export function InventoryFilters({
  value,
  onChange,
  onApply,
  onReset,
  warehouses,
}: InventoryFiltersProps) {
  const { t } = useApp();

  const statusItems: Array<{ value: InventoryStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: t.invFilterStatusAll },
    { value: 'NOT_STARTED', label: t.invStatusNotStarted },
    { value: 'IN_PROGRESS', label: t.invStatusInProgress },
    { value: 'COMPLETED', label: t.invStatusCompleted },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
          <Filter size={15} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
          {t.invFilterTitle}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.invFilterDateFrom}
          </label>
          <SingleDatePicker
            value={value.dateFrom}
            onChange={(d) => onChange({ ...value, dateFrom: d })}
            placeholder={t.invFilterDateFrom}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.invFilterDateTo}
          </label>
          <SingleDatePicker
            value={value.dateTo}
            onChange={(d) => onChange({ ...value, dateTo: d })}
            placeholder={t.invFilterDateTo}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.invFilterWarehouse}
          </label>
          <Select
            value={value.warehouseId || 'all'}
            onValueChange={(v) =>
              onChange({ ...value, warehouseId: v === 'all' ? '' : v })
            }
          >
            <SelectTrigger className={SELECT_TRIGGER_CLS}>
              <SelectValue placeholder={t.invFilterStatusAll} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.invFilterStatusAll}</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.invFilterStatus}
          </label>
          <Select
            value={value.status}
            onValueChange={(v) =>
              onChange({ ...value, status: v as InventoryStatus | 'ALL' })
            }
          >
            <SelectTrigger className={SELECT_TRIGGER_CLS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusItems.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.invFilterDocNumber}
          </label>
          <input
            type="text"
            className={INPUT_CLS}
            value={value.docNumber}
            onChange={(e) => onChange({ ...value, docNumber: e.target.value })}
            placeholder={t.invDocNumberPlaceholder}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RotateCcw size={14} />
          {t.invFilterReset}
        </button>
        <button
          type="button"
          onClick={onApply}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-transform hover:from-indigo-600 hover:to-blue-700 active:scale-[0.98]"
        >
          <Search size={14} />
          {t.invFilterApply}
        </button>
      </div>
    </section>
  );
}
