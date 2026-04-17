import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useApp } from '../i18n/app-context';
import { Language } from '../i18n/translations';
import { toLocalDateString } from '../utils/format';

// ─── Localized data ───────────────────────────────────────────────────────────
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
const TODAY_BTN: Record<Language, string> = {
  uz_cyrillic: 'Бугун',
  uz_latin:    'Bugun',
  ru:          'Сегодня',
};
const CLOSE_BTN: Record<Language, string> = {
  uz_cyrillic: 'Ёпиш',
  uz_latin:    'Yopish',
  ru:          'Закрыть',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

interface Cell { dateStr: string; day: number; isCurrentMonth: boolean }

function buildCells(year: number, month: number): Cell[] {
  const firstDow = ((new Date(year, month, 1).getDay() + 6) % 7);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const [py, pm] = month === 0 ? [year - 1, 11] : [year, month - 1];
    cells.push({ dateStr: toDateStr(py, pm, d), day: d, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ dateStr: toDateStr(year, month, d), day: d, isCurrentMonth: true });
  }
  let nd = 1;
  while (cells.length < 42) {
    const [ny, nm] = month === 11 ? [year + 1, 0] : [year, month + 1];
    cells.push({ dateStr: toDateStr(ny, nm, nd++), day: nd - 1, isCurrentMonth: false });
  }
  return cells;
}

function fmtDisplay(dateStr: string, lang: Language): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const monthName = MONTH_NAMES[lang][parseInt(m) - 1];
  return `${parseInt(d)} ${monthName} ${y}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface SingleDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export function SingleDatePicker({ value, onChange, placeholder }: SingleDatePickerProps) {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value) return parseInt(value.split('-')[0]);
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return parseInt(value.split('-')[1]) - 1;
    return new Date().getMonth();
  });

  const ref = useRef<HTMLDivElement>(null);
  const maxDateStr = toLocalDateString(new Date());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (dateStr: string) => {
    if (dateStr > maxDateStr) return;
    onChange(dateStr);
    setOpen(false);
  };

  const handleToday = () => {
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    onChange(maxDateStr);
    setOpen(false);
  };

  const now = new Date();
  const atOrBeyondCurrentMonth =
    viewYear > now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth >= now.getMonth());

  const cells = buildCells(viewYear, viewMonth);
  const dayHeaders = DAY_HEADERS[lang];
  const monthLabel = `${MONTH_NAMES[lang][viewMonth]} ${viewYear}`;
  const displayValue = value ? fmtDisplay(value, lang) : (placeholder || '');

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-sm border transition-all select-none text-left ${
          value
            ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-500 text-slate-800 dark:text-white'
            : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500'
        }`}
      >
        <Calendar size={15} className={value ? 'text-indigo-500 flex-shrink-0' : 'text-slate-400 flex-shrink-0'} />
        <span className="flex-1 truncate">{displayValue}</span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 transition-transform text-slate-400 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-300/40 dark:shadow-black/50 overflow-hidden">

          {/* Calendar */}
          <div className="p-3">
            {/* Month/Year header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-slate-800 dark:text-white text-sm font-semibold select-none">
                {monthLabel}
              </span>
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
                const isSelected = cell.dateStr === value;

                let innerClass = `w-7 h-7 flex items-center justify-center rounded-full text-xs transition-all ${
                  isFuture ? 'cursor-not-allowed' : 'cursor-pointer'
                } `;

                if (isSelected) {
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
                    className="h-8 flex items-center justify-center"
                    onClick={() => { if (!isFuture) handleDayClick(cell.dateStr); }}
                  >
                    <div className={innerClass}>{cell.day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-medium"
            >
              {CLOSE_BTN[lang]}
            </button>
            <button
              type="button"
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
