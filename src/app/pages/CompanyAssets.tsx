import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  FileSpreadsheet,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Building2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../i18n/app-context';
import { useERP } from '../store/erp-store';
import { useAuth } from '../auth/auth-context';
import { apiRequest } from '../api/http';
import { useCbuRates } from '../hooks/use-cbu-rates';
import { cbuUsdRate, cbuEurRate } from '../utils/sales-currency';
import {
  displayGroupedIntInput,
  formatCurrency,
  formatDate,
  formatDateTime,
  parseDigitsFromAmountInput,
  todayYmd,
} from '../utils/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
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
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  assetActionLabel,
  assetCategoryLabel,
  assetStatusLabel,
  statusBadgeClass,
} from './company-assets/labels';
import type {
  AssetCurrency,
  CompanyAssetActivityLog,
  CompanyAssetDetail,
  CompanyAssetListItem,
  CompanyAssetListResponse,
  CompanyAssetStats,
  CompanyAssetStatus,
} from './company-assets/types';
import {
  exportCompanyAssetsExcel,
  exportCompanyAssetsPdf,
} from '../utils/company-assets-export';
import { cn } from '../components/ui/utils';
import { SingleDatePicker } from '../components/SingleDatePicker';
import { FilePickerField } from '../components/FilePickerField';
import { ApiError } from '../api/http';
import { translateCompanyAssetApiError } from '../utils/company-assets-api-errors';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const PAGE_SIZE = 20;

const SELECT_TRIGGER_CLS =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white';

const SELECT_CONTENT_CLS =
  'z-[120] min-w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900';

/** Dialog (z-130) ustida ochilishi uchun */
const SELECT_CONTENT_DIALOG_CLS =
  'z-[200] min-w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900';

const SELECT_ITEM_CLS =
  'cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-800';

const CURRENCIES: AssetCurrency[] = ['UZS', 'USD', 'EUR'];

const ACTIVITY_ACTOR_SUFFIX = / · Kim: .+$/;

function activityActorName(log: CompanyAssetActivityLog, fallback: string): string {
  if (log.performedBy?.fullName?.trim()) return log.performedBy.fullName;
  const match = log.details?.match(/ · Kim: (.+)$/);
  return match?.[1]?.trim() || fallback;
}

function activityMessage(log: CompanyAssetActivityLog): string | null {
  if (!log.details?.trim()) return null;
  const message = log.details.replace(ACTIVITY_ACTOR_SUFFIX, '').trim();
  return message || null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Building2;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accent)}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export function CompanyAssets() {
  const { t } = useApp();
  const { refresh } = useERP();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_company_assets');
  const { usd, eur, loading: ratesLoading, error: ratesError } = useCbuRates();

  const [stats, setStats] = useState<CompanyAssetStats | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [assignableEmployees, setAssignableEmployees] = useState<
    { id: string; fullName: string }[]
  >([]);
  const [items, setItems] = useState<CompanyAssetListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchName, setSearchName] = useState('');
  const [searchInventory, setSearchInventory] = useState('');
  const [filterStatus, setFilterStatus] = useState<CompanyAssetStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<CompanyAssetStatus>('ACTIVE');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CompanyAssetDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CompanyAssetDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    inventoryNumber: '',
    name: '',
    serialNumber: '',
    category: 'OTHER' as (typeof ASSET_CATEGORIES)[number],
    manufacturer: '',
    model: '',
    purchasedAt: todayYmd(),
    purchasePrice: '',
    currency: 'UZS' as AssetCurrency,
    fxRateToUzs: '',
    warrantyUntil: '',
    assignedUserId: '',
    location: '',
    status: 'ACTIVE' as CompanyAssetStatus,
    imageUrl: '',
    notes: '',
  });
  const [pendingDocs, setPendingDocs] = useState<{ fileName: string; fileUrl: string }[]>([]);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [lastDocFileName, setLastDocFileName] = useState<string | null>(null);

  const usdRate = cbuUsdRate(usd);
  const eurRate = cbuEurRate(eur);

  useEffect(() => {
    if (form.currency === 'USD' && usdRate > 0) {
      setForm((f) => ({ ...f, fxRateToUzs: String(Math.round(usdRate)) }));
    } else if (form.currency === 'EUR' && eurRate > 0) {
      setForm((f) => ({ ...f, fxRateToUzs: String(Math.round(eurRate)) }));
    } else if (form.currency === 'UZS') {
      setForm((f) => ({ ...f, fxRateToUzs: '1' }));
    }
  }, [form.currency, usdRate, eurRate]);

  const purchaseAmountNum =
    Number(parseDigitsFromAmountInput(form.purchasePrice)) || 0;
  const fxNum = form.currency === 'UZS' ? 1 : parseFloat(form.fxRateToUzs) || 0;
  const amountUzsPreview =
    form.currency === 'UZS'
      ? purchaseAmountNum
      : purchaseAmountNum * fxNum;

  useEffect(() => {
    const tmr = setTimeout(() => {
      const q = new URLSearchParams();
      if (searchName.trim()) q.set('search', searchName.trim());
      if (searchInventory.trim()) q.set('inventorySearch', searchInventory.trim());
      if (filterStatus) q.set('status', filterStatus);
      if (filterCategory) q.set('category', filterCategory);
      if (filterLocation) q.set('location', filterLocation);
      if (filterEmployee) q.set('assignedUserId', filterEmployee);
      setDebouncedQuery(q.toString());
      setPage(1);
    }, 400);
    return () => clearTimeout(tmr);
  }, [searchName, searchInventory, filterStatus, filterCategory, filterLocation, filterEmployee]);

  const buildQuery = useCallback(
    (p: number, limit: number) => {
      const q = new URLSearchParams(debouncedQuery);
      q.set('page', String(p));
      q.set('limit', String(limit));
      return q.toString();
    },
    [debouncedQuery],
  );

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<CompanyAssetListResponse>(
        `/company-assets?${buildQuery(page, PAGE_SIZE)}`,
      );
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error(t.prEmployeeSaveError);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, page, t.prEmployeeSaveError]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void apiRequest<CompanyAssetStats>('/company-assets/stats').then(setStats).catch(() => {});
    void apiRequest<{ locations: string[]; employees: { id: string; fullName: string }[] }>(
      '/company-assets/filter-options',
    )
      .then((r) => {
        setLocations(r.locations);
        setAssignableEmployees(r.employees ?? []);
      })
      .catch(() => {});
  }, []);

  const employeeOptions = useMemo(
    () =>
      [...assignableEmployees].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [assignableEmployees],
  );

  const resetForm = () => {
    setForm({
      inventoryNumber: '',
      name: '',
      serialNumber: '',
      category: 'OTHER',
      manufacturer: '',
      model: '',
      purchasedAt: todayYmd(),
      purchasePrice: '',
      currency: 'UZS',
      fxRateToUzs: '1',
      warrantyUntil: '',
      assignedUserId: '',
      location: '',
      status: 'ACTIVE',
      imageUrl: '',
      notes: '',
    });
    setPendingDocs([]);
    setImageFileName(null);
    setLastDocFileName(null);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const asset = await apiRequest<CompanyAssetDetail>(`/company-assets/${id}`);
      setEditingId(id);
      setForm({
        inventoryNumber: asset.inventoryNumber,
        name: asset.name,
        serialNumber: asset.serialNumber ?? '',
        category: asset.category,
        manufacturer: asset.manufacturer ?? '',
        model: asset.model ?? '',
        purchasedAt: asset.purchasedAt.slice(0, 10),
        purchasePrice: String(asset.purchasePriceOriginal),
        currency: asset.currency,
        fxRateToUzs: String(asset.fxRateToUzs),
        warrantyUntil: asset.warrantyUntil?.slice(0, 10) ?? '',
        assignedUserId: asset.assignedUser?.id ?? '',
        location: asset.location ?? '',
        status: asset.status,
        imageUrl: asset.imageUrl ?? '',
        notes: asset.notes ?? '',
      });
      setPendingDocs([]);
      setImageFileName(asset.imageUrl ? t.caFileUploaded : null);
      setLastDocFileName(null);
      setFormOpen(true);
    } catch {
      toast.error(t.prEmployeeSaveError);
    }
  };

  const openDetail = async (id: string) => {
    try {
      const asset = await apiRequest<CompanyAssetDetail>(`/company-assets/${id}`);
      setDetail(asset);
      setDetailOpen(true);
    } catch {
      toast.error(t.prEmployeeSaveError);
    }
  };

  const fetchAllForExport = async () => {
    const res = await apiRequest<CompanyAssetListResponse>(
      `/company-assets?${buildQuery(1, 5000)}`,
    );
    return res.items;
  };

  const handleExportExcel = async () => {
    try {
      const all = await fetchAllForExport();
      exportCompanyAssetsExcel(all, t);
      toast.success(t.caExportExcel);
    } catch {
      toast.error(t.prEmployeeSaveError);
    }
  };

  const handleExportPdf = async () => {
    try {
      const all = await fetchAllForExport();
      await exportCompanyAssetsPdf(all, t, t.caTitle);
      toast.success(t.caExportPdf);
    } catch {
      toast.error(t.prEmployeeSaveError);
    }
  };

  const handleBulkApply = async () => {
    if (selectedIds.size === 0) return;
    try {
      await apiRequest('/company-assets/bulk', {
        method: 'PATCH',
        body: JSON.stringify({ ids: [...selectedIds], status: bulkStatus }),
      });
      toast.success(t.successAdded);
      setSelectedIds(new Set());
      await loadList();
      const s = await apiRequest<CompanyAssetStats>('/company-assets/stats');
      setStats(s);
    } catch {
      toast.error(t.prEmployeeSaveError);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleImageFile = async (file: File | null) => {
    if (!file) {
      setImageFileName(null);
      setForm((f) => ({ ...f, imageUrl: '' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t.caErrFileTooLarge);
      return;
    }
    const url = await readFileAsDataUrl(file);
    setImageFileName(file.name);
    setForm((f) => ({ ...f, imageUrl: url }));
  };

  const handleDocFile = async (file: File | null) => {
    if (!file) {
      setLastDocFileName(null);
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t.caErrFileTooLarge);
      return;
    }
    const url = await readFileAsDataUrl(file);
    setLastDocFileName(file.name);
    setPendingDocs((d) => [...d, { fileName: file.name, fileUrl: url }]);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/company-assets/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success(t.caDeletedSuccess);
      setDeleteTarget(null);
      setDetailOpen(false);
      setDetail(null);
      await loadList();
      const s = await apiRequest<CompanyAssetStats>('/company-assets/stats');
      setStats(s);
    } catch (e) {
      const raw = e instanceof ApiError || e instanceof Error ? e.message : '';
      toast.error(translateCompanyAssetApiError(raw, t));
    } finally {
      setDeleting(false);
    }
  };

  const auditLine = (who: string | undefined, when: string) => (
    <p className="text-sm text-slate-700 dark:text-slate-200">
      <span className="font-medium">{who?.trim() || t.caAuditUnknown}</span>
      <span className="text-slate-400"> · </span>
      <span className="text-slate-500 dark:text-slate-400">{formatDateTime(when)}</span>
    </p>
  );

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error(t.caErrNameRequired);
      return;
    }
    if (!editingId) {
      if (!form.purchasedAt?.trim()) {
        toast.error(t.caErrDateInvalid);
        return;
      }
      if (!Number.isFinite(purchaseAmountNum) || purchaseAmountNum <= 0) {
        toast.error(t.caErrPurchasePriceRequired);
        return;
      }
      if (form.currency !== 'UZS' && (!Number.isFinite(fxNum) || fxNum <= 0)) {
        toast.error(t.caErrFxRateRequired);
        return;
      }
    }

    setSaving(true);
    try {
      if (editingId) {
        await apiRequest(`/company-assets/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: form.name.trim(),
            serialNumber: form.serialNumber || null,
            category: form.category,
            manufacturer: form.manufacturer || null,
            model: form.model || null,
            purchasedAt: form.purchasedAt,
            warrantyUntil: form.warrantyUntil || null,
            assignedUserId: form.assignedUserId || null,
            location: form.location || null,
            status: form.status,
            imageUrl: form.imageUrl || null,
            notes: form.notes || null,
            documents: pendingDocs.length ? pendingDocs : undefined,
          }),
        });
      } else {
        await apiRequest('/company-assets', {
          method: 'POST',
          body: JSON.stringify({
            inventoryNumber: form.inventoryNumber.trim() || undefined,
            name: form.name.trim(),
            serialNumber: form.serialNumber || undefined,
            category: form.category,
            manufacturer: form.manufacturer || undefined,
            model: form.model || undefined,
            purchasedAt: form.purchasedAt,
            purchasePriceOriginal: purchaseAmountNum,
            currency: form.currency,
            fxRateToUzs: fxNum,
            warrantyUntil: form.warrantyUntil || undefined,
            assignedUserId: form.assignedUserId || undefined,
            location: form.location || undefined,
            status: form.status,
            imageUrl: form.imageUrl || undefined,
            notes: form.notes || undefined,
            documents: pendingDocs.length ? pendingDocs : undefined,
          }),
        });
        await refresh();
      }
      toast.success(t.successAdded);
      setFormOpen(false);
      resetForm();
      await loadList();
      const s = await apiRequest<CompanyAssetStats>('/company-assets/stats');
      setStats(s);
    } catch (e) {
      const raw = e instanceof ApiError || e instanceof Error ? e.message : '';
      toast.error(translateCompanyAssetApiError(raw, t));
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{t.caTitle}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.caSubtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExportExcel()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileSpreadsheet size={16} />
            {t.caExportExcel}
          </button>
          <button
            type="button"
            onClick={() => void handleExportPdf()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileText size={16} />
            {t.caExportPdf}
          </button>
          {canManage && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus size={16} />
              {t.caAddAsset}
            </button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard label={t.caStatTotal} value={stats.total} icon={Building2} accent="bg-indigo-500" />
          <StatCard label={t.caStatActive} value={stats.active} icon={Building2} accent="bg-emerald-500" />
          <StatCard label={t.caStatWrittenOff} value={stats.writtenOff} icon={Archive} accent="bg-slate-500" />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className={cn(inputCls, 'pl-9')}
              placeholder={t.caSearchName}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <input
            className={inputCls}
            placeholder={t.caSearchInventory}
            value={searchInventory}
            onChange={(e) => setSearchInventory(e.target.value)}
          />
          <Select
            value={filterStatus || 'all'}
            onValueChange={(v) => setFilterStatus(v === 'all' ? '' : (v as CompanyAssetStatus))}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLS}>
              <SelectValue placeholder={`${t.caFilterStatus}: ${t.caAll}`} />
            </SelectTrigger>
            <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
              <SelectItem value="all" className={SELECT_ITEM_CLS}>{t.caAll}</SelectItem>
              {ASSET_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className={SELECT_ITEM_CLS}>
                  {assetStatusLabel(s, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterCategory || 'all'}
            onValueChange={(v) => setFilterCategory(v === 'all' ? '' : v)}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLS}>
              <SelectValue placeholder={`${t.caFilterCategory}: ${t.caAll}`} />
            </SelectTrigger>
            <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
              <SelectItem value="all" className={SELECT_ITEM_CLS}>{t.caAll}</SelectItem>
              {ASSET_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className={SELECT_ITEM_CLS}>
                  {assetCategoryLabel(c, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterLocation || 'all'}
            onValueChange={(v) => setFilterLocation(v === 'all' ? '' : v)}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLS}>
              <SelectValue placeholder={`${t.caFilterLocation}: ${t.caAll}`} />
            </SelectTrigger>
            <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
              <SelectItem value="all" className={SELECT_ITEM_CLS}>{t.caAll}</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc} className={SELECT_ITEM_CLS}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterEmployee || 'all'}
            onValueChange={(v) => setFilterEmployee(v === 'all' ? '' : v)}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLS}>
              <SelectValue placeholder={`${t.caFilterEmployee}: ${t.caAll}`} />
            </SelectTrigger>
            <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
              <SelectItem value="all" className={SELECT_ITEM_CLS}>{t.caAll}</SelectItem>
              {employeeOptions.map((e) => (
                <SelectItem key={e.id} value={e.id} className={SELECT_ITEM_CLS}>
                  {e.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canManage && selectedIds.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-900/20">
            <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
              {selectedIds.size} {t.caSelected}
            </span>
            <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as CompanyAssetStatus)}>
              <SelectTrigger className="h-9 min-w-[10rem] rounded-xl border border-indigo-200 bg-white px-2 text-sm dark:border-indigo-700 dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
                {ASSET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className={SELECT_ITEM_CLS}>
                    {assetStatusLabel(s, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => void handleBulkApply()}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-sm font-semibold text-white"
            >
              {t.caBulkApply}
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                {canManage && (
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.size === items.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                {[t.caColId, t.caColInventory, t.caColName, t.caColCategory, t.caColEmployee, t.caColLocation, t.caColPurchased, t.caColInitialValue, t.caColStatus, t.caColNotes, t.caColActions].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 12 : 11} className="py-16 text-center text-slate-400">
                    <Loader2 className="mx-auto animate-spin" size={24} />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 12 : 11} className="py-16 text-center text-slate-400">{t.noData}</td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 hover:bg-slate-50/80 dark:border-slate-700 dark:hover:bg-slate-700/30"
                  >
                    {canManage && (
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                        />
                      </td>
                    )}
                    <td className="max-w-[4rem] truncate px-3 py-2 font-mono text-xs text-slate-500" title={row.id}>{row.id.slice(-6)}</td>
                    <td className="px-3 py-2 font-medium">{row.inventoryNumber}</td>
                    <td className="px-3 py-2">
                      <button type="button" className="text-left font-medium text-indigo-600 hover:underline dark:text-indigo-400" onClick={() => void openDetail(row.id)}>
                        {row.name}
                      </button>
                    </td>
                    <td className="px-3 py-2">{assetCategoryLabel(row.category, t)}</td>
                    <td className="px-3 py-2">{row.assignedUser?.fullName ?? t.caNoEmployee}</td>
                    <td className="px-3 py-2">{row.location ?? '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.purchasedAt)}</td>
                    <td className="px-3 py-2 font-medium text-red-600 dark:text-red-400">{formatCurrency(row.initialValueUzs)}</td>
                    <td className="px-3 py-2">
                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', statusBadgeClass(row.status))}>
                        {assetStatusLabel(row.status, t)}
                      </span>
                    </td>
                    <td className="max-w-[8rem] truncate px-3 py-2 text-slate-500" title={row.notes ?? ''}>{row.notes ?? '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button type="button" title={t.caView} onClick={() => void openDetail(row.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <Eye size={16} />
                        </button>
                        {canManage && (
                          <>
                            <button type="button" title={t.caEditAsset} onClick={() => void openEdit(row.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              title={t.caDelete}
                              onClick={() => {
                                void (async () => {
                                  try {
                                    const asset = await apiRequest<CompanyAssetDetail>(
                                      `/company-assets/${row.id}`,
                                    );
                                    setDeleteTarget(asset);
                                  } catch {
                                    toast.error(t.prEmployeeSaveError);
                                  }
                                })();
                              }}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-700">
          <p className="text-sm text-slate-500">
            {t.caPage} {page} {t.caOf} {totalPages} · {total}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-600"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); resetForm(); } }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t.caEditAsset : t.caAddAsset}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldName} *</span>
              <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </label>
            {!editingId && (
              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldInventory} ({t.caAutoInventory})</span>
                <input className={inputCls} value={form.inventoryNumber} onChange={(e) => setForm((f) => ({ ...f, inventoryNumber: e.target.value }))} placeholder="KM-2026-00001" />
              </label>
            )}
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldSerial}</span>
              <input className={inputCls} value={form.serialNumber} onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldCategory}</span>
              <Select
                modal={false}
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as typeof form.category }))
                }
              >
                <SelectTrigger className={SELECT_TRIGGER_CLS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className={SELECT_CONTENT_DIALOG_CLS}>
                  {ASSET_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className={SELECT_ITEM_CLS}>
                      {assetCategoryLabel(c, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldManufacturer}</span>
              <input className={inputCls} value={form.manufacturer} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldModel}</span>
              <input className={inputCls} value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
            </label>
            {!editingId && (
              <>
                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldPurchaseDate}</span>
                  <SingleDatePicker
                    value={form.purchasedAt}
                    onChange={(date) => setForm((f) => ({ ...f, purchasedAt: date }))}
                    menuZClassName="z-[200]"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldPurchasePrice} *</span>
                  <input
                    className={inputCls}
                    value={displayGroupedIntInput(form.purchasePrice)}
                    onChange={(e) => setForm((f) => ({ ...f, purchasePrice: parseDigitsFromAmountInput(e.target.value).toString() }))}
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldCurrency}</span>
                  <Select
                    modal={false}
                    value={form.currency}
                    onValueChange={(v) => setForm((f) => ({ ...f, currency: v as AssetCurrency }))}
                  >
                    <SelectTrigger className={SELECT_TRIGGER_CLS}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className={SELECT_CONTENT_DIALOG_CLS}>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c} className={SELECT_ITEM_CLS}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                {form.currency !== 'UZS' && (
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      {t.caFieldFxRate}
                      {ratesLoading && (
                        <span className="ml-1 font-normal text-slate-400">…</span>
                      )}
                    </span>
                    <p className="mb-1.5 text-[11px] leading-snug text-slate-400 dark:text-slate-500">
                      {t.caFxCbuHint}
                    </p>
                    {ratesError && (
                      <p className="mb-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                        {t.dashCbuFetchError}
                      </p>
                    )}
                    <input
                      className={inputCls}
                      value={displayGroupedIntInput(form.fxRateToUzs)}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          fxRateToUzs: e.target.value.replace(/\D/g, ''),
                        }))
                      }
                    />
                  </label>
                )}
                <div className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                  <p className="font-medium">{t.caAmountUzsPreview}: {formatCurrency(amountUzsPreview)}</p>
                  <p className="mt-1 text-xs opacity-80">{t.caExpenseLinked}</p>
                </div>
              </>
            )}
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldWarranty}</span>
              <SingleDatePicker
                value={form.warrantyUntil}
                onChange={(date) => setForm((f) => ({ ...f, warrantyUntil: date }))}
                allowFuture
                menuZClassName="z-[200]"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldEmployee}</span>
              <Select
                modal={false}
                value={form.assignedUserId || 'none'}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, assignedUserId: v === 'none' ? '' : v }))
                }
              >
                <SelectTrigger className={SELECT_TRIGGER_CLS}>
                  <SelectValue placeholder={t.caNoEmployee} />
                </SelectTrigger>
                <SelectContent position="popper" className={SELECT_CONTENT_DIALOG_CLS}>
                  <SelectItem value="none" className={SELECT_ITEM_CLS}>{t.caNoEmployee}</SelectItem>
                  {employeeOptions.map((e) => (
                    <SelectItem key={e.id} value={e.id} className={SELECT_ITEM_CLS}>
                      {e.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldLocation}</span>
              <input className={inputCls} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} list="ca-locations" />
              <datalist id="ca-locations">
                {locations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldStatus}</span>
              <Select
                modal={false}
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as CompanyAssetStatus }))
                }
              >
                <SelectTrigger className={SELECT_TRIGGER_CLS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className={SELECT_CONTENT_DIALOG_CLS}>
                  {ASSET_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className={SELECT_ITEM_CLS}>
                      {assetStatusLabel(s, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldImage}</span>
              <FilePickerField
                accept="image/*"
                fileName={imageFileName}
                onFile={(file) => void handleImageFile(file)}
              />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="" className="mt-2 max-h-32 rounded-lg border object-contain" />
              )}
            </div>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldDocuments}</span>
              <FilePickerField
                fileName={lastDocFileName}
                onFile={(file) => void handleDocFile(file)}
              />
              {pendingDocs.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-slate-500">
                  {pendingDocs.map((d) => (
                    <li key={`${d.fileName}-${d.fileUrl.slice(0, 24)}`} className="truncate">
                      {d.fileName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.caFieldNotes}</span>
              <textarea className={cn(inputCls, 'min-h-[72px]')} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} className="rounded-xl border px-4 py-2 text-sm dark:border-slate-600">{t.caCancel}</button>
            <button type="button" disabled={saving} onClick={() => void handleSave()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {t.caSave}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.name}</DialogTitle>
                <p className="text-sm text-slate-500">{detail.inventoryNumber}</p>
              </DialogHeader>
              {detail.imageUrl && (
                <img src={detail.imageUrl} alt="" className="max-h-48 w-full rounded-xl object-contain" />
              )}
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-slate-500">{t.caColCategory}:</span> {assetCategoryLabel(detail.category, t)}</p>
                <p><span className="text-slate-500">{t.caColStatus}:</span> {assetStatusLabel(detail.status, t)}</p>
                <p><span className="text-slate-500">{t.caColEmployee}:</span> {detail.assignedUser?.fullName ?? t.caNoEmployee}</p>
                <p><span className="text-slate-500">{t.caColLocation}:</span> {detail.location ?? '—'}</p>
                <p><span className="text-slate-500">{t.caColInitialValue}:</span> {formatCurrency(detail.initialValueUzs)}</p>
                <p><span className="text-slate-500">{t.caColPurchased}:</span> {formatDate(detail.purchasedAt)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
                <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-white">{t.caAuditTitle}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.caAuditCreated}</p>
                    {auditLine(detail.createdBy?.fullName, detail.createdAt)}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.caAuditUpdated}</p>
                    {auditLine(
                      detail.updatedBy?.fullName ?? detail.createdBy?.fullName,
                      detail.updatedAt,
                    )}
                  </div>
                  {detail.deletedAt && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-red-500">{t.caAuditDeleted}</p>
                      {auditLine(detail.deletedBy?.fullName, detail.deletedAt)}
                    </div>
                  )}
                </div>
              </div>
              {detail.expense && (
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-3 text-sm dark:border-red-900/40 dark:bg-red-950/20">
                  <p className="font-semibold text-red-800 dark:text-red-300">{t.caTabExpense}</p>
                  <p className="mt-1">{detail.expense.title}</p>
                  <p className="font-medium text-red-600">{formatCurrency(detail.expense.amount)}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{detail.expense.description}</p>
                </div>
              )}
              <div>
                <p className="mb-2 text-sm font-semibold">{t.caTabHistory}</p>
                <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                  {detail.activityLogs.map((log) => (
                    <li
                      key={log.id}
                      className={cn(
                        'rounded-lg px-3 py-2',
                        log.actionType === 'DELETED'
                          ? 'bg-red-50 dark:bg-red-950/30'
                          : 'bg-slate-50 dark:bg-slate-700/50',
                      )}
                    >
                      <div className="flex justify-between gap-2">
                        <span className={cn(
                          'font-medium',
                          log.actionType === 'DELETED' && 'text-red-700 dark:text-red-300',
                        )}
                        >
                          {assetActionLabel(log.actionType, t)}
                        </span>
                        <span className="text-xs text-slate-400">{formatDateTime(log.performedAt)}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {t.caAuditPerformedBy}: {activityActorName(log, t.caAuditUnknown)}
                      </p>
                      {activityMessage(log) && (
                        <p className="text-xs text-slate-500">{activityMessage(log)}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {detail.documents.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">{t.caTabDocuments}</p>
                  <ul className="space-y-1 text-sm">
                    {detail.documents.map((d) => (
                      <li key={d.id}>
                        <a href={d.fileUrl} download={d.fileName} className="text-indigo-600 hover:underline">{d.fileName}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {canManage && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailOpen(false);
                      void openEdit(detail.id);
                    }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {t.caEditAsset}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(detail)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                  >
                    <Trash2 size={16} />
                    {t.caDelete}
                  </button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.caDeleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `${deleteTarget.name} (${deleteTarget.inventoryNumber}). ${t.caDeleteConfirmDesc}`
                : t.caDeleteConfirmDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t.caCancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : t.caDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
