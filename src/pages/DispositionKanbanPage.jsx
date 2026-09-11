import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trello, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Layers, 
  ChevronRight, 
  X,
  MapPin,
  Check,
  ShieldCheck,
  Zap,
  Users,
  UserPlus,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';
import { formatDate, formatDateTime, getLeadSourceBadge, getStatusBadge } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export default function DispositionKanbanPage({
  customers = [],
  companySettings = {},
  initialCustomerId = null,
  onSelectCustomer,
  onOpenCustomerModal,
  onOpenInvoiceModal,
  onReloadAllData
}) {
  const { t, isTR } = useLanguage();
  const defaultOwnerName = companySettings?.ownerName || 'Huriye Ünalsoy';

  const COLUMNS = useMemo(() => [
    { 
      id: 'geplant', 
      title: isTR ? '1. Planlanan & Hazırlık' : '1. Geplant & Vorbereitung', 
      headerColor: 'text-sky-400',
      borderColor: 'border-sky-500/40',
      bgColor: 'bg-slate-900/90',
      columnBg: 'bg-slate-900/60',
      glowColor: 'shadow-sky-500/10'
    },
    { 
      id: 'in_progress', 
      title: isTR ? '2. Devam Eden (İşlemde)' : '2. In Bearbeitung', 
      headerColor: 'text-blue-400',
      borderColor: 'border-blue-500/40',
      bgColor: 'bg-slate-900/90',
      columnBg: 'bg-slate-900/60',
      glowColor: 'shadow-blue-500/10'
    },
    { 
      id: 'review', 
      title: isTR ? '3. Kalite Kontrol / Teslim' : '3. Qualitätskontrolle / Abnahme', 
      headerColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-slate-900/90',
      columnBg: 'bg-slate-900/60',
      glowColor: 'shadow-amber-500/10'
    },
    { 
      id: 'completed', 
      title: isTR ? '4. Tamamlandı & Faturalanabilir' : '4. Abgeschlossen & Abrechenbar', 
      headerColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-slate-900/90',
      columnBg: 'bg-slate-900/60',
      glowColor: 'shadow-emerald-500/10'
    }
  ], [isTR]);

  const [dispositions, setDispositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState(initialCustomerId || 'all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    customerName: '',
    project: '',
    priority: 'medium',
    status: 'geplant',
    tags: '',
    assignee: defaultOwnerName,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const loadDispositions = async () => {
    setLoading(true);
    try {
      const data = await api.getDispositions();
      setDispositions(data || []);
    } catch (err) {
      console.error('Fehler beim Laden der Dispositionen:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispositions();
  }, []);

  useEffect(() => {
    if (initialCustomerId) {
      setFilterCustomer(initialCustomerId);
    }
  }, [initialCustomerId]);

  // Synchronize Dispositions with real registered customers from Kundenverwaltung
  const enrichedDispositions = useMemo(() => {
    return dispositions.map(disp => {
      const matchedCust = customers.find(c => c.id === disp.customerId);
      return {
        ...disp,
        customerName: matchedCust ? matchedCust.companyName : (disp.customerName || 'Kunde'),
        customerObj: matchedCust || null
      };
    });
  }, [dispositions, customers]);

  // Filtered Dispositions
  const filteredDispositions = useMemo(() => {
    return enrichedDispositions.filter(item => {
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dispNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCustomer = filterCustomer === 'all' || item.customerId === filterCustomer;
      const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'all' || item.assignee === filterAssignee;

      return matchesSearch && matchesCustomer && matchesPriority && matchesAssignee;
    });
  }, [enrichedDispositions, searchTerm, filterCustomer, filterPriority, filterAssignee]);

  // Unique assignees for filter
  const assignees = useMemo(() => {
    const set = new Set();
    dispositions.forEach(d => {
      if (d.assignee) set.add(d.assignee);
    });
    return Array.from(set);
  }, [dispositions]);

  // Handle Move Column
  const handleMove = async (item, direction) => {
    const colOrder = ['geplant', 'in_progress', 'review', 'completed'];
    const currentIndex = colOrder.indexOf(item.status);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= colOrder.length) return;

    const nextStatus = colOrder[nextIndex];
    try {
      await api.updateDisposition(item.id, { status: nextStatus });
      await loadDispositions();
      if (onReloadAllData) await onReloadAllData();
    } catch (err) {
      alert('Fehler beim Verschieben: ' + err.message);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Möchten Sie diesen Auftrag wirklich löschen?')) return;
    try {
      await api.deleteDisposition(id);
      await loadDispositions();
      if (onReloadAllData) await onReloadAllData();
    } catch (err) {
      alert('Fehler beim Löschen: ' + err.message);
    }
  };

  // Handle Open Create / Edit Modal
  const handleOpenModal = (item = null, prefillCustId = null) => {
    if (item) {
      setEditingItem(item);
      const cust = customers.find(c => c.id === item.customerId);
      setFormData({
        title: item.title || '',
        customerId: item.customerId || '',
        customerName: cust ? cust.companyName : (item.customerName || ''),
        project: item.project || '',
        priority: item.priority || 'medium',
        status: item.status || 'geplant',
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
        assignee: item.assignee || defaultOwnerName,
        date: item.date || new Date().toISOString().split('T')[0],
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      const targetCustId = prefillCustId || (filterCustomer !== 'all' ? filterCustomer : customers[0]?.id || '');
      const defaultCust = customers.find(c => c.id === targetCustId) || customers[0] || null;

      setFormData({
        title: '',
        customerId: defaultCust?.id || '',
        customerName: defaultCust?.companyName || '',
        project: defaultCust?.address ? defaultCust.address.split(',')[1]?.trim() || defaultCust.address : (defaultCust?.businessType || ''),
        priority: 'medium',
        status: 'geplant',
        tags: '#Projekt, #Digitalisierung',
        assignee: defaultOwnerName,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      alert('Bitte wählen Sie einen registrierten Kunden aus der Kundenverwaltung aus.');
      return;
    }

    try {
      const matchedCust = customers.find(c => c.id === formData.customerId);
      const tagList = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`)
        : [];

      const payload = {
        ...formData,
        customerName: matchedCust ? matchedCust.companyName : formData.customerName,
        tags: tagList
      };

      if (editingItem) {
        await api.updateDisposition(editingItem.id, payload);
      } else {
        await api.createDisposition(payload);
      }

      setModalOpen(false);
      await loadDispositions();
      if (onReloadAllData) await onReloadAllData();
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    }
  };

  // Selected customer object for modal preview
  const modalSelectedCustomer = useMemo(() => {
    return customers.find(c => c.id === formData.customerId) || null;
  }, [customers, formData.customerId]);

  // Priority Badge Helper
  const getPriorityPill = (priority) => {
    switch (priority) {
      case 'high':
      case 'hoch':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/50 bg-rose-500/10 text-rose-400">
            Hoch
          </span>
        );
      case 'medium':
      case 'mittel':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-400">
            Mittel
          </span>
        );
      case 'low':
      case 'niedrig':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
            Niedrig
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1700px] mx-auto space-y-6 animate-fadeIn min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-sky-400 rounded-xl shadow-xs">
              <Trello className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>{t('disposition.title', 'Auftragsdisposition & Kanban-Board')}</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isTR 
              ? <>Müşteri yönetiminizdeki <strong>{customers.length} kayıtlı müşteri</strong> ile bağlantılı gerçek zamanlı iş planlaması</> 
              : <>Echtzeit-Planung verknüpft mit <strong>{customers.length} registrierten Kunden</strong> aus Ihrer Kundenverwaltung</>}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isTR ? '+ Müşteri İçin Görev / İş Ekle' : '+ Auftrag für Kunde anlegen'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 min-w-0 max-w-full overflow-hidden">
        {/* Search */}
        <div className="relative flex-1 max-w-full md:max-w-md min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder={t('disposition.searchPlaceholder', 'Auftrag, DISP-Nr., Kunde oder #Tag suchen...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
          {/* Customer Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 w-full sm:w-auto max-w-full min-w-0">
            <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer flex-1 min-w-0 truncate max-w-full"
            >
              <option value="all" className="bg-slate-900">{isTR ? `Tüm Müşteriler (${customers.length})` : `Alle Kunden (${customers.length})`}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.companyName} {c.contactPerson ? `(${c.contactPerson})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer min-w-0"
          >
            <option value="all" className="bg-slate-900">{isTR ? 'Tüm Öncelikler' : 'Alle Prioritäten'}</option>
            <option value="high" className="bg-slate-900">🔴 {isTR ? 'Yüksek' : 'Hoch'}</option>
            <option value="medium" className="bg-slate-900">🟡 {isTR ? 'Orta' : 'Mittel'}</option>
            <option value="low" className="bg-slate-900">🟢 {isTR ? 'Düşük' : 'Niedrig'}</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer min-w-0"
          >
            <option value="all" className="bg-slate-900">{isTR ? 'Tüm Sorumlular' : 'Alle Mitarbeiter'}</option>
            {assignees.map(a => (
              <option key={a} value={a} className="bg-slate-900">{a}</option>
            ))}
          </select>

          {filterCustomer !== 'all' && (
            <button
              onClick={() => setFilterCustomer('all')}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              title={isTR ? 'Filtreyi Temizle' : 'Kundenfilter zurücksetzen'}
            >
              <X className="w-3.5 h-3.5" />
              <span>{isTR ? 'Filtreyi Kaldır' : 'Filter aufheben'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4-COLUMN KANBAN BOARD (Matching User's Screenshot Design & Glow)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colItems = filteredDispositions.filter(d => d.status === col.id);
          const colIndex = COLUMNS.findIndex(c => c.id === col.id);

          return (
            <div 
              key={col.id}
              className="bg-slate-950/90 rounded-2xl sm:rounded-3xl border border-slate-800/80 p-3 sm:p-4 flex flex-col space-y-3.5 min-w-0 shadow-xl"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 py-1 border-b border-slate-800/60 pb-2.5">
                <h3 className={`font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5 ${col.headerColor}`}>
                  <span>{col.title}</span>
                </h3>
                <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {colItems.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3.5 min-h-[500px]">
                {colItems.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-600 text-xs flex flex-col items-center justify-center h-48">
                    <span>Keine Aufträge in dieser Phase</span>
                  </div>
                ) : (
                  colItems.map((item) => {
                    const leadBadge = getLeadSourceBadge(item.customerObj?.leadSource);

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 shadow-lg hover:shadow-xl transition-all duration-200 text-slate-200 group"
                      >
                        {/* Top: DISP-ID & Priority */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider">
                            {item.dispNumber || item.id}
                          </span>
                          {getPriorityPill(item.priority)}
                        </div>

                        {/* Title */}
                        <h4 className="font-black text-sm sm:text-base text-white tracking-tight leading-snug break-words">
                          {item.title}
                        </h4>

                        {/* Customer & Project Subtitle */}
                        <div className="space-y-1 text-xs">
                          <div 
                            onClick={() => {
                              if (item.customerId && onSelectCustomer) {
                                onSelectCustomer(item.customerId);
                              }
                            }}
                            className={`font-bold text-slate-100 flex items-center gap-1.5 flex-wrap ${
                              item.customerId ? 'hover:text-sky-400 cursor-pointer transition' : ''
                            }`}
                            title={item.customerId ? 'Kundenprofil in Kundenverwaltung öffnen' : ''}
                          >
                            <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="break-words">{item.customerName}</span>
                            {leadBadge && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${leadBadge.bg} ${leadBadge.text} ${leadBadge.border}`}>
                                {leadBadge.label}
                              </span>
                            )}
                          </div>

                          {item.project && (
                            <p className="text-[11.5px] text-sky-400 font-medium truncate pl-5">
                              {item.project}
                            </p>
                          )}
                        </div>

                        {/* Tags */}
                        {Array.isArray(item.tags) && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.tags.map((t, idx) => (
                              <span 
                                key={idx} 
                                className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Assignee & Date */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{item.assignee || 'Unzugewiesen'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{formatDate(item.date)}</span>
                          </div>
                        </div>

                        {/* Actions Row (Matching Screenshot: Zurück, Delete, Weiter / Fertig) */}
                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-800/80">
                          {/* Back Button */}
                          <button
                            onClick={() => handleMove(item, -1)}
                            disabled={colIndex === 0}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                              colIndex === 0 
                                ? 'opacity-20 cursor-not-allowed text-slate-600 bg-slate-800/40' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                            }`}
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Zurück</span>
                          </button>

                          {/* Quick Edit & Delete icons */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleOpenModal(item)}
                              title="Bearbeiten"
                              className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              title="Löschen"
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Forward / Finish Button */}
                          {col.id === 'completed' ? (
                            <button
                              onClick={() => {
                                if (onOpenInvoiceModal) {
                                  const prefilled = {
                                    title: `${item.title} (${item.project || 'Auftrag'})`,
                                    price: 0,
                                    type: 'einmalig'
                                  };
                                  onOpenInvoiceModal(item.customerId || null, null, prefilled);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                              title="+ Rechnung direkt aus Auftrag erstellen"
                            >
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Fertig / +RE</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMove(item, 1)}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
                            >
                              <span>Weiter</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT AUFTRAG & DISPOSITION                                */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-xl">
                  <Trello className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingItem ? 'Auftragsdisposition bearbeiten' : 'Neuen Auftrag anlegen'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Disposition für TeamTrack Kanban & Kundenverwaltung
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* PRIMARY CUSTOMER SELECTOR (From Kundenverwaltung) */}
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sky-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-sky-400" />
                    Kunde aus Kundenverwaltung auswählen *
                  </label>

                  {onOpenCustomerModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false);
                        onOpenCustomerModal();
                      }}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Neuer Kunde</span>
                    </button>
                  )}
                </div>

                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => {
                    const custId = e.target.value;
                    const matched = customers.find(c => c.id === custId);
                    setFormData({
                      ...formData,
                      customerId: custId,
                      customerName: matched ? matched.companyName : '',
                      project: formData.project || (matched?.address ? matched.address.split(',')[1]?.trim() || matched.address : '')
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white font-bold text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Kunde auswählen ({customers.length} registriert) --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} {c.contactPerson ? `• z.Hd. ${c.contactPerson}` : ''}
                    </option>
                  ))}
                </select>

                {/* Selected Customer Info Box */}
                {modalSelectedCustomer && (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 text-[11.5px] space-y-1 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{modalSelectedCustomer.companyName}</span>
                      {modalSelectedCustomer.leadSource && (() => {
                        const b = getLeadSourceBadge(modalSelectedCustomer.leadSource);
                        return b ? (
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${b.bg} ${b.text} ${b.border}`}>
                            {b.label}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    {modalSelectedCustomer.contactPerson && (
                      <div className="text-slate-400">Ansprechpartner: <span className="text-slate-200">{modalSelectedCustomer.contactPerson}</span></div>
                    )}
                    {modalSelectedCustomer.address && (
                      <div className="text-slate-400">Adresse: <span className="text-slate-200">{modalSelectedCustomer.address}</span></div>
                    )}
                  </div>
                )}
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Auftragsbezeichnung / Aufgabe *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Elektro-Hauptverteilung installieren"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Project / Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Projekt / Baustellen-Ort / Bereich
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Wohnpark Würzburg-Nord oder Sanierung"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Ausführungsdatum / Termin
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Column Status, Priority & Assignee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Kanban-Spalte (Status)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="geplant">1. Geplant & Vorbereitung</option>
                    <option value="in_progress">2. In Bearbeitung</option>
                    <option value="review">3. Qualitätskontrolle / Abnahme</option>
                    <option value="completed">4. Abgeschlossen & Abrechenbar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Priorität
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="high">🔴 Hoch</option>
                    <option value="medium">🟡 Mittel</option>
                    <option value="low">🟢 Niedrig</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Zuständiger Mitarbeiter
                  </label>
                  <input
                    type="text"
                    list="modal-assignees-list"
                    placeholder={`z.B. ${defaultOwnerName}`}
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <datalist id="modal-assignees-list">
                    <option value={defaultOwnerName} />
                    {assignees.filter(a => a !== defaultOwnerName).map(a => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Schlagwörter / Tags (kommagetrennt)
                </label>
                <input
                  type="text"
                  placeholder="#Baustelle, #Elektro, #Dringend, #Abnahme"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Notizen & Arbeitsanweisungen
                </label>
                <textarea
                  rows={3}
                  placeholder="Details zur Durchführung, Materialbedarf, Prüfpunkte..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-md transition cursor-pointer"
                >
                  {editingItem ? 'Änderungen speichern' : 'Auftrag erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
