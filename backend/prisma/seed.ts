import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { Role, SalaryType } from '../src/generated/prisma/enums.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/liderplast',
  }),
});

async function main() {
  const passwordHash = await bcrypt.hash('Director123', 10);

  await prisma.user.upsert({
    where: { phone: '+998900000001' },
    update: {
      fullName: 'System Administrator',
      passwordHash,
      role: Role.ADMIN,
      canLogin: true,
      permissions: [],
    },
    create: {
      fullName: 'System Administrator',
      phone: '+998900000001',
      passwordHash,
      role: Role.ADMIN,
      salaryType: SalaryType.FIXED,
      salaryRate: 0,
      canLogin: true,
      permissions: [],
    },
  });

  await prisma.salarySetting.upsert({
    where: { id: 'default-salary-setting' },
    update: {
      incomeTaxPercent: 12,
      otherDeductionPercent: 5,
      socialTaxPercent: 1,
      npsPercent: 1,
    },
    create: {
      id: 'default-salary-setting',
      incomeTaxPercent: 12,
      otherDeductionPercent: 5,
      socialTaxPercent: 1,
      npsPercent: 1,
    },
  });

  // Demo inventory / machines removed — local DB starts empty for manual entry.
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
