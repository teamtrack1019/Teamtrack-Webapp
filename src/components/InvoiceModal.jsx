import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Calendar, Euro, Building2, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function InvoiceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  invoice = null, 
  customers = [],
  preselectedCustomerId = null,
  prefilledItem = null 
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
      const initialItemDesc = prefilledItem?.title 
        ? `${prefilledItem.title}${prefilledItem.type === 'abo' ? ' (Monatliches Abonnement)' : ''}`
        : 'Papierkram Digitalisierung & WebApp Service';
      const initialItemPrice = prefilledItem?.price !== undefined ? Number(prefilledItem.price) : 0;

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
          { id: '1', description: initialItemDesc, quantity: 1, unitPrice: initialItemPrice, taxRate: 0 }
        ]
      });
    }
  }, [invoice, customers, preselectedCustomerId, prefilledItem, isOpen]);

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
    if (formData.items.length === 1) return;
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  // Calculations (§ 19 UStG Kleinunternehmer -> Tax is 0)
  const netTotal = formData.items.reduce((sum, it) => sum + ((parseFloat(it.unitPrice) || 0) * (parseFloat(it.quantity) || 1)), 0);
  const taxAmount = 0;
  const grossTotal = netTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        isKleinunternehmer: true,
        taxRate: 0,
        netAmount: netTotal,
        taxAmount: 0,
        grossAmount: grossTotal
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
              <h3 className="text-lg font-bold">
                {invoice ? `Rechnung bearbeiten: ${invoice.invoiceNumber}` : 'Neue Ausgangsrechnung erstellen'}
              </h3>
              <p className="text-xs text-slate-400">
                § 19 UStG Kleinunternehmerregelung • Rechtssicher nach GoBD
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Customer Selection & Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Kunde auswählen *</span>
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- Kunde wählen --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.contactPerson || 'Kein Kontakt'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Rechnungsdatum *</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Fälligkeitsdatum *</span>
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Rechnungspositionen & Leistungen
              </h4>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Position hinzufügen</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Pos. Beschreibung</th>
                    <th className="p-3 w-20 text-center">Menge</th>
                    <th className="p-3 w-32 text-right">Einzelpreis (€)</th>
                    <th className="p-3 w-32 text-right">Gesamt (€)</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {formData.items.map((item, index) => {
                    const rowTotal = (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0);
                    return (
                      <tr key={item.id || index} className="hover:bg-slate-50/50">
                        <td className="p-2.5">
                          <input
                            type="text"
                            required
                            placeholder="z.B. Digitalisierung & WebApp-Entwicklung"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-right font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5 text-right font-extrabold text-slate-900">
                          {formatCurrency(rowTotal)}
                        </td>
                        <td className="p-2.5 text-center">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kleinunternehmer Notice & Total Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>§ 19 UStG Kleinunternehmerregelung</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                Gemäß § 19 UStG wird keine Umsatzsteuer berechnet und ausgewiesen. Der Gesamtbetrag entspricht dem Rechnungsbetrag.
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Nettobetrag:</span>
                <span className="font-bold">{formatCurrency(netTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Umsatzsteuer (§ 19 UStG 0%):</span>
                <span className="font-bold">0,00 €</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-extrabold text-sky-400">
                <span>Rechnungsbetrag Gesamt:</span>
                <span className="text-base text-white">{formatCurrency(grossTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Payment Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Zahlungsbedingungen (auf Rechnung)
              </label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Freitext / Schlusssatz
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
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
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Wird erstellt...' : invoice ? 'Rechnung aktualisieren' : 'Rechnung verbindlich erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
