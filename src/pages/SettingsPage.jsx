import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  Landmark, 
  Save, 
  CheckCircle2, 
  Flame, 
  RefreshCw, 
  Database, 
  Key, 
  Globe, 
  Check, 
  ExternalLink,
  ShieldCheck,
  UploadCloud,
  DownloadCloud
} from 'lucide-react';
import { api } from '../api';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  testFirebaseConnection 
} from '../firebase';

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

  // Firebase Cloud Sync States
  const [firebaseConfigStr, setFirebaseConfigStr] = useState('');
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [cloudStatusMsg, setCloudStatusMsg] = useState('');
  const [testingCloud, setTestingCloud] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getSettings();
        let street = data.street || '';
        let zipCode = data.zipCode || '';
        let city = data.city || '';
        if (!street && data.address) {
          const parts = data.address.split(',');
          street = parts[0]?.trim() || '';
          const secondPart = parts[1]?.trim() || '';
          const zipMatch = secondPart.match(/^(\d{5})\s*(.*)$/);
          if (zipMatch) {
            zipCode = zipMatch[1];
            city = zipMatch[2];
          } else {
            city = secondPart;
          }
        }
        setSettings({
          ...data,
          street: street || 'Balthasar-Neumann-Str. 38',
          zipCode: zipCode || '97236',
          city: city || 'Randersacker'
        });

        // Load Firebase Config
        const cfg = getFirebaseConfig();
        if (cfg) {
          setFirebaseConfigStr(JSON.stringify(cfg, null, 2));
          setIsCloudConnected(true);
        }
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
      const fullAddress = `${settings.street || ''}, ${settings.zipCode || ''} ${settings.city || ''}`.replace(/^,\s*|,\s*$/g, '').trim();
      await api.updateSettings({
        ...settings,
        address: fullAddress,
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

  // Test and Save Firebase Connection
  const handleSaveFirebase = async () => {
    if (!firebaseConfigStr.trim()) {
      saveFirebaseConfig(null);
      setIsCloudConnected(false);
      setCloudStatusMsg('Firebase bağlantısı kaldırıldı. Yerel hafıza kullanılıyor.');
      return;
    }

    let parsedConfig = null;
    try {
      parsedConfig = JSON.parse(firebaseConfigStr);
    } catch (e) {
      // Try to parse relaxed JS object format
      try {
        const cleaned = firebaseConfigStr
          .replace(/const\s+firebaseConfig\s*=\s*/, '')
          .replace(/;/g, '')
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"');
        parsedConfig = JSON.parse(cleaned);
      } catch (err2) {
        setCloudStatusMsg('❌ Geçersiz format. Lütfen Firebase Console\'dan kopyaladığınız JSON nesnesini yapıştırın.');
        return;
      }
    }

    setTestingCloud(true);
    setCloudStatusMsg('');
    const result = await testFirebaseConnection(parsedConfig);
    setTestingCloud(false);

    if (result.success) {
      saveFirebaseConfig(parsedConfig);
      setIsCloudConnected(true);
      setCloudStatusMsg('🟢 Firebase bağlantısı başarılı! Telefon, tablet ve bilgisayar artık anlık (realtime) senkronize.');
      // Initial upload
      api.uploadLocalToCloud();
    } else {
      setIsCloudConnected(false);
      setCloudStatusMsg(`❌ Bağlantı Hatası: ${result.message}`);
    }
  };

  const handleManualCloudSync = async () => {
    setSyncingCloud(true);
    try {
      await api.syncCloudNow();
      const updated = await api.getSettings();
      setSettings(updated);
      setCloudStatusMsg('✅ Firebase bulut verileri indirildi ve eşitlendi!');
    } catch (err) {
      setCloudStatusMsg('❌ Senkronizasyon hatası: ' + err.message);
    } finally {
      setSyncingCloud(false);
    }
  };

  const handleManualCloudUpload = () => {
    api.uploadLocalToCloud();
    setCloudStatusMsg('✅ Bu cihazdaki tüm veriler Firebase Firestore bulutuna yüklendi!');
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
          Rechnungsbriefkopf, Steuernummern, Bankverbindung und Firebase Cloud-Echtzeitsynchronisation
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2.5 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Einstellungen wurden erfolgreich gespeichert!</span>
        </div>
      )}

      {/* 🔥 FIREBASE CLOUD SYNC CARD (Multi-Device Realtime Sync) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-7 rounded-2xl border border-slate-700 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  🔥 Firebase Cloud-Echtzeitsynchronisation (Smartphone ↔ PC ↔ Tablet)
                </h3>
                {isCloudConnected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    🟢 Firebase Live verbunden
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700">
                    ⚪ Lokaler Speicher
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ermöglicht den sofortigen automatischen Datenabgleich zwischen Smartphone, Tablet und PC.
              </p>
            </div>
          </div>

          <a 
            href="https://console.firebase.google.com" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition self-start sm:self-auto"
          >
            <span>Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Quick Guide */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Firebase Zugangsdaten einrichten</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
            <li>Gehen Sie zur <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">Firebase Console</a> und wählen Sie Ihr Projekt aus.</li>
            <li>Öffnen Sie oben links die <strong>Projekteinstellungen (Project Settings ⚙️)</strong>.</li>
            <li>Kopieren Sie unter <strong>SDK setup and configuration (Web / Config)</strong> das Konfigurationsobjekt (z.B. <code>&#123; "apiKey": "...", "projectId": "..." &#125;</code>) in das Textfeld unten und klicken Sie auf <strong>"Verbindung testen & speichern"</strong>.</li>
          </ol>
        </div>

        {/* Firebase Config Textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase Konfiguration (JSON oder Objekt)</span>
          </label>
          <textarea
            rows={5}
            placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "proje.firebaseapp.com",
  "projectId": "proje-id",
  "storageBucket": "proje.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456:web:abcdef"
}`}
            value={firebaseConfigStr}
            onChange={(e) => setFirebaseConfigStr(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Status Message */}
        {cloudStatusMsg && (
          <div className="text-xs p-3 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-200">
            {cloudStatusMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleSaveFirebase}
            disabled={testingCloud}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{testingCloud ? 'Wird getestet...' : 'Firebase-Verbindung testen & speichern'}</span>
          </button>

          {isCloudConnected && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleManualCloudUpload}
                className="flex items-center space-x-1 px-3 py-2 bg-sky-600/30 hover:bg-sky-600 text-sky-200 hover:text-white rounded-xl text-xs font-semibold border border-sky-500/40 transition cursor-pointer"
                title="Alle Daten auf diesem Gerät in Firebase hochladen"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>In Cloud hochladen</span>
              </button>

              <button
                type="button"
                onClick={handleManualCloudSync}
                disabled={syncingCloud}
                className="flex items-center space-x-1 px-3 py-2 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white rounded-xl text-xs font-semibold border border-emerald-500/40 transition cursor-pointer"
                title="Aktuelle Daten aus der Cloud auf dieses Gerät laden"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingCloud ? 'animate-spin' : ''}`} />
                <span>Aus Cloud laden</span>
              </button>
            </div>
          )}
        </div>
      </div>

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

            {/* Address fields separated */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Straße & Hausnummer *
              </label>
              <input
                type="text"
                placeholder="z.B. Balthasar-Neumann-Str. 38"
                value={settings.street || ''}
                onChange={(e) => setSettings({ ...settings, street: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PLZ *
                </label>
                <input
                  type="text"
                  placeholder="97236"
                  value={settings.zipCode || ''}
                  onChange={(e) => setSettings({ ...settings, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ort / Stadt *
                </label>
                <input
                  type="text"
                  placeholder="Randersacker"
                  value={settings.city || ''}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
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
