import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard, Droplets, Boxes,
  ShoppingCart, Zap, BarChart3, ChevronLeft, ChevronRight,
  Bell, Sun, Moon, User, Menu, Globe, Check, ChevronDown,
  CalendarClock, Wallet, UserCog, LogOut,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useERP } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { formatNumber } from '../utils/format';
import { DateFilterPicker } from './DateFilterPicker';
import { ExpensesElectricityNavButton } from './ExpensesElectricityNavButton';
import { Language } from '../i18n/translations';
import { type FontSize } from '../i18n/app-context';
import { useAuth } from '../auth/auth-context';
import type { AppPermissionKey } from '../auth/permission-keys';

const LANG_OPTIONS: { value: Language; short: string; label: string; flag: string }[] = [
  { value: 'uz_cyrillic', short: 'КИ', label: 'Ўзбек (Кирил)', flag: '🇺🇿' },
  { value: 'uz_latin', short: 'LT', label: "O'zbek (Lotin)", flag: '🇺🇿' },
  { value: 'ru', short: 'RU', label: 'Русский', flag: '🇷🇺' },
];

const FONT_SIZES: { value: FontSize; label: string; style: string }[] = [
  { value: 'sm', label: 'A',  style: 'text-[11px]' },
  { value: 'md', label: 'A',  style: 'text-[13px]' },
  { value: 'lg', label: 'A',  style: 'text-[15px]' },
  { value: 'xl', label: 'A',  style: 'text-[18px]' },
];

function LanguageDropdown() {
  const { lang, setLang } = useApp();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number; width: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  /** Portal menyusi body da — `ref` ichida emas; yopish tekshiruvi shuni hisobga olishi shart, aks holda mousedown avval, click esa yo‘qoladi */
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPos = useCallback(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: r.bottom + 8,
      right: window.innerWidth - r.right,
      width: Math.min(13 * 16, window.innerWidth - 16),
    });
  }, [open]);

  useLayoutEffect(() => {
    updateMenuPos();
  }, [open, updateMenuPos]);

  useEffect(() => {
    if (!open) return;
    const onRe = () => updateMenuPos();
    window.addEventListener('scroll', onRe, true);
    window.addEventListener('resize', onRe);
    return () => {
      window.removeEventListener('scroll', onRe, true);
      window.removeEventListener('resize', onRe);
    };
  }, [open, updateMenuPos]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      const inTrigger = Boolean(ref.current?.contains(t) || btnRef.current?.contains(t));
      const inMenu = Boolean(menuRef.current?.contains(t));
      if (inTrigger || inMenu) return;
      setOpen(false);
    };
    if (open) {
      setTimeout(() => document.addEventListener('mousedown', handler, true), 0);
    }
    return () => document.removeEventListener('mousedown', handler, true);
  }, [open]);

  const current = LANG_OPTIONS.find(o => o.value === lang)!;

  const menu = open && menuPos && (
    <div
      ref={menuRef}
      className="fixed z-[200] w-[min(13rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] rounded-2xl border border-slate-200 bg-white py-1.5 shadow-2xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/40 overflow-hidden"
      style={{ top: menuPos.top, right: menuPos.right, width: menuPos.width, maxWidth: 'calc(100vw - 1rem)' }}
      role="listbox"
    >
      {LANG_OPTIONS.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => {
            setLang(opt.value);
            setOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
            lang === opt.value
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <span className="text-base">{opt.flag}</span>
          <div className="flex-1 text-left">
            <p className="font-medium leading-tight">{opt.label}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{opt.short}</p>
          </div>
          {lang === opt.value && <Check size={14} className="text-indigo-500 flex-shrink-0" />}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          setOpen((o) => {
            if (!o) {
              setTimeout(() => {
                if (btnRef.current) {
                  const r = btnRef.current.getBoundingClientRect();
                  setMenuPos({
                    top: r.bottom + 8,
                    right: window.innerWidth - r.right,
                    width: Math.min(13 * 16, window.innerWidth - 16),
                  });
                }
              }, 0);
            }
            return !o;
          });
        }}
        className="flex h-9 shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 sm:gap-1.5 sm:px-3"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe size={14} className="text-slate-400" />
        <span>{current.short}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {typeof document !== 'undefined' && open && createPortal(menu, document.body)}
    </div>
  );
}

function FontSizeControl() {
  const { fontSize, setFontSize } = useApp();
  const sizes: FontSize[] = ['sm', 'md', 'lg', 'xl'];
  const currentIdx = sizes.indexOf(fontSize);

  return (
    <div className="flex items-center gap-0.5 h-9 px-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
      {/* Decrease */}
      <button
        onClick={() => currentIdx > 0 && setFontSize(sizes[currentIdx - 1])}
        disabled={currentIdx === 0}
        title="Harflarni kichiklashtirish"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <span className="text-[11px] font-bold leading-none">A</span>
        <span className="text-[8px] font-bold leading-none ml-px">−</span>
      </button>

      {/* Dots indicator */}
      <div className="flex items-center gap-0.5 px-1">
        {sizes.map((s, i) => (
          <button
            key={s}
            onClick={() => setFontSize(s)}
            title={s === 'sm' ? 'Kichik' : s === 'md' ? 'Oddiy' : s === 'lg' ? 'Katta' : 'Juda katta'}
            className={`rounded-full transition-all ${
              fontSize === s
                ? 'bg-indigo-500 dark:bg-indigo-400'
                : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'
            } ${i === 0 ? 'w-1.5 h-1.5' : i === 1 ? 'w-2 h-2' : i === 2 ? 'w-2.5 h-2.5' : 'w-3 h-3'}`}
          />
        ))}
      </div>

      {/* Increase */}
      <button
        onClick={() => currentIdx < sizes.length - 1 && setFontSize(sizes[currentIdx + 1])}
        disabled={currentIdx === sizes.length - 1}
        title="Harflarni kattalashtirish"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <span className="text-[15px] font-bold leading-none">A</span>
        <span className="text-[9px] font-bold leading-none ml-px">+</span>
      </button>
    </div>
  );
}

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const { rawMaterialStock } = useERP();
  const { t } = useApp();
  const { user, logout, hasPermission } = useAuth();

  const navDefs: Array<{
    path: string;
    icon: typeof LayoutDashboard;
    label: string;
    exact?: boolean;
    perm: AppPermissionKey;
  }> = [
    { path: '/', icon: LayoutDashboard, label: t.navDashboard, exact: true, perm: 'view_dashboard' },
    { path: '/shifts', icon: CalendarClock, label: t.navShifts, perm: 'view_shift' },
    { path: '/raw-material', icon: Droplets, label: t.navRawMaterial, perm: 'view_raw_material' },
    { path: '/warehouse', icon: Boxes, label: t.navWarehouse, perm: 'view_warehouse' },
    { path: '/sales', icon: ShoppingCart, label: t.navSales, perm: 'view_sales' },
    { path: '/expenses', icon: Zap, label: t.navExpenses, perm: 'view_expenses' },
    { path: '/payroll', icon: Wallet, label: t.navPayroll, perm: 'view_payroll' },
    { path: '/reports', icon: BarChart3, label: t.navReports, perm: 'view_reports' },
    { path: '/system-users', icon: UserCog, label: t.navSystemUsers, perm: 'manage_users' },
  ];

  const navItems = navDefs.filter((item) => {
    if (item.path === '/payroll') {
      return hasPermission('view_payroll') || hasPermission('view_vedemost');
    }
    return hasPermission(item.perm);
  });

  const PAGE_TITLES: Record<string, string> = {
    '/': t.navDashboard,
    '/raw-material': t.navRawMaterial,
    '/warehouse': t.navWarehouse,
    '/sales': t.navSales,
    '/expenses': t.navExpenses,
    '/shifts': t.navShifts,
    '/payroll': t.navPayroll,
    '/reports': t.navReports,
    '/system-users': t.navSystemUsers,
  };

  const pageTitle = PAGE_TITLES[location.pathname] || 'Lider Plast ERP';
  const lowStock = rawMaterialStock < 1000;
  const showExpensesElectricityNav =
    location.pathname === '/expenses' && hasPermission('view_expenses');

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-700/50 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-700/50 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
            <span className="text-white text-[9px] font-bold leading-none text-center">SAM<br/>BC</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-slate-800 dark:text-white text-sm font-semibold leading-tight">"SAM-BC" MCHJ</p>
              <button
                onClick={() => {
                  const fallback = () => {
                    const el = document.createElement('textarea');
                    el.value = '308264014';
                    el.style.position = 'fixed';
                    el.style.opacity = '0';
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand('copy');
                    document.body.removeChild(el);
                  };
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText('308264014').catch(fallback);
                  } else {
                    fallback();
                  }
                }}
                title="Nusxalash"
                className="group flex items-center gap-1 mt-0.5"
              >
                <span className="text-slate-400 dark:text-slate-500 text-xs font-mono tracking-wide group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">308 264 014</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group relative border ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white border-transparent'} ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white'}`} />
                {!collapsed && <span className="truncate text-xs">{item.label}</span>}
                {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Siro status */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs">{t.layoutSiroRemaining}</span>
              <span className={`text-xs font-semibold ${lowStock ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formatNumber(rawMaterialStock)} kg
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${lowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (rawMaterialStock / 3500) * 100)}%` }} />
            </div>
            {lowStock && (
              <p className="text-amber-500 dark:text-amber-400 text-xs mt-1.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                {t.layoutMaterialLow}
              </p>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <div className="border-t border-slate-100 dark:border-slate-700/50 p-2">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top bar — toolbar scrolls horizontally on very narrow viewports */}
        <header className="z-10 flex min-h-14 shrink-0 items-center gap-2 overflow-visible border-b border-slate-200 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-900 sm:px-3 lg:h-14 lg:px-5 lg:py-0">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="flex min-w-0 max-w-[min(72vw,22rem)] shrink items-center gap-1 min-[400px]:max-w-[min(70vw,26rem)] sm:max-w-md md:max-w-lg lg:max-w-xl">
            <h1 className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-white">
              {pageTitle}
            </h1>
            {showExpensesElectricityNav ? <ExpensesElectricityNavButton /> : null}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
            {/* Date outside overflow-x (no clip). Inner row must not use flex-1 or the group splits: date by title, icons on the right */}
            <div className="flex min-w-0 max-w-full items-center justify-end gap-1 sm:gap-2">
            <div className="shrink-0 overflow-visible">
              <DateFilterPicker />
            </div>

            {/** overflow-x kichik ekranlarda pastga tushadigan pastki menyularni kesib qo‘yadi — til/profil shu qatordan tashqari */}
            <div className="flex min-w-0 min-h-0 items-center justify-end gap-1 overflow-x-auto hide-scrollbar sm:gap-2">
            {lowStock && (
              <div className="hidden items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 dark:border-amber-700 dark:bg-amber-900/20 md:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{t.layoutMaterialLow}</span>
              </div>
            )}

            <button
              type="button"
              className="relative shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Bell size={16} />
              {lowStock && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="hidden shrink-0 min-[380px]:block">
              <FontSizeControl />
            </div>
            </div>

            <div className="shrink-0 z-20 overflow-visible">
              <LanguageDropdown />
            </div>

            <div className="flex shrink-0 items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-700 sm:gap-2 sm:pl-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600">
                <User size={12} className="text-white" />
              </div>
              <div className="hidden min-w-0 max-w-[120px] md:block lg:max-w-[140px]">
                <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200" title={user?.fullName}>
                  {user?.fullName ?? '—'}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {user?.role ? `${t.suRole}: ${user.role}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                title={t.layoutLogout}
              >
                <LogOut size={16} />
              </button>
            </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}