import React, { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import type { Sale } from '../store/erp-store';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import type { SaleDeliveryPrintMeta } from '../utils/sale-delivery-print-meta';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const INPUT_CLS =
  'w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

type Props = {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (meta: SaleDeliveryPrintMeta) => void | Promise<void>;
};

export function SalePrintDeliveryDialog({ sale, open, onOpenChange, onPrint }: Props) {
  const { state } = useERP();
  const { t } = useApp();
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sale || !open) return;
    const client = state.clients.find((c) => c.id === sale.clientId);
    setVehiclePlate(client?.deliveryVehiclePlate ?? '');
    setDriverName(client?.deliveryDriverName ?? '');
  }, [sale, open, state.clients]);

  const handlePrint = async () => {
    if (!sale) return;
    setBusy(true);
    try {
      const meta: SaleDeliveryPrintMeta = {
        vehiclePlate: vehiclePlate.trim(),
        driverName: driverName.trim(),
      };
      await onPrint(meta);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-white">{t.slPrintDeliveryTitle}</DialogTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {sale.clientName} · {t.slDeliveryDefaultsHint}
          </p>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t.slVehiclePlate}</label>
            <input
              type="text"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              placeholder={t.slVehiclePlatePlaceholder}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t.slDriverName}</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder={t.slDriverNamePlaceholder}
              className={INPUT_CLS}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            {t.btnCancel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePrint()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            <Printer size={16} />
            {t.prPrint}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function clientDeliveryMeta(client?: {
  deliveryVehiclePlate?: string;
  deliveryDriverName?: string;
}): SaleDeliveryPrintMeta {
  return {
    vehiclePlate: client?.deliveryVehiclePlate?.trim() || undefined,
    driverName: client?.deliveryDriverName?.trim() || undefined,
  };
}
