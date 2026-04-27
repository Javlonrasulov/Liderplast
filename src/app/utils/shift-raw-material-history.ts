import type { Machine, ShiftRecord } from '../store/erp-store';

const EPS = 1e-4;

export type ShiftRawMaterialHistoryDetail = {
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
  /** (delta / expected) * 100 */
  overPct: number;
};

export type ShiftRawMaterialHistoryAggregate = {
  key: string;
  productType: string;
  rawMaterialName: string;
  rawMaterialId: string;
  totalExpectedKg: number;
  totalActualKg: number;
  totalDeltaKg: number;
  caseCount: number;
  maxOverPct: number;
};

/** Qolip smenalari: `ShiftMaterialUsage` bo‘yicha barcha siro yozuvlari (reja / haqiqiy / farq) */
export function buildShiftRawMaterialHistory(
  shiftRecords: ShiftRecord[],
  machines: Machine[],
): { details: ShiftRawMaterialHistoryDetail[]; aggregates: ShiftRawMaterialHistoryAggregate[] } {
  const machineById = new Map(machines.map((m) => [m.id, m]));
  const details: ShiftRawMaterialHistoryDetail[] = [];

  for (const s of shiftRecords) {
    const mach = machineById.get(s.machineId);
    if (mach?.type !== 'semi') continue;
    const usages = s.materialUsages ?? [];
    if (usages.length === 0) continue;

    for (const u of usages) {
      const overPct =
        u.expectedKg > EPS ? ((u.actualKg - u.expectedKg) / u.expectedKg) * 100 : 0;
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

  details.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const aggMap = new Map<
    string,
    {
      productType: string;
      rawMaterialName: string;
      rawMaterialId: string;
      totalExpectedKg: number;
      totalActualKg: number;
      totalDeltaKg: number;
      caseCount: number;
      maxOverPct: number;
    }
  >();

  for (const d of details) {
    const key = `${d.productType.trim().toLowerCase()}::${d.rawMaterialId}`;
    const cur = aggMap.get(key);
    const pctForMax = d.deltaKg > EPS && d.expectedKg > EPS ? d.overPct : 0;
    if (!cur) {
      aggMap.set(key, {
        productType: d.productType,
        rawMaterialName: d.rawMaterialName,
        rawMaterialId: d.rawMaterialId,
        totalExpectedKg: d.expectedKg,
        totalActualKg: d.actualKg,
        totalDeltaKg: d.deltaKg,
        caseCount: 1,
        maxOverPct: pctForMax,
      });
    } else {
      cur.totalExpectedKg += d.expectedKg;
      cur.totalActualKg += d.actualKg;
      cur.totalDeltaKg += d.deltaKg;
      cur.caseCount += 1;
      cur.maxOverPct = Math.max(cur.maxOverPct, pctForMax);
    }
  }

  const aggregates: ShiftRawMaterialHistoryAggregate[] = Array.from(aggMap.entries()).map(
    ([key, v]) => ({
      key,
      productType: v.productType,
      rawMaterialName: v.rawMaterialName,
      rawMaterialId: v.rawMaterialId,
      totalExpectedKg: v.totalExpectedKg,
      totalActualKg: v.totalActualKg,
      totalDeltaKg: v.totalDeltaKg,
      caseCount: v.caseCount,
      maxOverPct: v.maxOverPct,
    }),
  );
  aggregates.sort((a, b) => Math.abs(b.totalDeltaKg) - Math.abs(a.totalDeltaKg));

  return { details, aggregates };
}
