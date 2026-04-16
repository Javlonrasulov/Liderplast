import React from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { router } from './routes';
import { AppProvider } from './i18n/app-context';
import { translations } from './i18n/translations';
import { AuthProvider, useAuth } from './auth/auth-context';
import { LoginScreen } from './auth/LoginScreen';

/** Matches AppProvider default language — avoid useApp() here (see useApp / AppProvider ordering in some dev/HMR setups). */
const AUTH_LOADING_LABEL = translations.uz_cyrillic.authLoading;

function AppShell() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-500">
        {AUTH_LOADING_LABEL}
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
      <AppProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
