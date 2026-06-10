import type { AssetCurrency, CompanyAssetCategory, CompanyAssetStatus } from './types';

const DRAFT_KEY = 'erp_company_asset_create_draft_v1';

export type CompanyAssetFormState = {
  inventoryNumber: string;
  name: string;
  serialNumber: string;
  category: CompanyAssetCategory;
  manufacturer: string;
  model: string;
  purchasedAt: string;
  purchasePrice: string;
  currency: AssetCurrency;
  fxRateToUzs: string;
  warrantyUntil: string;
  assignedUserId: string;
  location: string;
  status: CompanyAssetStatus;
  notes: string;
};

export type CompanyAssetFormDraft = {
  form: CompanyAssetFormState;
  imageFileName: string | null;
  lastDocFileName: string | null;
  docFileNames: string[];
};

export function loadCompanyAssetFormDraft(): CompanyAssetFormDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CompanyAssetFormDraft;
    if (!parsed?.form || typeof parsed.form !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCompanyAssetFormDraft(draft: CompanyAssetFormDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota — ignore */
  }
}

export function clearCompanyAssetFormDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
