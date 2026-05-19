import type { Sale, SaleOrderItem } from '../store/erp-store';
import { formatDate, formatNumber } from './format';

const PRINT_ORG_NAME = '"SAM-BC" MCHJ';

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function saleItems(sale: Sale): SaleOrderItem[] {
  if (sale.items && sale.items.length > 0) {
    return sale.items;
  }
  return [
    {
      productCategory: sale.productCategory,
      productType: sale.productType,
      quantity: sale.quantity,
      pricePerUnit: sale.pricePerUnit,
      total: sale.total,
    },
  ];
}

/** Barcha sotuvlar bo‘yicha ketma-ket hujjat raqami (000000001 …) */
export function computeSaleDocumentNumber(sale: Sale, allSales: Sale[]): string {
  const sorted = [...allSales].sort((a, b) => {
    const byDate = a.createdAt.localeCompare(b.createdAt);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
  const index = sorted.findIndex((s) => s.id === sale.id);
  const seq = index >= 0 ? index + 1 : sorted.length + 1;
  return String(seq).padStart(9, '0');
}

function buildCopyHtml(sale: Sale, documentNumber: string) {
  const items = saleItems(sale);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const docDate = formatDate(sale.date);

  const rows = items
    .map(
      (item, index) => `
        <tr>
          <td class="c">${index + 1}</td>
          <td class="l">${esc(item.productType)}</td>
          <td class="c">${index + 1}</td>
          <td class="c">шт</td>
          <td class="r">${formatNumber(item.quantity)}</td>
          <td class="c"></td>
          <td class="c"></td>
        </tr>`,
    )
    .join('');

  return `
    <div class="copy">
      <div class="company">${esc(PRINT_ORG_NAME)}</div>
      <div class="title">Реализация номенклатуры № ${esc(documentNumber)} от ${esc(docDate)}</div>
      <table class="meta">
        <tr><td class="k">Отправитель:</td><td>${esc(PRINT_ORG_NAME)}</td></tr>
        <tr><td class="k">Покупатель:</td><td>${esc(sale.clientName)}</td></tr>
      </table>
      <table class="items">
        <thead>
          <tr>
            <th>№</th>
            <th>Наименование</th>
            <th>Номенкл. номер</th>
            <th>Ед. изм.</th>
            <th>Количество</th>
            <th>Цена</th>
            <th>Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="total-label">Итого</td>
            <td class="r total-qty">${formatNumber(totalQty)}</td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <table class="sign">
        <tr>
          <td>Бухгалтер</td>
          <td rowspan="2" class="sign-mid">Отпустил</td>
          <td>Принял</td>
        </tr>
        <tr>
          <td>Лаборант</td>
          <td>Охрана</td>
        </tr>
      </table>
    </div>`;
}

export function buildSaleDeliveryNotePrintHtml(sale: Sale, allSales: Sale[] = []) {
  const documentNumber = computeSaleDocumentNumber(sale, allSales.length > 0 ? allSales : [sale]);
  const copy = buildCopyHtml(sale, documentNumber);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Реализация — ${esc(sale.clientName)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 4mm;
        font-family: "Times New Roman", Times, serif;
        color: #000;
        background: #fff;
      }
      .page-row {
        display: flex;
        flex-direction: row;
        gap: 3mm;
        width: 100%;
        align-items: flex-start;
        justify-content: space-between;
      }
      .copy {
        flex: 1 1 0;
        min-width: 0;
        max-width: 50%;
        padding: 1mm 1.5mm;
        font-size: 6.5pt;
        line-height: 1.2;
        page-break-inside: avoid;
      }
      .company {
        font-weight: 700;
        font-size: 8.5pt;
        margin-bottom: 0.5mm;
      }
      .title {
        font-weight: 700;
        font-size: 7pt;
        margin-bottom: 1.5mm;
        text-align: center;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      .meta td {
        padding: 0.3mm 0;
        vertical-align: top;
        font-size: 6pt;
      }
      .meta .k {
        white-space: nowrap;
        padding-right: 1mm;
        width: 38%;
      }
      .items {
        margin-top: 1.5mm;
        font-size: 5.5pt;
      }
      .items th,
      .items td {
        border: 1px solid #000;
        padding: 0.5mm 0.4mm;
        vertical-align: top;
      }
      .items th {
        font-weight: 700;
        text-align: center;
        background: #f5f5f5;
      }
      .items .c { text-align: center; }
      .items .r { text-align: right; white-space: nowrap; }
      .items .l { text-align: left; }
      .items tfoot .total-label {
        font-weight: 700;
        text-align: right;
      }
      .items tfoot .total-qty {
        font-weight: 700;
      }
      .sign {
        margin-top: 2mm;
        font-size: 5.5pt;
        width: 100%;
      }
      .sign td {
        padding-top: 3mm;
        vertical-align: top;
        width: 33.33%;
      }
      .sign-mid {
        vertical-align: middle;
        text-align: center;
      }
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
      @media print {
        body { padding: 0; }
        .page-row { gap: 2mm; }
      }
    </style>
  </head>
  <body>
    <div class="page-row">
      ${copy}
      ${copy}
    </div>
    <script>
      window.addEventListener('load', () => setTimeout(() => window.print(), 200));
    </script>
  </body>
</html>`;
}

export function printSaleDeliveryNote(sale: Sale, allSales: Sale[] = []) {
  const html = buildSaleDeliveryNotePrintHtml(sale, allSales);
  const w = window.open('', '_blank', 'width=820,height=900');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
