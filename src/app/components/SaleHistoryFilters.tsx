import { Filter, RotateCcw } from 'lucide-react';
import { useApp } from '../i18n/app-context';
import { SingleDatePicker } from './SingleDatePicker';
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

const SELECT_TRIGGER_CLS =
  'h-10 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200';

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

        {showClient && clientOptions && (
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t.slFilterClient}
            </label>
            <Select
              value={value.clientId || '__all__'}
              onValueChange={(v) =>
                onChange({ ...value, clientId: v === '__all__' ? '' : v })
              }
            >
              <SelectTrigger className={SELECT_TRIGGER_CLS}>
                <SelectValue placeholder={t.slFilterClientAll} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__all__">{t.slFilterClientAll}</SelectItem>
                {clientOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.slFilterProduct}
          </label>
          <Select
            value={value.product || '__all__'}
            onValueChange={(v) =>
              onChange({ ...value, product: v === '__all__' ? '' : v })
            }
          >
            <SelectTrigger className={SELECT_TRIGGER_CLS}>
              <SelectValue placeholder={t.slFilterProductAll} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="__all__">{t.slFilterProductAll}</SelectItem>
              {productOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
