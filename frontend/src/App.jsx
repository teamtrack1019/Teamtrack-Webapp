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
import SettingsPage from './pages/SettingsPage';

// Modals
import CustomerModal from './components/CustomerModal';
import DemoEmailModal from './components/DemoEmailModal';
import ServiceModal from './components/ServiceModal';
import InvoiceModal from './components/InvoiceModal';
import ExpenseModal from './components/ExpenseModal';
import MileageModal from './components/MileageModal';
import InvoiceViewModal from './components/InvoiceViewModal';

import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Global state
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [mileage, setMileage] = useState([]);
  const [companySettings, setCompanySettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [demoEmailModalOpen, setDemoEmailModalOpen] = useState(false);
  const [demoEmailCustomer, setDemoEmailCustomer] = useState(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalCustId, setServiceModalCustId] = useState(null);
  const [serviceModalCustName, setServiceModalCustName] = useState('');
  const [editingService, setEditingService] = useState(null);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [preselectedInvoiceCustId, setPreselectedInvoiceCustId] = useState(null);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [mileageModalOpen, setMileageModalOpen] = useState(false);
  const [editingMileage, setEditingMileage] = useState(null);
  const [preselectedMileageCustId, setPreselectedMileageCustId] = useState(null);

  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);
  const [selectedViewInvoice, setSelectedViewInvoice] = useState(null);

  // Load all core data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, custData, invData, expData, milData, settingsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getCustomers().catch(() => []),
        api.getInvoices().catch(() => []),
        api.getExpenses().catch(() => []),
        api.getMileage().catch(() => []),
        api.getSettings().catch(() => ({}))
      ]);

      setStats(statsData);
      setCustomers(custData);
      setInvoices(invData);
      setExpenses(expData);
      setMileage(milData);
      setCompanySettings(settingsData);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
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
    if (selectedCustomerId === id) setSelectedCustomerId(null);
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
    setSelectedCustomerId(id);
    setActiveTab('customer-detail');
  };

  const handleOpenDemoEmail = (cust) => {
    setDemoEmailCustomer(cust);
    setDemoEmailModalOpen(true);
  };

  const handleOpenService = (custId, custName, service = null) => {
    setServiceModalCustId(custId);
    setServiceModalCustName(custName);
    setEditingService(service);
    setServiceModalOpen(true);
  };

  const handleOpenInvoiceModal = (preselectedCustId = null, invoice = null) => {
    setPreselectedInvoiceCustId(preselectedCustId);
    setEditingInvoice(invoice);
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
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab === 'customer-detail' ? 'customers' : activeTab} 
        setActiveTab={(tab) => {
          setSelectedCustomerId(null);
          setActiveTab(tab);
        }}
        counts={{
          customers: customers.length,
          pendingInvoices: invoices.filter(i => i.status === 'sent').length,
          expenses: expenses.length
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCustomerModal={() => {
            setEditingCustomer(null);
            setCustomerModalOpen(true);
          }}
          onOpenInvoiceModal={() => handleOpenInvoiceModal()}
          onOpenMileageModal={() => handleOpenMileageModal()}
          onOpenExpenseModal={() => {
            setEditingExpense(null);
            setExpenseModalOpen(true);
          }}
        />

        {/* Page Views */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              onNavigate={(tab) => {
                setSelectedCustomerId(null);
                setActiveTab(tab);
              }}
              onOpenCustomerModal={() => {
                setEditingCustomer(null);
                setCustomerModalOpen(true);
              }}
              onOpenInvoiceModal={() => handleOpenInvoiceModal()}
              onOpenMileageModal={() => handleOpenMileageModal()}
              onOpenExpenseModal={() => {
                setEditingExpense(null);
                setExpenseModalOpen(true);
              }}
              onSelectCustomer={handleSelectCustomer}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onOpenCustomerModal={() => {
                setEditingCustomer(null);
                setCustomerModalOpen(true);
              }}
              onOpenDemoEmailModal={handleOpenDemoEmail}
              onOpenInvoiceModal={(custId) => handleOpenInvoiceModal(custId)}
              onEditCustomer={(cust) => {
                setEditingCustomer(cust);
                setCustomerModalOpen(true);
              }}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'customer-detail' && selectedCustomerId && (
            <CustomerDetailPage
              customerId={selectedCustomerId}
              onBack={() => {
                setSelectedCustomerId(null);
                setActiveTab('customers');
              }}
              onOpenDemoEmailModal={handleOpenDemoEmail}
              onOpenServiceModal={(custId, custName) => handleOpenService(custId, custName)}
              onOpenInvoiceModal={(custId) => handleOpenInvoiceModal(custId)}
              onOpenMileageModal={(custId) => handleOpenMileageModal(custId)}
              onViewInvoice={handleViewInvoice}
              onEditCustomer={(cust) => {
                setEditingCustomer(cust);
                setCustomerModalOpen(true);
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

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <CustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />

      <DemoEmailModal
        isOpen={demoEmailModalOpen}
        onClose={() => setDemoEmailModalOpen(false)}
        customer={demoEmailCustomer}
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
    </div>
  );
}
