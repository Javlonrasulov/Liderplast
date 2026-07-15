import React from 'react';
import { AlertTriangle, Maximize2, Pencil, Trash2 } from 'lucide-react';
import type { RawMaterialKind } from '../store/erp-store';
import { formatKgAmount, formatNumber } from '../utils/format';
import { Button } from './ui/button';

export type RawMaterialOverviewStockRow = {
  id: string;
  kind: RawMaterialKind;
  typeLabel: string;
  name: string;
  description?: string;
  quantityKg: number;
  defaultBagWeight: string;
  purchasePrice: string;
  purchasePriceUzs?: string;
  purchasePriceFx?: string;
  totalUzs: string;
  totalUsd: string;
  fillPct: number;
  lowStock: boolean;
};

type Labels = {
  colNum: string;
  colType: string;
  colName: string;
  colStock: string;
  colBagWeight: string;
  colPurchasePrice: string;
  colTotalUzs: string;
  colTotalUsd: string;
  colFill: string;
  unitKg: string;
  grandTotal: string;
  empty: string;
  edit: string;
  delete: string;
};

type Props = {
  rows: RawMaterialOverviewStockRow[];
  labels: Labels;
  totalKg: number;
  footerTotals: { totalUzs: string; totalUsd: string };
  canManage?: boolean;
  canDelete?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEnterFullscreen?: () => void;
  fullscreenEnterLabel?: string;
};

function fillBadgeClass(pct: number) {
  if (pct < 20) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  if (pct < 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
}

function kindBadgeClass(kind: RawMaterialKind) {
  if (kind === 'PAINT') {
    return 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200';
  }
  if (kind === 'PACKAGE') {
    return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200';
  }
  return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200';
}

export function RawMaterialOverviewStockTable({
  rows,
  labels,
  totalKg,
  footerTotals,
  canManage = false,
  canDelete = false,
  onEdit,
  onDelete,
  onEnterFullscreen,
  fullscreenEnterLabel,
}: Props) {
  const showActions = (canManage || canDelete) && (onEdit || onDelete);

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        {labels.empty}
      </p>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-900/40">
      {onEnterFullscreen ? (
        <button
          type="button"
          onClick={onEnterFullscreen}
          title={fullscreenEnterLabel}
          aria-label={fullscreenEnterLabel}
          className="absolute right-3 top-3 z-10 rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <Maximize2 size={18} />
        </button>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800">
              {[
                labels.colNum,
                labels.colType,
                labels.colName,
                labels.colStock,
                labels.colBagWeight,
                labels.colPurchasePrice,
                labels.colTotalUzs,
                labels.colTotalUsd,
                labels.colFill,
                ...(showActions ? [''] : []),
              ].map((heading, i) => (
                <th
                  key={`${heading}-${i}`}
                  className="whitespace-nowrap px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-slate-100 transition-colors hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:bg-indigo-950/20 ${
                  index % 2 === 0
                    ? 'bg-white dark:bg-slate-900/20'
                    : 'bg-slate-50/80 dark:bg-slate-800/30'
                } ${row.lowStock ? 'ring-1 ring-inset ring-amber-200/80 dark:ring-amber-800/40' : ''}`}
              >
                <td className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-slate-500">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${kindBadgeClass(row.kind)}`}
                  >
                    {row.typeLabel}
                  </span>
                </td>
                <td className="min-w-[12rem] px-3 py-2.5">
                  <div className="font-semibold text-slate-900 dark:text-white">{row.name}</div>
                  {row.description ? (
                    <div className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {row.description}
                    </div>
                  ) : null}
                  {row.lowStock ? (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      <AlertTriangle size={10} />
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                  {formatKgAmount(row.quantityKg)}{' '}
                  <span className="text-xs font-normal text-slate-500">{labels.unitKg}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-700 dark:text-slate-200">
                  {row.defaultBagWeight}
                </td>
                <td className="min-w-[8rem] px-3 py-2.5 text-slate-700 dark:text-slate-200">
                  <div className="font-semibold whitespace-nowrap">{row.purchasePrice}</div>
                  {row.purchasePriceUzs ? (
                    <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {row.purchasePriceUzs}
                    </div>
                  ) : null}
                  {row.purchasePriceFx ? (
                    <div className="mt-0.5 text-[10px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                      {row.purchasePriceFx}
                    </div>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  {row.totalUzs}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-blue-700 dark:text-blue-400">
                  {row.totalUsd}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span
                    className={`inline-flex min-w-[2.5rem] justify-center rounded-md px-2 py-0.5 text-xs font-bold ${fillBadgeClass(row.fillPct)}`}
                  >
                    {row.fillPct.toFixed(0)}%
                  </span>
                </td>
                {showActions ? (
                  <td className="whitespace-nowrap px-2 py-2.5">
                    <div className="flex items-center gap-1">
                      {canManage && onEdit ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(row.id)}
                          aria-label={labels.edit}
                        >
                          <Pencil size={14} />
                        </Button>
                      ) : null}
                      {canDelete && onDelete ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDelete(row.id)}
                          aria-label={labels.delete}
                        >
                          <Trash2 size={14} />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-indigo-200 bg-gradient-to-r from-emerald-50 to-indigo-50 dark:border-indigo-900 dark:from-emerald-950/30 dark:to-indigo-950/30">
              <td colSpan={3} className="px-3 py-3 text-sm font-bold text-slate-800 dark:text-white">
                {labels.grandTotal}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-slate-900 dark:text-white">
                {formatKgAmount(totalKg)} {labels.unitKg}
              </td>
              <td colSpan={2} />
              <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {footerTotals.totalUzs}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-blue-700 dark:text-blue-400">
                {footerTotals.totalUsd}
              </td>
              <td colSpan={showActions ? 2 : 1} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
