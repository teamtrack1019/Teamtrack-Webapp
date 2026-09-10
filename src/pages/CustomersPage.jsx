import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Repeat, 
  Zap, 
  FileText, 
  FileSpreadsheet,
  ChevronRight, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Building2,
  Sparkles,
  AlertTriangle,
  Bell,
  ArrowLeft,
  LayoutList,
  LayoutGrid,
  Filter,
  User,
  Hash,
  ExternalLink,
  Trello
} from 'lucide-react';
import { api } from '../api';
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime, 
  getStatusBadge, 
  getOfferReminderStatus,
  getLeadSourceBadge 
} from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export default function CustomersPage({ 
  customers, 
  onSelectCustomer, 
  onOpenCustomerModal, 
  onOpenDemoEmailModal, 
  onOpenInvoiceModal,
  onNavigateToDisposition,
  onEditCustomer, 
  onUpdateCustomerStatus,
  onDeleteCustomer,
  onReloadAllData
}) {
  const { t, isTR } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' (A-Z Master-Detail) or 'grid' (classic cards)
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // A-Z Alphabetical sorting by company name
  const sortedAndFiltered = useMemo(() => {
    let list = [...customers].sort((a, b) => {
      const nameA = (a.companyName || '').trim();
      const nameB = (b.companyName || '').trim();
      return nameA.localeCompare(nameB, 'de', { sensitivity: 'base' });
    });

    return list.filter(c => {
      const matchesSearch = 
        c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.leadSource?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const hasServicesOrJobs = (Number(c.activeAbosCount || 0) > 0 || Number(c.einmaligeCount || 0) > 0 || Number(c.invoicesCount || 0) > 0);
      const effectiveStatus = hasServicesOrJobs ? 'active' : (c.status || 'lead');

      const matchesStatus = filterStatus === 'all' || effectiveStatus === filterStatus;
      const matchesSource = filterSource === 'all' || (c.leadSource && c.leadSource.toUpperCase() === filterSource.toUpperCase());

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [customers, searchTerm, filterStatus, filterSource]);

  // Selected customer for expanded detail view
  const selectedCustomer = useMemo(() => {
    if (!sortedAndFiltered || sortedAndFiltered.length === 0) return null;
    if (selectedCustomerId) {
      const found = sortedAndFiltered.find(c => c.id === selectedCustomerId);
      if (found) return found;
    }
    return sortedAndFiltered[0];
  }, [sortedAndFiltered, selectedCustomerId]);

  const handleSelectCustomerItem = (cust) => {
    setSelectedCustomerId(cust.id);
    setMobileShowDetail(true);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-sky-600" />
            <span>{t('customers.title', 'Kundenverwaltung (CRM)')}</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {t('customers.subtitle', 'Alphabetische A-Z Übersicht, Lead-Quellen, monatliche Abos, Einmalleistungen & Nachfass-Status')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View mode toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              title={isTR ? 'A-Z Liste ve Detay Görünümü' : 'A-Z Listen- & Detailansicht'}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-4 h-4 text-sky-600" />
              <span>{isTR ? 'A-Z Liste' : 'A-Z Liste'}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title={isTR ? 'Kart / Kutu Görünümü' : 'Kachelansicht (Raster)'}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
              <span>{isTR ? 'Kartlar' : 'Kacheln'}</span>
            </button>
          </div>

          <button
            onClick={onOpenCustomerModal}
            className="flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('customers.addCustomer', 'Neuen Kunden anlegen')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder={t('customers.searchPlaceholder', 'Firma, Name, E-Mail oder Lead-Quelle suchen...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status & Source Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isTR ? `Tümü (${customers.length})` : `Alle (${customers.length})`}
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isTR ? 'Aktif' : 'Aktiv'} ({customers.filter(c => (Number(c.activeAbosCount || 0) > 0 || Number(c.einmaligeCount || 0) > 0 || Number(c.invoicesCount || 0) > 0 || c.status === 'active')).length})
          </button>
          <button
            onClick={() => setFilterStatus('lead')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'lead'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isTR ? 'Aday Talepler' : 'Interessenten'} ({customers.filter(c => !(Number(c.activeAbosCount || 0) > 0 || Number(c.einmaligeCount || 0) > 0 || Number(c.invoicesCount || 0) > 0 || c.status === 'active')).length})
          </button>

          {/* Lead Source Filter Dropdown */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="all">{isTR ? 'Tüm Kanallar' : 'Alle Quellen'}</option>
            <option value="WEBSITE ANFRAGE">🌐 {isTR ? 'Website Talebi' : 'Website Anfrage'}</option>
            <option value="DIREKT E-MAIL">✉️ {isTR ? 'Direkt E-Posta' : 'Direkt E-Mail'}</option>
            <option value="UPWORK">🟢 Upwork</option>
            <option value="XING">💼 Xing</option>
            <option value="MALT">🔴 Malt</option>
            <option value="EMPFEHLUNG">⭐ {isTR ? 'Tavsiye / Referans' : 'Empfehlung'}</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MASTER-DETAIL A-Z VIEW (DEFAULT & EXPANDED AS REQUESTED BY USER) */}
      {/* ========================================================================= */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: A-Z Customer List (5 cols on Desktop) */}
          <div className={`lg:col-span-5 space-y-3 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  Kunden A – Z ({sortedAndFiltered.length})
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Alphabetisch sortiert</span>
              </div>

              {sortedAndFiltered.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Keine Kunden für diesen Filter gefunden.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
                  {sortedAndFiltered.map((customer) => {
                    const hasServicesOrJobs = (Number(customer.activeAbosCount || 0) > 0 || Number(customer.einmaligeCount || 0) > 0 || Number(customer.invoicesCount || 0) > 0);
                    const effectiveStatus = hasServicesOrJobs ? 'active' : (customer.status || 'lead');
                    const statusBadge = getStatusBadge(effectiveStatus);
                    const isSelected = selectedCustomer?.id === customer.id;
                    const leadBadge = getLeadSourceBadge(customer.leadSource);
                    const reminder = getOfferReminderStatus(customer);

                    return (
                      <div
                        key={customer.id}
                        onClick={() => handleSelectCustomerItem(customer)}
                        className={`p-3.5 sm:p-4 transition cursor-pointer flex items-start justify-between gap-3 group select-none ${
                          isSelected
                            ? 'bg-sky-50/80 border-l-4 border-l-sky-600 shadow-2xs'
                            : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                        }`}
                      >
                        {/* Initial Avatar */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 uppercase transition ${
                            isSelected 
                              ? 'bg-sky-600 text-white shadow-xs' 
                              : 'bg-slate-100 text-slate-700 group-hover:bg-sky-100 group-hover:text-sky-800'
                          }`}>
                            {(customer.companyName || 'K').charAt(0)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className={`font-bold text-xs sm:text-sm truncate ${
                                isSelected ? 'text-sky-950 font-black' : 'text-slate-900 group-hover:text-sky-600'
                              }`}>
                                {customer.companyName}
                              </h4>
                              {reminder?.shouldAlert && (
                                <span className="flex h-2 w-2 relative" title="Dringende Erinnerung / Nachfassen!">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                              )}
                            </div>

                            {customer.contactPerson && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                z.Hd. {customer.contactPerson}
                              </p>
                            )}

                            {/* Tags row */}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                                {statusBadge.label}
                              </span>

                              {leadBadge && (
                                <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border flex items-center gap-0.5 ${leadBadge.bg} ${leadBadge.text} ${leadBadge.border}`}>
                                  <span>{leadBadge.icon}</span>
                                  <span>{leadBadge.label}</span>
                                </span>
                              )}

                              {customer.totalAboMonthly > 0 && (
                                <span className="text-[9.5px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded">
                                  {formatCurrency(customer.totalAboMonthly)}/Mo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 transition mt-2 ${
                          isSelected ? 'text-sky-600 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                        }`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: EXPANDED DETAILED CUSTOMER VIEW (7 cols on Desktop - Image 2 style but wide & spacious) */}
          <div className={`lg:col-span-7 ${mobileShowDetail ? 'block' : 'hidden lg:block'}`}>
            {selectedCustomer ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md p-5 sm:p-7 space-y-5 animate-fadeIn">
                {/* Mobile Back Button to List */}
                <div className="lg:hidden pb-2 border-b border-slate-100">
                  <button
                    onClick={() => setMobileShowDetail(false)}
                    className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Zurück zur Kundenliste</span>
                  </button>
                </div>

                {/* Card Top: Status, Lead-Quelle & Actions */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(() => {
                        const hasServicesOrJobs = (Number(selectedCustomer.activeAbosCount || 0) > 0 || Number(selectedCustomer.einmaligeCount || 0) > 0 || Number(selectedCustomer.invoicesCount || 0) > 0);
                        const effectiveStatus = hasServicesOrJobs ? 'active' : (selectedCustomer.status || 'lead');
                        const statusBadge = getStatusBadge(effectiveStatus);
                        return (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                            {statusBadge.label}
                          </span>
                        );
                      })()}

                      {selectedCustomer.leadSource && (() => {
                        const leadBadge = getLeadSourceBadge(selectedCustomer.leadSource);
                        if (!leadBadge) return null;
                        return (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${leadBadge.bg} ${leadBadge.text} ${leadBadge.border}`}>
                            <span>{leadBadge.icon}</span>
                            <span>{leadBadge.label}</span>
                          </span>
                        );
                      })()}
                    </div>

                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight break-words">
                      {selectedCustomer.companyName}
                    </h3>
                    {selectedCustomer.businessType && (
                      <p className="text-xs text-sky-700 font-semibold">
                        {selectedCustomer.businessType}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditCustomer(selectedCustomer)}
                      title="Kunde bearbeiten"
                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCustomer(selectedCustomer.id)}
                      title="Kunde löschen"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Information Grid */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedCustomer.contactPerson && (
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{isTR ? 'Yetkili:' : 'Ansprechpartner:'} <strong>{selectedCustomer.contactPerson}</strong></span>
                    </div>
                  )}

                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={`mailto:${selectedCustomer.email}`} className="text-sky-600 hover:underline truncate font-semibold">
                        {selectedCustomer.email}
                      </a>
                    </div>
                  )}

                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={`tel:${selectedCustomer.phone}`} className="hover:underline font-semibold">
                        {selectedCustomer.phone}
                      </a>
                    </div>
                  )}

                  {selectedCustomer.address && (
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedCustomer.address}</span>
                    </div>
                  )}

                  {selectedCustomer.taxNumber && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{isTR ? 'Vergi No:' : 'St.-Nr:'} {selectedCustomer.taxNumber}</span>
                    </div>
                  )}
                </div>

                {/* Optional Notes */}
                {selectedCustomer.notes && (
                  <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 text-xs text-amber-950">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-amber-900 block mb-0.5">{isTR ? 'Notlar & Detaylar:' : 'Notizen & Details:'}</span>
                    <p className="leading-relaxed">{selectedCustomer.notes}</p>
                  </div>
                )}

                {/* Main Email Button */}
                <button
                  onClick={() => onOpenDemoEmailModal(selectedCustomer)}
                  className="w-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl p-3 flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span>{isTR ? 'E-Posta Gönder (Outlook / Şablon)' : 'E-Mail senden (Outlook / Vorlage)'}</span>
                </button>

                {/* 3-DAY REMINDER ALERT (RED) OR RESPONDED CONFIRMATION (GREEN) */}
                {(() => {
                  const reminder = getOfferReminderStatus(selectedCustomer);
                  if (!reminder) return null;

                  if (reminder.shouldAlert) {
                    return (
                      <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3.5 sm:p-4 space-y-2.5 text-xs shadow-xs animate-fadeIn">
                        <div className="flex items-start gap-2.5 text-rose-950">
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                          <div className="space-y-0.5 flex-1">
                            <span className="text-rose-900 font-black block text-xs sm:text-sm">
                              {reminder.isExpired 
                                ? (isTR ? `Süre doldu (${formatDate(reminder.validUntilDate)})` : `Frist abgelaufen (${formatDate(reminder.validUntilDate)})`)
                                : (isTR ? `Geçerlilik süresi ${reminder.diffDays === 0 ? 'bugün' : `${reminder.diffDays} gün içinde`} bitiyor!` : `Gültigkeit endet in ${reminder.diffDays === 0 ? 'heute' : reminder.diffDays === 1 ? '1 Tag' : `${reminder.diffDays} Tagen`}!`)}
                            </span>
                            <p className="text-xs font-medium text-rose-700 leading-relaxed">
                              {isTR 
                                ? `${reminder.type === 'kostenvoranschlag' ? 'Maliyet tahmini' : 'Teklif'} ${reminder.offerNumber} için henüz geri dönüş yok. Lütfen hatırlatın!`
                                : `Keine Rückmeldung zu ${reminder.type === 'kostenvoranschlag' ? 'Kostenvoranschlag' : 'Angebot'} ${reminder.offerNumber}. Bitte nachfassen!`}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-rose-200/80">
                          <button
                            type="button"
                            onClick={() => onOpenDemoEmailModal(selectedCustomer, 'offer_reminder')}
                            className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                            title={isTR ? 'Hatırlatma şablonunu aç' : 'Erinnerungs-Vorlage 4 öffnen'}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{isTR ? 'Hatırlatma Gönder (Şablon 4)' : 'Erinnerung senden (V4)'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await api.setOfferCustomerResponded(selectedCustomer.id, true);
                                if (onReloadAllData) await onReloadAllData();
                              } catch (e) {
                                alert('Fehler: ' + e.message);
                              }
                            }}
                            className="py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                            title={isTR ? 'Müşteri geri dönüş yaptı olarak işaretle' : 'Kunde hat sich gemeldet'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isTR ? 'Müşteri geri döndü' : 'Kunde hat sich gemeldet'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (reminder.hasResponded) {
                    return (
                      <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-emerald-950">
                        <span className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{isTR ? 'Müşteri geri döndü' : 'Kunde hat sich gemeldet'} {reminder.respondedAt ? `(${formatDate(reminder.respondedAt)})` : ''}</span>
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.setOfferCustomerResponded(selectedCustomer.id, false);
                              if (onReloadAllData) await onReloadAllData();
                            } catch (e) {
                              alert('Fehler: ' + e.message);
                            }
                          }}
                          className="text-xs text-emerald-700 hover:text-emerald-900 underline font-normal cursor-pointer ml-2"
                        >
                          {isTR ? 'Sıfırla' : 'Zurücksetzen'}
                        </button>
                      </div>
                    );
                  }

                  return null;
                })()}

                {/* Angebot / Kostenvoranschlag Standard Sent Badge */}
                {(selectedCustomer.offerEmailSent || selectedCustomer.lastOffer) && (
                  <div className={`border rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold ${
                    (selectedCustomer.offerEmailType || selectedCustomer.lastOffer?.type) === 'kostenvoranschlag'
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                      : 'bg-sky-50/90 border-sky-200 text-sky-950'
                  }`}>
                    <span className="flex items-center gap-2 truncate">
                      <FileSpreadsheet className={`w-4 h-4 shrink-0 ${
                        (selectedCustomer.offerEmailType || selectedCustomer.lastOffer?.type) === 'kostenvoranschlag' ? 'text-amber-600' : 'text-sky-600'
                      }`} />
                      <span className="truncate">
                        {(selectedCustomer.offerEmailType || selectedCustomer.lastOffer?.type) === 'kostenvoranschlag' ? (isTR ? 'Maliyet Tahmini' : 'Kostenvoranschlag') : (isTR ? 'Teklif' : 'Angebot')} ({selectedCustomer.offerEmailNumber || selectedCustomer.lastOffer?.offerNumber}): {formatDate(selectedCustomer.offerEmailSentAt || selectedCustomer.lastOffer?.sentAt)}
                      </span>
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                      (selectedCustomer.offerEmailType || selectedCustomer.lastOffer?.type) === 'kostenvoranschlag'
                        ? 'bg-amber-200/80 text-amber-900'
                        : 'bg-sky-200/80 text-sky-900'
                    }`}>
                      {isTR ? 'Gönderildi' : 'Gesendet'}
                    </span>
                  </div>
                )}

                {/* Vorstellungs-E-Mail Sent Badge */}
                {selectedCustomer.demoEmailSent && (
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-emerald-800 font-medium">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{isTR ? 'Tanıtım Maili:' : 'Vorstellung:'} {formatDate(selectedCustomer.demoEmailSentAt)}</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100/80 px-2 py-0.5 rounded">{isTR ? 'Kayıtlı' : 'Erfasst'}</span>
                  </div>
                )}

                {/* Services & Revenue Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-sky-500" />
                      {isTR ? 'Aylık Abonelik' : 'Monatl. Abo'}
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-800 mt-1">
                      {selectedCustomer.totalAboMonthly > 0 ? (
                        <span className="text-sky-600">{formatCurrency(selectedCustomer.totalAboMonthly)} {isTR ? '/ Ay' : '/ Mo'}</span>
                      ) : (
                        <span className="text-slate-400 font-normal">{isTR ? 'Abonelik Yok' : 'Kein Abo'}</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-500" />
                      {isTR ? 'Tek Seferlik İş' : 'Einmalleistung'}
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-800 mt-1">
                      {selectedCustomer.einmaligeCount > 0 ? (
                        <span>{selectedCustomer.einmaligeCount} {isTR ? 'Proje' : 'Projekt(e)'}</span>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Detail Button & Add Invoice & Add Auftrag */}
                <div className="bg-slate-50/80 -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 p-4 sm:p-5 border-t border-slate-100 rounded-b-2xl sm:rounded-b-3xl flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onOpenInvoiceModal(selectedCustomer.id)}
                      className="text-xs sm:text-sm font-bold text-slate-700 hover:text-sky-600 flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span>{isTR ? '+ Fatura' : '+ Rechnung'}</span>
                    </button>

                    <button
                      onClick={() => onNavigateToDisposition && onNavigateToDisposition(selectedCustomer.id)}
                      className="text-xs sm:text-sm font-bold text-slate-700 hover:text-sky-600 flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer"
                      title={isTR ? 'Kanban panosuna görev ekle' : 'Auftrag im Kanban anlegen'}
                    >
                      <Trello className="w-4 h-4 text-indigo-600" />
                      <span>{isTR ? '+ İş / Görev (Kanban)' : '+ Auftrag (Kanban)'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectCustomer(selectedCustomer.id)}
                    className="text-xs sm:text-sm font-black text-sky-600 hover:text-sky-700 flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <span>{isTR ? 'Müşteri Profilini Aç' : 'Kundenprofil öffnen'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-slate-700 font-bold">Kein Kunde ausgewählt</h4>
                <p className="text-slate-400 text-xs mt-1">
                  Wählen Sie links einen Kunden aus der Liste aus.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. GRID / KACHELANSICHT (CLASSIC VIEW)                                    */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedAndFiltered.map((customer) => {
            const hasServicesOrJobs = (Number(customer.activeAbosCount || 0) > 0 || Number(customer.einmaligeCount || 0) > 0 || Number(customer.invoicesCount || 0) > 0);
            const effectiveStatus = hasServicesOrJobs ? 'active' : (customer.status || 'lead');
            const statusBadge = getStatusBadge(effectiveStatus);
            const leadBadge = getLeadSourceBadge(customer.leadSource);

            return (
              <div
                key={customer.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          {statusBadge.label}
                        </span>
                        {leadBadge && (
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${leadBadge.bg} ${leadBadge.text} ${leadBadge.border}`}>
                            <span>{leadBadge.icon}</span>
                            <span>{leadBadge.label}</span>
                          </span>
                        )}
                      </div>
                      <h3 
                        onClick={() => onSelectCustomer(customer.id)}
                        className="font-bold text-base text-slate-900 group-hover:text-sky-600 transition cursor-pointer leading-snug truncate mt-1"
                      >
                        {customer.companyName}
                      </h3>
                    </div>

                    {/* Top Actions */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onEditCustomer(customer)}
                        title="Kunde bearbeiten"
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCustomer(customer.id)}
                        title="Kunde löschen"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1 text-xs text-slate-600">
                    {customer.contactPerson && (
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                        <span className="truncate">{isTR ? 'Yetkili:' : 'Ansprechpartner:'} {customer.contactPerson}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-1.5 text-slate-500 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-1.5 text-slate-500 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    )}
                  </div>

                  {/* DEMO / EMAIL & OFFER TRACKING BADGES & REMINDER ALERTS */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => onOpenDemoEmailModal(customer)}
                      className="w-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl p-2.5 flex items-center justify-center space-x-2 text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-sky-600" />
                      <span>{isTR ? 'E-Posta Gönder (Outlook / Şablon)' : 'E-Mail senden (Outlook / Vorlage)'}</span>
                    </button>

                    {/* 3-DAY REMINDER ALERT (RED) OR RESPONDED CONFIRMATION (GREEN) */}
                    {(() => {
                      const reminder = getOfferReminderStatus(customer);
                      if (!reminder) return null;

                      if (reminder.shouldAlert) {
                        return (
                          <div className="bg-rose-50 border border-rose-300 rounded-xl p-2.5 space-y-2 text-xs shadow-2xs animate-fadeIn">
                            <div className="flex items-start gap-1.5 text-rose-950">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                              <div className="space-y-0.5">
                                <span className="text-rose-900 font-black block text-[11.5px]">
                                  {reminder.isExpired 
                                    ? (isTR ? `Süre doldu (${formatDate(reminder.validUntilDate)})` : `Frist abgelaufen (${formatDate(reminder.validUntilDate)})`)
                                    : (isTR ? `Geçerlilik ${reminder.diffDays === 0 ? 'bugün' : `${reminder.diffDays} gün içinde`} bitiyor!` : `Gültigkeit endet in ${reminder.diffDays === 0 ? 'heute' : reminder.diffDays === 1 ? '1 Tag' : `${reminder.diffDays} Tagen`}!`)}
                                </span>
                                <p className="text-[10.5px] font-medium text-rose-700 leading-tight">
                                  {isTR 
                                    ? `${reminder.type === 'kostenvoranschlag' ? 'Maliyet tahmini' : 'Teklif'} ${reminder.offerNumber} için henüz geri dönüş yok. Lütfen hatırlatın!`
                                    : `Keine Rückmeldung zu ${reminder.type === 'kostenvoranschlag' ? 'Kostenvoranschlag' : 'Angebot'} ${reminder.offerNumber}. Bitte nachfassen!`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-rose-200/80">
                              <button
                                type="button"
                                onClick={() => onOpenDemoEmailModal(customer, 'offer_reminder')}
                                className="flex-1 py-1 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                                title={isTR ? 'Hatırlatma şablonunu aç' : 'Erinnerungs-Vorlage 4 öffnen'}
                              >
                                <Mail className="w-3 h-3" />
                                <span>{isTR ? 'Hatırlat (Ş4)' : 'Erinnerung senden (V4)'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await api.setOfferCustomerResponded(customer.id, true);
                                    if (onReloadAllData) await onReloadAllData();
                                  } catch (e) {
                                    alert('Fehler: ' + e.message);
                                  }
                                }}
                                className="py-1 px-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer"
                                title={isTR ? 'Müşteri geri döndü' : 'Kunde hat sich gemeldet'}
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{isTR ? 'Geri Döndü' : 'Kunde hat sich gemeldet'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      }

                      if (reminder.hasResponded) {
                        return (
                          <div className="bg-emerald-50 border border-emerald-200/90 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px] font-semibold text-emerald-950">
                            <span className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{isTR ? 'Müşteri geri döndü' : 'Kunde hat sich gemeldet'} {reminder.respondedAt ? `(${formatDate(reminder.respondedAt)})` : ''}</span>
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await api.setOfferCustomerResponded(customer.id, false);
                                  if (onReloadAllData) await onReloadAllData();
                                } catch (e) {
                                  alert('Fehler: ' + e.message);
                                }
                              }}
                              className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-normal cursor-pointer ml-1"
                            >
                              {isTR ? 'Sıfırla' : 'Zurücksetzen'}
                            </button>
                          </div>
                        );
                      }

                      return null;
                    })()}

                    {/* Angebot / Kostenvoranschlag Standard Sent Badge */}
                    {(customer.offerEmailSent || customer.lastOffer) && (
                      <div className={`border rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px] font-semibold ${
                        (customer.offerEmailType || customer.lastOffer?.type) === 'kostenvoranschlag'
                          ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                          : 'bg-sky-50/90 border-sky-200 text-sky-950'
                      }`}>
                        <span className="flex items-center gap-1.5 truncate">
                          <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${
                            (customer.offerEmailType || customer.lastOffer?.type) === 'kostenvoranschlag' ? 'text-amber-600' : 'text-sky-600'
                          }`} />
                          <span className="truncate">
                            {(customer.offerEmailType || customer.lastOffer?.type) === 'kostenvoranschlag' ? (isTR ? 'Maliyet Tahmini' : 'Kostenvoranschlag') : (isTR ? 'Teklif' : 'Angebot')} ({customer.offerEmailNumber || customer.lastOffer?.offerNumber}): {formatDate(customer.offerEmailSentAt || customer.lastOffer?.sentAt)}
                          </span>
                        </span>
                        <span className={`text-[9.5px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          (customer.offerEmailType || customer.lastOffer?.type) === 'kostenvoranschlag'
                            ? 'bg-amber-200/80 text-amber-900'
                            : 'bg-sky-200/80 text-sky-900'
                        }`}>
                          {isTR ? 'Gönderildi' : 'Gesendet'}
                        </span>
                      </div>
                    )}

                    {/* Vorstellungs-E-Mail Sent Badge */}
                    {customer.demoEmailSent && (
                      <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg px-2.5 py-1 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isTR ? 'Tanıtım:' : 'Vorstellung:'} {formatDate(customer.demoEmailSentAt)}</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100/80 px-1.5 py-0.2 rounded">{isTR ? 'Kayıtlı' : 'Erfasst'}</span>
                      </div>
                    )}
                  </div>

                  {/* Services & Revenue Summary */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                        <Repeat className="w-3 h-3 text-sky-500" />
                        {isTR ? 'Aylık Abonelik' : 'Monatl. Abo'}
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {customer.totalAboMonthly > 0 ? (
                          <span className="text-sky-600">{formatCurrency(customer.totalAboMonthly)} {isTR ? '/ Ay' : '/ Mo'}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">{isTR ? 'Abonelik Yok' : 'Kein Abo'}</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-500" />
                        {isTR ? 'Tek Seferlik' : 'Einmalleistung'}
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {customer.einmaligeCount > 0 ? (
                          <span>{customer.einmaligeCount} {isTR ? 'Proje' : 'Projekt(e)'}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Detail Button */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenInvoiceModal(customer.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-sky-600 flex items-center gap-1"
                      title={isTR ? 'Fatura oluştur' : 'Rechnung erstellen'}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isTR ? '+ Fatura' : '+ RE'}</span>
                    </button>
                    <button
                      onClick={() => onNavigateToDisposition && onNavigateToDisposition(customer.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                      title={isTR ? 'Kanban panosuna görev ekle' : 'Auftrag im Kanban anlegen'}
                    >
                      <Trello className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isTR ? '+ İş' : '+ Auftrag'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectCustomer(customer.id)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-0.5 transition"
                  >
                    <span>{isTR ? 'Müşteri Profili' : 'Profil'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
