import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const sessionUser = request.user;
    const userRole = sessionUser?.role;

    if (!userRole) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    if (userRole === Role.ADMIN) {
      return true;
    }

    /**
     * Maxsus (custom) lavozimli foydalanuvchilar — `MANAGER` ostida saqlansa-da,
     * ularning kirishini faqat aniq ruxsatlar (permissions) belgilaydi:
     * shu yerda ro‘l filtri qattiq qo‘yilmaydi va keyingi `AppPermissionGuard`
     * o‘zining kalitlari orqali nazoratni davom ettiradi.
     */
    if (sessionUser?.customRoleLabel && sessionUser.customRoleLabel.trim().length > 0) {
      return true;
    }

    if (!roles.includes(userRole)) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}
