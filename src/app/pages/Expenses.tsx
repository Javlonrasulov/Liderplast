import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  CheckCircle2,
  BarChart3,
  Pencil,
  Trash2,
  FolderPlus,
  Table2,
  PieChart,
  BarChart2,
  Maximize2,
  X,
  TrendingUp,
  Wallet,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useERP, type Expense, type ExpenseCategory } from '../store/erp-store';
import type { T } from '../i18n/translations';
import { useApp } from '../i18n/app-context';
import {
  displayGroupedIntInput,
  formatNumber,
  formatCurrency,
  formatDate,
  parseDigitsFromAmountInput,
  todayYmd,
} from '../utils/format';
import { useCbuRates } from '../hooks/use-cbu-rates';
import { cbuUsdRate } from '../utils/sales-currency';
import { formatShiftExpenseTableNote } from '../utils/shift-expense-description';
import { formatExpenseHistoryNote } from '../utils/expense-history-note';
import {
  EXPENSE_CATEGORY_ID_RAW_MATERIAL_BAG_WRITEOFF,
  isRawMaterialExternalOrderExpense,
  isExpenseHistoryLocked,
  labelExpenseCategory,
  resolveExpenseCategoryNameFromState,
} from '../utils/expense-category-label';
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
import { SimpleDonutChart, CategoryExpenseHorizontalBars, CategoryExpenseRankedBars, SimpleAreaChart } from '../components/charts';
import { SingleDatePicker } from '../components/SingleDatePicker';
import { cn } from '../components/ui/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

/** To‘liq ekran tarix (z-130) ustida tasdiqlash / tahrir modallari */
const MODAL_OVER_FULLSCREEN = 'z-[140]';

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

/** `CHART_BAR` билан индекс бўйича мос (donut / горизонт. диаграмма) */
const EXPENSE_CATEGORY_CHART_HEX = [
  '#eab308',
  '#3b82f6',
  '#f97316',
  '#10b981',
  '#8b5cf6',
  '#f43f5e',
  '#06b6d4',
  '#f59e0b',
  '#64748b',
] as const;

type ExStatsChartView = 'table' | 'donut' | 'hbar';
type ExTrendPeriod = 'week' | 'month' | 'year';

const MONTH_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

function getWeekMondayKey(dateStr: string): string {
  const head = dateStr.trim().slice(0, 10);
  const d = new Date(`${head}T12:00:00`);
  if (Number.isNaN(d.getTime())) return head;
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function formatMonthLabel(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return ym;
  return `${MONTH_SHORT[parseInt(m[2], 10) - 1]} '${m[1].slice(2)}`;
}

function formatWeekLabel(weekKey: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(weekKey);
  if (!m) return weekKey;
  return `${m[3]}.${m[2]}`;
}

function expensePeriodKey(dateStr: string, period: ExTrendPeriod): string {
  const head = dateStr.trim().slice(0, 10);
  if (period === 'year') return head.slice(0, 4);
  if (period === 'month') return head.slice(0, 7);
  return getWeekMondayKey(head);
}

function formatPeriodLabel(key: string, period: ExTrendPeriod): string {
  if (period === 'year') return key;
  if (period === 'month') return formatMonthLabel(key);
  return formatWeekLabel(key);
}

function readStoredStatsChartView(): ExStatsChartView {
  try {
    const s = sessionStorage.getItem('erp_ex_stats_chart');
    if (s === 'table' || s === 'donut' || s === 'hbar') return s;
  } catch {
    /* ignore */
  }
  return 'table';
}

function styleIndex(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % BADGE_STYLES.length;
}

/** Qop chiqimi — sariqdan farq qiladi (diagramma / nishon) */
const BADGE_BAG_WRITEOFF =
  'bg-teal-100 text-teal-800 border border-teal-200/70 dark:bg-teal-950/45 dark:text-teal-100 dark:border-teal-800/50';
const CHART_BAR_BAG_WRITEOFF = 'bg-teal-500';
const CHART_HEX_BAG_WRITEOFF = '#0d9488';

function expenseCategoryBadgeClass(categoryId: string) {
  if (categoryId === EXPENSE_CATEGORY_ID_RAW_MATERIAL_BAG_WRITEOFF) return BADGE_BAG_WRITEOFF;
  return BADGE_STYLES[styleIndex(categoryId || 'x')];
}

function chartBarClassForCategory(categoryId: string, index: number) {
  if (categoryId === EXPENSE_CATEGORY_ID_RAW_MATERIAL_BAG_WRITEOFF) return CHART_BAR_BAG_WRITEOFF;
  return CHART_BAR[index % CHART_BAR.length];
}

function chartHexForCategory(categoryId: string, index: number) {
  if (categoryId === EXPENSE_CATEGORY_ID_RAW_MATERIAL_BAG_WRITEOFF) return CHART_HEX_BAG_WRITEOFF;
  return EXPENSE_CATEGORY_CHART_HEX[index % EXPENSE_CATEGORY_CHART_HEX.length];
}

const FUNDING_SOURCE_CHART_HEX = [
  '#6366f1',
  '#0ea5e9',
  '#14b8a6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#64748b',
] as const;

function fundingSourceHex(index: number) {
  return FUNDING_SOURCE_CHART_HEX[index % FUNDING_SOURCE_CHART_HEX.length];
}

function isElectricityCategory(c: ExpenseCategory) {
  return c.electricityCalc || c.legacyExpenseType === 'electricity';
}

function formatUsdMoney(amount: number): string {
  if (!Number.isFinite(amount)) return '$0';
  return (
    '$' +
    new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  );
}

function formatExpenseDisplay(amountUzs: number, mode: 'UZS' | 'USD', usdRate: number): string {
  if (mode === 'USD') {
    if (!(usdRate > 0)) return '—';
    return formatUsdMoney(amountUzs / usdRate);
  }
  return formatCurrency(amountUzs);
}

/** Tarix jadvali: kiritilgan valyuta + kurs + so‘m ekvivalenti */
function ExpenseMoneyDetails({ expense, t }: { expense: Expense; t: T }) {
  const currency = expense.currency === 'USD' ? 'USD' : 'UZS';
  const original =
    expense.amountOriginal != null && Number.isFinite(expense.amountOriginal)
      ? expense.amountOriginal
      : expense.amount;
  const fx = expense.fxRateToUzs != null && expense.fxRateToUzs > 0 ? expense.fxRateToUzs : 1;
  const uzs = expense.amount;

  if (currency === 'UZS') {
    return (
      <div className="text-right">
        <div className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
          {formatCurrency(uzs)}
        </div>
        <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          UZS
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[9.5rem] text-right">
      <div className="text-[10px] text-slate-400">{t.exHistoryOriginal}</div>
      <div className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
        {formatUsdMoney(original)}
      </div>
      <div className="mt-0.5 space-y-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
        <div>
          {t.exHistoryFxShort}: {formatNumber(fx)}
        </div>
        <div className="font-semibold tabular-nums text-red-600 dark:text-red-400">
          {t.exHistoryUzsEq}: {formatCurrency(uzs)}
        </div>
      </div>
    </div>
  );
}

function expenseUserAuditLines(expense: Expense, t: T): string[] {
  const lines: string[] = [];
  const created = expense.createdByName?.trim();
  const updated = expense.updatedByName?.trim();
  if (created) {
    lines.push(t.exAuditCreated.replace('{name}', created));
  }
  if (updated && updated !== created) {
    lines.push(t.exAuditUpdated.replace('{name}', updated));
  }
  return lines;
}

function ExpenseHistoryTableView({
  expenses,
  categories,
  t,
  totalFiltered,
  wideNote,
  onEdit,
  onDelete,
}: {
  expenses: Expense[];
  categories: ExpenseCategory[];
  t: T;
  totalFiltered: number;
  wideNote: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}) {
  const noteCol = wideNote ? 'table-cell max-w-[min(48rem,55vw)]' : 'hidden md:table-cell max-w-xs';
  if (expenses.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400 lg:h-48">{t.noData}</div>
    );
  }
  return (
    <div className="min-h-0 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-700/50">
            {[
              t.colDate,
              t.colType,
              t.exHistoryColFundingSource,
              t.exColAmount,
              t.exHistoryColUser,
              t.colNote,
              t.exHistoryColActions,
            ].map((h, i) => (
              <th
                key={h}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 ${
                  i === 5
                    ? noteCol
                    : i === 6
                      ? 'text-right w-24'
                      : i === 3
                        ? 'text-right min-w-[10rem]'
                        : i === 4
                          ? 'hidden sm:table-cell min-w-[8rem]'
                          : i === 2
                            ? 'hidden lg:table-cell'
                            : ''
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, idx) => {
            const isElectricity = expense.type === 'electricity' || Boolean(expense.electricityCalc);
            const dbName = resolveExpenseCategoryNameFromState(
              expense.categoryId,
              expense.categoryName,
              categories,
            );
            const categoryLabel = isElectricity
              ? t.exElectricity
              : labelExpenseCategory(expense.categoryId, dbName, t);
            const rawNote = expense.sourceShiftId
              ? formatShiftExpenseTableNote(expense.description, t)
              : expense.description;
            const noteText = formatExpenseHistoryNote(rawNote, t);
            const locked = isExpenseHistoryLocked(expense, categories);
            const auditLines = expenseUserAuditLines(expense, t);
            return (
              <tr
                key={expense.id}
                className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${idx % 2 !== 0 ? 'bg-slate-50/40 dark:bg-slate-800/40' : ''}`}
              >
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDate(expense.date)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${expenseCategoryBadgeClass(expense.categoryId || expense.id)}`}
                  >
                    {categoryLabel}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-xs text-slate-600 dark:text-slate-300 lg:table-cell">
                  {expense.fundingSourceName ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                      <Wallet size={12} className="shrink-0 opacity-70" />
                      {expense.fundingSourceName}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <ExpenseMoneyDetails expense={expense} t={t} />
                  {auditLines.length > 0 ? (
                    <div className="mt-1.5 space-y-0.5 text-left text-[10px] leading-snug text-slate-500 sm:hidden">
                      {auditLines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  ) : null}
                </td>
                <td className="hidden px-4 py-3 text-xs text-slate-600 dark:text-slate-300 sm:table-cell">
                  {auditLines.length > 0 ? (
                    <div className="space-y-0.5">
                      {auditLines.map((line) => (
                        <div key={line} className="leading-snug">
                          {line}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className={`px-4 py-3 text-xs text-slate-500 dark:text-slate-400 ${noteCol}`}>
                  <div className="flex min-w-0 items-start gap-2">
                    {expense.sourceShiftId ? (
                      <span className="mt-0.5 shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                        {t.exFromShiftBadge}
                      </span>
                    ) : null}
                    <span className={wideNote ? 'min-w-0 whitespace-pre-wrap break-words' : 'truncate'} title={wideNote ? undefined : noteText || undefined}>
                      {noteText}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {!locked ? (
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(expense)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        aria-label={t.exExpenseEditTitle}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(expense)}
                        className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
                        aria-label={t.exCategoryDelete}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700/50">
            <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t.exTotalLabel}
            </td>
            <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{formatCurrency(totalFiltered)}</td>
            <td className="hidden sm:table-cell" />
            <td className={noteCol} />
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function Expenses() {
  const { state, dispatch } = useERP();
  const { t, filterData, isFiltered, filterLabel } = useApp();
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [activeFundingSourceId, setActiveFundingSourceId] = useState('');
  const [form, setForm] = useState({
    amount: '',
    description: '',
    date: todayYmd(),
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [categoryDeleteId, setCategoryDeleteId] = useState<string | null>(null);
  const [newFundingSourceName, setNewFundingSourceName] = useState('');
  const [fundingEditingId, setFundingEditingId] = useState<string | null>(null);
  const [fundingEditName, setFundingEditName] = useState('');
  const [fundingDeleteId, setFundingDeleteId] = useState<string | null>(null);
  const [statsChartView, setStatsChartView] = useState<ExStatsChartView>(readStoredStatsChartView);
  const [trendPeriod, setTrendPeriod] = useState<ExTrendPeriod>('month');
  const [historyFullscreen, setHistoryFullscreen] = useState(false);
  const [expenseEdit, setExpenseEdit] = useState<Expense | null>(null);
  const [expenseEditForm, setExpenseEditForm] = useState({
    categoryId: '',
    fundingSourceId: '',
    amount: '',
    description: '',
    date: todayYmd(),
    currency: 'UZS' as 'UZS' | 'USD',
    fxRate: '1',
  });
  const [expenseEditFxFromBank, setExpenseEditFxFromBank] = useState(true);
  const [expenseEditError, setExpenseEditError] = useState('');
  const [expenseDeleteId, setExpenseDeleteId] = useState<string | null>(null);
  const [expenseDeleteError, setExpenseDeleteError] = useState('');
  const [expenseDeleteBusy, setExpenseDeleteBusy] = useState(false);
  /** Umumiy xarajatlar — default yopiq */
  const [overviewOpen, setOverviewOpen] = useState(false);
  /** Pul manbai hisobotidagi tarix — default yopiq */
  const [fundingHistoryOpen, setFundingHistoryOpen] = useState(false);
  const [formCurrency, setFormCurrency] = useState<'UZS' | 'USD'>('UZS');
  const [formFxRate, setFormFxRate] = useState('');
  const [fxFromBank, setFxFromBank] = useState(true);
  const [overviewCurrency, setOverviewCurrency] = useState<'UZS' | 'USD'>('UZS');

  const { usd: cbuUsd, loading: cbuLoading, error: cbuError, refetch: refetchCbu } = useCbuRates();
  const bankUsdRate = cbuUsdRate(cbuUsd);

  const categories = state.expenseCategories;
  const fundingSources = state.expenseFundingSources;

  /** Qo‘lda kiritish: tashqi buyurtma kategoriyasi faqat buyurtma yaratilganda xarajatga tushadi */
  const manualExpenseCategories = useMemo(
    () =>
      categories.filter(
        (c) => !isRawMaterialExternalOrderExpense({ categoryId: c.id, categoryName: c.name }, categories),
      ),
    [categories],
  );

  useEffect(() => {
    try {
      sessionStorage.setItem('erp_ex_stats_chart', statsChartView);
    } catch {
      /* ignore */
    }
  }, [statsChartView]);

  useEffect(() => {
    if (!historyFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHistoryFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [historyFullscreen]);

  useEffect(() => {
    if (!historyFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [historyFullscreen]);

  useEffect(() => {
    if (manualExpenseCategories.length === 0) return;
    const stillValid =
      activeCategoryId && manualExpenseCategories.some((c) => c.id === activeCategoryId);
    if (!stillValid) {
      const elec = manualExpenseCategories.find((c) => isElectricityCategory(c));
      setActiveCategoryId(elec?.id ?? manualExpenseCategories[0].id);
    }
  }, [manualExpenseCategories, activeCategoryId]);

  useEffect(() => {
    if (fundingSources.length === 0) return;
    const stillValid =
      activeFundingSourceId && fundingSources.some((s) => s.id === activeFundingSourceId);
    if (!stillValid) {
      setActiveFundingSourceId(fundingSources[0].id);
    }
  }, [fundingSources, activeFundingSourceId]);

  useEffect(() => {
    if (formCurrency !== 'USD') return;
    if (!fxFromBank) return;
    if (bankUsdRate > 0) {
      setFormFxRate(String(bankUsdRate));
    }
  }, [formCurrency, fxFromBank, bankUsdRate]);

  useEffect(() => {
    if (!expenseEdit) return;
    if (expenseEditForm.currency !== 'USD') return;
    if (!expenseEditFxFromBank) return;
    if (bankUsdRate > 0) {
      setExpenseEditForm((prev) => ({ ...prev, fxRate: String(bankUsdRate) }));
    }
  }, [expenseEdit, expenseEditForm.currency, expenseEditFxFromBank, bankUsdRate]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const isElectricity = activeCategory ? isElectricityCategory(activeCategory) : false;

  const filteredExpenses = useMemo(
    () =>
      filterData([...state.expenses]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [state.expenses, filterData],
  );

  /** Diagramma va kartalar — sana tanlangan bo‘lsa filtrlangan, aks holda barcha vaqt */
  const statsSortedExpenses = useMemo(
    () =>
      isFiltered
        ? filteredExpenses
        : [...state.expenses].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
    [state.expenses, filteredExpenses, isFiltered],
  );

  const totalTableFiltered = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalForStats = statsSortedExpenses.reduce((s, e) => s + e.amount, 0);
  const overviewUsdRate = bankUsdRate > 0 ? bankUsdRate : 0;
  const fmtOverview = (uzs: number) =>
    formatExpenseDisplay(uzs, overviewCurrency, overviewUsdRate);

  const categoryStats = useMemo(() => {
    const map = new Map<string, { id: string; name: string; amount: number }>();
    for (const e of statsSortedExpenses) {
      const cid = e.categoryId || `legacy-${e.id}`;
      const dbName = resolveExpenseCategoryNameFromState(e.categoryId, e.categoryName, categories);
      const piece =
        e.type === 'electricity' || e.electricityCalc
          ? t.exElectricity
          : labelExpenseCategory(e.categoryId, dbName, t);
      const row = map.get(cid) ?? { id: cid, name: '', amount: 0 };
      /* Ba’zi API yozuvlarida categoryName bo‘sh; oxirgi (eskiroq) yozuv nomni «ёқотиб» қўймасин */
      row.name = piece.trim() ? piece : row.name;
      row.amount += e.amount;
      map.set(cid, row);
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [statsSortedExpenses, t, categories]);

  const categoryChartRows = useMemo(
    () =>
      categoryStats.map((row, i) => ({
        name: row.name,
        value: row.amount,
        color: chartHexForCategory(row.id, i),
      })),
    [categoryStats],
  );

  const expenseTrend = useMemo(() => {
    const topCats = categoryStats.slice(0, 5);
    if (topCats.length === 0) return { data: [] as Record<string, string | number>[], series: [] as { dataKey: string; name: string; color: string; gradId: string }[] };

    const periodKeys = new Set<string>();
    for (const e of statsSortedExpenses) {
      if (e.date) periodKeys.add(expensePeriodKey(e.date, trendPeriod));
    }
    const limit = trendPeriod === 'year' ? 4 : trendPeriod === 'month' ? 8 : 10;
    const keys = [...periodKeys].sort().slice(-limit);

    const data = keys.map((key) => {
      const row: Record<string, string | number> = { date: formatPeriodLabel(key, trendPeriod) };
      for (const cat of topCats) {
        const sum = statsSortedExpenses
          .filter(
            (e) =>
              e.date &&
              expensePeriodKey(e.date, trendPeriod) === key &&
              (e.categoryId || `legacy-${e.id}`) === cat.id,
          )
          .reduce((s, e) => s + e.amount, 0);
        row[`cat_${cat.id}`] = sum;
      }
      return row;
    });

    const series = topCats.map((cat, i) => ({
      dataKey: `cat_${cat.id}`,
      name: cat.name,
      color: chartHexForCategory(cat.id, i),
      gradId: `ex-trend-${cat.id.replace(/[^a-zA-Z0-9]/g, '')}`,
    }));

    return { data, series };
  }, [statsSortedExpenses, categoryStats, trendPeriod]);

  const fundingSourceStats = useMemo(() => {
    const map = new Map<string, { id: string; name: string; amount: number; count: number }>();
    for (const e of statsSortedExpenses) {
      if (!e.fundingSourceId) continue;
      const sid = e.fundingSourceId;
      const name = e.fundingSourceName?.trim() || sid;
      const row = map.get(sid) ?? { id: sid, name, amount: 0, count: 0 };
      row.name = name;
      row.amount += e.amount;
      row.count += 1;
      map.set(sid, row);
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [statsSortedExpenses]);

  const fundingChartRows = useMemo(
    () =>
      fundingSourceStats.map((row, i) => ({
        name: row.name,
        value: row.amount,
        color: fundingSourceHex(i),
      })),
    [fundingSourceStats],
  );

  const totalFundingTracked = fundingSourceStats.reduce((s, r) => s + r.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!activeCategoryId) {
      setError(t.exNoCategories);
      return;
    }
    if (!activeFundingSourceId) {
      setError(t.exFundingSourceRequired);
      return;
    }
    if (
      isRawMaterialExternalOrderExpense(
        { categoryId: activeCategoryId, categoryName: activeCategory?.name },
        categories,
      )
    ) {
      setError(t.exExternalOrderManualBlocked);
      return;
    }

    let amountOriginal = 0;
    if (formCurrency === 'UZS') {
      const digits = form.amount.replace(/\D/g, '');
      amountOriginal = parseInt(digits, 10);
      if (!digits || !Number.isFinite(amountOriginal) || amountOriginal <= 0) {
        setError(t.labelAmount + '!');
        return;
      }
    } else {
      const cleaned = form.amount.replace(/\s/g, '').replace(',', '.');
      amountOriginal = parseFloat(cleaned);
      if (!Number.isFinite(amountOriginal) || amountOriginal <= 0) {
        setError(t.labelAmount + '!');
        return;
      }
    }

    let fx = 1;
    if (formCurrency === 'USD') {
      fx = parseFloat(String(formFxRate).replace(',', '.'));
      if (!Number.isFinite(fx) || fx <= 0) {
        setError(t.exUsdRateMissing);
        return;
      }
    }

    const amountUzs =
      formCurrency === 'UZS'
        ? amountOriginal
        : Math.round(amountOriginal * fx * 100) / 100;

    try {
      await dispatch({
        type: 'ADD_EXPENSE',
        payload: {
          categoryId: activeCategoryId,
          fundingSourceId: activeFundingSourceId,
          amount: amountOriginal,
          currency: formCurrency,
          fxRateToUzs: fx,
          description: form.description,
          date: form.date,
        },
      });
      setForm({
        amount: '',
        description: '',
        date: todayYmd(),
      });
      setSuccess(
        `${t.successAdded}: ${
          formCurrency === 'USD'
            ? `${formatUsdMoney(amountOriginal)} (${formatCurrency(amountUzs)})`
            : formatCurrency(amountUzs)
        }`,
      );
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
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

  const handleAddFundingSource = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFundingSourceName.trim();
    if (!name) return;
    void dispatch({ type: 'ADD_EXPENSE_FUNDING_SOURCE', payload: { name } });
    setNewFundingSourceName('');
  };

  const startFundingEdit = (id: string, name: string) => {
    setFundingEditingId(id);
    setFundingEditName(name);
  };

  const saveFundingEdit = () => {
    if (!fundingEditingId) return;
    const name = fundingEditName.trim();
    if (!name) return;
    void dispatch({ type: 'UPDATE_EXPENSE_FUNDING_SOURCE', payload: { id: fundingEditingId, name } });
    setFundingEditingId(null);
  };

  const requestDeleteFundingSource = (id: string) => {
    setFundingDeleteId(id);
  };

  const confirmDeleteFundingSource = () => {
    if (!fundingDeleteId) return;
    void dispatch({ type: 'DELETE_EXPENSE_FUNDING_SOURCE', payload: fundingDeleteId });
    setFundingDeleteId(null);
  };

  const openExpenseEdit = (expense: Expense) => {
    if (isExpenseHistoryLocked(expense, categories)) return;
    const currency = expense.currency === 'USD' ? 'USD' : 'UZS';
    const original =
      expense.amountOriginal != null && Number.isFinite(expense.amountOriginal)
        ? expense.amountOriginal
        : expense.amount;
    const fx =
      currency === 'USD' && expense.fxRateToUzs && expense.fxRateToUzs > 0
        ? expense.fxRateToUzs
        : bankUsdRate > 0
          ? bankUsdRate
          : 1;
    setExpenseEdit(expense);
    setExpenseEditError('');
    setExpenseEditFxFromBank(currency === 'USD');
    setExpenseEditForm({
      categoryId: expense.categoryId,
      fundingSourceId: expense.fundingSourceId ?? fundingSources[0]?.id ?? '',
      amount:
        currency === 'USD'
          ? String(original)
          : String(Math.round(original)),
      description: expense.description ?? '',
      date: expense.date,
      currency,
      fxRate: String(fx),
    });
  };

  const saveExpenseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseEdit) return;
    setExpenseEditError('');

    let amountOriginal = 0;
    if (expenseEditForm.currency === 'UZS') {
      const digits = expenseEditForm.amount.replace(/\D/g, '');
      amountOriginal = parseInt(digits, 10);
      if (!digits || !Number.isFinite(amountOriginal) || amountOriginal <= 0) {
        setExpenseEditError(t.labelAmount + '!');
        return;
      }
    } else {
      const cleaned = expenseEditForm.amount.replace(/\s/g, '').replace(',', '.');
      amountOriginal = parseFloat(cleaned);
      if (!Number.isFinite(amountOriginal) || amountOriginal <= 0) {
        setExpenseEditError(t.labelAmount + '!');
        return;
      }
    }

    let fx = 1;
    if (expenseEditForm.currency === 'USD') {
      fx = parseFloat(String(expenseEditForm.fxRate).replace(',', '.'));
      if (!Number.isFinite(fx) || fx <= 0) {
        setExpenseEditError(t.exUsdRateMissing);
        return;
      }
    }

    if (!expenseEditForm.categoryId) {
      setExpenseEditError(t.exNoCategories);
      return;
    }
    if (!expenseEditForm.fundingSourceId) {
      setExpenseEditError(t.exFundingSourceRequired);
      return;
    }
    try {
      await dispatch({
        type: 'UPDATE_EXPENSE',
        payload: {
          id: expenseEdit.id,
          categoryId: expenseEditForm.categoryId,
          fundingSourceId: expenseEditForm.fundingSourceId,
          amount: amountOriginal,
          currency: expenseEditForm.currency,
          fxRateToUzs: fx,
          description: expenseEditForm.description,
          date: expenseEditForm.date,
        },
      });
      setExpenseEdit(null);
      setSuccess(t.btnSave + ' ✓');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setExpenseEditError(err instanceof Error ? err.message : 'Error');
    }
  };

  const requestDeleteExpense = (expense: Expense) => {
    if (isExpenseHistoryLocked(expense, categories)) return;
    setExpenseDeleteError('');
    setExpenseDeleteId(expense.id);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseDeleteId || expenseDeleteBusy) return;
    setExpenseDeleteError('');
    setExpenseDeleteBusy(true);
    try {
      await dispatch({ type: 'DELETE_EXPENSE', payload: expenseDeleteId });
      setExpenseDeleteId(null);
      setSuccess(t.exCategoryDelete + ' ✓');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setExpenseDeleteError(err instanceof Error ? err.message : 'Error');
    } finally {
      setExpenseDeleteBusy(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Умумий харажатлар — default yopiq */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setOverviewOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 border-b border-red-100/80 bg-gradient-to-br from-red-50 via-white to-orange-50/60 px-5 py-4 text-left transition-colors hover:from-red-50/90 dark:border-red-900/30 dark:from-red-950/25 dark:via-slate-800 dark:to-slate-800 sm:px-6"
          aria-expanded={overviewOpen}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <BarChart3 size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {t.exTotalLabel.replace(':', '')}
              </h2>
              <p className="truncate text-lg font-bold tabular-nums text-red-700 dark:text-red-300 sm:text-xl">
                {fmtOverview(totalForStats)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className="inline-flex rounded-xl border border-slate-200 bg-white/80 p-0.5 dark:border-slate-600 dark:bg-slate-800"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {(
                [
                  { key: 'UZS' as const, label: t.exDisplayUzs },
                  { key: 'USD' as const, label: t.exDisplayUsd },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverviewCurrency(key);
                    if (key === 'USD' && !(bankUsdRate > 0)) void refetchCbu();
                  }}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                    overviewCurrency === key
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {overviewOpen ? t.exSectionCollapse : t.exSectionExpand}
              {overviewOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </div>
        </button>

        {overviewOpen ? (
          <>
        {/* Hero details */}
        <div className="border-b border-red-100/80 bg-gradient-to-br from-red-50/40 via-white to-orange-50/30 px-5 py-5 dark:border-red-900/20 dark:from-red-950/15 dark:via-slate-800 dark:to-slate-800 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-2xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {t.exPageStatsNote}
            </p>
            <div className="flex shrink-0 flex-wrap gap-2">
              {categoryStats.slice(0, 3).map((row) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-900/40"
                >
                  <p className="max-w-[9rem] truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {row.name}
                  </p>
                  <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                    {totalForStats > 0 ? ((row.amount / totalForStats) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stacked progress bar */}
          {totalForStats > 0 && categoryStats.length > 0 && (
            <div className="mt-5">
              <div className="flex h-3 overflow-hidden rounded-full bg-slate-200/70 shadow-inner dark:bg-slate-700">
                {categoryStats.map((row, i) => {
                  const pct = (row.amount / totalForStats) * 100;
                  return pct > 0 ? (
                    <div
                      key={row.id}
                      className={`h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full ${chartBarClassForCategory(row.id, i)}`}
                      style={{ width: `${pct}%` }}
                      title={`${row.name}: ${fmtOverview(row.amount)}`}
                    />
                  ) : null;
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {categoryStats.map((row, i) => {
                  const pct = totalForStats > 0 ? ((row.amount / totalForStats) * 100).toFixed(0) : '0';
                  return (
                    <div key={row.id} className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${chartBarClassForCategory(row.id, i)}`} />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        {row.name}: <span className="font-semibold">{pct}%</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Donut + top categories */}
        <div className="grid grid-cols-1 gap-5 border-b border-slate-200/80 p-5 dark:border-slate-700/80 lg:grid-cols-2 lg:p-6">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-600/60 dark:bg-slate-900/20">
            <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">{t.exStatsByCategory}</h3>
            {categoryStats.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">{t.noData}</p>
            ) : (
              <div className="flex flex-col items-center gap-5 min-[420px]:flex-row min-[420px]:items-start">
                <div className="relative shrink-0">
                  <SimpleDonutChart
                    data={categoryChartRows.map((r) => ({ name: r.name, value: r.value }))}
                    colors={categoryChartRows.map((r) => r.color)}
                    size={168}
                  />
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {t.exColAmount}
                    </span>
                    <span className="max-w-[5.5rem] text-center text-xs font-bold tabular-nums leading-tight text-slate-800 dark:text-slate-100">
                      {fmtOverview(totalForStats)}
                    </span>
                  </div>
                </div>
                <div className="w-full min-w-0 flex-1 space-y-2">
                  {categoryChartRows.map((row, i) => {
                    const pct = totalForStats > 0 ? ((row.value / totalForStats) * 100).toFixed(1) : '0';
                    return (
                      <div
                        key={`${row.name}-${i}`}
                        className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 dark:bg-slate-800/60"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                          <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{row.name}</span>
                        </div>
                        <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                          {pct}% · {fmtOverview(row.value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-600/60 dark:bg-slate-900/20">
            <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">{t.exTopCategories}</h3>
            {categoryStats.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">{t.noData}</p>
            ) : (
              <CategoryExpenseRankedBars
                items={categoryChartRows}
                formatValue={fmtOverview}
                total={totalForStats}
                maxItems={5}
              />
            )}
          </div>
        </div>

        {/* Trend chart */}
        <div className="border-b border-slate-200/80 p-5 dark:border-slate-700/80 lg:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t.exTrendTitle}</h3>
            </div>
            <div
              className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-900/50"
              role="tablist"
              aria-label={t.exTrendTitle}
            >
              {(
                [
                  { key: 'week' as const, label: t.exTrendWeek },
                  { key: 'month' as const, label: t.exTrendMonth },
                  { key: 'year' as const, label: t.exTrendYear },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={trendPeriod === key}
                  onClick={() => setTrendPeriod(key)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    trendPeriod === key
                      ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {expenseTrend.series.length === 0 || expenseTrend.data.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">{t.noData}</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {expenseTrend.series.map((s) => (
                  <span
                    key={s.dataKey}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <span className="h-2 w-4 rounded-sm" style={{ background: s.color }} />
                    {s.name}
                  </span>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-600/60 dark:bg-slate-900/20 sm:p-4">
                <SimpleAreaChart
                  data={expenseTrend.data}
                  series={expenseTrend.series}
                  height={260}
                  formatValue={fmtOverview}
                />
              </div>
            </>
          )}
        </div>

        {/* Detailed stats with view switcher */}
        <div className="p-5 lg:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{t.exStatsByCategory}</h4>
            <div
              className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-900/50"
              role="tablist"
              aria-label={t.exStatsByCategory}
            >
              {(
                [
                  { key: 'table' as const, label: t.exStatsViewTable, icon: Table2 },
                  { key: 'donut' as const, label: t.exStatsViewDonut, icon: PieChart },
                  { key: 'hbar' as const, label: t.exStatsViewBars, icon: BarChart2 },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={statsChartView === key}
                  onClick={() => setStatsChartView(key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3',
                    statsChartView === key
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
                  )}
                >
                  <Icon size={14} className="shrink-0 opacity-80" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {statsChartView === 'table' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    <th className="w-10 px-3 py-2 text-left text-xs font-semibold text-slate-500">{t.exStatsRank}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{t.colType}</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">{t.exColAmount}</th>
                    <th className="hidden px-3 py-2 text-right text-xs font-semibold text-slate-500 sm:table-cell">%</th>
                    <th className="hidden min-w-[120px] md:table-cell" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                        {t.noData}
                      </td>
                    </tr>
                  ) : (
                    categoryStats.map((row, idx) => {
                      const pct = totalForStats > 0 ? (row.amount / totalForStats) * 100 : 0;
                      return (
                        <tr key={row.id} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="px-3 py-2 text-xs text-slate-500">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
                          <td className="px-3 py-2 text-right font-semibold text-red-600 dark:text-red-400">
                            {fmtOverview(row.amount)}
                          </td>
                          <td className="hidden px-3 py-2 text-right text-slate-600 dark:text-slate-300 sm:table-cell">
                            {pct.toFixed(1)}%
                          </td>
                          <td className="hidden px-3 py-2 md:table-cell">
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                              <div
                                className={`h-full ${chartBarClassForCategory(row.id, idx)}`}
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
          )}

          {statsChartView === 'donut' &&
            (categoryStats.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">{t.noData}</p>
            ) : (
              <div className="flex flex-col items-stretch gap-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-600 dark:bg-slate-900/20 md:flex-row md:items-center">
                <div className="flex shrink-0 justify-center md:justify-start">
                  <SimpleDonutChart
                    data={categoryChartRows.map((r) => ({ name: r.name, value: r.value }))}
                    colors={categoryChartRows.map((r) => r.color)}
                    size={188}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {categoryChartRows.map((row, i) => {
                    const pct = totalForStats > 0 ? ((row.value / totalForStats) * 100).toFixed(1) : '0';
                    return (
                      <div key={`${row.name}-${i}`} className="flex items-start gap-2 text-xs">
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        <span className="min-w-0 flex-1 leading-snug text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-slate-800 dark:text-slate-100">{row.name}</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {' '}
                            — {pct}% · {fmtOverview(row.value)}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          {statsChartView === 'hbar' &&
            (categoryStats.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">{t.noData}</p>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-600 dark:bg-slate-900/20">
                <CategoryExpenseHorizontalBars
                  items={categoryChartRows}
                  formatValue={fmtOverview}
                  total={totalForStats}
                />
              </div>
            ))}
        </div>
          </>
        ) : null}
      </div>

      {/* Pul manbai bo'yicha hisobot */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-800">
        <div className="border-b border-indigo-100/80 bg-gradient-to-br from-indigo-50 via-white to-sky-50/60 px-5 py-5 dark:border-indigo-900/30 dark:from-indigo-950/25 dark:via-slate-800 dark:to-slate-800 sm:px-6">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
              {t.exFundingReportTitle}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.exPageStatsNote}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2 lg:p-6">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-600/60 dark:bg-slate-900/20">
            {fundingSourceStats.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">{t.noData}</p>
            ) : (
              <CategoryExpenseRankedBars
                items={fundingChartRows}
                formatValue={formatCurrency}
                total={totalFundingTracked}
                maxItems={8}
              />
            )}
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-600/60 dark:bg-slate-900/20">
            {fundingSourceStats.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">{t.noData}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{t.exFundingSourceName}</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">{t.exColAmount}</th>
                      <th className="hidden px-3 py-2 text-right text-xs font-semibold text-slate-500 sm:table-cell">#</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundingSourceStats.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
                        <td className="px-3 py-2 text-right font-semibold text-indigo-700 dark:text-indigo-300">
                          {formatCurrency(row.amount)}
                        </td>
                        <td className="hidden px-3 py-2 text-right text-slate-500 sm:table-cell">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {fundingSourceStats.length > 0 && (
          <div className="border-t border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setFundingHistoryOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30 lg:px-6"
              aria-expanded={fundingHistoryOpen}
            >
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{t.exHistory}</h4>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {fundingHistoryOpen ? t.exSectionCollapse : t.exSectionExpand}
                {fundingHistoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            </button>
            {fundingHistoryOpen ? (
              <div className="px-5 pb-5 dark:border-slate-700/80 lg:px-6 lg:pb-6">
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50">
                        {[t.colDate, t.exFundingSourceName, t.colType, t.exColAmount].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {statsSortedExpenses
                        .filter((e) => e.fundingSourceId)
                        .slice(0, 20)
                        .map((expense) => {
                          const dbName = resolveExpenseCategoryNameFromState(
                            expense.categoryId,
                            expense.categoryName,
                            categories,
                          );
                          const categoryLabel =
                            expense.type === 'electricity' || expense.electricityCalc
                              ? t.exElectricity
                              : labelExpenseCategory(expense.categoryId, dbName, t);
                          return (
                            <tr key={expense.id} className="border-t border-slate-100 dark:border-slate-700">
                              <td className="px-3 py-2 text-xs text-slate-500">{formatDate(expense.date)}</td>
                              <td className="px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                {expense.fundingSourceName ?? '—'}
                              </td>
                              <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">{categoryLabel}</td>
                              <td className="px-3 py-2 text-right align-top">
                                <ExpenseMoneyDetails expense={expense} t={t} />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        )}
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
            {manualExpenseCategories.length === 0 ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">{t.exNoCategories}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {manualExpenseCategories.map((c) => {
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
                      {isElectricityCategory(c)
                        ? `⚡ ${labelExpenseCategory(c.id, c.name, t)}`
                        : labelExpenseCategory(c.id, c.name, t)}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400">{t.exFundingSourceLabel}</label>
              {fundingSources.length === 0 ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">{t.exNoFundingSources}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {fundingSources.map((s) => {
                    const active = activeFundingSourceId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveFundingSourceId(s.id)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all ${
                          active
                            ? 'border-indigo-500 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-600'
                            : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Wallet size={13} className="shrink-0 opacity-80" />
                        <span className="truncate">{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
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
                <SingleDatePicker
                  value={form.date}
                  onChange={(date) => setForm({ ...form, date })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.exCurrencyLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { key: 'UZS' as const, label: 'UZS' },
                      { key: 'USD' as const, label: 'USD' },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setFormCurrency(key);
                        if (key === 'USD') {
                          setFxFromBank(true);
                          if (bankUsdRate > 0) setFormFxRate(String(bankUsdRate));
                          else void refetchCbu();
                        } else {
                          setFormFxRate('1');
                        }
                      }}
                      className={cn(
                        'rounded-xl border py-2 text-sm font-semibold transition-all',
                        formCurrency === key
                          ? 'border-slate-700 bg-slate-800 text-white dark:border-slate-500 dark:bg-slate-600'
                          : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">
                  {t.exColAmount} ({formCurrency === 'USD' ? 'USD' : t.unitSum})
                </label>
                <input
                  type="text"
                  inputMode={formCurrency === 'USD' ? 'decimal' : 'numeric'}
                  autoComplete="off"
                  value={
                    formCurrency === 'UZS'
                      ? displayGroupedIntInput(form.amount)
                      : form.amount
                  }
                  onChange={(e) => {
                    if (formCurrency === 'UZS') {
                      const d = parseDigitsFromAmountInput(e.target.value);
                      if (d.length > 15) return;
                      setForm({ ...form, amount: d });
                    } else {
                      const raw = e.target.value.replace(/[^\d.,]/g, '');
                      setForm({ ...form, amount: raw });
                    }
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {formCurrency === 'USD' && form.amount && (() => {
                  const n = parseFloat(form.amount.replace(',', '.'));
                  const fx = parseFloat(String(formFxRate).replace(',', '.'));
                  if (!(n > 0) || !(fx > 0)) return null;
                  return (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {t.exAmountInUzsHint.replace(
                        '{amount}',
                        formatCurrency(Math.round(n * fx * 100) / 100),
                      )}
                    </p>
                  );
                })()}
              </div>
              {formCurrency === 'USD' ? (
                <div>
                  <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                    {t.exFxRateLabel}
                  </label>
                  <div className="mb-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFxFromBank(true);
                        if (bankUsdRate > 0) setFormFxRate(String(bankUsdRate));
                        else void refetchCbu();
                      }}
                      className={cn(
                        'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium',
                        fxFromBank
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                          : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300',
                      )}
                    >
                      {t.exFxFromBank}
                      {bankUsdRate > 0 ? `: ${formatNumber(bankUsdRate)}` : cbuLoading ? '…' : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFxFromBank(false)}
                      className={cn(
                        'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium',
                        !fxFromBank
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
                          : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300',
                      )}
                    >
                      {t.exFxManual}
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formFxRate}
                    onChange={(e) => {
                      setFxFromBank(false);
                      setFormFxRate(e.target.value.replace(/[^\d.,]/g, ''));
                    }}
                    placeholder={bankUsdRate > 0 ? String(bankUsdRate) : '12000'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  {cbuError ? (
                    <p className="mt-1 text-xs text-amber-600">{t.exUsdRateMissing}</p>
                  ) : null}
                </div>
              ) : null}
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
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={categories.length === 0 || fundingSources.length === 0}
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
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium flex-1 ${expenseCategoryBadgeClass(c.id)}`}>
                          {labelExpenseCategory(c.id, c.name, t)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(c.id, c.name)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600"
                          aria-label={t.btnSave}
                        >
                          <Pencil size={16} />
                        </button>
                        {!isElectricityCategory(c) &&
                          !isRawMaterialExternalOrderExpense(
                            { categoryId: c.id, categoryName: c.name },
                            categories,
                          ) && (
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

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Wallet size={16} className="text-white" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.exFundingSourcesTitle}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t.exFundingSourceDeleteHint}</p>
            <form onSubmit={handleAddFundingSource} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFundingSourceName}
                onChange={(e) => setNewFundingSourceName(e.target.value)}
                placeholder={t.exFundingSourceName}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl"
              >
                {t.exFundingSourceAdd}
              </button>
            </form>
            <ul className="space-y-2">
              {fundingSources.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600"
                >
                  {fundingEditingId === s.id ? (
                    <>
                      <input
                        value={fundingEditName}
                        onChange={(e) => setFundingEditName(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                      />
                      <button
                        type="button"
                        onClick={saveFundingEdit}
                        className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white"
                      >
                        {t.btnSave}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFundingEditingId(null)}
                        className="text-xs px-2 py-1 rounded-lg bg-slate-500 text-white"
                      >
                        {t.btnCancel}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex flex-1 items-center gap-1.5 text-xs px-2 py-1 rounded-lg font-medium bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
                        <Wallet size={13} />
                        {s.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => startFundingEdit(s.id, s.name)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600"
                        aria-label={t.btnSave}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteFundingSource(s.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                        aria-label={t.exFundingSourceDelete}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm min-w-0 truncate">
                {t.exHistory}
              </h3>
              <span className="hidden text-xs text-slate-400 sm:inline">
                ({filteredExpenses.length} {t.totalRecords})
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isFiltered && (
                <span className="hidden text-xs text-indigo-600 dark:text-indigo-400 sm:inline">
                  {t.dfShowing} {filterLabel}
                </span>
              )}
              <button
                type="button"
                onClick={() => setHistoryFullscreen(true)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                title={t.exHistoryFullscreenEnter}
                aria-label={t.exHistoryFullscreenEnter}
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
          <ExpenseHistoryTableView
            expenses={filteredExpenses}
            categories={categories}
            t={t}
            totalFiltered={totalTableFiltered}
            wideNote={false}
            onEdit={openExpenseEdit}
            onDelete={requestDeleteExpense}
          />
        </div>
      </div>

      {historyFullscreen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[130] flex flex-col bg-white dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            aria-label={t.exHistory}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-5">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">{t.exHistory}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filteredExpenses.length} {t.totalRecords}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryFullscreen(false)}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <X size={18} aria-hidden />
                {t.exHistoryFullscreenExit}
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-3 pb-6 pt-2 sm:px-5">
              <ExpenseHistoryTableView
                expenses={filteredExpenses}
                categories={categories}
                t={t}
                totalFiltered={totalTableFiltered}
                wideNote
                onEdit={openExpenseEdit}
                onDelete={requestDeleteExpense}
              />
            </div>
          </div>,
          document.body,
        )}

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

      <AlertDialog
        open={Boolean(fundingDeleteId)}
        onOpenChange={(open) => {
          if (!open) setFundingDeleteId(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-md border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t.exFundingSourceDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t.exFundingSourceDeleteHint}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700">
              {t.btnCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFundingSource}
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500/30"
            >
              {t.exFundingSourceDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(expenseEdit)} onOpenChange={(open) => !open && setExpenseEdit(null)}>
        <DialogContent
          overlayClassName={MODAL_OVER_FULLSCREEN}
          className={cn('sm:max-w-md border-slate-200 dark:border-slate-700', MODAL_OVER_FULLSCREEN)}
        >
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">{t.exExpenseEditTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveExpenseEdit} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">{t.colType}</label>
              <select
                value={expenseEditForm.categoryId}
                onChange={(e) => setExpenseEditForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {manualExpenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isElectricityCategory(c)
                      ? `⚡ ${labelExpenseCategory(c.id, c.name, t)}`
                      : labelExpenseCategory(c.id, c.name, t)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">{t.exFundingSourceLabel}</label>
              <select
                value={expenseEditForm.fundingSourceId}
                onChange={(e) => setExpenseEditForm((prev) => ({ ...prev, fundingSourceId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {fundingSources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">{t.labelDate}</label>
              <SingleDatePicker
                value={expenseEditForm.date}
                onChange={(date) => setExpenseEditForm((prev) => ({ ...prev, date }))}
                menuZClassName="z-[90]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                {t.exCurrencyLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { key: 'UZS' as const, label: 'UZS' },
                    { key: 'USD' as const, label: 'USD' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setExpenseEditForm((prev) => ({
                        ...prev,
                        currency: key,
                        fxRate:
                          key === 'USD'
                            ? bankUsdRate > 0
                              ? String(bankUsdRate)
                              : prev.fxRate
                            : '1',
                      }));
                      if (key === 'USD') {
                        setExpenseEditFxFromBank(true);
                        if (!(bankUsdRate > 0)) void refetchCbu();
                      }
                    }}
                    className={cn(
                      'rounded-xl border py-2 text-sm font-semibold transition-all',
                      expenseEditForm.currency === key
                        ? 'border-slate-700 bg-slate-800 text-white dark:border-slate-500 dark:bg-slate-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                {t.exColAmount} ({expenseEditForm.currency === 'USD' ? 'USD' : t.unitSum})
              </label>
              <input
                type="text"
                inputMode={expenseEditForm.currency === 'USD' ? 'decimal' : 'numeric'}
                autoComplete="off"
                value={
                  expenseEditForm.currency === 'UZS'
                    ? displayGroupedIntInput(expenseEditForm.amount)
                    : expenseEditForm.amount
                }
                onChange={(e) => {
                  if (expenseEditForm.currency === 'UZS') {
                    const d = parseDigitsFromAmountInput(e.target.value);
                    if (d.length > 15) return;
                    setExpenseEditForm((prev) => ({ ...prev, amount: d }));
                  } else {
                    const raw = e.target.value.replace(/[^\d.,]/g, '');
                    setExpenseEditForm((prev) => ({ ...prev, amount: raw }));
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              {expenseEditForm.currency === 'USD' && expenseEditForm.amount
                ? (() => {
                    const n = parseFloat(expenseEditForm.amount.replace(',', '.'));
                    const fx = parseFloat(String(expenseEditForm.fxRate).replace(',', '.'));
                    if (!(n > 0) || !(fx > 0)) return null;
                    return (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t.exAmountInUzsHint.replace(
                          '{amount}',
                          formatCurrency(Math.round(n * fx * 100) / 100),
                        )}
                      </p>
                    );
                  })()
                : null}
            </div>
            {expenseEditForm.currency === 'USD' ? (
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.exFxRateLabel}
                </label>
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExpenseEditFxFromBank(true);
                      if (bankUsdRate > 0) {
                        setExpenseEditForm((prev) => ({
                          ...prev,
                          fxRate: String(bankUsdRate),
                        }));
                      } else {
                        void refetchCbu();
                      }
                    }}
                    className={cn(
                      'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium',
                      expenseEditFxFromBank
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                        : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300',
                    )}
                  >
                    {t.exFxFromBank}
                    {bankUsdRate > 0
                      ? `: ${formatNumber(bankUsdRate)}`
                      : cbuLoading
                        ? '…'
                        : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseEditFxFromBank(false)}
                    className={cn(
                      'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium',
                      !expenseEditFxFromBank
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
                        : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300',
                    )}
                  >
                    {t.exFxManual}
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={expenseEditForm.fxRate}
                  onChange={(e) => {
                    setExpenseEditFxFromBank(false);
                    setExpenseEditForm((prev) => ({
                      ...prev,
                      fxRate: e.target.value.replace(/[^\d.,]/g, ''),
                    }));
                  }}
                  placeholder={bankUsdRate > 0 ? String(bankUsdRate) : '12000'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                {cbuError ? (
                  <p className="mt-1 text-xs text-amber-600">{t.exUsdRateMissing}</p>
                ) : null}
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">{t.labelDesc}</label>
              <input
                type="text"
                value={expenseEditForm.description}
                onChange={(e) => setExpenseEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            {expenseEditError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{expenseEditError}</p>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setExpenseEdit(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t.btnCancel}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-600"
              >
                {t.btnSave}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(expenseDeleteId)}
        onOpenChange={(open) => {
          if (!open) {
            setExpenseDeleteId(null);
            setExpenseDeleteError('');
          }
        }}
      >
        <AlertDialogContent
          overlayClassName={MODAL_OVER_FULLSCREEN}
          className={cn('sm:max-w-md border-slate-200 dark:border-slate-700', MODAL_OVER_FULLSCREEN)}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t.exExpenseDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t.exExpenseDeleteHint}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {expenseDeleteError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{expenseDeleteError}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700">
              {t.btnCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={expenseDeleteBusy}
              onClick={(e) => {
                e.preventDefault();
                void confirmDeleteExpense();
              }}
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
