-- Qop chiqimi (buyurtma emas) — alohida kategoriya
INSERT INTO "ExpenseCategory" ("id", "name", "legacyExpenseType", "electricityCalc", "deletedAt", "createdAt")
VALUES ('expseed_raw_material_bag_writeoff', 'Хом ашё — қоп чиқими', 'OTHER', false, NULL, CURRENT_TIMESTAMP);

-- Avval noto‘g‘ri «tashqi buyurtma» ostida qolgan qop chiqimlari
UPDATE "Expense"
SET "categoryId" = 'expseed_raw_material_bag_writeoff'
WHERE "title" LIKE 'Qop chiqimi:%'
  AND "categoryId" = 'expseed_raw_material_orders';
