import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums.js';
import {
  AuthenticatedRequest,
  JwtUserPayload,
} from '../interfaces/authenticated-request.interface.js';

/**
 * Fine-grained permission check on top of @Roles.
 * If a route matches, the user must have at least one of the listed permissions
 * (from JWT), unless role is ADMIN.
 */
function requiredPermissionGroups(
  method: string,
  fullPath: string,
): string[][] | null {
  const path = (fullPath.split('?')[0] ?? '').replace(/\/+$/, '') || '/';
  const p = path.includes('/api/')
    ? path.slice(path.indexOf('/api') + 4)
    : path.startsWith('/')
      ? path.slice(1)
      : path;

  const route = `/${p}`.replace(/\/+/g, '/');

  const rules: Array<{
    test: RegExp;
    method: string | string[];
    anyOf: string[];
  }> = [
    /**
     * `/auth/me` va `/auth/logout` — autentifikatsiya bazaviy endpointlari.
     * Foydalanuvchining permissionlari nima bo‘lishidan qat’i nazar, JWT
     * to‘g‘ri bo‘lsa, ularga kirish ochiq bo‘lishi shart (aks holda foydalanuvchi
     * o‘z profilini ham ololmaydi yoki tizimdan chiqa olmaydi). Shuning uchun
     * bu yo‘llarda permission talab qilinmaydi — JWT guard yetarli.
     */

    { test: /^\/warehouse\/stock$/, method: 'GET', anyOf: ['view_warehouse'] },
    { test: /^\/warehouse\/catalog$/, method: 'GET', anyOf: ['view_warehouse'] },
    { test: /^\/warehouse\/history$/, method: 'GET', anyOf: ['view_warehouse'] },
    {
      test: /^\/warehouse\/(products|incoming|consume|adjust)$/,
      method: 'POST',
      anyOf: ['view_warehouse'],
    },
    {
      test: /^\/warehouse\/products\/[^/]+\/[^/]+$/,
      method: 'PATCH',
      anyOf: ['view_warehouse'],
    },
    {
      test: /^\/warehouse\/products\/[^/]+\/[^/]+$/,
      method: 'DELETE',
      anyOf: ['view_warehouse'],
    },
    {
      test: /^\/warehouse\/raw-material-purchase-orders$/,
      method: 'GET',
      anyOf: ['view_expenses', 'view_raw_material'],
    },
    {
      test: /^\/warehouse\/raw-material-purchase-orders$/,
      method: 'POST',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/warehouse\/raw-material-purchase-orders\/[^/]+\/fulfill$/,
      method: 'PATCH',
      anyOf: ['view_expenses', 'view_raw_material'],
    },

    {
      test: /^\/raw-material-bags$/,
      method: 'GET',
      anyOf: ['view_raw_material_bags', 'view_raw_material'],
    },
    {
      test: /^\/raw-material-bags\/active$/,
      method: 'GET',
      anyOf: ['view_raw_material_bags', 'view_raw_material'],
    },
    {
      test: /^\/raw-material-bags\/logs$/,
      method: 'GET',
      anyOf: ['view_raw_material_bags', 'view_raw_material'],
    },
    {
      test: /^\/raw-material-bags\/create$/,
      method: 'POST',
      anyOf: ['manage_raw_material_bags', 'view_raw_material'],
    },
    {
      test: /^\/raw-material-bags\/(connect|switch|writeoff|quick-consume)$/,
      method: 'POST',
      anyOf: ['manage_raw_material_bags', 'view_raw_material'],
    },

    { test: /^\/production$/, method: 'GET', anyOf: ['view_warehouse'] },
    { test: /^\/production$/, method: 'POST', anyOf: ['view_warehouse'] },
    { test: /^\/production\/machines$/, method: 'GET', anyOf: ['view_shift'] },
    { test: /^\/production\/machines$/, method: 'POST', anyOf: ['manage_shift_workers'] },
    {
      test: /^\/production\/machines\/[^/]+\/toggle$/,
      method: 'PATCH',
      anyOf: ['manage_shift_workers'],
    },
    {
      test: /^\/production\/machines\/[^/]+$/,
      method: 'DELETE',
      anyOf: ['manage_shift_workers'],
    },
    { test: /^\/production\/shifts$/, method: 'GET', anyOf: ['view_shift'] },
    { test: /^\/production\/shifts$/, method: 'POST', anyOf: ['manage_shift_workers'] },
    {
      test: /^\/production\/shifts\/[^/]+$/,
      method: 'DELETE',
      anyOf: ['manage_shift_workers'],
    },
    {
      test: /^\/production\/shifts\/[^/]+$/,
      method: 'PATCH',
      anyOf: ['manage_shift_workers'],
    },

    { test: /^\/clients$/, method: 'GET', anyOf: ['view_sales'] },
    { test: /^\/clients$/, method: 'POST', anyOf: ['view_sales'] },
    { test: /^\/orders$/, method: 'GET', anyOf: ['view_sales'] },
    { test: /^\/orders$/, method: 'POST', anyOf: ['view_sales'] },
    { test: /^\/payments$/, method: 'GET', anyOf: ['view_sales'] },
    { test: /^\/payments$/, method: 'POST', anyOf: ['view_sales'] },
    {
      test: /^\/payments\/[^/]+$/,
      method: 'DELETE',
      anyOf: ['view_sales'],
    },

    {
      test: /^\/finance\/expenses$/,
      method: 'GET',
      anyOf: ['view_expenses', 'view_reports'],
    },
    { test: /^\/finance\/expenses$/, method: 'POST', anyOf: ['view_expenses'] },
    {
      test: /^\/finance\/raw-material-purchase-orders$/,
      method: 'GET',
      anyOf: ['view_expenses', 'view_raw_material'],
    },
    {
      test: /^\/finance\/raw-material-purchase-orders$/,
      method: 'POST',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/finance\/raw-material-purchase-orders\/[^/]+\/fulfill$/,
      method: 'PATCH',
      anyOf: ['view_expenses', 'view_raw_material'],
    },
    {
      test: /^\/finance\/expenses\/categories$/,
      method: 'GET',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/finance\/expenses\/categories$/,
      method: 'POST',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/finance\/expenses\/categories\/[^/]+$/,
      method: 'PATCH',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/finance\/expenses\/categories\/[^/]+$/,
      method: 'DELETE',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/finance\/expense-categories$/,
      method: 'GET',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/finance\/expense-categories$/,
      method: 'POST',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/finance\/expense-categories\/[^/]+$/,
      method: 'PATCH',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/finance\/expense-categories\/[^/]+$/,
      method: 'DELETE',
      anyOf: ['view_expenses'],
    },
    {
      test: /^\/finance\/salary-settings$/,
      method: 'GET',
      anyOf: ['view_vedemost', 'create_vedemost'],
    },
    {
      test: /^\/finance\/salary-settings$/,
      method: 'PUT',
      anyOf: ['create_vedemost'],
    },
    {
      test: /^\/finance\/salary-settings\/electricity-price$/,
      method: 'PATCH',
      anyOf: ['view_expenses', 'create_vedemost'],
    },
    { test: /^\/finance\/salary\/generate$/, method: 'POST', anyOf: ['create_vedemost'] },
    {
      test: /^\/finance\/salary\/month-status$/,
      method: 'POST',
      anyOf: ['create_vedemost'],
    },
    { test: /^\/finance\/salary$/, method: 'GET', anyOf: ['view_vedemost'] },
    {
      test: /^\/finance\/salary\/[^/]+$/,
      method: 'GET',
      anyOf: ['view_vedemost'],
    },
    {
      test: /^\/finance\/salary\/[^/]+$/,
      method: 'PATCH',
      anyOf: ['create_vedemost'],
    },
    {
      test: /^\/finance\/upload-oborotka$/,
      method: 'POST',
      anyOf: ['create_vedemost'],
    },
    { test: /^\/finance\/vedomosts$/, method: 'GET', anyOf: ['view_vedemost'] },
    {
      test: /^\/finance\/vedomost\/[^/]+$/,
      method: 'GET',
      anyOf: ['view_vedemost'],
    },
    {
      test: /^\/finance\/salary-vedomost$/,
      method: 'GET',
      anyOf: ['view_vedemost'],
    },

    { test: /^\/users$/, method: 'GET', anyOf: ['manage_users', 'view_payroll'] },
    {
      test: /^\/users$/,
      method: 'POST',
      anyOf: ['manage_users', 'manage_shift_workers'],
    },
    { test: /^\/users\/[^/]+$/, method: 'GET', anyOf: ['manage_users', 'view_payroll'] },
    {
      test: /^\/users\/[^/]+$/,
      method: 'PATCH',
      anyOf: ['manage_users', 'manage_shift_workers'],
    },
    {
      test: /^\/users\/[^/]+$/,
      method: 'DELETE',
      anyOf: ['manage_users', 'manage_shift_workers'],
    },

    { test: /^\/files\/upload$/, method: 'POST', anyOf: ['manage_settings'] },
    { test: /^\/files\/uploads$/, method: 'GET', anyOf: ['manage_settings'] },
  ];

  for (const rule of rules) {
    const methods = Array.isArray(rule.method) ? rule.method : [rule.method];
    if (!methods.includes(method)) continue;
    if (rule.test.test(route)) {
      return [rule.anyOf];
    }
  }

  return null;
}

@Injectable()
export class AppPermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user as
      | (JwtUserPayload & { permissions?: string[] })
      | undefined;
    if (!user) {
      return true;
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    if (user.permissions === undefined) {
      return true;
    }

    const http = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url?: string;
    }>();
    const full = http.originalUrl ?? http.url ?? '';
    const groups = requiredPermissionGroups(http.method, full);

    if (!groups || groups.length === 0) {
      return true;
    }

    const effective = new Set(user.permissions ?? []);
    const ok = groups.some((g) => g.some((perm) => effective.has(perm)));
    if (!ok) {
      throw new ForbiddenException('Insufficient application permissions');
    }
    return true;
  }
}
