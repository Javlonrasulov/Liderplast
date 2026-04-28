import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TokenType } from '../../generated/prisma/enums.js';
import { JwtUserPayload } from '../../common/interfaces/authenticated-request.interface.js';
import { effectivePermissionsForUser } from '../../common/constants/permissions.js';
import type { User } from '../../generated/prisma/client.js';
import { UpdateCredentialsDto } from './dto/update-credentials.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException('Phone number already exists');
    }

    const user = await this.usersService.create({
      ...dto,
      password: dto.password,
    });

    const saved = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    return this.buildAuthResponse(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByLoginOrPhone(dto.identifier.trim());

    if (!user || !user.isActive || !user.canLogin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const savedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenType: TokenType.REFRESH,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!savedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const matches = await bcrypt.compare(refreshToken, savedToken.tokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    await this.prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
    });

    return this.buildAuthResponse(user);
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: {
          userId: payload.sub,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
      return { success: true };
    } catch {
      return { success: true };
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      omit: { passwordHash: true },
    });

    const permissions = effectivePermissionsForUser(user);

    return {
      ...user,
      permissions,
    };
  }

  async updateCredentials(userId: string, dto: UpdateCredentialsDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existing || !existing.isActive || !existing.canLogin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const currentOk = await bcrypt.compare(
      dto.currentPassword,
      existing.passwordHash,
    );
    if (!currentOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const nextLogin = dto.login?.trim() || undefined;
    if (nextLogin) {
      const taken = await this.prisma.user.findFirst({
        where: {
          login: { equals: nextLogin, mode: 'insensitive' },
          NOT: { id: userId },
        },
      });
      if (taken) {
        throw new ConflictException('Login already exists');
      }
    }

    const data: Record<string, unknown> = {};
    if (nextLogin !== undefined) data.login = nextLogin || null;
    if (dto.newPassword) {
      data.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    }

    // Nothing to change: still rotate tokens if password verified (safe).
    await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    // Revoke existing refresh tokens and issue new ones.
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null, tokenType: TokenType.REFRESH },
      data: { revokedAt: new Date() },
    });

    const updated = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return this.buildAuthResponse(updated);
  }

  private async buildAuthResponse(user: User) {
    const permissions = effectivePermissionsForUser(user);

    const payload: JwtUserPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      permissions,
      customRoleLabel: user.customRoleLabel ?? null,
    };

    const accessSecret =
      this.configService.get<string>('jwt.accessSecret') ?? 'access-secret';
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ?? 'refresh-secret';
    const accessExpires =
      (this.configService.get<string>('jwt.accessExpiresIn') ?? '15m') as StringValue;
    const refreshExpires =
      (this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d') as StringValue;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpires,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpires,
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 10),
        tokenType: TokenType.REFRESH,
        expiresAt: this.calculateRefreshExpiry(),
      },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        login: user.login,
        role: user.role,
        customRoleLabel: user.customRoleLabel,
        permissions,
      },
      accessToken,
      refreshToken,
    };
  }

  private async verifyRefreshToken(token: string): Promise<JwtUserPayload> {
    try {
      const secret =
        this.configService.get<string>('jwt.refreshSecret') ?? 'refresh-secret';
      return await this.jwtService.verifyAsync<JwtUserPayload>(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private calculateRefreshExpiry() {
    const expiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const now = new Date();

    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn, 10);
      now.setDate(now.getDate() + days);
      return now;
    }

    now.setDate(now.getDate() + 7);
    return now;
  }
}
