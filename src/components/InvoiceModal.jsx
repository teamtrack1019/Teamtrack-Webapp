import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Calendar, Euro, Building2, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function InvoiceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  invoice = null, 
  customers = [],
  preselectedCustomerId = null 
}) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    customerName: '',
    customerAddress: '',
    customerTaxId: '',
    customerEmail: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: 0,
    isKleinunternehmer: true,
    status: 'draft',
    paidAt: '',
    notes: 'Vielen Dank für Ihren Auftrag und das Vertrauen in unsere digitale Arbeit.',
    paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
    items: [
      { id: '1', description: 'Papierkram Digitalisierung & WebApp Service', quantity: 1, unitPrice: 0, taxRate: 0 }
    ]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        customerId: invoice.customerId || '',
        customerName: invoice.customerName || '',
        customerAddress: invoice.customerAddress || '',
        customerTaxId: invoice.customerTaxId || '',
        customerEmail: invoice.customerEmail || '',
        date: invoice.date || new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxRate: invoice.taxRate !== undefined ? invoice.taxRate : 0,
        isKleinunternehmer: true,
        status: invoice.status || 'draft',
        paidAt: invoice.paidAt || '',
        notes: invoice.notes || 'Vielen Dank für Ihren Auftrag.',
        paymentTerms: invoice.paymentTerms || 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
        items: invoice.items && invoice.items.length > 0 ? invoice.items : [
          { id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0 }
        ]
      });
    } else {
      const defaultCust = customers.find(c => c.id === preselectedCustomerId) || customers[0];
      setFormData({
        invoiceNumber: '',
        customerId: defaultCust ? defaultCust.id : '',
        customerName: defaultCust ? defaultCust.companyName : '',
        customerAddress: defaultCust ? defaultCust.address : '',
        customerTaxId: defaultCust ? defaultCust.taxNumber : '',
        customerEmail: defaultCust ? defaultCust.email : '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxRate: 0,
        isKleinunternehmer: true,
        status: 'draft',
        paidAt: '',
        notes: 'Vielen Dank für Ihren Auftrag und das Vertrauen in unsere digitale Arbeit.',
        paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
        items: [
          { id: '1', description: 'Papierkram Digitalisierung & WebApp Service', quantity: 1, unitPrice: 0, taxRate: 0 }
        ]
      });
    }
  }, [invoice, customers, preselectedCustomerId, isOpen]);

  if (!isOpen) return null;

  const handleCustomerChange = (customerId) => {
    const selected = customers.find(c => c.id === customerId);
    if (selected) {
      setFormData({
        ...formData,
        customerId: selected.id,
        customerName: selected.companyName,
        customerAddress: selected.address,
        customerTaxId: selected.taxNumber,
        customerEmail: selected.email
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'taxRate' ? parseFloat(value) || 0 : value
    };
    setFormData({ ...formData, items: updated });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: String(Date.now()), description: '', quantity: 1, unitPrice: 0, taxRate: 0 }
      ]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  // Calculations for Kleinunternehmer (0% MwSt)
  const totalAmount = formData.items.reduce((sum, item) => sum + ((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        netAmount: totalAmount,
        taxAmount: 0,
        grossAmount: totalAmount,
        isKleinunternehmer: true
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-500/30">
              <FileText className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  {invoice ? `Rechnung ${invoice.invoiceNumber} bearbeiten` : 'Neue Ausgangsrechnung erstellen'}
                </h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  § 19 UStG Kleinunternehmer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kein Umsatzsteuerausweis gemäß Kleinunternehmerregelung § 19 UStG
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top Row: Customer & Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            {/* Customer Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Kunde auswählen *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- Kunde wählen --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} {c.contactPerson ? `(${c.contactPerson})` : ''}
                  </option>
                ))}
              </select>

              {formData.customerAddress && (
                <div className="mt-2 text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                  <div className="font-medium text-slate-700">{formData.customerName}</div>
                  <div>{formData.customerAddress}</div>
                  {formData.customerTaxId && <div className="text-[11px] text-slate-400">USt-IdNr: {formData.customerTaxId}</div>}
                </div>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rechnungsnummer
                  </label>
                  <input
                    type="text"
                    placeholder="Automatisch (RE-2026-XXXX)"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  >
                    <option value="draft">Entwurf</option>
                    <option value="sent">Versendet (Offen)</option>
                    <option value="paid">Bezahlt</option>
                    <option value="overdue">Überfällig</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Rechnungsdatum
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Fällig am
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {formData.status === 'paid' && (
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 mb-1">
                    Zahlungseingang am (Bezahlt am)
                  </label>
                  <input
                    type="date"
                    value={formData.paidAt}
                    onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
                    className="w-full px-3 py-1.5 border border-emerald-300 bg-emerald-50 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rechnungspositionen (Leistungen & Posten)
              </h4>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-1 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Position hinzufügen</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Beschreibung / Leistung</th>
                    <th className="p-2.5 w-20 text-center">Menge</th>
                    <th className="p-2.5 w-32 text-right">Einzelpreis (€)</th>
                    <th className="p-2.5 w-28 text-right">Gesamt (€)</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {formData.items.map((item, index) => {
                    const rowTotal = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
                    return (
                      <tr key={item.id || index} className="hover:bg-slate-50">
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            placeholder="z.B. Monatliche Lizenz TeamTrack App oder Papierkram Digitalisierung"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-right font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-slate-800">
                          {formatCurrency(rowTotal)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            disabled={formData.items.length <= 1}
                            onClick={() => removeItem(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kleinunternehmer Notice & Total Calculation Summary */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 pt-2">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kleinunternehmerregelung (§ 19 UStG) aktiv</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed italic">
                  "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung)."
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rechnungshinweis / Notiz
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Totals Summary Box */}
            <div className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Umsatzsteuer:</span>
                <span className="font-semibold text-slate-500">0,00 € (0%)</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Gesamtbetrag (Endbetrag):</span>
                <span className="text-sky-600 text-base">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
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
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Speichern...' : invoice ? 'Rechnung aktualisieren' : 'Rechnung erstellen & speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
