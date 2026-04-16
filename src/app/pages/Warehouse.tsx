import React, { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  Droplets,
  Factory,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import {
  type FinishedProductCatalogItem,
  type SemiProductCatalogItem,
  useERP,
  type WarehouseProduct,
} from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { calcPercent, formatDate, formatNumber } from '../utils/format';
import { translateWarehouseApiError } from '../utils/warehouse-api-errors';
import {
  finalBucketFromCatalog,
  semiBucketFromCatalog,
} from '../utils/warehouse-catalog-buckets';
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

type ProductFormType = 'SEMI_PRODUCT' | 'FINISHED_PRODUCT';

type ProductFormState = {
  itemType: ProductFormType;
  name: string;
  description: string;
  weightGram: string;
  volumeLiter: string;
  rawMaterials: Array<{
    rawMaterialId: string;
    amountGram: string;
  }>;
  semiProductIds: string[];
  machineIds: string[];
};

const DEFAULT_FORM: ProductFormState = {
  itemType: 'SEMI_PRODUCT',
  name: '',
  description: '',
  weightGram: '',
  volumeLiter: '',
  rawMaterials: [{ rawMaterialId: '', amountGram: '' }],
  semiProductIds: [],
  machineIds: [],
};

function StockItem({
  label,
  value,
  max,
  unit,
  color,
  bgColor,
  icon,
  warning,
  maxLabel,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  warning?: boolean;
  maxLabel: string;
}) {
  const pct = calcPercent(value, max);
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-800 ${
        warning
          ? 'border-amber-300 dark:border-amber-700'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}
        >
          {icon}
        </div>
        <span
          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
            pct < 20
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : pct < 40
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          }`}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {formatNumber(value)}{' '}
        <span className="text-sm font-normal text-slate-400">{unit}</span>
      </p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between">
        <span className="text-xs text-slate-400">0</span>
        <span className="text-xs text-slate-400">
          {maxLabel}: {formatNumber(max)} {unit}
        </span>
      </div>
    </div>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsMobile(mediaQuery.matches);
    apply();
    mediaQuery.addEventListener('change', apply);
    return () => mediaQuery.removeEventListener('change', apply);
  }, []);

  return isMobile;
}

function productMetric(product: WarehouseProduct, t: ReturnType<typeof useApp>['t']) {
  if (product.itemType === 'SEMI_PRODUCT') {
    const recipeCount = product.rawMaterials.length;
    return `${t.whWeightGram}: ${formatNumber(product.weightGram)} g, ${recipeCount} ${t.whIngredientsShort}`;
  }
  if (product.itemType === 'FINISHED_PRODUCT') {
    return `${t.whVolumeLiter}: ${formatNumber(product.volumeLiter)} L, ${product.semiProducts.length} ${t.whSemiShort}, ${product.machines.length} ${t.whMachinesShort}`;
  }
  return product.defaultBagWeightKg
    ? `${t.whUnit}: ${product.unit}, ${t.rmDefaultBagWeight}: ${formatNumber(product.defaultBagWeightKg)} ${t.unitKg}`
    : `${t.whUnit}: ${product.unit}`;
}

function auditLine(product: WarehouseProduct, t: ReturnType<typeof useApp>['t']) {
  const createdBy = product.audit?.createdByName;
  const updatedBy = product.audit?.updatedByName;
  const createdAt = product.createdAt ? formatDate(product.createdAt.slice(0, 10)) : '—';

  if (updatedBy) {
    return `${t.whUpdatedBy}: ${updatedBy}`;
  }
  if (createdBy) {
    return `${t.whCreatedBy}: ${createdBy}`;
  }
  return `${t.whCreatedAt}: ${createdAt}`;
}

export function Warehouse() {
  const { state, rawMaterialStock, semiProductStock, finalProductStock, dispatch } =
    useERP();
  const { user } = useAuth();
  const { t, filterData } = useApp();
  const isMobile = useIsMobile();

  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    SemiProductCatalogItem | FinishedProductCatalogItem | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<
    WarehouseProduct | null
  >(null);
  const [blockedDeleteTarget, setBlockedDeleteTarget] =
    useState<Extract<WarehouseProduct, { itemType: 'RAW_MATERIAL' }> | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'DIRECTOR';
  const rawMaterials = useMemo(
    () =>
      state.warehouseProducts.filter(
        (item): item is Extract<WarehouseProduct, { itemType: 'RAW_MATERIAL' }> =>
          item.itemType === 'RAW_MATERIAL',
      ),
    [state.warehouseProducts],
  );

  const rawStockById = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of state.warehouseStock ?? []) {
      if (item.itemType === 'RAW_MATERIAL') map.set(item.id, item.quantity);
    }
    return map;
  }, [state.warehouseStock]);
  const productCatalog = useMemo(
    () =>
      state.warehouseProducts.filter(
        (
          item,
        ): item is SemiProductCatalogItem | FinishedProductCatalogItem =>
          item.itemType === 'SEMI_PRODUCT' || item.itemType === 'FINISHED_PRODUCT',
      ),
    [state.warehouseProducts],
  );
  const semiProducts = useMemo(
    () =>
      productCatalog.filter(
        (item): item is SemiProductCatalogItem => item.itemType === 'SEMI_PRODUCT',
      ),
    [productCatalog],
  );
  const finishedProducts = useMemo(
    () =>
      productCatalog.filter(
        (item): item is FinishedProductCatalogItem =>
          item.itemType === 'FINISHED_PRODUCT',
      ),
    [productCatalog],
  );

  const hasCatalogRaw = rawMaterials.length > 0;
  const hasCatalogSemi18 = semiProducts.some(
    (p) => semiBucketFromCatalog(p) === '18g',
  );
  const hasCatalogSemi20 = semiProducts.some(
    (p) => semiBucketFromCatalog(p) === '20g',
  );
  const hasCatalogSemi = hasCatalogSemi18 || hasCatalogSemi20;

  const hasCatalogFinal05 = finishedProducts.some(
    (p) => finalBucketFromCatalog(p) === '0.5L',
  );
  const hasCatalogFinal1 = finishedProducts.some(
    (p) => finalBucketFromCatalog(p) === '1L',
  );
  const hasCatalogFinal5 = finishedProducts.some(
    (p) => finalBucketFromCatalog(p) === '5L',
  );
  const hasCatalogFinal =
    hasCatalogFinal05 || hasCatalogFinal1 || hasCatalogFinal5;

  const totalSemiInCatalogStock =
    (hasCatalogSemi18 ? semiProductStock['18g'] : 0) +
    (hasCatalogSemi20 ? semiProductStock['20g'] : 0);
  const totalFinalInCatalogStock =
    (hasCatalogFinal05 ? finalProductStock['0.5L'] : 0) +
    (hasCatalogFinal1 ? finalProductStock['1L'] : 0) +
    (hasCatalogFinal5 ? finalProductStock['5L'] : 0);
  const totalPiecesInCatalogStock =
    totalSemiInCatalogStock + totalFinalInCatalogStock;

  const hasAnyStockDetailCard =
    hasCatalogRaw ||
    hasCatalogSemi18 ||
    hasCatalogSemi20 ||
    hasCatalogFinal05 ||
    hasCatalogFinal1 ||
    hasCatalogFinal5;

  const warehouseSummaryCards = useMemo(() => {
    const cards: Array<{
      key: string;
      label: string;
      sub: string;
      val: string;
      from: string;
      shadow: string;
      icon: typeof Droplets;
    }> = [];
    if (hasCatalogRaw) {
      cards.push({
        key: 'raw',
        label: t.whMaterial,
        sub: `${calcPercent(rawMaterialStock, 5000).toFixed(0)}% ${t.whInWarehouse}`,
        val: `${formatNumber(rawMaterialStock)} ${t.unitKg}`,
        from: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-200 dark:shadow-blue-900/30',
        icon: Droplets,
      });
    }
    if (hasCatalogSemi) {
      const subParts: string[] = [];
      if (hasCatalogSemi18) subParts.push(t.whSemi18Label);
      if (hasCatalogSemi20) subParts.push(t.whSemi20Label);
      cards.push({
        key: 'semi',
        label: t.whSemi,
        sub: subParts.join(' + '),
        val: `${formatNumber(totalSemiInCatalogStock)} ${t.unitPiece}`,
        from: 'from-purple-500 to-purple-600',
        shadow: 'shadow-purple-200 dark:shadow-purple-900/30',
        icon: Factory,
      });
    }
    if (hasCatalogFinal) {
      const subParts: string[] = [];
      if (hasCatalogFinal05) subParts.push(t.whFinal05Label);
      if (hasCatalogFinal1) subParts.push(t.whFinal1Label);
      if (hasCatalogFinal5) subParts.push(t.whFinal5Label);
      cards.push({
        key: 'final',
        label: t.whFinal,
        sub: subParts.join(' + '),
        val: `${formatNumber(totalFinalInCatalogStock)} ${t.unitPiece}`,
        from: 'from-cyan-500 to-cyan-600',
        shadow: 'shadow-cyan-200 dark:shadow-cyan-900/30',
        icon: Package,
      });
    }
    if (hasCatalogSemi || hasCatalogFinal) {
      cards.push({
        key: 'total-pieces',
        label: t.whTotalProd,
        sub: t.whInWarehouse,
        val: `${formatNumber(totalPiecesInCatalogStock)} ${t.unitPiece}`,
        from: 'from-emerald-500 to-emerald-600',
        shadow: 'shadow-emerald-200 dark:shadow-emerald-900/30',
        icon: Boxes,
      });
    }
    return cards;
  }, [
    hasCatalogRaw,
    hasCatalogSemi,
    hasCatalogFinal,
    hasCatalogSemi18,
    hasCatalogSemi20,
    hasCatalogFinal05,
    hasCatalogFinal1,
    hasCatalogFinal5,
    rawMaterialStock,
    totalSemiInCatalogStock,
    totalFinalInCatalogStock,
    totalPiecesInCatalogStock,
    t,
  ]);

  const availableFinalMachines = useMemo(
    () => state.machines.filter((machine) => machine.type === 'final'),
    [state.machines],
  );

  const totalSemiProduced = state.semiProductBatches.reduce(
    (sum, batch) => sum + batch.quantity,
    0,
  );
  const totalFinalProduced = state.finalProductBatches.reduce(
    (sum, batch) => sum + batch.quantity,
    0,
  );
  const totalSemiSold = state.sales
    .filter((sale) => sale.productCategory === 'semi')
    .reduce((sum, sale) => sum + sale.quantity, 0);
  const totalFinalSold = state.sales
    .filter((sale) => sale.productCategory === 'final')
    .reduce((sum, sale) => sum + sale.quantity, 0);

  const filteredProducts = useMemo(() => {
    const items = productCatalog.map((item) => ({
      ...item,
      date: item.createdAt?.slice(0, 10) ?? '1970-01-01',
    }));

    return filterData(items).sort(
      (left, right) =>
        new Date(right.createdAt ?? 0).getTime() -
        new Date(left.createdAt ?? 0).getTime(),
    );
  }, [filterData, productCatalog]);

  const typeOptions: Array<{ value: ProductFormType; label: string; count: number }> = [
    {
      value: 'SEMI_PRODUCT',
      label: t.whSemi,
      count: semiProducts.length,
    },
    {
      value: 'FINISHED_PRODUCT',
      label: t.whFinal,
      count: productCatalog.filter((item) => item.itemType === 'FINISHED_PRODUCT').length,
    },
  ];

  const resetForm = (itemType: ProductFormType = 'SEMI_PRODUCT') => {
    setForm({
      ...DEFAULT_FORM,
      itemType,
      rawMaterials:
        itemType === 'SEMI_PRODUCT'
          ? [{ rawMaterialId: '', amountGram: '' }]
          : [],
    });
    setEditingProduct(null);
  };

  const openCreate = () => {
    resetForm('SEMI_PRODUCT');
    setError('');
    setSuccess('');
    setIsEditorOpen(true);
  };

  const startEdit = (product: SemiProductCatalogItem | FinishedProductCatalogItem) => {
    setEditingProduct(product);
    setError('');
    setSuccess('');
    setForm({
      itemType: product.itemType,
      name: product.name,
      description: product.description ?? '',
      weightGram:
        product.itemType === 'SEMI_PRODUCT' ? String(product.weightGram) : '',
      volumeLiter:
        product.itemType === 'FINISHED_PRODUCT' ? String(product.volumeLiter) : '',
      rawMaterials:
        product.itemType === 'SEMI_PRODUCT'
          ? product.rawMaterials.map((item) => ({
              rawMaterialId: item.rawMaterialId,
              amountGram: String(item.amountGram),
            }))
          : [],
      semiProductIds:
        product.itemType === 'FINISHED_PRODUCT'
          ? product.semiProducts.map((item) => item.semiProductId)
          : [],
      machineIds:
        product.itemType === 'FINISHED_PRODUCT'
          ? product.machines.map((item) => item.machineId)
          : [],
    });
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    resetForm(editingProduct?.itemType === 'FINISHED_PRODUCT' ? 'FINISHED_PRODUCT' : 'SEMI_PRODUCT');
  };

  const setFormType = (itemType: ProductFormType) => {
    setForm((prev) => ({
      ...DEFAULT_FORM,
      itemType,
      name: prev.name,
      description: prev.description,
      rawMaterials:
        itemType === 'SEMI_PRODUCT'
          ? prev.rawMaterials.length > 0
            ? prev.rawMaterials
            : [{ rawMaterialId: '', amountGram: '' }]
          : [],
      semiProductIds: itemType === 'FINISHED_PRODUCT' ? prev.semiProductIds : [],
      machineIds: itemType === 'FINISHED_PRODUCT' ? prev.machineIds : [],
    }));
  };

  const addIngredientRow = () => {
    setForm((prev) => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, { rawMaterialId: '', amountGram: '' }],
    }));
  };

  const removeIngredientRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      rawMaterials:
        prev.rawMaterials.length === 1
          ? [{ rawMaterialId: '', amountGram: '' }]
          : prev.rawMaterials.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const toggleSelection = (
    field: 'semiProductIds' | 'machineIds',
    id: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((currentId) => currentId !== id)
        : [...prev[field], id],
    }));
  };

  const buildPayload = () => {
    if (!form.name.trim()) {
      throw new Error(t.whNameRequired);
    }

    if (form.itemType === 'SEMI_PRODUCT') {
      const weightGram = Number(form.weightGram);
      if (!Number.isFinite(weightGram) || weightGram <= 0) {
        throw new Error(t.whMetricRequired);
      }

      const rawMaterialsPayload = form.rawMaterials
        .map((item) => ({
          rawMaterialId: item.rawMaterialId.trim(),
          amountGram: Number(item.amountGram),
        }))
        .filter((item) => item.rawMaterialId);

      if (rawMaterialsPayload.length === 0) {
        throw new Error(t.whRawMaterialRequired);
      }
      if (
        rawMaterialsPayload.some(
          (item) => !Number.isFinite(item.amountGram) || item.amountGram <= 0,
        )
      ) {
        throw new Error(t.whAmountGramRequired);
      }

      return {
        itemType: 'SEMI_PRODUCT' as const,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        weightGram,
        relations: { rawMaterials: rawMaterialsPayload },
      };
    }

    const volumeLiter = Number(form.volumeLiter);
    if (!Number.isFinite(volumeLiter) || volumeLiter <= 0) {
      throw new Error(t.whMetricRequired);
    }
    if (form.semiProductIds.length === 0) {
      throw new Error(t.whSemiProductRequired);
    }
    if (form.machineIds.length === 0) {
      throw new Error(t.whMachineRequired);
    }

    return {
      itemType: 'FINISHED_PRODUCT' as const,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      volumeLiter,
      relations: {
        semiProductIds: form.semiProductIds,
        machineIds: form.machineIds,
      },
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = buildPayload();

      if (editingProduct) {
        await dispatch({
          type: 'UPDATE_WAREHOUSE_PRODUCT',
          payload: {
            id: editingProduct.id,
            currentItemType: editingProduct.itemType,
            ...payload,
          },
        });
        setSuccess(t.whProductUpdated);
      } else {
        await dispatch({
          type: 'ADD_WAREHOUSE_PRODUCT',
          payload,
        });
        setSuccess(t.whProductAdded);
      }

      closeEditor();
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

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await dispatch({
        type: 'DELETE_WAREHOUSE_PRODUCT',
        payload: { id: deleteTarget.id, itemType: deleteTarget.itemType },
      });
      setSuccess(t.whProductDeleted);
      setDeleteTarget(null);
      if (editingProduct?.id === deleteTarget.id) {
        closeEditor();
      }
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

  const attemptDeleteRawMaterial = (
    rawMaterial: Extract<WarehouseProduct, { itemType: 'RAW_MATERIAL' }>,
  ) => {
    const qty = rawStockById.get(rawMaterial.id) ?? 0;
    if (qty > 0) {
      setBlockedDeleteTarget(rawMaterial);
      return;
    }
    setDeleteTarget(rawMaterial);
  };

  const renderEditorBody = () => (
    <form
      id="warehouse-product-form"
      data-warehouse-editor="true"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
            {t.whProductType}
          </label>
          <Select
            value={form.itemType}
            onValueChange={(value) => setFormType(value as ProductFormType)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-700/80 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="z-[120] max-h-72 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              {typeOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm focus:bg-indigo-50 focus:text-indigo-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 dark:focus:bg-indigo-950/40 dark:focus:text-indigo-100 dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-white"
                >
                  {option.label} ({option.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
            {t.labelName}
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {form.itemType === 'SEMI_PRODUCT' ? (
          <div>
            <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
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
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
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
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
            {t.labelDesc}
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
          />
        </div>
      </div>

      {form.itemType === 'SEMI_PRODUCT' ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.whIngredientsTitle}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.whIngredientsSubtitle}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addIngredientRow}>
              <Plus size={14} />
              {t.whAddIngredient}
            </Button>
          </div>

          <div className="space-y-3">
            {form.rawMaterials.map((item, index) => (
              <div
                key={`${index}-${item.rawMaterialId}`}
                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
              >
                <Select
                  value={item.rawMaterialId || '__none__'}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      rawMaterials: prev.rawMaterials.map((current, currentIndex) =>
                        currentIndex === index
                          ? {
                              ...current,
                              rawMaterialId: value === '__none__' ? '' : value,
                            }
                          : current,
                      ),
                    }))
                  }
                >
                  <SelectTrigger className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white">
                    <SelectValue placeholder={t.whSelectRawMaterial} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="z-[120] max-h-60 min-w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  >
                    <SelectItem
                      value="__none__"
                      className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm text-slate-500 focus:bg-slate-100 focus:text-slate-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 dark:text-slate-400 dark:focus:bg-slate-800 dark:focus:text-white dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-white"
                    >
                      {t.whSelectRawMaterial}
                    </SelectItem>
                    {rawMaterials.map((rawMaterial) => (
                      <SelectItem
                        key={rawMaterial.id}
                        value={rawMaterial.id}
                        className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm focus:bg-indigo-50 focus:text-indigo-900 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 dark:focus:bg-indigo-950/40 dark:focus:text-indigo-100 dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-white"
                      >
                        {rawMaterial.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.amountGram}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      rawMaterials: prev.rawMaterials.map((current, currentIndex) =>
                        currentIndex === index
                          ? { ...current, amountGram: e.target.value }
                          : current,
                      ),
                    }))
                  }
                  placeholder={t.whAmountGram}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeIngredientRow(index)}
                  aria-label={t.whRemoveIngredient}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
          {rawMaterials.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.whNoRawMaterials}
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              {t.whSemiSelectionTitle}
            </p>
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {semiProducts
                .filter((item) => item.id !== editingProduct?.id)
                .map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.semiProductIds.includes(item.id)}
                      onChange={() => toggleSelection('semiProductIds', item.id)}
                    />
                    <span className="flex-1 text-slate-700 dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatNumber(item.weightGram)} g
                    </span>
                  </label>
                ))}
              {semiProducts.filter((item) => item.id !== editingProduct?.id).length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.whNoSemiProducts}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              {t.whMachineSelectionTitle}
            </p>
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {availableFinalMachines.map((machine) => (
                <label
                  key={machine.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={form.machineIds.includes(machine.id)}
                    onChange={() => toggleSelection('machineIds', machine.id)}
                  />
                  <span className="flex-1 text-slate-700 dark:text-slate-200">
                    {machine.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {machine.isActive ? t.statusActive : t.statusCritical}
                  </span>
                </label>
              ))}
              {availableFinalMachines.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.whNoMachines}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={closeEditor}>
            {t.btnCancel}
          </Button>
          <Button type="submit" disabled={submitting}>
            {editingProduct ? <Save size={16} /> : <Plus size={16} />}
            {submitting ? t.authLoading : editingProduct ? t.btnSave : t.whAddProduct}
          </Button>
        </div>
      )}
    </form>
  );

  const overlayTitle = editingProduct ? t.whDrawerEditTitle : t.whDrawerCreateTitle;
  const overlayDescription = editingProduct
    ? t.whDrawerEditDescription
    : t.whDrawerCreateDescription;
  const handleEditorOpenChange = (open: boolean) => {
    setIsEditorOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {warehouseSummaryCards.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {warehouseSummaryCards.map((card) => (
            <div
              key={card.key}
              className={`rounded-2xl bg-gradient-to-br ${card.from} p-5 text-white shadow-lg ${card.shadow}`}
            >
              <card.icon size={20} className="mb-3 opacity-80" />
              <p className="mb-1 text-xs text-white/80">{card.label}</p>
              <p className="text-2xl font-bold">{card.val}</p>
              <p className="mt-1 text-xs text-white/70">{card.sub}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          {t.whStockBreakdownEmpty}
        </p>
      )}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t.whDetailed}
        </h3>
        {hasAnyStockDetailCard ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hasCatalogRaw && (
              <StockItem
                label={t.whMaterial}
                value={rawMaterialStock}
                max={5000}
                unit={t.unitKg}
                color={rawMaterialStock < 1000 ? 'bg-amber-500' : 'bg-blue-500'}
                bgColor="bg-blue-100 dark:bg-blue-900/30"
                icon={<Droplets size={18} className="text-blue-600 dark:text-blue-400" />}
                warning={rawMaterialStock < 1000}
                maxLabel={t.whMaxLabel}
              />
            )}
            {hasCatalogSemi18 && (
              <StockItem
                label={t.whSemi18Label}
                value={semiProductStock['18g']}
                max={100000}
                unit={t.unitPiece}
                color="bg-purple-500"
                bgColor="bg-purple-100 dark:bg-purple-900/30"
                icon={<Factory size={18} className="text-purple-600 dark:text-purple-400" />}
                maxLabel={t.whMaxLabel}
              />
            )}
            {hasCatalogSemi20 && (
              <StockItem
                label={t.whSemi20Label}
                value={semiProductStock['20g']}
                max={60000}
                unit={t.unitPiece}
                color="bg-violet-500"
                bgColor="bg-violet-100 dark:bg-violet-900/30"
                icon={<Factory size={18} className="text-violet-600 dark:text-violet-400" />}
                maxLabel={t.whMaxLabel}
              />
            )}
            {hasCatalogFinal05 && (
              <StockItem
                label={t.whFinal05Label}
                value={finalProductStock['0.5L']}
                max={20000}
                unit={t.unitPiece}
                color="bg-cyan-500"
                bgColor="bg-cyan-100 dark:bg-cyan-900/30"
                icon={<Package size={18} className="text-cyan-600 dark:text-cyan-400" />}
                maxLabel={t.whMaxLabel}
              />
            )}
            {hasCatalogFinal1 && (
              <StockItem
                label={t.whFinal1Label}
                value={finalProductStock['1L']}
                max={15000}
                unit={t.unitPiece}
                color="bg-teal-500"
                bgColor="bg-teal-100 dark:bg-teal-900/30"
                icon={<Package size={18} className="text-teal-600 dark:text-teal-400" />}
                maxLabel={t.whMaxLabel}
              />
            )}
            {hasCatalogFinal5 && (
              <StockItem
                label={t.whFinal5Label}
                value={finalProductStock['5L']}
                max={5000}
                unit={t.unitPiece}
                color="bg-blue-500"
                bgColor="bg-blue-100 dark:bg-blue-900/30"
                icon={<Package size={18} className="text-blue-600 dark:text-blue-400" />}
                maxLabel={t.whMaxLabel}
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.whStockBreakdownEmpty}</p>
        )}
      </div>

      {(hasCatalogSemi || hasCatalogFinal) && (
        <div
          className={`grid grid-cols-1 gap-6 ${hasCatalogSemi && hasCatalogFinal ? 'lg:grid-cols-2' : ''}`}
        >
          {hasCatalogSemi && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {t.whSemiStats}
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: t.whProduced,
                    value: totalSemiProduced,
                    color: 'text-purple-600 dark:text-purple-400',
                  },
                  {
                    label: t.whUsedInFinal,
                    value: state.finalProductBatches.reduce(
                      (sum, batch) => sum + batch.semiProductUsed,
                      0,
                    ),
                    color: 'text-cyan-600 dark:text-cyan-400',
                  },
                  {
                    label: t.whSold,
                    value: totalSemiSold,
                    color: 'text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    label: t.whRemaining,
                    value: totalSemiInCatalogStock,
                    color: 'text-slate-800 dark:text-white',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0 dark:border-slate-700"
                  >
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                    <span className={`text-sm font-bold ${item.color}`}>
                      {formatNumber(item.value)} {t.unitPiece}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasCatalogFinal && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center gap-2">
                <TrendingDown size={16} className="text-cyan-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {t.whFinalStats}
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: t.whProduced,
                    value: totalFinalProduced,
                    color: 'text-cyan-600 dark:text-cyan-400',
                  },
                  {
                    label: t.whSold,
                    value: totalFinalSold,
                    color: 'text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    label: t.whRemaining,
                    value: totalFinalInCatalogStock,
                    color: 'text-slate-800 dark:text-white',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0 dark:border-slate-700"
                  >
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                    <span className={`text-sm font-bold ${item.color}`}>
                      {formatNumber(item.value)} {t.unitPiece}
                    </span>
                  </div>
                ))}
                <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-700">
                  <p className="mb-2 text-xs text-slate-400">{t.whByType}</p>
                  {[
                    ...(hasCatalogFinal05
                      ? [
                          {
                            label: t.whFinal05Label,
                            value: finalProductStock['0.5L'],
                          },
                        ]
                      : []),
                    ...(hasCatalogFinal1
                      ? [{ label: t.whFinal1Label, value: finalProductStock['1L'] }]
                      : []),
                    ...(hasCatalogFinal5
                      ? [{ label: t.whFinal5Label, value: finalProductStock['5L'] }]
                      : []),
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1">
                      <span className="text-xs text-slate-500">{item.label}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formatNumber(item.value)} {t.unitPiece}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(error || success) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? 'border-red-200 text-red-600 dark:border-red-900 dark:text-red-400'
              : 'border-emerald-200 text-emerald-600 dark:border-emerald-900 dark:text-emerald-400'
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.whRawMaterialListTitle}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {rawMaterials.length} {t.totalRecords}
          </p>
        </div>

        {rawMaterials.length === 0 ? (
          <div className="flex h-28 items-center justify-center px-4 text-sm text-slate-500 dark:text-slate-400">
            {t.whNoRawMaterials}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {rawMaterials.map((rawMaterial) => (
              <div
                key={rawMaterial.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {rawMaterial.name}
                    </p>
                    <span className="inline-flex items-center rounded-lg bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {t.whMaterial}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {t.whUnit}: {rawMaterial.unit}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {auditLine(rawMaterial, t)}
                  </p>
                  {rawMaterial.description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {rawMaterial.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t.whIncludedInWarehouse}
                  </div>
                  {canManage && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => attemptDeleteRawMaterial(rawMaterial)}
                    >
                      <Trash2 size={14} />
                      {t.suDelete}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.whProductsList}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {filteredProducts.length} {t.totalRecords}
            </p>
          </div>
          {canManage ? (
            <Button onClick={openCreate}>
              <Plus size={16} />
              {t.whAddProduct}
            </Button>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.whManageReadOnly}
            </p>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex h-40 items-center justify-center px-4 text-sm text-slate-500 dark:text-slate-400">
            {t.whNoProducts}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 sm:p-5 lg:flex-row lg:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {product.name}
                    </p>
                    <span className="inline-flex items-center rounded-lg bg-indigo-100 px-2 py-1 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {product.itemType === 'SEMI_PRODUCT' ? t.whSemi : t.whFinal}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {productMetric(product, t)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {auditLine(product, t)}
                  </p>
                  {product.description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {product.description}
                    </p>
                  )}
                </div>
                {canManage && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => startEdit(product)}
                    >
                      <Pencil size={14} />
                      {t.whEdit}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteTarget(product)}
                    >
                      <Trash2 size={14} />
                      {t.suDelete}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isMobile ? (
        <Drawer open={isEditorOpen} onOpenChange={handleEditorOpenChange} direction="right">
          <DrawerContent className="right-0 h-full w-full max-w-md border-l">
            <DrawerHeader>
              <DrawerTitle>{overlayTitle}</DrawerTitle>
              <DrawerDescription>{overlayDescription}</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">{renderEditorBody()}</div>
            <DrawerFooter>
              <Button type="button" variant="outline" onClick={closeEditor}>
                {t.btnCancel}
              </Button>
              <Button
                type="submit"
                form="warehouse-product-form"
                disabled={submitting}
              >
                {editingProduct ? <Save size={16} /> : <Plus size={16} />}
                {submitting ? t.authLoading : editingProduct ? t.btnSave : t.whAddProduct}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isEditorOpen} onOpenChange={handleEditorOpenChange}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{overlayTitle}</DialogTitle>
              <DialogDescription>{overlayDescription}</DialogDescription>
            </DialogHeader>
            {renderEditorBody()}
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.whDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.whDeleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.btnCancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t.whDeleteAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(blockedDeleteTarget)}
        onOpenChange={(open) => !open && setBlockedDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.whDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.whErrDeleteStockRemains}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.btnCancel}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
