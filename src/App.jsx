import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import InvoicesPage from './pages/InvoicesPage';
import ExpensesPage from './pages/ExpensesPage';
import MileagePage from './pages/MileagePage';
import TaxReportPage from './pages/TaxReportPage';
import BackupPage from './pages/BackupPage';
import SettingsPage from './pages/SettingsPage';
import PricingOffersPage from './pages/PricingOffersPage';
import DispositionKanbanPage from './pages/DispositionKanbanPage';

// Modals
import CustomerModal from './components/CustomerModal';
import DemoEmailModal from './components/DemoEmailModal';
import ServiceModal from './components/ServiceModal';
import InvoiceModal from './components/InvoiceModal';
import ExpenseModal from './components/ExpenseModal';
import MileageModal from './components/MileageModal';
import InvoiceViewModal from './components/InvoiceViewModal';
import LogoPreviewModal from './components/LogoPreviewModal';

import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Car, 
  Landmark,
  Receipt,
  Tag,
  ShieldCheck,
  Trello,
  Settings,
  Menu
} from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

import { api } from './api';

// Helper to parse route from URL hash
const parseHash = (hashStr) => {
  const clean = (hashStr || '').replace(/^#\/?/, '').trim();
  if (!clean || clean === 'dashboard') {
    return { tab: 'dashboard', customerId: null };
  }
  if (clean.startsWith('customer/') || clean.startsWith('customer-detail/')) {
    const parts = clean.split('/');
    return { tab: 'customer-detail', customerId: parts[1] ? parts[1] : null };
  }
  if (clean === 'customers') return { tab: 'customers', customerId: null };
  if (clean === 'disposition') return { tab: 'disposition', customerId: null };
  if (clean === 'pricing-offers') return { tab: 'pricing-offers', customerId: null };
  if (clean === 'abnahme') return { tab: 'abnahme', customerId: null };
  if (clean === 'invoices') return { tab: 'invoices', customerId: null };
  if (clean === 'expenses') return { tab: 'expenses', customerId: null };
  if (clean === 'mileage') return { tab: 'mileage', customerId: null };
  if (clean === 'tax-report') return { tab: 'tax-report', customerId: null };
  if (clean === 'backup') return { tab: 'backup', customerId: null };
  if (clean === 'settings') return { tab: 'settings', customerId: null };

  return { tab: clean, customerId: null };
};

export default function App() {
  const { isTR } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [dispositionCustomerId, setDispositionCustomerId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Unified router function that pushes state to browser history
  const navigateTo = useCallback((tab, customerId = null, replace = false) => {
    let targetHash = `#${tab}`;
    if (tab === 'customer-detail' && customerId) {
      targetHash = `#customer/${customerId}`;
    } else if (tab === 'dashboard') {
      targetHash = '#dashboard';
    }

    setActiveTab(tab);
    setSelectedCustomerId(customerId);

    if (window.location.hash !== targetHash) {
      if (replace) {
        window.history.replaceState({ tab, customerId }, '', targetHash);
      } else {
        window.history.pushState({ tab, customerId }, '', targetHash);
      }
    }
  }, []);

  // Global state with instant default fallback
  const [stats, setStats] = useState({
    mrr: 429,
    activeAbosCount: 2,
    totalPaidRevenue: 4250,
    totalGrossRevenue: 5057.5,
    totalPendingAmount: 296.31,
    pendingInvoicesCount: 1,
    totalExpenses: 1257.95,
    totalExpensesGross: 1496.96,
    totalKm: 98.5,
    totalKmDeduction: 29.55,
    totalCustomers: 3,
    activeCustomers: 2,
    leadCustomers: 1,
    recentInvoices: [],
    recentCustomers: [],
    recentMileage: []
  });
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [mileage, setMileage] = useState([]);
  const [companySettings, setCompanySettings] = useState({});

  // Modals state
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [demoEmailModalOpen, setDemoEmailModalOpen] = useState(false);
  const [demoEmailCustomer, setDemoEmailCustomer] = useState(null);
  const [demoEmailTemplateKey, setDemoEmailTemplateKey] = useState('digitalisierung_intro');

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalCustId, setServiceModalCustId] = useState(null);
  const [serviceModalCustName, setServiceModalCustName] = useState('');
  const [editingService, setEditingService] = useState(null);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [preselectedInvoiceCustId, setPreselectedInvoiceCustId] = useState(null);
  const [prefilledInvoiceItem, setPrefilledInvoiceItem] = useState(null);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [mileageModalOpen, setMileageModalOpen] = useState(false);
  const [editingMileage, setEditingMileage] = useState(null);
  const [preselectedMileageCustId, setPreselectedMileageCustId] = useState(null);

  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);
  const [selectedViewInvoice, setSelectedViewInvoice] = useState(null);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  // Sync with Browser History / Hash Changes & Mouse Back/Forward Hardware Buttons
  useEffect(() => {
    const handlePopState = () => {
      const state = parseHash(window.location.hash);
      setActiveTab(state.tab);
      setSelectedCustomerId(state.customerId);
    };

    // Initial load from URL hash or set default #dashboard
    if (!window.location.hash) {
      window.history.replaceState({ tab: 'dashboard', customerId: null }, '', '#dashboard');
    } else {
      const initial = parseHash(window.location.hash);
      setActiveTab(initial.tab);
      setSelectedCustomerId(initial.customerId);
    }

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Mouse Back (button 3) and Forward (button 4) hardware button listener
    const handleMouseNav = (e) => {
      if (e.button === 3) {
        // Mouse 4 / Back Button
        e.preventDefault();
        window.history.back();
      } else if (e.button === 4) {
        // Mouse 5 / Forward Button
        e.preventDefault();
        window.history.forward();
      }
    };

    window.addEventListener('mouseup', handleMouseNav);
    window.addEventListener('auxclick', handleMouseNav);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('mouseup', handleMouseNav);
      window.removeEventListener('auxclick', handleMouseNav);
    };
  }, []);

  // Load all core data
  const loadAllData = useCallback(async () => {
    try {
      const [statsData, custData, srvData, invData, expData, milData, settingsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getCustomers().catch(() => []),
        api.getServices().catch(() => []),
        api.getInvoices().catch(() => []),
        api.getExpenses().catch(() => []),
        api.getMileage().catch(() => []),
        api.getSettings().catch(() => ({}))
      ]);

      if (statsData) setStats(statsData);
      if (custData && custData.length >= 0) setCustomers(custData);
      if (srvData && srvData.length >= 0) setServices(srvData);
      if (invData && invData.length >= 0) setInvoices(invData);
      if (expData && expData.length >= 0) setExpenses(expData);
      if (milData && milData.length >= 0) setMileage(milData);
      if (settingsData) setCompanySettings(settingsData);
      setDataRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Customer Actions
  const handleSaveCustomer = async (data) => {
    if (editingCustomer) {
      await api.updateCustomer(editingCustomer.id, data);
    } else {
      await api.createCustomer(data);
    }
    await loadAllData();
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Diesen Kunden und alle zugehörigen Daten wirklich löschen?')) return;
    await api.deleteCustomer(id);
    if (selectedCustomerId === id) {
      navigateTo('customers');
    }
    await loadAllData();
  };

  const handleDemoEmailSent = async (customerId, payload) => {
    await api.sendDemoEmail(customerId, payload);
    await loadAllData();
  };

  // Service Actions
  const handleSaveService = async (data) => {
    if (editingService) {
      await api.updateService(editingService.id, data);
    } else {
      await api.createService(data);
    }
    await loadAllData();
    setEditingService(null);
  };

  // Invoice Actions
  const handleSaveInvoice = async (data) => {
    if (editingInvoice) {
      await api.updateInvoice(editingInvoice.id, data);
    } else {
      await api.createInvoice(data);
    }
    await loadAllData();
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Diese Rechnung wirklich löschen?')) return;
    await api.deleteInvoice(id);
    await loadAllData();
  };

  const handleToggleInvoicePaid = async (invoice) => {
    const newStatus = invoice.status === 'paid' ? 'sent' : 'paid';
    await api.updateInvoice(invoice.id, {
      ...invoice,
      status: newStatus,
      paidAt: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
    });
    await loadAllData();
  };

  // Expense Actions
  const handleSaveExpense = async (data) => {
    if (editingExpense) {
      await api.updateExpense(editingExpense.id, data);
    } else {
      await api.createExpense(data);
    }
    await loadAllData();
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Diesen Beleg wirklich löschen?')) return;
    await api.deleteExpense(id);
    await loadAllData();
  };

  // Mileage Actions
  const handleSaveMileage = async (data) => {
    if (editingMileage) {
      await api.updateMileage(editingMileage.id, data);
    } else {
      await api.createMileage(data);
    }
    await loadAllData();
    setEditingMileage(null);
  };

  const handleDeleteMileage = async (id) => {
    if (!window.confirm('Diese Fahrt wirklich löschen?')) return;
    await api.deleteMileage(id);
    await loadAllData();
  };

  // Navigation helpers
  const handleSelectCustomer = (id) => {
    navigateTo('customer-detail', id);
  };

  const handleBulkGenerateAbos = async (targetType = 'all') => {
    try {
      const res = await api.generateMonthlyAboInvoices(targetType);
      await loadAllData();
      if (res.createdCount > 0) {
        const typeLabel = targetType === 'abo' ? 'Abo-Rechnung(en)' : targetType === 'einmalig' ? 'Einmalleistungs-Rechnung(en)' : 'Rechnung(en)';
        alert(`Erfolg: ${res.createdCount} ${typeLabel} wurden automatisch erstellt!`);
      } else {
        alert('Alle ausgewählten Positionen wurden bereits abgerechnet.');
      }
    } catch (err) {
      alert('Fehler bei der automatischen Abrechnung: ' + err.message);
    }
  };

  const handleOpenDemoEmail = (cust, templateKey = 'digitalisierung_intro') => {
    setDemoEmailCustomer(cust);
    setDemoEmailTemplateKey(templateKey);
    setDemoEmailModalOpen(true);
  };

  const handleOpenService = (custId, custName, service = null) => {
    setServiceModalCustId(custId);
    setServiceModalCustName(custName);
    setEditingService(service);
    setServiceModalOpen(true);
  };

  const handleOpenInvoiceModal = (preselectedCustId = null, invoice = null, prefilledItem = null) => {
    setPreselectedInvoiceCustId(preselectedCustId);
    setEditingInvoice(invoice);
    setPrefilledInvoiceItem(prefilledItem);
    setInvoiceModalOpen(true);
  };

  const handleOpenMileageModal = (preselectedCustId = null, mileageItem = null) => {
    setPreselectedMileageCustId(preselectedCustId);
    setEditingMileage(mileageItem);
    setMileageModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedViewInvoice(invoice);
    setViewInvoiceModalOpen(true);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full max-w-full bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab === 'customer-detail' ? 'customers' : activeTab} 
        setActiveTab={(tab) => navigateTo(tab)}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        counts={{
          customers: customers.length,
          pendingInvoices: invoices.filter(i => i.status === 'sent').length,
          expenses: expenses.length
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full h-full overflow-hidden">
        <Navbar 
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)} 
          onOpenCustomerModal={() => {
            setEditingCustomer(null);
            setCustomerModalOpen(true);
          }}
          onOpenInvoiceModal={() => handleOpenInvoiceModal()}
          onOpenExpenseModal={() => {
            setEditingExpense(null);
            setExpenseModalOpen(true);
          }}
          onOpenMileageModal={() => handleOpenMileageModal()}
          companySettings={companySettings}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 max-w-full pb-24 md:pb-6 smooth-scroll overscroll-contain">
          {activeTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              customers={customers}
              services={services}
              invoices={invoices}
              onNavigate={(tab) => navigateTo(tab)}
              onOpenCustomerModal={() => {
                setEditingCustomer(null);
                setCustomerModalOpen(true);
              }}
              onOpenInvoiceModal={() => handleOpenInvoiceModal()}
              onOpenLogoPreview={() => setLogoModalOpen(true)}
              onSelectCustomer={(id) => navigateTo('customer-detail', id)}
              onViewInvoice={handleViewInvoice}
              onBulkGenerateAbos={handleBulkGenerateAbos}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              customers={customers}
              onSelectCustomer={(id) => navigateTo('customer-detail', id)}
              onOpenCustomerModal={() => {
                setEditingCustomer(null);
                setCustomerModalOpen(true);
              }}
              onOpenDemoEmailModal={handleOpenDemoEmail}
              onOpenInvoiceModal={(custId) => handleOpenInvoiceModal(custId)}
              onNavigateToDisposition={(custId) => {
                setDispositionCustomerId(custId || null);
                navigateTo('disposition');
              }}
              onEditCustomer={(cust) => {
                setEditingCustomer(cust);
                setCustomerModalOpen(true);
              }}
              onUpdateCustomerStatus={async (id, newStatus) => {
                const cust = customers.find(c => c.id === id);
                if (cust) {
                  await api.updateCustomer(id, { ...cust, status: newStatus });
                  await loadAllData();
                }
              }}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'disposition' && (
            <DispositionKanbanPage
              customers={customers}
              companySettings={companySettings}
              initialCustomerId={dispositionCustomerId}
              onSelectCustomer={(id) => navigateTo('customer-detail', id)}
              onOpenCustomerModal={() => {
                setEditingCustomer(null);
                setCustomerModalOpen(true);
              }}
              onOpenInvoiceModal={(custId, inv, prefilled) => handleOpenInvoiceModal(custId, inv, prefilled)}
              onReloadAllData={loadAllData}
            />
          )}

          {activeTab === 'customer-detail' && selectedCustomerId && (
            <CustomerDetailPage
              customerId={selectedCustomerId}
              refreshKey={dataRefreshKey}
              onBack={() => navigateTo('customers')}
              onOpenDemoEmailModal={handleOpenDemoEmail}
              onOpenServiceModal={(custId, custName) => handleOpenService(custId, custName)}
              onEditService={(srv) => {
                const cust = customers.find(c => c.id === selectedCustomerId);
                handleOpenService(selectedCustomerId, cust ? cust.companyName : '', srv);
              }}
              onOpenInvoiceModal={(custId, inv, prefilled) => handleOpenInvoiceModal(custId, inv, prefilled)}
              onOpenMileageModal={(custId) => handleOpenMileageModal(custId)}
              onNavigateToDisposition={(custId) => {
                setDispositionCustomerId(custId || selectedCustomerId);
                navigateTo('disposition');
              }}
              onViewInvoice={handleViewInvoice}
              onEditCustomer={(cust) => {
                setEditingCustomer(cust);
                setCustomerModalOpen(true);
              }}
              onReloadAllData={loadAllData}
            />
          )}

          {(activeTab === 'pricing-offers' || activeTab === 'abnahme') && (
            <PricingOffersPage
              initialTab={activeTab === 'abnahme' ? 'abnahme' : 'creator'}
              customers={customers}
              companySettings={companySettings}
              onOpenCustomerModal={() => {
                setEditingCustomer(null);
                setCustomerModalOpen(true);
              }}
              onConvertToInvoice={(offer) => {
                const prefilled = {
                  title: `${offer.type === 'kostenvoranschlag' ? 'Kostenvoranschlag' : 'Angebot'} ${offer.offerNumber}`,
                  price: offer.totalOneTime || offer.totalAmount || 0,
                  type: 'einmalig'
                };
                handleOpenInvoiceModal(offer.customerId, null, prefilled);
              }}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesPage
              invoices={invoices}
              onOpenInvoiceModal={() => handleOpenInvoiceModal()}
              onEditInvoice={(inv) => handleOpenInvoiceModal(inv.customerId, inv)}
              onDeleteInvoice={handleDeleteInvoice}
              onTogglePaid={handleToggleInvoicePaid}
              onViewInvoice={handleViewInvoice}
              onBulkGenerateAbos={handleBulkGenerateAbos}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesPage
              expenses={expenses}
              onOpenExpenseModal={() => {
                setEditingExpense(null);
                setExpenseModalOpen(true);
              }}
              onEditExpense={(exp) => {
                setEditingExpense(exp);
                setExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'mileage' && (
            <MileagePage
              mileage={mileage}
              onOpenMileageModal={() => handleOpenMileageModal()}
              onEditMileage={(m) => handleOpenMileageModal(m.customerId, m)}
              onDeleteMileage={handleDeleteMileage}
            />
          )}

          {activeTab === 'tax-report' && (
            <TaxReportPage />
          )}

          {activeTab === 'backup' && (
            <BackupPage 
              customers={customers}
              invoices={invoices}
              expenses={expenses}
              mileage={mileage}
              onReloadAllData={loadAllData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar with Smooth Touch Swiping */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/98 backdrop-blur-md border-t border-slate-800 z-40 text-slate-400 select-none pb-[env(safe-area-inset-bottom,0px)] shadow-2xl">
          <div className="flex items-center overflow-x-auto no-scrollbar py-2 px-2.5 gap-1.5 scroll-smooth touch-pan-x min-w-0">
            {/* Quick Menu Opener */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center shrink-0 px-2.5 py-1 text-[10px] font-bold text-slate-200 hover:text-white bg-slate-800 rounded-xl transition border border-slate-700 min-w-[56px] cursor-pointer"
              title={isTR ? 'Tüm Menüyü Aç' : 'Hauptmenü'}
            >
              <Menu className="w-4 h-4 mb-0.5 text-sky-400" />
              <span>{isTR ? 'Menü' : 'Menü'}</span>
            </button>

            {/* Scrollable Navigation Tabs for All Modules */}
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'customers', label: isTR ? 'Müşteriler' : 'Kunden', icon: Users, isActive: activeTab === 'customers' || activeTab === 'customer-detail' },
              { id: 'disposition', label: isTR ? 'İş Planı' : 'Disposition', icon: Trello },
              { id: 'pricing-offers', label: isTR ? 'Teklifler' : 'Angebote', icon: Tag },
              { id: 'abnahme', label: isTR ? 'Teslimat' : 'Abnahme', icon: ShieldCheck },
              { id: 'invoices', label: isTR ? 'Faturalar' : 'Rechnungen', icon: FileText },
              { id: 'expenses', label: isTR ? 'Giderler' : 'Ausgaben', icon: Receipt },
              { id: 'mileage', label: isTR ? 'KM Takip' : 'KM Fahrten', icon: Car },
              { id: 'tax-report', label: isTR ? 'Finanzamt' : 'Finanzamt', icon: Landmark },
              { id: 'backup', label: isTR ? 'Yedek' : 'Backup', icon: ShieldCheck },
              { id: 'settings', label: isTR ? 'Ayarlar' : 'Optionen', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive !== undefined ? item.isActive : activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`flex flex-col items-center justify-center shrink-0 px-3 py-1.5 text-[10.5px] rounded-xl transition cursor-pointer min-w-[66px] ${
                    isActive
                      ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="truncate max-w-[72px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* GLOBAL MODALS */}
      <CustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
        existingCustomers={customers}
      />

      <DemoEmailModal
        isOpen={demoEmailModalOpen}
        onClose={() => setDemoEmailModalOpen(false)}
        customer={demoEmailCustomer}
        initialTemplateKey={demoEmailTemplateKey}
        onEmailSent={handleDemoEmailSent}
      />

      <ServiceModal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        onSave={handleSaveService}
        service={editingService}
        customerId={serviceModalCustId}
        customerName={serviceModalCustName}
      />

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
        invoice={editingInvoice}
        customers={customers}
        preselectedCustomerId={preselectedInvoiceCustId}
        prefilledItem={prefilledInvoiceItem}
      />

      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        expense={editingExpense}
      />

      <MileageModal
        isOpen={mileageModalOpen}
        onClose={() => setMileageModalOpen(false)}
        onSave={handleSaveMileage}
        mileage={editingMileage}
        customers={customers}
        preselectedCustomerId={preselectedMileageCustId}
      />

      <InvoiceViewModal
        isOpen={viewInvoiceModalOpen}
        onClose={() => setViewInvoiceModalOpen(false)}
        invoice={selectedViewInvoice}
        companySettings={companySettings}
      />

      <LogoPreviewModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
      />
    </div>
  );
}
