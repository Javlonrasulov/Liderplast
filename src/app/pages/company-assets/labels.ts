import type { T } from '../../i18n/translations';
import type {
  CompanyAssetActionType,
  CompanyAssetCategory,
  CompanyAssetCondition,
  CompanyAssetStatus,
} from './types';

export function assetStatusLabel(status: CompanyAssetStatus, t: T): string {
  const map: Record<CompanyAssetStatus, string> = {
    ACTIVE: t.caStatusActive,
    NEEDS_REPAIR: t.caStatusNeedsRepair,
    UNDER_REPAIR: t.caStatusUnderRepair,
    WRITTEN_OFF: t.caStatusWrittenOff,
  };
  return map[status];
}

export function assetCategoryLabel(category: CompanyAssetCategory, t: T): string {
  const map: Record<CompanyAssetCategory, string> = {
    TRANSPORT: t.caCatTransport,
    OFFICE_EQUIPMENT: t.caCatOffice,
    COMPUTER_TECH: t.caCatComputer,
    PRODUCTION_EQUIPMENT: t.caCatProduction,
    TECH_APPARATUS: t.caCatTech,
    FURNITURE: t.caCatFurniture,
    OTHER: t.caCatOther,
  };
  return map[category];
}

export function assetConditionLabel(condition: CompanyAssetCondition, t: T): string {
  const map: Record<CompanyAssetCondition, string> = {
    NEW: t.caCondNew,
    GOOD: t.caCondGood,
    FAIR: t.caCondFair,
    POOR: t.caCondPoor,
  };
  return map[condition];
}

export function assetActionLabel(action: CompanyAssetActionType, t: T): string {
  const map: Record<CompanyAssetActionType, string> = {
    CREATED: t.caActCreated,
    UPDATED: t.caActUpdated,
    ASSIGNED: t.caActAssigned,
    RETURNED: t.caActReturned,
    SENT_TO_REPAIR: t.caActRepair,
    WRITTEN_OFF: t.caActWrittenOff,
    DELETED: t.caActDeleted,
  };
  return map[action];
}

export const ASSET_STATUSES: CompanyAssetStatus[] = [
  'ACTIVE',
  'NEEDS_REPAIR',
  'UNDER_REPAIR',
  'WRITTEN_OFF',
];

export const ASSET_CATEGORIES: CompanyAssetCategory[] = [
  'TRANSPORT',
  'OFFICE_EQUIPMENT',
  'COMPUTER_TECH',
  'PRODUCTION_EQUIPMENT',
  'TECH_APPARATUS',
  'FURNITURE',
  'OTHER',
];

export const ASSET_CONDITIONS: CompanyAssetCondition[] = [
  'NEW',
  'GOOD',
  'FAIR',
  'POOR',
];

export function statusBadgeClass(status: CompanyAssetStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'NEEDS_REPAIR':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300';
    case 'UNDER_REPAIR':
      return 'bg-sky-100 text-sky-900 dark:bg-sky-900/30 dark:text-sky-300';
    case 'WRITTEN_OFF':
      return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
