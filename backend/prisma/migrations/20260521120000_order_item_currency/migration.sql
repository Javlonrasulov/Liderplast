-- Sotuv qatorida valyuta (UZS/USD/EUR) — GET /orders xatosiz ishlashi uchun
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "currency" "PurchaseOrderCurrency" NOT NULL DEFAULT 'UZS';
