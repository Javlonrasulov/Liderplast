/** Backend `ALL_APP_PERMISSIONS` bilan mos kelishi kerak */
export const APP_PERMISSION_KEYS = [
  'view_dashboard',
  'view_shift',
  'manage_shift_workers',
  'view_raw_material',
  'view_raw_material_bags',
  'manage_raw_material_bags',
  'view_warehouse',
  'view_sales',
  'view_expenses',
  'view_payroll',
  'view_vedemost',
  'create_vedemost',
  'view_reports',
  'manage_settings',
  'manage_users',
] as const;

export type AppPermissionKey = (typeof APP_PERMISSION_KEYS)[number];
