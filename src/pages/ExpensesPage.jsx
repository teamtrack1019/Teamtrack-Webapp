import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Euro, 
  Tag, 
  Calendar, 
  Building2, 
  CreditCard, 
  Edit3, 
  Trash2,
  PieChart
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function ExpensesPage({ 
  expenses, 
  onOpenExpenseModal, 
  onEditExpense, 
  onDeleteExpense 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = Array.from(new Set(expenses.map(e => e.category || 'Sonstiges')));

  const filtered = expenses.filter(exp => {
    const matchesSearch = 
      exp.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.expenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterCategory === 'all') return matchesSearch;
    return matchesSearch && exp.category === filterCategory;
  });

  const totalNet = expenses.reduce((s, e) => s + Number(e.netAmount || 0), 0);
  const totalTax = expenses.reduce((s, e) => s + Number(e.taxAmount || 0), 0);
  const totalGross = expenses.reduce((s, e) => s + Number(e.grossAmount || 0), 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-amber-600" />
            <span>Eingehende Belege & Ausgaben</span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Betriebsausgaben, Server, Software, Hardware und Belegerfassung
          </p>
        </div>

        <button
          onClick={() => onOpenExpenseModal()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ausgabe erfassen</span>
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Euro className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Betriebsausgaben Netto</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(totalNet)}</div>
            <div className="text-[11px] text-slate-500">{expenses.length} Belege erfasst</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Abziehbare Vorsteuer</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">{formatCurrency(totalTax)}</div>
            <div className="text-[11px] text-emerald-700">Mindert die USt.-Zahllast</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Ausgaben Brutto</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(totalGross)}</div>
            <div className="text-[11px] text-slate-500">Tatsächlicher Geldabfluss</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Lieferant, Beleg oder Notiz..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              filterCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Alle ({expenses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                filterCategory === cat ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5">Beleg-Nr.</th>
                <th className="p-3.5">Lieferant / Empfänger</th>
                <th className="p-3.5">Kategorie</th>
                <th className="p-3.5">Datum</th>
                <th className="p-3.5 text-right">Netto</th>
                <th className="p-3.5 text-right">Vorsteuer</th>
                <th className="p-3.5 text-right">Brutto</th>
                <th className="p-3.5">Zahlart</th>
                <th className="p-3.5 text-right pr-5">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 pl-5 font-mono font-bold text-slate-900">
                    {exp.expenseNumber}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{exp.vendor}</div>
                    {exp.notes && <div className="text-[11px] text-slate-400 italic truncate max-w-xs">{exp.notes}</div>}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {formatDate(exp.date)}
                  </td>
                  <td className="p-3.5 text-right font-medium text-slate-700">
                    {formatCurrency(exp.netAmount)}
                  </td>
                  <td className="p-3.5 text-right text-emerald-600 font-medium">
                    {formatCurrency(exp.taxAmount)} <span className="text-[10px] text-slate-400">({exp.taxRate}%)</span>
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-slate-900 text-sm">
                    {formatCurrency(exp.grossAmount)}
                  </td>
                  <td className="p-3.5 text-slate-500 font-medium">
                    {exp.paymentMethod}
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onEditExpense(exp)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
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
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    Keine Ausgabenbelege gefunden.
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
