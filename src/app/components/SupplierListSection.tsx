import React, { useMemo, useState } from 'react';
import { Building2, Pencil, Search, UserPlus } from 'lucide-react';
import { useERP, type Supplier } from '../store/erp-store';
import { useApp } from '../i18n/app-context';
import { useAuth } from '../auth/auth-context';
import { formatUzPhoneDisplay } from '../utils/phone';

const emptyCell = '\u2014';

export function SupplierListSection({
  onAddSupplier,
  onEditSupplier,
}: {
  onAddSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
}) {
  const { state } = useERP();
  const { t } = useApp();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('view_expenses');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [...state.suppliers].sort((a, b) => a.name.localeCompare(b.name, 'uz'));
    if (!q) return rows;
    return rows.filter((s) => {
      const hay = [s.name, s.phone ?? '', s.address ?? '', s.notes ?? ''].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [state.suppliers, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Building2 size={18} className="text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{t.supListTitle}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.supListCount.replace('{n}', String(state.suppliers.length))}
            </p>
          </div>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={onAddSupplier}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium shrink-0"
          >
            <UserPlus size={16} />
            {t.supAddSupplier}
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.supSearchPlaceholder}
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 w-12">#</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500">{t.supColName}</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500">{t.labelPhone}</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500">{t.supColAddress}</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500">{t.labelDesc}</th>
                {canCreate && <th className="w-12 px-2 py-3" />}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canCreate ? 6 : 5} className="px-4 py-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {state.suppliers.length === 0 ? t.supNoSuppliers : t.supNoSearchResults}
                    </p>
                    {canCreate && state.suppliers.length === 0 && (
                      <button
                        type="button"
                        onClick={onAddSupplier}
                        className="mt-3 inline-flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline"
                      >
                        <UserPlus size={14} />
                        {t.supAddSupplier}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={`border-t border-slate-100 dark:border-slate-700 ${
                      idx % 2 ? 'bg-slate-50/50 dark:bg-slate-800/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-400 tabular-nums">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {s.phone ? formatUzPhoneDisplay(s.phone) || emptyCell : emptyCell}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[12rem]">
                      {s.address || emptyCell}
                    </td>
                    <td
                      className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[14rem] truncate"
                      title={s.notes ?? ''}
                    >
                      {s.notes || emptyCell}
                    </td>
                    {canCreate && (
                      <td className="px-2 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onEditSupplier(s)}
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
                          title={t.supEditSupplier}
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
