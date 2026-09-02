import React, { useState, useEffect } from 'react';
import { Mail, Send, Sparkles, CheckCircle2, X, Copy, Check, ExternalLink, Globe } from 'lucide-react';

const EMAIL_TEMPLATES = {
  digitalisierung_intro: {
    name: '1. Papierlose Prozesse & Digitalisierung',
    subject: 'Digitale Prozessoptimierung & smarte Web-Lösungen für Ihr Unternehmen – TeamTrack',
    body: (cust) => `Sehr geehrte Damen und Herren, 

viele Unternehmen verlieren täglich wertvolle Arbeitszeit durch manuelle Papierprozesse, unübersichtliche Zeiterfassungen und aufwendige Rechnungsstellungen.
Wir bei TeamTrack unterstützen Unternehmen dabei, ihre täglichen Arbeitsabläufe durch smarte digitale Lösungen zu vereinfachen, Bürokratie abzubauen und Kosten zu senken.

Unsere Kernbereiche im Überblick:
• Papierlose Prozesse & Digitalisierung: Schluss mit Zettelwirtschaft – alle Dokumente und Abläufe zentral und digital.
• Digitale Zeit- & km-Erfassung: Rechtssichere und unkomplizierte Zeiterfassung für Mitarbeiter sowie transparente Fahrtenerfassung.
• Automatische Rechnungsstellung: Rechnungen mit wenigen Klicks fehlerfrei und automatisiert erstellen.
• Mitarbeiter- & Kundenverwaltung: Übersichtliche Nachverfolgung aller Einsätze und Kundenprozesse.
• Individuelle Web-Apps & Web-Optimierung: Moderne, schnelle Web-Lösungen, die genau auf Ihre Betriebsabläufe zugeschnitten sind.

Bei Interesse oder Fragen stehen wir Ihnen jederzeit gerne für einen unverbindlichen Austausch zur Verfügung. Sie erreichen uns einfach per E-Mail oder telefonisch.
Wir freuen uns auf Ihre Kontaktaufnahme.

Mit freundlichen Grüßen
TeamTrack

Tel: 0172 4690446
E-Mail: teamtrack.software@hotmail.com
Balthasar-Neumann-Str.38
97236 Randersacker`
  },
  demo_access: {
    name: '2. Live-Demo & Testzugang Einladung',
    subject: 'Ihr persönlicher Demo-Zugang: Digitale WebApp & Zeiterfassung – TeamTrack',
    body: (cust) => `Hallo Frau/Herr ${cust.contactPerson || cust.companyName},

wie besprochen habe ich für ${cust.companyName} eine Vorschau-Umgebung vorbereitet, damit Sie und Ihr Team die Vorteile direkt live testen können.

Link zur WebApp Demo: https://teamtrack-webapp.vercel.app
Test-Login: ${cust.email || 'demo@ihrefirma.de'}

Probieren Sie gerne aus, wie schnell Aufträge, Stundenzettel und Mitarbeiterberichte erfasst werden können. Bei Fragen stehe ich Ihnen jederzeit persönlich zur Verfügung.

Mit freundlichen Grüßen
TeamTrack

Tel: 0172 4690446
E-Mail: teamtrack.software@hotmail.com
Balthasar-Neumann-Str.38
97236 Randersacker`
  },
  follow_up: {
    name: '3. Follow-Up nach Erstgespräch',
    subject: 'Zusammenfassung unseres Gesprächs & Nächste Schritte – TeamTrack',
    body: (cust) => `Guten Tag Frau/Herr ${cust.contactPerson || cust.companyName},

vielen Dank für das aufschlussreiche Gespräch heute.

Wie besprochen können wir die Digitalisierung Ihrer Papierformulare und die Einrichtung Ihrer individuellen WebApp innerhalb von wenigen Tagen schlüsselfertig für Sie umsetzen.

Ich freue mich auf Ihre Rückmeldung zur weiteren Vorgehensweise.

Mit freundlichen Grüßen
TeamTrack

Tel: 0172 4690446
E-Mail: teamtrack.software@hotmail.com
Balthasar-Neumann-Str.38
97236 Randersacker`
  }
};

export default function DemoEmailModal({ isOpen, onClose, customer, onEmailSent }) {
  const [templateKey, setTemplateKey] = useState('digitalisierung_intro');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (customer) {
      const template = EMAIL_TEMPLATES[templateKey] || EMAIL_TEMPLATES.digitalisierung_intro;
      setSubject(template.subject);
      setBody(template.body(customer));
    }
  }, [customer, templateKey]);

  if (!isOpen || !customer) return null;

  // 1. Send via native Outlook / Mail App (mailto)
  const handleSendViaOutlookApp = async () => {
    setLoading(true);
    try {
      await onEmailSent(customer.id, { subject, body, templateType: templateKey });
      const mailtoUrl = `mailto:${encodeURIComponent(customer.email || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      onClose();
    } catch (err) {
      alert('Fehler: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Open directly in Outlook Web / Hotmail Web
  const handleOpenOutlookWeb = async () => {
    setLoading(true);
    try {
      await onEmailSent(customer.id, { subject, body, templateType: templateKey });
      const webmailUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(customer.email || '')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(webmailUrl, '_blank');
      onClose();
    } catch (err) {
      alert('Fehler: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    const fullText = `Betreff: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Outlook / E-Mail Gönder</h3>
              <p className="text-xs text-sky-100">
                Resmi tanıtım şablonunu tek tıkla doğrudan Outlook hesabınızdan gönderin
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Customer Info Card */}
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-sky-950 text-sm">{customer.companyName}</span>
              <span className="text-sky-700 ml-2">({customer.contactPerson || 'Kein Ansprechpartner'})</span>
            </div>
            <div className="text-sky-900 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-sky-200">
              {customer.email || '⚠️ Keine E-Mail hinterlegt'}
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              E-Mail Şablonu Seç
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.entries(EMAIL_TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTemplateKey(key)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    templateKey === key
                      ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-sm ring-2 ring-sky-500/20 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className={`w-3.5 h-3.5 ${templateKey === key ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="truncate">{tpl.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Betreff (Konu)
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                E-Mail İçeriği (Vorschau / Bearbeiten)
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
              </button>
            </div>
            <textarea
              rows={12}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
            />
          </div>

          {/* Info Banner */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              Aşağıdaki butonlardan birine bastığınızda Outlook açılacak ve bu müşterinin durumu otomatik olarak <span className="font-bold">"Gönderildi"</span> olarak kaydedilecektir.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Metin Kopyalandı!' : 'Metni Kopyala'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleOpenOutlookWeb}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-700/20 flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
              title="Tarayıcıda Outlook / Hotmail Web'de Aç"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Outlook Web (Hotmail) ile Gönder</span>
            </button>

            <button
              type="button"
              onClick={handleSendViaOutlookApp}
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
              title="Bilgisayarınızdaki veya Telefonunuzdaki Outlook Uygulamasında Aç"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Açılıyor...' : 'Outlook Uygulaması ile Gönder'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
