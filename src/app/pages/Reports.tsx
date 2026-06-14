import React, { useState, useMemo } from 'react';
import { SimpleBarChart, SimpleLineChart, SimpleAreaChart, SimpleDonutChart, type BarSeries } from '../components/charts';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Droplets,
  DollarSign,
  Wallet,
  PiggyBank,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Gauge,
} from 'lucide-react';
import {
  useERP,
  type FinishedProductCatalogItem,
  type SemiProductCatalogItem,
  type RawMaterialEntry,
} from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import type { T } from '../i18n/translations';
import { formatNumber, formatCurrency, shortDate, getLast7Days, getInclusiveDateRange, calcPercent, buildReportChartTitle } from '../utils/format';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#14b8a6', '#3b82f6', '#f59e0b', '#ec4899', '#84cc16', '#f97316'];

function semiRowKey(name: string) {
  return `semi_${name}`;
}
function finalRowKey(name: string) {
  return `final_${name}`;
}

// ── UI building blocks ────────────────────────────────────────────────────────

function ReportKpiCard({
  label,
  value,
  icon: Icon,
  accentBar,
  iconWrap,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentBar: string;
  iconWrap: string;
  iconColor: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800">
      <div className={`absolute inset-x-0 bottom-0 h-1 ${accentBar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ReportPanel({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-800 sm:p-6 ${className}`}
    >
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex min-h-[10rem] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center dark:border-slate-600 dark:bg-slate-900/30">
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

function LegendPills({ items }: { items: { name: string; color: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.name}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-300"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
          {item.name}
        </span>
      ))}
    </div>
  );
}

function GaugeRing({ percent, size = 52 }: { percent: number; size?: number }) {
  const p = Math.min(100, Math.max(0, percent));
  const stroke = p >= 80 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444';
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (p / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-slate-200 dark:text-slate-600" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

function EffBar({
  label,
  plannedPerHour,
  actualAvgPerHour,
  actual,
  max,
  hoursAssumed,
  t,
}: {
  label: string;
  plannedPerHour: number | null;
  actualAvgPerHour: number;
  actual: number;
  max: number;
  hoursAssumed: number;
  t: T;
}) {
  const pct = calcPercent(actual, max);
  const hasPlan = plannedPerHour != null && plannedPerHour > 0;
  const onTarget = !hasPlan || actualAvgPerHour >= plannedPerHour * 0.8;
  const actualRateCls = hasPlan
    ? onTarget
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-amber-600 dark:text-amber-500'
    : 'text-slate-800 dark:text-slate-100';

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm dark:border-slate-600/60 dark:from-slate-800 dark:to-slate-800/60 sm:p-5">
      <div className="flex items-start gap-4">
        <div className="relative flex h-[52px] w-[52px] items-center justify-center">
          <GaugeRing percent={pct} />
          <span className="absolute text-[10px] font-bold tabular-nums text-slate-700 dark:text-slate-200">{pct.toFixed(0)}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{label}</h4>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                pct >= 80
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : pct >= 50
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
              }`}
            >
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
            <div className="rounded-xl bg-white/80 px-3 py-2 dark:bg-slate-900/40">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t.repEffPlannedHourly}</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-800 dark:text-white">
                {hasPlan ? (
                  <>
                    {formatNumber(plannedPerHour)}{' '}
                    <span className="text-xs font-normal text-slate-400">{t.repEffUnitPcsPerHour}</span>
                  </>
                ) : (
                  '—'
                )}
              </p>
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 dark:bg-slate-900/40">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t.repEffActualHourly}</p>
              <p className={`mt-0.5 text-sm font-bold tabular-nums ${actualRateCls}`}>
                {formatNumber(actualAvgPerHour)}{' '}
                <span className="text-xs font-normal text-slate-400">{t.repEffUnitPcsPerHour}</span>
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {t.repEffTotalShort} <strong className="text-slate-700 dark:text-slate-200">{formatNumber(actual)}</strong>
            </span>
            <span>
              {t.repEffLimitShort} <strong className="text-slate-700 dark:text-slate-200">{formatNumber(max)}</strong>
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            {(t.repEffAssumedHours ?? '').replace('{{h}}', String(hoursAssumed))}
          </p>
        </div>
      </div>
    </article>
  );
}

function MaterialFeedRow({ entry, t }: { entry: RawMaterialEntry; t: T }) {
  const incoming = entry.type === 'incoming';
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        incoming
          ? 'border-blue-100/80 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-950/20'
          : 'border-orange-100/80 bg-orange-50/30 dark:border-orange-900/40 dark:bg-orange-950/20'
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            incoming ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
          }`}
        >
          {incoming ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{entry.date}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                incoming
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
              }`}
            >
              {incoming ? t.rmIncoming.replace('↓ ', '') : t.rmOutgoing.replace('↑ ', '')}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-slate-700 dark:text-slate-200">{entry.description || '—'}</p>
        </div>
      </div>
      <div className="shrink-0 text-right sm:pl-4">
        <p className={`text-lg font-bold tabular-nums ${incoming ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
          {incoming ? '+' : '−'}
          {formatNumber(entry.amount)}
        </p>
        <p className="text-xs text-slate-400">kg</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function Reports() {
  const {
    state,
    rawMaterialStock,
    semiStockByProductName,
    finalStockByProductName,
  } = useERP();
  const { t, filterData, dateFilter, chartRangeLabel } = useApp();
  const [activeTab, setActiveTab] = useState('production');
  const [materialSearch, setMaterialSearch] = useState('');

  const chartDayKeys = useMemo(() => {
    if (dateFilter.preset === 'all' || (!dateFilter.from && !dateFilter.to)) {
      return getLast7Days();
    }
    const from = dateFilter.from || dateFilter.to;
    const to = dateFilter.to || dateFilter.from;
    if (!from || !to) return getLast7Days();
    const range = getInclusiveDateRange(from, to);
    return range.length > 0 ? range : getLast7Days();
  }, [dateFilter]);

  const productionChartTitle = useMemo(
    () => buildReportChartTitle(t.repProdTitle, chartRangeLabel),
    [t.repProdTitle, chartRangeLabel],
  );

  const salesChartTitle = useMemo(
    () => buildReportChartTitle(t.repSalesTitle, chartRangeLabel),
    [t.repSalesTitle, chartRangeLabel],
  );

  const materialChartTitle = useMemo(
    () => buildReportChartTitle(t.repMatTitle, chartRangeLabel),
    [t.repMatTitle, chartRangeLabel],
  );

  const semiCatalog = useMemo(
    () =>
      state.warehouseProducts.filter(
        (p): p is SemiProductCatalogItem => p.itemType === 'SEMI_PRODUCT',
      ),
    [state.warehouseProducts],
  );
  const finalCatalog = useMemo(
    () =>
      state.warehouseProducts.filter(
        (p): p is FinishedProductCatalogItem => p.itemType === 'FINISHED_PRODUCT',
      ),
    [state.warehouseProducts],
  );

  const semiDistData = useMemo(
    () =>
      semiCatalog.map((p) => ({
        name: p.name,
        value: semiStockByProductName[p.name] ?? 0,
      })),
    [semiCatalog, semiStockByProductName],
  );
  const finalDistData = useMemo(
    () =>
      finalCatalog.map((p) => ({
        name: p.name,
        value: finalStockByProductName[p.name] ?? 0,
      })),
    [finalCatalog, finalStockByProductName],
  );

  const machineTypeById = useMemo(
    () => new Map(state.machines.map((m) => [m.id, m.type] as const)),
    [state.machines],
  );

  const productionSemiKeys = useMemo(() => {
    const s = new Set<string>();
    for (const p of semiCatalog) s.add(p.name);
    for (const b of state.semiProductBatches) s.add(String(b.productType));
    for (const r of state.shiftRecords) {
      if (machineTypeById.get(r.machineId) !== 'semi') continue;
      const pt = r.productType?.trim();
      if (pt) s.add(pt);
    }
    const unlabeledSemi = state.shiftRecords.some(
      (r) => machineTypeById.get(r.machineId) === 'semi' && !r.productType?.trim(),
    );
    if (unlabeledSemi) {
      const fallback = semiCatalog[0]?.name ?? '18g';
      s.add(fallback);
    }
    return [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [semiCatalog, state.semiProductBatches, state.shiftRecords, machineTypeById]);

  const productionFinalKeys = useMemo(() => {
    const s = new Set<string>();
    for (const p of finalCatalog) s.add(p.name);
    for (const b of state.finalProductBatches) s.add(String(b.productType));
    for (const r of state.shiftRecords) {
      if (machineTypeById.get(r.machineId) !== 'final') continue;
      const pt = r.productType?.trim();
      if (pt) s.add(pt);
    }
    const unlabeledFinal = state.shiftRecords.some(
      (r) => machineTypeById.get(r.machineId) === 'final' && !r.productType?.trim(),
    );
    if (unlabeledFinal) {
      const fallback = finalCatalog[0]?.name ?? '0.5L';
      s.add(fallback);
    }
    return [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [finalCatalog, state.finalProductBatches, state.shiftRecords, machineTypeById]);

  const productionSeries = useMemo((): BarSeries[] => {
    const out: BarSeries[] = [];
    let i = 0;
    for (const name of productionSemiKeys) {
      out.push({ dataKey: semiRowKey(name), name, color: PIE_COLORS[i % PIE_COLORS.length] });
      i++;
    }
    for (const name of productionFinalKeys) {
      out.push({
        dataKey: finalRowKey(name),
        name: `${name} · ${t.dashProdTayyor}`,
        color: PIE_COLORS[i % PIE_COLORS.length],
      });
      i++;
    }
    return out;
  }, [productionSemiKeys, productionFinalKeys, t.dashProdTayyor]);

  const productionData = useMemo(() => {
    return chartDayKeys.map((date) => {
      const row: Record<string, string | number> = { date: shortDate(date) };
      for (const k of productionSemiKeys) row[semiRowKey(k)] = 0;
      for (const k of productionFinalKeys) row[finalRowKey(k)] = 0;

      for (const b of state.semiProductBatches) {
        if (b.date !== date) continue;
        const key = semiRowKey(String(b.productType));
        if (row[key] === undefined) row[key] = 0;
        row[key] = Number(row[key]) + b.quantity;
      }
      for (const b of state.finalProductBatches) {
        if (b.date !== date) continue;
        const key = finalRowKey(String(b.productType));
        if (row[key] === undefined) row[key] = 0;
        row[key] = Number(row[key]) + b.quantity;
      }
      for (const r of state.shiftRecords) {
        if (r.date !== date) continue;
        const mt = machineTypeById.get(r.machineId);
        const pt = r.productType?.trim() || '';
        if (mt === 'semi') {
          let target = pt;
          if (!target) target = semiCatalog[0]?.name ?? productionSemiKeys[0] ?? '18g';
          const key = semiRowKey(target);
          if (row[key] === undefined) row[key] = 0;
          row[key] = Number(row[key]) + r.producedQty;
        } else if (mt === 'final') {
          let target = pt;
          if (!target) target = finalCatalog[0]?.name ?? productionFinalKeys[0] ?? '0.5L';
          const key = finalRowKey(target);
          if (row[key] === undefined) row[key] = 0;
          row[key] = Number(row[key]) + r.producedQty;
        }
      }
      return row;
    });
  }, [
    chartDayKeys,
    state.semiProductBatches,
    state.finalProductBatches,
    state.shiftRecords,
    machineTypeById,
    productionSemiKeys,
    productionFinalKeys,
    semiCatalog,
    finalCatalog,
  ]);

  const production7Total = useMemo(
    () =>
      productionData.reduce(
        (sum, row) =>
          sum +
          productionSeries.reduce((s, ser) => s + (Number(row[ser.dataKey]) || 0), 0),
        0,
      ),
    [productionData, productionSeries],
  );

  const salesData = useMemo(
    () =>
      chartDayKeys.map((date) => ({
        date: shortDate(date),
        value: state.sales.filter((s) => s.date === date).reduce((s, sale) => s + sale.total, 0) / 1000,
      })),
    [state, chartDayKeys],
  );

  const sales7Total = useMemo(
    () =>
      chartDayKeys.reduce(
        (sum, date) =>
          sum + state.sales.filter((s) => s.date === date).reduce((s, sale) => s + sale.total, 0),
        0,
      ),
    [state.sales, chartDayKeys],
  );

  const materialData = useMemo(
    () =>
      chartDayKeys.map((date) => ({
        date: shortDate(date),
        incoming: state.rawMaterialEntries
          .filter((e) => e.date === date && e.type === 'incoming')
          .reduce((s, e) => s + e.amount, 0),
        outgoing: state.rawMaterialEntries
          .filter((e) => e.date === date && e.type === 'outgoing')
          .reduce((s, e) => s + e.amount, 0),
      })),
    [state, chartDayKeys],
  );

  const material7In = useMemo(
    () => materialData.reduce((s, d) => s + d.incoming, 0),
    [materialData],
  );
  const material7Out = useMemo(
    () => materialData.reduce((s, d) => s + d.outgoing, 0),
    [materialData],
  );

  const hasMaterialChartData = useMemo(
    () => materialData.some((d) => d.incoming > 0 || d.outgoing > 0),
    [materialData],
  );

  const machineEfficiency = useMemo(() => {
    return state.machines.map((machine) => {
      const shiftsForMachine = state.shiftRecords.filter((r) => r.machineId === machine.id);
      const cap = machine.maxCapacityPerHour || 0;

      if (machine.type === 'semi') {
        const semiBatches = state.semiProductBatches.filter((b) => b.machineId === machine.id);
        const actual =
          semiBatches.reduce((s, b) => s + b.quantity, 0) +
          shiftsForMachine.reduce((s, r) => s + r.producedQty, 0);
        const sessions = semiBatches.length + shiftsForMachine.length;
        const maxH = sessions * 8 || 8;
        let max = cap * maxH;
        if (max <= 0) max = Math.max(cap * 8, 1);
        return { machine, actual, max, hoursAssumed: maxH, capacityPerHour: cap };
      }

      const actual = shiftsForMachine.reduce((s, r) => s + r.producedQty, 0);
      const sessions = shiftsForMachine.length;
      const maxH = sessions * 8 || 8;
      let max = cap * maxH;
      if (max <= 0) max = Math.max(cap * 8, 1);
      return { machine, actual, max, hoursAssumed: maxH, capacityPerHour: cap };
    });
  }, [state.machines, state.semiProductBatches, state.shiftRecords]);

  const avgMachineEff = useMemo(() => {
    if (machineEfficiency.length === 0) return 0;
    const sum = machineEfficiency.reduce((s, m) => s + calcPercent(m.actual, m.max), 0);
    return sum / machineEfficiency.length;
  }, [machineEfficiency]);

  const totalRevenue = useMemo(
    () => filterData([...state.sales]).reduce((s, sale) => s + sale.total, 0),
    [state.sales, filterData],
  );
  const totalExpenses = useMemo(
    () => filterData([...state.expenses]).reduce((s, e) => s + e.amount, 0),
    [state.expenses, filterData],
  );
  const totalRawIn = useMemo(
    () => filterData(state.rawMaterialEntries.filter((e) => e.type === 'incoming')).reduce((s, e) => s + e.amount, 0),
    [state.rawMaterialEntries, filterData],
  );
  const totalRawOut = useMemo(
    () => filterData(state.rawMaterialEntries.filter((e) => e.type === 'outgoing')).reduce((s, e) => s + e.amount, 0),
    [state.rawMaterialEntries, filterData],
  );

  const filteredRawEntries = useMemo(() => {
    const sorted = filterData([...state.rawMaterialEntries]).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const q = materialSearch.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.date.includes(q) ||
        e.type.includes(q),
    );
  }, [state.rawMaterialEntries, filterData, materialSearch]);

  const clientSalesRank = useMemo(
    () =>
      [...state.clients]
        .map((client) => ({
          client,
          total: filterData(state.sales.filter((s) => s.clientId === client.id)).reduce(
            (s, sale) => s + sale.total,
            0,
          ),
        }))
        .filter((row) => row.total > 0)
        .sort((a, b) => b.total - a.total),
    [state.clients, state.sales, filterData],
  );

  const TABS = [
    { key: 'production', label: t.repTabProduction, icon: BarChart3 },
    { key: 'efficiency', label: t.repTabEfficiency, icon: TrendingUp },
    { key: 'sales', label: t.repTabSales, icon: FileText },
    { key: 'material', label: t.repTabMaterial, icon: Droplets },
  ] as const;

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden p-3 min-[400px]:p-4 lg:p-6">
      {/* Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{t.repTitle}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.repProdTitle.replace(/\(.*\)/, '').trim()} · KPI · {chartRangeLabel}
          </p>
        </div>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 xl:grid-cols-4">
        <ReportKpiCard
          label={t.repRevenue}
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          accentBar="bg-emerald-500"
          iconWrap="bg-emerald-500/15"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <ReportKpiCard
          label={t.repExpenses}
          value={formatCurrency(totalExpenses)}
          icon={Wallet}
          accentBar="bg-rose-500"
          iconWrap="bg-rose-500/15"
          iconColor="text-rose-600 dark:text-rose-400"
        />
        <ReportKpiCard
          label={t.repProfit}
          value={formatCurrency(totalRevenue - totalExpenses)}
          icon={PiggyBank}
          accentBar="bg-violet-500"
          iconWrap="bg-violet-500/15"
          iconColor="text-violet-600 dark:text-violet-400"
        />
        <ReportKpiCard
          label={t.repRawEff}
          value={totalRawIn > 0 ? `${((totalRawOut / totalRawIn) * 100).toFixed(1)}%` : '0%'}
          icon={Gauge}
          accentBar="bg-sky-500"
          iconWrap="bg-sky-500/15"
          iconColor="text-sky-600 dark:text-sky-400"
        />
      </div>

      {/* Pill tabs */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5 dark:border-slate-700/80 dark:bg-slate-800/60">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex flex-1 min-w-[8.5rem] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Production ── */}
      {activeTab === 'production' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.repProdTitle.split('(')[0]?.trim()}</p>
              <p className="text-[10px] text-slate-400">{chartRangeLabel}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {formatNumber(production7Total)} <span className="text-sm font-normal text-slate-400">{t.unitPiece}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.repSemiDist}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                {formatNumber(semiDistData.reduce((s, x) => s + x.value, 0))}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.repFinalDist}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-cyan-600 dark:text-cyan-400">
                {formatNumber(finalDistData.reduce((s, x) => s + x.value, 0))}
              </p>
            </div>
          </div>

          <ReportPanel title={productionChartTitle}>
            <div className="mb-4">
              <LegendPills items={productionSeries.map((s) => ({ name: s.name, color: s.color }))} />
            </div>
            {productionSeries.length === 0 ? (
              <EmptyBlock message={t.noData} />
            ) : (
              <SimpleBarChart
                data={productionData}
                height={300}
                formatValue={(v) => formatNumber(v) + ' ' + t.unitPiece}
                series={productionSeries}
              />
            )}
          </ReportPanel>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[ { title: t.repSemiDist, data: semiDistData }, { title: t.repFinalDist, data: finalDistData } ].map((chart) => (
              <ReportPanel key={chart.title} title={chart.title}>
                {chart.data.length === 0 || chart.data.every((d) => d.value === 0) ? (
                  <EmptyBlock message={t.noData} />
                ) : (
                  <div className="flex flex-col items-center gap-6 min-[420px]:flex-row min-[420px]:items-start">
                    <SimpleDonutChart data={chart.data} colors={PIE_COLORS} size={148} />
                    <div className="w-full min-w-0 flex-1 space-y-2">
                      {chart.data.map((item, i) => {
                        const total = chart.data.reduce((s, x) => s + x.value, 0) || 1;
                        const pct = (item.value / total) * 100;
                        return (
                          <div key={item.name} className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900/40">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                              </div>
                              <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-white">{formatNumber(item.value)}</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            </div>
                            <p className="mt-1 text-right text-[10px] text-slate-400">{pct.toFixed(0)}%</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </ReportPanel>
            ))}
          </div>
        </div>
      )}

      {/* ── Efficiency ── */}
      {activeTab === 'efficiency' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.repEffTitle}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">{avgMachineEff.toFixed(1)}%</p>
              <p className="text-xs text-slate-400">{state.machines.length} apparat</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.repRawIn}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">{formatNumber(totalRawIn)} kg</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.repRawOut}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-orange-600 dark:text-orange-400">{formatNumber(totalRawOut)} kg</p>
            </div>
          </div>

          <ReportPanel title={t.repEffTitle} subtitle={t.repEffFormula}>
            {machineEfficiency.length === 0 ? (
              <EmptyBlock message={t.repEffNoMachines} />
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {machineEfficiency.map(({ machine, actual, max, hoursAssumed, capacityPerHour }) => (
                  <EffBar
                    key={machine.id}
                    label={machine.name}
                    plannedPerHour={capacityPerHour > 0 ? capacityPerHour : null}
                    actualAvgPerHour={hoursAssumed > 0 ? actual / hoursAssumed : 0}
                    actual={actual}
                    max={max}
                    hoursAssumed={hoursAssumed}
                    t={t}
                  />
                ))}
              </div>
            )}
          </ReportPanel>

          <ReportPanel title={t.repRawTitle}>
            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-3">
              {[
                { label: t.repRawIn, val: formatNumber(totalRawIn), unit: 'kg', cls: 'text-blue-600 dark:text-blue-400', ring: 'stroke-blue-500' },
                { label: t.repRawOut, val: formatNumber(totalRawOut), unit: 'kg', cls: 'text-orange-600 dark:text-orange-400', ring: 'stroke-orange-500' },
                {
                  label: t.repRawEffLabel,
                  val: totalRawIn > 0 ? ((totalRawOut / totalRawIn) * 100).toFixed(1) : '0',
                  unit: '%',
                  cls: 'text-emerald-600 dark:text-emerald-400',
                  ring: 'stroke-emerald-500',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-center dark:border-slate-600 dark:bg-slate-900/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className={`mt-2 text-2xl font-bold tabular-nums ${item.cls}`}>
                    {item.val}
                    <span className="ml-1 text-sm font-normal text-slate-400">{item.unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs text-slate-500">
                <span>{t.repRawEffLabel}</span>
                <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  {totalRawIn > 0 ? ((totalRawOut / totalRawIn) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${totalRawIn > 0 ? Math.min(100, (totalRawOut / totalRawIn) * 100) : 0}%` }}
                />
              </div>
            </div>
          </ReportPanel>
        </div>
      )}

      {/* ── Sales ── */}
      {activeTab === 'sales' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-400">{t.repSalesTitle.split('(')[0]?.trim()}</p>
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500">{chartRangeLabel}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{formatCurrency(sales7Total)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.repClientsTitle}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{clientSalesRank.length}</p>
              <p className="text-xs text-slate-400">{t.repRevenue}: {formatCurrency(totalRevenue)}</p>
            </div>
          </div>

          <ReportPanel title={salesChartTitle}>
            <SimpleLineChart
              data={salesData}
              dataKey="value"
              name={t.navSales}
              color="#10b981"
              height={280}
              smooth
              formatValue={(v) => formatCurrency(v * 1000)}
              formatYTick={(v) => v.toFixed(0) + 'k'}
            />
          </ReportPanel>

          <ReportPanel title={t.repClientsTitle}>
            {clientSalesRank.length === 0 ? (
              <EmptyBlock message={t.noData} />
            ) : (
              <div className="space-y-3">
                {clientSalesRank.map(({ client, total }, idx) => {
                  const pct = totalRevenue > 0 ? (total / totalRevenue) * 100 : 0;
                  return (
                    <div
                      key={client.id}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-600/60 dark:bg-slate-900/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{client.name}</p>
                          <p className="shrink-0 font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</p>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1 text-right text-[10px] text-slate-400">{pct.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ReportPanel>
        </div>
      )}

      {/* ── Material ── */}
      {activeTab === 'material' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{t.repRawIn} ({chartRangeLabel})</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-blue-700 dark:text-blue-300">{formatNumber(material7In)} kg</p>
            </div>
            <div className="rounded-2xl border border-orange-200/80 bg-orange-50/40 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">{t.repRawOut} ({chartRangeLabel})</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-orange-700 dark:text-orange-300">{formatNumber(material7Out)} kg</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.layoutSiroRemaining}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{formatNumber(rawMaterialStock)} kg</p>
            </div>
          </div>

          <ReportPanel title={materialChartTitle}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <LegendPills
                items={[
                  { name: t.rmIncoming.replace('↓ ', ''), color: '#3b82f6' },
                  { name: t.rmOutgoing.replace('↑ ', ''), color: '#f97316' },
                ]}
              />
              {hasMaterialChartData ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.repRawEff}:{' '}
                  <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                    {material7In > 0 ? `${((material7Out / material7In) * 100).toFixed(1)}%` : '—'}
                  </span>
                </p>
              ) : null}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/90 via-white to-white px-2 py-3 dark:border-slate-700/60 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-transparent sm:px-4">
              {hasMaterialChartData ? (
                <SimpleAreaChart
                  data={materialData}
                  height={300}
                  formatValue={(v) => formatNumber(v) + ' kg'}
                  series={[
                    { dataKey: 'incoming', name: t.rmIncoming.replace('↓ ', ''), color: '#3b82f6', gradId: 'rep-mat-in' },
                    { dataKey: 'outgoing', name: t.rmOutgoing.replace('↑ ', ''), color: '#f97316', gradId: 'rep-mat-out' },
                  ]}
                />
              ) : (
                <EmptyBlock message={t.noData} />
              )}
            </div>
          </ReportPanel>

          <ReportPanel
            title={t.repMatTable}
            subtitle={`${filteredRawEntries.length} ${t.repMatTable.toLowerCase()}`}
          >
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/40">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                type="search"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder={t.colNote}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
            </div>
            {filteredRawEntries.length === 0 ? (
              <EmptyBlock message={t.noData} />
            ) : (
              <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                {filteredRawEntries.map((entry) => (
                  <MaterialFeedRow key={entry.id} entry={entry} t={t} />
                ))}
              </div>
            )}
          </ReportPanel>
        </div>
      )}
    </div>
  );
}
