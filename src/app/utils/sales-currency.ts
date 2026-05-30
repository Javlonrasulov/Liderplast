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

export type WarehousePurchasePriceSource = {
  purchasePrice?: number;
  priceCurrency?: SaleCurrency;
  fxRateToUzs?: number;
};

export function warehousePurchaseDefaults(product?: WarehousePurchasePriceSource): {
  price: string;
  currency: SaleCurrency;
  hasPurchasePrice: boolean;
} {
  const currency = product?.priceCurrency ?? 'UZS';
  if (!product?.purchasePrice || product.purchasePrice <= 0) {
    return { price: '', currency, hasPurchasePrice: false };
  }
  return {
    price: String(product.purchasePrice),
    currency,
    hasPurchasePrice: true,
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

/** Sotuv narxi — UZS butun, USD/EUR kichik kasrlar saqlanadi (masalan 0,012). */
export function formatSaleUnitPrice(price: number, currency: SaleCurrency): string {
  if (!Number.isFinite(price)) return '0';
  if (currency === 'UZS') {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(price));
  }
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(price);
}

export function formatSalePriceLabel(price: number, currency: SaleCurrency): string {
  return `${formatSaleUnitPrice(price, currency)} ${currency}`;
}

export type SaleLineForDisplay = {
  pricePerUnit: number;
  quantity: number;
  currency: SaleCurrency;
  fxRateToUzs?: number;
  total: number;
};

/** Saqlangan yoki jami/qty dan tiklangan sotuv payti kursi */
export function effectiveSaleFxRate(line: SaleLineForDisplay): number | undefined {
  if (line.currency === 'UZS') return undefined;
  if (line.fxRateToUzs != null && line.fxRateToUzs > 0) return line.fxRateToUzs;
  const denom = line.quantity * line.pricePerUnit;
  if (denom > 0 && line.total > 0) {
    const inferred = line.total / denom;
    return Number.isFinite(inferred) && inferred > 0 ? inferred : undefined;
  }
  return undefined;
}

/** Tarix: 80 USD × 10 ta · kurs 12 000 → 9 600 000 so'm */
export function formatSaleHistoryPriceDetail(
  line: SaleLineForDisplay,
  formatNumber: (n: number) => string,
  formatCurrency: (n: number) => string,
  labels: { unitPiece: string; fxRate: string },
): string {
  const unitPrice = formatSaleUnitPrice(line.pricePerUnit, line.currency);
  if (line.currency === 'UZS') {
    return `${unitPrice} so'm × ${formatNumber(line.quantity)} ${labels.unitPiece}`;
  }
  const fx = effectiveSaleFxRate(line);
  const head = `${unitPrice} ${line.currency} × ${formatNumber(line.quantity)} ${labels.unitPiece}`;
  if (fx != null) {
    return `${head} · ${labels.fxRate} ${formatNumber(fx)} → ${formatCurrency(line.total)}`;
  }
  return `${head} → ${formatCurrency(line.total)}`;
}
