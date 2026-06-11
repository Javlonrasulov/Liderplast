SELECT amount, COUNT(*) FROM "Expense" e
JOIN "ExpenseCategory" ec ON ec.id = e."categoryId"
WHERE ec.name ILIKE '%inventarizatsiya%' OR e.title ILIKE '%inventarizatsiya%'
GROUP BY amount ORDER BY amount DESC;
