import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  Euro, 
  MapPin, 
  Calendar, 
  Building2, 
  Printer, 
  Download,
  Loader2,
  Edit3, 
  Trash2,
  ArrowRightLeft,
  FileCheck2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadMileagePdf, printMileagePdfDirectly } from '../utils/pdfGenerator';

export default function MileagePage({ 
  mileage, 
  onOpenMileageModal, 
  onEditMileage, 
  onDeleteMileage 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const filtered = mileage.filter(m => {
    return (
      m.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.startLocation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalKm = mileage.reduce((s, m) => s + Number(m.kilometers || 0), 0);
  const totalDeduction = mileage.reduce((s, m) => s + Number(m.totalDeduction || 0), 0);

  // 1-Click Vector PDF Download
  const handleDownloadPdf = () => {
    try {
      setIsDownloading(true);
      downloadMileagePdf(mileage);
    } catch (err) {
      alert('PDF Fehler: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Vector Print (Clean, No cuts, No splits)
  const handlePrint = () => {
    try {
      printMileagePdfDirectly(mileage);
    } catch (err) {
      window.print();
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Car className="w-7 h-7 text-emerald-600" />
            <span>KM-Tracking & Finanzamt Fahrtenbuch</span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Fahrtenbuch für Kundenbesuche (0,30 €/km Finanzamt-Pauschale)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Direct PDF Download Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
            title="Fahrtenbuch direkt als PDF-Datei herunterladen"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>PDF wird erstellt...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>PDF Herunterladen</span>
              </>
            )}
          </button>

          {/* Direct Clean Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
            title="Fahrtenbuch sauber drucken"
          >
            <Printer className="w-4 h-4" />
            <span>Drucken</span>
          </button>

          {/* New Entry Button */}
          <button
            type="button"
            onClick={() => onOpenMileageModal()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Neue Fahrt erfassen</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Gefahrene Kilometer</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {totalKm.toFixed(1)} <span className="text-xs font-normal text-slate-500">km</span>
            </div>
            <div className="text-[11px] text-slate-500">{mileage.length} Dienstreisen protokolliert</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Euro className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase">Finanzamt Steuerabzug</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {formatCurrency(totalDeduction)}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">0,30 € / km Betriebsausgabe</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Finanzamt Konform</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">Vollständiges Fahrtenbuch</div>
            <div className="text-[11px] text-sky-700">Datum, Zweck, Route & KM</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Kunde, Zielort oder Anlass..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {filtered.length} Fahrten angezeigt
        </div>
      </div>

      {/* Fahrtenbuch Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-4">Datum</th>
                <th className="p-3.5">Kunde</th>
                <th className="p-3.5">Reiseweg (Start → Ziel)</th>
                <th className="p-3.5">Reisezweck / Anlass</th>
                <th className="p-3.5 text-center">Distanz</th>
                <th className="p-3.5 text-right">Pauschale (0,30 €/km)</th>
                <th className="p-3.5 text-right pr-4 no-print">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 pl-4 font-semibold text-slate-900">
                    {formatDate(m.date)}
                  </td>
                  <td className="p-3.5">
                    {m.customerName ? (
                      <span className="font-semibold text-slate-800">{m.customerName}</span>
                    ) : (
                      <span className="text-slate-400 italic">Allgemein</span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="font-medium text-slate-800">{m.destination}</div>
                    <div className="text-[11px] text-slate-400">Start: {m.startLocation}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-800 font-medium">{m.purpose}</div>
                    {m.isReturnTrip && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                        <ArrowRightLeft className="w-2.5 h-2.5" /> Hin & Rückfahrt
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-900">
                    {m.kilometers} km
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-emerald-600 text-sm">
                    {formatCurrency(m.totalDeduction)}
                  </td>
                  <td className="p-3.5 text-right pr-4 no-print">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onEditMileage(m)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteMileage(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    Noch keine Dienstfahrten erfasst.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
