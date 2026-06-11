import React from 'react';
import type { RawMaterialKind } from '../store/erp-store';
import { formatDate, formatKgAmount, formatRawMaterialMovementQty } from '../utils/format';

export type RawMaterialMovementHistoryEntry = {
  id: string;
  date: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  description: string;
  rawMaterialName: string;
  materialKind?: RawMaterialKind;
};

type Labels = {
  colNum: string;
  colDate: string;
  colType: string;
  colProduct: string;
  colAmount: string;
  colNote: string;
  incoming: string;
  outgoing: string;
  kindSiro: string;
  kindPaint: string;
  unitKg: string;
  balance: string;
  metricsSiro: string;
  metricsPaint: string;
  empty: string;
};

type FooterTotals = {
  balanceKg: number;
  siroKg: number;
  paintKg: number;
  lowStock: boolean;
};

type Props = {
  entries: RawMaterialMovementHistoryEntry[];
  labels: Labels;
  footer: FooterTotals;
};

function movementBadgeClass(incoming: boolean) {
  return incoming
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200';
}

function kindBadgeClass(kind: RawMaterialKind | undefined) {
  return kind === 'PAINT'
    ? 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200'
    : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200';
}

export function RawMaterialMovementHistoryTable({ entries, labels, footer }: Props) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        {labels.empty}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-900/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800">
              {[
                labels.colNum,
                labels.colDate,
                labels.colType,
                labels.colProduct,
                labels.colAmount,
                labels.colNote,
              ].map((heading, i) => (
                <th
                  key={heading}
                  className={`whitespace-nowrap px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 ${
                    i === 4 ? 'text-right' : ''
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const isIncoming = entry.type === 'incoming';
              const qty = formatRawMaterialMovementQty(entry.amount);
              const unitLabel = qty.unit === 'g' ? 'g' : labels.unitKg;
              const amountCls = isIncoming
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-orange-700 dark:text-orange-300';
              const kindLabel =
                entry.materialKind === 'PAINT' ? labels.kindPaint : labels.kindSiro;

              return (
                <tr
                  key={entry.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:bg-indigo-950/20 ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-slate-900/20'
                      : 'bg-slate-50/80 dark:bg-slate-800/30'
                  }`}
                >
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-slate-500">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700 dark:text-slate-200">
                    {formatDate(entry.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${movementBadgeClass(isIncoming)}`}
                    >
                      {isIncoming ? labels.incoming : labels.outgoing}
                    </span>
                  </td>
                  <td className="min-w-[12rem] px-3 py-2.5">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {entry.rawMaterialName}
                    </div>
                    {entry.materialKind ? (
                      <span
                        className={`mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${kindBadgeClass(entry.materialKind)}`}
                      >
                        {kindLabel}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 text-right text-sm font-bold tabular-nums ${amountCls}`}
                  >
                    {isIncoming ? '+' : '−'}
                    {qty.amount}{' '}
                    <span className="text-xs font-normal opacity-80">{unitLabel}</span>
                  </td>
                  <td className="max-w-[16rem] px-3 py-2.5 text-xs leading-snug text-slate-600 dark:text-slate-300">
                    {entry.description.trim() || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-indigo-200 bg-gradient-to-r from-emerald-50 to-indigo-50 dark:border-indigo-900 dark:from-emerald-950/30 dark:to-indigo-950/30">
              <td colSpan={4} className="px-3 py-3 text-sm font-bold text-slate-800 dark:text-white">
                {labels.balance}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-right">
                <span
                  className={`text-sm font-bold tabular-nums ${
                    footer.lowStock ? 'text-amber-600' : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {formatKgAmount(footer.balanceKg)} {labels.unitKg}
                </span>
                <div className="mt-0.5 text-[10px] font-normal text-slate-500 dark:text-slate-400">
                  {labels.metricsSiro}: {formatKgAmount(footer.siroKg)} · {labels.metricsPaint}:{' '}
                  {formatKgAmount(footer.paintKg)}
                </div>
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
