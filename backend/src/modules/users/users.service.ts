import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Role } from '../../generated/prisma/enums.js';

const DEFAULT_WORKER_LOGIN_PERMISSIONS = [
  'view_dashboard',
  'view_warehouse',
  'view_shift',
  'manage_shift_workers',
];

function normalizeStir(value?: string | null) {
  const digits = value?.replace(/\D/g, '') ?? '';
  return digits || null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ba’zi PostgreSQL / Prisma versiyalarida `mode: 'insensitive'` OR shartida 500 berishi mumkin.
   * Telefon → aniq mos, keyin login (aniq, keyin katta-kichik harf).
   */
  async findByLoginOrPhone(identifier: string) {
    const id = identifier.trim();
    if (!id) {
      return null;
    }

    const byPhone = await this.prisma.user.findUnique({
      where: { phone: id },
    });
    if (byPhone) {
      return byPhone;
    }

    const byLoginExact = await this.prisma.user.findFirst({
      where: { login: id },
    });
    if (byLoginExact) {
      return byLoginExact;
    }

    const lower = id.toLowerCase();
    const withLogin = await this.prisma.user.findMany({
      where: { NOT: { login: null } },
      take: 2000,
    });
    return (
      withLogin.find(
        (u) => u.login != null && u.login.toLowerCase() === lower,
      ) ?? null
    );
  }

  private async allocatePlaceholderPhone(): Promise<string> {
    for (let i = 0; i < 50; i += 1) {
      const suffix = `${90000000 + Math.floor(Math.random() * 9999999)}`.slice(0, 8);
      const phone = `+99877${suffix}`;
      const exists = await this.prisma.user.findUnique({ where: { phone } });
      if (!exists) {
        return phone;
      }
    }
    throw new ConflictException('Could not allocate unique phone');
  }

  async create(dto: CreateUserDto) {
    let phone = dto.phone?.trim();
    if (!phone) {
      phone = await this.allocatePlaceholderPhone();
    }

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    if (dto.login?.trim()) {
      const existingLogin = await this.prisma.user.findFirst({
        where: { login: { equals: dto.login.trim(), mode: 'insensitive' } },
      });
      if (existingLogin) {
        throw new ConflictException('Login already exists');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const role = dto.role ?? Role.WORKER;
    const canLogin =
      dto.canLogin ?? (role === Role.WORKER ? false : true);

    const permissions =
      dto.permissions && dto.permissions.length > 0
        ? dto.permissions
        : role === Role.WORKER
          ? [...DEFAULT_WORKER_LOGIN_PERMISSIONS]
          : [];

    return this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        position: dto.position,
        cardNumber: dto.cardNumber,
        stir: normalizeStir(dto.stir),
        phone,
        login: dto.login?.trim() || null,
        customRoleLabel: dto.customRoleLabel?.trim() || null,
        permissions,
        canLogin,
        passwordHash,
        role,
        salaryType: dto.salaryType,
        salaryRate: dto.salaryRate ?? 0,
        preferredShiftNumber: dto.preferredShiftNumber ?? null,
        isActive: dto.isActive ?? true,
      },
      omit: {
        passwordHash: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      omit: { passwordHash: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async update(id: string, dto: UpdateUserDto) {
    const current = await this.ensureExists(id);

    if (dto.login?.trim()) {
      const existingLogin = await this.prisma.user.findFirst({
        where: {
          login: { equals: dto.login.trim(), mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (existingLogin) {
        throw new ConflictException('Login already exists');
      }
    }

    if (dto.phone?.trim()) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: dto.phone.trim(), NOT: { id } },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const updateData: Record<string, unknown> = { ...dto };
    if ('stir' in dto) {
      updateData.stir = normalizeStir(dto.stir);
    }

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      delete updateData.password;
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive === true) {
        updateData.employmentEndedAt = null;
      } else if (dto.isActive === false && current.isActive) {
        updateData.employmentEndedAt = new Date();
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      omit: { passwordHash: true },
    });
  }

  /**
   * WORKER: smena / maosh / tarix saqlansin — qatorni бошқа жадваллар билан CASCADE ўчирмаймиз.
   * Бошқа роллар: қатъан ўчирилади.
   */
  async remove(id: string) {
    const user = await this.ensureExists(id);
    if (user.role === Role.WORKER) {
      await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          canLogin: false,
          permissions: [],
          login: null,
          ...(user.isActive ? { employmentEndedAt: new Date() } : {}),
        },
      });
      return { success: true, archived: true };
    }
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
