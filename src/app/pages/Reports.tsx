import React, { useState, useMemo } from 'react';
import { SimpleBarChart, SimpleLineChart, SimpleDonutChart } from '../components/charts';
import { BarChart3, TrendingUp, FileText, Cpu } from 'lucide-react';
import {
  useERP,
  type FinishedProductCatalogItem,
  type SemiProductCatalogItem,
} from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatNumber, formatCurrency, shortDate, getLast7Days, calcPercent } from '../utils/format';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#14b8a6', '#3b82f6', '#f59e0b'];

function EffBar({ label, actual, max }: { label: string; actual: number; max: number }) {
  const pct = calcPercent(actual, max);
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{label}</span>
        <span className={`text-lg font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-slate-400">
        <span>{formatNumber(actual)}</span>
        <span>Max: {formatNumber(max)}</span>
      </div>
    </div>
  );
}

export function Reports() {
  const {
    state,
    rawMaterialStock,
    semiStockByProductName,
    finalStockByProductName,
  } = useERP();
  const { t, filterData } = useApp();
  const [activeTab, setActiveTab] = useState('production');

  const last7Days = getLast7Days();

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
    () => new Map(state.machines.map(m => [m.id, m.type] as const)),
    [state.machines],
  );

  const productionData = useMemo(() => last7Days.map(date => {
    let g18 = state.semiProductBatches.filter(b => b.date === date && b.productType === '18g').reduce((s, b) => s + b.quantity, 0);
    let g20 = state.semiProductBatches.filter(b => b.date === date && b.productType === '20g').reduce((s, b) => s + b.quantity, 0);
    let tayyor = state.finalProductBatches.filter(b => b.date === date).reduce((s, b) => s + b.quantity, 0);
    for (const r of state.shiftRecords) {
      if (r.date !== date) continue;
      const mt = machineTypeById.get(r.machineId);
      if (mt === 'semi') {
        if (r.productType?.includes('20')) g20 += r.producedQty;
        else g18 += r.producedQty;
      } else if (mt === 'final') {
        tayyor += r.producedQty;
      }
    }
    return { date: shortDate(date), '18g': g18, '20g': g20, tayyor };
  }), [state, last7Days, machineTypeById]);

  const salesData = useMemo(() => last7Days.map(date => ({
    date: shortDate(date),
    value: state.sales.filter(s => s.date === date).reduce((s, sale) => s + sale.total, 0) / 1000,
  })), [state, last7Days]);

  const materialData = useMemo(() => last7Days.map(date => ({
    date: shortDate(date),
    incoming: state.rawMaterialEntries.filter(e => e.date === date && e.type === 'incoming').reduce((s, e) => s + e.amount, 0),
    outgoing: state.rawMaterialEntries.filter(e => e.date === date && e.type === 'outgoing').reduce((s, e) => s + e.amount, 0),
  })), [state, last7Days]);

  const machineEfficiency = useMemo(() => state.machines.map(machine => {
    const batches = machine.type === 'semi' ? state.semiProductBatches.filter(b => b.machineId === machine.id) : state.finalProductBatches;
    const actual = batches.reduce((s, b: any) => s + b.quantity, 0);
    const maxH = batches.length * 8 || 8;
    const max = machine.maxCapacityPerHour * maxH;
    return { machine, actual, max: max || machine.maxCapacityPerHour * 8 };
  }), [state]);

  const totalRevenue = state.sales.reduce((s, sale) => s + sale.total, 0);
  const totalExpenses = state.expenses.reduce((s, e) => s + e.amount, 0);
  const totalRawIn = state.rawMaterialEntries.filter(e => e.type === 'incoming').reduce((s, e) => s + e.amount, 0);
  const totalRawOut = state.rawMaterialEntries.filter(e => e.type === 'outgoing').reduce((s, e) => s + e.amount, 0);

  const filteredRawEntries = filterData([...state.rawMaterialEntries]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const TABS = [
    { key: 'production', label: t.repTabProduction, icon: BarChart3 },
    { key: 'efficiency', label: t.repTabEfficiency, icon: TrendingUp },
    { key: 'sales', label: t.repTabSales, icon: FileText },
    { key: 'material', label: t.repTabMaterial, icon: Cpu },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t.repRevenue, value: formatCurrency(totalRevenue), cls: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
          { label: t.repExpenses, value: formatCurrency(totalExpenses), cls: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
          { label: t.repProfit, value: formatCurrency(totalRevenue - totalExpenses), cls: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
          { label: t.repRawEff, value: totalRawIn > 0 ? ((totalRawOut / totalRawIn) * 100).toFixed(1) + '%' : '0%', cls: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
        ].map(item => (
          <div key={item.label} className={`rounded-2xl border p-5 shadow-sm ${item.bg}`}>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{item.label}</p>
            <p className={`font-bold text-lg ${item.cls}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'production' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-2">{t.repProdTitle}</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /><span className="text-xs text-slate-500 dark:text-slate-400">18g</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /><span className="text-xs text-slate-500 dark:text-slate-400">20g</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /><span className="text-xs text-slate-500 dark:text-slate-400">{t.dashProdTayyor}</span></div>
            </div>
            <SimpleBarChart
              data={productionData}
              height={260}
              formatValue={v => formatNumber(v) + ' ' + t.unitPiece}
              series={[
                { dataKey: '18g', name: '18g', color: '#818cf8' },
                { dataKey: '20g', name: '20g', color: '#a78bfa' },
                { dataKey: 'tayyor', name: t.dashProdTayyor, color: '#22d3ee' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { title: t.repSemiDist, data: semiDistData },
              { title: t.repFinalDist, data: finalDistData },
            ].map((chart) => (
              <div key={chart.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-4">{chart.title}</h3>
                <div className="flex items-center gap-6">
                  <SimpleDonutChart data={chart.data} colors={PIE_COLORS} size={140} />
                  <div className="space-y-2 flex-1">
                    {chart.data.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">
                          {formatNumber(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2"><TrendingUp size={16} className="text-indigo-500" /><h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.repEffTitle}</h3></div>
              <span className="text-xs text-slate-400">{t.repEffFormula}</span>
            </div>
            <div className="space-y-4">
              {machineEfficiency.map(({ machine, actual, max }) => (
                <EffBar key={machine.id} label={machine.name} actual={actual} max={max} />
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-4">{t.repRawTitle}</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t.repRawIn, val: `${formatNumber(totalRawIn)} kg`, cls: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
                { label: t.repRawOut, val: `${formatNumber(totalRawOut)} kg`, cls: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
                { label: t.repRawEffLabel, val: `${totalRawIn > 0 ? ((totalRawOut / totalRawIn) * 100).toFixed(1) : 0}%`, cls: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
              ].map(item => (
                <div key={item.label} className={`text-center p-4 rounded-xl border ${item.bg}`}>
                  <p className={`text-xs mb-1 ${item.cls}`}>{item.label}</p>
                  <p className="text-slate-900 dark:text-white text-xl font-bold">{item.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${totalRawIn > 0 ? (totalRawOut / totalRawIn) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-5">{t.repSalesTitle}</h3>
            <SimpleLineChart
              data={salesData}
              dataKey="value"
              name={t.navSales}
              color="#10b981"
              height={240}
              formatValue={v => formatCurrency(v * 1000)}
              formatYTick={v => v.toFixed(0) + 'k'}
            />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-4">{t.repClientsTitle}</h3>
            <div className="space-y-3">
              {state.clients.map(client => {
                const clientSales = state.sales.filter(s => s.clientId === client.id).reduce((s, sale) => s + sale.total, 0);
                const pct = totalRevenue > 0 ? (clientSales / totalRevenue) * 100 : 0;
                return (
                  <div key={client.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{client.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{pct.toFixed(1)}%</span>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(clientSales)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'material' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-2">{t.repMatTitle}</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /><span className="text-xs text-slate-500 dark:text-slate-400">{t.rmIncoming.replace('↓ ', '')}</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /><span className="text-xs text-slate-500 dark:text-slate-400">{t.rmOutgoing.replace('↑ ', '')}</span></div>
            </div>
            <SimpleBarChart
              data={materialData}
              height={260}
              formatValue={v => formatNumber(v) + ' kg'}
              series={[
                { dataKey: 'incoming', name: t.rmIncoming.replace('↓ ', ''), color: '#3b82f6' },
                { dataKey: 'outgoing', name: t.rmOutgoing.replace('↑ ', ''), color: '#f97316' },
              ]}
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.repMatTable}</h3>
            </div>
            {filteredRawEntries.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-400 text-sm">{t.noData}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      {[t.colDate, t.colType, t.colAmount, t.colNote].map((h, i) => (
                        <th key={h} className={`text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 ${i === 3 ? 'hidden md:table-cell' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRawEntries.map((entry, idx) => (
                      <tr key={entry.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${idx % 2 !== 0 ? 'bg-slate-50/40 dark:bg-slate-800/40' : ''}`}>
                        <td className="px-4 py-3 text-xs text-slate-500">{entry.date}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${entry.type === 'incoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                            {entry.type === 'incoming' ? t.rmIncoming : t.rmOutgoing}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right text-sm font-semibold ${entry.type === 'incoming' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {entry.type === 'incoming' ? '+' : '-'}{formatNumber(entry.amount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell max-w-xs truncate">{entry.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}