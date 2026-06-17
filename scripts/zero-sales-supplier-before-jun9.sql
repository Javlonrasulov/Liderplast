-- Sotuv va postavchik: 2026-06-09 oxirigacha summalarni 0 qilish (yozuvlar qoladi)
BEGIN;

UPDATE "OrderItem" oi
SET price = 0,
    total = 0
FROM "Order" o
WHERE oi."orderId" = o.id
  AND o."orderedAt" < '2026-06-10';

UPDATE "Order"
SET "totalAmount" = 0,
    "paidAmount" = 0,
    "debtAmount" = 0,
    "updatedAt" = NOW()
WHERE "orderedAt" < '2026-06-10';

UPDATE "Payment" p
SET amount = 0
WHERE p."paidAt" < '2026-06-10'
   OR EXISTS (
     SELECT 1 FROM "Order" o
     WHERE o.id = p."orderId" AND o."orderedAt" < '2026-06-10'
   );

UPDATE "SupplierPurchaseOrder"
SET "amountOriginal" = 0,
    "amountUzs" = 0,
    "paidAmountUzs" = 0,
    "debtAmountUzs" = 0
WHERE "orderedAt" < '2026-06-10';

UPDATE "Expense" e
SET amount = 0,
    "updatedAt" = NOW()
FROM "SupplierPurchaseOrder" spo
WHERE spo."expenseId" = e.id
  AND spo."orderedAt" < '2026-06-10';

COMMIT;

-- Tekshiruv
SELECT 'Order<=Jun9' AS lbl, COUNT(*) AS cnt, COALESCE(SUM("totalAmount"),0) AS sum_total
FROM "Order" WHERE "orderedAt" < '2026-06-10'
UNION ALL
SELECT 'Order>=Jun10', COUNT(*), COALESCE(SUM("totalAmount"),0)
FROM "Order" WHERE "orderedAt" >= '2026-06-10'
UNION ALL
SELECT 'Supplier<=Jun9', COUNT(*), COALESCE(SUM("amountUzs"),0)
FROM "SupplierPurchaseOrder" WHERE "orderedAt" < '2026-06-10';
