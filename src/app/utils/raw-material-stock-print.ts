import { formatDate, formatKgAmount, formatNumber } from './format';

const PRINT_ORG_NAME = '"SAM-BC" MCHJ';

export type RawMaterialStockPrintLabels = {
  docTitle: string;
  printedAt: string;
  colNum: string;
  colType: string;
  colName: string;
  colStock: string;
  colPurchasePrice: string;
  colTotalUzs: string;
  colTotalUsd: string;
  grandTotal: string;
  unitKg: string;
};

export type RawMaterialStockPrintRow = {
  typeLabel: string;
  name: string;
  quantityKg: number;
  purchasePrice: string;
  purchasePriceUzs?: string;
  purchasePriceFx?: string;
  totalUzs: string;
  totalUsd: string;
};

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function purchasePriceHtml(row: RawMaterialStockPrintRow): string {
  const second = [row.purchasePriceUzs, row.purchasePriceFx].filter(Boolean).join(' · ');
  return [
    row.purchasePrice ? `<b>${esc(row.purchasePrice)}</b>` : '',
    second ? esc(second) : '',
  ]
    .filter(Boolean)
    .join('<br/>');
}

function parseMoney(value: string): number | null {
  const n = parseFloat(value.replace(/[^\d.,-]/g, '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function printRawMaterialStock(
  rows: RawMaterialStockPrintRow[],
  labels: RawMaterialStockPrintLabels,
  printedAtIso: string,
) {
  const totalKg = rows.reduce((s, r) => s + r.quantityKg, 0);
  let totalUzs = 0;
  let totalUsd = 0;
  let hasUzs = false;
  let hasUsd = false;
  for (const row of rows) {
    const uzs = parseMoney(row.totalUzs);
    const usd = parseMoney(row.totalUsd);
    if (uzs != null) {
      totalUzs += uzs;
      hasUzs = true;
    }
    if (usd != null) {
      totalUsd += usd;
      hasUsd = true;
    }
  }

  const bodyRows = rows
    .map(
      (row, index) => `
        <tr>
          <td class="c num">${index + 1}</td>
          <td class="c type">${esc(row.typeLabel)}</td>
          <td class="l name"><b>${esc(row.name)}</b></td>
          <td class="r qty"><b>${formatKgAmount(row.quantityKg)} ${esc(labels.unitKg)}</b></td>
          <td class="l price">${purchasePriceHtml(row)}</td>
          <td class="r money"><b>${esc(row.totalUzs)}</b></td>
          <td class="r money"><b>${esc(row.totalUsd)}</b></td>
        </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${esc(labels.docTitle)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 3mm 4mm;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 8pt;
        color: #000;
        background: #fff;
      }
      .header { font-size: 8pt; line-height: 1.2; margin-bottom: 2mm; }
      .header .sep { margin: 0 4px; color: #666; }
      table.data {
        width: 100%;
        border-collapse: collapse;
        font-size: 7pt;
        table-layout: fixed;
      }
      table.data th,
      table.data td {
        border: 1px solid #000;
        padding: 1px 2px;
        vertical-align: middle;
        color: #000;
        background: #fff;
        line-height: 1.1;
      }
      table.data thead th {
        background: #d9d9d9;
        font-weight: bold;
        text-align: center;
        font-size: 6.5pt;
        white-space: nowrap;
      }
      table.data tfoot td {
        background: #f2f2f2;
        font-weight: bold;
      }
      .c { text-align: center; }
      .r { text-align: right; white-space: nowrap; }
      .l { text-align: left; }
      .col-num { width: 3%; }
      .col-type { width: 10%; }
      .col-name { width: 24%; }
      .col-qty { width: 10%; }
      .col-price { width: 20%; }
      .col-uzs { width: 14%; }
      .col-usd { width: 9%; }
      .name { word-break: break-word; }
      .price { font-size: 6.5pt; line-height: 1.1; }
      .total-label { text-align: right; }
      @page { size: A4 landscape; margin: 4mm; }
      @media print {
        body { padding: 0; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        tr { page-break-inside: auto; }
      }
    </style>
  </head>
  <body class="print-compact">
    <div class="header">
      <span><b>${esc(PRINT_ORG_NAME)}</b></span>
      <span class="sep">|</span>
      <span><b>${esc(labels.docTitle)}</b></span>
      <span class="sep">|</span>
      <span>${esc(labels.printedAt)}: <b>${esc(formatDate(printedAtIso))}</b></span>
    </div>
    <table class="data">
      <thead>
        <tr>
          <th class="col-num">${esc(labels.colNum)}</th>
          <th class="col-type">${esc(labels.colType)}</th>
          <th class="col-name">${esc(labels.colName)}</th>
          <th class="col-qty">${esc(labels.colStock)}</th>
          <th class="col-price">${esc(labels.colPurchasePrice)}</th>
          <th class="col-uzs">${esc(labels.colTotalUzs)}</th>
          <th class="col-usd">${esc(labels.colTotalUsd)}</th>
        </tr>
      </thead>
      <tbody>
        ${bodyRows || `<tr><td colspan="7" class="c">—</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="total-label"><b>${esc(labels.grandTotal)}</b></td>
          <td class="r qty"><b>${formatKgAmount(totalKg)} ${esc(labels.unitKg)}</b></td>
          <td></td>
          <td class="r money"><b>${hasUzs ? `${formatNumber(Math.round(totalUzs))} so'm` : '—'}</b></td>
          <td class="r money"><b>${hasUsd ? `${formatNumber(Math.round(totalUsd))} $` : '—'}</b></td>
        </tr>
      </tfoot>
    </table>
    <script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));</script>
  </body>
</html>`;

  const w = window.open('', '_blank', 'width=1200,height=900');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
