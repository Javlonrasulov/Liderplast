import type { T } from '../i18n/translations';

/** Backend `BadRequestException` bilan mos keladi */
export const WAREHOUSE_ERR_STOCK_REMAINS = 'WAREHOUSE_DELETE_STOCK_REMAINS';
export const WAREHOUSE_ERR_RAW_BAGS = 'WAREHOUSE_DELETE_RAW_BAGS_EXIST';

export function translateWarehouseApiError(message: string, t: T): string {
  const code = message.trim();
  if (code === WAREHOUSE_ERR_STOCK_REMAINS) return t.whErrDeleteStockRemains;
  if (code === WAREHOUSE_ERR_RAW_BAGS) return t.whErrDeleteRawBags;
  return message;
}
