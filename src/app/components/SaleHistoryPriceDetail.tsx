import type { Sale, SaleOrderItem } from '../store/erp-store';
import { formatCurrency, formatNumber } from '../utils/format';
import {
  formatSaleHistoryPriceDetail,
  type SaleLineForDisplay,
} from '../utils/sales-currency';

type Props = {
  line: SaleLineForDisplay;
  unitPiece: string;
  fxRateLabel: string;
  className?: string;
};

export function saleLineFromItem(item: SaleOrderItem): SaleLineForDisplay {
  return {
    pricePerUnit: item.pricePerUnit,
    quantity: item.quantity,
    currency: item.currency ?? 'UZS',
    fxRateToUzs: item.fxRateToUzs,
    total: item.total,
  };
}

export function saleLineFromSale(sale: Sale): SaleLineForDisplay {
  const item = sale.items?.[0];
  if (item) return saleLineFromItem(item);
  return {
    pricePerUnit: sale.pricePerUnit,
    quantity: sale.quantity,
    currency: 'UZS',
    total: sale.total,
  };
}

export function SaleHistoryPriceDetail({ line, unitPiece, fxRateLabel, className }: Props) {
  const text = formatSaleHistoryPriceDetail(line, formatNumber, formatCurrency, {
    unitPiece,
    fxRate: fxRateLabel,
  });
  return (
    <span className={className ?? 'text-xs text-slate-600 dark:text-slate-400 leading-snug'}>
      {text}
    </span>
  );
}
