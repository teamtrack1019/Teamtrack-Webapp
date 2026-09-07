export function formatCurrency(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(num);
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadge(status) {
  switch (status) {
    case 'active':
      return { label: 'Aktiv', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'lead':
      return { label: 'Interessent', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'archived':
      return { label: 'Archiviert', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    case 'paid':
      return { label: 'Bezahlt', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'sent':
      return { label: 'Versendet / Offen', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'draft':
      return { label: 'Entwurf', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    case 'overdue':
      return { label: 'Überfällig', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'completed':
      return { label: 'Erledigt', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'cancelled':
      return { label: 'Storniert / Gekündigt', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getOfferReminderStatus(customer) {
  if (!customer) return null;
  const hasOffer = customer.offerEmailSent || Boolean(customer.lastOffer);
  if (!hasOffer) return null;

  const validUntilStr = customer.offerValidUntilDate || customer.lastOffer?.validUntilDate;
  if (!validUntilStr) return null;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(validUntilStr);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const hasResponded = Boolean(customer.offerCustomerResponded);
    const isExpired = diffDays < 0;
    const isDueSoon = diffDays <= 3; // 3 days before or on/past due date

    return {
      diffDays,
      validUntilDate: validUntilStr,
      hasResponded,
      respondedAt: customer.offerCustomerRespondedAt,
      isExpired,
      isDueSoon,
      shouldAlert: !hasResponded && isDueSoon,
      type: customer.offerEmailType || customer.lastOffer?.type || 'angebot',
      offerNumber: customer.offerEmailNumber || customer.lastOffer?.offerNumber || ''
    };
  } catch {
    return null;
  }
}
