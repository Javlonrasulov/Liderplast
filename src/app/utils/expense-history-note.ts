import type { T } from '../i18n/translations';
import { formatNumber } from './format';

/**
 * Xarajatlar «Изоҳ» ustuni: DB dagi texnik / lotin qatorlarni joriy til shablonlariga.
 */
export function formatExpenseHistoryNote(text: string | null | undefined, t: T): string {
  if (!text) return '';

  let s = text
    .replace(/\s*·\s*ref:bw:[a-z0-9]+/gi, '')
    .replace(/\bbaholash:\s*/gi, 'Kg narxi: ')
    .trim();

  /* Qop: cmo173… (ichki ID) → Қоп №…1234 */
  s = s.replace(/Qop:\s*(c[a-z0-9]{14,40})\b/gi, (_, id: string) =>
    t.exNoteBagCuidDisplay.replace('{suffix}', id.slice(-4)),
  );

  /* Tashqi buyurtma: «3000 kg · USD 6000 · kurs … · → … UZS» */
  s = s.replace(
    /(\d+(?:\.\d+)?)\s*kg\s*·\s*(UZS|USD|EUR)\s+([\d.,]+)\s*·\s*kurs\s+([\d.,]+)\s*·\s*→\s*([\d\s]+)\s*UZS/gi,
    (_, kg: string, cur: string, amt: string, rate: string, uzsRaw: string) => {
      const uzs = Number(String(uzsRaw).replace(/\s/g, '').replace(/,/g, ''));
      return t.exNotePurchaseOrderTpl
        .replace('{kg}', kg)
        .replace('{currency}', cur)
        .replace('{amount}', amt)
        .replace('{rate}', rate)
        .replace('{uzs}', Number.isFinite(uzs) ? formatNumber(uzs) : uzsRaw.trim())
        .replace('{unit}', t.unitSum);
    },
  );

  s = s.replace(
    /Kg narxi:\s*([\d.]+)\s*so['']m\s*\(oxirgi etib kelgan buyurtma\s+bo['']yicha\)/gi,
    (_, price: string) => t.exNoteKgPriceLastOrder.replace('{price}', price),
  );
  s = s.replace(
    /Kg narxi:\s*([\d.]+)\s*so['']m\s*\(tashqi buyurtma, hali omborga kelmagan\)/gi,
    (_, price: string) => t.exNoteKgPricePendingOrder.replace('{price}', price),
  );
  s = s.replace(
    /Tashqi buyurtma bo['']yicha kg narxi topilmadi — 0 so['']m/gi,
    () => t.exNoteKgPriceMissing,
  );

  return s.trim();
}
