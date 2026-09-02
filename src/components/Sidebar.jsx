import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Receipt, 
  Car, 
  Landmark, 
  Settings, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts = {} }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Kundenverwaltung', icon: Users, badge: counts.customers },
    { id: 'invoices', label: 'Ausgehende Rechnungen', icon: FileText, badge: counts.pendingInvoices, badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'expenses', label: 'Eingehende Belege (Ausgaben)', icon: Receipt, badge: counts.expenses },
    { id: 'mileage', label: 'KM-Tracking / Fahrtenbuch', icon: Car },
    { id: 'tax-report', label: 'Finanzamt & Jahresbericht', icon: Landmark, highlight: true },
    { id: 'settings', label: 'Einstellungen', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              TeamTrack
              <span className="text-[10px] uppercase font-semibold bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30">Pro</span>
            </h1>
            <p className="text-xs text-slate-400 truncate">Papierkram → Digital</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Hauptmenü
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isActive 
                    ? 'bg-white text-sky-700' 
                    : item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Business Info Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-200">Finanzamt Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            EÜR, 0,30 €/km Pauschale & MwSt. jederzeit als PDF exportierbar.
          </p>
        </div>
      </div>
    </aside>
  );
}
