import type { SaleCurrency } from '../store/erp-store';

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

export function formatProductPricingHint(
  product: {
    purchasePrice?: number;
    salePrice?: number;
    priceCurrency?: SaleCurrency;
    fxRateToUzs?: number;
  },
  labels: {
    purchase: string;
    sale: string;
    fx: string;
  },
  formatNumber: (n: number) => string,
): string | null {
  const parts: string[] = [];
  const cur = product.priceCurrency ?? 'UZS';
  if (product.purchasePrice != null && product.purchasePrice > 0) {
    parts.push(`${labels.purchase}: ${formatNumber(product.purchasePrice)} ${cur}`);
  }
  if (product.salePrice != null && product.salePrice > 0) {
    parts.push(`${labels.sale}: ${formatNumber(product.salePrice)} ${cur}`);
  }
  if (cur !== 'UZS' && product.fxRateToUzs != null && product.fxRateToUzs > 0) {
    parts.push(`${labels.fx}: ${formatNumber(product.fxRateToUzs)}`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}
