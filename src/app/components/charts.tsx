import React, { useRef, useState, useEffect, useCallback } from 'react';

// ── helpers ──────────────────────────────────────────────────────────────────
function useWidth(ref: React.RefObject<HTMLDivElement>): number {
  const [w, setW] = useState(300);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.offsetWidth);
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return w;
}

function niceMax(v: number): number {
  if (v <= 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / mag) * mag;
}

function fmtTick(v: number): string {
  if (v === 0) return '0';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace('.0', '') + 'k';
  return v.toFixed(0);
}

const DARK_TOOLTIP = { bg: '#1e293b', border: '#334155', text: '#f1f5f9' };
const PAD = { top: 18, right: 14, bottom: 30, left: 46 };
const GRID_LINES = 4;

// ── Tooltip ───────────────────────────────────────────────────────────────────
function SvgTooltip({ x, y, lines, iW }: { x: number; y: number; lines: string[]; iW: number }) {
  const charW = 6.5;
  const lH = 15;
  const pw = 8;
  const tw = Math.max(...lines.map(l => l.length * charW)) + pw * 2;
  const th = lines.length * lH + 10;
  const tx = Math.min(Math.max(x - tw / 2, 2), iW - tw - 2);
  const ty = Math.max(y - th - 6, 2);
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={tx} y={ty} width={tw} height={th} rx={6}
        fill={DARK_TOOLTIP.bg} stroke={DARK_TOOLTIP.border} strokeWidth={0.8} />
      {lines.map((l, i) => (
        <text key={i} x={tx + pw} y={ty + 14 + i * lH} fill={DARK_TOOLTIP.text} fontSize={10}>{l}</text>
      ))}
    </g>
  );
}

// ── SimpleBarChart ────────────────────────────────────────────────────────────
export interface BarSeries { dataKey: string; name: string; color: string }

interface BarChartProps {
  data: Record<string, any>[];
  series: BarSeries[];
  height?: number;
  formatValue?: (v: number) => string;
}

export function SimpleBarChart({ data, series, height = 220, formatValue }: BarChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const w = useWidth(ref);
  const [tipIdx, setTipIdx] = useState<number | null>(null);

  const iW = Math.max(w - PAD.left - PAD.right, 1);
  const iH = height - PAD.top - PAD.bottom;

  const maxVal = niceMax(Math.max(1, ...data.flatMap(d => series.map(s => Number(d[s.dataKey]) || 0))));
  const scaleY = (v: number) => iH * (1 - Math.min(v / maxVal, 1));

  const slotW = iW / Math.max(data.length, 1);
  const groupPad = slotW * 0.14;
  const groupW = slotW - groupPad * 2;
  const barW = Math.max((groupW / series.length) - 1.5, 2);

  return (
    <div ref={ref} className="w-full">
      <svg width={w} height={height} overflow="visible">
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Grid lines & Y labels */}
          {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
            const val = (maxVal / GRID_LINES) * i;
            const y = scaleY(val);
            return (
              <g key={`gy-${i}`}>
                <line x1={0} x2={iW} y1={y} y2={y}
                  stroke="#e2e8f0" strokeWidth={i === 0 ? 1 : 0.7} strokeDasharray={i === 0 ? '' : '4 3'} />
                <text x={-5} y={y + 3.5} textAnchor="end" fill="#94a3b8" fontSize={9.5}>{fmtTick(val)}</text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, di) => {
            const gx = di * slotW + groupPad;
            return (
              <g key={`g-${di}`}
                onMouseEnter={() => setTipIdx(di)}
                onMouseLeave={() => setTipIdx(null)}>
                {series.map((s, si) => {
                  const val = Number(d[s.dataKey]) || 0;
                  const bH = Math.max((val / maxVal) * iH, 0);
                  return (
                    <rect key={`b-${si}`}
                      x={gx + si * (barW + 1.5)}
                      y={iH - bH}
                      width={barW}
                      height={bH}
                      fill={s.color}
                      rx={2.5}
                      className="cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                    />
                  );
                })}
                {/* X label */}
                <text x={gx + groupW / 2} y={iH + 19} textAnchor="middle" fill="#94a3b8" fontSize={9.5}>
                  {d.date}
                </text>
              </g>
            );
          })}

          {/* Tooltip */}
          {tipIdx !== null && (() => {
            const d = data[tipIdx];
            const gx = tipIdx * slotW + groupPad + groupW / 2;
            const minY = Math.min(...series.map(s => scaleY(Number(d[s.dataKey]) || 0)));
            const lines = series.map(s => {
              const v = Number(d[s.dataKey]) || 0;
              return `${s.name}: ${formatValue ? formatValue(v) : fmtTick(v)}`;
            });
            return <SvgTooltip x={gx} y={minY} lines={lines} iW={iW} />;
          })()}
        </g>
      </svg>
    </div>
  );
}

// ── SimpleAreaChart ───────────────────────────────────────────────────────────
export interface AreaSeries { dataKey: string; name: string; color: string; gradId: string }

interface AreaChartProps {
  data: Record<string, any>[];
  series: AreaSeries[];
  height?: number;
  formatValue?: (v: number) => string;
}

export function SimpleAreaChart({ data, series, height = 220, formatValue }: AreaChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const w = useWidth(ref);
  const [tipIdx, setTipIdx] = useState<number | null>(null);

  const iW = Math.max(w - PAD.left - PAD.right, 1);
  const iH = height - PAD.top - PAD.bottom;
  const n = Math.max(data.length - 1, 1);

  const maxVal = niceMax(Math.max(1, ...data.flatMap(d => series.map(s => Number(d[s.dataKey]) || 0))));
  const scaleY = (v: number) => iH * (1 - Math.min(v / maxVal, 1));
  const scaleX = (i: number) => (i / n) * iW;

  const buildPath = (dataKey: string) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)},${scaleY(Number(d[dataKey]) || 0).toFixed(1)}`).join(' ');

  const buildArea = (dataKey: string) =>
    `${buildPath(dataKey)} L ${scaleX(data.length - 1).toFixed(1)},${iH} L ${scaleX(0).toFixed(1)},${iH} Z`;

  return (
    <div ref={ref} className="w-full">
      <svg width={w} height={height} overflow="visible">
        <defs>
          {series.map(s => (
            <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.22} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Grid */}
          {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
            const val = (maxVal / GRID_LINES) * i;
            const y = scaleY(val);
            return (
              <g key={`gy-${i}`}>
                <line x1={0} x2={iW} y1={y} y2={y}
                  stroke="#e2e8f0" strokeWidth={i === 0 ? 1 : 0.7} strokeDasharray={i === 0 ? '' : '4 3'} />
                <text x={-5} y={y + 3.5} textAnchor="end" fill="#94a3b8" fontSize={9.5}>{fmtTick(val)}</text>
              </g>
            );
          })}

          {/* Areas then Lines */}
          {series.map(s => (
            <path key={`area-${s.gradId}`} d={buildArea(s.dataKey)} fill={`url(#${s.gradId})`} />
          ))}
          {series.map(s => (
            <path key={`line-${s.gradId}`} d={buildPath(s.dataKey)} fill="none"
              stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}

          {/* X labels & hover zones */}
          {data.map((d, i) => (
            <g key={`xg-${i}`}>
              <rect x={scaleX(i) - slotHalfWidth(i, n, iW)} y={0}
                width={slotHalfWidth(i, n, iW) * 2} height={iH}
                fill="transparent"
                onMouseEnter={() => setTipIdx(i)}
                onMouseLeave={() => setTipIdx(null)}
              />
              <text x={scaleX(i)} y={iH + 19} textAnchor="middle" fill="#94a3b8" fontSize={9.5}>{d.date}</text>
            </g>
          ))}

          {/* Dots on hover */}
          {tipIdx !== null && series.map(s => {
            const v = Number(data[tipIdx][s.dataKey]) || 0;
            return (
              <circle key={`dot-${s.gradId}`} cx={scaleX(tipIdx)} cy={scaleY(v)} r={4}
                fill={s.color} stroke="white" strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
            );
          })}

          {/* Tooltip */}
          {tipIdx !== null && (() => {
            const d = data[tipIdx];
            const minY = Math.min(...series.map(s => scaleY(Number(d[s.dataKey]) || 0)));
            const lines = series.map(s => {
              const v = Number(d[s.dataKey]) || 0;
              return `${s.name}: ${formatValue ? formatValue(v) : fmtTick(v)}`;
            });
            return <SvgTooltip x={scaleX(tipIdx)} y={minY} lines={lines} iW={iW} />;
          })()}
        </g>
      </svg>
    </div>
  );
}

function slotHalfWidth(i: number, n: number, iW: number) {
  const slotW = iW / Math.max(n, 1);
  return slotW / 2;
}

// ── SimpleLineChart ───────────────────────────────────────────────────────────
interface LineChartProps {
  data: Record<string, any>[];
  dataKey: string;
  name?: string;
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
  formatYTick?: (v: number) => string;
}

export function SimpleLineChart({ data, dataKey, name, color = '#10b981', height = 220, formatValue, formatYTick }: LineChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const w = useWidth(ref);
  const [tipIdx, setTipIdx] = useState<number | null>(null);

  const iW = Math.max(w - PAD.left - PAD.right, 1);
  const iH = height - PAD.top - PAD.bottom;
  const n = Math.max(data.length - 1, 1);

  const vals = data.map(d => Number(d[dataKey]) || 0);
  const maxVal = niceMax(Math.max(1, ...vals));
  const scaleY = (v: number) => iH * (1 - Math.min(v / maxVal, 1));
  const scaleX = (i: number) => (i / n) * iW;

  const pathD = data.length < 2 ? '' :
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ');
  const areaD = data.length < 2 ? '' :
    `${pathD} L ${scaleX(n).toFixed(1)},${iH} L 0,${iH} Z`;

  return (
    <div ref={ref} className="w-full">
      <svg width={w} height={height} overflow="visible">
        <defs>
          <linearGradient id={`lg-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
            const val = (maxVal / GRID_LINES) * i;
            const y = scaleY(val);
            return (
              <g key={`gy-${i}`}>
                <line x1={0} x2={iW} y1={y} y2={y}
                  stroke="#e2e8f0" strokeWidth={i === 0 ? 1 : 0.7} strokeDasharray={i === 0 ? '' : '4 3'} />
                <text x={-5} y={y + 3.5} textAnchor="end" fill="#94a3b8" fontSize={9.5}>
                  {formatYTick ? formatYTick(val) : fmtTick(val)}
                </text>
              </g>
            );
          })}

          {areaD && <path d={areaD} fill={`url(#lg-${dataKey})`} />}
          {pathD && <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}

          {vals.map((v, i) => (
            <g key={`pt-${i}`}>
              <rect x={scaleX(i) - iW / n / 2} y={0} width={iW / n} height={iH}
                fill="transparent"
                onMouseEnter={() => setTipIdx(i)}
                onMouseLeave={() => setTipIdx(null)} />
              <text x={scaleX(i)} y={iH + 19} textAnchor="middle" fill="#94a3b8" fontSize={9.5}>{data[i].date}</text>
            </g>
          ))}

          {tipIdx !== null && (
            <circle cx={scaleX(tipIdx)} cy={scaleY(vals[tipIdx])} r={5}
              fill={color} stroke="white" strokeWidth={2} style={{ pointerEvents: 'none' }} />
          )}

          {tipIdx !== null && (() => {
            const v = vals[tipIdx];
            const label = `${name || dataKey}: ${formatValue ? formatValue(v) : fmtTick(v)}`;
            return <SvgTooltip x={scaleX(tipIdx)} y={scaleY(v)} lines={[label]} iW={iW} />;
          })()}
        </g>
      </svg>
    </div>
  );
}

// ── SimpleDonutChart ──────────────────────────────────────────────────────────
interface DonutProps {
  data: { name: string; value: number }[];
  colors: string[];
  size?: number;
}

function arc(cx: number, cy: number, r: number, a1: number, a2: number) {
  const toXY = (a: number) => ({
    x: cx + r * Math.cos(((a - 90) * Math.PI) / 180),
    y: cy + r * Math.sin(((a - 90) * Math.PI) / 180),
  });
  const s = toXY(a1); const e = toXY(a2);
  const lg = a2 - a1 > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${lg} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

/** Xarajatlar: kategoriya ulushi — gorizontal ustunlar (nom + foiz) */
export interface CategoryExpenseBarRow {
  name: string;
  value: number;
  color: string;
}

export function CategoryExpenseHorizontalBars({
  items,
  formatValue,
  total,
}: {
  items: CategoryExpenseBarRow[];
  formatValue: (n: number) => string;
  total: number;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      {items.map((row, i) => {
        const pct = total > 0 ? (row.value / total) * 100 : 0;
        return (
          <div key={`${row.name}-${i}`} className="space-y-1.5">
            <div className="flex justify-between gap-3 text-xs">
              <span
                className="truncate font-medium text-slate-700 dark:text-slate-200 min-w-0"
                title={row.name}
              >
                {row.name}
              </span>
              <span className="shrink-0 text-slate-500 dark:text-slate-400 tabular-nums">
                {formatValue(row.value)} · {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${Math.min(100, pct)}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SimpleDonutChart({ data, colors, size = 140 }: DonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2, cy = size / 2;
  const oR = size * 0.46, iR = size * 0.285;
  const gap = 2;

  let cur = 0;
  const slices = data.map((d, i) => {
    const sweep = total > 0 ? (d.value / total) * (360 - data.length * gap) : 0;
    const s = cur; const e = cur + sweep;
    cur = e + gap;
    return { ...d, s, e, color: colors[i % colors.length] };
  });

  return (
    <svg width={size} height={size}>
      {slices.map((sl, i) => {
        if (sl.e - sl.s < 0.5) return null;
        const toXY = (a: number, r: number) => ({
          x: cx + r * Math.cos(((a - 90) * Math.PI) / 180),
          y: cy + r * Math.sin(((a - 90) * Math.PI) / 180),
        });
        const o1 = toXY(sl.s, oR); const o2 = toXY(sl.e, oR);
        const i1 = toXY(sl.s, iR); const i2 = toXY(sl.e, iR);
        const lg = sl.e - sl.s > 180 ? 1 : 0;
        const d = [
          `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
          `A ${oR} ${oR} 0 ${lg} 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)}`,
          `L ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,
          `A ${iR} ${iR} 0 ${lg} 0 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
          'Z',
        ].join(' ');
        return <path key={i} d={d} fill={sl.color} className="hover:opacity-80 transition-opacity cursor-pointer" />;
      })}
    </svg>
  );
}
