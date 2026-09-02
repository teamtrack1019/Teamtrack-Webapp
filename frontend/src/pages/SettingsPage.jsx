import React, { useState, useEffect } from 'react';
import { Settings, Building2, User, Mail, Phone, MapPin, Hash, Landmark, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: '',
    ownerName: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxNumber: '',
    vatId: '',
    bankName: '',
    iban: '',
    bic: '',
    kmRate: 0.30,
    defaultTaxRate: 19,
    paymentTermsDays: 14,
    invoicePrefix: 'RE-2026-',
    expensePrefix: 'BE-2026-'
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        alert('Fehler beim Laden der Einstellungen: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        ...settings,
        kmRate: parseFloat(settings.kmRate) || 0.30,
        defaultTaxRate: parseFloat(settings.defaultTaxRate) || 19,
        paymentTermsDays: parseInt(settings.paymentTermsDays, 10) || 14
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Einstellungen werden geladen...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-sky-600" />
          <span>Unternehmensdaten & Einstellungen</span>
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Rechnungsbriefkopf, Steuernummern, Bankverbindung und Standard-Pauschalen
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2.5 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Einstellungen wurden erfolgreich gespeichert!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company & Owner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>Unternehmens- & Inhaberangaben</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Firmenname / Agenturname *
              </label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inhaber / Geschäftsführer *
              </label>
              <input
                type="text"
                required
                value={settings.ownerName}
                onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Untertitel / Slogan (auf Rechnungen)
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Geschäftsanschrift (Straße, PLZ, Ort)
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefon / Mobil
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tax Numbers & Bank */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>Finanzamt & Bankverbindung</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Steuernummer (Finanzamt)
              </label>
              <input
                type="text"
                value={settings.taxNumber}
                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                USt-IdNr. (z.B. DE123456789)
              </label>
              <input
                type="text"
                value={settings.vatId}
                onChange={(e) => setSettings({ ...settings, vatId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bankname
              </label>
              <input
                type="text"
                value={settings.bankName}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IBAN
              </label>
              <input
                type="text"
                value={settings.iban}
                onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rates & Standard Defaults */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-amber-600" />
            <span>Standard-Sätze & Präfixe</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                KM-Pauschale (€ / km)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.kmRate}
                onChange={(e) => setSettings({ ...settings, kmRate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard MwSt.-Satz (%)
              </label>
              <input
                type="number"
                value={settings.defaultTaxRate}
                onChange={(e) => setSettings({ ...settings, defaultTaxRate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rechnungspräfix
              </label>
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-600/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>Einstellungen speichern</span>
          </button>
        </div>
      </form>
    </div>
  );
}
