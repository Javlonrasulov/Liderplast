import React, { useState, useMemo, useRef } from 'react';
import {
  Users, FileText, Settings, Factory, Download, Printer, Plus,
  Trash2, CheckCircle, XCircle, Edit3, Save, X, ChevronDown,
  TrendingUp, DollarSign, Receipt, CreditCard, BadgeCheck, Clock,
  UploadCloud, CheckCircle2, Info, Minus
} from 'lucide-react';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatCurrency, formatNumber, TODAY } from '../utils/format';
import type { Employee } from '../store/erp-store';

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

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${props.className ?? ''}`}
    />
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
  const [fileMsg, setFileMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Upload file → marks ALL rows for this month as "Berildi" (paid)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: 'SET_MONTH_STATUS', payload: { month, status: 'paid' } });
    setFileMsg(t.prFileUploaded);
    setTimeout(() => setFileMsg(''), 7000);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

        {/* File upload trigger — triggers "Berildi" status for whole month */}
        {allRows.length > 0 && (
          <label
            className="flex items-center gap-2 h-9 px-4 rounded-xl border-2 border-dashed border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-medium cursor-pointer transition-all select-none"
            title={t.prUploadFile}
          >
            <UploadCloud size={15} />
            <span>{t.prUploadFile}</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv,.pdf,.txt,.zip"
            />
          </label>
        )}

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

      {/* ── File upload success banner ────────────────────────────── */}
      {fileMsg && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl animate-pulse-once">
          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">{fileMsg}</p>
          </div>
        </div>
      )}

      {/* ── KPI Summary cards ─────────────────────────────────────── */}
      {allRows.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            sub={`NPS: ${formatCurrency(totals.nps)} · Ijt: ${formatCurrency(totals.social)}`}
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
                    <div className="text-[9px] font-normal text-red-500 dark:text-red-400">NETdan chegirila-di</div>
                  </th>
                  {/* NPS — NOT deducted (*) */}
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div>{t.prNps} <span className="text-[9px] text-slate-400">*</span></div>
                    <div className="text-[9px] font-normal text-slate-400 dark:text-slate-500">Chegirila-maydi</div>
                  </th>
                  {/* Social Tax — NOT deducted (*) */}
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div>{t.prSocialTax} <span className="text-[9px] text-slate-400">*</span></div>
                    <div className="text-[9px] font-normal text-slate-400 dark:text-slate-500">Chegirila-maydi</div>
                  </th>
                  {/* NET — highlighted emerald */}
                  <th className="text-right px-3 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div>{t.prNet}</div>
                    <div className="text-[9px] font-normal text-emerald-500">B − I</div>
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

// ======================== EMPLOYEES TAB ========================

function EmployeesTab() {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const [form, setForm] = useState({ fullName: '', position: '', cardNumber: '', salaryType: 'fixed' as Employee['salaryType'], salaryAmount: 0 });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    dispatch({ type: 'ADD_EMPLOYEE', payload: form });
    setForm({ fullName: '', position: '', cardNumber: '', salaryType: 'fixed', salaryAmount: 0 });
  };

  const SALARY_TYPE_COLORS: Record<string, string> = {
    fixed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    per_piece: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    hybrid: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm h-fit">
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
            <Label>{t.prSalaryType}</Label>
            <Select value={form.salaryType} onChange={e => setForm(p => ({ ...p, salaryType: e.target.value as Employee['salaryType'] }))}>
              <option value="fixed">{t.prFixed}</option>
              <option value="per_piece">{t.prPerPiece}</option>
              <option value="hybrid">{t.prHybrid}</option>
            </Select>
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
      </div>

      <div className="lg:col-span-3 space-y-3">
        {state.employees.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
            <Users size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-slate-500 text-sm">{t.prNoEmployees}</p>
          </div>
        ) : (
          state.employees.map(emp => (
            <div key={emp.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center gap-4">
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
                  {emp.salaryAmount > 0 && <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{formatCurrency(emp.salaryAmount)}</span>}
                </div>
              </div>
              <button
                onClick={() => { if (confirm(`"${emp.fullName}" o'chirilsinmi?`)) dispatch({ type: 'DELETE_EMPLOYEE', payload: emp.id }); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ======================== PRODUCTION TAB ========================

function ProductionTab() {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const [month, setMonth] = useState(currentMonth());
  const [form, setForm] = useState({ employeeId: '', date: TODAY, productType: '18g Қолип', quantity: 0, pricePerUnit: 20 });

  const filtered = useMemo(() =>
    state.employeeProductions.filter(p => p.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date)),
    [state.employeeProductions, month]
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || form.quantity <= 0) return;
    dispatch({ type: 'ADD_EMPLOYEE_PRODUCTION', payload: form });
    setForm(p => ({ ...p, quantity: 0 }));
  };

  const PRODUCT_TYPES = ['18g Қолип', '20g Қолип', '0.5L Бакалашка', '1L Бакалашка', '5L Бакалашка'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Factory size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.prAddProduction}</h3>
        </div>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <Label>{t.prEmployee}</Label>
            <Select value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} required>
              <option value="">— Tanlang —</option>
              {state.employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t.labelDate}</Label>
            <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div>
            <Label>{t.prProductType}</Label>
            <Select value={form.productType} onChange={e => setForm(p => ({ ...p, productType: e.target.value }))}>
              {PRODUCT_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t.labelAmount} (dona)</Label>
            <Input type="number" value={form.quantity || ''} onChange={e => setForm(p => ({ ...p, quantity: +e.target.value }))} placeholder="10000" min={1} required />
          </div>
          <div>
            <Label>{t.prPricePerUnit} (so'm)</Label>
            <Input type="number" value={form.pricePerUnit || ''} onChange={e => setForm(p => ({ ...p, pricePerUnit: +e.target.value }))} placeholder="20" min={0} />
          </div>
          {form.quantity > 0 && form.pricePerUnit > 0 && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">Jami summa: <strong>{formatCurrency(form.quantity * form.pricePerUnit)}</strong></p>
            </div>
          )}
          <button type="submit" className="w-full h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Plus size={15} /> {t.prAddProduction}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="lg:col-span-3">
        <div className="flex items-center gap-3 mb-3">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          <span className="text-xs text-slate-400">{filtered.length} {t.totalRecords}</span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Factory size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-slate-500 text-sm">{t.noData}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    {[t.prEmployee, t.labelDate, t.prProductType, t.labelAmount, t.prPricePerUnit, t.labelTotal, ''].map((h, i) => (
                      <th key={i} className="text-left px-4 py-2.5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((prod, idx) => {
                    const emp = state.employees.find(e => e.id === prod.employeeId);
                    return (
                      <tr key={prod.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${idx % 2 !== 0 ? 'bg-slate-50/40 dark:bg-slate-800/40' : ''}`}>
                        <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{emp?.fullName ?? '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 font-mono">{prod.date}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-md text-xs font-medium">{prod.productType}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{formatNumber(prod.quantity)}</td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{formatNumber(prod.pricePerUnit)}</td>
                        <td className="px-4 py-2.5 font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(prod.totalAmount)}</td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => dispatch({ type: 'DELETE_EMPLOYEE_PRODUCTION', payload: prod.id })}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
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
  const [activeTab, setActiveTab] = useState<'vedomost' | 'employees' | 'production' | 'settings'>('vedomost');

  const tabs = [
    { key: 'vedomost', label: t.prTabVedomost, icon: FileText },
    { key: 'employees', label: t.prTabEmployees, icon: Users },
    { key: 'production', label: t.prTabProduction, icon: Factory },
    { key: 'settings', label: t.prTabSettings, icon: Settings },
  ] as const;

  return (
    <div className="p-4 lg:p-6 space-y-6">
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
      {activeTab === 'employees' && <EmployeesTab />}
      {activeTab === 'production' && <ProductionTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}
