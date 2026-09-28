export const WHATSAPP_JOB_NOTES = `Einrichtung:
• WhatsApp-Terminassistent einrichten
• Leistungen, Preise und Öffnungszeiten hinterlegen
• Termin im Kalender, zum Beispiel Google Kalender

Abnahme:
• Test-Termin per WhatsApp geschrieben
• Bestätigung kam an
• Termin steht im Kalender
• Leistungen, Preise und Öffnungszeiten sind die des Betriebs

Preise: Einrichtung 390 € einmalig, Betreuung 49 € / Monat, Mindestlaufzeit 12 Monate. Meta-Gebühren extra.`;

export function buildWhatsAppDisposition(offer, ownerName) {
  const customerName = offer?.customerName || '';
  return {
    title: `WhatsApp-Terminassistent${customerName ? ` – ${customerName}` : ''}`,
    customerId: offer?.customerId || '',
    customerName,
    project: 'WhatsApp-Termin',
    priority: 'medium',
    status: 'geplant',
    tags: ['#WhatsApp', '#Termin', '#Salon'],
    assignee: ownerName || 'Huriye Ünalsoy',
    date: new Date().toISOString().split('T')[0],
    notes: WHATSAPP_JOB_NOTES,
    jobType: 'whatsapp-termin',
    offerNumber: offer?.offerNumber || ''
  };
}

function moduleTitles(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((entry) => (typeof entry === 'string' ? entry : (entry?.title || entry?.name || '')))
    .filter(Boolean);
}

function intervalLabel(interval) {
  if (interval === 'yearly') return 'jährlich';
  if (interval === 'quarterly') return 'vierteljährlich';
  return 'monatlich';
}

export function buildInvoiceDraft(offer) {
  const items = [];
  const docLabel = offer?.type === 'kostenvoranschlag' ? 'Kostenvoranschlag' : 'Angebot';
  const offerRef = offer?.offerNumber ? ` (${docLabel} ${offer.offerNumber})` : '';

  if (offer?.packageA?.included) {
    const mods = moduleTitles(offer.packageA.selectedModules).length
      ? moduleTitles(offer.packageA.selectedModules)
      : moduleTitles(offer.packageA.moduleNames);
    const modText = mods.length ? `: ${mods.join(', ')}` : '';
    items.push({
      description: `Paket 1: Komplett-Entwicklung & WebApp${modText}${offerRef}`,
      quantity: 1,
      unitPrice: Number(offer.packageA.price || 0)
    });
  }

  if (offer?.packageB?.included) {
    const setupPrice = Number(offer.packageB.setupPrice || 0);
    const recurringPrice = Number(offer.packageB.recurringPrice || 0);
    const interval = offer.packageB.interval || offer.recurringInterval || 'monthly';
    if (setupPrice > 0) {
      items.push({
        description: `Paket 2: Einmalige Einrichtung (Setup)${offerRef}`,
        quantity: 1,
        unitPrice: setupPrice
      });
    }
    if (recurringPrice > 0) {
      items.push({
        description: `Paket 2: 7/24 Abo-Betreuung (${intervalLabel(interval)})${offerRef}`,
        quantity: 1,
        unitPrice: recurringPrice
      });
    }
  }

  if (offer?.packageC?.included) {
    const selected = (offer.packageC.selectedModules || []).filter((mod) => mod && mod.selected !== false);
    const titles = moduleTitles(selected);
    const quantity = titles.length > 0 ? titles.length : Number(offer.packageC.quantity || 1);
    const unitPrice = Number(offer.packageC.unitPrice || 0);
    if (quantity > 0 && unitPrice > 0) {
      items.push({
        description: `Paket 3: Modulare Funktionserweiterung${titles.length ? `: ${titles.join(', ')}` : ''}${offerRef}`,
        quantity,
        unitPrice
      });
    }
  }

  if (offer?.packageWhatsApp?.included) {
    items.push({
      description: `WhatsApp-Terminassistent – Einrichtung (einmalig)${offerRef}`,
      quantity: 1,
      unitPrice: Number(offer.packageWhatsApp.setupPrice || 390)
    });
    items.push({
      description: `WhatsApp-Terminassistent – Betreuung (1. Monat)${offerRef}`,
      quantity: 1,
      unitPrice: Number(offer.packageWhatsApp.monthlyPrice || 49)
    });
  }

  (offer?.customItems || []).forEach((item) => {
    const description = String(item?.description || '').trim();
    const unitPrice = Number(item?.unitPrice || 0);
    if (!description && unitPrice === 0) return;
    items.push({
      description: description || 'Individuelle Zusatzleistung',
      quantity: Number(item?.quantity || 1),
      unitPrice
    });
  });

  if (items.length === 0) {
    items.push({
      description: `${docLabel} ${offer?.offerNumber || ''}`.trim(),
      quantity: 1,
      unitPrice: Number(offer?.totalOneTime || offer?.totalAmount || 0)
    });
  }

  const notes = [];
  if (offer?.offerNumber) {
    notes.push(`Positionen übernommen aus ${docLabel} ${offer.offerNumber}.`);
  }
  if (offer?.packageWhatsApp?.included) {
    const months = Number(offer.packageWhatsApp.minMonths || 12);
    notes.push(`WhatsApp-Terminassistent: Mindestlaufzeit ${months} Monate, danach monatlich, Kündigung mit 30 Tagen. Meta-Gebühren sind nicht enthalten und laufen über die Karte des Kunden. Die monatliche Betreuung wird ab dem Folgemonat getrennt berechnet.`);
  }
  if (offer?.notes && String(offer.notes).trim()) {
    notes.push(String(offer.notes).trim());
  }

  return { items, notes: notes.join(' ') };
}
