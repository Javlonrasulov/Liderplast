import React, { useMemo } from 'react';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { useAuth } from '../auth/auth-context';
import { formatCurrency, formatNumber } from '../utils/format';

const emptyCell = '\u2014';

type QtyUnit = 'KG' | 'TON' | 'PIECES';

function qtyUnitLabel(u: QtyUnit, t: ReturnType<typeof useApp>['t']) {
  if (u === 'TON') return t.prRmWeightUnitTon;
  if (u === 'PIECES') return t.supUnitPieces;
  return t.prRmWeightUnitKg;
}

export function SupplierPurchaseHistorySection() {
  const { state, dispatch } = useERP();
  const { t } = useApp();
  const { hasPermission } = useAuth();
  const canFulfill = hasPermission('view_expenses') || hasPermission('view_raw_material');

  const historySorted = useMemo(
    () =>
      [...state.supplierPurchaseOrders].sort(
        (a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime(),
      ),
    [state.supplierPurchaseOrders],
  );

  const onFulfill = async (id: string) => {
    if (!canFulfill) return;
    await dispatch({ type: 'FULFILL_SUPPLIER_PURCHASE_ORDER', payload: id });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t.supTabHistory}</h3>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[960px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
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
                <td colSpan={10} className="px-3 py-8 text-center text-slate-500">
                  {t.prRmNoOrders}
                </td>
              </tr>
            ) : (
              historySorted.map((o, idx) => (
                <tr
                  key={o.id}
                  className={`border-t border-slate-100 dark:border-slate-700 ${
                    idx % 2 ? 'bg-slate-50/50 dark:bg-slate-800/40' : ''
                  }`}
                >
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
                    {o.status === 'PENDING' && canFulfill && (
                      <button
                        type="button"
                        onClick={() => onFulfill(o.id)}
                        className="text-indigo-600 hover:underline text-xs font-medium"
                      >
                        {t.prRmMarkFulfilled}
                      </button>
                    )}
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
