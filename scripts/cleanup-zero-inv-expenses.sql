DELETE FROM "Expense" e
USING "ExpenseCategory" ec
WHERE e."categoryId" = ec.id
  AND (ec.name ILIKE '%inventarizatsiya%' OR e.title ILIKE '%inventarizatsiya%')
  AND e.amount = 0;
