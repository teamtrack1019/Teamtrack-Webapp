import React from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Receipt, 
  Car, 
  Landmark, 
  Repeat, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  Sparkles,
  Bell
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function DashboardPage({ 
  stats = {}, 
  customers = [],
  invoices = [],
  onNavigate, 
  onOpenCustomerModal, 
  onOpenInvoiceModal, 
  onSelectCustomer,
  onBulkGenerateAbos 
}) {
  const safeStats = stats || {};
  const recentInvoicesList = (safeStats.recentInvoices && safeStats.recentInvoices.length > 0)
    ? safeStats.recentInvoices
    : (invoices || []).slice(-10).reverse();

  const recentCustomersList = (safeStats.recentCustomers && safeStats.recentCustomers.length > 0)
    ? safeStats.recentCustomers
    : (customers || []).slice(-10).reverse();

  const totalCustomersCount = safeStats.totalCustomers || (customers ? customers.length : 0);
  const estimatedYearlyProfit = (safeStats.totalPaidRevenue || 0) - (safeStats.totalExpenses || 0) - (safeStats.totalKmDeduction || 0);

  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const currentMonthName = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 md:p-8 rounded-3xl text-white shadow-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>Softwareentwicklung & IT-Beratung</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Willkommen bei TeamTrack
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Kundenverwaltung, monatliche Abos, Einmalleistungen, Rechnungswesen und Finanzamt-Fahrtenbuch.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
          <button
            onClick={onOpenCustomerModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-sky-600/30"
          >
            <Users className="w-4 h-4" />
            <span>+ Neuer Kunde</span>
          </button>
          <button
            onClick={onOpenInvoiceModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition shadow-md"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>+ Rechnung</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Monatliche Abos (MRR)"
          value={formatCurrency(safeStats.mrr || 0)}
          subtitle={`${safeStats.activeAbosCount || 0} aktive Verträge`}
          icon={Repeat}
          color="sky"
          badge="Wiederkehrend"
          badgeColor="bg-sky-100 text-sky-800"
          onClick={() => onNavigate('customers')}
        />

        <StatCard
          title="Einnahmen (Netto)"
          value={formatCurrency(safeStats.totalPaidRevenue || 0)}
          subtitle={`Brutto: ${formatCurrency(safeStats.totalGrossRevenue || 0)}`}
          icon={TrendingUp}
          color="emerald"
          badge="Umsatz"
          badgeColor="bg-emerald-100 text-emerald-800"
          onClick={() => onNavigate('invoices')}
        />

        <StatCard
          title="Ausgaben (Netto)"
          value={formatCurrency(safeStats.totalExpenses || 0)}
          subtitle={`Brutto: ${formatCurrency(safeStats.totalExpensesGross || 0)}`}
          icon={Receipt}
          color="amber"
          badge="Ausgaben"
          badgeColor="bg-amber-100 text-amber-800"
          onClick={() => onNavigate('expenses')}
        />

        <StatCard
          title="Finanzamt KM-Abzug"
          value={formatCurrency(safeStats.totalKmDeduction || 0)}
          subtitle={`${safeStats.totalKm ? Number(safeStats.totalKm).toFixed(1) : '0.0'} km (0,30 €/km)`}
          icon={Car}
          color="purple"
          badge="Fahrtenbuch"
          badgeColor="bg-purple-100 text-purple-800"
          onClick={() => onNavigate('mileage')}
        />
      </div>

      {/* 2 COMPLETELY SEPARATE NOTIFICATION PANELS: 1 FOR ABOS, 1 FOR EINMALIGE LEISTUNGEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* NOTIFICATION PANEL 1: MONATLICHE ABONNEMENTS */}
        {(() => {
          const unbilledAbos = safeStats.unbilledAbosCount || 0;
          return (
            <div className={`rounded-3xl p-5 md:p-6 border-2 shadow-sm flex flex-col justify-between gap-5 transition-all ${
              unbilledAbos > 0
                ? 'bg-gradient-to-br from-amber-50 via-sky-50 to-indigo-50 border-sky-400 shadow-sky-500/10'
                : 'bg-gradient-to-br from-slate-50 to-sky-50/30 border-slate-200'
            }`}>
              <div className="flex items-start space-x-3.5">
                <div className={`p-3 rounded-2xl shrink-0 shadow-md ${
                  unbilledAbos > 0 
                    ? 'bg-sky-600 text-white shadow-sky-600/30' 
                    : 'bg-slate-700 text-white shadow-slate-700/20'
                }`}>
                  {unbilledAbos > 0 ? (
                    <Repeat className="w-6 h-6 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      unbilledAbos > 0
                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {unbilledAbos > 0 ? '🔔 1. MONATLICHE ABOS' : '✓ 1. ABOS AKTUELL'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold truncate">
                      {currentMonthName} {currentYear}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base md:text-lg mt-1.5 leading-snug">
                    {unbilledAbos > 0
                      ? `${unbilledAbos} aktive(s) Kunden-Abo(s) fällig`
                      : `Alle Abos (${safeStats.activeAbosCount || 0}) abgerechnet`}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {unbilledAbos > 0
                      ? 'Laufende monatliche Betreuungsverträge für diesen Monat warten auf Rechnungsstellung.'
                      : 'Super! Für alle laufenden Verträge wurden in diesem Monat bereits die Rechnungen gestellt.'}
                  </p>
                </div>
              </div>

              {unbilledAbos > 0 && onBulkGenerateAbos && (
                <button
                  onClick={() => onBulkGenerateAbos('abo')}
                  className="w-full sm:w-auto self-end px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-sky-200" />
                  <span>⚡ Nur fällige Abos abrechnen</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* NOTIFICATION PANEL 2: EINMALIGE LEISTUNGEN */}
        {(() => {
          const unbilledEinmalige = safeStats.unbilledEinmaligeCount || 0;
          return (
            <div className={`rounded-3xl p-5 md:p-6 border-2 shadow-sm flex flex-col justify-between gap-5 transition-all ${
              unbilledEinmalige > 0
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 border-emerald-500 shadow-emerald-500/10'
                : 'bg-gradient-to-br from-slate-50 to-emerald-50/20 border-slate-200'
            }`}>
              <div className="flex items-start space-x-3.5">
                <div className={`p-3 rounded-2xl shrink-0 shadow-md ${
                  unbilledEinmalige > 0 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                    : 'bg-slate-700 text-white shadow-slate-700/20'
                }`}>
                  {unbilledEinmalige > 0 ? (
                    <Zap className="w-6 h-6 text-yellow-300 animate-bounce" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      unbilledEinmalige > 0
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {unbilledEinmalige > 0 ? '🔔 2. EINMALIGE LEISTUNGEN' : '✓ 2. LEISTUNGEN AKTUELL'}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base md:text-lg mt-1.5 leading-snug">
                    {unbilledEinmalige > 0
                      ? `${unbilledEinmalige} erledigte Einmalleistung(en) fällig`
                      : `Alle erledigten Einmalleistungen (${safeStats.completedEinmaligeCount || safeStats.totalEinmaligeCount || 0}) abgerechnet`}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {unbilledEinmalige > 0
                      ? 'Abgeschlossene Digitalisierungs- & Setup-Projekte warten auf Rechnungsstellung.'
                      : 'Klasse! Es gibt derzeit keine offenen Einmalleistungen ohne gestellte Rechnung.'}
                  </p>
                </div>
              </div>

              {unbilledEinmalige > 0 && onBulkGenerateAbos && (
                <button
                  onClick={() => onBulkGenerateAbos('einmalig')}
                  className="w-full sm:w-auto self-end px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>⚡ Nur Einmalleistungen sofort abrechnen</span>
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Main Grid: Left Side (Invoices) vs Right Side (Finanzamt & Customers) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Columns Width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Invoices Banner */}
          {safeStats.pendingInvoicesCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">
                    {safeStats.pendingInvoicesCount} offene Rechnung(en) ausstehend
                  </h4>
                  <p className="text-xs text-amber-700">
                    Offener Gesamtbetrag: <strong className="font-bold">{formatCurrency(safeStats.totalPendingAmount)}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('invoices')}
                className="px-3.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition self-start sm:self-auto shadow-sm"
              >
                Rechnungen →
              </button>
            </div>
          )}

          {/* Recent Invoices Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Neueste Ausgangsrechnungen</h3>
                <p className="text-xs text-slate-500">Zuletzt erstellte Kundenrechnungen</p>
              </div>
              <button
                onClick={() => onNavigate('invoices')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Alle</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5 w-32">Rechnungs-Nr.</th>
                    <th className="p-3.5">Kunde</th>
                    <th className="p-3.5 w-28">Datum</th>
                    <th className="p-3.5 text-right w-28">Betrag</th>
                    <th className="p-3.5 text-center pr-5 w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoicesList && recentInvoicesList.length > 0 ? (
                    recentInvoicesList.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-800">
                          {inv.invoiceNumber}
                        </td>
                        <td className="p-3.5 font-medium text-slate-800">
                          {inv.customerName}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {formatDate(inv.date)}
                        </td>
                        <td className="p-3.5 text-right font-extrabold text-slate-900">
                          {formatCurrency(inv.grossAmount)}
                        </td>
                        <td className="p-3.5 text-center pr-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            inv.status === 'paid' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : inv.status === 'sent' 
                              ? 'bg-sky-100 text-sky-800' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {inv.status === 'paid' ? 'Bezahlt' : inv.status === 'sent' ? 'Offen' : 'Entwurf'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Noch keine Rechnungen vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Column Width) */}
        <div className="space-y-6">
          {/* Finanzamt EÜR Vorschau Box */}
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-sm text-white">Finanzamt EÜR</h4>
              </div>
              <span className="text-[10px] font-semibold bg-white/10 px-2 py-0.5 rounded text-sky-200">
                Laufendes Jahr
              </span>
            </div>

            <div className="space-y-2 text-xs border-y border-white/10 py-3 my-3">
              <div className="flex justify-between text-slate-300">
                <span>Einnahmen (Netto):</span>
                <span className="font-semibold text-white font-mono">{formatCurrency(safeStats.totalPaidRevenue || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Ausgaben (Netto):</span>
                <span className="font-semibold text-rose-300 font-mono">- {formatCurrency(safeStats.totalExpenses || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>KM-Pauschale Abzug:</span>
                <span className="font-semibold text-emerald-300 font-mono">- {formatCurrency(safeStats.totalKmDeduction || 0)}</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-300">Reingewinn:</span>
                <span className={`text-base font-black font-mono ${estimatedYearlyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(estimatedYearlyProfit)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('tax-report')}
              className="mt-4 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/30"
            >
              <span>Jahresbericht & Steuer-PDF</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Customers Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Aktuelle Kunden</h4>
              <button
                onClick={() => onNavigate('customers')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                Alle ({totalCustomersCount})
              </button>
            </div>

            <div className="space-y-2">
              {recentCustomersList && recentCustomersList.length > 0 ? (
                recentCustomersList.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCustomer(c.id)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{c.companyName}</div>
                      <div className="text-[11px] text-slate-500">{c.contactPerson || c.businessType}</div>
                    </div>
                    {c.demoEmailSent ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Demo Mail
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        Kein Mail
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-3">
                  Noch keine Kunden angelegt.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
