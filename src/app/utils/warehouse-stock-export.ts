import type {
  FinishedProductCatalogItem,
  SaleCurrency,
  SemiProductCatalogItem,
} from '../store/erp-store';
import { formatDate, formatNumber } from './format';

const PRINT_ORG_NAME = '"SAM-BC" MCHJ';

export type WarehouseExportScope = 'current_only' | 'both_combined' | 'both_separate';

export type WarehouseStockExportLabels = {
  docTitle: string;
  printedAt: string;
  colNum: string;
  colName: string;
  colUnit: string;
  colSalePrice: string;
  colQty: string;
  colTotalUzs: string;
  colTotalUsd: string;
  colType: string;
  sectionSemi: string;
  sectionFinal: string;
  typeSemi: string;
  typeFinal: string;
  grandTotal: string;
  unitPiece: string;
  noPrice: string;
};

export type WarehouseStockExportRow = {
  name: string;
  unit: string;
  salePriceDisplay: string;
  quantity: number;
  totalUzs: number | null;
  totalUsd: number | null;
  typeLabel?: string;
};

export type WarehouseStockExportSection = {
  key: string;
  title: string;
  rows: WarehouseStockExportRow[];
};

export type WarehouseStockExportInput = {
  scope: WarehouseExportScope;
  mode: 'semi' | 'final';
  semiProducts: SemiProductCatalogItem[];
  finishedProducts: FinishedProductCatalogItem[];
  semiStockByName: Record<string, number>;
  finalStockByName: Record<string, number>;
  labels: WarehouseStockExportLabels;
  printedAtIso: string;
};

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function currencyDisplay(cur: SaleCurrency): string {
  return cur === 'USD' ? 'USD (USDT)' : cur;
}

function unitPriceUzs(
  salePrice: number | undefined,
  currency: SaleCurrency | undefined,
  fxRateToUzs: number | undefined,
): number | null {
  if (salePrice == null || salePrice <= 0) return null;
  const cur = currency ?? 'UZS';
  if (cur === 'UZS') return salePrice;
  if (fxRateToUzs != null && fxRateToUzs > 0) return salePrice * fxRateToUzs;
  return null;
}

function unitPriceUsd(
  salePrice: number | undefined,
  currency: SaleCurrency | undefined,
  fxRateToUzs: number | undefined,
): number | null {
  if (salePrice == null || salePrice <= 0) return null;
  const cur = currency ?? 'UZS';
  if (cur === 'USD') return salePrice;
  const uzs = unitPriceUzs(salePrice, currency, fxRateToUzs);
  if (uzs != null && fxRateToUzs != null && fxRateToUzs > 0) return uzs / fxRateToUzs;
  return null;
}

function formatMoney(value: number | null, suffix: string): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${formatNumber(Math.round(value * 100) / 100)} ${suffix}`;
}

function formatSalePriceDisplay(
  product: {
    salePrice?: number;
    priceCurrency?: SaleCurrency;
    fxRateToUzs?: number;
  },
  labels: Pick<WarehouseStockExportLabels, 'noPrice'>,
): string {
  const sp = product.salePrice;
  if (sp == null || sp <= 0) return labels.noPrice;
  const cur = product.priceCurrency ?? 'UZS';
  const main = `${formatNumber(sp)} ${currencyDisplay(cur)}`;
  if (cur === 'UZS') return main;
  const uzs = unitPriceUzs(sp, cur, product.fxRateToUzs);
  if (uzs != null) {
    return `${main}\n≈ ${formatNumber(uzs)} so'm`;
  }
  return main;
}

function buildProductRow(
  product: SemiProductCatalogItem | FinishedProductCatalogItem,
  quantity: number,
  unit: string,
  labels: WarehouseStockExportLabels,
  typeLabel?: string,
): WarehouseStockExportRow {
  const unitUzs = unitPriceUzs(
    product.salePrice,
    product.priceCurrency,
    product.fxRateToUzs,
  );
  const unitUsd = unitPriceUsd(
    product.salePrice,
    product.priceCurrency,
    product.fxRateToUzs,
  );
  return {
    name: product.name,
    unit,
    salePriceDisplay: formatSalePriceDisplay(product, labels),
    quantity,
    totalUzs: unitUzs != null ? unitUzs * quantity : null,
    totalUsd: unitUsd != null ? unitUsd * quantity : null,
    typeLabel,
  };
}

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'uz'));
}

export function buildWarehouseStockExportSections(
  input: WarehouseStockExportInput,
): WarehouseStockExportSection[] {
  const {
    scope,
    mode,
    semiProducts,
    finishedProducts,
    semiStockByName,
    finalStockByName,
    labels,
  } = input;

  const semiRows = sortByName(semiProducts).map((p) =>
    buildProductRow(
      p,
      semiStockByName[p.name] ?? 0,
      labels.unitPiece,
      labels,
      labels.typeSemi,
    ),
  );
  const finalRows = sortByName(finishedProducts).map((p) =>
    buildProductRow(
      p,
      finalStockByName[p.name] ?? 0,
      labels.unitPiece,
      labels,
      labels.typeFinal,
    ),
  );

  if (scope === 'current_only') {
    if (mode === 'semi') {
      return [{ key: 'semi', title: labels.sectionSemi, rows: semiRows }];
    }
    return [{ key: 'final', title: labels.sectionFinal, rows: finalRows }];
  }

  if (scope === 'both_combined') {
    const rows = [
      ...semiRows.map((r) => ({ ...r, typeLabel: labels.typeSemi })),
      ...finalRows.map((r) => ({ ...r, typeLabel: labels.typeFinal })),
    ];
    return [
      {
        key: 'combined',
        title: `${labels.sectionSemi} + ${labels.sectionFinal}`,
        rows,
      },
    ];
  }

  return [
    { key: 'semi', title: labels.sectionSemi, rows: semiRows },
    { key: 'final', title: labels.sectionFinal, rows: finalRows },
  ];
}

function sectionTotals(rows: WarehouseStockExportRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.qty += row.quantity;
      if (row.totalUzs != null) acc.uzs += row.totalUzs;
      if (row.totalUsd != null) acc.usd += row.totalUsd;
      return acc;
    },
    { qty: 0, uzs: 0, usd: 0 },
  );
}

function renderTableSection(
  section: WarehouseStockExportSection,
  labels: WarehouseStockExportLabels,
  showTypeColumn: boolean,
): string {
  const totals = sectionTotals(section.rows);
  const bodyRows = section.rows
    .map(
      (row, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td class="c num">${i + 1}</td>
          ${showTypeColumn ? `<td class="c type">${esc(row.typeLabel ?? '—')}</td>` : ''}
          <td class="l name">${esc(row.name)}</td>
          <td class="c">${esc(row.unit)}</td>
          <td class="l price">${esc(row.salePriceDisplay).replace(/\n/g, '<br/>')}</td>
          <td class="r qty">${formatNumber(row.quantity)}</td>
          <td class="r money uzs">${formatMoney(row.totalUzs, "so'm")}</td>
          <td class="r money usd">${formatMoney(row.totalUsd, '$')}</td>
        </tr>`,
    )
    .join('');

  return `
    <div class="section">
      <h2 class="section-title">${esc(section.title)}</h2>
      <table class="data">
        <thead>
          <tr>
            <th>${esc(labels.colNum)}</th>
            ${showTypeColumn ? `<th>${esc(labels.colType)}</th>` : ''}
            <th>${esc(labels.colName)}</th>
            <th>${esc(labels.colUnit)}</th>
            <th>${esc(labels.colSalePrice)}</th>
            <th>${esc(labels.colQty)}</th>
            <th>${esc(labels.colTotalUzs)}</th>
            <th>${esc(labels.colTotalUsd)}</th>
          </tr>
        </thead>
        <tbody>
          ${bodyRows || `<tr><td colspan="${showTypeColumn ? 8 : 7}" class="c empty">—</td></tr>`}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="${showTypeColumn ? 5 : 4}" class="total-label">${esc(labels.grandTotal)}</td>
            <td class="r qty">${formatNumber(totals.qty)}</td>
            <td class="r money uzs">${formatMoney(totals.uzs || null, "so'm")}</td>
            <td class="r money usd">${formatMoney(totals.usd || null, '$')}</td>
          </tr>
        </tfoot>
      </table>
    </div>`;
}

export function buildWarehouseStockExportHtml(
  sections: WarehouseStockExportSection[],
  labels: WarehouseStockExportLabels,
  printedAtIso: string,
  forPrint = false,
): string {
  const showTypeColumn = sections.some((s) => s.key === 'combined');
  const sectionsHtml = sections
    .map((section) => renderTableSection(section, labels, showTypeColumn))
    .join('');

  const allRows = sections.flatMap((s) => s.rows);
  const grand = sectionTotals(allRows);
  const grandHtml =
    sections.length > 1
      ? `
    <table class="grand">
      <tr>
        <td class="grand-label">${esc(labels.grandTotal)} (${esc(labels.docTitle)})</td>
        <td class="r qty">${formatNumber(grand.qty)} ${esc(labels.unitPiece)}</td>
        <td class="r money uzs">${formatMoney(grand.uzs || null, "so'm")}</td>
        <td class="r money usd">${formatMoney(grand.usd || null, '$')}</td>
      </tr>
    </table>`
      : '';

  return `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
  <head>
    <meta charset="utf-8" />
    <title>${esc(labels.docTitle)}</title>
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Ombor</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 10mm;
        font-family: "Segoe UI", Arial, sans-serif;
        font-size: 10pt;
        color: #0f172a;
        background: #fff;
      }
      .header {
        margin-bottom: 6mm;
        padding: 4mm 5mm;
        border-radius: 8px;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: #fff;
      }
      .org { font-size: 14pt; font-weight: 800; margin: 0 0 2mm; }
      .doc-title { font-size: 12pt; font-weight: 700; margin: 0 0 2mm; }
      .meta { font-size: 9pt; opacity: 0.95; margin: 0; }
      .section { margin-bottom: 8mm; page-break-inside: avoid; }
      .section + .section { page-break-before: ${forPrint ? 'always' : 'auto'}; }
      .section-title {
        margin: 0 0 3mm;
        padding: 2.5mm 4mm;
        border-radius: 6px;
        background: linear-gradient(90deg, #e0e7ff, #fae8ff);
        color: #312e81;
        font-size: 11pt;
        font-weight: 800;
        border-left: 4px solid #6366f1;
      }
      table.data, table.grand {
        width: 100%;
        border-collapse: collapse;
        font-size: 9pt;
      }
      table.data th, table.data td, table.grand td {
        border: 1px solid #cbd5e1;
        padding: 2mm 2.5mm;
        vertical-align: middle;
      }
      table.data thead th {
        background: linear-gradient(180deg, #4338ca, #6366f1);
        color: #fff;
        font-weight: 800;
        text-align: center;
        font-size: 8.5pt;
        line-height: 1.3;
      }
      table.data tbody tr.even { background: #f8fafc; }
      table.data tbody tr.odd { background: #ffffff; }
      table.data tbody tr:hover { background: #eef2ff; }
      table.data tfoot td, table.grand td {
        background: linear-gradient(180deg, #d1fae5, #a7f3d0);
        font-weight: 800;
        border-top: 2px solid #059669;
      }
      table.grand {
        margin-top: 4mm;
      }
      table.grand .grand-label {
        font-weight: 800;
        color: #065f46;
        padding-left: 4mm;
      }
      .c { text-align: center; }
      .r { text-align: right; white-space: nowrap; }
      .l { text-align: left; }
      .name { font-weight: 700; color: #1e293b; min-width: 140px; }
      .price { font-size: 8.5pt; line-height: 1.35; color: #334155; }
      .qty { font-weight: 700; color: #0f766e; }
      .money.uzs { font-weight: 700; color: #047857; }
      .money.usd { font-weight: 700; color: #1d4ed8; }
      .type { font-size: 8pt; font-weight: 700; color: #6d28d9; }
      .total-label { text-align: right; font-weight: 800; color: #065f46; }
      .empty { color: #94a3b8; font-style: italic; }
      @page { size: A4 landscape; margin: 8mm; }
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
      <p class="doc-title">${esc(labels.docTitle)}</p>
      <p class="meta">${esc(labels.printedAt)}: ${esc(formatDate(printedAtIso))}</p>
    </div>
    ${sectionsHtml}
    ${grandHtml}
    ${forPrint ? `<script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));</script>` : ''}
  </body>
</html>`;
}

export function downloadWarehouseStockExcel(
  sections: WarehouseStockExportSection[],
  labels: WarehouseStockExportLabels,
  printedAtIso: string,
  fileName: string,
) {
  const html = buildWarehouseStockExportHtml(sections, labels, printedAtIso, false);
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + html], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function printWarehouseStock(
  sections: WarehouseStockExportSection[],
  labels: WarehouseStockExportLabels,
  printedAtIso: string,
) {
  const html = buildWarehouseStockExportHtml(sections, labels, printedAtIso, true);
  const w = window.open('', '_blank', 'width=1200,height=900');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export function warehouseStockExportFileName(mode: 'semi' | 'final', scope: WarehouseExportScope) {
  const date = new Date().toISOString().slice(0, 10);
  const base = mode === 'semi' ? 'ombor-yarim-tayyor' : 'ombor-tayyor';
  if (scope === 'both_combined') return `${base}-barchasi-${date}.xls`;
  if (scope === 'both_separate') return `${base}-alohida-${date}.xls`;
  return `${base}-${date}.xls`;
}
