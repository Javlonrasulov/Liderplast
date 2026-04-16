import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/liderplast';

    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit() {
    const maxAttempts = 8;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.$connect();
        this.logger.log(`Connected to database (${attempt}/${maxAttempts})`);
        return;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const waitMs = Math.min(500 * 2 ** (attempt - 1), 8000);
        this.logger.warn(
          `DB connection failed (${attempt}/${maxAttempts}): ${msg}. Retrying in ${waitMs}ms`,
        );
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }
    }

    this.logger.error(
      'Giving up: PostgreSQL unreachable. Ensure the server is running and DATABASE_URL in backend/.env is correct (try host 127.0.0.1).',
    );
    throw lastError;
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
