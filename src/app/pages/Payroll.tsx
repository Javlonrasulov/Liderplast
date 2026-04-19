import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users, FileText, Settings, Factory, Download, Printer, Plus,
  Trash2, CheckCircle, XCircle, Edit3, Save, X, ChevronDown,
  TrendingUp, DollarSign, Receipt, CreditCard, BadgeCheck, Clock,
  UploadCloud, Info, Minus, Landmark, ArrowDownLeft, ArrowUpRight, AlertTriangle, UserPlus, Building2, Calendar,
  ShoppingCart, RefreshCw, Package,
} from 'lucide-react';
import { useCbuRates, parseCbuRate } from '../hooks/use-cbu-rates';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatCurrency, formatDateTime, formatNumber, formatKgAmount, TODAY } from '../utils/format';
import type { Employee, EmployeeProductRate, ShiftRecord, RawMaterialProduct } from '../store/erp-store';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// ======================== HELPERS ========================

function currentMonth() {
  return TODAY.slice(0, 7);
}

function monthLabel(m: string) {
  if (!m) return '';
  const [y, mo] = m.split('-');
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  return `${months[parseInt(mo) - 1]} ${y}`;
}

// ======================== SUB COMPONENTS ========================

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${color}`}>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400 ${props.className ?? ''}`}
    />
  );
}

function StyledSelect({
  value,
  onValueChange,
  options,
  placeholder,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  return (
    <RadixSelect value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </RadixSelect>
  );
}

// ======================== VEDOMOST TAB ========================

function VedomostTab() {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const [month, setMonth] = useState(currentMonth());
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [editId, setEditId] = useState<string | null>(null);
  const [editBonus, setEditBonus] = useState(0);
  const [editDays, setEditDays] = useState(26);
  const [generated, setGenerated] = useState(false);

  const rows = useMemo(() =>
    state.salaryVedomost
      .filter(r => r.month === month)
      .filter(r => statusFilter === 'all' || r.status === statusFilter),
    [state.salaryVedomost, month, statusFilter]
  );

  const allRows = useMemo(() => state.salaryVedomost.filter(r => r.month === month), [state.salaryVedomost, month]);

  const totals = useMemo(() => ({
    brutto: allRows.reduce((s, r) => s + r.totalSalary, 0),
    net: allRows.reduce((s, r) => s + r.netSalary, 0),
    incomeTax: allRows.reduce((s, r) => s + r.incomeTax, 0),
    nps: allRows.reduce((s, r) => s + r.nps, 0),
    social: allRows.reduce((s, r) => s + r.socialTax, 0),
    paid: allRows.filter(r => r.status === 'paid').length,
    unpaid: allRows.filter(r => r.status === 'unpaid').length,
  }), [allRows]);

  const handleGenerate = () => {
    dispatch({ type: 'GENERATE_VEDOMOST', payload: { month } });
    setGenerated(true);
    setTimeout(() => setGenerated(false), 2500);
  };

  const handleToggleStatus = (id: string, current: 'paid' | 'unpaid') => {
    dispatch({ type: 'SET_SALARY_STATUS', payload: { id, status: current === 'paid' ? 'unpaid' : 'paid' } });
  };

  const startEdit = (id: string, bonus: number, days: number) => {
    setEditId(id);
    setEditBonus(bonus);
    setEditDays(days);
  };

  const saveEdit = () => {
    if (!editId) return;
    dispatch({ type: 'UPDATE_SALARY_ROW', payload: { id: editId, bonus: editBonus, workedDays: editDays } });
    dispatch({ type: 'GENERATE_VEDOMOST', payload: { month } });
    setEditId(null);
  };

  const exportCSV = () => {
    const headers = [t.prFullName, t.prPosition, t.prCardNumber, t.prWorkedDays, t.prProducedQty, t.prProductionAmt, t.prAklad, t.prBonus, t.prBrutto, t.prIncomeTax, t.prNps, t.prSocialTax, t.prNet, t.prStatusLabel];
    const csvRows = allRows.map(r => {
      const emp = state.employees.find(e => e.id === r.employeeId);
      return [
        emp?.fullName ?? '', emp?.position ?? '', emp?.cardNumber ?? '',
        r.workedDays, r.producedQuantity, r.productionAmount,
        r.aklad, r.bonus, r.totalSalary, r.incomeTax, r.nps, r.socialTax, r.netSalary,
        r.status === 'paid' ? t.prPaid : t.prUnpaid,
      ].join(';');
    });
    const csv = [headers.join(';'), ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vedomost-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">

      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Month picker */}
        <div className="flex items-center gap-2">
          <Label>{t.prMonth}:</Label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          className={`flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-all shadow-sm ${generated ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          <FileText size={15} />
          {generated ? '✓ ' + t.prGenerate : t.prGenerate}
        </button>

        {/* Status filter pills */}
        <div className="flex gap-1 ml-auto">
          {(['all', 'paid', 'unpaid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'all' ? t.dfAll : f === 'paid' ? t.prPaid : t.prUnpaid}
              {f !== 'all' && (
                <span className="ml-1 opacity-60">({f === 'paid' ? totals.paid : totals.unpaid})</span>
              )}
            </button>
          ))}
        </div>

        <button onClick={exportCSV} className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm flex items-center gap-1.5 transition-colors">
          <Download size={14} /> {t.prExportCsv}
        </button>
        <button onClick={handlePrint} className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm flex items-center gap-1.5 transition-colors print:hidden">
          <Printer size={14} /> {t.prPrint}
        </button>
      </div>

      {/* ── KPI Summary cards ─────────────────────────────────────── */}
      {allRows.length > 0 && (
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label={t.prTotalBrutto}
            value={formatCurrency(totals.brutto)}
            sub={`${allRows.length} ishchi`}
            color="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
          <StatCard
            label={t.prTotalNet}
            value={formatCurrency(totals.net)}
            sub={t.prNetFormula}
            color="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
          />
          <StatCard
            label={t.prIncomeTax}
            value={formatCurrency(totals.incomeTax)}
            sub={`${t.prNps}: ${formatCurrency(totals.nps)} · ${t.prKpiLabelSocial}: ${formatCurrency(totals.social)}`}
            color="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
          />
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.prStatusLabel}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{totals.paid}</span>
                <span className="text-xs text-slate-400 hidden sm:inline">{t.prPaid}</span>
              </div>
              <span className="text-slate-200 dark:text-slate-600 text-xs">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-amber-600 dark:text-amber-400 font-bold">{totals.unpaid}</span>
                <span className="text-xs text-slate-400 hidden sm:inline">{t.prUnpaid}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NET formula info strip ────────────────────────────────── */}
      {allRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
          <Info size={14} className="text-blue-500 flex-shrink-0" />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {/* Formula */}
            <span className="flex items-center gap-1.5 font-mono font-semibold text-blue-700 dark:text-blue-300">
              <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 rounded text-emerald-800 dark:text-emerald-300">NET</span>
              <span className="text-slate-400">=</span>
              <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 rounded text-indigo-700 dark:text-indigo-300">Brutto</span>
              <span className="text-red-500 font-bold">−</span>
              <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded text-orange-700 dark:text-orange-300">{t.prIncomeTax}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            {/* NPS note */}
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-600 text-[8px] font-bold text-slate-500">*</span>
              {t.prNpsNote}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            {/* Social note */}
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-600 text-[8px] font-bold text-slate-500">*</span>
              {t.prSocialNote}
            </span>
          </div>
        </div>
      )}

      {/* ── Table / Empty state ──────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t.prNoVedomost}</p>
          <button onClick={handleGenerate} className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
            {t.prGenerate}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Title bar */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">
                {monthLabel(month)} — {t.prTitle}
              </h3>
              <p className="text-slate-400 text-xs">{rows.length} {t.totalRecords}</p>
            </div>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  {/* Basic info */}
                  <th className="text-left px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.prFullName}</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.prPosition}</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.prWorkedDays}</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.prProducedQty}</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.prProductionAmt}</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.prAklad}</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.prBonus}</th>
                  {/* Brutto — highlighted indigo */}
                  <th className="text-right px-3 py-2.5 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap bg-indigo-50/60 dark:bg-indigo-900/10">
                    {t.prBrutto}
                  </th>
                  {/* Income Tax — DEDUCTED (-) */}
                  <th className="text-right px-3 py-2.5 font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap bg-orange-50/40 dark:bg-orange-900/10">
                    <div>{t.prIncomeTax}</div>
                    <div className="text-[9px] font-normal text-red-500 dark:text-red-400">{t.prVedColHintDeduct}</div>
                  </th>
                  {/* NPS — NOT deducted (*) */}
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div>{t.prNps} <span className="text-[9px] text-slate-400">*</span></div>
                    <div className="text-[9px] font-normal text-slate-400 dark:text-slate-500">{t.prVedColHintExempt}</div>
                  </th>
                  {/* Social Tax — NOT deducted (*) */}
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div>{t.prSocialTax} <span className="text-[9px] text-slate-400">*</span></div>
                    <div className="text-[9px] font-normal text-slate-400 dark:text-slate-500">{t.prVedColHintExempt}</div>
                  </th>
                  {/* NET — highlighted emerald */}
                  <th className="text-right px-3 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div>{t.prNet}</div>
                    <div className="text-[9px] font-normal text-emerald-500">{t.prVedColNetShort}</div>
                  </th>
                  {/* Status */}
                  <th className="text-left px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {t.prStatusLabel}
                  </th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const emp = state.employees.find(e => e.id === row.employeeId);
                  const isEditing = editId === row.id;
                  const isGiven = row.status === 'paid';
                  return (
                    <tr
                      key={row.id}
                      className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50/40 dark:hover:bg-slate-700/20 transition-colors ${idx % 2 !== 0 ? 'bg-slate-50/30 dark:bg-slate-800/20' : ''}`}
                    >
                      {/* Name + card */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">{emp?.fullName?.charAt(0) ?? '?'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{emp?.fullName ?? '—'}</p>
                            <p className="text-slate-400 text-[10px] font-mono">{emp?.cardNumber}</p>
                          </div>
                        </div>
                      </td>
                      {/* Position */}
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{emp?.position}</td>
                      {/* Worked days */}
                      <td className="px-3 py-2.5 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDays}
                            onChange={e => setEditDays(+e.target.value)}
                            className="w-14 h-7 text-center rounded-lg border border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600 text-xs"
                            min={1} max={31}
                          />
                        ) : (
                          <span className="font-medium text-slate-700 dark:text-slate-300">{row.workedDays}</span>
                        )}
                      </td>
                      {/* Produced qty */}
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400">{formatNumber(row.producedQuantity)}</td>
                      {/* Production amount */}
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400">{formatCurrency(row.productionAmount)}</td>
                      {/* Oklad */}
                      <td className="px-3 py-2.5 text-right font-medium text-slate-700 dark:text-slate-300">{formatCurrency(row.aklad)}</td>
                      {/* Bonus */}
                      <td className="px-3 py-2.5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editBonus}
                            onChange={e => setEditBonus(+e.target.value)}
                            className="w-28 h-7 text-right rounded-lg border border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600 text-xs px-2"
                            min={0} step={50000}
                          />
                        ) : (
                          <span className={row.bonus > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                            {formatCurrency(row.bonus)}
                          </span>
                        )}
                      </td>

                      {/* ── BRUTTO ──────────────────────────────────── */}
                      <td className="px-3 py-2.5 text-right bg-indigo-50/30 dark:bg-indigo-900/5">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {formatCurrency(row.totalSalary)}
                        </span>
                      </td>

                      {/* ── INCOME TAX — DEDUCTED ───────────────────── */}
                      <td className="px-3 py-2.5 text-right bg-orange-50/30 dark:bg-orange-900/5">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-orange-700 dark:text-orange-400 font-semibold">
                            {formatCurrency(row.incomeTax)}
                          </span>
                          <span className="text-[9px] text-orange-400 opacity-70">
                            −{((row.incomeTax / (row.totalSalary || 1)) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* ── NPS — NOT DEDUCTED (dimmer) ─────────────── */}
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-slate-500 dark:text-slate-400">
                          {formatCurrency(row.nps)}
                        </span>
                      </td>

                      {/* ── SOCIAL TAX — NOT DEDUCTED (dimmer) ──────── */}
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-slate-500 dark:text-slate-400">
                          {formatCurrency(row.socialTax)}
                        </span>
                      </td>

                      {/* ── NET — Brutto - Income Tax ONLY ─────────── */}
                      <td className="px-3 py-2.5 text-right bg-emerald-50/30 dark:bg-emerald-900/5">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                            {formatCurrency(row.netSalary)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">B−I</span>
                        </div>
                      </td>

                      {/* ── STATUS — Berilmadi / Berildi ─────────────── */}
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => handleToggleStatus(row.id, row.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border ${
                            isGiven
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                          }`}
                        >
                          {isGiven ? (
                            <><CheckCircle size={11} className="flex-shrink-0" />{t.prPaid}</>
                          ) : (
                            <><Clock size={11} className="flex-shrink-0" />{t.prUnpaid}</>
                          )}
                        </button>
                      </td>

                      {/* Edit actions */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                                <Save size={12} />
                              </button>
                              <button onClick={() => setEditId(null)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 text-slate-600 dark:text-slate-300 transition-colors">
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => startEdit(row.id, row.bonus, row.workedDays)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                              <Edit3 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* ── Totals footer ──────────────────────────────────── */}
              {rows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-t-2 border-slate-200 dark:border-slate-600">
                    <td colSpan={6} className="px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                      {t.labelTotal}:
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-700 dark:text-slate-200">
                      {formatCurrency(allRows.reduce((s, r) => s + r.bonus, 0))}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/5">
                      {formatCurrency(totals.brutto)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-900/5">
                      {formatCurrency(totals.incomeTax)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-500 dark:text-slate-400">
                      {formatCurrency(totals.nps)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-500 dark:text-slate-400">
                      {formatCurrency(totals.social)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/5">
                      {formatCurrency(totals.net)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* ── Footnote / Legend ────────────────────────────────────── */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-[9px]">−</span>
              <strong>{t.prIncomeTax}:</strong>&nbsp;{t.prIncomeTaxOnly}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-slate-200 dark:bg-slate-600 text-slate-500 font-bold text-[9px]">*</span>
              <strong>{t.prNps} + {t.prSocialTax}:</strong>&nbsp;{t.prTaxNotDeducted}
            </p>
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 ml-auto font-mono tracking-tight">
              {t.prNetFormula}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function BankTab() {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [modalState, setModalState] = useState<null | {
    kind: 'employee' | 'client';
    transactionId: string;
    bankVedomostId: string;
    title: string;
    description: string;
  }>(null);
  const [submittingModal, setSubmittingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedVedomost =
    state.selectedBankVedomost ??
    state.bankVedomosts[0] ??
    null;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage('');
    try {
      await dispatch({ type: 'UPLOAD_OBOROTKA', payload: { file } });
      setUploadMessage(t.prBankUploadSuccess);
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : t.whRequestError);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectVedomost = async (id: string) => {
    await dispatch({ type: 'SELECT_BANK_VEDOMOST', payload: { id } });
  };

  const openCreateModal = (
    kind: 'employee' | 'client',
    transactionId: string,
    title: string,
    description: string,
  ) => {
    if (!selectedVedomost) return;
    setModalState({
      kind,
      transactionId,
      bankVedomostId: selectedVedomost.id,
      title,
      description,
    });
  };

  const handleConfirmCreate = async () => {
    if (!modalState) return;
    setSubmittingModal(true);
    try {
      if (modalState.kind === 'employee') {
        await dispatch({
          type: 'CREATE_EMPLOYEE_FROM_BANK_TRANSACTION',
          payload: {
            transactionId: modalState.transactionId,
            bankVedomostId: modalState.bankVedomostId,
          },
        });
      } else {
        await dispatch({
          type: 'CREATE_CLIENT_FROM_BANK_TRANSACTION',
          payload: {
            transactionId: modalState.transactionId,
            bankVedomostId: modalState.bankVedomostId,
          },
        });
      }
      setModalState(null);
    } finally {
      setSubmittingModal(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <UploadCloud size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {t.prBankUploadTitle}
                </h3>
                <p className="text-xs text-slate-400">{t.prBankUploadHint}</p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 px-4 py-6 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
              <UploadCloud size={16} />
              <span>{uploading ? t.authLoading : t.prBankUploadAction}</span>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>

            {uploadMessage && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
                {uploadMessage}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                {t.prBankVedomostList}
              </h3>
              <p className="text-xs text-slate-400">
                {state.bankVedomosts.length} {t.totalRecords}
              </p>
            </div>

            {state.bankVedomosts.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {t.prBankNoVedomost}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {state.bankVedomosts.map((item) => {
                  const active = selectedVedomost?.id === item.id;
                  const statusColor =
                    item.status === 'parsed'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : item.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : item.status === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
                  const statusLabel =
                    item.status === 'draft'
                      ? t.prBankStatusDraft
                      : item.status === 'parsed'
                        ? t.prBankStatusParsed
                        : item.status === 'confirmed'
                          ? t.prBankStatusConfirmed
                          : item.status === 'rejected'
                            ? t.prBankStatusRejected
                            : item.status;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void handleSelectVedomost(item.id)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        active
                          ? 'bg-indigo-50 dark:bg-indigo-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                            {item.fileName}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {item.transactionsCount} {t.prBankTransactions}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                              {t.prBankUploadDate}:
                            </span>{' '}
                            {formatDateTime(item.createdAt)}
                            <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                              {t.prBankUploadedBy}:
                            </span>{' '}
                            {item.uploadedByName ?? '—'}
                          </p>
                        </div>
                        <span className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-emerald-50 px-2 py-1 dark:bg-emerald-900/10">
                          <span className="text-slate-400">{t.prBankIncome}</span>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(item.totalIncome)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-rose-50 px-2 py-1 dark:bg-rose-900/10">
                          <span className="text-slate-400">{t.prBankExpense}</span>
                          <p className="font-semibold text-rose-600 dark:text-rose-400">
                            {formatCurrency(item.totalExpense)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {selectedVedomost?.warnings &&
            (selectedVedomost.warnings.unresolvedEmployeesCount > 0 ||
              selectedVedomost.warnings.unresolvedClientsCount > 0) && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{t.prBankWarningTitle}</p>
                    <p className="text-xs">
                      {t.prBankWarningDesc}
                    </p>
                    <p className="text-xs">
                      {selectedVedomost.warnings.unresolvedClientsCount} {t.prBankUnknownClients},
                      {' '}
                      {selectedVedomost.warnings.unresolvedEmployeesCount} {t.prBankUnknownEmployees}
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatCard
              label={t.prBankTotalVedomost}
              value={String(state.bankVedomosts.length)}
              sub={t.prBankVedomostList}
              color="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
            <StatCard
              label={t.prBankSalaryMatched}
              value={String(
                selectedVedomost?.transactions?.filter((item) => item.isSalary).length ?? 0,
              )}
              sub={t.prBankTransactions}
              color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            />
            <StatCard
              label={t.prBankSelected}
              value={selectedVedomost ? formatCurrency(selectedVedomost.totalExpense) : formatCurrency(0)}
              sub={t.prBankExpense}
              color="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {t.prBankTransactions}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedVedomost?.fileName ?? t.prBankNoSelection}
                </p>
                {selectedVedomost && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {t.prBankUploadDate}:
                    </span>{' '}
                    {formatDateTime(selectedVedomost.createdAt)}
                    <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {t.prBankUploadedBy}:
                    </span>{' '}
                    {selectedVedomost.uploadedByName ?? '—'}
                  </p>
                )}
              </div>
              {selectedVedomost?.errorMessage && selectedVedomost.status !== 'rejected' && (
                <span className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                  {selectedVedomost.errorMessage}
                </span>
              )}
            </div>

            {selectedVedomost?.status === 'rejected' && (
              <div className="mx-5 mb-4 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-900 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
                <p className="font-semibold text-rose-950 dark:text-rose-50">{t.prBankRejectedTitle}</p>
                <p className="mt-2 text-xs leading-relaxed text-rose-800/95 dark:text-rose-200/90">
                  {t.prBankRejectedExplain}
                </p>
                {selectedVedomost.errorMessage ? (
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer font-medium text-rose-800 underline decoration-rose-300 decoration-dotted underline-offset-2 hover:text-rose-950 dark:text-rose-200 dark:hover:text-white">
                      {t.prBankTechnicalDetails}
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-rose-200/80 bg-white/90 p-3 font-mono text-[11px] text-slate-700 dark:border-rose-800 dark:bg-slate-900/80 dark:text-slate-200">
                      {selectedVedomost.errorMessage}
                    </pre>
                  </details>
                ) : null}
              </div>
            )}

            {!selectedVedomost ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {t.prBankNoSelection}
              </div>
            ) : selectedVedomost.transactions && selectedVedomost.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/50">
                      {[t.labelDate, t.prBankDocNumber, t.prBankReceiver, t.prBankPurpose, t.labelAmount, t.prStatusLabel].map((head) => (
                        <th
                          key={head}
                          className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVedomost.transactions.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        className={`border-t border-slate-100 dark:border-slate-700 ${
                          index % 2 !== 0 ? 'bg-slate-50/30 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {transaction.operationDate.slice(0, 10)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {transaction.documentNumber || '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="min-w-[180px]">
                            <p className="font-medium text-slate-700 dark:text-slate-200">
                              {transaction.receiverName || '—'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {transaction.employeeName || transaction.receiverStir || '—'}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                          <div className="max-w-[320px] truncate">
                            {transaction.paymentPurpose || '—'}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              transaction.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {transaction.type === 'income' ? (
                              <ArrowDownLeft size={12} />
                            ) : (
                              <ArrowUpRight size={12} />
                            )}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                              transaction.isSalary
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {transaction.isSalary ? <CheckCircle size={11} /> : <Minus size={11} />}
                            {transaction.isSalary ? t.prBankMatched : t.prBankUnmatched}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {selectedVedomost.status === 'rejected'
                  ? t.prBankRejectedEmptyTx
                  : t.prBankNoTransactions}
              </div>
            )}
          </div>

          {selectedVedomost?.unresolvedClients && selectedVedomost.unresolvedClients.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {t.prBankUnknownClients}
                </h3>
                <p className="text-xs text-slate-400">{t.prBankUnknownClientsDesc}</p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {selectedVedomost.unresolvedClients.map((item, index) => (
                  <div key={`${item.receiverName}-${index}`} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {item.receiverName || '—'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.receiverBankName || '—'} · {item.receiverAccount || '—'}
                      </p>
                      <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openCreateModal(
                          'client',
                          item.transactionIds[0],
                          t.prBankCreateClientTitle,
                          t.prBankCreateClientDesc,
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                      <Building2 size={14} />
                      {t.prBankAddClient}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedVedomost?.unresolvedEmployees && selectedVedomost.unresolvedEmployees.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {t.prBankUnknownEmployees}
                </h3>
                <p className="text-xs text-slate-400">{t.prBankUnknownEmployeesDesc}</p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {selectedVedomost.unresolvedEmployees.map((item, index) => (
                  <div key={`${item.receiverName}-${index}`} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {item.receiverName || '—'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.receiverStir || '—'} · {item.paymentPurpose || '—'}
                      </p>
                      <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openCreateModal(
                          'employee',
                          item.transactionIds[0],
                          t.prBankCreateEmployeeTitle,
                          t.prBankCreateEmployeeDesc,
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                      <UserPlus size={14} />
                      {t.prBankAddEmployee}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                {t.prBankSalarySummary}
              </h3>
              <p className="text-xs text-slate-400">{t.prBankSalarySummaryHint}</p>
            </div>

            {state.salaryPaymentSummaries.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {t.prNoVedomost}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/50">
                      {[t.prFullName, t.prMonth, t.prBankRequired, t.prBankPaid, t.prBankRemaining, t.prStatusLabel].map((head) => (
                        <th
                          key={head}
                          className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.salaryPaymentSummaries.map((row, index) => {
                      const badgeClass =
                        row.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : row.status === 'partial'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
                      return (
                        <tr
                          key={row.id}
                          className={`border-t border-slate-100 dark:border-slate-700 ${
                            index % 2 !== 0 ? 'bg-slate-50/30 dark:bg-slate-800/30' : ''
                          }`}
                        >
                          <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200">
                            {row.employeeName}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                            {monthLabel(row.period)}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-200">
                            {formatCurrency(row.requiredAmount)}
                          </td>
                          <td className="px-3 py-2.5 text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(row.paidAmount)}
                          </td>
                          <td className="px-3 py-2.5 text-rose-600 dark:text-rose-400">
                            {formatCurrency(row.remainingAmount)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={Boolean(modalState)} onOpenChange={(open) => !open && setModalState(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{modalState?.title}</DialogTitle>
            <DialogDescription>{modalState?.description}</DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{t.prBankCreateWarning}</p>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setModalState(null)}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t.btnCancel}
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmCreate()}
              disabled={submittingModal}
              className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {submittingModal ? t.authLoading : t.btnAdd}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================== EMPLOYEES TAB ========================

function EmployeesTab() {
  const { state, dispatch } = useERP();
  const { t, filterData, filterLabel, dateFilter } = useApp();
  const PRODUCT_TYPES = ['18g Қолип', '20g Қолип', '0.5L Бакалашка', '1L Бакалашка', '5L Бакалашка'];
  const [form, setForm] = useState({ fullName: '', position: '', cardNumber: '', stir: '', salaryType: 'fixed' as Employee['salaryType'], salaryAmount: 0 });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeForm, setEmployeeForm] = useState({ fullName: '', position: '', cardNumber: '', stir: '', salaryType: 'fixed' as Employee['salaryType'], salaryAmount: 0 });
  const [deleteEmployeeTarget, setDeleteEmployeeTarget] = useState<Employee | null>(null);
  const [rateForm, setRateForm] = useState({
    productType: PRODUCT_TYPES[0],
    rateType: 'fixed' as EmployeeProductRate['rateType'],
    rateValue: 0,
    baseAmount: 0,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    dispatch({ type: 'ADD_EMPLOYEE', payload: form });
    setForm({ fullName: '', position: '', cardNumber: '', stir: '', salaryType: 'fixed', salaryAmount: 0 });
  };

  useEffect(() => {
    if (!selectedEmployeeId && state.employees[0]?.id) {
      setSelectedEmployeeId(state.employees[0].id);
    }
  }, [selectedEmployeeId, state.employees]);

  const selectedEmployee =
    state.employees.find((emp) => emp.id === selectedEmployeeId) ?? null;

  useEffect(() => {
    if (!selectedEmployee) return;
    setEmployeeForm({
      fullName: selectedEmployee.fullName,
      position: selectedEmployee.position,
      cardNumber: selectedEmployee.cardNumber,
      stir: selectedEmployee.stir ?? '',
      salaryType: selectedEmployee.salaryType,
      salaryAmount: selectedEmployee.salaryAmount,
    });
  }, [selectedEmployee]);

  const selectedEmployeeRates = useMemo(
    () => state.employeeProductRates.filter((item) => item.employeeId === selectedEmployeeId),
    [selectedEmployeeId, state.employeeProductRates],
  );

  const machineNameById = useMemo(
    () => new Map(state.machines.map((m) => [m.id, m.name])),
    [state.machines],
  );

  const selectedShiftLog = useMemo((): ShiftRecord[] => {
    if (!selectedEmployeeId) return [];
    const forEmp = state.shiftRecords.filter((s) => s.employeeId === selectedEmployeeId);
    return filterData(forEmp).sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return a.shift - b.shift;
    });
  }, [state.shiftRecords, selectedEmployeeId, filterData, dateFilter]);

  const selectedShiftTotals = useMemo(() => {
    let hours = 0;
    let produced = 0;
    let defect = 0;
    let kwh = 0;
    for (const s of selectedShiftLog) {
      hours += s.hoursWorked;
      produced += s.producedQty;
      defect += s.defectCount;
      kwh += s.electricityKwh;
    }
    return { hours, produced, defect, kwh };
  }, [selectedShiftLog]);

  const fmtQty = (n: number) => formatNumber(Math.round(n));
  const fmtDec = (n: number) => formatKgAmount(n);

  const handleEmployeeUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    dispatch({
      type: 'UPDATE_EMPLOYEE',
      payload: {
        id: selectedEmployee.id,
        ...employeeForm,
      },
    });
  };

  const handleUpsertRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    dispatch({
      type: 'UPSERT_EMPLOYEE_PRODUCT_RATE',
      payload: {
        employeeId: selectedEmployee.id,
        productType: rateForm.productType,
        rateType: rateForm.rateType,
        rateValue: rateForm.rateValue,
        baseAmount: rateForm.rateType === 'percent' ? rateForm.baseAmount : undefined,
      },
    });
    setRateForm((prev) => ({ ...prev, rateValue: 0, baseAmount: 0 }));
  };

  const SALARY_TYPE_COLORS: Record<string, string> = {
    fixed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    per_piece: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    hybrid: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm h-fit space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Plus size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.prAddEmployee}</h3>
        </div>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <Label>{t.prFullName}</Label>
            <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Rahimov Alijon Bahodirovich" required />
          </div>
          <div>
            <Label>{t.prPosition}</Label>
            <Input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} placeholder="Qolip opertori" />
          </div>
          <div>
            <Label>{t.prCardNumber}</Label>
            <Input value={form.cardNumber} onChange={e => setForm(p => ({ ...p, cardNumber: e.target.value }))} placeholder="8600 0000 0000 0000" />
          </div>
          <div>
            <Label>{t.prStir}</Label>
            <Input value={form.stir} onChange={e => setForm(p => ({ ...p, stir: e.target.value }))} placeholder="123456789" />
          </div>
          <div>
            <Label>{t.prSalaryType}</Label>
            <StyledSelect
              value={form.salaryType}
              onValueChange={(value) => setForm(p => ({ ...p, salaryType: value as Employee['salaryType'] }))}
              options={[
                { value: 'fixed', label: t.prFixed },
                { value: 'per_piece', label: t.prPerPiece },
                { value: 'hybrid', label: t.prHybrid },
              ]}
            />
          </div>
          {form.salaryType !== 'per_piece' && (
            <div>
              <Label>{t.prSalaryAmount} (so'm)</Label>
              <Input type="number" value={form.salaryAmount || ''} onChange={e => setForm(p => ({ ...p, salaryAmount: +e.target.value }))} placeholder="2000000" min={0} step={50000} />
            </div>
          )}
          <button type="submit" className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Plus size={15} /> {t.prAddEmployee}
          </button>
        </form>

        {selectedEmployee && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Edit3 size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.prEditEmployee}</h3>
              </div>
              <div className="mb-3">
                <Label>{t.prEmployee}</Label>
                <StyledSelect
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                  options={state.employees.map((emp) => ({ value: emp.id, label: emp.fullName }))}
                />
              </div>
              <form onSubmit={handleEmployeeUpdate} className="space-y-3">
                <div>
                  <Label>{t.prFullName}</Label>
                  <Input value={employeeForm.fullName} onChange={e => setEmployeeForm(p => ({ ...p, fullName: e.target.value }))} />
                </div>
                <div>
                  <Label>{t.prPosition}</Label>
                  <Input value={employeeForm.position} onChange={e => setEmployeeForm(p => ({ ...p, position: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t.prCardNumber}</Label>
                    <Input value={employeeForm.cardNumber} onChange={e => setEmployeeForm(p => ({ ...p, cardNumber: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t.prStir}</Label>
                    <Input value={employeeForm.stir} onChange={e => setEmployeeForm(p => ({ ...p, stir: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t.prSalaryType}</Label>
                    <StyledSelect
                      value={employeeForm.salaryType}
                      onValueChange={(value) => setEmployeeForm(p => ({ ...p, salaryType: value as Employee['salaryType'] }))}
                      options={[
                        { value: 'fixed', label: t.prFixed },
                        { value: 'per_piece', label: t.prPerPiece },
                        { value: 'hybrid', label: t.prHybrid },
                      ]}
                    />
                  </div>
                  <div>
                    <Label>{t.prSalaryAmount} (so'm)</Label>
                    <Input type="number" value={employeeForm.salaryAmount || ''} onChange={e => setEmployeeForm(p => ({ ...p, salaryAmount: Number(e.target.value) }))} min={0} step={50000} />
                  </div>
                </div>
                <button type="submit" className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Save size={15} /> {t.prSaveSettings}
                </button>
              </form>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Factory size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.prEmployeeRates}</h3>
              </div>
              <form onSubmit={handleUpsertRate} className="space-y-3">
                <div>
                  <Label>{t.prProductType}</Label>
                  <StyledSelect
                    value={rateForm.productType}
                    onValueChange={(value) => setRateForm(p => ({ ...p, productType: value }))}
                    options={PRODUCT_TYPES.map((pt) => ({ value: pt, label: pt }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t.prRateType}</Label>
                    <StyledSelect
                      value={rateForm.rateType}
                      onValueChange={(value) => setRateForm(p => ({ ...p, rateType: value as EmployeeProductRate['rateType'] }))}
                      options={[
                        { value: 'fixed', label: t.prRateFixed },
                        { value: 'percent', label: t.prRatePercent },
                      ]}
                    />
                  </div>
                  <div>
                    <Label>{rateForm.rateType === 'percent' ? `${t.prRatePercent} (%)` : `${t.prRateFixed} / dona`}</Label>
                    <Input type="number" value={rateForm.rateValue || ''} onChange={e => setRateForm(p => ({ ...p, rateValue: Number(e.target.value) }))} min={0} step={rateForm.rateType === 'percent' ? 0.1 : 1} />
                  </div>
                </div>
                {rateForm.rateType === 'percent' && (
                  <div>
                    <Label>{t.prRateBaseAmount} (so'm)</Label>
                    <Input type="number" value={rateForm.baseAmount || ''} onChange={e => setRateForm(p => ({ ...p, baseAmount: Number(e.target.value) }))} min={0} step={1} />
                  </div>
                )}
                <button type="submit" className="w-full h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Save size={15} /> Saqlash
                </button>
              </form>

              <div className="mt-4 space-y-2">
                {selectedEmployeeRates.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-500 dark:text-slate-400">
                    {t.prNoEmployeeRates}
                  </div>
                ) : (
                  selectedEmployeeRates.map((rate) => (
                    <div key={rate.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{rate.productType}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {rate.rateType === 'percent'
                            ? `${rate.rateValue}%${rate.baseAmount ? ` · baza ${formatCurrency(rate.baseAmount)}` : ''}`
                            : `${formatCurrency(rate.rateValue)} / dona`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'DELETE_EMPLOYEE_PRODUCT_RATE', payload: { employeeId: rate.employeeId, productType: rate.productType } })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-start gap-2 rounded-2xl border border-indigo-200/80 bg-indigo-50/60 px-4 py-3 text-xs text-indigo-900/90 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-200/90">
          <Calendar size={16} className="mt-0.5 shrink-0 opacity-80" />
          <p>{(t.prShiftLogFilterHint ?? '').replace(/\{label\}/g, filterLabel ?? '')}</p>
        </div>

        {state.employees.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
            <Users size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-slate-500 text-sm">{t.prNoEmployees}</p>
          </div>
        ) : (
          state.employees.map((emp) => {
            const selected = emp.id === selectedEmployeeId;
            return (
            <div
              key={emp.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedEmployeeId(emp.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedEmployeeId(emp.id);
                }
              }}
              className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 shadow-sm flex items-center gap-4 cursor-pointer transition-shadow outline-none ${
                selected
                  ? 'border-indigo-400 ring-2 ring-indigo-400/40 dark:border-indigo-500/60'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{emp.fullName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{emp.fullName}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SALARY_TYPE_COLORS[emp.salaryType]}`}>
                    {emp.salaryType === 'fixed' ? t.prFixed : emp.salaryType === 'per_piece' ? t.prPerPiece : t.prHybrid}
                  </span>
                </div>
                <p className="text-slate-400 text-xs">{emp.position}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><CreditCard size={11} />{emp.cardNumber || '—'}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.prStir}: {emp.stir || '—'}</span>
                  {emp.salaryAmount > 0 && <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{formatCurrency(emp.salaryAmount)}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteEmployeeTarget(emp);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
            );
          })
        )}

        {state.employees.length > 0 && selectedEmployee ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t.prShiftLogTitle}</h3>
            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{selectedEmployee.fullName}</p>
            {selectedShiftLog.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t.prShiftLogEmpty}</p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/80">
                <table className="w-full min-w-[880px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                      <th className="whitespace-nowrap px-2 py-2.5 font-medium">{t.labelDate}</th>
                      <th className="whitespace-nowrap px-2 py-2.5 font-medium">{t.prColShift}</th>
                      <th className="min-w-[7rem] px-2 py-2.5 font-medium">{t.labelMachine}</th>
                      <th className="min-w-[8rem] px-2 py-2.5 font-medium">{t.prProductType}</th>
                      <th className="whitespace-nowrap px-2 py-2.5 font-medium">{t.labelHours}</th>
                      <th className="whitespace-nowrap px-2 py-2.5 font-medium">{t.prProducedQty}</th>
                      <th className="whitespace-nowrap px-2 py-2.5 font-medium">{t.prColDefect}</th>
                      <th className="whitespace-nowrap px-2 py-2.5 font-medium">{t.prColKwh}</th>
                      <th className="min-w-[6.5rem] px-2 py-2.5 font-medium">{t.prColPaint}</th>
                      <th className="min-w-[4rem] px-2 py-2.5 font-medium">{t.prColCounter}</th>
                      <th className="min-w-[6rem] px-2 py-2.5 font-medium">{t.labelDesc}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedShiftLog.map((row) => {
                      const mName = row.machineId
                        ? machineNameById.get(row.machineId) || '—'
                        : '—';
                      const paintStr =
                        row.paintUsed && (row.paintQuantityKg ?? 0) > 0
                          ? `${row.paintRawMaterialName ? `${row.paintRawMaterialName} · ` : ''}${formatKgAmount(row.paintQuantityKg ?? 0)} kg`
                          : '—';
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-slate-100 last:border-0 dark:border-slate-700/60"
                        >
                          <td className="whitespace-nowrap px-2 py-2 text-slate-800 dark:text-slate-200">{row.date}</td>
                          <td className="whitespace-nowrap px-2 py-2 text-slate-700 dark:text-slate-300">{row.shift}</td>
                          <td className="px-2 py-2 text-slate-700 dark:text-slate-300">{mName}</td>
                          <td className="px-2 py-2 text-slate-700 dark:text-slate-300">{row.productType || '—'}</td>
                          <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-800 dark:text-slate-200">
                            {fmtDec(row.hoursWorked)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-800 dark:text-slate-200">
                            {fmtQty(row.producedQty)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 tabular-nums text-amber-700 dark:text-amber-400/90">
                            {fmtQty(row.defectCount)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-600 dark:text-slate-400">
                            {fmtDec(row.electricityKwh)}
                          </td>
                          <td className="px-2 py-2 text-slate-600 dark:text-slate-400">{paintStr}</td>
                          <td className="max-w-[6rem] truncate px-2 py-2 text-slate-600 dark:text-slate-400" title={row.machineReading}>
                            {row.machineReading || '—'}
                          </td>
                          <td
                            className="max-w-[8rem] truncate px-2 py-2 text-slate-500 dark:text-slate-500"
                            title={row.notes}
                          >
                            {row.notes || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50/90 font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200">
                      <td colSpan={4} className="px-2 py-2.5">{t.prShiftLogTotals}</td>
                      <td className="whitespace-nowrap px-2 py-2.5 tabular-nums">{fmtDec(selectedShiftTotals.hours)}</td>
                      <td className="whitespace-nowrap px-2 py-2.5 tabular-nums">{fmtQty(selectedShiftTotals.produced)}</td>
                      <td className="whitespace-nowrap px-2 py-2.5 tabular-nums text-amber-800 dark:text-amber-400">
                        {fmtQty(selectedShiftTotals.defect)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2.5 tabular-nums">
                        {fmtDec(selectedShiftTotals.kwh)}
                      </td>
                      <td colSpan={3} className="px-2 py-2.5 text-slate-400" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <AlertDialog
        open={Boolean(deleteEmployeeTarget)}
        onOpenChange={(open) => !open && setDeleteEmployeeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.prDeleteEmployeeTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.prDeleteEmployeeConfirm.replace('{name}', deleteEmployeeTarget?.fullName ?? '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.btnCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteEmployeeTarget) return;
                dispatch({ type: 'DELETE_EMPLOYEE', payload: deleteEmployeeTarget.id });
                setDeleteEmployeeTarget(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.prDeleteEmployeeAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ======================== RAW MATERIAL ORDERS (BUXGALTERIYA) ========================

function daysSinceOrder(orderedAtIso: string) {
  const t0 = new Date(orderedAtIso).getTime();
  return Math.max(0, Math.floor((Date.now() - t0) / 86400000));
}

function formatAmountInCurrency(amount: number, currency: 'UZS' | 'USD' | 'EUR'): string {
  if (!Number.isFinite(amount) || amount < 0) return '—';
  return `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} ${currency}`;
}

function RawMaterialOrdersTab() {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const { usd, eur, loading: fxLoading, error: fxErr, updatedAt, refetch } = useCbuRates();
  const [sub, setSub] = useState<'new' | 'history'>('new');
  const [rawMaterialId, setRawMaterialId] = useState('');
  const [weight, setWeight] = useState('');
  const [wu, setWu] = useState<'kg' | 'ton'>('kg');
  const [cur, setCur] = useState<'UZS' | 'USD' | 'EUR'>('UZS');
  const [fxMan, setFxMan] = useState('1');
  /** 1 kg narxi — tanlangan valyutada */
  const [pricePerKg, setPricePerKg] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const rawList = useMemo(
    () =>
      state.warehouseProducts.filter((p): p is RawMaterialProduct => p.itemType === 'RAW_MATERIAL'),
    [state.warehouseProducts],
  );

  const pending = useMemo(
    () =>
      [...state.rawMaterialPurchaseOrders]
        .filter((o) => o.status === 'PENDING')
        .sort((a, b) => new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime()),
    [state.rawMaterialPurchaseOrders],
  );

  const historySorted = useMemo(
    () =>
      [...state.rawMaterialPurchaseOrders].sort(
        (a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime(),
      ),
    [state.rawMaterialPurchaseOrders],
  );

  const qKg = useMemo(() => {
    const w = parseFloat(String(weight).replace(',', '.'));
    if (!Number.isFinite(w) || w <= 0) return 0;
    return wu === 'ton' ? w * 1000 : w;
  }, [weight, wu]);

  useEffect(() => {
    if (cur === 'UZS') {
      setFxMan('1');
      return;
    }
    if (cur === 'USD' && usd) {
      setFxMan(String(parseCbuRate(usd.Rate)));
      return;
    }
    if (cur === 'EUR' && eur) {
      setFxMan(String(parseCbuRate(eur.Rate)));
    }
  }, [cur, usd, eur]);

  const fx = useMemo(() => {
    if (cur === 'UZS') return 1;
    const m = parseFloat(String(fxMan).replace(',', '.'));
    return Number.isFinite(m) && m > 0 ? m : 0;
  }, [cur, fxMan]);

  const pricePerKgOrig = useMemo(() => {
    const a = parseFloat(String(pricePerKg).replace(',', '.'));
    return Number.isFinite(a) && a >= 0 ? a : 0;
  }, [pricePerKg]);

  const totalOriginal = useMemo(
    () => (qKg > 0 && pricePerKgOrig > 0 ? pricePerKgOrig * qKg : 0),
    [pricePerKgOrig, qKg],
  );

  const amountUzs = useMemo(() => {
    if (totalOriginal <= 0) return 0;
    return cur === 'UZS' ? totalOriginal : totalOriginal * fx;
  }, [totalOriginal, cur, fx]);

  const perKgUzs = qKg > 0 && amountUzs > 0 ? amountUzs / qKg : 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawMaterialId || qKg <= 0) return;
    if (pricePerKgOrig <= 0 || totalOriginal <= 0) return;
    if (cur !== 'UZS' && fx <= 0) return;
    setBusy(true);
    try {
      await dispatch({
        type: 'CREATE_RAW_MATERIAL_PURCHASE_ORDER',
        payload: {
          rawMaterialId,
          quantityKg: qKg,
          currency: cur,
          fxRateToUzs: fx,
          amountOriginal: totalOriginal,
          notes: notes.trim() || undefined,
        },
      });
      setPricePerKg('');
      setWeight('');
      setNotes('');
    } finally {
      setBusy(false);
    }
  };

  const onFulfill = async (id: string) => {
    await dispatch({ type: 'FULFILL_RAW_MATERIAL_PURCHASE_ORDER', payload: id });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-center gap-2 mb-2">
          <Package size={16} className="text-amber-700 dark:text-amber-400" />
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{t.prRmPendingAlert}</p>
        </div>
        {pending.length === 0 ? (
          <p className="text-xs text-amber-800/80 dark:text-amber-300/90">{t.prRmNoPendingOrders}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {pending.map((o) => {
              const d = daysSinceOrder(o.orderedAt);
              return (
                <li
                  key={o.id}
                  className="text-xs rounded-xl border border-amber-300/60 bg-white/80 px-3 py-2 dark:border-amber-700 dark:bg-slate-900/40"
                >
                  {t.prRmDaysWaitingTpl
                    .replace('{name}', o.rawMaterialName)
                    .replace('{kg}', formatNumber(o.quantityKg))
                    .replace('{days}', String(d))}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {(['new', 'history'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSub(k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              sub === k
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {k === 'new' ? t.prRmSubtabNew : t.prRmSubtabHistory}
          </button>
        ))}
      </div>

      {sub === 'new' ? (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <form
            onSubmit={onSubmit}
            className="xl:col-span-3 space-y-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <ShoppingCart size={16} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.prRmSubtabNew}</h3>
            </div>
            <div>
              <Label>{t.prProductType}</Label>
              <StyledSelect
                value={rawMaterialId}
                onValueChange={setRawMaterialId}
                options={rawList.map((p) => ({ value: p.id, label: p.name }))}
                placeholder="—"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t.prRmWeightLabel}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.001"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>
                  {t.prRmWeightUnitKg} / {t.prRmWeightUnitTon}
                </Label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setWu('kg')}
                    className={`flex-1 h-9 rounded-xl text-xs font-medium border ${
                      wu === 'kg'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {t.prRmWeightUnitKg}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWu('ton')}
                    className={`flex-1 h-9 rounded-xl text-xs font-medium border ${
                      wu === 'ton'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {t.prRmWeightUnitTon}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <Label>{t.prRmCurrencyLabel}</Label>
              <StyledSelect
                value={cur}
                onValueChange={(v) => setCur(v as 'UZS' | 'USD' | 'EUR')}
                options={[
                  { value: 'UZS', label: 'UZS' },
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                ]}
              />
            </div>
            {cur !== 'UZS' && (
              <div>
                <Label>{t.prRmFxRateLabel}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={fxMan}
                  onChange={(e) => setFxMan(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">{t.prRmFxCbuHint}</p>
              </div>
            )}
            <div>
              <Label>{t.prRmPricePerKgLabel}</Label>
              <Input
                type="number"
                min={0}
                step="0.0001"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
              />
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1.5 leading-relaxed">
                {t.prRmPricePerKgHint}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-xs space-y-1">
              <p className="text-slate-600 dark:text-slate-300">
                {t.prRmTotalOrderInCurrency}:{' '}
                <strong>{formatAmountInCurrency(totalOriginal, cur)}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {t.prRmAmountUzsEst}: <strong>{formatCurrency(amountUzs)}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {t.prRmCostPerKg}:{' '}
                <strong>{qKg > 0 && perKgUzs > 0 ? formatCurrency(perKgUzs) : '—'}</strong>
              </p>
            </div>
            <div>
              <Label>{t.labelDesc}</Label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[4rem] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full h-10 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium"
            >
              {busy ? '…' : t.prRmSubmitOrder}
            </button>
          </form>

          <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm h-fit">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">CBU</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Refresh"
              >
                <RefreshCw size={14} className={fxLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            {fxErr ? (
              <p className="text-xs text-amber-600">{t.dashCbuFetchError}</p>
            ) : (
              <div className="space-y-2 text-xs">
                {usd && (
                  <p className="text-slate-600 dark:text-slate-300">
                    USD: <strong>{parseCbuRate(usd.Rate)}</strong> {t.labelDate}: {updatedAt || usd.Date}
                  </p>
                )}
                {eur && (
                  <p className="text-slate-600 dark:text-slate-300">
                    EUR: <strong>{parseCbuRate(eur.Rate)}</strong>
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3">{t.prRmFulfilledHint}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t.prRmOrdersHistory}</h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
          <table className="w-full text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500">{t.prRmColOrderedAt}</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500">{t.prProductType}</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-500">kg</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500">{t.prRmCurrencyLabel}</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-500">{t.labelAmount}</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-500">UZS</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-500">{t.prRmCostPerKg}</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500">{t.prStatusLabel}</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-500" />
              </tr>
            </thead>
            <tbody>
              {historySorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                    {t.prRmNoOrders}
                  </td>
                </tr>
              ) : (
                historySorted.map((o, idx) => (
                  <tr
                    key={o.id}
                    className={`border-t border-slate-100 dark:border-slate-700 ${
                      idx % 2 ? 'bg-slate-50/50 dark:bg-slate-800/40' : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-slate-500 font-mono whitespace-nowrap">
                      {o.orderedAt.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">{o.rawMaterialName}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(o.quantityKg)}</td>
                    <td className="px-3 py-2">{o.currency}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(o.amountOriginal)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(o.amountUzs)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatCurrency(o.quantityKg > 0 ? o.amountUzs / o.quantityKg : 0)}
                    </td>
                    <td className="px-3 py-2">
                      {o.status === 'PENDING' ? (
                        <span className="text-amber-700 dark:text-amber-400">{t.prRmStatusPending}</span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400">{t.prRmStatusFulfilled}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {o.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => onFulfill(o.id)}
                          className="text-indigo-600 hover:underline text-xs font-medium"
                        >
                          {t.prRmMarkFulfilled}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================== SETTINGS TAB ========================

function SettingsTab() {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const [form, setForm] = useState({
    incomeTaxPercent: state.payrollSettings.incomeTaxPercent,
    socialTaxPercent: state.payrollSettings.socialTaxPercent,
    npsPercent: state.payrollSettings.npsPercent,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_PAYROLL_SETTINGS', payload: form });
  };

  return (
    <div className="max-w-md">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Settings size={16} className="text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.prSettingsTitle}</h3>
        </div>

        {/* Formula reminder */}
        <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-mono font-semibold">{t.prNetFormula}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">* {t.prTaxNotDeducted}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>{t.prIncomeTaxPct}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={form.incomeTaxPercent}
                onChange={e => setForm(p => ({ ...p, incomeTaxPercent: +e.target.value }))}
                min={0} max={100} step={0.1}
              />
              <span className="text-sm text-slate-500 font-medium">%</span>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">↓ {t.prIncomeTaxOnly}</p>
          </div>
          <div>
            <Label>{t.prNpsPct}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={form.npsPercent}
                onChange={e => setForm(p => ({ ...p, npsPercent: +e.target.value }))}
                min={0} max={100} step={0.01}
              />
              <span className="text-sm text-slate-500 font-medium">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">* {t.prTaxNotDeducted}</p>
          </div>
          <div>
            <Label>{t.prSocialTaxPct}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={form.socialTaxPercent}
                onChange={e => setForm(p => ({ ...p, socialTaxPercent: +e.target.value }))}
                min={0} max={100} step={0.1}
              />
              <span className="text-sm text-slate-500 font-medium">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">* {t.prTaxNotDeducted}</p>
          </div>
          <button type="submit" className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Save size={14} /> {t.prSaveSettings}
          </button>
        </form>
      </div>
    </div>
  );
}

// ======================== MAIN PAYROLL PAGE ========================

export function Payroll() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<
    'vedomost' | 'bank' | 'employees' | 'rawOrders' | 'settings'
  >('vedomost');

  const tabs = [
    { key: 'vedomost', label: t.prTabVedomost, icon: FileText },
    { key: 'bank', label: t.prTabBank, icon: Landmark },
    { key: 'employees', label: t.prTabEmployees, icon: Users },
    { key: 'rawOrders', label: t.prTabRawOrders, icon: ShoppingCart },
    { key: 'settings', label: t.prTabSettings, icon: Settings },
  ] as const;

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden p-3 min-[400px]:p-4 lg:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-slate-800 dark:text-white font-bold">{t.prTitle}</h1>
        <p className="text-slate-400 text-sm mt-0.5">SAM-BC MCHJ</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === key
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'vedomost' && <VedomostTab />}
      {activeTab === 'bank' && <BankTab />}
      {activeTab === 'employees' && <EmployeesTab />}
      {activeTab === 'rawOrders' && <RawMaterialOrdersTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}
