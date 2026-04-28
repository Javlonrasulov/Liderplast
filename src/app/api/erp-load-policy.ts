import type { SessionUser, SessionRole } from '../auth/auth-context';
import type { AppPermissionKey } from '../auth/permission-keys';

type HasPerm = (key: AppPermissionKey) => boolean;

/** Backend `@Roles` + `AppPermissionGuard` qoidalariga mos: keraksiz so‘rovlar 403 bermasligi uchun */
function hasRole(user: SessionUser, ...allowed: SessionRole[]): boolean {
  if (user.role === 'ADMIN') return true;
  /**
   * Maxsus (custom) lavozim — backenddagi `RolesGuard` ham bunday foydalanuvchilarda
   * qattiq ro‘l filtrini chetlab o‘tadi va kirishni faqat permissionlar belgilaydi.
   * Shuning uchun frontend yuk-rejasi ham roldagi cheklovlarni qo‘llamasligi kerak.
   */
  if (user.customRoleLabel && user.customRoleLabel.trim().length > 0) return true;
  return allowed.includes(user.role);
}

export type ErpApiLoadPlan = {
  warehouseCatalog: boolean;
  warehouseStock: boolean;
  warehouseHistory: boolean;
  rawMaterialBags: boolean;
  production: boolean;
  machines: boolean;
  shifts: boolean;
  clients: boolean;
  orders: boolean;
  payments: boolean;
  expenses: boolean;
  users: boolean;
  salarySettings: boolean;
  salaryRows: boolean;
};

export function getErpApiLoadPlan(user: SessionUser, has: HasPerm): ErpApiLoadPlan {
  return {
    warehouseCatalog:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER', 'WORKER') && has('view_warehouse'),
    warehouseStock:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER', 'WORKER') && has('view_warehouse'),
    warehouseHistory:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER') && has('view_warehouse'),
    rawMaterialBags:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER', 'WORKER') &&
      (has('view_raw_material_bags') || has('view_raw_material')),
    production:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER', 'WORKER') && has('view_warehouse'),
    machines: hasRole(user, 'DIRECTOR', 'MANAGER', 'WORKER') && has('view_shift'),
    shifts:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER', 'WORKER') && has('view_shift'),
    clients: hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER') && has('view_sales'),
    orders:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER', 'WORKER') && has('view_sales'),
    payments: hasRole(user, 'DIRECTOR', 'ACCOUNTANT') && has('view_sales'),
    expenses: hasRole(user, 'DIRECTOR', 'ACCOUNTANT') && has('view_expenses'),
    users:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER') &&
      (has('manage_users') || has('view_payroll')),
    salarySettings:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'MANAGER') &&
      (has('view_vedemost') || has('create_vedemost')),
    salaryRows:
      hasRole(user, 'DIRECTOR', 'ACCOUNTANT', 'WORKER') && has('view_vedemost'),
  };
}
