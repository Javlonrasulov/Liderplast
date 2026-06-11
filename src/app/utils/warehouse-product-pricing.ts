import type { SaleCurrency } from '../store/erp-store';
import { formatNumber } from './format';
import { formatSaleUnitPrice, unitPriceInUzs } from './sales-currency';

export type WarehouseProductPricingFields = {
  purchasePrice: string;
  salePrice: string;
  priceCurrency: SaleCurrency;
  fxRateToUzs: string;
};

export const EMPTY_WAREHOUSE_PRICING: WarehouseProductPricingFields = {
  purchasePrice: '',
  salePrice: '',
  priceCurrency: 'USD',
  fxRateToUzs: '',
};

export type WarehouseProductPricingPayload = {
  purchasePrice?: number | null;
  salePrice?: number | null;
  priceCurrency?: SaleCurrency | null;
  fxRateToUzs?: number | null;
};

function parseOptionalAmount(raw: string): number | null | undefined {
  const s = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

export function pricingFieldsFromProduct(product: {
  purchasePrice?: number;
  salePrice?: number;
  priceCurrency?: SaleCurrency;
  fxRateToUzs?: number;
}): WarehouseProductPricingFields {
  return {
    purchasePrice:
      product.purchasePrice != null ? String(product.purchasePrice) : '',
    salePrice: product.salePrice != null ? String(product.salePrice) : '',
    priceCurrency: product.priceCurrency ?? 'USD',
    fxRateToUzs:
      product.fxRateToUzs != null ? String(product.fxRateToUzs) : '',
  };
}

export function parseWarehousePurchasePricingPayload(
  fields: Pick<
    WarehouseProductPricingFields,
    'purchasePrice' | 'priceCurrency' | 'fxRateToUzs'
  >,
): Pick<
  WarehouseProductPricingPayload,
  'purchasePrice' | 'priceCurrency' | 'fxRateToUzs'
> | undefined {
  const purchasePrice = parseOptionalAmount(fields.purchasePrice);
  if (purchasePrice === undefined) return undefined;

  const currency = fields.priceCurrency;
  let fxRateToUzs: number | null | undefined;
  if (currency === 'UZS') {
    fxRateToUzs = null;
  } else {
    fxRateToUzs = parseOptionalAmount(fields.fxRateToUzs);
    if (fxRateToUzs === undefined) return undefined;
  }

  const hasAny =
    purchasePrice != null ||
    currency !== 'UZS' ||
    (fxRateToUzs != null && fxRateToUzs > 0);

  if (!hasAny) {
    return {
      purchasePrice: null,
      priceCurrency: null,
      fxRateToUzs: null,
    };
  }

  return {
    purchasePrice,
    priceCurrency: currency,
    fxRateToUzs,
  };
}

export function parseWarehousePricingPayload(
  fields: WarehouseProductPricingFields,
): WarehouseProductPricingPayload | undefined {
  const purchasePrice = parseOptionalAmount(fields.purchasePrice);
  const salePrice = parseOptionalAmount(fields.salePrice);
  if (purchasePrice === undefined || salePrice === undefined) {
    return undefined;
  }

  const currency = fields.priceCurrency;
  let fxRateToUzs: number | null | undefined;
  if (currency === 'UZS') {
    fxRateToUzs = null;
  } else {
    fxRateToUzs = parseOptionalAmount(fields.fxRateToUzs);
    if (fxRateToUzs === undefined) return undefined;
  }

  const hasAny =
    purchasePrice != null ||
    salePrice != null ||
    currency !== 'UZS' ||
    (fxRateToUzs != null && fxRateToUzs > 0);

  if (!hasAny) {
    return {
      purchasePrice: null,
      salePrice: null,
      priceCurrency: null,
      fxRateToUzs: null,
    };
  }

  return {
    purchasePrice,
    salePrice,
    priceCurrency: currency,
    fxRateToUzs,
  };
}

export function priceAmountInUzs(
  amountRaw: string,
  fxRateRaw: string,
): number | null {
  const amount = parseFloat(String(amountRaw).trim().replace(',', '.'));
  const fx = parseFloat(String(fxRateRaw).trim().replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(fx) || fx <= 0) {
    return null;
  }
  return amount * fx;
}

function currencyDisplay(cur: SaleCurrency): string {
  return cur === 'USD' ? 'USD (USDT)' : cur;
}

export type WarehouseSalePriceDisplay = {
  main: string;
  sub?: string;
  /** Masalan: 1 USD (USDT) = 12 100 so'm */
  fxRate?: string;
};

/** Jadval/chop uchun sotuv narxi — USD kichik kasrlar va so'm ekvivalenti */
export function warehouseProductStockTotals(
  product: {
    salePrice?: number;
    priceCurrency?: SaleCurrency;
    fxRateToUzs?: number;
  },
  quantity: number,
  usdRate: number,
  eurRate: number,
): { totalUzs: number | null; totalUsd: number | null } {
  const sp = product.salePrice;
  if (sp == null || sp <= 0 || quantity <= 0) {
    return { totalUzs: null, totalUsd: null };
  }
  const cur = product.priceCurrency ?? 'UZS';
  const unitUzs = unitPriceInUzs(sp, cur, usdRate, eurRate, product.fxRateToUzs);
  let unitUsd: number | null = null;
  if (cur === 'USD') {
    unitUsd = sp;
  } else if (cur === 'EUR' && unitUzs != null && usdRate > 0) {
    unitUsd = unitUzs / usdRate;
  } else if (cur === 'UZS' && usdRate > 0) {
    unitUsd = sp / usdRate;
  }
  return {
    totalUzs: unitUzs != null ? unitUzs * quantity : null,
    totalUsd: unitUsd != null ? unitUsd * quantity : null,
  };
}

export function formatWarehouseSalePriceDisplay(
  product: {
    salePrice?: number;
    priceCurrency?: SaleCurrency;
    fxRateToUzs?: number;
  },
  noPrice: string,
  priceInUzsLabel: string,
  fxValueLabel?: string,
  options?: { fallbackUsdRate?: number; fallbackEurRate?: number },
): WarehouseSalePriceDisplay {
  const sp = product.salePrice;
  if (sp == null || sp <= 0) return { main: noPrice };
  const cur = product.priceCurrency ?? 'UZS';
  const main = `${formatSaleUnitPrice(sp, cur)} ${currencyDisplay(cur)}`;
  if (cur === 'UZS') return { main };
  let fx = product.fxRateToUzs ?? 0;
  if (fx <= 0 && options) {
    if (cur === 'USD' && (options.fallbackUsdRate ?? 0) > 0) {
      fx = options.fallbackUsdRate!;
    } else if (cur === 'EUR' && (options.fallbackEurRate ?? 0) > 0) {
      fx = options.fallbackEurRate!;
    }
  }
  if (fx <= 0) return { main };
  const uzs = priceAmountInUzs(String(sp), String(fx));
  if (uzs == null) return { main };
  return {
    main,
    sub: priceInUzsLabel.replace('{amount}', formatNumber(uzs)),
    fxRate: fxValueLabel
      ? fxValueLabel
          .replace('{currency}', currencyDisplay(cur))
          .replace('{rate}', formatNumber(fx))
      : undefined,
  };
}

export type ProductCatalogDetailRow = {
  id: string;
  label: string;
  value: string;
  subValue?: string;
};

export type ProductCatalogDetailLabels = {
  packLabel: string;
  packValue: string;
  weightGram: string;
  composition: string;
  semiLinked: string;
  itemsCount: string;
  unit: string;
  defaultBagWeight: string;
  unitKg: string;
  purchasePrice: string;
  salePrice: string;
  priceInUzs: string;
  fxLabel: string;
  fxValue: string;
};

function pricingDetailRows(
  product: {
    purchasePrice?: number;
    salePrice?: number;
    priceCurrency?: SaleCurrency;
    fxRateToUzs?: number;
  },
  labels: Pick<
    ProductCatalogDetailLabels,
    'purchasePrice' | 'salePrice' | 'priceInUzs' | 'fxLabel' | 'fxValue'
  >,
  formatNumber: (n: number) => string,
): ProductCatalogDetailRow[] {
  const rows: ProductCatalogDetailRow[] = [];
  const cur = product.priceCurrency ?? 'UZS';
  const fx = product.fxRateToUzs ?? 0;

  const pushPrice = (id: string, label: string, amount: number | undefined) => {
    if (amount == null || amount <= 0) return;
    const value = `${formatSaleUnitPrice(amount, cur)} ${currencyDisplay(cur)}`;
    let subValue: string | undefined;
    if (cur !== 'UZS' && fx > 0) {
      const uzs = priceAmountInUzs(String(amount), String(fx));
      if (uzs != null) {
        subValue = labels.priceInUzs.replace('{amount}', formatNumber(uzs));
      }
    }
    rows.push({ id, label, value, subValue });
  };

  pushPrice('purchase', labels.purchasePrice, product.purchasePrice);
  pushPrice('sale', labels.salePrice, product.salePrice);

  if (cur !== 'UZS' && fx > 0) {
    rows.push({
      id: 'fx',
      label: labels.fxLabel,
      value: labels.fxValue
        .replace('{currency}', currencyDisplay(cur))
        .replace('{rate}', formatNumber(fx)),
    });
  }

  return rows;
}

export type CatalogProductForDetails = {
  itemType: 'RAW_MATERIAL' | 'SEMI_PRODUCT' | 'FINISHED_PRODUCT';
  piecesPerBag?: number | null;
  weightGram?: number;
  rawMaterials?: unknown[];
  machines?: unknown[];
  volumeLiter?: number;
  semiProducts?: unknown[];
  unit?: string;
  defaultBagWeightKg?: number;
  purchasePrice?: number;
  salePrice?: number;
  priceCurrency?: SaleCurrency;
  fxRateToUzs?: number;
};

export function getProductCatalogDetailRows(
  product: CatalogProductForDetails,
  labels: ProductCatalogDetailLabels,
  formatNumber: (n: number) => string,
): ProductCatalogDetailRow[] {
  const rows: ProductCatalogDetailRow[] = [];

  if (product.itemType === 'SEMI_PRODUCT') {
    const ppb = product.piecesPerBag ?? 0;
    if (ppb > 0) {
      rows.push({
        id: 'pack',
        label: labels.packLabel,
        value: labels.packValue.replace('{count}', formatNumber(ppb)),
      });
    }
    rows.push({
      id: 'weight',
      label: labels.weightGram,
      value: `${formatNumber(product.weightGram ?? 0)} g`,
    });
    const recipeCount = product.rawMaterials?.length ?? 0;
    rows.push({
      id: 'recipe',
      label: labels.composition,
      value: labels.itemsCount.replace('{count}', String(recipeCount)),
    });
  } else if (product.itemType === 'FINISHED_PRODUCT') {
    const ppb = product.piecesPerBag ?? 0;
    if (ppb > 0) {
      rows.push({
        id: 'pack',
        label: labels.packLabel,
        value: labels.packValue.replace('{count}', formatNumber(ppb)),
      });
    }
    const semiCount = product.semiProducts?.length ?? 0;
    rows.push({
      id: 'semi',
      label: labels.semiLinked,
      value: labels.itemsCount.replace('{count}', String(semiCount)),
    });
  } else if (product.itemType === 'RAW_MATERIAL') {
    rows.push({
      id: 'unit',
      label: labels.unit,
      value: product.unit ?? '—',
    });
    if (product.defaultBagWeightKg != null && product.defaultBagWeightKg > 0) {
      rows.push({
        id: 'bag',
        label: labels.defaultBagWeight,
        value: `${formatNumber(product.defaultBagWeightKg)} ${labels.unitKg}`,
      });
    }
  }

  rows.push(...pricingDetailRows(product, labels, formatNumber));
  return rows;
}
