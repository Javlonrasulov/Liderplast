import React, { useMemo, useState } from 'react';
import {
  Boxes,
  Droplets,
  Factory,
  Package,
  TrendingDown,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import {
  useERP,
  type WarehouseItemType,
  type WarehouseProduct,
} from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatDate, formatNumber, calcPercent } from '../utils/format';

function StockItem({ label, value, max, unit, color, bgColor, icon, warning }: {
  label: string; value: number; max: number; unit: string; color: string; bgColor: string; icon: React.ReactNode; warning?: boolean;
}) {
  const pct = calcPercent(value, max);
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-sm ${warning ? 'border-amber-300 dark:border-amber-700' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>{icon}</div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${pct < 20 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : pct < 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>{pct.toFixed(0)}%</span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-slate-900 dark:text-white text-2xl font-bold">{formatNumber(value)} <span className="text-sm font-normal text-slate-400">{unit}</span></p>
      <div className="mt-3 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-slate-400">0</span>
        <span className="text-xs text-slate-400">Max: {formatNumber(max)} {unit}</span>
      </div>
    </div>
  );
}

type ProductFormState = {
  itemType: WarehouseItemType;
  name: string;
  description: string;
  unit: string;
  weightGram: string;
  volumeLiter: string;
};

const DEFAULT_FORM: ProductFormState = {
  itemType: 'RAW_MATERIAL',
  name: '',
  description: '',
  unit: 'kg',
  weightGram: '',
  volumeLiter: '',
};

function productMetric(product: WarehouseProduct, t: ReturnType<typeof useApp>['t']) {
  switch (product.itemType) {
    case 'RAW_MATERIAL':
      return `${t.whUnit}: ${product.unit}`;
    case 'SEMI_PRODUCT':
      return `${t.whWeightGram}: ${formatNumber(product.weightGram)} g`;
    case 'FINISHED_PRODUCT':
      return `${t.whVolumeLiter}: ${formatNumber(product.volumeLiter)} L`;
    default:
      return '';
  }
}

export function Warehouse() {
  const {
    state,
    rawMaterialStock,
    semiProductStock,
    finalProductStock,
    dispatch,
  } = useERP();
  const { t, filterData } = useApp();
  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const warehouseProducts = state.warehouseProducts ?? [];

  const totalSemi = semiProductStock['18g'] + semiProductStock['20g'];
  const totalFinal = finalProductStock['0.5L'] + finalProductStock['1L'] + finalProductStock['5L'];
  const totalSemiProduced = state.semiProductBatches.reduce((s, b) => s + b.quantity, 0);
  const totalFinalProduced = state.finalProductBatches.reduce((s, b) => s + b.quantity, 0);
  const totalSemiSold = state.sales.filter(s => s.productCategory === 'semi').reduce((s, sale) => s + sale.quantity, 0);
  const totalFinalSold = state.sales.filter(s => s.productCategory === 'final').reduce((s, sale) => s + sale.quantity, 0);
  const productTypeCounts = useMemo(
    () => ({
      RAW_MATERIAL: warehouseProducts.filter((item) => item.itemType === 'RAW_MATERIAL').length,
      SEMI_PRODUCT: warehouseProducts.filter((item) => item.itemType === 'SEMI_PRODUCT').length,
      FINISHED_PRODUCT: warehouseProducts.filter((item) => item.itemType === 'FINISHED_PRODUCT').length,
    }),
    [warehouseProducts],
  );

  const filteredProducts = useMemo(() => {
    const items = warehouseProducts.map((item) => ({
      ...item,
      date: item.createdAt?.slice(0, 10) ?? '1970-01-01',
    }));

    return filterData(items).sort(
      (left, right) =>
        new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime(),
    );
  }, [filterData, warehouseProducts]);

  const resetForm = (itemType: WarehouseItemType = 'RAW_MATERIAL') => {
    setForm({
      ...DEFAULT_FORM,
      itemType,
      unit: itemType === 'RAW_MATERIAL' ? 'kg' : DEFAULT_FORM.unit,
    });
    setEditingProductId(null);
  };

  const startEdit = (product: WarehouseProduct) => {
    setEditingProductId(product.id);
    setError('');
    setSuccess('');
    setForm({
      itemType: product.itemType,
      name: product.name,
      description: product.description ?? '',
      unit: product.itemType === 'RAW_MATERIAL' ? product.unit : 'kg',
      weightGram:
        product.itemType === 'SEMI_PRODUCT' ? String(product.weightGram) : '',
      volumeLiter:
        product.itemType === 'FINISHED_PRODUCT' ? String(product.volumeLiter) : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError(t.whNameRequired);
      return;
    }

    if (form.itemType === 'SEMI_PRODUCT') {
      const weightGram = Number(form.weightGram);
      if (!Number.isFinite(weightGram) || weightGram <= 0) {
        setError(t.whMetricRequired);
        return;
      }
    }

    if (form.itemType === 'FINISHED_PRODUCT') {
      const volumeLiter = Number(form.volumeLiter);
      if (!Number.isFinite(volumeLiter) || volumeLiter <= 0) {
        setError(t.whMetricRequired);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (editingProductId) {
        await dispatch({
          type: 'UPDATE_WAREHOUSE_PRODUCT',
          payload: {
            id: editingProductId,
            itemType: form.itemType,
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            unit:
              form.itemType === 'RAW_MATERIAL'
                ? form.unit.trim() || 'kg'
                : undefined,
            weightGram:
              form.itemType === 'SEMI_PRODUCT'
                ? Number(form.weightGram)
                : undefined,
            volumeLiter:
              form.itemType === 'FINISHED_PRODUCT'
                ? Number(form.volumeLiter)
                : undefined,
          },
        });
        setSuccess(t.whProductUpdated);
      } else {
        await dispatch({
          type: 'ADD_WAREHOUSE_PRODUCT',
          payload: {
            itemType: form.itemType,
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            unit:
              form.itemType === 'RAW_MATERIAL'
                ? form.unit.trim() || 'kg'
                : undefined,
            weightGram:
              form.itemType === 'SEMI_PRODUCT'
                ? Number(form.weightGram)
                : undefined,
            volumeLiter:
              form.itemType === 'FINISHED_PRODUCT'
                ? Number(form.volumeLiter)
                : undefined,
          },
        });
        setSuccess(t.whProductAdded);
      }
      resetForm(form.itemType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Warehouse product error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: WarehouseProduct) => {
    if (!window.confirm(`${product.name} — ${t.whDeleteConfirm}`)) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      await dispatch({
        type: 'DELETE_WAREHOUSE_PRODUCT',
        payload: { id: product.id, itemType: product.itemType },
      });
      if (editingProductId === product.id) {
        resetForm(form.itemType);
      }
      setSuccess(t.whProductDeleted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Warehouse product error');
    }
  };

  const typeOptions: Array<{
    value: WarehouseItemType;
    label: string;
    count: number;
  }> = [
    {
      value: 'RAW_MATERIAL',
      label: t.whMaterial,
      count: productTypeCounts.RAW_MATERIAL,
    },
    {
      value: 'SEMI_PRODUCT',
      label: t.whSemi,
      count: productTypeCounts.SEMI_PRODUCT,
    },
    {
      value: 'FINISHED_PRODUCT',
      label: t.whFinal,
      count: productTypeCounts.FINISHED_PRODUCT,
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Overview header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t.whMaterial, sub: `${calcPercent(rawMaterialStock, 5000).toFixed(0)}% ${t.whInWarehouse}`, val: `${formatNumber(rawMaterialStock)} kg`, from: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200 dark:shadow-blue-900/30', icon: Droplets },
          { label: t.whSemi, sub: '18g + 20g', val: `${formatNumber(totalSemi)} ${t.unitPiece}`, from: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-200 dark:shadow-purple-900/30', icon: Factory },
          { label: t.whFinal, sub: '0.5L + 1L + 5L', val: `${formatNumber(totalFinal)} ${t.unitPiece}`, from: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-200 dark:shadow-cyan-900/30', icon: Package },
          { label: t.whTotalProd, sub: t.whInWarehouse, val: `${formatNumber(totalSemi + totalFinal)} ${t.unitPiece}`, from: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200 dark:shadow-emerald-900/30', icon: Boxes },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.from} rounded-2xl p-5 text-white shadow-lg ${card.shadow}`}>
            <card.icon size={20} className="mb-3 opacity-80" />
            <p className="text-white/80 text-xs mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.val}</p>
            <p className="text-white/70 text-xs mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Detailed stock */}
      <div>
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-4">{t.whDetailed}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StockItem label={t.whMaterial} value={rawMaterialStock} max={5000} unit="kg" color={rawMaterialStock < 1000 ? 'bg-amber-500' : 'bg-blue-500'} bgColor="bg-blue-100 dark:bg-blue-900/30" icon={<Droplets size={18} className="text-blue-600 dark:text-blue-400" />} warning={rawMaterialStock < 1000} />
          <StockItem label="18g Qolip" value={semiProductStock['18g']} max={100000} unit={t.unitPiece} color="bg-purple-500" bgColor="bg-purple-100 dark:bg-purple-900/30" icon={<Factory size={18} className="text-purple-600 dark:text-purple-400" />} />
          <StockItem label="20g Qolip" value={semiProductStock['20g']} max={60000} unit={t.unitPiece} color="bg-violet-500" bgColor="bg-violet-100 dark:bg-violet-900/30" icon={<Factory size={18} className="text-violet-600 dark:text-violet-400" />} />
          <StockItem label="0.5L" value={finalProductStock['0.5L']} max={20000} unit={t.unitPiece} color="bg-cyan-500" bgColor="bg-cyan-100 dark:bg-cyan-900/30" icon={<Package size={18} className="text-cyan-600 dark:text-cyan-400" />} />
          <StockItem label="1L" value={finalProductStock['1L']} max={15000} unit={t.unitPiece} color="bg-teal-500" bgColor="bg-teal-100 dark:bg-teal-900/30" icon={<Package size={18} className="text-teal-600 dark:text-teal-400" />} />
          <StockItem label="5L" value={finalProductStock['5L']} max={5000} unit={t.unitPiece} color="bg-blue-500" bgColor="bg-blue-100 dark:bg-blue-900/30" icon={<Package size={18} className="text-blue-600 dark:text-blue-400" />} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-emerald-500" /><h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.whSemiStats}</h3></div>
          <div className="space-y-3">
            {[
              { label: t.whProduced, value: totalSemiProduced, color: 'text-purple-600 dark:text-purple-400' },
              { label: t.whUsedInFinal, value: state.finalProductBatches.reduce((s, b) => s + b.semiProductUsed, 0), color: 'text-cyan-600 dark:text-cyan-400' },
              { label: t.whSold, value: totalSemiSold, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: t.whRemaining, value: totalSemi, color: 'text-slate-800 dark:text-white' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-slate-500 dark:text-slate-400 text-sm">{item.label}</span>
                <span className={`font-bold text-sm ${item.color}`}>{formatNumber(item.value)} {t.unitPiece}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><TrendingDown size={16} className="text-cyan-500" /><h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.whFinalStats}</h3></div>
          <div className="space-y-3">
            {[
              { label: t.whProduced, value: totalFinalProduced, color: 'text-cyan-600 dark:text-cyan-400' },
              { label: t.whSold, value: totalFinalSold, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: t.whRemaining, value: totalFinal, color: 'text-slate-800 dark:text-white' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-slate-500 dark:text-slate-400 text-sm">{item.label}</span>
                <span className={`font-bold text-sm ${item.color}`}>{formatNumber(item.value)} {t.unitPiece}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-400 mb-2">{t.whByType}</p>
              {(['0.5L', '1L', '5L'] as const).map(type => (
                <div key={type} className="flex items-center justify-between py-1">
                  <span className="text-slate-500 text-xs">{type}</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold">{formatNumber(finalProductStock[type])} {t.unitPiece}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
                {t.whManageTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.whManageSubtitle}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
              {editingProductId ? <Pencil size={18} /> : <Plus size={18} />}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
              {t.whProductType}
            </label>
            <select
              value={form.itemType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...DEFAULT_FORM,
                  ...prev,
                  itemType: e.target.value as WarehouseItemType,
                  unit: e.target.value === 'RAW_MATERIAL' ? 'kg' : 'kg',
                  weightGram: e.target.value === 'SEMI_PRODUCT' ? prev.weightGram : '',
                  volumeLiter: e.target.value === 'FINISHED_PRODUCT' ? prev.volumeLiter : '',
                }))
              }
              disabled={Boolean(editingProductId)}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 px-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
              {t.labelName}
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 px-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {form.itemType === 'RAW_MATERIAL' && (
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                {t.whUnit}
              </label>
              <input
                value={form.unit}
                onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 px-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {form.itemType === 'SEMI_PRODUCT' && (
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                {t.whWeightGram}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.weightGram}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, weightGram: e.target.value }))
                }
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 px-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {form.itemType === 'FINISHED_PRODUCT' && (
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                {t.whVolumeLiter}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.volumeLiter}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, volumeLiter: e.target.value }))
                }
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 px-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
              {t.labelDesc}
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {(error || success) && (
            <div
              className={`rounded-xl px-3 py-2 text-sm border ${
                error
                  ? 'border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
                  : 'border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {error || success}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              {editingProductId ? <Save size={16} /> : <Plus size={16} />}
              {submitting
                ? t.authLoading
                : editingProductId
                  ? t.btnSave
                  : t.btnAdd}
            </button>
            {editingProductId && (
              <button
                type="button"
                onClick={() => resetForm()}
                className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center justify-center gap-2"
              >
                <X size={16} />
                {t.btnCancel}
              </button>
            )}
          </div>
        </form>

        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
                {t.whProductsList}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {filteredProducts.length} {t.totalRecords}
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              {t.whNoProducts}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[640px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {
                          typeOptions.find((option) => option.value === product.itemType)
                            ?.label
                        }
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {productMetric(product, t)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {t.whCreatedAt}:{' '}
                      {product.createdAt
                        ? formatDate(product.createdAt.slice(0, 10))
                        : '—'}
                    </p>
                    {product.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                      className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Pencil size={14} />
                      {t.whEdit}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(product)}
                      className="h-10 px-3 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={14} />
                      {t.suDelete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
