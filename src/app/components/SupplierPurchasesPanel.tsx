import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, Package, Plus, Check, Trash2, ClipboardList } from 'lucide-react';
import { useCbuRates, parseCbuRate } from '../hooks/use-cbu-rates';
import {
  useERP,
  type RawMaterialProduct,
  type SemiProductCatalogItem,
  type FinishedProductCatalogItem,
} from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { useAuth } from '../auth/auth-context';
import { formatCurrency, formatNumber } from '../utils/format';
import {
  saleFxRate,
  warehouseFxForProduct,
  warehousePurchaseDefaults,
} from '../utils/sales-currency';
import type { SaleCurrency } from '../store/erp-store';
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { SingleDatePicker } from './SingleDatePicker';
import { todayYmd } from '../utils/format';

type ProductCat = 'RAW_MATERIAL' | 'SEMI_PRODUCT' | 'FINISHED_PRODUCT';
type QtyUnit = 'KG' | 'TON' | 'PIECES';

type PurchaseLine = {
  id: string;
  itemType: ProductCat;
  rawMaterialId?: string;
  semiProductId?: string;
  finishedProductId?: string;
  productName: string;
  quantity: number;
  quantityUnit: QtyUnit;
  currency: 'UZS' | 'USD' | 'EUR';
  fxRateToUzs: number;
  amountOriginal: number;
  amountUzs: number;
};

function daysSinceOrder(orderedAtIso: string) {
  const t0 = new Date(orderedAtIso).getTime();
  return Math.max(0, Math.floor((Date.now() - t0) / 86400000));
}

function formatAmountInCurrency(amount: number, currency: 'UZS' | 'USD' | 'EUR'): string {
  if (!Number.isFinite(amount) || amount < 0) return '\u2014';
  return `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} ${currency}`;
}

function productIdForCat(
  cat: ProductCat,
  rawId: string,
  semiId: string,
  finalId: string,
): string {
  if (cat === 'RAW_MATERIAL') return rawId;
  if (cat === 'SEMI_PRODUCT') return semiId;
  return finalId;
}

function newLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}) {
  const resolved = value && options.some((o) => o.value === value) ? value : undefined;
  return (
    <RadixSelect
      value={resolved}
      onValueChange={onValueChange}
      disabled={disabled || options.length === 0}
    >
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

export function SupplierPurchasesPanel({ onAddSupplier }: { onAddSupplier: () => void }) {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const { hasPermission } = useAuth();
  const canCreate =
    hasPermission('manage_suppliers') || hasPermission('view_expenses');

  const { usd, eur, loading: fxLoading, error: fxErr, updatedAt, refetch } = useCbuRates();
  const [fxRefreshPending, setFxRefreshPending] = useState(false);
  const [fxJustUpdated, setFxJustUpdated] = useState(false);

  useEffect(() => {
    if (!fxRefreshPending) return;
    if (fxLoading) return;
    setFxRefreshPending(false);
    if (!fxErr) {
      setFxJustUpdated(true);
      const id = window.setTimeout(() => setFxJustUpdated(false), 2500);
      return () => window.clearTimeout(id);
    }
  }, [fxLoading, fxErr, fxRefreshPending]);

  const onRefreshFx = () => {
    setFxJustUpdated(false);
    setFxRefreshPending(true);
    refetch();
  };

  const [productCat, setProductCat] = useState<ProductCat>('SEMI_PRODUCT');
  const [rawMaterialId, setRawMaterialId] = useState('');
  const [semiProductId, setSemiProductId] = useState('');
  const [finishedProductId, setFinishedProductId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [qty, setQty] = useState('');
  const [qtyUnit, setQtyUnit] = useState<QtyUnit>('PIECES');
  const [cur, setCur] = useState<'UZS' | 'USD' | 'EUR'>('UZS');
  const [fxMan, setFxMan] = useState('1');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [priceManuallyEdited, setPriceManuallyEdited] = useState(false);
  const lastPricedProductKey = useRef('');
  const [lines, setLines] = useState<PurchaseLine[]>([]);
  const [paymentType, setPaymentType] = useState<'CASH' | 'CREDIT'>('CASH');
  const [paidNow, setPaidNow] = useState('');
  const [debtNow, setDebtNow] = useState('');
  const [notes, setNotes] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayYmd());
  const [busy, setBusy] = useState(false);

  const rawList = useMemo(
    () =>
      state.warehouseProducts.filter((p): p is RawMaterialProduct => p.itemType === 'RAW_MATERIAL'),
    [state.warehouseProducts],
  );
  const semiList = useMemo(
    () =>
      state.warehouseProducts.filter(
        (p): p is SemiProductCatalogItem => p.itemType === 'SEMI_PRODUCT',
      ),
    [state.warehouseProducts],
  );
  const finalList = useMemo(
    () =>
      state.warehouseProducts.filter(
        (p): p is FinishedProductCatalogItem => p.itemType === 'FINISHED_PRODUCT',
      ),
    [state.warehouseProducts],
  );

  const productOptions = useMemo(() => {
    if (productCat === 'RAW_MATERIAL') {
      return rawList.map((p) => ({ value: p.id, label: p.name }));
    }
    if (productCat === 'SEMI_PRODUCT') {
      return semiList.map((p) => ({ value: p.id, label: p.name }));
    }
    return finalList.map((p) => ({ value: p.id, label: p.name }));
  }, [productCat, rawList, semiList, finalList]);

  const selectedProductId = productIdForCat(
    productCat,
    rawMaterialId,
    semiProductId,
    finishedProductId,
  );

  const selectedProductName = useMemo(() => {
    const hit = productOptions.find((o) => o.value === selectedProductId);
    return hit?.label ?? '';
  }, [productOptions, selectedProductId]);

  const selectedWarehouseProduct = useMemo(() => {
    if (!selectedProductId) return undefined;
    if (productCat === 'RAW_MATERIAL') {
      return rawList.find((p) => p.id === selectedProductId);
    }
    if (productCat === 'SEMI_PRODUCT') {
      return semiList.find((p) => p.id === selectedProductId);
    }
    return finalList.find((p) => p.id === selectedProductId);
  }, [productCat, selectedProductId, rawList, semiList, finalList]);

  const usdRate = usd ? parseCbuRate(usd.Rate) : 0;
  const eurRate = eur ? parseCbuRate(eur.Rate) : 0;

  const warehousePurchase = useMemo(
    () => warehousePurchaseDefaults(selectedWarehouseProduct),
    [selectedWarehouseProduct],
  );

  const productPricingKey = `${productCat}:${selectedProductId}`;

  useEffect(() => {
    if (!selectedProductId) return;
    if (productPricingKey === lastPricedProductKey.current) return;
    lastPricedProductKey.current = productPricingKey;
    setPriceManuallyEdited(false);
    const { price, currency, hasPurchasePrice } = warehousePurchaseDefaults(
      selectedWarehouseProduct,
    );
    setCur(currency);
    setPricePerUnit(hasPurchasePrice ? price : '');
    const whFx = warehouseFxForProduct(selectedWarehouseProduct, currency);
    if (currency === 'UZS') {
      setFxMan('1');
    } else {
      const fx =
        saleFxRate(currency, whFx, usdRate, eurRate) ??
        (currency === 'USD' ? usdRate : eurRate);
      if (fx > 0) setFxMan(String(fx));
    }
  }, [
    productPricingKey,
    selectedProductId,
    selectedWarehouseProduct,
    usdRate,
    eurRate,
  ]);

  useEffect(() => {
    if (priceManuallyEdited || !selectedWarehouseProduct) return;
    const whCur = selectedWarehouseProduct.priceCurrency ?? 'UZS';
    if (cur !== whCur) return;
    const { price, hasPurchasePrice } = warehousePurchaseDefaults(selectedWarehouseProduct);
    if (hasPurchasePrice) setPricePerUnit(price);
  }, [cur, priceManuallyEdited, selectedWarehouseProduct]);

  useEffect(() => {
    if (productOptions.length === 0) return;
    const ok = productOptions.some((o) => o.value === selectedProductId);
    if (!ok) {
      const first = productOptions[0].value;
      if (productCat === 'RAW_MATERIAL') setRawMaterialId(first);
      else if (productCat === 'SEMI_PRODUCT') setSemiProductId(first);
      else setFinishedProductId(first);
    }
  }, [productCat, productOptions, selectedProductId]);

  useEffect(() => {
    if (productCat === 'RAW_MATERIAL') {
      if (qtyUnit === 'PIECES') setQtyUnit('KG');
    } else {
      if (qtyUnit === 'TON') setQtyUnit('PIECES');
    }
  }, [productCat, qtyUnit]);

  useEffect(() => {
    if (!supplierId && state.suppliers.length > 0) {
      setSupplierId(state.suppliers[0].id);
    }
  }, [state.suppliers, supplierId]);

  const supplierOptions = useMemo(
    () => state.suppliers.map((s) => ({ value: s.id, label: s.name })),
    [state.suppliers],
  );

  const pending = useMemo(
    () =>
      [...state.supplierPurchaseOrders]
        .filter((o) => o.status === 'PENDING')
        .sort((a, b) => new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime()),
    [state.supplierPurchaseOrders],
  );

  const quantityNum = useMemo(() => {
    const w = parseFloat(String(qty).replace(',', '.'));
    return Number.isFinite(w) && w > 0 ? w : 0;
  }, [qty]);

  useEffect(() => {
    if (cur === 'UZS') {
      setFxMan('1');
      return;
    }
    const whFx = warehouseFxForProduct(selectedWarehouseProduct, cur);
    const fx = saleFxRate(cur, whFx, usdRate, eurRate);
    if (fx != null && fx > 0) {
      setFxMan(String(fx));
      return;
    }
    if (cur === 'USD' && usdRate > 0) setFxMan(String(usdRate));
    else if (cur === 'EUR' && eurRate > 0) setFxMan(String(eurRate));
  }, [cur, usdRate, eurRate, selectedWarehouseProduct]);

  const fx = useMemo(() => {
    if (cur === 'UZS') return 1;
    const m = parseFloat(String(fxMan).replace(',', '.'));
    return Number.isFinite(m) && m > 0 ? m : 0;
  }, [cur, fxMan]);

  const priceNum = useMemo(() => {
    const a = parseFloat(String(pricePerUnit).replace(',', '.'));
    return Number.isFinite(a) && a >= 0 ? a : 0;
  }, [pricePerUnit]);

  const lineTotalOriginal = useMemo(
    () => (quantityNum > 0 && priceNum > 0 ? priceNum * quantityNum : 0),
    [priceNum, quantityNum],
  );

  const lineAmountUzs = useMemo(() => {
    if (lineTotalOriginal <= 0) return 0;
    return cur === 'UZS' ? lineTotalOriginal : lineTotalOriginal * fx;
  }, [lineTotalOriginal, cur, fx]);

  const linesTotalUzs = useMemo(
    () => lines.reduce((sum, line) => sum + line.amountUzs, 0),
    [lines],
  );

  const paidUzs = useMemo(() => {
    if (paymentType === 'CASH') return linesTotalUzs;
    const p = parseFloat(String(paidNow).replace(',', '.'));
    return Number.isFinite(p) && p >= 0 ? p : 0;
  }, [paymentType, paidNow, linesTotalUzs]);

  const debtUzs = Math.max(0, linesTotalUzs - paidUzs);

  const canAddLine =
    canCreate &&
    !!selectedProductId &&
    quantityNum > 0 &&
    priceNum > 0 &&
    lineTotalOriginal > 0 &&
    (cur === 'UZS' || fx > 0) &&
    productOptions.length > 0;

  const priceHintBelow = !warehousePurchase.hasPurchasePrice
    ? t.supNoWarehousePurchasePrice
    : lineTotalOriginal > 0
      ? `${t.supLinePreview}: ${formatAmountInCurrency(lineTotalOriginal, cur)} · ${formatCurrency(lineAmountUzs)}`
      : warehousePurchase.hasPurchasePrice
        ? `${t.whPurchasePrice}: ${formatNumber(parseFloat(warehousePurchase.price))} ${warehousePurchase.currency}`
        : null;

  const unitPriceLabel =
    qtyUnit === 'PIECES' ? t.supPricePerPieceLabel : t.supPricePerKgLabel;

  const addLine = () => {
    if (!canAddLine) return;

    const line: PurchaseLine = {
      id: newLineId(),
      itemType: productCat,
      rawMaterialId: productCat === 'RAW_MATERIAL' ? selectedProductId : undefined,
      semiProductId: productCat === 'SEMI_PRODUCT' ? selectedProductId : undefined,
      finishedProductId: productCat === 'FINISHED_PRODUCT' ? selectedProductId : undefined,
      productName: selectedProductName,
      quantity: quantityNum,
      quantityUnit: qtyUnit,
      currency: cur,
      fxRateToUzs: fx,
      amountOriginal: lineTotalOriginal,
      amountUzs: lineAmountUzs,
    };
    setLines((prev) => [...prev, line]);
    setPricePerUnit('');
    setQty('');
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const onSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !supplierId || lines.length === 0) return;
    if (linesTotalUzs <= 0) return;
    if (paymentType === 'CREDIT' && debtUzs <= 0) return;

    setBusy(true);
    try {
      await dispatch({
        type: 'CREATE_SUPPLIER_PURCHASE_BATCH',
        payload: {
          supplierId,
          paymentType,
          paidAmountUzs: paymentType === 'CREDIT' ? paidUzs : undefined,
          notes: notes.trim() || undefined,
          orderedAt: purchaseDate,
          items: lines.map((line) => ({
            itemType: line.itemType,
            rawMaterialId: line.rawMaterialId,
            semiProductId: line.semiProductId,
            finishedProductId: line.finishedProductId,
            quantity: line.quantity,
            quantityUnit: line.quantityUnit,
            currency: line.currency,
            fxRateToUzs: line.fxRateToUzs,
            amountOriginal: line.amountOriginal,
          })),
        },
      });
      setLines([]);
      setNotes('');
      setPaidNow('');
      setDebtNow('');
    } finally {
      setBusy(false);
    }
  };

  const onPaidNowChange = (value: string) => {
    setPaidNow(value);
    const p = parseFloat(String(value).replace(',', '.'));
    if (Number.isFinite(p) && linesTotalUzs > 0) {
      setDebtNow(String(Math.max(0, Math.round(linesTotalUzs - p))));
    } else if (value.trim() === '') {
      setDebtNow('');
    }
  };

  const onDebtNowChange = (value: string) => {
    setDebtNow(value);
    const d = parseFloat(String(value).replace(',', '.'));
    if (Number.isFinite(d) && linesTotalUzs > 0) {
      setPaidNow(String(Math.max(0, Math.round(linesTotalUzs - d))));
    } else if (value.trim() === '') {
      setPaidNow('');
    }
  };

  const qtyUnitLabel = (u: QtyUnit) => {
    if (u === 'TON') return t.prRmWeightUnitTon;
    if (u === 'PIECES') return t.supUnitPieces;
    return t.prRmWeightUnitKg;
  };

  const lineQtyLabel = (line: PurchaseLine) => {
    if (line.quantityUnit === 'PIECES') {
      return `${formatNumber(line.quantity)} ${t.supUnitPieces}`;
    }
    if (line.quantityUnit === 'TON') {
      return `${formatNumber(line.quantity)} ${t.prRmWeightUnitTon}`;
    }
    return `${formatNumber(line.quantity)} ${t.prRmWeightUnitKg}`;
  };

  const catLabel = (c: ProductCat) => {
    if (c === 'RAW_MATERIAL') return t.supCatRaw;
    if (c === 'SEMI_PRODUCT') return t.whSidebarSemi;
    return t.whSidebarFinal;
  };

  const emptyCell = '\u2014';

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
              const qLbl =
                o.quantityUnit === 'PIECES'
                  ? `${formatNumber(o.quantity)} ${t.supUnitPieces}`
                  : o.quantityUnit === 'TON'
                    ? `${formatNumber(o.quantity)} ${t.prRmWeightUnitTon}`
                    : `${formatNumber(o.quantityKg ?? o.quantity)} ${t.prRmWeightUnitKg}`;
              return (
                <li
                  key={o.id}
                  className="text-xs rounded-xl border border-amber-300/60 bg-white/80 px-3 py-2 dark:border-amber-700 dark:bg-slate-900/40"
                >
                  {t.supPendingTpl
                    .replace('{supplier}', o.supplierName ?? emptyCell)
                    .replace('{name}', o.productName)
                    .replace('{qty}', qLbl)
                    .replace('{days}', String(d))}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {canCreate ? (
          <form
            onSubmit={onSubmitBatch}
            className="xl:col-span-3 space-y-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <ClipboardList size={16} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.supFormTitle}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>{t.supSelectSupplier}</Label>
                <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <StyledSelect
                    value={supplierId}
                    onValueChange={setSupplierId}
                    options={supplierOptions}
                    placeholder={
                      supplierOptions.length === 0 ? t.supNoSuppliers : t.supSelectSupplier
                    }
                    disabled={supplierOptions.length === 0}
                  />
                </div>
                <button
                  type="button"
                  onClick={onAddSupplier}
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  title={t.supAddSupplier}
                >
                  <Plus size={16} />
                </button>
              </div>
              </div>
              <div>
                <Label>{t.labelDate}</Label>
                <SingleDatePicker value={purchaseDate} onChange={setPurchaseDate} />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-3">
              <Label>{t.supProductCategory}</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {(['SEMI_PRODUCT', 'FINISHED_PRODUCT', 'RAW_MATERIAL'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setProductCat(c);
                      if (c === 'SEMI_PRODUCT' || c === 'FINISHED_PRODUCT') {
                        setQtyUnit('PIECES');
                      }
                    }}
                    className={`px-3 h-9 rounded-xl text-xs font-medium border ${
                      productCat === c
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {catLabel(c)}
                  </button>
                ))}
              </div>

              <div>
                <Label>{t.supProductName}</Label>
                {productOptions.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 py-2">
                    {t.supNoProductsInCategory}
                  </p>
                ) : (
                  <StyledSelect
                    value={selectedProductId}
                    onValueChange={(v) => {
                      if (productCat === 'RAW_MATERIAL') setRawMaterialId(v);
                      else if (productCat === 'SEMI_PRODUCT') setSemiProductId(v);
                      else setFinishedProductId(v);
                    }}
                    options={productOptions}
                    placeholder={t.supChooseProduct}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t.supQuantityLabel}</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.001"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>{t.supQtyUnitLabel}</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(
                      productCat === 'RAW_MATERIAL'
                        ? (['KG', 'TON'] as const)
                        : (['PIECES', 'KG'] as const)
                    ).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setQtyUnit(u)}
                        className={`flex-1 min-w-[4rem] h-9 rounded-xl text-xs font-medium border ${
                          qtyUnit === u
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {qtyUnitLabel(u)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                <Label>{t.prRmCurrencyLabel}</Label>
                <StyledSelect
                  value={cur}
                  onValueChange={(v) => setCur(v as SaleCurrency)}
                  options={[
                    { value: 'UZS', label: 'UZS' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                  ]}
                />
              </div>
                <div className={cur === 'UZS' ? 'hidden sm:block' : ''}>
              {cur !== 'UZS' ? (
                <>
                  <Label>{t.prRmFxRateLabel}</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={fxMan}
                    onChange={(e) => setFxMan(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">{t.prRmFxCbuHint}</p>
                </>
              ) : (
                <div className="hidden sm:block h-9" aria-hidden />
              )}
                </div>
              </div>

              <div>
                <Label>{unitPriceLabel}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="0.0001"
                    value={pricePerUnit}
                    onChange={(e) => {
                      setPriceManuallyEdited(true);
                      setPricePerUnit(e.target.value);
                    }}
                    className="flex-1 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={addLine}
                    disabled={busy || !canAddLine}
                    title={t.supAddLine}
                    className="h-9 w-9 shrink-0 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white flex items-center justify-center"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>
                <p
                  className={`min-h-[2.25rem] mt-1 text-[10px] leading-snug ${
                    !warehousePurchase.hasPurchasePrice
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {priceHintBelow ?? '\u00a0'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t.supLinesTitle}</span>
                {lines.length > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t.supLinesCount.replace('{n}', String(lines.length))}
                  </span>
                )}
              </div>
              {lines.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.supNoLinesHint}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-600">
                        <th className="pb-2 pr-3 font-medium">{t.supProductName}</th>
                        <th className="pb-2 pr-3 font-medium">{t.supColQty}</th>
                        <th className="pb-2 pr-3 font-medium">{t.supLineColAmount}</th>
                        <th className="pb-2 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr
                          key={line.id}
                          className="border-b border-slate-100 dark:border-slate-700/80 last:border-0"
                        >
                          <td className="py-2 pr-3 text-slate-800 dark:text-slate-100">
                            <span className="block font-medium">{line.productName}</span>
                            <span className="text-[10px] text-slate-400">{catLabel(line.itemType)}</span>
                          </td>
                          <td className="py-2 pr-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {lineQtyLabel(line)}
                          </td>
                          <td className="py-2 pr-3 text-slate-800 dark:text-slate-100 whitespace-nowrap">
                            {formatCurrency(line.amountUzs)}
                          </td>
                          <td className="py-2">
                            <button
                              type="button"
                              onClick={() => removeLine(line.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title={t.supRemoveLine}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} className="pt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {t.prRmAmountUzsEst}
                        </td>
                        <td colSpan={2} className="pt-3 font-semibold text-slate-800 dark:text-white">
                          {formatCurrency(linesTotalUzs)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-3">
              <Label>{t.supPaymentType}</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('CASH')}
                  className={`flex-1 h-9 rounded-xl text-xs font-medium border ${
                    paymentType === 'CASH'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {t.supPaymentCash}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('CREDIT')}
                  className={`flex-1 h-9 rounded-xl text-xs font-medium border ${
                    paymentType === 'CREDIT'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {t.supPaymentCredit}
                </button>
              </div>

              {paymentType === 'CREDIT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800">
                  <div>
                    <Label>{t.supPaidNowLabel}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={paidNow}
                      onChange={(e) => onPaidNowChange(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>{t.supDebtAmountLabel}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={debtNow}
                      onChange={(e) => onDebtNowChange(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-xs space-y-1">
                <p className="text-slate-600 dark:text-slate-300">
                  {t.prRmAmountUzsEst}: <strong>{formatCurrency(linesTotalUzs)}</strong>
                </p>
                {paymentType === 'CREDIT' && linesTotalUzs > 0 && (
                  <>
                    <p className="text-slate-600 dark:text-slate-300">
                      {t.supPaidNowLabel}: <strong>{formatCurrency(paidUzs)}</strong>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {t.supDebtRemaining}: <strong>{formatCurrency(debtUzs)}</strong>
                    </p>
                  </>
                )}
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
                disabled={
                  busy ||
                  lines.length === 0 ||
                  !supplierId ||
                  state.suppliers.length === 0
                }
                className="w-full h-10 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium"
              >
                {busy ? '...' : t.supSubmitPurchase}
              </button>
            </div>
          </form>
        ) : (
          <div className="xl:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {t.supReadOnlyHint}
          </div>
        )}

        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm h-fit">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t.dashCbuTitle}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{t.dashCbuSource}</p>
            </div>
            <button
              type="button"
              onClick={onRefreshFx}
              disabled={fxLoading}
              title={fxJustUpdated ? t.dashCbuUpdatedOk : t.dashCbuRefresh}
              className={`p-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-50 ${
                fxJustUpdated
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {fxJustUpdated ? (
                <Check size={14} strokeWidth={2.5} />
              ) : (
                <RefreshCw size={14} className={fxLoading ? 'animate-spin' : ''} />
              )}
            </button>
          </div>
          {fxErr ? (
            <p className="text-xs text-amber-600">{t.dashCbuFetchError}</p>
          ) : (
            <div className="space-y-2 text-xs">
              {usd && (
                <p className="text-slate-600 dark:text-slate-300">
                  USD: <strong>{parseCbuRate(usd.Rate)}</strong> {t.labelDate}:{' '}
                  {updatedAt || usd.Date}
                </p>
              )}
              {eur && (
                <p className="text-slate-600 dark:text-slate-300">
                  EUR: <strong>{parseCbuRate(eur.Rate)}</strong>
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3">{t.supPurchaseStockHint}</p>
        </div>
      </div>
    </div>
  );
}
