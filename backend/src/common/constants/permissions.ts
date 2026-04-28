import { Role } from '../../generated/prisma/enums.js';

/** Must match frontend `permission-keys.ts` */
export const ALL_APP_PERMISSIONS = [
  'view_dashboard',
  'view_shift',
  'manage_shift_workers',
  'view_raw_material',
  'view_raw_material_bags',
  'manage_raw_material_bags',
  'view_warehouse',
  'view_inventory',
  'view_sales',
  'view_expenses',
  'view_payroll',
  'view_vedemost',
  'create_vedemost',
  'view_reports',
  'manage_settings',
  'manage_users',
] as const;

export type AppPermission = (typeof ALL_APP_PERMISSIONS)[number];

export function defaultPermissionsForRole(role: Role): string[] {
  const all = [...ALL_APP_PERMISSIONS];

  switch (role) {
    case Role.ADMIN:
      return all;
    case Role.DIRECTOR:
      return [
        'view_dashboard',
        'view_shift',
        'manage_shift_workers',
        'view_raw_material',
        'view_raw_material_bags',
        'manage_raw_material_bags',
        'view_warehouse',
        'view_inventory',
        'view_sales',
        'view_expenses',
        'view_payroll',
        'view_vedemost',
        'view_reports',
      ];
    case Role.ACCOUNTANT:
      return [
        'view_dashboard',
        'view_raw_material_bags',
        'view_payroll',
        'view_vedemost',
        'create_vedemost',
        'view_reports',
        'view_expenses',
        'view_sales',
      ];
    case Role.MANAGER:
      return [
        'view_dashboard',
        'view_shift',
        'manage_shift_workers',
        'view_raw_material_bags',
        'manage_raw_material_bags',
      ];
    case Role.WORKER:
    default:
      return [];
  }
}

export function effectivePermissionsForUser(user: {
  role: Role;
  permissions: string[];
  customRoleLabel?: string | null;
}): string[] {
  if (user.role === Role.ADMIN) {
    return [...ALL_APP_PERMISSIONS];
  }

  const custom = user.customRoleLabel?.trim();
  if (custom && user.role === Role.MANAGER) {
    const only = (user.permissions ?? []).filter((p) =>
      ALL_APP_PERMISSIONS.includes(p as AppPermission),
    );
    return [...new Set(only)];
  }

  const base = new Set(defaultPermissionsForRole(user.role));
  for (const p of user.permissions ?? []) {
    if (ALL_APP_PERMISSIONS.includes(p as AppPermission)) {
      base.add(p);
    }
  }
  return [...base];
}
