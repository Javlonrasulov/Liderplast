import React, { useState } from 'react';
import { Navigate } from 'react-router';
import { Truck, Users, ShoppingCart, History } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { useApp } from '../i18n/app-context';
import type { Supplier } from '../store/erp-store';
import { SupplierPurchasesPanel } from '../components/SupplierPurchasesPanel';
import { SupplierPurchaseHistorySection } from '../components/SupplierPurchaseHistorySection';
import { SupplierListSection } from '../components/SupplierListSection';
import { AddSupplierDialog } from '../components/AddSupplierDialog';

type SuppliersTab = 'purchase' | 'suppliers' | 'history';

export function Suppliers() {
  const { t } = useApp();
  const { hasPermission, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<SuppliersTab>('purchase');
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  const supplierDialogOpen = addSupplierOpen || editSupplier != null;

  const closeSupplierDialog = () => {
    setAddSupplierOpen(false);
    setEditSupplier(null);
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
        {t.authLoading}
      </div>
    );
  }

  if (!hasPermission('view_expenses') && !hasPermission('view_raw_material')) {
    return <Navigate to="/" replace />;
  }

  const tabs: { key: SuppliersTab; label: string; icon: typeof ShoppingCart }[] = [
    { key: 'purchase', label: t.supTabPurchase, icon: ShoppingCart },
    { key: 'suppliers', label: t.supTabSuppliers, icon: Users },
    { key: 'history', label: t.supTabHistory, icon: History },
  ];

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden p-3 min-[400px]:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-slate-800 dark:text-white font-bold text-lg">{t.supTitle}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{t.supSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === key
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'purchase' && (
        <SupplierPurchasesPanel onAddSupplier={() => setAddSupplierOpen(true)} />
      )}
      {activeTab === 'suppliers' && (
        <SupplierListSection
          onAddSupplier={() => setAddSupplierOpen(true)}
          onEditSupplier={(s) => setEditSupplier(s)}
        />
      )}
      {activeTab === 'history' && <SupplierPurchaseHistorySection />}

      <AddSupplierDialog
        open={supplierDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeSupplierDialog();
        }}
        supplier={editSupplier}
      />
    </div>
  );
}
