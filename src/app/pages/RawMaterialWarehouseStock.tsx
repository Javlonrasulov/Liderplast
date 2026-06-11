import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Droplets,
  Palette,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  LayoutGrid,
  Table2,
  Printer,
  Search,
} from 'lucide-react';
import { useERP, type RawMaterialKind, type RawMaterialProduct } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { calcPercent, formatKgAmount, formatNumber } from '../utils/format';
import { translateWarehouseApiError } from '../utils/warehouse-api-errors';
import { useAuth } from '../auth/auth-context';
import { useCbuRates } from '../hooks/use-cbu-rates';
import { cbuEurRate, cbuUsdRate } from '../utils/sales-currency';
import { WarehouseProductPricingFieldsBlock } from '../components/WarehouseProductPricingFields';
import { RawMaterialOverviewStockTable } from '../components/RawMaterialOverviewStockTable';
import {
  EMPTY_WAREHOUSE_PRICING,
  formatWarehousePurchasePriceDisplay,
  parseWarehousePurchasePricingPayload,
  pricingFieldsFromProduct,
  warehouseProductPurchaseTotals,
  type WarehouseProductPricingFields,
} from '../utils/warehouse-product-pricing';
import { printRawMaterialStock } from '../utils/raw-material-stock-print';
import { Button } from '../components/ui/button';
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
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

/** SIRO uchun Layout ва Dashboard билан бир хил кам қолдиқ чегараси */
const LOW_SIRO_KG = 1000;
/** Kraska uchun эски Warehouse саҳифасидан килинган услуб */
const LOW_PAINT_KG = 200;

function formatOverviewMoney(amount: number | null, suffix: string, empty: string): string {
  if (amount == null || !Number.isFinite(amount)) return empty;
  return `${formatNumber(Math.round(amount))} ${suffix}`;
}

export function RawMaterialWarehouseStock({ hideTopSummary = false }: { hideTopSummary?: boolean }) {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const { usd: cbuUsd, eur: cbuEur } = useCbuRates();
  const cbuUsdFx = cbuUsdRate(cbuUsd);
  const cbuEurFx = cbuEurRate(cbuEur);
  const { user, hasPermission } = useAuth();
  /**
   * Xom ashyo katalogini boshqarish (qo‘shish/tahrirlash/o‘chirish):
   * Admin va Director — har doim; boshqalar — `view_warehouse` yoki
   * `view_raw_material` ruxsati bo‘lsa.
   */
  const canManage =
    user?.role === 'ADMIN' ||
    user?.role === 'DIRECTOR' ||
    hasPermission('view_warehouse') ||
    hasPermission('view_raw_material');
  const canDelete = user?.role === 'ADMIN' || user?.role === 'DIRECTOR';

  const [editing, setEditing] = useState<RawMaterialProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RawMaterialProduct | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [pricingDraft, setPricingDraft] =
    useState<WarehouseProductPricingFields>(EMPTY_WAREHOUSE_PRICING);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    if (typeof window === 'undefined') return 'table';
    const saved = window.localStorage.getItem('rm-stock-view');
    if (saved === 'cards' || saved === 'table') return saved;
    return 'table';
  });
  const [stockSearch, setStockSearch] = useState('');
  const [tableFullscreen, setTableFullscreen] = useState(false);

  useEffect(() => {
    if (viewMode !== 'table') setTableFullscreen(false);
  }, [viewMode]);

  useEffect(() => {
    if (!tableFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTableFullscreen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [tableFullscreen]);

  const setStockView = (next: 'cards' | 'table') => {
    setViewMode(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('rm-stock-view', next);
    }
  };

  const pricingFormLabels = useMemo(
    () => ({
      section: t.whPricingSection,
      optional: t.whPricingOptional,
      purchasePrice: t.whPurchasePrice,
      salePrice: t.whSalePrice,
      currency: t.labelCurrency,
      fxRate: t.whFxRateToUzs,
      fxHint: t.whFxRateHint,
      fxApplyCbu: t.whFxApplyCbu,
      cbuTitle: t.whCbuRatesTitle,
      cbuLoading: t.whCbuRatesLoading,
      cbuUsdLine: t.whCbuRatesUsd,
      cbuEurLine: t.whCbuRatesEur,
      cbuError: t.whCbuRatesError,
      cbuRetry: t.whCbuRatesRetry,
      currencyUzs: 'UZS',
      currencyUsd: 'USD (USDT)',
      currencyEur: 'EUR',
      priceInUzs: t.whPriceInUzs,
    }),
    [t],
  );

  const qtyByName = useMemo(() => {
    const m = new Map<string, number>();
    for (const row of state.warehouseStock) {
      if (row.itemType !== 'RAW_MATERIAL' || !row.itemName) continue;
      m.set(row.itemName, (m.get(row.itemName) ?? 0) + row.quantity);
    }
    return m;
  }, [state.warehouseStock]);

  const rows = useMemo(() => {
    const raw = state.warehouseProducts.filter(
      (p): p is RawMaterialProduct => p.itemType === 'RAW_MATERIAL',
    );
    return [...raw].sort((a, b) => {
      const order = (k: RawMaterialKind | undefined) => (k === 'PAINT' ? 1 : 0);
      const d = order(a.rawMaterialKind) - order(b.rawMaterialKind);
      if (d !== 0) return d;
      return a.name.localeCompare(b.name);
    });
  }, [state.warehouseProducts]);

  const totalKg = useMemo(
    () => rows.reduce((s, rm) => s + (qtyByName.get(rm.name) ?? 0), 0),
    [rows, qtyByName],
  );

  const lowSiro = useMemo(() => {
    return rows
      .filter((rm) => rm.rawMaterialKind !== 'PAINT')
      .map((rm) => ({ rm, kg: qtyByName.get(rm.name) ?? 0 }))
      .filter((x) => x.kg < LOW_SIRO_KG)
      .sort((a, b) => a.kg - b.kg);
  }, [rows, qtyByName]);

  const lowPaint = useMemo(() => {
    return rows
      .filter((rm) => rm.rawMaterialKind === 'PAINT')
      .map((rm) => ({ rm, kg: qtyByName.get(rm.name) ?? 0 }))
      .filter((x) => x.kg < LOW_PAINT_KG)
      .sort((a, b) => a.kg - b.kg);
  }, [rows, qtyByName]);

  const rowById = useMemo(() => new Map(rows.map((rm) => [rm.id, rm])), [rows]);

  const overviewTableRows = useMemo(() => {
    const empty = t.whExportNoPrice;
    return rows.map((rm) => {
      const kg = qtyByName.get(rm.name) ?? 0;
      const isPaint = rm.rawMaterialKind === 'PAINT';
      const max = isPaint ? 2000 : 5000;
      const low = isPaint ? kg < LOW_PAINT_KG : kg < LOW_SIRO_KG;
      const purchaseDisplay = formatWarehousePurchasePriceDisplay(
        rm,
        empty,
        t.whPriceInUzs,
        t.whCatalogFxValue,
        { fallbackUsdRate: cbuUsdFx, fallbackEurRate: cbuEurFx },
      );
      const totals = warehouseProductPurchaseTotals(rm, kg, cbuUsdFx, cbuEurFx);
      const bagWeight =
        rm.defaultBagWeightKg != null && rm.defaultBagWeightKg > 0
          ? `${formatKgAmount(rm.defaultBagWeightKg)} ${t.unitKg}`
          : '—';

      return {
        id: rm.id,
        kind: (rm.rawMaterialKind ?? 'SIRO') as RawMaterialKind,
        typeLabel: isPaint ? t.rmKindPaint : t.rmKindSiro,
        name: rm.name,
        description: rm.description?.trim() || undefined,
        quantityKg: kg,
        defaultBagWeight: bagWeight,
        purchasePrice: purchaseDisplay.main,
        purchasePriceUzs: purchaseDisplay.sub,
        purchasePriceFx: purchaseDisplay.fxRate,
        totalUzs: formatOverviewMoney(totals.totalUzs, "so'm", empty),
        totalUsd: formatOverviewMoney(totals.totalUsd, '$', empty),
        fillPct: calcPercent(kg, max),
        lowStock: low,
      };
    });
  }, [rows, qtyByName, t, cbuUsdFx, cbuEurFx]);

  const filteredOverviewRows = useMemo(() => {
    const q = stockSearch.trim().toLowerCase();
    if (!q) return overviewTableRows;
    return overviewTableRows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.typeLabel.toLowerCase().includes(q) ||
        row.description?.toLowerCase().includes(q),
    );
  }, [overviewTableRows, stockSearch]);

  const filteredRows = useMemo(() => {
    const q = stockSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((rm) => {
      const typeLabel = rm.rawMaterialKind === 'PAINT' ? t.rmKindPaint : t.rmKindSiro;
      return (
        rm.name.toLowerCase().includes(q) ||
        typeLabel.toLowerCase().includes(q) ||
        rm.description?.toLowerCase().includes(q)
      );
    });
  }, [rows, stockSearch, t]);

  const filteredTotalKg = useMemo(
    () => filteredOverviewRows.reduce((s, row) => s + row.quantityKg, 0),
    [filteredOverviewRows],
  );

  const filteredFooterTotals = useMemo(() => {
    const empty = t.whExportNoPrice;
    let uzs = 0;
    let usd = 0;
    let hasUzs = false;
    let hasUsd = false;
    filteredOverviewRows.forEach((row) => {
      const rm = rowById.get(row.id);
      if (!rm) return;
      const totals = warehouseProductPurchaseTotals(rm, row.quantityKg, cbuUsdFx, cbuEurFx);
      if (totals.totalUzs != null) {
        uzs += totals.totalUzs;
        hasUzs = true;
      }
      if (totals.totalUsd != null) {
        usd += totals.totalUsd;
        hasUsd = true;
      }
    });
    return {
      totalUzs: formatOverviewMoney(hasUzs ? uzs : null, "so'm", empty),
      totalUsd: formatOverviewMoney(hasUsd ? usd : null, '$', empty),
    };
  }, [filteredOverviewRows, rowById, cbuUsdFx, cbuEurFx, t]);

  const printLabels = useMemo(
    () => ({
      docTitle: t.rmSidebarWarehouseStock,
      printedAt: t.whExportPrintedAt,
      colNum: t.whExportColNum,
      colType: t.whExportColType,
      colName: t.whExportColName,
      colStock: t.rmRemaining,
      colPurchasePrice: t.whPurchasePrice,
      colTotalUzs: t.whExportColTotalUzs,
      colTotalUsd: t.whExportColTotalUsd,
      grandTotal: t.whExportGrandTotal,
      unitKg: t.unitKg,
    }),
    [t],
  );

  const handlePrint = () => {
    printRawMaterialStock(
      filteredOverviewRows.map((row) => ({
        typeLabel: row.typeLabel,
        name: row.name,
        quantityKg: row.quantityKg,
        purchasePrice: row.purchasePrice,
        purchasePriceUzs: row.purchasePriceUzs,
        purchasePriceFx: row.purchasePriceFx,
        totalUzs: row.totalUzs,
        totalUsd: row.totalUsd,
      })),
      printLabels,
      new Date().toISOString().slice(0, 10),
    );
  };

  const overviewTableLabels = useMemo(
    () => ({
      colNum: t.whExportColNum,
      colType: t.whExportColType,
      colName: t.whExportColName,
      colStock: t.rmRemaining,
      colBagWeight: t.rmDefaultBagWeight,
      colPurchasePrice: t.whPurchasePrice,
      colTotalUzs: t.whExportColTotalUzs,
      colTotalUsd: t.whExportColTotalUsd,
      colFill: t.whOverviewColFill,
      unitKg: t.unitKg,
      grandTotal: t.whExportGrandTotal,
      empty: t.rmWarehouseStockEmpty,
      edit: t.whEdit,
      delete: t.suDelete,
    }),
    [t],
  );

  const openEdit = (rm: RawMaterialProduct) => {
    setError('');
    setEditing(rm);
    setNameDraft(rm.name);
    setPricingDraft(pricingFieldsFromProduct(rm));
  };

  const stockTableNode = (
    <RawMaterialOverviewStockTable
      rows={filteredOverviewRows}
      labels={overviewTableLabels}
      totalKg={filteredTotalKg}
      footerTotals={filteredFooterTotals}
      canManage={canManage}
      canDelete={canDelete}
      onEnterFullscreen={
        tableFullscreen ? undefined : () => setTableFullscreen(true)
      }
      fullscreenEnterLabel={t.exHistoryFullscreenEnter}
      onEdit={(id) => {
        const rm = rowById.get(id);
        if (rm) openEdit(rm);
      }}
      onDelete={(id) => {
        const rm = rowById.get(id);
        if (rm) {
          setError('');
          setDeleteTarget(rm);
        }
      }}
    />
  );

  const closeEdit = () => {
    if (submitting) return;
    setEditing(null);
    setNameDraft('');
    setPricingDraft(EMPTY_WAREHOUSE_PRICING);
    setError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await dispatch({
        type: 'DELETE_WAREHOUSE_PRODUCT',
        payload: {
          id: deleteTarget.id,
          itemType: 'RAW_MATERIAL',
          revertInventory: true,
        },
      });
      setSuccess(t.whProductDeleted);
      setDeleteTarget(null);
      if (editing?.id === deleteTarget.id) {
        closeEdit();
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? translateWarehouseApiError(err.message, t)
          : t.whRequestError,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const nextName = nameDraft.trim();
    if (!nextName) {
      setError(t.whNameRequired);
      return;
    }

    const pricing = parseWarehousePurchasePricingPayload({
      purchasePrice: pricingDraft.purchasePrice,
      priceCurrency: pricingDraft.priceCurrency,
      fxRateToUzs: pricingDraft.fxRateToUzs,
    });
    if (pricing === undefined) {
      setError(t.whPricingInvalid);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await dispatch({
        type: 'UPDATE_WAREHOUSE_PRODUCT',
        payload: {
          id: editing.id,
          currentItemType: 'RAW_MATERIAL',
          itemType: 'RAW_MATERIAL',
          name: nextName,
          ...pricing,
        },
      });
      closeEdit();
    } catch (err) {
      setError(
        err instanceof Error
          ? translateWarehouseApiError(err.message, t)
          : t.whRequestError,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTargetKg = deleteTarget ? (qtyByName.get(deleteTarget.name) ?? 0) : 0;

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
      {!hideTopSummary ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{t.rmWarehouseStockPageDesc}</p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </p>
      ) : null}
      {error && !editing && !deleteTarget ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          {t.rmWarehouseStockEmpty}
        </p>
      ) : null}

      {rows.length > 0 && !hideTopSummary ? (
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white p-5 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-800/80 dark:text-indigo-200/90">
            {t.rmWarehouseStockTotal}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {formatKgAmount(totalKg)}{' '}
            <span className="text-base font-semibold text-slate-500 dark:text-slate-400">{t.unitKg}</span>
          </p>
        </div>
      ) : null}

      {rows.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t.whDetailed}
            </h3>
            <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-0 flex-1 sm:min-w-[14rem] sm:flex-initial">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder={t.whCatalogSearchPlaceholder}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handlePrint}
                disabled={filteredOverviewRows.length === 0}
              >
                <Printer size={16} />
                {t.whExportPrint}
              </Button>
              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-600 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setStockView('cards')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <LayoutGrid size={14} />
                {t.whOverviewViewCards}
              </button>
              <button
                type="button"
                onClick={() => setStockView('table')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Table2 size={14} />
                {t.whOverviewViewTable}
              </button>
              </div>
            </div>
          </div>

          {stockSearch.trim() && filteredRows.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              {t.whCatalogNoSearchResults}
            </p>
          ) : null}

          {filteredRows.length > 0 && (lowSiro.length > 0 || lowPaint.length > 0) && !stockSearch.trim() ? (
            <div className="space-y-3">
              {lowSiro.length > 0 && (
                <details className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <summary className="cursor-pointer select-none text-sm font-semibold text-amber-900 dark:text-amber-100">
                    {t.rmKindSiro} · {t.rmWarning} ({lowSiro.length})
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-amber-900/80 dark:text-amber-100/80">
                    {lowSiro.map(({ rm, kg }) => (
                      <div key={rm.id} className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate">{rm.name}</span>
                        <span className="shrink-0 tabular-nums font-semibold">
                          {formatKgAmount(kg)} {t.unitKg}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              {lowPaint.length > 0 && (
                <details className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <summary className="cursor-pointer select-none text-sm font-semibold text-amber-900 dark:text-amber-100">
                    {t.rmKindPaint} · {t.rmWarning} ({lowPaint.length})
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-amber-900/80 dark:text-amber-100/80">
                    {lowPaint.map(({ rm, kg }) => (
                      <div key={rm.id} className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate">{rm.name}</span>
                        <span className="shrink-0 tabular-nums font-semibold">
                          {formatKgAmount(kg)} {t.unitKg}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ) : null}

          {filteredRows.length > 0 && viewMode === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRows.map((rm) => {
            const kg = qtyByName.get(rm.name) ?? 0;
            const isPaint = rm.rawMaterialKind === 'PAINT';
            const max = isPaint ? 2000 : 5000;
            const low = isPaint ? kg < LOW_PAINT_KG : kg < LOW_SIRO_KG;
            const pct = calcPercent(kg, max);
            const barColor = low
              ? 'bg-amber-500 dark:bg-amber-500'
              : isPaint
                ? 'bg-fuchsia-500 dark:bg-fuchsia-500'
                : 'bg-blue-500 dark:bg-blue-500';
            const Icon = isPaint ? Palette : Droplets;
            const iconWrap = isPaint
              ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';

            return (
              <div
                key={rm.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800 ${
                  low ? 'border-amber-300 dark:border-amber-700/60' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{rm.name}</p>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {rm.rawMaterialKind === 'PAINT' ? t.rmKindPaint : t.rmKindSiro}
                      </p>
                      {rm.description?.trim() ? (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{rm.description}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {low ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                        <AlertTriangle size={12} />
                        {t.rmWarning}
                      </span>
                    ) : null}
                    {canManage || canDelete ? (
                      <div className="flex items-center gap-1">
                        {canManage ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => openEdit(rm)}
                            aria-label={t.whEdit}
                          >
                            <Pencil size={16} />
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setError('');
                              setDeleteTarget(rm);
                            }}
                            aria-label={t.suDelete}
                          >
                            <Trash2 size={16} />
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t.rmRemaining}</span>
                    <span className="tabular-nums text-xl font-bold text-slate-900 dark:text-white">
                      {formatKgAmount(kg)} <span className="text-sm font-normal text-slate-400">{t.unitKg}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <p className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                    ~{formatNumber(pct)}% · max {formatKgAmount(max)} {t.unitKg}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
          ) : filteredRows.length > 0 ? (
            stockTableNode
          ) : null}
        </>
      )}

      {tableFullscreen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[130] flex flex-col bg-white dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            aria-label={t.whDetailed}
          >
            <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                  {t.whDetailed}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filteredOverviewRows.length} {t.totalRecords}
                </p>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1 sm:min-w-[14rem] sm:flex-initial">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    placeholder={t.whCatalogSearchPlaceholder}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handlePrint}
                  disabled={filteredOverviewRows.length === 0}
                >
                  <Printer size={16} />
                  {t.whExportPrint}
                </Button>
                <button
                  type="button"
                  onClick={() => setTableFullscreen(false)}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  title={t.exHistoryFullscreenExit}
                  aria-label={t.exHistoryFullscreenExit}
                >
                  <X size={18} aria-hidden />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-3 pb-6 pt-2 sm:px-5">
              {stockTableNode}
            </div>
          </div>,
          document.body,
        )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setDeleteTarget(null);
            setError('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.whDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? t.rmDeleteConfirmDesc
                    .replace('{name}', deleteTarget.name)
                    .replace('{kg}', formatKgAmount(deleteTargetKg))
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && deleteTarget ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>{t.btnCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {submitting ? t.authLoading : t.whDeleteAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t.whEdit}</DialogTitle>
            <DialogDescription>{t.labelName}</DialogDescription>
          </DialogHeader>

          <form onSubmit={submitEdit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                {t.labelName}
              </label>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
              />
            </div>

            <WarehouseProductPricingFieldsBlock
              value={pricingDraft}
              onChange={setPricingDraft}
              labels={pricingFormLabels}
              purchaseOnly
            />

            {error ? (
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEdit} disabled={submitting}>
                <X size={16} />
                {t.btnCancel}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? t.authLoading : t.btnSave}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
