import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useERP, type SupplierPurchaseOrder } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatCurrency, todayYmd, toLocalDateString } from '../utils/format';
import { SingleDatePicker } from './SingleDatePicker';
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type QtyUnit = 'KG' | 'TON' | 'PIECES';

interface SupplierPurchaseEditDialogProps {
  order: SupplierPurchaseOrder;
  onClose: () => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className ?? ''}`}
    />
  );
}

export function SupplierPurchaseEditDialog({ order, onClose }: SupplierPurchaseEditDialogProps) {
  const { state, dispatch } = useERP();
  const { t } = useApp();

  const [orderedAt, setOrderedAt] = useState(() => toLocalDateString(order.orderedAt) || todayYmd());
  const [supplierId, setSupplierId] = useState(order.supplierId ?? '');
  const [qty, setQty] = useState(String(order.quantity));
  const [qtyUnit, setQtyUnit] = useState<QtyUnit>(order.quantityUnit);
  const [cur, setCur] = useState(order.currency);
  const [fxMan, setFxMan] = useState(String(order.fxRateToUzs));
  const [amountOriginal, setAmountOriginal] = useState(String(order.amountOriginal));
  const [paymentType, setPaymentType] = useState(order.paymentType);
  const [paidNow, setPaidNow] = useState(String(order.paidAmountUzs));
  const [debtNow, setDebtNow] = useState(String(order.debtAmountUzs));
  const [notes, setNotes] = useState(order.notes ?? '');
  const [busy, setBusy] = useState(false);

  const supplierOptions = useMemo(
    () => state.suppliers.map((s) => ({ value: s.id, label: s.name })),
    [state.suppliers],
  );

  const amountUzsPreview = useMemo(() => {
    const orig = parseFloat(String(amountOriginal).replace(',', '.'));
    const fx = parseFloat(String(fxMan).replace(',', '.'));
    if (!Number.isFinite(orig) || orig < 0) return 0;
    if (cur === 'UZS') return orig;
    if (!Number.isFinite(fx) || fx <= 0) return 0;
    return orig * fx;
  }, [amountOriginal, cur, fxMan]);

  useEffect(() => {
    if (paymentType === 'CASH') {
      setPaidNow(String(Math.round(amountUzsPreview)));
      setDebtNow('0');
    }
  }, [paymentType, amountUzsPreview]);

  const qtyUnits: QtyUnit[] =
    order.itemType === 'RAW_MATERIAL' ? ['KG', 'TON'] : ['PIECES', 'KG'];

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;
    const quantity = parseFloat(String(qty).replace(',', '.'));
    const fx = parseFloat(String(fxMan).replace(',', '.'));
    const orig = parseFloat(String(amountOriginal).replace(',', '.'));
    const paid = parseFloat(String(paidNow).replace(',', '.'));
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    if (!Number.isFinite(orig) || orig < 0) return;
    if (cur !== 'UZS' && (!Number.isFinite(fx) || fx <= 0)) return;
    if (paymentType === 'CREDIT' && (!Number.isFinite(paid) || paid < 0)) return;

    setBusy(true);
    const toastId = toast.loading(`${t.supEditPurchase}…`);
    try {
      await dispatch({
        type: 'UPDATE_SUPPLIER_PURCHASE_ORDER',
        payload: {
          id: order.id,
          orderedAt,
          supplierId,
          quantity,
          quantityUnit: qtyUnit,
          currency: cur,
          fxRateToUzs: cur === 'UZS' ? 1 : fx,
          amountOriginal: orig,
          paymentType,
          paidAmountUzs: paymentType === 'CREDIT' ? paid : undefined,
          notes: notes.trim() || undefined,
        },
      });
      toast.success(t.supEditPurchase, { id: toastId });
      onClose();
    } catch (err) {
      console.error('[suppliers] update purchase failed', err);
      toast.error(t.slPdfDownloadFailed, { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t.supEditPurchase}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-5 space-y-3">
          <div>
            <Label>{t.labelDate}</Label>
            <SingleDatePicker value={orderedAt} onChange={setOrderedAt} menuZClassName="z-[90]" />
          </div>

          <div>
            <Label>{t.supColSupplier}</Label>
            <RadixSelect value={supplierId} onValueChange={setSupplierId} disabled={supplierOptions.length === 0}>
              <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 bg-white text-sm dark:border-slate-600 dark:bg-slate-700">
                <SelectValue placeholder={t.supSelectSupplier} />
              </SelectTrigger>
              <SelectContent className="z-[90]">
                {supplierOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </RadixSelect>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
            {order.productName}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t.supColQty}</Label>
              <Input type="text" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div>
              <Label>{t.supQtyUnitLabel}</Label>
              <div className="flex gap-1">
                {qtyUnits.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setQtyUnit(u)}
                    className={`flex-1 h-9 rounded-xl text-xs font-medium border ${
                      qtyUnit === u
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {u === 'TON' ? t.prRmWeightUnitTon : u === 'PIECES' ? t.supUnitPieces : t.prRmWeightUnitKg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>{t.prRmCurrency}</Label>
              <select
                value={cur}
                onChange={(e) => setCur(e.target.value as typeof cur)}
                className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
              >
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <Label>{t.labelAmount}</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={amountOriginal}
                onChange={(e) => setAmountOriginal(e.target.value)}
              />
            </div>
            {cur !== 'UZS' && (
              <div>
                <Label>{t.slSaleFxRate}</Label>
                <Input type="text" inputMode="decimal" value={fxMan} onChange={(e) => setFxMan(e.target.value)} />
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500">
            UZS: {formatCurrency(amountUzsPreview)}
          </p>

          <div className="flex gap-2">
            {(['CASH', 'CREDIT'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPaymentType(p)}
                className={`flex-1 h-9 rounded-xl text-xs font-medium border ${
                  paymentType === p
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-600'
                }`}
              >
                {p === 'CASH' ? t.supPaymentCash : t.supPaymentCredit}
              </button>
            ))}
          </div>

          {paymentType === 'CREDIT' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t.supPaidNowLabel}</Label>
                <Input type="text" inputMode="decimal" value={paidNow} onChange={(e) => setPaidNow(e.target.value)} />
              </div>
              <div>
                <Label>{t.supDebtRemaining}</Label>
                <Input type="text" inputMode="decimal" value={debtNow} readOnly className="opacity-70" />
              </div>
            </div>
          )}

          <div>
            <Label>{t.labelDesc}</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              disabled={busy || !supplierId}
              className="flex-1 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40"
            >
              {t.btnSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
