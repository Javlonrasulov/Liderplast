import type { T } from '../i18n/translations';

/** Backend `BadRequestException` bilan mos keladi */
export const WAREHOUSE_ERR_STOCK_REMAINS = 'WAREHOUSE_DELETE_STOCK_REMAINS';
export const WAREHOUSE_ERR_RAW_BAGS = 'WAREHOUSE_DELETE_RAW_BAGS_EXIST';

export function translateWarehouseApiError(message: string, t: T): string {
  const code = message.trim();
  if (code === WAREHOUSE_ERR_STOCK_REMAINS) return t.whErrDeleteStockRemains;
  if (code === WAREHOUSE_ERR_RAW_BAGS) return t.whErrDeleteRawBags;
  const lower = code.toLowerCase();
  if (lower.includes('linked to a supplier purchase order') || lower.includes('linked to another document')) {
    return t.rmIncomingErrLinked;
  }
  if (lower.includes('incoming bags are already in use')) return t.rmIncomingErrBagsUsed;
  if (lower.includes('auto bag quantity exceeds')) return t.rmIncomingErrBagsMismatch;
  if (lower.includes('stock cannot go negative')) return t.rmIncomingErrStockNegative;
  if (lower.includes('product not found')) return t.whErrProductNotFound;
  if (lower.includes('raw materials were not found')) {
    return t.whErrRawMaterialsNotFound;
  }
  if (lower.includes('machines were not found')) return t.whErrMachinesNotFound;
  if (
    lower.includes('rawmaterialkind') &&
    (lower.includes('should not exist') || lower.includes('should not be'))
  ) {
    return t.whApiErrRawMaterialKindForbidden;
  }
  return message;
}
