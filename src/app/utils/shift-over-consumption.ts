import type { Machine, ShiftRecord } from '../store/erp-store';

const DELTA_EPS = 1e-4;

export type ShiftOverConsumptionDetail = {
  shiftId: string;
  createdAt: string;
  date: string;
  workerName: string;
  machineName: string;
  productType: string;
  producedQty: number;
  defectCount: number;
  rawMaterialName: string;
  rawMaterialId: string;
  expectedKg: number;
  actualKg: number;
  deltaKg: number;
  /** (delta / expected) * 100, expected kichik bo‘lsa 0 ga yaqin */
  overPct: number;
};

export type ShiftOverConsumptionAggregate = {
  key: string;
  productType: string;
  rawMaterialName: string;
  rawMaterialId: string;
  totalDeltaKg: number;
  totalExpectedKg: number;
  caseCount: number;
  maxOverPct: number;
};

export function buildShiftOverConsumptionReport(
  shiftRecords: ShiftRecord[],
  machines: Machine[],
): { details: ShiftOverConsumptionDetail[]; aggregates: ShiftOverConsumptionAggregate[] } {
  const machineById = new Map(machines.map((m) => [m.id, m]));
  const details: ShiftOverConsumptionDetail[] = [];

  for (const s of shiftRecords) {
    const mach = machineById.get(s.machineId);
    if (mach?.type !== 'semi') continue;
    for (const u of s.materialUsages ?? []) {
      if (u.deltaKg <= DELTA_EPS) continue;
      const overPct =
        u.expectedKg > DELTA_EPS ? (u.deltaKg / u.expectedKg) * 100 : 0;
      details.push({
        shiftId: s.id,
        createdAt: s.createdAt,
        date: s.date,
        workerName: s.workerName,
        machineName: mach.name,
        productType: s.productType,
        producedQty: s.producedQty,
        defectCount: s.defectCount,
        rawMaterialName: u.rawMaterialName ?? '—',
        rawMaterialId: u.rawMaterialId,
        expectedKg: u.expectedKg,
        actualKg: u.actualKg,
        deltaKg: u.deltaKg,
        overPct,
      });
    }
  }

  details.sort((a, b) => b.overPct - a.overPct || b.deltaKg - a.deltaKg);

  const aggMap = new Map<
    string,
    {
      productType: string;
      rawMaterialName: string;
      rawMaterialId: string;
      totalDeltaKg: number;
      totalExpectedKg: number;
      caseCount: number;
      maxOverPct: number;
    }
  >();

  for (const d of details) {
    const key = `${d.productType.trim().toLowerCase()}::${d.rawMaterialId}`;
    const cur = aggMap.get(key);
    if (!cur) {
      aggMap.set(key, {
        productType: d.productType,
        rawMaterialName: d.rawMaterialName,
        rawMaterialId: d.rawMaterialId,
        totalDeltaKg: d.deltaKg,
        totalExpectedKg: d.expectedKg,
        caseCount: 1,
        maxOverPct: d.overPct,
      });
    } else {
      cur.totalDeltaKg += d.deltaKg;
      cur.totalExpectedKg += d.expectedKg;
      cur.caseCount += 1;
      cur.maxOverPct = Math.max(cur.maxOverPct, d.overPct);
    }
  }

  const aggregates: ShiftOverConsumptionAggregate[] = Array.from(aggMap.entries()).map(
    ([key, v]) => ({
      key,
      productType: v.productType,
      rawMaterialName: v.rawMaterialName,
      rawMaterialId: v.rawMaterialId,
      totalDeltaKg: v.totalDeltaKg,
      totalExpectedKg: v.totalExpectedKg,
      caseCount: v.caseCount,
      maxOverPct: v.maxOverPct,
    }),
  );
  aggregates.sort((a, b) => b.totalDeltaKg - a.totalDeltaKg);

  return { details, aggregates };
}
