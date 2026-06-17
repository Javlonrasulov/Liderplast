SELECT COUNT(*) AS orders_after, SUM("totalAmount") AS sum_after
FROM "Order" WHERE "orderedAt" >= '2026-06-10';

SELECT COUNT(*) AS payments_for_old_orders, SUM(p.amount) AS sum_pay
FROM "Payment" p
JOIN "Order" o ON o.id = p."orderId"
WHERE o."orderedAt" < '2026-06-10';
