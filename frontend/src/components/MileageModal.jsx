import React, { useState, useEffect } from 'react';
import { Car, Calendar, MapPin, Building2, Euro, X, ArrowRightLeft, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function MileageModal({ 
  isOpen, 
  onClose, 
  onSave, 
  mileage = null, 
  customers = [],
  preselectedCustomerId = null 
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    startLocation: 'Büro / Home-Office',
    destination: '',
    purpose: 'Kundenbesuch Digitalisierung & Beratung',
    kilometers: '',
    ratePerKm: 0.30,
    isReturnTrip: true,
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mileage) {
      setFormData({
        date: mileage.date || new Date().toISOString().split('T')[0],
        customerId: mileage.customerId || '',
        customerName: mileage.customerName || '',
        startLocation: mileage.startLocation || 'Büro / Home-Office',
        destination: mileage.destination || '',
        purpose: mileage.purpose || 'Kundenbesuch Digitalisierung',
        kilometers: mileage.kilometers !== undefined ? mileage.kilometers : '',
        ratePerKm: mileage.ratePerKm || 0.30,
        isReturnTrip: mileage.isReturnTrip !== undefined ? mileage.isReturnTrip : true,
        notes: mileage.notes || ''
      });
    } else {
      const defaultCust = customers.find(c => c.id === preselectedCustomerId);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerId: defaultCust ? defaultCust.id : '',
        customerName: defaultCust ? defaultCust.companyName : '',
        startLocation: 'Büro / Home-Office',
        destination: defaultCust ? defaultCust.address : '',
        purpose: 'Kundenbesuch Digitalisierung & Beratung',
        kilometers: '',
        ratePerKm: 0.30,
        isReturnTrip: true,
        notes: ''
      });
    }
  }, [mileage, customers, preselectedCustomerId, isOpen]);

  if (!isOpen) return null;

  const handleCustomerSelect = (customerId) => {
    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      setFormData({
        ...formData,
        customerId: cust.id,
        customerName: cust.companyName,
        destination: cust.address || formData.destination
      });
    } else {
      setFormData({
        ...formData,
        customerId: '',
        customerName: '',
      });
    }
  };

  const km = parseFloat(formData.kilometers) || 0;
  const rate = parseFloat(formData.ratePerKm) || 0.30;
  const totalDeduction = km * rate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        kilometers: km,
        ratePerKm: rate,
        totalDeduction
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
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Car className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {mileage ? 'Fahrt bearbeiten' : 'Dienstfahrt / KM erfassen'}
              </h3>
              <p className="text-xs text-slate-400">
                Finanzamt-konformes Fahrtenbuch (0,30 €/km Pauschale)
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
          {/* Customer (Optional linking) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Zugehöriger Kunde (Optional)
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- Kein Kunde / Allgemeine Dienstfahrt --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} {c.contactPerson ? `(${c.contactPerson})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Kilometers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Datum der Fahrt *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                Gefahrene Kilometer (km) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="z.B. 45.0"
                value={formData.kilometers}
                onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Start Location & Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Startort *
              </label>
              <input
                type="text"
                required
                placeholder="z.B. Büro Berlin"
                value={formData.startLocation}
                onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Zielort / Adresse *
              </label>
              <input
                type="text"
                required
                placeholder="z.B. Industriestr. 14, Berlin"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Purpose of trip */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Anlass / Reisezweck (Finanzamt Pflichtangabe) *
            </label>
            <input
              type="text"
              required
              placeholder="z.B. Vor-Ort-Anforderungsanalyse Papierkram-Digitalisierung"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Return Trip Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isReturnTrip"
              checked={formData.isReturnTrip}
              onChange={(e) => setFormData({ ...formData, isReturnTrip: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="isReturnTrip" className="text-xs text-slate-700 select-none font-medium flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
              Hin- und Rückfahrt (Kilometerangabe enthält Gesamtdistanz)
            </label>
          </div>

          {/* Finanzamt Pauschale Preview */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                <Euro className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  Finanzamt Pauschale ({formData.ratePerKm.toFixed(2).replace('.', ',')} € / km)
                </div>
                <div className="text-[11px] text-emerald-700">
                  Steuermindernde Betriebsausgabe
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-extrabold text-emerald-700">
                {formatCurrency(totalDeduction)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Zusätzliche Notiz
            </label>
            <input
              type="text"
              placeholder="z.B. Baustellenbesuch mit Polier"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Speichern...' : mileage ? 'Änderungen speichern' : 'Fahrt speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
