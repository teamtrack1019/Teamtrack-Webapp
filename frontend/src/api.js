const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Customers
  getCustomers: () => request('/customers'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  sendDemoEmail: (id, data) => request(`/customers/${id}/send-demo-email`, { method: 'POST', body: JSON.stringify(data) }),

  // Services (Abo vs Einmalig)
  getServices: (customerId) => request(`/services${customerId ? `?customerId=${customerId}` : ''}`),
  createService: (data) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

  // Invoices (Ausgehend)
  getInvoices: (customerId) => request(`/invoices${customerId ? `?customerId=${customerId}` : ''}`),
  getInvoice: (id) => request(`/invoices/${id}`),
  createInvoice: (data) => request('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id, data) => request(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvoice: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),

  // Expenses (Eingehend)
  getExpenses: () => request('/expenses'),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Mileage / Fahrtenbuch
  getMileage: (customerId) => request(`/mileage${customerId ? `?customerId=${customerId}` : ''}`),
  createMileage: (data) => request('/mileage', { method: 'POST', body: JSON.stringify(data) }),
  updateMileage: (id, data) => request(`/mileage/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMileage: (id) => request(`/mileage/${id}`, { method: 'DELETE' }),

  // Tax Report / Finanzamt EÜR
  getTaxReport: (year) => request(`/reports/tax-year/${year}`),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) })
};
