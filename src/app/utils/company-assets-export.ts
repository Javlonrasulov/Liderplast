import * as XLSX from 'xlsx';
import type { T } from '../i18n/translations';
import type { CompanyAssetListItem } from '../pages/company-assets/types';
import {
  assetCategoryLabel,
  assetStatusLabel,
} from '../pages/company-assets/labels';
import { formatAssetInitialValue } from '../pages/company-assets/format-value';
import { formatDate } from './format';
import { downloadPdfDefinition } from './pdfmake-download';

export function exportCompanyAssetsExcel(
  items: CompanyAssetListItem[],
  t: T,
  fileName = 'korxona-mulki.xlsx',
  cbuUsdRate = 0,
  cbuEurRate = 0,
) {
  const headers = [
    'ID',
    t.caColInventory,
    t.caColName,
    t.caColCategory,
    t.caColEmployee,
    t.caColLocation,
    t.caColPurchased,
    t.caColInitialValue,
    t.caColStatus,
    t.caColNotes,
  ];
  const rows = items.map((a) => [
    a.id,
    a.inventoryNumber,
    a.name,
    assetCategoryLabel(a.category, t),
    a.assignedUser?.fullName ?? '—',
    a.location ?? '—',
    formatDate(a.purchasedAt),
    formatAssetInitialValue(a, cbuUsdRate, cbuEurRate, t),
    assetStatusLabel(a.status, t),
    a.notes ?? '',
  ]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, t.caExportSheetName);
  XLSX.writeFile(wb, fileName);
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
