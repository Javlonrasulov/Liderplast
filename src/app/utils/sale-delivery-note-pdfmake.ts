import type { Sale } from '../store/erp-store';
import { saleLineFromItem } from '../components/SaleHistoryPriceDetail';
import { formatDate, formatCurrency, formatNumber, todayYmd } from './format';
import { downloadPdfDefinition } from './pdfmake-download';
import {
  computeSaleDocumentNumber,
  saleItemsForDocument,
  SALE_NOTE_ORG_NAME,
} from './sale-delivery-note-shared';
import { deliveryMetaPdfRows, type SaleDeliveryPrintMeta } from './sale-delivery-print-meta';
import { formatSaleHistoryPriceDetail } from './sales-currency';

const PDF_PRICE_LABELS = { unitPiece: 'шт', fxRate: 'курс' };

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

function buildCopyContent(sale: Sale, documentNumber: string, delivery?: SaleDeliveryPrintMeta) {
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
          ...deliveryMetaPdfRows(delivery),
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

function defaultDocDefinition(content: object[]) {
  return {
    pageSize: 'A4' as const,
    pageMargins: [22, 22, 22, 22] as [number, number, number, number],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 8.5,
      lineHeight: 1.25,
    },
    content,
  };
}

function buildDocDefinition(
  sale: Sale,
  documentNumber: string,
  delivery?: SaleDeliveryPrintMeta,
) {
  return defaultDocDefinition(buildCopyContent(sale, documentNumber, delivery));
}

function sortSalesChronologically(sales: Sale[]) {
  return [...sales].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
}

function buildSummarySection(sales: Sale[], allSales: Sale[], summaryTitle: string) {
  const sorted = sortSalesChronologically(sales);
  const header = [
    { text: '№', bold: true, alignment: 'center', fillColor: '#e8eef5' },
    { text: 'Дата', bold: true, fillColor: '#e8eef5' },
    { text: 'Покупатель', bold: true, fillColor: '#e8eef5' },
    { text: 'Док. №', bold: true, fillColor: '#e8eef5' },
    { text: 'Наименование', bold: true, fillColor: '#e8eef5' },
    { text: 'Кол-во', bold: true, alignment: 'right', fillColor: '#e8eef5' },
    { text: 'Цена', bold: true, fillColor: '#e8eef5' },
    { text: 'Сумма', bold: true, alignment: 'right', fillColor: '#e8eef5' },
    { text: 'Оплачено', bold: true, alignment: 'right', fillColor: '#e8eef5' },
    { text: 'Долг', bold: true, alignment: 'right', fillColor: '#e8eef5' },
  ];

  const body: object[][] = [header];
  let rowNum = 0;
  let grandTotal = 0;
  let grandPaid = 0;

  for (const sale of sorted) {
    const docNum = computeSaleDocumentNumber(sale, allSales);
    const items = saleItemsForDocument(sale);
    const debt = sale.total - sale.paid;
    grandTotal += sale.total;
    grandPaid += sale.paid;

    items.forEach((item, itemIdx) => {
      rowNum += 1;
      const priceText = formatSaleHistoryPriceDetail(
        saleLineFromItem(item),
        formatNumber,
        formatCurrency,
        PDF_PRICE_LABELS,
      );
      const isFirst = itemIdx === 0;
      body.push([
        { text: String(rowNum), alignment: 'center' },
        isFirst ? { text: formatDate(sale.date) } : { text: '' },
        isFirst ? { text: sale.clientName } : { text: '' },
        isFirst ? { text: docNum } : { text: '' },
        { text: item.productType },
        { text: formatNumber(item.quantity), alignment: 'right' },
        { text: priceText, fontSize: 7 },
        isFirst ? { text: formatCurrency(sale.total), alignment: 'right', bold: true } : { text: '' },
        isFirst ? { text: formatCurrency(sale.paid), alignment: 'right' } : { text: '' },
        isFirst
          ? {
              text: debt > 0 ? formatCurrency(debt) : '✓',
              alignment: 'right',
              color: debt > 0 ? '#b91c1c' : '#15803d',
            }
          : { text: '' },
      ]);
    });
  }

  const grandDebt = grandTotal - grandPaid;
  body.push([
    { text: 'Итого', colSpan: 7, alignment: 'right', bold: true },
    {},
    {},
    {},
    {},
    {},
    {},
    { text: formatCurrency(grandTotal), alignment: 'right', bold: true },
    { text: formatCurrency(grandPaid), alignment: 'right', bold: true },
    {
      text: grandDebt > 0 ? formatCurrency(grandDebt) : '✓',
      alignment: 'right',
      bold: true,
      color: grandDebt > 0 ? '#b91c1c' : '#15803d',
    },
  ]);

  return [
    { text: SALE_NOTE_ORG_NAME, bold: true, fontSize: 12, margin: [0, 0, 0, 4] },
    {
      text: summaryTitle,
      bold: true,
      fontSize: 11,
      alignment: 'center',
      margin: [0, 0, 0, 4],
    },
    {
      text: `Записей: ${sorted.length} · Позиций: ${rowNum}`,
      fontSize: 8,
      alignment: 'center',
      color: '#555555',
      margin: [0, 0, 0, 10],
    },
    {
      table: {
        headerRows: 1,
        widths: [16, 48, '*', 52, '*', 32, 78, 52, 52, 44],
        body,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
        paddingLeft: () => 2,
        paddingRight: () => 2,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
      fontSize: 7.5,
      margin: [0, 0, 0, 12],
    },
  ];
}

function buildBulkDocDefinition(sales: Sale[], allSales: Sale[], summaryTitle: string) {
  const sorted = sortSalesChronologically(sales);
  const content: object[] = [...buildSummarySection(sorted, allSales, summaryTitle)];

  if (sorted.length > 0) {
    content.push({ text: '', pageBreak: 'after' });
  }

  sorted.forEach((sale, index) => {
    if (index > 0) {
      content.push({ text: '', pageBreak: 'before' });
    }
    const docNum = computeSaleDocumentNumber(sale, allSales);
    content.push(...buildCopyContent(sale, docNum));
  });

  return defaultDocDefinition(content);
}

function bulkPdfFilename(count: number) {
  return `realizatsiya_xulosa_${count}ta_${todayYmd()}.pdf`;
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
  delivery?: SaleDeliveryPrintMeta,
): Promise<void> {
  const base = allSales.length > 0 ? allSales : [sale];
  const documentNumber = computeSaleDocumentNumber(sale, base);
  const doc = buildDocDefinition(sale, documentNumber, delivery);
  await downloadPdfDefinition(doc, pdfFilename(sale, documentNumber));
}

/** PDF — xulosa + har bir tanlangan sotuv uchun bitta nusxa */
export async function downloadSalesDeliveryNotesPdfMake(
  sales: Sale[],
  allSales: Sale[] = [],
  summaryTitle = 'Сводка реализаций',
): Promise<void> {
  if (sales.length === 0) {
    throw new Error('Hech qanday sotuv tanlanmagan');
  }
  const base = allSales.length > 0 ? allSales : sales;
  if (sales.length === 1) {
    await downloadSaleDeliveryNotePdfMake(sales[0], base);
    return;
  }
  const doc = buildBulkDocDefinition(sales, base, summaryTitle);
  await downloadPdfDefinition(doc, bulkPdfFilename(sales.length));
}
