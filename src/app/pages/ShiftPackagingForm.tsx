import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Clock, Plus, Trash2 } from 'lucide-react';
import { useERP } from '../store/erp-store';
import { formatNumber } from '../utils/format';
import type { ShiftDefinition } from './ShiftWork';
import {
  type PackagingLine,
  createEmptyPackagingLine,
} from '../utils/shift-packaging-utils';

export type { PackagingLine } from '../utils/shift-packaging-utils';

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
  /** ShiftWork ichida: sana/smena/ishchi va saqlash tugmasi tashqarida */
  embedded?: boolean;
  lines?: PackagingLine[];
  onLinesChange?: React.Dispatch<React.SetStateAction<PackagingLine[]>>;
  expandedLineId?: string | null;
  onExpandedLineIdChange?: (id: string | null) => void;
};

export function ShiftPackagingForm({
  t,
  shiftPickerDefs,
  productOptions,
  onNeedShiftDefs,
  embedded = false,
  lines: controlledLines,
  onLinesChange,
  expandedLineId: controlledExpandedId,
  onExpandedLineIdChange,
}: Props) {
  const { state } = useERP();

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

  const createEmptyLine = useCallback(
    (): PackagingLine => createEmptyPackagingLine(productOptions[0] || ''),
    [productOptions],
  );

  const [internalLines, setInternalLines] = useState<PackagingLine[]>([]);
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);
  const lines = embedded && controlledLines !== undefined ? controlledLines : internalLines;
  const setLines =
    embedded && onLinesChange ? onLinesChange : setInternalLines;
  const expandedLineId =
    embedded && controlledExpandedId !== undefined
      ? controlledExpandedId
      : internalExpandedId;
  const setExpandedLineId =
    embedded && onExpandedLineIdChange
      ? onExpandedLineIdChange
      : setInternalExpandedId;

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

  const body = (
    <>
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
                            .replace('{available}', String(unpackagedAvailable))}
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

    </>
  );

  if (embedded) {
    return <div className="space-y-3.5">{body}</div>;
  }

  return <form className="space-y-3.5">{body}</form>;
}
