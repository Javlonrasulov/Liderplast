import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  FileText, Download, RefreshCw, Calendar, TrendingUp, TrendingDown,
  Wallet, ArrowUpRight, ArrowDownLeft, Scale, Printer, CheckCircle2,
  AlertCircle, Clock
} from 'lucide-react';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatCurrency, formatDate } from '../utils/format';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AktTransaction {
  id: string;
  date: string;
  type: 'sale' | 'payment';
  docNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface AktSummary {
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

type QuickFilter = 'all' | 'today' | 'week' | 'month';

const INPUT_CLS =
  'px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getQuickDates(filter: QuickFilter): { from: string; to: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = fmt(now);

  if (filter === 'today') return { from: today, to: today };
  if (filter === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { from: fmt(d), to: today };
  }
  if (filter === 'month') {
    const d = new Date(now);
    d.setDate(1);
    return { from: fmt(d), to: today };
  }
  return { from: '2026-01-01', to: today };
}

// ── Component ─────────────────────────────────────────────────────────────────
interface AktSverkaProps {
  clientId: string;
}

export function AktSverka({ clientId }: AktSverkaProps) {
  const { state } = useERP();
  const { t } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  const client = state.clients.find(c => c.id === clientId);
  const today = new Date().toISOString().split('T')[0];
  const monthStart = `${today.slice(0, 7)}-01`;

  const [dateFrom, setDateFrom] = useState(monthStart);
  const [dateTo, setDateTo] = useState(today);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('month');
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Apply quick filter
  const applyQuick = (filter: QuickFilter) => {
    setQuickFilter(filter);
    const { from, to } = getQuickDates(filter);
    setDateFrom(from);
    setDateTo(to);
    setGenerated(false);
  };

  // ── AKT Computation ─────────────────────────────────────────────────────────
  const { transactions, summary } = useMemo<{ transactions: AktTransaction[]; summary: AktSummary }>(() => {
    if (!client) return { transactions: [], summary: { openingBalance: 0, totalDebit: 0, totalCredit: 0, closingBalance: 0 } };

    const clientSales = state.sales.filter(s => s.clientId === clientId);
    const clientPayments = state.payments.filter(p => p.clientId === clientId);

    // Opening balance: sum of all debits/credits BEFORE dateFrom
    let openingBalance = 0;
    for (const sale of clientSales) {
      if (sale.date < dateFrom) openingBalance += sale.total;
    }
    for (const payment of clientPayments) {
      if (payment.date < dateFrom) openingBalance -= payment.amount;
    }

    // Transactions within date range
    const txs: Omit<AktTransaction, 'balance'>[] = [];

    for (const sale of clientSales) {
      if (sale.date >= dateFrom && sale.date <= dateTo) {
        const itemsDesc = sale.items && sale.items.length > 1
          ? sale.items.map(i => `${i.quantity.toLocaleString()} ${i.productType}`).join(', ')
          : `${sale.quantity.toLocaleString()} ${sale.productType}`;
        txs.push({
          id: sale.id,
          date: sale.date,
          type: 'sale',
          docNumber: sale.id.toUpperCase(),
          description: itemsDesc,
          debit: sale.total,
          credit: 0,
        });
      }
    }

    for (const payment of clientPayments) {
      if (payment.date >= dateFrom && payment.date <= dateTo) {
        txs.push({
          id: payment.id,
          date: payment.date,
          type: 'payment',
          docNumber: payment.id.toUpperCase(),
          description: payment.description,
          debit: 0,
          credit: payment.amount,
        });
      }
    }

    // Sort by date
    txs.sort((a, b) => a.date.localeCompare(b.date));

    // Compute running balance
    let balance = openingBalance;
    const withBalance: AktTransaction[] = txs.map(tx => {
      balance += tx.debit - tx.credit;
      return { ...tx, balance };
    });

    const totalDebit = txs.reduce((s, t) => s + t.debit, 0);
    const totalCredit = txs.reduce((s, t) => s + t.credit, 0);
    const closingBalance = openingBalance + totalDebit - totalCredit;

    return {
      transactions: withBalance,
      summary: { openingBalance, totalDebit, totalCredit, closingBalance },
    };
  }, [clientId, client, state.sales, state.payments, dateFrom, dateTo]);

  // ── Generate handler ─────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerated(false);
    await new Promise(r => setTimeout(r, 800));
    setGenerating(false);
    setGenerated(true);
  }, []);

  // ── Print / PDF ──────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`
      <html><head><title>AKT Sverka — ${client?.name}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: 'Segoe UI', Arial, sans-serif; }
        body { padding: 32px; color: #111; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .header-left h1 { font-size: 22px; font-weight: 700; color: #1e293b; }
        .header-left p { font-size: 13px; color: #64748b; margin-top: 4px; }
        .header-right { text-align: right; font-size: 12px; color: #64748b; }
        .divider { border: none; border-top: 2px solid #e2e8f0; margin: 16px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .info-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
        .info-box label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .info-box p { font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 2px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .summary-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
        .summary-card label { font-size: 10px; color: #94a3b8; text-transform: uppercase; }
        .summary-card p { font-size: 16px; font-weight: 700; margin-top: 2px; }
        .debit-color { color: #dc2626; }
        .credit-color { color: #16a34a; }
        .balance-color { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background: #f8fafc; }
        th { text-align: left; padding: 10px 12px; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
        td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        tr.sale-row { background: #fffbeb; }
        tr.payment-row { background: #f0fdf4; }
        tr.total-row { background: #f8fafc; font-weight: 700; border-top: 2px solid #e2e8f0; }
        .mono { font-family: 'Courier New', monospace; }
        .text-right { text-align: right; }
        .text-debit { color: #dc2626; }
        .text-credit { color: #16a34a; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .badge-sale { background: #fef9c3; color: #854d0e; }
        .badge-payment { background: #dcfce7; color: #166534; }
        .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .sig-line { margin-top: 48px; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; color: #94a3b8; font-size: 11px; }
        .sig-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
      </head><body>
      ${el.innerHTML}
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  if (!client) return null;

  const quickFilters: { key: QuickFilter; label: string }[] = [
    { key: 'all', label: t.aktFilterAll },
    { key: 'today', label: t.aktFilterToday },
    { key: 'week', label: t.aktFilterWeek },
    { key: 'month', label: t.aktFilterMonth },
  ];

  const hasData = transactions.length > 0;
  const debtColor = summary.closingBalance > 0
    ? 'text-red-600 dark:text-red-400'
    : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-800 dark:text-white font-semibold flex items-center gap-2">
            <Scale size={17} className="text-indigo-500" />
            {t.aktTitle}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">{client.name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            {generating
              ? <><RefreshCw size={14} className="animate-spin" />{t.aktGenerating}</>
              : <><FileText size={14} />{t.aktGenerate}</>
            }
          </button>
          {generated && hasData && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <Download size={14} />{t.aktDownloadPdf}
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-1.5 flex-wrap">
            {quickFilters.map(qf => (
              <button
                key={qf.key}
                onClick={() => applyQuick(qf.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${quickFilter === qf.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {qf.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setQuickFilter('all'); setGenerated(false); }}
                className={INPUT_CLS}
              />
            </div>
            <span className="text-slate-400 text-xs">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setQuickFilter('all'); setGenerated(false); }}
              className={INPUT_CLS}
            />
          </div>
        </div>
        {(dateFrom && dateTo) && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Clock size={11} />
            {t.aktPeriod}: {formatDate(dateFrom)} — {formatDate(dateTo)}
          </p>
        )}
      </div>

      {/* ── Status banner ────────────────────────────────────────────── */}
      {!generated && !generating && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <AlertCircle size={16} className="text-blue-500 flex-shrink-0" />
          <p className="text-blue-700 dark:text-blue-300 text-sm">{t.aktGenerate} → АКТ ни кўриш учун тугмани босинг</p>
        </div>
      )}

      {generated && (
        <>
          {/* ── Summary Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Opening Balance */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Wallet size={13} className="text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-tight">{t.aktOpeningBalance}</p>
              </div>
              <p className={`text-lg font-bold ${summary.openingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                {formatCurrency(Math.abs(summary.openingBalance))}
              </p>
              {summary.openingBalance > 0 && (
                <p className="text-xs text-red-500 mt-0.5">Qarz mavjud</p>
              )}
            </div>

            {/* Total Sales */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <ArrowUpRight size={13} className="text-red-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-tight">{t.aktTotalSales}</p>
              </div>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary.totalDebit)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {state.sales.filter(s => s.clientId === clientId && s.date >= dateFrom && s.date <= dateTo).length} та
              </p>
            </div>

            {/* Total Payments */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <ArrowDownLeft size={13} className="text-emerald-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-tight">{t.aktTotalPayments}</p>
              </div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(summary.totalCredit)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {state.payments.filter(p => p.clientId === clientId && p.date >= dateFrom && p.date <= dateTo).length} та
              </p>
            </div>

            {/* Closing Balance */}
            <div className={`rounded-2xl border p-4 shadow-sm ${summary.closingBalance > 0
              ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
              : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${summary.closingBalance > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                  <Scale size={13} className={summary.closingBalance > 0 ? 'text-red-500' : 'text-emerald-500'} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-tight">{t.aktClosingBalance}</p>
              </div>
              <p className={`text-lg font-bold ${debtColor}`}>
                {formatCurrency(Math.abs(summary.closingBalance))}
              </p>
              <p className={`text-xs mt-0.5 ${debtColor}`}>
                {summary.closingBalance > 0 ? '▲ Qarz' : '✓ Hisob-kitob'}
              </p>
            </div>
          </div>

          {/* ── Success banner ────────────────────────────────────── */}
          <div className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
            <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
            <p className="text-emerald-700 dark:text-emerald-300 text-sm">
              АКТ муваффақиятли яратилди. {transactions.length} та операция.
            </p>
          </div>

          {/* ── Printable AKT ─────────────────────────────────────── */}
          <div
            ref={printRef}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
          >
            {/* AKT Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                      <Scale size={16} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 dark:text-white font-bold">АКТ СВЕРКИ</h3>
                      <p className="text-slate-400 text-xs">Reconciliation Statement</p>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                  <p>{t.aktCompany}: <span className="font-semibold text-slate-700 dark:text-slate-200">SAM-BC MCHJ</span></p>
                  <p>{t.colClient}: <span className="font-semibold text-slate-700 dark:text-slate-200">{client.name}</span></p>
                  <p>{t.aktPeriod}: <span className="font-medium">{formatDate(dateFrom)} — {formatDate(dateTo)}</span></p>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            {!hasData ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Scale size={36} className="opacity-20 mb-3" />
                <p className="text-sm">{t.aktEmpty}</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.aktDate}</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{t.aktDocType}</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hidden lg:table-cell">{t.aktDocNum}</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-red-500 whitespace-nowrap">{t.aktDebit}</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-emerald-600 whitespace-nowrap">{t.aktCredit}</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.aktBalance}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Opening balance row */}
                      <tr className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
                        <td className="px-5 py-3 text-xs text-slate-400">—</td>
                        <td className="px-5 py-3 text-xs text-slate-400">—</td>
                        <td className="px-5 py-3" colSpan={2}>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 italic">{t.aktRowOpening}</span>
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-slate-400">—</td>
                        <td className="px-5 py-3 text-right text-xs text-slate-400">—</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-sm font-bold ${summary.openingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {formatCurrency(Math.abs(summary.openingBalance))}
                          </span>
                        </td>
                      </tr>

                      {transactions.map((tx, idx) => (
                        <tr
                          key={tx.id}
                          className={`border-t border-slate-100 dark:border-slate-700 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 ${
                            tx.type === 'sale'
                              ? 'bg-amber-50/30 dark:bg-amber-900/5'
                              : 'bg-emerald-50/30 dark:bg-emerald-900/5'
                          }`}
                        >
                          <td className="px-5 py-3 text-xs text-slate-400">{idx + 1}</td>
                          <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                                tx.type === 'sale'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                              }`}>
                                {tx.type === 'sale' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {tx.type === 'sale' ? t.aktSaleType : t.aktPaymentType}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{tx.description}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-400 font-mono hidden lg:table-cell">{tx.docNumber}</td>
                          <td className="px-5 py-3 text-right">
                            {tx.debit > 0
                              ? <span className="text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(tx.debit)}</span>
                              : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-right">
                            {tx.credit > 0
                              ? <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(tx.credit)}</span>
                              : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`text-sm font-bold ${tx.balance > 0 ? 'text-red-600 dark:text-red-400' : tx.balance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                              {formatCurrency(Math.abs(tx.balance))}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Closing balance row */}
                      <tr className="border-t-2 border-slate-300 dark:border-slate-500 bg-slate-50 dark:bg-slate-700/50">
                        <td colSpan={4} className="px-5 py-3">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{t.aktRowClosing}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalDebit)}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.totalCredit)}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-sm font-bold ${debtColor}`}>{formatCurrency(Math.abs(summary.closingBalance))}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                  {transactions.map((tx, idx) => (
                    <div key={tx.id} className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0 ${
                              tx.type === 'sale'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                            }`}>
                              {tx.type === 'sale' ? t.aktSaleType : t.aktPaymentType}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">{formatDate(tx.date)}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tx.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {tx.debit > 0 && <p className="text-sm font-bold text-red-600 dark:text-red-400">+{formatCurrency(tx.debit)}</p>}
                          {tx.credit > 0 && <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">−{formatCurrency(tx.credit)}</p>}
                          <p className={`text-xs mt-0.5 ${tx.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {t.aktBalance}: {formatCurrency(Math.abs(tx.balance))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Mobile total */}
                  <div className="px-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t.aktRowClosing}</p>
                      <p className="text-xs text-red-500">{t.aktDebit}: {formatCurrency(summary.totalDebit)}</p>
                      <p className="text-xs text-emerald-600">{t.aktCredit}: {formatCurrency(summary.totalCredit)}</p>
                    </div>
                    <p className={`text-lg font-bold ${debtColor}`}>{formatCurrency(Math.abs(summary.closingBalance))}</p>
                  </div>
                </div>
              </>
            )}

            {/* ── Signature Section ──────────────────────────────── */}
            {hasData && (
              <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">{t.aktSignature}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">{t.aktCompany}: SAM-BC MCHJ</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{t.aktDirectorSig}:</p>
                    <div className="border-b border-slate-300 dark:border-slate-600 mb-1 pb-1" />
                    <p className="text-xs text-slate-400">_____________________ / ____________</p>
                    <p className="text-xs text-slate-400 mt-1">{t.aktAccountant}:</p>
                    <div className="border-b border-slate-300 dark:border-slate-600 mt-5 mb-1 pb-1" />
                    <p className="text-xs text-slate-400">_____________________ / ____________</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">{t.colClient}: {client.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{t.aktClientSig}:</p>
                    <div className="border-b border-slate-300 dark:border-slate-600 mb-1 pb-1" />
                    <p className="text-xs text-slate-400">_____________________ / ____________</p>
                    {client.bankName && (
                      <p className="text-xs text-slate-400 mt-3">{t.labelBankName}: {client.bankName}</p>
                    )}
                    {client.bankAccount && (
                      <p className="text-xs text-slate-400 mt-1 font-mono">{t.labelBankAccount}: {client.bankAccount}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
