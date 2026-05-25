import type { SupplierPurchaseOrder } from '../store/erp-store';
import { formatCurrency, formatDate, formatNumber } from './format';
import { createOffscreenPdfHost, downloadElementAsPdf } from './html2pdf-download';

const PRINT_ORG_NAME = '"SAM-BC" MCHJ';

const PRINT_STYLES = `
  * { box-sizing: border-box; }
  .purchase-note-root {
    font-family: "Times New Roman", Times, serif;
    color: #000;
    background: #fff;
    font-size: 8.5pt;
    line-height: 1.3;
    padding: 2mm;
  }
  .copy {
    width: 100%;
    padding: 2mm 0;
    page-break-inside: avoid;
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
    width: 32%;
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
`;

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function qtyUnitPrint(unit: SupplierPurchaseOrder['quantityUnit']): string {
  if (unit === 'TON') return 'т';
  if (unit === 'PIECES') return 'шт';
  return 'кг';
}

export function computeSupplierPurchaseDocumentNumber(
  order: SupplierPurchaseOrder,
  allOrders: SupplierPurchaseOrder[],
): string {
  const sorted = [...allOrders].sort((a, b) => {
    const byDate = a.orderedAt.localeCompare(b.orderedAt);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
  const index = sorted.findIndex((o) => o.id === order.id);
  const seq = index >= 0 ? index + 1 : sorted.length + 1;
  return String(seq).padStart(9, '0');
}

function buildCopyHtml(order: SupplierPurchaseOrder, documentNumber: string) {
  const docDate = formatDate(order.orderedAt);
  const unitPrice =
    order.quantity > 0 ? order.amountOriginal / order.quantity : order.amountOriginal;
  const payment =
    order.paymentType === 'CREDIT'
      ? `Кредит (оплачено ${formatCurrency(order.paidAmountUzs)}, долг ${formatCurrency(order.debtAmountUzs)})`
      : 'Наличные';

  return `
    <div class="copy">
      <div class="company">${esc(PRINT_ORG_NAME)}</div>
      <div class="title">Поступление от поставщика № ${esc(documentNumber)} от ${esc(docDate)}</div>
      <table class="meta">
        <tr><td class="k">Поставщик:</td><td>${esc(order.supplierName ?? '—')}</td></tr>
        <tr><td class="k">Оплата:</td><td>${esc(payment)}</td></tr>
        ${order.notes ? `<tr><td class="k">Примечание:</td><td>${esc(order.notes)}</td></tr>` : ''}
      </table>
      <table class="items">
        <thead>
          <tr>
            <th>№</th>
            <th>Наименование</th>
            <th>Ед.</th>
            <th>Кол-во</th>
            <th>Цена (${esc(order.currency)})</th>
            <th>Сумма (${esc(order.currency)})</th>
            <th>Сумма (UZS)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="c">1</td>
            <td class="l">${esc(order.productName)}</td>
            <td class="c">${esc(qtyUnitPrint(order.quantityUnit))}</td>
            <td class="r">${formatNumber(order.quantity)}</td>
            <td class="r">${formatNumber(unitPrice)}</td>
            <td class="r">${formatNumber(order.amountOriginal)}</td>
            <td class="r">${formatNumber(order.amountUzs)} UZS</td>
          </tr>
        </tbody>
      </table>
      <table class="sign">
        <tr>
          <td>
            <div class="sign-label">Бухгалтер</div>
            <div class="sign-line"></div>
          </td>
          <td>
            <div class="sign-label">Принял (склад)</div>
            <div class="sign-line"></div>
          </td>
          <td>
            <div class="sign-label">Поставщик</div>
            <div class="sign-line"></div>
          </td>
        </tr>
      </table>
    </div>`;
}

function buildNoteBodyHtml(order: SupplierPurchaseOrder, documentNumber: string, copyCount: 1 | 2) {
  const copy = buildCopyHtml(order, documentNumber);
  const copies = copyCount === 2 ? `${copy}${copy}` : copy;
  return `<div class="purchase-note-root">${copies}</div>`;
}

function buildPrintWindowHtml(order: SupplierPurchaseOrder, allOrders: SupplierPurchaseOrder[]) {
  const documentNumber = computeSupplierPurchaseDocumentNumber(
    order,
    allOrders.length > 0 ? allOrders : [order],
  );
  const body = buildNoteBodyHtml(order, documentNumber, 2);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Поступление — ${esc(order.supplierName ?? '')}</title>
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

function pdfFilename(order: SupplierPurchaseOrder, documentNumber: string) {
  const safeSupplier = (order.supplierName ?? 'postavshik')
    .replace(/[^a-zA-Z0-9\u0400-\u04FF\s_-]+/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40);
  return `sotib_olish_${documentNumber}_${safeSupplier}.pdf`;
}

export function printSupplierPurchaseOrder(
  order: SupplierPurchaseOrder,
  allOrders: SupplierPurchaseOrder[] = [],
) {
  const html = buildPrintWindowHtml(order, allOrders);
  const w = window.open('', '_blank', 'width=820,height=1100');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export async function downloadSupplierPurchasePdf(
  order: SupplierPurchaseOrder,
  allOrders: SupplierPurchaseOrder[] = [],
): Promise<void> {
  const documentNumber = computeSupplierPurchaseDocumentNumber(
    order,
    allOrders.length > 0 ? allOrders : [order],
  );
  const host = createOffscreenPdfHost(
    `<style>${PRINT_STYLES}</style>${buildNoteBodyHtml(order, documentNumber, 1)}`,
  );

  try {
    const root = host.querySelector('.purchase-note-root');
    if (!root || !(root instanceof HTMLElement)) {
      throw new Error('PDF mazmun topilmadi');
    }
    await downloadElementAsPdf(root, pdfFilename(order, documentNumber));
  } finally {
    host.remove();
  }
}
