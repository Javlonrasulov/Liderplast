import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Droplets,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Ban,
  Package,
  History,
  ChevronDown,
  BarChart3,
} from 'lucide-react';
import {
  useERP,
  type RawMaterialKind,
  type RawMaterialProduct,
  computeRawMaterialFlowByKind,
  computeRawMaterialStockByKind,
} from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { translateWarehouseApiError } from '../utils/warehouse-api-errors';
import { formatNumber, formatDate, TODAY } from '../utils/format';
import { SingleDatePicker } from '../components/SingleDatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible';
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

const NONE = '__none__';

/** Kutilayotchi buyurtma (kg) bilan kirim miqdorini solishtirish — juda kichik float farqini e’tiborsiz qoldiramiz */
function incomingKgMatchesOrderedOrder(enteredKg: number, orderedKg: number): boolean {
  if (!Number.isFinite(enteredKg) || !Number.isFinite(orderedKg) || orderedKg <= 0) return true;
  const diff = Math.abs(enteredKg - orderedKg);
  const scale = Math.max(enteredKg, orderedKg, 1);
  return diff <= Math.max(0.5, scale * 0.001);
}

const SELECT_TRIGGER_CLS =
  'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white';

const SELECT_CONTENT_CLS =
  'z-[120] max-h-72 min-w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900';

const SELECT_ITEM_CLS =
  'cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-white';

export function RawMaterial() {
  const { state, dispatch } = useERP();
  const { t, filterData } = useApp();
  const [form, setForm] = useState({ amount: '', unit: 'kg', description: '', date: TODAY });
  const [createForm, setCreateForm] = useState<{
    name: string;
    description: string;
    defaultBagWeightKg: string;
    rawMaterialKind: RawMaterialKind;
  }>({ name: '', description: '', defaultBagWeightKg: '', rawMaterialKind: 'SIRO' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [incomingRawMaterialId, setIncomingRawMaterialId] = useState('');
  const [incomingKind, setIncomingKind] = useState<'SIRO' | 'PAINT'>('SIRO');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rmTab, setRmTab] = useState<'catalog' | 'overview'>('catalog');
  const [incomingQtyMismatchPayload, setIncomingQtyMismatchPayload] = useState<
    | null
    | {
        rawMaterialId: string;
        amountKg: number;
        orderedKg: number;
        description: string;
        date: string;
      }
  >(null);

  const stockByKind = useMemo(
    () => computeRawMaterialStockByKind(state.rawMaterialEntries, state.warehouseProducts),
    [state.rawMaterialEntries, state.warehouseProducts],
  );
  const flowByKind = useMemo(
    () => computeRawMaterialFlowByKind(state.rawMaterialEntries, state.warehouseProducts),
    [state.rawMaterialEntries, state.warehouseProducts],
  );

  const pendingExternalOrders = useMemo(
    () => state.rawMaterialPurchaseOrders.filter((o) => o.status === 'PENDING'),
    [state.rawMaterialPurchaseOrders],
  );

  const siroStockKg = stockByKind.siro;
  const paintStockKg = stockByKind.paint;

  const lowStock = siroStockKg < 1000;
  const criticalStock = siroStockKg < 500;

  const handleCreateRawMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const name = createForm.name.trim();
    if (!name) {
      setError(t.rmCreateNameRequired);
      return;
    }
    const isPaint = createForm.rawMaterialKind === 'PAINT';
    let defaultBagWeightKg: number | undefined;
    if (!isPaint && createForm.defaultBagWeightKg.trim()) {
      const parsed = parseFloat(createForm.defaultBagWeightKg.replace(',', '.'));
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setError(t.rmDefaultBagWeightRequired);
        return;
      }
      defaultBagWeightKg = parsed;
    }

    try {
      await dispatch({
        type: 'ADD_WAREHOUSE_PRODUCT',
        payload: {
          itemType: 'RAW_MATERIAL',
          name,
          description: createForm.description.trim() || undefined,
          unit: 'kg',
          rawMaterialKind: createForm.rawMaterialKind,
          ...(defaultBagWeightKg !== undefined ? { defaultBagWeightKg } : {}),
        },
      });
      setCreateForm({ name: '', description: '', defaultBagWeightKg: '', rawMaterialKind: 'SIRO' });
      setSuccess(t.rmCreatedSuccess);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? translateWarehouseApiError(err.message, t)
          : t.rmCreateError,
      );
    }
  };

  const filteredEntries = filterData([...state.rawMaterialEntries]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const incomingCatalogItems = useMemo(() => {
    return state.warehouseProducts
      .filter((p): p is RawMaterialProduct => {
        if (p.itemType !== 'RAW_MATERIAL') return false;
        return incomingKind === 'PAINT'
          ? p.rawMaterialKind === 'PAINT'
          : p.rawMaterialKind !== 'PAINT';
      })
      .map((p) => ({ id: p.id, name: p.name }));
  }, [state.warehouseProducts, incomingKind]);

  const buildKindAlerts = (paintOnly: boolean) => {
    const stockByName = new Map<string, number>();
    for (const item of state.warehouseStock) {
      if (item.itemType === 'RAW_MATERIAL' && item.itemName) {
        stockByName.set(item.itemName, item.quantity);
      }
    }
    return state.warehouseProducts
      .filter((item): item is RawMaterialProduct => {
        if (item.itemType !== 'RAW_MATERIAL') return false;
        const isPaint = item.rawMaterialKind === 'PAINT';
        return paintOnly ? isPaint : !isPaint;
      })
      .map((item) => {
        const quantityKg = stockByName.get(item.name) ?? 0;
        const level =
          quantityKg < 500 ? 'critical' : quantityKg < 1000 ? 'warning' : 'ok';
        return { id: item.id, name: item.name, quantityKg, level };
      })
      .filter((item) => item.level !== 'ok')
      .sort((a, b) => a.quantityKg - b.quantityKg);
  };

  const siroMaterialAlerts = useMemo(
    () => buildKindAlerts(false),
    [state.warehouseProducts, state.warehouseStock],
  );

  const paintMaterialAlerts = useMemo(
    () => buildKindAlerts(true),
    [state.warehouseProducts, state.warehouseStock],
  );

  const resolvedIncomingRawMaterialId = useMemo(() => {
    if (incomingCatalogItems.length === 0) return '';
    if (incomingRawMaterialId && incomingCatalogItems.some((x) => x.id === incomingRawMaterialId)) {
      return incomingRawMaterialId;
    }
    return incomingCatalogItems[0]?.id ?? '';
  }, [incomingCatalogItems, incomingRawMaterialId]);

  const primaryPendingPurchaseOrder = useMemo(() => {
    const id = resolvedIncomingRawMaterialId;
    if (!id) return null;
    const rows = state.rawMaterialPurchaseOrders
      .filter((o) => o.status === 'PENDING' && o.rawMaterialId === id)
      .sort((a, b) => new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime());
    return rows[0] ?? null;
  }, [resolvedIncomingRawMaterialId, state.rawMaterialPurchaseOrders]);

  const incomingRawMaterial = useMemo(
    () =>
      state.warehouseProducts.find(
        (item) =>
          item.itemType === 'RAW_MATERIAL' &&
          item.id === resolvedIncomingRawMaterialId,
      ),
    [resolvedIncomingRawMaterialId, state.warehouseProducts],
  );

  useEffect(() => {
    // Keep selected value valid when list changes (e.g. after loading or creating a new raw material).
    if (!resolvedIncomingRawMaterialId) return;
    if (incomingRawMaterialId !== resolvedIncomingRawMaterialId) {
      setIncomingRawMaterialId(resolvedIncomingRawMaterialId);
    }
  }, [incomingRawMaterialId, resolvedIncomingRawMaterialId]);

  useEffect(() => {
    setIncomingRawMaterialId('');
  }, [incomingKind]);

  const runIncomingSubmit = (
    rawMaterialId: string,
    amountKg: number,
    description: string,
    date: string,
  ) => {
    dispatch({
      type: 'ADD_RAW_MATERIAL',
      payload: { rawMaterialId, amount: amountKg, description, date },
    });
    setForm({ amount: '', unit: 'kg', description: '', date: TODAY });
    setSuccess(`${formatNumber(amountKg)} ${t.unitKg} ${t.successAdded}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (incomingKind === 'PAINT' && incomingCatalogItems.length === 0) {
      setError(t.rmSelectPaintRequired);
      return;
    }
    const rawMaterialId = resolvedIncomingRawMaterialId;
    const rawVal = parseFloat(String(form.amount).replace(',', '.'));
    const amountKg = form.unit === 'ton' ? rawVal * 1000 : rawVal;
    if (!rawMaterialId) {
      setError(t.rmSelectRawMaterialRequired);
      return;
    }
    if (!form.amount || isNaN(amountKg) || amountKg <= 0) {
      setError(t.labelAmount + '!');
      return;
    }
    const description = form.description || t.rmDefaultIncomingNote;
    const order = primaryPendingPurchaseOrder;
    if (
      order &&
      !incomingKgMatchesOrderedOrder(amountKg, order.quantityKg)
    ) {
      setIncomingQtyMismatchPayload({
        rawMaterialId,
        amountKg,
        orderedKg: order.quantityKg,
        description,
        date: form.date,
      });
      return;
    }
    runIncomingSubmit(rawMaterialId, amountKg, description, form.date);
  };

  const amountKg = form.unit === 'ton' ? parseFloat(form.amount || '0') * 1000 : parseFloat(form.amount || '0');
  const previewStockKg = incomingKind === 'PAINT' ? paintStockKg : siroStockKg;
  const createBagWeightKg = parseFloat((createForm.defaultBagWeightKg || '0').replace(',', '.'));
  const incomingAutoBagCount =
    incomingRawMaterial?.itemType === 'RAW_MATERIAL' &&
    incomingRawMaterial.defaultBagWeightKg &&
    incomingRawMaterial.defaultBagWeightKg > 0 &&
    amountKg > 0
      ? Math.ceil(amountKg / incomingRawMaterial.defaultBagWeightKg)
      : 0;
  const incomingLastBagKg =
    incomingAutoBagCount > 0 && incomingRawMaterial?.itemType === 'RAW_MATERIAL'
      ? amountKg - (incomingAutoBagCount - 1) * (incomingRawMaterial.defaultBagWeightKg ?? 0)
      : 0;

  return (
    <div className="flex min-h-full w-full min-w-0 max-w-full flex-col gap-6 overflow-x-hidden bg-slate-50 p-3 min-[400px]:p-4 lg:p-6 dark:bg-slate-950">
      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700 -mx-1 px-1 min-[400px]:mx-0 min-[400px]:px-0">
          <button
            type="button"
            onClick={() => setRmTab('catalog')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 min-[400px]:px-3 sm:px-4 py-2 min-[400px]:py-3 text-xs min-[400px]:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${rmTab === 'catalog' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <Plus size={14} className="shrink-0" />
            <span className="truncate max-w-[9rem] min-[360px]:max-w-none">{t.rmSectionCreateIncoming}</span>
          </button>
          <button
            type="button"
            onClick={() => setRmTab('overview')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 min-[400px]:px-3 sm:px-4 py-2 min-[400px]:py-3 text-xs min-[400px]:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${rmTab === 'overview' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <BarChart3 size={14} className="shrink-0" />
            <span className="truncate max-w-[9rem] min-[360px]:max-w-none">{t.rmSectionOverview}</span>
          </button>
        </div>

        {rmTab === 'overview' && (
        <div className="mt-0 space-y-4 focus-visible:outline-none">
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.rmSectionOverviewDesc}</p>
        <div className="flex flex-col gap-6">
          <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
            {t.rmMetricsCaptionSiro}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <ArrowDownCircle size={18} className="text-white" />
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">{t.rmTotalIn}</span>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">
                {formatNumber(flowByKind.siroIn)}{' '}
                <span className="text-sm text-slate-400 font-normal">{t.unitKg}</span>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <ArrowUpCircle size={18} className="text-white" />
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">{t.rmTotalOut}</span>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">
                {formatNumber(flowByKind.siroOut)}{' '}
                <span className="text-sm text-slate-400 font-normal">{t.unitKg}</span>
              </p>
            </div>
            <div
              className={`rounded-2xl border p-5 shadow-sm ${
                criticalStock
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  : lowStock
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    criticalStock ? 'bg-red-500' : lowStock ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                >
                  {lowStock ? (
                    <AlertTriangle size={18} className="text-white" />
                  ) : (
                    <Droplets size={18} className="text-white" />
                  )}
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">{t.rmRemaining}</span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  criticalStock ? 'text-red-600' : lowStock ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                }`}
              >
                {formatNumber(siroStockKg)}{' '}
                <span className="text-sm font-normal text-slate-400">{t.unitKg}</span>
              </p>
              {lowStock && (
                <p className="text-xs mt-1 text-amber-600 dark:text-amber-400 font-medium">⚠ {t.dashOrderMaterial}</p>
              )}
            </div>
          </div>
          </div>
          <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
            {t.rmMetricsCaptionPaint}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <ArrowDownCircle size={18} className="text-white" />
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">{t.rmTotalIn}</span>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">
                {formatNumber(flowByKind.paintIn)}{' '}
                <span className="text-sm text-slate-400 font-normal">{t.unitKg}</span>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
                  <ArrowUpCircle size={18} className="text-white" />
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">{t.rmTotalOut}</span>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">
                {formatNumber(flowByKind.paintOut)}{' '}
                <span className="text-sm text-slate-400 font-normal">{t.unitKg}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
                  <Droplets size={18} className="text-white" />
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">{t.rmRemainingPaint}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(paintStockKg)}{' '}
                <span className="text-sm font-normal text-slate-400">{t.unitKg}</span>
              </p>
            </div>
          </div>
          </div>
        </div>

        <Collapsible
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <History size={16} className="text-indigo-500" />
                <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.rmHistory}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{filteredEntries.length} {t.totalRecords}</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${historyOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {filteredEntries.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">{t.noData}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{t.colDate}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{t.colType}</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{t.colAmount}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:table-cell">{t.colNote}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry, idx) => (
                      <tr key={entry.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${idx % 2 !== 0 ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{formatDate(entry.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${entry.type === 'incoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                            {entry.type === 'incoming' ? t.rmIncoming : t.rmOutgoing}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-semibold ${entry.type === 'incoming' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            {entry.type === 'incoming' ? '+' : '-'}{formatNumber(entry.amount)} {t.unitKg}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-xs truncate">{entry.description}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-t-2 border-slate-200 dark:border-slate-600">
                      <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">{t.rmBalance}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-sm font-bold ${lowStock ? 'text-amber-600' : 'text-emerald-600'}`}
                        >
                          {formatNumber(siroStockKg + paintStockKg)} {t.unitKg}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-normal text-slate-500 dark:text-slate-400">
                          {t.rmMetricsCaptionSiro}: {formatNumber(siroStockKg)} · {t.rmMetricsCaptionPaint}:{' '}
                          {formatNumber(paintStockKg)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        </div>
        )}

        {rmTab === 'catalog' && (
        <div className="mt-0 space-y-4 focus-visible:outline-none">
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.rmSectionCreateIncomingDesc}</p>

          {(siroMaterialAlerts.length > 0 || paintMaterialAlerts.length > 0) && (
            <div className="space-y-4">
              {siroMaterialAlerts.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.rmAlertsTitle}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.rmAlertsSubtitle}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {siroMaterialAlerts.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-xl border px-4 py-3 ${
                          item.level === 'critical'
                            ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                            : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {formatNumber(item.quantityKg)} {t.unitKg}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-lg px-2 py-1 text-[11px] font-medium ${
                              item.level === 'critical'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}
                          >
                            {item.level === 'critical' ? t.rmCritical : t.rmWarning}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paintMaterialAlerts.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-violet-900/40 p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.rmAlertsTitlePaint}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.rmAlertsSubtitlePaint}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {paintMaterialAlerts.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-xl border px-4 py-3 ${
                          item.level === 'critical'
                            ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                            : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {formatNumber(item.quantityKg)} {t.unitKg}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-lg px-2 py-1 text-[11px] font-medium ${
                              item.level === 'critical'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}
                          >
                            {item.level === 'critical' ? t.rmCritical : t.rmWarning}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Droplets size={16} className="text-white" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.rmCreateTypeTitle}</h3>
            </div>

            <form onSubmit={handleCreateRawMaterial} className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelName}</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder={t.rmCreateTypePlaceholder}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.rmKindLabel}</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, rawMaterialKind: 'SIRO' })}
                    className={`flex-1 min-w-[8rem] rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                      createForm.rawMaterialKind === 'SIRO'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {t.rmKindSiro}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, rawMaterialKind: 'PAINT' })}
                    className={`flex-1 min-w-[8rem] rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                      createForm.rawMaterialKind === 'PAINT'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {t.rmKindPaint}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t.rmPaintHint}</p>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelDesc}</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={t.rmCreateTypeDescPlaceholder}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>
              {createForm.rawMaterialKind === 'SIRO' && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.rmDefaultBagWeight}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={createForm.defaultBagWeightKg}
                    onChange={e => setCreateForm({ ...createForm, defaultBagWeightKg: e.target.value })}
                    placeholder={t.rmDefaultBagWeightPlaceholder}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">{t.rmDefaultBagWeightHint}</p>
                </div>
              )}
              {createForm.rawMaterialKind === 'SIRO' && createBagWeightKg > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-700 dark:bg-emerald-900/20">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {t.rmDefaultBagWeightPreview.replace('{weight}', formatNumber(createBagWeightKg))}
                  </p>
                </div>
              )}
              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                <Plus size={16} />
                {createForm.rawMaterialKind === 'PAINT' ? t.rmCreatePaintButton : t.rmCreateTypeButton}
              </button>
            </form>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">
                {incomingKind === 'PAINT' ? t.rmIncomingTitlePaint : t.rmIncomingTitleSiro}
              </h3>
            </div>
            {pendingExternalOrders.length > 0 && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/90 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={14} className="text-amber-700 dark:text-amber-400" />
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    {t.rmPendingExternalOrdersTitle}
                  </p>
                </div>
                <ul className="space-y-2">
                  {pendingExternalOrders.map((o) => {
                    const days = Math.max(
                      0,
                      Math.floor(
                        (Date.now() - new Date(o.orderedAt).getTime()) / 86400000,
                      ),
                    );
                    return (
                      <li
                        key={o.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/70 bg-white/80 px-2 py-2 text-xs dark:border-amber-800 dark:bg-slate-900/40"
                      >
                        <span className="text-slate-700 dark:text-slate-200">
                          {t.prRmDaysWaitingTpl
                            .replace('{name}', o.rawMaterialName)
                            .replace('{kg}', formatNumber(o.quantityKg))
                            .replace('{days}', String(days))}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await dispatch({
                                type: 'FULFILL_RAW_MATERIAL_PURCHASE_ORDER',
                                payload: o.id,
                              });
                              setSuccess(t.rmOrderArrivedToast);
                              setTimeout(() => setSuccess(''), 3000);
                            } catch (err) {
                              setError(
                                err instanceof Error
                                  ? translateWarehouseApiError(err.message, t)
                                  : String(err),
                              );
                            }
                          }}
                          className="shrink-0 rounded-lg bg-indigo-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
                        >
                          {t.rmOrderMarkArrived}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                type="button"
                onClick={() => setIncomingKind('SIRO')}
                className={`flex-1 min-w-[8rem] rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                  incomingKind === 'SIRO'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                }`}
              >
                {t.rmIncomingTabSiro}
              </button>
              <button
                type="button"
                onClick={() => setIncomingKind('PAINT')}
                className={`flex-1 min-w-[8rem] rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                  incomingKind === 'PAINT'
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                }`}
              >
                {t.rmIncomingTabPaint}
              </button>
            </div>

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                <p className="text-emerald-700 dark:text-emerald-400 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.rmBagRawMaterial}</label>
                <Select
                  value={resolvedIncomingRawMaterialId || NONE}
                  onValueChange={(v) => setIncomingRawMaterialId(v === NONE ? '' : v)}
                >
                  <SelectTrigger className={SELECT_TRIGGER_CLS}>
                    <SelectValue placeholder={t.rmBagSelectRawMaterial} />
                  </SelectTrigger>
                  <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
                    <SelectItem value={NONE} className={SELECT_ITEM_CLS}>
                      —
                    </SelectItem>
                    {incomingCatalogItems.map((item) => (
                      <SelectItem key={item.id} value={item.id} className={SELECT_ITEM_CLS}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 mt-1">
                  {incomingKind === 'PAINT' ? t.rmIncomingHintPaint : t.rmIncomingHint}
                </p>
                {incomingKind === 'SIRO' &&
                  (incomingRawMaterial?.itemType === 'RAW_MATERIAL' && incomingRawMaterial.defaultBagWeightKg ? (
                    <p className="text-xs text-indigo-500 mt-1">
                      {t.rmIncomingBagWeightHint
                        .replace('{weight}', formatNumber(incomingRawMaterial.defaultBagWeightKg))
                        .replace('{unit}', t.unitKg)}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-500 mt-1">{t.rmAutoBagMissingHint}</p>
                  ))}
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelDate}</label>
                <SingleDatePicker
                  value={form.date}
                  onChange={(date) => setForm({ ...form, date })}
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelAmount}</label>
                <div className="flex gap-2">
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" min="0"
                    className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  <div className="w-full min-w-[6.5rem] max-w-[42%] sm:w-[140px] sm:max-w-none">
                    <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                      <SelectTrigger className={SELECT_TRIGGER_CLS}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
                        <SelectItem value="kg" className={SELECT_ITEM_CLS}>
                          {t.unitKg}
                        </SelectItem>
                        <SelectItem value="ton" className={SELECT_ITEM_CLS}>
                          {t.unitTon}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.amount && form.unit === 'ton' && (
                  <p className="text-xs text-indigo-500 mt-1">= {formatNumber(amountKg)} {t.unitKg}</p>
                )}
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelDesc}</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={incomingKind === 'PAINT' ? t.rmPlaceholderDescPaint : t.rmPlaceholderDesc}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>

              {form.amount && amountKg > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                  <p className="text-blue-700 dark:text-blue-400 text-xs font-medium">{t.rmPreviewAdd}</p>
                  <p className="text-blue-800 dark:text-blue-300 text-sm font-bold mt-0.5">{formatNumber(amountKg)} {t.unitKg}</p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                    {t.rmPreviewBalance} {formatNumber(previewStockKg + amountKg)} {t.unitKg}
                  </p>
                  {incomingKind === 'SIRO' &&
                  incomingAutoBagCount > 0 &&
                  incomingRawMaterial?.itemType === 'RAW_MATERIAL' ? (
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                      {t.rmAutoBagPreview
                        .replace('{count}', String(incomingAutoBagCount))
                        .replace('{weight}', formatNumber(incomingRawMaterial.defaultBagWeightKg ?? 0))
                        .replace('{lastWeight}', formatNumber(incomingLastBagKg || 0))}
                    </p>
                  ) : null}
                </div>
              )}
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div>}

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                <Plus size={16} /> {t.rmAddBtn}
              </button>
            </form>
        </div>
      </div>
        </div>
        )}

      </div>

      {(error || success) && (
        <div className="fixed bottom-4 right-4 z-20 max-w-sm space-y-2">
          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-red-600 dark:text-red-400 shadow-lg flex items-start gap-2">
              <Ban size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 shadow-lg">
              {success}
            </div>
          )}
        </div>
      )}

      <AlertDialog
        open={Boolean(incomingQtyMismatchPayload)}
        onOpenChange={(open) => !open && setIncomingQtyMismatchPayload(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.rmIncomingQtyMismatchTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {incomingQtyMismatchPayload
                ? t.rmIncomingQtyMismatchBody
                    .replace('{orderedKg}', formatNumber(incomingQtyMismatchPayload.orderedKg))
                    .replace('{enteredKg}', formatNumber(incomingQtyMismatchPayload.amountKg))
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.btnCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const p = incomingQtyMismatchPayload;
                if (!p) return;
                runIncomingSubmit(p.rawMaterialId, p.amountKg, p.description, p.date);
                setIncomingQtyMismatchPayload(null);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {t.btnConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}