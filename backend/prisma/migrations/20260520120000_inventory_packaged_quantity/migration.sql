-- Qadoqlangan donalar (ishlab chiqarish → qadoqlanmagan; qadoqlash → packagedQuantity oshadi)
ALTER TABLE "InventoryBalance" ADD COLUMN "packagedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;
