-- Eski qop chiqimi tavsiflaridagi texnik `ref:bw:…` markerini olib tashlash
UPDATE "Expense"
SET "description" = regexp_replace("description", '\s*·\s*ref:bw:[a-z0-9]+', '', 'gi')
WHERE "title" LIKE 'Qop chiqimi:%'
  AND "description" ~ 'ref:bw:';
