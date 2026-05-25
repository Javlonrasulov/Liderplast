import type { Sale } from '../store/erp-store';
import { formatDate, formatNumber } from './format';
import { downloadPdfDefinition } from './pdfmake-download';
import {
  computeSaleDocumentNumber,
  saleItemsForDocument,
  SALE_NOTE_ORG_NAME,
} from './sale-delivery-note-shared';

function signCell(label: string, lineHeight = 28) {
  return {
    stack: [
      { text: label, bold: true, fontSize: 8, margin: [0, 0, 0, 2] },
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: lineHeight,
            x2: 150,
            y2: lineHeight,
            lineWidth: 0.5,
          },
        ],
        margin: [0, 0, 0, 4],
      },
    ],
  };
}

function buildCopyContent(sale: Sale, documentNumber: string) {
  const items = saleItemsForDocument(sale);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const docDate = formatDate(sale.date);

  const itemRows = items.map((item, index) => [
    { text: String(index + 1), alignment: 'center' },
    { text: item.productType },
    { text: String(index + 1), alignment: 'center' },
    { text: 'шт', alignment: 'center' },
    { text: formatNumber(item.quantity), alignment: 'right' },
    { text: '', alignment: 'center' },
    { text: '', alignment: 'center' },
  ]);

  return [
    { text: SALE_NOTE_ORG_NAME, bold: true, fontSize: 12, margin: [0, 0, 0, 4] },
    {
      text: `Реализация номенклатуры № ${documentNumber} от ${docDate}`,
      bold: true,
      fontSize: 10,
      alignment: 'center',
      margin: [0, 0, 0, 8],
    },
    {
      table: {
        widths: ['30%', '*'],
        body: [
          [
            { text: 'Отправитель:', bold: true },
            { text: SALE_NOTE_ORG_NAME },
          ],
          [
            { text: 'Покупатель:', bold: true },
            { text: sale.clientName },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 6],
    },
    {
      table: {
        headerRows: 1,
        widths: [18, '*', 42, 28, 48, 32, 32],
        body: [
          [
            { text: '№', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: 'Наименование', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: 'Номенкл. номер', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: 'Ед. изм.', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: 'Количество', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: 'Цена', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: 'Сумма', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
          ],
          ...itemRows,
          [
            { text: 'Итого', colSpan: 4, alignment: 'right', bold: true },
            {},
            {},
            {},
            { text: formatNumber(totalQty), alignment: 'right', bold: true },
            {},
            {},
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
        paddingLeft: () => 3,
        paddingRight: () => 3,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
      fontSize: 7.5,
      margin: [0, 0, 0, 8],
    },
    {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            signCell('Бухгалтер'),
            { ...signCell('Отпустил', 56), rowSpan: 2 },
            signCell('Принял'),
          ],
          [signCell('Лаборант'), {}, signCell('Охрана')],
        ],
      },
      layout: 'noBorders',
    },
  ];
}

function buildDocDefinition(sale: Sale, documentNumber: string) {
  return {
    pageSize: 'A4' as const,
    pageMargins: [22, 22, 22, 22] as [number, number, number, number],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 8.5,
      lineHeight: 1.25,
    },
    content: buildCopyContent(sale, documentNumber),
  };
}

function pdfFilename(sale: Sale, documentNumber: string) {
  const safeClient = sale.clientName
    .replace(/[^a-zA-Z0-9\u0400-\u04FF\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40) || 'mijoz';
  return `realizatsiya_${documentNumber}_${safeClient}.pdf`;
}

/** PDF — bitta nusxa (pdfmake, UI bloklanmaydi) */
export async function downloadSaleDeliveryNotePdfMake(
  sale: Sale,
  allSales: Sale[] = [],
): Promise<void> {
  const documentNumber = computeSaleDocumentNumber(
    sale,
    allSales.length > 0 ? allSales : [sale],
  );
  const doc = buildDocDefinition(sale, documentNumber);
  await downloadPdfDefinition(doc, pdfFilename(sale, documentNumber));
}
