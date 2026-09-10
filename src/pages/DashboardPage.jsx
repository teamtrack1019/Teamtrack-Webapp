import React from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Receipt, 
  Car, 
  Landmark, 
  Repeat, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  Sparkles,
  Bell
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardPage({ 
  stats = {}, 
  customers = [],
  services = [],
  invoices = [],
  onNavigate, 
  onOpenCustomerModal, 
  onOpenInvoiceModal, 
  onSelectCustomer,
  onBulkGenerateAbos 
}) {
  const { t, isTR } = useLanguage();
  const safeStats = stats || {};

  const getInvTotal = (inv) => {
    const itemSum = (inv.items || []).reduce((s, it) => s + ((Number(it.unitPrice) || 0) * (Number(it.quantity) || 1)), 0);
    return itemSum > 0 ? itemSum : Number(inv.netAmount || inv.grossAmount || inv.totalAmount || 0);
  };

  const getInvoiceType = (inv) => {
    if (inv.serviceType) return inv.serviceType;
    if (inv.type === 'abo' || inv.type === 'einmalig') return inv.type;
    const desc = (inv.items || []).map(i => (i.description || '').toLowerCase()).join(' ');
    if (desc.includes('abo') || desc.includes('monatlich') || desc.includes('cloud-service') || desc.includes('betreuung')) {
      return 'abo';
    }
    return 'einmalig';
  };

  const allInvoices = (invoices && invoices.length > 0) ? invoices : (safeStats.recentInvoices || []);
  const paidInvoices = allInvoices.filter(i => i.status === 'paid');
  const liveTotalPaidRevenue = paidInvoices.length > 0
    ? paidInvoices.reduce((sum, i) => sum + getInvTotal(i), 0)
    : (safeStats.totalPaidRevenue || 0);

  const liveTotalGrossRevenue = liveTotalPaidRevenue;

  const pendingInvoices = allInvoices.filter(i => i.status === 'sent');
  const liveTotalPendingAmount = pendingInvoices.reduce((sum, i) => sum + getInvTotal(i), 0);
  const livePendingCount = pendingInvoices.length;

  const totalAboInvoicesCount = allInvoices.filter(i => getInvoiceType(i) === 'abo').length;
  const totalEinmalInvoicesCount = allInvoices.filter(i => getInvoiceType(i) === 'einmalig').length;

  const allServices = (services && services.length > 0) ? services : [];
  const activeAbos = allServices.filter(s => s.type === 'abo' && s.status === 'active');
  const liveMrr = activeAbos.length > 0
    ? activeAbos.reduce((sum, s) => {
        let monthly = Number(s.price || 0);
        if (s.billingInterval === 'yearly') monthly = monthly / 12;
        if (s.billingInterval === 'quarterly') monthly = monthly / 3;
        return sum + monthly;
      }, 0)
    : (safeStats.mrr || 0);
  const liveActiveAbosCount = activeAbos.length > 0 ? activeAbos.length : (safeStats.activeAbosCount || 0);

  const recentInvoices = allInvoices.slice(-10).reverse();
  const recentCustomers = (customers && customers.length > 0) ? customers.slice(-10).reverse() : (safeStats.recentCustomers || []);

  const totalExpenses = safeStats.totalExpenses || 0;
  const totalKmDeduction = safeStats.totalKmDeduction || 0;
  const estimatedYearlyProfit = liveTotalPaidRevenue - totalExpenses - totalKmDeduction;

  const deMonths = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const trMonths = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const monthNames = isTR ? trMonths : deMonths;
  const currentMonthName = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-8 space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 md:p-8 rounded-3xl text-white shadow-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>{t('sidebar.subtitle', 'Softwareentwicklung & IT-Beratung')}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {t('dashboard.welcomeTitle', 'Willkommen bei TeamTrack')}
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            {t('dashboard.welcomeSubtitle', 'Kundenverwaltung, monatliche Abos, Einmalleistungen, Rechnungswesen und Finanzamt-Fahrtenbuch.')}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
          <button
            onClick={onOpenCustomerModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-sky-600/30 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>{t('customers.addCustomer', '+ Neuer Kunde')}</span>
          </button>
          <button
            onClick={onOpenInvoiceModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>{t('nav.newInvoice', '+ Rechnung')}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('dashboard.monthlyRevenue', 'Monatliche Abos (MRR)')}
          value={formatCurrency(liveMrr)}
          subtitle={`${liveActiveAbosCount} ${isTR ? 'aktif sözleşme' : 'aktive Verträge'}`}
          icon={Repeat}
          color="sky"
          badge={isTR ? 'Abonelik' : 'Wiederkehrend'}
          badgeColor="bg-sky-100 text-sky-800"
          onClick={() => onNavigate('customers')}
        />

        <StatCard
          title={isTR ? 'Toplam Gelir (Net)' : 'Einnahmen (Netto)'}
          value={formatCurrency(liveTotalPaidRevenue)}
          subtitle={`${isTR ? 'Brüt' : 'Brutto'}: ${formatCurrency(liveTotalGrossRevenue)}`}
          icon={TrendingUp}
          color="emerald"
          badge={isTR ? 'Gelir' : 'Umsatz'}
          badgeColor="bg-emerald-100 text-emerald-800"
          onClick={() => onNavigate('invoices')}
        />

        <StatCard
          title={isTR ? 'Giderler (Net)' : 'Ausgaben (Netto)'}
          value={formatCurrency(totalExpenses)}
          subtitle={`${isTR ? 'Brüt' : 'Brutto'}: ${formatCurrency(safeStats.totalExpensesGross || totalExpenses)}`}
          icon={Receipt}
          color="amber"
          badge={isTR ? 'Gider' : 'Ausgaben'}
          badgeColor="bg-amber-100 text-amber-800"
          onClick={() => onNavigate('expenses')}
        />

        <StatCard
          title={isTR ? 'KM Vergi İndirimi' : 'Finanzamt KM-Abzug'}
          value={formatCurrency(totalKmDeduction)}
          subtitle={`${safeStats.totalKm ? Number(safeStats.totalKm).toFixed(1) : '0.0'} km (0,30 €/km)`}
          icon={Car}
          color="purple"
          badge={isTR ? 'Yol Defteri' : 'Fahrtenbuch'}
          badgeColor="bg-purple-100 text-purple-800"
          onClick={() => onNavigate('mileage')}
        />
      </div>

      {/* 2 COMPLETELY SEPARATE NOTIFICATION PANELS: 1 FOR ABOS, 1 FOR EINMALIGE LEISTUNGEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* NOTIFICATION PANEL 1: MONATLICHE ABONNEMENTS */}
        {(() => {
          const unbilledAbos = safeStats.unbilledAbosCount || 0;
          return (
            <div className={`rounded-3xl p-5 md:p-6 border-2 shadow-sm flex flex-col justify-between gap-5 transition-all ${
              unbilledAbos > 0
                ? 'bg-gradient-to-br from-amber-50 via-sky-50 to-indigo-50 border-sky-400 shadow-sky-500/10'
                : 'bg-gradient-to-br from-slate-50 to-sky-50/30 border-slate-200'
            }`}>
              <div className="flex items-start space-x-3.5">
                <div className={`p-3 rounded-2xl shrink-0 shadow-md ${
                  unbilledAbos > 0 
                    ? 'bg-sky-600 text-white shadow-sky-600/30' 
                    : 'bg-slate-700 text-white shadow-slate-700/20'
                }`}>
                  {unbilledAbos > 0 ? (
                    <Repeat className="w-6 h-6 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      unbilledAbos > 0
                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {unbilledAbos > 0 ? (isTR ? '🔔 1. AYLIK ABONELİKLER' : '🔔 1. MONATLICHE ABOS') : (isTR ? '✓ 1. ABONELİKLER GÜNCEL' : '✓ 1. ABOS AKTUELL')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold truncate">
                      {currentMonthName} {currentYear}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base md:text-lg mt-1.5 leading-snug">
                    {unbilledAbos > 0
                      ? (isTR ? `${unbilledAbos} adet faturalandırılacak aktif abonelik var` : `${unbilledAbos} aktive(s) Kunden-Abo(s) fällig`)
                      : (isTR ? `Tüm abonelikler (${totalAboInvoicesCount}) faturalandırıldı` : `Alle Abos (${totalAboInvoicesCount}) abgerechnet`)}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {unbilledAbos > 0
                      ? (isTR ? 'Bu ay için devam eden müşteri bakım ve hizmet sözleşmeleri fatura kesilmeyi bekliyor.' : 'Laufende monatliche Betreuungsverträge für diesen Monat warten auf Rechnungsstellung.')
                      : (isTR ? 'Harika! Bu ayki tüm aktif müşteri aboneliklerinin faturaları önceden kesildi.' : 'Super! Für alle laufenden Verträge wurden in diesem Monat bereits die Rechnungen gestellt.')}
                  </p>
                </div>
              </div>

              {unbilledAbos > 0 && onBulkGenerateAbos && (
                <button
                  onClick={() => onBulkGenerateAbos('abo')}
                  className="w-full sm:w-auto self-end px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-sky-200" />
                  <span>{isTR ? '⚡ Yalnızca Fatura Bekleyen Abonelikleri Kes' : '⚡ Nur fällige Abos abrechnen'}</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* NOTIFICATION PANEL 2: EINMALIGE LEISTUNGEN */}
        {(() => {
          const unbilledEinmalige = safeStats.unbilledEinmaligeCount || 0;
          return (
            <div className={`rounded-3xl p-5 md:p-6 border-2 shadow-sm flex flex-col justify-between gap-5 transition-all ${
              unbilledEinmalige > 0
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 border-emerald-500 shadow-emerald-500/10'
                : 'bg-gradient-to-br from-slate-50 to-emerald-50/20 border-slate-200'
            }`}>
              <div className="flex items-start space-x-3.5">
                <div className={`p-3 rounded-2xl shrink-0 shadow-md ${
                  unbilledEinmalige > 0 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                    : 'bg-slate-700 text-white shadow-slate-700/20'
                }`}>
                  {unbilledEinmalige > 0 ? (
                    <Zap className="w-6 h-6 text-yellow-300 animate-bounce" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      unbilledEinmalige > 0
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {unbilledEinmalige > 0 ? (isTR ? '🔔 2. TEK SEFERLİK İŞLER' : '🔔 2. EINMALIGE LEISTUNGEN') : (isTR ? '✓ 2. İŞLER GÜNCEL' : '✓ 2. LEISTUNGEN AKTUELL')}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base md:text-lg mt-1.5 leading-snug">
                    {unbilledEinmalige > 0
                      ? (isTR ? `${unbilledEinmalige} tamamlanan proje fatura bekliyor` : `${unbilledEinmalige} erledigte Einmalleistung(en) fällig`)
                      : (isTR ? `Tüm tamamlanan projeler (${totalEinmalInvoicesCount}) faturalandırıldı` : `Alle erledigten Einmalleistungen (${totalEinmalInvoicesCount}) abgerechnet`)}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {unbilledEinmalige > 0
                      ? (isTR ? 'Tamamlanan kurulum, dijitalleştirme ve özel geliştirme projeleri için fatura oluşturabilirsiniz.' : 'Abgeschlossene Digitalisierungs- & Setup-Projekte warten auf Rechnungsstellung.')
                      : (isTR ? 'Çok iyi! Fatura kesilmemiş açık tek seferlik proje bulunmuyor.' : 'Klasse! Es gibt derzeit keine offenen Einmalleistungen ohne gestellte Rechnung.')}
                  </p>
                </div>
              </div>

              {unbilledEinmalige > 0 && onBulkGenerateAbos && (
                <button
                  onClick={() => onBulkGenerateAbos('einmalig')}
                  className="w-full sm:w-auto self-end px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{isTR ? '⚡ Yalnızca Proje Faturalarını Kes' : '⚡ Nur Einmalleistungen sofort abrechnen'}</span>
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Main Grid: Left Side (Invoices) vs Right Side (Finanzamt & Customers) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Columns Width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoices Status Banner */}
          <div className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border transition-all ${
            livePendingCount > 0
              ? 'bg-amber-50 border-amber-200'
              : 'bg-emerald-50/80 border-emerald-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl shrink-0 text-white ${
                livePendingCount > 0 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}>
                {livePendingCount > 0 ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className={`font-bold text-sm ${
                  livePendingCount > 0 ? 'text-amber-900' : 'text-emerald-900'
                }`}>
                  {livePendingCount > 0
                    ? (isTR ? `${livePendingCount} açık / ödenmemiş fatura bekliyor` : `${livePendingCount} offene Rechnung(en) ausstehend`)
                    : (isTR ? '✓ Bekleyen açık fatura yok' : '✓ Keine offenen Rechnungen')}
                </h4>
                <p className={`text-xs ${
                  livePendingCount > 0 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {livePendingCount > 0
                    ? <>{isTR ? 'Bekleyen Toplam Tutar: ' : 'Offener Gesamtbetrag: '}<strong className="font-bold">{formatCurrency(livePendingAmount)}</strong></>
                    : (isTR ? 'Harika! Tüm müşteri faturaları eksiksiz tahsil edildi.' : 'Perfekt! Alle Kundenrechnungen wurden vollständig bezahlt.')}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className={`px-3.5 py-1.5 bg-white rounded-xl text-xs font-bold transition self-start sm:self-auto shadow-sm border cursor-pointer ${
                livePendingCount > 0
                  ? 'border-amber-300 hover:bg-amber-100 text-amber-900'
                  : 'border-emerald-300 hover:bg-emerald-100 text-emerald-900'
              }`}
            >
              {isTR ? 'Faturalar →' : 'Rechnungen →'}
            </button>
          </div>

          {/* Recent Invoices Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{t('dashboard.recentInvoices', 'Neueste Ausgangsrechnungen')}</h3>
                <p className="text-xs text-slate-500">{isTR ? 'Son oluşturulan müşteri faturaları' : 'Zuletzt erstellte Kundenrechnungen'}</p>
              </div>
              <button
                onClick={() => onNavigate('invoices')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{t('common.all', 'Alle')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5 w-28">{t('invoices.invoiceNumber', 'Rechnungs-Nr.')}</th>
                    <th className="p-3.5">{t('invoices.customer', 'Kunde')}</th>
                    <th className="p-3.5 w-24">{t('invoices.invoiceDate', 'Datum')}</th>
                    <th className="p-3.5 text-center w-24">{isTR ? 'Tür' : 'Art'}</th>
                    <th className="p-3.5 text-right w-24">{t('common.amount', 'Betrag')}</th>
                    <th className="p-3.5 text-center pr-5 w-20">{t('common.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices && recentInvoices.length > 0 ? (
                    recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-800">
                          {inv.invoiceNumber}
                        </td>
                        <td className="p-3.5 font-medium text-slate-800">
                          {inv.customerName}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {formatDate(inv.date)}
                        </td>
                        <td className="p-3.5 text-center">
                          {inv.items && inv.items.some(item => item.isAbo || item.type === 'abo') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              <Repeat className="w-2.5 h-2.5 text-sky-500" />
                              {isTR ? 'Abo' : 'Abo'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Zap className="w-2.5 h-2.5 text-emerald-500" />
                              {isTR ? 'Proje' : 'Einmalig'}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-extrabold text-slate-900">
                          {formatCurrency(inv.grossAmount || inv.totalAmount)}
                        </td>
                        <td className="p-3.5 text-center pr-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            inv.status === 'paid' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : inv.status === 'sent' 
                              ? 'bg-sky-100 text-sky-800' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {inv.status === 'paid' ? (isTR ? 'Ödendi' : 'Bezahlt') : inv.status === 'sent' ? (isTR ? 'Açık' : 'Offen') : (isTR ? 'Taslak' : 'Entwurf')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        {t('dashboard.noRecentInvoices', 'Noch keine Rechnungen vorhanden.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Column Width) */}
        <div className="space-y-6">
          {/* Finanzamt EÜR Vorschau Box */}
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-sm text-white">{isTR ? 'Vergi / EÜR Özeti' : 'Finanzamt EÜR'}</h4>
              </div>
              <span className="text-[10px] font-semibold bg-white/10 px-2 py-0.5 rounded text-sky-200">
                {isTR ? 'Cari Yıl' : 'Laufendes Jahr'}
              </span>
            </div>

            <div className="space-y-2 text-xs border-y border-white/10 py-3 my-3">
              <div className="flex justify-between text-slate-300">
                <span>{isTR ? 'Gelirler (Net):' : 'Einnahmen (Netto):'}</span>
                <span className="font-semibold text-white font-mono">{formatCurrency(liveTotalPaidRevenue)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{isTR ? 'Giderler (Net):' : 'Ausgaben (Netto):'}</span>
                <span className="font-semibold text-rose-300 font-mono">- {formatCurrency(safeStats.totalExpenses || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{isTR ? 'KM Yol İndirimi:' : 'KM-Pauschale Abzug:'}</span>
                <span className="font-semibold text-emerald-300 font-mono">- {formatCurrency(safeStats.totalKmDeduction || 0)}</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-300">{isTR ? 'Net Kazanç:' : 'Reingewinn:'}</span>
                <span className={`text-base font-black font-mono ${estimatedYearlyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(estimatedYearlyProfit)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('tax-report')}
              className="mt-4 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/30 cursor-pointer"
            >
              <span>{isTR ? 'Yıllık Rapor & Vergi PDF' : 'Jahresbericht & Steuer-PDF'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Customers Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">{isTR ? 'Son Müşteriler' : 'Aktuelle Kunden'}</h4>
              <button
                onClick={() => onNavigate('customers')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                {isTR ? `Tümü (${customers.length})` : `Alle (${customers.length})`}
              </button>
            </div>

            <div className="space-y-2">
              {recentCustomers && recentCustomers.length > 0 ? (
                recentCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCustomer(c.id)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{c.companyName}</div>
                      <div className="text-[11px] text-slate-500">{c.contactPerson || c.businessType}</div>
                    </div>
                    {c.demoEmailSent ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Demo Mail
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        {isTR ? 'E-Posta Yok' : 'Kein Mail'}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-3">
                  {t('dashboard.noRecentCustomers', 'Noch keine Kunden angelegt.')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
