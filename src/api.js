import { getFirebaseDb } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Initial default seed data for standalone/Vercel static mode
const defaultSeed = {
  companySettings: {
    companyName: 'TeamTrack-Software',
    ownerName: 'Huriye Ünalsoy',
    tagline: 'Softwareentwicklung & IT-Beratung',
    street: 'Balthasar-Neumann-Str. 38',
    zipCode: '97236',
    city: 'Randersacker',
    address: 'Balthasar-Neumann-Str. 38, 97236 Randersacker',
    phone: '+49 172 4690446',
    email: 'kontakt@team-track.de',
    website: 'https://team-track.de',
    taxNumber: '27/123/45678',
    vatId: '61502944380',
    bankName: 'Postbank',
    iban: 'DE16 1001 0010 0012 7271 85',
    bic: 'PBNKDEFF',
    kmRate: 0.30,
    isKleinunternehmer: true,
    kleinunternehmerText: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).',
    defaultTaxRate: 0,
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
      leadSource: 'WEBSITE ANFRAGE',
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
      leadSource: 'UPWORK',
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
      leadSource: 'XING',
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
      taxRate: 0,
      netAmount: 1850.00,
      taxAmount: 0.00,
      grossAmount: 1850.00,
      isKleinunternehmer: true,
      items: [
        {
          id: 'item-1',
          description: 'Papierkram Digitalisierung & Prozess-Setup (Einmalig)',
          quantity: 1,
          unitPrice: 1850.00,
          taxRate: 0,
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
      taxRate: 0,
      netAmount: 249.00,
      taxAmount: 0.00,
      grossAmount: 249.00,
      isKleinunternehmer: true,
      items: [
        {
          id: 'item-2',
          description: 'TeamTrack Cloud WebApp & Wartung - Monat August 2026 (Abo)',
          quantity: 1,
          unitPrice: 249.00,
          taxRate: 0,
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
      taxRate: 0,
      netAmount: 2400.00,
      taxAmount: 0.00,
      grossAmount: 2400.00,
      isKleinunternehmer: true,
      items: [
        {
          id: 'item-3',
          description: 'Bestellsystem Initial-Entwicklung & Web-Applikation',
          quantity: 1,
          unitPrice: 2400.00,
          taxRate: 0,
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
  dispositions: [
    {
      id: 'disp-202',
      dispNumber: 'DISP-202',
      title: 'Materialdisposition & Anlieferung Gerüst',
      customerId: 'cust-1',
      customerName: 'Schmidt & Partner Bau GmbH',
      project: 'Sanierung Randersacker',
      priority: 'medium', // 'low', 'medium', 'high'
      status: 'geplant', // 'geplant', 'in_progress', 'review', 'completed'
      tags: ['#Logistik', '#Material'],
      assignee: 'Max Mustermann',
      date: '2026-09-10',
      notes: 'Gerüstanlieferung und Vorprüfung der Fassade vor Ort.',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'disp-205',
      dispNumber: 'DISP-205',
      title: 'Kundenberatung Vor-Ort & Aufmaß',
      customerId: 'cust-2',
      customerName: 'Bäcker Meisterei Lehmann',
      project: 'Projektplanung 2026',
      priority: 'medium',
      status: 'geplant',
      tags: ['#Aufmaß', '#Kunde'],
      assignee: 'Sarah Weber',
      date: '2026-09-12',
      notes: 'Bestandsaufnahme vor Ort und Detailbesprechung für WebApp-Erweiterung.',
      createdAt: '2026-09-02T09:00:00.000Z'
    },
    {
      id: 'disp-201',
      dispNumber: 'DISP-201',
      title: 'Elektro-Hauptverteilung installieren',
      customerId: 'cust-3',
      customerName: 'Elektrotechnik Müller & Söhne',
      project: 'Wohnpark Würzburg-Nord',
      priority: 'high',
      status: 'in_progress',
      tags: ['#Elektro', '#Baustelle', '#Dringend'],
      assignee: 'Sarah Weber',
      date: '2026-09-08',
      notes: 'Verkabelung und Schaltschrankinstallation im Erdgeschoss.',
      createdAt: '2026-09-03T10:00:00.000Z'
    },
    {
      id: 'disp-203',
      dispNumber: 'DISP-203',
      title: 'Wartung Hebeanlage Tor 4 & Testlauf',
      customerId: 'cust-1',
      customerName: 'Schmidt & Partner Bau GmbH',
      project: 'Hafen Würzburg',
      priority: 'high',
      status: 'review',
      tags: ['#Wartung', '#Prüfprotokoll'],
      assignee: 'Jan Becker',
      date: '2026-09-05',
      notes: 'Hydraulik-Check und Funktionstest der Steuereinheit.',
      createdAt: '2026-09-04T11:00:00.000Z'
    },
    {
      id: 'disp-204',
      dispNumber: 'DISP-204',
      title: 'Sicherheits- und Brandschutzprüfung',
      customerId: 'cust-3',
      customerName: 'Elektrotechnik Müller & Söhne',
      project: 'Bürokomplex Würzburg',
      priority: 'low',
      status: 'completed',
      tags: ['#Abnahme', '#Protokoll'],
      assignee: 'Max Mustermann',
      date: '2026-09-02',
      notes: 'Erfolgreich abgenommen, digitales Protokoll liegt vor.',
      createdAt: '2026-09-02T14:00:00.000Z'
    }
  ],
  offers: [],
  emailLogs: []
};

// Local storage access
function getLocalData() {
  try {
    const raw = localStorage.getItem('teamtrack_local_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.offers) {
        parsed.offers = [];
      }
      if (!parsed.dispositions || !Array.isArray(parsed.dispositions) || parsed.dispositions.length === 0) {
        parsed.dispositions = defaultSeed.dispositions;
      }
      if (parsed.companySettings) {
        parsed.companySettings.isKleinunternehmer = true;
        parsed.companySettings.kleinunternehmerText = 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).';
        
        // Auto-upgrade corporate identity if still on old tagline/owner
        if (!parsed.companySettings.tagline || parsed.companySettings.tagline.includes('Papierkram')) {
          parsed.companySettings.tagline = 'Softwareentwicklung & IT-Beratung';
        }
        if (!parsed.companySettings.ownerName || parsed.companySettings.ownerName === 'Geschäftsinhaber' || parsed.companySettings.ownerName.includes('Hakan')) {
          parsed.companySettings.ownerName = 'Huriye Ünalsoy';
        }
        if (!parsed.companySettings.companyName || parsed.companySettings.companyName === 'TeamTrack Digital Solutions') {
          parsed.companySettings.companyName = 'TeamTrack-Software';
        }
        if (!parsed.companySettings.street) {
          parsed.companySettings.street = 'Balthasar-Neumann-Str. 38';
        }
        if (!parsed.companySettings.zipCode) {
          parsed.companySettings.zipCode = '97236';
        }
        if (!parsed.companySettings.city) {
          parsed.companySettings.city = 'Randersacker';
        }
        if (!parsed.companySettings.email || parsed.companySettings.email.includes('hotmail.com')) {
          parsed.companySettings.email = 'kontakt@team-track.de';
        }
        if (!parsed.companySettings.website || parsed.companySettings.website.includes('vercel.app') || parsed.companySettings.website.includes('teamtrack-digital.de') || parsed.companySettings.website.includes('team-trak')) {
          parsed.companySettings.website = 'https://team-track.de';
        }
        if (!parsed.companySettings.bic || parsed.companySettings.bic !== 'PBNKDEFF') {
          parsed.companySettings.bic = 'PBNKDEFF';
        }
        if (!parsed.companySettings.bankName || parsed.companySettings.bankName.includes('Sparkasse')) {
          parsed.companySettings.bankName = 'Postbank';
        }
        if (!parsed.companySettings.iban || parsed.companySettings.iban === '-' || !parsed.companySettings.iban.startsWith('DE')) {
          parsed.companySettings.iban = 'DE16 1001 0010 0012 7271 85';
        }
      }

      // Auto-migrate customers: ensure leadSource exists
      const fallbackSources = ['WEBSITE ANFRAGE', 'UPWORK', 'XING', 'DIREKT E-MAIL', 'MALT'];
      (parsed.customers || []).forEach((c, idx) => {
        if (!c.leadSource) {
          c.leadSource = fallbackSources[idx % fallbackSources.length] || 'WEBSITE ANFRAGE';
        }
      });

      // Auto-migrate invoices: align exact Liefer-/Leistungsdatum with corresponding service and keep dueDate in sync
      (parsed.invoices || []).forEach(inv => {
        const itemDesc = (inv.items?.[0]?.description || '').toLowerCase();
        const matchedSrv = (parsed.services || []).find(s => {
          if (s.customerId !== inv.customerId) return false;
          const sTitle = (s.title || '').toLowerCase();
          return itemDesc.includes(sTitle) || sTitle.includes(itemDesc.split(' ')[0]);
        }) || (parsed.services || []).find(s => s.customerId === inv.customerId);

        if (matchedSrv) {
          inv.serviceDate = matchedSrv.startDate?.split('T')[0] || matchedSrv.createdAt?.split('T')[0] || inv.serviceDate || inv.date;
        } else if (!inv.serviceDate) {
          inv.serviceDate = inv.date;
        }

        // Restore exact historic dates for sample seed invoices
        if (inv.id === 'inv-1' || inv.invoiceNumber === 'RE-2026-0001') {
          inv.date = '2026-08-05';
          inv.serviceDate = '2026-08-05';
          inv.dueDate = '2026-08-19';
          inv.paidAt = '2026-08-14';
        } else if (inv.id === 'inv-2' || inv.invoiceNumber === 'RE-2026-0002') {
          inv.date = '2026-08-31';
          inv.serviceDate = '2026-08-01';
          inv.dueDate = '2026-09-14';
        } else if (inv.id === 'inv-3' || inv.invoiceNumber === 'RE-2026-0003') {
          inv.date = '2026-08-25';
          inv.serviceDate = '2026-08-15';
          inv.dueDate = '2026-09-08';
        }

        // Keep dueDate strictly valid (+14 days from invoice date if missing or before invoice date)
        if (inv.date && (!inv.dueDate || inv.dueDate < inv.date)) {
          const d = new Date(inv.date);
          d.setDate(d.getDate() + 14);
          inv.dueDate = d.toISOString().split('T')[0];
        }
      });

      parsed.offers = Array.isArray(parsed.offers) ? parsed.offers : [];

      return parsed;
    }
  } catch (e) {}
  localStorage.setItem('teamtrack_local_db', JSON.stringify(defaultSeed));
  return defaultSeed;
}

function saveLocalData(data) {
  try {
    localStorage.setItem('teamtrack_local_db', JSON.stringify(data));
  } catch (e) {}
}

// Smart merger so no local customer/invoice is ever lost
function mergeDatabases(localDb, cloudDb) {
  if (!cloudDb) return localDb;
  if (!localDb) return cloudDb;

  const merged = { ...cloudDb };

  // Merge customers
  const customerMap = new Map();
  (cloudDb.customers || []).forEach(c => customerMap.set(c.id, c));
  (localDb.customers || []).forEach(c => {
    if (!customerMap.has(c.id)) {
      customerMap.set(c.id, c);
    }
  });
  merged.customers = Array.from(customerMap.values());

  // Merge services
  const serviceMap = new Map();
  (cloudDb.services || []).forEach(s => serviceMap.set(s.id, s));
  (localDb.services || []).forEach(s => {
    if (!serviceMap.has(s.id)) {
      serviceMap.set(s.id, s);
    }
  });
  merged.services = Array.from(serviceMap.values());

  // Merge invoices
  const invoiceMap = new Map();
  (cloudDb.invoices || []).forEach(i => invoiceMap.set(i.id, i));
  (localDb.invoices || []).forEach(i => {
    if (!invoiceMap.has(i.id)) {
      invoiceMap.set(i.id, i);
    }
  });
  merged.invoices = Array.from(invoiceMap.values());

  // Merge offers
  const offerMap = new Map();
  (cloudDb.offers || []).forEach(o => offerMap.set(o.id, o));
  (localDb.offers || []).forEach(o => {
    if (!offerMap.has(o.id)) {
      offerMap.set(o.id, o);
    }
  });
  merged.offers = Array.from(offerMap.values());

  // Merge expenses
  const expenseMap = new Map();
  (cloudDb.expenses || []).forEach(e => expenseMap.set(e.id, e));
  (localDb.expenses || []).forEach(e => {
    if (!expenseMap.has(e.id)) {
      expenseMap.set(e.id, e);
    }
  });
  merged.expenses = Array.from(expenseMap.values());

  // Merge mileage
  const mileageMap = new Map();
  (cloudDb.mileage || []).forEach(m => mileageMap.set(m.id, m));
  (localDb.mileage || []).forEach(m => {
    if (!mileageMap.has(m.id)) {
      mileageMap.set(m.id, m);
    }
  });
  merged.mileage = Array.from(mileageMap.values());

  return merged;
}

// Firebase Realtime Firestore Synchronization
let hasStartedListener = false;
let isPushingUpdate = false;

function initFirebaseRealtimeSync() {
  if (hasStartedListener) return;
  const db = getFirebaseDb();
  if (!db) return;

  try {
    hasStartedListener = true;
    const docRef = doc(db, 'teamtrack_workspaces', 'main_workspace');
    
    // Attach real-time snapshot listener
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data()?.data;
        if (cloudData && !isPushingUpdate) {
          saveLocalData(cloudData);
        }
      } else {
        // Document does not exist in Firebase yet -> upload local data
        const localData = getLocalData();
        setDoc(docRef, {
          data: localData,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
    }, (err) => {
      console.warn('Firebase realtime listener warning:', err);
    });
  } catch (e) {
    console.warn('Firebase init error:', e);
  }
}

async function syncWithFirebaseOnce() {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    initFirebaseRealtimeSync();
    const docRef = doc(db, 'teamtrack_workspaces', 'main_workspace');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const cloudData = docSnap.data()?.data;
      if (cloudData) {
        saveLocalData(cloudData);
        return cloudData;
      }
    } else {
      const localData = getLocalData();
      await setDoc(docRef, {
        data: localData,
        updatedAt: new Date().toISOString()
      });
      return localData;
    }
  } catch (err) {
    console.warn('Firebase sync once warning:', err);
  }
  return null;
}

async function pushToFirebase(localDb) {
  const db = getFirebaseDb();
  if (!db) return;

  isPushingUpdate = true;
  try {
    const docRef = doc(db, 'teamtrack_workspaces', 'main_workspace');
    await setDoc(docRef, {
      data: localDb,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Firebase push update error:', err);
  } finally {
    setTimeout(() => { isPushingUpdate = false; }, 800);
  }
}

async function handleLocalRequest(endpoint, options = {}) {
  // Ensure Firebase real-time listener is attached if credentials exist
  initFirebaseRealtimeSync();

  const db = getLocalData();
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  // Helper to get invoice true total
  const getInvTotal = (inv) => {
    const itemSum = (inv.items || []).reduce((s, it) => s + ((Number(it.unitPrice) || 0) * (Number(it.quantity) || 1)), 0);
    return itemSum > 0 ? itemSum : Number(inv.netAmount || inv.grossAmount || 0);
  };

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
    const totalPaidRevenue = paidInvoices.reduce((sum, i) => sum + getInvTotal(i), 0);
    const totalGrossRevenue = totalPaidRevenue;
    const pendingInvoices = db.invoices.filter(i => i.status === 'sent');
    const totalPendingAmount = pendingInvoices.reduce((sum, i) => sum + getInvTotal(i), 0);
    const totalExpenses = db.expenses.reduce((sum, e) => sum + Number(e.grossAmount || e.netAmount || 0), 0);
    const totalExpensesGross = totalExpenses;
    const totalKm = db.mileage.reduce((sum, m) => sum + Number(m.kilometers || 0), 0);
    const totalKmDeduction = db.mileage.reduce((sum, m) => sum + Number(m.totalDeduction || 0), 0);

    // Auto-update customer status if they have services/invoices
    let hasDbUpdates = false;
    db.customers.forEach(cust => {
      const custServices = db.services.filter(s => s.customerId === cust.id);
      const custInvoices = db.invoices.filter(i => i.customerId === cust.id);
      const hasJobs = custServices.length > 0 || custInvoices.length > 0;
      if (hasJobs && cust.status !== 'active') {
        cust.status = 'active';
        hasDbUpdates = true;
      }
    });
    if (hasDbUpdates) {
      saveLocalData(db);
      pushToFirebase(db);
    }

    // Check which active abos have not been invoiced yet in the current month
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    const unbilledAbos = [];
    activeAbos.forEach(abo => {
      const customer = db.customers.find(c => c.id === abo.customerId);
      const alreadyInvoiced = db.invoices.some(inv => 
        inv.customerId === abo.customerId &&
        inv.date && inv.date.startsWith(currentMonthPrefix) &&
        (inv.items || []).some(item => 
          item.description?.toLowerCase().includes(abo.title?.toLowerCase()) ||
          abo.title?.toLowerCase().includes(item.description?.toLowerCase())
        )
      );
      if (!alreadyInvoiced && customer) {
        unbilledAbos.push({
          abo,
          customer
        });
      }
    });

    // Check completed one-time services that have not been invoiced yet
    const unbilledEinmalige = [];
    const completedEinmalige = (db.services || []).filter(s => s.type === 'einmalig' && (s.status === 'completed' || s.status === 'erledigt' || s.status === 'active'));
    completedEinmalige.forEach(srv => {
      const customer = db.customers.find(c => c.id === srv.customerId);
      const alreadyInvoiced = db.invoices.some(inv => 
        inv.customerId === srv.customerId &&
        (inv.items || []).some(item => 
          item.description?.toLowerCase().includes(srv.title?.toLowerCase()) ||
          srv.title?.toLowerCase().includes(item.description?.toLowerCase()) ||
          Number(item.unitPrice) === Number(srv.price)
        )
      );
      if (!alreadyInvoiced && customer) {
        unbilledEinmalige.push({
          service: srv,
          customer
        });
      }
    });

    const totalEinmaligeCount = (db.services || []).filter(s => s.type === 'einmalig').length;
    const completedEinmaligeCount = (db.services || []).filter(s => s.type === 'einmalig' && (s.status === 'completed' || s.status === 'erledigt')).length || totalEinmaligeCount;

    return {
      mrr,
      activeAbosCount: activeAbos.length,
      unbilledAbosCount: unbilledAbos.length,
      unbilledAbos,
      unbilledEinmaligeCount: unbilledEinmalige.length,
      unbilledEinmalige,
      totalUnbilledJobsCount,
      completedEinmaligeCount,
      totalEinmaligeCount,
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
      recentInvoices: db.invoices.slice(-10).reverse(),
      recentCustomers: db.customers.slice(-10).reverse(),
      recentMileage: db.mileage.slice(-10).reverse()
    };
  }

  // CUSTOMERS
  if (endpoint === '/customers') {
    if (method === 'GET') {
      let hasChanges = false;
      const result = db.customers.map(cust => {
        const custServices = db.services.filter(s => s.customerId === cust.id);
        const custInvoices = db.invoices.filter(i => i.customerId === cust.id);
        const custOffers = (db.offers || []).filter(o => o.customerId === cust.id);
        const lastOffer = custOffers[0] || null;
        const activeAbos = custServices.filter(s => s.type === 'abo' && s.status === 'active');
        const totalAboMonthly = activeAbos.reduce((sum, s) => sum + Number(s.price || 0), 0);
        const einmaligeServices = custServices.filter(s => s.type === 'einmalig');
        const totalRevenue = custInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + getInvTotal(i), 0);
        
        // Auto-upgrade: As soon as a customer has ANY service (Abo or Einmalig) or invoice -> AUTOMATICALLY ACTIVE
        const hasJobs = custServices.length > 0 || custInvoices.length > 0;
        let currentStatus = hasJobs ? 'active' : (cust.status || 'lead');
        
        if (cust.status !== currentStatus) {
          cust.status = currentStatus;
          hasChanges = true;
        }

        const offerEmailSent = cust.offerEmailSent || Boolean(lastOffer);
        const offerEmailSentAt = cust.offerEmailSentAt || lastOffer?.createdAt || lastOffer?.date;
        const offerEmailType = cust.offerEmailType || lastOffer?.type;
        const offerEmailNumber = cust.offerEmailNumber || lastOffer?.offerNumber;

        return {
          ...cust,
          status: currentStatus,
          activeAbosCount: activeAbos.length,
          totalAboMonthly,
          einmaligeCount: einmaligeServices.length,
          totalRevenue,
          invoicesCount: custInvoices.length,
          offersCount: custOffers.length,
          lastOffer,
          offerEmailSent,
          offerEmailSentAt,
          offerEmailType,
          offerEmailNumber
        };
      });

      if (hasChanges) {
        saveLocalData(db);
        pushToFirebase(db);
      }
      return result;
    }
    if (method === 'POST') {
      const newCust = {
        id: `cust-${Date.now()}`,
        status: body.status || 'lead',
        ...body,
        demoEmailSent: false,
        demoEmailSentAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.customers.push(newCust);
      saveLocalData(db);
      pushToFirebase(db);
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
        pushToFirebase(db);
        return { success: true, customer, emailLog };
      }
    }

    if (endpoint.endsWith('/offer-response')) {
      const customer = db.customers.find(c => c.id === custId);
      if (customer) {
        const now = new Date().toISOString();
        const isResponded = body.responded !== false;
        customer.offerCustomerResponded = isResponded;
        customer.offerCustomerRespondedAt = isResponded ? now : null;
        customer.updatedAt = now;
        saveLocalData(db);
        pushToFirebase(db);
        return { success: true, customer };
      }
    }

    if (method === 'GET') {
      const customer = db.customers.find(c => c.id === custId);
      if (!customer) throw new Error('Kunde nicht gefunden');
      const custServices = db.services.filter(s => s.customerId === custId);
      const custInvoices = db.invoices.filter(i => i.customerId === custId);
      const custOffers = (db.offers || []).filter(o => o.customerId === custId);
      const lastOffer = custOffers[0] || null;
      const hasJobs = custServices.length > 0 || custInvoices.length > 0;
      const targetStatus = hasJobs ? 'active' : 'lead';
      
      if (customer.status !== targetStatus) {
        customer.status = targetStatus;
        saveLocalData(db);
        pushToFirebase(db);
      }

      const offerEmailSent = customer.offerEmailSent || Boolean(lastOffer);
      const offerEmailSentAt = customer.offerEmailSentAt || lastOffer?.createdAt || lastOffer?.date;
      const offerEmailType = customer.offerEmailType || lastOffer?.type;
      const offerEmailNumber = customer.offerEmailNumber || lastOffer?.offerNumber;

      return {
        customer: {
          ...customer,
          status: targetStatus,
          lastOffer,
          offerEmailSent,
          offerEmailSentAt,
          offerEmailType,
          offerEmailNumber
        },
        services: custServices,
        invoices: custInvoices,
        offers: custOffers,
        mileage: db.mileage.filter(m => m.customerId === custId),
        emailLogs: (db.emailLogs || []).filter(e => e.customerId === custId)
      };
    }

    if (method === 'PUT') {
      const idx = db.customers.findIndex(c => c.id === custId);
      if (idx !== -1) {
        db.customers[idx] = { ...db.customers[idx], ...body, updatedAt: new Date().toISOString() };
        saveLocalData(db);
        pushToFirebase(db);
        return db.customers[idx];
      }
    }

    if (method === 'DELETE') {
      const idx = db.customers.findIndex(c => c.id === custId);
      if (idx !== -1) {
        const deleted = db.customers.splice(idx, 1)[0];
        // Also clean up services and invoices belonging to this customer
        db.services = db.services.filter(s => s.customerId !== custId);
        db.invoices = db.invoices.filter(i => i.customerId !== custId);
        db.mileage = db.mileage.filter(m => m.customerId !== custId);
        saveLocalData(db);
        pushToFirebase(db);
        return deleted;
      }
    }
  }

  // SERVICES
  if (endpoint.startsWith('/services')) {
    if (method === 'GET') {
      if (endpoint.includes('customerId=')) {
        const queryCustId = endpoint.split('customerId=')[1]?.split('&')[0];
        if (queryCustId) {
          return (db.services || []).filter(s => s.customerId === queryCustId);
        }
      }
      return db.services || [];
    }
    if (method === 'POST') {
      const newSrv = { id: `srv-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
      db.services.push(newSrv);
      // Auto-upgrade customer status to active
      if (newSrv.customerId) {
        const cIdx = db.customers.findIndex(c => c.id === newSrv.customerId);
        if (cIdx !== -1) {
          db.customers[cIdx].status = 'active';
        }
      }
      saveLocalData(db);
      pushToFirebase(db);
      return newSrv;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = db.services.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.services[idx] = { ...db.services[idx], ...body };
        if (db.services[idx].customerId) {
          const cIdx = db.customers.findIndex(c => c.id === db.services[idx].customerId);
          if (cIdx !== -1) {
            db.customers[cIdx].status = 'active';
          }
        }
        saveLocalData(db);
        pushToFirebase(db);
        return db.services[idx];
      }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const idx = db.services.findIndex(s => s.id === id);
      if (idx !== -1) {
        const del = db.services.splice(idx, 1)[0];
        // Re-evaluate customer status after service deletion
        if (del && del.customerId) {
          const remainingServices = db.services.filter(s => s.customerId === del.customerId);
          const remainingInvoices = db.invoices.filter(i => i.customerId === del.customerId);
          const cIdx = db.customers.findIndex(c => c.id === del.customerId);
          if (cIdx !== -1) {
            const hasRemainingJobs = remainingServices.length > 0 || remainingInvoices.length > 0;
            db.customers[cIdx].status = hasRemainingJobs ? 'active' : 'lead';
          }
        }
        saveLocalData(db);
        pushToFirebase(db);
        return del;
      }
    }
  }

  // BULK GENERATE INVOICES (FOR ABOS, EINMALIGE, OR ALL)
  if (endpoint === '/invoices/generate-monthly-abos' && method === 'POST') {
    const targetType = body?.type || 'all';
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    const dateStr = new Date().toISOString().split('T')[0];
    const dueDateStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const currentMonthName = monthNames[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    const createdInvoices = [];
    const activeAbos = targetType !== 'einmalig' 
      ? (db.services || []).filter(s => s.type === 'abo' && s.status === 'active')
      : [];

    let maxNum = 0;
    (db.invoices || []).forEach(inv => {
      if (inv.invoiceNumber) {
        const match = String(inv.invoiceNumber).match(/RE-\d{4}-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });

    activeAbos.forEach(abo => {
      const customer = db.customers.find(c => c.id === abo.customerId);
      if (!customer) return;

      const alreadyInvoiced = db.invoices.some(inv => 
        inv.customerId === abo.customerId &&
        inv.date && inv.date.startsWith(currentMonthPrefix) &&
        (inv.items || []).some(item => item.description?.toLowerCase().includes(abo.title.toLowerCase()) || item.unitPrice === Number(abo.price))
      );

      if (!alreadyInvoiced) {
        maxNum += 1;
        const invNum = `RE-${currentYear}-${String(maxNum).padStart(4, '0')}`;
        const price = Number(abo.price || 0);

        const newInv = {
          id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          invoiceNumber: invNum,
          customerId: customer.id,
          customerName: customer.companyName,
          customerAddress: customer.address || '',
          customerTaxId: customer.taxNumber || '',
          customerEmail: customer.email || '',
          date: dateStr,
          serviceDate: abo.startDate?.split('T')[0] || dateStr,
          dueDate: dueDateStr,
          taxRate: 0,
          isKleinunternehmer: true,
          status: 'sent',
          paidAt: '',
          notes: 'Vielen Dank für die laufende digitale Zusammenarbeit und Ihr Vertrauen.',
          paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
          items: [
            {
              id: String(Date.now()),
              description: `${abo.title} - Monatliche Betreuung & Cloud-Service (${currentMonthName} ${currentYear})`,
              quantity: 1,
              unitPrice: price,
              taxRate: 0
            }
          ],
          netAmount: price,
          taxAmount: 0,
          grossAmount: price,
          createdAt: new Date().toISOString()
        };

        db.invoices.push(newInv);
        createdInvoices.push(newInv);
      }
    });

    // Also generate invoices for completed unbilled once-services
    const completedEinmalige = targetType !== 'abo'
      ? (db.services || []).filter(s => s.type === 'einmalig' && (s.status === 'completed' || s.status === 'erledigt' || s.status === 'active'))
      : [];
    completedEinmalige.forEach(srv => {
      const customer = db.customers.find(c => c.id === srv.customerId);
      if (!customer) return;

      const alreadyInvoiced = db.invoices.some(inv => 
        inv.customerId === srv.customerId &&
        (inv.items || []).some(item => 
          item.description?.toLowerCase().includes(srv.title?.toLowerCase()) ||
          srv.title?.toLowerCase().includes(item.description?.toLowerCase()) ||
          Number(item.unitPrice) === Number(srv.price)
        )
      );

      if (!alreadyInvoiced) {
        maxNum += 1;
        const invNum = `RE-${currentYear}-${String(maxNum).padStart(4, '0')}`;
        const price = Number(srv.price || 0);
        const srvDate = srv.startDate?.split('T')[0] || srv.createdAt?.split('T')[0] || dateStr;

        const newInv = {
          id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          invoiceNumber: invNum,
          customerId: customer.id,
          customerName: customer.companyName,
          customerAddress: customer.address || '',
          customerTaxId: customer.taxNumber || '',
          customerEmail: customer.email || '',
          date: dateStr,
          serviceDate: srvDate,
          dueDate: dueDateStr,
          taxRate: 0,
          isKleinunternehmer: true,
          status: 'sent',
          paidAt: '',
          notes: 'Vielen Dank für Ihren Auftrag. Wir freuen uns auf die weitere Zusammenarbeit!',
          paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
          items: [
            {
              id: String(Date.now()),
              description: `${srv.title} (Einmalig)`,
              quantity: 1,
              unitPrice: price,
              taxRate: 0
            }
          ],
          netAmount: price,
          taxAmount: 0,
          grossAmount: price,
          createdAt: new Date().toISOString()
        };

        db.invoices.push(newInv);
        createdInvoices.push(newInv);
      }
    });

    if (createdInvoices.length > 0) {
      saveLocalData(db);
      pushToFirebase(db);
    }

    return {
      success: true,
      createdCount: createdInvoices.length,
      invoices: createdInvoices
    };
  }

  // INVOICES
  if (endpoint.startsWith('/invoices')) {
    if (method === 'GET') {
      let repaired = false;
      const seen = new Set();
      let maxCounter = 0;

      // Ensure every invoice has a strictly unique, consecutive RE number
      (db.invoices || []).forEach(inv => {
        if (!inv.invoiceNumber || inv.invoiceNumber.trim() === '' || seen.has(inv.invoiceNumber)) {
          maxCounter += 1;
          inv.invoiceNumber = `RE-2026-${String(maxCounter).padStart(4, '0')}`;
          repaired = true;
        } else {
          const match = String(inv.invoiceNumber).match(/RE-\d{4}-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxCounter) maxCounter = num;
          }
        }
        seen.add(inv.invoiceNumber);
      });

      if (repaired) {
        saveLocalData(db);
        pushToFirebase(db);
      }

      if (endpoint.includes('customerId=')) {
        const queryCustId = endpoint.split('customerId=')[1]?.split('&')[0];
        if (queryCustId) {
          return (db.invoices || []).filter(i => i.customerId === queryCustId);
        }
      }
      return db.invoices || [];
    }
    if (method === 'POST') {
      const itemSum = (body.items || []).reduce((s, it) => s + ((Number(it.unitPrice) || 0) * (Number(it.quantity) || 1)), 0);
      const exactAmount = itemSum > 0 ? itemSum : (Number(body.netAmount) || Number(body.grossAmount) || 0);
      
      // Calculate next strictly unique consecutive invoice number
      let maxNum = 0;
      (db.invoices || []).forEach(inv => {
        if (inv.invoiceNumber) {
          const match = String(inv.invoiceNumber).match(/RE-\d{4}-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
      });
      const generatedNumber = `RE-2026-${String(maxNum + 1).padStart(4, '0')}`;
      
      // If user passed a number that already exists, use generated consecutive number
      const isDuplicate = body.invoiceNumber && db.invoices.some(i => i.invoiceNumber === body.invoiceNumber);
      const finalInvNumber = (!body.invoiceNumber || body.invoiceNumber.trim() === '' || isDuplicate)
        ? generatedNumber 
        : body.invoiceNumber;

      const invDate = body.date || new Date().toISOString().split('T')[0];
      let invServiceDate = body.serviceDate;
      if (!invServiceDate) {
        const itemDesc = (body.items?.[0]?.description || '').toLowerCase();
        const matchedSrv = (db.services || []).find(s => {
          if (s.customerId !== body.customerId) return false;
          const sTitle = (s.title || '').toLowerCase();
          return itemDesc.includes(sTitle) || sTitle.includes(itemDesc.split(' ')[0]);
        }) || (db.services || []).find(s => s.customerId === body.customerId);
        invServiceDate = matchedSrv?.startDate?.split('T')[0] || matchedSrv?.createdAt?.split('T')[0] || invDate;
      }
      let invDueDate = body.dueDate;
      if (!invDueDate || invDueDate < invDate) {
        const d = new Date(invDate);
        d.setDate(d.getDate() + 14);
        invDueDate = d.toISOString().split('T')[0];
      }

      const newInv = {
        ...body,
        id: `inv-${Date.now()}`,
        invoiceNumber: finalInvNumber,
        date: invDate,
        serviceDate: invServiceDate,
        dueDate: invDueDate,
        isKleinunternehmer: true,
        taxRate: 0,
        taxAmount: 0,
        netAmount: exactAmount,
        grossAmount: exactAmount,
        createdAt: new Date().toISOString()
      };
      db.invoices.push(newInv);
      saveLocalData(db);
      pushToFirebase(db);
      return newInv;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = db.invoices.findIndex(i => i.id === id);
      if (idx !== -1) {
        const itemSum = (body.items || []).reduce((s, it) => s + ((Number(it.unitPrice) || 0) * (Number(it.quantity) || 1)), 0);
        const exactAmount = itemSum > 0 ? itemSum : (Number(body.netAmount) || Number(body.grossAmount) || 0);
        db.invoices[idx] = {
          ...db.invoices[idx],
          ...body,
          invoiceNumber: (body.invoiceNumber && body.invoiceNumber.trim() !== '') ? body.invoiceNumber : db.invoices[idx].invoiceNumber,
          taxRate: 0,
          taxAmount: 0,
          netAmount: exactAmount,
          grossAmount: exactAmount,
          isKleinunternehmer: true
        };
        saveLocalData(db);
        pushToFirebase(db);
        return db.invoices[idx];
      }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const idx = db.invoices.findIndex(i => i.id === id);
      if (idx !== -1) {
        const del = db.invoices.splice(idx, 1)[0];
        saveLocalData(db);
        pushToFirebase(db);
        return del;
      }
    }
  }

  // EXPENSES
  if (endpoint.startsWith('/expenses')) {
    if (method === 'GET') return db.expenses || [];
    if (method === 'POST') {
      const newExp = {
        id: `exp-${Date.now()}`,
        expenseNumber: body.expenseNumber || `BE-2026-${String(db.expenses.length + 1).padStart(4, '0')}`,
        ...body,
        createdAt: new Date().toISOString()
      };
      db.expenses.push(newExp);
      saveLocalData(db);
      pushToFirebase(db);
      return newExp;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = db.expenses.findIndex(e => e.id === id);
      if (idx !== -1) {
        db.expenses[idx] = { ...db.expenses[idx], ...body };
        saveLocalData(db);
        pushToFirebase(db);
        return db.expenses[idx];
      }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const idx = db.expenses.findIndex(e => e.id === id);
      if (idx !== -1) {
        const del = db.expenses.splice(idx, 1)[0];
        saveLocalData(db);
        pushToFirebase(db);
        return del;
      }
    }
  }

  // MILEAGE
  if (endpoint.startsWith('/mileage')) {
    if (method === 'GET') {
      if (endpoint.includes('customerId=')) {
        const queryCustId = endpoint.split('customerId=')[1]?.split('&')[0];
        if (queryCustId) {
          return (db.mileage || []).filter(m => m.customerId === queryCustId);
        }
      }
      return db.mileage || [];
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
      pushToFirebase(db);
      return newMil;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = db.mileage.findIndex(m => m.id === id);
      if (idx !== -1) {
        db.mileage[idx] = { ...db.mileage[idx], ...body };
        saveLocalData(db);
        pushToFirebase(db);
        return db.mileage[idx];
      }
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const idx = db.mileage.findIndex(m => m.id === id);
      if (idx !== -1) {
        const del = db.mileage.splice(idx, 1)[0];
        saveLocalData(db);
        pushToFirebase(db);
        return del;
      }
    }
  }

  // OFFERS & KOSTENVORANSCHLÄGE
  if (endpoint.startsWith('/offers')) {
    if (!db.offers) db.offers = [];

    if (method === 'GET') {
      if (endpoint.includes('customerId=')) {
        const queryCustId = endpoint.split('customerId=')[1]?.split('&')[0];
        if (queryCustId) {
          return db.offers.filter(o => o.customerId === queryCustId);
        }
      }
      const id = endpoint.split('/')[2];
      if (id && !id.includes('?')) {
        return db.offers.find(o => o.id === id) || null;
      }
      return db.offers || [];
    }

    if (method === 'POST') {
      const type = body.type === 'kostenvoranschlag' ? 'kostenvoranschlag' : 'angebot';
      const prefix = type === 'kostenvoranschlag' ? 'KV' : 'ANG';
      const currentYear = new Date().getFullYear();

      let maxNum = 0;
      (db.offers || []).forEach(off => {
        if (off.offerNumber) {
          const match = String(off.offerNumber).match(new RegExp(`${prefix}-\\d{4}-(\\d+)`));
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
      });
      const generatedNumber = `${prefix}-${currentYear}-${String(maxNum + 1).padStart(4, '0')}`;

      const newOffer = {
        id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        offerNumber: body.offerNumber || generatedNumber,
        type,
        status: body.status || 'draft',
        date: body.date || new Date().toISOString().split('T')[0],
        validUntilDate: body.validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customerId: body.customerId || '',
        customerName: body.customerName || '',
        customerContact: body.customerContact || '',
        customerAddress: body.customerAddress || '',
        customerEmail: body.customerEmail || '',
        customerTaxId: body.customerTaxId || '',
        packageA: body.packageA || null,
        packageB: body.packageB || null,
        packageC: body.packageC || null,
        customItems: body.customItems || [],
        totalOneTime: Number(body.totalOneTime || 0),
        totalRecurring: Number(body.totalRecurring || 0),
        recurringInterval: body.recurringInterval || 'monthly',
        totalAmount: Number(body.totalAmount || 0),
        notes: body.notes || '',
        terms: body.terms || '',
        createdAt: new Date().toISOString()
      };

      db.offers.unshift(newOffer);

      // Auto-sync with customer record and log in E-Mail history
      if (newOffer.customerId) {
        const targetCust = db.customers.find(c => c.id === newOffer.customerId);
        if (targetCust) {
          const nowStr = new Date().toISOString();
          targetCust.lastOffer = {
            id: newOffer.id,
            offerNumber: newOffer.offerNumber,
            type: newOffer.type,
            date: newOffer.date,
            totalAmount: newOffer.totalAmount || newOffer.totalOneTime,
            sentAt: nowStr
          };
          targetCust.offerEmailSent = true;
          targetCust.offerEmailSentAt = nowStr;
          targetCust.offerEmailType = newOffer.type;
          targetCust.offerEmailNumber = newOffer.offerNumber;
          targetCust.updatedAt = nowStr;

          const emailLog = {
            id: `mail-offer-${Date.now()}`,
            customerId: targetCust.id,
            customerName: targetCust.companyName,
            recipientEmail: targetCust.email || newOffer.customerEmail,
            subject: `${newOffer.type === 'kostenvoranschlag' ? 'Kostenvoranschlag' : 'Angebot'} ${newOffer.offerNumber} für ${targetCust.companyName}`,
            templateType: newOffer.type,
            sentAt: nowStr,
            body: body.emailBody || `${newOffer.type === 'kostenvoranschlag' ? 'Kostenvoranschlag' : 'Angebot'} ${newOffer.offerNumber} über ${newOffer.totalAmount || newOffer.totalOneTime} € erfasst & versendet.`
          };
          db.emailLogs = db.emailLogs || [];
          db.emailLogs.unshift(emailLog);
        }
      }

      saveLocalData(db);
      pushToFirebase(db);
      return newOffer;
    }

    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      const idx = db.offers.findIndex(o => o.id === id);
      if (idx !== -1) {
        const updatedOffer = { ...db.offers[idx], ...body, updatedAt: new Date().toISOString() };
        db.offers[idx] = updatedOffer;

        if (updatedOffer.customerId) {
          const targetCust = db.customers.find(c => c.id === updatedOffer.customerId);
          if (targetCust) {
            targetCust.lastOffer = {
              id: updatedOffer.id,
              offerNumber: updatedOffer.offerNumber,
              type: updatedOffer.type,
              date: updatedOffer.date,
              totalAmount: updatedOffer.totalAmount || updatedOffer.totalOneTime,
              sentAt: new Date().toISOString()
            };
            targetCust.offerEmailSent = true;
            targetCust.offerEmailSentAt = targetCust.offerEmailSentAt || new Date().toISOString();
            targetCust.offerEmailType = updatedOffer.type;
            targetCust.offerEmailNumber = updatedOffer.offerNumber;
            targetCust.updatedAt = new Date().toISOString();
          }
        }

        saveLocalData(db);
        pushToFirebase(db);
        return updatedOffer;
      }
    }

    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      const idx = db.offers.findIndex(o => o.id === id);
      if (idx !== -1) {
        const del = db.offers.splice(idx, 1)[0];
        saveLocalData(db);
        pushToFirebase(db);
        return del;
      }
    }
  }

  // TAX REPORT (§ 19 UStG Kleinunternehmer)
  if (endpoint.startsWith('/reports/tax-year/')) {
    const year = endpoint.split('/')[3] || '2026';
    const yearInvoices = db.invoices.filter(i => i.date && i.date.startsWith(year));
    const yearPaidInvoices = yearInvoices.filter(i => i.status === 'paid');
    const yearExpenses = db.expenses.filter(e => e.date && e.date.startsWith(year));
    const yearMileage = db.mileage.filter(m => m.date && m.date.startsWith(year));

    const totalRevenue = yearPaidInvoices.reduce((s, i) => s + getInvTotal(i), 0);
    const totalExpenses = yearExpenses.reduce((s, e) => s + Number(e.grossAmount || e.netAmount || 0), 0);

    const expensesByCategory = {};
    for (const exp of yearExpenses) {
      const cat = exp.category || 'Sonstiges';
      if (!expensesByCategory[cat]) expensesByCategory[cat] = { net: 0, tax: 0, gross: 0, count: 0 };
      const amt = Number(exp.grossAmount || exp.netAmount || 0);
      expensesByCategory[cat].net += amt;
      expensesByCategory[cat].gross += amt;
      expensesByCategory[cat].count += 1;
    }

    const totalKm = yearMileage.reduce((s, m) => s + Number(m.kilometers || 0), 0);
    const totalMileageDeduction = yearMileage.reduce((s, m) => s + Number(m.totalDeduction || 0), 0);
    const netProfit = Number((totalRevenue - totalExpenses - totalMileageDeduction).toFixed(2));

    return {
      year,
      company: db.companySettings,
      isKleinunternehmer: true,
      revenue: {
        net: Number(totalRevenue.toFixed(2)),
        tax: 0,
        gross: Number(totalRevenue.toFixed(2)),
        invoicesCount: yearPaidInvoices.length,
        allInvoicesCount: yearInvoices.length,
        items: yearPaidInvoices
      },
      expenses: {
        net: Number(totalExpenses.toFixed(2)),
        tax: 0,
        gross: Number(totalExpenses.toFixed(2)),
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
        vatPayable: 0,
        vatCollected: 0,
        inputVatDeductible: 0
      }
    };
  }

  // DISPOSITIONS (AUFTRAGSDISPOSITION & KANBAN-BOARD)
  if (endpoint.startsWith('/dispositions')) {
    if (!db.dispositions) db.dispositions = [];

    if (endpoint === '/dispositions') {
      if (method === 'GET') {
        return db.dispositions;
      }
      if (method === 'POST') {
        let maxNum = 200;
        db.dispositions.forEach(d => {
          const match = String(d.dispNumber || d.id).match(/DISP-(\d+)/i);
          if (match) {
            const n = parseInt(match[1], 10);
            if (!isNaN(n) && n > maxNum) maxNum = n;
          }
        });
        const dispNumber = body.dispNumber || `DISP-${maxNum + 1}`;
        const newDisp = {
          id: `disp-${Date.now()}`,
          dispNumber,
          title: body.title || 'Neuer Auftrag',
          customerId: body.customerId || null,
          customerName: body.customerName || 'Allgemein',
          project: body.project || '',
          priority: body.priority || 'medium', // 'low', 'medium', 'high'
          status: body.status || 'geplant', // 'geplant', 'in_progress', 'review', 'completed'
          tags: Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map(t => t.trim()) : []),
          assignee: body.assignee || 'Max Mustermann',
          date: body.date || new Date().toISOString().split('T')[0],
          notes: body.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.dispositions.push(newDisp);
        saveLocalData(db);
        pushToFirebase(db);
        return newDisp;
      }
    }

    const parts = endpoint.split('/');
    const dispId = parts[2];
    const index = db.dispositions.findIndex(d => d.id === dispId);

    if (index !== -1) {
      if (method === 'GET') return db.dispositions[index];
      if (method === 'PUT') {
        db.dispositions[index] = {
          ...db.dispositions[index],
          ...body,
          updatedAt: new Date().toISOString()
        };
        saveLocalData(db);
        pushToFirebase(db);
        return db.dispositions[index];
      }
      if (method === 'DELETE') {
        const deleted = db.dispositions.splice(index, 1);
        saveLocalData(db);
        pushToFirebase(db);
        return deleted[0];
      }
    }
  }

  // SETTINGS
  if (endpoint === '/settings') {
    if (method === 'GET') return db.companySettings;
    if (method === 'PUT') {
      db.companySettings = { ...db.companySettings, ...body };
      saveLocalData(db);
      pushToFirebase(db);
      return db.companySettings;
    }
  }

  return {};
}

async function request(endpoint, options = {}) {
  return await handleLocalRequest(endpoint, options);
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
  generateMonthlyAboInvoices: (type = 'all') => request('/invoices/generate-monthly-abos', { method: 'POST', body: JSON.stringify({ type }) }),
  getExpenses: () => request('/expenses'),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  getMileage: (customerId) => request(`/mileage${customerId ? `?customerId=${customerId}` : ''}`),
  createMileage: (data) => request('/mileage', { method: 'POST', body: JSON.stringify(data) }),
  updateMileage: (id, data) => request(`/mileage/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMileage: (id) => request(`/mileage/${id}`, { method: 'DELETE' }),
  getDispositions: () => request('/dispositions'),
  getDisposition: (id) => request(`/dispositions/${id}`),
  createDisposition: (data) => request('/dispositions', { method: 'POST', body: JSON.stringify(data) }),
  updateDisposition: (id, data) => request(`/dispositions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDisposition: (id) => request(`/dispositions/${id}`, { method: 'DELETE' }),
  getOffers: (customerId) => request(`/offers${customerId ? `?customerId=${customerId}` : ''}`),
  getOffer: (id) => request(`/offers/${id}`),
  createOffer: (data) => request('/offers', { method: 'POST', body: JSON.stringify(data) }),
  updateOffer: (id, data) => request(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOffer: (id) => request(`/offers/${id}`, { method: 'DELETE' }),
  setOfferCustomerResponded: (customerId, responded = true) => request(`/customers/${customerId}/offer-response`, { method: 'POST', body: JSON.stringify({ responded }) }),
  getTaxReport: (year) => request(`/reports/tax-year/${year}`),
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  
  // Direct Firebase Cloud Sync Controls
  syncCloudNow: () => syncWithFirebaseOnce(),
  uploadLocalToCloud: () => {
    const db = getLocalData();
    pushToFirebase(db);
    return true;
  },

  // Full Database Backup & Restore (100% Comprehensive System Snapshot)
  exportBackup: () => {
    const db = getLocalData();
    let cloudConfig = null;
    try {
      const stored = localStorage.getItem('teamtrack_firebase_config');
      if (stored) cloudConfig = JSON.parse(stored);
    } catch {}

    return {
      version: '1.0',
      appName: 'TeamTrack',
      exportedAt: new Date().toISOString(),
      counts: {
        customers: (db.customers || []).length,
        services: (db.services || []).length,
        invoices: (db.invoices || []).length,
        offers: (db.offers || []).length,
        expenses: (db.expenses || []).length,
        mileage: (db.mileage || []).length
      },
      cloudConfig,
      data: db
    };
  },
  importBackup: (backupObj) => {
    if (!backupObj || typeof backupObj !== 'object') {
      throw new Error('Ungültige Backup-Datei.');
    }
    const rawData = backupObj.data || backupObj;
    if (!rawData.customers && !rawData.invoices && !rawData.companySettings) {
      throw new Error('Die Datei enthält keine gültigen TeamTrack-Daten.');
    }
    const db = {
      customers: rawData.customers || [],
      services: rawData.services || [],
      invoices: rawData.invoices || [],
      offers: rawData.offers || [],
      expenses: rawData.expenses || [],
      mileage: rawData.mileage || [],
      emailLogs: rawData.emailLogs || [],
      companySettings: rawData.companySettings || defaultData.companySettings
    };
    if (backupObj.cloudConfig) {
      try {
        localStorage.setItem('teamtrack_firebase_config', JSON.stringify(backupObj.cloudConfig));
      } catch {}
    }
    saveLocalData(db);
    pushToFirebase(db);
    return {
      success: true,
      counts: {
        customers: db.customers.length,
        services: db.services.length,
        invoices: db.invoices.length,
        offers: (db.offers || []).length,
        expenses: db.expenses.length,
        mileage: db.mileage.length
      }
    };
  }
};
