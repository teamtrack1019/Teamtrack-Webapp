import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';
import { PAKET1_PARALLEL_ABGRENZUNG, PAKET1_PARALLEL_NACHBESSERUNG, PAKET2_ABNAHME_AVV, PAKET2_ABNAHME_BACKUP, PAKET2_ABNAHME_SCOPE, PAKET2_ABNAHME_SERVICE, PAKET2_ABNAHME_TERMS, PAKET2_PARALLEL_AVV, PAKET2_PARALLEL_BACKUP, PAKET2_PARALLEL_TERMS } from './offerInvoice';
import { TEAMTRACK_LOGO_BASE64 } from '../assets/logoBase64';

export function createInvoiceDoc(invoice, companySettings = {}) {
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

  // 1. TOP HEADER (Spacious, Elegant with 30x30mm Official Logo & Crisp Shadow Frame)
  const logoSize = 30; // 30mm x 30mm prominent square logo
  const logoY = 20;
  const textStartX = margin + logoSize + 6; // margin (20) + 30 + 6 = 56mm

  // Drop shadow effect behind logo card
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(margin + 0.8, logoY + 0.8, logoSize, logoSize, 3.5, 3.5, 'F');
  
  // White card background with crisp border
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, logoY, logoSize, logoSize, 3, 3, 'FD');

  try {
    doc.addImage(TEAMTRACK_LOGO_BASE64, 'JPEG', margin + 1.5, logoY + 1.5, logoSize - 3, logoSize - 3);
  } catch (err) {
    doc.setFillColor(15, 23, 42);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TT', margin + 9, logoY + 19);
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const streetLine = companySettings.street || companySettings.address?.split(',')[0] || 'Balthasar-Neumann-Str. 38';
  const cityLine = (companySettings.zipCode && companySettings.city)
    ? `${companySettings.zipCode} ${companySettings.city}`
    : (companySettings.address?.split(',')[1]?.trim() || '97236 Randersacker');

  // Company Name
  doc.text(companySettings.companyName || 'TeamTrack-Software', textStartX, 25.5);

  // Tagline / Slogan (High-contrast dark slate for crisp print)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(companySettings.tagline || 'Softwareentwicklung & IT-Beratung', textStartX, 30.5);

  // Address & Contact Information (Neatly aligned and spaced)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  const fullAddressLine = `${streetLine}, ${cityLine}`;
  doc.text(fullAddressLine, textStartX, 36.5);

  const cleanPhone = (companySettings.phone && !companySettings.phone.includes('4690446')) ? companySettings.phone : '+49 172 6125371';
  const phoneEmail = `Tel: ${cleanPhone}   |   E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`;
  doc.text(phoneEmail, textStartX, 41.5);

  const webUrl = companySettings.website || 'www.team-track.de';
  doc.text(`Web: ${webUrl}`, textStartX, 46.5);

  // Header Right: RECHNUNG & Number (High-contrast dark for crisp print)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RECHNUNG', pageWidth - margin, 27.5, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.invoiceNumber || 'RE-2026-0001', pageWidth - margin, 35, { align: 'right' });

  // Top dividing rule
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, 56, pageWidth - margin, 56);

  // 2. DIN 5008 SENDER LINE
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const senderAddress = `${companySettings.companyName || 'TeamTrack-Software'} • ${streetLine} • ${cityLine}`.toUpperCase();
  doc.text(senderAddress, margin, 63);

  // 3. RECIPIENT & METADATA GRID
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.text('Rechnungsempfänger:', margin, 71);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customerName || 'Kunde', margin, 78);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const recipientAddress = (invoice.customerAddress || '').split('\n');
  let rY = 84;
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
  const metaY = 67;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(metaX, metaY, metaW, 36, 2.5, 2.5, 'FD');

  const metaRows = [
    { label: 'Rechnungsnummer:', value: invoice.invoiceNumber, bold: true },
    { label: 'Rechnungsdatum:', value: formatDate(invoice.date || new Date().toISOString().split('T')[0]) },
    { label: 'Liefer-/Leistungsdatum:', value: formatDate(invoice.serviceDate || invoice.performanceDate || invoice.deliveryDate || invoice.date) },
    { label: 'Zahlungsziel (Fällig bis):', value: formatDate(invoice.dueDate), bold: true },
    { label: 'Steuernummer:', value: companySettings.taxNumber || '-' }
  ];

  let mY = metaY + 6;
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
    startY: 112,
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

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Gesamtbetrag (Endbetrag):', totalsX, finalY + 7);
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
  doc.text(companySettings.companyName || 'TeamTrack-Software', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Inhaber: ${companySettings.ownerName || 'Huriye Ünalsoy'}`, margin, footerY + 3.8);
  doc.text(streetLine, margin, footerY + 7.6);
  doc.text(cityLine, margin, footerY + 11.4);

  // Column 2: Bank Info
  const col2X = 85;
  doc.setFont('helvetica', 'bold');
  doc.text('Bankverbindung', col2X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bank: ${companySettings.bankName || 'Postbank'}`, col2X, footerY + 3.8);
  doc.text(`IBAN: ${companySettings.iban || 'DE16 1001 0010 0012 7271 85'}`, col2X, footerY + 7.6);
  doc.text(`BIC: ${companySettings.bic || 'PBNKDEFF'}`, col2X, footerY + 11.4);

  // Column 3: Tax Info (§ 19 UStG)
  const col3X = 145;
  doc.setFont('helvetica', 'bold');
  doc.text('Steuerdaten', col3X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Steuernummer: ${companySettings.taxNumber || '-'}`, col3X, footerY + 3.8);
  doc.text('Kleinunternehmer gem. § 19 UStG', col3X, footerY + 7.6);
  doc.text('Kein Umsatzsteuerausweis', col3X, footerY + 11.4);

  return doc;
}

export function downloadInvoicePdf(invoice, companySettings = {}) {
  const doc = createInvoiceDoc(invoice, companySettings);
  const fileName = `Rechnung_${invoice.invoiceNumber || 'TeamTrack'}.pdf`.replace(/\s+/g, '_');
  doc.save(fileName);
}

export function printInvoicePdfDirectly(invoice, companySettings = {}) {
  const doc = createInvoiceDoc(invoice, companySettings);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}

// -------------------------------------------------------------
// FAHRTENBUCH / KM-TRACKING PDF GENERATOR (Finanzamt-konform DIN-A4)
// -------------------------------------------------------------
export function createMileageDoc(mileageList = [], companySettings = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 18;

  const totalKm = mileageList.reduce((s, m) => s + Number(m.kilometers || 0), 0);
  const totalDeduction = mileageList.reduce((s, m) => s + Number(m.totalDeduction || (m.kilometers * 0.3)), 0);

  // 1. TOP TITLE BANNER
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.roundedRect(margin, 16, pageWidth - (margin * 2), 22, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Betriebliches Fahrtenbuch & KM-Nachweis', margin + 6, 25);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253);
  doc.text(`Finanzamt-Nachweis gem. § 9 Abs. 1 Nr. 4a EStG • ${companySettings.companyName || 'TeamTrack Digital Solutions'}`, margin + 6, 32);

  // 2. SUMMARY KPI 3-COLUMN CARDS
  const cardY = 43;
  const cardH = 18;
  const cardW = (pageWidth - (margin * 2) - 8) / 3;

  // Card 1: Fahrten & KM
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('GEFAHRENE DISTANZ', margin + 4, cardY + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalKm.toFixed(1)} km`, margin + 4, cardY + 13);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`(${mileageList.length} Fahrten)`, margin + cardW - 4, cardY + 13, { align: 'right' });

  // Card 2: Pauschale
  const card2X = margin + cardW + 4;
  doc.roundedRect(card2X, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('KILOMETERPAUSCHALE', card2X + 4, cardY + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('0,30 € / km', card2X + 4, cardY + 13);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Finanzamtsatz', card2X + cardW - 4, cardY + 13, { align: 'right' });

  // Card 3: Steuerabzug (Highlighted in Green)
  const card3X = margin + (cardW * 2) + 8;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(card3X, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.text('STEUERLICHER ABZUG', card3X + 4, cardY + 6);
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text(formatCurrency(totalDeduction), card3X + 4, cardY + 13);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Betriebsausgabe', card3X + cardW - 4, cardY + 13, { align: 'right' });

  // 3. TABLE OF TRIPS (Clean ASCII text with no unicode corruption)
  const tableData = mileageList.map((m, idx) => [
    idx + 1,
    formatDate(m.date),
    m.customerName || 'Betriebliche Fahrt',
    `${m.startLocation || 'Büro'} -> ${m.destination || '-'}`,
    m.purpose || 'Kundenbesuch / Beratung',
    `${m.kilometers} km`,
    formatCurrency(m.totalDeduction || (m.kilometers * 0.3))
  ]);

  autoTable(doc, {
    startY: 66,
    margin: { left: margin, right: margin },
    head: [['Pos.', 'Datum', 'Kunde', 'Reiseweg (Start -> Ziel)', 'Reisezweck / Anlass', 'KM', 'Abzug']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8,
      fontStyle: 'bold',
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
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'left', cellWidth: 38, fontStyle: 'bold' },
      3: { halign: 'left', cellWidth: 42 },
      4: { halign: 'left' },
      5: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
      6: { halign: 'right', cellWidth: 20, fontStyle: 'bold', textColor: [5, 150, 105] }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // 4. SUMMARY ROW AT TABLE END
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(margin, finalY, pageWidth - margin, finalY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Gesamtsumme Steuerabzug Fahrtenbuch:', margin, finalY + 5.5);
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(10);
  doc.text(formatCurrency(totalDeduction), pageWidth - margin, finalY + 5.5, { align: 'right' });

  // 5. LEGAL NOTICE & SIGNATURE
  const signY = Math.max(finalY + 16, 252);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Ich versichere die Richtigkeit und Vollständigkeit der oben aufgeführten betrieblichen Fahrten.', margin, signY);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, signY + 14, margin + 65, signY + 14);
  doc.line(pageWidth - margin - 65, signY + 14, pageWidth - margin, signY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Ort, Datum', margin, signY + 18);
  doc.text('Unterschrift Betriebsinhaber', pageWidth - margin - 65, signY + 18);

  return doc;
}

export function downloadMileagePdf(mileageList = [], companySettings = {}) {
  const doc = createMileageDoc(mileageList, companySettings);
  doc.save('Finanzamt_Fahrtenbuch_2026.pdf');
}

export function printMileagePdfDirectly(mileageList = [], companySettings = {}) {
  const doc = createMileageDoc(mileageList, companySettings);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}

// -------------------------------------------------------------
// FINANZAMT EÜR REPORT PDF
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 3. OFFICIAL PROPOSAL & COST ESTIMATE PDF (ANGEBOT / KOSTENVORANSCHLAG)
// -------------------------------------------------------------
export function createOfferDoc(offer, companySettings = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 20;

  const isKV = offer.type === 'kostenvoranschlag';
  const docTitle = isKV ? 'KOSTENVORANSCHLAG' : 'ANGEBOT';
  const docPrefix = isKV ? 'ab ' : '';
  const isKleinunternehmer = companySettings.isKleinunternehmer !== false;
  const kleinunternehmerText = companySettings.kleinunternehmerText || 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).';

  // 1. TOP HEADER (Prominent 30x30mm Logo Card & Company Info)
  const logoSize = 30;
  const logoY = 20;
  const textStartX = margin + logoSize + 6;

  // Logo Shadow & Frame
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(margin + 0.8, logoY + 0.8, logoSize, logoSize, 3.5, 3.5, 'F');
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, logoY, logoSize, logoSize, 3, 3, 'FD');

  try {
    doc.addImage(TEAMTRACK_LOGO_BASE64, 'JPEG', margin + 1.5, logoY + 1.5, logoSize - 3, logoSize - 3);
  } catch {
    doc.setFillColor(15, 23, 42);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TT', margin + 9, logoY + 19);
  }

  // Company Details
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const streetLine = companySettings.street || 'Balthasar-Neumann-Str. 38';
  const cityLine = (companySettings.zipCode && companySettings.city) ? `${companySettings.zipCode} ${companySettings.city}` : '97236 Randersacker';

  doc.text(companySettings.companyName || 'TeamTrack-Software', textStartX, 25.5);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(companySettings.tagline || 'Softwareentwicklung & IT-Beratung', textStartX, 30.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${streetLine}, ${cityLine}`, textStartX, 36);
  const cleanOfferPhone = (companySettings.phone && !companySettings.phone.includes('4690446')) ? companySettings.phone : '+49 172 6125371';
  doc.text(`Tel: ${cleanOfferPhone}   |   E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`, textStartX, 41);
  doc.text(`Web: ${companySettings.website || 'www.team-track.de'}`, textStartX, 46);

  // Header Right: Title & Number (Proportionate font size to avoid any text collision)
  const titleFontSize = isKV ? 13 : 16;
  doc.setFontSize(titleFontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(docTitle, pageWidth - margin, 26, { align: 'right' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 130, 203);
  doc.text(offer.offerNumber || (isKV ? 'KV-2026-0001' : 'ANG-2026-0001'), pageWidth - margin, 32.5, { align: 'right' });

  // 2. RECIPIENT & META GRID
  const recipientY = 58;

  // Single-line sender info
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${companySettings.companyName || 'TeamTrack-Software'} • ${streetLine} • ${cityLine}`, margin, recipientY);

  // Recipient Box
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(offer.customerName || 'Empfänger / Kunde', margin, recipientY + 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  let curRecY = recipientY + 11;
  if (offer.customerContact) {
    doc.text(`z. Hd. ${offer.customerContact}`, margin, curRecY);
    curRecY += 4.5;
  }
  if (offer.customerAddress) {
    const addrLines = offer.customerAddress.split('\n');
    addrLines.forEach(l => {
      doc.text(l.trim(), margin, curRecY);
      curRecY += 4.5;
    });
  }
  if (offer.customerEmail) {
    doc.text(`E-Mail: ${offer.customerEmail}`, margin, curRecY);
    curRecY += 4.5;
  }

  // Meta Box (Right Side)
  const metaX = pageWidth - margin - 65;
  const metaY = recipientY - 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(metaX, metaY, 65, 30, 2.5, 2.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Datum:', metaX + 4, metaY + 6.5);
  doc.text('Gültig bis:', metaX + 4, metaY + 13.5);
  doc.text('Dokument-Art:', metaX + 4, metaY + 20.5);
  doc.text('Bearbeiter:', metaX + 4, metaY + 27.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(offer.date || new Date()), metaX + 61, metaY + 6.5, { align: 'right' });
  doc.text(formatDate(offer.validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), metaX + 61, metaY + 13.5, { align: 'right' });
  doc.text(isKV ? 'Kostenvoranschlag' : 'Verbindl. Angebot', metaX + 61, metaY + 20.5, { align: 'right' });
  doc.text('TeamTrack Team', metaX + 61, metaY + 27.5, { align: 'right' });

  // 3. INTRODUCTORY GREETING & TEXT
  const introY = Math.max(curRecY + 4, 94);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const greeting = offer.customerContact 
    ? (offer.customerContact.toLowerCase().startsWith('frau') ? `Sehr geehrte ${offer.customerContact},` : offer.customerContact.toLowerCase().startsWith('herr') ? `Sehr geehrter ${offer.customerContact},` : `Sehr geehrte(r) Frau/Herr ${offer.customerContact},`)
    : 'Sehr geehrte Damen und Herren,';
  doc.text(greeting, margin, introY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const bothMainPackages = Boolean(offer.packageA?.included && offer.packageB?.included);
  const introDesc = bothMainPackages
    ? (isKV
      ? 'vielen Dank für Ihre Anfrage. Nachfolgend Paket 1 (Festpreis-Entwicklung) und Paket 2 (laufende 7/24-Betreuung). Beide können zusammen beauftragt werden:'
      : 'vielen Dank für Ihr Vertrauen. Nachfolgend Paket 1 (Festpreis-Entwicklung) und Paket 2 (laufende 7/24-Betreuung). Beide werden zusammen beauftragt:')
    : (isKV
      ? 'vielen Dank für Ihre Anfrage. Nachfolgend erhalten Sie unseren detaillierten und unverbindlichen Kostenvoranschlag für die geplante Umsetzung Ihrer maßgeschneiderten Softwarelösung:'
      : 'vielen Dank für Ihr Vertrauen. Gerne unterbreiten wir Ihnen nachfolgend unser maßgeschneidertes, verbindliches Angebot für die Entwicklung und Bereitstellung Ihrer Lösung:');
  
  const introSplit = doc.splitTextToSize(introDesc, pageWidth - (margin * 2));
  doc.text(introSplit, margin, introY + 5);

  // 4. PREPARE TABLE ITEMS
  const tableBody = [];
  let posCounter = 1;

  // Paket 1 (ehemals Paket A)
  if (offer.packageA && offer.packageA.included) {
    const pAPrice = Number(offer.packageA.price || 2400);
    const defaultModNames = [
      'Kunden- & Stammdatenverwaltung',
      'Live-Terminkalender & Einsatzplanung',
      'Zeiterfassung & Digitale Stundenzettel',
      'Material- & Lagerwirtschaft',
      'Mobiler Foto-Upload & Schadensberichte',
      'Rollen- & Rechtesystem (Admin/Mitarbeiter)',
      'PDF-Berichts- und Rechnungsexport',
      'Automatisierte E-Mail- / SMS-Benachrichtigung'
    ];

    const selectedModsA = offer.packageA.selectedModules && offer.packageA.selectedModules.length > 0
      ? offer.packageA.selectedModules.map(m => typeof m === 'string' ? m : (m.title || m.name || m))
      : (offer.packageA.moduleNames && offer.packageA.moduleNames.length > 0
          ? offer.packageA.moduleNames
          : defaultModNames);

    const modBulletList = selectedModsA.map(name => `• ${name}`).join('\n');

    tableBody.push([
      `${posCounter++}`,
      `Paket 1: Komplett-Entwicklung & WebApp\n` +
      `Vereinbarter Modulumfang:\n` +
      `${modBulletList}`,
      '1x Einmalig',
      `${docPrefix}${formatCurrency(pAPrice)}`,
      `${docPrefix}${formatCurrency(pAPrice)}`
    ]);
  }

  // Paket 2: Einrichtung und Betreuung sind ein Paket. Alle Intervalle stehen zur Wahl.
  if (offer.packageB && offer.packageB.included) {
    const interval = offer.packageB.interval || 'monthly';
    const recurringPrice = Number(offer.packageB.recurringPrice || 0);
    const explicitPrice = (value, intervalName) => {
      if (value !== undefined && value !== null && value !== '') return Number(value) || 0;
      return interval === intervalName ? recurringPrice : 0;
    };
    const setupPrice = Number(offer.packageB.setupPrice || 0);
    const monthlyPrice = explicitPrice(offer.packageB.monthlyPrice, 'monthly');
    const quarterlyPrice = explicitPrice(offer.packageB.quarterlyPrice, 'quarterly');
    const yearlyPrice = explicitPrice(offer.packageB.yearlyPrice, 'yearly');
    const careLines = [
      monthlyPrice > 0 ? `• Monatlich: ${docPrefix}${formatCurrency(monthlyPrice)} / Monat` : '',
      quarterlyPrice > 0 ? `• Vierteljährlich: ${docPrefix}${formatCurrency(quarterlyPrice)} / Quartal` : '',
      yearlyPrice > 0 ? `• Jährlich: ${docPrefix}${formatCurrency(yearlyPrice)} / Jahr (15 % Nachlass)` : ''
    ].filter(Boolean);

    tableBody.push([
      `${posCounter++}`,
      `Paket 2: Setup + 7/24 Abo-Betreuung\n` +
      `Einmalige Einrichtung (Setup): ${docPrefix}${formatCurrency(setupPrice)}\n` +
      `Laufende Betreuung, ein Intervall nach Wahl:\n` +
      `${careLines.join('\n')}\n` +
      `Vertragslaufzeit: 12 Monate ab Bereitstellung, danach automatische Verlängerung um jeweils 12 Monate. Ordentliche Kündigung mit 1 Monat Frist zum Laufzeitende. Die Zahlungsweise ändert die Laufzeit nicht.`,
      '1 Paket',
      `Einrichtung\n${docPrefix}${formatCurrency(setupPrice)}`,
      `Einrichtung\n${docPrefix}${formatCurrency(setupPrice)}`
    ]);
  }

  // Paket 3 (ehemals Paket C)
  if (offer.packageC && offer.packageC.included) {
    const unitPrice = Number(offer.packageC.unitPrice || 890);
    const selectedMods = (offer.packageC.selectedModules || []).filter(m => m.selected !== false);
    const qty = selectedMods.length > 0 ? selectedMods.length : Number(offer.packageC.quantity || 1);
    const cTotal = unitPrice * qty;

    const moduleBulletList = selectedMods.length > 0
      ? selectedMods.map(m => `  • ${m.title || m.name || m}`).join('\n')
      : `  • ${offer.packageC.moduleName || 'Individuelle Erweiterungsmodule'}`;

    tableBody.push([
      `${posCounter++}`,
      `Paket 3: Modulare Funktionserweiterung (${qty} Modul${qty > 1 ? 'e' : ''} ausgewählt)\n` +
      `Ausgewählte(s) Funktionsmodul(e):\n` +
      `${moduleBulletList}\n` +
      `• Nahtlose Integration in die TeamTrack-Systemarchitektur\n` +
      `• Inkl. Funktionstest, Schnittstellenanbindung & Einweisung`,
      `${qty} Modul(e)`,
      `${docPrefix}${formatCurrency(unitPrice)}`,
      `${docPrefix}${formatCurrency(cTotal)}`
    ]);
  }

  if (offer.packageWhatsApp && offer.packageWhatsApp.included) {
    const setupPrice = Number(offer.packageWhatsApp.setupPrice || 390);
    const monthlyPrice = Number(offer.packageWhatsApp.monthlyPrice || 49);
    const minMonths = Number(offer.packageWhatsApp.minMonths || 12);
    const onceItems = (offer.packageWhatsApp.onceItems || []).map(name => `• ${name}`).join('\n');
    const monthlyItems = (offer.packageWhatsApp.monthlyItems || []).map(name => `• ${name}`).join('\n');

    tableBody.push([
      `${posCounter++}`,
      `WhatsApp-Terminassistent – Einrichtung\n` +
      `${onceItems}\n` +
      `Mindestlaufzeit ${minMonths} Monate. Meta-Gebühren für WhatsApp sind nicht enthalten.`,
      '1x Einmalig',
      `${docPrefix}${formatCurrency(setupPrice)}`,
      `${docPrefix}${formatCurrency(setupPrice)}`
    ]);
    tableBody.push([
      `${posCounter++}`,
      `WhatsApp-Terminassistent – Betreuung\n${monthlyItems}`,
      'Monatlich',
      `${docPrefix}${formatCurrency(monthlyPrice)} / Monat`,
      `${docPrefix}${formatCurrency(monthlyPrice)} / Monat`
    ]);
  }

  // Custom Items
  (offer.customItems || []).forEach(item => {
    const q = Number(item.quantity || 1);
    const p = Number(item.unitPrice || 0);
    tableBody.push([
      `${posCounter++}`,
      item.description || 'Individuelle Zusatzleistung',
      `${q}x`,
      `${docPrefix}${formatCurrency(p)}`,
      `${docPrefix}${formatCurrency(q * p)}`
    ]);
  });

  if (tableBody.length === 0) {
    tableBody.push([
      '1',
      'Softwareentwicklung & IT-Beratung Komplettlösung',
      '1x',
      `${docPrefix}${formatCurrency(offer.totalAmount || 2400)}`,
      `${docPrefix}${formatCurrency(offer.totalAmount || 2400)}`
    ]);
  }

  const tableStartY = introY + 5 + (introSplit.length * 4.5) + 3;

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [['Pos.', 'Bezeichnung / Leistungsumfang', 'Menge', 'Einzelpreis', 'Gesamtpreis']],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    }
  });

  // 5. TOTALS & SUMMARY BOX
  const finalY = doc.lastAutoTable.finalY + 5;
  const totalsWidth = 90;
  const totalsX = pageWidth - margin - totalsWidth;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  const oneTimeSum = Number(offer.totalOneTime || 0);
  const recurringSum = Number(offer.totalRecurring || 0);
  const recInterval = offer.recurringInterval || 'monthly';
  const recLabel = recInterval === 'yearly' ? 'pro Jahr' : recInterval === 'quarterly' ? 'pro Quartal' : 'pro Monat';
  const grandTotal = Number(offer.totalAmount || (oneTimeSum + recurringSum));

  const hasWaTotals = Boolean(offer.packageWhatsApp && offer.packageWhatsApp.included);
  const waMonthlySeparate = hasWaTotals && Boolean(offer.packageB?.included) ? Number(offer.packageWhatsApp.monthlyPrice || offer.totalWhatsAppMonthly || 49) : 0;
  const hasOnlyB = Boolean(offer.packageB && offer.packageB.included && !offer.packageA?.included && !offer.packageC?.included && !hasWaTotals);
  const hasOnlyWa = hasWaTotals && !offer.packageA?.included && !offer.packageB?.included && !offer.packageC?.included;
  const oneTimeLabel = (hasOnlyB || hasOnlyWa) ? 'Einmalige Einrichtung:' : 'Einmalige Entwicklung:';
  const bMonthly = Number(offer.packageB?.monthlyPrice ?? (offer.packageB?.interval === 'quarterly' || offer.packageB?.interval === 'yearly' ? 0 : offer.packageB?.recurringPrice) ?? 0);
  const bQuarterly = Number(offer.packageB?.quarterlyPrice ?? (offer.packageB?.interval === 'quarterly' ? offer.packageB?.recurringPrice : 0) ?? 0);
  const bYearly = Number(offer.packageB?.yearlyPrice ?? (offer.packageB?.interval === 'yearly' ? offer.packageB?.recurringPrice : 0) ?? 0);
  const includedPackageCount = [
    offer.packageA?.included,
    offer.packageB?.included,
    offer.packageC?.included,
    offer.packageWhatsApp?.included
  ].filter(Boolean).length;
  const multiplePackages = includedPackageCount > 1;
  const onlyPaket1 = Boolean(offer.packageA?.included) && includedPackageCount === 1;
  const onlyPaket2 = Boolean(offer.packageB?.included) && includedPackageCount === 1;
  const separateRows = [];
  if (multiplePackages) {
    if (offer.packageA?.included) separateRows.push(['Paket 1, einmalig', Number(offer.packageA.price || 0), '']);
    if (offer.packageB?.included) {
      separateRows.push(['Paket 2, einmalige Einrichtung', Number(offer.packageB.setupPrice || 0), '']);
      if (bMonthly > 0) separateRows.push(['Paket 2, monatlich', bMonthly, '/ Monat']);
      if (bQuarterly > 0) separateRows.push(['Paket 2, vierteljährlich', bQuarterly, '/ Quartal']);
      if (bYearly > 0) separateRows.push(['Paket 2, jährlich (15 % Nachlass)', bYearly, '/ Jahr']);
    }
    if (offer.packageC?.included) {
      const unitPrice = Number(offer.packageC.unitPrice || 0);
      const qty = Number(offer.packageC.quantity || 0);
      separateRows.push(['Paket 3', unitPrice * qty, '']);
    }
    if (offer.packageWhatsApp?.included) {
      separateRows.push(['WhatsApp, Einrichtung', Number(offer.packageWhatsApp.setupPrice || 0), '']);
      separateRows.push(['WhatsApp, monatlich', Number(offer.packageWhatsApp.monthlyPrice || 0), '/ Monat']);
    }
  }
  const paket2Setup = Number(offer.packageB?.setupPrice || 0);
  const wideTotals = multiplePackages || onlyPaket2;
  const totalsBoxX = wideTotals ? margin : totalsX;
  const totalsBoxW = wideTotals ? (pageWidth - margin * 2) : totalsWidth;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const paket2IntroLines = onlyPaket2
    ? doc.splitTextToSize('Nur eine Zahlungsweise. Die Einrichtung wird einmalig berechnet, danach nur das gewählte Intervall.', totalsBoxW - 8)
    : [];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const paket2ChoiceLines = onlyPaket2 ? [
    `oder monatlich: danach ${docPrefix}${formatCurrency(bMonthly)} / Monat. Erste Rechnung ${docPrefix}${formatCurrency(paket2Setup + bMonthly)} (einmalig inkl. Einrichtung ${docPrefix}${formatCurrency(paket2Setup)}).`,
    `oder vierteljährlich: danach ${docPrefix}${formatCurrency(bQuarterly)} / Quartal. Erste Rechnung ${docPrefix}${formatCurrency(paket2Setup + bQuarterly)} (einmalig inkl. Einrichtung ${docPrefix}${formatCurrency(paket2Setup)}).`,
    `oder jährlich (15 % Nachlass): danach ${docPrefix}${formatCurrency(bYearly)} / Jahr. Erste Rechnung ${docPrefix}${formatCurrency(paket2Setup + bYearly)} (einmalig inkl. Einrichtung ${docPrefix}${formatCurrency(paket2Setup)}).`
  ].map(line => doc.splitTextToSize(line, totalsBoxW - 8)) : [];
  const totalsBoxH = multiplePackages
    ? (12 + Math.max(separateRows.length, 1) * 5.5)
    : onlyPaket2
      ? (8 + paket2IntroLines.length * 3.8 + paket2ChoiceLines.reduce((sum, lines) => sum + lines.length * 3.4 + 1.6, 0) + 2)
      : (waMonthlySeparate > 0 ? 30 : 24);

  doc.roundedRect(totalsBoxX, finalY, totalsBoxW, totalsBoxH, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  if (multiplePackages) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(
      bothMainPackages
        ? 'Paket 1 und Paket 2 zusammen. Die Beträge bleiben getrennt.'
        : 'Mehrere Pakete. Die Beträge werden nicht addiert.',
      totalsBoxX + 4,
      finalY + 6
    );
    separateRows.forEach((row, index) => {
      const rowY = finalY + 12 + index * 5.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(row[0], totalsBoxX + 4, rowY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${docPrefix}${formatCurrency(row[1])}${row[2] ? ` ${row[2]}` : ''}`, totalsBoxX + totalsBoxW - 4, rowY, { align: 'right' });
    });
  } else if (onlyPaket2) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(paket2IntroLines, totalsBoxX + 4, finalY + 6);
    let choiceY = finalY + 6 + paket2IntroLines.length * 3.8 + 1.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    paket2ChoiceLines.forEach((lines) => {
      doc.text(lines, totalsBoxX + 4, choiceY);
      choiceY += lines.length * 3.4 + 1.6;
    });
  } else {
  doc.text(oneTimeLabel, totalsX + 4, finalY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${docPrefix}${formatCurrency(onlyPaket1 ? Number(offer.packageA?.price || 0) : oneTimeSum)}`, totalsX + totalsWidth - 4, finalY + 6, { align: 'right' });

  if (recurringSum > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Laufende Betreuung (${recLabel}):`, totalsX + 4, finalY + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 130, 203);
    doc.text(`${docPrefix}${formatCurrency(recurringSum)}`, totalsX + totalsWidth - 4, finalY + 12, { align: 'right' });
  }

  if (waMonthlySeparate > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('WhatsApp-Betreuung (pro Monat):', totalsX + 4, finalY + 18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(47, 106, 69);
    doc.text(`${docPrefix}${formatCurrency(waMonthlySeparate)}`, totalsX + totalsWidth - 4, finalY + 18, { align: 'right' });
  }

  const summaryLineY = waMonthlySeparate > 0 ? 21 : 15;
  const summaryTextY = waMonthlySeparate > 0 ? 26.5 : 20.5;

  // Summary line
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX + 4, finalY + summaryLineY, totalsX + totalsWidth - 4, finalY + summaryLineY);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(onlyPaket1 ? 'Gesamtsumme Paket 1:' : 'Gesamtsumme:', totalsX + 4, finalY + summaryTextY);
  doc.setTextColor(0, 130, 203);
  doc.text(`${docPrefix}${formatCurrency(grandTotal)}`, totalsX + totalsWidth - 4, finalY + summaryTextY, { align: 'right' });
  }

  // Tax note
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 16;
  const contentLimit = footerY - 6;
  const taxNoteY = finalY + totalsBoxH + 4;
  doc.text(kleinunternehmerText, margin, Math.min(taxNoteY, contentLimit), { maxWidth: pageWidth - (margin * 2) });

  // 6. CONDITIONS & ACCEPTANCE SECTION
  // Footer sits in a fixed band. Conditions that do not fit continue on the next page.
  let condY = finalY + totalsBoxH + 8;
  const boxWidth = pageWidth - (margin * 2); // 170mm
  const textWidth = boxWidth - 8; // 162mm

  const hasPkgA = Boolean(offer.packageA && offer.packageA.included);
  const hasPkgB = Boolean(offer.packageB && offer.packageB.included);
  const hasPkgC = Boolean(offer.packageC && offer.packageC.included);
  const hasWa = Boolean(offer.packageWhatsApp && offer.packageWhatsApp.included);
  const bInterval = offer.packageB?.interval || offer.recurringInterval || 'monthly';
  const bIntervalLabel = bInterval === 'yearly' ? 'jährlich' : bInterval === 'quarterly' ? 'vierteljährlich' : 'monatlich';

  const condItems = [];
  const pushPaket2Terms = () => {
    if (isKV) {
      condItems.push('• Hinweis zum Kostenvoranschlag: Dieses Dokument ist unverbindlich. Preisangaben verstehen sich als „ab“-Preise. Die folgenden Paket-2-Konditionen gelten bei späterer Beauftragung.');
    }
    condItems.push(`• Leistungsumfang Paket 2: Einmalige Einrichtung und laufende 7/24-Betreuung. ${PAKET2_ABNAHME_SCOPE}`);
    condItems.push(`• Betreuung Paket 2: ${PAKET2_ABNAHME_SERVICE}`);
    condItems.push(`• Vertragslaufzeit Paket 2: ${PAKET2_ABNAHME_TERMS[0]}. ${PAKET2_ABNAHME_TERMS[1]}. Die Zahlungsweise (monatlich, vierteljährlich oder jährlich) ändert die Laufzeit nicht.`);
    condItems.push(`• Kündigung Paket 2: ${PAKET2_ABNAHME_TERMS[2]}. ${PAKET2_ABNAHME_TERMS[3]}.`);
    condItems.push(`• Datensicherung Paket 2: ${PAKET2_ABNAHME_BACKUP}`);
    condItems.push(`• AVV: ${PAKET2_ABNAHME_AVV}`);
  };

  if (hasWa && !hasPkgA && !hasPkgB && !hasPkgC) {
    const setup = Number(offer.packageWhatsApp.setupPrice || 390);
    const monthly = Number(offer.packageWhatsApp.monthlyPrice || 49);
    const months = Number(offer.packageWhatsApp.minMonths || 12);
    condItems.push('• Leistung: Der WhatsApp-Terminassistent schreibt die Chat-Nachrichten, bietet nur freie Zeiten an, vergibt dieselbe Uhrzeit nicht doppelt und trägt den Termin in den Kalender ein (zum Beispiel Google Kalender).');
    condItems.push(`• Preise: Einrichtung ${formatCurrency(setup)} einmalig. Betreuung ${formatCurrency(monthly)} pro Monat. Mindestlaufzeit ${months} Monate, danach monatliche Verlängerung, bis eine Seite mit 30 Tagen kündigt.`);
    condItems.push('• Meta-Gebühren: Die Gebühren von Meta für WhatsApp sind nicht in der monatlichen Betreuung enthalten. Sie laufen über die Karte des Auftraggebers.');
    condItems.push('• Zahlung: Die einmalige Einrichtung wird mit der Abnahme fällig. Die monatliche Betreuung wird getrennt, jeweils zu Monatsbeginn, berechnet.');
    condItems.push(`• Gültigkeitsdauer: Dieses ${isKV ? 'Dokument' : 'Angebot'} ist gültig bis zum ${formatDate(offer.validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}.`);
  } else if (hasPkgB && !hasPkgA && !hasPkgC) {
    // Pure Paket B (Abo)
    pushPaket2Terms();
    condItems.push(`• Zahlungsmodalitäten: Einmaliges Setup bei Bereitstellung; laufende Abo-Betreuung jeweils zu Beginn des Abrechnungszeitraums (${bIntervalLabel}).`);
    condItems.push(`• Gültigkeitsdauer: Dieses ${isKV ? 'Dokument' : 'Angebot'} ist gültig bis zum ${formatDate(offer.validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}.`);
  } else if (hasPkgA) {
    // Paket A (Komplett-Entwicklung, optional + Paket B / C)
    condItems.push('• Verbindlicher Leistungsumfang: Es werden ausschließlich die in diesem Angebot explizit ausgewählten und aufgeführten Module und Leistungspositionen umgesetzt. Nicht im Angebot enthaltene Funktionsbereiche bedürfen einer gesonderten schriftlichen Beauftragung.');
    condItems.push('• Abnahme & Prüfung: Nach Übergabe der betriebsbereiten Software hat der Auftraggeber das System innerhalb von 10 Werktagen zu prüfen und schriftlich abzunehmen.');
    if (hasPkgB && hasPkgA) {
      condItems.push(`• Kostenlose 30-Tage-Nachbesserung (Paket 1): ${PAKET1_PARALLEL_NACHBESSERUNG}`);
      condItems.push(`• Abgrenzung zu Paket 2: ${PAKET1_PARALLEL_ABGRENZUNG}`);
    } else {
      condItems.push('• Kostenlose 30-Tage-Garantie: Ab dem Tag der Abnahme behebt der Auftragnehmer für einen Zeitraum von 30 Kalendertagen alle reproduzierbaren Fehler (Bugs) der vereinbarten Funktionen kostenlos.');
      condItems.push('• Nach Ablauf der 30 Tage (Ausschluss kostenloser Wartung): Nach Ablauf der 30 Tage erlischt jeglicher Anspruch auf kostenlose Serviceleistungen. Zukünftige Anpassungen, Sicherheitsupdates oder Betriebssystem-Upgrades erfolgen ausschließlich gegen gesonderte Vergütung zum Stundensatz von 85,- € / Std. oder im Rahmen eines separaten Wartungsvertrags (Paket 2).');
    }
    if (hasPkgB && hasPkgA) {
      condItems.unshift('• Zusammen beauftragt: Paket 1 ist die Festpreis-Entwicklung. Paket 2 ist die laufende 7/24-Betreuung. Die einmalige Einrichtung gehört zu Paket 2.');
      condItems.push('• Zahlung bei Paket 1: 50% Anzahlung bei Auftragsannahme, 50% Schlusszahlung nach Bereitstellung.');
      condItems.push('• Zahlung bei Paket 2: Die einmalige Einrichtung wird bei Bereitstellung fällig. Die Betreuung wird monatlich, vierteljährlich oder jährlich gewählt und zu Beginn dieses Intervalls berechnet.');
      if (isKV) {
        condItems.push('• Hinweis zum Kostenvoranschlag: Dieses Dokument ist unverbindlich. Preisangaben verstehen sich als „ab“-Preise. Die folgenden Paket-2-Konditionen gelten bei späterer Beauftragung.');
      }
      condItems.push('• Leistungsumfang Paket 2: Laufende 7/24-Betreuung neben Paket 1. Admin-Zugänge werden übergeben. Das System geht in den laufenden 7/24-Betrieb über.');
      condItems.push(`• Vertragslaufzeit Paket 2: ${PAKET2_PARALLEL_TERMS.join('. ')}.`);
      condItems.push(`• Datensicherung Paket 2: ${PAKET2_PARALLEL_BACKUP}`);
      condItems.push(`• AVV: ${PAKET2_PARALLEL_AVV}`);
    } else if (hasPkgB) {
      condItems.push(`• Zahlungsmodalitäten: 50% Anzahlung bei Auftragsannahme, 50% Schlusszahlung nach Bereitstellung; laufendes Abo jeweils zu Beginn des Abrechnungszeitraums (${bIntervalLabel}).`);
    } else {
      condItems.push('• Zahlungsmodalitäten: 50% Anzahlung bei Auftragsannahme, 50% Schlusszahlung nach Bereitstellung & Freigabe.');
    }
    condItems.push(`• Gültigkeitsdauer: Dieses ${isKV ? 'Dokument' : 'Angebot'} ist gültig bis zum ${formatDate(offer.validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}.`);
  } else {
    // Other (e.g. Paket C only)
    condItems.push('• Verbindlicher Leistungsumfang: Es werden ausschließlich die in diesem Angebot explizit ausgewählten und aufgeführten Module umgesetzt. Nicht im Angebot enthaltene Funktionsbereiche bedürfen einer gesonderten schriftlichen Beauftragung.');
    if (hasPkgB) {
      condItems.push(`• Zahlungsmodalitäten: 50% Anzahlung bei Auftragsannahme, 50% Schlusszahlung nach Bereitstellung; laufendes Abo jeweils zu Beginn des Abrechnungszeitraums (${bIntervalLabel}).`);
      pushPaket2Terms();
    } else {
      condItems.push('• Zahlungsmodalitäten: 50% Anzahlung bei Auftragsannahme, 50% Schlusszahlung nach Bereitstellung & Freigabe.');
    }
    condItems.push(`• Gültigkeitsdauer: Dieses ${isKV ? 'Dokument' : 'Angebot'} ist gültig bis zum ${formatDate(offer.validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}.`);
  }

  if (hasWa && (hasPkgA || hasPkgB || hasPkgC)) {
    const setup = Number(offer.packageWhatsApp.setupPrice || 390);
    const monthly = Number(offer.packageWhatsApp.monthlyPrice || 49);
    const months = Number(offer.packageWhatsApp.minMonths || 12);
    condItems.push(`• WhatsApp-Terminassistent: Einrichtung ${formatCurrency(setup)} einmalig, Betreuung ${formatCurrency(monthly)} pro Monat, Mindestlaufzeit ${months} Monate. Meta-Gebühren extra. Die Einrichtung wird mit der Abnahme fällig, die monatliche Betreuung getrennt.`);
  }

  if (offer.notes && offer.notes.trim()) {
    condItems.push(`• Individuelle Kundenvereinbarung: ${offer.notes.trim()}`);
  }

  const allSplitItems = condItems.map(item => doc.splitTextToSize(item, textWidth));
  const fontSize = 7.0;
  const lineSpacing = 3.0;
  let itemIndex = 0;
  let continuation = false;

  while (itemIndex < allSplitItems.length) {
    if (condY + 36 > contentLimit) {
      doc.addPage();
      condY = 18;
    }

    const chunkStart = condY;
    const available = contentLimit - chunkStart;
    let used = 9;
    const fitting = [];

    while (itemIndex < allSplitItems.length) {
      const lines = allSplitItems[itemIndex];
      const itemH = (lines.length * lineSpacing) + 1.0;
      if (fitting.length > 0 && used + itemH > available - 3) break;
      fitting.push(lines);
      used += itemH;
      itemIndex += 1;
      if (used + 8 > available) break;
    }

    const condH = used + 2.5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, chunkStart, boxWidth, condH, 2, 2, 'FD');

    doc.setFontSize(8.0);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const condHeading = continuation
      ? 'Leistungsumfang, Konditionen & Vereinbarungen (Fortsetzung):'
      : 'Leistungsumfang, Konditionen & Vereinbarungen:';
    doc.text(condHeading, margin + 4, chunkStart + 4.8);

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    let curY = chunkStart + 9;
    fitting.forEach((lines) => {
      doc.text(lines, margin + 4, curY);
      curY += (lines.length * lineSpacing) + 1.0;
    });

    continuation = true;
    if (itemIndex < allSplitItems.length) {
      doc.addPage();
      condY = 18;
    }
  }

  // 7. FOOTER on every page, below the reserved band so it never covers the conditions
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);

    doc.text(companySettings.companyName || 'TeamTrack-Software', margin, footerY, { maxWidth: 54 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Inhaberin: ${companySettings.ownerName || 'Huriye Ünalsoy'}`, margin, footerY + 3.8, { maxWidth: 54 });
    doc.text(streetLine, margin, footerY + 7.6, { maxWidth: 54 });
    doc.text(cityLine, margin, footerY + 11.4, { maxWidth: 54 });

    const col2X = 78;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Bankverbindung', col2X, footerY, { maxWidth: 58 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Bank: ${companySettings.bankName || 'Postbank'}`, col2X, footerY + 3.8, { maxWidth: 58 });
    doc.text(`IBAN: ${companySettings.iban || 'DE16 1001 0010 0012 7271 85'}`, col2X, footerY + 7.6, { maxWidth: 58 });
    doc.text(`BIC: ${companySettings.bic || 'PBNKDEFF'}`, col2X, footerY + 11.4, { maxWidth: 58 });

    const col3X = 140;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Kontakt & Steuernummer', col3X, footerY, { maxWidth: 50 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`St.-Nr.: ${companySettings.taxNumber || '257/282/11825'}`, col3X, footerY + 3.8, { maxWidth: 50 });
    doc.text(`E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`, col3X, footerY + 7.6, { maxWidth: 50 });
    doc.text(`Web: ${companySettings.website || 'www.team-track.de'}`, col3X, footerY + 11.4, { maxWidth: 50 });
  }

  return doc;
}

export function generateOfferPDF(offer, companySettings = {}) {
  const doc = createOfferDoc(offer, companySettings);
  const isKV = offer.type === 'kostenvoranschlag';
  const prefix = isKV ? 'Kostenvoranschlag' : 'Angebot';
  const num = offer.offerNumber || (isKV ? 'KV-2026-0001' : 'ANG-2026-0001');
  const custName = (offer.customerName || 'Kunde').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${prefix}_${num}_${custName}.pdf`;
  doc.save(fileName);
}

// ==========================================
// ABNAHMEPROTOKOLL (SOFTWARE ACCEPTANCE PROTOCOL)
// ==========================================

export function createAbnahmeDoc(data, companySettings = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width; // 210mm
  const margin = 20;

  // 1. CORPORATE HEADER
  try {
    doc.addImage('/logo.jpg', 'JPEG', margin, 18, 24, 24);
  } catch {
    doc.setFillColor(0, 10, 31);
    doc.roundedRect(margin, 18, 24, 24, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TT', margin + 7.5, 33);
  }

  const textStartX = margin + 27;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 10, 31);
  doc.text(companySettings.companyName || 'TeamTrack-Software', textStartX, 25.5);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(companySettings.tagline || 'Softwareentwicklung & IT-Beratung', textStartX, 30.5);

  const streetLine = companySettings.street || 'Balthasar-Neumann-Str. 38';
  const cityLine = companySettings.city ? `${companySettings.zip || ''} ${companySettings.city}` : '97236 Randersacker';

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${streetLine}, ${cityLine}`, textStartX, 36);
  const cleanAbnahmePhone = (companySettings.phone && !companySettings.phone.includes('4690446')) ? companySettings.phone : '+49 172 6125371';
  doc.text(`Tel: ${cleanAbnahmePhone}   |   E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`, textStartX, 41);
  doc.text(`Web: ${companySettings.website || 'www.team-track.de'}`, textStartX, 46);

  // Header Right: Title & Protocol Number
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ABNAHMEPROTOKOLL', pageWidth - margin, 26, { align: 'right' });

  const abnNumber = data.abnahmeNumber || `ABN-${new Date().getFullYear()}-${String(data.id || Date.now()).slice(-4)}`;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 130, 203);
  doc.text(abnNumber, pageWidth - margin, 32.5, { align: 'right' });

  if (data.offerNumber) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`zu Angebot: ${data.offerNumber}`, pageWidth - margin, 37.5, { align: 'right' });
  }

  // 2. RECIPIENT & META GRID
  const recipientY = 56;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${companySettings.companyName || 'TeamTrack-Software'} • ${streetLine} • ${cityLine}`, margin, recipientY);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.customerName || 'Auftraggeber', margin, recipientY + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  let curRecY = recipientY + 11;
  if (data.customerContact) {
    doc.text(`z. Hd. ${data.customerContact}`, margin, curRecY);
    curRecY += 4.5;
  }
  if (data.customerAddress) {
    const addrLines = data.customerAddress.split('\n');
    addrLines.forEach(l => {
      doc.text(l.trim(), margin, curRecY);
      curRecY += 4.5;
    });
  }
  if (data.customerEmail) {
    doc.text(`E-Mail: ${data.customerEmail}`, margin, curRecY);
    curRecY += 4.5;
  }

  // Meta Box (Right Side)
  const metaX = pageWidth - margin - 65;
  const metaY = recipientY - 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(metaX, metaY, 65, 35, 2.5, 2.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Abnahmedatum:', metaX + 4, metaY + 6.5);
  doc.text('Projekt-Status:', metaX + 4, metaY + 13.5);
  doc.text('Prüffrist:', metaX + 4, metaY + 20.5);
  doc.text('Bearbeiter:', metaX + 4, metaY + 27.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(data.date || new Date()), metaX + 61, metaY + 6.5, { align: 'right' });
  doc.text('Betriebsbereit', metaX + 61, metaY + 13.5, { align: 'right' });
  doc.text('10 Werktage (erledigt)', metaX + 61, metaY + 20.5, { align: 'right' });
  doc.text('TeamTrack Team', metaX + 61, metaY + 27.5, { align: 'right' });

  // 3. INTRODUCTORY STATEMENT
  const introY = Math.max(curRecY + 4, 94);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Software-Abnahmeerklärung & Funktionsbestätigung', margin, introY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const introDesc = `Hiermit wird die förmliche Abnahme und betriebsbereite Übergabe der nachfolgend aufgeführten Softwarelösung zwischen dem Auftragnehmer (${companySettings.companyName || 'TeamTrack-Software'}) und dem Auftraggeber (${data.customerName || 'Auftraggeber'}) dokumentiert und rechtsverbindlich erklärt:`;
  const introSplit = doc.splitTextToSize(introDesc, pageWidth - (margin * 2));
  doc.text(introSplit, margin, introY + 5);

  // 4. TABLE OF ACCEPTED MODULES & ITEMS
  const tableBody = [];
  let pos = 1;

  const defaultModNames = [
    'Kunden- & Stammdatenverwaltung',
    'Live-Terminkalender & Einsatzplanung',
    'Zeiterfassung & Digitale Stundenzettel',
    'Material- & Lagerwirtschaft',
    'Mobiler Foto-Upload & Schadensberichte',
    'Rollen- & Rechtesystem (Admin/Mitarbeiter)',
    'PDF-Berichts- und Rechnungsexport',
    'Automatisierte E-Mail- / SMS-Benachrichtigung'
  ];

  if (data.packageA && data.packageA.included) {
    const selectedModsA = data.packageA.selectedModules && data.packageA.selectedModules.length > 0
      ? data.packageA.selectedModules.map(m => typeof m === 'string' ? m : (m.title || m.name || m))
      : (data.packageA.moduleNames && data.packageA.moduleNames.length > 0
          ? data.packageA.moduleNames
          : defaultModNames);

    tableBody.push([
      `${pos++}`,
      `Paket 1: Komplett-Entwicklung & WebApp\n` +
      `Abgenommener Modulumfang:\n` +
      selectedModsA.map(m => `• ${m}`).join('\n'),
      'Vollständig bereitgestellt\n& ohne Mängel abgenommen'
    ]);
  }

  if (data.packageB && data.packageB.included) {
    const parallelWithPaket1 = Boolean(data.packageA && data.packageA.included);
    tableBody.push([
      `${pos++}`,
      parallelWithPaket1
        ? `Paket 2: Setup + 7/24 Abo-Betreuung\n` +
          `Admin-Zugänge wurden übergeben. Das System geht nahtlos in den laufenden 7/24-Betrieb über.\n` +
          `Mindestlaufzeit 12 Monate ab Bereitstellung, danach Verlängerung um jeweils 12 Monate. Kündigung mit 1 Monat Frist zum Laufzeitende.`
        : `Paket 2: Setup + 7/24 Abo-Betreuung\n` +
          `Das Initial-Setup wurde erfolgreich bereitgestellt und die Admin-Zugänge übergeben.\n` +
          `${PAKET2_ABNAHME_SCOPE}\n` +
          `Übergang in den laufenden 7/24-Betrieb gemäß dem geschlossenen Paket-2-Vertrag (Mindestlaufzeit 12 Monate).`,
      'Initial-Setup betriebsbereit\nübergeben & freigegeben'
    ]);
  }

  if (data.packageC && data.packageC.included) {
    const selectedMods = (data.packageC.selectedModules || []).filter(m => m.selected !== false);
    const modNames = selectedMods.length > 0 
      ? selectedMods.map(m => `• ${m.title || m.name || m}`).join('\n')
      : `• ${data.packageC.moduleName || 'Individuelle Erweiterungsmodule'}`;
    tableBody.push([
      `${pos++}`,
      `Paket 3: Modulare Funktionserweiterung\n${modNames}`,
      'Funktionsprüfung erfolgreich\nbestanden & integriert'
    ]);
  }

  if (data.packageWhatsApp && data.packageWhatsApp.included) {
    const checks = (data.packageWhatsApp.abnahmeChecks || []).length > 0
      ? data.packageWhatsApp.abnahmeChecks
      : [
          'Test-Termin per WhatsApp geschrieben',
          'Bestätigung kam an',
          'Termin steht im Kalender',
          'Leistungen, Preise und Öffnungszeiten sind die des Betriebs'
        ];
    tableBody.push([
      `${pos++}`,
      `WhatsApp-Terminassistent\n${checks.map(item => `• ${item}`).join('\n')}`,
      'Einrichtung geprüft\n& abgenommen'
    ]);
  }

  (data.customItems || []).forEach(item => {
    tableBody.push([
      `${pos++}`,
      item.description || 'Individuelle Zusatzleistung',
      'Erfolgreich bereitgestellt'
    ]);
  });

  if (tableBody.length === 0) {
    tableBody.push([
      '1',
      'Maßgeschneiderte Softwarelösung & WebApp Komplettpaket',
      'Ohne Mängel abgenommen'
    ]);
  }

  const tableStartY = introY + 5 + (introSplit.length * 4.2) + 2.5;

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [['Pos.', 'Abgenommene Leistungspositionen & Module', 'Status der Funktionsprüfung']],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.0
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 55, halign: 'center', fontStyle: 'bold' }
    }
  });

  // 5. LEGAL CONDITIONS & PROTECTION PARAGRAPHS (Continuous Sentences)
  const condY = doc.lastAutoTable.finalY + 4.5;
  const boxWidth = pageWidth - (margin * 2);
  const textWidth = boxWidth - 8;

  const hasPkgA = Boolean(data.packageA && data.packageA.included);
  const hasPkgB = Boolean(data.packageB && data.packageB.included);
  const hasPkgC = Boolean(data.packageC && data.packageC.included);
  const hasWa = Boolean(data.packageWhatsApp && data.packageWhatsApp.included);
  const waOnly = hasWa && !hasPkgA && !hasPkgB && !hasPkgC;

  const statements = [];

  if (waOnly) {
    const setup = Number(data.packageWhatsApp.setupPrice || 390);
    const monthly = Number(data.packageWhatsApp.monthlyPrice || 49);
    statements.push(
      '1. Abnahme der Einrichtung: Der Auftraggeber bestätigt, dass ein Test-Termin per WhatsApp geschrieben wurde, die Bestätigung ankam, der Termin im Kalender steht und Leistungen, Preise sowie Öffnungszeiten die des Betriebs sind.'
    );
    statements.push(
      `2. Fälligkeit: Mit dieser Unterschrift ist die Einrichtung abgenommen. Die einmalige Gebühr von ${formatCurrency(setup)} ist fällig. Die monatliche Betreuung von ${formatCurrency(monthly)} ist getrennt und nicht Teil dieses Protokolls.`
    );
    statements.push(
      '3. Meta-Gebühren: Die Gebühren von Meta für WhatsApp sind nicht in der monatlichen Betreuung enthalten. Sie laufen über die Karte des Auftraggebers.'
    );
  } else {
  // 1. General Acceptance
  statements.push(
    '1. Abnahmeerklärung: Der Auftraggeber bestätigt hiermit, dass die vertraglich vereinbarte Softwarelösung und alle oben aufgeführten Module vollständig, betriebsbereit und ordnungsgemäß übergeben wurden. Die Funktionsprüfung wurde innerhalb der vereinbarten Frist erfolgreich durchgeführt und das System wird ohne wesentliche Mängel abgenommen.'
  );

  // 2. Warranty / 30-Day Guarantee
  if (hasPkgA && hasPkgB) {
    statements.push(`Abnahme & 30-Tage-Nachbesserung (Paket 1): ${PAKET1_PARALLEL_NACHBESSERUNG} Wichtig – Abgrenzung zu Paket 2: ${PAKET1_PARALLEL_ABGRENZUNG}`);
    statements.push(`Vertragslaufzeit Paket 2: Admin-Zugänge wurden übergeben. Das System geht nahtlos in den laufenden 7/24-Betrieb über. ${PAKET2_PARALLEL_TERMS.join('. ')}.`);
    statements.push(`Datensicherung: ${PAKET2_PARALLEL_BACKUP}`);
    statements.push(`AVV: ${PAKET2_PARALLEL_AVV}`);
  } else if (hasPkgA) {
    statements.push(
      'Garantie & Ausschluss nach 30 Tagen: Mit dem Datum der Unterzeichnung dieses Protokolls beginnt die 30-tägige kostenlose Garantiefrist. Innerhalb dieses Zeitraums behebt der Auftragnehmer alle nachweisbaren, reproduzierbaren Funktionsfehler (Bugs) kostenlos. Nach Ablauf der 30 Kalendertage erlischt jeglicher Anspruch auf unentgeltliche Serviceleistungen. Nachträgliche Anpassungen, Erweiterungen oder Sicherheits-Patches erfolgen ausschließlich gegen gesonderte Vergütung (Stundensatz: 85,- € / Std.) oder im Rahmen eines separaten Wartungsvertrags.'
    );
  }

  if (hasPkgB && !hasPkgA) {
    statements.push(
      `Paket-2-Vertrag: Das System geht hiermit in den laufenden 7/24-Betrieb über gemäß dem geschlossenen Paket-2-Vertrag. ${PAKET2_ABNAHME_TERMS.join(' ')} ${PAKET2_ABNAHME_SERVICE}`
    );
    statements.push(`Datensicherung: ${PAKET2_ABNAHME_BACKUP}`);
    statements.push(`AVV: ${PAKET2_ABNAHME_AVV}`);
  } else if (!hasPkgB) {
    statements.push(
      'Eigenverantwortung Datensicherung: Die regelmäßige Erstellung und Sicherung von Backups obliegt der alleinigen Sorgfaltspflicht des Auftraggebers. Über die im System integrierte 1-Klick Backup-Funktion können vollständige Datensicherungen jederzeit eigenständig als JSON-Datei exportiert und archiviert werden.'
    );
  }

  statements.push(
    'Ausschluss nicht vereinbarter Leistungen: Funktionen, Schnittstellen oder Sonderwünsche, die nicht explizit in diesem Protokoll aufgeführt sind, sind nicht Bestandteil dieser Abnahme und bedürfen einer gesonderten schriftlichen Beauftragung.'
  );
  if (hasWa) {
    const setup = Number(data.packageWhatsApp.setupPrice || 390);
    const monthly = Number(data.packageWhatsApp.monthlyPrice || 49);
    statements.push(
      `WhatsApp-Terminassistent: Die Einrichtung ist mit diesem Protokoll abgenommen. Die einmalige Gebühr von ${formatCurrency(setup)} ist fällig. Die monatliche Betreuung von ${formatCurrency(monthly)} wird getrennt berechnet.`
    );
  }
  }

  statements.forEach((text, index) => {
    statements[index] = `${index + 1}. ${text.replace(/^\d+\.\s/, '')}`;
  });

  const fontSize = 6.8;
  const lineSpacing = 2.8;
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 16;
  const contentLimit = footerY - 6;
  const allSplitStatements = statements.map(st => doc.splitTextToSize(st, textWidth));

  let itemIndex = 0;
  let continuation = false;
  let lastBottom = condY;

  while (itemIndex < allSplitStatements.length) {
    if (condY + 28 > contentLimit) {
      doc.addPage();
      condY = 18;
    }

    const chunkStart = condY;
    const available = contentLimit - chunkStart;
    let used = 9;
    const fitting = [];

    while (itemIndex < allSplitStatements.length) {
      const lines = allSplitStatements[itemIndex];
      const itemH = (lines.length * lineSpacing) + 1.0;
      if (fitting.length > 0 && used + itemH > available - 3) break;
      fitting.push(lines);
      used += itemH;
      itemIndex += 1;
      if (used + 8 > available) break;
    }

    const boxH = used + 2.5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, chunkStart, boxWidth, boxH, 2, 2, 'FD');

    doc.setFontSize(7.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(
      continuation
        ? 'Rechtliche Vereinbarungen (Fortsetzung):'
        : 'Rechtliche Vereinbarungen & Gewährleistungsbedingungen:',
      margin + 4,
      chunkStart + 4.2
    );

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    let curStmtY = chunkStart + 8.2;
    fitting.forEach((lines) => {
      doc.text(lines, margin + 4, curStmtY);
      curStmtY += (lines.length * lineSpacing) + 1.0;
    });

    lastBottom = chunkStart + boxH;
    continuation = true;
    if (itemIndex < allSplitStatements.length) {
      doc.addPage();
      condY = 18;
    }
  }

  // 6. SIGNATURE SECTION
  let sigY = lastBottom + 6;
  if (sigY + 14 > contentLimit) {
    doc.addPage();
    sigY = 22;
  }
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, sigY + 8, margin + 70, sigY + 8);
  doc.line(pageWidth - margin - 70, sigY + 8, pageWidth - margin, sigY + 8);

  doc.setFontSize(7.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Ort, Datum & Unterschrift Auftragnehmer', margin, sigY + 11.5);
  doc.text('Ort, Datum, Unterschrift & Stempel Auftraggeber', pageWidth - margin - 70, sigY + 11.5);

  // 7. FOOTER on every page
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);

  // Column 1
  doc.text(companySettings.companyName || 'TeamTrack-Software', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Inhaberin: ${companySettings.ownerName || 'Huriye Ünalsoy'}`, margin, footerY + 3.8);
  doc.text(streetLine, margin, footerY + 7.6);
  doc.text(cityLine, margin, footerY + 11.4);

  // Column 2
  const col2X = 78;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Bankverbindung', col2X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Bank: ${companySettings.bankName || 'Postbank'}`, col2X, footerY + 3.8);
  doc.text(`IBAN: ${companySettings.iban || 'DE16 1001 0010 0012 7271 85'}`, col2X, footerY + 7.6);
  doc.text(`BIC: ${companySettings.bic || 'PBNKDEFF'}`, col2X, footerY + 11.4);

  // Column 3
  const col3X = 140;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Kontakt & Steuernummer', col3X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`St.-Nr.: ${companySettings.taxNumber || '257/282/11825'}`, col3X, footerY + 3.8);
  doc.text(`E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`, col3X, footerY + 7.6);
  doc.text(`Web: ${companySettings.website || 'www.team-track.de'}`, col3X, footerY + 11.4);
  }

  return doc;
}

export function generateAbnahmePDF(data, companySettings = {}) {
  const doc = createAbnahmeDoc(data, companySettings);
  const num = data.abnahmeNumber || `ABN-${new Date().getFullYear()}-${String(data.id || Date.now()).slice(-4)}`;
  const custName = (data.customerName || 'Kunde').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Abnahmeprotokoll_${num}_${custName}.pdf`;
  doc.save(fileName);
}

