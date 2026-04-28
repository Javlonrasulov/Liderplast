import React, { useMemo } from 'react';
import { Droplets, Palette, AlertTriangle } from 'lucide-react';
import { useERP, type RawMaterialKind, type RawMaterialProduct } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { calcPercent, formatKgAmount, formatNumber } from '../utils/format';

/** SIRO uchun Layout ва Dashboard билан бир хил кам қолдиқ чегараси */
const LOW_SIRO_KG = 1000;
/** Kraska uchun эски Warehouse саҳифасидан килинган услуб */
const LOW_PAINT_KG = 200;

export function RawMaterialWarehouseStock() {
  const { state } = useERP();
  const { t } = useApp();

  const qtyByName = useMemo(() => {
    const m = new Map<string, number>();
    for (const row of state.warehouseStock) {
      if (row.itemType !== 'RAW_MATERIAL' || !row.itemName) continue;
      m.set(row.itemName, (m.get(row.itemName) ?? 0) + row.quantity);
    }
    return m;
  }, [state.warehouseStock]);

  const rows = useMemo(() => {
    const raw = state.warehouseProducts.filter(
      (p): p is RawMaterialProduct => p.itemType === 'RAW_MATERIAL',
    );
    return [...raw].sort((a, b) => {
      const order = (k: RawMaterialKind | undefined) => (k === 'PAINT' ? 1 : 0);
      const d = order(a.rawMaterialKind) - order(b.rawMaterialKind);
      if (d !== 0) return d;
      return a.name.localeCompare(b.name);
    });
  }, [state.warehouseProducts]);

  const totalKg = useMemo(
    () => rows.reduce((s, rm) => s + (qtyByName.get(rm.name) ?? 0), 0),
    [rows, qtyByName],
  );

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
      <p className="text-xs text-slate-500 dark:text-slate-400">{t.rmWarehouseStockPageDesc}</p>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          {t.rmWarehouseStockEmpty}
        </p>
      ) : (
        <>
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white p-5 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-slate-900">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-800/80 dark:text-indigo-200/90">
              {t.rmWarehouseStockTotal}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {formatKgAmount(totalKg)} <span className="text-base font-semibold text-slate-500 dark:text-slate-400">{t.unitKg}</span>
            </p>
          </div>
        </>
      )}

      {rows.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((rm) => {
            const kg = qtyByName.get(rm.name) ?? 0;
            const isPaint = rm.rawMaterialKind === 'PAINT';
            const max = isPaint ? 2000 : 5000;
            const low = isPaint ? kg < LOW_PAINT_KG : kg < LOW_SIRO_KG;
            const pct = calcPercent(kg, max);
            const barColor = low
              ? 'bg-amber-500 dark:bg-amber-500'
              : isPaint
                ? 'bg-fuchsia-500 dark:bg-fuchsia-500'
                : 'bg-blue-500 dark:bg-blue-500';
            const Icon = isPaint ? Palette : Droplets;
            const iconWrap = isPaint
              ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';

            return (
              <div
                key={rm.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800 ${
                  low ? 'border-amber-300 dark:border-amber-700/60' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{rm.name}</p>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {rm.rawMaterialKind === 'PAINT' ? t.rmKindPaint : t.rmKindSiro}
                      </p>
                      {rm.description?.trim() ? (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{rm.description}</p>
                      ) : null}
                    </div>
                  </div>
                  {low ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                      <AlertTriangle size={12} />
                      {t.rmWarning}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t.rmRemaining}</span>
                    <span className="tabular-nums text-xl font-bold text-slate-900 dark:text-white">
                      {formatKgAmount(kg)} <span className="text-sm font-normal text-slate-400">{t.unitKg}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <p className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                    ~{formatNumber(pct)}% · max {formatKgAmount(max)} {t.unitKg}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
