import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Droplets,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Pencil,
  Link2,
  RefreshCw,
  Ban,
  Package,
  History,
  ChevronDown,
} from 'lucide-react';
import { useERP, type RawMaterialKind } from '../store/erp-store';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const NONE = '__none__';

const SELECT_TRIGGER_CLS =
  'h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white';

const SELECT_CONTENT_CLS =
  'z-[120] max-h-72 min-w-[var(--radix-select-trigger-width)] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900';

const SELECT_ITEM_CLS =
  'cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-white';

export function RawMaterial() {
  const { state, dispatch, rawMaterialStock } = useERP();
  const { t, filterData } = useApp();
  const [form, setForm] = useState({ amount: '', unit: 'kg', description: '', date: TODAY });
  const [createForm, setCreateForm] = useState<{
    name: string;
    description: string;
    defaultBagWeightKg: string;
    rawMaterialKind: RawMaterialKind;
  }>({ name: '', description: '', defaultBagWeightKg: '', rawMaterialKind: 'SIRO' });
  const [selectedBagId, setSelectedBagId] = useState('');
  const [switchBagId, setSwitchBagId] = useState('');
  const [switchAction, setSwitchAction] = useState<'RETURN_TO_STORAGE' | 'WRITE_OFF'>('RETURN_TO_STORAGE');
  const [switchReason, setSwitchReason] = useState('');
  const [writeoffReason, setWriteoffReason] = useState('');
  const [editingBagId, setEditingBagId] = useState('');
  const [editingBagName, setEditingBagName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [incomingRawMaterialId, setIncomingRawMaterialId] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  const lowStock = rawMaterialStock < 1000;
  const criticalStock = rawMaterialStock < 500;
  const activeBag = state.activeRawMaterialBag;

  const totalIncoming = state.rawMaterialEntries.filter(e => e.type === 'incoming').reduce((s, e) => s + e.amount, 0);
  const totalOutgoing = state.rawMaterialEntries.filter(e => e.type === 'outgoing').reduce((s, e) => s + e.amount, 0);

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
    if (!isPaint) {
      const parsed = parseFloat(createForm.defaultBagWeightKg.replace(',', '.'));
      if (!createForm.defaultBagWeightKg || !Number.isFinite(parsed) || parsed <= 0) {
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

  const filteredBagLogs = filterData(
    state.bagLogs.map((item) => ({
      ...item,
      date: item.createdAt.slice(0, 10),
    })),
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const availableRawMaterials = useMemo(() => {
    const names = new Map<string, string>();
    for (const item of state.warehouseProducts) {
      if (item.itemType === 'RAW_MATERIAL') {
        names.set(item.id, item.name);
      }
    }
    for (const bag of state.rawMaterialBags) {
      names.set(bag.rawMaterialId, bag.rawMaterialName);
    }
    for (const entry of state.rawMaterialEntries) {
      if (!names.size && entry.description) {
        names.set('fallback', entry.description);
      }
    }
    return Array.from(names.entries()).map(([id, name]) => ({ id, name }));
  }, [state.warehouseProducts, state.rawMaterialBags, state.rawMaterialEntries]);

  const rawMaterialAlerts = useMemo(() => {
    const stockByName = new Map<string, number>();
    for (const item of state.warehouseStock) {
      if (item.itemType === 'RAW_MATERIAL') {
        if (item.itemName) stockByName.set(item.itemName, item.quantity);
      }
    }

    return state.warehouseProducts
      .filter(
        (item): item is Extract<typeof item, { itemType: 'RAW_MATERIAL' }> =>
          item.itemType === 'RAW_MATERIAL',
      )
      .map((item) => {
        const quantityKg = stockByName.get(item.name) ?? 0;
        const level =
          quantityKg < 500 ? 'critical' : quantityKg < 1000 ? 'warning' : 'ok';
        return {
          id: item.id,
          name: item.name,
          quantityKg,
          level,
        };
      })
      .filter((item) => item.level !== 'ok')
      .sort((a, b) => a.quantityKg - b.quantityKg);
  }, [state.warehouseProducts, state.warehouseStock]);

  const resolvedIncomingRawMaterialId = useMemo(() => {
    if (availableRawMaterials.length === 0) return '';
    if (incomingRawMaterialId && availableRawMaterials.some((x) => x.id === incomingRawMaterialId)) {
      return incomingRawMaterialId;
    }
    return availableRawMaterials[0]?.id ?? '';
  }, [availableRawMaterials, incomingRawMaterialId]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const rawMaterialId = resolvedIncomingRawMaterialId;
    const amountKg = form.unit === 'ton' ? parseFloat(form.amount) * 1000 : parseFloat(form.amount);
    if (!rawMaterialId) { setError(t.rmSelectRawMaterialRequired); return; }
    if (!form.amount || isNaN(amountKg) || amountKg <= 0) { setError(t.labelAmount + '!'); return; }
    dispatch({ type: 'ADD_RAW_MATERIAL', payload: { rawMaterialId, amount: amountKg, description: form.description || t.rmDefaultIncomingNote, date: form.date } });
    setForm({ amount: '', unit: 'kg', description: '', date: TODAY });
    setSuccess(`${formatNumber(amountKg)} ${t.unitKg} ${t.successAdded}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const bagStatusTone: Record<string, string> = {
    IN_STORAGE: 'bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200',
    CONNECTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    DEPLETED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    WRITTEN_OFF: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  const bagStatusLabel: Record<string, string> = {
    IN_STORAGE: t.rmBagStatusStorage,
    CONNECTED: t.rmBagStatusConnected,
    DEPLETED: t.rmBagStatusDepleted,
    WRITTEN_OFF: t.rmBagStatusWrittenOff,
  };

  const actionLabel: Record<string, string> = {
    CREATED: t.rmLogCreated,
    CONNECTED: t.rmLogConnected,
    DISCONNECTED: t.rmLogDisconnected,
    RETURNED_TO_STORAGE: t.rmLogReturned,
    CONSUMED: t.rmLogConsumed,
    DEPLETED: t.rmLogDepleted,
    WRITTEN_OFF: t.rmLogWrittenOff,
  };

  const amountKg = form.unit === 'ton' ? parseFloat(form.amount || '0') * 1000 : parseFloat(form.amount || '0');
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

  const openEditBagName = (bagId: string, currentName: string) => {
    setEditingBagId(bagId);
    setEditingBagName(currentName);
    setError('');
  };

  const closeEditBagName = () => {
    setEditingBagId('');
    setEditingBagName('');
  };

  const submitEditBagName = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextName = editingBagName.trim();
    if (!editingBagId || !nextName) return;
    setError('');
    try {
      await dispatch({
        type: 'UPDATE_RAW_MATERIAL_BAG_NAME',
        payload: { bagId: editingBagId, name: nextName },
      });
      setSuccess(t.btnSave);
      setTimeout(() => setSuccess(''), 2000);
      closeEditBagName();
    } catch (err) {
      setError(
        err instanceof Error
          ? translateWarehouseApiError(err.message, t)
          : t.whRequestError,
      );
    }
  };

  const handleConnectBag = async () => {
    const bagId = selectedBagId || state.rawMaterialBags.find((item) => item.status === 'IN_STORAGE')?.id;
    if (!bagId) {
      setError(t.rmBagConnectError);
      return;
    }
    setError('');
    await dispatch({ type: 'CONNECT_RAW_MATERIAL_BAG', payload: { bagId } });
    setSuccess(t.rmBagConnectedSuccess);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSwitchBag = async () => {
    if (!switchBagId) {
      setError(t.rmBagSwitchError);
      return;
    }
    setError('');
    await dispatch({
      type: 'SWITCH_RAW_MATERIAL_BAG',
      payload: {
        nextBagId: switchBagId,
        previousBagAction: switchAction,
        reason: switchReason || undefined,
      },
    });
    setSwitchBagId('');
    setSwitchReason('');
    setSuccess(t.rmBagSwitchedSuccess);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleWriteoffBag = async () => {
    if (!activeBag?.id) {
      setError(t.rmBagWriteoffError);
      return;
    }
    setError('');
    await dispatch({
      type: 'WRITE_OFF_RAW_MATERIAL_BAG',
      payload: {
        bagId: activeBag.id,
        reason: writeoffReason || undefined,
      },
    });
    setWriteoffReason('');
    setSuccess(t.rmBagWrittenOffSuccess);
    setTimeout(() => setSuccess(''), 3000);
  };

  // NOTE: quick consume + manual bag creation removed (handled elsewhere)

  return (
    <div className="min-h-full bg-slate-50 p-4 lg:p-6 flex flex-col gap-6 dark:bg-slate-950">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <ArrowDownCircle size={18} className="text-white" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-sm">{t.rmTotalIn}</span>
          </div>
          <p className="text-slate-900 dark:text-white text-2xl font-bold">{formatNumber(totalIncoming)} <span className="text-sm text-slate-400 font-normal">{t.unitKg}</span></p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <ArrowUpCircle size={18} className="text-white" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-sm">{t.rmTotalOut}</span>
          </div>
          <p className="text-slate-900 dark:text-white text-2xl font-bold">{formatNumber(totalOutgoing)} <span className="text-sm text-slate-400 font-normal">{t.unitKg}</span></p>
        </div>
        <div className={`rounded-2xl border p-5 shadow-sm ${criticalStock ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' : lowStock ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${criticalStock ? 'bg-red-500' : lowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}>
              {lowStock ? <AlertTriangle size={18} className="text-white" /> : <Droplets size={18} className="text-white" />}
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-sm">{t.rmRemaining}</span>
          </div>
          <p className={`text-2xl font-bold ${criticalStock ? 'text-red-600' : lowStock ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
            {formatNumber(rawMaterialStock)} <span className="text-sm font-normal text-slate-400">{t.unitKg}</span>
          </p>
          {lowStock && <p className="text-xs mt-1 text-amber-600 dark:text-amber-400 font-medium">⚠ {t.dashOrderMaterial}</p>}
        </div>
      </div>

      {rawMaterialAlerts.length > 0 && (
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
            {rawMaterialAlerts.map((item) => (
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
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
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
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.rmNewEntry}</h3>
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
                    {availableRawMaterials.map((item) => (
                      <SelectItem key={item.id} value={item.id} className={SELECT_ITEM_CLS}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 mt-1">{t.rmIncomingHint}</p>
                {incomingRawMaterial?.itemType === 'RAW_MATERIAL' && incomingRawMaterial.defaultBagWeightKg ? (
                  <p className="text-xs text-indigo-500 mt-1">
                    {t.rmIncomingBagWeightHint
                      .replace('{weight}', formatNumber(incomingRawMaterial.defaultBagWeightKg))
                      .replace('{unit}', t.unitKg)}
                  </p>
                ) : (
                  <p className="text-xs text-amber-500 mt-1">{t.rmAutoBagMissingHint}</p>
                )}
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
                  <div className="w-[140px]">
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
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t.rmPlaceholderDesc}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>

              {form.amount && amountKg > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                  <p className="text-blue-700 dark:text-blue-400 text-xs font-medium">{t.rmPreviewAdd}</p>
                  <p className="text-blue-800 dark:text-blue-300 text-sm font-bold mt-0.5">{formatNumber(amountKg)} {t.unitKg}</p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">{t.rmPreviewBalance} {formatNumber(rawMaterialStock + amountKg)} {t.unitKg}</p>
                  {incomingAutoBagCount > 0 && incomingRawMaterial?.itemType === 'RAW_MATERIAL' ? (
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
                    <td className="px-4 py-3 text-right"><span className={`text-sm font-bold ${lowStock ? 'text-amber-600' : 'text-emerald-600'}`}>{formatNumber(rawMaterialStock)} {t.unitKg}</span></td>
                    <td className="hidden md:table-cell" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{t.rmActiveBagTitle}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t.rmActiveBagSubtitle}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                <Package size={18} className="text-white" />
              </div>
            </div>

            {!activeBag ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-5 text-sm text-slate-500 dark:text-slate-400">
                {t.rmNoActiveBag}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{activeBag.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{activeBag.rawMaterialName}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${bagStatusTone[activeBag.status]}`}>
                    {bagStatusLabel[activeBag.status]}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.rmBagInitial}</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatNumber(activeBag.initialQuantityKg)} {t.unitKg}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.rmBagRemaining}</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatNumber(activeBag.currentQuantityKg)} {t.unitKg}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.rmBagConnectedAt}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activeBag.sessions[0]?.connectedAt ? formatDate(activeBag.sessions[0].connectedAt.slice(0, 10)) : '—'}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span>{t.rmBagProgress}</span>
                    <span>{Math.max(0, Math.min(100, (activeBag.currentQuantityKg / activeBag.initialQuantityKg) * 100)).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, (activeBag.currentQuantityKg / activeBag.initialQuantityKg) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* NOTE: manual bag creation + quick consume removed */}

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-indigo-500" />
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{t.rmBagActionsTitle}</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <label className="block text-slate-600 dark:text-slate-400 text-sm">{t.rmBagConnectTitle}</label>
                <Select
                  value={selectedBagId || NONE}
                  onValueChange={(v) => setSelectedBagId(v === NONE ? '' : v)}
                >
                  <SelectTrigger className={SELECT_TRIGGER_CLS}>
                    <SelectValue placeholder={t.rmBagSelect} />
                  </SelectTrigger>
                  <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
                    <SelectItem value={NONE} className={SELECT_ITEM_CLS}>
                      —
                    </SelectItem>
                    {state.rawMaterialBags
                      .filter((item) => item.status === 'IN_STORAGE')
                      .map((bag) => (
                        <SelectItem key={bag.id} value={bag.id} className={SELECT_ITEM_CLS}>
                          {bag.name} — {formatNumber(bag.currentQuantityKg)} {t.unitKg}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <button type="button" onClick={() => void handleConnectBag()} className="w-full py-2.5 rounded-xl border border-indigo-200 text-indigo-700 dark:text-indigo-300 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-medium">
                  {t.rmBagConnectButton}
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-slate-600 dark:text-slate-400 text-sm">{t.rmBagSwitchTitle}</label>
                <Select
                  value={switchBagId || NONE}
                  onValueChange={(v) => setSwitchBagId(v === NONE ? '' : v)}
                >
                  <SelectTrigger className={SELECT_TRIGGER_CLS}>
                    <SelectValue placeholder={t.rmBagSelectReplacement} />
                  </SelectTrigger>
                  <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
                    <SelectItem value={NONE} className={SELECT_ITEM_CLS}>
                      —
                    </SelectItem>
                    {state.rawMaterialBags
                      .filter((item) => item.status === 'IN_STORAGE' && item.id !== activeBag?.id)
                      .map((bag) => (
                        <SelectItem key={bag.id} value={bag.id} className={SELECT_ITEM_CLS}>
                          {bag.name} — {formatNumber(bag.currentQuantityKg)} {t.unitKg}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  value={switchAction}
                  onValueChange={(v) => setSwitchAction(v as 'RETURN_TO_STORAGE' | 'WRITE_OFF')}
                >
                  <SelectTrigger className={SELECT_TRIGGER_CLS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className={SELECT_CONTENT_CLS}>
                    <SelectItem value="RETURN_TO_STORAGE" className={SELECT_ITEM_CLS}>
                      {t.rmBagSwitchReturn}
                    </SelectItem>
                    <SelectItem value="WRITE_OFF" className={SELECT_ITEM_CLS}>
                      {t.rmBagSwitchWriteoff}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="text"
                  value={switchReason}
                  onChange={(e) => setSwitchReason(e.target.value)}
                  placeholder={t.rmBagReasonPlaceholder}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button type="button" onClick={() => void handleSwitchBag()} className="w-full py-2.5 rounded-xl border border-indigo-200 text-indigo-700 dark:text-indigo-300 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-medium">
                  {t.rmBagSwitchButton}
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-slate-600 dark:text-slate-400 text-sm">{t.rmBagWriteoffTitle}</label>
                <input
                  type="text"
                  value={writeoffReason}
                  onChange={(e) => setWriteoffReason(e.target.value)}
                  placeholder={t.rmBagReasonPlaceholder}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button type="button" onClick={() => void handleWriteoffBag()} className="w-full py-2.5 rounded-xl border border-red-200 text-red-700 dark:text-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium">
                  {t.rmBagWriteoffButton}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={16} className="text-indigo-500" />
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{t.rmBagsTitle}</h3>
            </div>
            <div className="space-y-3">
              {state.rawMaterialBags.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.noData}</p>
              ) : (
                state.rawMaterialBags.map((bag) => (
                  <div key={bag.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{bag.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{bag.rawMaterialName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditBagName(bag.id, bag.name)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        title={t.whEdit}
                      >
                        <Pencil size={14} />
                      </button>
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium ${bagStatusTone[bag.status]}`}>
                        {bagStatusLabel[bag.status]}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400">{t.rmBagInitial}</p>
                        <p className="text-slate-700 dark:text-slate-200 font-medium">{formatNumber(bag.initialQuantityKg)} {t.unitKg}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">{t.rmBagRemaining}</p>
                        <p className="text-slate-700 dark:text-slate-200 font-medium">{formatNumber(bag.currentQuantityKg)} {t.unitKg}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-indigo-500" />
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{t.rmBagLogsTitle}</h3>
            </div>
            <div className="space-y-3">
              {filteredBagLogs.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.noData}</p>
              ) : (
                filteredBagLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{actionLabel[log.actionType] ?? log.actionType}</p>
                      <span className="text-[11px] text-slate-400">{formatDate(log.date)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{log.bagName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{log.note || t.rmNoLogNote}</p>
                    {log.quantityKg !== undefined && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2">{formatNumber(log.quantityKg)} {t.unitKg}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
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

      <Dialog open={Boolean(editingBagId)} onOpenChange={(open) => !open && closeEditBagName()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.whEdit}</DialogTitle>
            <DialogDescription>{t.rmBagName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEditBagName} className="space-y-4">
            <input
              value={editingBagName}
              onChange={(e) => setEditingBagName(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
              placeholder={t.rmBagNamePlaceholder}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditBagName}
                className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 text-sm font-medium"
              >
                {t.btnCancel}
              </button>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                {t.btnSave}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}