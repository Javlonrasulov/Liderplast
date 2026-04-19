import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Language, T, translations } from './translations';
import { TODAY, parseYmdLocal, toLocalDateString } from '../utils/format';

// ======================== DATE FILTER ========================

export type DatePreset = 'today' | 'week' | 'month' | 'all' | 'custom';

export interface DateFilter {
  preset: DatePreset;
  from: string;
  to: string;
}

function getPresetRange(preset: DatePreset): { from: string; to: string } {
  const anchor = parseYmdLocal(TODAY) ?? new Date();

  if (preset === 'today') {
    return { from: TODAY, to: TODAY };
  }

  if (preset === 'week') {
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const from = toLocalDateString(monday);
    const to = toLocalDateString(sunday);
    /** Hafta/oy — to‘liq kalendar oralig‘i; kelajak sanali xarajatlar ham ko‘rinsin (masalan qop chiqimi). */
    if (from > TODAY) return { from: TODAY, to: TODAY };
    return { from, to };
  }

  if (preset === 'month') {
    const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return {
      from: toLocalDateString(firstDay),
      to: toLocalDateString(lastDay),
    };
  }

  // 'all' and 'custom' default
  return { from: '', to: '' };
}

export function filterByDateRange<T extends { date: string }>(
  items: T[],
  filter: DateFilter
): T[] {
  if (filter.preset === 'all' || (!filter.from && !filter.to)) return items;
  return items.filter(item => {
    if (filter.from && item.date < filter.from) return false;
    if (filter.to && item.date > filter.to) return false;
    return true;
  });
}

// ======================== FONT SIZE ========================

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: '13px',
  md: '15px',
  lg: '17px',
  xl: '19px',
};

/** Eski bundle yoki qisman deployda kalitlar bo‘lmasa, tugmalar bo‘sh qolmasin */
const RAW_MATERIAL_FALLBACK: Pick<
  T,
  | 'rmKindLabel'
  | 'rmKindSiro'
  | 'rmKindPaint'
  | 'rmPaintHint'
  | 'rmCreatePaintButton'
  | 'rmPendingExternalOrdersTitle'
> = {
  rmKindLabel: 'Хомашё тури',
  rmKindSiro: 'PET сиро / оддий хомашё',
  rmKindPaint: 'Краска / бўёқ',
  rmPaintHint:
    'Турни «краска» деб белгиланг — сменада фақат шу турдаги позициялар танланади.',
  rmCreatePaintButton: 'Краскани сақлаш',
  rmPendingExternalOrdersTitle:
    'Хомашё — ташқи буюртма (бухгалтерия); омбор киримини белгиланг',
};

function withRawMaterialFallbacks(base: T): T {
  return {
    ...base,
    rmKindLabel: base.rmKindLabel || RAW_MATERIAL_FALLBACK.rmKindLabel,
    rmKindSiro: base.rmKindSiro || RAW_MATERIAL_FALLBACK.rmKindSiro,
    rmKindPaint: base.rmKindPaint || RAW_MATERIAL_FALLBACK.rmKindPaint,
    rmPaintHint: base.rmPaintHint || RAW_MATERIAL_FALLBACK.rmPaintHint,
    rmCreatePaintButton: base.rmCreatePaintButton || RAW_MATERIAL_FALLBACK.rmCreatePaintButton,
    rmPendingExternalOrdersTitle:
      base.rmPendingExternalOrdersTitle || RAW_MATERIAL_FALLBACK.rmPendingExternalOrdersTitle,
  };
}

// ======================== CONTEXT ========================

interface AppContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: T;
  dateFilter: DateFilter;
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (from: string, to: string) => void;
  filterData: <I extends { date: string }>(items: I[]) => I[];
  filterLabel: string;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const LANG_STORAGE = 'erp_lang';
const SUPPORTED: Language[] = ['uz_cyrillic', 'uz_latin', 'ru'];

function readStoredLang(): Language {
  try {
    const s = localStorage.getItem(LANG_STORAGE) as Language | null;
    if (s && SUPPORTED.includes(s)) return s;
  } catch {
    // ignore
  }
  return 'uz_cyrillic';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readStoredLang);

  const setLang = (l: Language) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_STORAGE, l);
    } catch {
      // ignore
    }
  };
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    preset: 'all',
    from: '',
    to: '',
  });
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    try {
      return (localStorage.getItem('erp_font_size') as FontSize) || 'md';
    } catch {
      return 'md';
    }
  });

  const t = useMemo(() => withRawMaterialFallbacks(translations[lang]), [lang]);

  // Apply font size to <html> on mount and change
  useEffect(() => {
    try {
      document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
      localStorage.setItem('erp_font_size', fontSize);
    } catch {
      // ignore
    }
  }, [fontSize]);

  const setFontSize = (size: FontSize) => setFontSizeState(size);

  const setPreset = (preset: DatePreset) => {
    if (preset === 'custom') {
      setDateFilter(prev => ({ ...prev, preset: 'custom' }));
      return;
    }
    const range = getPresetRange(preset);
    setDateFilter({ preset, ...range });
  };

  const setCustomRange = (from: string, to: string) => {
    const max = toLocalDateString(new Date());
    let f = from <= to ? from : to;
    let t = from <= to ? to : from;
    if (f > max) f = max;
    if (t > max) t = max;
    if (f > t) [f, t] = [t, f];
    setDateFilter({ preset: 'custom', from: f, to: t });
  };

  const filterData = <I extends { date: string }>(items: I[]): I[] => {
    return filterByDateRange(items, dateFilter);
  };

  const filterLabel = useMemo(() => {
    if (dateFilter.preset === 'all' || (!dateFilter.from && !dateFilter.to)) return t.dfAllTime;
    if (dateFilter.preset === 'today') return t.dfToday;
    if (dateFilter.preset === 'week') return t.dfWeek;
    if (dateFilter.preset === 'month') return t.dfMonth;
    if (dateFilter.from && dateFilter.to) return `${dateFilter.from} — ${dateFilter.to}`;
    if (dateFilter.from) return `${t.dfFrom} ${dateFilter.from}`;
    return t.dfAllTime;
  }, [dateFilter, t]);

  return (
    <AppContext.Provider value={{ lang, setLang, t, dateFilter, setPreset, setCustomRange, filterData, filterLabel, fontSize, setFontSize }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}