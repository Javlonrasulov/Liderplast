import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
  InventoryItemType,
  ProductionStage,
  Role,
  SalaryType,
} from '../src/generated/prisma/enums.js';

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

  const raw = await prisma.rawMaterial.upsert({
    where: { name: 'PET Granula' },
    update: {},
    create: {
      name: 'PET Granula',
      unit: 'kg',
    },
  });

  const semi = await prisma.semiProduct.upsert({
    where: { name: '18g Preform' },
    update: {},
    create: {
      name: '18g Preform',
      weightGram: 18,
    },
  });

  const finished = await prisma.finishedProduct.upsert({
    where: { name: '0.5L Bottle' },
    update: {},
    create: {
      name: '0.5L Bottle',
      volumeLiter: 0.5,
    },
  });

  await prisma.inventoryBalance.upsert({
    where: { rawMaterialId: raw.id },
    update: { itemType: InventoryItemType.RAW_MATERIAL, quantity: 1000 },
    create: {
      itemType: InventoryItemType.RAW_MATERIAL,
      rawMaterialId: raw.id,
      quantity: 1000,
    },
  });

  await prisma.inventoryBalance.upsert({
    where: { semiProductId: semi.id },
    update: { itemType: InventoryItemType.SEMI_PRODUCT, quantity: 5000 },
    create: {
      itemType: InventoryItemType.SEMI_PRODUCT,
      semiProductId: semi.id,
      quantity: 5000,
    },
  });

  await prisma.inventoryBalance.upsert({
    where: { finishedProductId: finished.id },
    update: { itemType: InventoryItemType.FINISHED_PRODUCT, quantity: 2000 },
    create: {
      itemType: InventoryItemType.FINISHED_PRODUCT,
      finishedProductId: finished.id,
      quantity: 2000,
    },
  });

  await prisma.machine.upsert({
    where: { name: 'Preform Line #1' },
    update: {},
    create: {
      name: 'Preform Line #1',
      stage: ProductionStage.SEMI,
      powerKw: 35,
      maxCapacityPerHour: 5000,
    },
  });
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
