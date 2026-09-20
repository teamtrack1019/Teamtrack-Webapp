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
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onOpenCustomerModal, 
  onOpenInvoiceModal, 
  onOpenMileageModal, 
  onOpenExpenseModal, 
  onToggleMobileMenu,
  onOpenMobileMenu 
}) {
  const { t, lang } = useLanguage();
  const today = new Date().toISOString();
  const handleToggleMenu = onToggleMobileMenu || onOpenMobileMenu;

  return (
    <header className="sticky top-0 w-full max-w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-4 md:px-6 pt-[env(safe-area-inset-top,0px)] h-[calc(3.75rem+env(safe-area-inset-top,0px))] sm:h-[calc(4rem+env(safe-area-inset-top,0px))] min-h-[3.75rem] flex items-center justify-between shrink-0 z-30 shadow-xs overflow-hidden">
      {/* Mobile Hamburger & Search Input */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 flex-1 min-w-0 max-w-md">
        <button
          type="button"
          onClick={handleToggleMenu}
          className="md:hidden flex items-center justify-center p-2 min-w-[38px] min-h-[38px] rounded-xl text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition shadow-xs border border-slate-200 shrink-0 cursor-pointer"
          title={t('nav.openMenu', 'Menü')}
          aria-label={t('nav.openMenu', 'Menü')}
        >
          <Menu className="w-5 h-5 text-slate-900 stroke-[2.5]" />
        </button>

        <div className="flex items-center w-full min-w-0 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder={t('nav.searchPlaceholder', 'Kunde, Rechnung suchen...')}
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full pl-8.5 sm:pl-10 pr-2.5 sm:pr-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all min-w-0"
          />
        </div>
      </div>

      {/* Actions, Language Switcher & Current Date */}
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 ml-1 sm:ml-2 shrink-0">
        {/* Language Switcher */}
        <LanguageToggle />

        {/* Date Display */}
        <div className="hidden xl:flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 mr-2 text-slate-500" />
          <span>{t('nav.today', 'Heute')}: {formatDate(today)}</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCustomerModal}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm border border-slate-200 cursor-pointer"
            title={t('customers.addCustomer', 'Neuen Kunden anlegen')}
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">{t('nav.newCustomer', '+ Kunde')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenMileageModal}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm border border-slate-200 cursor-pointer"
            title={t('mileage.newTrip', 'Dienstfahrt erfassen')}
          >
            <Car className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('nav.newMileage', '+ Fahrt')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExpenseModal}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm border border-slate-200 cursor-pointer"
            title={t('expenses.newExpense', 'Ausgabe erfassen')}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('nav.newExpense', '+ Ausgabe')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenInvoiceModal}
            className="flex items-center space-x-1 px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-sky-600/20 cursor-pointer shrink-0"
            title={t('invoices.newInvoice', 'Neue Rechnung erstellen')}
          >
            <FilePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">{t('nav.newInvoice', '+ Rechnung')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
