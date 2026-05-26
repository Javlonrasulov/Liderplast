import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import {
  useERP,
  type Client,
  type FinishedProductCatalogItem,
  type Sale,
  type SaleCurrency,
  type SaleOrderItem,
  type SemiProductCatalogItem,
} from '../store/erp-store';
import { useCbuRates } from '../hooks/use-cbu-rates';
import {
  cbuEurRate,
  cbuUsdRate,
  saleFxRate,
  saleLineTotalUzs,
  warehouseFxForProduct,
  warehouseSaleDefaults,
} from '../utils/sales-currency';
import { useApp } from '../i18n/app-context';
import { formatCurrency, formatNumber, todayYmd } from '../utils/format';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { finalBucketFromCatalog } from '../utils/warehouse-catalog-buckets';
import { translateCrmApiError } from '../utils/crm-api-errors';
import { ApiError } from '../api/http';

const INPUT_CLS =
  'w-full px-2.5 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

const SELECT_TRIGGER_CLS =
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white';

interface CartRow extends SaleOrderItem {
  _id: string;
}

type Props = {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Tahrirlashda avvalo sotuvdagi mijoz ID si saqlanadi */
function resolveSaleClientId(sale: Sale, clients: Client[]): string {
  if (sale.clientId) return sale.clientId;
  const target = sale.clientName.trim().toLowerCase();
  if (target) {
    const byName = clients.find((c) => c.name.trim().toLowerCase() === target);
    if (byName) return byName.id;
  }
  return '';
}

function itemsFromSale(sale: Sale): CartRow[] {
  const src =
    sale.items && sale.items.length > 0
      ? sale.items
      : [
          {
            productCategory: sale.productCategory,
            productType: sale.productType,
            quantity: sale.quantity,
            pricePerUnit: sale.pricePerUnit,
            currency: 'UZS' as SaleCurrency,
            total: sale.total,
          },
        ];
  return src.map((item, i) => ({
    ...item,
    currency: item.currency ?? 'UZS',
    _id: `row_${i}_${item.productType}`,
  }));
}

export function EditSaleDialog({ sale, open, onOpenChange }: Props) {
  const { state, dispatch, semiStockByProductName, finalStockByProductName, isLoading } =
    useERP();
  const { t } = useApp();
  const { usd: cbuUsd, eur: cbuEur } = useCbuRates();
  const usdRate = cbuUsdRate(cbuUsd);
  const eurRate = cbuEurRate(cbuEur);

  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [orderDate, setOrderDate] = useState(todayYmd());
  const [cartItems, setCartItems] = useState<CartRow[]>([]);
  const [paid, setPaid] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [addCat, setAddCat] = useState<'semi' | 'final'>('final');
  const [addType, setAddType] = useState('');
  const [addQty, setAddQty] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addCurrency, setAddCurrency] = useState<SaleCurrency>('UZS');
  const selectedClientRowRef = useRef<HTMLButtonElement>(null);

  const originalItems = useMemo(
    () => (sale ? itemsFromSale(sale) : []),
    [sale],
  );

  useLayoutEffect(() => {
    if (!sale || !open) return;
    setClientId(resolveSaleClientId(sale, state.clients));
    setOrderDate(sale.date);
    setClientSearch('');
    setCartItems(itemsFromSale(sale));
    setPaid(String(sale.paid));
    setError('');
    setAddCat('final');
    setAddType('');
    setAddQty('');
    setAddPrice('');
    setAddCurrency('UZS');
  }, [sale, open, state.clients]);

  useEffect(() => {
    if (!open || !clientId) return;
    const t = window.setTimeout(() => {
      selectedClientRowRef.current?.scrollIntoView({ block: 'nearest' });
    }, 50);
    return () => window.clearTimeout(t);
  }, [open, clientId, sale?.id]);

  const clientOptions = useMemo((): Client[] => {
    const list = [...state.clients];
    if (sale && !list.some((c) => c.id === sale.clientId)) {
      list.unshift({
        id: sale.clientId,
        name: sale.clientName,
        phone: '',
        debt: 0,
        createdAt: sale.createdAt,
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, 'uz'));
  }, [state.clients, sale]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    let list = q
      ? clientOptions.filter((c) => c.name.toLowerCase().includes(q))
      : [...clientOptions];

    const selected = clientId ? clientOptions.find((c) => c.id === clientId) : undefined;
    if (selected) {
      list = [selected, ...list.filter((c) => c.id !== clientId)];
    } else if (clientId && sale) {
      list = [
        {
          id: clientId,
          name: sale.clientName,
          phone: '',
          debt: 0,
          createdAt: sale.createdAt,
        },
        ...list,
      ];
    }
    return list;
  }, [clientOptions, clientSearch, clientId, sale]);

  const selectedClientName = useMemo(() => {
    if (!sale || !clientId) return sale?.clientName ?? '';
    const saleClientId = resolveSaleClientId(sale, state.clients);
    if (clientId === saleClientId) return sale.clientName;
    return clientOptions.find((c) => c.id === clientId)?.name ?? sale.clientName;
  }, [clientId, clientOptions, sale, state.clients]);

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

  const selectedWarehouseProduct = useMemo(() => {
    if (!selectedProductName) return undefined;
    return currentCatalogOptions.find((p) => p.name === selectedProductName);
  }, [currentCatalogOptions, selectedProductName]);

  const addWarehouseFx = useMemo(
    () => warehouseFxForProduct(selectedWarehouseProduct, addCurrency),
    [selectedWarehouseProduct, addCurrency],
  );

  const getWarehouseStock = (cat: 'semi' | 'final', productName: string): number => {
    if (!productName) return 0;
    if (cat === 'semi') return semiStockByProductName[productName] ?? 0;
    return finalStockByProductName[productName] ?? 0;
  };

  const getEditStock = (cat: 'semi' | 'final', productName: string): number => {
    const returned = originalItems
      .filter((i) => i.productCategory === cat && i.productType === productName)
      .reduce((s, i) => s + i.quantity, 0);
    return getWarehouseStock(cat, productName) + returned;
  };

  const availableForAdd = getEditStock(addCat, selectedProductName);

  const orderTotal = useMemo(() => cartItems.reduce((s, i) => s + i.total, 0), [cartItems]);
  const paidNum = parseFloat(paid) || 0;
  const debt = orderTotal - paidNum;

  const allStockOk = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const item of cartItems) {
      const key = `${item.productCategory}__${item.productType}`;
      acc[key] = (acc[key] || 0) + item.quantity;
    }
    return Object.entries(acc).every(([key, total]) => {
      const [cat, type] = key.split('__');
      return total <= getEditStock(cat as 'semi' | 'final', type);
    });
  }, [cartItems, originalItems, semiStockByProductName, finalStockByProductName]);

  const handleAddLine = () => {
    const qty = parseInt(addQty, 10) || 0;
    const price = parseFloat(addPrice) || 0;
    if (!selectedProductName.trim() || qty <= 0 || price <= 0) return;

    const fx = saleFxRate(addCurrency, addWarehouseFx, usdRate, eurRate);
    if (addCurrency !== 'UZS' && !fx) {
      setError('Valyuta kursi yuklanmadi. Biroz kuting yoki UZS tanlang.');
      return;
    }

    const key = `${addCat}__${selectedProductName}`;
    const already = cartItems
      .filter((i) => `${i.productCategory}__${i.productType}` === key)
      .reduce((s, i) => s + i.quantity, 0);
    if (qty + already > getEditStock(addCat, selectedProductName)) {
      setError(t.slAvailableStock + '!');
      return;
    }

    const total = saleLineTotalUzs(qty, price, addCurrency, usdRate, eurRate, addWarehouseFx);
    setCartItems((prev) => [
      ...prev,
      {
        _id: `new_${Date.now()}`,
        productCategory: addCat,
        productType: selectedProductName,
        quantity: qty,
        pricePerUnit: price,
        currency: addCurrency,
        fxRateToUzs: addCurrency !== 'UZS' ? fx : undefined,
        total,
      },
    ]);
    setAddQty('');
    applyWarehousePricing();
    setError('');
  };

  const applyWarehousePricing = (product = selectedWarehouseProduct) => {
    const { price, currency } = warehouseSaleDefaults(product);
    setAddPrice(price);
    setAddCurrency(currency);
  };

  useEffect(() => {
    if (open) applyWarehousePricing();
  }, [selectedProductName, addCat, open]);

  const handleSave = async () => {
    if (!sale) return;
    setError('');
    if (!clientId) {
      setError(t.colClient + '!');
      return;
    }
    if (cartItems.length === 0) {
      setError(t.slCartEmpty + '!');
      return;
    }
    if (!allStockOk) {
      setError(t.slAvailableStock + '!');
      return;
    }
    if (paidNum > orderTotal) {
      setError(t.labelPaid + ' > ' + t.labelTotal);
      return;
    }
    if (!orderDate.trim()) {
      setError(t.labelDate + '!');
      return;
    }

    const items: SaleOrderItem[] = cartItems.map(
      ({ productCategory, productType, quantity, pricePerUnit, currency, fxRateToUzs, total }) => ({
        productCategory,
        productType,
        quantity,
        pricePerUnit,
        currency,
        fxRateToUzs,
        total,
      }),
    );

    setSaving(true);
    try {
      await dispatch({
        type: 'UPDATE_SALE_ORDER',
        payload: { id: sale.id, clientId, date: orderDate, items, paid: paidNum },
      });
      toast.success(t.slSaleUpdated);
      onOpenChange(false);
    } catch (err) {
      console.error('[edit-sale]', err);
      const raw = err instanceof ApiError ? err.message : err instanceof Error ? err.message : '';
      const msg = raw ? translateCrmApiError(raw, t) : t.slSaleUpdateFailed;
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-white">{t.slEditSaleTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t.labelDate}</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t.colClient}</label>
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1.5 truncate">
                {selectedClientName || '—'}
              </p>
              <input
                type="search"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder={t.slClientSearchPlaceholder}
                className={INPUT_CLS}
              />
            </div>
          </div>
          <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
            {filteredClients.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slate-400">{t.noData}</p>
            ) : (
              filteredClients.map((c) => {
                const active = c.id === clientId;
                return (
                  <button
                    key={c.id}
                    ref={active ? selectedClientRowRef : undefined}
                    type="button"
                    onClick={() => setClientId(c.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {c.name}
                    {sale.clientId === c.id && sale.clientName !== c.name ? (
                      <span className="ml-1 text-[10px] font-normal text-slate-400">
                        ({sale.clientName})
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t.slOrderItems}
            </div>
            {cartItems.length === 0 ? (
              <p className="px-3 py-4 text-xs text-slate-400">{t.slCartEmpty}</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {cartItems.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="font-medium">{item.productType}</span>
                      <span className="text-slate-400 ml-1">
                        · {formatNumber(item.quantity)} {t.unitPiece} ·{' '}
                        {formatCurrency(item.total)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCartItems((p) => p.filter((r) => r._id !== item._id))}
                      className="p-1 rounded text-slate-400 hover:text-red-500"
                      title={t.slRemoveItem}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{t.colProduct}</label>
              <Select value={addCat} onValueChange={(v) => setAddCat(v as 'semi' | 'final')}>
                <SelectTrigger className={SELECT_TRIGGER_CLS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[140]">
                  <SelectItem value="semi">{t.slSemiCat}</SelectItem>
                  <SelectItem value="final">{t.slFinalCat}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-slate-400 mb-1">{t.slProductType}</label>
              <Select value={selectedProductName} onValueChange={setAddType}>
                <SelectTrigger className={SELECT_TRIGGER_CLS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[140] max-h-48">
                  {currentCatalogOptions.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{t.colQty}</label>
              <input
                type="number"
                min={1}
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{t.labelPrice}</label>
              <input
                type="number"
                min={0}
                step="any"
                value={addPrice}
                onChange={(e) => setAddPrice(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <button
              type="button"
              onClick={handleAddLine}
              className="h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
              disabled={!selectedProductName || !addQty || !addPrice}
              title={t.slAddToCart}
            >
              <Plus size={18} />
            </button>
          </div>
          {addQty && (
            <p className="text-[11px] text-slate-500">
              {t.slAvailableStock}: {formatNumber(availableForAdd)} {t.unitPiece}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
              <p className="text-[10px] text-slate-400">{t.labelTotal}</p>
              <p className="text-sm font-bold">{formatCurrency(orderTotal)}</p>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{t.labelPaid}</label>
              <input
                type="number"
                min={0}
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div
              className={`p-2 rounded-lg text-center ${debt > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}
            >
              <p className="text-[10px] text-slate-400">{t.labelDebt}</p>
              <p className={`text-sm font-bold ${debt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatCurrency(Math.max(0, debt))}
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-xs">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
          {!allStockOk && cartItems.length > 0 && !error && (
            <p className="text-xs text-amber-600">{t.slAvailableStock}!</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            {t.btnCancel}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || isLoading || cartItems.length === 0}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-40"
          >
            {saving ? '…' : t.slSaveSaleEdit}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
