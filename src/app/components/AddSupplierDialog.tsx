import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useERP, type Supplier } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { PhoneInput } from './PhoneInput';
import { emptyUzPhoneInput, formatUzPhoneInput, normalizeUzPhoneForApi } from '../utils/phone';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400 ${props.className ?? ''}`}
    />
  );
}

const PHONE_INPUT_CLS =
  'w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400';

function emptyForm() {
  return { name: '', phone: emptyUzPhoneInput(), address: '', notes: '' };
}

function formFromSupplier(s: Supplier) {
  return {
    name: s.name,
    phone: s.phone ? formatUzPhoneInput(s.phone) : emptyUzPhoneInput(),
    address: s.address ?? '',
    notes: s.notes ?? '',
  };
}

export function AddSupplierDialog({
  open,
  onOpenChange,
  supplier = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}) {
  const { dispatch } = useERP();
  const { t } = useApp();
  const isEdit = supplier != null;
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(supplier ? formFromSupplier(supplier) : emptyForm());
  }, [open, supplier]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const body = {
        name: form.name.trim(),
        phone: normalizeUzPhoneForApi(form.phone),
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      if (isEdit && supplier) {
        await dispatch({ type: 'UPDATE_SUPPLIER', payload: { id: supplier.id, ...body } });
      } else {
        await dispatch({ type: 'CREATE_SUPPLIER', payload: body });
      }
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 size={18} />
            {isEdit ? t.supEditSupplier : t.supAddSupplier}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label>{t.supColName}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div>
            <Label>{t.labelPhone}</Label>
            <PhoneInput
              value={form.phone}
              onChange={(phone) => setForm((p) => ({ ...p, phone: formatUzPhoneInput(phone) }))}
              className={PHONE_INPUT_CLS}
            />
          </div>
          <div>
            <Label>{t.supColAddress}</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            />
          </div>
          <div>
            <Label>{t.labelDesc}</Label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full min-h-[4rem] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-sm"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              disabled={busy || !form.name.trim()}
              className="h-9 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium disabled:opacity-50"
            >
              {busy ? '...' : t.btnSave}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
