import React, { useState, useEffect } from 'react';
import { Receipt, Calendar, Euro, Tag, CreditCard, X, Building, MinusCircle, PlusCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  'Software & Hosting',
  'Hardware & Geräte',
  'Büro & Verwaltung',
  'Marketing & Werbung',
  'Fremdleistungen & Freelancer',
  'Kfz & Reisekosten',
  'Telekommunikation',
  'Sonstiges'
];

const PAYMENT_METHODS = [
  'Banküberweisung',
  'Kreditkarte',
  'PayPal',
  'Lastschrift',
  'Bar'
];

export default function ExpenseModal({ isOpen, onClose, onSave, expense = null }) {
  const { isTR } = useLanguage();
  const [inputMode, setInputMode] = useState('brutto'); // 'brutto' | 'netto'
  const [formData, setFormData] = useState({
    expenseNumber: '',
    vendor: '',
    category: 'Software & Hosting',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    discountAmount: '',
    extraAmount: '',
    taxRate: 19,
    paymentMethod: 'Banküberweisung',
    status: 'paid',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      const mode = expense.inputMode || (expense.grossAmount ? 'brutto' : 'netto');
      setInputMode(mode);
      setFormData({
        expenseNumber: expense.expenseNumber || '',
        vendor: expense.vendor || '',
        category: expense.category || 'Software & Hosting',
        date: expense.date || new Date().toISOString().split('T')[0],
        amount: mode === 'brutto' 
          ? (expense.grossAmount !== undefined && expense.grossAmount !== null ? expense.grossAmount : '') 
          : (expense.netAmount !== undefined && expense.netAmount !== null ? expense.netAmount : ''),
        discountAmount: expense.discountAmount !== undefined && expense.discountAmount !== null && expense.discountAmount !== 0 ? expense.discountAmount : '',
        extraAmount: expense.extraAmount !== undefined && expense.extraAmount !== null && expense.extraAmount !== 0 ? expense.extraAmount : '',
        taxRate: expense.taxRate !== undefined ? expense.taxRate : 19,
        paymentMethod: expense.paymentMethod || 'Banküberweisung',
        status: expense.status || 'paid',
        notes: expense.notes || ''
      });
    } else {
      setInputMode('brutto');
      setFormData({
        expenseNumber: '',
        vendor: '',
        category: 'Software & Hosting',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        discountAmount: '',
        extraAmount: '',
        taxRate: 19,
        paymentMethod: 'Banküberweisung',
        status: 'paid',
        notes: ''
      });
    }
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const enteredAmount = parseFloat(formData.amount) || 0;
  const discount = parseFloat(formData.discountAmount) || 0;
  const extra = parseFloat(formData.extraAmount) || 0;
  const taxRate = parseFloat(formData.taxRate) || 0;

  let net = 0;
  let tax = 0;
  let gross = 0;

  if (inputMode === 'brutto') {
    // In Brutto mode (like Vodafone, Telekom, Retail bills):
    // If discount or extra are provided, gross is (amount - discount + extra)
    gross = Math.max(0, enteredAmount - discount + extra);
    net = taxRate > 0 ? gross / (1 + taxRate / 100) : gross;
    tax = gross - net;
  } else {
    // In Netto mode (B2B invoices without VAT included):
    net = enteredAmount;
    tax = (net * taxRate) / 100;
    gross = Math.max(0, net + tax - discount + extra);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        inputMode,
        netAmount: Number(net.toFixed(2)),
        discountAmount: discount,
        extraAmount: extra,
        taxRate: taxRate,
        taxAmount: Number(tax.toFixed(2)),
        grossAmount: Number(gross.toFixed(2))
      });
      onClose();
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <Receipt className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {expense ? (isTR ? 'Gideri Düzenle' : 'Ausgabe bearbeiten') : (isTR ? 'Gelen Fatura / Gider Girişi' : 'Eingehende Ausgabe / Beleg erfassen')}
              </h3>
              <p className="text-xs text-slate-400">
                {isTR ? 'Gider kaydı, indirim/ekstra ve KDV hesaplaması' : 'Betriebsausgabe für Vorsteuerabzug & EÜR Finanzamt'}
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
          {/* Vendor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {isTR ? 'Tedarikçi / Firma *' : 'Lieferant / Dienstleister *'}
            </label>
            <input
              type="text"
              required
              placeholder={isTR ? 'Örn. Vodafone Handy, Hetzner Server, Adobe' : 'z.B. Hetzner Server, Adobe, Telekom, Apple Store'}
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Category & Belegnummer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {isTR ? 'Gider Kategorisi *' : 'Ausgabenkategorie *'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isTR ? 'Fiş / Fatura No.' : 'Belegnummer / Rechnungs-Nr.'}
              </label>
              <input
                type="text"
                placeholder="z.B. 122468214604"
                value={formData.expenseNumber}
                onChange={(e) => setFormData({ ...formData, expenseNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Input Mode Switcher: Brutto vs Netto */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
            <button
              type="button"
              onClick={() => setInputMode('brutto')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                inputMode === 'brutto'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{isTR ? 'Brüt / Fatura Toplamı Girişi (KDV Dahil)' : 'Brutto / Fatura Toplamı (inkl. MwSt.)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('netto')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                inputMode === 'netto'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{isTR ? 'Net Tutar Girişi (KDV Hariç)' : 'Nettobetrag (zzgl. MwSt.)'}</span>
            </button>
          </div>

          {/* Primary Amount & Tax Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Euro className="w-3.5 h-3.5 text-slate-400" />
                {inputMode === 'brutto'
                  ? (isTR ? 'Fatura / Brüt Tutar (€) *' : 'Grundbetrag / Brutto (€) *')
                  : (isTR ? 'Net Tutar (€) *' : 'Nettobetrag (€) *')}
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder={inputMode === 'brutto' ? (isTR ? 'Örn. 39.98 veya 34.99' : 'z.B. 39.98 oder 34.99') : 'z.B. 34.99'}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isTR ? 'KDV Oranı' : 'Vorsteuer / MwSt.'}
              </label>
              <select
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              >
                <option value={19}>19% Vorsteuer (Standard)</option>
                <option value={7}>7% Ermäßigt</option>
                <option value={0}>0% Steuerfrei / Reverse Charge</option>
              </select>
            </div>
          </div>

          {/* Discount & Extra Optional Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-rose-700">
                  <MinusCircle className="w-3.5 h-3.5 text-rose-500" />
                  {isTR ? 'Kupon / İndirim (€)' : 'Gutschein / Rabatt (€)'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">{isTR ? 'İndirim (-)' : 'Abzug (-)'}</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00 (z.B. 5.00)"
                value={formData.discountAmount}
                onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-blue-700">
                  <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                  {isTR ? 'Ekstra Ücret (€)' : 'Zusatzkosten / Extra (€)'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">{isTR ? 'Fark (+)' : 'Aufpreis (+)'}</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00 (z.B. 4.99)"
                value={formData.extraAmount}
                onChange={(e) => setFormData({ ...formData, extraAmount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Calculation Preview */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5 text-slate-600 flex-wrap">
                <span>{isTR ? 'Net Gider:' : 'Netto:'} <strong className="text-slate-800 font-mono">{formatCurrency(net)}</strong></span>
                <span>{isTR ? 'İçindeki KDV:' : 'Vorsteuer:'} <strong className="text-emerald-700 font-mono">+{formatCurrency(tax)}</strong> <span className="text-[10px] text-slate-400">({taxRate}%)</span></span>
                {discount > 0 && (
                  <span className="text-rose-700 font-medium">
                    {isTR ? 'İndirim:' : 'Gutschein:'} <strong className="font-mono">-{formatCurrency(discount)}</strong>
                  </span>
                )}
                {extra > 0 && (
                  <span className="text-blue-700 font-medium">
                    {isTR ? 'Extra:' : 'Zusatz:'} <strong className="font-mono">+{formatCurrency(extra)}</strong>
                  </span>
                )}
              </div>
              <div className="text-right pl-2 shrink-0">
                <span className="text-slate-500 text-[11px] block">{isTR ? 'Zu zahlender Betrag (Brüt):' : 'Zu zahlender Betrag (Brutto):'}</span>
                <span className="font-extrabold text-amber-950 text-sm sm:text-base font-mono">{formatCurrency(gross)}</span>
              </div>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Belegdatum *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Zahlart
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Verwendungszweck / Bemerkung
            </label>
            <textarea
              rows={2}
              placeholder="z.B. Monatliche Cloud-Server für Kunden-WebApps"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Speichern...' : expense ? 'Änderungen speichern' : 'Ausgabe erfassen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
