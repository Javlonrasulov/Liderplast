import type { SaleCurrency } from '../store/erp-store';
import { parseCbuRate } from '../hooks/use-cbu-rates';

export type WarehouseSalePriceSource = {
  salePrice?: number;
  priceCurrency?: SaleCurrency;
  fxRateToUzs?: number;
};

export function cbuUsdRate(usd: { Rate: string } | null): number {
  return usd ? parseCbuRate(usd.Rate) : 0;
}

export function cbuEurRate(eur: { Rate: string } | null): number {
  return eur ? parseCbuRate(eur.Rate) : 0;
}

export function fxRateForSaleCurrency(
  currency: SaleCurrency,
  usdRate: number,
  eurRate: number,
): number | undefined {
  if (currency === 'UZS') return undefined;
  if (currency === 'USD') return usdRate > 0 ? usdRate : undefined;
  return eurRate > 0 ? eurRate : undefined;
}

/** Omborda saqlangan kurs — faqat valyuta mos bo‘lsa; aks holda MB */
export function saleFxRate(
  currency: SaleCurrency,
  warehouseFx: number | undefined,
  usdRate: number,
  eurRate: number,
): number | undefined {
  if (currency === 'UZS') return undefined;
  if (warehouseFx != null && warehouseFx > 0) return warehouseFx;
  return fxRateForSaleCurrency(currency, usdRate, eurRate);
}

export function warehouseFxForProduct(
  product: WarehouseSalePriceSource | undefined,
  currency: SaleCurrency,
): number | undefined {
  if (!product || currency === 'UZS') return undefined;
  const productCur = product.priceCurrency ?? 'UZS';
  if (productCur !== currency) return undefined;
  return product.fxRateToUzs;
}

export function warehouseSaleDefaults(product?: WarehouseSalePriceSource): {
  price: string;
  currency: SaleCurrency;
} {
  if (!product?.salePrice || product.salePrice <= 0) {
    return { price: '', currency: 'UZS' };
  }
  return {
    price: String(product.salePrice),
    currency: product.priceCurrency ?? 'UZS',
  };
}

export function saleLineTotalUzs(
  quantity: number,
  price: number,
  currency: SaleCurrency,
  usdRate: number,
  eurRate: number,
  warehouseFx?: number,
): number {
  if (currency === 'UZS') return quantity * price;
  const fx = saleFxRate(currency, warehouseFx, usdRate, eurRate) ?? 0;
  return quantity * price * fx;
}

export function unitPriceInUzs(
  price: number,
  currency: SaleCurrency,
  usdRate: number,
  eurRate: number,
  warehouseFx?: number,
): number | null {
  if (currency === 'UZS') return price;
  const fx = saleFxRate(currency, warehouseFx, usdRate, eurRate);
  if (!fx) return null;
  return price * fx;
}

export function formatSalePriceLabel(
  price: number,
  currency: SaleCurrency,
  formatNumber: (n: number) => string,
): string {
  return `${formatNumber(price)} ${currency}`;
}
