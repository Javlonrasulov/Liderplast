import React, { useState } from 'react';
import { Plus, CheckCircle2, BarChart3 } from 'lucide-react';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatNumber, formatCurrency, formatDate, TODAY } from '../utils/format';

export function Expenses() {
  const { state, dispatch } = useERP();
  const { t, filterData } = useApp();
  const [activeType, setActiveType] = useState<'electricity' | 'caps' | 'packaging' | 'other'>('electricity');
  const [form, setForm] = useState({ machineId: 'm1', hours: '', powerKw: '', amount: '', description: '', date: TODAY });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const EXPENSE_TYPES = [
    { value: 'electricity', label: t.exElectricity, icon: '⚡', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'caps', label: t.exCaps, icon: '🔩', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'packaging', label: t.exPackaging, icon: '📦', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'other', label: t.exOther, icon: '💸', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
  ];

  const selectedMachine = state.machines.find(m => m.id === form.machineId);
  const hours = parseFloat(form.hours) || 0;
  const powerKw = parseFloat(form.powerKw) > 0 ? parseFloat(form.powerKw) : (selectedMachine?.powerKw || 0);
  const kWh = hours * powerKw;
  const electricityCost = kWh * state.electricityPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let amount = 0;
    let description = form.description;
    if (activeType === 'electricity') {
      if (!hours || hours <= 0) { setError(t.labelHours + '!'); return; }
      amount = electricityCost;
      description = `${selectedMachine?.name} - ${hours}h (${powerKw}kW × ${hours}h = ${kWh.toFixed(1)} kWh)`;
    } else {
      if (!form.amount || parseFloat(form.amount) <= 0) { setError(t.labelAmount + '!'); return; }
      amount = parseFloat(form.amount);
    }
    dispatch({ type: 'ADD_EXPENSE', payload: { type: activeType, amount, description, machineId: activeType === 'electricity' ? form.machineId : undefined, hours: activeType === 'electricity' ? hours : undefined, powerKw: activeType === 'electricity' ? powerKw : undefined, date: form.date } });
    setForm({ machineId: 'm1', hours: '', powerKw: '', amount: '', description: '', date: TODAY });
    setSuccess(`${t.successAdded}: ${formatCurrency(amount)}`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const filteredExpenses = filterData([...state.expenses]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalExpenses = state.expenses.reduce((s, e) => s + e.amount, 0);
  const byType = {
    electricity: state.expenses.filter(e => e.type === 'electricity').reduce((s, e) => s + e.amount, 0),
    caps: state.expenses.filter(e => e.type === 'caps').reduce((s, e) => s + e.amount, 0),
    packaging: state.expenses.filter(e => e.type === 'packaging').reduce((s, e) => s + e.amount, 0),
    other: state.expenses.filter(e => e.type === 'other').reduce((s, e) => s + e.amount, 0),
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {EXPENSE_TYPES.map(et => (
          <div key={et.value} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg font-medium mb-3 ${et.color}`}>{et.icon} {et.label}</div>
            <p className="text-slate-900 dark:text-white font-bold text-lg">{formatCurrency(byType[et.value as keyof typeof byType])}</p>
          </div>
        ))}
      </div>

      {/* Total bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-slate-500" />
          <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.exTotalLabel} {formatCurrency(totalExpenses)}</h3>
        </div>
        <div className="flex h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          {totalExpenses > 0 && Object.entries(byType).map(([key, val], i) => {
            const pct = (val / totalExpenses) * 100;
            const colors = ['bg-yellow-500', 'bg-blue-500', 'bg-orange-500', 'bg-slate-500'];
            return pct > 0 ? <div key={key} className={`${colors[i]}`} style={{ width: `${pct}%` }} /> : null;
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-2">
          {EXPENSE_TYPES.map((et, i) => {
            const textColors = ['text-yellow-600', 'text-blue-600', 'text-orange-600', 'text-slate-600'];
            const dotColors = ['bg-yellow-500', 'bg-blue-500', 'bg-orange-500', 'bg-slate-500'];
            const pct = totalExpenses > 0 ? ((byType[et.value as keyof typeof byType] / totalExpenses) * 100).toFixed(0) : 0;
            return (
              <div key={et.value} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${dotColors[i]}`} />
                <span className={`text-xs ${textColors[i]}`}>{et.label}: {pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center"><Plus size={16} className="text-white" /></div>
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.exFormTitle}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {EXPENSE_TYPES.map(et => (
              <button key={et.value} type="button" onClick={() => setActiveType(et.value as any)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${activeType === et.value ? 'bg-slate-800 text-white border-slate-600 dark:bg-slate-600' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                {et.icon} {et.label}
              </button>
            ))}
          </div>

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-700 dark:text-emerald-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelDate}</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            {activeType === 'electricity' ? (
              <>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelMachine}</label>
                  <select value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {state.machines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.powerKw} kW)</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelHours}</label>
                    <input type="number" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="0" min="0"
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelPower}</label>
                    <input type="number" value={form.powerKw || String(selectedMachine?.powerKw || '')} onChange={e => setForm({ ...form, powerKw: e.target.value })} placeholder={String(selectedMachine?.powerKw || '')}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
                {hours > 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-400 mb-2">{t.exCalcTitle}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.exKwh}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{powerKw} × {hours} = {kWh.toFixed(1)} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.exPricePerKwh} ({formatNumber(state.electricityPrice)} {t.unitSum}):</span>
                        <span className="font-bold text-yellow-700 dark:text-yellow-400">{formatCurrency(electricityCost)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.exColAmount} ({t.unitSum})</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelDesc}</label>
                  <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="..."
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </>
            )}
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div>}
            <button type="submit" className="w-full py-2.5 bg-slate-800 dark:bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              <Plus size={16} /> {t.exBtn}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.exHistory}</h3>
            <span className="text-xs text-slate-400">{filteredExpenses.length} {t.totalRecords}</span>
          </div>
          {filteredExpenses.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">{t.noData}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    {[t.colDate, t.colType, t.exColAmount, t.colNote].map((h, i) => (
                      <th key={h} className={`text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 ${i === 3 ? 'hidden md:table-cell' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, idx) => {
                    const et = EXPENSE_TYPES.find(tt => tt.value === expense.type);
                    return (
                      <tr key={expense.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${idx % 2 !== 0 ? 'bg-slate-50/40 dark:bg-slate-800/40' : ''}`}>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDate(expense.date)}</td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${et?.color}`}>{et?.icon} {et?.label}</span></td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-xs truncate">{expense.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-t-2 border-slate-200 dark:border-slate-600">
                    <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">{t.exTotalLabel}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{formatCurrency(totalExpenses)}</td>
                    <td className="hidden md:table-cell" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
