import React, { useState, useEffect } from 'react';
import { Receipt, Calendar, Euro, Tag, CreditCard, X, Building } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

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
  const [formData, setFormData] = useState({
    expenseNumber: '',
    vendor: '',
    category: 'Software & Hosting',
    date: new Date().toISOString().split('T')[0],
    netAmount: '',
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
        netAmount: expense.netAmount !== undefined ? expense.netAmount : '',
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
        taxRate: 19,
        paymentMethod: 'Banküberweisung',
        status: 'paid',
        notes: ''
      });
    }
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const net = parseFloat(formData.netAmount) || 0;
  const tax = (net * (parseFloat(formData.taxRate) || 0)) / 100;
  const gross = net + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        netAmount: net,
        taxRate: parseFloat(formData.taxRate) || 0,
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
                {expense ? 'Ausgabe bearbeiten' : 'Eingehende Ausgabe / Beleg erfassen'}
              </h3>
              <p className="text-xs text-slate-400">
                Betriebsausgabe für Vorsteuerabzug & EÜR Finanzamt
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
              Lieferant / Dienstleister *
            </label>
            <input
              type="text"
              required
              placeholder="z.B. Hetzner Server, Adobe, Telekom, Apple Store"
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
                Ausgabenkategorie *
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
                Belegnummer / Rechnungs-Nr.
              </label>
              <input
                type="text"
                placeholder="z.B. BE-2026-0012"
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
                Nettobetrag (€) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="z.B. 49.00"
                value={formData.netAmount}
                onChange={(e) => setFormData({ ...formData, netAmount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vorsteuer / MwSt.
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

          {/* Calculation Preview */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Vorsteuer: </span>
              <span className="font-semibold text-slate-700">{formatCurrency(tax)}</span>
            </div>
            <div>
              <span className="text-slate-500">Bruttobetrag: </span>
              <span className="font-bold text-amber-900 text-sm">{formatCurrency(gross)}</span>
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
