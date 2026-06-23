import type { T } from '../i18n/translations';

function withCount(template: string, count: string) {
  return template.replace('{count}', count);
}

function withMixed(template: string, invalid: string, duplicate: string) {
  return template.replace('{invalid}', invalid).replace('{duplicate}', duplicate);
}

/** Bitta backend xabarini foydalanuvchi tiliga */
export function translateStatementApiError(message: string, t: T): string {
  const raw = message.trim();
  if (!raw) return t.siUploadError;

  const lower = raw.toLowerCase();

  if (lower.includes('request failed with status')) return t.siUploadError;

  const exact: Record<string, string> = {
    'Fayl talab qilinadi': t.siErrFileRequired,
    "Ko'chirma topilmadi": t.siErrStatementNotFound,
    'Ko‘chirma topilmadi': t.siErrStatementNotFound,
    'Qator topilmadi': t.siErrRowNotFound,
    'Qator allaqachon tasdiqlangan. Avval uni bekor qiling.': t.siErrRowAlreadyConfirmed,
    'Summa noto‘g‘ri': t.siErrInvalidAmount,
    "Summa noto'g'ri": t.siErrInvalidAmount,
    'Mijoz tanlanmagan': t.siNeedClient,
    'Xarajat kategoriyasi tanlanmagan': t.siNeedCategory,
    'Mijoz uchun telefon raqam ajratib bo‘lmadi': t.siErrClientPhoneAllocate,
    "Mijoz uchun telefon raqam ajratib bo'lmadi": t.siErrClientPhoneAllocate,
    'Tasdiqlangan qatorni o‘tkazib yuborib bo‘lmaydi. Avval bekor qiling.':
      t.siErrSkipConfirmed,
    "Tasdiqlangan qatorni o'tkazib yuborib bo'lmaydi. Avval bekor qiling.":
      t.siErrSkipConfirmed,
    'Tasdiqlangan qatorni tahrirlash uchun avval uni bekor qiling.': t.siErrEditConfirmed,
    'Hisob raqami talab qilinadi': t.siErrAccountRequired,
    'Bu hisob raqami allaqachon mavjud': t.siErrAccountDuplicate,
    'Hisob raqami topilmadi': t.siErrAccountNotFound,
    'Fayl Excel formatida emas': t.siErrNotExcel,
    'Fayl Excel formatida emas. Faylni bankdan to‘g‘ridan-to‘g‘ri .xlsx qilib yuklab oling.':
      t.siErrExcelWrongFile,
    "Fayl Excel formatida emas. Faylni bankdan to'g'ridan-to'g'ri .xlsx qilib yuklab oling.":
      t.siErrExcelWrongFile,
    'Faqat Excel fayllar (.xlsx, .xls) qo‘llab-quvvatlanadi. Telegramdan yuklab, Excel sifatida saqlang.':
      t.siErrNotExcel,
    "Faqat Excel fayllar (.xlsx, .xls) qo'llab-quvvatlanadi. Telegramdan yuklab, Excel sifatida saqlang.":
      t.siErrNotExcel,
    'Excel faylida ma’lumot qatorlari topilmadi. Ustun sarlavhalari (kirim/chiqim, sana) borligini tekshiring.':
      t.siErrNoExcelRows,
    "Excel faylida ma'lumot qatorlari topilmadi. Ustun sarlavhalari (kirim/chiqim, sana) borligini tekshiring.":
      t.siErrNoExcelRows,
    'Faylni o‘qishda xatolik': t.siErrReadFailed,
    "Faylni o'qishda xatolik": t.siErrReadFailed,
    'Workbook does not contain any sheet': t.siErrNoSheet,
    'Invalid entry date': t.siErrInvalidDate,
    'Kassa hisobida yetarli mablag‘ yo‘q': t.siErrKassaInsufficient,
    "Kassa hisobida yetarli mablag' yo'q": t.siErrKassaInsufficient,
    'Mijoz hisobida yetarli mablag‘ yo‘q': t.siErrClientBalanceInsufficient,
    "Mijoz hisobida yetarli mablag' yo'q": t.siErrClientBalanceInsufficient,
    'Eski mijoz hisobida yetarli mablag‘ yo‘q': t.siErrClientBalanceInsufficient,
    "Eski mijoz hisobida yetarli mablag' yo'q": t.siErrClientBalanceInsufficient,
    'Client not found': t.siErrClientNotFound,
    'Client has been removed': t.siErrClientRemoved,
    'Client is required': t.siNeedClient,
    'Tekshiruvdan keyin yaroqli qatorlar topilmadi': t.siErrNoValidRows,
    'Faylning birinchi varag‘ida qatorlar topilmadi': t.siErrNoExcelRows,
    "Faylning birinchi varag'ida qatorlar topilmadi": t.siErrNoExcelRows,
    'Faqat .xlsx fayllar qo‘llab-quvvatlanadi': t.siErrNotExcel,
    "Faqat .xlsx fayllar qo'llab-quvvatlanadi": t.siErrNotExcel,
  };

  if (exact[raw]) return exact[raw];

  const allDup = raw.match(/Barcha qatorlar \((\d+) ta\)/i);
  if (allDup) return withCount(t.siErrAllDuplicatesCount, allDup[1]);

  const noValidOnly = raw.match(/Fayldan hech qanday qator.*?(\d+) ta yaroqsiz/i);
  if (noValidOnly) return withCount(t.siErrNoValidRowsCount, noValidOnly[1]);

  const mixed = raw.match(/Yaroqsiz:\s*(\d+),\s*takroriy:\s*(\d+)/i);
  if (mixed) return withMixed(t.siErrNoValidRowsMixed, mixed[1], mixed[2]);

  if (lower.includes('ilgari boshqa') || lower.includes('takror hisoblanadi')) {
    return t.siErrAllDuplicates;
  }
  if (lower.includes('yaroqsiz qator') && lower.includes('excel ustunlari')) {
    return t.siErrNoValidRows;
  }
  if (lower.includes('excel formatida emas')) {
    return lower.includes('bankdan') ? t.siErrExcelWrongFile : t.siErrNotExcel;
  }
  if (lower.includes('ma’lumot qatorlari topilmadi') || lower.includes("ma'lumot qatorlari topilmadi")) {
    return t.siErrNoExcelRows;
  }

  if (
    lower.includes('amount') &&
    (lower.includes('must not be less') ||
      lower.includes('must be a number') ||
      lower.includes('conforming'))
  ) {
    return t.siErrInvalidAmount;
  }

  if (lower.includes('entrydate') || lower.includes('entry date') || lower.includes('invalid entry date')) {
    return t.siErrInvalidDate;
  }

  if (lower.includes('kassa hisobida yetarli')) return t.siErrKassaInsufficient;
  if (lower.includes('mijoz hisobida yetarli')) return t.siErrClientBalanceInsufficient;
  if (lower.includes('client not found')) return t.siErrClientNotFound;
  if (lower.includes('client has been removed')) return t.siErrClientRemoved;

  if (lower.includes('mode must be') || lower.includes('mode should be')) {
    if (!lower.includes('kassa_inflow')) {
      return t.siErrKassaModeBackend;
    }
    return t.siErrValidation;
  }

  if (lower.includes('name must') || lower.includes('name should')) {
    return t.siErrNameRequired;
  }

  if (
    lower.includes('must ') ||
    lower.includes('should ') ||
    lower.includes('conforming') ||
    /^[a-z][a-z0-9_]* must /.test(lower)
  ) {
    return t.siErrValidation;
  }

  return t.siUploadError;
}

/** Yuklash ogohlantirishlari (bir nechta qator `. ` bilan ajratilgan bo‘lishi mumkin) */
export function translateStatementUploadDetails(details: string, t: T): string {
  const raw = details.trim();
  if (!raw) return '';

  return raw
    .split(/\.\s+/)
    .map((part) => translateStatementUploadNote(part.trim(), t))
    .filter(Boolean)
    .join(' · ');
}

function translateStatementUploadNote(note: string, t: T): string {
  const raw = note.trim();
  if (!raw) return '';

  const skipInvalid = raw.match(/Yaroqsiz qatorlar.*?(\d+)/i);
  if (skipInvalid) return withCount(t.siNoteSkippedInvalid, skipInvalid[1]);

  const skipDuplicate = raw.match(/Takroriy qatorlar.*?(\d+)/i);
  if (skipDuplicate) return withCount(t.siNoteSkippedDuplicate, skipDuplicate[1]);

  return translateStatementApiError(raw, t);
}

/** API xatosidan xabar matnini ajratib tarjima qiladi */
export function translateApiError(err: unknown, t: T, fallback?: string): string {
  const raw = err instanceof Error ? err.message : '';
  if (!raw.trim()) return fallback ?? t.siUploadError;
  return translateStatementApiError(raw, t);
}
