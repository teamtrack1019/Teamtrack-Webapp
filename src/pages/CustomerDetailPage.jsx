import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  Calendar, 
  Repeat, 
  Zap, 
  FileText, 
  Car, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Printer,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';
import { formatCurrency, formatDate, formatDateTime, getStatusBadge } from '../utils/formatters';

export default function CustomerDetailPage({ 
  customerId, 
  onBack, 
  onOpenDemoEmailModal, 
  onOpenServiceModal,
  onOpenInvoiceModal,
  onOpenMileageModal,
  onViewInvoice,
  onEditCustomer 
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('services'); // 'services', 'invoices', 'mileage', 'emails'

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomer(customerId);
      setData(res);
    } catch (err) {
      alert('Fehler beim Laden des Kunden: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      loadData();
    }
  }, [customerId]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Kundenprofil wird geladen...
      </div>
    );
  }

  const { customer, services, invoices, mileage, emailLogs } = data;
  const statusBadge = getStatusBadge(customer.status);

  // Separate services into Abos vs. Einmalig
  const abos = services.filter(s => s.type === 'abo');
  const einmalige = services.filter(s => s.type === 'einmalig');
  const totalMonthlyMRR = abos.filter(s => s.status === 'active').reduce((sum, s) => sum + Number(s.price || 0), 0);
  const totalOneTimeRevenue = einmalige.reduce((sum, s) => sum + Number(s.price || 0), 0);

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Möchtest du diese Leistung wirklich löschen?')) return;
    try {
      await api.deleteService(serviceId);
      loadData();
    } catch (err) {
      alert('Fehler beim Löschen: ' + err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-sm w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Zurück zur Kundenübersicht</span>
      </button>

      {/* Customer Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Main info */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                {statusBadge.label}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Erstellt am {formatDate(customer.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {customer.companyName}
            </h1>

            {customer.businessType && (
              <p className="text-sm font-semibold text-sky-700">
                Fokus: {customer.businessType}
              </p>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
              {customer.contactPerson && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">Ansprechpartner: {customer.contactPerson}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${customer.email}`} className="text-sky-600 hover:underline">{customer.email}</a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customer.address}</span>
                </div>
              )}
              {customer.taxNumber && (
                <div className="flex items-center gap-2 font-mono">
                  <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>USt-IdNr / Steuer: {customer.taxNumber}</span>
                </div>
              )}
            </div>

            {customer.notes && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 mt-2">
                <span className="font-semibold text-slate-900">Notiz: </span>
                {customer.notes}
              </div>
            )}
          </div>

          {/* Right: Actions & Marketing / Demo Email Badge */}
          <div className="flex flex-col space-y-3 lg:w-80 shrink-0">
            {/* DEMO / TANITIM EMAIL TRACKER BOX */}
            <div className={`p-4 rounded-2xl border ${customer.demoEmailSent ? 'bg-emerald-50/80 border-emerald-200' : 'bg-sky-50/80 border-sky-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-sky-600" />
                  Tanıtım / Demo Takibi
                </span>
              </div>

              {customer.demoEmailSent ? (
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 text-xs text-emerald-900 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div>Tanıtım E-Postası Gönderildi</div>
                      <div className="text-[11px] text-emerald-700 font-normal">
                        Tarih: {formatDateTime(customer.demoEmailSentAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenDemoEmailModal(customer)}
                    className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Weitere E-Mail senden / loggen
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600">
                    Henüz tanıtım/demo maili gönderilmedi.
                  </p>
                  <button
                    onClick={() => onOpenDemoEmailModal(customer)}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Tanıtım E-Postası Gönder</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => onEditCustomer(customer)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Bearbeiten</span>
              </button>
              <button
                onClick={() => onOpenInvoiceModal(customer.id)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>+ Rechnung</span>
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-sky-50/60 p-3 rounded-2xl border border-sky-100">
            <div className="text-[11px] text-sky-700 font-semibold uppercase flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5" />
              Laufendes Abo (MRR)
            </div>
            <div className="text-lg font-extrabold text-sky-950 mt-1">
              {formatCurrency(totalMonthlyMRR)} <span className="text-xs font-medium text-sky-700">/ Monat</span>
            </div>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
            <div className="text-[11px] text-emerald-700 font-semibold uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Einmalige Leistungen
            </div>
            <div className="text-lg font-extrabold text-emerald-950 mt-1">
              {formatCurrency(totalOneTimeRevenue)}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-semibold uppercase flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Rechnungen
            </div>
            <div className="text-lg font-extrabold text-slate-800 mt-1">
              {invoices.length} <span className="text-xs font-medium text-slate-500">gestellt</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-semibold uppercase flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              Gefahrene KM
            </div>
            <div className="text-lg font-extrabold text-slate-800 mt-1">
              {mileage.reduce((s, m) => s + Number(m.kilometers || 0), 0).toFixed(1)} <span className="text-xs font-medium text-slate-500">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Customer Detail Sub-sections */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveSubTab('services')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
            activeSubTab === 'services'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Leistungen & Verträge (Abo vs. Einmalig) ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('invoices')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
            activeSubTab === 'invoices'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ausgangsrechnungen ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mileage')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
            activeSubTab === 'mileage'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Dienstfahrten / KM ({mileage.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('emails')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 ${
            activeSubTab === 'emails'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>E-Mail Historie ({emailLogs.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: SERVICES (ABO VS EINMALIG) */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Leistungen & Preismodelle</h3>
              <p className="text-xs text-slate-500">Monatliche Abonnements und einmalige Optimierungsprojekte</p>
            </div>
            <button
              onClick={() => onOpenServiceModal(customer.id, customer.companyName)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Neue Leistung / Abo hinzufügen</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: ABONNEMENTS (Wiederkehrend) */}
            <div className="bg-white rounded-2xl border border-sky-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Monatliche Abonnements (Abos)</h4>
                    <p className="text-xs text-slate-500">Laufende Wartung, Cloud-Hosting & WebApp Lizenzen</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                  {abos.length} Abo(s)
                </span>
              </div>

              <div className="space-y-3">
                {abos.map((abo) => (
                  <div key={abo.id} className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50/50 transition flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          abo.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {abo.status === 'active' ? 'Aktiv' : 'Pausiert/Gekündigt'}
                        </span>
                        <h5 className="font-bold text-sm text-slate-900 mt-1">{abo.title}</h5>
                        {abo.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{abo.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-sky-600">
                          {formatCurrency(abo.price)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          pro {abo.billingInterval === 'monthly' ? 'Monat' : abo.billingInterval}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Vertragsbeginn: <strong>{formatDate(abo.startDate)}</strong></span>
                      </div>
                      <button
                        onClick={() => handleDeleteService(abo.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {abos.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Keine aktiven Abonnements eingetragen.
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: EINMALIGE LEISTUNGEN */}
            <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Einmalige Leistungen</h4>
                    <p className="text-xs text-slate-500">Digitalisierungs-Setup, Prozess-Optimierung, Initial-Entwicklung</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {einmalige.length} Leistung(en)
                </span>
              </div>

              <div className="space-y-3">
                {einmalige.map((srv) => (
                  <div key={srv.id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 transition flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          srv.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {srv.status === 'completed' ? 'Erledigt' : 'In Arbeit'}
                        </span>
                        <h5 className="font-bold text-sm text-slate-900 mt-1">{srv.title}</h5>
                        {srv.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{srv.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-emerald-600">
                          {formatCurrency(srv.price)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Einmalig
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Datum / Erledigt: <strong>{formatDate(srv.startDate)}</strong></span>
                      </div>
                      <button
                        onClick={() => handleDeleteService(srv.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {einmalige.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Keine einmaligen Leistungen eingetragen.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ausgangsrechnungen für {customer.companyName}</h3>
              <p className="text-xs text-slate-500">Alle gestellten Rechnungen mit PDF-Vorschau</p>
            </div>
            <button
              onClick={() => onOpenInvoiceModal(customer.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Rechnung schreiben</span>
            </button>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="p-3">Rechnungs-Nr.</th>
                <th className="p-3">Datum</th>
                <th className="p-3">Fällig</th>
                <th className="p-3 text-right">Netto</th>
                <th className="p-3 text-right">Brutto</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="p-3 text-slate-600">{formatDate(inv.date)}</td>
                  <td className="p-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                  <td className="p-3 text-right font-medium text-slate-600">{formatCurrency(inv.netAmount)}</td>
                  <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(inv.grossAmount)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {inv.status === 'paid' ? 'Bezahlt' : 'Offen'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onViewInvoice(inv)}
                      className="px-3 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg font-semibold transition"
                    >
                      PDF Anzeigen
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Noch keine Rechnungen für diesen Kunden erstellt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 3: MILEAGE */}
      {activeSubTab === 'mileage' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Dienstfahrten zu {customer.companyName}</h3>
              <p className="text-xs text-slate-500">0,30 €/km Finanzamt-Fahrtenbuch Einträge</p>
            </div>
            <button
              onClick={() => onOpenMileageModal(customer.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Fahrt eintragen</span>
            </button>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="p-3">Datum</th>
                <th className="p-3">Start → Ziel</th>
                <th className="p-3">Anlass / Reisezweck</th>
                <th className="p-3 text-center">Distanz (km)</th>
                <th className="p-3 text-right">Finanzamt Abzug</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mileage.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-900">{formatDate(m.date)}</td>
                  <td className="p-3 text-slate-600">{m.startLocation} → {m.destination}</td>
                  <td className="p-3 text-slate-700">{m.purpose}</td>
                  <td className="p-3 text-center font-bold text-slate-900">{m.kilometers} km</td>
                  <td className="p-3 text-right font-extrabold text-emerald-600">{formatCurrency(m.totalDeduction)}</td>
                </tr>
              ))}
              {mileage.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Keine Fahrten zu diesem Kunden hinterlegt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 4: EMAIL LOGS */}
      {activeSubTab === 'emails' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Versendete Tanıtım & Demo E-Postaları</h3>
              <p className="text-xs text-slate-500">Historie aller E-Mails an diesen Kunden mit Zeitstempel</p>
            </div>
            <button
              onClick={() => onOpenDemoEmailModal(customer)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              <Mail className="w-4 h-4" />
              <span>+ Neue E-Mail erfassen</span>
            </button>
          </div>

          <div className="space-y-3">
            {emailLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-600" />
                    <span>{log.subject}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {formatDateTime(log.sentAt)}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Empfänger: <span className="font-mono text-slate-700">{log.recipientEmail}</span>
                </div>
                <pre className="text-xs font-sans text-slate-700 whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200">
                  {log.body}
                </pre>
              </div>
            ))}
            {emailLogs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Noch keine E-Mails protokolliert.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
