import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useAuth } from './auth-context';
import { useApp } from '../i18n/app-context';

export function AccountCredentialsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, updateCredentials } = useAuth();
  const { t } = useApp();

  const [login, setLogin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const effectiveLogin = useMemo(() => login.trim(), [login]);
  const canSubmit = currentPassword.trim().length > 0 && !saving;

  const close = () => onOpenChange(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) return;

    const cur = currentPassword.trim();
    const nextPw = newPassword.trim();
    const nextLogin = effectiveLogin;

    if (nextPw && nextPw.length < 6) {
      setError('Parol kamida 6 ta belgi bo‘lishi kerak.');
      return;
    }
    if (nextPw && nextPw !== confirmPassword.trim()) {
      setError('Yangi parol tasdiqlash bilan mos kelmadi.');
      return;
    }

    setSaving(true);
    try {
      await updateCredentials({
        currentPassword: cur,
        login: nextLogin ? nextLogin : undefined,
        newPassword: nextPw ? nextPw : undefined,
      });
      setSuccess('Saqlandi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => close(), 350);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Login / parol</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Login ёки паролни ўзгартириш учун жорий паролни киритинг.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Login</Label>
            <Input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder={user?.login ?? user?.phone ?? ''}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Joriy parol</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t.authPassword}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Yangi parol</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t.authPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Yangi parол (tasdiqlash)</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.authPassword}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
              {success}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={saving}>
              {t.btnCancel}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {saving ? t.authLoading : t.btnSave}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

