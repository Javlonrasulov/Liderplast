import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useApp, DatePreset } from '../i18n/app-context';
import { Language } from '../i18n/translations';
import { toLocalDateString } from '../utils/format';

// ─── Localized data ──────────────────────────────────────────────────────────
const DAY_HEADERS: Record<Language, string[]> = {
  uz_cyrillic: ['Дш', 'Се', 'Чо', 'Па', 'Жу', 'Ша', 'Як'],
  uz_latin:    ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  ru:          ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
};
const MONTH_NAMES: Record<Language, string[]> = {
  uz_cyrillic: ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентябр','Октябр','Ноябр','Декабр'],
  uz_latin:    ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
  ru:          ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
};
const CLEAR_BTN: Record<Language, string> = {
  uz_cyrillic: 'Тозалаш',
  uz_latin:    "O'chirish",
  ru:          'Удалить',
};
const TODAY_BTN: Record<Language, string> = {
  uz_cyrillic: 'Бугун',
  uz_latin:    'Bugun',
  ru:          'Сегодня',
};

// ─── Calendar helpers ─────────────────────────────────────────────────────────
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

interface Cell { dateStr: string; day: number; isCurrentMonth: boolean }

function buildCells(year: number, month: number): Cell[] {
  const firstDow = ((new Date(year, month, 1).getDay() + 6) % 7); // 0=Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];

  // prev month tail
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const [py, pm] = month === 0 ? [year - 1, 11] : [year, month - 1];
    cells.push({ dateStr: toDateStr(py, pm, d), day: d, isCurrentMonth: false });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ dateStr: toDateStr(year, month, d), day: d, isCurrentMonth: true });
  }
  // next month head — fill 6 rows
  let nd = 1;
  while (cells.length < 42) {
    const [ny, nm] = month === 11 ? [year + 1, 0] : [year, month + 1];
    cells.push({ dateStr: toDateStr(ny, nm, nd++), day: nd - 1, isCurrentMonth: false });
  }
  return cells;
}

function fmtShort(dateStr: string) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${d}.${m}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DateFilterPicker() {
  const { t, lang, dateFilter, setPreset, setCustomRange, filterLabel } = useApp();

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const now = new Date();
    return now.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  // range picking state
  const [pickPhase, setPickPhase] = useState<'idle' | 'end'>('idle');
  const [tempFrom, setTempFrom] = useState('');
  const [hoverDate, setHoverDate] = useState('');

  const ref = useRef<HTMLDivElement>(null);
  const maxDateStr = toLocalDateString(new Date());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPickPhase('idle');
        setHoverDate('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Derived range for display ──────────────────────────────────────────────
  const cappedTempFrom = tempFrom && tempFrom > maxDateStr ? maxDateStr : tempFrom;
  const cappedHover =
    hoverDate && hoverDate > maxDateStr ? maxDateStr : hoverDate;
  const rangeFrom = pickPhase === 'end' ? cappedTempFrom : dateFilter.from;
  const rangeTo = pickPhase === 'end' ? cappedHover : dateFilter.to;
  const [rangeStart, rangeEnd] = rangeFrom <= rangeTo
    ? [rangeFrom, rangeTo] : [rangeTo, rangeFrom];

  // ── Day click ─────────────────────────────────────────────────────────────
  const handleDayClick = (dateStr: string) => {
    if (dateStr > maxDateStr) return;
    if (pickPhase === 'idle') {
      setTempFrom(dateStr);
      setPickPhase('end');
    } else {
      const end = dateStr > maxDateStr ? maxDateStr : dateStr;
      const start = tempFrom > maxDateStr ? maxDateStr : tempFrom;
      const [a, b] = end >= start ? [start, end] : [end, start];
      setCustomRange(a, b);
      setPickPhase('idle');
      setHoverDate('');
      setOpen(false);
    }
  };

  // ── Preset click ──────────────────────────────────────────────────────────
  const handlePreset = (p: DatePreset) => {
    setPreset(p);
    setPickPhase('idle');
    setHoverDate('');
    setOpen(false);
  };

  const handleClear = () => {
    setPreset('all');
    setPickPhase('idle');
    setHoverDate('');
    setTempFrom('');
  };

  const handleToday = () => {
    setViewYear(new Date().getFullYear());
    setViewMonth(new Date().getMonth());
  };

  // ── Month navigation ──────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const now = new Date();
  const atOrBeyondCurrentMonth =
    viewYear > now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth >= now.getMonth());

  const cells = buildCells(viewYear, viewMonth);
  const dayHeaders = DAY_HEADERS[lang];
  const monthLabel = `${MONTH_NAMES[lang][viewMonth]} ${viewYear}`;
  const isFiltered = dateFilter.preset !== 'all';

  const PRESETS: { key: DatePreset; label: string }[] = [
    { key: 'today', label: t.dfToday },
    { key: 'week',  label: t.dfWeek  },
    { key: 'month', label: t.dfMonth },
    { key: 'all',   label: t.dfAll   },
  ];

  // Trigger label
  let triggerLabel = filterLabel;
  if (isFiltered && dateFilter.from && dateFilter.to && dateFilter.from !== dateFilter.to) {
    triggerLabel = `${fmtShort(dateFilter.from)} — ${fmtShort(dateFilter.to)}.${dateFilter.to.split('-')[0]}`;
  } else if (isFiltered && dateFilter.from === dateFilter.to && dateFilter.from) {
    triggerLabel = fmtShort(dateFilter.from) + `.${dateFilter.from.split('-')[0]}`;
  }

  return (
    <div className="relative" ref={ref}>
      {/* ── Trigger button ── */}
      <button
        onClick={() => { setOpen(o => !o); setPickPhase('idle'); }}
        className={`flex shrink-0 items-center gap-1.5 sm:gap-2 h-9 px-2.5 sm:px-3.5 rounded-xl text-sm border transition-all select-none ${
          isFiltered
            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'
        }`}
      >
        <Calendar size={15} className={isFiltered ? 'text-indigo-500' : 'text-slate-400'} />
        <span className="hidden sm:block max-w-[160px] truncate font-medium">{triggerLabel}</span>
        {isFiltered ? (
          <X
            size={13}
            className="text-indigo-400 hover:text-indigo-600 ml-0.5"
            onClick={e => { e.stopPropagation(); handleClear(); }}
          />
        ) : (
          <ChevronDown size={13} className="text-slate-400" />
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-300/40 dark:shadow-black/40 overflow-hidden">

          {/* Preset section */}
          <div className="p-3 pb-2">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2.5 px-1">
              {t.dfTitle}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.key}
                  onClick={() => handlePreset(p.key)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                    dateFilter.preset === p.key && pickPhase === 'idle'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Calendar section */}
          <div className="p-3">
            {/* Month/Year header */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-slate-800 dark:text-white text-sm font-semibold select-none">{monthLabel}</span>
              <button
                type="button"
                disabled={atOrBeyondCurrentMonth}
                onClick={() => { if (!atOrBeyondCurrentMonth) nextMonth(); }}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-colors ${
                  atOrBeyondCurrentMonth
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {dayHeaders.map(d => (
                <div key={d} className="h-7 flex items-center justify-center text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {cells.map((cell) => {
                const isFuture = cell.dateStr > maxDateStr;
                const isToday = cell.dateStr === maxDateStr;
                const isStart       = cell.dateStr === rangeStart && (rangeStart !== '' );
                const isEnd         = cell.dateStr === rangeEnd   && (rangeEnd !== '');
                const isSingle      = isStart && isEnd;
                const isInRange     = !isSingle && rangeStart && rangeEnd && cell.dateStr > rangeStart && cell.dateStr < rangeEnd;
                const isRangeEdge   = isStart || isEnd;
                const isStartEdge   = isStart && !isSingle;
                const isEndEdge     = isEnd && !isSingle;

                let cellClass = `relative h-8 w-full flex items-center justify-center text-xs transition-colors select-none ${
                  isFuture ? 'cursor-not-allowed' : 'cursor-pointer'
                } `;
                let innerClass = 'relative z-10 w-7 h-7 flex items-center justify-center rounded-full transition-all ';

                // Range band background
                if (isInRange) {
                  cellClass += 'bg-indigo-50 dark:bg-indigo-900/20 ';
                }
                if (isStartEdge) {
                  cellClass += 'bg-gradient-to-r from-transparent to-indigo-50 dark:to-indigo-900/20 ';
                }
                if (isEndEdge) {
                  cellClass += 'bg-gradient-to-l from-transparent to-indigo-50 dark:to-indigo-900/20 ';
                }

                // Inner circle
                if (isRangeEdge || isSingle) {
                  innerClass += 'bg-indigo-600 text-white shadow-md shadow-indigo-300/40 dark:shadow-indigo-900/40 ';
                } else if (isFuture) {
                  innerClass += 'text-slate-300 dark:text-slate-600 opacity-40 ';
                } else if (isToday) {
                  innerClass += 'border-2 border-indigo-400 text-indigo-600 dark:text-indigo-400 ';
                } else if (cell.isCurrentMonth) {
                  innerClass += 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 ';
                } else {
                  innerClass += 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 ';
                }

                return (
                  <div
                    key={cell.dateStr}
                    className={cellClass}
                    onClick={() => { if (!isFuture) handleDayClick(cell.dateStr); }}
                    onMouseEnter={() => {
                      if (pickPhase !== 'end') return;
                      setHoverDate(cell.dateStr > maxDateStr ? maxDateStr : cell.dateStr);
                    }}
                    onMouseLeave={() => pickPhase === 'end' && setHoverDate('')}
                  >
                    <div className={innerClass}>{cell.day}</div>
                  </div>
                );
              })}
            </div>

            {/* Picking hint */}
            {pickPhase === 'end' && (
              <p className="text-indigo-500 dark:text-indigo-400 text-[11px] text-center mt-2 animate-pulse">
                {t.dfTo}... →
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleClear}
              className="text-sm text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
            >
              {CLEAR_BTN[lang]}
            </button>
            <button
              onClick={handleToday}
              className="text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
            >
              {TODAY_BTN[lang]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
