import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, User, Phone, Building2, CreditCard, ShoppingCart, Wallet,
  Plus, Trash2, CheckCircle2, AlertTriangle, Scale, Calendar, ChevronDown,
  ChevronUp, TrendingUp, Copy, Check, BadgeCheck, Clock
} from 'lucide-react';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatCurrency, formatDate, formatNumber, TODAY } from '../utils/format';
import { AktSverka } from './AktSverka';

// ── Constants ─────────────────────────────────────────────────────────────────
const INPUT_CLS =
  'w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors';

type Tab = 'info' | 'sales' | 'payments' | 'akt';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

export function ClientDetail({ clientId, onBack }: ClientDetailProps) {
  const { state, dispatch } = useERP();
  const { t } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  // Payment form
  const [pmAmount, setPmAmount] = useState('');
  const [pmDesc, setPmDesc] = useState('');
  const [pmDate, setPmDate] = useState(TODAY);
  const [pmSuccess, setPmSuccess] = useState('');
  const [pmError, setPmError] = useState('');

  const client = state.clients.find(c => c.id === clientId);
  if (!client) return null;

  const clientSales = useMemo(
    () => [...state.sales].filter(s => s.clientId === clientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.sales, clientId]
  );
  const clientPayments = useMemo(
    () => [...state.payments].filter(p => p.clientId === clientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.payments, clientId]
  );

  const totalPurchases = clientSales.reduce((s, x) => s + x.total, 0);
  const totalPaid = clientSales.reduce((s, x) => s + x.paid, 0) + clientPayments.reduce((s, x) => s + x.amount, 0);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCopyAccount = () => {
    if (!client.bankAccount) return;
    navigator.clipboard.writeText(client.bankAccount).catch(() => {});
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPmError('');
    const amount = parseFloat(pmAmount);
    if (!amount || amount <= 0) { setPmError('Summa kiriting!'); return; }
    dispatch({
      type: 'ADD_PAYMENT',
      payload: {
        clientId,
        clientName: client.name,
        amount,
        description: pmDesc || 'To\'lov',
        date: pmDate,
      },
    });
    setPmAmount('');
    setPmDesc('');
    setPmSuccess(t.pmAddSuccess);
    setTimeout(() => setPmSuccess(''), 4000);
  };

  const handleDeletePayment = (id: string) => {
    if (!window.confirm(t.pmDeleteConfirm)) return;
    dispatch({ type: 'DELETE_PAYMENT', payload: id });
  };

  // ── Tabs config ───────────────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'info', label: t.cdInfo, icon: User },
    { key: 'sales', label: t.cdSales, icon: ShoppingCart, count: clientSales.length },
    { key: 'payments', label: t.cdPayments, icon: Wallet, count: clientPayments.length },
    { key: 'akt', label: t.cdAkt, icon: Scale },
  ];

  return (
    <div className="flex flex-col min-h-0">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">{t.cdBack}</span>
        </button>

        {/* Client identity block */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-slate-800 dark:text-white font-semibold truncate">{client.name}</h2>
              {client.debt <= 0 && (
                <BadgeCheck size={15} className="text-emerald-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-slate-400 text-xs">{client.phone}</p>
          </div>
        </div>

        {/* Debt badge */}
        <div className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold ${
          client.debt > 0
            ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
        }`}>
          {client.debt > 0 ? `−${formatCurrency(client.debt)}` : '✓ Hisob-kitob'}
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-sm">
          <p className="text-slate-400 text-xs mb-0.5">{t.cdTotalPurchases}</p>
          <p className="text-slate-800 dark:text-white font-bold">{formatCurrency(totalPurchases)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-sm">
          <p className="text-slate-400 text-xs mb-0.5">{t.colPaid}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(totalPaid)}</p>
        </div>
        <div className={`border rounded-2xl p-3 shadow-sm ${client.debt > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
          <p className="text-slate-400 text-xs mb-0.5">{t.cdDebt}</p>
          <p className={`font-bold ${client.debt > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(client.debt)}
          </p>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-0.5 border-b border-slate-200 dark:border-slate-700 mb-5 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === key
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.slice(0, 4)}</span>
            {count !== undefined && count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === key
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* INFO TAB                                                   */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Contact info */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-4 flex items-center gap-2">
              <User size={14} className="text-indigo-500" />
              {t.cdContactInfo}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
                  <User size={13} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{t.labelName}</p>
                  <p className="text-slate-800 dark:text-white font-medium text-sm">{client.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
                  <Phone size={13} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{t.labelPhone}</p>
                  <a href={`tel:${client.phone}`} className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
                    {client.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
                  <Clock size={13} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{t.cdCreatedAt}</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{formatDate(client.createdAt.slice(0, 10))}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bank info */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-4 flex items-center gap-2">
              <Building2 size={14} className="text-blue-500" />
              {t.cdBankInfo}
            </h3>
            {client.bankName || client.bankAccount ? (
              <div className="space-y-3">
                {client.bankName && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                      <Building2 size={13} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">{t.labelBankName}</p>
                      <p className="text-slate-800 dark:text-white font-medium text-sm">{client.bankName}</p>
                    </div>
                  </div>
                )}
                {client.bankAccount && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
                      <CreditCard size={13} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 mb-0.5">{t.labelBankAccount}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-sm tracking-wider">
                          {client.bankAccount.replace(/(.{4})/g, '$1 ').trim()}
                        </p>
                        <button
                          onClick={handleCopyAccount}
                          className="p-1 rounded text-slate-400 hover:text-indigo-500 transition-colors"
                          title="Nusxa olish"
                        >
                          {copiedAccount ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <CreditCard size={28} className="opacity-20 mb-2" />
                <p className="text-xs">Bank ma'lumotlari kiritilmagan</p>
              </div>
            )}
          </div>

          {/* Financial summary */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" />
              Moliyaviy ko'rsatkichlar
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Jami operatsiyalar', value: `${clientSales.length} ta`, color: 'text-indigo-600 dark:text-indigo-400' },
                { label: t.cdTotalPurchases, value: formatCurrency(totalPurchases), color: 'text-slate-800 dark:text-white' },
                { label: t.colPaid, value: formatCurrency(totalPaid), color: 'text-emerald-600 dark:text-emerald-400' },
                { label: t.cdDebt, value: formatCurrency(client.debt), color: client.debt > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400' },
              ].map(item => (
                <div key={item.label} className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-slate-400 text-xs mb-1">{item.label}</p>
                  <p className={`font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* SALES TAB                                                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'sales' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm flex items-center gap-2">
              <ShoppingCart size={14} className="text-emerald-500" />
              {t.cdSales}
            </h3>
            <span className="text-xs text-slate-400">{clientSales.length} ta</span>
          </div>

          {clientSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ShoppingCart size={36} className="opacity-20 mb-3" />
              <p className="text-sm">{t.cdNoSales}</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      {[t.colDate, t.colProduct, t.colQty, t.labelPrice, t.colTotal, t.colPaid, t.colDebt, ''].map((h, i) => (
                        <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clientSales.map(sale => {
                      const isMulti = sale.items && sale.items.length > 1;
                      const isExpanded = expandedSale === sale.id;
                      const saleDebt = sale.total - sale.paid;
                      return (
                        <React.Fragment key={sale.id}>
                          <tr className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap font-mono">{formatDate(sale.date)}</td>
                            <td className="px-4 py-3">
                              {isMulti ? (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium">
                                  Aralash ({sale.items!.length})
                                </span>
                              ) : (
                                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                                  sale.productCategory === 'semi'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                                }`}>{sale.productType}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{formatNumber(sale.quantity)}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{formatNumber(sale.pricePerUnit)}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white whitespace-nowrap">{formatCurrency(sale.total)}</td>
                            <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(sale.paid)}</td>
                            <td className="px-4 py-3">
                              {saleDebt > 0
                                ? <span className="text-xs font-bold text-red-600 dark:text-red-400">{formatCurrency(saleDebt)}</span>
                                : <span className="text-xs text-emerald-500">✓</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              {isMulti && (
                                <button onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                </button>
                              )}
                            </td>
                          </tr>
                          {isMulti && isExpanded && sale.items!.map((item, ii) => (
                            <tr key={`${sale.id}_i${ii}`} className="bg-indigo-50/50 dark:bg-indigo-900/5 border-t border-indigo-100 dark:border-indigo-800/30">
                              <td className="px-4 py-2 text-xs text-slate-400 pl-8">↳</td>
                              <td className="px-4 py-2">
                                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                                  item.productCategory === 'semi'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                                }`}>{item.productType}</span>
                              </td>
                              <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{formatNumber(item.quantity)}</td>
                              <td className="px-4 py-2 text-xs text-slate-500">{formatNumber(item.pricePerUnit)}</td>
                              <td className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300">{formatCurrency(item.total)}</td>
                              <td colSpan={3} />
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-700">
                {clientSales.map(sale => {
                  const saleDebt = sale.total - sale.paid;
                  return (
                    <div key={sale.id} className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                              sale.productCategory === 'semi'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                            }`}>{sale.productType}</span>
                            <span className="text-xs text-slate-400 font-mono">{formatDate(sale.date)}</span>
                          </div>
                          <p className="text-xs text-slate-500">{formatNumber(sale.quantity)} ta × {formatNumber(sale.pricePerUnit)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(sale.total)}</p>
                          {saleDebt > 0
                            ? <p className="text-xs text-red-500">Qarz: {formatCurrency(saleDebt)}</p>
                            : <p className="text-xs text-emerald-500">✓ To'langan</p>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* PAYMENTS TAB                                               */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Add payment form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-4 flex items-center gap-2">
              <Plus size={14} className="text-indigo-500" />
              {t.pmAddPayment}
            </h3>

            {pmSuccess && (
              <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 dark:text-emerald-400 text-xs">{pmSuccess}</p>
              </div>
            )}
            {pmError && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-start gap-2">
                <AlertTriangle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 dark:text-red-400 text-xs">{pmError}</p>
              </div>
            )}

            <form onSubmit={handleAddPayment} className="space-y-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">{t.pmDate}</label>
                <input type="date" value={pmDate} onChange={e => setPmDate(e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">{t.pmAmount} ({t.unitSum})</label>
                <input
                  type="number"
                  value={pmAmount}
                  onChange={e => setPmAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  className={INPUT_CLS}
                />
                {client.debt > 0 && (
                  <p className="text-xs text-red-500 mt-1">Qarz: {formatCurrency(client.debt)}</p>
                )}
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">{t.pmDesc}</label>
                <input
                  value={pmDesc}
                  onChange={e => setPmDesc(e.target.value)}
                  placeholder="To'lov izohı..."
                  className={INPUT_CLS}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={14} />
                {t.pmAddPayment}
              </button>
            </form>
          </div>

          {/* Payment history */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm flex items-center gap-2">
                <Wallet size={14} className="text-emerald-500" />
                {t.pmHistory}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{clientPayments.length} ta</span>
                {clientPayments.length > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Jami: {formatCurrency(clientPayments.reduce((s, p) => s + p.amount, 0))}
                  </span>
                )}
              </div>
            </div>

            {clientPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Wallet size={36} className="opacity-20 mb-3" />
                <p className="text-sm">{t.pmNoPayments}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {clientPayments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{payment.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar size={10} className="text-slate-400" />
                          <p className="text-slate-400 text-xs font-mono">{formatDate(payment.date)}</p>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <p className="text-slate-400 text-xs font-mono">{payment.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(payment.amount)}</p>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* AKT SVERKA TAB                                             */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'akt' && (
        <AktSverka clientId={clientId} />
      )}
    </div>
  );
}
