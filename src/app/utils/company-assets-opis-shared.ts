import type { T } from '../i18n/translations';
import type { CompanyAssetListItem } from '../pages/company-assets/types';
import { formatCurrency, formatNumber, todayYmd } from './format';

export const OPIS_ORG_NAME = '"SAM BC" MCHJ';
export const OPIS_COL_COUNT = 10;

export function printDateDots(iso: string) {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function assetFullName(asset: CompanyAssetListItem) {
  const parts = [asset.name.trim()];
  if (asset.manufacturer?.trim()) parts.push(asset.manufacturer.trim());
  if (asset.model?.trim()) parts.push(asset.model.trim());
  return parts.join(' ');
}

export type AssetPriceInfo = { priceUsd: number; fxRate: number };

export function assetPriceInfo(
  asset: CompanyAssetListItem,
  usdRate: number,
  eurRate: number,
): AssetPriceInfo {
  const original = asset.purchasePriceOriginal ?? 0;
  const storedFx = asset.fxRateToUzs && asset.fxRateToUzs > 1 ? asset.fxRateToUzs : 0;

  if (asset.currency === 'USD' && original > 0) {
    return { priceUsd: original, fxRate: storedFx || usdRate };
  }
  if (asset.currency === 'EUR' && original > 0 && eurRate > 0 && usdRate > 0) {
    return {
      priceUsd: Math.round(((original * eurRate) / usdRate) * 100) / 100,
      fxRate: storedFx || usdRate,
    };
  }
  if (usdRate > 0 && asset.initialValueUzs > 0) {
    return {
      priceUsd: Math.round((asset.initialValueUzs / usdRate) * 100) / 100,
      fxRate: usdRate,
    };
  }
  return { priceUsd: 0, fxRate: usdRate };
}

export type InventoryMarks = {
  inUse: string;
  usableNotInUse: string;
  repairable: string;
  obsolete: string;
  irreparable: string;
};

export function inventoryMarks(asset: CompanyAssetListItem, t: T): InventoryMarks {
  const notes = (asset.notes ?? '').toLowerCase();
  const empty = { inUse: '', usableNotInUse: '', repairable: '', obsolete: '', irreparable: '' };

  if (asset.status === 'WRITTEN_OFF') return { ...empty, irreparable: '+' };
  if (asset.status === 'NEEDS_REPAIR') {
    return { inUse: '', usableNotInUse: '+', repairable: t.caPrintMarkRepair, obsolete: '', irreparable: '' };
  }
  if (asset.status === 'UNDER_REPAIR') {
    return { inUse: '', usableNotInUse: '', repairable: t.caPrintMarkRestore, obsolete: '', irreparable: '' };
  }
  if (
    notes.includes('tamirtalab') ||
    notes.includes('таъмирталаб') ||
    notes.includes("ta'mir") ||
    notes.includes('таъмир')
  ) {
    return {
      inUse: '',
      usableNotInUse: '+',
      repairable:
        notes.includes('tiklanadi') || notes.includes('тикланади')
          ? t.caPrintMarkRestore
          : '+',
      obsolete: '',
      irreparable: '',
    };
  }
  if (asset.condition === 'POOR' || notes.includes('eski') || notes.includes('эски')) {
    return { ...empty, obsolete: t.caPrintMarkOld };
  }
  if (asset.condition === 'FAIR') {
    return { inUse: '', usableNotInUse: '+', repairable: '', obsolete: t.caPrintMarkGood, irreparable: '' };
  }
  return { inUse: '1+', usableNotInUse: '', repairable: '', obsolete: t.caPrintMarkGood, irreparable: '' };
}

export function formatUsdPlain(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function formatRatePlain(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return formatNumber(Math.round(value));
}

export type OpisTableRow = {
  no: number;
  name: string;
  unit: string;
  qty: number;
  marks: InventoryMarks;
  priceUsd: number;
  fxRate: number;
  uzs: number;
};

export type OpisTableData = {
  rows: OpisTableRow[];
  totalQty: number;
  totalUsd: number;
  totalUzs: number;
  asOfDate: string;
  cbuRateNote: string;
};

export function buildOpisTableData(
  items: CompanyAssetListItem[],
  t: T,
  usdRate: number,
  eurRate: number,
): OpisTableData {
  let totalQty = 0;
  let totalUsd = 0;
  let totalUzs = 0;

  const rows = items.map((asset, i) => {
    const marks = inventoryMarks(asset, t);
    const { priceUsd, fxRate } = assetPriceInfo(asset, usdRate, eurRate);
    totalQty += 1;
    totalUsd += priceUsd;
    totalUzs += asset.initialValueUzs ?? 0;
    return {
      no: i + 1,
      name: assetFullName(asset),
      unit: t.caPrintUnit,
      qty: 1,
      marks,
      priceUsd,
      fxRate,
      uzs: asset.initialValueUzs ?? 0,
    };
  });

  const asOfDate = printDateDots(todayYmd());
  const cbuRateNote =
    usdRate > 0 ? `${t.caPrintCbuRate}: 1$ = ${formatRatePlain(usdRate)} ${t.caPrintSom}` : '';

  return { rows, totalQty, totalUsd, totalUzs, asOfDate, cbuRateNote };
}

export function formatOpisPriceCell(priceUsd: number, fxRate: number, fxLabel: string, uzs?: number) {
  const lines: string[] = [];
  const usd = formatUsdPlain(priceUsd);
  if (usd) lines.push(`${usd} $`);
  const rate = formatRatePlain(fxRate);
  if (rate) lines.push(`${fxLabel}${rate}`);
  if (uzs && uzs > 0) lines.push(formatCurrency(uzs));
  return lines.join('\n');
}
