import type { T } from '../i18n/translations';
import type { CompanyAssetListItem } from '../pages/company-assets/types';
import { formatCurrency } from './format';
import {
  OPIS_ORG_NAME,
  buildOpisTableData,
  formatUsdPlain,
} from './company-assets-opis-shared';

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPriceCellHtml(priceUsd: number, fxRate: number, fxLabel: string) {
  if (priceUsd <= 0) return '';
  const usd = formatUsdPlain(priceUsd);
  const rate = fxRate > 0 ? Math.round(fxRate).toLocaleString('uz-UZ') : '';
  if (!rate) return esc(usd);
  return `${esc(usd)}<div class="rate">${esc(fxLabel)} ${esc(rate)}</div>`;
}

export type CompanyAssetsPrintInput = {
  items: CompanyAssetListItem[];
  t: T;
  usdRate: number;
  eurRate: number;
};

function formatJamiPriceCell(totalUsd: number, totalUzs: number, t: T) {
  const parts: string[] = [];
  const usdStr = formatUsdPlain(Math.round(totalUsd * 100) / 100);
  if (usdStr) parts.push(`${esc(usdStr)} ${esc(t.caValueUsdUnit)}`);
  if (totalUzs > 0) parts.push(esc(formatCurrency(totalUzs)));
  return parts.join('<br>') || '—';
}

export function buildCompanyAssetsPrintHtml({
  items,
  t,
  usdRate,
  eurRate,
}: CompanyAssetsPrintInput): string {
  const data = buildOpisTableData(items, t, usdRate, eurRate);
  const fxLabel = t.caPrintFxPerUsd;

  const bodyRows = data.rows
    .map(
      (item) => `
        <tr>
          <td class="c">${item.no}</td>
          <td class="l name">${esc(item.name)}</td>
          <td class="c">${esc(item.unit)}</td>
          <td class="c">${item.qty}</td>
          <td class="c">${esc(item.marks.inUse)}</td>
          <td class="c">${esc(item.marks.usableNotInUse)}</td>
          <td class="c">${esc(item.marks.repairable)}</td>
          <td class="c">${esc(item.marks.obsolete)}</td>
          <td class="c">${esc(item.marks.irreparable)}</td>
          <td class="c price">${formatPriceCellHtml(item.priceUsd, item.fxRate, fxLabel)}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="uz">
  <head>
    <meta charset="utf-8" />
    <title>${esc(t.caPrintDocTitle)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 8mm 10mm 12mm;
        font-family: "Times New Roman", Times, serif;
        font-size: 9pt;
        color: #000;
      }
      .top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 4mm;
      }
      .title-wrap { flex: 1; text-align: center; }
      .doc-title { margin: 0; font-size: 12pt; font-weight: 700; }
      .org { margin: 2mm 0 0; font-size: 10pt; font-weight: 700; }
      .as-of { font-size: 9pt; white-space: nowrap; padding-top: 2mm; }
      table.opis {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 7.5pt;
      }
      table.opis th,
      table.opis td {
        border: 1px solid #000;
        padding: 1.2mm 1mm;
        vertical-align: middle;
        word-break: break-word;
      }
      table.opis th {
        font-weight: 700;
        text-align: center;
        line-height: 1.15;
      }
      table.opis .nums td {
        font-weight: 700;
        text-align: center;
        padding: 1mm;
      }
      table.opis .jami td { font-weight: 700; }
      .c { text-align: center; }
      .l { text-align: left; }
      .name { font-size: 8pt; line-height: 1.2; }
      .price { line-height: 1.2; }
      .price .rate {
        margin-top: 0.5mm;
        font-size: 6.5pt;
        font-weight: 400;
        white-space: nowrap;
      }
      .rate-note {
        margin: 2mm 0 3mm;
        font-size: 8pt;
        text-align: right;
      }
      .signatures { margin-top: 10mm; width: 55%; font-size: 9pt; }
      .signatures .row {
        display: flex;
        align-items: flex-end;
        gap: 3mm;
        margin-bottom: 5mm;
      }
      .signatures .label { white-space: nowrap; min-width: 34mm; }
      .signatures .line {
        flex: 1;
        border-bottom: 1px solid #000;
        min-height: 5mm;
      }
      @page { size: A4 landscape; margin: 8mm; }
      @media print {
        body { padding: 0; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <div class="top">
      <div class="title-wrap">
        <p class="doc-title">${esc(t.caPrintDocTitle)}</p>
        <p class="org">${esc(OPIS_ORG_NAME)}</p>
      </div>
      <div class="as-of">${esc(data.asOfDate)} ${esc(t.caPrintAsOf)}</div>
    </div>
    ${data.cbuRateNote ? `<p class="rate-note">${esc(data.cbuRateNote)}</p>` : ''}

    <table class="opis">
      <thead>
        <tr>
          <th style="width:4%">${esc(t.caPrintColNo)}</th>
          <th style="width:24%">${esc(t.caPrintColName)}</th>
          <th style="width:7%">${esc(t.caPrintColUnit)}</th>
          <th style="width:5%">${esc(t.caPrintColQty)}</th>
          <th style="width:9%">${esc(t.caPrintColInUse)}</th>
          <th style="width:9%">${esc(t.caPrintColUsableIdle)}</th>
          <th style="width:11%">${esc(t.caPrintColRepairable)}</th>
          <th style="width:11%">${esc(t.caPrintColObsolete)}</th>
          <th style="width:11%">${esc(t.caPrintColIrreparable)}</th>
          <th style="width:9%">${esc(t.caPrintColPriceUsd)}</th>
        </tr>
        <tr class="nums">
          <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td>
          <td>6</td><td>7</td><td>8</td><td>9</td><td>10</td>
        </tr>
      </thead>
      <tbody>
        ${bodyRows || `<tr><td colspan="10" class="c">—</td></tr>`}
        <tr class="jami">
          <td colspan="3" class="c">${esc(t.caPrintTotal)}</td>
          <td class="c">${data.totalQty}</td>
          <td colspan="5"></td>
          <td class="c price">${formatJamiPriceCell(data.totalUsd, data.totalUzs, t)}</td>
        </tr>
      </tbody>
    </table>

    <div class="signatures">
      <div class="row"><span class="label">${esc(t.caPrintSignShopHead)}</span><span class="line"></span></div>
      <div class="row"><span class="label">${esc(t.caPrintSignChiefAccountant)}</span><span class="line"></span></div>
      <div class="row"><span class="label">${esc(t.caPrintSignDirector)}</span><span class="line"></span></div>
      <div class="row"><span class="label">${esc(t.caPrintSignFounder)}</span><span class="line"></span></div>
    </div>

    <script>
      window.addEventListener('load', () => setTimeout(() => window.print(), 300));
    </script>
  </body>
</html>`;
}

export function printCompanyAssets(input: CompanyAssetsPrintInput) {
  const html = buildCompanyAssetsPrintHtml(input);
  const w = window.open('', '_blank', 'width=1200,height=900');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
