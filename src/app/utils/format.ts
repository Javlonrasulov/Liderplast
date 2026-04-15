export const TODAY = new Date().toISOString().split('T')[0];

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
  const today = new Date(TODAY);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

export function getLast30Days(): string[] {
  const today = new Date(TODAY);
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });
}

export function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}