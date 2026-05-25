import type { Sale, SaleOrderItem } from '../store/erp-store';
import { formatDate, formatNumber } from './format';

const PRINT_ORG_NAME = '"SAM-BC" MCHJ';

const PRINT_STYLES = `
  * { box-sizing: border-box; }
  .sale-note-root {
    font-family: "Times New Roman", Times, serif;
    color: #000;
    background: #fff;
    font-size: 8.5pt;
    line-height: 1.3;
    padding: 2mm;
  }
  .page-row {
    display: flex;
    flex-direction: column;
    gap: 6mm;
    width: 100%;
  }
  .copy {
    width: 100%;
    padding: 2mm 0;
    page-break-inside: avoid;
  }
  .copy + .copy {
    padding-top: 5mm;
    border-top: 1px dashed #999;
  }
  .company {
    font-weight: 700;
    font-size: 12pt;
    margin-bottom: 1mm;
  }
  .title {
    font-weight: 700;
    font-size: 10pt;
    margin-bottom: 2.5mm;
    text-align: center;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  .meta td {
    padding: 0.5mm 0;
    vertical-align: top;
    font-size: 8pt;
  }
  .meta .k {
    white-space: nowrap;
    padding-right: 2mm;
    width: 30%;
    font-weight: 700;
  }
  .items {
    margin-top: 2.5mm;
    font-size: 7.5pt;
  }
  .items th,
  .items td {
    border: 1px solid #000;
    padding: 0.9mm 1mm;
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
    margin-top: 4mm;
    width: 100%;
    border: none;
  }
  .sign td {
    border: none;
    padding: 0 2mm 0 0;
    vertical-align: top;
    width: 33.33%;
  }
  .sign-mid {
    text-align: center;
  }
  .sign-label {
    font-weight: 700;
    font-size: 8pt;
    margin-bottom: 1mm;
  }
  .sign-line {
    border-bottom: 1px solid #000;
    height: 10mm;
    min-height: 10mm;
    width: 100%;
  }
  .sign-line-tall {
    height: 22mm;
    min-height: 22mm;
  }
`;

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
      currency: 'UZS',
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
          <td class="sign-cell">
            <div class="sign-label">Бухгалтер</div>
            <div class="sign-line"></div>
          </td>
          <td class="sign-cell sign-mid" rowspan="2">
            <div class="sign-label">Отпустил</div>
            <div class="sign-line sign-line-tall"></div>
          </td>
          <td class="sign-cell">
            <div class="sign-label">Принял</div>
            <div class="sign-line"></div>
          </td>
        </tr>
        <tr>
          <td class="sign-cell">
            <div class="sign-label">Лаборант</div>
            <div class="sign-line"></div>
          </td>
          <td class="sign-cell">
            <div class="sign-label">Охрана</div>
            <div class="sign-line"></div>
          </td>
        </tr>
      </table>
    </div>`;
}

function buildNoteBodyHtml(sale: Sale, documentNumber: string, copyCount: 1 | 2) {
  const copy = buildCopyHtml(sale, documentNumber);
  const copies = copyCount === 2 ? `${copy}${copy}` : copy;
  return `<div class="sale-note-root"><div class="page-row">${copies}</div></div>`;
}

/** Print window uchun to‘liq HTML (2 nusxa + avto chop) */
function buildPrintWindowHtml(sale: Sale, allSales: Sale[]) {
  const documentNumber = computeSaleDocumentNumber(sale, allSales.length > 0 ? allSales : [sale]);
  const body = buildNoteBodyHtml(sale, documentNumber, 2);

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
      ${PRINT_STYLES}
      @page { size: A4 portrait; margin: 8mm; }
      @media print {
        body { padding: 0; }
        .page-row { gap: 5mm; }
      }
    </style>
  </head>
  <body>
    ${body}
    <script>
      window.addEventListener('load', () => setTimeout(() => window.print(), 200));
    </script>
  </body>
</html>`;
}

function pdfFilename(sale: Sale, documentNumber: string) {
  const safeClient = sale.clientName
    .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40) || 'mijoz';
  return `realizatsiya_${documentNumber}_${safeClient}.pdf`;
}

export function printSaleDeliveryNote(sale: Sale, allSales: Sale[] = []) {
  const html = buildPrintWindowHtml(sale, allSales);
  const w = window.open('', '_blank', 'width=820,height=1100');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/** PDF — bitta nusxa */
export async function downloadSaleDeliveryNotePdf(
  sale: Sale,
  allSales: Sale[] = [],
): Promise<void> {
  const documentNumber = computeSaleDocumentNumber(sale, allSales.length > 0 ? allSales : [sale]);
  const host = document.createElement('div');
  host.style.cssText =
    'position:fixed;left:-10000px;top:0;width:210mm;background:#fff;z-index:-1';
  host.innerHTML = `<style>${PRINT_STYLES}</style>${buildNoteBodyHtml(sale, documentNumber, 1)}`;
  document.body.appendChild(host);

  try {
    const root = host.querySelector('.sale-note-root') as HTMLElement | null;
    if (!root) return;

    const { default: html2pdf } = await import('html2pdf.js');
    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: pdfFilename(sale, documentNumber),
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(root)
      .save();
  } finally {
    document.body.removeChild(host);
  }
}
