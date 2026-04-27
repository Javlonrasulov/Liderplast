import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatKgAmount, formatNumber, formatDateTime } from '../utils/format';
import { buildShiftOverConsumptionReport } from '../utils/shift-over-consumption';

const PCT_EPS = 0.05;

export function ProductionOverConsumption() {
  const { state } = useERP();
  const { t } = useApp();

  const { details, aggregates } = useMemo(
    () => buildShiftOverConsumptionReport(state.shiftRecords, state.machines),
    [state.shiftRecords, state.machines],
  );

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden p-3 min-[400px]:p-4 lg:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
            <TrendingUp size={22} className="shrink-0" />
            <h1 className="text-slate-900 dark:text-white text-lg min-[400px]:text-xl font-bold leading-tight">
              {t.poOverTitle}
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs min-[400px]:text-sm max-w-2xl">
            {t.poOverSubtitle}
          </p>
        </div>
        <Link
          to="/shifts"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
          {t.poOverBackToShift}
        </Link>
      </div>

      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
            {t.poOverAggTitle}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {t.poOverAggHint}
          </p>
        </div>
        {aggregates.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">{t.poOverEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/40 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="px-3 py-2.5">{t.poOverColProduct}</th>
                  <th className="px-3 py-2.5">{t.poOverColRaw}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColCases}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColSumExtra}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColAvgOverPct}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColMaxPct}</th>
                </tr>
              </thead>
              <tbody>
                {aggregates.map((row) => {
                  const avgPct =
                    row.totalExpectedKg > 1e-4
                      ? (row.totalDeltaKg / row.totalExpectedKg) * 100
                      : 0;
                  return (
                    <tr
                      key={row.key}
                      className="border-t border-slate-100 dark:border-slate-700/80 hover:bg-slate-50/60 dark:hover:bg-slate-700/20"
                    >
                      <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">
                        {row.productType || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{row.rawMaterialName}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(row.caseCount)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-amber-700 dark:text-amber-300">
                        +{formatKgAmount(row.totalDeltaKg)} kg
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                        {avgPct >= PCT_EPS ? `${avgPct.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400 font-medium">
                        {row.maxOverPct >= PCT_EPS ? `${row.maxOverPct.toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
            {t.poOverDetailTitle}
          </h2>
        </div>
        {details.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">{t.poOverEmpty}</p>
        ) : (
          <div className="overflow-x-auto max-h-[min(70vh,36rem)] overflow-y-auto">
            <table className="w-full text-xs min-[400px]:text-sm min-w-[900px]">
              <thead className="sticky top-0 z-[1] bg-slate-50 dark:bg-slate-700/90 backdrop-blur-sm">
                <tr className="text-left font-semibold text-slate-500 dark:text-slate-400">
                  <th className="px-3 py-2.5 whitespace-nowrap">{t.poOverColWhen}</th>
                  <th className="px-3 py-2.5">{t.poOverColWorker}</th>
                  <th className="px-3 py-2.5">{t.poOverColMachine}</th>
                  <th className="px-3 py-2.5">{t.poOverColProduct}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColGood}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColDefect}</th>
                  <th className="px-3 py-2.5">{t.poOverColRaw}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColPlanned}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColActual}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColExtra}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.poOverColOverPct}</th>
                </tr>
              </thead>
              <tbody>
                {details.map((d) => (
                  <tr
                    key={`${d.shiftId}-${d.rawMaterialId}`}
                    className="border-t border-slate-100 dark:border-slate-700/80 hover:bg-slate-50/50 dark:hover:bg-slate-700/15"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      <span className="block font-mono text-[11px]">{d.date}</span>
                      <span className="block text-[10px] text-slate-400">{formatDateTime(d.createdAt)}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-800 dark:text-slate-100">{d.workerName}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{d.machineName}</td>
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                      {d.productType || '—'}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(d.producedQty)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-red-600 dark:text-red-400">
                      {formatNumber(d.defectCount)}
                    </td>
                    <td className="px-3 py-2">{d.rawMaterialName}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-600 dark:text-slate-300">
                      {formatKgAmount(d.expectedKg)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatKgAmount(d.actualKg)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-amber-700 dark:text-amber-300">
                      +{formatKgAmount(d.deltaKg)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-rose-600 dark:text-rose-400 font-medium">
                      {d.overPct >= PCT_EPS ? `${d.overPct.toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
