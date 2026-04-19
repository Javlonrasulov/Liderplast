import React, { useEffect, useMemo, useState } from 'react';
import { Plus, CheckCircle2, BarChart3, Pencil, Trash2, FolderPlus } from 'lucide-react';
import { useERP, type ExpenseCategory } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import {
  displayGroupedIntInput,
  formatNumber,
  formatCurrency,
  formatDate,
  parseDigitsFromAmountInput,
  TODAY,
} from '../utils/format';
import { formatShiftExpenseTableNote } from '../utils/shift-expense-description';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const CHART_BAR = [
  'bg-yellow-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-slate-500',
];

const BADGE_STYLES = [
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
];

function styleIndex(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % BADGE_STYLES.length;
}

function isElectricityCategory(c: ExpenseCategory) {
  return c.electricityCalc || c.legacyExpenseType === 'electricity';
}

export function Expenses() {
  const { state, dispatch } = useERP();
  const { t, filterData } = useApp();
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [form, setForm] = useState({
    machineId: '',
    hours: '',
    powerKw: '',
    amount: '',
    description: '',
    date: TODAY,
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [categoryDeleteId, setCategoryDeleteId] = useState<string | null>(null);

  const categories = state.expenseCategories;

  useEffect(() => {
    if (categories.length === 0) return;
    const stillValid = activeCategoryId && categories.some((c) => c.id === activeCategoryId);
    if (!stillValid) {
      const elec = categories.find((c) => isElectricityCategory(c));
      setActiveCategoryId(elec?.id ?? categories[0].id);
    }
  }, [categories, activeCategoryId]);

  useEffect(() => {
    if (state.machines.length === 0) return;
    setForm((f) => {
      const valid = state.machines.some((m) => m.id === f.machineId);
      if (valid) return f;
      return { ...f, machineId: state.machines[0].id };
    });
  }, [state.machines]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const isElectricity = activeCategory ? isElectricityCategory(activeCategory) : false;

  const effectiveMachineId = form.machineId || state.machines[0]?.id || '';
  const selectedMachine = state.machines.find((m) => m.id === effectiveMachineId);
  const hours = parseFloat(form.hours) || 0;
  const powerKw = parseFloat(form.powerKw) > 0 ? parseFloat(form.powerKw) : (selectedMachine?.powerKw || 0);
  const kWh = hours * powerKw;
  const pricePerKwh = state.payrollSettings.electricityPricePerKwh;
  const electricityCost = kWh * pricePerKwh;

  const filteredExpenses = useMemo(
    () =>
      filterData([...state.expenses]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [state.expenses, filterData],
  );

  /** Diagramma va yuqori kartalar — sana filtrisiz (barcha vaqt), tarix jadvali alohida filtrlangan */
  const statsSortedExpenses = useMemo(
    () => [...state.expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.expenses],
  );

  const totalTableFiltered = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalForStats = statsSortedExpenses.reduce((s, e) => s + e.amount, 0);

  const categoryStats = useMemo(() => {
    const map = new Map<string, { id: string; name: string; amount: number }>();
    for (const e of statsSortedExpenses) {
      const cid = e.categoryId || `legacy-${e.id}`;
      const name =
        e.type === 'electricity' || e.electricityCalc ? t.exElectricity : e.categoryName;
      const row = map.get(cid) ?? { id: cid, name, amount: 0 };
      row.name = name;
      row.amount += e.amount;
      map.set(cid, row);
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [statsSortedExpenses, t.exElectricity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!activeCategoryId) {
      setError(t.exNoCategories);
      return;
    }
    if (isElectricity && state.machines.length === 0) {
      setError(t.exNoMachinesElectric);
      return;
    }
    let amount = 0;
    let description = form.description;
    if (isElectricity) {
      if (!hours || hours <= 0) {
        setError(t.labelHours + '!');
        return;
      }
      amount = electricityCost;
      description = `${selectedMachine?.name} - ${hours}h (${powerKw}kW × ${hours}h = ${kWh.toFixed(1)} kWh)`;
    } else {
      const digits = form.amount.replace(/\D/g, '');
      const num = parseInt(digits, 10);
      if (!digits || !Number.isFinite(num) || num <= 0) {
        setError(t.labelAmount + '!');
        return;
      }
      amount = num;
    }
    void dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        categoryId: activeCategoryId,
        amount,
        description,
        machineId: isElectricity ? effectiveMachineId : undefined,
        hours: isElectricity ? hours : undefined,
        powerKw: isElectricity ? powerKw : undefined,
        date: form.date,
      },
    });
    setForm({
      machineId: state.machines[0]?.id ?? '',
      hours: '',
      powerKw: '',
      amount: '',
      description: '',
      date: TODAY,
    });
    setSuccess(`${t.successAdded}: ${formatCurrency(amount)}`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    void dispatch({ type: 'ADD_EXPENSE_CATEGORY', payload: { name } });
    setNewCategoryName('');
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    void dispatch({ type: 'UPDATE_EXPENSE_CATEGORY', payload: { id: editingId, name } });
    setEditingId(null);
  };

  const requestDeleteCategory = (id: string) => {
    setCategoryDeleteId(id);
  };

  const confirmDeleteCategory = () => {
    if (!categoryDeleteId) return;
    void dispatch({ type: 'DELETE_EXPENSE_CATEGORY', payload: categoryDeleteId });
    setCategoryDeleteId(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Summary cards — top categories */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryStats.length === 0 ? (
          <div className="col-span-2 lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm text-sm text-slate-500 dark:text-slate-400">
            {t.noData}
          </div>
        ) : (
          categoryStats.slice(0, 8).map((row) => {
            const si = styleIndex(row.id);
            return (
              <div
                key={row.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
              >
                <div
                  className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg font-medium mb-3 ${BADGE_STYLES[si]}`}
                >
                  {row.name}
                </div>
                <p className="text-slate-900 dark:text-white font-bold text-lg">{formatCurrency(row.amount)}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Total bar + legend + statistics table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-1 mb-1">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-slate-500" />
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm">
              {t.exTotalLabel} {formatCurrency(totalForStats)}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">{t.exPageStatsNote}</p>
        </div>
        <div className="flex h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          {totalForStats > 0 &&
            categoryStats.map((row, i) => {
              const pct = (row.amount / totalForStats) * 100;
              return pct > 0 ? (
                <div
                  key={row.id}
                  className={CHART_BAR[i % CHART_BAR.length]}
                  style={{ width: `${pct}%` }}
                  title={`${row.name}: ${formatCurrency(row.amount)}`}
                />
              ) : null;
            })}
        </div>
        <div className="flex flex-wrap gap-3">
          {categoryStats.map((row, i) => {
            const pct = totalForStats > 0 ? ((row.amount / totalForStats) * 100).toFixed(0) : '0';
            return (
              <div key={row.id} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${CHART_BAR[i % CHART_BAR.length]}`} />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {row.name}: {pct}% ({formatCurrency(row.amount)})
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">{t.exStatsByCategory}</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 w-10">{t.exStatsRank}</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">{t.colType}</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">{t.exColAmount}</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 hidden sm:table-cell">%</th>
                  <th className="hidden md:table-cell min-w-[120px]" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {categoryStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500 text-sm">
                      {t.noData}
                    </td>
                  </tr>
                ) : (
                  categoryStats.map((row, idx) => {
                    const pct = totalForStats > 0 ? (row.amount / totalForStats) * 100 : 0;
                    return (
                      <tr key={row.id} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="px-3 py-2 text-slate-500 text-xs">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
                        <td className="px-3 py-2 text-right font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(row.amount)}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                          {pct.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 hidden md:table-cell">
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${CHART_BAR[idx % CHART_BAR.length]}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.exFormTitle}</h3>
            </div>
            {categories.length === 0 ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">{t.exNoCategories}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {categories.map((c) => {
                  const active = activeCategoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCategoryId(c.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                        active
                          ? 'bg-slate-800 text-white border-slate-600 dark:bg-slate-600'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {isElectricityCategory(c) ? `⚡ ${c.name}` : c.name}
                    </button>
                  );
                })}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 dark:text-emerald-400 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelDate}</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              {isElectricity ? (
                <>
                  {state.machines.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
                      {t.exNoMachinesElectric}
                    </div>
                  ) : null}
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelMachine}</label>
                    <select
                      value={form.machineId || state.machines[0]?.id}
                      onChange={(e) => setForm({ ...form, machineId: e.target.value })}
                      disabled={state.machines.length === 0}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                    >
                      {state.machines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.powerKw} kW)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelHours}</label>
                      <input
                        type="number"
                        value={form.hours}
                        onChange={(e) => setForm({ ...form, hours: e.target.value })}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelPower}</label>
                      <input
                        type="number"
                        value={form.powerKw || String(selectedMachine?.powerKw || '')}
                        onChange={(e) => setForm({ ...form, powerKw: e.target.value })}
                        placeholder={String(selectedMachine?.powerKw || '')}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                  {hours > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                      <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-400 mb-2">{t.exCalcTitle}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.exKwh}</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {powerKw} × {hours} = {kWh.toFixed(1)} kWh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            {t.exPricePerKwh} ({formatNumber(pricePerKwh)} {t.unitSum}):
                          </span>
                          <span className="font-bold text-yellow-700 dark:text-yellow-400">{formatCurrency(electricityCost)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">
                      {t.exColAmount} ({t.unitSum})
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={displayGroupedIntInput(form.amount)}
                      onChange={(e) => {
                        const d = parseDigitsFromAmountInput(e.target.value);
                        if (d.length > 15) return;
                        setForm({ ...form, amount: d });
                      }}
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelDesc}</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="..."
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </>
              )}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={categories.length === 0 || (isElectricity && state.machines.length === 0)}
                className="w-full py-2.5 bg-slate-800 dark:bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Plus size={16} /> {t.exBtn}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <FolderPlus size={16} className="text-white" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.exCategoriesTitle}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t.exCategoryDeleteHint}</p>
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t.exCategoryName}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl"
              >
                {t.exCategoryAdd}
              </button>
            </form>
            <ul className="space-y-2">
              {categories.map((c) => {
                const si = styleIndex(c.id);
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600"
                  >
                    {editingId === c.id ? (
                      <>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                        />
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white"
                        >
                          {t.btnSave}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs px-2 py-1 rounded-lg bg-slate-500 text-white"
                        >
                          {t.btnCancel}
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium flex-1 ${BADGE_STYLES[si]}`}>{c.name}</span>
                        <button
                          type="button"
                          onClick={() => startEdit(c.id, c.name)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600"
                          aria-label={t.btnSave}
                        >
                          <Pencil size={16} />
                        </button>
                        {!isElectricityCategory(c) && (
                          <button
                            type="button"
                            onClick={() => requestDeleteCategory(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                            aria-label={t.exCategoryDelete}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.exHistory}</h3>
            <span className="text-xs text-slate-400">
              {filteredExpenses.length} {t.totalRecords}
            </span>
          </div>
          {filteredExpenses.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">{t.noData}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    {[t.colDate, t.colType, t.exColAmount, t.colNote].map((h, i) => (
                      <th
                        key={h}
                        className={`text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 ${i === 3 ? 'hidden md:table-cell' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, idx) => {
                    const si = styleIndex(expense.categoryId || expense.id);
                    const isElectricity =
                      expense.type === 'electricity' || Boolean(expense.electricityCalc);
                    const categoryLabel = isElectricity ? t.exElectricity : expense.categoryName;
                    const noteText = expense.sourceShiftId
                      ? formatShiftExpenseTableNote(expense.description, t)
                      : expense.description;
                    return (
                      <tr
                        key={expense.id}
                        className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${idx % 2 !== 0 ? 'bg-slate-50/40 dark:bg-slate-800/40' : ''}`}
                      >
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDate(expense.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${BADGE_STYLES[si]}`}>
                            {categoryLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            {expense.sourceShiftId ? (
                              <span className="shrink-0 text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                                {t.exFromShiftBadge}
                              </span>
                            ) : null}
                            <span className="truncate" title={noteText || undefined}>
                              {noteText}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-t-2 border-slate-200 dark:border-slate-600">
                    <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t.exTotalLabel}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                      {formatCurrency(totalTableFiltered)}
                    </td>
                    <td className="hidden md:table-cell" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={Boolean(categoryDeleteId)}
        onOpenChange={(open) => {
          if (!open) setCategoryDeleteId(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-md border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t.exCategoryDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t.exCategoryDeleteHint}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700">
              {t.btnCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500/30"
            >
              {t.exCategoryDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
