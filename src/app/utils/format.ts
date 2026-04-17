/** YYYY-MM-DD in the user's local calendar (matches `<input type="date">` and wall-clock "today"). */
export function toLocalDateString(iso: string | number | Date): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const TODAY = toLocalDateString(new Date());

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(num));
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