import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2,
  Euro,
  Building2,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/formatters';

export default function InvoicesPage({ 
  invoices, 
  onOpenInvoiceModal, 
  onEditInvoice, 
  onDeleteInvoice, 
  onTogglePaid,
  onViewInvoice 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && inv.status === filterStatus;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.grossAmount || 0), 0);
  const totalOpen = invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + Number(i.grossAmount || 0), 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-sky-600" />
            <span>Ausgehende Rechnungen (Verkauf)</span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Müşteri faturaları, KDV hesaplama ve Finanzamt için profesyonel PDF çıktıları
          </p>
        </div>

        <button
          onClick={() => onOpenInvoiceModal()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Neue Rechnung erstellen</span>
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Bezahlte Rechnungen</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(totalPaid)}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">{invoices.filter(i => i.status === 'paid').length} Rechnungen bezahlt</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Offene Forderungen</div>
            <div className="text-xl font-extrabold text-amber-600 mt-0.5">{formatCurrency(totalOpen)}</div>
            <div className="text-[11px] text-amber-700 font-semibold">{invoices.filter(i => i.status === 'sent').length} Rechnungen ausstehend</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Rechnungen Gesamt</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{invoices.length}</div>
            <div className="text-[11px] text-slate-500">Im aktuellen Geschäftsjahr</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechnungsnummer oder Kunde..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Alle ({invoices.length})
          </button>
          <button
            onClick={() => setFilterStatus('sent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'sent' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Offen ({invoices.filter(i => i.status === 'sent').length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bezahlt ({invoices.filter(i => i.status === 'paid').length})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'draft' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Entwurf ({invoices.filter(i => i.status === 'draft').length})
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5">Rechnungs-Nr.</th>
                <th className="p-3.5">Kunde</th>
                <th className="p-3.5">Datum / Fällig</th>
                <th className="p-3.5 text-right">Netto</th>
                <th className="p-3.5 text-right">MwSt.</th>
                <th className="p-3.5 text-right">Brutto</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right pr-5">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => {
                const statusBadge = getStatusBadge(inv.status);

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 pl-5 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{inv.customerAddress}</div>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div>{formatDate(inv.date)}</div>
                      <div className="text-[11px] text-slate-400">Fällig: {formatDate(inv.dueDate)}</div>
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(inv.netAmount)}
                    </td>
                    <td className="p-3.5 text-right text-slate-500">
                      {formatCurrency(inv.taxAmount)} <span className="text-[10px]">({inv.taxRate}%)</span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900 text-sm">
                      {formatCurrency(inv.grossAmount)}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onTogglePaid(inv)}
                        title="Klicken zum Umschalten (Bezahlt / Offen)"
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} hover:opacity-80`}
                      >
                        {statusBadge.label}
                      </button>
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          title="Rechnung anzeigen / Drucken / PDF"
                          className="flex items-center space-x-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF / Druck</span>
                        </button>
                        <button
                          onClick={() => onEditInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    Keine Rechnungen gefunden.
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
