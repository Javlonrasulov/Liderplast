import React, { useState } from 'react';
import { useApp } from '../../i18n/app-context';
import { formatNumber } from '../../utils/format';
import type { InventoryRecord, InventoryRow } from './types';

interface InventoryTableProps {
  record: InventoryRecord;
  editable: boolean;
  onChangeRow: (productId: string, patch: Partial<InventoryRow>) => void;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (n === 0) return '0';
  if (Number.isInteger(n)) return formatNumber(n);
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(n);
}

function diffClass(diff: number): string {
  if (diff < 0) return 'text-red-600 dark:text-red-400 font-semibold';
  if (diff > 0) return 'text-emerald-600 dark:text-emerald-400 font-semibold';
  return 'text-slate-500 dark:text-slate-400';
}

/**
 * `type="number"` + value 0: нолни ўчириб бўлмайди, «050» каби артефактлар.
 * Фокусда 0 → бўш сатр; blur да рақамга яхлитлаймиз.
 */
function InventoryEditableQtyInput({
  quantity,
  onCommit,
  className,
}: {
  quantity: number;
  onCommit: (n: number) => void;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState('');

  const displayQty = Number.isFinite(quantity) ? quantity : 0;
  const shownValue = focused ? text : String(displayQty);

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={shownValue}
      onFocus={() => {
        setFocused(true);
        setText(displayQty === 0 ? '' : String(displayQty));
      }}
      onBlur={() => {
        const raw = text.trim().replace(/\s/g, '').replace(',', '.');
        let n = 0;
        if (raw !== '' && raw !== '.' && raw !== '-') {
          const parsed = Number(raw);
          if (Number.isFinite(parsed) && parsed >= 0) n = parsed;
        }
        onCommit(n);
        setFocused(false);
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/\s/g, '').replace(',', '.');
        if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
          setText(raw);
        }
      }}
      className={className}
    />
  );
}

function categoryBadge(
  category: InventoryRow['category'],
  t: ReturnType<typeof useApp>['t'],
): { label: string; cls: string } {
  if (category === 'RAW_MATERIAL') {
    return {
      label: t.invCategoryRaw,
      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    };
  }
  if (category === 'SEMI_PRODUCT') {
    return {
      label: t.invCategorySemi,
      cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    };
  }
  return {
    label: t.invCategoryFinished,
    cls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  };
}

export function InventoryTable({
  record,
  editable,
  onChangeRow,
}: InventoryTableProps) {
  const { t } = useApp();
  const { rows, dateFrom, dateTo } = record;

  const totals = rows.reduce(
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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t.invFilterRangeLabel}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-white">
          {dateFrom || '—'} &nbsp;→&nbsp; {dateTo || '—'}
        </p>
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 lg:hidden">
          {t.invMobileSwipeHint}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/40">
              <th
                rowSpan={2}
                className="border-b border-r border-slate-200 px-2 py-2 text-center font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300 w-12"
              >
                {t.invColIndex}
              </th>
              <th
                rowSpan={2}
                className="border-b border-r border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300 min-w-[180px]"
              >
                {t.invColProduct}
              </th>
              <th
                colSpan={2}
                className="border-b border-r border-slate-200 px-2 py-2 text-center font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                <div>
                  <p className="leading-tight">{t.invColPeriodStart}</p>
                  <p className="text-[10px] font-normal text-slate-400">
                    {dateFrom || '—'}
                  </p>
                </div>
              </th>
              <th
                colSpan={2}
                className="border-b border-r border-slate-200 px-2 py-2 text-center font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                {t.invColPeriodTurnover}
              </th>
              <th
                colSpan={3}
                className="border-b border-slate-200 px-2 py-2 text-center font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                <div>
                  <p className="leading-tight">{t.invColPeriodEnd}</p>
                  <p className="text-[10px] font-normal text-slate-400">
                    {dateTo || '—'}
                  </p>
                </div>
              </th>
            </tr>
            <tr className="bg-slate-50 dark:bg-slate-900/40 text-[11px] uppercase tracking-wide">
              <th className="border-b border-r border-slate-200 px-2 py-1.5 text-right font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {t.invColSystem}
              </th>
              <th className="border-b border-r border-slate-200 px-2 py-1.5 text-right font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {t.invColReal}
              </th>
              <th className="border-b border-r border-slate-200 px-2 py-1.5 text-right font-semibold text-emerald-600 dark:border-slate-700 dark:text-emerald-400">
                {t.invColIncoming}
              </th>
              <th className="border-b border-r border-slate-200 px-2 py-1.5 text-right font-semibold text-rose-600 dark:border-slate-700 dark:text-rose-400">
                {t.invColOutgoing}
              </th>
              <th className="border-b border-r border-slate-200 px-2 py-1.5 text-right font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {t.invColSystem}
              </th>
              <th className="border-b border-r border-slate-200 px-2 py-1.5 text-right font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {t.invColReal}
              </th>
              <th className="border-b border-slate-200 px-2 py-1.5 text-right font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {t.invColDifference}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-8 text-center text-sm text-slate-400 dark:text-slate-500"
                >
                  {t.invEmptyCatalog}
                </td>
              </tr>
            )}

            {rows.map((row, idx) => {
              const diff = row.realQuantityEnd - row.systemQuantityEnd;
              const badge = categoryBadge(row.category, t);
              const unitLabel = row.unit === 'kg' ? t.invUnitKg : t.invUnitPiece;

              return (
                <tr
                  key={row.productId}
                  className="even:bg-slate-50/40 dark:even:bg-slate-900/20 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors"
                >
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-mono text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="border-b border-r border-slate-200 px-3 py-2 dark:border-slate-700">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-white">
                          {row.productName}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {unitLabel}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-right tabular-nums text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    {fmt(row.systemQuantityStart)}
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-right tabular-nums dark:border-slate-700">
                    {editable ? (
                      <InventoryEditableQtyInput
                        quantity={row.realQuantityStart}
                        onCommit={(n) =>
                          onChangeRow(row.productId, {
                            realQuantityStart: n,
                          })
                        }
                        className="h-8 w-24 rounded-md border border-slate-200 bg-white px-2 text-right tabular-nums text-slate-800 focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      />
                    ) : (
                      <span className="text-slate-700 dark:text-slate-200">
                        {fmt(row.realQuantityStart)}
                      </span>
                    )}
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-right tabular-nums dark:border-slate-700">
                    {editable ? (
                      <InventoryEditableQtyInput
                        quantity={row.income}
                        onCommit={(n) =>
                          onChangeRow(row.productId, { income: n })
                        }
                        className="h-8 w-20 rounded-md border border-emerald-200 bg-emerald-50/40 px-2 text-right tabular-nums text-emerald-700 focus:border-emerald-400 focus:outline-none dark:border-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-300"
                      />
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {fmt(row.income)}
                      </span>
                    )}
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-right tabular-nums dark:border-slate-700">
                    {editable ? (
                      <InventoryEditableQtyInput
                        quantity={row.expense}
                        onCommit={(n) =>
                          onChangeRow(row.productId, { expense: n })
                        }
                        className="h-8 w-20 rounded-md border border-rose-200 bg-rose-50/40 px-2 text-right tabular-nums text-rose-700 focus:border-rose-400 focus:outline-none dark:border-rose-700 dark:bg-rose-900/10 dark:text-rose-300"
                      />
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">
                        {fmt(row.expense)}
                      </span>
                    )}
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-right tabular-nums text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    {fmt(row.systemQuantityEnd)}
                  </td>
                  <td className="border-b border-r border-slate-200 px-2 py-2 text-right tabular-nums dark:border-slate-700">
                    {editable ? (
                      <InventoryEditableQtyInput
                        quantity={row.realQuantityEnd}
                        onCommit={(n) =>
                          onChangeRow(row.productId, {
                            realQuantityEnd: n,
                          })
                        }
                        className="h-8 w-24 rounded-md border border-slate-200 bg-white px-2 text-right tabular-nums text-slate-800 focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      />
                    ) : (
                      <span className="text-slate-700 dark:text-slate-200">
                        {fmt(row.realQuantityEnd)}
                      </span>
                    )}
                  </td>
                  <td
                    className={`border-b border-slate-200 px-2 py-2 text-right tabular-nums dark:border-slate-700 ${diffClass(diff)}`}
                  >
                    {diff > 0 ? '+' : ''}
                    {fmt(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-indigo-50/70 dark:bg-indigo-900/30">
                <td
                  colSpan={2}
                  className="border-t-2 border-indigo-200 px-3 py-2 text-left font-bold uppercase tracking-wide text-indigo-700 dark:border-indigo-700 dark:text-indigo-300"
                >
                  {t.invFooterTotal}
                </td>
                <td className="border-t-2 border-r border-indigo-200 px-2 py-2 text-right tabular-nums font-bold text-slate-800 dark:border-indigo-700 dark:text-white">
                  {fmt(totals.systemStart)}
                </td>
                <td className="border-t-2 border-r border-indigo-200 px-2 py-2 text-right tabular-nums font-bold text-slate-800 dark:border-indigo-700 dark:text-white">
                  {fmt(totals.realStart)}
                </td>
                <td className="border-t-2 border-r border-indigo-200 px-2 py-2 text-right tabular-nums font-bold text-emerald-700 dark:border-indigo-700 dark:text-emerald-400">
                  {fmt(totals.income)}
                </td>
                <td className="border-t-2 border-r border-indigo-200 px-2 py-2 text-right tabular-nums font-bold text-rose-700 dark:border-indigo-700 dark:text-rose-400">
                  {fmt(totals.expense)}
                </td>
                <td className="border-t-2 border-r border-indigo-200 px-2 py-2 text-right tabular-nums font-bold text-slate-800 dark:border-indigo-700 dark:text-white">
                  {fmt(totals.systemEnd)}
                </td>
                <td className="border-t-2 border-r border-indigo-200 px-2 py-2 text-right tabular-nums font-bold text-slate-800 dark:border-indigo-700 dark:text-white">
                  {fmt(totals.realEnd)}
                </td>
                <td
                  className={`border-t-2 border-indigo-200 px-2 py-2 text-right tabular-nums font-bold dark:border-indigo-700 ${diffClass(totalDiff)}`}
                >
                  {totalDiff > 0 ? '+' : ''}
                  {fmt(totalDiff)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}
