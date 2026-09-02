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
  const margin = 20;

  const isKleinunternehmer = companySettings.isKleinunternehmer !== false;
  const kleinunternehmerText = companySettings.kleinunternehmerText || 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).';

  // Strictly calculate total from items
  const calculatedItemsTotal = (invoice.items || []).reduce((sum, item) => {
    return sum + ((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1));
  }, 0);
  const totalAmount = calculatedItemsTotal > 0 ? calculatedItemsTotal : Number(invoice.netAmount || invoice.grossAmount || 0);

  // 1. TOP HEADER
  doc.setFillColor(2, 132, 199);
  doc.roundedRect(margin, 20, 11, 11, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TT', margin + 2.7, 27.5);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.companyName || 'TeamTrack Digital Solutions', margin + 14, 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(companySettings.tagline || 'Papierkram zu digital & Moderne Web-Anwendungen', margin + 14, 31.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  let contactY = 38;
  if (companySettings.address) {
    doc.text(companySettings.address, margin, contactY);
    contactY += 4.5;
  }
  const phoneEmail = `Tel: ${companySettings.phone || ''} | E-Mail: ${companySettings.email || ''}`;
  doc.text(phoneEmail, margin, contactY);
  contactY += 4.5;
  if (companySettings.website) {
    doc.text(`Web: ${companySettings.website}`, margin, contactY);
  }

  // Header Right: RECHNUNG & Number (Clean & Official, No BEZAHLT badge)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RECHNUNG', pageWidth - margin, 26, { align: 'right' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(invoice.invoiceNumber || 'RE-2026-0001', pageWidth - margin, 32.5, { align: 'right' });

  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.4);
  doc.line(margin, 52, pageWidth - margin, 52);

  // 2. DIN 5008 SENDER LINE
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const senderAddress = `${companySettings.companyName || 'TeamTrack'} • ${companySettings.address || 'Berlin'}`.toUpperCase();
  doc.text(senderAddress, margin, 59);

  // 3. RECIPIENT & METADATA GRID
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.text('Rechnungsempfänger:', margin, 66);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customerName || 'Kunde', margin, 73);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const recipientAddress = (invoice.customerAddress || '').split('\n');
  let rY = 79;
  recipientAddress.forEach(line => {
    doc.text(line, margin, rY);
    rY += 5;
  });

  if (invoice.customerTaxId) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`USt-IdNr / Steuernr: ${invoice.customerTaxId}`, margin, rY + 2);
  }

  // Metadata Box (Right)
  const metaX = 118;
  const metaW = pageWidth - margin - metaX;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(metaX, 62, metaW, 36, 2.5, 2.5, 'FD');

  const metaRows = [
    { label: 'Rechnungsnummer:', value: invoice.invoiceNumber, bold: true },
    { label: 'Rechnungsdatum:', value: formatDate(invoice.date) },
    { label: 'Liefer-/Leistungsdatum:', value: formatDate(invoice.date) },
    { label: 'Zahlungsziel (Fällig bis):', value: formatDate(invoice.dueDate), color: [2, 132, 199], bold: true },
    { label: 'Steuernummer:', value: companySettings.taxNumber || '-' }
  ];

  let mY = 68;
  doc.setFontSize(8);
  metaRows.forEach((row) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(row.label, metaX + 4, mY);

    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
    if (row.color) {
      doc.setTextColor(row.color[0], row.color[1], row.color[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(row.value || '', metaX + metaW - 4, mY, { align: 'right' });
    mY += 6;
  });

  // 4. POSITIONS TABLE
  const tableData = (invoice.items || []).map((item, index) => [
    index + 1,
    item.description || 'Dienstleistung',
    item.quantity || 1,
    formatCurrency(item.unitPrice || 0),
    formatCurrency((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1))
  ]);

  autoTable(doc, {
    startY: 108,
    margin: { left: margin, right: margin },
    head: [['Pos.', 'Beschreibung / Leistung', 'Menge', 'Einzelpreis', 'Gesamtpreis']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 4.5,
      lineWidth: { top: 0.6, bottom: 0.6 },
      lineColor: [15, 23, 42]
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 5,
      lineWidth: { bottom: 0.2 },
      lineColor: [226, 232, 240]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 32, fontStyle: 'bold' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // 5. TOTALS SUMMARY (§ 19 UStG Kleinunternehmer)
  const totalsX = 100;
  const totalsW = pageWidth - margin - totalsX;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(totalsX, finalY, pageWidth - margin, finalY);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Gesamtbetrag (Endbetrag):', totalsX, finalY + 7);
  doc.setTextColor(2, 132, 199);
  doc.text(formatCurrency(totalAmount), pageWidth - margin, finalY + 7, { align: 'right' });

  // Official Kleinunternehmer Legal Notice
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(kleinunternehmerText, totalsX, finalY + 14, { maxWidth: totalsW });

  // 6. PAYMENT TERMS & NOTES
  const termsY = Math.max(finalY + 28, 205);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Zahlungshinweise:', margin, termsY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(invoice.paymentTerms || 'Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen ohne Abzug auf das unten angegebene Bankkonto.', margin, termsY + 5.5);

  if (invoice.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(invoice.notes, margin, termsY + 11.5);
  }

  // 7. FOOTER
  const footerY = 265;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  // Column 1: Company Info
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.companyName || 'TeamTrack', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Inhaber: ${companySettings.ownerName || 'Geschäftsinhaber'}`, margin, footerY + 3.8);
  doc.text(companySettings.address || '', margin, footerY + 7.6);

  // Column 2: Bank Info
  const col2X = 85;
  doc.setFont('helvetica', 'bold');
  doc.text('Bankverbindung', col2X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bank: ${companySettings.bankName || 'Sparkasse Berlin'}`, col2X, footerY + 3.8);
  doc.text(`IBAN: ${companySettings.iban || '-'}`, col2X, footerY + 7.6);
  doc.text(`BIC: ${companySettings.bic || '-'}`, col2X, footerY + 11.4);

  // Column 3: Tax Info (§ 19 UStG)
  const col3X = 145;
  doc.setFont('helvetica', 'bold');
  doc.text('Steuerdaten', col3X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Steuernummer: ${companySettings.taxNumber || '-'}`, col3X, footerY + 3.8);
  doc.text('Kleinunternehmer gem. § 19 UStG', col3X, footerY + 7.6);
  doc.text('Kein Umsatzsteuerausweis', col3X, footerY + 11.4);

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

  const totalRev = Number(revenue.gross || revenue.net || 0);
  const totalExp = Number(expenses.gross || expenses.net || 0);
  const totalMil = Number(mileage.totalDeduction || 0);
  const profit = Number((totalRev - totalExp - totalMil).toFixed(2));

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
  doc.text(`Offizieller Jahresabschluss (§ 19 UStG Kleinunternehmer) • ${company?.companyName || 'TeamTrack'}`, margin + 6, 32);

  // Profit Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 44, pageWidth - (margin * 2), 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Betriebseinnahmen (Gesamt):', margin + 6, 52);
  doc.text('Betriebsausgaben + KM:', margin + 6, 58);
  doc.text('Reingewinn (EÜR Überschuss):', margin + 6, 64);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(totalRev), pageWidth - margin - 6, 52, { align: 'right' });
  doc.setTextColor(225, 29, 72);
  doc.text(`- ${formatCurrency(totalExp + totalMil)}`, pageWidth - margin - 6, 58, { align: 'right' });
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(11);
  doc.text(formatCurrency(profit), pageWidth - margin - 6, 64, { align: 'right' });

  // Expenses Table
  const expTableData = Object.entries(expenses.byCategory || {}).map(([cat, d]) => [
    cat,
    d.count,
    formatCurrency(d.gross || d.net)
  ]);

  autoTable(doc, {
    startY: 74,
    margin: { left: margin, right: margin },
    head: [['Ausgabenkategorie', 'Belege', 'Betrag (€)']],
    body: expTableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 }
  });

  const fileName = `Finanzamt_EUR_Bericht_${year}.pdf`;
  doc.save(fileName);
}
