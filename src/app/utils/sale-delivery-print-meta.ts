/** Chop etishda ko‘rsatiladigan transport ma’lumotlari */
export type SaleDeliveryPrintMeta = {
  vehiclePlate?: string;
  driverName?: string;
};

export function deliveryMetaRowsHtml(meta?: SaleDeliveryPrintMeta): string {
  const plate = meta?.vehiclePlate?.trim() ?? '';
  const driver = meta?.driverName?.trim() ?? '';
  if (!plate && !driver) return '';

  const esc = (v: string) =>
    v
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  let rows = '';
  if (plate) {
    rows += `<tr><td class="k">Автомобиль:</td><td>${esc(plate)}</td></tr>`;
  }
  if (driver) {
    rows += `<tr><td class="k">Водитель:</td><td>${esc(driver)}</td></tr>`;
  }
  return rows;
}

export function deliveryMetaPdfRows(meta?: SaleDeliveryPrintMeta): object[][] {
  const plate = meta?.vehiclePlate?.trim() ?? '';
  const driver = meta?.driverName?.trim() ?? '';
  const rows: object[][] = [];
  if (plate) {
    rows.push([{ text: 'Автомобиль:', bold: true }, { text: plate }]);
  }
  if (driver) {
    rows.push([{ text: 'Водитель:', bold: true }, { text: driver }]);
  }
  return rows;
}
