import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Plus, AlertTriangle, CheckCircle2, UserPlus, Trash2, Package, ChevronDown, ChevronUp, Building2, CreditCard, Copy, Check, ExternalLink, Printer } from 'lucide-react';
import {
  useERP,
  type FinishedProductCatalogItem,
  type SaleOrderItem,
  type SemiProductCatalogItem,
  type Sale,
} from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatNumber, formatCurrency, formatDate, TODAY } from '../utils/format';
import { ClientDetail } from '../components/ClientDetail';
import {
  finalBucketFromCatalog,
  semiBucketFromCatalog,
} from '../utils/warehouse-catalog-buckets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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

// ---- Cart item row (inline editable) ----
interface CartItemRow extends SaleOrderItem {
  _id: string; // local temp key
  _stockOk: boolean;
}

const INPUT_CLS =
  'w-full px-2.5 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

const SELECT_TRIGGER_CLS =
  'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white';

export function Sales() {
  const {
    state,
    dispatch,
    semiStockByProductName,
    finalStockByProductName,
    isLoading,
  } = useERP();
  const { t, filterData } = useApp();

  const [activeTab, setActiveTab] = useState<'sale' | 'clients' | 'history'>('sale');

  // ---- Order form ----
  const [clientId, setClientId] = useState(state.clients[0]?.id || '');
  const [orderDate, setOrderDate] = useState(TODAY);
  const [paid, setPaid] = useState('');
  const [cartItems, setCartItems] = useState<CartItemRow[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ---- Add item mini-form (productType = katalog nomi — API semiByName / finalByName) ----
  const [addCat, setAddCat] = useState<'semi' | 'final'>('final');
  const [addType, setAddType] = useState<string>('');
  const [addQty, setAddQty] = useState('');
  const [addPrice, setAddPrice] = useState('');

  const saleSemiCatalog = useMemo(
    () =>
      state.warehouseProducts.filter(
        (p): p is SemiProductCatalogItem => p.itemType === 'SEMI_PRODUCT',
      ),
    [state.warehouseProducts],
  );

  const saleFinalCatalog = useMemo(
    () =>
      state.warehouseProducts.filter(
        (p): p is FinishedProductCatalogItem =>
          p.itemType === 'FINISHED_PRODUCT' && finalBucketFromCatalog(p) !== null,
      ),
    [state.warehouseProducts],
  );

  const currentCatalogOptions = addCat === 'semi' ? saleSemiCatalog : saleFinalCatalog;

  const selectedProductName = useMemo(() => {
    const opts = currentCatalogOptions;
    if (opts.length === 0) return '';
    if (addType && opts.some((p) => p.name === addType)) return addType;
    return opts[0].name;
  }, [currentCatalogOptions, addType]);

  const handleCatChange = (cat: 'semi' | 'final') => {
    setAddCat(cat);
    setAddType('');
  };

  const getStock = (cat: 'semi' | 'final', productName: string): number => {
    if (!productName) return 0;
    if (cat === 'semi') {
      const p = saleSemiCatalog.find((x) => x.name === productName);
      if (!p) return 0;
      return semiStockByProductName[productName] ?? 0;
    }
    const p = saleFinalCatalog.find((x) => x.name === productName);
    if (!p) return 0;
    return finalStockByProductName[productName] ?? 0;
  };

  const availableForAdd = getStock(addCat, selectedProductName);

  const availabilityRows = useMemo(() => {
    const rows: Array<{
      key: string;
      label: string;
      value: number;
      color: string;
      textColor: string;
      cat: 'semi' | 'final';
    }> = [];
    for (const p of saleSemiCatalog) {
      const b = semiBucketFromCatalog(p);
      const is18 = b === '18g';
      rows.push({
        key: `semi-${p.id}`,
        label: p.name,
        value: semiStockByProductName[p.name] ?? 0,
        color: is18 ? 'bg-purple-500' : 'bg-violet-500',
        textColor: is18
          ? 'text-purple-600 dark:text-purple-400'
          : 'text-violet-600 dark:text-violet-400',
        cat: 'semi',
      });
    }
    for (const p of saleFinalCatalog) {
      const b = finalBucketFromCatalog(p);
      const colorStyle =
        b === '5L'
          ? { color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' }
          : b === '1L'
            ? { color: 'bg-teal-500', textColor: 'text-teal-600 dark:text-teal-400' }
            : b === '0.5L'
              ? { color: 'bg-cyan-500', textColor: 'text-cyan-600 dark:text-cyan-400' }
              : { color: 'bg-sky-500', textColor: 'text-sky-600 dark:text-sky-400' };
      rows.push({
        key: `final-${p.id}`,
        label: p.name,
        value: finalStockByProductName[p.name] ?? 0,
        cat: 'final',
        ...colorStyle,
      });
    }
    return rows;
  }, [saleSemiCatalog, saleFinalCatalog, semiStockByProductName, finalStockByProductName]);

  // Check cart stock (sum per type)
  const cartUsed = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const item of cartItems) {
      const key = `${item.productCategory}__${item.productType}`;
      acc[key] = (acc[key] || 0) + item.quantity;
    }
    return acc;
  }, [cartItems]);

  const handleAddToCart = () => {
    const qty = parseInt(addQty) || 0;
    const price = parseFloat(addPrice) || 0;
    if (!selectedProductName.trim() || qty <= 0 || price <= 0) return;

    const key = `${addCat}__${selectedProductName}`;
    const alreadyInCart = cartUsed[key] || 0;
    const stockOk = qty + alreadyInCart <= getStock(addCat, selectedProductName);

    const newItem: CartItemRow = {
      _id: `ci_${Date.now()}_${Math.random()}`,
      productCategory: addCat,
      productType: selectedProductName,
      quantity: qty,
      pricePerUnit: price,
      total: qty * price,
      _stockOk: stockOk,
    };
    setCartItems(prev => [...prev, newItem]);
    setAddQty('');
    setAddPrice('');
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const orderTotal = useMemo(() => cartItems.reduce((s, i) => s + i.total, 0), [cartItems]);
  const paidNum = parseFloat(paid) || 0;
  const debt = orderTotal - paidNum;

  const allStockOk = useMemo(() => {
    // Recompute properly per type considering combined cart quantities
    const acc: Record<string, number> = {};
    for (const item of cartItems) {
      const key = `${item.productCategory}__${item.productType}`;
      acc[key] = (acc[key] || 0) + item.quantity;
    }
    return Object.entries(acc).every(([key, total]) => {
      const [cat, type] = key.split('__');
      return total <= getStock(cat as 'semi' | 'final', type);
    });
  }, [cartItems, semiStockByProductName, finalStockByProductName, saleSemiCatalog, saleFinalCatalog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clientId) { setError(t.colClient + '!'); return; }
    if (cartItems.length === 0) { setError(t.slCartEmpty + '!'); return; }
    if (!allStockOk) { setError(t.slAvailableStock + '!'); return; }

    const client = state.clients.find(c => c.id === clientId);
    const items: SaleOrderItem[] = cartItems.map(({ productCategory, productType, quantity, pricePerUnit, total }) => ({
      productCategory, productType, quantity, pricePerUnit, total,
    }));

    dispatch({
      type: 'ADD_SALE_ORDER',
      payload: { clientId, clientName: client?.name || '', date: orderDate, items, paid: paidNum },
    });

    setCartItems([]);
    setPaid('');
    const totalStr = formatCurrency(orderTotal);
    setSuccess(`${t.slBtn}: ${totalStr} (${items.length} та махсулот)`);
    setTimeout(() => setSuccess(''), 5000);
  };

  // ---- Client form ----
  const [clientForm, setClientForm] = useState({ name: '', phone: '', bankAccount: '', bankName: '' });
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;
    dispatch({ type: 'ADD_CLIENT', payload: clientForm });
    setClientForm({ name: '', phone: '', bankAccount: '', bankName: '' });
  };

  // ---- History ----
  const filteredSales = filterData([...state.sales]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalRevenue = state.sales.reduce((s, sale) => s + sale.total, 0);
  const totalPaidAll = state.sales.reduce((s, sale) => s + sale.paid, 0);
  const totalDebt = state.clients.reduce((s, c) => s + c.debt, 0);

  const tabs = [
    { key: 'sale', label: t.slTabNew, icon: ShoppingCart },
    { key: 'clients', label: t.slTabClients, icon: UserPlus },
    { key: 'history', label: t.slTabHistory, icon: CheckCircle2 },
  ];

  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedClientDetail, setSelectedClientDetail] = useState<string | null>(null);
  const [clientIdToDelete, setClientIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (clientId && !state.clients.some((c) => c.id === clientId)) {
      setClientId(state.clients[0]?.id ?? '');
    }
  }, [state.clients, clientId]);

  const handleConfirmDeleteClient = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!clientIdToDelete) return;
    const id = clientIdToDelete;
    try {
      await dispatch({ type: 'DELETE_CLIENT', payload: id });
      setSelectedClientDetail((prev) => (prev === id ? null : prev));
    } catch {
      /* refresh / error surfaced via ERP context */
    } finally {
      setClientIdToDelete(null);
    }
  };

  const handlePrintSale = (sale: Sale) => {
    const debtAmount = Math.max(0, (sale.total ?? 0) - (sale.paid ?? 0));
    const hasDebt = debtAmount > 0.01;

    const items = sale.items && sale.items.length > 0
      ? sale.items
      : [{
          productCategory: sale.productCategory,
          productType: sale.productType,
          quantity: sale.quantity,
          pricePerUnit: sale.pricePerUnit,
          total: sale.total,
        }];

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${t.slTitle} — ${sale.clientName}</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; color: #0f172a; }
      h1 { font-size: 18px; margin: 0 0 8px; }
      .muted { color: #64748b; font-size: 12px; }
      .row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 10px; }
      .box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; min-width: 220px; }
      table { width: 100%; border-collapse: collapse; margin-top: 14px; }
      th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 12px; text-align: left; }
      th { background: #f8fafc; font-weight: 700; }
      .sum { font-weight: 800; }
      .badge { display:inline-block; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }
      .bad { background:#fee2e2; color:#991b1b; }
      .ok { background:#dcfce7; color:#166534; }
      @media print { body { margin: 10mm; } }
    </style>
  </head>
  <body>
    <h1>${t.slCompanyName}</h1>
    <div class="muted">${t.slTitle} • ${formatDate(sale.date)} • ID: ${sale.id}</div>

    <div class="row">
      <div class="box">
        <div class="muted">${t.colClient}</div>
        <div class="sum">${sale.clientName}</div>
      </div>
      <div class="box">
        <div class="muted">${t.labelTotal}</div>
        <div class="sum">${formatCurrency(sale.total)}</div>
      </div>
      <div class="box">
        <div class="muted">${t.labelPaid}</div>
        <div class="sum">${formatCurrency(sale.paid)}</div>
      </div>
      <div class="box">
        <div class="muted">${t.labelDebt}</div>
        <div class="sum">${formatCurrency(debtAmount)}</div>
        <div style="margin-top:8px">
          <span class="badge ${hasDebt ? 'bad' : 'ok'}">${hasDebt ? t.slDebtStatusYes : t.slDebtStatusNo}</span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>${t.colProduct}</th>
          <th>${t.colQty}</th>
          <th>${t.labelPrice}</th>
          <th>${t.colTotal}</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${it.productType}</td>
            <td>${formatNumber(it.quantity)}</td>
            <td>${formatNumber(it.pricePerUnit)}</td>
            <td>${formatCurrency(it.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="margin-top:18px" class="muted">${t.slDebtPaid}: ${hasDebt ? '—' : '✓'}</div>
    <script>
      window.addEventListener('load', () => setTimeout(() => window.print(), 200));
    </script>
  </body>
</html>`;

    const w = window.open('', '_blank', 'width=900,height=720');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handleCopyAccount = (accountNum: string, clientId: string) => {
    navigator.clipboard.writeText(accountNum).catch(() => {});
    setCopiedId(clientId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden p-3 min-[400px]:p-4 lg:p-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{t.slTotalRevenue}</p>
          <p className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">{formatCurrency(totalRevenue)}</p>
          <p className="text-slate-400 text-xs mt-1">{state.sales.length} {t.slOperations}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{t.slTotalPaid}</p>
          <p className="text-blue-600 dark:text-blue-400 text-xl font-bold">{formatCurrency(totalPaidAll)}</p>
          <p className="text-slate-400 text-xs mt-1">{totalRevenue > 0 ? ((totalPaidAll / totalRevenue) * 100).toFixed(0) : 0}{t.slPaidPercent}</p>
        </div>
        <div className={`rounded-2xl border p-5 shadow-sm ${totalDebt > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{t.slTotalDebt}</p>
          <p className={`text-xl font-bold ${totalDebt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(totalDebt)}</p>
          <p className="text-slate-400 text-xs mt-1">{state.clients.filter(c => c.debt > 0).length} {t.slHasDebt}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ===== NEW SALE TAB ===== */}
      {activeTab === 'sale' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT: Order form */}
          <div className="xl:col-span-2 space-y-4">

            {/* Success/Error */}
            {success && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 dark:text-emerald-400 text-sm">{success}</p>
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Client + Date */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-4 flex items-center gap-2">
                <UserPlus size={15} className="text-indigo-500" /> {t.colClient} & {t.labelDate}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">{t.colClient}</label>
                  <Select
                    value={clientId || '__none__'}
                    onValueChange={(v) => setClientId(v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger className={SELECT_TRIGGER_CLS}>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="z-[120] max-h-72 min-w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                    >
                      <SelectItem
                        value="__none__"
                        className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-800"
                      >
                        —
                      </SelectItem>
                      {state.clients.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm focus:bg-indigo-50 focus:text-indigo-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 dark:focus:bg-indigo-950/40 dark:focus:text-indigo-100 dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-white"
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">{t.labelDate}</label>
                  <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className={INPUT_CLS} />
                </div>
              </div>
            </div>

            {/* Cart items */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-2">
                  <ShoppingCart size={15} className="text-emerald-500" />
                  {t.slCart}
                  {cartItems.length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
                      {cartItems.length}
                    </span>
                  )}
                </h3>
              </div>

              {/* Cart table */}
              {cartItems.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-slate-400 text-sm gap-2">
                  <ShoppingCart size={16} className="opacity-40" />
                  <span>{t.slCartEmpty}</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/40">
                        {['#', t.colProduct, t.colQty, t.labelPrice, t.colTotal, ''].map((h, i) => (
                          <th key={i} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, idx) => {
                        const realStock = getStock(item.productCategory, item.productType);
                        const key = `${item.productCategory}__${item.productType}`;
                        const totalInCart = cartUsed[key] || 0;
                        const stockOk = totalInCart <= realStock;
                        return (
                          <tr key={item._id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                            <td className="px-4 py-3 text-xs text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${item.productCategory === 'semi' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'}`}>
                                  {item.productType}
                                </span>
                                {!stockOk && <AlertTriangle size={12} className="text-red-500" />}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 font-medium">{formatNumber(item.quantity)}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{formatNumber(item.pricePerUnit)}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white whitespace-nowrap">{formatCurrency(item.total)}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleRemoveItem(item._id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add item row */}
              <div className="px-4 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <Plus size={12} className="text-indigo-400" /> {t.slAddItem}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                  {/* Category */}
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">{t.slCategory}</label>
                    <Select
                      value={addCat}
                      onValueChange={(v) => handleCatChange(v as 'semi' | 'final')}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_CLS}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="z-[120] min-w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                      >
                        <SelectItem
                          value="final"
                          className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-800"
                        >
                          {t.slFinalCat}
                        </SelectItem>
                        <SelectItem
                          value="semi"
                          className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-800"
                        >
                          {t.slSemiCat}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Type — katalog nomi (API bilan mos) */}
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">{t.slProductType}</label>
                    {currentCatalogOptions.length === 0 ? (
                      <div className="flex min-h-[2.75rem] items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                        {t.slNoCatalogProducts}
                      </div>
                    ) : (
                      <Select value={selectedProductName} onValueChange={setAddType}>
                        <SelectTrigger className={SELECT_TRIGGER_CLS}>
                          <SelectValue placeholder={t.slProductType} />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          className="z-[120] max-h-72 min-w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                        >
                          {currentCatalogOptions.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.name}
                              className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm focus:bg-indigo-50 focus:text-indigo-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 dark:focus:bg-indigo-950/40 dark:focus:text-indigo-100 dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-white"
                            >
                              {p.name} ({formatNumber(getStock(addCat, p.name))} {t.slAvailableStock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {/* Qty */}
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">{t.labelAmount}</label>
                    <input type="number" value={addQty} onChange={e => setAddQty(e.target.value)}
                      placeholder="0" min="1" className={INPUT_CLS} />
                  </div>
                  {/* Price */}
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">{t.labelPrice}</label>
                    <input type="number" value={addPrice} onChange={e => setAddPrice(e.target.value)}
                      placeholder="0" min="1" className={INPUT_CLS} />
                  </div>
                  {/* Add button */}
                  <button onClick={handleAddToCart}
                    disabled={
                      !selectedProductName.trim() ||
                      currentCatalogOptions.length === 0 ||
                      !addQty ||
                      !addPrice ||
                      parseInt(addQty, 10) <= 0 ||
                      parseFloat(addPrice) <= 0
                    }
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    <Plus size={14} /> {t.slAddToCart}
                  </button>
                </div>
                {addQty && parseInt(addQty) > 0 && (
                  <p className={`text-xs mt-2 ${parseInt(addQty) > availableForAdd ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {t.slAvailableStock}: {formatNumber(availableForAdd)} {t.unitPiece}
                    {parseInt(addQty) > availableForAdd && <span className="ml-2">⚠ {t.statusLow}</span>}
                    {addQty && addPrice && parseInt(addQty) > 0 && parseFloat(addPrice) > 0 && (
                      <span className="ml-2 text-slate-500">→ {formatCurrency(parseInt(addQty) * parseFloat(addPrice))}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Payment & submit */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-4">{t.labelPaid}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                  <p className="text-xs text-slate-500 mb-1">{t.labelTotal}</p>
                  <p className="font-bold text-slate-800 dark:text-white">{formatCurrency(orderTotal)}</p>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">{t.labelPaid} ({t.unitSum})</label>
                  <input type="number" value={paid} onChange={e => setPaid(e.target.value)}
                    placeholder="0" min="0" className={INPUT_CLS} />
                </div>
                <div className={`p-3 rounded-xl text-center ${debt > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                  <p className="text-xs text-slate-500 mb-1">{t.labelDebt}</p>
                  <p className={`font-bold ${debt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(Math.max(0, debt))}</p>
                </div>
              </div>
              {!allStockOk && cartItems.length > 0 && (
                <div className="mb-3 flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                  <p className="text-red-600 dark:text-red-400 text-xs">{t.slAvailableStock}!</p>
                </div>
              )}
              <button type="submit" disabled={cartItems.length === 0 || !allStockOk}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <ShoppingCart size={16} /> {t.slBtn}
                {cartItems.length > 0 && <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{cartItems.length} та</span>}
              </button>
            </form>
          </div>

          {/* RIGHT: Stock overview */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Package size={15} className="text-slate-400" /> {t.slAvailableProducts}
              </h3>
              <div className="space-y-2.5">
                {availabilityRows.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.slNoCatalogProducts}</p>
                ) : (
                  availabilityRows.map((item) => {
                    const cartKey = `${item.cat}__${item.label}`;
                    const inCart = cartUsed[cartKey] || 0;
                    return (
                      <div key={item.key}>
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />
                            <span className="truncate text-xs text-slate-600 dark:text-slate-400">
                              {item.label}
                            </span>
                            {inCart > 0 && (
                              <span className="shrink-0 text-xs text-indigo-500 dark:text-indigo-400">
                                (-{formatNumber(inCart)})
                              </span>
                            )}
                          </div>
                          <span className={`shrink-0 text-xs font-semibold ${item.textColor}`}>
                            {formatNumber(item.value)} {t.unitPiece}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className={`h-full rounded-full ${item.color} opacity-70`}
                            style={{
                              width: `${Math.min(100, (item.value / 50000) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick clients debt */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-3">{t.slTabClients}</h3>
              <div className="space-y-2">
                {state.clients.filter(c => c.debt > 0).slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{c.name}</span>
                    <span className="text-xs font-semibold text-red-500">{formatCurrency(c.debt)}</span>
                  </div>
                ))}
                {state.clients.filter(c => c.debt > 0).length === 0 && (
                  <p className="text-xs text-emerald-500">{t.slDebtPaid} ✓</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CLIENTS TAB ===== */}
      {activeTab === 'clients' && (
        <>
          {selectedClientDetail ? (
            <div className="py-1">
              <ClientDetail
                clientId={selectedClientDetail}
                onBack={() => setSelectedClientDetail(null)}
              />
            </div>
          ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4"><UserPlus size={16} className="text-indigo-500" /><h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.slNewClient}</h3></div>
            <form onSubmit={handleAddClient} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelName}</label>
                <input value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} placeholder={t.labelName} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelPhone}</label>
                <input value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} placeholder="+998901234567" className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelBankName}</label>
                <input value={clientForm.bankName} onChange={e => setClientForm({ ...clientForm, bankName: e.target.value })} placeholder="Kapitalbank, Xalq Banki..." className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelBankAccount}</label>
                <input value={clientForm.bankAccount} onChange={e => setClientForm({ ...clientForm, bankAccount: e.target.value })} placeholder="20208000001234567890" className={INPUT_CLS} />
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2"><Plus size={16} />{t.btnAdd}</button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.slClientList}</h3>
              <span className="text-xs text-slate-400">{state.clients.length} та</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {state.clients.map(client => (
                <div key={client.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-slate-800 dark:text-white font-medium text-sm">{client.name}</p>
                        {client.debt > 0 && (
                          <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium">Қарздор</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mb-2">{client.phone}</p>
                      {(client.bankName || client.bankAccount) && (
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {client.bankName && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                              <Building2 size={11} className="text-blue-500 flex-shrink-0" />
                              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">{client.bankName}</span>
                            </div>
                          )}
                          {client.bankAccount && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                              <CreditCard size={11} className="text-slate-400 flex-shrink-0" />
                              <span className="text-xs text-slate-600 dark:text-slate-300 font-mono tracking-wide">
                                {client.bankAccount.replace(/(.{4})/g, '$1 ').trim()}
                              </span>
                              <button
                                onClick={() => handleCopyAccount(client.bankAccount!, client.id)}
                                className="ml-0.5 text-slate-400 hover:text-indigo-500 transition-colors"
                                title="Nusxa olish"
                              >
                                {copiedId === client.id
                                  ? <Check size={11} className="text-emerald-500" />
                                  : <Copy size={11} />
                                }
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className={`font-bold text-sm ${client.debt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(client.debt)}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{client.debt > 0 ? t.labelDebt : t.slDebtPaid}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => setSelectedClientDetail(client.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <ExternalLink size={11} />
                          {t.cdInfo}
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => setClientIdToDelete(client.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          title={t.slDeleteClientTitle}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          )}
        </>
      )}

      {/* ===== HISTORY TAB ===== */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.slTabHistory}</h3>
            <span className="text-xs text-slate-400">{filteredSales.length} {t.slOperations}</span>
          </div>
          {filteredSales.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">{t.noData}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    {[t.colDate, t.colClient, t.colProduct, t.colQty, t.colTotal, t.colPaid, t.colDebt, ''].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, idx) => {
                    const isMulti = sale.items && sale.items.length > 1;
                    const isExpanded = expandedSale === sale.id;
                    return (
                      <React.Fragment key={sale.id}>
                        <tr className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${idx % 2 !== 0 ? 'bg-slate-50/40 dark:bg-slate-800/40' : ''}`}>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(sale.date)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{sale.clientName}</td>
                          <td className="px-4 py-3">
                            {isMulti ? (
                              <span className="text-xs px-2 py-1 rounded-lg font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                {t.slMixedProducts} ({sale.items!.length})
                              </span>
                            ) : (
                              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${sale.productCategory === 'semi' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'}`}>
                                {sale.productType}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{formatNumber(sale.quantity)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white whitespace-nowrap">{formatCurrency(sale.total)}</td>
                          <td className="px-4 py-3 text-sm text-emerald-600 font-medium whitespace-nowrap">{formatCurrency(sale.paid)}</td>
                          <td className="px-4 py-3">{sale.total - sale.paid > 0 ? <span className="text-xs font-semibold text-red-600">{formatCurrency(sale.total - sale.paid)}</span> : <span className="text-xs text-emerald-600">✓</span>}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handlePrintSale(sale)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors"
                                title={t.prPrint}
                              >
                                <Printer size={14} />
                              </button>
                              {isMulti && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                >
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {/* Expanded items */}
                        {isMulti && isExpanded && sale.items!.map((item, ii) => (
                          <tr key={`${sale.id}_item_${ii}`} className="bg-indigo-50/50 dark:bg-indigo-900/10 border-t border-indigo-100 dark:border-indigo-800/30">
                            <td className="px-4 py-2 text-xs text-slate-400 pl-8">↳</td>
                            <td className="px-4 py-2 text-xs text-slate-500">—</td>
                            <td className="px-4 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${item.productCategory === 'semi' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'}`}>
                                {item.productType}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{formatNumber(item.quantity)}</td>
                            <td className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300">{formatCurrency(item.total)}</td>
                            <td className="px-4 py-2 text-xs text-slate-400">{formatNumber(item.pricePerUnit)} so'm/dona</td>
                            <td colSpan={2} />
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={Boolean(clientIdToDelete)} onOpenChange={(open) => !open && setClientIdToDelete(null)}>
        <AlertDialogContent className="border-slate-200 dark:border-slate-700 sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t.slDeleteClientTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t.slDeleteClientHint}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700">
              {t.btnCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              onClick={(e) => void handleConfirmDeleteClient(e)}
            >
              {t.slDeleteClientAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}