import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  FileText, 
  Car, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Repeat, 
  Zap, 
  Calendar, 
  ArrowLeft,
  DollarSign,
  Send,
  Eye,
  CreditCard,
  Receipt,
  ChevronDown,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Bell,
  Trello
} from 'lucide-react';
import { api } from '../api';
import { formatCurrency, formatDate, formatDateTime, getOfferReminderStatus, getLeadSourceBadge } from '../utils/formatters';
import { generateOfferPDF } from '../utils/pdfGenerator';

export default function CustomerDetailPage({
  customerId,
  refreshKey = 0,
  onBack,
  onOpenDemoEmailModal,
  onOpenServiceModal,
  onEditService,
  onOpenInvoiceModal,
  onOpenMileageModal,
  onNavigateToDisposition,
  onViewInvoice,
  onEditCustomer,
  onReloadAllData
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('services'); // 'services', 'invoices', 'mileage', 'emails'
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomer(customerId);
      setData(res);
    } catch (err) {
      alert('Fehler beim Laden der Kundendaten: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      loadData();
    }
  }, [customerId, refreshKey]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Kundenprofil wird geladen...
      </div>
    );
  }

  const { customer, services, invoices, offers = [], mileage, emailLogs, dispositions = [] } = data;

  // Separate services into Abos vs. Einmalig
  const abos = services.filter(s => s.type === 'abo');
  const einmalige = services.filter(s => s.type === 'einmalig');
  const totalMonthlyMRR = abos.filter(s => s.status === 'active').reduce((sum, s) => sum + Number(s.price || 0), 0);
  const totalOneTimeRevenue = einmalige.filter(s => s.status !== 'cancelled').reduce((sum, s) => sum + Number(s.price || 0), 0);

  // Dynamic automatic status: Has services/invoices -> Active, 0 services/invoices -> Lead
  const hasJobs = (abos.length > 0 || einmalige.length > 0 || (invoices && invoices.length > 0));
  const effectiveStatus = hasJobs ? 'active' : 'lead';
  const statusBadge = getStatusBadge(effectiveStatus);

  const handleDeleteService = async (serviceId) => {
    try {
      await api.deleteService(serviceId);
      setDeletingServiceId(null);
      await loadData();
      if (onReloadAllData) {
        await onReloadAllData();
      }
    } catch (err) {
      alert('Fehler beim Löschen: ' + err.message);
    }
  };

  const handleQuickStatusChange = async (service, newStatus) => {
    try {
      await api.updateService(service.id, { ...service, status: newStatus });
      await loadData();
      if (onReloadAllData) {
        await onReloadAllData();
      }
    } catch (err) {
      alert('Fehler beim Ändern des Status: ' + err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-sm w-fit cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Zurück zur Kundenübersicht</span>
      </button>

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Customer Info */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 text-white rounded-2xl">
                <Building2 className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900">
                    {customer.companyName}
                  </h1>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                    {statusBadge.label}
                  </span>
                  {customer.leadSource && (() => {
                    const badge = getLeadSourceBadge(customer.leadSource);
                    if (!badge) return null;
                    return (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg} ${badge.text} ${badge.border}`}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}
                </div>
                {customer.businessType && (
                  <p className="text-xs text-sky-700 font-semibold mt-0.5">
                    {customer.businessType}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2">
              {customer.contactPerson && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customer.contactPerson}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${customer.email}`} className="text-sky-600 hover:underline">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customer.address}</span>
                </div>
              )}
              {customer.taxNumber && (
                <div className="flex items-center space-x-2 sm:col-span-2">
                  <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Steuer-Nr. / USt-IdNr.: <strong className="text-slate-800">{customer.taxNumber}</strong></span>
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

          {/* Right: Actions & Marketing / Demo Email & Offer Status Badges */}
          <div className="flex flex-col space-y-3 lg:w-80 shrink-0">
            {/* OFFER / KOSTENVORANSCHLAG TRACKER BOX & 3-DAY REMINDER */}
            {(() => {
              const hasOffer = customer.offerEmailSent || customer.lastOffer || offers.length > 0;
              if (!hasOffer) return null;

              const reminder = getOfferReminderStatus(customer);
              const isKV = (customer.offerEmailType || customer.lastOffer?.type || offers[0]?.type) === 'kostenvoranschlag';

              return (
                <div className="space-y-2">
                  {/* 3-DAY REMINDER ALERT (RED) */}
                  {reminder && reminder.shouldAlert && (
                    <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3.5 space-y-2.5 text-xs shadow-sm animate-fadeIn">
                      <div className="flex items-start gap-2 text-rose-950">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-0.5">
                          <span className="text-rose-900 font-black block text-xs">
                            {reminder.isExpired 
                              ? `Frist abgelaufen (${formatDate(reminder.validUntilDate)})`
                              : `Gültigkeit endet in ${reminder.diffDays === 0 ? 'heute' : reminder.diffDays === 1 ? '1 Tag' : `${reminder.diffDays} Tagen`}!`}
                          </span>
                          <p className="text-[11px] font-medium text-rose-700 leading-tight">
                            Noch keine Rückmeldung erhalten. Bitte Erinnerungs-Mail senden oder Kunde anrufen.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch gap-1.5 pt-1 border-t border-rose-200">
                        <button
                          type="button"
                          onClick={() => onOpenDemoEmailModal(customer, 'offer_reminder')}
                          className="flex-1 py-2 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Erinnerung senden (Vorlage 4)</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.setOfferCustomerResponded(customer.id, true);
                              await loadData();
                              if (onReloadAllData) await onReloadAllData();
                            } catch (e) {
                              alert('Fehler: ' + e.message);
                            }
                          }}
                          className="py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kunde hat sich gemeldet</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* GREEN RESPONDED BADGE */}
                  {reminder && reminder.hasResponded && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs font-semibold text-emerald-950">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Kunde hat sich gemeldet {reminder.respondedAt ? `(${formatDate(reminder.respondedAt)})` : ''}</span>
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.setOfferCustomerResponded(customer.id, false);
                            await loadData();
                            if (onReloadAllData) await onReloadAllData();
                          } catch (e) {
                            alert('Fehler: ' + e.message);
                          }
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-normal cursor-pointer"
                      >
                        Status ändern
                      </button>
                    </div>
                  )}

                  {/* Standard Offer Overview Card */}
                  <div className={`p-4 rounded-2xl border ${
                    isKV ? 'bg-amber-50/80 border-amber-200' : 'bg-sky-50/80 border-sky-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <FileSpreadsheet className={`w-4 h-4 ${isKV ? 'text-amber-600' : 'text-sky-600'}`} />
                        <span>{isKV ? 'Kostenvoranschlag' : 'Angebot'} Status</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isKV ? 'bg-amber-200/80 text-amber-900' : 'bg-sky-200/80 text-sky-900'
                      }`}>
                        Gesendet
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 space-y-1">
                      <div className="font-bold text-slate-900">
                        {customer.offerEmailNumber || customer.lastOffer?.offerNumber || offers[0]?.offerNumber || 'Dokument'}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Gesendet am: <span className="font-semibold text-slate-900">{formatDateTime(customer.offerEmailSentAt || customer.lastOffer?.sentAt || offers[0]?.createdAt)}</span>
                      </div>
                      {(customer.lastOffer?.validUntilDate || customer.offerValidUntilDate) && (
                        <div className="text-[11px] text-slate-600">
                          Gültig bis: <span className="font-semibold text-slate-900">{formatDate(customer.lastOffer?.validUntilDate || customer.offerValidUntilDate)}</span>
                        </div>
                      )}
                      {(customer.lastOffer?.totalAmount || offers[0]?.totalAmount) && (
                        <div className="text-[11px] text-slate-600">
                          Investition: <span className="font-bold text-slate-900">{formatCurrency(customer.lastOffer?.totalAmount || offers[0]?.totalAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* DEMO / EMAIL TRACKER BOX */}
            <div className={`p-4 rounded-2xl border ${customer.demoEmailSent ? 'bg-emerald-50/80 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  Vorstellungs-E-Mail Status
                </span>
              </div>

              {customer.demoEmailSent ? (
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 text-xs text-emerald-900 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div>Vorstellungs-E-Mail gesendet</div>
                      <div className="text-[11px] text-emerald-700 font-normal">
                        Datum: {formatDateTime(customer.demoEmailSentAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenDemoEmailModal(customer)}
                    className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Weitere E-Mail senden / erfassen
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600">
                    Noch keine Vorstellungs-E-Mail versendet.
                  </p>
                  <button
                    onClick={() => onOpenDemoEmailModal(customer)}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Vorstellungs-E-Mail senden</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => onEditCustomer(customer)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Bearbeiten</span>
              </button>
              <button
                onClick={() => onOpenInvoiceModal(customer.id)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
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
      <div className="flex border-b border-slate-200 space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('services')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'services'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Leistungen & Verträge ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('invoices')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'invoices'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ausgangsrechnungen ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('offers')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'offers'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Angebote & KV ({offers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dispositions')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'dispositions'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trello className="w-4 h-4" />
          <span>Aufträge & Kanban ({dispositions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mileage')}
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
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
          className={`pb-3 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Leistungen & Preismodelle</h3>
              <p className="text-xs text-slate-500">Monatliche Abonnements und einmalige Optimierungsprojekte</p>
            </div>
            <button
              onClick={() => onOpenServiceModal(customer.id, customer.companyName)}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer self-start sm:self-auto"
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
                  <div key={abo.id} className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50/50 transition flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        {/* Interactive Status Selector */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={abo.status || 'active'}
                            onChange={(e) => handleQuickStatusChange(abo, e.target.value)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                              abo.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                : abo.status === 'paused' 
                                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="active">🟢 Aktiv</option>
                            <option value="paused">⏸️ Pausiert</option>
                            <option value="cancelled">🚫 Gekündigt</option>
                          </select>
                        </div>

                        <h5 
                          onClick={() => onEditService && onEditService(abo)}
                          className="font-bold text-sm text-slate-900 hover:text-sky-600 transition cursor-pointer"
                        >
                          {abo.title}
                        </h5>
                        {abo.description && (
                          <p className="text-xs text-slate-500">{abo.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-sky-600">
                          {formatCurrency(abo.price)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          pro {abo.billingInterval === 'monthly' ? 'Monat' : abo.billingInterval}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-500 gap-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Vertragsbeginn: <strong>{formatDate(abo.startDate)}</strong></span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenInvoiceModal(customer.id, null, abo)}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-lg border border-sky-200 transition flex items-center gap-1 cursor-pointer"
                          title="Für dieses Abo eine Rechnung erstellen"
                        >
                          <Receipt className="w-3 h-3 text-sky-600" />
                          <span>Rechnung erstellen</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditService && onEditService(abo)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                          title="Abo bearbeiten (Status / Preis)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {deletingServiceId === abo.id ? (
                          <div className="flex items-center space-x-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                            <span className="text-[10px] text-rose-700 font-bold">Löschen?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(abo.id)}
                              className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded hover:bg-rose-700 cursor-pointer"
                            >
                              Ja
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingServiceId(null)}
                              className="text-[10px] text-slate-600 px-1 py-0.5 hover:bg-slate-200 rounded cursor-pointer"
                            >
                              Nein
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingServiceId(abo.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Abo löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
                  <div key={srv.id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 transition flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        {/* Interactive Status Selector (Quick 1-click change) */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={srv.status || 'active'}
                            onChange={(e) => handleQuickStatusChange(srv, e.target.value)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                              srv.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                : srv.status === 'cancelled' 
                                ? 'bg-rose-50 text-rose-800 border-rose-300' 
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="active">⏳ In Arbeit</option>
                            <option value="completed">✓ Erledigt</option>
                            <option value="cancelled">🚫 Storniert</option>
                          </select>
                        </div>

                        <h5 
                          onClick={() => onEditService && onEditService(srv)}
                          className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition cursor-pointer"
                        >
                          {srv.title}
                        </h5>
                        {srv.description && (
                          <p className="text-xs text-slate-500">{srv.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-emerald-600">
                          {formatCurrency(srv.price)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Einmalig
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-500 gap-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Datum / Erledigt: <strong>{formatDate(srv.startDate)}</strong></span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenInvoiceModal(customer.id, null, srv)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                          title="Aus dieser Leistung eine Rechnung erstellen"
                        >
                          <Receipt className="w-3 h-3 text-emerald-600" />
                          <span>Rechnung erstellen</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditService && onEditService(srv)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Leistung bearbeiten (Status auf Erledigt setzen / Preis ändern)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {deletingServiceId === srv.id ? (
                          <div className="flex items-center space-x-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                            <span className="text-[10px] text-rose-700 font-bold">Löschen?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(srv.id)}
                              className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded hover:bg-rose-700 cursor-pointer"
                            >
                              Ja
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingServiceId(null)}
                              className="text-[10px] text-slate-600 px-1 py-0.5 hover:bg-slate-200 rounded cursor-pointer"
                            >
                              Nein
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingServiceId(srv.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Leistung löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
              <p className="text-xs text-slate-500">Alle gestellten Rechnungen mit Status und PDF-Druck</p>
            </div>
            <button
              onClick={() => onOpenInvoiceModal(customer.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>+ Neue Rechnung</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 p-2 rounded-xl transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{inv.invoiceNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status === 'paid' ? 'Bezahlt' : 'Offen / Versendet'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Rechnungsdatum: {formatDate(inv.date)} • Fällig am: {formatDate(inv.dueDate)}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-slate-900">
                      {formatCurrency(inv.grossAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">§ 19 UStG</div>
                  </div>
                  <button
                    onClick={() => onViewInvoice(inv)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                    title="Rechnung anzeigen / drucken"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {invoices.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Noch keine Rechnungen für diesen Kunden vorhanden.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2.5: OFFERS & KOSTENVORANSCHLÄGE */}
      {activeSubTab === 'offers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Erstellte Angebote & Kostenvoranschläge</h3>
              <p className="text-xs text-slate-500">Übersicht aller für diesen Kunden kalkulierten Offerten & PDF-Exporte</p>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 self-start sm:self-auto">
              {offers.length} Dokument(e)
            </span>
          </div>

          <div className="space-y-3">
            {offers.map((off) => {
              const isKV = off.type === 'kostenvoranschlag';
              const prefix = isKV ? 'ab ' : '';
              return (
                <div key={off.id} className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{off.offerNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isKV ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {isKV ? 'Kostenvoranschlag' : 'Angebot'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        off.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : off.status === 'sent' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {off.status === 'accepted' ? 'Angenommen' : off.status === 'sent' ? 'Versendet' : 'Entwurf'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Erstellt: <strong>{formatDate(off.date || off.createdAt)}</strong></span>
                      <span>Gültig bis: <strong>{formatDate(off.validUntilDate)}</strong></span>
                    </div>

                    {off.packageC && off.packageC.selectedModules && off.packageC.selectedModules.length > 0 && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md inline-block">
                        Module: {off.packageC.selectedModules.map(m => m.title || m).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Investition</div>
                      <div className="text-base font-black text-slate-900">
                        {prefix}{formatCurrency(off.totalOneTime || off.totalAmount || 0)}
                      </div>
                      {off.totalRecurring > 0 && (
                        <div className="text-[11px] font-semibold text-sky-700">
                          + {prefix}{formatCurrency(off.totalRecurring)} / {off.recurringInterval === 'yearly' ? 'Jahr' : off.recurringInterval === 'quarterly' ? 'Quartal' : 'Monat'}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => generateOfferPDF(off)}
                      className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      title="PDF herunterladen"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {offers.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Noch keine Angebote oder Kostenvoranschläge für diesen Kunden erstellt.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MILEAGE */}
      {activeSubTab === 'mileage' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Dienstfahrten & KM-Erfassung</h3>
              <p className="text-xs text-slate-500">Fahrtenbuch-Einträge für Kundentermine und Baustellen</p>
            </div>
            <button
              onClick={() => onOpenMileageModal(customer.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Fahrt erfassen</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {mileage.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900">{m.purpose}</div>
                  <div className="text-[11px] text-slate-500">
                    {formatDate(m.date)} • {m.startLocation} ➔ {m.destination}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{m.kilometers} km</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">{formatCurrency(m.totalDeduction)} Abzug</div>
                </div>
              </div>
            ))}

            {mileage.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Keine Fahrten für diesen Kunden erfasst.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: AUFTRÄGE & KANBAN */}
      {activeSubTab === 'dispositions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Auftragsdispositionen & Baustellen-Aufgaben</h3>
              <p className="text-xs text-slate-500">Alle geplanten, laufenden und abgeschlossenen Aufgaben für {customer.companyName}</p>
            </div>
            <button
              onClick={() => {
                if (onNavigateToDisposition) {
                  onNavigateToDisposition(customer.id);
                }
              }}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Auftrag im Kanban anlegen</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {dispositions.map((disp) => {
              const statusLabels = {
                geplant: { label: 'Geplant & Vorbereitung', bg: 'bg-sky-50 text-sky-800 border-sky-200' },
                in_progress: { label: 'In Bearbeitung', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                review: { label: 'Qualitätskontrolle / Abnahme', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                completed: { label: 'Abgeschlossen & Abrechenbar', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
              };
              const st = statusLabels[disp.status] || { label: disp.status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

              return (
                <div key={disp.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-sky-300 transition-all space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-600">{disp.dispNumber || disp.id}</span>
                    <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${st.bg}`}>
                      {st.label}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{disp.title}</h4>

                  {disp.project && (
                    <div className="text-xs text-sky-700 font-semibold">{disp.project}</div>
                  )}

                  {Array.isArray(disp.tags) && disp.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {disp.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{disp.assignee || 'Unzugewiesen'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(disp.date)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {dispositions.length === 0 && (
              <div className="col-span-full text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                Noch keine Aufträge für diesen Kunden im Kanban erfasst.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: EMAIL LOGS */}
      {activeSubTab === 'emails' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">E-Mail Historie</h3>
              <p className="text-xs text-slate-500">Protokoll aller versendeten Demo- & Akquise-Mails</p>
            </div>
            <button
              onClick={() => onOpenDemoEmailModal(customer)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>+ E-Mail senden</span>
            </button>
          </div>

          <div className="space-y-3">
            {emailLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900">{log.subject}</div>
                  <div className="text-[10px] text-slate-500">{formatDateTime(log.sentAt)}</div>
                </div>
                <div className="text-[11px] text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-line">
                  {log.body}
                </div>
              </div>
            ))}

            {emailLogs.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Noch keine E-Mails in der Historie erfasst.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status) {
  switch (status) {
    case 'active':
      return { label: 'Aktiv', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'lead':
      return { label: 'Interessent / Lead', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'inactive':
      return { label: 'Inaktiv', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    default:
      return { label: status, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
  }
}
