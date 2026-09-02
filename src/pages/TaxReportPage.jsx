import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Printer, 
  Calendar, 
  TrendingUp, 
  Receipt, 
  Car, 
  Download,
  Loader2,
  CheckCircle2, 
  ShieldCheck,
  Building2,
  Euro
} from 'lucide-react';
import { api } from '../api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadTaxReportPdf } from '../utils/pdfGenerator';

export default function TaxReportPage() {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadReport = async (year) => {
    try {
      setLoading(true);
      const data = await api.getTaxReport(year);
      setReportData(data);
    } catch (err) {
      alert('Fehler beim Laden des Steuerberichts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(selectedYear);
  }, [selectedYear]);

  // 1-Click native PDF Download
  const handleDownloadPdf = () => {
    if (!reportData) return;
    try {
      setIsDownloading(true);
      downloadTaxReportPdf(reportData);
    } catch (err) {
      console.error('Tax PDF error:', err);
      alert('Fehler: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !reportData) {
    return (
      <div className="p-8 text-center text-slate-500">
        Finanzamt-Jahresbericht wird berechnet...
      </div>
    );
  }

  const { revenue, expenses, mileage, summary, company } = reportData;
  const totalRevenue = Number(revenue.gross || revenue.net || 0);
  const totalExpenses = Number(expenses.gross || expenses.net || 0);
  const totalMileage = Number(mileage.totalDeduction || 0);
  const netProfit = Number((totalRevenue - totalExpenses - totalMileage).toFixed(2));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Landmark className="w-7 h-7 text-sky-600" />
              <span>Finanzamt & EÜR Jahresbericht</span>
            </h2>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              § 19 UStG Kleinunternehmer
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Sene sonu Steuerberater ve Finanzamt için resmi EÜR (Einnahmen-Überschuss-Rechnung) raporu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Year Selector */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="2026">Steuerjahr 2026</option>
              <option value="2025">Steuerjahr 2025</option>
              <option value="2024">Steuerjahr 2024</option>
            </select>
          </div>

          {/* 1-Click PDF File Download */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
            title="Bericht direkt als PDF-Datei herunterladen"
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

          {/* Separate Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Drucken</span>
          </button>
        </div>
      </div>

      {/* Printable Official German EÜR Tax Document */}
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12 space-y-8 text-slate-800" 
        id="printable-tax-report"
      >
        {/* Document Header */}
        <div className="border-b border-slate-300 pb-6 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>EÜR nach § 4 Abs. 3 EStG • Kleinunternehmer gem. § 19 UStG</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Einnahmen-Überschuss-Rechnung {selectedYear}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Erstellt am: {formatDate(new Date().toISOString())} mit TeamTrack
            </p>
          </div>

          {/* Company Legal Meta */}
          <div className="text-right text-xs space-y-0.5 text-slate-600">
            <div className="font-bold text-slate-900 text-sm">{company?.companyName}</div>
            <div>Inhaber: {company?.ownerName}</div>
            <div>{company?.address}</div>
            <div className="font-mono mt-1">Steuernummer: <strong>{company?.taxNumber || '-'}</strong></div>
            <div className="text-emerald-700 font-semibold mt-0.5">Status: Kleinunternehmer (§ 19 UStG)</div>
          </div>
        </div>

        {/* Big Profit & Loss Highlight Box */}
        <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Betriebseinnahmen (Gesamt)</div>
              <div className="text-2xl font-black text-white">{formatCurrency(totalRevenue)}</div>
              <div className="text-[11px] text-sky-300">{revenue.invoicesCount} bezahlte Rechnungen (ohne USt.)</div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Betriebsausgaben + KM-Abzug</div>
              <div className="text-2xl font-black text-rose-300">
                - {formatCurrency(totalExpenses + totalMileage)}
              </div>
              <div className="text-[11px] text-slate-400">Ausgaben: {formatCurrency(totalExpenses)} | KM: {formatCurrency(totalMileage)}</div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Steuerlicher Reingewinn</div>
              <div className="text-3xl font-black text-emerald-400">{formatCurrency(netProfit)}</div>
              <div className="text-[11px] text-emerald-200 font-semibold">Zu versteuernder EÜR-Überschuss</div>
            </div>
          </div>
        </div>

        {/* SECTION 1: BETRIEBSEINNAHMEN */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>1. Betriebseinnahmen (Erlöse aus Lieferungen und Leistungen)</span>
          </h3>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Summe aller Kundenerlöse (Zahlungseingänge):</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Vereinnahmte Umsatzsteuer (§ 19 UStG befreit):</span>
              <span className="font-mono font-semibold text-slate-500">0,00 € (0%)</span>
            </div>
            <div className="flex justify-between py-1 font-bold text-slate-900 text-sm">
              <span>Gesamte Betriebseinnahmen:</span>
              <span className="font-mono text-emerald-700">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: BETRIEBSAUSGABEN NACH KATEGORIEN */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-600" />
            <span>2. Betriebsausgaben (Eingehende Belege als Betriebskosten)</span>
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-y border-slate-200">
              <tr>
                <th className="p-2.5">Ausgabenkategorie</th>
                <th className="p-2.5 text-center">Anzahl Belege</th>
                <th className="p-2.5 text-right">Steuerlich abzugsfähig (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.entries(expenses.byCategory || {}).map(([cat, data]) => (
                <tr key={cat} className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium text-slate-900">{cat}</td>
                  <td className="p-2.5 text-center text-slate-500">{data.count}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(data.gross || data.net)}
                  </td>
                </tr>
              ))}
              {Object.keys(expenses.byCategory || {}).length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-400">Keine Ausgaben in diesem Jahr.</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
              <tr>
                <td className="p-2.5">Zwischensumme Betriebsausgaben:</td>
                <td className="p-2.5 text-center">{expenses.count}</td>
                <td className="p-2.5 text-right font-mono text-rose-700">{formatCurrency(totalExpenses)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* SECTION 3: KM-PAUSCHALE / FAHRTENBUCH */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-600" />
            <span>3. Kilometerpauschale / Reisekosten (§ 9 Abs. 1 Nr. 4a EStG)</span>
          </h3>

          <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-emerald-200/60">
              <span className="text-slate-700">Betrieblich veranlasste Dienstreisen:</span>
              <span className="font-semibold text-slate-900">{mileage.tripsCount} Fahrten</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-200/60">
              <span className="text-slate-700">Gesamte Fahrtstrecke im Steuerjahr:</span>
              <span className="font-mono font-bold text-slate-900">{mileage.totalKm} km</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-200/60">
              <span className="text-slate-700">Gesetzliche Pauschale pro Kilometer:</span>
              <span className="font-mono font-semibold text-slate-900">0,30 € / km</span>
            </div>
            <div className="flex justify-between py-1 font-bold text-slate-900 text-sm">
              <span>Steuerlicher Betriebsausgabenabzug (KM-Pauschale):</span>
              <span className="font-mono text-emerald-700 text-base">{formatCurrency(totalMileage)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: UMSATZSTEUER-STATUS (§ 19 UStG) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Euro className="w-4 h-4 text-sky-600" />
            <span>4. Umsatzsteuer-Erklärung & Status (§ 19 UStG)</span>
          </h3>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 leading-relaxed font-medium">
              "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet und abgeführt (Kleinunternehmerregelung). Es besteht keine Umsatzsteuerzahllast und kein Vorsteuerabzugsanspruch gegenüber dem Finanzamt."
            </div>
            <div className="flex justify-between py-1 font-bold text-slate-900 text-sm">
              <span>Zahllast an das Finanzamt (USt.):</span>
              <span className="font-mono text-emerald-700 text-base">0,00 € (Befreit)</span>
            </div>
          </div>
        </div>

        {/* Legal Signatures / Footer */}
        <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-12 text-xs text-slate-500">
          <div>
            <p className="mb-8">Ort, Datum: Berlin, den {formatDate(new Date().toISOString())}</p>
            <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
              Unterschrift Geschäftsinhaber
            </div>
          </div>

          <div>
            <p className="mb-8">Prüfung Steuerberater / Buchhaltung:</p>
            <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
              Stempel / Unterschrift Steuerberater
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
