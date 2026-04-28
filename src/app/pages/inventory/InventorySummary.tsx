import React from 'react';
import { ArrowDownRight, ArrowUpRight, Sigma, TrendingUp } from 'lucide-react';
import { useApp } from '../../i18n/app-context';
import { formatNumber } from '../../utils/format';
import type { InventoryRecord } from './types';

interface InventorySummaryProps {
  record: InventoryRecord;
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

export function InventorySummary({ record }: InventorySummaryProps) {
  const { t } = useApp();
  const { rows } = record;

  const totals = rows.reduce(
    (acc, r) => {
      acc.systemStart += r.systemQuantityStart;
      acc.realStart += r.realQuantityStart;
      acc.income += r.income;
      acc.expense += r.expense;
      acc.systemEnd += r.systemQuantityEnd;
      acc.realEnd += r.realQuantityEnd;
      const d = r.realQuantityEnd - r.systemQuantityEnd;
      if (d > 0) acc.surplus += d;
      else if (d < 0) acc.shortage += d;
      acc.diffTotal += d;
      return acc;
    },
    {
      systemStart: 0,
      realStart: 0,
      income: 0,
      expense: 0,
      systemEnd: 0,
      realEnd: 0,
      surplus: 0,
      shortage: 0,
      diffTotal: 0,
    },
  );

  const diffCls =
    totals.diffTotal > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : totals.diffTotal < 0
        ? 'text-red-600 dark:text-red-400'
        : 'text-slate-800 dark:text-white';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
          <Sigma size={15} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
          {t.invSummaryTitle}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 lg:grid-cols-3">
        {/* Левая колонка: 3 ключевых остатка */}
        <div className="space-y-2 lg:col-span-2">
          <SummaryRow
            label={t.invSummaryOpening}
            valueSystem={totals.systemStart}
            valueReal={totals.realStart}
          />
          <SummaryRow
            label={t.invSummaryTurnover}
            valueIncome={totals.income}
            valueExpense={totals.expense}
            isTurnover
          />
          <SummaryRow
            label={t.invSummaryClosing}
            valueSystem={totals.systemEnd}
            valueReal={totals.realEnd}
            highlight
          />
        </div>

        {/* Правая колонка: surplus / shortage / total diff */}
        <div className="grid grid-cols-1 gap-2">
          <KpiCard
            icon={<ArrowUpRight size={14} />}
            label={t.invSummarySurplus}
            value={`+${fmt(totals.surplus)}`}
            tone="emerald"
          />
          <KpiCard
            icon={<ArrowDownRight size={14} />}
            label={t.invSummaryShortage}
            value={`${fmt(totals.shortage)}`}
            tone="red"
          />
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-700 dark:bg-indigo-900/20">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                <TrendingUp size={14} /> {t.invSummaryDiffTotal}
              </span>
            </div>
            <p
              className={`mt-1.5 text-xl font-bold tabular-nums ${diffCls}`}
            >
              {totals.diffTotal > 0 ? '+' : ''}
              {fmt(totals.diffTotal)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  valueSystem,
  valueReal,
  valueIncome,
  valueExpense,
  isTurnover,
  highlight,
}: {
  label: string;
  valueSystem?: number;
  valueReal?: number;
  valueIncome?: number;
  valueExpense?: number;
  isTurnover?: boolean;
  highlight?: boolean;
}) {
  const { t } = useApp();
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? 'border-indigo-200 bg-indigo-50/40 dark:border-indigo-700 dark:bg-indigo-900/20'
          : 'border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/20'
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="mt-1.5 grid grid-cols-2 gap-3">
        {isTurnover ? (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {t.invColIncoming}
              </p>
              <p className="text-base font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                +{fmt(valueIncome ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-rose-600 dark:text-rose-400">
                {t.invColOutgoing}
              </p>
              <p className="text-base font-semibold tabular-nums text-rose-700 dark:text-rose-400">
                −{fmt(valueExpense ?? 0)}
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t.invColSystem}
              </p>
              <p className="text-base font-semibold tabular-nums text-slate-800 dark:text-white">
                {fmt(valueSystem ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t.invColReal}
              </p>
              <p className="text-base font-semibold tabular-nums text-slate-800 dark:text-white">
                {fmt(valueReal ?? 0)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'emerald' | 'red';
}) {
  const toneCls =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
      : 'border-rose-200 bg-rose-50/60 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300';
  return (
    <div className={`rounded-xl border p-3 ${toneCls}`}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
        {icon} {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
