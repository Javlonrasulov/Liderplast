export type CompanyAssetStatus =
  | 'ACTIVE'
  | 'NEEDS_REPAIR'
  | 'UNDER_REPAIR'
  | 'WRITTEN_OFF';

export type CompanyAssetCategory =
  | 'TRANSPORT'
  | 'OFFICE_EQUIPMENT'
  | 'COMPUTER_TECH'
  | 'PRODUCTION_EQUIPMENT'
  | 'TECH_APPARATUS'
  | 'FURNITURE'
  | 'OTHER';

export type CompanyAssetCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR';

export type CompanyAssetActionType =
  | 'CREATED'
  | 'UPDATED'
  | 'ASSIGNED'
  | 'RETURNED'
  | 'SENT_TO_REPAIR'
  | 'WRITTEN_OFF'
  | 'DELETED';

export type AssetCurrency = 'UZS' | 'USD' | 'EUR';

export interface CompanyAssetUser {
  id: string;
  fullName: string;
  position?: string | null;
}

export interface CompanyAssetListItem {
  id: string;
  inventoryNumber: string;
  name: string;
  category: CompanyAssetCategory;
  manufacturer?: string | null;
  model?: string | null;
  assignedUser?: CompanyAssetUser | null;
  location?: string | null;
  purchasedAt: string;
  purchasePriceOriginal?: number;
  currency?: AssetCurrency;
  fxRateToUzs?: number;
  initialValueUzs: number;
  condition: CompanyAssetCondition;
  status: CompanyAssetStatus;
  notes?: string | null;
}

export interface CompanyAssetDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface CompanyAssetActivityLog {
  id: string;
  actionType: CompanyAssetActionType;
  details?: string | null;
  performedAt: string;
  performedBy?: CompanyAssetUser | null;
}

export interface CompanyAssetDetail extends CompanyAssetListItem {
  createdBy?: CompanyAssetUser | null;
  updatedBy?: CompanyAssetUser | null;
  deletedBy?: CompanyAssetUser | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isDeleted?: boolean;
  serialNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  purchasePriceOriginal: number;
  currency: AssetCurrency;
  fxRateToUzs: number;
  warrantyUntil?: string | null;
  imageUrl?: string | null;
  documents: CompanyAssetDocument[];
  activityLogs: CompanyAssetActivityLog[];
  expense?: {
    id: string;
    title: string;
    amount: number;
    description?: string | null;
    incurredAt: string;
  } | null;
}

export interface CompanyAssetStats {
  total: number;
  active: number;
  writtenOff: number;
  totalValueUzs: number;
}

export interface CompanyAssetListResponse {
  items: CompanyAssetListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
