-- Faqat «Inventarizatsiya chiqim» xarajatlarini 0 qilish (ombor/ boshqa jadvallarga tegmaydi)
UPDATE "Expense" e
SET amount = 0,
    "updatedAt" = NOW()
FROM "ExpenseCategory" ec
WHERE e."categoryId" = ec.id
  AND (
    ec.name ILIKE '%inventarizatsiya%chiqim%'
    OR ec.name ILIKE '%инвентаризация%'
    OR e.title ILIKE '%inventarizatsiya%chiqim%'
    OR e.title ILIKE '%Inventarizatsiya chiqim%'
  )
  AND e.amount <> 0;

-- Tekshiruv
SELECT amount, COUNT(*) AS cnt, SUM(amount) AS total
FROM "Expense" e
JOIN "ExpenseCategory" ec ON ec.id = e."categoryId"
WHERE ec.name ILIKE '%inventarizatsiya%'
   OR e.title ILIKE '%inventarizatsiya%'
GROUP BY amount
ORDER BY amount DESC;
