import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

export function downloadInvoicePdf(invoice, companySettings = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header: Logo & Company Name
  doc.setFillColor(2, 132, 199);
  doc.roundedRect(margin, 18, 10, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TT', margin + 2.5, 24.5);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.companyName || 'TeamTrack Digital Solutions', margin + 14, 23);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(companySettings.tagline || 'Papierkram zu digital & Moderne Web-Anwendungen', margin + 14, 27);

  // Big Invoice Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RECHNUNG', pageWidth - margin, 23, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(invoice.invoiceNumber || 'RE-2026-0001', pageWidth - margin, 28, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, 34, pageWidth - margin, 34);

  // Sender Line
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const senderLine = `${companySettings.companyName || 'TeamTrack'} • ${companySettings.address || 'Berlin'}`;
  doc.text(senderLine, margin, 40);

  // Recipient
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Rechnungsempfänger:', margin, 46);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customerName || 'Kunde', margin, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const addressLines = (invoice.customerAddress || '').split('\n');
  let addrY = 57;
  addressLines.forEach(line => {
    doc.text(line, margin, addrY);
    addrY += 4.5;
  });

  if (invoice.customerTaxId) {
    doc.setFontSize(8);
    doc.text(`USt-IdNr / Steuernr: ${invoice.customerTaxId}`, margin, addrY + 1);
  }

  // Metadata Box
  const metaX = 125;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(metaX, 42, 65, 34, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Rechnungsdatum:', metaX + 4, 48);
  doc.text('Lieferdatum:', metaX + 4, 54);
  doc.text('Zahlbar bis:', metaX + 4, 60);
  doc.text('Steuernummer:', metaX + 4, 66);
  doc.text('USt-IdNr.:', metaX + 4, 72);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(invoice.date), metaX + 61, 48, { align: 'right' });
  doc.text(formatDate(invoice.date), metaX + 61, 54, { align: 'right' });
  doc.setTextColor(2, 132, 199);
  doc.text(formatDate(invoice.dueDate), metaX + 61, 60, { align: 'right' });
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(companySettings.taxNumber || '-', metaX + 61, 66, { align: 'right' });
  doc.text(companySettings.vatId || '-', metaX + 61, 72, { align: 'right' });

  // Items Table
  const tableData = (invoice.items || []).map((item, index) => [
    index + 1,
    item.description || 'Dienstleistung',
    item.quantity || 1,
    formatCurrency(item.unitPrice || 0),
    formatCurrency(item.total || ((item.unitPrice || 0) * (item.quantity || 1)))
  ]);

  autoTable(doc, {
    startY: 85,
    margin: { left: margin, right: margin },
    head: [['Pos.', 'Beschreibung / Leistung', 'Menge', 'Einzelpreis', 'Gesamtpreis']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 3
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 28, fontStyle: 'bold' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 8;
  const totalsX = 120;
  const net = Number(invoice.netAmount || 0);
  const tax = Number(invoice.taxAmount || 0);
  const gross = Number(invoice.grossAmount || 0);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Nettobetrag:', totalsX, finalY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(net), pageWidth - margin, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`USt. (${invoice.taxRate || 19}%):`, totalsX, finalY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(tax), pageWidth - margin, finalY + 5, { align: 'right' });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(totalsX, finalY + 7.5, pageWidth - margin, finalY + 7.5);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text('Gesamtbetrag (Brutto):', totalsX, finalY + 13);
  doc.text(formatCurrency(gross), pageWidth - margin, finalY + 13, { align: 'right' });

  // Payment Terms
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Zahlungshinweise:', margin, finalY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(invoice.paymentTerms || 'Bitte überweisen Sie den Betrag innerhalb von 14 Tagen auf unser Bankkonto.', margin, finalY + 5);

  if (invoice.notes) {
    doc.text(invoice.notes, margin, finalY + 10);
  }

  // Footer
  const footerY = 265;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.companyName || 'TeamTrack', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Inhaber: ${companySettings.ownerName || 'Geschäftsinhaber'}`, margin, footerY + 3.5);
  doc.text(companySettings.address || '', margin, footerY + 7);

  const col2X = 85;
  doc.setFont('helvetica', 'bold');
  doc.text('Bankverbindung', col2X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bank: ${companySettings.bankName || 'Sparkasse'}`, col2X, footerY + 3.5);
  doc.text(`IBAN: ${companySettings.iban || '-'}`, col2X, footerY + 7);
  doc.text(`BIC: ${companySettings.bic || '-'}`, col2X, footerY + 10.5);

  const col3X = 150;
  doc.setFont('helvetica', 'bold');
  doc.text('Steuerdaten', col3X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Steuernummer: ${companySettings.taxNumber || '-'}`, col3X, footerY + 3.5);
  doc.text(`USt-IdNr.: ${companySettings.vatId || '-'}`, col3X, footerY + 7);
  doc.text('Gerichtsstand: Berlin', col3X, footerY + 10.5);

  const fileName = `Rechnung_${invoice.invoiceNumber || 'TeamTrack'}.pdf`.replace(/\s+/g, '_');
  doc.save(fileName);
}

export function downloadTaxReportPdf(reportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const { year, company, revenue, expenses, mileage, summary } = reportData;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Title
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, 18, pageWidth - (margin * 2), 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Einnahmen-Überschuss-Rechnung (EÜR) ${year}`, margin + 6, 27);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253);
  doc.text(`Offizieller Jahresabschluss nach § 4 Abs. 3 EStG • ${company?.companyName || 'TeamTrack'}`, margin + 6, 34);

  // Profit Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 46, pageWidth - (margin * 2), 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Betriebseinnahmen (Netto):', margin + 6, 54);
  doc.text('Betriebsausgaben + KM:', margin + 6, 60);
  doc.text('Vorläufiger Reingewinn:', margin + 6, 66);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(revenue.net), pageWidth - margin - 6, 54, { align: 'right' });
  doc.setTextColor(225, 29, 72);
  doc.text(`- ${formatCurrency(expenses.net + mileage.totalDeduction)}`, pageWidth - margin - 6, 60, { align: 'right' });
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(11);
  doc.text(formatCurrency(summary.netProfit), pageWidth - margin - 6, 66, { align: 'right' });

  // Expenses Table
  const expTableData = Object.entries(expenses.byCategory || {}).map(([cat, d]) => [
    cat,
    d.count,
    formatCurrency(d.net),
    formatCurrency(d.tax),
    formatCurrency(d.gross)
  ]);

  autoTable(doc, {
    startY: 76,
    margin: { left: margin, right: margin },
    head: [['Ausgabenkategorie', 'Belege', 'Netto (€)', 'Vorsteuer (€)', 'Brutto (€)']],
    body: expTableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 }
  });

  const fileName = `Finanzamt_EUR_Bericht_${year}.pdf`;
  doc.save(fileName);
}
