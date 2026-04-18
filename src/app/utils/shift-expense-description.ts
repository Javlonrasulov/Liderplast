import type { T } from '../i18n/translations';
import { formatNumber, toLocalDateString } from './format';

type ShiftExpenseV1 = {
  v: 1;
  d: string;
  n: number;
  w: string;
  m: string;
  k: number;
  p: number;
};

function isV1(x: unknown): x is ShiftExpenseV1 {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return o.v === 1 && typeof o.d === 'string' && typeof o.n === 'number';
}

function displayYmd(ymd: string): string {
  if (ymd.length === 10 && ymd[4] === '-')
    return toLocalDateString(`${ymd}T12:00:00`);
  return toLocalDateString(ymd);
}

function fmtKwh(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const r = Math.round(n * 10) / 10;
  return r % 1 === 0 ? String(r) : r.toFixed(1);
}

/**
 * Smena-elektr xarajati: DB dan kelgan tavsifni joriy til shabloni bo‘yicha.
 * (Yangi: JSON v1. Eski: "Smena → elektr: ..." yoki noma’lum matn o‘zicha.)
 */
export function formatShiftExpenseTableNote(
  description: string | null | undefined,
  t: T,
): string {
  const raw = (description ?? '').trim();
  if (!raw) return '';

  if (raw.startsWith('{')) {
    try {
      const j = JSON.parse(raw) as unknown;
      if (isV1(j)) {
        return t.exShiftExpenseNote
          .replace('{date}', displayYmd(j.d))
          .replace('{n}', String(j.n))
          .replace('{worker}', (j.w || '—').trim())
          .replace('{machine}', (j.m || '—').trim())
          .replace('{kwh}', fmtKwh(j.k))
          .replace('{price}', formatNumber(j.p))
          .replace('{unit}', t.unitSum);
      }
    } catch {
      // ignore
    }
  }

  // Eski (matn) format: Smena → elektr: YYYY-MM-DD, N-smena — worker; machine — k kVt·soat × p so'm
  const legacy = raw.match(
    /^Smena → elektr: ([\d-]+), (\d+)-smena — ([^;]+); (.+?) — ([\d.]+)\s*kVt[·*]soat × ([\d.]+)\s*so['']m?$/i,
  );
  if (legacy) {
    const [, d, n, w, m, k, p] = legacy;
    return t.exShiftExpenseNote
      .replace('{date}', displayYmd(d!))
      .replace('{n}', n!)
      .replace('{worker}', w!.trim())
      .replace('{machine}', m!.trim())
      .replace('{kwh}', fmtKwh(parseFloat(k!)))
      .replace('{price}', formatNumber(parseFloat(p!)))
      .replace('{unit}', t.unitSum);
  }

  return raw;
}
