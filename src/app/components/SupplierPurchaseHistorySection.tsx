import React, { useCallback, useMemo, useState } from 'react';
import { Download, Pencil, Printer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useERP, type SupplierPurchaseOrder } from '../store/erp-store';
import { useApp, isDateInFilter } from '../i18n/app-context';
import { useAuth } from '../auth/auth-context';
import { formatCurrency, formatNumber } from '../utils/format';
import {
  downloadSupplierPurchasePdf,
  downloadSupplierPurchasesBulkPdf,
  printSupplierPurchaseOrder,
} from '../utils/supplier-purchase-document';
import type { SupplierPurchasePdfLabels } from '../utils/supplier-purchase-pdfmake';
import { SupplierPurchaseEditDialog } from './SupplierPurchaseEditDialog';

const emptyCell = '\u2014';

type QtyUnit = 'KG' | 'TON' | 'PIECES';

function qtyUnitLabel(u: QtyUnit, t: ReturnType<typeof useApp>['t']) {
  if (u === 'TON') return t.prRmWeightUnitTon;
  if (u === 'PIECES') return t.supUnitPieces;
  return t.prRmWeightUnitKg;
}

export function SupplierPurchaseHistorySection() {
  const { state, dispatch } = useERP();
  const { t, dateFilter, isFiltered, filterLabel } = useApp();
  const { hasPermission } = useAuth();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [downloading, setDownloading] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SupplierPurchaseOrder | null>(null);

  const canManage =
    hasPermission('manage_suppliers') || hasPermission('view_expenses');

  const canFulfill =
    canManage || hasPermission('view_raw_material');

  const historySorted = useMemo(
    () =>
      [...state.supplierPurchaseOrders]
        .filter((o) => isDateInFilter(o.orderedAt.slice(0, 10), dateFilter))
        .sort(
          (a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime(),
        ),
    [state.supplierPurchaseOrders, dateFilter],
  );

  const pdfLabels = useMemo<SupplierPurchasePdfLabels>(
    () => ({
      singleTitle: t.supSinglePdfTitle,
      bulkTitle: t.supBulkPdfTitle,
      pdfDocFrom: t.supPdfDocFrom,
      pdfGenerated: t.supPdfGenerated,
      supplier: t.supColSupplier,
      payment: t.supPaymentType,
      notes: t.labelDesc,
      colNo: '№',
      colName: t.prProductType,
      colUnit: t.supQtyUnitLabel,
      colQty: t.supColQty,
      colPrice: t.supPdfColPrice,
      colAmount: t.labelAmount,
      colUzs: 'UZS',
      colDate: t.prRmColOrderedAt,
      colSupplier: t.supColSupplier,
      colProduct: t.prProductType,
      colPayment: t.supPaymentType,
      colDebt: t.supDebtRemaining,
      colStatus: t.prStatusLabel,
      colNotes: t.labelDesc,
      paymentCash: t.supPaymentCash,
      paymentCredit: t.supPaymentCredit,
      statusPending: t.prRmStatusPending,
      statusFulfilled: t.prRmStatusFulfilled,
      totalUzs: t.supPdfTotalUzs,
      recordsCount: t.supPdfRecordsCount,
      accountant: t.supPdfAccountant,
      warehouse: t.supPdfWarehouse,
      supplierSign: t.supPdfSupplierSign,
    }),
    [t],
  );

  const allVisibleSelected =
    historySorted.length > 0 && historySorted.every((o) => selectedIds.has(o.id));

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(historySorted.map((o) => o.id)));
  };

  const selectedOrders = useMemo(
    () => historySorted.filter((o) => selectedIds.has(o.id)),
    [historySorted, selectedIds],
  );

  const runPdfDownload = useCallback(
    async (orders: SupplierPurchaseOrder[], toastLabel: string) => {
      if (orders.length === 0) {
        toast.error(t.supSelectForPdf);
        return;
      }
      const toastId = toast.loading(`${toastLabel}…`);
      setDownloading(true);
      try {
        if (orders.length === 1) {
          await downloadSupplierPurchasePdf(
            orders[0],
            state.supplierPurchaseOrders,
            pdfLabels,
          );
        } else {
          await downloadSupplierPurchasesBulkPdf(
            orders,
            state.supplierPurchaseOrders,
            pdfLabels,
          );
        }
        toast.success(toastLabel, { id: toastId });
      } catch (err) {
        console.error('[suppliers] PDF download failed', err);
        toast.error(t.slPdfDownloadFailed, { id: toastId });
      } finally {
        setDownloading(false);
      }
    },
    [pdfLabels, state.supplierPurchaseOrders, t.slPdfDownloadFailed, t.supSelectForPdf],
  );

  const onFulfill = async (id: string) => {
    if (!canFulfill) return;
    await dispatch({ type: 'FULFILL_SUPPLIER_PURCHASE_ORDER', payload: id });
  };

  const handlePrint = (order: SupplierPurchaseOrder) => {
    printSupplierPurchaseOrder(order, state.supplierPurchaseOrders);
  };

  const handleDownloadOne = (order: SupplierPurchaseOrder) => {
    void runPdfDownload([order], t.supHistoryDownload);
  };

  const handleDownloadSelected = () => {
    void runPdfDownload(
      selectedOrders,
      selectedOrders.length === 1 ? t.supHistoryDownload : t.slDownloadSelectedPdf,
    );
  };

  const handleDownloadAll = () => {
    void runPdfDownload(historySorted, t.supDownloadAllPdf);
  };

  const handleDelete = async (order: SupplierPurchaseOrder) => {
    if (order.legacy) {
      toast.error(t.supLegacyNoEdit);
      return;
    }
    if (!canManage) return;
    if (!window.confirm(t.supDeletePurchaseConfirm)) return;
    const toastId = toast.loading(`${t.supDeletePurchase}…`);
    try {
      await dispatch({ type: 'DELETE_SUPPLIER_PURCHASE_ORDER', payload: order.id });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(order.id);
        return next;
      });
      toast.success(t.supDeletePurchase, { id: toastId });
    } catch (err) {
      console.error('[suppliers] delete purchase failed', err);
      toast.error(t.slPdfDownloadFailed, { id: toastId });
    }
  };

  const selectedCountLabel = t.supSelectedCount.replace('{n}', String(selectedIds.size));

  return (
    <div className="space-y-2">
      {editingOrder && (
        <SupplierPurchaseEditDialog
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t.supTabHistory}</h3>
          {isFiltered && (
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
              {t.dfShowing} {filterLabel}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.size > 0 && (
            <span className="text-[11px] text-slate-500">{selectedCountLabel}</span>
          )}
          <button
            type="button"
            onClick={toggleAllVisible}
            disabled={historySorted.length === 0 || downloading}
            className="text-[11px] font-medium text-indigo-600 hover:underline disabled:opacity-40"
          >
            {allVisibleSelected ? t.slDeselectAll : t.slSelectAll}
          </button>
          <button
            type="button"
            onClick={handleDownloadSelected}
            disabled={selectedIds.size === 0 || downloading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            <Download size={12} />
            {t.slDownloadSelectedPdf}
          </button>
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={historySorted.length === 0 || downloading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/30 disabled:opacity-40"
          >
            <Download size={12} />
            {t.supDownloadAllPdf}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th className="w-9 px-2 py-2.5">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  disabled={historySorted.length === 0 || downloading}
                  className="rounded border-slate-300"
                  aria-label={t.slSelectAll}
                />
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-slate-500">{t.prRmColOrderedAt}</th>
              <th className="text-left px-3 py-2.5 font-semibold text-slate-500">{t.supColSupplier}</th>
              <th className="text-left px-3 py-2.5 font-semibold text-slate-500">{t.prProductType}</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500">{t.supColQty}</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500">{t.labelAmount}</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500">UZS</th>
              <th className="text-left px-3 py-2.5 font-semibold text-slate-500">{t.supPaymentType}</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500">{t.supDebtRemaining}</th>
              <th className="text-left px-3 py-2.5 font-semibold text-slate-500">{t.prStatusLabel}</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500" />
            </tr>
          </thead>
          <tbody>
            {historySorted.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-slate-500">
                  {t.prRmNoOrders}
                </td>
              </tr>
            ) : (
              historySorted.map((o, idx) => (
                <tr
                  key={o.id}
                  className={`border-t border-slate-100 dark:border-slate-700 ${
                    selectedIds.has(o.id)
                      ? 'bg-indigo-50/60 dark:bg-indigo-900/20'
                      : idx % 2
                        ? 'bg-slate-50/50 dark:bg-slate-800/40'
                        : ''
                  }`}
                >
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(o.id)}
                      onChange={() => toggleOne(o.id)}
                      disabled={downloading}
                      className="rounded border-slate-300"
                      aria-label={o.productName}
                    />
                  </td>
                  <td className="px-3 py-2 text-slate-500 font-mono whitespace-nowrap">
                    {o.orderedAt.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                    {o.supplierName ?? emptyCell}
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">
                    {o.productName}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                    {formatNumber(o.quantity)} {qtyUnitLabel(o.quantityUnit, t)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatNumber(o.amountOriginal)} {o.currency}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(o.amountUzs)}</td>
                  <td className="px-3 py-2">
                    {o.paymentType === 'CREDIT' ? t.supPaymentCredit : t.supPaymentCash}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {o.debtAmountUzs > 0 ? formatCurrency(o.debtAmountUzs) : emptyCell}
                  </td>
                  <td className="px-3 py-2">
                    {o.status === 'PENDING' ? (
                      <span className="text-amber-700 dark:text-amber-400">{t.prRmStatusPending}</span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400">{t.prRmStatusFulfilled}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handlePrint(o)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors"
                        title={t.prPrint}
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadOne(o)}
                        disabled={downloading}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-40"
                        title={t.supHistoryDownload}
                      >
                        <Download size={14} />
                      </button>
                      {canManage && !o.legacy && (
                        <button
                          type="button"
                          onClick={() => setEditingOrder(o)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title={t.supEditPurchase}
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {canManage && !o.legacy && (
                        <button
                          type="button"
                          onClick={() => void handleDelete(o)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title={t.supDeletePurchase}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {o.status === 'PENDING' && canFulfill && (
                        <button
                          type="button"
                          onClick={() => onFulfill(o.id)}
                          className="text-indigo-600 hover:underline text-xs font-medium whitespace-nowrap"
                        >
                          {t.prRmMarkFulfilled}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
