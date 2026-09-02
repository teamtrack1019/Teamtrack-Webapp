import React from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Car, 
  FilePlus, 
  UserPlus, 
  Receipt,
  Menu
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onOpenCustomerModal, 
  onOpenInvoiceModal, 
  onOpenMileageModal, 
  onOpenExpenseModal, 
  onToggleMobileMenu 
}) {
  const today = new Date().toISOString();

  return (
    <header className="h-16 w-full bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
      {/* Mobile Hamburger & Search Input */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          title="Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Kunde, Rechnung suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Actions & Current Date */}
      <div className="flex items-center space-x-3 ml-4">
        {/* Date Display */}
        <div className="hidden xl:flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 mr-2 text-slate-500" />
          <span>Heute: {formatDate(today)}</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCustomerModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm border border-slate-200"
            title="Neuen Kunden anlegen"
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">+ Kunde</span>
          </button>

          <button
            onClick={onOpenMileageModal}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm border border-slate-200"
            title="Dienstfahrt erfassen"
          >
            <Car className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">+ Fahrt</span>
          </button>

          <button
            onClick={onOpenExpenseModal}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm border border-slate-200"
            title="Ausgabe erfassen"
          >
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">+ Ausgabe</span>
          </button>

          <button
            onClick={onOpenInvoiceModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-sky-600/20"
            title="Neue Rechnung erstellen"
          >
            <FilePlus className="w-4 h-4" />
            <span>+ Rechnung</span>
          </button>
        </div>
      </div>
    </header>
  );
}
