import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUserPayload } from '../../../common/interfaces/authenticated-request.interface.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.accessSecret') ?? 'access-secret',
    });
  }

  /**
   * `customRoleLabel` JWT tokenida mavjud bo‘lmasa (eski tokenlar yoki
   * mos tushmagan klientlar uchun) — ishonchli bo‘lishi uchun bazadan
   * to‘g‘ridan-to‘g‘ri olib qo‘yamiz. Bu kichik indekslangan o‘qish.
   */
  async validate(payload: JwtUserPayload): Promise<JwtUserPayload> {
    if (typeof payload.customRoleLabel !== 'undefined') {
      return payload;
    }
    try {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { customRoleLabel: true },
      });
      return { ...payload, customRoleLabel: dbUser?.customRoleLabel ?? null };
    } catch {
      return { ...payload, customRoleLabel: null };
    }
  }
}
