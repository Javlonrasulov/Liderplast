import type {
  RawMaterialProduct,
  SemiProductCatalogItem,
  WarehouseProduct,
} from '../store/erp-store';

function namesMatchCatalog(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export type PlannedSemiRawRow = {
  rawMaterialId: string;
  name: string;
  plannedKg: number;
};

/** Qolip (SEMI) katalog retsepti: 1 dona + brak uchun rejadagi xomashyo, kg */
export function getPlannedSemiRawRows(
  warehouseProducts: WarehouseProduct[],
  productLabel: string,
  materialUnits: number,
): PlannedSemiRawRow[] {
  if (!productLabel.trim() || materialUnits <= 0) return [];
  const semis = warehouseProducts.filter(
    (p): p is SemiProductCatalogItem => p.itemType === 'SEMI_PRODUCT',
  );
  const semi = semis.find((s) => namesMatchCatalog(s.name, productLabel));
  if (!semi) return [];
  const out: PlannedSemiRawRow[] = [];
  for (const rm of semi.rawMaterials) {
    const meta = warehouseProducts.find(
      (p): p is RawMaterialProduct =>
        p.itemType === 'RAW_MATERIAL' && p.id === rm.rawMaterialId,
    );
    if (meta?.rawMaterialKind === 'PAINT') continue;
    const plannedKg = (rm.amountGram * materialUnits) / 1000;
    if (plannedKg <= 0) continue;
    out.push({ rawMaterialId: rm.rawMaterialId, name: rm.name, plannedKg });
  }
  return out;
}
