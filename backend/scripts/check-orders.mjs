import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient();
try {
  const count = await prisma.order.count();
  console.log('order_count', count);
  const orders = await prisma.order.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      items: { include: { semiProduct: true, finishedProduct: true } },
    },
  });
  console.log(
    'sample',
    orders.map((o) => ({
      id: o.id.slice(0, 8),
      client: o.client?.name,
      items: o.items.length,
      total: o.totalAmount,
    })),
  );
} catch (e) {
  console.error('ERR', e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
