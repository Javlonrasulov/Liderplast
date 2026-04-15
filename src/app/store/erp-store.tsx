import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { apiRequest } from '../api/http';
import { getErpApiLoadPlan } from '../api/erp-load-policy';
import { useAuth } from '../auth/auth-context';
import type { SessionUser } from '../auth/auth-context';
import type { AppPermissionKey } from '../auth/permission-keys';

export interface RawMaterialEntry {
  id: string;
  date: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  description: string;
  createdAt: string;
}

export interface RawMaterialBagSession {
  id: string;
  connectedAt: string;
  disconnectedAt?: string;
  isActive: boolean;
  machineId?: string;
  machineName?: string;
}

export interface RawMaterialBagWriteoff {
  id: string;
  initialQuantityKg: number;
  remainingQuantityKg: number;
  connectedAt?: string;
  disconnectedAt?: string;
  writtenOffAt: string;
  reason?: string;
}

export interface RawMaterialBag {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  name: string;
  initialQuantityKg: number;
  currentQuantityKg: number;
  status: 'IN_STORAGE' | 'CONNECTED' | 'DEPLETED' | 'WRITTEN_OFF';
  createdAt: string;
  updatedAt: string;
  sessions: RawMaterialBagSession[];
  writeoffs: RawMaterialBagWriteoff[];
}

export interface BagLog {
  id: string;
  bagId: string;
  rawMaterialId: string;
  rawMaterialName: string;
  bagName: string;
  actionType:
    | 'CREATED'
    | 'CONNECTED'
    | 'DISCONNECTED'
    | 'RETURNED_TO_STORAGE'
    | 'CONSUMED'
    | 'DEPLETED'
    | 'WRITTEN_OFF';
  quantityKg?: number;
  note: string;
  createdAt: string;
  createdByName?: string;
}

export interface SemiProductBatch {
  id: string;
  date: string;
  productType: '18g' | '20g';
  weight: number;
  quantity: number;
  rawMaterialUsed: number;
  machineId: string;
  createdAt: string;
}

export interface FinalProductBatch {
  id: string;
  date: string;
  productType: '0.5L' | '1L' | '5L';
  quantity: number;
  semiProductUsed: number;
  semiProductType: '18g' | '20g';
  createdAt: string;
}

export type WarehouseItemType =
  | 'RAW_MATERIAL'
  | 'SEMI_PRODUCT'
  | 'FINISHED_PRODUCT';

export interface WarehouseAuditActor {
  id: string;
  fullName: string;
  role: string;
}

export interface WarehouseProductAudit {
  createdAt?: string | null;
  createdBy?: WarehouseAuditActor | null;
  updatedAt?: string | null;
  updatedBy?: WarehouseAuditActor | null;
  deletedAt?: string | null;
  deletedBy?: WarehouseAuditActor | null;
}

interface WarehouseProductBase {
  id: string;
  itemType: WarehouseItemType;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  audit?: WarehouseProductAudit;
}

export interface RawMaterialProduct extends WarehouseProductBase {
  itemType: 'RAW_MATERIAL';
  unit: string;
}

export interface SemiProductCatalogItem extends WarehouseProductBase {
  itemType: 'SEMI_PRODUCT';
  weightGram: number;
  rawMaterials: Array<{
    rawMaterialId: string;
    rawMaterialName: string;
    rawMaterialUnit: string;
    amountGram: number;
  }>;
}

export interface FinishedProductCatalogItem extends WarehouseProductBase {
  itemType: 'FINISHED_PRODUCT';
  volumeLiter: number;
  semiProducts: Array<{
    semiProductId: string;
    semiProductName: string;
    weightGram: number;
  }>;
  machines: Array<{
    machineId: string;
    machineName: string;
    stage: 'SEMI' | 'FINISHED';
    isActive: boolean;
  }>;
}

export type WarehouseProduct =
  | RawMaterialProduct
  | SemiProductCatalogItem
  | FinishedProductCatalogItem;

export interface Client {
  id: string;
  name: string;
  phone: string;
  debt: number;
  createdAt: string;
  bankAccount?: string;
  bankName?: string;
}

export interface SaleOrderItem {
  productCategory: 'semi' | 'final';
  productType: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  productCategory: 'semi' | 'final';
  productType: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  paid: number;
  createdAt: string;
  items?: SaleOrderItem[];
}

export interface Expense {
  id: string;
  date: string;
  type: 'electricity' | 'caps' | 'packaging' | 'other';
  amount: number;
  description: string;
  machineId?: string;
  hours?: number;
  powerKw?: number;
  createdAt: string;
}

export interface Machine {
  id: string;
  name: string;
  description: string;
  type: 'semi' | 'final';
  maxCapacityPerHour: number;
  powerKw: number;
  isActive: boolean;
}

export interface OperationLog {
  id: string;
  timestamp: string;
  type:
    | 'raw_material_in'
    | 'raw_material_out'
    | 'semi_production'
    | 'final_production'
    | 'sale'
    | 'expense'
    | 'adjustment'
    | 'shift';
  description: string;
  amount?: number;
  unit?: string;
}

export interface ShiftRecord {
  id: string;
  date: string;
  shift: number;
  workerName: string;
  machineId: string;
  hoursWorked: number;
  productType: string;
  machineReading: string;
  producedQty: number;
  defectCount: number;
  electricityKwh: number;
  notes: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  fullName: string;
  position: string;
  cardNumber: string;
  phone?: string;
  /** Asosiy smena (1–20), backend User.preferredShiftNumber */
  preferredShiftNumber?: number | null;
  salaryType: 'fixed' | 'per_piece' | 'hybrid';
  salaryAmount: number;
  createdAt: string;
}

export interface EmployeeProduction {
  id: string;
  employeeId: string;
  date: string;
  productType: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
}

export interface SalaryRow {
  id: string;
  employeeId: string;
  month: string;
  workedDays: number;
  producedQuantity: number;
  productionAmount: number;
  aklad: number;
  bonus: number;
  incomeTax: number;
  nps: number;
  socialTax: number;
  totalSalary: number;
  netSalary: number;
  status: 'paid' | 'unpaid';
  createdAt: string;
}

export interface PayrollSettings {
  incomeTaxPercent: number;
  npsPercent: number;
  socialTaxPercent: number;
}

export interface ERPState {
  rawMaterialEntries: RawMaterialEntry[];
  rawMaterialBags: RawMaterialBag[];
  activeRawMaterialBag: RawMaterialBag | null;
  bagLogs: BagLog[];
  warehouseProducts: WarehouseProduct[];
  semiProductBatches: SemiProductBatch[];
  finalProductBatches: FinalProductBatch[];
  clients: Client[];
  sales: Sale[];
  expenses: Expense[];
  machines: Machine[];
  logs: OperationLog[];
  electricityPrice: number;
  shiftRecords: ShiftRecord[];
  workers: string[];
  employees: Employee[];
  employeeProductions: EmployeeProduction[];
  salaryVedomost: SalaryRow[];
  payrollSettings: PayrollSettings;
  payments: Payment[];
}

type ERPAction =
  | { type: 'ADD_RAW_MATERIAL'; payload: { amount: number; description: string; date: string } }
  | {
      type: 'ADD_WAREHOUSE_PRODUCT';
      payload: {
        itemType: WarehouseItemType;
        name: string;
        description?: string;
        unit?: string;
        weightGram?: number;
        volumeLiter?: number;
        rawMaterials?: Array<{
          rawMaterialId: string;
          amountGram: number;
        }>;
        semiProductIds?: string[];
        machineIds?: string[];
      };
    }
  | {
      type: 'UPDATE_WAREHOUSE_PRODUCT';
      payload: {
        id: string;
        currentItemType: WarehouseItemType;
        itemType: WarehouseItemType;
        name?: string;
        description?: string;
        unit?: string;
        weightGram?: number;
        volumeLiter?: number;
        rawMaterials?: Array<{
          rawMaterialId: string;
          amountGram: number;
        }>;
        semiProductIds?: string[];
        machineIds?: string[];
      };
    }
  | {
      type: 'DELETE_WAREHOUSE_PRODUCT';
      payload: {
        id: string;
        itemType: WarehouseItemType;
      };
    }
  | {
      type: 'CREATE_RAW_MATERIAL_BAG';
      payload: { rawMaterialId: string; name?: string; initialQuantityKg: number };
    }
  | {
      type: 'CONNECT_RAW_MATERIAL_BAG';
      payload: { bagId: string; machineId?: string };
    }
  | {
      type: 'SWITCH_RAW_MATERIAL_BAG';
      payload: {
        nextBagId: string;
        previousBagAction: 'RETURN_TO_STORAGE' | 'WRITE_OFF';
        reason?: string;
        machineId?: string;
      };
    }
  | {
      type: 'WRITE_OFF_RAW_MATERIAL_BAG';
      payload: { bagId: string; reason?: string };
    }
  | {
      type: 'QUICK_CONSUME_RAW_MATERIAL_BAG';
      payload: {
        rawMaterialId?: string;
        quantityKg?: number;
        pieceCount?: number;
        gramPerUnit?: number;
        note?: string;
      };
    }
  | { type: 'PRODUCE_SEMI'; payload: { productType: '18g' | '20g'; quantity: number; machineId: string; date: string } }
  | { type: 'PRODUCE_FINAL'; payload: { productType: '0.5L' | '1L' | '5L'; quantity: number; semiProductType: '18g' | '20g'; date: string } }
  | { type: 'ADD_SALE'; payload: { clientId: string; clientName: string; productCategory: 'semi' | 'final'; productType: string; quantity: number; pricePerUnit: number; paid: number; date: string } }
  | { type: 'ADD_SALE_ORDER'; payload: { clientId: string; clientName: string; date: string; items: SaleOrderItem[]; paid: number } }
  | { type: 'ADD_EXPENSE'; payload: { type: 'electricity' | 'caps' | 'packaging' | 'other'; amount: number; description: string; machineId?: string; hours?: number; powerKw?: number; date: string } }
  | { type: 'ADD_CLIENT'; payload: { name: string; phone: string; bankAccount?: string; bankName?: string } }
  | { type: 'SET_ELECTRICITY_PRICE'; payload: number }
  | { type: 'ADD_SHIFT_RECORD'; payload: Omit<ShiftRecord, 'id' | 'createdAt'> }
  | {
      type: 'UPDATE_SHIFT_RECORD';
      payload: {
        id: string;
        date?: string;
        shift?: number;
        workerName?: string;
        machineId?: string;
        hoursWorked?: number;
        productType?: string;
        machineReading?: string;
        producedQty?: number;
        defectCount?: number;
        electricityKwh?: number;
        notes?: string;
      };
    }
  | { type: 'DELETE_SHIFT_RECORD'; payload: string }
  | {
      type: 'ADD_WORKER';
      payload: {
        fullName: string;
        preferredShiftNumber?: number | null;
        position?: string;
        cardNumber?: string;
        phone?: string;
      };
    }
  | {
      type: 'UPDATE_WORKER';
      payload: {
        id: string;
        fullName?: string;
        phone?: string;
        position?: string;
        cardNumber?: string;
        preferredShiftNumber?: number | null;
      };
    }
  | { type: 'DELETE_WORKER'; payload: string }
  | { type: 'ADD_MACHINE'; payload: { name: string; description: string; powerKw: number; maxCapacityPerHour: number; type: 'semi' | 'final' } }
  | { type: 'DELETE_MACHINE'; payload: string }
  | { type: 'TOGGLE_MACHINE'; payload: string }
  | { type: 'ADD_EMPLOYEE'; payload: Omit<Employee, 'id' | 'createdAt'> }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'ADD_EMPLOYEE_PRODUCTION'; payload: Omit<EmployeeProduction, 'id'> }
  | { type: 'DELETE_EMPLOYEE_PRODUCTION'; payload: string }
  | { type: 'GENERATE_VEDOMOST'; payload: { month: string } }
  | { type: 'UPDATE_SALARY_ROW'; payload: { id: string; bonus?: number; workedDays?: number } }
  | { type: 'SET_SALARY_STATUS'; payload: { id: string; status: 'paid' | 'unpaid' } }
  | { type: 'UPDATE_PAYROLL_SETTINGS'; payload: Partial<PayrollSettings> }
  | { type: 'ADD_PAYMENT'; payload: Omit<Payment, 'id' | 'createdAt'> }
  | { type: 'DELETE_PAYMENT'; payload: string }
  | { type: 'SET_MONTH_STATUS'; payload: { month: string; status: 'paid' | 'unpaid' } };

interface ERPContextValue {
  state: ERPState;
  dispatch: (action: ERPAction) => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string;
  rawMaterialStock: number;
  semiProductStock: Record<'18g' | '20g', number>;
  finalProductStock: Record<'0.5L' | '1L' | '5L', number>;
}

const emptyState: ERPState = {
  rawMaterialEntries: [],
  rawMaterialBags: [],
  activeRawMaterialBag: null,
  bagLogs: [],
  warehouseProducts: [],
  semiProductBatches: [],
  finalProductBatches: [],
  clients: [],
  sales: [],
  expenses: [],
  machines: [],
  logs: [],
  electricityPrice: 800,
  shiftRecords: [],
  workers: [],
  employees: [],
  employeeProductions: [],
  salaryVedomost: [],
  payrollSettings: {
    incomeTaxPercent: 12,
    npsPercent: 0,
    socialTaxPercent: 0,
  },
  payments: [],
};

const ERPContext = createContext<ERPContextValue | null>(null);

type CatalogResponse = {
  rawMaterials: Array<{
    id: string;
    name: string;
    unit: string;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
    audit?: WarehouseProductAudit;
  }>;
  semiProducts: Array<{
    id: string;
    name: string;
    weightGram: number;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
    rawMaterials: Array<{
      rawMaterialId: string;
      amountGram: number;
      rawMaterial: {
        id: string;
        name: string;
        unit: string;
      };
    }>;
    audit?: WarehouseProductAudit;
  }>;
  finishedProducts: Array<{
    id: string;
    name: string;
    volumeLiter: number;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
    semiProducts: Array<{
      semiProductId: string;
      semiProduct: {
        id: string;
        name: string;
        weightGram: number;
      };
    }>;
    machines: Array<{
      machineId: string;
      machine: {
        id: string;
        name: string;
        stage: 'SEMI' | 'FINISHED';
        isActive: boolean;
      };
    }>;
    audit?: WarehouseProductAudit;
  }>;
};

type WarehouseStockItem = {
  id: string;
  itemType: 'RAW_MATERIAL' | 'SEMI_PRODUCT' | 'FINISHED_PRODUCT';
  quantity: number;
  status: string;
  itemName?: string;
};

type WarehouseHistoryItem = {
  id: string;
  itemType: 'RAW_MATERIAL' | 'SEMI_PRODUCT' | 'FINISHED_PRODUCT';
  movementType: 'INCOMING' | 'CONSUMPTION' | 'PRODUCTION_OUTPUT' | 'ADJUSTMENT';
  quantity: number;
  note?: string | null;
  createdAt: string;
  rawMaterial?: { id: string; name: string } | null;
  semiProduct?: { id: string; name: string } | null;
  finishedProduct?: { id: string; name: string } | null;
};

type BackendBagSession = {
  id: string;
  connectedAt: string;
  disconnectedAt?: string | null;
  isActive: boolean;
  machineId?: string | null;
  machine?: { id: string; name: string } | null;
};

type BackendBagWriteoff = {
  id: string;
  initialQuantityKg: number;
  remainingQuantityKg: number;
  connectedAt?: string | null;
  disconnectedAt?: string | null;
  writtenOffAt: string;
  reason?: string | null;
};

type BackendRawMaterialBag = {
  id: string;
  rawMaterialId: string;
  name?: string | null;
  initialQuantityKg: number;
  currentQuantityKg: number;
  status: RawMaterialBag['status'];
  createdAt: string;
  updatedAt: string;
  rawMaterial: { id: string; name: string };
  sessions: BackendBagSession[];
  writeoffs?: BackendBagWriteoff[];
};

type BackendBagLog = {
  id: string;
  bagId: string;
  rawMaterialId: string;
  actionType: BagLog['actionType'];
  quantityKg?: number | null;
  note?: string | null;
  createdAt: string;
  bag: {
    id: string;
    name?: string | null;
    rawMaterial: { id: string; name: string };
  };
  rawMaterial: { id: string; name: string };
  createdBy?: { fullName: string } | null;
};

type BackendMachine = {
  id: string;
  name: string;
  description?: string | null;
  powerKw: number;
  maxCapacityPerHour: number;
  stage: 'SEMI' | 'FINISHED';
  isActive: boolean;
};

type BackendShiftRecord = {
  id: string;
  date: string;
  shiftNumber: number;
  producedQty: number;
  defectCount: number;
  electricityKwh: number;
  hoursWorked: number;
  productLabel?: string | null;
  machineReading?: string | null;
  notes?: string | null;
  createdAt: string;
  worker: { fullName: string };
  machine?: { id: string } | null;
};

type BackendProductionRecord = {
  id: string;
  stage: 'SEMI' | 'FINISHED';
  quantityProduced: number;
  timestamp: string;
  createdAt: string;
  machineId?: string | null;
  outputSemiProduct?: { id: string; name: string; weightGram: number } | null;
  outputFinishedProduct?: { id: string; name: string } | null;
  consumptions: Array<{
    quantity: number;
    rawMaterial?: { id: string; name: string } | null;
    semiProduct?: { id: string; name: string } | null;
  }>;
};

type BackendClient = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  bankAccount?: string | null;
  bankName?: string | null;
  orders?: Array<{ debtAmount: number }>;
};

type BackendOrder = {
  id: string;
  clientId: string;
  createdAt: string;
  totalAmount: number;
  paidAmount: number;
  items: Array<{
    productType: 'SEMI_PRODUCT' | 'FINISHED_PRODUCT';
    quantity: number;
    price: number;
    total: number;
    semiProduct?: { id: string; name: string } | null;
    finishedProduct?: { id: string; name: string } | null;
  }>;
  client: { name: string };
};

type BackendPayment = {
  id: string;
  clientId: string;
  amount: number;
  description?: string | null;
  paidAt: string;
  createdAt: string;
  client: { name: string };
};

type BackendExpense = {
  id: string;
  type: 'ELECTRICITY' | 'CAPS' | 'PACKAGING' | 'OTHER';
  amount: number;
  title: string;
  description?: string | null;
  incurredAt: string;
  createdAt: string;
};

type BackendUser = {
  id: string;
  fullName: string;
  position?: string | null;
  cardNumber?: string | null;
  phone: string;
  login?: string | null;
  customRoleLabel?: string | null;
  permissions?: string[];
  canLogin?: boolean;
  role: 'ADMIN' | 'DIRECTOR' | 'ACCOUNTANT' | 'MANAGER' | 'WORKER';
  salaryType: 'FIXED' | 'PER_PRODUCT' | 'HYBRID';
  salaryRate: number;
  preferredShiftNumber?: number | null;
  createdAt: string;
};

type BackendEmployeeProduction = {
  id: string;
  workerId: string;
  productLabel: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  producedAt: string;
};

type BackendSalarySettings = {
  incomeTaxPercent: number;
  npsPercent: number;
  socialTaxPercent: number;
} | null;

type BackendSalaryRow = {
  id: string;
  workerId: string;
  month: string;
  workedDays: number;
  producedQuantity: number;
  productionAmount: number;
  aklad: number;
  bonus: number;
  incomeTax: number;
  nps: number;
  socialTax: number;
  brutto: number;
  netto: number;
  isPaid: boolean;
  createdAt: string;
};

function normalizeSemiType(name?: string | null): '18g' | '20g' {
  return name?.includes('20') ? '20g' : '18g';
}

function normalizeFinalType(name?: string | null): '0.5L' | '1L' | '5L' {
  if (name?.includes('5')) return '5L';
  if (name?.includes('1L') || name === '1L') return '1L';
  return '0.5L';
}

function normalizeSalaryType(
  salaryType: BackendUser['salaryType'],
): Employee['salaryType'] {
  if (salaryType === 'PER_PRODUCT') return 'per_piece';
  if (salaryType === 'HYBRID') return 'hybrid';
  return 'fixed';
}

function computeDebt(client: BackendClient) {
  return (client.orders ?? []).reduce((sum, order) => sum + order.debtAmount, 0);
}

function mapBag(item: BackendRawMaterialBag): RawMaterialBag {
  return {
    id: item.id,
    rawMaterialId: item.rawMaterialId,
    rawMaterialName: item.rawMaterial.name,
    name: item.name?.trim() || `${item.rawMaterial.name} #${item.id.slice(-4)}`,
    initialQuantityKg: item.initialQuantityKg,
    currentQuantityKg: item.currentQuantityKg,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    sessions: (item.sessions ?? []).map((session) => ({
      id: session.id,
      connectedAt: session.connectedAt,
      disconnectedAt: session.disconnectedAt ?? undefined,
      isActive: session.isActive,
      machineId: session.machineId ?? undefined,
      machineName: session.machine?.name ?? undefined,
    })),
    writeoffs: (item.writeoffs ?? []).map((writeoff) => ({
      id: writeoff.id,
      initialQuantityKg: writeoff.initialQuantityKg,
      remainingQuantityKg: writeoff.remainingQuantityKg,
      connectedAt: writeoff.connectedAt ?? undefined,
      disconnectedAt: writeoff.disconnectedAt ?? undefined,
      writtenOffAt: writeoff.writtenOffAt,
      reason: writeoff.reason ?? undefined,
    })),
  };
}

export function computeRawMaterialStock(entries: RawMaterialEntry[]): number {
  return entries.reduce(
    (sum, entry) => (entry.type === 'incoming' ? sum + entry.amount : sum - entry.amount),
    0,
  );
}

export function computeSemiProductStock(
  batches: SemiProductBatch[],
  finalBatches: FinalProductBatch[],
  sales: Sale[],
): Record<'18g' | '20g', number> {
  const stock: Record<'18g' | '20g', number> = { '18g': 0, '20g': 0 };
  for (const batch of batches) stock[batch.productType] += batch.quantity;
  for (const batch of finalBatches) stock[batch.semiProductType] -= batch.semiProductUsed;
  for (const sale of sales) {
    if (sale.items?.length) {
      for (const item of sale.items) {
        if (item.productCategory === 'semi') {
          stock[item.productType as '18g' | '20g'] -= item.quantity;
        }
      }
    } else if (sale.productCategory === 'semi') {
      stock[sale.productType as '18g' | '20g'] -= sale.quantity;
    }
  }
  return stock;
}

export function computeFinalProductStock(
  batches: FinalProductBatch[],
  sales: Sale[],
): Record<'0.5L' | '1L' | '5L', number> {
  const stock: Record<'0.5L' | '1L' | '5L', number> = {
    '0.5L': 0,
    '1L': 0,
    '5L': 0,
  };
  for (const batch of batches) stock[batch.productType] += batch.quantity;
  for (const sale of sales) {
    if (sale.items?.length) {
      for (const item of sale.items) {
        if (item.productCategory === 'final') {
          stock[item.productType as '0.5L' | '1L' | '5L'] -= item.quantity;
        }
      }
    } else if (sale.productCategory === 'final') {
      stock[sale.productType as '0.5L' | '1L' | '5L'] -= sale.quantity;
    }
  }
  return stock;
}

function buildLogs(
  rawEntries: RawMaterialEntry[],
  productions: BackendProductionRecord[],
  sales: Sale[],
  expenses: Expense[],
  shifts: ShiftRecord[],
): OperationLog[] {
  const logs: OperationLog[] = [];

  rawEntries.forEach((entry) => {
    logs.push({
      id: `raw-${entry.id}`,
      timestamp: entry.createdAt,
      type: entry.type === 'incoming' ? 'raw_material_in' : 'raw_material_out',
      description: entry.description,
      amount: entry.amount,
      unit: 'kg',
    });
  });

  productions.forEach((item) => {
    logs.push({
      id: `prod-${item.id}`,
      timestamp: item.createdAt,
      type: item.stage === 'SEMI' ? 'semi_production' : 'final_production',
      description:
        item.stage === 'SEMI'
          ? `${item.quantityProduced.toLocaleString()} dona ${item.outputSemiProduct?.name ?? 'qolip'} ishlab chiqarildi`
          : `${item.quantityProduced.toLocaleString()} dona ${item.outputFinishedProduct?.name ?? 'bakalashka'} ishlab chiqarildi`,
      amount: item.quantityProduced,
      unit: 'dona',
    });
  });

  sales.forEach((sale) => {
    logs.push({
      id: `sale-${sale.id}`,
      timestamp: sale.createdAt,
      type: 'sale',
      description: `Sotuv: ${sale.clientName} — ${sale.productType}`,
      amount: sale.total,
      unit: "so'm",
    });
  });

  expenses.forEach((expense) => {
    logs.push({
      id: `expense-${expense.id}`,
      timestamp: expense.createdAt,
      type: 'expense',
      description: expense.description,
      amount: expense.amount,
      unit: "so'm",
    });
  });

  shifts.forEach((shift) => {
    logs.push({
      id: `shift-${shift.id}`,
      timestamp: shift.createdAt,
      type: 'shift',
      description: `${shift.workerName} — ${shift.shift}-smena`,
      amount: shift.producedQty,
      unit: 'dona',
    });
  });

  return logs.sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

type LookupMap = {
  rawByName: Map<string, string>;
  semiByName: Map<string, string>;
  finalByName: Map<string, string>;
  usersByName: Map<string, string>;
};

const EMPTY_CATALOG: CatalogResponse = {
  rawMaterials: [],
  semiProducts: [],
  finishedProducts: [],
};

async function loadStateFromApi(
  user: SessionUser,
  hasPermission: (key: AppPermissionKey) => boolean,
) {
  const plan = getErpApiLoadPlan(user, hasPermission);

  const [
    catalog,
    stock,
    history,
    bags,
    activeBag,
    bagLogs,
    productions,
    machines,
    shifts,
    clients,
    orders,
    payments,
    expenses,
    users,
    employeeProductions,
    salarySettings,
    salaryRows,
  ] = await Promise.all([
    plan.warehouseCatalog
      ? apiRequest<CatalogResponse>('/warehouse/catalog')
      : Promise.resolve(EMPTY_CATALOG),
    plan.warehouseStock
      ? apiRequest<WarehouseStockItem[]>('/warehouse/stock')
      : Promise.resolve([]),
    plan.warehouseHistory
      ? apiRequest<WarehouseHistoryItem[]>('/warehouse/history')
      : Promise.resolve([]),
    plan.rawMaterialBags
      ? apiRequest<BackendRawMaterialBag[]>('/raw-material-bags')
      : Promise.resolve([]),
    plan.rawMaterialBags
      ? apiRequest<BackendRawMaterialBag | null>('/raw-material-bags/active')
      : Promise.resolve(null),
    plan.rawMaterialBags
      ? apiRequest<BackendBagLog[]>('/raw-material-bags/logs')
      : Promise.resolve([]),
    plan.production
      ? apiRequest<BackendProductionRecord[]>('/production')
      : Promise.resolve([]),
    plan.machines
      ? apiRequest<BackendMachine[]>('/production/machines')
      : Promise.resolve([]),
    plan.shifts
      ? apiRequest<BackendShiftRecord[]>('/production/shifts')
      : Promise.resolve([]),
    plan.clients ? apiRequest<BackendClient[]>('/clients') : Promise.resolve([]),
    plan.orders ? apiRequest<BackendOrder[]>('/orders') : Promise.resolve([]),
    plan.payments ? apiRequest<BackendPayment[]>('/payments') : Promise.resolve([]),
    plan.expenses
      ? apiRequest<BackendExpense[]>('/finance/expenses')
      : Promise.resolve([]),
    plan.users ? apiRequest<BackendUser[]>('/users') : Promise.resolve([]),
    plan.employeeProductions
      ? apiRequest<BackendEmployeeProduction[]>('/finance/employee-productions')
      : Promise.resolve([]),
    plan.salarySettings
      ? apiRequest<BackendSalarySettings>('/finance/salary-settings')
      : Promise.resolve(null),
    plan.salaryRows
      ? apiRequest<BackendSalaryRow[]>('/finance/salary')
      : Promise.resolve([]),
  ]);

  const rawHistoryEntries: RawMaterialEntry[] = history
    .filter((item) => item.itemType === 'RAW_MATERIAL')
    .map((item) => ({
      id: item.id,
      date: item.createdAt.slice(0, 10),
      type: item.movementType === 'INCOMING' ? 'incoming' : 'outgoing',
      amount: item.quantity,
      description: item.note || item.rawMaterial?.name || 'Warehouse movement',
      createdAt: item.createdAt,
    }));

  const rawMaterialEntries: RawMaterialEntry[] =
    rawHistoryEntries.length > 0
      ? rawHistoryEntries
      : stock
          .filter((item) => item.itemType === 'RAW_MATERIAL' && item.quantity > 0)
          .map((item) => ({
            id: `stock-${item.id}`,
            date: new Date().toISOString().slice(0, 10),
            type: 'incoming',
            amount: item.quantity,
            description: item.itemName ?? 'Warehouse stock',
            createdAt: new Date().toISOString(),
          }));

  const rawMaterialBags = bags.map(mapBag);
  const mappedActiveBag = activeBag ? mapBag(activeBag) : null;
  const mappedBagLogs: BagLog[] = bagLogs.map((item) => ({
    id: item.id,
    bagId: item.bagId,
    rawMaterialId: item.rawMaterialId,
    rawMaterialName: item.rawMaterial.name,
    bagName:
      item.bag.name?.trim() || `${item.rawMaterial.name} #${item.bag.id.slice(-4)}`,
    actionType: item.actionType,
    quantityKg: item.quantityKg ?? undefined,
    note: item.note ?? '',
    createdAt: item.createdAt,
    createdByName: item.createdBy?.fullName ?? undefined,
  }));

  const warehouseProducts: WarehouseProduct[] = [
    ...catalog.rawMaterials.map((item) => ({
      id: item.id,
      itemType: 'RAW_MATERIAL' as const,
      name: item.name,
      unit: item.unit,
      description: item.description ?? undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      audit: item.audit,
    })),
    ...catalog.semiProducts.map((item) => ({
      id: item.id,
      itemType: 'SEMI_PRODUCT' as const,
      name: item.name,
      weightGram: item.weightGram,
      description: item.description ?? undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      rawMaterials: item.rawMaterials.map((relation) => ({
        rawMaterialId: relation.rawMaterialId,
        rawMaterialName: relation.rawMaterial.name,
        rawMaterialUnit: relation.rawMaterial.unit,
        amountGram: relation.amountGram,
      })),
      audit: item.audit,
    })),
    ...catalog.finishedProducts.map((item) => ({
      id: item.id,
      itemType: 'FINISHED_PRODUCT' as const,
      name: item.name,
      volumeLiter: item.volumeLiter,
      description: item.description ?? undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      semiProducts: item.semiProducts.map((relation) => ({
        semiProductId: relation.semiProductId,
        semiProductName: relation.semiProduct.name,
        weightGram: relation.semiProduct.weightGram,
      })),
      machines: item.machines.map((relation) => ({
        machineId: relation.machineId,
        machineName: relation.machine.name,
        stage: relation.machine.stage,
        isActive: relation.machine.isActive,
      })),
      audit: item.audit,
    })),
  ];

  const semiProductBatches: SemiProductBatch[] = productions
    .filter((item) => item.stage === 'SEMI')
    .map((item) => ({
      id: item.id,
      date: item.timestamp.slice(0, 10),
      productType: normalizeSemiType(item.outputSemiProduct?.name),
      weight: item.outputSemiProduct?.weightGram ?? (normalizeSemiType(item.outputSemiProduct?.name) === '20g' ? 20 : 18),
      quantity: item.quantityProduced,
      rawMaterialUsed: item.consumptions.reduce((sum, current) => sum + current.quantity, 0),
      machineId: item.machineId ?? '',
      createdAt: item.createdAt,
    }));

  const finalProductBatches: FinalProductBatch[] = productions
    .filter((item) => item.stage === 'FINISHED')
    .map((item) => ({
      id: item.id,
      date: item.timestamp.slice(0, 10),
      productType: normalizeFinalType(item.outputFinishedProduct?.name),
      quantity: item.quantityProduced,
      semiProductUsed: item.consumptions.reduce((sum, current) => sum + current.quantity, 0),
      semiProductType: normalizeSemiType(item.consumptions[0]?.semiProduct?.name),
      createdAt: item.createdAt,
    }));

  const mappedClients: Client[] = clients.map((client) => ({
    id: client.id,
    name: client.name,
    phone: client.phone,
    debt: computeDebt(client),
    createdAt: client.createdAt,
    bankAccount: client.bankAccount ?? undefined,
    bankName: client.bankName ?? undefined,
  }));

  const sales: Sale[] = orders.map((order) => {
    const items: SaleOrderItem[] = order.items.map((item) => ({
      productCategory: item.productType === 'SEMI_PRODUCT' ? 'semi' : 'final',
      productType: item.semiProduct?.name ?? item.finishedProduct?.name ?? 'Mahsulot',
      quantity: item.quantity,
      pricePerUnit: item.price,
      total: item.total,
    }));

    return {
      id: order.id,
      date: order.createdAt.slice(0, 10),
      clientId: order.clientId,
      clientName: order.client.name,
      productCategory: items[0]?.productCategory ?? 'final',
      productType: items.length > 1 ? 'aralash' : items[0]?.productType ?? '',
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      pricePerUnit: items[0]?.pricePerUnit ?? 0,
      total: order.totalAmount,
      paid: order.paidAmount,
      createdAt: order.createdAt,
      items,
    };
  });

  const mappedPayments: Payment[] = payments.map((payment) => ({
    id: payment.id,
    clientId: payment.clientId,
    clientName: payment.client.name,
    date: payment.paidAt.slice(0, 10),
    amount: payment.amount,
    description: payment.description ?? 'To‘lov',
    createdAt: payment.createdAt,
  }));

  const mappedExpenses: Expense[] = expenses.map((expense) => ({
    id: expense.id,
    date: expense.incurredAt.slice(0, 10),
    type: expense.type.toLowerCase() as Expense['type'],
    amount: expense.amount,
    description: expense.description ?? expense.title,
    createdAt: expense.createdAt,
  }));

  const mappedMachines: Machine[] = machines.map((machine) => ({
    id: machine.id,
    name: machine.name,
    description: machine.description ?? '',
    type: machine.stage === 'SEMI' ? 'semi' : 'final',
    maxCapacityPerHour: machine.maxCapacityPerHour,
    powerKw: machine.powerKw,
    isActive: machine.isActive,
  }));

  const mappedShifts: ShiftRecord[] = shifts.map((shift) => ({
    id: shift.id,
    date: shift.date.slice(0, 10),
    shift: shift.shiftNumber,
    workerName: shift.worker.fullName,
    machineId: shift.machine?.id ?? '',
    hoursWorked: shift.hoursWorked,
    productType: shift.productLabel ?? '',
    machineReading: shift.machineReading ?? '',
    producedQty: shift.producedQty,
    defectCount: shift.defectCount,
    electricityKwh: shift.electricityKwh,
    notes: shift.notes ?? '',
    createdAt: shift.createdAt,
  }));

  const payrollUsers = users.filter((user) => user.role === 'WORKER');

  const employees: Employee[] = payrollUsers.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    position: user.position ?? '',
    cardNumber: user.cardNumber ?? '',
    phone: user.phone,
    preferredShiftNumber: user.preferredShiftNumber ?? null,
    salaryType: normalizeSalaryType(user.salaryType),
    salaryAmount: user.salaryRate,
    createdAt: user.createdAt,
  }));

  const employeeProductionsState: EmployeeProduction[] = employeeProductions.map((item) => ({
    id: item.id,
    employeeId: item.workerId,
    date: item.producedAt.slice(0, 10),
    productType: item.productLabel,
    quantity: item.quantity,
    pricePerUnit: item.rate,
    totalAmount: item.totalAmount,
  }));

  const salaryVedomost: SalaryRow[] = salaryRows.map((row) => ({
    id: row.id,
    employeeId: row.workerId,
    month: row.month,
    workedDays: row.workedDays,
    producedQuantity: row.producedQuantity,
    productionAmount: row.productionAmount,
    aklad: row.aklad,
    bonus: row.bonus,
    incomeTax: row.incomeTax,
    nps: row.nps,
    socialTax: row.socialTax,
    totalSalary: row.brutto,
    netSalary: row.netto,
    status: row.isPaid ? 'paid' : 'unpaid',
    createdAt: row.createdAt,
  }));

  const logs = buildLogs(rawMaterialEntries, productions, sales, mappedExpenses, mappedShifts);

  const lookups: LookupMap = {
    rawByName: new Map(catalog.rawMaterials.map((item) => [item.name, item.id])),
    semiByName: new Map(catalog.semiProducts.map((item) => [item.name, item.id])),
    finalByName: new Map(catalog.finishedProducts.map((item) => [item.name, item.id])),
    usersByName: new Map(payrollUsers.map((user) => [user.fullName, user.id])),
  };

  const state: ERPState = {
    rawMaterialEntries,
    rawMaterialBags,
    activeRawMaterialBag: mappedActiveBag,
    bagLogs: mappedBagLogs,
    warehouseProducts,
    semiProductBatches,
    finalProductBatches,
    clients: mappedClients,
    sales,
    expenses: mappedExpenses,
    machines: mappedMachines,
    logs,
    electricityPrice: 800,
    shiftRecords: mappedShifts,
    workers: Array.from(
      new Set([
        ...mappedShifts.map((item) => item.workerName),
        ...employees.map((e) => e.fullName),
      ]),
    ),
    employees,
    employeeProductions: employeeProductionsState,
    salaryVedomost,
    payrollSettings: salarySettings ?? emptyState.payrollSettings,
    payments: mappedPayments,
  };

  return { state, lookups };
}

export function ERPProvider({ children }: { children: ReactNode }) {
  const { user, hasPermission } = useAuth();
  const [state, setState] = useState<ERPState>(emptyState);
  const [lookups, setLookups] = useState<LookupMap>({
    rawByName: new Map(),
    semiByName: new Map(),
    finalByName: new Map(),
    usersByName: new Map(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const stateRef = useRef(state);
  const lookupsRef = useRef(lookups);
  stateRef.current = state;
  lookupsRef.current = lookups;

  const refresh = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const next = await loadStateFromApi(user, hasPermission);
      setState(next.state);
      setLookups(next.lookups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backend load failed');
    } finally {
      setIsLoading(false);
    }
  }, [user, hasPermission]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dispatch = useCallback(
    async (action: ERPAction) => {
      const lookups = lookupsRef.current;
      const state = stateRef.current;
      switch (action.type) {
        case 'ADD_RAW_MATERIAL': {
          const rawMaterialId =
            lookups.rawByName.values().next().value ??
            state.rawMaterialEntries[0]?.id;
          if (!rawMaterialId) break;
          await apiRequest('/warehouse/incoming', {
            method: 'POST',
            body: JSON.stringify({
              itemType: 'RAW_MATERIAL',
              rawMaterialId,
              quantity: action.payload.amount,
              note: action.payload.description,
            }),
          });
          break;
        }
        case 'ADD_WAREHOUSE_PRODUCT':
          await apiRequest('/warehouse/products', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          break;
        case 'UPDATE_WAREHOUSE_PRODUCT': {
          const { id, currentItemType, ...body } = action.payload;
          await apiRequest(`/warehouse/products/${currentItemType}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          });
          break;
        }
        case 'DELETE_WAREHOUSE_PRODUCT':
          await apiRequest(
            `/warehouse/products/${action.payload.itemType}/${action.payload.id}`,
            { method: 'DELETE' },
          );
          break;
        case 'CREATE_RAW_MATERIAL_BAG':
          await apiRequest('/raw-material-bags/create', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          break;
        case 'CONNECT_RAW_MATERIAL_BAG':
          await apiRequest('/raw-material-bags/connect', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          break;
        case 'SWITCH_RAW_MATERIAL_BAG':
          await apiRequest('/raw-material-bags/switch', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          break;
        case 'WRITE_OFF_RAW_MATERIAL_BAG':
          await apiRequest('/raw-material-bags/writeoff', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          break;
        case 'QUICK_CONSUME_RAW_MATERIAL_BAG':
          await apiRequest('/raw-material-bags/quick-consume', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          break;
        case 'ADD_CLIENT':
          await apiRequest('/clients', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          break;
        case 'ADD_SALE_ORDER':
          await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify({
              clientId: action.payload.clientId,
              paidAmount: action.payload.paid,
              items: action.payload.items.map((item) => ({
                productType:
                  item.productCategory === 'semi'
                    ? 'SEMI_PRODUCT'
                    : 'FINISHED_PRODUCT',
                semiProductId:
                  item.productCategory === 'semi'
                    ? lookups.semiByName.get(item.productType)
                    : undefined,
                finishedProductId:
                  item.productCategory === 'final'
                    ? lookups.finalByName.get(item.productType)
                    : undefined,
                quantity: item.quantity,
                price: item.pricePerUnit,
              })),
            }),
          });
          break;
        case 'ADD_EXPENSE':
          await apiRequest('/finance/expenses', {
            method: 'POST',
            body: JSON.stringify({
              title: action.payload.description,
              type: action.payload.type.toUpperCase(),
              amount: action.payload.amount,
              description: action.payload.description,
              incurredAt: action.payload.date,
            }),
          });
          break;
        case 'ADD_PAYMENT':
          await apiRequest('/payments', {
            method: 'POST',
            body: JSON.stringify({
              clientId: action.payload.clientId,
              amount: action.payload.amount,
              description: action.payload.description,
              paidAt: action.payload.date,
            }),
          });
          break;
        case 'DELETE_PAYMENT':
          await apiRequest(`/payments/${action.payload}`, {
            method: 'DELETE',
          });
          break;
        case 'ADD_MACHINE':
          await apiRequest('/production/machines', {
            method: 'POST',
            body: JSON.stringify({
              name: action.payload.name,
              description: action.payload.description,
              stage: action.payload.type === 'semi' ? 'SEMI' : 'FINISHED',
              powerKw: action.payload.powerKw,
              maxCapacityPerHour: action.payload.maxCapacityPerHour,
            }),
          });
          break;
        case 'DELETE_MACHINE':
          await apiRequest(`/production/machines/${action.payload}`, {
            method: 'DELETE',
          });
          break;
        case 'TOGGLE_MACHINE':
          await apiRequest(`/production/machines/${action.payload}/toggle`, {
            method: 'PATCH',
          });
          break;
        case 'ADD_EMPLOYEE': {
          const role = action.payload.position.toLowerCase().includes('bux')
            ? 'ACCOUNTANT'
            : 'WORKER';
          const phone = `+9989${Math.floor(Math.random() * 100000000)
            .toString()
            .padStart(8, '0')}`;
          await apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify({
              fullName: action.payload.fullName,
              position: action.payload.position,
              cardNumber: action.payload.cardNumber,
              phone,
              password: 'Worker123',
              role,
              salaryType:
                action.payload.salaryType === 'per_piece'
                  ? 'PER_PRODUCT'
                  : action.payload.salaryType === 'hybrid'
                    ? 'HYBRID'
                    : 'FIXED',
              salaryRate: action.payload.salaryAmount,
            }),
          });
          break;
        }
        case 'DELETE_EMPLOYEE':
          await apiRequest(`/users/${action.payload}`, {
            method: 'DELETE',
          });
          break;
        case 'ADD_EMPLOYEE_PRODUCTION':
          await apiRequest('/finance/employee-productions', {
            method: 'POST',
            body: JSON.stringify({
              workerId: action.payload.employeeId,
              productLabel: action.payload.productType,
              quantity: action.payload.quantity,
              rate: action.payload.pricePerUnit,
              producedAt: action.payload.date,
            }),
          });
          break;
        case 'GENERATE_VEDOMOST':
          await apiRequest('/finance/salary/generate', {
            method: 'POST',
            body: JSON.stringify({ month: action.payload.month }),
          });
          break;
        case 'UPDATE_SALARY_ROW':
          await apiRequest(`/finance/salary/${action.payload.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              bonus: action.payload.bonus,
              workedDays: action.payload.workedDays,
            }),
          });
          break;
        case 'SET_SALARY_STATUS':
          await apiRequest(`/finance/salary/${action.payload.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              isPaid: action.payload.status === 'paid',
            }),
          });
          break;
        case 'SET_MONTH_STATUS':
          await apiRequest('/finance/salary/month-status', {
            method: 'POST',
            body: JSON.stringify({
              month: action.payload.month,
              isPaid: action.payload.status === 'paid',
            }),
          });
          break;
        case 'UPDATE_PAYROLL_SETTINGS':
          await apiRequest('/finance/salary-settings', {
            method: 'PUT',
            body: JSON.stringify({
              incomeTaxPercent:
                action.payload.incomeTaxPercent ?? state.payrollSettings.incomeTaxPercent,
              npsPercent: action.payload.npsPercent ?? state.payrollSettings.npsPercent,
              socialTaxPercent:
                action.payload.socialTaxPercent ?? state.payrollSettings.socialTaxPercent,
              otherDeductionPercent: 0,
            }),
          });
          break;
        case 'ADD_SHIFT_RECORD': {
          const workerId = lookups.usersByName.get(action.payload.workerName);
          if (!workerId) break;
          await apiRequest('/production/shifts', {
            method: 'POST',
            body: JSON.stringify({
              workerId,
              machineId: action.payload.machineId,
              shiftNumber: action.payload.shift,
              date: action.payload.date,
              hoursWorked: action.payload.hoursWorked,
              productLabel: action.payload.productType,
              machineReading: action.payload.machineReading,
              producedQty: action.payload.producedQty,
              defectCount: action.payload.defectCount,
              electricityKwh: action.payload.electricityKwh,
              notes: action.payload.notes,
            }),
          });
          break;
        }
        case 'UPDATE_SHIFT_RECORD': {
          const p = action.payload;
          const body: Record<string, unknown> = {};
          if (p.date !== undefined) body.date = p.date;
          if (p.shift !== undefined) body.shiftNumber = p.shift;
          if (p.workerName !== undefined) {
            const wid = lookups.usersByName.get(p.workerName);
            if (wid) body.workerId = wid;
          }
          if (p.machineId !== undefined) body.machineId = p.machineId || null;
          if (p.hoursWorked !== undefined) body.hoursWorked = p.hoursWorked;
          if (p.productType !== undefined) body.productLabel = p.productType;
          if (p.machineReading !== undefined) body.machineReading = p.machineReading;
          if (p.producedQty !== undefined) body.producedQty = p.producedQty;
          if (p.defectCount !== undefined) body.defectCount = p.defectCount;
          if (p.electricityKwh !== undefined) body.electricityKwh = p.electricityKwh;
          if (p.notes !== undefined) body.notes = p.notes;
          if (Object.keys(body).length === 0) break;
          await apiRequest(`/production/shifts/${p.id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          });
          break;
        }
        case 'PRODUCE_SEMI': {
          const workerId =
            lookups.usersByName.get(state.workers[0] ?? '') ?? state.employees[0]?.id;
          const outputSemiProductId = lookups.semiByName.get(action.payload.productType);
          const rawMaterialId = lookups.rawByName.values().next().value;
          if (!workerId || !outputSemiProductId || !rawMaterialId) break;
          const rawMaterialUsed =
            action.payload.productType === '18g'
              ? (action.payload.quantity * 18) / 1000
              : (action.payload.quantity * 20) / 1000;
          await apiRequest('/production', {
            method: 'POST',
            body: JSON.stringify({
              stage: 'SEMI',
              workerId,
              machineId: action.payload.machineId,
              outputSemiProductId,
              quantityProduced: action.payload.quantity,
              timestamp: `${action.payload.date}T12:00:00.000Z`,
              consumptions: [
                {
                  itemType: 'RAW_MATERIAL',
                  rawMaterialId,
                  quantity: rawMaterialUsed,
                },
              ],
            }),
          });
          break;
        }
        case 'PRODUCE_FINAL': {
          const workerId =
            lookups.usersByName.get(state.workers[0] ?? '') ?? state.employees[0]?.id;
          const outputFinishedProductId = lookups.finalByName.get(action.payload.productType);
          const semiProductId = lookups.semiByName.get(action.payload.semiProductType);
          if (!workerId || !outputFinishedProductId || !semiProductId) break;
          await apiRequest('/production', {
            method: 'POST',
            body: JSON.stringify({
              stage: 'FINISHED',
              workerId,
              outputFinishedProductId,
              quantityProduced: action.payload.quantity,
              timestamp: `${action.payload.date}T12:00:00.000Z`,
              consumptions: [
                {
                  itemType: 'SEMI_PRODUCT',
                  semiProductId,
                  quantity: action.payload.quantity,
                },
              ],
            }),
          });
          break;
        }
        case 'ADD_SALE':
        case 'SET_ELECTRICITY_PRICE':
          break;
        case 'DELETE_SHIFT_RECORD':
          await apiRequest(`/production/shifts/${action.payload}`, {
            method: 'DELETE',
          });
          break;
        case 'ADD_WORKER': {
          const p = action.payload;
          const phone =
            p.phone?.trim() ||
            `+9989${Math.floor(Math.random() * 100000000)
              .toString()
              .padStart(8, '0')}`;
          const body: Record<string, unknown> = {
            fullName: p.fullName.trim(),
            phone,
            password: 'Worker123',
            role: 'WORKER',
            salaryType: 'PER_PRODUCT',
            salaryRate: 0,
          };
          if (p.position?.trim()) body.position = p.position.trim();
          if (p.cardNumber?.trim()) body.cardNumber = p.cardNumber.trim();
          if (p.preferredShiftNumber != null && p.preferredShiftNumber >= 1) {
            body.preferredShiftNumber = p.preferredShiftNumber;
          }
          await apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(body),
          });
          break;
        }
        case 'UPDATE_WORKER': {
          const u = action.payload;
          const body: Record<string, unknown> = {};
          if (u.fullName !== undefined) body.fullName = u.fullName.trim();
          if (u.phone !== undefined && u.phone.trim()) body.phone = u.phone.trim();
          if (u.position !== undefined) body.position = u.position.trim() || null;
          if (u.cardNumber !== undefined) body.cardNumber = u.cardNumber.trim() || null;
          if (u.preferredShiftNumber !== undefined) {
            body.preferredShiftNumber =
              u.preferredShiftNumber === null ? null : u.preferredShiftNumber;
          }
          if (Object.keys(body).length === 0) break;
          await apiRequest(`/users/${u.id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          });
          break;
        }
        case 'DELETE_WORKER': {
          await apiRequest(`/users/${action.payload}`, {
            method: 'DELETE',
          });
          break;
        }
        case 'DELETE_EMPLOYEE_PRODUCTION':
          await apiRequest(`/finance/employee-productions/${action.payload}`, {
            method: 'DELETE',
          });
          break;
        default:
          break;
      }

      await refresh();
    },
    [refresh],
  );

  const rawMaterialStock = useMemo(
    () => computeRawMaterialStock(state.rawMaterialEntries),
    [state.rawMaterialEntries],
  );

  const semiProductStock = useMemo(
    () =>
      computeSemiProductStock(
        state.semiProductBatches,
        state.finalProductBatches,
        state.sales,
      ),
    [state.semiProductBatches, state.finalProductBatches, state.sales],
  );

  const finalProductStock = useMemo(
    () => computeFinalProductStock(state.finalProductBatches, state.sales),
    [state.finalProductBatches, state.sales],
  );

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      refresh,
      isLoading,
      error,
      rawMaterialStock,
      semiProductStock,
      finalProductStock,
    }),
    [
      state,
      dispatch,
      refresh,
      isLoading,
      error,
      rawMaterialStock,
      semiProductStock,
      finalProductStock,
    ],
  );

  return (
    <ERPContext.Provider value={contextValue}>
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const ctx = useContext(ERPContext);
  if (!ctx) throw new Error('useERP must be used within ERPProvider');
  return ctx;
}
