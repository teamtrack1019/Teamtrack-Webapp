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
  const [grossInput, setGrossInput] = useState('');
  const [netInput, setNetInput] = useState('');
  const [taxRate, setTaxRate] = useState(19);
  const [discountAmount, setDiscountAmount] = useState('');
  const [extraAmount, setExtraAmount] = useState('');
  const [formData, setFormData] = useState({
    expenseNumber: '',
    vendor: '',
    category: 'Software & Hosting',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Banküberweisung',
    status: 'paid',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      const g = expense.grossAmount !== undefined && expense.grossAmount !== null ? String(expense.grossAmount) : '';
      const n = expense.netAmount !== undefined && expense.netAmount !== null ? String(expense.netAmount) : '';
      const rate = expense.taxRate !== undefined ? Number(expense.taxRate) : 19;
      setGrossInput(g);
      setNetInput(n);
      setTaxRate(rate);
      setDiscountAmount(expense.discountAmount ? String(expense.discountAmount) : '');
      setExtraAmount(expense.extraAmount ? String(expense.extraAmount) : '');
      setFormData({
        expenseNumber: expense.expenseNumber || '',
        vendor: expense.vendor || '',
        category: expense.category || 'Software & Hosting',
        date: expense.date || new Date().toISOString().split('T')[0],
        paymentMethod: expense.paymentMethod || 'Banküberweisung',
        status: expense.status || 'paid',
        notes: expense.notes || ''
      });
    } else {
      setGrossInput('');
      setNetInput('');
      setTaxRate(19);
      setDiscountAmount('');
      setExtraAmount('');
      setFormData({
        expenseNumber: '',
        vendor: '',
        category: 'Software & Hosting',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Banküberweisung',
        status: 'paid',
        notes: ''
      });
    }
  }, [expense, isOpen]);

  if (!isOpen) return null;

  // Handle Gross input change -> auto calculate Net
  const handleGrossChange = (val) => {
    setGrossInput(val);
    const parsedGross = parseFloat(val);
    if (!isNaN(parsedGross) && parsedGross >= 0) {
      const rate = parseFloat(taxRate) || 0;
      const calculatedNet = rate > 0 ? parsedGross / (1 + rate / 100) : parsedGross;
      setNetInput(calculatedNet.toFixed(2));
    } else if (val === '') {
      setNetInput('');
    }
  };

  // Handle Net input change -> auto calculate Gross
  const handleNetChange = (val) => {
    setNetInput(val);
    const parsedNet = parseFloat(val);
    if (!isNaN(parsedNet) && parsedNet >= 0) {
      const rate = parseFloat(taxRate) || 0;
      const calculatedGross = parsedNet * (1 + rate / 100);
      setGrossInput(calculatedGross.toFixed(2));
    } else if (val === '') {
      setGrossInput('');
    }
  };

  // Handle Tax Rate change -> recalculate Net based on current Gross
  const handleTaxRateChange = (newRate) => {
    setTaxRate(newRate);
    const parsedGross = parseFloat(grossInput);
    if (!isNaN(parsedGross) && parsedGross >= 0) {
      const calculatedNet = newRate > 0 ? parsedGross / (1 + newRate / 100) : parsedGross;
      setNetInput(calculatedNet.toFixed(2));
    }
  };

  const finalGross = parseFloat(grossInput) || 0;
  const finalNet = parseFloat(netInput) || (taxRate > 0 ? finalGross / (1 + taxRate / 100) : finalGross);
  const finalTax = Math.max(0, finalGross - finalNet);
  const discountVal = parseFloat(discountAmount) || 0;
  const extraVal = parseFloat(extraAmount) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        netAmount: Number(finalNet.toFixed(2)),
        discountAmount: discountVal,
        extraAmount: extraVal,
        taxRate: parseFloat(taxRate) || 0,
        taxAmount: Number(finalTax.toFixed(2)),
        grossAmount: Number(finalGross.toFixed(2))
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
                {isTR ? 'Fatura tutarı, KDV ayrımı ve gider kaydı' : 'Betriebsausgabe für Vorsteuerabzug & EÜR Finanzamt'}
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
              placeholder={isTR ? 'Örn. Vodafone Handy, Hetzner Server, Adobe' : 'z.B. Vodafone Handy, Hetzner Server, Adobe'}
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

          {/* Direct Brutto & Netto Inputs */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Euro className="w-3.5 h-3.5 text-amber-600" />
                    {isTR ? 'Brüt Tutar (Ödenecek) *' : 'Bruttobetrag (Zu zahlen) *'}
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="z.B. 39.98"
                  value={grossInput}
                  onChange={(e) => handleGrossChange(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-amber-500/60 rounded-xl text-sm font-black text-slate-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{isTR ? 'Faturadaki son ödenecek tutar' : 'Endbetrag laut Rechnung'}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTR ? 'Net Tutar (KDV Hariç)' : 'Nettobetrag (ohne MwSt.)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="z.B. 33.60"
                  value={netInput}
                  onChange={(e) => handleNetChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{isTR ? 'Vergi matrahı (otomatik)' : 'Automatisch berechnet'}</span>
              </div>
            </div>

            {/* Tax rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isTR ? 'KDV / Vorsteuer Oranı' : 'Vorsteuer / MwSt.-Satz'}
              </label>
              <select
                value={taxRate}
                onChange={(e) => handleTaxRateChange(parseFloat(e.target.value) || 0)}
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
                <span className="text-[10px] text-slate-400 font-normal">{isTR ? 'Opsiyonel (-)' : 'Optional (-)'}</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00 (z.B. 5.00)"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-blue-700">
                  <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                  {isTR ? 'Ekstra Ücret (€)' : 'Zusatzkosten / Extra (€)'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">{isTR ? 'Opsiyonel (+)' : 'Optional (+)'}</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00 (z.B. 4.99)"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Calculation Preview */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5 text-slate-600 flex-wrap">
                <span>{isTR ? 'Net Gider:' : 'Netto:'} <strong className="text-slate-800 font-mono">{formatCurrency(finalNet)}</strong></span>
                <span>{isTR ? 'İçindeki KDV:' : 'Vorsteuer:'} <strong className="text-emerald-700 font-mono">+{formatCurrency(finalTax)}</strong> <span className="text-[10px] text-slate-400">({taxRate}%)</span></span>
                {discountVal > 0 && (
                  <span className="text-rose-700 font-medium">
                    {isTR ? 'İndirim:' : 'Gutschein:'} <strong className="font-mono">-{formatCurrency(discountVal)}</strong>
                  </span>
                )}
                {extraVal > 0 && (
                  <span className="text-blue-700 font-medium">
                    {isTR ? 'Ekstra:' : 'Zusatz:'} <strong className="font-mono">+{formatCurrency(extraVal)}</strong>
                  </span>
                )}
              </div>
              <div className="text-right pl-2 shrink-0">
                <span className="text-slate-500 text-[11px] block">{isTR ? 'Zu zahlender Betrag (Brüt):' : 'Zu zahlender Betrag (Brutto):'}</span>
                <span className="font-extrabold text-amber-950 text-base font-mono">{formatCurrency(finalGross)}</span>
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
