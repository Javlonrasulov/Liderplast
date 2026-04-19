import type { T } from '../i18n/translations';

/** Ro‘yxatdagi nom ustun: ba’zi xarajat yozuvlarida `categoryName` bo‘sh kelishi mumkin */
export function resolveExpenseCategoryNameFromState(
  categoryId: string,
  nameOnExpense: string | null | undefined,
  categories: { id: string; name: string }[],
): string {
  const fromList = categories.find((c) => c.id === categoryId)?.name;
  const a = (fromList ?? '').trim();
  if (a) return a;
  return (nameOnExpense ?? '').trim();
}

/** `ExpenseCategory` seed — `backend/.../migration.sql` */
export const EXPENSE_CATEGORY_ID_RAW_MATERIAL_EXTERNAL_ORDER = 'expseed_raw_material_orders';

/** Eski DB yoki qo‘lda shu matn bilan yaratilgan kategoriyalar */
const RAW_MATERIAL_ORDER_DB_NAMES = new Set(['Xom ashyo tashqi buyurtma']);

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function isRawMaterialExternalOrderCategory(categoryId: string, nameFromDb: string): boolean {
  if (categoryId === EXPENSE_CATEGORY_ID_RAW_MATERIAL_EXTERNAL_ORDER) return true;
  const n = (nameFromDb ?? '').trim();
  if (RAW_MATERIAL_ORDER_DB_NAMES.has(n)) return true;
  return norm(n) === norm('Xom ashyo tashqi buyurtma');
}

/**
 * DB dagi kategoriya nomini joriy tilga moslab (ma’lum seeded kategoriyalar uchun).
 */
export function labelExpenseCategory(categoryId: string, nameFromDb: string | null | undefined, t: T): string {
  const raw = nameFromDb ?? '';
  if (isRawMaterialExternalOrderCategory(categoryId, raw)) {
    const tr = (t.exCategoryLabelRawMaterialExternalOrder ?? '').trim();
    return tr || raw.trim() || 'Xom ashyo tashqi buyurtma';
  }
  return raw.trim();
}
