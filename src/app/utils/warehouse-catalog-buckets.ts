import type {
  FinishedProductCatalogItem,
  SemiProductCatalogItem,
} from '../store/erp-store';

/**
 * Katalogdagi yarim tayyor учун слот калити: 18г / 20г алоҳида, бошқа вазнлар `25g` каби.
 * (Аввалги `>=19.5 → 20g` 25гни 20гга улаб юборardi.)
 */
export function semiBucketFromCatalog(product: SemiProductCatalogItem): string {
  const w = product.weightGram;
  if (typeof w === 'number' && Number.isFinite(w) && w > 0) {
    const r = Math.round(w);
    if (r === 18) return '18g';
    if (r === 20) return '20g';
    return `${r}g`;
  }
  const name = product.name?.trim() ?? '';
  const m = name.match(/(\d+)\s*(?:g|gr|г)\b/i);
  if (m) {
    const r = parseInt(m[1], 10);
    if (Number.isFinite(r) && r > 0) {
      if (r === 18) return '18g';
      if (r === 20) return '20g';
      return `${r}g`;
    }
  }
  if (name.includes('20')) return '20g';
  return '18g';
}

/** Katalogdagi tayyor mahsulotni 0.5L / 1L / 5L slotiga bog‘lash; standart bo‘lmagan hajm uchun null */
export function finalBucketFromCatalog(
  product: FinishedProductCatalogItem,
): '0.5L' | '1L' | '5L' | null {
  const v = product.volumeLiter;
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) return null;
  if (v >= 3) return '5L';
  if (v >= 0.85 && v < 1.5) return '1L';
  if (v < 0.85) return '0.5L';
  return null;
}

/**
 * Tayyor mahsulot nomidan ichki `volumeLiter` taxmini (API / slotlar uchun).
 * Foydalanuvchi litr kiritmaydi — «5L», «0,5 L» каби номдан олинади; топилмаса null.
 */
export function inferVolumeLiterFromFinishedProductName(name: string): number | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const re = /\b(\d+[.,]\d+|\d+)\s*(?:L|l|л|Л)\b/iu;
  const m = trimmed.match(re);
  if (!m) return null;
  const n = Number(m[1].replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Tayyor mahsulot qoldig‘i sloti: standart 0.5L/1L/5L yoki `2.2L` / katalog nomi */
export function finalStockSlotFromCatalog(product: FinishedProductCatalogItem): string {
  const std = finalBucketFromCatalog(product);
  if (std) return std;
  const v = product.volumeLiter;
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return `${v}L`;
  const inferred = inferVolumeLiterFromFinishedProductName(product.name ?? '');
  if (inferred != null && inferred > 0) return `${inferred}L`;
  return product.name?.trim() || 'other';
}
