import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  FileText, 
  Download, 
  Send, 
  Check, 
  Copy, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Package, 
  Clock, 
  Calendar, 
  User, 
  Building, 
  Mail, 
  FileCheck, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Tag,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  CheckSquare,
  Square,
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  X,
  Info
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateOfferPDF, generateAbnahmePDF } from '../utils/pdfGenerator';
import { api } from '../api';

export const PAKET_A_MODULES = [
  { id: 'pkgA-1', title: 'Kunden- & Stammdatenverwaltung' },
  { id: 'pkgA-2', title: 'Live-Terminkalender & Einsatzplanung' },
  { id: 'pkgA-3', title: 'Zeiterfassung & Digitale Stundenzettel' },
  { id: 'pkgA-4', title: 'Material- & Lagerwirtschaft' },
  { id: 'pkgA-5', title: 'Mobiler Foto-Upload & Schadensberichte' },
  { id: 'pkgA-6', title: 'Rollen- & Rechtesystem (Admin/Mitarbeiter)' },
  { id: 'pkgA-7', title: 'PDF-Berichts- und Rechnungsexport' },
  { id: 'pkgA-8', title: 'Automatisierte E-Mail- / SMS-Benachrichtigung' }
];

const PREDEFINED_MODULES = [
  { id: 'mod-1', num: '1', title: 'Modul 1: Mobile Zeiterfassung & Digitale Stundenzettel', desc: 'Rechtssichere Mitarbeiter-Zeiterfassung, GPS-Stempelung & digitale Arbeitszeitnachweise' },
  { id: 'mod-2', num: '2', title: 'Modul 2: 1-Klick Rechnungsstellung & Mahnwesen', desc: 'Automatische Rechnungserstellung, Mahnstufen, EÜR-Export & PDF-Versand' },
  { id: 'mod-3', num: '3', title: 'Modul 3: Fuhrpark-, TÜV- & Materialverwaltung', desc: 'Digitales Fahrtenbuch (0,30 €/km), Fahrzeugwartung, TÜV-Fristen & Lagerbestand' },
  { id: 'mod-4', num: '4', title: 'Modul 4: Kundenverwaltung (CRM) & Kunden-Portal', desc: 'Zentraler Kundenstamm, Einsatzhistorie, Dokumentenablage & Kunden-Selbstbedienung' },
  { id: 'mod-5', num: '5', title: 'Modul 5: Logistik-, Dispositions- & Tourenplanung', desc: 'Einsatzplanung für Mitarbeiter & Fahrzeuge, Routenoptimierung & Auftragsverfolgung' }
];

function PricingOffersContent({ 
  initialTab = 'creator',
  customers = [], 
  companySettings = {}, 
  onConvertToInvoice,
  onOpenCustomerModal 
}) {
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const [activeTab, setActiveTab] = useState(initialTab || 'creator'); // 'creator' | 'abnahme' | 'history'
  const [offersList, setOffersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Abnahmeprotokoll Modal State
  const [abnahmeModalOffer, setAbnahmeModalOffer] = useState(null);
  const [abnahmeCopied, setAbnahmeCopied] = useState(false);

  // Form State
  const [docType, setDocType] = useState('angebot'); // 'angebot' | 'kostenvoranschlag'
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [offerNumber, setOfferNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validDays, setValidDays] = useState(30);
  
  // Package A: Komplett-Entwicklung
  const [pkgAIncluded, setPkgAIncluded] = useState(true);
  const [pkgAPrice, setPkgAPrice] = useState(2400);
  const [pkgASelectedModuleIds, setPkgASelectedModuleIds] = useState(
    PAKET_A_MODULES.map(m => m.id)
  );

  const togglePkgAModule = (id) => {
    setPkgASelectedModuleIds(prev => 
      (prev || []).includes(id) ? (prev || []).filter(mId => mId !== id) : [...(prev || []), id]
    );
  };

  // Package B: Setup + Abo
  const [pkgBIncluded, setPkgBIncluded] = useState(true);
  const [pkgBSetupPrice, setPkgBSetupPrice] = useState(1490);
  const [pkgBInterval, setPkgBInterval] = useState('monthly'); // 'monthly' | 'quarterly' | 'yearly'
  const [pkgBMonthlyPrice, setPkgBMonthlyPrice] = useState(149);
  const [pkgBQuarterlyPrice, setPkgBQuarterlyPrice] = useState(420);
  const [pkgBYearlyPrice, setPkgBYearlyPrice] = useState(1590);

  // Package C: Modul-Erweiterung (Selectable modules list)
  const [pkgCIncluded, setPkgCIncluded] = useState(false);
  const [pkgCUnitPrice, setPkgCUnitPrice] = useState(890);
  const [selectedModuleIds, setSelectedModuleIds] = useState(['mod-1']);
  const [customModules, setCustomModules] = useState([]);
  const [newCustomModuleName, setNewCustomModuleName] = useState('');

  // Custom Items
  const [customItems, setCustomItems] = useState([]);

  // Individual Notes
  const [customNotes, setCustomNotes] = useState('');

  // Filter for history tab
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'angebot' | 'kostenvoranschlag'

  // Load existing offers from API
  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await api.getOffers();
      setOffersList(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load offers:', err);
      setOffersList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Pre-select first customer if available and none selected
  useEffect(() => {
    if (!selectedCustomerId && safeCustomers.length > 0) {
      setSelectedCustomerId(safeCustomers[0]?.id || '');
    }
  }, [safeCustomers, selectedCustomerId]);

  // Generate dynamic Offer Number preview
  useEffect(() => {
    const prefix = docType === 'kostenvoranschlag' ? 'KV' : 'ANG';
    const year = new Date().getFullYear();
    const count = (offersList || []).filter(o => o && o.type === docType).length + 1;
    setOfferNumber(`${prefix}-${year}-${String(count).padStart(4, '0')}`);
  }, [docType, offersList]);

  // Selected Customer details
  const selectedCustomer = useMemo(() => {
    return safeCustomers.find(c => c && c.id === selectedCustomerId) || null;
  }, [safeCustomers, selectedCustomerId]);

  // Calculated Dates
  const validUntilDate = useMemo(() => {
    const d = new Date(date || Date.now());
    d.setDate(d.getDate() + Number(validDays || 30));
    return d.toISOString().split('T')[0];
  }, [date, validDays]);

  // Module toggle
  const toggleModuleSelection = (id) => {
    setSelectedModuleIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  // Add custom module
  const handleAddCustomModule = () => {
    if (!newCustomModuleName.trim()) return;
    const newId = `custom-mod-${Date.now()}`;
    setCustomModules(prev => [
      ...prev,
      { id: newId, num: `${PREDEFINED_MODULES.length + prev.length + 1}`, title: `Modul: ${newCustomModuleName.trim()}`, desc: 'Kundenspezifisches Erweiterungsmodul', selected: true }
    ]);
    setSelectedModuleIds(prev => [...prev, newId]);
    setNewCustomModuleName('');
  };

  const handleRemoveCustomModule = (id) => {
    setCustomModules(prev => prev.filter(m => m.id !== id));
    setSelectedModuleIds(prev => prev.filter(mId => mId !== id));
  };

  // Active Modules List
  const activeSelectedModules = useMemo(() => {
    const std = PREDEFINED_MODULES.filter(m => selectedModuleIds.includes(m.id));
    const cst = customModules.filter(m => selectedModuleIds.includes(m.id));
    return [...std, ...cst];
  }, [selectedModuleIds, customModules]);

  const selectedModulesCount = activeSelectedModules.length;

  // Calculate Totals
  const currentPkgBRecurringPrice = useMemo(() => {
    if (!pkgBIncluded) return 0;
    if (pkgBInterval === 'yearly') return Number(pkgBYearlyPrice || 1590);
    if (pkgBInterval === 'quarterly') return Number(pkgBQuarterlyPrice || 420);
    return Number(pkgBMonthlyPrice || 149);
  }, [pkgBIncluded, pkgBInterval, pkgBMonthlyPrice, pkgBQuarterlyPrice, pkgBYearlyPrice]);

  const pkgCTotal = useMemo(() => {
    if (!pkgCIncluded) return 0;
    return Number(pkgCUnitPrice || 890) * selectedModulesCount;
  }, [pkgCIncluded, pkgCUnitPrice, selectedModulesCount]);

  const totalOneTime = useMemo(() => {
    let sum = 0;
    if (pkgAIncluded) sum += Number(pkgAPrice || 0);
    if (pkgBIncluded) sum += Number(pkgBSetupPrice || 0);
    if (pkgCIncluded) sum += pkgCTotal;
    (customItems || []).forEach(it => {
      sum += (Number(it.unitPrice || 0) * Number(it.quantity || 1));
    });
    return sum;
  }, [pkgAIncluded, pkgAPrice, pkgBIncluded, pkgBSetupPrice, pkgCIncluded, pkgCTotal, customItems]);

  const isKV = docType === 'kostenvoranschlag';
  const pricePrefix = isKV ? 'ab ' : '';

  // Add custom line item
  const handleAddCustomItem = () => {
    setCustomItems(prev => [
      ...prev,
      { id: `custom-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleUpdateCustomItem = (id, field, value) => {
    setCustomItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const handleRemoveCustomItem = (id) => {
    setCustomItems(prev => prev.filter(it => it.id !== id));
  };

  // Compile Current Offer Object
  const getCurrentOfferPayload = () => {
    return {
      offerNumber,
      type: docType,
      status: 'draft',
      date,
      validUntilDate,
      customerId: selectedCustomer?.id || '',
      customerName: selectedCustomer?.companyName || 'Interessent',
      customerContact: selectedCustomer?.contactPerson || '',
      customerAddress: selectedCustomer?.address || '',
      customerEmail: selectedCustomer?.email || '',
      customerTaxId: selectedCustomer?.taxNumber || '',
      packageA: {
        included: pkgAIncluded,
        price: Number(pkgAPrice || 2400),
        selectedModules: PAKET_A_MODULES.filter(m => pkgASelectedModuleIds.includes(m.id)),
        moduleNames: PAKET_A_MODULES.filter(m => pkgASelectedModuleIds.includes(m.id)).map(m => m.title)
      },
      packageB: {
        included: pkgBIncluded,
        setupPrice: Number(pkgBSetupPrice !== undefined && pkgBSetupPrice !== null && pkgBSetupPrice !== '' ? pkgBSetupPrice : 1490),
        interval: pkgBInterval,
        recurringPrice: currentPkgBRecurringPrice
      },
      packageC: {
        included: pkgCIncluded,
        unitPrice: Number(pkgCUnitPrice || 890),
        quantity: selectedModulesCount,
        selectedModules: activeSelectedModules.map(m => ({ id: m.id, title: m.title })),
        moduleName: activeSelectedModules.map(m => m.title).join(' • ')
      },
      customItems,
      totalOneTime,
      totalRecurring: currentPkgBRecurringPrice,
      recurringInterval: pkgBInterval,
      totalAmount: totalOneTime + (pkgBIncluded ? currentPkgBRecurringPrice : 0),
      notes: customNotes
    };
  };

  // Save Offer to Database
  const handleSaveOffer = async () => {
    try {
      const payload = getCurrentOfferPayload();
      await api.createOffer(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadOffers();
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    }
  };

  // Download PDF
  const handleDownloadPDF = () => {
    const payload = getCurrentOfferPayload();
    generateOfferPDF(payload, companySettings);
  };

  // Compose Email Text
  const getOfferEmailBody = () => {
    const cust = selectedCustomer || { companyName: 'Ihr Unternehmen', contactPerson: '' };
    const greeting = cust.contactPerson 
      ? (cust.contactPerson.toLowerCase().startsWith('frau') ? `Sehr geehrte ${cust.contactPerson},` : cust.contactPerson.toLowerCase().startsWith('herr') ? `Sehr geehrter ${cust.contactPerson},` : `Sehr geehrte(r) Frau/Herr ${cust.contactPerson},`)
      : 'Sehr geehrte Damen und Herren,';

    const intervalText = pkgBInterval === 'yearly' ? 'jährlich' : pkgBInterval === 'quarterly' ? 'vierteljährlich' : 'monatlich';

    const activePkgAModules = PAKET_A_MODULES.filter(m => pkgASelectedModuleIds.includes(m.id));
    const selectedPkgAModsFormatted = activePkgAModules.length > 0
      ? activePkgAModules.map(m => `    - ${m.title}`).join('\n')
      : '    - Keine Module ausgewählt';

    const selectedModsFormatted = activeSelectedModules.length > 0
      ? activeSelectedModules.map(m => `    - ${m.title}`).join('\n')
      : '    - Keine Module ausgewählt';

    return `${greeting}

vielen Dank für Ihr Interesse an einer Zusammenarbeit mit TeamTrack-Software.
${isKV ? 'Wie besprochen haben wir für Sie einen unverbindlichen Kostenvoranschlag' : 'Gerne unterbreiten wir Ihnen nachfolgend unser maßgeschneidertes Angebot'} für die Digitalisierung Ihrer Betriebsabläufe zusammengestellt:

📋 ${isKV ? 'KOSTENVORANSCHLAG' : 'ANGEBOT'} ${offerNumber}
${pkgAIncluded ? `• Paket A (Komplett-Entwicklung & WebApp): ${pricePrefix}${formatCurrency(pkgAPrice)} (einmalig)\n  Vereinbarter Modulumfang:\n${selectedPkgAModsFormatted}\n` : ''}${pkgBIncluded ? `• Paket B (Setup + 7/24 Abo-Betreuung): Setup ${pricePrefix}${formatCurrency(pkgBSetupPrice)} + ${pricePrefix}${formatCurrency(currentPkgBRecurringPrice)} / ${intervalText}\n` : ''}${pkgCIncluded && selectedModulesCount > 0 ? `• Paket C (Modulare Funktionserweiterung - ${selectedModulesCount} Modul${selectedModulesCount > 1 ? 'e' : ''} zu je ${pricePrefix}${formatCurrency(pkgCUnitPrice)} = ${pricePrefix}${formatCurrency(pkgCTotal)}):\n  Ausgewählte Funktionsbereiche:\n${selectedModsFormatted}\n` : ''}
${currentPkgBRecurringPrice > 0 
  ? `Einmalige Investition (Setup): ${pricePrefix}${formatCurrency(totalOneTime)}\nLaufende Betreuung (${intervalText}): ${pricePrefix}${formatCurrency(currentPkgBRecurringPrice)}\nGesamtsumme (Erstabwicklung inkl. 1. ${pkgBInterval === 'yearly' ? 'Jahr' : pkgBInterval === 'quarterly' ? 'Quartal' : 'Monat'}): ${pricePrefix}${formatCurrency(totalOneTime + currentPkgBRecurringPrice)}\n`
  : `Gesamtsumme: ${pricePrefix}${formatCurrency(totalOneTime)}\n`
}
${(() => {
  let cond = '';
  if (pkgAIncluded) {
    cond += `\n📌 Vereinbarungen & 30-Tage-Garantie (Paket A):
• Verbindlicher Leistungsumfang: Es werden ausschließlich die oben explizit ausgewählten Module umgesetzt.
• Abnahme & Prüfung: Nach Übergabe der betriebsbereiten Software hat der Auftraggeber das System innerhalb von 10 Werktagen zu prüfen und schriftlich abzunehmen.
• Kostenlose 30-Tage-Garantie: Ab dem Tag der Abnahme behebt der Auftragnehmer für einen Zeitraum von 30 Kalendertagen alle reproduzierbaren Fehler (Bugs) der vereinbarten Funktionen kostenlos.
• Nach Ablauf der 30 Tage (Ausschluss kostenloser Wartung): Nach Ablauf der 30 Tage erlischt jeglicher Anspruch auf kostenlose Serviceleistungen. Zukünftige Anpassungen, Sicherheitsupdates oder Betriebssystem-Upgrades erfolgen ausschließlich gegen gesonderte Vergütung zum Stundensatz von 85,- € / Std. oder im Rahmen eines separaten Wartungsvertrags (Paket B).
`;
  }
  if (pkgBIncluded) {
    cond += `\nℹ️ Leistungsumfang & Abo-Bedingungen (Paket B):
• Schlüsselfertige Implementierung: Das System wird mit einer einmaligen Initial-Einrichtung betriebsbereit übergeben.
• 7/24-Abo-Betreuung: Umfasst vorrangigen Notfall-Support mit direkter Entwickler-Reaktionszeit, hochverfügbaren Cloud-Server-Betrieb in ISO-zertifizierten Rechenzentren, kontinuierliche DSGVO- & Sicherheitsupdates sowie laufende Feature-Erweiterungen.
• Datensicherung: Integrierte 1-Klick Backup-Funktion zur eigenständigen Datensicherung durch den Kunden.
• Laufzeit & Kündigung: Der Betreuungsvertrag ist ${intervalText} flexibel anpassbar und kündbar.
• Zahlungsmodalitäten: Setup bei Bereitstellung; laufende Abo-Betreuung jeweils zu Beginn des Abrechnungszeitraums (${intervalText}).
`;
  }
  if (pkgCIncluded && selectedModulesCount > 0) {
    cond += `\n🧩 Vereinbarungen zu den Erweiterungsmodulen (Paket C):
• Verbindlicher Leistungsumfang: Der Leistungsumfang beschränkt sich ausschließlich auf die ${selectedModulesCount} oben ausgewählten Module. Zusätzliche oder nicht aufgeführte Funktionsbereiche bedürfen einer gesonderten schriftlichen Beauftragung.
• Nahtlose Integration: Vollständige technische Anbindung an das bestehende TeamTrack-System inklusive Funktionstest und Einweisung.
`;
  }
  if (pkgAIncluded || (pkgCIncluded && selectedModulesCount > 0)) {
    cond += `\n💳 Zahlungsmodalitäten (Entwicklung): 50% Anzahlung bei Auftragsannahme, 50% Schlusszahlung nach Bereitstellung & Freigabe.\n`;
  }
  return cond;
})()}
Das vollständige und detaillierte PDF-Dokument inklusive Leistungsbeschreibung ist für Sie vorbereitet.
Gültig bis: ${formatDate(validUntilDate)}

Bei Fragen oder Anpassungswünschen stehe ich Ihnen jederzeit gerne persönlich zur Verfügung.

Mit freundlichen Grüßen

TeamTrack-Software
Softwareentwicklung & IT-Beratung
Balthasar-Neumann-Str. 38
97236 Randersacker

Tel: +49 172 4690446
E-Mail: kontakt@team-track.de
Web: https://team-track.de`;
  };

  // Open Outlook App Compose
  const handleOpenOutlook = async () => {
    const subject = `${isKV ? 'Kostenvoranschlag' : 'Angebot'} ${offerNumber} für ${selectedCustomer?.companyName || 'Ihr Unternehmen'} – TeamTrack`;
    const body = getOfferEmailBody();

    try {
      const payload = getCurrentOfferPayload();
      payload.status = 'sent';
      payload.emailBody = body;
      await api.createOffer(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadOffers();
    } catch (err) {
      console.warn('Auto-save offer error:', err);
    }

    const mailtoUrl = `mailto:${encodeURIComponent(selectedCustomer?.email || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Copy Offer Text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getOfferEmailBody());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Kopieren fehlgeschlagen.');
    }
  };

  // Compose Abnahmeprotokoll Email Text
  const getAbnahmeEmailBody = (offer) => {
    const cust = safeCustomers.find(c => c && c.id === offer?.customerId) || { 
      companyName: offer?.customerName || 'Ihr Unternehmen', 
      contactPerson: offer?.customerContact || '' 
    };
    const cp = String(cust.contactPerson || '').trim();
    const greeting = cp 
      ? (cp.toLowerCase().startsWith('frau') ? `Sehr geehrte ${cp},` : cp.toLowerCase().startsWith('herr') ? `Sehr geehrter ${cp},` : `Sehr geehrte(r) Frau/Herr ${cp},`)
      : 'Sehr geehrte Damen und Herren,';

    const hasPkgA = Boolean(offer?.packageA && offer.packageA.included);
    const hasPkgB = Boolean(offer?.packageB && offer.packageB.included);
    const hasPkgC = Boolean(offer?.packageC && offer.packageC.included);
    const abnNumber = `ABN-${new Date().getFullYear()}-${String(offer?.id || Date.now()).slice(-4)}`;

    let bodyText = `${greeting}

wir freuen uns, Ihnen mitteilen zu können, dass die Bereitstellung und Implementierung Ihrer maßgeschneiderten Softwarelösung (TeamTrack) erfolgreich abgeschlossen wurde.

📋 SOFTWARE-ABNAHMEPROTOKOLL ${abnNumber}
Referenz: ${offer?.type === 'kostenvoranschlag' ? 'Kostenvoranschlag' : 'Angebot'} ${offer?.offerNumber || ''}
Datum: ${formatDate(new Date())}
`;

    if (hasPkgA) {
      const defaultMods = [
        'Kunden- & Stammdatenverwaltung',
        'Live-Terminkalender & Einsatzplanung',
        'Zeiterfassung & Digitale Stundenzettel',
        'Material- & Lagerwirtschaft',
        'Mobiler Foto-Upload & Schadensberichte',
        'Rollen- & Rechtesystem (Admin/Mitarbeiter)',
        'PDF-Berichts- und Rechnungsexport',
        'Automatisierte E-Mail- / SMS-Benachrichtigung'
      ];
      let mods = defaultMods;
      if (Array.isArray(offer?.packageA?.selectedModules) && offer.packageA.selectedModules.length > 0) {
        mods = offer.packageA.selectedModules.map(m => typeof m === 'string' ? m : (m.title || m.name || String(m)));
      } else if (Array.isArray(offer?.packageA?.moduleNames) && offer.packageA.moduleNames.length > 0) {
        mods = offer.packageA.moduleNames;
      } else if (typeof offer?.packageA?.moduleNames === 'string' && offer.packageA.moduleNames.trim()) {
        mods = offer.packageA.moduleNames.split(',').map(s => s.trim());
      }

      bodyText += `
✅ Paket A (Komplett-Entwicklung & WebApp):
Das System und die nachfolgend vereinbarten Module wurden vollständig betriebsbereit implementiert und übergeben:
${mods.map(m => `  - ${m}`).join('\n')}

📌 Abnahmeerklärung & 30-Tage-Garantie:
Mit der heutigen Übergabe beginnt Ihre 30-tägige kostenlose Garantiefrist, in welcher reproduzierbare Funktionsfehler (Bugs) kostenlos durch uns behoben werden. Nach Ablauf der 30 Tage erlischt jeglicher Anspruch auf kostenfreie Serviceleistungen. Zukünftige Anpassungen, Sicherheitsupdates oder Upgrades erfolgen ausschließlich gegen gesonderte Vergütung (Stundensatz: 85,- € / Std.) oder im Rahmen eines separaten Betreuungsvertrags (Paket B).
`;
    }

    if (hasPkgB) {
      const intervalText = offer?.packageB?.interval === 'yearly' ? 'jährlich' : offer?.packageB?.interval === 'quarterly' ? 'vierteljährlich' : 'monatlich';
      bodyText += `
✅ Paket B (Setup + 7/24 Abo-Betreuung):
Das Initial-Setup wurde erfolgreich bereitgestellt und die Admin-Zugänge übergeben. Das System geht nahtlos in den laufenden 7/24-Betrieb über (${intervalText} kündbar).
`;
    }

    if (hasPkgC) {
      let modNames = [];
      if (Array.isArray(offer?.packageC?.selectedModules) && offer.packageC.selectedModules.length > 0) {
        modNames = offer.packageC.selectedModules
          .filter(m => m && m.selected !== false)
          .map(m => `  - ${typeof m === 'string' ? m : (m.title || m.name || String(m))}`);
      }
      if (modNames.length === 0) {
        modNames = [`  - ${offer?.packageC?.moduleName || 'Individuelle Erweiterungsmodule'}`];
      }
      bodyText += `
✅ Paket C (Modulare Funktionserweiterung):
Die vereinbarten Zusatzmodule wurden erfolgreich in das System integriert und freigegeben:
${modNames.join('\n')}
`;
    }

    bodyText += `
🔒 Wichtiger Hinweis zur Datensicherung:
Die regelmäßige Erstellung von Datensicherungen (Backups) obliegt der Eigenverantwortung des Kunden und kann jederzeit eigenständig mit 1 Klick über die integrierte Backup-Funktion im System durchgeführt werden.

Das rechtsverbindliche Abnahmeprotokoll als PDF-Dokument liegt dieser E-Mail bei. Bitte senden Sie uns das Dokument gegengezeichnet zurück.

Bei Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen

TeamTrack-Software
Softwareentwicklung & IT-Beratung
Balthasar-Neumann-Str. 38
97236 Randersacker

Tel: +49 172 4690446
E-Mail: kontakt@team-track.de
Web: https://team-track.de`;

    return bodyText;
  };

  // Open Outlook for Abnahme
  const handleOpenAbnahmeOutlook = (offer) => {
    const cust = safeCustomers.find(c => c && c.id === offer?.customerId) || { email: offer?.customerEmail || '' };
    const abnNumber = `ABN-${new Date().getFullYear()}-${String(offer?.id || Date.now()).slice(-4)}`;
    const subject = `Software-Abnahmeprotokoll ${abnNumber} – ${offer?.customerName || 'Ihr Unternehmen'} – TeamTrack`;
    const body = getAbnahmeEmailBody(offer);

    const mailtoUrl = `mailto:${encodeURIComponent(cust.email || offer?.customerEmail || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Copy Abnahme Text
  const handleCopyAbnahmeText = async (offer) => {
    try {
      await navigator.clipboard.writeText(getAbnahmeEmailBody(offer));
      setAbnahmeCopied(true);
      setTimeout(() => setAbnahmeCopied(false), 2500);
    } catch {
      alert('Kopieren fehlgeschlagen.');
    }
  };

  // Download Abnahme PDF
  const handleDownloadAbnahmePDF = (offer) => {
    generateAbnahmePDF(offer, companySettings);
  };

  // Delete Offer from history
  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;
    try {
      await api.deleteOffer(id);
      await loadOffers();
    } catch (err) {
      alert('Fehler beim Löschen: ' + err.message);
    }
  };

  // Update Status in history
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateOffer(id, { status: newStatus });
      await loadOffers();
    } catch (err) {
      alert('Fehler beim Aktualisieren: ' + err.message);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-fadeIn overflow-x-hidden min-w-0">
      {/* Top Banner Header */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 min-w-0">
        <div className="space-y-1.5 sm:space-y-2 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
            <Tag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">Preise & Angebots-Generator</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight break-words">
            Paketpreise, Angebote & Kostenvoranschläge
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
            Erstellen Sie flexible Paketangebote oder Kostenvoranschläge mit anpassbaren Preisen, 
            wählen Sie Kunden aus und generieren Sie druckfertige PDFs auf Knopfdruck.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="w-full md:w-auto grid grid-cols-3 sm:flex bg-slate-800/80 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-700 gap-1 min-w-0 shrink-0">
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'creator'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Angebote</span>
          </button>
          <button
            onClick={() => setActiveTab('abnahme')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'abnahme'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
            <span className="truncate">Abnahme</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Gespeichert ({offersList.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'creator' ? (
        /* ================= CREATOR / CALCULATOR TAB ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0">
          {/* Left Column: Form & Package Selector (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 min-w-0">
            {/* 1. Header Settings Card: Type & Customer */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-5 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                    1
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">Dokument-Typ & Kunde wählen</h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate">Wählen Sie zwischen Festpreis-Angebot und unverbindlichem Kostenvoranschlag</p>
                  </div>
                </div>
              </div>

              {/* Mode Toggle: Angebot vs Kostenvoranschlag */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Art des Dokuments (Modus):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setDocType('angebot')}
                    className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      docType === 'angebot'
                        ? 'border-sky-500 bg-sky-50/70 text-sky-950 ring-2 ring-sky-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs sm:text-sm">Angebot</span>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
                        Festpreis
                      </span>
                    </div>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500 leading-snug">
                      Verbindliche Preise (ohne "ab"), für konkrete Kundenbeauftragungen.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDocType('kostenvoranschlag')}
                    className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      docType === 'kostenvoranschlag'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs sm:text-sm">Kostenvoranschlag</span>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                        Mit "ab" Preisen
                      </span>
                    </div>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500 leading-snug">
                      Unverbindliche Kostenschätzung (mit "ab" Preisen) für Erstkontakte.
                    </p>
                  </button>
                </div>
              </div>

              {/* Customer Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Kunde / Interessent</label>
                    {onOpenCustomerModal && (
                      <button 
                        type="button" 
                        onClick={onOpenCustomerModal}
                        className="text-[11px] text-sky-600 hover:text-sky-700 font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Neuer Kunde
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="">-- Kunde auswählen --</option>
                    {safeCustomers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} {c.contactPerson ? `(${c.contactPerson})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Gültigkeitsdauer</label>
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value={14}>14 Tage (bis {formatDate(new Date(Date.now() + 14 * 86400000))})</option>
                    <option value={30}>30 Tage (Standard - bis {formatDate(new Date(Date.now() + 30 * 86400000))})</option>
                    <option value={60}>60 Tage (bis {formatDate(new Date(Date.now() + 60 * 86400000))})</option>
                  </select>
                </div>
              </div>

              {/* Customer Details Pill Box */}
              {selectedCustomer && (
                <div className="bg-sky-50/60 border border-sky-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs min-w-0">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-0.5">Empfänger-Daten:</span>
                    <span className="font-black text-slate-900 break-words">{selectedCustomer.companyName}</span>
                    {selectedCustomer.contactPerson && <span className="text-slate-600 ml-1.5">• z.Hd. {selectedCustomer.contactPerson}</span>}
                    <div className="text-[11px] text-slate-500 mt-0.5 break-words">{selectedCustomer.address || 'Keine Adresse hinterlegt'}</div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-mono text-sky-900 bg-white px-2.5 py-1 rounded-lg border border-sky-200 font-bold block sm:inline-block text-[11px] break-all">
                      {selectedCustomer.email || 'Keine E-Mail'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Package Customizer Cards */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6 min-w-0">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 sm:pb-4 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                  2
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">Pakete & Preise zusammenstellen</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">Alle Preise sind frei anpassbar und werden in Echtzeit kalkuliert</p>
                </div>
              </div>

              {/* PAKET A */}
              <div className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all min-w-0 ${
                pkgAIncluded ? 'border-sky-300 bg-sky-50/30 shadow-xs' : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-3 sm:gap-4 min-w-0">
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      id="pkgA"
                      checked={pkgAIncluded}
                      onChange={(e) => setPkgAIncluded(e.target.checked)}
                      className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                        <label htmlFor="pkgA" className="font-black text-slate-900 text-xs sm:text-sm cursor-pointer flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span>Paket A: Komplett-Entwicklung & WebApp</span>
                          <span className="text-[9px] sm:text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {pkgASelectedModuleIds.length} Modul(e) gewählt
                          </span>
                        </label>

                        {/* Price Input */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                          <span className="text-xs font-semibold text-slate-600">Gesamtpreis:</span>
                          <span className="text-xs text-slate-500">{pricePrefix}</span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            disabled={!pkgAIncluded}
                            value={pkgAPrice}
                            onChange={(e) => setPkgAPrice(Number(e.target.value))}
                            className="w-24 sm:w-28 px-2.5 sm:px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-right text-xs sm:text-sm font-black text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          />
                          <span className="text-xs font-bold text-slate-700">€</span>
                        </div>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                        Maßgeschneiderte WebApp, Benutzer- & Rollenverwaltung, Cloud-Datenbank, SSL-Verschlüsselung & 30 Tage kostenlose Garantie.
                      </p>

                      {pkgAIncluded && (
                        <div className="mt-3 sm:mt-4 pt-3 border-t border-sky-100/80 space-y-2 min-w-0">
                          <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                            Vereinbarter Modulumfang ({pkgASelectedModuleIds.length} von {PAKET_A_MODULES.length} Modulen aktiv):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/80 p-2.5 sm:p-3 rounded-xl border border-sky-100 min-w-0">
                            {PAKET_A_MODULES.map((mod) => {
                              const isChecked = pkgASelectedModuleIds.includes(mod.id);
                              return (
                                <label
                                  key={mod.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    togglePkgAModule(mod.id);
                                  }}
                                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition cursor-pointer select-none min-w-0 ${
                                    isChecked
                                      ? 'bg-sky-50 text-sky-950 font-bold border border-sky-200/80 shadow-2xs'
                                      : 'text-slate-500 hover:bg-slate-50 border border-transparent opacity-60'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer shrink-0"
                                  />
                                  <span className="leading-tight break-words min-w-0 text-[11.5px]">{mod.title}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PAKET B */}
              <div className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all min-w-0 ${
                pkgBIncluded ? 'border-indigo-300 bg-indigo-50/30 shadow-xs' : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-3 sm:gap-4 min-w-0">
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      id="pkgB"
                      checked={pkgBIncluded}
                      onChange={(e) => setPkgBIncluded(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor="pkgB" className="font-black text-slate-900 text-xs sm:text-sm cursor-pointer flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span>Paket B: Setup + 7/24 Abo-Betreuung</span>
                        <span className="text-[9px] sm:text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full whitespace-nowrap">Abo</span>
                      </label>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                        Einmalige schlüsselfertige Implementierung plus flexibles 7/24-Abo für Notfall-Support, DSGVO-Updates, Datensicherungs-Tools & laufende Weiterentwicklung.
                      </p>

                      {pkgBIncluded && (
                        <div className="mt-3 sm:mt-4 pt-3 border-t border-indigo-100/80 space-y-3 min-w-0">
                          {/* Setup Price Input */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-slate-700">Einmalige Einrichtung (Setup):</span>
                            <div className="flex items-center gap-1 self-start sm:self-auto">
                              <span className="text-slate-500">{pricePrefix}</span>
                              <input
                                type="number"
                                min="0"
                                step="10"
                                value={pkgBSetupPrice}
                                onChange={(e) => setPkgBSetupPrice(Number(e.target.value))}
                                className="w-24 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-right font-bold text-slate-900"
                              />
                              <span className="text-slate-700">€</span>
                            </div>
                          </div>

                          {/* Interval Selector Buttons */}
                          <div>
                            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                              Laufendes Wartungsintervall:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setPkgBInterval('monthly')}
                                className={`p-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                                  pkgBInterval === 'monthly'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div>Monatlich</div>
                                <div className="text-[10px] font-normal opacity-90">{pricePrefix}{pkgBMonthlyPrice} €/M</div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setPkgBInterval('quarterly')}
                                className={`p-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                                  pkgBInterval === 'quarterly'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div>Vierteljährlich</div>
                                <div className="text-[10px] font-normal opacity-90">{pricePrefix}{pkgBQuarterlyPrice} €/Q</div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setPkgBInterval('yearly')}
                                className={`p-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                                  pkgBInterval === 'yearly'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div>Jährlich</div>
                                <div className="text-[10px] font-normal opacity-90">{pricePrefix}{pkgBYearlyPrice} €/J</div>
                              </button>
                            </div>
                          </div>

                          {/* Editable Interval Price Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Preis Monat (€):</span>
                              <input
                                type="number"
                                value={pkgBMonthlyPrice}
                                onChange={(e) => setPkgBMonthlyPrice(Number(e.target.value))}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-right font-semibold"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Preis Quartal (€):</span>
                              <input
                                type="number"
                                value={pkgBQuarterlyPrice}
                                onChange={(e) => setPkgBQuarterlyPrice(Number(e.target.value))}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-right font-semibold"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Preis Jahr (€):</span>
                              <input
                                type="number"
                                value={pkgBYearlyPrice}
                                onChange={(e) => setPkgBYearlyPrice(Number(e.target.value))}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-right font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PAKET C: MODUL-SYSTEM */}
              <div className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all min-w-0 ${
                pkgCIncluded ? 'border-emerald-300 bg-emerald-50/30 shadow-xs' : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-3 sm:gap-4 min-w-0">
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      id="pkgC"
                      checked={pkgCIncluded}
                      onChange={(e) => setPkgCIncluded(e.target.checked)}
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                        <label htmlFor="pkgC" className="font-black text-slate-900 text-xs sm:text-sm cursor-pointer flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span>Paket C: Modulare Erweiterung</span>
                          <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {selectedModulesCount} Modul(e) gewählt
                          </span>
                        </label>

                        {/* Price per Module Input */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                          <span className="text-xs font-semibold text-slate-600">Preis/Modul:</span>
                          <span className="text-xs text-slate-500">{pricePrefix}</span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            disabled={!pkgCIncluded}
                            value={pkgCUnitPrice}
                            onChange={(e) => setPkgCUnitPrice(Number(e.target.value))}
                            className="w-20 sm:w-24 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-right font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
                          />
                          <span className="text-xs font-bold text-slate-700">€</span>
                        </div>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                        Wählen Sie die gewünschten Funktionsmodule per Checkbox aus. Im PDF und Angebot werden <strong>nur die ausgewählten Module</strong> aufgeführt.
                      </p>

                      {pkgCIncluded && (
                        <div className="mt-3 sm:mt-4 pt-3 border-t border-emerald-100/80 space-y-3 min-w-0">
                          {/* Predefined Core Modules List */}
                          <div className="space-y-2 min-w-0">
                            {PREDEFINED_MODULES.map((mod) => {
                              const isChecked = selectedModuleIds.includes(mod.id);
                              return (
                                <div
                                  key={mod.id}
                                  onClick={() => toggleModuleSelection(mod.id)}
                                  className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 sm:gap-3 min-w-0 ${
                                    isChecked
                                      ? 'bg-white border-emerald-400 shadow-2xs ring-1 ring-emerald-400/30'
                                      : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                    <div className="mt-0.5 shrink-0">
                                      {isChecked ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className={`text-xs font-bold block break-words ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {mod.title}
                                      </span>
                                      <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug break-words">
                                        {mod.desc}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className={`text-xs font-black ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`}>
                                      {pricePrefix}{formatCurrency(pkgCUnitPrice)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Custom Added Modules */}
                            {customModules.map((cMod) => {
                              const isChecked = selectedModuleIds.includes(cMod.id);
                              return (
                                <div
                                  key={cMod.id}
                                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 sm:gap-3 min-w-0 ${
                                    isChecked
                                      ? 'bg-white border-emerald-400 shadow-2xs ring-1 ring-emerald-400/30'
                                      : 'bg-slate-50/60 border-slate-200'
                                  }`}
                                >
                                  <div 
                                    onClick={() => toggleModuleSelection(cMod.id)}
                                    className="flex items-start gap-2.5 flex-1 cursor-pointer min-w-0"
                                  >
                                    <div className="mt-0.5 shrink-0">
                                      {isChecked ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className={`text-xs font-bold block break-words ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {cMod.title}
                                      </span>
                                      <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5">Individuell hinzugefügt</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-black ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`}>
                                      {pricePrefix}{formatCurrency(pkgCUnitPrice)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCustomModule(cMod.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Custom Module Input */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 min-w-0">
                            <input
                              type="text"
                              placeholder="+ Weiteres Modul hinzufügen..."
                              value={newCustomModuleName}
                              onChange={(e) => setNewCustomModuleName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomModule()}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none min-w-0"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomModule}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" /> Hinzufügen
                            </button>
                          </div>

                          {/* Live Multiplier Result Box */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs min-w-0">
                            <div className="text-emerald-900 min-w-0">
                              <span className="font-bold">Ausgewählt: </span>
                              <span className="font-black text-emerald-800">{selectedModulesCount} Modul(e)</span>
                              <span className="text-slate-500 ml-1.5 block sm:inline">({selectedModulesCount} × {pricePrefix}{formatCurrency(pkgCUnitPrice)})</span>
                            </div>
                            <div className="text-emerald-700 font-black text-sm sm:text-right shrink-0">
                              Gesamt Paket C = {pricePrefix}{formatCurrency(pkgCTotal)}
                            </div>
                          </div>

                          {/* Scope Legal Disclaimer Notice */}
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 text-xs min-w-0">
                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="leading-relaxed text-[11px] sm:text-[11.5px] min-w-0 break-words">
                              <strong>Hinweis zum Leistungsumfang:</strong> Im generierten PDF und Angebot werden ausschließlich die oben angehakten Module aufgeführt. Es wird automatisch vermerkt, dass weitere Funktionsbereiche nicht im Leistungsumfang enthalten sind.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CUSTOM EXTRA ITEMS */}
              <div className="pt-2 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Individuelle Zusatzpositionen ({customItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Position hinzufügen
                  </button>
                </div>

                {customItems.length > 0 && (
                  <div className="space-y-2 min-w-0">
                    {customItems.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs min-w-0">
                        <input
                          type="text"
                          placeholder="Beschreibung der Zusatzleistung..."
                          value={item.description}
                          onChange={(e) => handleUpdateCustomItem(item.id, 'description', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium min-w-0"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="Menge"
                            value={item.quantity}
                            onChange={(e) => handleUpdateCustomItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                          />
                          <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                            <input
                              type="number"
                              min="0"
                              step="10"
                              placeholder="Preis €"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateCustomItem(item.id, 'unitPrice', Number(e.target.value))}
                              className="w-full sm:w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-right font-bold"
                            />
                            <span className="text-slate-500">€</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Document Preview & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 min-w-0">
            {/* Live Pricing Summary Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl border border-slate-700/60 space-y-4 sm:space-y-5 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 min-w-0">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-sky-400 truncate">
                  Kalkulation & Gesamtsumme
                </span>
                <span className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 rounded-full uppercase shrink-0 ${
                  isKV ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}>
                  {isKV ? 'Kostenvoranschlag' : 'Verbindl. Angebot'}
                </span>
              </div>

              <div className="space-y-2.5 sm:space-y-3 text-xs min-w-0">
                <div className="flex items-center justify-between text-slate-300 gap-2">
                  <span className="truncate">Einmalige Entwicklung & Setup:</span>
                  <span className="font-bold text-white text-sm shrink-0">
                    {pricePrefix}{formatCurrency(totalOneTime)}
                  </span>
                </div>

                {currentPkgBRecurringPrice > 0 && (
                  <div className="flex items-center justify-between text-slate-300 gap-2">
                    <span className="truncate">Laufende Betreuung ({pkgBInterval === 'yearly' ? 'Jährlich' : pkgBInterval === 'quarterly' ? 'Vierteljährlich' : 'Monatlich'}):</span>
                    <span className="font-bold text-sky-300 text-sm shrink-0">
                      {pricePrefix}{formatCurrency(currentPkgBRecurringPrice)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Gesamtsumme (Erstabwicklung):</span>
                    <span className="text-[10px] text-slate-500 italic">Gemäß § 19 UStG ohne MwSt.</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xl sm:text-2xl font-black text-sky-400 block">
                      {pricePrefix}{formatCurrency(totalOneTime + (pkgBIncluded ? currentPkgBRecurringPrice : 0))}
                    </span>
                    {currentPkgBRecurringPrice > 0 && (
                      <span className="text-[10.5px] sm:text-[11px] text-slate-400 block font-semibold leading-tight mt-0.5">
                        (Setup {pricePrefix}{formatCurrency(totalOneTime)} + 1. {pkgBInterval === 'yearly' ? 'Jahr' : pkgBInterval === 'quarterly' ? 'Quartal' : 'Monat'} Abo {pricePrefix}{formatCurrency(currentPkgBRecurringPrice)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-2.5 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="w-full py-2.5 sm:py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="truncate">PDF herunterladen ({isKV ? 'Kostenvoranschlag' : 'Angebot'})</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenOutlook}
                    className="py-2 sm:py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    <span>In Outlook öffnen</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="py-2 sm:py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                    <span>{copied ? 'Kopiert!' : 'Text kopieren'}</span>
                  </button>
                </div>

                {/* Abnahmeprotokoll Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('abnahme')}
                  className="w-full py-2.5 bg-emerald-800/90 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-600/40 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Zum Abnahmeprotokoll Studio</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveOffer}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    saveSuccess 
                      ? 'bg-emerald-600 text-white font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> : <FileCheck className="w-4 h-4 shrink-0" />}
                  <span>{saveSuccess ? 'Erfolgreich gespeichert!' : 'In Verlauf speichern'}</span>
                </button>
              </div>
            </div>

            {/* Document Visual Card Preview */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3 sm:space-y-4 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 min-w-0">
                <span className="text-xs font-black text-slate-900 truncate">Vorschau Dokument-Kopf</span>
                <span className="text-xs font-mono text-sky-600 font-bold shrink-0">{offerNumber}</span>
              </div>

              {/* Visual TeamTrack Corporate Header Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl shadow-xs border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-black tracking-tight leading-none">
                      <span className="text-[#000a1f]">Team</span><span className="text-[#0082cb]">Track</span>
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.14em] text-[#64748b] mt-1 leading-none truncate">
                      SOFTWAREENTWICKLUNG
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 border-t border-slate-200 pt-2 space-y-1 min-w-0">
                  <div className="font-bold text-slate-900 break-words">{isKV ? 'Unverbindlicher Kostenvoranschlag' : 'Verbindliches Angebot'}</div>
                  <div className="break-words">Empfänger: <span className="font-semibold text-slate-800">{selectedCustomer?.companyName || 'Interessent'}</span></div>
                  <div>Gültig bis: <span className="font-semibold text-slate-800">{formatDate(validUntilDate)}</span></div>

                  {pkgAIncluded && (
                    <div className="mt-2 pt-2 border-t border-slate-200 min-w-0">
                      <span className="font-bold text-sky-800 block mb-1">
                        Paket A Modulumfang ({pkgASelectedModuleIds.length}):
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-slate-700 min-w-0">
                        {PAKET_A_MODULES.filter(m => pkgASelectedModuleIds.includes(m.id)).map(m => (
                          <li key={m.id} className="truncate">{m.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pkgCIncluded && (
                    <div className="mt-2 pt-2 border-t border-slate-200 min-w-0">
                      <span className="font-bold text-emerald-800 block mb-1">
                        Paket C Module ({selectedModulesCount}):
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-slate-700 min-w-0">
                        {activeSelectedModules.map(m => (
                          <li key={m.id} className="truncate">{m.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 min-w-0 break-words">
                    <span className="font-bold text-amber-900 not-italic block mb-0.5">Leistungsumfang im PDF:</span>
                    {pkgBIncluded && !pkgAIncluded && !pkgCIncluded
                      ? 'Schlüsselfertige Implementierung inkl. 7/24-Abo-Betreuung, Notfall-Support, DSGVO-Updates, Backups & Feature-Erweiterungen.'
                      : 'Es werden ausschließlich die explizit ausgewählten Leistungspositionen und Module umgesetzt.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'abnahme' ? (
        /* ================= DEDICATED ABNAHMEPROTOKOLL STUDIO TAB ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 animate-fadeIn min-w-0">
          {/* Left Column: Handover Scope & Legal Clauses (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 min-w-0">
            {/* Customer & Document Info Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-5 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">Abnahmeprotokoll & Garantie</h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate">Rechtssichere Softwareübergabe für alle Pakete</p>
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2 sm:px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                  ABN-{new Date().getFullYear()}
                </span>
              </div>

              {/* Customer Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Auftraggeber (Kunde)</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Kunde auswählen --</option>
                    {safeCustomers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} {c.contactPerson ? `(${c.contactPerson})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Übergabe- / Abnahmedatum</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                  </input>
                </div>
              </div>

              {selectedCustomer && (
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs min-w-0">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">Empfänger:</span>
                    <span className="font-black text-slate-900 break-words">{selectedCustomer.companyName}</span>
                    {selectedCustomer.contactPerson && <span className="text-slate-600 ml-1.5">• z.Hd. {selectedCustomer.contactPerson}</span>}
                  </div>
                  <span className="font-mono text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-[11px] shrink-0 self-start sm:self-auto break-all">
                    {selectedCustomer.email || 'Keine E-Mail'}
                  </span>
                </div>
              )}
            </div>

            {/* Package Selection for Abnahme */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-5 min-w-0">
              <div className="border-b border-slate-100 pb-3 min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">Zu übergebende Pakete & Module</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">Wählen Sie an, welche Leistungspakete abgenommen werden</p>
              </div>

              {/* Paket A Abnahme */}
              <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all min-w-0 ${
                pkgAIncluded ? 'border-sky-300 bg-sky-50/40' : 'border-slate-200 bg-slate-50/50 opacity-60'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                  <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      checked={pkgAIncluded}
                      onChange={(e) => setPkgAIncluded(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 shrink-0"
                    />
                    <span className="font-black text-xs sm:text-sm text-slate-900 break-words">Paket A: Komplett-Entwicklung & WebApp</span>
                  </label>
                  <span className="text-[9px] sm:text-[10px] font-bold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full whitespace-nowrap self-start sm:self-auto">
                    {pkgASelectedModuleIds.length} Modul(e)
                  </span>
                </div>

                {pkgAIncluded && (
                  <div className="mt-3 pt-3 border-t border-sky-100 space-y-2 min-w-0">
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-700 block">Übergebene Modulbestandteile:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 sm:p-3 rounded-xl border border-sky-100 min-w-0">
                      {PAKET_A_MODULES.map((mod) => {
                        const isChecked = pkgASelectedModuleIds.includes(mod.id);
                        return (
                          <label
                            key={mod.id}
                            onClick={(e) => {
                              e.preventDefault();
                              togglePkgAModule(mod.id);
                            }}
                            className={`flex items-center gap-2 p-1.5 rounded-lg text-xs transition cursor-pointer select-none min-w-0 ${
                              isChecked ? 'bg-sky-50 text-sky-950 font-bold' : 'text-slate-400 opacity-60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 text-sky-600 rounded shrink-0"
                            />
                            <span className="leading-tight text-[11px] sm:text-[11.5px] break-words min-w-0">{mod.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Paket B Abnahme */}
              <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all min-w-0 ${
                pkgBIncluded ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/50 opacity-60'
              }`}>
                <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                  <input
                    type="checkbox"
                    checked={pkgBIncluded}
                    onChange={(e) => setPkgBIncluded(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0">
                      <span className="font-black text-xs sm:text-sm text-slate-900 break-words">Paket B: Setup + 7/24 Abo-Betreuung</span>
                      <span className="text-[9px] sm:text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full whitespace-nowrap self-start sm:self-auto">
                        {pkgBInterval === 'yearly' ? 'Jährlich' : pkgBInterval === 'quarterly' ? 'Vierteljährlich' : 'Monatlich'}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">Initial-Setup übergeben, Admin-Zugänge freigeschaltet und in laufenden Support überführt.</p>
                  </div>
                </label>
              </div>

              {/* Paket C Abnahme */}
              <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all min-w-0 ${
                pkgCIncluded ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/50 opacity-60'
              }`}>
                <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                  <input
                    type="checkbox"
                    checked={pkgCIncluded}
                    onChange={(e) => setPkgCIncluded(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0">
                      <span className="font-black text-xs sm:text-sm text-slate-900 break-words">Paket C: Modulare Funktionserweiterung</span>
                      <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full whitespace-nowrap self-start sm:self-auto">
                        {selectedModulesCount} Zusatzmodul(e)
                      </span>
                    </div>
                  </div>
                </label>

                {pkgCIncluded && (
                  <div className="mt-3 pt-3 border-t border-emerald-100 space-y-1.5 text-xs min-w-0">
                    {activeSelectedModules.map(m => (
                      <div key={m.id} className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-lg border border-emerald-100 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-[11.5px] break-words min-w-0">{m.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Legal Protection Card */}
            <div className="bg-emerald-950 text-emerald-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-800 shadow-xl space-y-3 sm:space-y-4 min-w-0">
              <div className="flex items-center gap-2.5 text-white min-w-0">
                <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-black tracking-tight truncate">Rechtliche Schutzklauseln im Protokoll</h3>
              </div>

              <div className="space-y-2.5 sm:space-y-3 text-[11px] sm:text-xs leading-relaxed min-w-0">
                <div className="bg-emerald-900/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-700/60 space-y-1">
                  <strong className="text-white block font-bold">1. Förmliche Abnahmeerklärung:</strong>
                  <span>Der Auftraggeber bestätigt die vollständige, betriebsbereite Übergabe und den erfolgreichen Abschluss der Funktionsprüfung ohne wesentliche Mängel.</span>
                </div>

                {pkgAIncluded && (
                  <div className="bg-emerald-900/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-700/60 space-y-1">
                    <strong className="text-white block font-bold">2. Beginn der 30-Tage-Garantie & Ausschluss unentgeltlicher Wartung:</strong>
                    <span>30 Tage kostenlose Fehlerbehebung reproduzierbarer Bugs ab heute. Nach Ablauf der 30 Tage erlischt jeglicher Anspruch auf kostenfreie Serviceleistungen (Zukünftige Arbeiten: 85,- € / Std. oder Wartungsvertrag).</span>
                  </div>
                )}

                <div className="bg-emerald-900/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-700/60 space-y-1">
                  <strong className="text-white block font-bold">3. Eigenverantwortung Datensicherung (Backups):</strong>
                  <span>Ausdrücklicher Haftungsausschluss bei Datenverlust; die regelmäßige Datensicherung erfolgt eigenverantwortlich durch den Kunden über die integrierte 1-Klick Backup-Funktion im System.</span>
                </div>

                <div className="bg-emerald-900/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-700/60 space-y-1">
                  <strong className="text-white block font-bold">4. Ausschluss nicht vereinbarter Sonderleistungen:</strong>
                  <span>Funktionen, die nicht explizit in diesem Protokoll aufgeführt sind, sind nicht Bestandteil dieser Abnahme und bedürfen gesonderter Beauftragung.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & E-Mail Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 min-w-0">
            {/* Quick Action Panel */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl border border-slate-700/60 space-y-4 sm:space-y-5 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 min-w-0">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 truncate">
                  Abnahmeprotokoll Aktionen
                </span>
                <span className="text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 rounded-full uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Rechtsverbindlich
                </span>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                <button
                  type="button"
                  onClick={() => handleDownloadAbnahmePDF(getCurrentOfferPayload())}
                  className="w-full py-2.5 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl sm:rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="truncate">Abnahmeprotokoll als PDF herunterladen</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAbnahmeOutlook(getCurrentOfferPayload())}
                    className="py-2 sm:py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    <span>In Outlook öffnen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyAbnahmeText(getCurrentOfferPayload())}
                    className="py-2 sm:py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {abnahmeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                    <span>{abnahmeCopied ? 'Kopiert!' : 'Text kopieren'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live E-Mail Text Box */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-2.5 sm:space-y-3 text-xs min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 min-w-0 gap-2">
                <span className="text-xs font-black text-slate-900 truncate">Vorschau E-Mail an den Kunden</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">{selectedCustomer?.email || 'kontakt@kunde.de'}</span>
              </div>

              <pre className="text-[10.5px] sm:text-[11px] font-mono text-slate-700 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed break-words break-all max-w-full">
                {getAbnahmeEmailBody(getCurrentOfferPayload())}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* ================= HISTORY / SAVED OFFERS TAB ================= */
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4 min-w-0">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">Gespeicherte Angebote & Kostenvoranschläge</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">Übersicht aller erstellten Offerten, Status-Tracking & PDF-Export</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">Alle Arten</option>
                <option value="angebot">Nur Angebote</option>
                <option value="kostenvoranschlag">Nur Kostenvoranschläge</option>
              </select>
            </div>
          </div>

          {offersList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">Noch keine Angebote oder Kostenvoranschläge gespeichert.</p>
              <button
                type="button"
                onClick={() => setActiveTab('creator')}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 cursor-pointer"
              >
                Jetzt erstes Angebot erstellen
              </button>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="pb-3">Nr. / Typ</th>
                    <th className="pb-3">Kunde</th>
                    <th className="pb-3">Datum / Gültig bis</th>
                    <th className="pb-3 text-right">Summe Einmalig</th>
                    <th className="pb-3 text-right">Laufend</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {offersList
                    .filter(o => historyFilter === 'all' || o.type === historyFilter)
                    .map(offer => {
                      const isOfferKV = offer.type === 'kostenvoranschlag';
                      const prefix = isOfferKV ? 'ab ' : '';
                      return (
                        <tr key={offer.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 font-mono font-bold text-slate-900">
                            <div>{offer.offerNumber}</div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              isOfferKV ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {isOfferKV ? 'Kostenvoranschlag' : 'Angebot'}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="font-bold text-slate-900">{offer.customerName}</span>
                            {offer.customerContact && (
                              <span className="text-slate-500 block text-[11px]">z.Hd. {offer.customerContact}</span>
                            )}
                          </td>
                          <td className="py-3.5 text-slate-600">
                            <div>{formatDate(offer.date)}</div>
                            <div className="text-[10px] text-slate-400">bis {formatDate(offer.validUntilDate)}</div>
                          </td>
                          <td className="py-3.5 text-right font-black text-slate-900">
                            {prefix}{formatCurrency(offer.totalOneTime || offer.totalAmount || 0)}
                          </td>
                          <td className="py-3.5 text-right font-semibold text-sky-700">
                            {offer.totalRecurring > 0 ? (
                              <div>{prefix}{formatCurrency(offer.totalRecurring)}</div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3.5 text-center">
                            <select
                              value={offer.status || 'draft'}
                              onChange={(e) => handleUpdateStatus(offer.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                offer.status === 'accepted' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                  : offer.status === 'sent' 
                                  ? 'bg-sky-50 text-sky-700 border-sky-300'
                                  : offer.status === 'declined'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="draft">Entwurf</option>
                              <option value="sent">Versendet</option>
                              <option value="accepted">Angenommen</option>
                              <option value="declined">Abgelehnt</option>
                            </select>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="Abnahmeprotokoll erstellen / senden"
                                onClick={() => setAbnahmeModalOffer(offer)}
                                className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1 font-bold text-xs"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Abnahme</span>
                              </button>
                              <button
                                type="button"
                                title="PDF herunterladen"
                                onClick={() => generateOfferPDF(offer, companySettings)}
                                className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Löschen"
                                onClick={() => handleDeleteOffer(offer.id)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= ABNAHMEPROTOKOLL MODAL ================= */}
      {abnahmeModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] min-w-0">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4.5 bg-slate-900 text-white flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight truncate">Software-Abnahmeprotokoll & Erklärung</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Rechtssichere Abnahme & 30-Tage-Garantieerklärung</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAbnahmeModalOffer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs min-w-0">
              {/* Meta Pill Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-slate-700 min-w-0">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Auftraggeber:</span>
                  <span className="font-black text-slate-900 text-xs sm:text-sm block break-words">{abnahmeModalOffer.customerName || 'Kunde'}</span>
                  {abnahmeModalOffer.customerContact && (
                    <span className="text-[11px] text-slate-500 break-words">z.Hd. {abnahmeModalOffer.customerContact}</span>
                  )}
                </div>
                <div className="text-left sm:text-right min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Referenz-Angebot:</span>
                  <span className="font-mono font-bold text-sky-600 block truncate">{abnahmeModalOffer.offerNumber || 'Entwurf'}</span>
                  <span className="text-[11px] text-slate-500">Datum: {formatDate(new Date())}</span>
                </div>
              </div>

              {/* Legal Protection Summary Card */}
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-2.5 min-w-0">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs min-w-0">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Enthaltene Schutzklauseln:</span>
                </div>

                <div className="space-y-2 text-[11px] sm:text-[11.5px] text-slate-700 leading-relaxed min-w-0">
                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-100 space-y-1">
                    <strong className="text-slate-900 block font-bold">1. Förmliche Abnahmeerklärung:</strong>
                    Bestätigt die vollständige, betriebsbereite Übergabe und den erfolgreichen Abschluss der Funktionsprüfung ohne wesentliche Mängel.
                  </div>

                  {abnahmeModalOffer.packageA && abnahmeModalOffer.packageA.included && (
                    <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-100 space-y-1">
                      <strong className="text-slate-900 block font-bold">2. Beginn der 30-Tage-Garantie & Ausschluss:</strong>
                      30 Tage kostenlose Behebung reproduzierbarer Fehler ab heute. Nach 30 Tagen erlischt jeglicher Anspruch auf kostenfreie Services (Zukünftige Arbeiten: 85 €/Std. oder Wartungsvertrag).
                    </div>
                  )}

                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-100 space-y-1">
                    <strong className="text-slate-900 block font-bold">3. Eigenverantwortung Datensicherung (Backups):</strong>
                    Ausdrücklicher Ausschluss von Haftungsansprüchen bei Datenverlust; regelmäßige Datensicherung erfolgt eigenverantwortlich durch den Kunden über die 1-Klick Backup-Funktion.
                  </div>
                </div>
              </div>

              {/* E-Mail Preview Accordion */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-1.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                  Vorschau E-Mail-Text für den Kunden:
                </span>
                <pre className="text-[10.5px] sm:text-[11px] font-mono text-slate-700 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 max-h-40 overflow-y-auto whitespace-pre-wrap break-words break-all max-w-full">
                  {getAbnahmeEmailBody(abnahmeModalOffer)}
                </pre>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setAbnahmeModalOffer(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer text-center"
              >
                Schließen
              </button>

              <div className="w-full sm:w-auto grid grid-cols-1 sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyAbnahmeText(abnahmeModalOffer)}
                  className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {abnahmeCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{abnahmeCopied ? 'Kopiert!' : 'Text kopieren'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAbnahmeOutlook(abnahmeModalOffer)}
                  className="w-full sm:w-auto px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5 text-sky-300" />
                  <span>In Outlook öffnen</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadAbnahmePDF(abnahmeModalOffer)}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF herunterladen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export class OffersErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PricingOffersPage ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-4xl mx-auto p-8 bg-rose-50 border border-rose-200 rounded-3xl text-rose-950 my-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 text-rose-700">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold text-lg">⚠️</div>
            <h2 className="text-xl font-black">Preise & Angebote konnte nicht geladen werden</h2>
          </div>
          <p className="text-sm text-slate-700">
            Beim Rendern der Seite ist ein Fehler aufgetreten: <code className="bg-rose-100 text-rose-800 px-2 py-1 rounded font-mono text-xs font-bold">{this.state.error?.message || 'Unbekannter Fehler'}</code>
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/30 cursor-pointer"
          >
            Seite neu laden
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PricingOffersPage(props) {
  return (
    <OffersErrorBoundary>
      <PricingOffersContent {...props} />
    </OffersErrorBoundary>
  );
}
