import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import type { T } from '../i18n/translations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { formatNumber } from '../utils/format';

function mapElectricityPriceSaveError(message: string, t: T): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('cannot patch') ||
    lower.includes('electricity-price') ||
    (lower.includes('404') && lower.includes('salary-settings'))
  ) {
    return t.exElectricityPriceErrorEndpoint404;
  }
  return message;
}

/** Xarajatlar topbar: sarlavha yonidagi kichik kVt·soat narxi (modal). */
export function ExpensesElectricityNavButton() {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [priceInput, setPriceInput] = useState(String(state.payrollSettings.electricityPricePerKwh));
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    setPriceInput(String(state.payrollSettings.electricityPricePerKwh));
  }, [state.payrollSettings.electricityPricePerKwh]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(priceInput.replace(',', '.'));
    if (!Number.isFinite(v) || v < 0) return;
    setModalError('');
    setSaving(true);
    try {
      await dispatch({ type: 'SET_ELECTRICITY_PRICE', payload: v });
      setOpen(false);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setModalError(mapElectricityPriceSaveError(raw, t));
    } finally {
      setSaving(false);
    }
  };

  const rateHint = `${formatNumber(state.payrollSettings.electricityPricePerKwh)} ${t.unitSum}/kVt·soat`;

  return (
    <>
      <button
        type="button"
        title={`${t.exElectricityPriceButton} — ${rateHint}`}
        aria-label={t.exElectricityPriceButton}
        onClick={() => {
          setModalError('');
          setPriceInput(String(state.payrollSettings.electricityPricePerKwh));
          setOpen(true);
        }}
        className="ml-0.5 inline-flex shrink-0 items-center gap-0.5 rounded-md border border-amber-300/90 bg-amber-50/90 px-1 py-0.5 text-[10px] font-semibold leading-tight text-amber-900 shadow-none hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/40 sm:gap-1 sm:px-1.5 sm:py-1 sm:text-[11px]"
      >
        <Zap className="h-2.5 w-2.5 shrink-0 opacity-90 sm:h-3 sm:w-3" aria-hidden />
        <span className="max-w-[4.5rem] truncate sm:max-w-none">{t.exElectricityPriceNavShort}</span>
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setModalError('');
        }}
      >
        <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">{t.exGlobalElectricityPriceTitle}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 space-y-2">
              <span className="block">{t.exShiftElectricityExplain}</span>
              <span className="block text-slate-500 dark:text-slate-500">{t.exElectricityPriceAffectsNewOnly}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3 pt-1">
            {modalError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                {modalError}
              </p>
            ) : null}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.exPricePerKwh} ({t.unitSum})
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <DialogFooter className="flex flex-row flex-wrap gap-2 pt-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 sm:px-4 sm:py-2 sm:text-sm"
              >
                {t.btnCancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
              >
                {saving ? '…' : t.btnSave}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
