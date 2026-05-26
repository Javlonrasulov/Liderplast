import type { WarehouseProduct } from '../store/erp-store';

export type PackagingLine = {
  id: string;
  productType: string;
  hoursWorked: string;
  packCount: string;
  notes: string;
};

function parseDecimalInput(raw: string): number {
  const normalized = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  if (normalized === '' || normalized === '.') return 0;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

function parseNonNegativeInt(raw: string): number {
  const digits = String(raw).trim().replace(/\s/g, '').replace(/[^\d]/g, '');
  if (digits === '') return NaN;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : NaN;
}

export function createEmptyPackagingLine(defaultProduct = ''): PackagingLine {
  return {
    id: `pkg-${Math.random().toString(16).slice(2)}`,
    productType: defaultProduct,
    hoursWorked: '',
    packCount: '',
    notes: '',
  };
}

export function isPackagingLineDraft(ln: PackagingLine): boolean {
  const packs = parseNonNegativeInt(ln.packCount);
  const hasQty = !Number.isNaN(packs) && packs > 0;
  return (
    hasQty ||
    Boolean(ln.hoursWorked.trim()) ||
    Boolean(ln.notes.trim()) ||
    Boolean(ln.productType.trim())
  );
}

function productKindByName(
  warehouseProducts: WarehouseProduct[],
): Map<string, 'SEMI' | 'FINISHED'> {
  const m = new Map<string, 'SEMI' | 'FINISHED'>();
  for (const p of warehouseProducts) {
    const name = p.name?.trim();
    if (!name) continue;
    if (p.itemType === 'SEMI_PRODUCT') m.set(name.toLowerCase(), 'SEMI');
    if (p.itemType === 'FINISHED_PRODUCT') m.set(name.toLowerCase(), 'FINISHED');
  }
  return m;
}

function piecesPerBagMaps(warehouseProducts: WarehouseProduct[]) {
  const finished = new Map<string, number>();
  const semiFromFinished = new Map<string, number>();
  for (const p of warehouseProducts) {
    if (p.itemType !== 'FINISHED_PRODUCT') continue;
    const name = p.name?.trim();
    if (!name) continue;
    const ppb =
      'piecesPerBag' in p && p.piecesPerBag != null && p.piecesPerBag > 0
        ? p.piecesPerBag
        : 1;
    finished.set(name.toLowerCase(), ppb);
    if ('semiProducts' in p) {
      for (const sp of p.semiProducts) {
        const sk = sp.name.trim().toLowerCase();
        if (!semiFromFinished.has(sk)) semiFromFinished.set(sk, ppb);
      }
    }
  }
  return { finished, semiFromFinished };
}

export function estimatePackagingPieces(
  ln: PackagingLine,
  warehouseProducts: WarehouseProduct[],
): number {
  const packs = Math.max(0, parseNonNegativeInt(ln.packCount) || 0);
  const key = ln.productType.trim().toLowerCase();
  const kinds = productKindByName(warehouseProducts);
  const { finished, semiFromFinished } = piecesPerBagMaps(warehouseProducts);
  if (kinds.get(key) === 'FINISHED') {
    return packs * (finished.get(key) ?? 1);
  }
  return packs * (semiFromFinished.get(key) ?? 1);
}

export function unpackagedStockForProduct(
  productName: string,
  warehouseProducts: WarehouseProduct[],
  warehouseStock: { itemType: string; itemName?: string; quantity: number; packagedQuantity?: number }[],
): number {
  const key = productName.trim().toLowerCase();
  const kinds = productKindByName(warehouseProducts);
  const kind = kinds.get(key);
  if (!kind) return 0;
  const itemType = kind === 'FINISHED' ? 'FINISHED_PRODUCT' : 'SEMI_PRODUCT';
  let total = 0;
  let packaged = 0;
  for (const row of warehouseStock) {
    if (row.itemType !== itemType || !row.itemName) continue;
    if (row.itemName.trim().toLowerCase() !== key) continue;
    total += row.quantity;
    packaged += row.packagedQuantity ?? 0;
  }
  return Math.max(0, total - packaged);
}

export type PackagingValidationLabels = {
  shiftNoDefsHint: string;
  productTypesEmptyHint: string;
  labelWorker: string;
  labelPackCount: string;
  labelProduct: string;
  packagingNoPiecesPerBag: string;
  packagingStockInsufficient: string;
};

export function validatePackagingLines(
  lines: PackagingLine[],
  warehouseProducts: WarehouseProduct[],
  warehouseStock: { itemType: string; itemName?: string; quantity: number; packagedQuantity?: number }[],
  labels: PackagingValidationLabels,
): { ok: true; meaningful: PackagingLine[] } | { ok: false; error: string } {
  const meaningful = lines.filter(isPackagingLineDraft);
  if (meaningful.length === 0) {
    return { ok: false, error: `${labels.labelPackCount}!` };
  }
  if (warehouseProducts.length === 0) {
    return { ok: false, error: labels.productTypesEmptyHint };
  }

  for (const ln of meaningful) {
    const packs = Math.max(0, parseNonNegativeInt(ln.packCount) || 0);
    if (packs <= 0) {
      return { ok: false, error: `${labels.labelPackCount}!` };
    }
    if (!ln.productType.trim()) {
      return { ok: false, error: `${labels.labelProduct}!` };
    }
    const pieces = estimatePackagingPieces(ln, warehouseProducts);
    if (pieces <= 0) {
      return { ok: false, error: labels.packagingNoPiecesPerBag };
    }
    const available = unpackagedStockForProduct(
      ln.productType,
      warehouseProducts,
      warehouseStock,
    );
    if (pieces > available) {
      return {
        ok: false,
        error: labels.packagingStockInsufficient
          .replace('{needed}', String(pieces))
          .replace('{available}', String(available)),
      };
    }
  }

  return { ok: true, meaningful };
}

export function parsePackagingLineHours(raw: string): number {
  return parseDecimalInput(raw);
}

export function parsePackagingLinePacks(raw: string): number {
  return Math.max(0, parseNonNegativeInt(raw) || 0);
}
