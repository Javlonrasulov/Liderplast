import React, { useMemo, useState, useEffect } from 'react';
import { Droplets, Factory, Package, ShoppingCart, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, Clock, Boxes, RefreshCw } from 'lucide-react';
import { SimpleBarChart, SimpleAreaChart } from '../components/charts';
import {
  useERP,
  type FinishedProductCatalogItem,
  type SemiProductCatalogItem,
} from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatNumber, formatCurrency, getLast7Days, getInclusiveDateRange, shortDate, TODAY, formatDateTime } from '../utils/format';

// ======================== KPI CARD ========================
function KpiCard({ title, value, unit, icon: Icon, color, trend, trendVal, warning }: {
  title: string; value: string; unit?: string; icon: any; color: string;
  trend?: 'up' | 'neutral'; trendVal?: string; warning?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all ${warning ? 'border-amber-300 dark:border-amber-600' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {warning ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
            <AlertTriangle size={12} className="text-amber-500" />
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">!</span>
          </div>
        ) : trend && trendVal ? (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight size={12} />{trendVal}
          </div>
        ) : null}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{title}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-slate-900 dark:text-white text-2xl font-bold">{value}</span>
        {unit && <span className="text-slate-400 text-sm">{unit}</span>}
      </div>
    </div>
  );
}

// ======================== LOG STYLES ========================
const LOG_ICONS: Record<string, string> = {
  raw_material_in: '📥', raw_material_out: '📤', semi_production: '🏭',
  final_production: '🍼', sale: '💰', expense: '⚡', adjustment: '✏️', shift: '🔧',
};
const LOG_COLORS: Record<string, string> = {
  raw_material_in: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  raw_material_out: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  semi_production: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  final_production: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  sale: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  expense: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  adjustment: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  shift: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

// ======================== CBU EXCHANGE RATES ========================
interface CBUCurrency {
  Ccy: string;
  Rate: string;
  Diff: string;
  Date: string;
}

function useCBURates() {
  const [data, setData] = useState<{ usd: CBUCurrency | null; eur: CBUCurrency | null }>({ usd: null, eur: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState('');

  const fetchRates = () => {
    setLoading(true);
    setError(false);
    fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/')
      .then(r => r.json())
      .then((list: CBUCurrency[]) => {
        const usd = list.find(c => c.Ccy === 'USD') || null;
        const eur = list.find(c => c.Ccy === 'EUR') || null;
        setData({ usd, eur });
        if (usd) setUpdatedAt(usd.Date);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => { fetchRates(); }, []);

  return { data, loading, error, updatedAt, refetch: fetchRates };
}

function fmtRate(val: string) {
  return parseFloat(val).toLocaleString('uz-UZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function diffColor(diff: string) {
  const v = parseFloat(diff);
  if (v > 0) return 'text-red-500 dark:text-red-400';
  if (v < 0) return 'text-emerald-500 dark:text-emerald-400';
  return 'text-slate-400';
}

function DiffIcon({ diff }: { diff: string }) {
  const v = parseFloat(diff);
  if (v > 0) return <TrendingUp size={13} className="text-red-500" />;
  if (v < 0) return <TrendingDown size={13} className="text-emerald-500" />;
  return null;
}

function CurrencyRateWidget() {
  const { t } = useApp();
  const { data, loading, error, updatedAt, refetch } = useCBURates();

  const currencies = [
    { key: 'usd', flag: '🇺🇸', name: 'USD', obj: data.usd },
    { key: 'eur', flag: '🇪🇺', name: 'EUR', obj: data.eur },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-base">
            🏦
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t.dashCbuTitle}</p>
            <p className="text-xs text-slate-400">{updatedAt ? updatedAt : t.dashCbuSource}</p>
          </div>
        </div>

        {/* Center: currency rates */}
        <div className="flex flex-1 flex-wrap items-center justify-center gap-4 min-[400px]:gap-8">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <RefreshCw size={13} className="animate-spin" />
              <span>{t.authLoading}</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle size={13} className="text-amber-500" />
              <span className="text-slate-500 dark:text-slate-400">{t.dashCbuFetchError}</span>
              <button type="button" onClick={refetch} className="text-indigo-500 hover:underline">
                {t.dashCbuRetry}
              </button>
            </div>
          ) : (
            currencies.map(({ key, flag, name, obj }) =>
              obj ? (
                <div key={key} className="flex min-w-0 max-w-full flex-wrap items-center gap-3 py-1 px-3 min-[400px]:gap-4 min-[400px]:px-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 sm:flex-nowrap">
                  {/* Flag + name */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{flag}</span>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-none mb-0.5">{name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">1 {name === 'USD' ? '$' : '€'}</p>
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-600" />
                  {/* Rate */}
                  <div>
                    <p className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                      {fmtRate(obj.Rate)}
                      <span className="text-xs font-normal text-slate-400 ml-1">so'm</span>
                    </p>
                    <div className={`flex items-center gap-0.5 text-xs mt-0.5 ${diffColor(obj.Diff)}`}>
                      <DiffIcon diff={obj.Diff} />
                      <span>{parseFloat(obj.Diff) > 0 ? '+' : ''}{fmtRate(obj.Diff)}</span>
                      <span className="text-slate-400 ml-1">{t.dashCbuChangeToday}</span>
                    </div>
                  </div>
                </div>
              ) : null
            )
          )}
        </div>

        {/* Right: refresh */}
        <button
          onClick={refetch}
          disabled={loading}
          className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-40 shrink-0"
          title={t.dashCbuRefresh}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}

// ======================== CHART COMPONENTS ========================
const ProductionChart = React.memo(function ProductionChart({
  data, unitPiece, labelYarim, labelTayyor,
}: {
  data: { date: string; yarimTayyor: number; tayyor: number }[];
  unitPiece: string;
  labelYarim: string;
  labelTayyor: string;
}) {
  return (
    <SimpleAreaChart
      data={data}
      height={200}
      formatValue={v => v.toLocaleString() + ' ' + unitPiece}
      series={[
        { dataKey: 'yarimTayyor', name: labelYarim, color: '#818cf8', gradId: 'dash-yarim-tayyor' },
        { dataKey: 'tayyor', name: labelTayyor, color: '#22d3ee', gradId: 'dash-tayyor' },
      ]}
    />
  );
});

const MaterialChart = React.memo(function MaterialChart({
  data, unitKg, nameIn, nameOut,
}: { data: { date: string; incoming: number; outgoing: number }[]; unitKg: string; nameIn: string; nameOut: string }) {
  return (
    <SimpleBarChart
      data={data}
      height={200}
      formatValue={v => v.toLocaleString() + ' ' + unitKg}
      series={[
        { dataKey: 'incoming', name: nameIn, color: '#3b82f6' },
        { dataKey: 'outgoing', name: nameOut, color: '#f97316' },
      ]}
    />
  );
});

// ======================== DASHBOARD ========================
export function Dashboard() {
  const {
    state,
    rawMaterialStock,
    semiStockByProductName,
    finalStockByProductName,
  } = useERP();
  const { t, filterLabel, dateFilter } = useApp();

  const machineTypeById = useMemo(
    () => new Map(state.machines.map(m => [m.id, m.type] as const)),
    [state.machines],
  );

  const todayProduction = useMemo(() => {
    const semiB = state.semiProductBatches.filter(b => b.date === TODAY).reduce((s, b) => s + b.quantity, 0);
    const finalB = state.finalProductBatches.filter(b => b.date === TODAY).reduce((s, b) => s + b.quantity, 0);
    let semiS = 0;
    let finalS = 0;
    for (const r of state.shiftRecords) {
      if (r.date !== TODAY) continue;
      const mt = machineTypeById.get(r.machineId);
      if (mt === 'semi') semiS += r.producedQty;
      else if (mt === 'final') finalS += r.producedQty;
    }
    const semi = semiB + semiS;
    const final = finalB + finalS;
    return { semi, final, total: semi + final };
  }, [state, machineTypeById]);

  const todaySales = useMemo(() => state.sales.filter(s => s.date === TODAY).reduce((sum, s) => sum + s.total, 0), [state]);

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

  const chartRangeLabel =
    dateFilter.preset === 'all' && !dateFilter.from && !dateFilter.to ? t.dashChartLast7 : filterLabel;

  const productionChartData = useMemo(() => chartDayKeys.map(date => {
    const semiB = state.semiProductBatches.filter(b => b.date === date).reduce((s, b) => s + b.quantity, 0);
    const finalB = state.finalProductBatches.filter(b => b.date === date).reduce((s, b) => s + b.quantity, 0);
    let semiS = 0;
    let finalS = 0;
    for (const r of state.shiftRecords) {
      if (r.date !== date) continue;
      const mt = machineTypeById.get(r.machineId);
      if (mt === 'semi') semiS += r.producedQty;
      else if (mt === 'final') finalS += r.producedQty;
    }
    return {
      date: shortDate(date),
      yarimTayyor: semiB + semiS,
      tayyor: finalB + finalS,
    };
  }), [state, chartDayKeys, machineTypeById]);

  const materialChartData = useMemo(() => chartDayKeys.map(date => ({
    date: shortDate(date),
    incoming: state.rawMaterialEntries.filter(e => e.date === date && e.type === 'incoming').reduce((s, e) => s + e.amount, 0),
    outgoing: state.rawMaterialEntries.filter(e => e.date === date && e.type === 'outgoing').reduce((s, e) => s + e.amount, 0),
  })), [state, chartDayKeys]);

  const lowStock = rawMaterialStock < 1000;

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

  const totalSemiStock = useMemo(
    () => semiCatalog.reduce((s, p) => s + (semiStockByProductName[p.name] ?? 0), 0),
    [semiCatalog, semiStockByProductName],
  );
  const totalFinalStock = useMemo(
    () => finalCatalog.reduce((s, p) => s + (finalStockByProductName[p.name] ?? 0), 0),
    [finalCatalog, finalStockByProductName],
  );

  const dashStockOverviewRows = useMemo(() => {
    type Row = {
      key: string;
      label: string;
      val: number;
      max: number;
      unit: string;
      color: string;
      textColor: string;
    };
    const rows: Row[] = [
      {
        key: 'siro',
        label: 'PET Siro',
        val: rawMaterialStock,
        max: 3500,
        unit: 'kg',
        color: lowStock ? 'bg-amber-500' : 'bg-blue-500',
        textColor: lowStock ? 'text-amber-500' : 'text-blue-600',
      },
    ];
    const semiStyles = [
      { color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
      { color: 'bg-violet-500', textColor: 'text-violet-600 dark:text-violet-400' },
      { color: 'bg-fuchsia-500', textColor: 'text-fuchsia-600 dark:text-fuchsia-400' },
      { color: 'bg-indigo-500', textColor: 'text-indigo-600 dark:text-indigo-400' },
    ];
    semiCatalog.forEach((p, i) => {
      const st = semiStyles[i % semiStyles.length];
      rows.push({
        key: `semi-${p.id}`,
        label: p.name,
        val: semiStockByProductName[p.name] ?? 0,
        max: 100000,
        unit: t.unitPiece,
        color: st.color,
        textColor: st.textColor,
      });
    });
    const finStyles = [
      { color: 'bg-cyan-500', textColor: 'text-cyan-600 dark:text-cyan-400' },
      { color: 'bg-teal-500', textColor: 'text-teal-600 dark:text-teal-400' },
      { color: 'bg-sky-500', textColor: 'text-sky-600 dark:text-sky-400' },
      { color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
    ];
    finalCatalog.forEach((p, i) => {
      const st = finStyles[i % finStyles.length];
      rows.push({
        key: `fin-${p.id}`,
        label: p.name,
        val: finalStockByProductName[p.name] ?? 0,
        max: 30000,
        unit: t.unitPiece,
        color: st.color,
        textColor: st.textColor,
      });
    });
    return rows;
  }, [
    rawMaterialStock,
    lowStock,
    semiCatalog,
    finalCatalog,
    semiStockByProductName,
    finalStockByProductName,
    t.unitPiece,
  ]);

  const filteredLogs = useMemo(() => {
    const logs = [...state.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (dateFilter.preset === 'all' || !dateFilter.from) return logs.slice(0, 8);
    return logs.filter(l => {
      const d = l.timestamp.split('T')[0];
      if (dateFilter.from && d < dateFilter.from) return false;
      if (dateFilter.to && d > dateFilter.to) return false;
      return true;
    }).slice(0, 8);
  }, [state.logs, dateFilter]);

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden p-3 min-[400px]:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-slate-900 dark:text-white text-xl font-bold">{t.dashTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{t.dashTodayDate} — {t.dashSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {dateFilter.preset !== 'all' && (
            <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl">
              <span className="text-indigo-700 dark:text-indigo-400 text-xs font-medium">{t.dfShowing} {filterLabel}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">{t.dashSystemActive}</span>
          </div>
        </div>
      </div>

      {/* CBU Currency Exchange Rates */}
      <CurrencyRateWidget />

      {/* Low stock alert */}
      {lowStock && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-amber-800 dark:text-amber-300 font-semibold text-sm">{t.dashLowAlert}</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
              {t.rmRemaining}: <strong>{formatNumber(rawMaterialStock)} kg</strong> — {t.dashLowDesc}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <KpiCard title={t.dashKpiMaterial} value={formatNumber(rawMaterialStock)} unit={t.unitKg} icon={Droplets} color="bg-blue-500" warning={lowStock} />
        <KpiCard title={t.dashKpiSemi} value={formatNumber(totalSemiStock)} unit={t.unitPiece} icon={Factory} color="bg-purple-500" trend="up" trendVal="+5k" />
        <KpiCard title={t.dashKpiFinal} value={formatNumber(totalFinalStock)} unit={t.unitPiece} icon={Package} color="bg-cyan-500" trend="up" trendVal="+5k" />
        <KpiCard title={t.dashKpiTodayProd} value={formatNumber(todayProduction.total)} unit={t.unitPiece} icon={TrendingUp} color="bg-indigo-500" trend="neutral" />
        <KpiCard title={t.dashKpiTodaySales} value={formatNumber(todaySales)} unit={t.unitSum} icon={ShoppingCart} color="bg-emerald-500" trend="up" trendVal={t.dfToday} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.dashChartProd}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{chartRangeLabel}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400"><Clock size={12} /></div>
          </div>
          {/* Custom legend */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /><span className="text-xs text-slate-500 dark:text-slate-400">{t.dashProdYarimTayyor}</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /><span className="text-xs text-slate-500 dark:text-slate-400">{t.dashProdTayyor}</span></div>
          </div>
          <ProductionChart
            data={productionChartData}
            unitPiece={t.unitPiece}
            labelYarim={t.dashProdYarimTayyor}
            labelTayyor={t.dashProdTayyor}
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.dashChartMaterial}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{chartRangeLabel} ({t.dashChartKg})</p>
            </div>
            <Droplets size={16} className="text-blue-400" />
          </div>
          {/* Custom legend */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /><span className="text-xs text-slate-500 dark:text-slate-400">{t.rmIncoming.replace('↓ ', '')}</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /><span className="text-xs text-slate-500 dark:text-slate-400">{t.rmOutgoing.replace('↑ ', '')}</span></div>
          </div>
          <MaterialChart
            data={materialChartData}
            unitKg={t.unitKg}
            nameIn={t.rmIncoming.replace('↓ ', '')}
            nameOut={t.rmOutgoing.replace('↑ ', '')}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock overview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Boxes size={16} className="text-slate-500" />
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.dashStockTitle}</h3>
          </div>
          <div className="space-y-4">
            {dashStockOverviewRows.map((item) => (
              <div key={item.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400 text-xs">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.textColor}`}>
                    {formatNumber(item.val)} {item.unit}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${Math.min(100, (item.val / item.max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-500" />
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.dashActivityTitle}</h3>
            </div>
            {filteredLogs.length === 0 && (
              <span className="text-xs text-slate-400">{t.noData}</span>
            )}
          </div>
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">{t.noData}</div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${LOG_COLORS[log.type] || LOG_COLORS.adjustment}`}>
                    {LOG_ICONS[log.type] || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-slate-300 text-xs font-medium truncate">{log.description}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{formatDateTime(log.timestamp)}</p>
                  </div>
                  {log.amount != null && log.amount > 0 && (
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                      {log.type === 'sale' ? formatCurrency(log.amount) : formatNumber(log.amount) + (log.unit === 'kg' ? ' kg' : ' ' + t.unitPiece)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}