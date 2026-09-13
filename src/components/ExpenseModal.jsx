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
  const [formData, setFormData] = useState({
    expenseNumber: '',
    vendor: '',
    category: 'Software & Hosting',
    date: new Date().toISOString().split('T')[0],
    netAmount: '',
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
      setFormData({
        expenseNumber: expense.expenseNumber || '',
        vendor: expense.vendor || '',
        category: expense.category || 'Software & Hosting',
        date: expense.date || new Date().toISOString().split('T')[0],
        netAmount: expense.netAmount !== undefined && expense.netAmount !== null ? expense.netAmount : '',
        discountAmount: expense.discountAmount !== undefined && expense.discountAmount !== null && expense.discountAmount !== 0 ? expense.discountAmount : '',
        extraAmount: expense.extraAmount !== undefined && expense.extraAmount !== null && expense.extraAmount !== 0 ? expense.extraAmount : '',
        taxRate: expense.taxRate !== undefined ? expense.taxRate : 19,
        paymentMethod: expense.paymentMethod || 'Banküberweisung',
        status: expense.status || 'paid',
        notes: expense.notes || ''
      });
    } else {
      setFormData({
        expenseNumber: '',
        vendor: '',
        category: 'Software & Hosting',
        date: new Date().toISOString().split('T')[0],
        netAmount: '',
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

  const net = parseFloat(formData.netAmount) || 0;
  const discount = parseFloat(formData.discountAmount) || 0;
  const extra = parseFloat(formData.extraAmount) || 0;
  const taxRate = parseFloat(formData.taxRate) || 0;
  const tax = (net * taxRate) / 100;
  const gross = Math.max(0, net + tax - discount + extra);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        netAmount: net,
        discountAmount: discount,
        extraAmount: extra,
        taxRate: taxRate,
        taxAmount: tax,
        grossAmount: gross
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

          {/* Net Amount & Tax Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Euro className="w-3.5 h-3.5 text-slate-400" />
                {isTR ? 'Net Tutar (€) *' : 'Nettobetrag (€) *'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="z.B. 34.99"
                value={formData.netAmount}
                onChange={(e) => setFormData({ ...formData, netAmount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isTR ? 'KDV / Vorsteuer' : 'Vorsteuer / MwSt.'}
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
                <span>{isTR ? 'Net:' : 'Netto:'} <strong className="text-slate-800 font-mono">{formatCurrency(net)}</strong></span>
                <span>{isTR ? 'KDV:' : 'Vorsteuer:'} <strong className="text-emerald-700 font-mono">+{formatCurrency(tax)}</strong> <span className="text-[10px] text-slate-400">({taxRate}%)</span></span>
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
                <span className="text-slate-500 text-[11px] block">{isTR ? 'Hesaplanan Brüt:' : 'Bruttobetrag:'}</span>
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
