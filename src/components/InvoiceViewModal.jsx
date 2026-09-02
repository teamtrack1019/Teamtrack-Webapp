import React, { useRef, useState, useEffect } from 'react';
import { FileText, Printer, Download, X, CheckCircle, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadInvoicePdf } from '../utils/pdfGenerator';

export default function InvoiceViewModal({ isOpen, onClose, invoice, companySettings = {} }) {
  const printRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  // Direct 1-click vector PDF Download
  const handleDownloadPdf = (e) => {
    e.stopPropagation();
    try {
      setIsDownloading(true);
      downloadInvoicePdf(invoice, companySettings);
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF Fehler: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Separate Print Dialog Action
  const handlePrint = (e) => {
    e.stopPropagation();
    window.print();
  };

  const isKleinunternehmer = companySettings.isKleinunternehmer !== false;
  const kleinunternehmerText = companySettings.kleinunternehmerText || 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).';

  const net = Number(invoice.netAmount || 0);
  const tax = isKleinunternehmer ? 0 : Number(invoice.taxAmount || 0);
  const gross = Number(invoice.grossAmount || invoice.netAmount || 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/80 backdrop-blur-sm animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-700/50 flex flex-col max-h-[94vh] select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Toolbar */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/20 rounded-xl border border-sky-500/30">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>Rechnung: {invoice.invoiceNumber}</span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  § 19 UStG Kleinunternehmer
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Kunde: <span className="text-slate-200 font-semibold">{invoice.customerName}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
              title="Rechnung direkt als PDF-Datei auf den PC herunterladen"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Wird heruntergeladen...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>PDF Herunterladen</span>
                </>
              )}
            </button>

            {/* Separate Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 transition cursor-pointer"
              title="Druckdialog öffnen"
            >
              <Printer className="w-4 h-4" />
              <span>Drucken</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              title="Pencereyi Kapat"
            >
              <X className="w-4 h-4" />
              <span>Schließen</span>
            </button>
          </div>
        </div>

        {/* Printable DIN-A4 German Invoice Document Container */}
        <div className="p-4 md:p-8 overflow-y-auto flex-1 flex justify-center bg-slate-200/70">
          {/* Paper Sheet */}
          <div 
            className="p-8 md:p-12 bg-white rounded-xl shadow-xl border border-slate-300 text-slate-800 w-full max-w-3xl min-h-[800px] flex flex-col justify-between"
            ref={printRef} 
            id="printable-invoice"
          >
            <div>
              {/* Header Row: Company Sender & Meta */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  {/* Logo / Company Name */}
                  <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-sm font-black">TT</span>
                    {companySettings.companyName || 'TeamTrack Digital Solutions'}
                  </div>
                  <p className="text-xs text-sky-700 font-bold mt-1">
                    {companySettings.tagline || 'Papierkram zu digital & Moderne Web-Anwendungen'}
                  </p>
                  
                  <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                    <div>{companySettings.address}</div>
                    <div>Tel: {companySettings.phone} | E-Mail: {companySettings.email}</div>
                    {companySettings.website && <div>Web: {companySettings.website}</div>}
                  </div>
                </div>

                {/* Invoice Big Title & Status */}
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">RECHNUNG</div>
                  <div className="text-sm font-mono font-bold text-sky-600 mt-1">
                    {invoice.invoiceNumber}
                  </div>
                  {invoice.status === 'paid' && (
                    <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3 h-3" />
                      BEZAHLT am {formatDate(invoice.paidAt || invoice.date)}
                    </div>
                  )}
                </div>
              </div>

              {/* Sender line for window envelope (DIN 5008) */}
              <div className="pt-4 pb-2 text-[10px] text-slate-400 border-b border-slate-100 uppercase tracking-wider font-semibold">
                {companySettings.companyName} • {companySettings.address}
              </div>

              {/* Customer Address & Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-8 py-5">
                {/* Recipient */}
                <div>
                  <div className="text-xs text-slate-400 font-bold mb-1">Rechnungsempfänger:</div>
                  <div className="font-bold text-base text-slate-900">{invoice.customerName}</div>
                  <div className="text-sm text-slate-600 whitespace-pre-line mt-1">
                    {invoice.customerAddress || 'Keine Adresse angegeben'}
                  </div>
                  {invoice.customerTaxId && (
                    <div className="text-xs text-slate-500 mt-2 font-mono">
                      USt-IdNr / Steuernr: {invoice.customerTaxId}
                    </div>
                  )}
                </div>

                {/* Metadata Table */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rechnungsnummer:</span>
                    <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rechnungsdatum:</span>
                    <span className="font-medium text-slate-900">{formatDate(invoice.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Liefer-/Leistungsdatum:</span>
                    <span className="font-medium text-slate-900">{formatDate(invoice.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zahlungsziel (Fällig bis):</span>
                    <span className="font-bold text-sky-700">{formatDate(invoice.dueDate)}</span>
                  </div>
                  {companySettings.taxNumber && (
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Steuernummer:</span>
                      <span className="font-mono text-slate-800">{companySettings.taxNumber}</span>
                    </div>
                  )}
                  {companySettings.vatId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">USt-IdNr.:</span>
                      <span className="font-mono text-slate-800">{companySettings.vatId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Positions Table */}
              <div className="mt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-800 bg-slate-100 font-bold text-slate-800">
                      <th className="py-2.5 px-3 w-12 text-center">Pos.</th>
                      <th className="py-2.5 px-3">Beschreibung / Leistung</th>
                      <th className="py-2.5 px-3 w-20 text-center">Menge</th>
                      <th className="py-2.5 px-3 w-28 text-right">Einzelpreis</th>
                      <th className="py-2.5 px-3 w-28 text-right">Gesamtpreis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(invoice.items || []).map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-slate-900 whitespace-pre-line">
                          {item.description}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-3 px-3 text-right text-slate-600 font-mono">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                          {formatCurrency(item.total || (item.unitPrice * item.quantity))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary (§ 19 UStG Kleinunternehmer) */}
              <div className="flex justify-end mt-4">
                <div className="w-80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-900 text-sm font-black py-2 border-b-2 border-slate-900">
                    <span>Gesamtbetrag (Endbetrag):</span>
                    <span className="font-mono text-sky-700 text-base">{formatCurrency(gross)}</span>
                  </div>
                  {/* Official § 19 UStG Kleinunternehmer Notice */}
                  <div className="text-[11px] text-slate-600 font-medium italic pt-1 leading-relaxed">
                    {kleinunternehmerText}
                  </div>
                </div>
              </div>

              {/* Payment Terms & Notes */}
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-900">Zahlungshinweise:</div>
                <p>{invoice.paymentTerms || 'Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen ohne Abzug auf das unten angegebene Bankkonto.'}</p>
                {invoice.notes && (
                  <p className="italic text-slate-500">{invoice.notes}</p>
                )}
              </div>
            </div>

            {/* DIN Footer with Bank Details & Company Legal Info */}
            <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-[10px] text-slate-500 leading-relaxed">
              <div>
                <div className="font-bold text-slate-700">{companySettings.companyName}</div>
                <div>Inhaber: {companySettings.ownerName}</div>
                <div>{companySettings.address}</div>
              </div>

              <div>
                <div className="font-bold text-slate-700">Bankverbindung</div>
                <div>Bank: {companySettings.bankName}</div>
                <div>IBAN: <span className="font-mono">{companySettings.iban}</span></div>
                <div>BIC: <span className="font-mono">{companySettings.bic}</span></div>
              </div>

              <div>
                <div className="font-bold text-slate-700">Steuerdaten</div>
                <div>Steuernummer: {companySettings.taxNumber}</div>
                <div>{kleinunternehmerText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
