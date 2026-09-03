import React, { useRef, useState, useEffect } from 'react';
import { FileText, Printer, Download, X, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadInvoicePdf, printInvoicePdfDirectly } from '../utils/pdfGenerator';

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

  // Pure Vector PDF Print (100% Guaranteed: NO browser URL links, NO date stamps, exactly 1 balanced A4 page)
  const handlePrint = (e) => {
    e.stopPropagation();
    try {
      printInvoicePdfDirectly(invoice, companySettings);
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  const isKleinunternehmer = companySettings.isKleinunternehmer !== false;
  const kleinunternehmerText = companySettings.kleinunternehmerText || 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).';

  const streetLine = companySettings.street || companySettings.address?.split(',')[0] || 'Balthasar-Neumann-Str. 38';
  const cityLine = (companySettings.zipCode && companySettings.city)
    ? `${companySettings.zipCode} ${companySettings.city}`
    : (companySettings.address?.split(',')[1]?.trim() || '97236 Randersacker');

  // Calculate items sum strictly
  const calculatedItemsTotal = (invoice.items || []).reduce((sum, item) => {
    return sum + ((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1));
  }, 0);

  const totalAmount = calculatedItemsTotal > 0 ? calculatedItemsTotal : Number(invoice.netAmount || invoice.grossAmount || 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/80 backdrop-blur-sm animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-700/50 flex flex-col max-h-[96vh] select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 no-print border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-500/30 shrink-0">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm md:text-base font-bold text-white">
                  Rechnung: {invoice.invoiceNumber}
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  § 19 UStG
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[240px] sm:max-w-none">
                Kunde: <span className="text-slate-200 font-semibold">{invoice.customerName}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-between sm:justify-end">
            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
              title="Rechnung direkt als PDF-Datei herunterladen"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Wird geladen...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Download</span>
                </>
              )}
            </button>

            {/* Separate Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 sm:px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 transition cursor-pointer"
              title="Sauberen Druck / PDF Druckdialog öffnen"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Drucken</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-2 bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              title="Pencereyi Kapat"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Schließen</span>
            </button>
          </div>
        </div>

        {/* Preview Scroll Container */}
        <div className="p-3 sm:p-6 md:p-8 overflow-y-auto overflow-x-auto flex-1 flex justify-start sm:justify-center bg-slate-200/70">
          {/* Paper Sheet (Sleek DIN-A4 visual balance) */}
          <div 
            className="p-6 sm:p-8 md:p-12 bg-white rounded-xl shadow-xl border border-slate-300 text-slate-800 w-full max-w-3xl min-w-[620px] sm:min-w-0 flex flex-col justify-between"
            ref={printRef} 
            id="printable-invoice"
          >
            <div>
              {/* Header Row: Company Sender & Meta */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  {/* Logo / Company Name */}
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs sm:text-sm font-black">TT</span>
                    {companySettings.companyName || 'TeamTrack Digital Solutions'}
                  </div>
                  <p className="text-xs text-sky-700 font-bold mt-1">
                    {companySettings.tagline || 'Papierkram zu digital & Moderne Web-Anwendungen'}
                  </p>
                  
                  <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                    <div>{streetLine}</div>
                    <div>{cityLine}</div>
                    <div>Tel: {companySettings.phone} | E-Mail: {companySettings.email}</div>
                    {companySettings.website && <div>Web: {companySettings.website}</div>}
                  </div>
                </div>

                {/* Invoice Big Title & Number */}
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">RECHNUNG</div>
                  <div className="text-sm font-mono font-bold text-sky-600 mt-1">
                    {invoice.invoiceNumber}
                  </div>
                </div>
              </div>

              {/* Sender line for window envelope (DIN 5008) */}
              <div className="pt-3 pb-2 text-[10px] text-slate-400 border-b border-slate-100 uppercase tracking-wider font-semibold">
                {companySettings.companyName} • {streetLine} • {cityLine}
              </div>

              {/* Customer Address & Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-6 py-4">
                {/* Recipient */}
                <div>
                  <div className="text-xs text-slate-400 font-bold mb-1">Rechnungsempfänger:</div>
                  <div className="font-bold text-sm sm:text-base text-slate-900">{invoice.customerName}</div>
                  <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-line mt-1">
                    {invoice.customerAddress || 'Keine Adresse angegeben'}
                  </div>
                  {invoice.customerTaxId && (
                    <div className="text-xs text-slate-500 mt-2 font-mono">
                      USt-IdNr / Steuernr: {invoice.customerTaxId}
                    </div>
                  )}
                </div>

                {/* Metadata Table */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
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
                </div>
              </div>

              {/* Positions Table */}
              <div className="mt-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-800 bg-slate-100 font-bold text-slate-800">
                      <th className="py-2 px-3 w-12 text-center">Pos.</th>
                      <th className="py-2 px-3">Beschreibung / Leistung</th>
                      <th className="py-2 px-3 w-16 text-center">Menge</th>
                      <th className="py-2 px-3 w-24 text-right">Einzelpreis</th>
                      <th className="py-2 px-3 w-28 text-right">Gesamtpreis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(invoice.items || []).map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-pre-line">
                          {item.description}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                          {formatCurrency((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary (§ 19 UStG Kleinunternehmer) */}
              <div className="flex justify-end mt-3">
                <div className="w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-900 text-sm font-black py-1.5 border-b-2 border-slate-900">
                    <span>Gesamtbetrag (Endbetrag):</span>
                    <span className="font-mono text-sky-700 text-base">{formatCurrency(totalAmount)}</span>
                  </div>
                  {/* Official § 19 UStG Kleinunternehmer Notice */}
                  <div className="text-[10.5px] text-slate-600 font-medium italic pt-0.5 leading-relaxed">
                    {kleinunternehmerText}
                  </div>
                </div>
              </div>

              {/* Payment Terms & Notes */}
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-900">Zahlungshinweise:</div>
                <p>{invoice.paymentTerms || 'Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen ohne Abzug auf das unten angegebene Bankkonto.'}</p>
                {invoice.notes && (
                  <p className="italic text-slate-500">{invoice.notes}</p>
                )}
              </div>
            </div>

            {/* DIN Footer with Bank Details & Company Legal Info */}
            <div className="mt-6 pt-3 border-t border-slate-300 grid grid-cols-3 gap-3 text-[9.5px] text-slate-500 leading-relaxed">
              <div>
                <div className="font-bold text-slate-700">{companySettings.companyName}</div>
                <div>Inhaber: {companySettings.ownerName}</div>
                <div>{streetLine}</div>
                <div>{cityLine}</div>
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
