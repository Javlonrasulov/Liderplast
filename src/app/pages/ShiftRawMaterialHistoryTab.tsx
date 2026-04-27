import React, { useMemo } from 'react';
import { Droplets } from 'lucide-react';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatKgAmount, formatNumber, formatDateTime } from '../utils/format';
import { buildShiftRawMaterialHistory } from '../utils/shift-raw-material-history';

const PCT_EPS = 0.05;
const EPS = 1e-4;

export function ShiftRawMaterialHistoryTab() {
  const { state } = useERP();
  const { t } = useApp();

  const { details, aggregates } = useMemo(
    () => buildShiftRawMaterialHistory(state.shiftRecords, state.machines),
    [state.shiftRecords, state.machines],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/15 dark:bg-sky-500/20 flex items-center justify-center shrink-0 border border-sky-200/80 dark:border-sky-800/60">
          <Droplets size={20} className="text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm min-[400px]:text-base">
            {t.shiftRmHistTitle}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs min-[400px]:text-sm mt-1 max-w-3xl leading-relaxed">
            {t.shiftRmHistSubtitle}
          </p>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{t.shiftRmHistAggTitle}</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.shiftRmHistAggHint}</p>
        </div>
        {aggregates.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">{t.shiftRmHistEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/40 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="px-3 py-2.5">{t.shiftRmHistColProduct}</th>
                  <th className="px-3 py-2.5">{t.shiftRmHistColRaw}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColCases}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColPlannedSum}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColActualSum}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColDeltaSum}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColAvgOverPct}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColMaxOverPct}</th>
                </tr>
              </thead>
              <tbody>
                {aggregates.map((row) => {
                  const avgPct =
                    row.totalExpectedKg > EPS
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
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                        {formatKgAmount(row.totalExpectedKg)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatKgAmount(row.totalActualKg)}</td>
                      <td
                        className={`px-3 py-2.5 text-right tabular-nums font-semibold ${
                          row.totalDeltaKg > EPS
                            ? 'text-amber-700 dark:text-amber-300'
                            : row.totalDeltaKg < -EPS
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {row.totalDeltaKg > EPS ? '+' : ''}
                        {formatKgAmount(row.totalDeltaKg)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                        {Math.abs(avgPct) >= PCT_EPS ? `${avgPct > 0 ? '+' : ''}${avgPct.toFixed(1)}%` : '—'}
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
          <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{t.shiftRmHistDetailTitle}</h4>
        </div>
        {details.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">{t.shiftRmHistEmpty}</p>
        ) : (
          <div className="overflow-x-auto max-h-[min(70vh,36rem)] overflow-y-auto">
            <table className="w-full text-xs min-[400px]:text-sm min-w-[920px]">
              <thead className="sticky top-0 z-[1] bg-slate-50 dark:bg-slate-700/90 backdrop-blur-sm">
                <tr className="text-left font-semibold text-slate-500 dark:text-slate-400">
                  <th className="px-3 py-2.5 whitespace-nowrap">{t.shiftRmHistColWhen}</th>
                  <th className="px-3 py-2.5">{t.shiftRmHistColWorker}</th>
                  <th className="px-3 py-2.5">{t.shiftRmHistColMachine}</th>
                  <th className="px-3 py-2.5">{t.shiftRmHistColProduct}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColGood}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColDefect}</th>
                  <th className="px-3 py-2.5">{t.shiftRmHistColRaw}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColPlanned}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColActual}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColDelta}</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">{t.shiftRmHistColOverPct}</th>
                </tr>
              </thead>
              <tbody>
                {details.map((d) => (
                  <tr
                    key={`${d.shiftId}-${d.rawMaterialId}-${d.createdAt}`}
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
                    <td
                      className={`px-3 py-2 text-right tabular-nums font-semibold ${
                        d.deltaKg > EPS
                          ? 'text-amber-700 dark:text-amber-300'
                          : d.deltaKg < -EPS
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {d.deltaKg > EPS ? '+' : ''}
                      {formatKgAmount(d.deltaKg)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-600 dark:text-slate-300">
                      {Math.abs(d.overPct) >= PCT_EPS ? `${d.overPct > 0 ? '+' : ''}${d.overPct.toFixed(1)}%` : '—'}
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
