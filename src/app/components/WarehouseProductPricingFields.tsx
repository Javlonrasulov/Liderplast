import React from 'react';
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
  currencyUzs: string;
  currencyUsd: string;
  currencyEur: string;
  /** ≈ {amount} so‘m */
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
  const { usd: cbuUsd, eur: cbuEur } = useCbuRates();
  const usdRate = cbuUsdRate(cbuUsd);
  const eurRate = cbuEurRate(cbuEur);

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

  const showUzsEquivalent = value.priceCurrency !== 'UZS';
  const fxRate = value.fxRateToUzs;

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
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{labels.section}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{labels.optional}</p>
      </div>
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
        <div>
          <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-400">
            {labels.currency}
          </label>
          <Select
            value={value.priceCurrency}
            onValueChange={(v) => {
              const currency = v as SaleCurrency;
              const cbu = cbuRateForCurrency(currency);
              patch({
                priceCurrency: currency,
                fxRateToUzs:
                  currency === 'UZS' ? '' : cbu > 0 ? String(cbu) : value.fxRateToUzs,
              });
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm dark:border-slate-600 dark:bg-slate-700/80 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="UZS">{labels.currencyUzs}</SelectItem>
              <SelectItem value="USD">{labels.currencyUsd}</SelectItem>
              <SelectItem value="EUR">{labels.currencyEur}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {value.priceCurrency !== 'UZS' ? (
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label className="block text-sm text-slate-600 dark:text-slate-400">
                {labels.fxRate}
              </label>
              <button
                type="button"
                onClick={applyCbuRate}
                disabled={cbuRateForCurrency(value.priceCurrency) <= 0}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-40 dark:text-indigo-400 dark:hover:text-indigo-300"
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
      </div>
    </div>
  );
}
