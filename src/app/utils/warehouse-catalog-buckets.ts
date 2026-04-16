import type {
  FinishedProductCatalogItem,
  SemiProductCatalogItem,
} from '../store/erp-store';

/** Katalogdagi yarim tayyor mahsulotni ombor statistikasi kalitiga (18g / 20g) bog‘lash */
export function semiBucketFromCatalog(
  product: SemiProductCatalogItem,
): '18g' | '20g' {
  const w = product.weightGram;
  if (typeof w === 'number' && Number.isFinite(w)) {
    if (w >= 19.5) return '20g';
    if (w > 0) return '18g';
  }
  return product.name?.includes('20') ? '20g' : '18g';
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
