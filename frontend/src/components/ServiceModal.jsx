import React, { useState, useEffect } from 'react';
import { Layers, Calendar, Euro, FileText, CheckCircle2, Clock, X, Repeat, Zap } from 'lucide-react';

export default function ServiceModal({ isOpen, onClose, onSave, service = null, customerId, customerName }) {
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    type: 'abo', // 'abo' or 'einmalig'
    title: '',
    description: '',
    price: '',
    billingInterval: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        customerId: service.customerId || customerId || '',
        type: service.type || 'abo',
        title: service.title || '',
        description: service.description || '',
        price: service.price !== undefined ? service.price : '',
        billingInterval: service.billingInterval || 'monthly',
        startDate: service.startDate || new Date().toISOString().split('T')[0],
        status: service.status || 'active'
      });
    } else {
      setFormData({
        customerId: customerId || '',
        type: 'abo',
        title: '',
        description: '',
        price: '',
        billingInterval: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    }
  }, [service, customerId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        price: parseFloat(formData.price) || 0
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
            <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-500/30">
              <Layers className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {service ? 'Leistung bearbeiten' : 'Neue Leistung hinzufügen'}
              </h3>
              <p className="text-xs text-slate-400">
                Kunde: <span className="text-white font-medium">{customerName || 'Aktueller Kunde'}</span>
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
          {/* TYPE SELECTOR: ABO vs EINMALIG */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Leistungsart (Hizmet Türü)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'abo' })}
                className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3 ${
                  formData.type === 'abo'
                    ? 'border-sky-500 bg-sky-50/80 text-sky-900 shadow-sm ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${formData.type === 'abo' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Abonnement (Abo)</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Wiederkehrend (z.B. Monatliche Lizenz, Support, Cloud)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'einmalig' })}
                className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3 ${
                  formData.type === 'einmalig'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${formData.type === 'einmalig' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Einmalig</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Einmalige Leistung (z.B. Optimierung, Webapp-Setup)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bezeichnung / Titel der Leistung *
            </label>
            <input
              type="text"
              required
              placeholder={formData.type === 'abo' ? 'z.B. TeamTrack WebApp Cloud & Wartungsvertrag' : 'z.B. Papierkram-Digitalisierung & Initial-Setup'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Price & Billing Interval / Start Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Euro className="w-3.5 h-3.5 text-slate-400" />
                {formData.type === 'abo' ? 'Preis pro Intervall (Netto €) *' : 'Einmaliger Betrag (Netto €) *'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="z.B. 149.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold text-slate-900"
              />
            </div>

            {formData.type === 'abo' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Abrechnungsintervall
                </label>
                <select
                  value={formData.billingInterval}
                  onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium"
                >
                  <option value="monthly">Monatlich (€ / Monat)</option>
                  <option value="quarterly">Vierteljährlich (€ / Quartal)</option>
                  <option value="yearly">Jährlich (€ / Jahr)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium"
                >
                  <option value="active">In Bearbeitung</option>
                  <option value="completed">Erledigt / Abgeschlossen</option>
                  <option value="cancelled">Storniert</option>
                </select>
              </div>
            )}
          </div>

          {/* Start Date & Abo Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formData.type === 'abo' ? 'Vertragsbeginn (Startdatum) *' : 'Datum / Erledigt am *'}
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {formData.type === 'abo' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Abo-Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium"
                >
                  <option value="active">Aktiv (Laufend)</option>
                  <option value="paused">Pausiert</option>
                  <option value="cancelled">Gekündigt / Beendet</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Beschreibung & Leistungsumfang
            </label>
            <textarea
              rows={3}
              placeholder="Details zum Paket, Anzahl Benutzer, Hostingleistungen, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
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
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Speichern...' : service ? 'Änderungen speichern' : 'Leistung speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
