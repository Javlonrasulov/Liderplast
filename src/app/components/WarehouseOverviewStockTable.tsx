import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
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
  spec?: string;
  salePrice: string;
  salePriceUzs?: string;
  salePriceFx?: string;
  totalUzs: string;
  totalUsd: string;
  fillPct: number;
  profitCostLines: string[];
  profitSaleLine?: string;
  profitLine?: string;
  profitSemiAddonLines?: string[];
  profitTotalLine?: string;
  profitPerPieceUzs: number | null;
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
  colProfit: string;
  colTotalUzs: string;
  colTotalUsd: string;
  colFill: string;
  grandTotal: string;
  empty: string;
  fullscreenEnter: string;
  fullscreenExit: string;
  showProfitLabel: string;
  includeSemiProfitLabel: string;
};

type Props = {
  rows: WarehouseOverviewStockRow[];
  labels: Labels;
  totalQty: number;
  totalUzs: string;
  totalUsd: string;
  totalProfit: string;
  unit: string;
  showSpecColumn?: boolean;
  showProfit: boolean;
  includeSemiProfit: boolean;
  showSemiProfitToggle?: boolean;
  onShowProfitChange: (value: boolean) => void;
  onIncludeSemiProfitChange: (value: boolean) => void;
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

export function WarehouseOverviewStockTable({
  rows,
  labels,
  totalQty,
  totalUzs,
  totalUsd,
  totalProfit,
  unit,
  showSpecColumn = true,
  showProfit,
  includeSemiProfit,
  showSemiProfitToggle = false,
  onShowProfitChange,
  onIncludeSemiProfitChange,
}: Props) {
  const middleColSpan = showProfit
    ? showSpecColumn
      ? 4
      : 3
    : showSpecColumn
      ? 5
      : 4;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else {
          const wk = (el as HTMLElement & { webkitRequestFullscreen?: () => void })
            .webkitRequestFullscreen;
          if (wk) wk.call(el);
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else {
        const doc = document as Document & { webkitExitFullscreen?: () => void };
        doc.webkitExitFullscreen?.();
      }
    } catch {
      /* fullscreen declined or unsupported */
    }
  }, []);

  function profitClass(value: number | null) {
    if (value == null) return 'text-slate-500';
    if (value < 0) return 'text-red-700 dark:text-red-400';
    if (value === 0) return 'text-slate-600 dark:text-slate-300';
    return 'text-violet-700 dark:text-violet-300';
  }
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        {labels.empty}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-900/40 ${
        isFullscreen ? 'flex h-full flex-col p-4' : ''
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-600 dark:bg-slate-800/60">
            <Checkbox
              id="wh-overview-show-profit"
              checked={showProfit}
              onCheckedChange={(checked) => onShowProfitChange(checked === true)}
            />
            <Label
              htmlFor="wh-overview-show-profit"
              className="cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              {labels.colProfit}
            </Label>
          </div>
          {showSemiProfitToggle ? (
            <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 dark:border-violet-800 dark:bg-violet-950/40">
              <Checkbox
                id="wh-overview-include-semi-profit"
                checked={includeSemiProfit}
                disabled={!showProfit}
                onCheckedChange={(checked) =>
                  onIncludeSemiProfitChange(checked === true)
                }
              />
              <Label
                htmlFor="wh-overview-include-semi-profit"
                className={`cursor-pointer text-xs font-semibold ${
                  showProfit
                    ? 'text-violet-800 dark:text-violet-200'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {labels.includeSemiProfitLabel}
              </Label>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? labels.fullscreenExit : labels.fullscreenEnter}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {isFullscreen ? labels.fullscreenExit : labels.fullscreenEnter}
        </button>
      </div>
      <div className={`overflow-x-auto ${isFullscreen ? 'min-h-0 flex-1' : ''}`}>
        <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800">
              {[
                labels.colNum,
                labels.colType,
                labels.colName,
                labels.colStock,
                labels.colPack,
                labels.colPiecesPerBag,
                ...(showSpecColumn ? [labels.colSpec] : []),
                labels.colSalePrice,
                ...(showProfit ? [labels.colProfit] : []),
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
                {showSpecColumn ? (
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700 dark:text-slate-200">
                    {row.spec ?? '—'}
                  </td>
                ) : null}
                <td className="min-w-[8rem] px-3 py-2.5 text-slate-700 dark:text-slate-200">
                  <div className="font-semibold whitespace-nowrap">{row.salePrice}</div>
                  {row.salePriceUzs ? (
                    <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {row.salePriceUzs}
                    </div>
                  ) : null}
                  {row.salePriceFx ? (
                    <div className="mt-0.5 text-[10px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                      {row.salePriceFx}
                    </div>
                  ) : null}
                </td>
                {showProfit ? (
                  <td className="min-w-[11rem] max-w-[16rem] px-3 py-2.5">
                    {row.profitCostLines.map((line) => (
                      <div
                        key={line}
                        className="text-[10px] leading-snug text-slate-600 dark:text-slate-400"
                      >
                        {line}
                      </div>
                    ))}
                    {row.profitSaleLine ? (
                      <div className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                        {row.profitSaleLine}
                      </div>
                    ) : null}
                    {row.profitLine ? (
                      <div
                        className={`mt-1 text-sm font-extrabold tracking-tight ${profitClass(row.profitPerPieceUzs)}`}
                      >
                        {row.profitLine}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">—</div>
                    )}
                    {row.profitSemiAddonLines?.map((line) => (
                      <div
                        key={line}
                        className="mt-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300"
                      >
                        {line}
                      </div>
                    ))}
                    {row.profitTotalLine ? (
                      <div
                        className={`mt-1 border-t border-slate-200 pt-1 text-sm font-extrabold tracking-tight dark:border-slate-700 ${profitClass(row.profitPerPieceUzs)}`}
                      >
                        {row.profitTotalLine}
                      </div>
                    ) : null}
                  </td>
                ) : null}
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
              <td colSpan={middleColSpan} />
              {showProfit ? (
                <td className="whitespace-nowrap px-3 py-3 text-sm font-extrabold text-violet-700 dark:text-violet-300">
                  {totalProfit}
                </td>
              ) : null}
              <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {totalUzs}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-blue-700 dark:text-blue-400">
                {totalUsd}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
