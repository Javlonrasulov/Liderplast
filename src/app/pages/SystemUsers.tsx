import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, UserCog } from 'lucide-react';
import { useApp } from '../i18n/app-context';
import { apiRequest } from '../api/http';
import { APP_PERMISSION_KEYS, type AppPermissionKey } from '../auth/permission-keys';
import type { T } from '../i18n/translations';
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { cn } from '../components/ui/utils';

const EXTRA_POSITIONS_KEY = 'liderplast-su-extra-positions';

function loadExtraPositions(): string[] {
  try {
    const raw = localStorage.getItem(EXTRA_POSITIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function persistExtraPositions(list: string[]) {
  try {
    localStorage.setItem(EXTRA_POSITIONS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function selectValueForRole(
  preset: RolePreset,
  customLabel: string,
  extras: string[],
): string {
  if (preset !== 'custom') return preset;
  const t = customLabel.trim();
  if (t && extras.includes(t)) return `extra:${encodeURIComponent(t)}`;
  return 'custom';
}

function isAppPermissionKey(s: string): s is AppPermissionKey {
  return (APP_PERMISSION_KEYS as readonly string[]).includes(s);
}

function apiUserToPreset(u: ApiUser): { preset: RolePreset; customLabel: string } {
  switch (u.role) {
    case 'ADMIN':
      return { preset: 'admin', customLabel: '' };
    case 'DIRECTOR':
      return { preset: 'director', customLabel: '' };
    case 'ACCOUNTANT':
      return { preset: 'accountant', customLabel: '' };
    case 'MANAGER':
      if (u.customRoleLabel?.trim()) {
        return { preset: 'custom', customLabel: u.customRoleLabel.trim() };
      }
      return { preset: 'operator', customLabel: '' };
    default:
      return { preset: 'operator', customLabel: '' };
  }
}

function selectedFromApiUser(u: ApiUser, preset: RolePreset): Set<AppPermissionKey> {
  if (preset === 'admin') return defaultPermissionSet('admin');
  if (preset === 'custom') {
    const raw = (u.permissions ?? []).filter(isAppPermissionKey);
    return raw.length > 0 ? new Set(raw) : new Set();
  }
  const raw = (u.permissions ?? []).filter(isAppPermissionKey);
  if (raw.length > 0) return new Set(raw);
  return defaultPermissionSet(preset);
}

function applySelectValue(
  value: string,
  extras: string[],
): { preset: RolePreset; customLabel: string } {
  if (value.startsWith('extra:')) {
    try {
      const label = decodeURIComponent(value.slice(6));
      if (extras.includes(label)) return { preset: 'custom', customLabel: label };
    } catch {
      /* fall through */
    }
    return { preset: 'custom', customLabel: '' };
  }
  if (value === 'custom') return { preset: 'custom', customLabel: '' };
  if (value === 'admin' || value === 'director' || value === 'accountant' || value === 'operator') {
    return { preset: value, customLabel: '' };
  }
  return { preset: 'operator', customLabel: '' };
}

type ApiUser = {
  id: string;
  fullName: string;
  phone: string;
  login?: string | null;
  role: string;
  customRoleLabel?: string | null;
  permissions: string[];
  canLogin: boolean;
};

type RolePreset = 'admin' | 'director' | 'accountant' | 'operator' | 'custom';

function labelForPermission(t: T, key: AppPermissionKey): string {
  const m: Record<AppPermissionKey, string> = {
    view_dashboard: t.suPermViewDashboard,
    view_shift: t.suPermViewShift,
    manage_shift_workers: t.suPermManageShiftWorkers,
    view_raw_material: t.suPermViewRawMaterial,
    view_raw_material_bags: t.suPermViewRawMaterialBags,
    manage_raw_material_bags: t.suPermManageRawMaterialBags,
    view_warehouse: t.suPermViewWarehouse,
    view_inventory: t.suPermViewInventory,
    view_sales: t.suPermViewSales,
    view_expenses: t.suPermViewExpenses,
    view_payroll: t.suPermViewPayroll,
    view_vedemost: t.suPermViewVedomost,
    create_vedemost: t.suPermCreateVedomost,
    view_reports: t.suPermViewReports,
    manage_settings: t.suPermManageSettings,
    manage_users: t.suPermManageUsers,
  };
  return m[key];
}

function presetToApiRole(preset: RolePreset): string {
  switch (preset) {
    case 'admin':
      return 'ADMIN';
    case 'director':
      return 'DIRECTOR';
    case 'accountant':
      return 'ACCOUNTANT';
    case 'operator':
    case 'custom':
      return 'MANAGER';
    default:
      return 'MANAGER';
  }
}

function defaultPermissionSet(preset: RolePreset): Set<AppPermissionKey> {
  const all = new Set(APP_PERMISSION_KEYS);
  if (preset === 'admin') return all;
  if (preset === 'director') {
    return new Set([
      'view_dashboard',
      'view_shift',
      'manage_shift_workers',
      'view_raw_material',
      'view_raw_material_bags',
      'manage_raw_material_bags',
      'view_warehouse',
      'view_inventory',
      'view_sales',
      'view_expenses',
      'view_payroll',
      'view_vedemost',
      'view_reports',
    ]);
  }
  if (preset === 'accountant') {
    return new Set([
      'view_dashboard',
      'view_raw_material_bags',
      'view_payroll',
      'view_vedemost',
      'create_vedemost',
      'view_reports',
      'view_expenses',
      'view_sales',
    ]);
  }
  if (preset === 'operator') {
    return new Set([
      'view_dashboard',
      'view_shift',
      'manage_shift_workers',
      'view_raw_material_bags',
      'manage_raw_material_bags',
    ]);
  }
  return new Set();
}

function normalizeLoginIdentifier(raw: string): { phone?: string; login?: string } {
  const x = raw.trim().replace(/\s/g, '');
  if (!x) return {};
  const digits = x.replace(/\D/g, '');
  if (x.startsWith('+') || digits.length >= 9) {
    if (digits.length === 12 && digits.startsWith('998')) {
      return { phone: `+${digits}` };
    }
    if (digits.length === 9) {
      return { phone: `+998${digits}` };
    }
    if (x.startsWith('+')) {
      return { phone: x };
    }
  }
  return { login: x };
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className ?? ''}`}
    />
  );
}

const roleSelectItemClass =
  'rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer outline-none data-[highlighted]:bg-indigo-50 dark:data-[highlighted]:bg-indigo-950/50 data-[highlighted]:text-slate-900 dark:data-[highlighted]:text-white focus:bg-indigo-50 dark:focus:bg-indigo-950/50';

export function SystemUsers() {
  const { t } = useApp();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [preset, setPreset] = useState<RolePreset>('operator');
  const [customLabel, setCustomLabel] = useState('');
  const [selected, setSelected] = useState<Set<AppPermissionKey>>(
    () => defaultPermissionSet('operator'),
  );
  const [extraPositions, setExtraPositions] = useState<string[]>(() => loadExtraPositions());
  const [newPositionName, setNewPositionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await apiRequest<ApiUser[]>('/users');
      setUsers(list.filter((u) => u.canLogin));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetCreateForm = useCallback(() => {
    setEditingId(null);
    setFullName('');
    setIdentifier('');
    setPassword('');
    setCustomLabel('');
    setPreset('operator');
    setSelected(defaultPermissionSet('operator'));
  }, []);

  const beginEdit = (u: ApiUser) => {
    const { preset: p, customLabel: cl } = apiUserToPreset(u);
    setEditingId(u.id);
    setFullName(u.fullName);
    setIdentifier(u.login?.trim() || u.phone || '');
    setPassword('');
    setPreset(p);
    setCustomLabel(cl);
    setSelected(selectedFromApiUser(u, p));
  };

  const addExtraPosition = () => {
    const n = newPositionName.trim();
    if (!n) return;
    if (extraPositions.includes(n)) {
      setNewPositionName('');
      return;
    }
    const next = [...extraPositions, n].sort((a, b) => a.localeCompare(b, 'uz'));
    setExtraPositions(next);
    persistExtraPositions(next);
    setNewPositionName('');
  };

  const removeExtraPosition = (name: string) => {
    const next = extraPositions.filter((x) => x !== name);
    setExtraPositions(next);
    persistExtraPositions(next);
    if (preset === 'custom' && customLabel.trim() === name) {
      setPreset('operator');
      setCustomLabel('');
    }
  };

  const toggle = (k: AppPermissionKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const roleLabel = useCallback(
    (u: ApiUser) => {
      if (u.customRoleLabel?.trim()) return u.customRoleLabel.trim();
      switch (u.role) {
        case 'ADMIN':
          return t.suRoleAdmin;
        case 'DIRECTOR':
          return t.suRoleDirector;
        case 'ACCOUNTANT':
          return t.suRoleAccountant;
        case 'MANAGER':
          return t.suRoleOperator;
        default:
          return u.role;
      }
    },
    [t],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!fullName.trim() || !identifier.trim()) return;
    if (!editingId && !password.trim()) return;
    if (preset === 'custom' && !customLabel.trim()) {
      setError(t.suCustomLabel);
      return;
    }
    if (preset === 'custom' && selected.size === 0) {
      setError(t.suPermissionsHint);
      return;
    }
    const pw = password.trim();
    if (pw.length > 0 && pw.length < 6) {
      setError(t.suPasswordMinLength);
      return;
    }

    setSubmitting(true);
    try {
      const idn = normalizeLoginIdentifier(identifier);
      if (!idn.phone && !idn.login) {
        setError(t.suLoginOrPhone);
        setSubmitting(false);
        return;
      }

      const apiRole = presetToApiRole(preset);

      if (editingId) {
        const body: Record<string, unknown> = {
          fullName: fullName.trim(),
          role: apiRole,
          canLogin: true,
          salaryType: 'FIXED',
          salaryRate: 0,
        };
        if (idn.phone) body.phone = idn.phone;
        if (idn.login) body.login = idn.login;
        if (password.trim()) body.password = password.trim();
        if (preset === 'custom') {
          body.customRoleLabel = customLabel.trim();
          body.permissions = [...selected];
        } else {
          body.customRoleLabel = null;
          body.permissions = [];
        }
        await apiRequest(`/users/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } else {
        const body: Record<string, unknown> = {
          fullName: fullName.trim(),
          password,
          role: apiRole,
          canLogin: true,
          salaryType: 'FIXED',
          salaryRate: 0,
        };
        if (idn.phone) body.phone = idn.phone;
        if (idn.login) body.login = idn.login;
        if (preset === 'custom') {
          body.customRoleLabel = customLabel.trim();
          body.permissions = [...selected];
        } else {
          body.permissions = [];
        }
        await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      setSuccess(t.suSuccess);
      resetCreateForm();
      await load();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.suDelete + '?')) return;
    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      if (editingId === id) resetCreateForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const systemList = useMemo(
    () => users.filter((u) => u.role !== 'WORKER'),
    [users],
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-8 overflow-x-hidden p-3 min-[400px]:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
          <UserCog className="text-indigo-600 dark:text-indigo-400" size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.suTitle}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.suSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            {editingId ? (
              <Pencil size={16} className="text-indigo-500" />
            ) : (
              <Plus size={16} className="text-indigo-500" />
            )}
            {editingId ? t.suUpdateUserTitle : t.suAddTitle}
          </h3>

          <div>
            <Label>{t.suFullName}</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label>{t.suLoginOrPhone}</Label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <Label>{t.suPassword}</Label>
            {editingId && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">{t.suPasswordOptionalHint}</p>
            )}
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required={!editingId}
            />
          </div>
          <div>
            <Label>{t.suRole}</Label>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-2 leading-relaxed">
              {t.suRoleDeleteExplain}
            </p>
            <RadixSelect
              value={selectValueForRole(preset, customLabel, extraPositions)}
              onValueChange={(value) => {
                const { preset: p, customLabel: cl } = applySelectValue(value, extraPositions);
                setPreset(p);
                setCustomLabel(cl);
                /**
                 * Maxsus (qo‘shimcha) lavozim tanlanganda ruxsatlar bo‘sh qolib ketmasligi uchun
                 * operator darajasidagi base ruxsatlarni avtomatik belgilab qo‘yamiz —
                 * keyin foydalanuvchi qo‘shimcha qutichalarni tasdiqlashi yoki olib tashlashi mumkin.
                 */
                setSelected(
                  p === 'custom' ? defaultPermissionSet('operator') : defaultPermissionSet(p),
                );
              }}
            >
              <SelectTrigger
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:focus:ring-offset-slate-900 [&_svg]:opacity-60"
              >
                <SelectValue placeholder={t.suRoleOperator} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-lg z-[100] p-1">
                <SelectItem value="admin" className={roleSelectItemClass}>
                  {t.suRoleAdmin}
                </SelectItem>
                <SelectItem value="director" className={roleSelectItemClass}>
                  {t.suRoleDirector}
                </SelectItem>
                <SelectItem value="accountant" className={roleSelectItemClass}>
                  {t.suRoleAccountant}
                </SelectItem>
                <SelectItem value="operator" className={roleSelectItemClass}>
                  {t.suRoleOperator}
                </SelectItem>
                {extraPositions.length > 0 && (
                  <>
                    <SelectSeparator className="bg-slate-200 dark:bg-slate-700 my-1" />
                    {extraPositions.map((name) => (
                      <SelectItem
                        key={name}
                        value={`extra:${encodeURIComponent(name)}`}
                        className={roleSelectItemClass}
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </>
                )}
                <SelectItem value="custom" className={roleSelectItemClass}>
                  {t.suRoleCustom}
                </SelectItem>
              </SelectContent>
            </RadixSelect>

            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.suSavedPositionsTitle}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">{t.suSavedPositionsHint}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  placeholder={t.suAddPositionPlaceholder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addExtraPosition();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addExtraPosition}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Plus size={16} className="text-indigo-500" />
                  {t.btnAdd}
                </button>
              </div>
              {extraPositions.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {extraPositions.map((name) => (
                    <li
                      key={name}
                      className="flex items-center justify-between gap-2 pl-3 pr-2 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/50"
                    >
                      <span className="text-sm text-slate-800 dark:text-slate-100 truncate">{name}</span>
                      <button
                        type="button"
                        onClick={() => removeExtraPosition(name)}
                        className="shrink-0 p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title={t.suDelete}
                        aria-label={`${t.suDelete}: ${name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {preset === 'custom' && (
            <div>
              <Label>{t.suCustomLabel}</Label>
              <Input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} />
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              {t.suPermissionsHint}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {APP_PERMISSION_KEYS.map((key) => {
                const isOn = selected.has(key);
                return (
                  <label
                    key={key}
                    htmlFor={`su-perm-${key}`}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors select-none',
                      isOn
                        ? 'border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/30 text-slate-800 dark:text-slate-100 shadow-sm'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70',
                    )}
                  >
                    <Checkbox
                      id={`su-perm-${key}`}
                      checked={isOn}
                      onCheckedChange={() => toggle(key)}
                      className="shrink-0"
                    />
                    <span className="flex-1 min-w-0 leading-snug">{labelForPermission(t, key)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3 py-2">
              {success}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {editingId && (
              <button
                type="button"
                onClick={resetCreateForm}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t.suCancelEdit}
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium"
            >
              {submitting ? t.authLoading : editingId ? t.btnSave : t.suCreateBtn}
            </button>
          </div>
        </form>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">
            {t.suListTitle}
          </h3>
          {loading ? (
            <p className="text-sm text-slate-500">{t.authLoading}</p>
          ) : systemList.length === 0 ? (
            <p className="text-sm text-slate-500">{t.noData}</p>
          ) : (
            <div className="space-y-3">
              {systemList.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-white truncate">
                      {u.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {u.login || u.phone} · {roleLabel(u)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {(u.permissions ?? []).length > 0
                        ? (u.permissions ?? [])
                            .map((key) =>
                              isAppPermissionKey(key)
                                ? labelForPermission(t, key)
                                : key,
                            )
                            .join(', ')
                        : '—'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => beginEdit(u)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      <Pencil size={14} />
                      {t.suEdit}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(u.id)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={14} />
                      {t.suDelete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
