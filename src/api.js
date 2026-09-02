// Initial default seed data for standalone/Vercel static mode
const defaultSeed = {
  companySettings: {
    companyName: 'TeamTrack Digital Solutions',
    ownerName: 'Geschäftsinhaber',
    tagline: 'Papierkram zu digital & Moderne Web-Anwendungen',
    address: 'Musterstraße 42, 10115 Berlin',
    phone: '+49 (0) 30 98765432',
    email: 'info@teamtrack-digital.de',
    website: 'www.teamtrack-digital.de',
    taxNumber: '27/123/45678',
    vatId: 'DE312456789',
    bankName: 'Sparkasse Berlin',
    iban: 'DE44 1005 0000 1023 4567 89',
    bic: 'BELADE100',
    kmRate: 0.30,
    defaultTaxRate: 19,
    paymentTermsDays: 14,
    invoicePrefix: 'RE-2026-',
    expensePrefix: 'BE-2026-'
  },
  customers: [
    {
      id: 'cust-1',
      companyName: 'Schmidt & Partner Bau GmbH',
      contactPerson: 'Klaus Schmidt',
      email: 'klaus.schmidt@schmidt-bau.de',
      phone: '+49 171 2345678',
      address: 'Industriestraße 14, 12099 Berlin',
      taxNumber: 'DE298765432',
      status: 'active',
      businessType: 'Papierkram Digitalisierung & Zeiterfassung',
      notes: 'Baudokumentation und Stundenzettel von Papier auf Tablet-WebApp umgestellt.',
      demoEmailSent: true,
      demoEmailSentAt: '2026-08-15T10:30:00.000Z',
      demoEmailTemplate: 'digitalisierung_intro',
      createdAt: '2026-08-10T09:00:00.000Z',
      updatedAt: '2026-08-20T14:00:00.000Z'
    },
    {
      id: 'cust-2',
      companyName: 'Bäcker Meisterei Lehmann',
      contactPerson: 'Maria Lehmann',
      email: 'kontakt@baeckerei-lehmann.de',
      phone: '+49 30 87654321',
      address: 'Hauptstraße 88, 10827 Berlin',
      taxNumber: '14/234/56789',
      status: 'active',
      businessType: 'Webapp & Rechnungswesen',
      notes: 'Bestellsystem für Filialen und digitale Lieferscheine.',
      demoEmailSent: true,
      demoEmailSentAt: '2026-08-22T14:15:00.000Z',
      demoEmailTemplate: 'digitalisierung_intro',
      createdAt: '2026-08-20T11:00:00.000Z',
      updatedAt: '2026-08-25T16:20:00.000Z'
    },
    {
      id: 'cust-3',
      companyName: 'Elektrotechnik Müller & Söhne',
      contactPerson: 'Stefan Müller',
      email: 's.mueller@elektro-mueller-berlin.de',
      phone: '+49 152 34567890',
      address: 'Gewerbepark Süd 5, 12305 Berlin',
      taxNumber: 'DE345678912',
      status: 'lead',
      businessType: 'Papierkram Digitalisierung',
      notes: 'Interesse an digitaler Baustellendokumentation & Kundenterminen.',
      demoEmailSent: true,
      demoEmailSentAt: '2026-09-01T09:45:00.000Z',
      demoEmailTemplate: 'digitalisierung_intro',
      createdAt: '2026-08-28T08:30:00.000Z',
      updatedAt: '2026-09-01T09:45:00.000Z'
    }
  ],
  services: [
    {
      id: 'srv-1',
      customerId: 'cust-1',
      type: 'abo',
      title: 'TeamTrack Cloud WebApp & Wartung',
      description: 'Monatliche Lizenz für 12 Mitarbeiter, Cloud-Hosting & Datensicherung',
      price: 249.00,
      billingInterval: 'monthly',
      startDate: '2026-08-01',
      status: 'active',
      createdAt: '2026-08-10T10:00:00.000Z'
    },
    {
      id: 'srv-2',
      customerId: 'cust-1',
      type: 'einmalig',
      title: 'Papierkram Digitalisierung & Prozess-Setup',
      description: 'Einrichtung der digitalen Baustellen-Protokolle, Schulung der Poliere & Migration',
      price: 1850.00,
      billingInterval: null,
      startDate: '2026-08-05',
      status: 'completed',
      createdAt: '2026-08-10T10:05:00.000Z'
    },
    {
      id: 'srv-3',
      customerId: 'cust-2',
      type: 'abo',
      title: 'Bäckerei Filial-Webapp & Support',
      description: 'Monatlicher Support, Serverbetrieb und Filialanbindung',
      price: 180.00,
      billingInterval: 'monthly',
      startDate: '2026-08-15',
      status: 'active',
      createdAt: '2026-08-20T11:30:00.000Z'
    },
    {
      id: 'srv-4',
      customerId: 'cust-2',
      type: 'einmalig',
      title: 'Bestellsystem Initial-Entwicklung',
      description: 'Entwicklung der individuellen Web-Anwendung für Filialbestellungen',
      price: 2400.00,
      billingInterval: null,
      startDate: '2026-08-20',
      status: 'completed',
      createdAt: '2026-08-20T11:35:00.000Z'
    }
  ],
  invoices: [
    {
      id: 'inv-1',
      invoiceNumber: 'RE-2026-0001',
      customerId: 'cust-1',
      customerName: 'Schmidt & Partner Bau GmbH',
      customerAddress: 'Industriestraße 14, 12099 Berlin',
      customerTaxId: 'DE298765432',
      type: 'outgoing',
      date: '2026-08-05',
      dueDate: '2026-08-19',
      status: 'paid',
      paidAt: '2026-08-14',
      taxRate: 19,
      netAmount: 1850.00,
      taxAmount: 351.50,
      grossAmount: 2201.50,
      items: [
        {
          id: 'item-1',
          description: 'Papierkram Digitalisierung & Prozess-Setup (Einmalig)',
          quantity: 1,
          unitPrice: 1850.00,
          taxRate: 19,
          total: 1850.00
        }
      ],
      notes: 'Vielen Dank für Ihren Auftrag. Wir freuen uns auf die digitale Zusammenarbeit!',
      paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
      createdAt: '2026-08-05T10:00:00.000Z'
    },
    {
      id: 'inv-2',
      invoiceNumber: 'RE-2026-0002',
      customerId: 'cust-1',
      customerName: 'Schmidt & Partner Bau GmbH',
      customerAddress: 'Industriestraße 14, 12099 Berlin',
      customerTaxId: 'DE298765432',
      type: 'outgoing',
      date: '2026-08-31',
      dueDate: '2026-09-14',
      status: 'sent',
      paidAt: null,
      taxRate: 19,
      netAmount: 249.00,
      taxAmount: 47.31,
      grossAmount: 296.31,
      items: [
        {
          id: 'item-2',
          description: 'TeamTrack Cloud WebApp & Wartung - Monat August 2026 (Abo)',
          quantity: 1,
          unitPrice: 249.00,
          taxRate: 19,
          total: 249.00
        }
      ],
      notes: 'Monatliche Lizenz & Wartungsgrundgebühr.',
      paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
      createdAt: '2026-08-31T08:00:00.000Z'
    },
    {
      id: 'inv-3',
      invoiceNumber: 'RE-2026-0003',
      customerId: 'cust-2',
      customerName: 'Bäcker Meisterei Lehmann',
      customerAddress: 'Hauptstraße 88, 10827 Berlin',
      customerTaxId: '14/234/56789',
      type: 'outgoing',
      date: '2026-08-25',
      dueDate: '2026-09-08',
      status: 'paid',
      paidAt: '2026-08-28',
      taxRate: 19,
      netAmount: 2400.00,
      taxAmount: 456.00,
      grossAmount: 2856.00,
      items: [
        {
          id: 'item-3',
          description: 'Bestellsystem Initial-Entwicklung & Web-Applikation',
          quantity: 1,
          unitPrice: 2400.00,
          taxRate: 19,
          total: 2400.00
        }
      ],
      notes: 'Fertigstellung und Übergabe des Online-Filialbestellsystems.',
      paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
      createdAt: '2026-08-25T14:00:00.000Z'
    }
  ],
  expenses: [
    {
      id: 'exp-1',
      expenseNumber: 'BE-2026-0001',
      vendor: 'Hetzner Online GmbH',
      category: 'Software & Hosting',
      date: '2026-08-01',
      netAmount: 58.00,
      taxRate: 19,
      taxAmount: 11.02,
      grossAmount: 69.02,
      paymentMethod: 'Banküberweisung',
      status: 'paid',
      notes: 'Cloud Server für Kunden-WebApps & Backups',
      receiptFileName: null,
      createdAt: '2026-08-01T12:00:00.000Z'
    },
    {
      id: 'exp-2',
      expenseNumber: 'BE-2026-0002',
      vendor: 'Telekom Deutschland',
      category: 'Büro & Verwaltung',
      date: '2026-08-05',
      netAmount: 49.95,
      taxRate: 19,
      taxAmount: 9.49,
      grossAmount: 59.44,
      paymentMethod: 'Banküberweisung',
      status: 'paid',
      notes: 'Geschäftskunden Internet & Festnetzanschluss',
      receiptFileName: null,
      createdAt: '2026-08-05T09:30:00.000Z'
    },
    {
      id: 'exp-3',
      expenseNumber: 'BE-2026-0003',
      vendor: 'Apple Store Kurfürstendamm',
      category: 'Hardware & Geräte',
      date: '2026-08-12',
      netAmount: 1150.00,
      taxRate: 19,
      taxAmount: 218.50,
      grossAmount: 1368.50,
      paymentMethod: 'Kreditkarte',
      status: 'paid',
      notes: 'iPad Pro Testgerät für Kundenpräsentationen vor Ort',
      receiptFileName: null,
      createdAt: '2026-08-12T16:00:00.000Z'
    }
  ],
  mileage: [
    {
      id: 'mil-1',
      date: '2026-08-04',
      customerId: 'cust-1',
      customerName: 'Schmidt & Partner Bau GmbH',
      startLocation: 'Büro Berlin-Mitte',
      destination: 'Industriestraße 14, 12099 Berlin (Baustelle Tempelhof)',
      purpose: 'Vor-Ort Digitalisierungsberatung & Aufnahme der bisherigen Papierformulare',
      kilometers: 32.0,
      ratePerKm: 0.30,
      totalDeduction: 9.60,
      isReturnTrip: true,
      notes: 'Hin- und Rückfahrt kombiniert',
      createdAt: '2026-08-04T18:00:00.000Z'
    },
    {
      id: 'mil-2',
      date: '2026-08-18',
      customerId: 'cust-2',
      customerName: 'Bäcker Meisterei Lehmann',
      startLocation: 'Büro Berlin-Mitte',
      destination: 'Hauptstraße 88, 10827 Berlin',
      purpose: 'Präsentation WebApp Prototyp & Schulung des Filialleiters',
      kilometers: 24.5,
      ratePerKm: 0.30,
      totalDeduction: 7.35,
      isReturnTrip: true,
      notes: 'Erfolgreiche Demo',
      createdAt: '2026-08-18T17:30:00.000Z'
    },
    {
      id: 'mil-3',
      date: '2026-08-30',
      customerId: 'cust-3',
      customerName: 'Elektrotechnik Müller & Söhne',
      startLocation: 'Büro Berlin-Mitte',
      destination: 'Gewerbepark Süd 5, 12305 Berlin',
      purpose: 'Erstgespräch & Bedarfsanalyse für Zeiterfassungs-App',
      kilometers: 42.0,
      ratePerKm: 0.30,
      totalDeduction: 12.60,
      isReturnTrip: true,
      notes: 'Kunde hat großes Interesse an Papierkram-Ablösung',
      createdAt: '2026-08-30T16:00:00.000Z'
    }
  ],
  emailLogs: [
    {
      id: 'mail-1',
      customerId: 'cust-1',
      customerName: 'Schmidt & Partner Bau GmbH',
      recipientEmail: 'klaus.schmidt@schmidt-bau.de',
      subject: 'Ihre maßgeschneiderte WebApp & Papierkram-Digitalisierung',
      templateType: 'demo_intro',
      sentAt: '2026-08-15T10:30:00.000Z',
      body: 'Sehr geehrter Herr Schmidt,\n\nvielen Dank für das angenehme Gespräch. Anbei sende ich Ihnen die Zusammenfassung...'
    }
  ]
};

// Local storage helper
function getLocalData() {
  try {
    const raw = localStorage.getItem('teamtrack_local_db');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem('teamtrack_local_db', JSON.stringify(defaultSeed));
  return defaultSeed;
}

function saveLocalData(data) {
  try {
    localStorage.setItem('teamtrack_local_db', JSON.stringify(data));
  } catch (e) {}
}

// Local mock processor
function handleLocalRequest(endpoint, options = {}) {
  const db = getLocalData();
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  // DASHBOARD STATS
  if (endpoint === '/dashboard/stats') {
    const activeAbos = db.services.filter(s => s.type === 'abo' && s.status === 'active');
    const mrr = activeAbos.reduce((sum, s) => {
      let monthly = s.price;
      if (s.billingInterval === 'yearly') monthly = s.price / 12;
      if (s.billingInterval === 'quarterly') monthly = s.price / 3;
      return sum + Number(monthly || 0);
    }, 0);

    const paidInvoices = db.invoices.filter(i => i.status === 'paid');
    const totalPaidRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.netAmount || 0), 0);
    const totalGrossRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.grossAmount || 0), 0);
    const pendingInvoices = db.invoices.filter(i => i.status === 'sent' || i.status === 'draft');
    const totalPendingAmount = pendingInvoices.reduce((sum, i) => sum + Number(i.grossAmount || 0), 0);
    const totalExpenses = db.expenses.reduce((sum, e) => sum + Number(e.netAmount || 0), 0);
    const totalExpensesGross = db.expenses.reduce((sum, e) => sum + Number(e.grossAmount || 0), 0);
    const totalKm = db.mileage.reduce((sum, m) => sum + Number(m.kilometers || 0), 0);
    const totalKmDeduction = db.mileage.reduce((sum, m) => sum + Number(m.totalDeduction || 0), 0);

    return {
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
      totalCustomers: db.customers.length,
      activeCustomers: db.customers.filter(c => c.status === 'active').length,
      leadCustomers: db.customers.filter(c => c.status === 'lead').length,
      recentInvoices: db.invoices.slice(-5).reverse(),
      recentCustomers: db.customers.slice(-5).reverse(),
      recentMileage: db.mileage.slice(-5).reverse()
    };
  }

  // CUSTOMERS
  if (endpoint === '/customers') {
    if (method === 'GET') {
      return db.customers.map(cust => {
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
    }
    if (method === 'POST') {
      const newCust = {
        id: `cust-${Date.now()}`,
        ...body,
        demoEmailSent: false,
        demoEmailSentAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.customers.push(newCust);
      saveLocalData(db);
      return newCust;
    }
  }

  if (endpoint.startsWith('/customers/')) {
    const parts = endpoint.split('/');
    const custId = parts[2];
    
    if (endpoint.endsWith('/send-demo-email')) {
      const customer = db.customers.find(c => c.id === custId);
      if (customer) {
        const now = new Date().toISOString();
        customer.demoEmailSent = true;
        customer.demoEmailSentAt = now;
        customer.demoEmailTemplate = body.templateType || 'digitalisierung_intro';
        customer.updatedAt = now;

        const emailLog = {
          id: `mail-${Date.now()}`,
          customerId: customer.id,
          customerName: customer.companyName,
          recipientEmail: customer.email,
          subject: body.subject,
          templateType: body.templateType,
          sentAt: now,
          body: body.body
        };
        db.emailLogs = db.emailLogs || [];
        db.emailLogs.push(emailLog);
        saveLocalData(db);
        return { success: true, customer, emailLog };
      }
    }

    if (method === 'GET') {
      const customer = db.customers.find(c => c.id === custId);
      if (!customer) throw new Error('Kunde nicht gefunden');
      return {
        customer,
        services: db.services.filter(s => s.customerId === custId),
        invoices: db.invoices.filter(i => i.customerId === custId),
        mileage: db.mileage.filter(m => m.customerId === custId),
        emailLogs: (db.emailLogs || []).filter(e => e.customerId === custId)
      };
    }

    if (method === 'PUT') {
      const idx = db.customers.findIndex(c => c.id === custId);
      if (idx !== -1) {
        db.customers[idx] = { ...db.customers[idx], ...body, updatedAt: new Date().toISOString() };
        saveLocalData(db);
        return db.customers[idx];
      }
    }

    if (method === 'DELETE') {
      const idx = db.customers.findIndex(c => c.id === custId);
      if (idx !== -1) {
        const deleted = db.customers.splice(idx, 1)[0];
        saveLocalData(db);
        return deleted;
      }
    }
  }

  // SERVICES
  if (endpoint.startsWith('/services')) {
    if (method === 'GET') {
      return db.services;
    }
    if (method === 'POST') {
      const newSrv = { id: `srv-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
      db.services.push(newSrv);
      saveLocalData(db);
      return newSrv;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = db.services.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.services[idx] = { ...db.services[idx], ...body };
        saveLocalData(db);
        return db.services[idx];
      }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const idx = db.services.findIndex(s => s.id === id);
      if (idx !== -1) {
        const del = db.services.splice(idx, 1)[0];
        saveLocalData(db);
        return del;
      }
    }
  }

  // INVOICES
  if (endpoint.startsWith('/invoices')) {
    if (method === 'GET') {
      return db.invoices;
    }
    if (method === 'POST') {
      const newInv = {
        id: `inv-${Date.now()}`,
        invoiceNumber: body.invoiceNumber || `RE-2026-${String(db.invoices.length + 1).padStart(4, '0')}`,
        ...body,
        createdAt: new Date().toISOString()
      };
      db.invoices.push(newInv);
      saveLocalData(db);
      return newInv;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = db.invoices.findIndex(i => i.id === id);
      if (idx !== -1) {
        db.invoices[idx] = { ...db.invoices[idx], ...body };
        saveLocalData(db);
        return db.invoices[idx];
      }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const idx = db.invoices.findIndex(i => i.id === id);
      if (idx !== -1) {
        const del = db.invoices.splice(idx, 1)[0];
        saveLocalData(db);
        return del;
      }
    }
  }

  // EXPENSES
  if (endpoint.startsWith('/expenses')) {
    if (method === 'GET') {
      return db.expenses;
    }
    if (method === 'POST') {
      const newExp = {
        id: `exp-${Date.now()}`,
        expenseNumber: body.expenseNumber || `BE-2026-${String(db.expenses.length + 1).padStart(4, '0')}`,
        ...body,
        createdAt: new Date().toISOString()
      };
      db.expenses.push(newExp);
      saveLocalData(db);
      return newExp;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = db.expenses.findIndex(e => e.id === id);
      if (idx !== -1) {
        db.expenses[idx] = { ...db.expenses[idx], ...body };
        saveLocalData(db);
        return db.expenses[idx];
      }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const idx = db.expenses.findIndex(e => e.id === id);
      if (idx !== -1) {
        const del = db.expenses.splice(idx, 1)[0];
        saveLocalData(db);
        return del;
      }
    }
  }

  // MILEAGE
  if (endpoint.startsWith('/mileage')) {
    if (method === 'GET') {
      return db.mileage;
    }
    if (method === 'POST') {
      const km = Number(body.kilometers || 0);
      const rate = Number(body.ratePerKm || 0.30);
      const newMil = {
        id: `mil-${Date.now()}`,
        ...body,
        kilometers: km,
        ratePerKm: rate,
        totalDeduction: Number((km * rate).toFixed(2)),
        createdAt: new Date().toISOString()
      };
      db.mileage.push(newMil);
      saveLocalData(db);
      return newMil;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = db.mileage.findIndex(m => m.id === id);
      if (idx !== -1) {
        db.mileage[idx] = { ...db.mileage[idx], ...body };
        saveLocalData(db);
        return db.mileage[idx];
      }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const idx = db.mileage.findIndex(m => m.id === id);
      if (idx !== -1) {
        const del = db.mileage.splice(idx, 1)[0];
        saveLocalData(db);
        return del;
      }
    }
  }

  // TAX REPORT
  if (endpoint.startsWith('/reports/tax-year/')) {
    const year = endpoint.split('/')[3] || '2026';
    const yearInvoices = db.invoices.filter(i => i.date && i.date.startsWith(year));
    const yearPaidInvoices = yearInvoices.filter(i => i.status === 'paid');
    const yearExpenses = db.expenses.filter(e => e.date && e.date.startsWith(year));
    const yearMileage = db.mileage.filter(m => m.date && m.date.startsWith(year));

    const totalRevenueNet = yearPaidInvoices.reduce((s, i) => s + Number(i.netAmount || 0), 0);
    const totalRevenueTax = yearPaidInvoices.reduce((s, i) => s + Number(i.taxAmount || 0), 0);
    const totalRevenueGross = yearPaidInvoices.reduce((s, i) => s + Number(i.grossAmount || 0), 0);

    const totalExpensesNet = yearExpenses.reduce((s, e) => s + Number(e.netAmount || 0), 0);
    const totalExpensesTax = yearExpenses.reduce((s, e) => s + Number(e.taxAmount || 0), 0);
    const totalExpensesGross = yearExpenses.reduce((s, e) => s + Number(e.grossAmount || 0), 0);

    const expensesByCategory = {};
    for (const exp of yearExpenses) {
      const cat = exp.category || 'Sonstiges';
      if (!expensesByCategory[cat]) expensesByCategory[cat] = { net: 0, tax: 0, gross: 0, count: 0 };
      expensesByCategory[cat].net += Number(exp.netAmount || 0);
      expensesByCategory[cat].tax += Number(exp.taxAmount || 0);
      expensesByCategory[cat].gross += Number(exp.grossAmount || 0);
      expensesByCategory[cat].count += 1;
    }

    const totalKm = yearMileage.reduce((s, m) => s + Number(m.kilometers || 0), 0);
    const totalMileageDeduction = yearMileage.reduce((s, m) => s + Number(m.totalDeduction || 0), 0);
    const netProfit = Number((totalRevenueNet - totalExpensesNet - totalMileageDeduction).toFixed(2));
    const vatPayable = Number((totalRevenueTax - totalExpensesTax).toFixed(2));

    return {
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
    };
  }

  // SETTINGS
  if (endpoint === '/settings') {
    if (method === 'GET') return db.companySettings;
    if (method === 'PUT') {
      db.companySettings = { ...db.companySettings, ...body };
      saveLocalData(db);
      return db.companySettings;
    }
  }

  return {};
}

// Universal API request with fallback to local client storage when server API is absent
async function request(endpoint, options = {}) {
  try {
    const url = `/api${endpoint}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // API server not reachable, seamlessly fallback to local client processor
  }
  return handleLocalRequest(endpoint, options);
}

export const api = {
  getDashboardStats: () => request('/dashboard/stats'),
  getCustomers: () => request('/customers'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  sendDemoEmail: (id, data) => request(`/customers/${id}/send-demo-email`, { method: 'POST', body: JSON.stringify(data) }),
  getServices: (customerId) => request(`/services${customerId ? `?customerId=${customerId}` : ''}`),
  createService: (data) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),
  getInvoices: (customerId) => request(`/invoices${customerId ? `?customerId=${customerId}` : ''}`),
  getInvoice: (id) => request(`/invoices/${id}`),
  createInvoice: (data) => request('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id, data) => request(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvoice: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),
  getExpenses: () => request('/expenses'),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  getMileage: (customerId) => request(`/mileage${customerId ? `?customerId=${customerId}` : ''}`),
  createMileage: (data) => request('/mileage', { method: 'POST', body: JSON.stringify(data) }),
  updateMileage: (id, data) => request(`/mileage/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMileage: (id) => request(`/mileage/${id}`, { method: 'DELETE' }),
  getTaxReport: (year) => request(`/reports/tax-year/${year}`),
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) })
};
