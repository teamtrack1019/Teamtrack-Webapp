import React, { useState, useEffect, useMemo } from 'react';
import { Users, X, Building2, User, Mail, Phone, MapPin, Hash, Sparkles, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

const normalizeText = (str) => (str || '').toString().toLowerCase().trim().replace(/\s+/g, ' ');

const normalizePhone = (phone) => {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('0049')) clean = '+49' + clean.slice(4);
  if (clean.startsWith('0') && clean.length > 5) clean = '+49' + clean.slice(1);
  return clean;
};

export default function CustomerModal({ isOpen, onClose, onSave, customer = null, existingCustomers = [] }) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    status: 'lead',
    leadSource: 'WEBSITE ANFRAGE',
    businessType: 'Papierkram Digitalisierung & WebApp',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        companyName: customer.companyName || '',
        contactPerson: customer.contactPerson || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        taxNumber: customer.taxNumber || '',
        status: customer.status || 'lead',
        leadSource: customer.leadSource || 'WEBSITE ANFRAGE',
        businessType: customer.businessType || 'Papierkram Digitalisierung & WebApp',
        notes: customer.notes || ''
      });
    } else {
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        taxNumber: '',
        status: 'lead',
        leadSource: 'WEBSITE ANFRAGE',
        businessType: 'Papierkram Digitalisierung & WebApp',
        notes: ''
      });
    }
  }, [customer, isOpen]);

  // Real-time Duplicate Detection
  const duplicateMatches = useMemo(() => {
    if (!isOpen || !Array.isArray(existingCustomers) || existingCustomers.length === 0) return [];
    const list = [];
    const currId = customer?.id;

    const inName = normalizeText(formData.companyName);
    const inEmail = normalizeText(formData.email);
    const inPhone = normalizePhone(formData.phone);
    const inTax = normalizeText(formData.taxNumber).replace(/[^a-z0-9]/gi, '');

    // Don't search if all fields are empty or too short
    if (inName.length < 2 && inEmail.length < 4 && inPhone.length < 5 && inTax.length < 5) {
      return [];
    }

    for (const c of existingCustomers) {
      if (!c) continue;
      // If editing, skip the customer itself
      if (currId && (c.id === currId || String(c.id) === String(currId))) continue;

      const cName = normalizeText(c.companyName);
      const cEmail = normalizeText(c.email);
      const cPhone = normalizePhone(c.phone);
      const cTax = normalizeText(c.taxNumber).replace(/[^a-z0-9]/gi, '');

      const reasons = [];

      // Check Company Name
      if (inName.length >= 2 && cName && (inName === cName)) {
        reasons.push({ type: 'name', label: 'Firmenname identisch', value: c.companyName });
      }

      // Check Email
      if (inEmail.length >= 5 && cEmail && inEmail === cEmail) {
        reasons.push({ type: 'email', label: 'E-Mail-Adresse existiert bereits', value: c.email });
      }

      // Check Phone
      if (inPhone.length >= 6 && cPhone && (inPhone === cPhone || (inPhone.slice(-8) === cPhone.slice(-8) && inPhone.slice(-8).length >= 8))) {
        reasons.push({ type: 'phone', label: 'Telefonnummer existiert bereits', value: c.phone });
      }

      // Check Tax ID
      if (inTax.length >= 6 && cTax && inTax === cTax) {
        reasons.push({ type: 'tax', label: 'Steuernummer / USt-IdNr identisch', value: c.taxNumber });
      }

      if (reasons.length > 0) {
        list.push({
          customer: c,
          reasons
        });
      }
    }

    return list;
  }, [formData.companyName, formData.email, formData.phone, formData.taxNumber, existingCustomers, customer, isOpen]);

  const hasNameDup = duplicateMatches.some(m => m.reasons.some(r => r.type === 'name'));
  const hasEmailDup = duplicateMatches.some(m => m.reasons.some(r => r.type === 'email'));
  const hasPhoneDup = duplicateMatches.some(m => m.reasons.some(r => r.type === 'phone'));
  const hasTaxDup = duplicateMatches.some(m => m.reasons.some(r => r.type === 'tax'));

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent accidental duplicate creation with explicit confirmation
    if (duplicateMatches.length > 0 && !customer) {
      const matchDetails = duplicateMatches.map(m => {
        const rLabels = m.reasons.map(r => `${r.label}: ${r.value}`).join(', ');
        return `• ${m.customer.companyName || 'Unbekannt'} (${rLabels})`;
      }).join('\n');

      const proceed = window.confirm(
        `⚠️ ACHTUNG: Mögliches Kunden-Duplikat!\n\nFolgende(r) Kunde(n) ist/sind bereits im System registriert:\n\n${matchDetails}\n\nMöchten Sie diesen Kunden trotzdem anlegen?`
      );

      if (!proceed) {
        return;
      }
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-500/30">
              <Users className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {customer ? 'Kunden bearbeiten' : 'Neuen Kunden anlegen'}
              </h3>
              <p className="text-xs text-slate-400">
                Stammdaten & Kontakt für Digitalisierungs-Projekte
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* DUPLICATE WARNING BANNER */}
          {duplicateMatches.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-400/90 rounded-2xl p-4 shadow-sm animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 space-y-2 text-xs">
                  <div>
                    <h4 className="font-black text-amber-900 text-sm flex items-center gap-1.5">
                      <span>⚠️ Kunde bereits registriert / Duplikat gefunden!</span>
                    </h4>
                    <p className="text-amber-800 mt-0.5 font-medium">
                      In Ihrer Kundendatenbank existieren bereits folgende Übereinstimmungen:
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    {duplicateMatches.map(({ customer: dupCust, reasons }, idx) => (
                      <div key={dupCust.id || idx} className="bg-white/95 border border-amber-300 rounded-xl p-3 text-xs shadow-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-1.5">
                          <div className="font-black text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-sky-600" />
                            <span>{dupCust.companyName}</span>
                            {dupCust.contactPerson && (
                              <span className="text-slate-500 font-normal">({dupCust.contactPerson})</span>
                            )}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold uppercase shrink-0">
                            {dupCust.status || 'lead'}
                          </span>
                        </div>

                        <ul className="text-[11px] space-y-1 pt-0.5">
                          {reasons.map((r, rIdx) => (
                            <li key={rIdx} className="flex items-center gap-1.5 font-semibold text-rose-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                              <span>{r.label}: <strong className="text-slate-900 font-mono font-bold">{r.value}</strong></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-amber-700 italic">
                    💡 Hinweis: Bitte prüfen Sie, ob Sie diesen Kunden bearbeiten statt neu anlegen möchten.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Company Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Firmenname / Unternehmung *</span>
              </label>
              {hasNameDup && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Name existiert bereits
                </span>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="z.B. Müller Bau GmbH oder Meisterei Schmidt"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-xl text-sm transition focus:outline-none ${
                hasNameDup 
                  ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500' 
                  : 'border-slate-200 focus:ring-2 focus:ring-sky-500'
              }`}
            />
          </div>

          {/* Contact Person & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Ansprechpartner
              </label>
              <input
                type="text"
                placeholder="Herr / Frau Name"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kundenstatus
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium"
              >
                <option value="lead">Interessent (Demo-Phase)</option>
                <option value="active">Aktiver Kunde (mit Vertrag / Abo)</option>
                <option value="archived">Archiviert (Inaktiv)</option>
              </select>
            </div>
          </div>

          {/* Lead Source / Woher erreicht */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              Akquise-Kanal / Woher erreicht? (Lead-Quelle)
            </label>
            <select
              value={formData.leadSource}
              onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-bold text-slate-800"
            >
              <option value="WEBSITE ANFRAGE">🌐 WEBSITE ANFRAGE</option>
              <option value="DIREKT E-MAIL">✉️ DIREKT E-MAIL</option>
              <option value="UPWORK">🟢 UPWORK</option>
              <option value="XING">💼 XING</option>
              <option value="MALT">🔴 MALT</option>
              <option value="EMPFEHLUNG">⭐ EMPFEHLUNG</option>
              <option value="SONSTIGES">📌 SONSTIGES</option>
            </select>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>E-Mail-Adresse</span>
                </label>
                {hasEmailDup && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Doppelt
                  </span>
                )}
              </div>
              <input
                type="email"
                placeholder="info@firma.de"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl text-sm transition focus:outline-none ${
                  hasEmailDup 
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500' 
                    : 'border-slate-200 focus:ring-2 focus:ring-sky-500'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Telefon / Mobil</span>
                </label>
                {hasPhoneDup && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Doppelt
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="+49 170 1234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl text-sm transition focus:outline-none ${
                  hasPhoneDup 
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500' 
                    : 'border-slate-200 focus:ring-2 focus:ring-sky-500'
                }`}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Adresse (Straße, PLZ, Ort)
            </label>
            <input
              type="text"
              placeholder="Musterstr. 10, 10115 Berlin"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Tax Number & Business Focus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>USt-IdNr / Steuernummer</span>
                </label>
                {hasTaxDup && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Doppelt
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="DE123456789"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl text-sm transition focus:outline-none ${
                  hasTaxDup 
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500' 
                    : 'border-slate-200 focus:ring-2 focus:ring-sky-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                Projekt-Art / Branche
              </label>
              <input
                type="text"
                placeholder="z.B. Papierkram Digitalisierung, WebApp"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notizen & Kundenwünsche
            </label>
            <textarea
              rows={3}
              placeholder="Welche Prozesse sollen digitalisiert werden? (Stundenzettel, Rechnungen, Baustellenberichte...)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 text-white rounded-xl text-sm font-semibold shadow-md transition disabled:opacity-50 cursor-pointer ${
                duplicateMatches.length > 0 && !customer
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
              }`}
            >
              {loading 
                ? 'Speichern...' 
                : customer 
                  ? 'Änderungen speichern' 
                  : duplicateMatches.length > 0 
                    ? 'Trotzdem anlegen' 
                    : 'Kunde anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
