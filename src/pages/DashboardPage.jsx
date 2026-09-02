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
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function DashboardPage({ 
  stats = {}, 
  onNavigate, 
  onOpenCustomerModal, 
  onOpenInvoiceModal, 
  onOpenMileageModal,
  onOpenExpenseModal,
  onSelectCustomer 
}) {
  const safeStats = stats || {};
  const estimatedYearlyProfit = (safeStats.totalPaidRevenue || 0) - (safeStats.totalExpenses || 0) - (safeStats.totalKmDeduction || 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Welcome & Quick Pitch Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10 border border-slate-700/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold mb-3 border border-sky-500/30">
            <Zap className="w-3.5 h-3.5" />
            Papierkram Digitalisierung & WebApps
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Willkommen bei TeamTrack
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Deine zentrale Schaltzentrale für Kundenverwaltung, monatliche Abos, Einmalleistungen, Ausgangs- & Eingangsrechnungen und Finanzamt-Fahrtenbuch.
          </p>
        </div>

        {/* Action Buttons in Hero */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenCustomerModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-sky-600/30"
          >
            <Users className="w-4 h-4" />
            <span>Neuer Kunde</span>
          </button>
          <button
            onClick={onOpenInvoiceModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition shadow-md"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Rechnung schreiben</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card (Monthly Recurring Revenue) */}
        <StatCard
          title="Monatliche Abos (MRR)"
          value={formatCurrency(safeStats.mrr || 0)}
          subtitle={`${safeStats.activeAbosCount || 0} aktive monatliche Kundenverträge`}
          icon={Repeat}
          color="sky"
          badge="Wiederkehrend"
          badgeColor="bg-sky-100 text-sky-800"
          onClick={() => onNavigate('customers')}
        />

        {/* Paid Revenue */}
        <StatCard
          title="Einnahmen (Bezahlt Netto)"
          value={formatCurrency(safeStats.totalPaidRevenue || 0)}
          subtitle={`Brutto: ${formatCurrency(safeStats.totalGrossRevenue || 0)}`}
          icon={TrendingUp}
          color="emerald"
          badge="Umsatz"
          badgeColor="bg-emerald-100 text-emerald-800"
          onClick={() => onNavigate('invoices')}
        />

        {/* Expenses */}
        <StatCard
          title="Betriebsausgaben (Netto)"
          value={formatCurrency(safeStats.totalExpenses || 0)}
          subtitle={`Brutto: ${formatCurrency(safeStats.totalExpensesGross || 0)}`}
          icon={Receipt}
          color="amber"
          badge="Ausgaben"
          badgeColor="bg-amber-100 text-amber-800"
          onClick={() => onNavigate('expenses')}
        />

        {/* Mileage Pauschale */}
        <StatCard
          title="Finanzamt KM-Abzug"
          value={formatCurrency(safeStats.totalKmDeduction || 0)}
          subtitle={`${safeStats.totalKm ? Number(safeStats.totalKm).toFixed(1) : '0.0'} km gefahren (0,30 €/km)`}
          icon={Car}
          color="purple"
          badge="Fahrtenbuch"
          badgeColor="bg-purple-100 text-purple-800"
          onClick={() => onNavigate('mileage')}
        />
      </div>

      {/* Secondary Quick Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Invoices & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Open / Pending Invoices Alert */}
          {safeStats.pendingInvoicesCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">
                    {safeStats.pendingInvoicesCount} offene Rechnung(en) ausstehend
                  </h4>
                  <p className="text-xs text-amber-700">
                    Gesamtbetrag offen: <span className="font-bold">{formatCurrency(safeStats.totalPendingAmount)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('invoices')}
                className="px-3.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-semibold transition"
              >
                Zur Rechnungsliste →
              </button>
            </div>
          )}

          {/* Recent Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Neueste Ausgangsrechnungen</h3>
                <p className="text-xs text-slate-500">Zuletzt erstellte Kundenrechnungen</p>
              </div>
              <button
                onClick={() => onNavigate('invoices')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                Alle anzeigen <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3 pl-5">Rechnungs-Nr.</th>
                    <th className="p-3">Kunde</th>
                    <th className="p-3">Datum</th>
                    <th className="p-3 text-right">Betrag (Brutto)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeStats.recentInvoices && safeStats.recentInvoices.length > 0 ? (
                    safeStats.recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 pl-5 font-mono font-semibold text-slate-800">
                          {inv.invoiceNumber}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {inv.customerName}
                        </td>
                        <td className="p-3 text-slate-500">
                          {formatDate(inv.date)}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {formatCurrency(inv.grossAmount)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
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
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        Noch keine Rechnungen vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Profit Preview & Tax Box & Recent Customers */}
        <div className="space-y-6">
          {/* Vorläufiges Betriebsergebnis / EÜR Preview */}
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-sky-400" />
                <h4 className="font-bold text-sm">Finanzamt EÜR Vorschau</h4>
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-sky-200">
                Laufendes Jahr
              </span>
            </div>

            <div className="space-y-2 text-xs border-y border-white/10 py-3 my-3">
              <div className="flex justify-between text-slate-300">
                <span>Einnahmen (Netto):</span>
                <span className="font-semibold text-white">{formatCurrency(safeStats.totalPaidRevenue || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Ausgaben (Netto):</span>
                <span className="font-semibold text-rose-300">- {formatCurrency(safeStats.totalExpenses || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>KM-Pauschale Abzug:</span>
                <span className="font-semibold text-emerald-300">- {formatCurrency(safeStats.totalKmDeduction || 0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs text-slate-300 font-medium">Vorl. Reingewinn:</span>
              <span className="text-xl font-extrabold text-emerald-400">
                {formatCurrency(estimatedYearlyProfit)}
              </span>
            </div>

            <button
              onClick={() => onNavigate('tax-report')}
              className="w-full mt-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Jahresbericht & Steuer-PDF</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Customers Mini List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 text-sm">Aktuelle Kunden</h4>
              <button
                onClick={() => onNavigate('customers')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                Alle ({safeStats.totalCustomers || 0})
              </button>
            </div>

            <div className="space-y-2.5">
              {safeStats.recentCustomers && safeStats.recentCustomers.length > 0 ? (
                safeStats.recentCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCustomer(c.id)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{c.companyName}</div>
                      <div className="text-[11px] text-slate-500">{c.contactPerson || c.businessType}</div>
                    </div>
                    {c.demoEmailSent ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
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
                <div className="text-xs text-slate-400 text-center py-4">
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
