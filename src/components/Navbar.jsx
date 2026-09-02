import React from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Car, 
  FilePlus, 
  UserPlus, 
  Receipt 
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onOpenCustomerModal, 
  onOpenInvoiceModal, 
  onOpenMileageModal,
  onOpenExpenseModal 
}) {
  const today = new Date().toISOString();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search Input */}
      <div className="flex items-center w-80 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Kunde, Rechnung, Ort suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
        />
      </div>

      {/* Actions & Current Date */}
      <div className="flex items-center space-x-3">
        {/* Date Display */}
        <div className="hidden lg:flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          <span>Heute: {formatDate(today)}</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCustomerModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-600" />
            <span>+ Kunde</span>
          </button>

          <button
            onClick={onOpenMileageModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Car className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Fahrt</span>
          </button>

          <button
            onClick={onOpenExpenseModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Ausgabe</span>
          </button>

          <button
            onClick={onOpenInvoiceModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition shadow-sm shadow-sky-600/20"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>+ Rechnung</span>
          </button>
        </div>
      </div>
    </header>
  );
}
