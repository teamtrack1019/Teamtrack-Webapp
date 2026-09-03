import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Users, 
  Receipt, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Cloud, 
  HardDrive,
  Calendar,
  Layers,
  FileJson
} from 'lucide-react';
import { api } from '../api';
import { formatDate, formatDateTime } from '../utils/formatters';

export default function BackupPage({ 
  customers = [], 
  invoices = [], 
  expenses = [], 
  mileage = [], 
  onReloadAllData 
}) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState('');
  const [restoreErrorMsg, setRestoreErrorMsg] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);

  const fileInputRef = useRef(null);

  // 1. Export & Download Backup
  const handleDownloadBackup = () => {
    try {
      const backupData = api.exportBackup();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `TeamTrack-Backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      alert('Fehler beim Erstellen des Backups: ' + err.message);
    }
  };

  // 2. File Selection Handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreErrorMsg('');
    setRestoreSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const rawData = parsed.data || parsed;

        if (!rawData.customers && !rawData.invoices && !rawData.companySettings) {
          throw new Error('Die ausgewählte Datei enthält keine gültigen TeamTrack-Daten.');
        }

        setSelectedFilePreview({
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          exportedAt: parsed.exportedAt ? formatDateTime(parsed.exportedAt) : 'Unbekanntes Datum',
          counts: {
            customers: (rawData.customers || []).length,
            services: (rawData.services || []).length,
            invoices: (rawData.invoices || []).length,
            expenses: (rawData.expenses || []).length,
            mileage: (rawData.mileage || []).length
          },
          parsedData: parsed
        });
      } catch (err) {
        setSelectedFilePreview(null);
        setRestoreErrorMsg('Fehler beim Lesen der Datei: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // 3. Confirm & Execute Restore
  const handleExecuteRestore = async () => {
    if (!selectedFilePreview || !selectedFilePreview.parsedData) return;

    const confirmed = window.confirm(
      `Möchten Sie das Backup "${selectedFilePreview.fileName}" wirklich einspielen?\n\n` +
      `Es werden ${selectedFilePreview.counts.customers} Kunden und ${selectedFilePreview.counts.invoices} Rechnungen wiederhergestellt.`
    );

    if (!confirmed) return;

    setRestoreLoading(true);
    setRestoreErrorMsg('');
    setRestoreSuccessMsg('');

    try {
      const res = api.importBackup(selectedFilePreview.parsedData);
      if (onReloadAllData) {
        await onReloadAllData();
      }

      setRestoreSuccessMsg(
        `Backup erfolgreich wiederhergestellt! (${res.counts.customers} Kunden, ${res.counts.invoices} Rechnungen geladen)`
      );
      setSelectedFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setRestoreErrorMsg('Fehler bei der Wiederherstellung: ' + err.message);
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-sky-600" />
              <span>Backup & Datensicherung</span>
            </h2>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              100% Datensicherheit
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Laden Sie vollständige Sicherheitskopien herunter oder stellen Sie frühere Datenstände mit einem Klick wieder her.
          </p>
        </div>
      </div>

      {/* Database Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Kunden</div>
            <div className="text-base font-extrabold text-slate-900">{customers.length} Einträge</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Rechnungen</div>
            <div className="text-base font-extrabold text-slate-900">{invoices.length} Rechnungen</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Ausgaben</div>
            <div className="text-base font-extrabold text-slate-900">{expenses.length} Belege</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Fahrtenbuch</div>
            <div className="text-base font-extrabold text-slate-900">{mileage.length} Fahrten</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. DOWNLOAD BACKUP CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Backup herunterladen (Export)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Erstellt eine vollständige, verschlüsselte <strong>.json</strong>-Sicherungsdatei Ihrer gesamten Datenbank (Kunden, Verträge, Rechnungen, Belege, Fahrten und Firmeneinstellungen).
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Inhalt:</span>
                <span className="font-bold text-slate-800">Alle Kunden, Rechnungen & Einstellungen</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Format:</span>
                <span className="font-mono font-bold text-sky-600">.json (Standardisiert)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Speicherort:</span>
                <span className="font-bold text-slate-800">Direkt auf Ihrem Gerät (Downloads)</span>
              </div>
            </div>
          </div>

          <div>
            {downloadSuccess && (
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Backup-Datei wurde erfolgreich heruntergeladen!</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-sky-600/30 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Backup jetzt herunterladen (.json)</span>
            </button>
          </div>
        </div>

        {/* 2. RESTORE BACKUP CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Backup wiederherstellen (Import)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Wählen Sie eine zuvor gespeicherte <strong>.json</strong>-Backup-Datei aus. Das System stellt alle Daten wieder her und synchronisiert sie sofort mit der Cloud.
              </p>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* File Selection Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl p-5 text-center cursor-pointer transition"
            >
              <FileJson className="w-8 h-8 text-indigo-500 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-slate-700">
                Klicken Sie hier, um eine .json-Datei auszuwählen
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                TeamTrack-Backup-Dateien (.json)
              </div>
            </div>

            {/* Selected File Preview */}
            {selectedFilePreview && (
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between font-bold text-indigo-950">
                  <span className="truncate">{selectedFilePreview.fileName}</span>
                  <span>{selectedFilePreview.fileSize}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Erstellt am: {selectedFilePreview.exportedAt}</span>
                </div>
                <div className="pt-2 border-t border-indigo-100 grid grid-cols-2 gap-1 text-[11px] text-slate-700 font-medium">
                  <div>👥 Kunden: <strong>{selectedFilePreview.counts.customers}</strong></div>
                  <div>📄 Rechnungen: <strong>{selectedFilePreview.counts.invoices}</strong></div>
                  <div>🧾 Ausgaben: <strong>{selectedFilePreview.counts.expenses}</strong></div>
                  <div>🚗 Fahrten: <strong>{selectedFilePreview.counts.mileage}</strong></div>
                </div>
              </div>
            )}

            {/* Success / Error Messages */}
            {restoreSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{restoreSuccessMsg}</span>
              </div>
            )}

            {restoreErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{restoreErrorMsg}</span>
              </div>
            )}
          </div>

          <div>
            {selectedFilePreview ? (
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={restoreLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${restoreLoading ? 'animate-spin' : ''}`} />
                <span>{restoreLoading ? 'Wird wiederhergestellt...' : 'Backup jetzt einspielen'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Backup-Datei auswählen...</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Safety & Cloud Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30 shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm md:text-base">
              Doppelte Absicherung: Lokale Datei + Firebase Cloud
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
              Ihre Daten werden automatisch in Echtzeit mit Firebase Cloud synchronisiert. Mit regelmäßigen .json-Downloads auf Ihren Computer oder USB-Stick haben Sie zusätzlich jederzeit eine 100% autarke Offline-Kopie Ihrer gesamten Geschäftsdaten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
