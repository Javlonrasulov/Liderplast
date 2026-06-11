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
  /** Chop — ixcham jadval (bitta varaqka sig‘ishi uchun) */
  compact?: boolean;
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
  compact = false,
): string {
  const { main, sub, fxRate } = formatWarehouseSalePriceDisplay(
    product,
    labels.noPrice,
    labels.priceInUzs,
    labels.fxValue,
    { fallbackUsdRate: cbuUsdRate, fallbackEurRate: cbuEurRate },
  );
  if (compact) {
    const secondLine = [sub, fxRate].filter(Boolean).join(' · ');
    return [main ? `<b>${esc(main)}</b>` : '', secondLine ? esc(secondLine) : '']
      .filter(Boolean)
      .join('<br/>');
  }
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
  compact = false,
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
    salePriceHtml: formatSalePriceHtml(
      product,
      labels,
      cbuUsdRate,
      cbuEurRate,
      compact,
    ),
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
    compact = false,
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
      compact,
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
      compact,
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
  compact = false,
  hideSectionTitle = false,
): string {
  const totals = sectionTotals(section.rows);
  const colCount = (showTypeColumn ? 1 : 0) + (compact ? 6 : 7);
  const footerLabelSpan = (showTypeColumn ? 1 : 0) + (compact ? 3 : 4);
  const bodyRows = section.rows
    .map(
      (row, i) => `
        <tr>
          <td class="c num">${i + 1}</td>
          ${showTypeColumn ? `<td class="c type">${esc(row.typeLabel ?? '—')}</td>` : ''}
          <td class="l name"><b>${esc(row.name)}</b></td>
          ${compact ? '' : `<td class="c unit">${esc(row.unit)}</td>`}
          <td class="l price">${row.salePriceHtml}</td>
          <td class="r qty"><b>${formatNumber(row.quantity)}${compact ? ` ${esc(row.unit)}` : ''}</b></td>
          <td class="r money"><b>${formatMoney(row.totalUzs, "so'm")}</b></td>
          <td class="r money"><b>${formatMoney(row.totalUsd, '$')}</b></td>
        </tr>`,
    )
    .join('');

  const sectionTitle =
    hideSectionTitle || compact
      ? ''
      : `<h2 class="section-title"><b>${esc(section.title)}</b></h2>`;

  return `
    <div class="section">
      ${sectionTitle}
      <table class="data">
        <thead>
          <tr>
            <th class="col-num">${esc(labels.colNum)}</th>
            ${showTypeColumn ? `<th>${esc(labels.colType)}</th>` : ''}
            <th class="col-name">${esc(labels.colName)}</th>
            ${compact ? '' : `<th>${esc(labels.colUnit)}</th>`}
            <th class="col-price">${esc(labels.colSalePrice)}</th>
            <th class="col-qty">${esc(labels.colQty)}</th>
            <th class="col-uzs">${esc(labels.colTotalUzs)}</th>
            <th class="col-usd">${esc(labels.colTotalUsd)}</th>
          </tr>
        </thead>
        <tbody>
          ${bodyRows || `<tr><td colspan="${colCount}" class="c empty">—</td></tr>`}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="${footerLabelSpan}" class="total-label"><b>${esc(labels.grandTotal)}</b></td>
            <td class="r qty"><b>${formatNumber(totals.qty)}${compact ? ` ${esc(labels.unitPiece)}` : ''}</b></td>
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
  const compact = forPrint;
  const showTypeColumn = sections.some((s) => s.key === 'combined');
  const hideSectionTitles = compact && sections.length === 1;
  const sectionsHtml = sections
    .map((section) =>
      renderTableSection(section, labels, showTypeColumn, compact, hideSectionTitles),
    )
    .join('');

  const allRows = sections.flatMap((s) => s.rows);
  const grand = sectionTotals(allRows);
  const grandHtml =
    sections.length > 1 && !compact
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

  const bodyClass = compact ? ' class="print-compact"' : '';
  const headerHtml = compact
    ? `<div class="header header-inline">
      <span class="org"><b>${esc(PRINT_ORG_NAME)}</b></span>
      <span class="sep">|</span>
      <span class="doc-title"><b>${esc(labels.docTitle)}</b></span>
      <span class="sep">|</span>
      <span class="meta">${esc(labels.printedAt)}: <b>${esc(formatDate(printedAtIso))}</b></span>
    </div>`
    : `<div class="header">
      <p class="org"><b>${esc(PRINT_ORG_NAME)}</b></p>
      <p class="doc-title"><b>${esc(labels.docTitle)}</b></p>
      <p class="meta">${esc(labels.printedAt)}: <b>${esc(formatDate(printedAtIso))}</b></p>
    </div>`;

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
        padding: ${compact ? '3mm 4mm' : '8mm'};
        font-family: Arial, Helvetica, sans-serif;
        font-size: ${compact ? '8pt' : '11pt'};
        color: #000;
        background: #fff;
      }
      .header {
        margin-bottom: ${compact ? '2mm' : '6mm'};
        padding: 0;
        border: none;
        background: none;
        color: #000;
      }
      .header-inline { font-size: 8pt; line-height: 1.2; }
      .header-inline .sep { margin: 0 4px; color: #666; }
      .org { font-size: ${compact ? '8pt' : '12pt'}; font-weight: bold; margin: 0 0 ${compact ? '0' : '2mm'}; }
      .doc-title { font-size: ${compact ? '8pt' : '11pt'}; font-weight: bold; margin: 0 0 ${compact ? '0' : '2mm'}; }
      .meta { font-size: ${compact ? '8pt' : '10pt'}; margin: 0; }
      .section { margin-bottom: ${compact ? '1mm' : '6mm'}; page-break-inside: ${compact ? 'auto' : 'avoid'}; }
      .section + .section { page-break-before: auto; }
      .section-title {
        margin: 0 0 2mm;
        padding: 0;
        font-size: ${compact ? '8pt' : '11pt'};
        font-weight: bold;
        color: #000;
        background: none;
        border: none;
      }
      table.data {
        width: 100%;
        border-collapse: collapse;
        font-size: ${compact ? '7pt' : '10pt'};
        table-layout: ${compact ? 'fixed' : 'auto'};
      }
      table.data th,
      table.data td {
        border: 1px solid #000;
        padding: ${compact ? '1px 2px' : '3px 5px'};
        vertical-align: middle;
        color: #000;
        background: #fff;
        line-height: ${compact ? '1.1' : '1.25'};
      }
      table.data thead th {
        background: #d9d9d9;
        color: #000;
        font-weight: bold;
        text-align: center;
        font-size: ${compact ? '6.5pt' : '10pt'};
        line-height: 1.1;
        white-space: nowrap;
      }
      table.data tfoot td,
      table.data tr.total-row td {
        background: #f2f2f2;
        font-weight: bold;
        border: 1px solid #000;
      }
      table.grand { margin-top: 4mm; }
      table.grand .grand-label { text-align: left; padding-left: 5px; }
      .c { text-align: center; }
      .r { text-align: right; white-space: nowrap; }
      .l { text-align: left; }
      .col-num { width: ${compact ? '3%' : 'auto'}; }
      .col-name { width: ${compact ? '22%' : 'auto'}; }
      .col-price { width: ${compact ? '18%' : 'auto'}; }
      .col-qty { width: ${compact ? '10%' : 'auto'}; }
      .col-uzs { width: ${compact ? '12%' : 'auto'}; }
      .col-usd { width: ${compact ? '8%' : 'auto'}; }
      .name { word-break: break-word; }
      .price { font-size: ${compact ? '6.5pt' : '10pt'}; line-height: ${compact ? '1.1' : '1.35'}; }
      .price-uzs { font-size: ${compact ? '6pt' : '9pt'}; color: #166534; }
      .price-fx { font-size: ${compact ? '6pt' : '8.5pt'}; color: #475569; }
      .total-label { text-align: right; }
      .empty { color: #666; font-style: italic; }
      @page { size: A4 landscape; margin: ${compact ? '4mm' : '10mm'}; }
      @media print {
        body { padding: 0; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        tr { page-break-inside: ${compact ? 'auto' : 'avoid'}; }
        .print-compact .section { page-break-before: auto !important; page-break-after: auto !important; }
      }
    </style>
  </head>
  <body${bodyClass}>
    ${headerHtml}
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
