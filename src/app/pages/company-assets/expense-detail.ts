import type { T } from '../../i18n/translations';
import { formatDate } from '../../utils/format';
import { assetCategoryLabel } from './labels';
import type { CompanyAssetDetail } from './types';
import { formatAssetInitialValue } from './format-value';

export function formatCompanyAssetExpenseTitle(detail: CompanyAssetDetail, t: T): string {
  return `${t.caExpenseAssetPrefix}: ${detail.name}`;
}

export function formatCompanyAssetExpenseLines(
  detail: CompanyAssetDetail,
  cbuUsdRate: number,
  cbuEurRate: number,
  t: T,
): string {
  const parts = [
    `${t.caColInventory}: ${detail.inventoryNumber}`,
    `${t.caColCategory}: ${assetCategoryLabel(detail.category, t)}`,
    detail.manufacturer
      ? `${t.caFieldManufacturer}: ${detail.manufacturer}`
      : null,
    detail.model ? `${t.caFieldModel}: ${detail.model}` : null,
    detail.serialNumber ? `${t.caFieldSerial}: ${detail.serialNumber}` : null,
    `${t.caColPurchased}: ${formatDate(detail.purchasedAt)}`,
    `${t.caColInitialValue}: ${formatAssetInitialValue(detail, cbuUsdRate, cbuEurRate, t)}`,
  ].filter(Boolean);
  return parts.join(' · ');
}
