import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { useERP, type ShiftRecordKind } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatNumber, todayYmd } from '../utils/format';
import { translateShiftInventoryApiError } from '../utils/shift-api-errors';
import { SingleDatePicker } from '../components/SingleDatePicker';
import type { ShiftDefinition } from './ShiftWork';

const PRODUCT_COLORS: Record<string, string> = {
  '18g': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  '20g': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  '0.5L': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  '1L': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  '5L': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-violet-400',
};

function parseDecimalInput(raw: string): number {
  const normalized = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  if (normalized === '' || normalized === '.') return 0;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

function isValidPartialDecimalHours(raw: string): boolean {
  const v = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  if (v === '') return true;
  return /^[0-9]*\.?[0-9]*$/.test(v);
}

function parseNonNegativeInt(raw: string): number {
  const digits = String(raw).trim().replace(/\s/g, '').replace(/[^\d]/g, '');
  if (digits === '') return NaN;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : NaN;
}

function isValidPartialNonNegativeInt(raw: string): boolean {
  const v = String(raw).trim().replace(/\s/g, '').replace(/[^\d]/g, '');
  return v === '' || /^\d+$/.test(v);
}

function normalizeNonNegativeIntInput(raw: string): string {
  const v = String(raw).trim().replace(/\s/g, '').replace(/[^\d]/g, '');
  if (v === '') return '';
  const w = v.replace(/^0+(?=\d)/, '');
  return w === '' ? '0' : w;
}

type PackagingLine = {
  id: string;
  productType: string;
  hoursWorked: string;
  packCount: string;
  notes: string;
};

export type ShiftPackagingTranslations = {
  labelDate: string;
  labelShift: string;
  labelWorker: string;
  labelProduct: string;
  labelHours: string;
  labelPackCount: string;
  labelNotes: string;
  placeholderWorker: string;
  placeholderNotes: string;
  formAddRow: string;
  btn: string;
  labelMachine: string;
  shiftNoDefsHint: string;
  shiftNoDefsGoToTab: string;
  productTypesEmptyHint: string;
  shiftNoDefect: string;
  unitPiecesAbbr: string;
  hoursShort: string;
  packagingPiecesPreview: string;
  packagingPiecesPreviewSemi: string;
  packagingNoPiecesPerBag: string;
  packagingStockAvailable: string;
  packagingStockInsufficient: string;
  packagingMaxPacks: string;
};

type Props = {
  t: ShiftPackagingTranslations;
  shiftPickerDefs: ShiftDefinition[];
  /** Yarim tayyor + tayyor mahsulot nomlari */
  productOptions: string[];
  onNeedShiftDefs: () => void;
  getShiftLabel: (defs: ShiftDefinition[], shift: number) => string;
};

export function ShiftPackagingForm({
  t,
  shiftPickerDefs,
  productOptions,
  onNeedShiftDefs,
  getShiftLabel,
}: Props) {
  const { state, dispatch, refresh } = useERP();
  const { t: appT } = useApp();

  const [form, setForm] = useState({
    date: todayYmd(),
    shift: 1,
    workerName: '',
  });
  const [workerInputOpen, setWorkerInputOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const productKindByName = useMemo(() => {
    const m = new Map<string, 'SEMI' | 'FINISHED'>();
    for (const p of state.warehouseProducts) {
      const name = p.name?.trim();
      if (!name) continue;
      if (p.itemType === 'SEMI_PRODUCT') m.set(name.toLowerCase(), 'SEMI');
      if (p.itemType === 'FINISHED_PRODUCT') m.set(name.toLowerCase(), 'FINISHED');
    }
    return m;
  }, [state.warehouseProducts]);

  const piecesPerBagByProduct = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of state.warehouseProducts) {
      if (p.itemType !== 'FINISHED_PRODUCT') continue;
      const name = p.name?.trim();
      if (!name) continue;
      const ppb =
        'piecesPerBag' in p && p.piecesPerBag != null && p.piecesPerBag > 0
          ? p.piecesPerBag
          : 1;
      m.set(name.toLowerCase(), ppb);
    }
    return m;
  }, [state.warehouseProducts]);

  const semiPiecesPerBagByName = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of state.warehouseProducts) {
      if (p.itemType === 'SEMI_PRODUCT') {
        const ppb = p.piecesPerBag ?? 0;
        if (ppb > 0) m.set(p.name.trim().toLowerCase(), ppb);
      }
    }
    for (const p of state.warehouseProducts) {
      if (p.itemType !== 'FINISHED_PRODUCT') continue;
      const ppb =
        'piecesPerBag' in p && p.piecesPerBag != null && p.piecesPerBag > 0
          ? p.piecesPerBag
          : 0;
      if (ppb <= 0) continue;
      for (const sp of p.semiProducts) {
        const k = sp.name.trim().toLowerCase();
        if (!m.has(k)) m.set(k, ppb);
      }
    }
    return m;
  }, [state.warehouseProducts]);

  const unpackagedStockForProduct = useCallback(
    (productName: string): number => {
      const key = productName.trim().toLowerCase();
      const kind = productKindByName.get(key);
      if (!kind) return 0;
      const itemType =
        kind === 'FINISHED' ? 'FINISHED_PRODUCT' : 'SEMI_PRODUCT';
      let total = 0;
      let packaged = 0;
      for (const row of state.warehouseStock) {
        if (row.itemType !== itemType || !row.itemName) continue;
        if (row.itemName.trim().toLowerCase() !== key) continue;
        total += row.quantity;
        packaged += row.packagedQuantity ?? 0;
      }
      return Math.max(0, total - packaged);
    },
    [state.warehouseStock, productKindByName],
  );

  const createEmptyLine = useCallback((): PackagingLine => {
    return {
      id: `pkg-${Math.random().toString(16).slice(2)}`,
      productType: productOptions[0] || '',
      hoursWorked: '',
      packCount: '',
      notes: '',
    };
  }, [productOptions]);

  const [lines, setLines] = useState<PackagingLine[]>([]);
  const [expandedLineId, setExpandedLineId] = useState<string | null>(null);

  useEffect(() => {
    if (lines.length > 0) return;
    setLines([createEmptyLine()]);
  }, [lines.length, createEmptyLine]);

  useEffect(() => {
    if (lines.length === 0) return;
    setExpandedLineId((prev) => {
      if (prev && lines.some((l) => l.id === prev)) return prev;
      return lines[lines.length - 1]?.id ?? null;
    });
  }, [lines]);

  const filteredWorkers = useMemo(() => {
    const q = form.workerName.trim().toLowerCase();
    if (!q) return state.workers;
    return state.workers.filter((w) => w.toLowerCase().includes(q));
  }, [form.workerName, state.workers]);

  const addLine = useCallback(() => {
    const newLine = createEmptyLine();
    setExpandedLineId(newLine.id);
    setLines((prev) => [...prev, newLine]);
  }, [createEmptyLine]);

  const removeLine = useCallback(
    (id: string) => {
      setLines((prev) => {
        const next = prev.filter((ln) => ln.id !== id);
        return next.length > 0 ? next : [createEmptyLine()];
      });
    },
    [createEmptyLine],
  );

  const updateLine = useCallback((id: string, patch: Partial<PackagingLine>) => {
    setLines((prev) => prev.map((ln) => (ln.id === id ? { ...ln, ...patch } : ln)));
  }, []);

  const estimatePieces = useCallback(
    (ln: PackagingLine) => {
      const packs = Math.max(0, parseNonNegativeInt(ln.packCount) || 0);
      const key = ln.productType.trim().toLowerCase();
      const kind = productKindByName.get(key);
      if (kind === 'FINISHED') {
        const ppb = piecesPerBagByProduct.get(key) ?? 1;
        return packs * ppb;
      }
      const semiPpb = semiPiecesPerBagByName.get(key) ?? 1;
      return packs * semiPpb;
    },
    [piecesPerBagByProduct, productKindByName, semiPiecesPerBagByName],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (shiftPickerDefs.length === 0 || !shiftPickerDefs.some((d) => d.number === form.shift)) {
      setError(t.shiftNoDefsHint);
      return;
    }
    if (productOptions.length === 0) {
      setError(t.productTypesEmptyHint);
      return;
    }
    if (!form.workerName.trim()) {
      setError(`${t.labelWorker}!`);
      return;
    }

    const meaningfulLines = lines.filter((ln) => {
      const packs = parseNonNegativeInt(ln.packCount);
      const hasQty = !Number.isNaN(packs) && packs > 0;
      return (
        hasQty ||
        Boolean(ln.hoursWorked.trim()) ||
        Boolean(ln.notes.trim()) ||
        Boolean(ln.productType)
      );
    });

    if (meaningfulLines.length === 0) {
      setError(`${t.labelPackCount}!`);
      return;
    }

    for (const ln of meaningfulLines) {
      const packs = Math.max(0, parseNonNegativeInt(ln.packCount) || 0);
      if (packs <= 0) {
        setError(`${t.labelPackCount}!`);
        return;
      }
      if (!ln.productType.trim()) {
        setError(`${t.labelProduct}!`);
        return;
      }
      const pieces = estimatePieces(ln);
      if (pieces <= 0) {
        setError(t.packagingNoPiecesPerBag);
        return;
      }
      const available = unpackagedStockForProduct(ln.productType);
      if (pieces > available) {
        setError(
          t.packagingStockInsufficient
            .replace('{needed}', String(pieces))
            .replace('{available}', String(available)),
        );
        return;
      }
    }

    try {
      if (!state.workers.some((w) => w === form.workerName.trim())) {
        await dispatch({
          type: 'ADD_WORKER',
          payload: { fullName: form.workerName.trim(), preferredShiftNumber: form.shift },
        });
        await refresh();
      }

      const recordKind: ShiftRecordKind = 'PACKAGING';

      for (const ln of meaningfulLines) {
        const hours = parseDecimalInput(ln.hoursWorked);
        const packs = Math.max(0, parseNonNegativeInt(ln.packCount) || 0);
        const producedQty = estimatePieces(ln);

        await dispatch({
          type: 'ADD_SHIFT_RECORD',
          payload: {
            date: form.date,
            shift: form.shift,
            workerName: form.workerName.trim(),
            recordKind,
            machineId: '',
            hoursWorked: hours,
            productType: ln.productType,
            machineReading: '',
            producedQty,
            defectCount: 0,
            electricityKwh: 0,
            bagCount: 0,
            packCount: packs,
            notes: ln.notes,
          },
        });
      }
      await refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Error';
      setError(translateShiftInventoryApiError(raw, appT));
      return;
    }

    setSuccess(`${form.workerName} — ${getShiftLabel(shiftPickerDefs, form.shift)} ✓`);
    setTimeout(() => setSuccess(''), 4000);
    setForm((prev) => ({ ...prev, workerName: '' }));
    setLines([createEmptyLine()]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {success ? (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">{success}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
            {t.labelDate}
          </label>
          <SingleDatePicker
            value={form.date}
            onChange={(iso) => setForm({ ...form, date: iso || todayYmd() })}
          />
        </div>
        <div className="min-w-0">
          <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
            {t.labelShift}
          </label>
          {shiftPickerDefs.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-3 text-xs text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/35 dark:text-amber-100/90 space-y-2">
              <p>{t.shiftNoDefsHint}</p>
              <button
                type="button"
                onClick={onNeedShiftDefs}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                {t.shiftNoDefsGoToTab}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {shiftPickerDefs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setForm({ ...form, shift: d.number })}
                  className={`min-w-[2.75rem] px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    form.shift === d.number
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {d.number}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
          {t.labelWorker}
        </label>
        <input
          type="text"
          value={form.workerName}
          onChange={(e) => {
            setForm({ ...form, workerName: e.target.value });
            setWorkerInputOpen(true);
          }}
          onFocus={() => setWorkerInputOpen(true)}
          onBlur={() => setTimeout(() => setWorkerInputOpen(false), 150)}
          placeholder={t.placeholderWorker}
          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        {workerInputOpen && filteredWorkers.length > 0 ? (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredWorkers.map((w) => (
              <button
                key={w}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setForm({ ...form, workerName: w });
                  setWorkerInputOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20"
              >
                {w}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {t.labelProduct} · {t.labelHours} · {t.labelPackCount}
        </div>
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
        >
          <Plus size={14} /> {t.formAddRow}
        </button>
      </div>

      <div className="space-y-3">
        {lines.map((ln, idx) => {
          const isExpanded = lines.length === 1 || ln.id === expandedLineId;
          const hours = parseDecimalInput(ln.hoursWorked);
          const hoursLabel =
            ln.hoursWorked.trim() && hours > 0 ? `${hours}${t.hoursShort}` : '—';
          const packs = Math.max(0, parseNonNegativeInt(ln.packCount) || 0);
          const pieces = estimatePieces(ln);
          const productKey = ln.productType.trim().toLowerCase();
          const isFinished = productKindByName.get(productKey) === 'FINISHED';
          const ppb = isFinished
            ? (piecesPerBagByProduct.get(productKey) ?? 1)
            : (semiPiecesPerBagByName.get(productKey) ?? 1);
          const unpackagedAvailable = unpackagedStockForProduct(ln.productType);
          const maxPacks = ppb > 0 ? Math.floor(unpackagedAvailable / ppb) : 0;
          const stockInsufficient = packs > 0 && pieces > unpackagedAvailable;

          return (
            <div
              key={ln.id}
              className={`rounded-2xl border border-teal-200/80 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 ${
                isExpanded ? 'p-3 space-y-3' : 'p-2'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-teal-800 dark:text-teal-200">#{idx + 1}</div>
                <button
                  type="button"
                  onClick={() => removeLine(ln.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {!isExpanded ? (
                <button
                  type="button"
                  onClick={() => setExpandedLineId(ln.id)}
                  className="w-full flex flex-wrap items-center gap-x-3 gap-y-2 px-1 py-1.5 rounded-xl text-left hover:bg-white/70 dark:hover:bg-slate-800/50"
                >
                  {ln.productType ? (
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        PRODUCT_COLORS[ln.productType] ||
                        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {ln.productType}
                    </span>
                  ) : null}
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {packs} {t.labelPackCount.toLowerCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Clock size={10} className="text-slate-400" />
                    {hoursLabel}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {formatNumber(pieces)} {t.unitPiecesAbbr}
                  </span>
                  <ChevronDown size={14} className="ml-auto text-slate-400 shrink-0 -rotate-90" />
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
                      {t.labelProduct}
                    </label>
                    {productOptions.length === 0 ? (
                      <p className="text-xs text-amber-800 dark:text-amber-200">{t.productTypesEmptyHint}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {productOptions.map((pt) => (
                          <button
                            key={pt}
                            type="button"
                            onClick={() => updateLine(ln.id, { productType: pt })}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              ln.productType === pt
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white/80 dark:bg-slate-700 text-slate-600 border-slate-200 dark:border-slate-600'
                            }`}
                          >
                            {pt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
                        {t.labelHours}
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={ln.hoursWorked}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (isValidPartialDecimalHours(v)) {
                            updateLine(ln.id, { hoursWorked: v });
                          }
                        }}
                        placeholder="0"
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
                        {t.labelPackCount}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={ln.packCount}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (isValidPartialNonNegativeInt(v)) {
                            updateLine(ln.id, { packCount: normalizeNonNegativeIntInput(v) });
                          }
                        }}
                        placeholder="0"
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                      />
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {(isFinished || ppb > 1)
                          ? t.packagingPiecesPreview
                              .replace('{pieces}', String(pieces))
                              .replace('{ppb}', String(ppb))
                          : t.packagingPiecesPreviewSemi.replace(
                              '{pieces}',
                              String(pieces),
                            )}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {t.packagingStockAvailable.replace(
                          '{available}',
                          String(unpackagedAvailable),
                        )}
                        {maxPacks > 0
                          ? ` · ${t.packagingMaxPacks.replace('{max}', String(maxPacks))}`
                          : ''}
                      </p>
                      {stockInsufficient ? (
                        <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                          {t.packagingStockInsufficient
                            .replace('{needed}', String(pieces))
                            .replace('{available}', String(semiAvailable))}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
                      {t.labelNotes}
                    </label>
                    <input
                      type="text"
                      value={ln.notes}
                      onChange={(e) => updateLine(ln.id, { notes: e.target.value })}
                      placeholder={t.placeholderNotes}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700 text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={shiftPickerDefs.length === 0}
        className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
      >
        <Package size={16} /> {t.btn}
      </button>
    </form>
  );
}
