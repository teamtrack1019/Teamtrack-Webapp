import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';
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

  const phoneEmail = `Tel: ${companySettings.phone || '+49 172 4690446'}   |   E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`;
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
  doc.text(`Tel: ${companySettings.phone || '+49 172 4690446'}   |   E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`, textStartX, 41);
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
  const introDesc = isKV
    ? 'vielen Dank für Ihre Anfrage. Nachfolgend erhalten Sie unseren detaillierten und unverbindlichen Kostenvoranschlag für die geplante Umsetzung Ihrer maßgeschneiderten Softwarelösung:'
    : 'vielen Dank für Ihr Vertrauen. Gerne unterbreiten wir Ihnen nachfolgend unser maßgeschneidertes, verbindliches Angebot für die Entwicklung und Bereitstellung Ihrer Lösung:';
  
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

  // Paket 2 (ehemals Paket B)
  if (offer.packageB && offer.packageB.included) {
    const setupPrice = Number(offer.packageB.setupPrice || 0);
    const interval = offer.packageB.interval || 'monthly';
    const intervalLabel = interval === 'yearly' ? 'Jährlich' : interval === 'quarterly' ? 'Vierteljährlich' : 'Monatlich';
    const intervalUnit = interval === 'yearly' ? 'Jahr' : interval === 'quarterly' ? 'Quartal' : 'Monat';
    const recurringPrice = Number(offer.packageB.recurringPrice || (interval === 'yearly' ? 1590 : interval === 'quarterly' ? 420 : 149));

    // Pos (Setup) if setupPrice > 0
    if (setupPrice > 0) {
      tableBody.push([
        `${posCounter++}`,
        'Einmalige Einrichtung (Setup)',
        '1x',
        `${docPrefix}${formatCurrency(setupPrice)}`,
        `${docPrefix}${formatCurrency(setupPrice)}`
      ]);
    }

    // Pos (Abo-Betreuung)
    tableBody.push([
      `${posCounter++}`,
      `Paket 2: 7/24 Abo-Betreuung (${intervalLabel})`,
      `${intervalLabel}`,
      `${docPrefix}${formatCurrency(recurringPrice)} / ${intervalUnit}`,
      `${docPrefix}${formatCurrency(recurringPrice)} / ${intervalUnit}`
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
  doc.roundedRect(totalsX, finalY, totalsWidth, 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const oneTimeSum = Number(offer.totalOneTime || 0);
  const recurringSum = Number(offer.totalRecurring || 0);
  const recInterval = offer.recurringInterval || 'monthly';
  const recLabel = recInterval === 'yearly' ? 'pro Jahr' : recInterval === 'quarterly' ? 'pro Quartal' : 'pro Monat';
  const grandTotal = Number(offer.totalAmount || (oneTimeSum + recurringSum));

  const hasOnlyB = Boolean(offer.packageB && offer.packageB.included && !offer.packageA?.included && !offer.packageC?.included);
  const oneTimeLabel = hasOnlyB ? 'Einmalige Einrichtung (Setup):' : 'Einmalige Entwicklung:';

  doc.text(oneTimeLabel, totalsX + 4, finalY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${docPrefix}${formatCurrency(oneTimeSum)}`, totalsX + totalsWidth - 4, finalY + 6, { align: 'right' });

  if (recurringSum > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Laufende Betreuung (${recLabel}):`, totalsX + 4, finalY + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 130, 203);
    doc.text(`${docPrefix}${formatCurrency(recurringSum)}`, totalsX + totalsWidth - 4, finalY + 12, { align: 'right' });
  }

  // Summary line
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX + 4, finalY + 15, totalsX + totalsWidth - 4, finalY + 15);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Gesamtsumme:', totalsX + 4, finalY + 20.5);
  doc.setTextColor(0, 130, 203);
  doc.text(`${docPrefix}${formatCurrency(grandTotal)}`, totalsX + totalsWidth - 4, finalY + 20.5, { align: 'right' });

  // Tax note
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(kleinunternehmerText, margin, finalY + 28);

  // 6. CONDITIONS & ACCEPTANCE SECTION
  const condY = finalY + 30;
  const boxWidth = pageWidth - (margin * 2); // 170mm
  const textWidth = boxWidth - 8; // 162mm

  const hasPkgA = Boolean(offer.packageA && offer.packageA.included);
  const hasPkgB = Boolean(offer.packageB && offer.packageB.included);
  const hasPkgC = Boolean(offer.packageC && offer.packageC.included);
  const bInterval = offer.packageB?.interval || offer.recurringInterval || 'monthly';
  const bIntervalLabel = bInterval === 'yearly' ? 'jährlich' : bInterval === 'quarterly' ? 'vierteljährlich' : 'monatlich';

  const condItems = [];

  if (hasPkgB && !hasPkgA && !hasPkgC) {
    // Pure Paket B (Abo)
    condItems.push(`• Leistungsumfang & Abo-Service: Das System wird mit einer initialen Einrichtung schlüsselfertig implementiert. Die laufende 7/24-Abo-Betreuung umfasst vorrangigen Notfall-Support mit direkter Entwickler-Reaktionszeit, hochverfügbaren Cloud-Server-Betrieb in ISO-zertifizierten Rechenzentren, kontinuierliche DSGVO- und Sicherheitsupdates, integrierte Datensicherungs-Tools sowie laufende Feature-Erweiterungen und Funktionsanpassungen (Mindestlaufzeit 12 Monate, monatlich zahlbar und flexibel erweiterbar).`);
    condItems.push(`• Datensicherung (Backups): Die regelmäßige Datensicherung liegt in der Verantwortung des Auftraggebers und erfolgt eigenständig über die im System integrierte 1-Klick Backup-Funktion.`);
    condItems.push(`• Zahlungsmodalitäten: Einmaliges Setup bei Bereitstellung; laufende Abo-Betreuung jeweils zu Beginn des Abrechnungszeitraums (${bIntervalLabel}).`);
    condItems.push(`• Gültigkeitsdauer: Dieses ${isKV ? 'Dokument' : 'Angebot'} ist gültig bis zum ${formatDate(offer.validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}.`);
  } else if (hasPkgA) {
    // Paket A (Komplett-Entwicklung, optional + Paket B / C)
    condItems.push('• Verbindlicher Leistungsumfang: Es werden ausschließlich die in diesem Angebot explizit ausgewählten und aufgeführten Module und Leistungspositionen umgesetzt. Nicht im Angebot enthaltene Funktionsbereiche bedürfen einer gesonderten schriftlichen Beauftragung.');
    condItems.push('• Abnahme & Prüfung: Nach Übergabe der betriebsbereiten Software hat der Auftraggeber das System innerhalb von 10 Werktagen zu prüfen und schriftlich abzunehmen.');
    condItems.push('• Kostenlose 30-Tage-Garantie: Ab dem Tag der Abnahme behebt der Auftragnehmer für einen Zeitraum von 30 Kalendertagen alle reproduzierbaren Fehler (Bugs) der vereinbarten Funktionen kostenlos.');
    condItems.push('• Nach Ablauf der 30 Tage (Ausschluss kostenloser Wartung): Nach Ablauf der 30 Tage erlischt jeglicher Anspruch auf kostenlose Serviceleistungen. Zukünftige Anpassungen, Sicherheitsupdates oder Betriebssystem-Upgrades erfolgen ausschließlich gegen gesonderte Vergütung zum Stundensatz von 85,- € / Std. oder im Rahmen eines separaten Wartungsvertrags (Paket 2).');
    if (hasPkgB) {
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
    } else {
      condItems.push('• Zahlungsmodalitäten: 50% Anzahlung bei Auftragsannahme, 50% Schlusszahlung nach Bereitstellung & Freigabe.');
    }
    condItems.push(`• Gültigkeitsdauer: Dieses ${isKV ? 'Dokument' : 'Angebot'} ist gültig bis zum ${formatDate(offer.validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}.`);
  }

  if (offer.notes && offer.notes.trim()) {
    condItems.push(`• Individuelle Kundenvereinbarung: ${offer.notes.trim()}`);
  }

  const allSplitItems = condItems.map(item => doc.splitTextToSize(item, textWidth));
  const totalLineCount = allSplitItems.reduce((acc, lines) => acc + lines.length, 0);

  const fontSize = 7.0;
  const lineSpacing = 3.0;
  const condH = 6.0 + (totalLineCount * lineSpacing) + (condItems.length * 0.8);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, condY, boxWidth, condH, 2, 2, 'FD');

  doc.setFontSize(8.0);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Leistungsumfang, Konditionen & Vereinbarungen:', margin + 4, condY + 4.8);

  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  let curY = condY + 8.2;
  allSplitItems.forEach((lines) => {
    doc.text(lines, margin + 4, curY);
    curY += (lines.length * lineSpacing) + 0.8;
  });

  // Signature lines
  const sigY = condY + condH + 2.5;
  if (sigY + 12 < 278) {
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, sigY + 8, margin + 70, sigY + 8);
    doc.line(pageWidth - margin - 70, sigY + 8, pageWidth - margin, sigY + 8);

    doc.setFontSize(7.0);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Ort, Datum & Unterschrift Auftragnehmer', margin, sigY + 11.5);
    doc.text('Auftragsbestätigung Kunde (Unterschrift & Stempel)', pageWidth - margin - 70, sigY + 11.5);
  }

  // 7. FOOTER (3 Spacious Columns to prevent any IBAN / Email overlap)
  const footerY = 281;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);

  // Column 1: Company & Address (margin = 20mm)
  doc.text(companySettings.companyName || 'TeamTrack-Software', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Inhaberin: ${companySettings.ownerName || 'Huriye Ünalsoy'}`, margin, footerY + 3.8);
  doc.text(streetLine, margin, footerY + 7.6);
  doc.text(cityLine, margin, footerY + 11.4);

  // Column 2: Bankverbindung (Starts at 78mm - ample room for long IBANs)
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

  // Column 3: Contact & Tax (Starts at 140mm)
  const col3X = 140;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Kontakt & Steuernummer', col3X, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`St.-Nr.: ${companySettings.taxNumber || '27/123/45678'}`, col3X, footerY + 3.8);
  doc.text(`E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`, col3X, footerY + 7.6);
  doc.text(`Web: ${companySettings.website || 'www.team-track.de'}`, col3X, footerY + 11.4);

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
  doc.text(`Tel: ${companySettings.phone || '+49 172 4690446'}   |   E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`, textStartX, 41);
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
  doc.roundedRect(metaX, metaY, 65, 28, 2.5, 2.5, 'FD');

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
  const introY = Math.max(curRecY + 3, 90);
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
    const interval = data.packageB.interval || data.recurringInterval || 'monthly';
    const intervalLabel = interval === 'yearly' ? 'Jährlich' : interval === 'quarterly' ? 'Vierteljährlich' : 'Monatlich';
    tableBody.push([
      `${pos++}`,
      `Paket 2: Setup + 7/24 Abo-Betreuung (${intervalLabel})\n` +
      `• Schlüsselfertige Initial-Einrichtung & Admin-Übergabe\n` +
      `• Übergang in den laufenden 7/24-Support & Serverbetrieb`,
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

  const statements = [];

  // 1. General Acceptance
  statements.push(
    '1. Abnahmeerklärung: Der Auftraggeber bestätigt hiermit, dass die vertraglich vereinbarte Softwarelösung und alle oben aufgeführten Module vollständig, betriebsbereit und ordnungsgemäß übergeben wurden. Die Funktionsprüfung wurde innerhalb der vereinbarten Frist erfolgreich durchgeführt und das System wird ohne wesentliche Mängel abgenommen.'
  );

  // 2. Warranty / 30-Day Guarantee
  if (hasPkgA) {
    statements.push(
      '2. Garantie & Ausschluss nach 30 Tagen: Mit dem Datum der Unterzeichnung dieses Protokolls beginnt die 30-tägige kostenlose Garantiefrist. Innerhalb dieses Zeitraums behebt der Auftragnehmer alle nachweisbaren, reproduzierbaren Funktionsfehler (Bugs) kostenlos. Nach Ablauf der 30 Kalendertage erlischt jeglicher Anspruch auf unentgeltliche Serviceleistungen. Nachträgliche Anpassungen, Erweiterungen oder Sicherheits-Patches erfolgen ausschließlich gegen gesonderte Vergütung (Stundensatz: 85,- € / Std.) oder im Rahmen eines separaten Wartungsvertrags.'
    );
  }

  // 3. Backup responsibility (Automated server backups for Paket B or Customer responsibility)
  if (hasPkgB) {
    statements.push(
      `${hasPkgA ? '3.' : '2.'} Datensicherung & Server-Backups: Im Rahmen der laufenden 7/24 Betreuung führt TeamTrack tägliche automatisierte Server-Backups durch. Ergänzend obliegt dem Auftraggeber die eigenverantwortliche lokale Archivierung über die integrierte 1-Klick Backup-Funktion.`
    );
  } else {
    statements.push(
      `${hasPkgA ? '3.' : '2.'} Eigenverantwortung Datensicherung: Die regelmäßige Erstellung und Sicherung von Backups obliegt der alleinigen Sorgfaltspflicht des Auftraggebers. Über die im System integrierte 1-Klick Backup-Funktion können vollständige Datensicherungen jederzeit eigenständig als JSON-Datei exportiert und archiviert werden.`
    );
  }

  // 4. Scope Limitation
  statements.push(
    `${hasPkgA ? '4.' : '3.'} Ausschluss nicht vereinbarter Leistungen: Funktionen, Schnittstellen oder Sonderwünsche, die nicht explizit in diesem Protokoll aufgeführt sind, sind nicht Bestandteil dieser Abnahme und bedürfen einer gesonderten schriftlichen Beauftragung.`
  );

  const allSplitStatements = statements.map(st => doc.splitTextToSize(st, textWidth));
  const totalLines = allSplitStatements.reduce((sum, lines) => sum + lines.length, 0);

  const fontSize = 6.8;
  const lineSpacing = 2.8;
  const condH = 5.5 + (totalLines * lineSpacing) + (statements.length * 0.6);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, condY, boxWidth, condH, 2, 2, 'FD');

  doc.setFontSize(7.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Rechtliche Vereinbarungen & Gewährleistungsbedingungen:', margin + 4, condY + 4.2);

  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  let curStmtY = condY + 7.5;
  allSplitStatements.forEach((lines) => {
    doc.text(lines, margin + 4, curStmtY);
    curStmtY += (lines.length * lineSpacing) + 0.6;
  });

  // 6. SIGNATURE SECTION
  const sigY = condY + condH + 3.0;
  if (sigY + 12 < 278) {
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, sigY + 8, margin + 70, sigY + 8);
    doc.line(pageWidth - margin - 70, sigY + 8, pageWidth - margin, sigY + 8);

    doc.setFontSize(7.0);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Ort, Datum & Unterschrift Auftragnehmer', margin, sigY + 11.5);
    doc.text('Ort, Datum, Unterschrift & Stempel Auftraggeber', pageWidth - margin - 70, sigY + 11.5);
  }

  // 7. FOOTER
  const footerY = 281;
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
  doc.text(`St.-Nr.: ${companySettings.taxNumber || '27/123/45678'}`, col3X, footerY + 3.8);
  doc.text(`E-Mail: ${companySettings.email || 'kontakt@team-track.de'}`, col3X, footerY + 7.6);
  doc.text(`Web: ${companySettings.website || 'www.team-track.de'}`, col3X, footerY + 11.4);

  return doc;
}

export function generateAbnahmePDF(data, companySettings = {}) {
  const doc = createAbnahmeDoc(data, companySettings);
  const num = data.abnahmeNumber || `ABN-${new Date().getFullYear()}-${String(data.id || Date.now()).slice(-4)}`;
  const custName = (data.customerName || 'Kunde').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Abnahmeprotokoll_${num}_${custName}.pdf`;
  doc.save(fileName);
}

