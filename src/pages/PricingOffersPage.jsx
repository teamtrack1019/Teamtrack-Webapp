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
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateOfferPDF } from '../utils/pdfGenerator';
import { api } from '../api';

export default function PricingOffersPage({ 
  customers = [], 
  companySettings = {}, 
  onConvertToInvoice,
  onOpenCustomerModal 
}) {
  const [activeTab, setActiveTab] = useState('creator'); // 'creator' | 'history'
  const [offersList, setOffersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [docType, setDocType] = useState('angebot'); // 'angebot' | 'kostenvoranschlag'
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [offerNumber, setOfferNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validDays, setValidDays] = useState(30);
  
  // Package A: Komplett-Entwicklung
  const [pkgAIncluded, setPkgAIncluded] = useState(true);
  const [pkgAPrice, setPkgAPrice] = useState(2400);

  // Package B: Setup + Abo
  const [pkgBIncluded, setPkgBIncluded] = useState(true);
  const [pkgBSetupPrice, setPkgBSetupPrice] = useState(149);
  const [pkgBInterval, setPkgBInterval] = useState('monthly'); // 'monthly' | 'quarterly' | 'yearly'
  const [pkgBMonthlyPrice, setPkgBMonthlyPrice] = useState(149);
  const [pkgBQuarterlyPrice, setPkgBQuarterlyPrice] = useState(420);
  const [pkgBYearlyPrice, setPkgBYearlyPrice] = useState(1590);

  // Package C: Modul-Erweiterung
  const [pkgCIncluded, setPkgCIncluded] = useState(false);
  const [pkgCUnitPrice, setPkgCUnitPrice] = useState(890);
  const [pkgCQuantity, setPkgCQuantity] = useState(1);
  const [pkgCModuleName, setPkgCModuleName] = useState('Digitales Zeiterfassungs- & Fahrtenbuch-Modul');

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
      setOffersList(res || []);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Pre-select first customer if available and none selected
  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Generate dynamic Offer Number preview
  useEffect(() => {
    const prefix = docType === 'kostenvoranschlag' ? 'KV' : 'ANG';
    const year = new Date().getFullYear();
    const count = offersList.filter(o => o.type === docType).length + 1;
    setOfferNumber(`${prefix}-${year}-${String(count).padStart(4, '0')}`);
  }, [docType, offersList]);

  // Selected Customer details
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Calculated Dates
  const validUntilDate = useMemo(() => {
    const d = new Date(date || Date.now());
    d.setDate(d.getDate() + Number(validDays || 30));
    return d.toISOString().split('T')[0];
  }, [date, validDays]);

  // Calculate Totals
  const currentPkgBRecurringPrice = useMemo(() => {
    if (!pkgBIncluded) return 0;
    if (pkgBInterval === 'yearly') return Number(pkgBYearlyPrice || 1590);
    if (pkgBInterval === 'quarterly') return Number(pkgBQuarterlyPrice || 420);
    return Number(pkgBMonthlyPrice || 149);
  }, [pkgBIncluded, pkgBInterval, pkgBMonthlyPrice, pkgBQuarterlyPrice, pkgBYearlyPrice]);

  const totalOneTime = useMemo(() => {
    let sum = 0;
    if (pkgAIncluded) sum += Number(pkgAPrice || 0);
    if (pkgBIncluded) sum += Number(pkgBSetupPrice || 0);
    if (pkgCIncluded) sum += (Number(pkgCUnitPrice || 0) * Number(pkgCQuantity || 1));
    (customItems || []).forEach(it => {
      sum += (Number(it.unitPrice || 0) * Number(it.quantity || 1));
    });
    return sum;
  }, [pkgAIncluded, pkgAPrice, pkgBIncluded, pkgBSetupPrice, pkgCIncluded, pkgCUnitPrice, pkgCQuantity, customItems]);

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
        price: Number(pkgAPrice || 2400)
      },
      packageB: {
        included: pkgBIncluded,
        setupPrice: Number(pkgBSetupPrice || 149),
        interval: pkgBInterval,
        recurringPrice: currentPkgBRecurringPrice
      },
      packageC: {
        included: pkgCIncluded,
        unitPrice: Number(pkgCUnitPrice || 890),
        quantity: Number(pkgCQuantity || 1),
        moduleName: pkgCModuleName
      },
      customItems,
      totalOneTime,
      totalRecurring: currentPkgBRecurringPrice,
      recurringInterval: pkgBInterval,
      totalAmount: totalOneTime,
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

    return `${greeting}

vielen Dank für Ihr Interesse an einer Zusammenarbeit mit TeamTrack-Software.
${isKV ? 'Wie besprochen haben wir für Sie einen unverbindlichen Kostenvoranschlag' : 'Gerne unterbreiten wir Ihnen nachfolgend unser maßgeschneidertes Angebot'} für die Digitalisierung Ihrer Betriebsabläufe zusammengestellt:

📋 ${isKV ? 'KOSTENVORANSCHLAG' : 'ANGEBOT'} ${offerNumber}
${pkgAIncluded ? `• Paket A (Komplett-Entwicklung & WebApp): ${pricePrefix}${formatCurrency(pkgAPrice)} (einmalig)\n` : ''}${pkgBIncluded ? `• Paket B (Setup + Wartung & Betreuung): Setup ${pricePrefix}${formatCurrency(pkgBSetupPrice)} + ${pricePrefix}${formatCurrency(currentPkgBRecurringPrice)} / ${intervalText}\n` : ''}${pkgCIncluded ? `• Paket C (Modulare Erweiterung - ${pkgCQuantity}x ${pkgCModuleName}): ${pricePrefix}${formatCurrency(pkgCUnitPrice * pkgCQuantity)}\n` : ''}
Gesamtsumme Einmalig: ${pricePrefix}${formatCurrency(totalOneTime)}
${currentPkgBRecurringPrice > 0 ? `Laufende Betreuung: ${pricePrefix}${formatCurrency(currentPkgBRecurringPrice)} (${intervalText})\n` : ''}
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

  // Open Outlook Web Compose
  const handleOpenOutlook = () => {
    const subject = `${isKV ? 'Kostenvoranschlag' : 'Angebot'} ${offerNumber} für ${selectedCustomer?.companyName || 'Ihr Unternehmen'} – TeamTrack`;
    const body = getOfferEmailBody();
    const mailto = `https://outlook.live.com/mail/0/deeplink/compose?login_hint=${encodeURIComponent('kontakt@team-track.de')}&to=${encodeURIComponent(selectedCustomer?.email || '')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  // Copy Email Text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getOfferEmailBody());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Kopieren fehlgeschlagen.');
    }
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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
            <Tag className="w-3.5 h-3.5 text-sky-400" />
            <span>Preise & Angebots-Generator</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Paketpreise, Angebote & Kostenvoranschläge
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
            Erstellen Sie flexible Paketangebote oder Kostenvoranschläge mit anpassbaren Preisen, 
            wählen Sie Kunden aus und generieren Sie druckfertige PDFs auf Knopfdruck.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'creator'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Gespeicherte ({offersList.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'creator' ? (
        /* ================= CREATOR / CALCULATOR TAB ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Package Selector (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Header Settings Card: Type & Customer */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Dokument-Typ & Kunde wählen</h2>
                    <p className="text-xs text-slate-500">Wählen Sie zwischen Festpreis-Angebot und unverbindlichem Kostenvoranschlag</p>
                  </div>
                </div>
              </div>

              {/* Mode Toggle: Angebot vs Kostenvoranschlag */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Art des Dokuments (Modus):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDocType('angebot')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      docType === 'angebot'
                        ? 'border-sky-500 bg-sky-50/70 text-sky-950 ring-2 ring-sky-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm">Angebot</span>
                      <span className="text-[10px] uppercase font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
                        Festpreis
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Verbindliche Preise (ohne "ab"), für konkrete Kundenbeauftragungen.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDocType('kostenvoranschlag')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      docType === 'kostenvoranschlag'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm">Kostenvoranschlag</span>
                      <span className="text-[10px] uppercase font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                        Mit "ab" Preisen
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Unverbindliche Kostenschätzung (mit "ab" Preisen) für Erstkontakte.
                    </p>
                  </button>
                </div>
              </div>

              {/* Customer Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="">-- Kunde auswählen --</option>
                    {customers.map(c => (
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value={14}>14 Tage (bis {formatDate(new Date(Date.now() + 14 * 86400000))})</option>
                    <option value={30}>30 Tage (Standard - bis {formatDate(new Date(Date.now() + 30 * 86400000))})</option>
                    <option value={60}>60 Tage (bis {formatDate(new Date(Date.now() + 60 * 86400000))})</option>
                  </select>
                </div>
              </div>

              {/* Customer Details Pill Box */}
              {selectedCustomer && (
                <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-0.5">Empfänger-Daten:</span>
                    <span className="font-black text-slate-900">{selectedCustomer.companyName}</span>
                    {selectedCustomer.contactPerson && <span className="text-slate-600 ml-1.5">• z.Hd. {selectedCustomer.contactPerson}</span>}
                    <div className="text-[11px] text-slate-500 mt-0.5">{selectedCustomer.address || 'Keine Adresse hinterlegt'}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sky-900 bg-white px-2.5 py-1 rounded-lg border border-sky-200 font-bold block sm:inline-block">
                      {selectedCustomer.email || 'Keine E-Mail'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Package Customizer Cards */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Pakete & Preise zusammenstellen</h2>
                  <p className="text-xs text-slate-500">Alle Preise sind frei anpassbar und werden in Echtzeit kalkuliert</p>
                </div>
              </div>

              {/* PAKET A */}
              <div className={`p-5 rounded-2xl border transition-all ${
                pkgAIncluded ? 'border-sky-300 bg-sky-50/30 shadow-xs' : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="pkgA"
                      checked={pkgAIncluded}
                      onChange={(e) => setPkgAIncluded(e.target.checked)}
                      className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="pkgA" className="font-black text-slate-900 text-sm cursor-pointer flex items-center gap-2">
                        Paket A: Komplett-Entwicklung & WebApp
                        <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">Einmalig</span>
                      </label>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Maßgeschneiderte WebApp, Benutzer- & Rollenverwaltung, digitaler Papierkram-Ersatz, Cloud-Datenbank & 12 Monate Garantie.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold text-slate-500">{pricePrefix}</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="50"
                        disabled={!pkgAIncluded}
                        value={pkgAPrice}
                        onChange={(e) => setPkgAPrice(Number(e.target.value))}
                        className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-right text-sm font-black text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">€</span>
                  </div>
                </div>
              </div>

              {/* PAKET B */}
              <div className={`p-5 rounded-2xl border transition-all ${
                pkgBIncluded ? 'border-indigo-300 bg-indigo-50/30 shadow-xs' : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      id="pkgB"
                      checked={pkgBIncluded}
                      onChange={(e) => setPkgBIncluded(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label htmlFor="pkgB" className="font-black text-slate-900 text-sm cursor-pointer flex items-center gap-2">
                        Paket B: Setup + Laufende Betreuung & Wartung
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Abo</span>
                      </label>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Einmalige Einrichtung plus laufende Cloud-Wartung, automatische Backups, SSL & technischer Support.
                      </p>

                      {pkgBIncluded && (
                        <div className="mt-4 pt-3 border-t border-indigo-100/80 space-y-3">
                          {/* Setup Price Input */}
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-slate-700">Einmalige Einrichtung (Setup):</span>
                            <div className="flex items-center gap-1">
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
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                              Laufendes Wartungsintervall:
                            </span>
                            <div className="grid grid-cols-3 gap-2">
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
                          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
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
              <div className={`p-5 rounded-2xl border transition-all ${
                pkgCIncluded ? 'border-emerald-300 bg-emerald-50/30 shadow-xs' : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      id="pkgC"
                      checked={pkgCIncluded}
                      onChange={(e) => setPkgCIncluded(e.target.checked)}
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label htmlFor="pkgC" className="font-black text-slate-900 text-sm cursor-pointer flex items-center gap-2">
                        Paket C: Modulare Erweiterung (Pro Modul)
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Multiplizierbar</span>
                      </label>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Zusätzliche maßgeschneiderte Spezialmodule (z.B. Fahrtenbuch, Zeiterfassung, Kundenportal).
                      </p>

                      {pkgCIncluded && (
                        <div className="mt-4 pt-3 border-t border-emerald-100/80 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-600 block mb-1">Modul-Bezeichnung:</span>
                              <input
                                type="text"
                                value={pkgCModuleName}
                                onChange={(e) => setPkgCModuleName(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                                placeholder="z.B. Fahrtenbuch & Zeiterfassung"
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <div>
                                <span className="text-[10px] font-bold text-slate-600 block mb-1">Menge / Stück:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setPkgCQuantity(q => Math.max(1, q - 1))}
                                    className="w-7 h-7 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-black text-slate-900 text-sm">{pkgCQuantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => setPkgCQuantity(q => q + 1)}
                                    className="w-7 h-7 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex-1">
                                <span className="text-[10px] font-bold text-slate-600 block mb-1">Preis pro Modul:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-slate-500">{pricePrefix}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="50"
                                    value={pkgCUnitPrice}
                                    onChange={(e) => setPkgCUnitPrice(Number(e.target.value))}
                                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-right font-bold text-slate-900"
                                  />
                                  <span className="text-xs text-slate-700">€</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Auto Calculation Result */}
                          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-950 font-bold">
                            <span>Kalkulation: {pkgCQuantity} × {pricePrefix}{formatCurrency(pkgCUnitPrice)}</span>
                            <span className="text-emerald-700 font-black text-sm">= {pricePrefix}{formatCurrency(pkgCQuantity * pkgCUnitPrice)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CUSTOM EXTRA ITEMS */}
              <div className="pt-2">
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
                  <div className="space-y-2">
                    {customItems.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Beschreibung der Zusatzleistung..."
                          value={item.description}
                          onChange={(e) => handleUpdateCustomItem(item.id, 'description', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Menge"
                          value={item.quantity}
                          onChange={(e) => handleUpdateCustomItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="10"
                            placeholder="Preis €"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateCustomItem(item.id, 'unitPrice', Number(e.target.value))}
                            className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-right font-bold"
                          />
                          <span className="text-slate-500">€</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Document Preview & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Pricing Summary Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl border border-slate-700/60 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Kalkulation & Gesamtsumme
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                  isKV ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}>
                  {isKV ? 'Kostenvoranschlag' : 'Verbindl. Angebot'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Einmalige Entwicklung & Setup:</span>
                  <span className="font-bold text-white text-sm">
                    {pricePrefix}{formatCurrency(totalOneTime)}
                  </span>
                </div>

                {currentPkgBRecurringPrice > 0 && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Laufende Betreuung ({pkgBInterval === 'yearly' ? 'Jährlich' : pkgBInterval === 'quarterly' ? 'Vierteljährlich' : 'Monatlich'}):</span>
                    <span className="font-bold text-sky-300 text-sm">
                      {pricePrefix}{formatCurrency(currentPkgBRecurringPrice)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Gesamt-Investition:</span>
                    <span className="text-[10px] text-slate-500 italic">Gemäß § 19 UStG ohne MwSt.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-sky-400">
                      {pricePrefix}{formatCurrency(totalOneTime)}
                    </span>
                    {currentPkgBRecurringPrice > 0 && (
                      <span className="text-[11px] text-slate-400 block font-semibold">
                        + {pricePrefix}{formatCurrency(currentPkgBRecurringPrice)} / {pkgBInterval === 'yearly' ? 'Jahr' : pkgBInterval === 'quarterly' ? 'Quartal' : 'Monat'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF herunterladen ({isKV ? 'Kostenvoranschlag' : 'Angebot'})</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenOutlook}
                    className="py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-300" />
                    <span>In Outlook öffnen</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopiert!' : 'Text kopieren'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveOffer}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    saveSuccess 
                      ? 'bg-emerald-600 text-white font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-white" /> : <FileCheck className="w-4 h-4" />}
                  <span>{saveSuccess ? 'Erfolgreich gespeichert!' : 'In Verlauf speichern'}</span>
                </button>
              </div>
            </div>

            {/* Document Visual Card Preview */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-slate-900">Vorschau Dokument-Kopf</span>
                <span className="text-xs font-mono text-sky-600 font-bold">{offerNumber}</span>
              </div>

              {/* Visual TeamTrack Corporate Header Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div>
                    <div className="text-lg font-black tracking-tight leading-none">
                      <span className="text-[#000a1f]">Team</span><span className="text-[#0082cb]">Track</span>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#64748b] mt-1 leading-none">
                      SOFTWAREENTWICKLUNG
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 border-t border-slate-200 pt-2 space-y-0.5">
                  <div className="font-bold text-slate-900">{isKV ? 'Unverbindlicher Kostenvoranschlag' : 'Verbindliches Angebot'}</div>
                  <div>Empfänger: <span className="font-semibold text-slate-800">{selectedCustomer?.companyName || 'Interessent'}</span></div>
                  <div>Gültig bis: <span className="font-semibold text-slate-800">{formatDate(validUntilDate)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= HISTORY / SAVED OFFERS TAB ================= */
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Gespeicherte Angebote & Kostenvoranschläge</h2>
              <p className="text-xs text-slate-500">Übersicht aller erstellten Offerten, Status-Tracking & PDF-Export</p>
            </div>

            <div className="flex items-center gap-2">
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
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
    </div>
  );
}
