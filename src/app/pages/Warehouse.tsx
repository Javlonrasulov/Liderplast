import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Boxes,
  Droplets,
  Factory,
  LayoutGrid,
  Package,
  PieChart,
  Palette,
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
  computeRawMaterialStockByKind,
  type FinishedProductCatalogItem,
  type RawMaterialKind,
  type SemiProductCatalogItem,
  useERP,
  type WarehouseProduct,
} from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { calcPercent, formatDate, formatNumber } from '../utils/format';
import { translateWarehouseApiError } from '../utils/warehouse-api-errors';
import {
  finalBucketFromCatalog,
  inferVolumeLiterFromFinishedProductName,
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
  rawMaterials: Array<{
    rawMaterialId: string;
    amountGram: string;
  }>;
  semiProductIds: string[];
  machineIds: string[];
};

type RawMaterialEditState = {
  name: string;
  description: string;
  defaultBagWeightKg: string;
  rawMaterialKind: RawMaterialKind;
};

const DEFAULT_FORM: ProductFormState = {
  itemType: 'SEMI_PRODUCT',
  name: '',
  description: '',
  weightGram: '',
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
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  warning?: boolean;
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
    const machineCount = product.machines.length;
    return `${t.whWeightGram}: ${formatNumber(product.weightGram)} g, ${recipeCount} ${t.whIngredientsShort}${
      machineCount > 0 ? `, ${machineCount} ${t.whMachinesShort}` : ''
    }`;
  }
  if (product.itemType === 'FINISHED_PRODUCT') {
    return `${t.unitPiece} · ${product.semiProducts.length} ${t.whSemiShort}, ${product.machines.length} ${t.whMachinesShort}`;
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

const SEMI_DETAIL_CARD_STYLES = [
  {
    color: 'bg-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    color: 'bg-violet-500',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    color: 'bg-fuchsia-500',
    bgColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
] as const;

const FINAL_DETAIL_CARD_STYLES = [
  {
    color: 'bg-cyan-500',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    color: 'bg-teal-500',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    color: 'bg-sky-500',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
] as const;

export function Warehouse() {
  const {
    state,
    semiProductStock,
    finalProductStock,
    semiStockByProductName,
    finalStockByProductName,
    dispatch,
  } = useERP();
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
  const [editingRawMaterial, setEditingRawMaterial] =
    useState<Extract<WarehouseProduct, { itemType: 'RAW_MATERIAL' }> | null>(null);
  const [rawMaterialForm, setRawMaterialForm] = useState<RawMaterialEditState>({
    name: '',
    description: '',
    defaultBagWeightKg: '',
    rawMaterialKind: 'SIRO',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [whTab, setWhTab] = useState<'overview' | 'catalog' | 'statistics'>('overview');

  const canManage = user?.role === 'ADMIN' || user?.role === 'DIRECTOR';
  const rawMaterials = useMemo(
    () =>
      state.warehouseProducts.filter(
        (item): item is Extract<WarehouseProduct, { itemType: 'RAW_MATERIAL' }> =>
          item.itemType === 'RAW_MATERIAL',
      ),
    [state.warehouseProducts],
  );

  const siroRawMaterials = useMemo(
    () => rawMaterials.filter((r) => r.rawMaterialKind !== 'PAINT'),
    [rawMaterials],
  );
  const paintRawMaterials = useMemo(
    () => rawMaterials.filter((r) => r.rawMaterialKind === 'PAINT'),
    [rawMaterials],
  );

  const rawStockByKind = useMemo(
    () =>
      computeRawMaterialStockByKind(
        state.rawMaterialEntries,
        state.warehouseProducts,
      ),
    [state.rawMaterialEntries, state.warehouseProducts],
  );

  const rawStockByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of state.warehouseStock ?? []) {
      if (item.itemType === 'RAW_MATERIAL' && item.itemName) {
        map.set(item.itemName, item.quantity);
      }
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

  const semiRecipePaintBreakdown = useMemo(() => {
    if (semiProducts.length === 0) return [];
    return semiProducts.map((semi) => {
      const stockQty =
        state.warehouseStock.find(
          (s) => s.itemType === 'SEMI_PRODUCT' && s.itemName === semi.name,
        )?.quantity ?? 0;
      const recipeLines = semi.rawMaterials.map((rm) => {
        const kgPerUnit = rm.amountGram / 1000;
        return {
          name: rm.name,
          unit: rm.unit,
          estKg: stockQty * kgPerUnit,
        };
      });
      const paintTotals = new Map<string, number>();
      for (const r of state.shiftRecords) {
        if (
          r.productType === semi.name &&
          r.paintUsed &&
          (r.paintQuantityKg ?? 0) > 0 &&
          r.paintRawMaterialName
        ) {
          const key = r.paintRawMaterialName;
          paintTotals.set(key, (paintTotals.get(key) ?? 0) + (r.paintQuantityKg ?? 0));
        }
      }
      return {
        semiName: semi.name,
        stockQty,
        recipeLines,
        paintTotals: [...paintTotals.entries()],
      };
    });
  }, [semiProducts, state.warehouseStock, state.shiftRecords]);

  const hasCatalogSiro = siroRawMaterials.length > 0;
  const hasCatalogPaint = paintRawMaterials.length > 0;
  const hasCatalogRaw = hasCatalogSiro || hasCatalogPaint;
  const hasCatalogSemi = semiProducts.length > 0;
  const hasCatalogFinal = finishedProducts.length > 0;

  const totalSemiInCatalogStock = useMemo(
    () => semiProducts.reduce((sum, p) => sum + (semiStockByProductName[p.name] ?? 0), 0),
    [semiProducts, semiStockByProductName],
  );
  const totalFinalInCatalogStock = useMemo(
    () =>
      finishedProducts.reduce((sum, p) => sum + (finalStockByProductName[p.name] ?? 0), 0),
    [finishedProducts, finalStockByProductName],
  );
  const totalPiecesInCatalogStock =
    totalSemiInCatalogStock + totalFinalInCatalogStock;

  const hasAnyStockDetailCard =
    hasCatalogSiro || hasCatalogPaint || hasCatalogSemi || hasCatalogFinal;

  const warehouseSummaryCards = useMemo(() => {
    const cards: Array<{
      key: string;
      label: string;
      sub: string;
      val: string;
      from: string;
      shadow: string;
      icon: React.ComponentType<{ size?: number; className?: string }>;
    }> = [];
    if (hasCatalogSiro) {
      cards.push({
        key: 'raw-siro',
        label: t.rmMetricsCaptionSiro,
        sub: `${calcPercent(rawStockByKind.siro, 5000).toFixed(0)}% ${t.whInWarehouse}`,
        val: `${formatNumber(rawStockByKind.siro)} ${t.unitKg}`,
        from: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-200 dark:shadow-blue-900/30',
        icon: Droplets,
      });
    }
    if (hasCatalogPaint) {
      cards.push({
        key: 'raw-paint',
        label: t.rmMetricsCaptionPaint,
        sub: `${calcPercent(rawStockByKind.paint, 2000).toFixed(0)}% ${t.whInWarehouse}`,
        val: `${formatNumber(rawStockByKind.paint)} ${t.unitKg}`,
        from: 'from-fuchsia-500 to-pink-600',
        shadow: 'shadow-fuchsia-200 dark:shadow-fuchsia-900/30',
        icon: Palette,
      });
    }
    if (hasCatalogSemi) {
      const sub =
        semiProducts.length <= 2
          ? semiProducts.map((p) => p.name).join(' · ')
          : `${semiProducts.length} ${t.whSemiShort}`;
      cards.push({
        key: 'semi',
        label: t.whSemi,
        sub,
        val: `${formatNumber(totalSemiInCatalogStock)} ${t.unitPiece}`,
        from: 'from-purple-500 to-purple-600',
        shadow: 'shadow-purple-200 dark:shadow-purple-900/30',
        icon: Factory,
      });
    }
    if (hasCatalogFinal) {
      const sub =
        finishedProducts.length <= 2
          ? finishedProducts.map((p) => p.name).join(' · ')
          : `${finishedProducts.length} ${t.whFinal}`;
      cards.push({
        key: 'final',
        label: t.whFinal,
        sub,
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
    hasCatalogSiro,
    hasCatalogPaint,
    hasCatalogSemi,
    hasCatalogFinal,
    semiProducts,
    finishedProducts,
    rawStockByKind.siro,
    rawStockByKind.paint,
    totalSemiInCatalogStock,
    totalFinalInCatalogStock,
    totalPiecesInCatalogStock,
    t,
  ]);

  /** Tayyor mahsulot: barcha apparatlar ko‘rinadi; qaysilarida ish olib borilishi checkbox bilan belgilanadi */
  const machinesForFinishedProductList = useMemo(
    () => [...state.machines].sort((a, b) => a.name.localeCompare(b.name)),
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
  /** Бир нечта позицияли буюртмаларда категория бўйича тўғри йиғинди */
  const totalSemiSold = useMemo(() => {
    let sum = 0;
    for (const sale of state.sales) {
      if (sale.items?.length) {
        for (const line of sale.items) {
          if (line.productCategory === 'semi') sum += line.quantity;
        }
      } else if (sale.productCategory === 'semi') {
        sum += sale.quantity;
      }
    }
    return sum;
  }, [state.sales]);
  const totalFinalSold = useMemo(() => {
    let sum = 0;
    for (const sale of state.sales) {
      if (sale.items?.length) {
        for (const line of sale.items) {
          if (line.productCategory === 'final') sum += line.quantity;
        }
      } else if (sale.productCategory === 'final') {
        sum += sale.quantity;
      }
    }
    return sum;
  }, [state.sales]);

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
        product.itemType === 'SEMI_PRODUCT' || product.itemType === 'FINISHED_PRODUCT'
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
      machineIds: prev.machineIds,
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
      if (form.machineIds.length === 0) {
        throw new Error(t.whMachineRequired);
      }

      return {
        itemType: 'SEMI_PRODUCT' as const,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        weightGram,
        relations: {
          rawMaterials: rawMaterialsPayload,
          machineIds: form.machineIds,
        },
      };
    }

    if (form.semiProductIds.length === 0) {
      throw new Error(t.whSemiProductRequired);
    }
    if (form.machineIds.length === 0) {
      throw new Error(t.whMachineRequired);
    }

    const volumeLiter =
      editingProduct?.itemType === 'FINISHED_PRODUCT'
        ? editingProduct.volumeLiter
        : inferVolumeLiterFromFinishedProductName(form.name.trim()) ?? 1;

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
    const qty = rawStockByName.get(rawMaterial.name) ?? 0;
    if (qty > 0) {
      setBlockedDeleteTarget(rawMaterial);
      return;
    }
    setDeleteTarget(rawMaterial);
  };

  const openRawMaterialEdit = (
    rawMaterial: Extract<WarehouseProduct, { itemType: 'RAW_MATERIAL' }>,
  ) => {
    setEditingRawMaterial(rawMaterial);
    setRawMaterialForm({
      name: rawMaterial.name,
      description: rawMaterial.description ?? '',
      defaultBagWeightKg:
        rawMaterial.defaultBagWeightKg != null
          ? String(rawMaterial.defaultBagWeightKg)
          : '',
      rawMaterialKind: rawMaterial.rawMaterialKind ?? 'SIRO',
    });
    setError('');
    setSuccess('');
  };

  const closeRawMaterialEdit = () => {
    setEditingRawMaterial(null);
    setRawMaterialForm({
      name: '',
      description: '',
      defaultBagWeightKg: '',
      rawMaterialKind: 'SIRO',
    });
  };

  const handleRawMaterialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingRawMaterial) return;

    setError('');
    setSuccess('');

    const defaultBagWeightKg = Number(
      rawMaterialForm.defaultBagWeightKg.replace(',', '.'),
    );
    if (!rawMaterialForm.name.trim()) {
      setError(t.whNameRequired);
      return;
    }
    if (!Number.isFinite(defaultBagWeightKg) || defaultBagWeightKg <= 0) {
      setError(t.rmDefaultBagWeightRequired);
      return;
    }

    setSubmitting(true);
    try {
      await dispatch({
        type: 'UPDATE_WAREHOUSE_PRODUCT',
        payload: {
          id: editingRawMaterial.id,
          currentItemType: 'RAW_MATERIAL',
          itemType: 'RAW_MATERIAL',
          name: rawMaterialForm.name.trim(),
          description: rawMaterialForm.description.trim() || undefined,
          unit: editingRawMaterial.unit,
          rawMaterialKind: rawMaterialForm.rawMaterialKind,
          defaultBagWeightKg,
        },
      });
      setSuccess(t.whProductUpdated);
      closeRawMaterialEdit();
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

      {form.itemType === 'SEMI_PRODUCT' ? (
        <div className="grid gap-4 md:grid-cols-2">
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
      ) : (
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
      )}

      {form.itemType === 'SEMI_PRODUCT' ? (
        <>
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

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            {t.whMachineSelectionTitle}
          </p>
          <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {machinesForFinishedProductList.map((machine) => (
              <label
                key={machine.id}
                className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
              >
                <input
                  type="checkbox"
                  className="mt-1 shrink-0"
                  checked={form.machineIds.includes(machine.id)}
                  onChange={() => toggleSelection('machineIds', machine.id)}
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-slate-900 dark:text-white">{machine.name}</span>
                    <span
                      className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        machine.type === 'final'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200'
                      }`}
                    >
                      {machine.type === 'final' ? t.whFinal : t.whSemi}
                    </span>
                  </div>
                  {machine.description?.trim() ? (
                    <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">
                      {machine.description}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 self-start text-xs text-slate-400">
                  {machine.isActive ? t.statusActive : t.statusCritical}
                </span>
              </label>
            ))}
            {machinesForFinishedProductList.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t.whNoMachines}
              </p>
            )}
          </div>
        </div>
        </>
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
              {machinesForFinishedProductList.map((machine) => (
                <label
                  key={machine.id}
                  className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
                >
                  <input
                    type="checkbox"
                    className="mt-1 shrink-0"
                    checked={form.machineIds.includes(machine.id)}
                    onChange={() => toggleSelection('machineIds', machine.id)}
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium text-slate-900 dark:text-white">{machine.name}</span>
                      <span
                        className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          machine.type === 'final'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200'
                        }`}
                      >
                        {machine.type === 'final' ? t.whFinal : t.whSemi}
                      </span>
                    </div>
                    {machine.description?.trim() ? (
                      <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">
                        {machine.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 self-start text-xs text-slate-400">
                    {machine.isActive ? t.statusActive : t.statusCritical}
                  </span>
                </label>
              ))}
              {machinesForFinishedProductList.length === 0 && (
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
  const rawMaterialOverlayTitle = `${t.whEdit}: ${t.whMaterial}`;
  const handleEditorOpenChange = (open: boolean) => {
    setIsEditorOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 lg:p-6 flex flex-col gap-6 dark:bg-slate-950">
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700 -mx-1 px-1 min-[400px]:mx-0 min-[400px]:px-0">
          <button
            type="button"
            onClick={() => setWhTab('overview')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 min-[400px]:px-3 sm:px-4 py-2 min-[400px]:py-3 text-xs min-[400px]:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${whTab === 'overview' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <BarChart3 size={14} className="shrink-0" />
            <span className="truncate max-w-[9rem] min-[360px]:max-w-none">{t.whTabOverview}</span>
          </button>
          <button
            type="button"
            onClick={() => setWhTab('catalog')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 min-[400px]:px-3 sm:px-4 py-2 min-[400px]:py-3 text-xs min-[400px]:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${whTab === 'catalog' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <LayoutGrid size={14} className="shrink-0" />
            <span className="truncate max-w-[9rem] min-[360px]:max-w-none">{t.whTabCatalog}</span>
          </button>
          <button
            type="button"
            onClick={() => setWhTab('statistics')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 min-[400px]:px-3 sm:px-4 py-2 min-[400px]:py-3 text-xs min-[400px]:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${whTab === 'statistics' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <PieChart size={14} className="shrink-0" />
            <span className="truncate max-w-[9rem] min-[360px]:max-w-none">{t.whTabStats}</span>
          </button>
        </div>

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

        {whTab === 'overview' && (
          <>
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
            {hasCatalogSiro && (
              <StockItem
                label={t.rmMetricsCaptionSiro}
                value={rawStockByKind.siro}
                max={5000}
                unit={t.unitKg}
                color={rawStockByKind.siro < 1000 ? 'bg-amber-500' : 'bg-blue-500'}
                bgColor="bg-blue-100 dark:bg-blue-900/30"
                icon={<Droplets size={18} className="text-blue-600 dark:text-blue-400" />}
                warning={rawStockByKind.siro < 1000}
              />
            )}
            {hasCatalogPaint && (
              <StockItem
                label={t.rmMetricsCaptionPaint}
                value={rawStockByKind.paint}
                max={2000}
                unit={t.unitKg}
                color={rawStockByKind.paint < 200 ? 'bg-amber-500' : 'bg-fuchsia-500'}
                bgColor="bg-fuchsia-100 dark:bg-fuchsia-900/30"
                icon={<Palette size={18} className="text-fuchsia-600 dark:text-fuchsia-400" />}
                warning={rawStockByKind.paint < 200}
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
              />
            )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.whStockBreakdownEmpty}</p>
              )}
            </div>

          </>
        )}

        {whTab === 'statistics' && (
          <>
      {semiRecipePaintBreakdown.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-violet-50/90 via-white to-white shadow-md ring-1 ring-slate-900/5 dark:border-slate-600 dark:from-violet-950/25 dark:via-slate-800 dark:to-slate-800">
          <div className="border-b border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 shadow-inner dark:bg-violet-900/50">
                <Factory className="h-5 w-5 text-violet-600 dark:text-violet-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                  {t.whSemiBreakdownTitle}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {semiRecipePaintBreakdown.length} {t.totalRecords}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            {semiRecipePaintBreakdown.map((row) => (
              <div
                key={row.semiName}
                className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-900/50"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.semiName}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/25">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700/90 dark:text-emerald-400/90">
                      {t.whSemiStockPieces}
                    </p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-emerald-900 dark:text-emerald-100">
                      {formatNumber(row.stockQty)}{' '}
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {t.unitPiece}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-3 dark:border-slate-600 dark:bg-slate-800/60">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t.whRecipeRaw}
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {row.recipeLines.length === 0 ? (
                        <li className="text-slate-400">—</li>
                      ) : (
                        row.recipeLines.map((line) => (
                          <li
                            key={line.name}
                            className="flex justify-between gap-2 rounded-md bg-white/80 px-2 py-1 dark:bg-slate-900/40"
                          >
                            <span className="min-w-0 truncate font-medium">{line.name}</span>
                            <span className="shrink-0 tabular-nums text-slate-600 dark:text-slate-400">
                              ~{formatNumber(line.estKg)} {t.unitKg}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
                {row.paintTotals.length > 0 && (
                  <div className="mt-3 rounded-lg border border-fuchsia-200/90 bg-fuchsia-50/70 p-3 dark:border-fuchsia-900/40 dark:bg-fuchsia-950/20">
                    <div className="mb-2 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-fuchsia-800 dark:text-fuchsia-300">
                        {t.whShiftPaintTotal}
                      </p>
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {row.paintTotals.map(([name, kg]) => (
                        <li
                          key={name}
                          className="flex justify-between gap-2 rounded-md bg-white/90 px-2 py-1.5 dark:bg-slate-900/50"
                        >
                          <span className="min-w-0 truncate font-medium text-slate-800 dark:text-slate-200">
                            {name}
                          </span>
                          <span className="shrink-0 tabular-nums font-semibold text-fuchsia-800 dark:text-fuchsia-200">
                            {formatNumber(kg)} {t.unitKg}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

          </>
        )}

        {whTab === 'catalog' && (
          <>
      <div className="flex flex-col-reverse gap-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-sky-50/80 via-white to-white shadow-md ring-1 ring-slate-900/5 dark:border-slate-600 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
        <div className="border-b border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 shadow-inner dark:bg-sky-900/40">
              <Droplets className="h-5 w-5 text-sky-600 dark:text-sky-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                {t.whRawMaterialListTitle}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {rawMaterials.length} {t.totalRecords}
                {hasCatalogSiro && hasCatalogPaint
                  ? ` · ${t.rmMetricsCaptionSiro}: ${siroRawMaterials.length} · ${t.rmMetricsCaptionPaint}: ${paintRawMaterials.length}`
                  : ''}
              </p>
            </div>
          </div>
        </div>

        {rawMaterials.length === 0 ? (
          <div className="flex min-h-[7rem] items-center justify-center px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
            {t.whNoRawMaterials}
          </div>
        ) : (
          <div className="space-y-8 p-4 sm:p-5">
            {siroRawMaterials.length > 0 && (
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200/80 bg-blue-50/70 px-3 py-2.5 dark:border-blue-900/40 dark:bg-blue-950/30">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {t.rmMetricsCaptionSiro}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 shadow-sm dark:bg-blue-900/50 dark:text-blue-200">
                    {siroRawMaterials.length} {t.totalRecords}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {siroRawMaterials.map((rawMaterial) => (
                    <div
                      key={rawMaterial.id}
                      className="flex h-full flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-600 dark:bg-slate-900/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <p className="min-w-0 flex-1 font-semibold leading-snug text-slate-900 dark:text-white">
                            {rawMaterial.name}
                          </p>
                          <span className="inline-flex shrink-0 items-center rounded-lg bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                            {t.rmKindSiro}
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          {t.whUnit}: {rawMaterial.unit}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {rawMaterial.defaultBagWeightKg
                            ? `${t.rmDefaultBagWeight}: ${formatNumber(rawMaterial.defaultBagWeightKg)} ${t.unitKg}`
                            : t.rmDefaultBagWeightHint}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">{auditLine(rawMaterial, t)}</p>
                        {rawMaterial.description && (
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            {rawMaterial.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
                        <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                          {t.whIncludedInWarehouse}
                        </p>
                        {canManage && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-none"
                              onClick={() => openRawMaterialEdit(rawMaterial)}
                            >
                              <Pencil size={14} />
                              {t.whEdit}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="flex-1 sm:flex-none"
                              onClick={() => attemptDeleteRawMaterial(rawMaterial)}
                            >
                              <Trash2 size={14} />
                              {t.suDelete}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {paintRawMaterials.length > 0 && (
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-fuchsia-200/80 bg-fuchsia-50/70 px-3 py-2.5 dark:border-fuchsia-900/40 dark:bg-fuchsia-950/25">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                    <span className="text-sm font-semibold text-fuchsia-900 dark:text-fuchsia-100">
                      {t.rmMetricsCaptionPaint}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-fuchsia-900 shadow-sm dark:bg-fuchsia-900/50 dark:text-fuchsia-100">
                    {paintRawMaterials.length} {t.totalRecords}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {paintRawMaterials.map((rawMaterial) => (
                    <div
                      key={rawMaterial.id}
                      className="flex h-full flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-600 dark:bg-slate-900/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <p className="min-w-0 flex-1 font-semibold leading-snug text-slate-900 dark:text-white">
                            {rawMaterial.name}
                          </p>
                          <span className="inline-flex shrink-0 items-center rounded-lg bg-fuchsia-100 px-2 py-0.5 text-[11px] font-medium text-fuchsia-900 dark:bg-fuchsia-900/40 dark:text-fuchsia-200">
                            {t.rmKindPaint}
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          {t.whUnit}: {rawMaterial.unit}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {rawMaterial.defaultBagWeightKg
                            ? `${t.rmDefaultBagWeight}: ${formatNumber(rawMaterial.defaultBagWeightKg)} ${t.unitKg}`
                            : t.rmDefaultBagWeightHint}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">{auditLine(rawMaterial, t)}</p>
                        {rawMaterial.description && (
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            {rawMaterial.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
                        <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                          {t.whIncludedInWarehouse}
                        </p>
                        {canManage && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-none"
                              onClick={() => openRawMaterialEdit(rawMaterial)}
                            >
                              <Pencil size={14} />
                              {t.whEdit}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="flex-1 sm:flex-none"
                              onClick={() => attemptDeleteRawMaterial(rawMaterial)}
                            >
                              <Trash2 size={14} />
                              {t.suDelete}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-indigo-50/70 via-white to-white shadow-md ring-1 ring-slate-900/5 dark:border-slate-600 dark:from-indigo-950/20 dark:via-slate-800 dark:to-slate-800">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 shadow-inner dark:bg-indigo-900/40">
              <Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                {t.whProductsList}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {filteredProducts.length} {t.totalRecords}
              </p>
            </div>
          </div>
          {canManage ? (
            <Button onClick={openCreate} className="w-full shrink-0 sm:w-auto">
              <Plus size={16} />
              {t.whAddProduct}
            </Button>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.whManageReadOnly}</p>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex min-h-[10rem] items-center justify-center px-4 py-10 text-sm text-slate-500 dark:text-slate-400">
            {t.whNoProducts}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex h-full flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-indigo-200/80 hover:shadow-md dark:border-slate-600 dark:bg-slate-900/40 dark:hover:border-indigo-900/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-2">
                    <p className="min-w-0 flex-1 font-semibold leading-snug text-slate-900 dark:text-white">
                      {product.name}
                    </p>
                    <span className="inline-flex shrink-0 items-center rounded-lg bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                      {product.itemType === 'SEMI_PRODUCT' ? t.whSemi : t.whFinal}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {productMetric(product, t)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">{auditLine(product, t)}</p>
                  {product.description && (
                    <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {product.description}
                    </p>
                  )}
                </div>
                {canManage && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => startEdit(product)}
                    >
                      <Pencil size={14} />
                      {t.whEdit}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="flex-1"
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
      </div>
          </>
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

      {isMobile ? (
        <Drawer
          open={Boolean(editingRawMaterial)}
          onOpenChange={(open) => !open && closeRawMaterialEdit()}
          direction="right"
        >
          <DrawerContent className="right-0 h-full w-full max-w-md border-l">
            <DrawerHeader>
              <DrawerTitle>{rawMaterialOverlayTitle}</DrawerTitle>
              <DrawerDescription>{t.rmDefaultBagWeightHint}</DrawerDescription>
            </DrawerHeader>
            <form
              id="warehouse-raw-material-form"
              onSubmit={handleRawMaterialSubmit}
              className="space-y-5 overflow-y-auto px-4 pb-4"
            >
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.labelName}
                </label>
                <input
                  value={rawMaterialForm.name}
                  onChange={(e) =>
                    setRawMaterialForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.rmKindLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRawMaterialForm((prev) => ({ ...prev, rawMaterialKind: 'SIRO' }))
                    }
                    className={`flex-1 min-w-[7rem] rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                      rawMaterialForm.rawMaterialKind === 'SIRO'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {t.rmKindSiro}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRawMaterialForm((prev) => ({ ...prev, rawMaterialKind: 'PAINT' }))
                    }
                    className={`flex-1 min-w-[7rem] rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                      rawMaterialForm.rawMaterialKind === 'PAINT'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {t.rmKindPaint}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.rmDefaultBagWeight}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={rawMaterialForm.defaultBagWeightKg}
                  onChange={(e) =>
                    setRawMaterialForm((prev) => ({
                      ...prev,
                      defaultBagWeightKg: e.target.value,
                    }))
                  }
                  placeholder={t.rmDefaultBagWeightPlaceholder}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
                />
                <p className="mt-1 text-xs text-slate-400">{t.rmDefaultBagWeightHint}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.labelDesc}
                </label>
                <textarea
                  rows={3}
                  value={rawMaterialForm.description}
                  onChange={(e) =>
                    setRawMaterialForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
                />
              </div>
            </form>
            <DrawerFooter>
              <Button type="button" variant="outline" onClick={closeRawMaterialEdit}>
                {t.btnCancel}
              </Button>
              <Button
                type="submit"
                form="warehouse-raw-material-form"
                disabled={submitting}
              >
                <Save size={16} />
                {submitting ? t.authLoading : t.btnSave}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={Boolean(editingRawMaterial)}
          onOpenChange={(open) => !open && closeRawMaterialEdit()}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{rawMaterialOverlayTitle}</DialogTitle>
              <DialogDescription>{t.rmDefaultBagWeightHint}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRawMaterialSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.labelName}
                </label>
                <input
                  value={rawMaterialForm.name}
                  onChange={(e) =>
                    setRawMaterialForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.rmKindLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRawMaterialForm((prev) => ({ ...prev, rawMaterialKind: 'SIRO' }))
                    }
                    className={`flex-1 min-w-[7rem] rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                      rawMaterialForm.rawMaterialKind === 'SIRO'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {t.rmKindSiro}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRawMaterialForm((prev) => ({ ...prev, rawMaterialKind: 'PAINT' }))
                    }
                    className={`flex-1 min-w-[7rem] rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                      rawMaterialForm.rawMaterialKind === 'PAINT'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {t.rmKindPaint}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.rmDefaultBagWeight}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={rawMaterialForm.defaultBagWeightKg}
                  onChange={(e) =>
                    setRawMaterialForm((prev) => ({
                      ...prev,
                      defaultBagWeightKg: e.target.value,
                    }))
                  }
                  placeholder={t.rmDefaultBagWeightPlaceholder}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
                />
                <p className="mt-1 text-xs text-slate-400">{t.rmDefaultBagWeightHint}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
                  {t.labelDesc}
                </label>
                <textarea
                  rows={3}
                  value={rawMaterialForm.description}
                  onChange={(e) =>
                    setRawMaterialForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={closeRawMaterialEdit}>
                  {t.btnCancel}
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save size={16} />
                  {submitting ? t.authLoading : t.btnSave}
                </Button>
              </div>
            </form>
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
                                                                          