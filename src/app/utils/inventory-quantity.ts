/**
 * Inventarizatsiya miqdori: kg uchun «12.560» / «12,560» / «12 560» = 12 kg 560 g.
 */
export function parseInventoryQuantityInput(
  raw: string,
  unit: 'kg' | 'pcs',
): number | null {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '.' || trimmed === '-') return 0;

  if (unit === 'pcs') {
    const normalized = trimmed.replace(/\s/g, '').replace(',', '.');
    if (!/^\d*\.?\d*$/.test(normalized)) return null;
    const n = Number(normalized);
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  }

  const spacedKgGrams = trimmed.match(/^(\d+)\s*[-\s]\s*(\d{1,3})$/);
  if (spacedKgGrams) {
    const kg = Number(spacedKgGrams[1]);
    const gramPart = spacedKgGrams[2];
    if (!Number.isFinite(kg) || kg < 0) return null;
    const grams = Number(gramPart);
    if (!Number.isFinite(grams) || grams >= 1000) return null;
    const divisor = 10 ** gramPart.length;
    return kg + grams / divisor;
  }

  const dotKgGrams = trimmed.match(/^(\d+)[.,](\d{3})$/);
  if (dotKgGrams) {
    const kg = Number(dotKgGrams[1]);
    const grams = Number(dotKgGrams[2]);
    if (!Number.isFinite(kg) || !Number.isFinite(grams) || kg < 0 || grams >= 1000) {
      return null;
    }
    return kg + grams / 1000;
  }

  const normalized = trimmed.replace(/\s/g, '').replace(',', '.');
  if (!/^\d*\.?\d*$/.test(normalized)) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function formatInventoryQuantityDisplay(
  quantity: number,
  unit: 'kg' | 'pcs',
): string {
  if (!Number.isFinite(quantity)) return '0';
  if (unit === 'pcs') {
    return Number.isInteger(quantity) ? String(quantity) : String(quantity);
  }
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(quantity);
}
