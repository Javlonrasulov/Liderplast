import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  Minus,
  Clock,
  Pencil,
  Trash2,
  UserPlus,
  Building2,
  FolderPlus,
  ChevronRight,
  ChevronLeft,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../api/http';
import { useERP, mapBankVedomost } from '../store/erp-store';
import type { BankTransaction, BankVedomost } from '../store/erp-store';

type RawStatement = Parameters<typeof mapBankVedomost>[0];
import { useApp } from '../i18n/app-context';
import { SingleDatePicker } from './SingleDatePicker';
import { translateStatementApiError } from '../utils/statement-api-errors';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  todayYmd,
  normalizeApiYmd,
  displayGroupedIntInput,
  parseDigitsFromAmountInput,
  EMPTY_PLACEHOLDER,
} from '../utils/format';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
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
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  return (
    <RadixSelect value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="z-[200] max-h-72 min-w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-800"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </RadixSelect>
  );
}

type WizardMode = 'client_inflow' | 'kassa_inflow' | 'expense';

function normalizeAccountDigits(value?: string | null) {
  return (value ?? '').replace(/\D/g, '');
}

function isCompanyAccountRow(
  row: BankTransaction,
  companyAccounts: Array<{ accountNumber: string }>,
): boolean {
  const companyDigits = new Set(
    companyAccounts
      .map((a) => normalizeAccountDigits(a.accountNumber))
      .filter((digits) => digits.length > 0),
  );
  if (companyDigits.size === 0) return false;

  const receiver = normalizeAccountDigits(row.receiverAccount);
  const company = normalizeAccountDigits(row.companyAccount);
  return (
    (receiver.length > 0 && companyDigits.has(receiver)) ||
    (company.length > 0 && companyDigits.has(company))
  );
}

function inferIncomeMode(
  row: BankTransaction,
  companyAccounts: Array<{ accountNumber: string }>,
): WizardMode {
  if (row.counterpartyKind === 'company' || isCompanyAccountRow(row, companyAccounts)) {
    return 'kassa_inflow';
  }
  if (row.clientId) return 'client_inflow';
  const name = (row.receiverName ?? '').toLowerCase();
  if (
    name.includes('kassa') ||
    name.includes('касса') ||
    name.includes('nakd') ||
    name.includes('накд') ||
    name.includes('aylanma') ||
    name.includes('айланма')
  ) {
    return 'kassa_inflow';
  }
  return 'client_inflow';
}

const TABLE_PAGE_SIZE = 25;
const TABLE_SCROLL_STEP = 360;

function normalizeMatchText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яёўқғҳ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function suggestCategoryName(row: BankTransaction): string {
  const receiver = row.receiverName?.trim();
  if (receiver) return receiver;
  return row.paymentPurpose?.trim() ?? '';
}

function findMatchingCategoryId(
  categories: Array<{ id: string; name: string }>,
  row: BankTransaction,
): string {
  const needles = [row.receiverName]
    .map((v) => normalizeMatchText(v ?? ''))
    .filter((v) => v.length >= 3);

  if (needles.length === 0 || categories.length === 0) return '';

  let bestId = '';
  let bestScore = 0;

  for (const category of categories) {
    const catNorm = normalizeMatchText(category.name);
    if (catNorm.length < 3) continue;

    for (const needle of needles) {
      if (needle === catNorm) {
        return category.id;
      }
      if (needle.includes(catNorm) || catNorm.includes(needle)) {
        const score = Math.min(needle.length, catNorm.length);
        if (score > bestScore) {
          bestScore = score;
          bestId = category.id;
        }
      }
    }
  }

  return bestId;
}

export function StatementImportWizard({ source }: { source: 'bank' | 'kassa' }) {
  const { state, refresh } = useERP();
  const { t } = useApp();

  const fileRef = useRef<HTMLInputElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<BankVedomost | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busy, setBusy] = useState(false);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardIndex, setWizardIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<BankTransaction | null>(null);
  const [deleteStatementTarget, setDeleteStatementTarget] = useState<BankVedomost | null>(null);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [tablePage, setTablePage] = useState(0);

  // per-row form state
  const [mode, setMode] = useState<WizardMode>('client_inflow');
  const [clientId, setClientId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [entryDate, setEntryDate] = useState(todayYmd());
  const [comment, setComment] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  // manual raw edit
  const [manualOpen, setManualOpen] = useState(false);
  const [mReceiver, setMReceiver] = useState('');
  const [mAccount, setMAccount] = useState('');
  const [mPurpose, setMPurpose] = useState('');
  const [mType, setMType] = useState<'income' | 'expense'>('income');

  const statements = useMemo(
    () => state.bankVedomosts.filter((v) => (v.source ?? 'bank') === source),
    [state.bankVedomosts, source],
  );

  const sortedClients = useMemo(
    () => [...state.clients].sort((a, b) => a.name.localeCompare(b.name)),
    [state.clients],
  );
  const sortedSuppliers = useMemo(
    () => [...state.suppliers].sort((a, b) => a.name.localeCompare(b.name)),
    [state.suppliers],
  );
  const categories = state.expenseCategories;

  const showApiError = useCallback(
    (err: unknown) => {
      const raw = err instanceof Error ? err.message : '';
      toast.error(translateStatementApiError(raw, t));
    },
    [t],
  );

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const data = await apiRequest<RawStatement>(`/finance/statement/${id}`);
      setDetail(mapBankVedomost(data));
    } catch (err) {
      showApiError(err);
    } finally {
      setLoadingDetail(false);
    }
  }, [showApiError]);

  useEffect(() => {
    if (selectedId) {
      void loadDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId, loadDetail]);

  const pendingRows = useMemo(
    () =>
      (detail?.transactions ?? []).filter((r) => (r.reviewStatus ?? 'pending') === 'pending'),
    [detail],
  );

  const allTableRows = useMemo(() => detail?.transactions ?? [], [detail]);
  const tablePageCount = Math.max(1, Math.ceil(allTableRows.length / TABLE_PAGE_SIZE));
  const safeTablePage = Math.min(tablePage, tablePageCount - 1);
  const visibleTableRows = useMemo(
    () =>
      allTableRows.slice(
        safeTablePage * TABLE_PAGE_SIZE,
        safeTablePage * TABLE_PAGE_SIZE + TABLE_PAGE_SIZE,
      ),
    [allTableRows, safeTablePage],
  );
  const tablePageFrom = allTableRows.length === 0 ? 0 : safeTablePage * TABLE_PAGE_SIZE + 1;
  const tablePageTo = Math.min(allTableRows.length, (safeTablePage + 1) * TABLE_PAGE_SIZE);

  useEffect(() => {
    setTablePage(0);
  }, [selectedId]);

  useEffect(() => {
    if (!tableExpanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTableExpanded(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [tableExpanded]);

  const scrollTableHorizontally = (direction: 'left' | 'right') => {
    tableScrollRef.current?.scrollBy({
      left: direction === 'left' ? -TABLE_SCROLL_STEP : TABLE_SCROLL_STEP,
      behavior: 'smooth',
    });
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const raw = await apiRequest<RawStatement>(
        `/finance/statement/upload?source=${source}`,
        { method: 'POST', body: formData },
      );
      const result = mapBankVedomost(raw);
      toast.success(t.siUploadSuccess);
      setSelectedId(result.id);
      setDetail(result);
      await refresh();
    } catch (err) {
      showApiError(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const initRowForm = useCallback((row: BankTransaction) => {
    setMode(
      row.type === 'income'
        ? inferIncomeMode(row, state.companyBankAccounts)
        : 'expense',
    );
    setClientId(row.clientId ?? '');
    setSupplierId(row.supplierId ?? '');
    setCategoryId(findMatchingCategoryId(categories, row));
    setAmount(displayGroupedIntInput(String(Math.round(row.amount))));
    setEntryDate(normalizeApiYmd(row.operationDate, todayYmd()));
    setComment(row.paymentPurpose ?? '');
    setCreatingClient(false);
    setCreatingSupplier(false);
    setCreatingCategory(false);
    setNewName(row.receiverName ?? '');
    setNewCategoryName(suggestCategoryName(row));
    setManualOpen(false);
    setMReceiver(row.receiverName ?? '');
    setMAccount(row.receiverAccount ?? '');
    setMPurpose(row.paymentPurpose ?? '');
    setMType(row.type);
  }, [categories, state.companyBankAccounts]);

  const currentRow: BankTransaction | undefined = pendingRows[wizardIndex];

  const suggestedCategoryId = useMemo(() => {
    if (!currentRow) return '';
    return findMatchingCategoryId(categories, currentRow);
  }, [currentRow, categories]);

  useEffect(() => {
    if (!wizardOpen || !currentRow || mode !== 'expense' || creatingCategory || categoryId) {
      return;
    }
    const matched = findMatchingCategoryId(categories, currentRow);
    if (matched) setCategoryId(matched);
  }, [wizardOpen, currentRow, mode, creatingCategory, categoryId, categories]);

  const openWizard = () => {
    if (pendingRows.length === 0) {
      toast.message(t.siAllReviewed);
      return;
    }
    setWizardIndex(0);
    initRowForm(pendingRows[0]);
    setWizardOpen(true);
  };

  const advance = useCallback(
    async (refreshedDetail: BankVedomost | null) => {
      const remaining = (refreshedDetail?.transactions ?? []).filter(
        (r) => (r.reviewStatus ?? 'pending') === 'pending',
      );
      if (remaining.length === 0) {
        setWizardOpen(false);
        toast.success(t.siAllReviewed);
        return;
      }
      const nextIndex = Math.min(wizardIndex, remaining.length - 1);
      setWizardIndex(nextIndex);
      initRowForm(remaining[nextIndex]);
    },
    [wizardIndex, initRowForm, t.siAllReviewed],
  );

  const reloadAfterMutation = useCallback(async () => {
    if (!selectedId) return null;
    const raw = await apiRequest<RawStatement>(`/finance/statement/${selectedId}`);
    const data = mapBankVedomost(raw);
    setDetail(data);
    await refresh();
    return data;
  }, [selectedId, refresh]);

  const handleConfirm = async () => {
    if (!currentRow) return;
    const amt = Number(parseDigitsFromAmountInput(amount)) || 0;
    if (amt < 0.01) {
      toast.error(t.siErrInvalidAmount);
      return;
    }
    const body: Record<string, unknown> = {
      mode,
      amount: amt,
      entryDate: normalizeApiYmd(entryDate, todayYmd()),
      comment: comment.trim() || undefined,
    };
    if (mode === 'client_inflow') {
      if (creatingClient) {
        if (!newName.trim()) {
          toast.error(t.siNeedClient);
          return;
        }
        body.newClient = {
          name: newName.trim(),
          bankAccount: currentRow.receiverAccount ?? undefined,
          bankName: currentRow.receiverBankName ?? undefined,
          stir: currentRow.receiverStir ?? undefined,
        };
      } else {
        if (!clientId) {
          toast.error(t.siNeedClient);
          return;
        }
        body.clientId = clientId;
      }
    } else if (mode === 'expense') {
      if (creatingCategory) {
        if (!newCategoryName.trim()) {
          toast.error(t.siNeedCategory);
          return;
        }
        body.newCategory = { name: newCategoryName.trim() };
      } else {
        if (!categoryId) {
          toast.error(t.siNeedCategory);
          return;
        }
        body.categoryId = categoryId;
      }
      if (creatingSupplier) {
        if (newName.trim()) {
          body.newSupplier = {
            name: newName.trim(),
            bankAccount: currentRow.receiverAccount ?? undefined,
            bankName: currentRow.receiverBankName ?? undefined,
            stir: currentRow.receiverStir ?? undefined,
          };
        }
      } else if (supplierId) {
        body.supplierId = supplierId;
      }
    }

    setBusy(true);
    try {
      await apiRequest(`/finance/statement/row/${currentRow.id}/confirm`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      toast.success(t.siRowConfirmed);
      const data = await reloadAfterMutation();
      await advance(data);
    } catch (err) {
      showApiError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = async () => {
    if (!currentRow) return;
    setBusy(true);
    try {
      await apiRequest(`/finance/statement/row/${currentRow.id}/skip`, { method: 'POST' });
      toast.success(t.siRowSkipped);
      const data = await reloadAfterMutation();
      await advance(data);
    } catch (err) {
      showApiError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleManualSave = async () => {
    if (!currentRow) return;
    setBusy(true);
    try {
      await apiRequest(`/finance/statement/row/${currentRow.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          type: mType,
          receiverName: mReceiver,
          receiverAccount: mAccount,
          paymentPurpose: mPurpose,
        }),
      });
      const data = await reloadAfterMutation();
      const remaining = (data?.transactions ?? []).filter(
        (r) => (r.reviewStatus ?? 'pending') === 'pending',
      );
      const row = remaining[wizardIndex];
      if (row) initRowForm(row);
      setManualOpen(false);
      toast.success(t.btnSave ?? 'OK');
    } catch (err) {
      showApiError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteRow = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await apiRequest(`/finance/statement/row/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success(t.siRowDeleted);
      setDeleteTarget(null);
      await reloadAfterMutation();
    } catch (err) {
      showApiError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteStatement = async () => {
    if (!deleteStatementTarget) return;
    setBusy(true);
    try {
      await apiRequest(`/finance/statement/${deleteStatementTarget.id}`, { method: 'DELETE' });
      toast.success(t.siStatementDeleted);
      if (selectedId === deleteStatementTarget.id) {
        setSelectedId(null);
        setDetail(null);
      }
      setDeleteStatementTarget(null);
      await refresh();
    } catch (err) {
      showApiError(err);
    } finally {
      setBusy(false);
    }
  };

  const statusBadge = (row: BankTransaction) => {
    const s = row.reviewStatus ?? 'pending';
    if (s === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle size={11} /> {t.siStatusConfirmed}
        </span>
      );
    }
    if (s === 'skipped') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
          <Minus size={11} /> {t.siStatusSkipped}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
        <Clock size={11} /> {t.siStatusPending}
      </span>
    );
  };

  const linkLabel = (row: BankTransaction) => {
    if (row.clientName) return `${t.siKindClient}: ${row.clientName}`;
    if (row.supplierName) return `${t.siKindSupplier}: ${row.supplierName}`;
    if (row.counterpartyKind === 'company') return t.siKindCompany;
    return EMPTY_PLACEHOLDER;
  };

  const modalAboveFullscreen = tableExpanded
    ? { overlayClassName: 'z-[150]', className: 'z-[160]' }
    : { overlayClassName: undefined, className: undefined };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UploadCloud size={16} className="text-indigo-600" />
          <h3 className="font-semibold text-slate-800 dark:text-white">{t.siImportTitle}</h3>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Left: upload + list */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/40"
          >
            <UploadCloud size={22} className="text-indigo-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {uploading ? t.siUploading : t.siImportHint}
            </span>
            <span className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
              {t.siImportAction}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleUpload}
          />

          <div className="rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {t.siStatementsList}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {statements.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">{t.siNoStatements}</p>
              ) : (
                statements.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-stretch border-b border-slate-50 last:border-0 dark:border-slate-700/50 ${
                      selectedId === item.id ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="min-w-0 flex-1 px-3 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText size={12} className="shrink-0 text-slate-400" />
                        <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                          {item.fileName}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {formatDateTime(item.createdAt)} · {item.transactionsCount} {t.siColType}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteStatementTarget(item);
                      }}
                      className="shrink-0 px-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      title={t.siDeleteStatementTitle}
                      aria-label={t.siDeleteStatementTitle}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: detail rows */}
        <div
          className={`min-w-0 ${
            tableExpanded
              ? 'fixed inset-0 z-[140] flex flex-col bg-white p-4 dark:bg-slate-900 sm:p-6'
              : ''
          }`}
        >
          {!detail ? (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700">
              {loadingDetail ? t.siUploading : t.siNoStatements}
            </div>
          ) : (
            <div className={`flex min-h-0 flex-col gap-3 ${tableExpanded ? 'h-full' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {detail.fileName}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {pendingRows.length > 0 && (
                    <span className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      {t.siPendingBadge.replace('{count}', String(pendingRows.length))}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setTableExpanded((v) => !v)}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    title={tableExpanded ? t.siTableFullscreenExit : t.siTableFullscreenEnter}
                    aria-label={tableExpanded ? t.siTableFullscreenExit : t.siTableFullscreenEnter}
                  >
                    {tableExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={openWizard}
                    disabled={pendingRows.length === 0}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <ChevronRight size={14} />
                    {t.siReviewPending}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollTableHorizontally('left')}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                    title={t.siTableScrollLeft}
                    aria-label={t.siTableScrollLeft}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTableHorizontally('right')}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                    title={t.siTableScrollRight}
                    aria-label={t.siTableScrollRight}
                  >
                    <ChevronRight size={16} />
                  </button>
                  <span className="ml-1 text-[11px] text-slate-400">{t.siTableScrollHint}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safeTablePage <= 0}
                    onClick={() => setTablePage((p) => Math.max(0, p - 1))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                    title={t.siPrev}
                    aria-label={t.siPrev}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="min-w-[7rem] text-center text-xs text-slate-500 dark:text-slate-400">
                    {t.siTablePageInfo
                      .replace('{from}', String(tablePageFrom))
                      .replace('{to}', String(tablePageTo))
                      .replace('{total}', String(allTableRows.length))}
                  </span>
                  <button
                    type="button"
                    disabled={safeTablePage >= tablePageCount - 1}
                    onClick={() => setTablePage((p) => Math.min(tablePageCount - 1, p + 1))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                    title={t.siNext}
                    aria-label={t.siNext}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div
                ref={tableScrollRef}
                className={`overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700 ${
                  tableExpanded ? 'min-h-0 flex-1 overflow-y-auto' : 'max-h-[min(70vh,720px)] overflow-y-auto'
                }`}
              >
                <table className={`w-full text-xs ${tableExpanded ? 'min-w-[1500px]' : 'min-w-[1100px]'}`}>
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                    <tr>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColDate}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColCounterparty}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColAccount}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColBankCode}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siBankName}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColPurpose}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColCompanyAccount}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColCompanyBank}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColCompanyStir}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-right font-semibold">{t.siColAmount}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColStatus}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColLink}</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{t.siColCreatedBy}</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTableRows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`border-t border-slate-100 dark:border-slate-700 ${index % 2 !== 0 ? 'bg-slate-50/30 dark:bg-slate-800/30' : ''}`}
                      >
                        <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-slate-300">
                          {row.operationDate.slice(0, 10)}
                        </td>
                        <td className="px-3 py-2">
                          <div
                            className={`font-medium text-slate-700 dark:text-slate-200 ${
                              tableExpanded
                                ? 'min-w-[180px] whitespace-normal'
                                : 'min-w-[140px] max-w-[220px] truncate'
                            }`}
                          >
                            {row.receiverName || EMPTY_PLACEHOLDER}
                          </div>
                          {row.receiverStir && (
                            <div className="text-[10px] text-slate-400">{row.receiverStir}</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">
                          {row.receiverAccount || EMPTY_PLACEHOLDER}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">
                          {row.receiverBankCode || EMPTY_PLACEHOLDER}
                        </td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                          <div className={tableExpanded ? 'min-w-[140px] whitespace-normal' : 'max-w-[160px] truncate'}>
                            {row.receiverBankName || EMPTY_PLACEHOLDER}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                          <div className={tableExpanded ? 'min-w-[200px] whitespace-normal' : 'max-w-[240px] truncate'}>
                            {row.paymentPurpose || EMPTY_PLACEHOLDER}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">
                          {row.companyAccount || EMPTY_PLACEHOLDER}
                        </td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                          <div className={tableExpanded ? 'min-w-[140px] whitespace-normal' : 'max-w-[160px] truncate'}>
                            {row.companyBankName || EMPTY_PLACEHOLDER}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">
                          {row.companyStir || EMPTY_PLACEHOLDER}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${row.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                          >
                            {row.type === 'income' ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                            {formatCurrency(row.amount)}
                          </span>
                        </td>
                        <td className="px-3 py-2">{statusBadge(row)}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                          <div className={tableExpanded ? 'min-w-[120px] whitespace-normal' : 'max-w-[160px] truncate'}>
                            {linkLabel(row)}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                          <div className="whitespace-nowrap">{row.updatedByName ?? row.createdByName ?? EMPTY_PLACEHOLDER}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(row)}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allTableRows.length === 0 && (
                      <tr>
                        <td colSpan={14} className="px-3 py-8 text-center text-slate-400">
                          {detail.errorMessage || t.siNoStatements}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wizard dialog */}
      <Dialog open={wizardOpen} onOpenChange={(open) => !open && setWizardOpen(false)}>
        <DialogContent
          className={`max-w-lg ${modalAboveFullscreen.className ?? ''}`}
          overlayClassName={modalAboveFullscreen.overlayClassName}
        >
          <DialogHeader>
            <DialogTitle>{t.siWizardTitle}</DialogTitle>
            <DialogDescription>
              {currentRow
                ? t.siWizardStep
                    .replace('{current}', String(wizardIndex + 1))
                    .replace('{total}', String(pendingRows.length))
                : t.siAllReviewed}
            </DialogDescription>
          </DialogHeader>

          {currentRow && (
            <div className="space-y-4">
              {/* Row summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{formatDate(currentRow.operationDate.slice(0, 10))}</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${currentRow.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {currentRow.type === 'income' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                    {formatCurrency(currentRow.amount)} ·{' '}
                    {currentRow.type === 'income' ? t.siTypeIncome : t.siTypeExpense}
                  </span>
                </div>
                <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                  {currentRow.receiverName || EMPTY_PLACEHOLDER}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentRow.receiverAccount || EMPTY_PLACEHOLDER}
                  {currentRow.receiverBankCode ? ` · ${t.siColBankCode}: ${currentRow.receiverBankCode}` : ''}
                  {currentRow.receiverBankName ? ` · ${t.siBankName}: ${currentRow.receiverBankName}` : ''}
                  {currentRow.receiverStir ? ` · ${t.siRowStir}: ${currentRow.receiverStir}` : ''}
                </div>
                {(currentRow.companyAccount || currentRow.companyBankName || currentRow.companyStir) && (
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {currentRow.companyAccount ? `${t.siColCompanyAccount}: ${currentRow.companyAccount}` : ''}
                    {currentRow.companyBankName ? ` · ${t.siColCompanyBank}: ${currentRow.companyBankName}` : ''}
                    {currentRow.companyStir ? ` · ${t.siColCompanyStir}: ${currentRow.companyStir}` : ''}
                  </div>
                )}
                {currentRow.paymentPurpose && (
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{currentRow.paymentPurpose}</div>
                )}
                {currentRow.counterpartyKind === 'company' && (
                  <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                    {t.siCompanyRowNote}
                  </div>
                )}
              </div>

              {/* Manual edit toggle */}
              {manualOpen ? (
                <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 dark:border-indigo-900 dark:bg-indigo-950/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.siUnclearHint}</p>
                  <div>
                    <FieldLabel>{t.siColType}</FieldLabel>
                    <StyledSelect
                      value={mType}
                      onValueChange={(v) => setMType(v as 'income' | 'expense')}
                      options={[
                        { value: 'income', label: t.siTypeIncome },
                        { value: 'expense', label: t.siTypeExpense },
                      ]}
                    />
                  </div>
                  <div>
                    <FieldLabel>{t.siColCounterparty}</FieldLabel>
                    <TextInput value={mReceiver} onChange={(e) => setMReceiver(e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>{t.siColAccount}</FieldLabel>
                    <TextInput value={mAccount} onChange={(e) => setMAccount(e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>{t.siColPurpose}</FieldLabel>
                    <TextInput value={mPurpose} onChange={(e) => setMPurpose(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleManualSave}
                      disabled={busy}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {t.btnSave}
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualOpen(false)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
                    >
                      {t.btnCancel}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mode switch */}
                  {currentRow.type === 'income' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setMode('client_inflow')}
                        className={`rounded-xl border px-2 py-2 text-xs font-medium transition sm:text-sm ${
                          mode === 'client_inflow'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t.siModeClient}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('kassa_inflow')}
                        className={`rounded-xl border px-2 py-2 text-xs font-medium transition sm:text-sm ${
                          mode === 'kassa_inflow'
                            ? 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300'
                            : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t.siModeKassa}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('expense')}
                        className={`rounded-xl border px-2 py-2 text-xs font-medium transition sm:text-sm ${
                          mode === 'expense'
                            ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
                            : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t.siModeExpense}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                      {t.siModeExpense}
                    </div>
                  )}

                  {mode === 'client_inflow' ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.siQuestionClient}</p>
                      {creatingClient ? (
                        <div>
                          <FieldLabel>{t.siNewName}</FieldLabel>
                          <TextInput value={newName} onChange={(e) => setNewName(e.target.value)} />
                          <button
                            type="button"
                            onClick={() => setCreatingClient(false)}
                            className="mt-1 text-xs text-indigo-600 hover:underline"
                          >
                            {t.siSelectClient}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FieldLabel>{t.siSelectClient}</FieldLabel>
                          <StyledSelect
                            value={clientId}
                            onValueChange={setClientId}
                            placeholder={t.siSelectClient}
                            options={sortedClients.map((c) => ({ value: c.id, label: c.name }))}
                          />
                          {!clientId && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{t.siClientNotFound}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setCreatingClient(true);
                              setNewName(currentRow.receiverName ?? '');
                            }}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                          >
                            <UserPlus size={12} /> {t.siCreateClient}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : mode === 'kassa_inflow' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {t.siQuestionKassa}
                      </p>
                      <p className="text-xs text-slate-400">{t.siKassaInflowHint}</p>
                      {currentRow.receiverName && (
                        <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                          {currentRow.receiverName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.siQuestionExpense}</p>
                      <div>
                        {creatingCategory ? (
                          <>
                            <FieldLabel>{t.exCategoryName}</FieldLabel>
                            <TextInput
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder={t.exCategoryName}
                            />
                            <button
                              type="button"
                              onClick={() => setCreatingCategory(false)}
                              className="mt-1 text-xs text-indigo-600 hover:underline"
                            >
                              {t.siSelectCategory}
                            </button>
                          </>
                        ) : (
                          <>
                            <FieldLabel>{t.siSelectCategory}</FieldLabel>
                            <StyledSelect
                              value={categoryId}
                              onValueChange={setCategoryId}
                              placeholder={t.siSelectCategory}
                              options={categories.map((c) => ({ value: c.id, label: c.name }))}
                            />
                            {!categoryId && !suggestedCategoryId && (
                              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                {t.siCategoryNotFound}
                              </p>
                            )}
                            {categoryId && (
                              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                {t.siCategoryMatched}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setCreatingCategory(true);
                                setNewCategoryName(suggestCategoryName(currentRow));
                              }}
                              className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                            >
                              <FolderPlus size={12} /> {t.siCreateCategory}
                            </button>
                          </>
                        )}
                      </div>
                      {creatingSupplier ? (
                        <div>
                          <FieldLabel>{t.siNewName}</FieldLabel>
                          <TextInput value={newName} onChange={(e) => setNewName(e.target.value)} />
                          <button
                            type="button"
                            onClick={() => setCreatingSupplier(false)}
                            className="mt-1 text-xs text-indigo-600 hover:underline"
                          >
                            {t.siSelectSupplier}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FieldLabel>{t.siSupplierOptional}</FieldLabel>
                          <StyledSelect
                            value={supplierId}
                            onValueChange={setSupplierId}
                            placeholder={t.siSupplierOptional}
                            options={sortedSuppliers.map((s) => ({ value: s.id, label: s.name }))}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCreatingSupplier(true);
                              setNewName(currentRow.receiverName ?? '');
                            }}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                          >
                            <Building2 size={12} /> {t.siCreateSupplier}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* amount + date + comment */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>{t.siColAmount}</FieldLabel>
                      <TextInput
                        value={amount}
                        inputMode="numeric"
                        onChange={(e) => setAmount(displayGroupedIntInput(e.target.value))}
                      />
                    </div>
                    <div>
                      <FieldLabel>{t.siColDate}</FieldLabel>
                      <SingleDatePicker
                        value={entryDate}
                        onChange={setEntryDate}
                        menuZClassName="z-[200]"
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>{t.siColPurpose}</FieldLabel>
                    <TextInput value={comment} onChange={(e) => setComment(e.target.value)} />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={busy}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircle size={14} /> {t.siConfirmYes}
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualOpen(true)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
                    >
                      <Pencil size={14} /> {t.siManual}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={busy}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400"
                    >
                      <X size={14} /> {t.siSkip}
                    </button>
                  </div>
                </>
              )}

              {/* Step navigation */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                <button
                  type="button"
                  disabled={wizardIndex === 0}
                  onClick={() => {
                    const i = Math.max(0, wizardIndex - 1);
                    setWizardIndex(i);
                    initRowForm(pendingRows[i]);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 disabled:opacity-40 dark:text-slate-400"
                >
                  <ChevronLeft size={14} /> {t.siPrev}
                </button>
                <button
                  type="button"
                  disabled={wizardIndex >= pendingRows.length - 1}
                  onClick={() => {
                    const i = Math.min(pendingRows.length - 1, wizardIndex + 1);
                    setWizardIndex(i);
                    initRowForm(pendingRows[i]);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 disabled:opacity-40 dark:text-slate-400"
                >
                  {t.siNext} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete statement confirm */}
      <AlertDialog
        open={!!deleteStatementTarget}
        onOpenChange={(open) => !open && setDeleteStatementTarget(null)}
      >
        <AlertDialogContent
          overlayClassName={modalAboveFullscreen.overlayClassName}
          className={modalAboveFullscreen.className}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t.siDeleteStatementTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.siDeleteStatementConfirm.replace(
                '{name}',
                deleteStatementTarget?.fileName ?? '',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.btnCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStatement}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {t.whDeleteAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete row confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent
          overlayClassName={modalAboveFullscreen.overlayClassName}
          className={modalAboveFullscreen.className}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t.siDeleteRowTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.siDeleteRowConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.btnCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRow}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {t.whDeleteAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
