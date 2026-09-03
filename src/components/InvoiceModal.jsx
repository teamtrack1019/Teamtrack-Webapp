import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  Euro, 
  Building2, 
  X, 
  Sparkles, 
  CheckCircle2,
  Repeat,
  Zap,
  Tag
} from 'lucide-react';
import { api } from '../api';
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
    serviceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: 0,
    isKleinunternehmer: true,
    status: 'draft',
    paidAt: '',
    notes: 'Vielen Dank für Ihren Auftrag und das Vertrauen in unsere digitale Arbeit.',
    paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
    items: [
      { id: '1', description: 'Softwareentwicklung & IT-Beratung Service', quantity: 1, unitPrice: 0, taxRate: 0 }
    ]
  });

  const [customerServices, setCustomerServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load customer services strictly for the selected customer only
  useEffect(() => {
    if (formData.customerId) {
      api.getServices(formData.customerId)
        .then((res) => {
          const onlyThisCustomer = (res || []).filter(s => s.customerId === formData.customerId);
          setCustomerServices(onlyThisCustomer);
          if (onlyThisCustomer.length > 0 && !formData.serviceDate) {
            const firstSrvDate = onlyThisCustomer[0].startDate?.split('T')[0] || onlyThisCustomer[0].createdAt?.split('T')[0];
            if (firstSrvDate) {
              setFormData(prev => ({ ...prev, serviceDate: firstSrvDate }));
            }
          }
        })
        .catch(() => setCustomerServices([]));
    } else {
      setCustomerServices([]);
    }
  }, [formData.customerId]);

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
        serviceDate: invoice.serviceDate || invoice.performanceDate || invoice.deliveryDate || invoice.date || new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxRate: 0,
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
        : 'Softwareentwicklung & IT-Beratung Service';
      const initialItemPrice = prefilledItem?.price !== undefined ? Number(prefilledItem.price) : 0;
      const initialServiceDate = prefilledItem?.startDate?.split('T')[0] || prefilledItem?.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];

      // Auto-calculate next consecutive invoice number
      api.getInvoices().then((invoices) => {
        let maxNum = 0;
        (invoices || []).forEach(inv => {
          if (inv.invoiceNumber) {
            const match = String(inv.invoiceNumber).match(/(\d{4})$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num) && num > maxNum) maxNum = num;
            }
          }
        });
        const currentYear = new Date().getFullYear();
        const nextInvNumber = `RE-${currentYear}-${String(maxNum + 1).padStart(4, '0')}`;
        
        setFormData(prev => ({
          ...prev,
          invoiceNumber: prev.invoiceNumber || nextInvNumber
        }));
      }).catch(() => {});

      setFormData({
        invoiceNumber: '',
        customerId: defaultCust ? defaultCust.id : '',
        customerName: defaultCust ? defaultCust.companyName : '',
        customerAddress: defaultCust ? defaultCust.address : '',
        customerTaxId: defaultCust ? defaultCust.taxNumber : '',
        customerEmail: defaultCust ? defaultCust.email : '',
        date: new Date().toISOString().split('T')[0],
        serviceDate: initialServiceDate,
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

  const handleCustomerChange = (customerId) => {
    const selected = customers.find(c => c.id === customerId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        customerId: selected.id,
        customerName: selected.companyName,
        customerAddress: selected.address,
        customerTaxId: selected.taxNumber,
        customerEmail: selected.email
      }));
    }
  };

  const handleDateChange = (newDate) => {
    if (!newDate) return;
    try {
      const d = new Date(newDate);
      d.setDate(d.getDate() + 14);
      const newDueDate = d.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        date: newDate,
        dueDate: newDueDate
      }));
    } catch (e) {
      setFormData(prev => ({ ...prev, date: newDate }));
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

  const addServiceAsItem = (service) => {
    const desc = service.type === 'abo' 
      ? `${service.title} (Monatliches Abonnement)` 
      : service.title;
    const price = Number(service.price || 0);
    const srvDate = service.startDate?.split('T')[0] || service.createdAt?.split('T')[0] || formData.serviceDate;

    // If first item is empty default, replace it; otherwise append
    if (formData.items.length === 1 && (formData.items[0].description.includes('Service') || formData.items[0].description === '') && formData.items[0].unitPrice === 0) {
      setFormData({
        ...formData,
        serviceDate: srvDate || formData.serviceDate,
        items: [{ id: String(Date.now()), description: desc, quantity: 1, unitPrice: price, taxRate: 0 }]
      });
    } else {
      setFormData({
        ...formData,
        serviceDate: srvDate || formData.serviceDate,
        items: [
          ...formData.items,
          { id: String(Date.now()), description: desc, quantity: 1, unitPrice: price, taxRate: 0 }
        ]
      });
    }
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
        netAmount: netTotal,
        taxAmount,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {invoice ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}
              </h3>
              <p className="text-xs text-sky-100">
                {formData.invoiceNumber ? `Rechnungs-Nr: ${formData.invoiceNumber}` : 'Automatische Rechnungsnummer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top Row: Customer Selection, Invoice Date, Service Date, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Kunde auswählen *</span>
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                <span>Rechnungsdatum (Heute) *</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Liefer-/Leistungsdatum *</span>
              </label>
              <input
                type="date"
                required
                value={formData.serviceDate}
                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Add From Customer Services (Abos / Einmalige Leistungen) */}
          {customerServices.length > 0 && (
            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Kunden-Leistungen mit 1 Klick als Position hinzufügen:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {customerServices.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => addServiceAsItem(srv)}
                    className="px-3 py-1.5 bg-white hover:bg-sky-600 hover:text-white text-slate-800 text-xs font-bold rounded-xl border border-sky-300 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {srv.type === 'abo' ? (
                      <Repeat className="w-3.5 h-3.5 text-sky-600" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>{srv.title}</span>
                    <span className="text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded text-[11px] font-extrabold ml-1">
                      {formatCurrency(srv.price)}
                    </span>
                    <Plus className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Items Section (Mobile-Friendly Responsive Cards + Desktop Table) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Rechnungspositionen & Beträge
              </h4>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Position hinzufügen</span>
              </button>
            </div>

            {/* MOBILE LAYOUT (< md): Intuitive Cards */}
            <div className="md:hidden space-y-3">
              {formData.items.map((item, index) => {
                const rowTotal = (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0);
                return (
                  <div key={item.id || index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Position #{index + 1}</span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Beschreibung</label>
                      <input
                        type="text"
                        required
                        placeholder="z.B. Monatliche Betreuung & Hosting"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Menge</label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Einzelpreis (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-right focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Zeilensumme:</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(rowTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP LAYOUT (>= md): Full Table */}
            <div className="hidden md:block border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Pos. Beschreibung</th>
                    <th className="p-3 w-24 text-center">Menge</th>
                    <th className="p-3 w-36 text-right">Einzelpreis (€)</th>
                    <th className="p-3 w-36 text-right">Gesamt (€)</th>
                    <th className="p-3 w-12 text-center"></th>
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
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs text-center font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs text-right font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                              <Trash2 className="w-4 h-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5 text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>§ 19 UStG Kleinunternehmerregelung</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                Gemäß § 19 UStG wird keine Umsatzsteuer berechnet und ausgewiesen. Der Gesamtbetrag entspricht dem Rechnungsbetrag.
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 shadow-sm">
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
              className="px-4 py-2 text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 sm:px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Wird erstellt...' : invoice ? 'Rechnung aktualisieren' : 'Rechnung verbindlich erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
