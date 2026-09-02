import React, { useState } from 'react';
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
  ChevronRight, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Building2,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, getStatusBadge } from '../utils/formatters';

export default function CustomersPage({ 
  customers, 
  onSelectCustomer, 
  onOpenCustomerModal, 
  onOpenDemoEmailModal, 
  onOpenInvoiceModal,
  onEditCustomer, 
  onDeleteCustomer 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = customers.filter(c => {
    const matchesSearch = 
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && c.status === filterStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-sky-600" />
            <span>Kundenverwaltung (CRM)</span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Müşteri takibi, aylık Abolar, tek seferlik optimizasyonlar ve tanıtım e-postaları
          </p>
        </div>

        <button
          onClick={onOpenCustomerModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Neuen Kunden anlegen</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Firma, Name oder E-Mail suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Alle ({customers.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aktiv ({customers.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('lead')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'lead'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Interessenten / Leads ({customers.filter(c => c.status === 'lead').length})
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((customer) => {
          const statusBadge = getStatusBadge(customer.status);

          return (
            <div
              key={customer.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                      {statusBadge.label}
                    </span>
                    <h3 
                      onClick={() => onSelectCustomer(customer.id)}
                      className="font-bold text-base text-slate-900 group-hover:text-sky-600 transition cursor-pointer leading-snug line-clamp-1"
                    >
                      {customer.companyName}
                    </h3>
                  </div>

                  {/* Top Actions */}
                  <div className="flex items-center space-x-1">
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
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>Ansprechpartner: {customer.contactPerson}</span>
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

                {/* DEMO / TANITIM EMAIL TRACKING BADGE */}
                <div className="pt-2 border-t border-slate-100">
                  {customer.demoEmailSent ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-emerald-950 text-[11px]">
                            Tanıtım / Demo Gönderildi
                          </div>
                          <div className="text-[10px] text-emerald-700">
                            {formatDateTime(customer.demoEmailSentAt)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenDemoEmailModal(customer)}
                        className="text-[10px] font-semibold text-emerald-800 underline hover:text-emerald-950"
                      >
                        Erneut
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenDemoEmailModal(customer)}
                      className="w-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl p-2 flex items-center justify-center space-x-1.5 text-xs font-semibold transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-sky-600" />
                      <span>Tanıtım / Demo Maili Gönder</span>
                    </button>
                  )}
                </div>

                {/* Services & Revenue Summary */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-sky-500" />
                      Monatl. Abo
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {customer.totalAboMonthly > 0 ? (
                        <span className="text-sky-600">{formatCurrency(customer.totalAboMonthly)} / Mo</span>
                      ) : (
                        <span className="text-slate-400 font-normal">Kein Abo</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-500" />
                      Einmalleistung
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {customer.einmaligeCount > 0 ? (
                        <span>{customer.einmaligeCount} Projekt(e)</span>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Detail Button */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenInvoiceModal(customer.id)}
                  className="text-xs font-semibold text-slate-600 hover:text-sky-600 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ Rechnung</span>
                </button>

                <button
                  onClick={() => onSelectCustomer(customer.id)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-0.5 transition"
                >
                  <span>Kundenprofil öffnen</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-slate-700 font-bold">Keine Kunden gefunden</h4>
            <p className="text-slate-400 text-xs mt-1">
              Passe deine Suche an oder erstelle einen neuen Kunden.
            </p>
            <button
              onClick={onOpenCustomerModal}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
            >
              + Jetzt ersten Kunden anlegen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
