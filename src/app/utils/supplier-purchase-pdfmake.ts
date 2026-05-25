import type { SupplierPurchaseOrder } from '../store/erp-store';
import { formatCurrency, formatDate, formatNumber, todayYmd } from './format';
import { downloadPdfDefinition } from './pdfmake-download';
import {
  computeSupplierPurchaseDocumentNumber,
} from './supplier-purchase-document';

const PRINT_ORG_NAME = '"SAM-BC" MCHJ';

function qtyUnitShort(unit: SupplierPurchaseOrder['quantityUnit']): string {
  if (unit === 'TON') return 'т';
  if (unit === 'PIECES') return 'шт';
  return 'кг';
}

const gridLayout = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => '#000000',
  vLineColor: () => '#000000',
  paddingLeft: () => 3,
  paddingRight: () => 3,
  paddingTop: () => 2,
  paddingBottom: () => 2,
};

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

export type SupplierPurchasePdfLabels = {
  singleTitle: string;
  bulkTitle: string;
  pdfDocFrom: string;
  pdfGenerated: string;
  supplier: string;
  payment: string;
  notes: string;
  colNo: string;
  colName: string;
  colUnit: string;
  colQty: string;
  colPrice: string;
  colAmount: string;
  colUzs: string;
  colDate: string;
  colSupplier: string;
  colProduct: string;
  colPayment: string;
  colDebt: string;
  colStatus: string;
  colNotes: string;
  paymentCash: string;
  paymentCredit: string;
  statusPending: string;
  statusFulfilled: string;
  totalUzs: string;
  recordsCount: string;
  accountant: string;
  warehouse: string;
  supplierSign: string;
};

function paymentText(order: SupplierPurchaseOrder, labels: SupplierPurchasePdfLabels): string {
  if (order.paymentType === 'CREDIT') {
    return `${labels.paymentCredit} (${formatCurrency(order.paidAmountUzs)} / ${formatCurrency(order.debtAmountUzs)})`;
  }
  return labels.paymentCash;
}

function statusText(order: SupplierPurchaseOrder, labels: SupplierPurchasePdfLabels): string {
  return order.status === 'PENDING' ? labels.statusPending : labels.statusFulfilled;
}

function buildSingleContent(
  order: SupplierPurchaseOrder,
  documentNumber: string,
  labels: SupplierPurchasePdfLabels,
) {
  const docDate = formatDate(order.orderedAt);
  const unitPrice =
    order.quantity > 0 ? order.amountOriginal / order.quantity : order.amountOriginal;

  return [
    { text: PRINT_ORG_NAME, bold: true, fontSize: 12, margin: [0, 0, 0, 4] },
    {
      text: `${labels.singleTitle} № ${documentNumber} ${labels.pdfDocFrom} ${docDate}`,
      bold: true,
      fontSize: 10,
      alignment: 'center',
      margin: [0, 0, 0, 8],
    },
    {
      table: {
        widths: ['28%', '*'],
        body: [
          [{ text: `${labels.supplier}:`, bold: true }, { text: order.supplierName ?? '—' }],
          [{ text: `${labels.payment}:`, bold: true }, { text: paymentText(order, labels) }],
          ...(order.notes
            ? [[{ text: `${labels.notes}:`, bold: true }, { text: order.notes }]]
            : []),
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 6],
    },
    {
      table: {
        headerRows: 1,
        widths: [18, '*', 28, 48, 52, 52, 58],
        body: [
          [
            { text: labels.colNo, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: labels.colName, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: labels.colUnit, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: labels.colQty, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: `${labels.colPrice} (${order.currency})`, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: `${labels.colAmount} (${order.currency})`, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
            { text: labels.colUzs, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
          ],
          [
            { text: '1', alignment: 'center' },
            { text: order.productName },
            { text: qtyUnitShort(order.quantityUnit), alignment: 'center' },
            { text: formatNumber(order.quantity), alignment: 'right' },
            { text: formatNumber(unitPrice), alignment: 'right' },
            { text: formatNumber(order.amountOriginal), alignment: 'right' },
            { text: formatCurrency(order.amountUzs), alignment: 'right' },
          ],
        ],
      },
      layout: gridLayout,
      fontSize: 7.5,
      margin: [0, 0, 0, 8],
    },
    {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            signCell(labels.accountant),
            signCell(labels.warehouse),
            signCell(labels.supplierSign),
          ],
        ],
      },
      layout: 'noBorders',
    },
  ];
}

function buildBulkContent(
  orders: SupplierPurchaseOrder[],
  allOrders: SupplierPurchaseOrder[],
  labels: SupplierPurchasePdfLabels,
) {
  const sorted = [...orders].sort((a, b) => {
    const byDate = a.orderedAt.localeCompare(b.orderedAt);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });

  const headerRow = [
    { text: labels.colNo, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colDate, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colSupplier, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colProduct, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colQty, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colAmount, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colUzs, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colPayment, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colDebt, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colStatus, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
    { text: labels.colNotes, bold: true, alignment: 'center', fillColor: '#f5f5f5' },
  ];

  const dataRows = sorted.map((order) => {
    const docNum = computeSupplierPurchaseDocumentNumber(order, allOrders);
    return [
      { text: docNum, alignment: 'center', fontSize: 6.5 },
      { text: formatDate(order.orderedAt) || order.orderedAt.slice(0, 10), fontSize: 6.5 },
      { text: order.supplierName ?? '—', fontSize: 6.5 },
      { text: order.productName, fontSize: 6.5 },
      {
        text: `${formatNumber(order.quantity)} ${qtyUnitShort(order.quantityUnit)}`,
        alignment: 'right',
        fontSize: 6.5,
      },
      {
        text: `${formatNumber(order.amountOriginal)} ${order.currency}`,
        alignment: 'right',
        fontSize: 6.5,
      },
      { text: formatCurrency(order.amountUzs), alignment: 'right', fontSize: 6.5 },
      { text: paymentText(order, labels), fontSize: 6.5 },
      {
        text: order.debtAmountUzs > 0 ? formatCurrency(order.debtAmountUzs) : '—',
        alignment: 'right',
        fontSize: 6.5,
      },
      { text: statusText(order, labels), fontSize: 6.5 },
      { text: order.notes ?? '—', fontSize: 6.5 },
    ];
  });

  const totalUzs = sorted.reduce((s, o) => s + o.amountUzs, 0);

  return [
    { text: PRINT_ORG_NAME, bold: true, fontSize: 12, margin: [0, 0, 0, 4] },
    {
      text: labels.bulkTitle,
      bold: true,
      fontSize: 11,
      alignment: 'center',
      margin: [0, 0, 0, 4],
    },
    {
      text: `${labels.pdfGenerated}: ${formatDate(todayYmd())}`,
      fontSize: 8,
      alignment: 'center',
      margin: [0, 0, 0, 8],
    },
    {
      table: {
        headerRows: 1,
        widths: [36, 42, 58, '*', 44, 48, 52, 52, 40, 38, 48],
        body: [headerRow, ...dataRows],
      },
      layout: gridLayout,
      fontSize: 7,
    },
    {
      text: `${labels.recordsCount}: ${sorted.length}   |   ${labels.totalUzs}: ${formatCurrency(totalUzs)}`,
      bold: true,
      fontSize: 9,
      margin: [0, 10, 0, 0],
    },
  ];
}

function baseDocDefinition(content: unknown[], landscape = false) {
  return {
    pageSize: 'A4' as const,
    pageOrientation: landscape ? ('landscape' as const) : ('portrait' as const),
    pageMargins: landscape
      ? ([14, 14, 14, 14] as [number, number, number, number])
      : ([22, 22, 22, 22] as [number, number, number, number]),
    defaultStyle: {
      font: 'Roboto',
      fontSize: 8.5,
      lineHeight: 1.25,
    },
    content,
  };
}

function safeFilenamePart(value: string) {
  return value
    .replace(/[^a-zA-Z0-9\u0400-\u04FF\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40);
}

function singlePdfFilename(order: SupplierPurchaseOrder, documentNumber: string) {
  const supplier = safeFilenamePart(order.supplierName ?? 'postavshik');
  return `sotib_olish_${documentNumber}_${supplier}.pdf`;
}

function bulkPdfFilename(count: number) {
  return `sotib_olish_tarix_${todayYmd()}_${count}_ta.pdf`;
}

export async function downloadSupplierPurchasePdfMake(
  order: SupplierPurchaseOrder,
  allOrders: SupplierPurchaseOrder[],
  labels: SupplierPurchasePdfLabels,
): Promise<void> {
  const documentNumber = computeSupplierPurchaseDocumentNumber(
    order,
    allOrders.length > 0 ? allOrders : [order],
  );
  const doc = baseDocDefinition(buildSingleContent(order, documentNumber, labels));
  await downloadPdfDefinition(doc, singlePdfFilename(order, documentNumber));
}

export async function downloadSupplierPurchasesBulkPdfMake(
  orders: SupplierPurchaseOrder[],
  allOrders: SupplierPurchaseOrder[],
  labels: SupplierPurchasePdfLabels,
): Promise<void> {
  if (orders.length === 0) return;
  const doc = baseDocDefinition(buildBulkContent(orders, allOrders, labels), true);
  await downloadPdfDefinition(doc, bulkPdfFilename(orders.length));
}
