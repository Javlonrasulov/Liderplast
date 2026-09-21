import { useMemo, useState } from 'react';
import { Check, ChevronDown, Filter, RotateCcw, X } from 'lucide-react';
import { useApp } from '../i18n/app-context';
import { SingleDatePicker } from './SingleDatePicker';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type {
  SaleHistoryFilterValue,
  SaleHistoryPaymentFilter,
} from '../utils/sale-history-filters';

type ClientOption = { id: string; name: string };

type Props = {
  value: SaleHistoryFilterValue;
  onChange: (next: SaleHistoryFilterValue) => void;
  onClear: () => void;
  productOptions: string[];
  /** Sales.tsx da ko‘rsatiladi; ClientDetail da berilmasin */
  clientOptions?: ClientOption[];
};

const TRIGGER_CLS =
  'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80';

const SELECT_TRIGGER_CLS =
  'h-10 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200';

function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function MultiSelectDropdown({
  label,
  allLabel,
  selectedLabel,
  options,
  selected,
  onChange,
}: {
  label: string;
  allLabel: string;
  selectedLabel: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const triggerText =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? selectedLabel
        : selectedLabel.replace('{n}', String(selected.length));

  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={TRIGGER_CLS}>
            <span className="min-w-0 truncate">{triggerText}</span>
            <span className="flex shrink-0 items-center gap-1">
              {selected.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange([]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange([]);
                    }
                  }}
                >
                  <X size={12} />
                </span>
              )}
              <ChevronDown size={14} className="text-slate-400" />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[120] w-[var(--radix-popover-trigger-width)] min-w-[220px] max-w-sm p-1"
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => onChange([])}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-300 dark:border-slate-600">
              {selected.length === 0 ? <Check size={12} className="text-indigo-600" /> : null}
            </span>
            {allLabel}
          </button>
          <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => {
              const checked = selectedSet.has(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => onChange(toggleInList(selected, opt.value))}
                >
                  <Checkbox checked={checked} className="pointer-events-none" />
                  <span className="min-w-0 truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function SaleHistoryFilters({
  value,
  onChange,
  onClear,
  productOptions,
  clientOptions,
}: Props) {
  const { t } = useApp();
  const showClient = Boolean(clientOptions);

  const paymentItems: Array<{ value: SaleHistoryPaymentFilter; label: string }> = [
    { value: 'all', label: t.slFilterPaymentAll },
    { value: 'paid', label: t.slFilterPaymentPaid },
    { value: 'debt', label: t.slFilterPaymentDebt },
  ];

  const clientSelectOptions = useMemo(
    () => (clientOptions ?? []).map((c) => ({ value: c.id, label: c.name })),
    [clientOptions],
  );
  const productSelectOptions = useMemo(
    () => productOptions.map((name) => ({ value: name, label: name })),
    [productOptions],
  );

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-800/80 sm:px-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
          <Filter size={14} />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{t.slFilterTitle}</h4>
      </div>

      <div
        className={`grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 ${
          showClient ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
        }`}
      >
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.slFilterDateFrom}
          </label>
          <SingleDatePicker
            value={value.dateFrom}
            onChange={(d) => onChange({ ...value, dateFrom: d })}
            placeholder={t.slFilterDateFrom}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.slFilterDateTo}
          </label>
          <SingleDatePicker
            value={value.dateTo}
            onChange={(d) => onChange({ ...value, dateTo: d })}
            placeholder={t.slFilterDateTo}
          />
        </div>

        {showClient && (
          <MultiSelectDropdown
            label={t.slFilterClient}
            allLabel={t.slFilterClientAll}
            selectedLabel={t.slFilterSelectedCount}
            options={clientSelectOptions}
            selected={value.clientIds}
            onChange={(clientIds) => onChange({ ...value, clientIds })}
          />
        )}

        <MultiSelectDropdown
          label={t.slFilterProduct}
          allLabel={t.slFilterProductAll}
          selectedLabel={t.slFilterSelectedCount}
          options={productSelectOptions}
          selected={value.products}
          onChange={(products) => onChange({ ...value, products })}
        />

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.slFilterPayment}
          </label>
          <Select
            value={value.payment}
            onValueChange={(v) =>
              onChange({ ...value, payment: v as SaleHistoryPaymentFilter })
            }
          >
            <SelectTrigger className={SELECT_TRIGGER_CLS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentItems.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RotateCcw size={13} />
          {t.slFilterClear}
        </button>
      </div>
    </section>
  );
}
