/** Business calendar timezone (Uzbekistan, UTC+5, no DST). */
export const APP_TIME_ZONE = 'Asia/Tashkent';

/** Bo‘sh qiymat / «yo‘q» ko‘rinishi (em dash, UTF-8). */
export const EMPTY_PLACEHOLDER = '\u2014';

/** Bir qatorda bir nechta maydon orasidagi ajratgich. */
export const INLINE_SEP = ' \u00B7 ';

/** YYYY-MM-DD in the user's local calendar (matches `<input type="date">` and wall-clock "today"). */
export function toLocalDateString(iso: string | number | Date): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

let serverTodayCache: string | null = null;

/** Set after {@link refreshServerToday} from API; `null` clears server override. */
export function setServerTodayYmd(ymd: string | null) {
  serverTodayCache = ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : null;
}

function calendarPartsInAppTz(now: Date): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const pick = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: pick('year'), month: pick('month') - 1, day: pick('day') };
}

/** Year/month/day for calendar UI; prefers server `today` when synced. */
export function getAppCalendarParts(now: Date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  if (serverTodayCache) {
    const p = parseYmdLocal(serverTodayCache);
    if (p) {
      return {
        year: p.getFullYear(),
        month: p.getMonth(),
        day: p.getDate(),
      };
    }
  }
  return calendarPartsInAppTz(now);
}

/** Local fallback (business TZ) when API is unavailable. */
export function localTodayYmd(now: Date = new Date()): string {
  const { year, month, day } = calendarPartsInAppTz(now);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Today's date (`YYYY-MM-DD`).
 * Uses server health `today` when synced over the network; otherwise {@link localTodayYmd}.
 */
export function todayYmd(now: Date = new Date()): string {
  return serverTodayCache ?? localTodayYmd(now);
}

/** API ga yuborish uchun sanani `YYYY-MM-DD` formatiga keltiradi */
export function normalizeApiYmd(value: string, fallback?: string): string {
  const head = value.trim().slice(0, 10);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(head);
  if (iso) return head;
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(head);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return fallback ?? todayYmd();
}

/** @deprecated Use {@link todayYmd}() instead. */
export const TODAY = localTodayYmd();

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(num));
}

/** Kiritish: faqat raqamlar qoladi. */
export function parseDigitsFromAmountInput(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Butun son kiritilganda ko‘rinish (masalan: 1 000 000).
 * `form` holatida saqlanadigan string faqat raqamlar bo‘lishi kerak.
 */
export function displayGroupedIntInput(onlyDigits: string): string {
  const d = onlyDigits.replace(/\D/g, '');
  if (d === '') return '';
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * kg (PET, kraska): кичик миқдорлар 0 га яхлитланмайди (масалан 300 г → 0,3 kg).
 */
export function formatKgAmount(kg: number): string {
  if (!Number.isFinite(kg)) return '0';
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(kg);
}

/**
 * Xomashyo harakati: 1 kg dan kichik miqdorlar gramm ko‘rinishida (masalan 29 g).
 */
export function formatRawMaterialMovementQty(kg: number): {
  amount: string;
  unit: 'kg' | 'g';
} {
  if (!Number.isFinite(kg) || Math.abs(kg) < 1e-9) {
    return { amount: '0', unit: 'kg' };
  }

  const abs = Math.abs(kg);
  if (abs < 1) {
    const grams = abs * 1000;
    if (grams >= 0.5) {
      const displayG = grams >= 10 ? Math.round(grams) : Math.round(grams * 10) / 10;
      return {
        amount: new Intl.NumberFormat('ru-RU', {
          minimumFractionDigits: 0,
          maximumFractionDigits: grams >= 10 ? 0 : 1,
        }).format(displayG),
        unit: 'g',
      };
    }
  }

  return { amount: formatKgAmount(abs), unit: 'kg' };
}

export function formatCurrency(num: number): string {
  return formatNumber(num) + " so'm";
}

export function formatKg(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(2) + ' t';
  return formatNumber(num) + ' kg';
}

/** Ko‘rsatish: `DD-MM-YYYY` (masalan 29-05-2026). Ichki saqlash: `YYYY-MM-DD`. */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const head = dateStr.trim().slice(0, 10);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(head);
  if (iso) {
    return `${iso[3]}-${iso[2]}-${iso[1]}`;
  }
  const parsed = parseYmdLocal(head);
  if (parsed) {
    return `${String(parsed.getDate()).padStart(2, '0')}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${parsed.getFullYear()}`;
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${formatDate(dateStr)} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function formatPercent(val: number, max: number): string {
  if (max === 0) return '0%';
  return ((val / max) * 100).toFixed(1) + '%';
}

export function calcPercent(val: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(100, (val / max) * 100);
}

export function getLast7Days(): string[] {
  const now = new Date();
  const anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - (6 - i));
    return toLocalDateString(d);
  });
}

export function getLast30Days(): string[] {
  const now = new Date();
  const anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - (29 - i));
    return toLocalDateString(d);
  });
}

/** Parse `YYYY-MM-DD` as a local calendar date (no UTC midnight shift). */
export function parseYmdLocal(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  const dt = new Date(y, mo, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

/** Every calendar day from `from` through `to` (inclusive), `YYYY-MM-DD`, local. */
export function getInclusiveDateRange(from: string, to: string, maxDays = 400): string[] {
  const a = parseYmdLocal(from);
  const b = parseYmdLocal(to);
  if (!a || !b) return [];
  let start = a.getTime();
  let end = b.getTime();
  if (start > end) {
    const t = start;
    start = end;
    end = t;
  }
  const out: string[] = [];
  const cur = new Date(start);
  const limit = end;
  while (cur.getTime() <= limit && out.length < maxDays) {
    out.push(toLocalDateString(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** Kalendardagi kabi qisqa sana: `DD.MM` */
export function fmtShortDateYmd(ymd: string): string {
  if (!ymd) return '';
  const [, m, d] = ymd.split('-');
  return `${d}.${m}`;
}

/**
 * Grafik va hisobot sarlavhalaridagi sana oralig‘i.
 * Filtr yo‘q → `last7Label`; from/to bor → `DD.MM — DD.MM.YYYY`.
 */
export function formatChartDateRangeLabel(
  preset: string,
  from: string,
  to: string,
  last7Label: string,
  fallbackLabel?: string,
): string {
  if (preset === 'all' && !from && !to) return last7Label;
  if (from && to) {
    const year = to.split('-')[0];
    if (from === to) return `${fmtShortDateYmd(from)}.${year}`;
    return `${fmtShortDateYmd(from)} — ${fmtShortDateYmd(to)}.${year}`;
  }
  return fallbackLabel ?? last7Label;
}

/** Tarjimadagi `(…, birlik)` qismini saqlab, sana qismini almashtiradi. */
export function buildReportChartTitle(titleWithMeta: string, rangeLabel: string): string {
  const base = titleWithMeta.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const suffixMatch = titleWithMeta.match(/\([^,)]+,\s*([^)]+)\)\s*$/);
  const suffix = suffixMatch?.[1]?.trim();
  const inner = suffix ? `${rangeLabel}, ${suffix}` : rangeLabel;
  return `${base} (${inner})`;
}

export function shortDate(dateStr: string): string {
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (m) {
    const day = parseInt(m[3], 10);
    const monthIdx = parseInt(m[2], 10) - 1;
    return `${day} ${months[monthIdx] ?? ''}`.trim();
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${months[d.getMonth()]}`;
}