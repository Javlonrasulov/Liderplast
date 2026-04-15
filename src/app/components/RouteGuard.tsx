import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../auth/auth-context';
import { useApp } from '../i18n/app-context';
import type { AppPermissionKey } from '../auth/permission-keys';

export function RouteGuard({
  permission,
  children,
}: {
  permission: AppPermissionKey;
  children: React.ReactNode;
}) {
  const { hasPermission, loading } = useAuth();
  const { t } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
        {t.authLoading}
      </div>
    );
  }
  if (!hasPermission(permission)) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}