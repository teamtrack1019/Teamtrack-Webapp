import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed data if database is empty
const defaultData = {
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
      body: 'Sehr geehrter Herr Schmidt,\n\nvielen Dank für das angenehme Gespräch. Anbei sende ich Ihnen die Zusammenfassung zur Digitalisierung Ihrer Baudokumentation...'
    },
    {
      id: 'mail-2',
      customerId: 'cust-2',
      customerName: 'Bäcker Meisterei Lehmann',
      recipientEmail: 'kontakt@baeckerei-lehmann.de',
      subject: 'Demo-Zugang: Filial-Bestellsystem WebApp',
      templateType: 'demo_intro',
      sentAt: '2026-08-22T14:15:00.000Z',
      body: 'Guten Tag Frau Lehmann,\n\nhier ist Ihr persönlicher Demo-Link für das neue Filial-Bestellsystem...'
    },
    {
      id: 'mail-3',
      customerId: 'cust-3',
      customerName: 'Elektrotechnik Müller & Söhne',
      recipientEmail: 's.mueller@elektro-mueller-berlin.de',
      subject: 'Vorstellung: Schluss mit Zettelwirtschaft & Papierkram',
      templateType: 'demo_intro',
      sentAt: '2026-09-01T09:45:00.000Z',
      body: 'Hallo Herr Müller,\n\nwie besprochen präsentiere ich Ihnen hier kurz, wie wir Handwerksbetriebe dabei unterstützen, Stundenzettel und Abnahmeprotokolle 100% digital abzubilden...'
    }
  ]
};

// In-memory cache synced with disk
let db = null;

export async function initDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const content = await fs.readFile(DB_FILE, 'utf-8');
      db = JSON.parse(content);
    } catch {
      // Initialize with default seed data
      db = defaultData;
      await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing DB:', err);
    db = defaultData;
  }
  return db;
}

export async function saveDb() {
  if (!db) return;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    await fs.rename(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}
