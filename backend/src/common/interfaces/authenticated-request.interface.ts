import { Request } from 'express';
import { Role } from '../../generated/prisma/enums.js';

export interface JwtUserPayload {
  sub: string;
  role: Role;
  phone: string;
  permissions: string[];
  /**
   * Tizim foydalanuvchilari sahifasida yaratilgan maxsus (custom) lavozim nomi.
   * Mavjud bo‘lsa — foydalanuvchining kirish darajasi `permissions` ro‘yxati bilan
   * to‘liq belgilanadi va `RolesGuard` qattiq ro‘l filtrini chetlab o‘tadi
   * (`AppPermissionGuard` esa hamon ishlaydi).
   */
  customRoleLabel?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}
