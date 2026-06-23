import type { T } from '../i18n/translations';

/** Backend va class-validator xabarlarini foydalanuvchi tiliga */
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
  };

  if (exact[raw]) return exact[raw];

  if (
    lower.includes('amount') &&
    (lower.includes('must not be less') ||
      lower.includes('must be a number') ||
      lower.includes('conforming'))
  ) {
    return t.siErrInvalidAmount;
  }

  if (lower.includes('entrydate') || lower.includes('entry date')) {
    return t.siErrInvalidDate;
  }

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

  return raw;
}
