import React, { useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import type { SaleCurrency } from '../store/erp-store';
import type { WarehouseProductPricingFields } from '../utils/warehouse-product-pricing';
import { useCbuRates } from '../hooks/use-cbu-rates';
import { formatNumber } from '../utils/format';
import { cbuEurRate, cbuUsdRate } from '../utils/sales-currency';
import { priceAmountInUzs } from '../utils/warehouse-product-pricing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type Labels = {
  section: string;
  optional: string;
  purchasePrice: string;
  salePrice: string;
  currency: string;
  fxRate: string;
  fxHint: string;
  fxApplyCbu: string;
  cbuTitle: string;
  cbuLoading: string;
  cbuUsdLine: string;
  cbuEurLine: string;
  cbuError: string;
  cbuRetry: string;
  currencyUzs: string;
  currencyUsd: string;
  currencyEur: string;
  priceInUzs: string;
};

type Props = {
  value: WarehouseProductPricingFields;
  onChange: (next: WarehouseProductPricingFields) => void;
  labels: Labels;
};

export function WarehouseProductPricingFieldsBlock({
  value,
  onChange,
  labels,
}: Props) {
  const { usd: cbuUsd, eur: cbuEur, loading, error, refetch } = useCbuRates();
  const usdRate = cbuUsdRate(cbuUsd);
  const eurRate = cbuEurRate(cbuEur);
  const didAutoFillFx = useRef(false);

  const cbuRateForCurrency = (currency: SaleCurrency): number => {
    if (currency === 'USD') return usdRate;
    if (currency === 'EUR') return eurRate;
    return 0;
  };

  const patch = (partial: Partial<WarehouseProductPricingFields>) => {
    onChange({ ...value, ...partial });
  };

  const applyCbuRate = () => {
    const rate = cbuRateForCurrency(value.priceCurrency);
    if (rate > 0) {
      patch({ fxRateToUzs: String(rate) });
    }
  };

  useEffect(() => {
    if (value.priceCurrency === 'UZS') return;
    if (value.fxRateToUzs.trim()) {
      didAutoFillFx.current = true;
      return;
    }
    const cbu = cbuRateForCurrency(value.priceCurrency);
    if (cbu > 0 && !didAutoFillFx.current) {
      didAutoFillFx.current = true;
      onChange({ ...value, fxRateToUzs: String(cbu) });
    }
  }, [value.priceCurrency, usdRate, eurRate]);

  const showUzsEquivalent = value.priceCurrency !== 'UZS';
  const fxRate = value.fxRateToUzs;
  const showFxField = value.priceCurrency !== 'UZS';

  const renderUzsHint = (amountRaw: string) => {
    if (!showUzsEquivalent) return null;
    const uzs = priceAmountInUzs(amountRaw, fxRate);
    if (uzs == null) return null;
    return (
      <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        {labels.priceInUzs.replace('{amount}', formatNumber(uzs))}
      </p>
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{labels.section}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{labels.optional}</p>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
        <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
          {labels.cbuTitle}
        </p>
        {loading ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <RefreshCw size={12} className="animate-spin" />
            {labels.cbuLoading}
          </p>
        ) : error ? (
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            {labels.cbuError}
            <button
              type="button"
              onClick={refetch}
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {labels.cbuRetry}
            </button>
          </p>
        ) : (
          <div className="mt-1 space-y-0.5 text-xs text-slate-700 dark:text-slate-300">
            {usdRate > 0 ? (
              <p>{labels.cbuUsdLine.replace('{rate}', formatNumber(usdRate))}</p>
            ) : null}
            {eurRate > 0 ? (
              <p>{labels.cbuEurLine.replace('{rate}', formatNumber(eurRate))}</p>
            ) : null}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
          {labels.currency}
        </label>
        <Select
          value={value.priceCurrency}
          onValueChange={(v) => {
            const currency = v as SaleCurrency;
            didAutoFillFx.current = false;
            const cbu = cbuRateForCurrency(currency);
            patch({
              priceCurrency: currency,
              fxRateToUzs:
                currency === 'UZS' ? '' : cbu > 0 ? String(cbu) : value.fxRateToUzs,
            });
            if (currency !== 'UZS' && cbu > 0) {
              didAutoFillFx.current = true;
            }
          }}
        >
          <SelectTrigger className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm dark:border-slate-600 dark:bg-slate-700/80 dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="z-[2000] max-h-72 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <SelectItem value="USD">{labels.currencyUsd}</SelectItem>
            <SelectItem value="EUR">{labels.currencyEur}</SelectItem>
            <SelectItem value="UZS">{labels.currencyUzs}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showFxField ? (
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label className="block text-sm text-slate-600 dark:text-slate-400">
              {labels.fxRate}
            </label>
            <button
              type="button"
              onClick={applyCbuRate}
              disabled={cbuRateForCurrency(value.priceCurrency) <= 0}
              className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-40 dark:text-indigo-400"
            >
              {labels.fxApplyCbu}
            </button>
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={value.fxRateToUzs}
            onChange={(e) => patch({ fxRateToUzs: e.target.value })}
            placeholder="—"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
          />
          <p className="mt-1 text-xs text-slate-400">{labels.fxHint}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
            {labels.purchasePrice}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={value.purchasePrice}
            onChange={(e) => patch({ purchasePrice: e.target.value })}
            placeholder="—"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
          />
          {renderUzsHint(value.purchasePrice)}
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
            {labels.salePrice}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={value.salePrice}
            onChange={(e) => patch({ salePrice: e.target.value })}
            placeholder="—"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-700/80 dark:text-white"
          />
          {renderUzsHint(value.salePrice)}
        </div>
      </div>
    </div>
  );
}
