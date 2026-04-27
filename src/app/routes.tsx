import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { ERPProvider } from './store/erp-store';
import { Dashboard } from './pages/Dashboard';
import { RawMaterial } from './pages/RawMaterial';
import { Warehouse } from './pages/Warehouse';
import { Sales } from './pages/Sales';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { ShiftWork } from './pages/ShiftWork';
import { Payroll } from './pages/Payroll';
import { SystemUsers } from './pages/SystemUsers';
import { Inventory } from './pages/Inventory';
import { RouteGuard } from './components/RouteGuard';

function Root() {
  return (
    <ERPProvider>
      <Layout />
    </ERPProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: 'raw-material', Component: RawMaterial },
      {
        path: 'warehouse',
        element: (
          <RouteGuard permission="view_warehouse">
            <Warehouse />
          </RouteGuard>
        ),
      },
      { path: 'sales', Component: Sales },
      {
        path: 'inventory',
        element: (
          <RouteGuard permission="view_warehouse">
            <Inventory />
          </RouteGuard>
        ),
      },
      { path: 'inventarizatsiya', element: <Navigate to="/inventory" replace /> },
      { path: 'expenses', Component: Expenses },
      { path: 'employees', element: <Navigate to="/payroll" replace /> },
      { path: 'shifts', Component: ShiftWork },
      { path: 'reports', Component: Reports },
      { path: 'payroll', Component: Payroll },
      {
        path: 'system-users',
        element: (
          <RouteGuard permission="manage_users">
            <SystemUsers />
          </RouteGuard>
        ),
      },
    ],
  },
]);