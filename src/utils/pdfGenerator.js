import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

export function downloadInvoicePdf(invoice, companySettings = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 18;

  // 1. TOP HEADER (Left: Logo + Company + Contact, Right: Title + Invoice No + Paid Badge)
  // Blue Logo Box
  doc.setFillColor(2, 132, 199);
  doc.roundedRect(margin, 16, 9, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TT', margin + 2.2, 22.2);

  // Company Name
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.companyName || 'TeamTrack Digital Solutions', margin + 12, 21.5);

  // Tagline
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(companySettings.tagline || 'Papierkram zu digital & Moderne Web-Anwendungen', margin + 12, 26);

  // Company Contact Details (Below Tagline)
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  let contactY = 32;
  if (companySettings.address) {
    doc.text(companySettings.address, margin, contactY);
    contactY += 3.8;
  }
  const phoneEmail = `Tel: ${companySettings.phone || ''} | E-Mail: ${companySettings.email || ''}`;
  doc.text(phoneEmail, margin, contactY);
  contactY += 3.8;
  if (companySettings.website) {
    doc.text(`Web: ${companySettings.website}`, margin, contactY);
  }

  // Header Right: Title & Invoice Number
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RECHNUNG', pageWidth - margin, 21.5, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(invoice.invoiceNumber || 'RE-2026-0001', pageWidth - margin, 27, { align: 'right' });

  // Paid Badge (Green Pill if invoice is paid)
  if (invoice.status === 'paid') {
    const paidText = `BEZAHLT am ${formatDate(invoice.paidAt || invoice.date)}`;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    const textWidth = doc.getTextWidth(paidText) + 8;
    const badgeX = pageWidth - margin - textWidth;
    
    doc.setFillColor(236, 253, 245); // Emerald light
    doc.setDrawColor(167, 243, 208); // Emerald border
    doc.roundedRect(badgeX, 31, textWidth, 5.5, 2.5, 2.5, 'FD');
    doc.setTextColor(6, 95, 70); // Emerald dark text
    doc.text(paidText, badgeX + 4, 35);
  }

  // Top Divider
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.4);
  doc.line(margin, 43, pageWidth - margin, 43);

  // 2. SENDER LINE FOR WINDOW ENVELOPE (DIN 5008)
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const senderAddress = `${companySettings.companyName || 'TeamTrack'} • ${companySettings.address || 'Berlin'}`.toUpperCase();
  doc.text(senderAddress, margin, 49);

  // 3. RECIPIENT & METADATA GRID
  // Recipient (Left)
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.text('Rechnungsempfänger:', margin, 56);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customerName || 'Kunde', margin, 62);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const recipientAddress = (invoice.customerAddress || '').split('\n');
  let rY = 67;
  recipientAddress.forEach(line => {
    doc.text(line, margin, rY);
    rY += 4.5;
  });

  if (invoice.customerTaxId) {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`USt-IdNr / Steuernr: ${invoice.customerTaxId}`, margin, rY + 1.5);
  }

  // Metadata Box (Right)
  const metaX = 120;
  const metaW = pageWidth - margin - metaX;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(metaX, 52, metaW, 35, 2, 2, 'FD');

  const metaRows = [
    { label: 'Rechnungsnummer:', value: invoice.invoiceNumber, bold: true },
    { label: 'Rechnungsdatum:', value: formatDate(invoice.date) },
    { label: 'Liefer-/Leistungsdatum:', value: formatDate(invoice.date) },
    { label: 'Zahlungsziel (Fällig bis):', value: formatDate(invoice.dueDate), color: [2, 132, 199], bold: true },
    { label: 'Steuernummer:', value: companySettings.taxNumber || '-' },
    { label: 'USt-IdNr.:', value: companySettings.vatId || '-' }
  ];

  let mY = 57;
  doc.setFontSize(7.5);
  metaRows.forEach((row, i) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(row.label, metaX + 3.5, mY);

    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
    if (row.color) {
      doc.setTextColor(row.color[0], row.color[1], row.color[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(row.value || '', metaX + metaW - 3.5, mY, { align: 'right' });
    mY += 5.2;
  });

  // 4. POSITIONS TABLE
  const tableData = (invoice.items || []).map((item, index) => [
    index + 1,
    item.description || 'Dienstleistung',
    item.quantity || 1,
    formatCurrency(item.unitPrice || 0),
    formatCurrency(item.total || ((item.unitPrice || 0) * (item.quantity || 1)))
  ]);

  autoTable(doc, {
    startY: 94,
    margin: { left: margin, right: margin },
    head: [['Pos.', 'Beschreibung / Leistung', 'Menge', 'Einzelpreis', 'Gesamtpreis']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 3.5,
      lineWidth: { top: 0.5, bottom: 0.5 },
      lineColor: [15, 23, 42]
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 4,
      lineWidth: { bottom: 0.2 },
      lineColor: [226, 232, 240]
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

  // 5. TOTALS SUMMARY (Right)
  const totalsX = 120;
  const net = Number(invoice.netAmount || 0);
  const tax = Number(invoice.taxAmount || 0);
  const gross = Number(invoice.grossAmount || 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Nettobetrag:', totalsX, finalY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(net), pageWidth - margin, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Umsatzsteuer (${invoice.taxRate || 19}%):`, totalsX, finalY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(tax), pageWidth - margin, finalY + 5.5, { align: 'right' });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(totalsX, finalY + 8.5, pageWidth - margin, finalY + 8.5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Gesamtbetrag (Brutto):', totalsX, finalY + 14.5);
  doc.setTextColor(2, 132, 199);
  doc.text(formatCurrency(gross), pageWidth - margin, finalY + 14.5, { align: 'right' });

  // 6. PAYMENT TERMS & NOTES (Left)
  const termsY = finalY + 22;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Zahlungshinweise:', margin, termsY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(invoice.paymentTerms || 'Bitte überweisen Sie den Betrag innerhalb von 14 Tagen ohne Abzug auf das unten angegebene Bankkonto.', margin, termsY + 5);

  if (invoice.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(invoice.notes, margin, termsY + 10);
  }

  // 7. FOOTER DIVIDER & 3 COLUMNS (DIN Standard)
  const footerY = 265;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  // Column 1: Company Info
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.companyName || 'TeamTrack', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Inhaber: ${companySettings.ownerName || 'Geschäftsinhaber'}`, margin, footerY + 3.5);
  doc.text(companySettings.address || '', margin, footerY + 7);

  // Column 2: Bank Info
  const col2X = 85;
  doc.setFont('helvetica', 'bold');
  doc.text('Bankverbindung', col2X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bank: ${companySettings.bankName || 'Sparkasse Berlin'}`, col2X, footerY + 3.5);
  doc.text(`IBAN: ${companySettings.iban || '-'}`, col2X, footerY + 7);
  doc.text(`BIC: ${companySettings.bic || '-'}`, col2X, footerY + 10.5);

  // Column 3: Tax Info
  const col3X = 148;
  doc.setFont('helvetica', 'bold');
  doc.text('Steuerdaten', col3X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Steuernummer: ${companySettings.taxNumber || '-'}`, col3X, footerY + 3.5);
  doc.text(`USt-IdNr.: ${companySettings.vatId || '-'}`, col3X, footerY + 7);
  doc.text('Gerichtsstand: Berlin', col3X, footerY + 10.5);

  // Save the PDF file
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
  const margin = 18;

  // Title
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, 16, pageWidth - (margin * 2), 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Einnahmen-Überschuss-Rechnung (EÜR) ${year}`, margin + 6, 25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253);
  doc.text(`Offizieller Jahresabschluss nach § 4 Abs. 3 EStG • ${company?.companyName || 'TeamTrack'}`, margin + 6, 32);

  // Profit Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 44, pageWidth - (margin * 2), 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Betriebseinnahmen (Netto):', margin + 6, 52);
  doc.text('Betriebsausgaben + KM:', margin + 6, 58);
  doc.text('Vorläufiger Reingewinn:', margin + 6, 64);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(revenue.net), pageWidth - margin - 6, 52, { align: 'right' });
  doc.setTextColor(225, 29, 72);
  doc.text(`- ${formatCurrency(expenses.net + mileage.totalDeduction)}`, pageWidth - margin - 6, 58, { align: 'right' });
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(11);
  doc.text(formatCurrency(summary.netProfit), pageWidth - margin - 6, 64, { align: 'right' });

  // Expenses Table
  const expTableData = Object.entries(expenses.byCategory || {}).map(([cat, d]) => [
    cat,
    d.count,
    formatCurrency(d.net),
    formatCurrency(d.tax),
    formatCurrency(d.gross)
  ]);

  autoTable(doc, {
    startY: 74,
    margin: { left: margin, right: margin },
    head: [['Ausgabenkategorie', 'Belege', 'Netto (€)', 'Vorsteuer (€)', 'Brutto (€)']],
    body: expTableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 }
  });

  const fileName = `Finanzamt_EUR_Bericht_${year}.pdf`;
  doc.save(fileName);
}
