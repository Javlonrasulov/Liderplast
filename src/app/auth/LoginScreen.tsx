import React, { useState } from 'react';
import { Factory, Lock, LogIn, User } from 'lucide-react';
import { useAuth } from './auth-context';
import { useApp } from '../i18n/app-context';

const MASHINALAR_CRM_URL = 'https://mashina.liderplast.uz';

export function LoginScreen() {
  const { login, loading } = useAuth();
  const { t } = useApp();
  const [identifier, setIdentifier] = useState('+998900000001');
  const [password, setPassword] = useState('Director123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            ERP
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{t.authTitle}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.authSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
              {t.authIdentifier}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
              {t.authPassword}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-600 px-3 py-2 text-sm dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            {submitting ? t.authLoading : t.authSubmit}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <a
            href={MASHINALAR_CRM_URL}
            className="w-full h-11 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Factory size={18} className="shrink-0" aria-hidden />
            {t.authMachines}
          </a>
        </div>
      </div>
    </div>
  );
}
