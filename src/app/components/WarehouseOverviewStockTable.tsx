import React from 'react';
import { formatNumber } from '../utils/format';

export type WarehouseOverviewStockRow = {
  id: string;
  kind: 'SEMI_PRODUCT' | 'FINISHED_PRODUCT';
  typeLabel: string;
  name: string;
  quantity: number;
  unit: string;
  packSummary: string;
  piecesPerBag: string;
  spec: string;
  salePrice: string;
  totalUzs: string;
  totalUsd: string;
  fillPct: number;
};

type Labels = {
  colNum: string;
  colType: string;
  colName: string;
  colStock: string;
  colPack: string;
  colPiecesPerBag: string;
  colSpec: string;
  colSalePrice: string;
  colTotalUzs: string;
  colTotalUsd: string;
  colFill: string;
  grandTotal: string;
  empty: string;
};

type Props = {
  rows: WarehouseOverviewStockRow[];
  labels: Labels;
  totalQty: number;
  unit: string;
};

function fillBadgeClass(pct: number) {
  if (pct < 20) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  if (pct < 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
}

function typeBadgeClass(kind: WarehouseOverviewStockRow['kind']) {
  return kind === 'SEMI_PRODUCT'
    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200'
    : 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200';
}

export function WarehouseOverviewStockTable({ rows, labels, totalQty, unit }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        {labels.empty}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-900/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800">
              {[
                labels.colNum,
                labels.colType,
                labels.colName,
                labels.colStock,
                labels.colPack,
                labels.colPiecesPerBag,
                labels.colSpec,
                labels.colSalePrice,
                labels.colTotalUzs,
                labels.colTotalUsd,
                labels.colFill,
              ].map((heading) => (
                <th
                  key={heading}
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
                }`}
              >
                <td className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-slate-500">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${typeBadgeClass(row.kind)}`}
                  >
                    {row.typeLabel}
                  </span>
                </td>
                <td className="min-w-[12rem] px-3 py-2.5 font-semibold text-slate-900 dark:text-white">
                  {row.name}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                  {formatNumber(row.quantity)}{' '}
                  <span className="text-xs font-normal text-slate-500">{row.unit}</span>
                </td>
                <td className="min-w-[10rem] max-w-[18rem] px-3 py-2.5 text-xs leading-snug text-slate-600 dark:text-slate-300">
                  {row.packSummary || '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-700 dark:text-slate-200">
                  {row.piecesPerBag}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-700 dark:text-slate-200">
                  {row.spec}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-700 dark:text-slate-200">
                  {row.salePrice}
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
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-indigo-200 bg-gradient-to-r from-emerald-50 to-indigo-50 dark:border-indigo-900 dark:from-emerald-950/30 dark:to-indigo-950/30">
              <td colSpan={3} className="px-3 py-3 text-sm font-bold text-slate-800 dark:text-white">
                {labels.grandTotal}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-slate-900 dark:text-white">
                {formatNumber(totalQty)} {unit}
              </td>
              <td colSpan={7} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
