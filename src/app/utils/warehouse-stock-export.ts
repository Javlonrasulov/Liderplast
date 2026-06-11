import type {
  FinishedProductCatalogItem,
  SaleCurrency,
  SemiProductCatalogItem,
} from '../store/erp-store';
import { formatDate, formatNumber } from './format';
import { formatWarehouseSalePriceDisplay } from './warehouse-product-pricing';

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
  priceInUzs: string;
  fxValue: string;
};

export type WarehouseStockExportRow = {
  name: string;
  unit: string;
  salePriceHtml: string;
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
  /** Bo'sh bo'lsa — barcha mahsulotlar */
  selectedSemiIds?: string[];
  selectedFinalIds?: string[];
  cbuUsdRate?: number;
  cbuEurRate?: number;
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

function formatSalePriceHtml(
  product: {
    salePrice?: number;
    priceCurrency?: SaleCurrency;
    fxRateToUzs?: number;
  },
  labels: Pick<WarehouseStockExportLabels, 'noPrice' | 'priceInUzs' | 'fxValue'>,
  cbuUsdRate = 0,
  cbuEurRate = 0,
): string {
  const { main, sub, fxRate } = formatWarehouseSalePriceDisplay(
    product,
    labels.noPrice,
    labels.priceInUzs,
    labels.fxValue,
    { fallbackUsdRate: cbuUsdRate, fallbackEurRate: cbuEurRate },
  );
  return [
    main ? `<b>${esc(main)}</b>` : '',
    sub ? `<span class="price-uzs">${esc(sub)}</span>` : '',
    fxRate ? `<span class="price-fx">${esc(fxRate)}</span>` : '',
  ]
    .filter(Boolean)
    .join('<br/>');
}

function buildProductRow(
  product: SemiProductCatalogItem | FinishedProductCatalogItem,
  quantity: number,
  unit: string,
  labels: WarehouseStockExportLabels,
  typeLabel?: string,
  cbuUsdRate = 0,
  cbuEurRate = 0,
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
    salePriceHtml: formatSalePriceHtml(product, labels, cbuUsdRate, cbuEurRate),
    quantity,
    totalUzs: unitUzs != null ? unitUzs * quantity : null,
    totalUsd: unitUsd != null ? unitUsd * quantity : null,
    typeLabel,
  };
}

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'uz'));
}

function filterByIds<T extends { id: string }>(
  items: T[],
  selectedIds: string[] | undefined,
): T[] {
  if (!selectedIds || selectedIds.length === 0) return [];
  const allowed = new Set(selectedIds);
  return items.filter((item) => allowed.has(item.id));
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
    selectedSemiIds,
    selectedFinalIds,
    cbuUsdRate = 0,
    cbuEurRate = 0,
  } = input;

  const semiList =
    selectedSemiIds != null
      ? filterByIds(semiProducts, selectedSemiIds)
      : semiProducts;
  const finalList =
    selectedFinalIds != null
      ? filterByIds(finishedProducts, selectedFinalIds)
      : finishedProducts;

  const semiRows = sortByName(semiList).map((p) =>
    buildProductRow(
      p,
      semiStockByName[p.name] ?? 0,
      labels.unitPiece,
      labels,
      labels.typeSemi,
      cbuUsdRate,
      cbuEurRate,
    ),
  );
  const finalRows = sortByName(finalList).map((p) =>
    buildProductRow(
      p,
      finalStockByName[p.name] ?? 0,
      labels.unitPiece,
      labels,
      labels.typeFinal,
      cbuUsdRate,
      cbuEurRate,
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
        <tr>
          <td class="c num">${i + 1}</td>
          ${showTypeColumn ? `<td class="c type">${esc(row.typeLabel ?? '—')}</td>` : ''}
          <td class="l name"><b>${esc(row.name)}</b></td>
          <td class="c">${esc(row.unit)}</td>
          <td class="l price">${row.salePriceHtml}</td>
          <td class="r qty"><b>${formatNumber(row.quantity)}</b></td>
          <td class="r money"><b>${formatMoney(row.totalUzs, "so'm")}</b></td>
          <td class="r money"><b>${formatMoney(row.totalUsd, '$')}</b></td>
        </tr>`,
    )
    .join('');

  return `
    <div class="section">
      <h2 class="section-title"><b>${esc(section.title)}</b></h2>
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
          <tr class="total-row">
            <td colspan="${showTypeColumn ? 5 : 4}" class="total-label"><b>${esc(labels.grandTotal)}</b></td>
            <td class="r qty"><b>${formatNumber(totals.qty)}</b></td>
            <td class="r money"><b>${formatMoney(totals.uzs || null, "so'm")}</b></td>
            <td class="r money"><b>${formatMoney(totals.usd || null, '$')}</b></td>
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
    <table class="data grand">
      <tr class="total-row">
        <td class="grand-label"><b>${esc(labels.grandTotal)} (${esc(labels.docTitle)})</b></td>
        <td class="r qty"><b>${formatNumber(grand.qty)} ${esc(labels.unitPiece)}</b></td>
        <td class="r money"><b>${formatMoney(grand.uzs || null, "so'm")}</b></td>
        <td class="r money"><b>${formatMoney(grand.usd || null, '$')}</b></td>
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
        padding: 8mm;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11pt;
        color: #000;
        background: #fff;
      }
      .header {
        margin-bottom: 6mm;
        padding: 0;
        border: none;
        background: none;
        color: #000;
      }
      .org { font-size: 12pt; font-weight: bold; margin: 0 0 2mm; }
      .doc-title { font-size: 11pt; font-weight: bold; margin: 0 0 2mm; }
      .meta { font-size: 10pt; margin: 0; }
      .section { margin-bottom: 6mm; page-break-inside: avoid; }
      .section + .section { page-break-before: ${forPrint ? 'always' : 'auto'}; }
      .section-title {
        margin: 0 0 2mm;
        padding: 0;
        font-size: 11pt;
        font-weight: bold;
        color: #000;
        background: none;
        border: none;
      }
      table.data {
        width: 100%;
        border-collapse: collapse;
        font-size: 10pt;
        table-layout: auto;
      }
      table.data th,
      table.data td {
        border: 1px solid #000;
        padding: 3px 5px;
        vertical-align: middle;
        color: #000;
        background: #fff;
      }
      table.data thead th {
        background: #d9d9d9;
        color: #000;
        font-weight: bold;
        text-align: center;
        font-size: 10pt;
        line-height: 1.25;
        white-space: nowrap;
      }
      table.data tfoot td,
      table.data tr.total-row td {
        background: #f2f2f2;
        font-weight: bold;
        border: 1px solid #000;
      }
      table.grand {
        margin-top: 4mm;
      }
      table.grand .grand-label {
        text-align: left;
        padding-left: 5px;
      }
      .c { text-align: center; }
      .r { text-align: right; white-space: nowrap; }
      .l { text-align: left; }
      .name { min-width: 140px; }
      .price { font-size: 10pt; line-height: 1.35; min-width: 120px; }
      .price-uzs { font-size: 9pt; color: #166534; }
      .price-fx { font-size: 8.5pt; color: #475569; }
      .total-label { text-align: right; }
      .empty { color: #666; font-style: italic; }
      @page { size: A4 landscape; margin: 10mm; }
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
      <p class="org"><b>${esc(PRINT_ORG_NAME)}</b></p>
      <p class="doc-title"><b>${esc(labels.docTitle)}</b></p>
      <p class="meta">${esc(labels.printedAt)}: <b>${esc(formatDate(printedAtIso))}</b></p>
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
