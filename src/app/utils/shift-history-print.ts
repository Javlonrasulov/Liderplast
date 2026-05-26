import { formatDate, formatNumber } from './format';

const PRINT_ORG_NAME = '"SAM-BC" MCHJ';

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type ShiftHistoryPrintRow = {
  date: string;
  shiftLabel: string;
  workerName: string;
  kindLabel: string;
  productType: string;
  machineName: string;
  hoursWorked: number;
  reading: string;
  defectCount: number;
  defectPct: string;
  producedQty: number;
  notes: string;
};

export type ShiftHistoryPrintLabels = {
  title: string;
  period: string;
  printedAt: string;
  recordCount: string;
  colNum: string;
  colDate: string;
  colShift: string;
  colWorker: string;
  colKind: string;
  colProduct: string;
  colMachine: string;
  colHours: string;
  colReading: string;
  colDefect: string;
  colProduced: string;
  colNotes: string;
  total: string;
  unitPieces: string;
  noDefect: string;
};

export type ShiftHistoryPrintInput = {
  periodLabel: string;
  printedAtIso: string;
  rows: ShiftHistoryPrintRow[];
  labels: ShiftHistoryPrintLabels;
};

export function buildShiftHistoryPrintHtml(input: ShiftHistoryPrintInput): string {
  const { periodLabel, printedAtIso, rows, labels: L } = input;
  const printedAt = formatDate(printedAtIso);

  const totalDefect = rows.reduce((s, r) => s + r.defectCount, 0);
  const totalProduced = rows.reduce((s, r) => s + r.producedQty, 0);
  const bodyRows = rows
    .map(
      (r, i) => `
        <tr>
          <td class="c">${i + 1}</td>
          <td class="c nowrap">${esc(formatDate(r.date))}</td>
          <td class="l">${esc(r.shiftLabel)}</td>
          <td class="l bold">${esc(r.workerName)}</td>
          <td class="c">${esc(r.kindLabel)}</td>
          <td class="l bold">${esc(r.productType)}</td>
          <td class="l">${esc(r.machineName)}</td>
          <td class="c">${formatNumber(r.hoursWorked)}</td>
          <td class="c mono">${esc(r.reading)}</td>
          <td class="c ${r.defectCount > 0 ? 'bad' : 'ok'}">${r.defectCount > 0 ? `<strong>${formatNumber(r.defectCount)}</strong> (${r.defectPct}%)` : esc(L.noDefect)}</td>
          <td class="r bold">${formatNumber(r.producedQty)}</td>
          <td class="l notes">${esc(r.notes || '—')}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${esc(L.title)} — ${esc(periodLabel)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 6mm;
        font-family: Arial, "Segoe UI", Helvetica, sans-serif;
        font-size: 9pt;
        color: #111;
        background: #fff;
      }
      .header {
        margin-bottom: 4mm;
        border-bottom: 2px solid #111;
        padding-bottom: 3mm;
      }
      .org {
        font-size: 13pt;
        font-weight: 700;
        margin: 0 0 2mm;
      }
      .doc-title {
        font-size: 11pt;
        font-weight: 700;
        margin: 0 0 3mm;
      }
      .meta {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 2mm;
        font-size: 9pt;
      }
      .meta td {
        padding: 1mm 3mm 1mm 0;
        vertical-align: top;
      }
      .meta .k {
        font-weight: 700;
        white-space: nowrap;
        width: 28%;
      }
      table.data {
        width: 100%;
        border-collapse: collapse;
        font-size: 8pt;
      }
      table.data th,
      table.data td {
        border: 1px solid #333;
        padding: 1.2mm 1.4mm;
        vertical-align: middle;
      }
      table.data thead th {
        background: #e8e8e8;
        font-weight: 700;
        text-align: center;
        font-size: 7.5pt;
        line-height: 1.25;
      }
      table.data tfoot td {
        background: #f0f0f0;
        font-weight: 700;
        border-top: 2px solid #111;
      }
      .c { text-align: center; }
      .r { text-align: right; white-space: nowrap; }
      .l { text-align: left; }
      .bold { font-weight: 700; }
      .nowrap { white-space: nowrap; }
      .mono { font-family: Consolas, "Courier New", monospace; font-size: 7.5pt; }
      .notes { font-size: 7.5pt; max-width: 28mm; word-break: break-word; }
      .bad { color: #b00020; }
      .ok { color: #1a7f37; font-size: 7.5pt; }
      .total-label { text-align: right; padding-right: 2mm !important; }
      @page {
        size: A4 landscape;
        margin: 8mm;
      }
      @media print {
        body { padding: 0; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        tr { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <p class="org">${esc(PRINT_ORG_NAME)}</p>
      <p class="doc-title">${esc(L.title)}</p>
      <table class="meta">
        <tr><td class="k">${esc(L.period)}:</td><td><strong>${esc(periodLabel)}</strong></td></tr>
        <tr><td class="k">${esc(L.printedAt)}:</td><td>${esc(printedAt)}</td></tr>
        <tr><td class="k">${esc(L.recordCount)}:</td><td><strong>${formatNumber(rows.length)}</strong></td></tr>
      </table>
    </div>
    <table class="data">
      <thead>
        <tr>
          <th>${esc(L.colNum)}</th>
          <th>${esc(L.colDate)}</th>
          <th>${esc(L.colShift)}</th>
          <th>${esc(L.colWorker)}</th>
          <th>${esc(L.colKind)}</th>
          <th>${esc(L.colProduct)}</th>
          <th>${esc(L.colMachine)}</th>
          <th>${esc(L.colHours)}</th>
          <th>${esc(L.colReading)}</th>
          <th>${esc(L.colDefect)}</th>
          <th>${esc(L.colProduced)}</th>
          <th>${esc(L.colNotes)}</th>
        </tr>
      </thead>
      <tbody>
        ${bodyRows || `<tr><td colspan="12" class="c">—</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="9" class="total-label">${esc(L.total)}</td>
          <td class="c bad">${formatNumber(totalDefect)}</td>
          <td class="r">${formatNumber(totalProduced)} ${esc(L.unitPieces)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    <script>
      window.addEventListener('load', () => setTimeout(() => window.print(), 250));
    </script>
  </body>
</html>`;
}

export function printShiftHistory(input: ShiftHistoryPrintInput) {
  const html = buildShiftHistoryPrintHtml(input);
  const w = window.open('', '_blank', 'width=1100,height=800');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
