import React from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { router } from './routes';
import { AppProvider, useApp } from './i18n/app-context';
import { AuthProvider, useAuth } from './auth/auth-context';
import { LoginScreen } from './auth/LoginScreen';

function AppShell() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-500">
        {t.authLoading}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
