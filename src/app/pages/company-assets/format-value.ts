import type { T } from '../../i18n/translations';
import { EMPTY_PLACEHOLDER, formatCurrency, formatNumber } from '../../utils/format';
import type { AssetCurrency, CompanyAssetListItem } from './types';

export type AssetValueInput = Pick<
  CompanyAssetListItem,
  'initialValueUzs' | 'purchasePriceOriginal' | 'currency' | 'fxRateToUzs'
>;

export type AssetValueParts = {
  usd: number;
  uzs: number;
  fxRate: number;
};

function formatUsdAmount(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '';
  const rounded = Math.round(value * 100) / 100;
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function getAssetValueParts(
  asset: AssetValueInput,
  cbuUsdRate: number,
  cbuEurRate: number,
): AssetValueParts {
  const uzs = asset.initialValueUzs ?? 0;
  const original = asset.purchasePriceOriginal ?? 0;
  const storedFx = asset.fxRateToUzs && asset.fxRateToUzs > 0 ? asset.fxRateToUzs : 0;

  if (asset.currency === 'USD' && original > 0) {
    return {
      usd: original,
      uzs,
      fxRate: storedFx > 1 ? storedFx : cbuUsdRate > 0 ? cbuUsdRate : 1,
    };
  }

  if (
    asset.currency === 'EUR' &&
    original > 0 &&
    cbuEurRate > 0 &&
    cbuUsdRate > 0
  ) {
    return {
      usd: Math.round(((original * cbuEurRate) / cbuUsdRate) * 100) / 100,
      uzs,
      fxRate: storedFx > 1 ? storedFx : cbuUsdRate,
    };
  }

  const fx = storedFx > 1 ? storedFx : cbuUsdRate > 0 ? cbuUsdRate : 1;
  const usd = fx > 0 && uzs > 0 ? Math.round((uzs / fx) * 100) / 100 : 0;
  return { usd, uzs, fxRate: fx };
}

/** Masalan: 12 100 dan · 6 500 $ · 78 650 000 so'm */
export function formatAssetInitialValue(
  asset: AssetValueInput,
  cbuUsdRate: number,
  cbuEurRate: number,
  labels: Pick<T, 'caValueRateDan' | 'caValueUsdUnit'>,
): string {
  const { usd, uzs, fxRate } = getAssetValueParts(asset, cbuUsdRate, cbuEurRate);
  if (uzs <= 0) return EMPTY_PLACEHOLDER;

  const parts: string[] = [];
  if (fxRate > 1) {
    parts.push(`${formatNumber(fxRate)} ${labels.caValueRateDan}`);
  }
  const usdStr = formatUsdAmount(usd);
  if (usdStr) {
    parts.push(`${usdStr} ${labels.caValueUsdUnit}`);
  }
  parts.push(formatCurrency(uzs));
  return parts.join(' · ');
}

export function formatFormValuePreview(
  purchasePrice: number,
  currency: AssetCurrency,
  fxRateToUzs: number,
  amountUzs: number,
  cbuUsdRate: number,
  cbuEurRate: number,
  labels: Pick<T, 'caValueRateDan' | 'caValueUsdUnit'>,
): string {
  return formatAssetInitialValue(
    {
      initialValueUzs: amountUzs,
      purchasePriceOriginal: purchasePrice,
      currency,
      fxRateToUzs: currency === 'UZS' ? 1 : fxRateToUzs,
    },
    cbuUsdRate,
    cbuEurRate,
    labels,
  );
}
