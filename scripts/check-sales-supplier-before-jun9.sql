-- Tekshiruv: 9-iyungacha (2026-06-09 oxirigacha) yozuvlar
SELECT 'Order' AS tbl, COUNT(*) AS cnt, SUM("totalAmount") AS sum_total
FROM "Order" WHERE "orderedAt" < '2026-06-10';

SELECT 'OrderItem' AS tbl, COUNT(*) AS cnt, SUM(total) AS sum_total
FROM "OrderItem" oi
JOIN "Order" o ON o.id = oi."orderId"
WHERE o."orderedAt" < '2026-06-10';

SELECT 'Payment' AS tbl, COUNT(*) AS cnt, SUM(amount) AS sum_total
FROM "Payment" WHERE "paidAt" < '2026-06-10';

SELECT 'SupplierPurchaseOrder' AS tbl, COUNT(*) AS cnt, SUM("amountUzs") AS sum_uzs
FROM "SupplierPurchaseOrder" WHERE "orderedAt" < '2026-06-10';

SELECT MIN("orderedAt")::date AS min_date, MAX("orderedAt")::date AS max_date FROM "Order";
SELECT MIN("orderedAt")::date AS min_date, MAX("orderedAt")::date AS max_date FROM "SupplierPurchaseOrder";
