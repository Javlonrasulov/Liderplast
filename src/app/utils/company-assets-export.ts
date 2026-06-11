import ExcelJS from 'exceljs';
import type { T } from '../i18n/translations';
import type { CompanyAssetListItem } from '../pages/company-assets/types';
import {
  assetCategoryLabel,
  assetStatusLabel,
} from '../pages/company-assets/labels';
import { formatAssetInitialValue } from '../pages/company-assets/format-value';
import { downloadPdfDefinition } from './pdfmake-download';
import {
  OPIS_COL_COUNT,
  OPIS_ORG_NAME,
  buildOpisTableData,
  formatOpisPriceCell,
} from './company-assets-opis-shared';

const COL_LETTER = (n: number) => String.fromCharCode(64 + n);

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

function lastColLetter() {
  return COL_LETTER(OPIS_COL_COUNT);
}

function styleCell(
  cell: ExcelJS.Cell,
  opts?: {
    bold?: boolean;
    align?: Partial<ExcelJS.Alignment>;
    fill?: string;
    border?: boolean;
    size?: number;
  },
) {
  cell.font = {
    name: 'Times New Roman',
    size: opts?.size ?? 10,
    bold: opts?.bold ?? false,
  };
  cell.alignment = {
    vertical: 'middle',
    wrapText: true,
    ...opts?.align,
  };
  if (opts?.fill) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: opts.fill },
    };
  }
  if (opts?.border !== false) {
    cell.border = THIN_BORDER;
  }
}

function downloadExcelBuffer(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportCompanyAssetsExcel(
  items: CompanyAssetListItem[],
  t: T,
  fileName = 'korxona-mulki.xlsx',
  cbuUsdRate = 0,
  cbuEurRate = 0,
) {
  const data = buildOpisTableData(items, t, cbuUsdRate, cbuEurRate);
  const lc = lastColLetter();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'LiderPlast ERP';
  const ws = wb.addWorksheet(t.caExportSheetName, {
    views: [{ showGridLines: false }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  ws.columns = [
    { width: 5 },
    { width: 38 },
    { width: 8 },
    { width: 6 },
    { width: 11 },
    { width: 11 },
    { width: 14 },
    { width: 12 },
    { width: 12 },
    { width: 16 },
  ];

  let row = 1;

  ws.mergeCells(`A${row}:${lc}${row}`);
  const titleCell = ws.getCell(`A${row}`);
  titleCell.value = t.caPrintDocTitle;
  styleCell(titleCell, { bold: true, size: 13, align: { horizontal: 'center' }, border: false });
  row += 1;

  ws.mergeCells(`A${row}:${lc}${row}`);
  const orgCell = ws.getCell(`A${row}`);
  orgCell.value = OPIS_ORG_NAME;
  styleCell(orgCell, { bold: true, size: 11, align: { horizontal: 'center' }, border: false });
  row += 1;

  ws.mergeCells(`G${row}:${lc}${row}`);
  const dateCell = ws.getCell(`G${row}`);
  dateCell.value = `${data.asOfDate} ${t.caPrintAsOf}`;
  styleCell(dateCell, { align: { horizontal: 'right' }, border: false });
  row += 1;

  if (data.cbuRateNote) {
    ws.mergeCells(`A${row}:${lc}${row}`);
    const rateCell = ws.getCell(`A${row}`);
    rateCell.value = data.cbuRateNote;
    styleCell(rateCell, { align: { horizontal: 'right' }, size: 9, border: false });
    row += 1;
  }

  row += 1;

  const headerRow = row;
  const headers = [
    t.caPrintColNo,
    t.caPrintColName,
    t.caPrintColUnit,
    t.caPrintColQty,
    t.caPrintColInUse,
    t.caPrintColUsableIdle,
    t.caPrintColRepairable,
    t.caPrintColObsolete,
    t.caPrintColIrreparable,
    t.caPrintColPriceUsd,
  ];
  headers.forEach((h, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = h;
    styleCell(cell, {
      bold: true,
      size: 8,
      fill: 'FFF0F0F0',
      align: { horizontal: 'center', vertical: 'middle' },
    });
  });
  row += 1;

  for (let c = 1; c <= OPIS_COL_COUNT; c++) {
    const cell = ws.getCell(row, c);
    cell.value = c;
    styleCell(cell, { bold: true, size: 8, align: { horizontal: 'center' } });
  }
  row += 1;

  for (const item of data.rows) {
    const values = [
      item.no,
      item.name,
      item.unit,
      item.qty,
      item.marks.inUse,
      item.marks.usableNotInUse,
      item.marks.repairable,
      item.marks.obsolete,
      item.marks.irreparable,
      formatOpisPriceCell(item.priceUsd, item.fxRate, t.caPrintFxPerUsd, item.uzs),
    ];
    values.forEach((v, i) => {
      const cell = ws.getCell(row, i + 1);
      cell.value = v;
      styleCell(cell, {
        size: 9,
        align: {
          horizontal: i === 1 ? 'left' : 'center',
          vertical: 'middle',
          wrapText: true,
        },
      });
    });
    ws.getRow(row).height = 28;
    row += 1;
  }

  const jamiRow = row;
  ws.mergeCells(`A${jamiRow}:C${jamiRow}`);
  const jamiLabel = ws.getCell(`A${jamiRow}`);
  jamiLabel.value = t.caPrintTotal;
  styleCell(jamiLabel, { bold: true, align: { horizontal: 'center' } });

  const jamiQty = ws.getCell(`D${jamiRow}`);
  jamiQty.value = data.totalQty;
  styleCell(jamiQty, { bold: true, align: { horizontal: 'center' } });

  for (let c = 5; c <= 9; c++) {
    styleCell(ws.getCell(jamiRow, c), { bold: true });
  }

  const jamiPrice = ws.getCell(`J${jamiRow}`);
  jamiPrice.value = formatOpisPriceCell(
    Math.round(data.totalUsd * 100) / 100,
    cbuUsdRate,
    t.caPrintFxPerUsd,
    data.totalUzs,
  );
  styleCell(jamiPrice, { bold: true, align: { horizontal: 'center', wrapText: true } });
  ws.getRow(jamiRow).height = 32;

  for (let r = headerRow; r <= jamiRow; r++) {
    for (let c = 1; c <= OPIS_COL_COUNT; c++) {
      const cell = ws.getCell(r, c);
      if (!cell.border) styleCell(cell, { border: true });
      else cell.border = THIN_BORDER;
    }
  }

  row += 2;
  const signatures = [
    t.caPrintSignShopHead,
    t.caPrintSignChiefAccountant,
    t.caPrintSignDirector,
    t.caPrintSignFounder,
  ];
  for (const label of signatures) {
    ws.mergeCells(`A${row}:B${row}`);
    const labelCell = ws.getCell(`A${row}`);
    labelCell.value = label;
    styleCell(labelCell, { border: false, align: { horizontal: 'left' } });
    ws.mergeCells(`C${row}:${lc}${row}`);
    const lineCell = ws.getCell(`C${row}`);
    lineCell.value = '';
    styleCell(lineCell, { border: false });
    lineCell.border = { bottom: { style: 'thin' } };
    row += 1;
  }

  ws.pageSetup.printArea = `A1:${lc}${jamiRow}`;

  const buffer = await wb.xlsx.writeBuffer();
  downloadExcelBuffer(buffer, fileName);
}

export async function exportCompanyAssetsPdf(
  items: CompanyAssetListItem[],
  t: T,
  title: string,
  cbuUsdRate = 0,
  cbuEurRate = 0,
) {
  const body = [
    [
      { text: t.caColInventory, style: 'tableHeader' },
      { text: t.caColName, style: 'tableHeader' },
      { text: t.caColCategory, style: 'tableHeader' },
      { text: t.caColStatus, style: 'tableHeader' },
      { text: t.caColInitialValue, style: 'tableHeader' },
    ],
    ...items.map((a) => [
      a.inventoryNumber,
      a.name,
      assetCategoryLabel(a.category, t),
      assetStatusLabel(a.status, t),
      formatAssetInitialValue(a, cbuUsdRate, cbuEurRate, t),
    ]),
  ];

  await downloadPdfDefinition(
    {
      pageOrientation: 'landscape',
      content: [
        { text: title, style: 'header', margin: [0, 0, 0, 12] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body,
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: { fontSize: 14, bold: true },
        tableHeader: { bold: true, fillColor: '#e2e8f0' },
      },
      defaultStyle: { font: 'Roboto', fontSize: 9 },
    },
    'korxona-mulki.pdf',
  );
}
