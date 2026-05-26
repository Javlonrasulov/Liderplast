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

export function formatCurrency(num: number): string {
  return formatNumber(num) + " so'm";
}

export function formatKg(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(2) + ' t';
  return formatNumber(num) + ' kg';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
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