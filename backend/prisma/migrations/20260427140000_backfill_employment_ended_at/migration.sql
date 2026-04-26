-- Avvalgi arxivlangan ishchilar: chiqish sanasi bo‘sh bo‘lsa, oxirgi yangilanish sanasidan taxminiy to‘ldirish
UPDATE "User"
SET "employmentEndedAt" = "updatedAt"
WHERE "isActive" = false
  AND "employmentEndedAt" IS NULL;
