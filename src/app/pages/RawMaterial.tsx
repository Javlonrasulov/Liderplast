import React, { useMemo, useState } from 'react';
import {
  Plus,
  Droplets,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Link2,
  RefreshCw,
  Ban,
  Package,
  History,
  ChevronDown,
} from 'lucide-react';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatNumber, formatDate, TODAY, calcPercent } from '../utils/format';
import { SingleDatePicker } from '../components/SingleDatePicker';

function SelectField(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full h-11 appearance-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 px-3 pr-10 text-sm text-slate-800 dark:text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 dark:focus:border-indigo-500 ${props.className ?? ''}`}
      />
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
    </div>
  );
}

export function RawMaterial() {
  const { state, dispatch, rawMaterialStock } = useERP();
  const { t, filterData } = useApp();
  const [form, setForm] = useState({ amount: '', unit: 'kg', description: '', date: TODAY });
  const [bagForm, setBagForm] = useState({ rawMaterialId: '', name: '', initialQuantityKg: '' });
  const [quickForm, setQuickForm] = useState({
    pieceCount: '',
    gramPerUnit: '18',
    quantityKg: '',
    note: '',
  });
  const [selectedBagId, setSelectedBagId] = useState('');
  const [switchBagId, setSwitchBagId] = useState('');
  const [switchAction, setSwitchAction] = useState<'RETURN_TO_STORAGE' | 'WRITE_OFF'>('RETURN_TO_STORAGE');
  const [switchReason, setSwitchReason] = useState('');
  const [writeoffReason, setWriteoffReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const MAX_STOCK = 5000;
  const stockPercent = calcPercent(rawMaterialStock, MAX_STOCK);
  const lowStock = rawMaterialStock < 1000;
  const criticalStock = rawMaterialStock < 500;
  const activeBag = state.activeRawMaterialBag;

  const totalIncoming = state.rawMaterialEntries.filter(e => e.type === 'incoming').reduce((s, e) => s + e.amount, 0);
  const totalOutgoing = state.rawMaterialEntries.filter(e => e.type === 'outgoing').reduce((s, e) => s + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amountKg = form.unit === 'ton' ? parseFloat(form.amount) * 1000 : parseFloat(form.amount);
    if (!form.amount || isNaN(amountKg) || amountKg <= 0) { setError(t.labelAmount + '!'); return; }
    dispatch({ type: 'ADD_RAW_MATERIAL', payload: { amount: amountKg, description: form.description || 'PET siro kirimi', date: form.date } });
    setForm({ amount: '', unit: 'kg', description: '', date: TODAY });
    setSuccess(`${formatNumber(amountKg)} ${t.unitKg} ${t.successAdded}`);
    setTimeout(() => setSuccess(''), 3000);
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
    for (const bag of state.rawMaterialBags) {
      names.set(bag.rawMaterialId, bag.rawMaterialName);
    }
    for (const entry of state.rawMaterialEntries) {
      if (!names.size && entry.description) {
        names.set('fallback', entry.description);
      }
    }
    return Array.from(names.entries()).map(([id, name]) => ({ id, name }));
  }, [state.rawMaterialBags, state.rawMaterialEntries]);

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
  const bagAmountKg = parseFloat(bagForm.initialQuantityKg || '0');
  const quickConsumeKg = quickForm.quantityKg
    ? parseFloat(quickForm.quantityKg || '0')
    : ((parseFloat(quickForm.pieceCount || '0') || 0) * (parseFloat(quickForm.gramPerUnit || '0') || 0)) / 1000;

  const handleCreateBag = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const rawMaterialId = bagForm.rawMaterialId || availableRawMaterials[0]?.id;
    if (!rawMaterialId || !bagAmountKg || bagAmountKg <= 0) {
      setError(t.rmBagCreateError);
      return;
    }
    await dispatch({
      type: 'CREATE_RAW_MATERIAL_BAG',
      payload: {
        rawMaterialId,
        name: bagForm.name || undefined,
        initialQuantityKg: bagAmountKg,
      },
    });
    setBagForm({ rawMaterialId: rawMaterialId, name: '', initialQuantityKg: '' });
    setSuccess(t.rmBagCreatedSuccess);
    setTimeout(() => setSuccess(''), 3000);
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

  const handleQuickConsume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickConsumeKg || quickConsumeKg <= 0) {
      setError(t.rmQuickConsumeError);
      return;
    }
    setError('');
    await dispatch({
      type: 'QUICK_CONSUME_RAW_MATERIAL_BAG',
      payload: {
        rawMaterialId: activeBag?.rawMaterialId,
        quantityKg: quickForm.quantityKg ? quickConsumeKg : undefined,
        pieceCount: quickForm.quantityKg ? undefined : parseFloat(quickForm.pieceCount || '0'),
        gramPerUnit: quickForm.quantityKg ? undefined : parseFloat(quickForm.gramPerUnit || '0'),
        note: quickForm.note || undefined,
      },
    });
    setQuickForm({
      pieceCount: '',
      gramPerUnit: quickForm.gramPerUnit,
      quantityKg: '',
      note: '',
    });
    setSuccess(t.rmQuickConsumeSuccess);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
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

      {/* Stock level bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.rmStockLevel}</h3>
          <span className="text-slate-500 dark:text-slate-400 text-sm">{stockPercent.toFixed(1)}% ({formatNumber(rawMaterialStock)} / {formatNumber(MAX_STOCK)} {t.unitKg})</span>
        </div>
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${criticalStock ? 'bg-red-500' : lowStock ? 'bg-amber-500' : stockPercent > 60 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${stockPercent}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
          <span>0 {t.unitKg}</span>
          <span className="text-red-400">{t.rmCritical}</span>
          <span className="text-amber-400">{t.rmWarning}</span>
          <span>{formatNumber(MAX_STOCK)} {t.unitKg}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
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
                <SelectField value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-[110px]">
                  <option value="kg">{t.unitKg}</option>
                  <option value="ton">{t.unitTon}</option>
                </SelectField>
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
              </div>
            )}
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div>}

            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
              <Plus size={16} /> {t.rmAddBtn}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.rmHistory}</h3>
            <span className="text-xs text-slate-400">{filteredEntries.length} {t.totalRecords}</span>
          </div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleCreateBag} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-indigo-500" />
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{t.rmCreateBagTitle}</h3>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.rmBagRawMaterial}</label>
                <SelectField
                  value={bagForm.rawMaterialId}
                  onChange={(e) => setBagForm({ ...bagForm, rawMaterialId: e.target.value })}
                >
                  <option value="">{t.rmBagSelectRawMaterial}</option>
                  {availableRawMaterials.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </SelectField>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.rmBagName}</label>
                <input
                  type="text"
                  value={bagForm.name}
                  onChange={(e) => setBagForm({ ...bagForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder={t.rmBagNamePlaceholder}
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.rmBagInitial}</label>
                <input
                  type="number"
                  min="0"
                  value={bagForm.initialQuantityKg}
                  onChange={(e) => setBagForm({ ...bagForm, initialQuantityKg: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
                {t.rmCreateBagButton}
              </button>
            </form>

            <form onSubmit={handleQuickConsume} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-indigo-500" />
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{t.rmQuickConsumeTitle}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.rmQuickConsumePieces}</label>
                  <input
                    type="number"
                    min="0"
                    value={quickForm.pieceCount}
                    onChange={(e) => setQuickForm({ ...quickForm, pieceCount: e.target.value, quantityKg: '' })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.rmQuickConsumeGram}</label>
                  <input
                    type="number"
                    min="0"
                    value={quickForm.gramPerUnit}
                    onChange={(e) => setQuickForm({ ...quickForm, gramPerUnit: e.target.value, quantityKg: '' })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.rmQuickConsumeDirectKg}</label>
                <input
                  type="number"
                  min="0"
                  value={quickForm.quantityKg}
                  onChange={(e) => setQuickForm({ ...quickForm, quantityKg: e.target.value, pieceCount: '', gramPerUnit: quickForm.gramPerUnit })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-sm mb-1.5">{t.labelDesc}</label>
                <input
                  type="text"
                  value={quickForm.note}
                  onChange={(e) => setQuickForm({ ...quickForm, note: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder={t.rmQuickConsumeNote}
                />
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 text-sm text-slate-600 dark:text-slate-300">
                {t.rmQuickConsumeResult}: <span className="font-semibold text-slate-900 dark:text-white">{formatNumber(quickConsumeKg)} {t.unitKg}</span>
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
                {t.rmQuickConsumeButton}
              </button>
            </form>
          </div>

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
                <SelectField
                  value={selectedBagId}
                  onChange={(e) => setSelectedBagId(e.target.value)}
                >
                  <option value="">{t.rmBagSelect}</option>
                  {state.rawMaterialBags.filter((item) => item.status === 'IN_STORAGE').map((bag) => (
                    <option key={bag.id} value={bag.id}>{bag.name}</option>
                  ))}
                </SelectField>
                <button type="button" onClick={() => void handleConnectBag()} className="w-full py-2.5 rounded-xl border border-indigo-200 text-indigo-700 dark:text-indigo-300 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-medium">
                  {t.rmBagConnectButton}
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-slate-600 dark:text-slate-400 text-sm">{t.rmBagSwitchTitle}</label>
                <SelectField
                  value={switchBagId}
                  onChange={(e) => setSwitchBagId(e.target.value)}
                >
                  <option value="">{t.rmBagSelectReplacement}</option>
                  {state.rawMaterialBags
                    .filter((item) => item.status === 'IN_STORAGE' && item.id !== activeBag?.id)
                    .map((bag) => (
                      <option key={bag.id} value={bag.id}>{bag.name}</option>
                    ))}
                </SelectField>
                <SelectField
                  value={switchAction}
                  onChange={(e) => setSwitchAction(e.target.value as 'RETURN_TO_STORAGE' | 'WRITE_OFF')}
                >
                  <option value="RETURN_TO_STORAGE">{t.rmBagSwitchReturn}</option>
                  <option value="WRITE_OFF">{t.rmBagSwitchWriteoff}</option>
                </SelectField>
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

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={16} className="text-indigo-500" />
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{t.rmBagsTitle}</h3>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
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
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
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
    </div>
  );
}