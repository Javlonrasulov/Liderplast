import type {
  FinishedProductCatalogItem,
  RawMaterialProduct,
  SaleCurrency,
  SemiProductCatalogItem,
} from '../store/erp-store';
import { formatNumber } from './format';
import { unitPriceInUzs } from './sales-currency';

export type WarehouseProfitLabels = {
  rawLine: string;
  semiLine: string;
  saleLine: string;
  profitLine: string;
  unavailable: string;
};

export type WarehouseProductProfitDisplay = {
  costLines: string[];
  saleUzsLine: string | null;
  profitLine: string | null;
  profitPerPieceUzs: number | null;
  costPerPieceUzs: number | null;
  salePerPieceUzs: number | null;
};

function purchasePricePerKgUzs(
  product: {
    purchasePrice?: number;
    priceCurrency?: SaleCurrency;
    fxRateToUzs?: number;
  },
  cbuUsdRate: number,
  cbuEurRate: number,
): number | null {
  const price = product.purchasePrice;
  if (price == null || price <= 0) return null;
  return unitPriceInUzs(
    price,
    product.priceCurrency ?? 'UZS',
    cbuUsdRate,
    cbuEurRate,
    product.fxRateToUzs,
  );
}

function salePricePerPieceUzs(
  product: {
    salePrice?: number;
    priceCurrency?: SaleCurrency;
    fxRateToUzs?: number;
  },
  cbuUsdRate: number,
  cbuEurRate: number,
): number | null {
  const price = product.salePrice;
  if (price == null || price <= 0) return null;
  return unitPriceInUzs(
    price,
    product.priceCurrency ?? 'UZS',
    cbuUsdRate,
    cbuEurRate,
    product.fxRateToUzs,
  );
}

function semiUnitCostUzs(
  semi: SemiProductCatalogItem,
  rawById: Map<string, RawMaterialProduct>,
  cbuUsdRate: number,
  cbuEurRate: number,
  labels: WarehouseProfitLabels,
): { total: number | null; lines: string[] } {
  let total = 0;
  let hasAny = false;
  const lines: string[] = [];

  for (const link of semi.rawMaterials) {
    const rm = rawById.get(link.rawMaterialId);
    if (!rm) continue;
    const kgPrice = purchasePricePerKgUzs(rm, cbuUsdRate, cbuEurRate);
    if (kgPrice == null || link.amountGram <= 0) continue;
    const pieceCost = kgPrice * (link.amountGram / 1000);
    total += pieceCost;
    hasAny = true;
    lines.push(
      labels.rawLine
        .replace('{name}', link.name)
        .replace('{kgPrice}', formatNumber(Math.round(kgPrice)))
        .replace('{grams}', formatNumber(link.amountGram))
        .replace('{cost}', formatNumber(Math.round(pieceCost))),
    );
  }

  return { total: hasAny ? total : null, lines };
}

export function buildWarehouseProductProfitDisplay(
  product: SemiProductCatalogItem | FinishedProductCatalogItem,
  rawById: Map<string, RawMaterialProduct>,
  semiById: Map<string, SemiProductCatalogItem>,
  cbuUsdRate: number,
  cbuEurRate: number,
  labels: WarehouseProfitLabels,
): WarehouseProductProfitDisplay {
  const empty: WarehouseProductProfitDisplay = {
    costLines: [],
    saleUzsLine: null,
    profitLine: null,
    profitPerPieceUzs: null,
    costPerPieceUzs: null,
    salePerPieceUzs: null,
  };

  let costLines: string[] = [];
  let costPerPiece: number | null = null;

  if (product.itemType === 'SEMI_PRODUCT') {
    const semiCost = semiUnitCostUzs(
      product,
      rawById,
      cbuUsdRate,
      cbuEurRate,
      labels,
    );
    costLines = semiCost.lines;
    costPerPiece = semiCost.total;
  } else {
    let total = 0;
    let hasAny = false;
    for (const link of product.semiProducts) {
      const semi = semiById.get(link.semiProductId);
      if (!semi) continue;
      const semiCost = semiUnitCostUzs(
        semi,
        rawById,
        cbuUsdRate,
        cbuEurRate,
        labels,
      );
      if (semiCost.total == null) continue;
      total += semiCost.total;
      hasAny = true;
      costLines.push(
        labels.semiLine
          .replace('{name}', link.name)
          .replace('{cost}', formatNumber(Math.round(semiCost.total))),
      );
      costLines.push(...semiCost.lines);
    }
    costPerPiece = hasAny ? total : null;
  }

  const salePerPiece = salePricePerPieceUzs(product, cbuUsdRate, cbuEurRate);
  const saleUzsLine =
    salePerPiece != null
      ? labels.saleLine.replace('{amount}', formatNumber(Math.round(salePerPiece)))
      : null;

  if (costPerPiece == null && salePerPiece == null) {
    return {
      ...empty,
      costLines: costLines.length > 0 ? costLines : [labels.unavailable],
    };
  }

  let profitPerPiece: number | null = null;
  if (costPerPiece != null && salePerPiece != null) {
    profitPerPiece = salePerPiece - costPerPiece;
  }

  const profitLine =
    profitPerPiece != null
      ? labels.profitLine.replace('{amount}', formatNumber(Math.round(profitPerPiece)))
      : null;

  return {
    costLines,
    saleUzsLine,
    profitLine,
    profitPerPieceUzs: profitPerPiece,
    costPerPieceUzs: costPerPiece,
    salePerPieceUzs: salePerPiece,
  };
}
