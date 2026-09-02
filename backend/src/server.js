import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { initDb, saveDb, getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database
await initDb();

// -------------------------------------------------------------
// Helper functions
// -------------------------------------------------------------
function generateInvoiceNumber(db) {
  const currentYear = new Date().getFullYear();
  const prefix = db.companySettings.invoicePrefix || `RE-${currentYear}-`;
  const existingNumbers = db.invoices
    .map(inv => inv.invoiceNumber)
    .filter(num => num && num.startsWith(prefix));
  
  let maxSeq = 0;
  for (const num of existingNumbers) {
    const seqStr = num.replace(prefix, '');
    const seq = parseInt(seqStr, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

function generateExpenseNumber(db) {
  const currentYear = new Date().getFullYear();
  const prefix = db.companySettings.expensePrefix || `BE-${currentYear}-`;
  const existingNumbers = db.expenses
    .map(exp => exp.expenseNumber)
    .filter(num => num && num.startsWith(prefix));
  
  let maxSeq = 0;
  for (const num of existingNumbers) {
    const seqStr = num.replace(prefix, '');
    const seq = parseInt(seqStr, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
app.get('/api/dashboard/stats', (req, res) => {
  const db = getDb();
  
  // Calculate MRR (Monthly Recurring Revenue from active Abos)
  const activeAbos = db.services.filter(s => s.type === 'abo' && s.status === 'active');
  const mrr = activeAbos.reduce((sum, s) => {
    let monthly = s.price;
    if (s.billingInterval === 'yearly') monthly = s.price / 12;
    if (s.billingInterval === 'quarterly') monthly = s.price / 3;
    return sum + Number(monthly || 0);
  }, 0);

  // Total Invoiced & Total Paid (All time / current year)
  const paidInvoices = db.invoices.filter(i => i.status === 'paid');
  const totalPaidRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.netAmount || 0), 0);
  const totalGrossRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.grossAmount || 0), 0);
  
  const pendingInvoices = db.invoices.filter(i => i.status === 'sent' || i.status === 'draft');
  const totalPendingAmount = pendingInvoices.reduce((sum, i) => sum + Number(i.grossAmount || 0), 0);

  // Total Expenses
  const totalExpenses = db.expenses.reduce((sum, e) => sum + Number(e.netAmount || 0), 0);
  const totalExpensesGross = db.expenses.reduce((sum, e) => sum + Number(e.grossAmount || 0), 0);

  // Total Mileage & Tax Deduction
  const totalKm = db.mileage.reduce((sum, m) => sum + Number(m.kilometers || 0), 0);
  const totalKmDeduction = db.mileage.reduce((sum, m) => sum + Number(m.totalDeduction || 0), 0);

  // Customers count
  const totalCustomers = db.customers.length;
  const activeCustomers = db.customers.filter(c => c.status === 'active').length;
  const leadCustomers = db.customers.filter(c => c.status === 'lead').length;

  res.json({
    mrr,
    activeAbosCount: activeAbos.length,
    totalPaidRevenue,
    totalGrossRevenue,
    totalPendingAmount,
    pendingInvoicesCount: pendingInvoices.length,
    totalExpenses,
    totalExpensesGross,
    totalKm,
    totalKmDeduction,
    totalCustomers,
    activeCustomers,
    leadCustomers,
    recentInvoices: db.invoices.slice(-5).reverse(),
    recentCustomers: db.customers.slice(-5).reverse(),
    recentMileage: db.mileage.slice(-5).reverse()
  });
});

// -------------------------------------------------------------
// CUSTOMERS CRUD & EMAIL TRACKING
// -------------------------------------------------------------
app.get('/api/customers', (req, res) => {
  const db = getDb();
  // enrich customer with active services count and total revenue
  const enriched = db.customers.map(cust => {
    const custServices = db.services.filter(s => s.customerId === cust.id);
    const custInvoices = db.invoices.filter(i => i.customerId === cust.id);
    const activeAbos = custServices.filter(s => s.type === 'abo' && s.status === 'active');
    const totalAboMonthly = activeAbos.reduce((sum, s) => sum + Number(s.price || 0), 0);
    const einmaligeServices = custServices.filter(s => s.type === 'einmalig');
    const totalRevenue = custInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.netAmount || 0), 0);
    
    return {
      ...cust,
      activeAbosCount: activeAbos.length,
      totalAboMonthly,
      einmaligeCount: einmaligeServices.length,
      totalRevenue,
      invoicesCount: custInvoices.length
    };
  });
  res.json(enriched);
});

app.get('/api/customers/:id', (req, res) => {
  const db = getDb();
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Kunde nicht gefunden' });

  const services = db.services.filter(s => s.customerId === customer.id);
  const invoices = db.invoices.filter(i => i.customerId === customer.id);
  const mileage = db.mileage.filter(m => m.customerId === customer.id);
  const emailLogs = db.emailLogs.filter(e => e.customerId === customer.id);

  res.json({
    customer,
    services,
    invoices,
    mileage,
    emailLogs
  });
});

app.post('/api/customers', async (req, res) => {
  const db = getDb();
  const newCustomer = {
    id: `cust-${Date.now()}`,
    companyName: req.body.companyName || 'Unbekanntes Unternehmen',
    contactPerson: req.body.contactPerson || '',
    email: req.body.email || '',
    phone: req.body.phone || '',
    address: req.body.address || '',
    taxNumber: req.body.taxNumber || '',
    status: req.body.status || 'lead',
    businessType: req.body.businessType || 'Papierkram Digitalisierung',
    notes: req.body.notes || '',
    demoEmailSent: false,
    demoEmailSentAt: null,
    demoEmailTemplate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.customers.push(newCustomer);
  await saveDb();
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', async (req, res) => {
  const db = getDb();
  const index = db.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Kunde nicht gefunden' });

  db.customers[index] = {
    ...db.customers[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  await saveDb();
  res.json(db.customers[index]);
});

app.delete('/api/customers/:id', async (req, res) => {
  const db = getDb();
  const index = db.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Kunde nicht gefunden' });

  const deleted = db.customers.splice(index, 1)[0];
  await saveDb();
  res.json(deleted);
});

// Mark / Send Demo Email Tracker
app.post('/api/customers/:id/send-demo-email', async (req, res) => {
  const db = getDb();
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Kunde nicht gefunden' });

  const { subject, body, templateType } = req.body;
  const sentAt = new Date().toISOString();

  // Update customer demo badge
  customer.demoEmailSent = true;
  customer.demoEmailSentAt = sentAt;
  customer.demoEmailTemplate = templateType || 'digitalisierung_intro';
  customer.updatedAt = sentAt;

  // Create log entry
  const emailLog = {
    id: `mail-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.companyName,
    recipientEmail: customer.email,
    subject: subject || `Vorstellung: Digitale Lösungen & Papierkram-Optimierung`,
    templateType: templateType || 'digitalisierung_intro',
    sentAt,
    body: body || ''
  };

  db.emailLogs.push(emailLog);
  await saveDb();

  res.json({
    success: true,
    message: 'Tanıtım / Demo E-Postası başarıyla kaydedildi.',
    customer,
    emailLog
  });
});

// -------------------------------------------------------------
// SERVICES CRUD (Abo & Einmalig)
// -------------------------------------------------------------
app.get('/api/services', (req, res) => {
  const db = getDb();
  let list = db.services;
  if (req.query.customerId) {
    list = list.filter(s => s.customerId === req.query.customerId);
  }
  res.json(list);
});

app.post('/api/services', async (req, res) => {
  const db = getDb();
  const newService = {
    id: `srv-${Date.now()}`,
    customerId: req.body.customerId,
    type: req.body.type || 'abo', // 'abo' or 'einmalig'
    title: req.body.title || '',
    description: req.body.description || '',
    price: Number(req.body.price || 0),
    billingInterval: req.body.type === 'abo' ? (req.body.billingInterval || 'monthly') : null,
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    status: req.body.status || 'active',
    createdAt: new Date().toISOString()
  };

  db.services.push(newService);
  await saveDb();
  res.status(201).json(newService);
});

app.put('/api/services/:id', async (req, res) => {
  const db = getDb();
  const index = db.services.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Leistung nicht gefunden' });

  db.services[index] = {
    ...db.services[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : db.services[index].price
  };

  await saveDb();
  res.json(db.services[index]);
});

app.delete('/api/services/:id', async (req, res) => {
  const db = getDb();
  const index = db.services.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Leistung nicht gefunden' });

  const deleted = db.services.splice(index, 1)[0];
  await saveDb();
  res.json(deleted);
});

// -------------------------------------------------------------
// INVOICES CRUD (Ausgehende Rechnungen)
// -------------------------------------------------------------
app.get('/api/invoices', (req, res) => {
  const db = getDb();
  let list = db.invoices;
  if (req.query.customerId) {
    list = list.filter(i => i.customerId === req.query.customerId);
  }
  res.json(list);
});

app.get('/api/invoices/:id', (req, res) => {
  const db = getDb();
  const invoice = db.invoices.find(i => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Rechnung nicht gefunden' });
  res.json(invoice);
});

app.post('/api/invoices', async (req, res) => {
  const db = getDb();
  const items = req.body.items || [];
  const taxRate = Number(req.body.taxRate !== undefined ? req.body.taxRate : db.companySettings.defaultTaxRate || 19);
  
  const netAmount = items.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 1)), 0);
  const taxAmount = Number(((netAmount * taxRate) / 100).toFixed(2));
  const grossAmount = Number((netAmount + taxAmount).toFixed(2));

  const invoiceNumber = req.body.invoiceNumber || generateInvoiceNumber(db);

  const newInvoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    customerId: req.body.customerId || '',
    customerName: req.body.customerName || '',
    customerAddress: req.body.customerAddress || '',
    customerTaxId: req.body.customerTaxId || '',
    customerEmail: req.body.customerEmail || '',
    type: 'outgoing',
    date: req.body.date || new Date().toISOString().split('T')[0],
    dueDate: req.body.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: req.body.status || 'draft',
    paidAt: req.body.status === 'paid' ? (req.body.paidAt || new Date().toISOString().split('T')[0]) : null,
    taxRate,
    netAmount,
    taxAmount,
    grossAmount,
    items: items.map(item => ({
      id: item.id || `item-${uuidv4()}`,
      description: item.description || '',
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice || 0),
      taxRate: Number(item.taxRate || taxRate),
      total: Number(item.unitPrice || 0) * Number(item.quantity || 1)
    })),
    notes: req.body.notes || 'Vielen Dank für die Zusammenarbeit.',
    paymentTerms: req.body.paymentTerms || 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
    createdAt: new Date().toISOString()
  };

  db.invoices.push(newInvoice);
  await saveDb();
  res.status(201).json(newInvoice);
});

app.put('/api/invoices/:id', async (req, res) => {
  const db = getDb();
  const index = db.invoices.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rechnung nicht gefunden' });

  const existing = db.invoices[index];
  const items = req.body.items || existing.items;
  const taxRate = Number(req.body.taxRate !== undefined ? req.body.taxRate : existing.taxRate);

  const netAmount = items.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 1)), 0);
  const taxAmount = Number(((netAmount * taxRate) / 100).toFixed(2));
  const grossAmount = Number((netAmount + taxAmount).toFixed(2));

  let paidAt = req.body.paidAt !== undefined ? req.body.paidAt : existing.paidAt;
  if (req.body.status === 'paid' && !paidAt) {
    paidAt = new Date().toISOString().split('T')[0];
  } else if (req.body.status && req.body.status !== 'paid') {
    paidAt = null;
  }

  db.invoices[index] = {
    ...existing,
    ...req.body,
    taxRate,
    netAmount,
    taxAmount,
    grossAmount,
    paidAt,
    items
  };

  await saveDb();
  res.json(db.invoices[index]);
});

app.delete('/api/invoices/:id', async (req, res) => {
  const db = getDb();
  const index = db.invoices.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rechnung nicht gefunden' });

  const deleted = db.invoices.splice(index, 1)[0];
  await saveDb();
  res.json(deleted);
});

// -------------------------------------------------------------
// EXPENSES CRUD (Eingehende Rechnungen / Ausgaben)
// -------------------------------------------------------------
app.get('/api/expenses', (req, res) => {
  const db = getDb();
  res.json(db.expenses);
});

app.post('/api/expenses', async (req, res) => {
  const db = getDb();
  const netAmount = Number(req.body.netAmount || 0);
  const taxRate = Number(req.body.taxRate !== undefined ? req.body.taxRate : 19);
  const taxAmount = Number(((netAmount * taxRate) / 100).toFixed(2));
  const grossAmount = Number((netAmount + taxAmount).toFixed(2));
  const expenseNumber = req.body.expenseNumber || generateExpenseNumber(db);

  const newExpense = {
    id: `exp-${Date.now()}`,
    expenseNumber,
    vendor: req.body.vendor || '',
    category: req.body.category || 'Software & Hosting',
    date: req.body.date || new Date().toISOString().split('T')[0],
    netAmount,
    taxRate,
    taxAmount,
    grossAmount,
    paymentMethod: req.body.paymentMethod || 'Banküberweisung',
    status: req.body.status || 'paid',
    notes: req.body.notes || '',
    receiptFileName: req.body.receiptFileName || null,
    createdAt: new Date().toISOString()
  };

  db.expenses.push(newExpense);
  await saveDb();
  res.status(201).json(newExpense);
});

app.put('/api/expenses/:id', async (req, res) => {
  const db = getDb();
  const index = db.expenses.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ausgabe nicht gefunden' });

  const netAmount = req.body.netAmount !== undefined ? Number(req.body.netAmount) : db.expenses[index].netAmount;
  const taxRate = req.body.taxRate !== undefined ? Number(req.body.taxRate) : db.expenses[index].taxRate;
  const taxAmount = Number(((netAmount * taxRate) / 100).toFixed(2));
  const grossAmount = Number((netAmount + taxAmount).toFixed(2));

  db.expenses[index] = {
    ...db.expenses[index],
    ...req.body,
    netAmount,
    taxRate,
    taxAmount,
    grossAmount
  };

  await saveDb();
  res.json(db.expenses[index]);
});

app.delete('/api/expenses/:id', async (req, res) => {
  const db = getDb();
  const index = db.expenses.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ausgabe nicht gefunden' });

  const deleted = db.expenses.splice(index, 1)[0];
  await saveDb();
  res.json(deleted);
});

// -------------------------------------------------------------
// MILEAGE / FAHRTENBUCH CRUD (Finanzamt KM)
// -------------------------------------------------------------
app.get('/api/mileage', (req, res) => {
  const db = getDb();
  let list = db.mileage;
  if (req.query.customerId) {
    list = list.filter(m => m.customerId === req.query.customerId);
  }
  res.json(list);
});

app.post('/api/mileage', async (req, res) => {
  const db = getDb();
  const kmRate = Number(req.body.ratePerKm || db.companySettings.kmRate || 0.30);
  const kilometers = Number(req.body.kilometers || 0);
  const totalDeduction = Number((kilometers * kmRate).toFixed(2));

  const newEntry = {
    id: `mil-${Date.now()}`,
    date: req.body.date || new Date().toISOString().split('T')[0],
    customerId: req.body.customerId || null,
    customerName: req.body.customerName || null,
    startLocation: req.body.startLocation || 'Büro / Home-Office',
    destination: req.body.destination || '',
    purpose: req.body.purpose || 'Kundenbesuch Digitalisierung',
    kilometers,
    ratePerKm: kmRate,
    totalDeduction,
    isReturnTrip: req.body.isReturnTrip !== undefined ? Boolean(req.body.isReturnTrip) : true,
    notes: req.body.notes || '',
    createdAt: new Date().toISOString()
  };

  db.mileage.push(newEntry);
  await saveDb();
  res.status(201).json(newEntry);
});

app.put('/api/mileage/:id', async (req, res) => {
  const db = getDb();
  const index = db.mileage.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Fahrt nicht gefunden' });

  const kilometers = req.body.kilometers !== undefined ? Number(req.body.kilometers) : db.mileage[index].kilometers;
  const kmRate = req.body.ratePerKm !== undefined ? Number(req.body.ratePerKm) : db.mileage[index].ratePerKm;
  const totalDeduction = Number((kilometers * kmRate).toFixed(2));

  db.mileage[index] = {
    ...db.mileage[index],
    ...req.body,
    kilometers,
    ratePerKm: kmRate,
    totalDeduction
  };

  await saveDb();
  res.json(db.mileage[index]);
});

app.delete('/api/mileage/:id', async (req, res) => {
  const db = getDb();
  const index = db.mileage.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Fahrt nicht gefunden' });

  const deleted = db.mileage.splice(index, 1)[0];
  await saveDb();
  res.json(deleted);
});

// -------------------------------------------------------------
// FINANZAMT & EÜR TAX REPORT
// -------------------------------------------------------------
app.get('/api/reports/tax-year/:year', (req, res) => {
  const db = getDb();
  const year = req.params.year;

  // Filter items belonging to the selected year
  const yearInvoices = db.invoices.filter(i => (i.date && i.date.startsWith(year)));
  const yearPaidInvoices = yearInvoices.filter(i => i.status === 'paid');

  const yearExpenses = db.expenses.filter(e => (e.date && e.date.startsWith(year)));
  const yearMileage = db.mileage.filter(m => (m.date && m.date.startsWith(year)));

  // Revenue Totals
  const totalRevenueNet = yearPaidInvoices.reduce((s, i) => s + Number(i.netAmount || 0), 0);
  const totalRevenueTax = yearPaidInvoices.reduce((s, i) => s + Number(i.taxAmount || 0), 0);
  const totalRevenueGross = yearPaidInvoices.reduce((s, i) => s + Number(i.grossAmount || 0), 0);

  // Expense Totals
  const totalExpensesNet = yearExpenses.reduce((s, e) => s + Number(e.netAmount || 0), 0);
  const totalExpensesTax = yearExpenses.reduce((s, e) => s + Number(e.taxAmount || 0), 0);
  const totalExpensesGross = yearExpenses.reduce((s, e) => s + Number(e.grossAmount || 0), 0);

  // Expenses grouped by category
  const expensesByCategory = {};
  for (const exp of yearExpenses) {
    const cat = exp.category || 'Sonstiges';
    if (!expensesByCategory[cat]) expensesByCategory[cat] = { net: 0, tax: 0, gross: 0, count: 0 };
    expensesByCategory[cat].net += Number(exp.netAmount || 0);
    expensesByCategory[cat].tax += Number(exp.taxAmount || 0);
    expensesByCategory[cat].gross += Number(exp.grossAmount || 0);
    expensesByCategory[cat].count += 1;
  }

  // Mileage Totals
  const totalKm = yearMileage.reduce((s, m) => s + Number(m.kilometers || 0), 0);
  const totalMileageDeduction = yearMileage.reduce((s, m) => s + Number(m.totalDeduction || 0), 0);

  // Profit Calculation (EÜR)
  // Net Profit = Revenue (Net) - Expenses (Net) - KM Pauschale
  const netProfit = Number((totalRevenueNet - totalExpensesNet - totalMileageDeduction).toFixed(2));
  
  // Tax balance (Umsatzsteuerzahllast = vereinnahmte USt - abziehbare Vorsteuer)
  const vatPayable = Number((totalRevenueTax - totalExpensesTax).toFixed(2));

  res.json({
    year,
    company: db.companySettings,
    revenue: {
      net: Number(totalRevenueNet.toFixed(2)),
      tax: Number(totalRevenueTax.toFixed(2)),
      gross: Number(totalRevenueGross.toFixed(2)),
      invoicesCount: yearPaidInvoices.length,
      allInvoicesCount: yearInvoices.length,
      items: yearPaidInvoices
    },
    expenses: {
      net: Number(totalExpensesNet.toFixed(2)),
      tax: Number(totalExpensesTax.toFixed(2)),
      gross: Number(totalExpensesGross.toFixed(2)),
      count: yearExpenses.length,
      byCategory: expensesByCategory,
      items: yearExpenses
    },
    mileage: {
      totalKm: Number(totalKm.toFixed(1)),
      ratePerKm: db.companySettings.kmRate || 0.30,
      totalDeduction: Number(totalMileageDeduction.toFixed(2)),
      tripsCount: yearMileage.length,
      items: yearMileage
    },
    summary: {
      netProfit,
      vatPayable,
      vatCollected: Number(totalRevenueTax.toFixed(2)),
      inputVatDeductible: Number(totalExpensesTax.toFixed(2))
    }
  });
});

// -------------------------------------------------------------
// COMPANY SETTINGS CRUD
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  const db = getDb();
  res.json(db.companySettings);
});

app.put('/api/settings', async (req, res) => {
  const db = getDb();
  db.companySettings = {
    ...db.companySettings,
    ...req.body
  };
  await saveDb();
  res.json(db.companySettings);
});

// Start Server
app.listen(PORT, () => {
  console.log(`TeamTrack Backend running on http://localhost:${PORT}`);
});
