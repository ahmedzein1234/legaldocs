// ============================================
// DATE UTILITIES
// ============================================

export function formatDate(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (locale === 'ar') {
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return formatDate(d, 'ar');
  }

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d, 'en');
}

// ============================================
// CURRENCY UTILITIES
// ============================================

export type GCCCurrency = 'AED' | 'SAR' | 'QAR' | 'KWD' | 'BHD' | 'OMR';

const currencySymbols: Record<GCCCurrency, { en: string; ar: string }> = {
  AED: { en: 'AED', ar: 'د.إ' },
  SAR: { en: 'SAR', ar: 'ر.س' },
  QAR: { en: 'QAR', ar: 'ر.ق' },
  KWD: { en: 'KWD', ar: 'د.ك' },
  BHD: { en: 'BHD', ar: 'د.ب' },
  OMR: { en: 'OMR', ar: 'ر.ع' },
};

export function formatCurrency(
  amount: number,
  currency: GCCCurrency = 'AED',
  locale: string = 'en'
): string {
  const symbol = currencySymbols[currency]?.[locale === 'ar' ? 'ar' : 'en'] || currency;
  const formatted = amount.toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return locale === 'ar' ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
}

// ============================================
// LANGUAGE UTILITIES
// ============================================

export function isRTL(locale: string): boolean {
  return ['ar', 'ur', 'fa', 'he'].includes(locale);
}

export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

// ============================================
// DOCUMENT UTILITIES
// ============================================

export function generateDocumentNumber(prefix: string = 'DR'): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export function getDocumentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'gray',
    pending_review: 'yellow',
    pending_signatures: 'blue',
    partially_signed: 'orange',
    signed: 'green',
    certified: 'purple',
    archived: 'slate',
  };
  return colors[status] || 'gray';
}

export function getDocumentStatusLabel(status: string, locale: string = 'en'): string {
  const labels: Record<string, { en: string; ar: string }> = {
    draft: { en: 'Draft', ar: 'مسودة' },
    pending_review: { en: 'Pending Review', ar: 'قيد المراجعة' },
    pending_signatures: { en: 'Pending Signatures', ar: 'في انتظار التوقيعات' },
    partially_signed: { en: 'Partially Signed', ar: 'موقع جزئياً' },
    signed: { en: 'Signed', ar: 'موقع' },
    certified: { en: 'Certified', ar: 'موثق' },
    archived: { en: 'Archived', ar: 'مؤرشف' },
  };
  return labels[status]?.[locale === 'ar' ? 'ar' : 'en'] || status;
}

// ============================================
// ANONYMIZATION UTILITIES
// ============================================

export function anonymizeText(text: string): string {
  // Replace common PII patterns
  return text
    // Emirates ID
    .replace(/784-\d{4}-\d{7}-\d/g, '[EMIRATES_ID]')
    // Phone numbers
    .replace(/\+?971[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}/g, '[PHONE]')
    .replace(/\+?966[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}/g, '[PHONE]')
    // Email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    // Names (basic pattern - would need NER for accuracy)
    .replace(/(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g, '[NAME]');
}

export function anonymizeParties(text: string): string {
  // Replace party names with placeholders
  let result = text;
  const partyPatterns = [
    { pattern: /First Party:?\s*([^\n]+)/gi, replacement: 'First Party: [PARTY A]' },
    { pattern: /Second Party:?\s*([^\n]+)/gi, replacement: 'Second Party: [PARTY B]' },
    { pattern: /Landlord:?\s*([^\n]+)/gi, replacement: 'Landlord: [PARTY A]' },
    { pattern: /Tenant:?\s*([^\n]+)/gi, replacement: 'Tenant: [PARTY B]' },
    { pattern: /Employer:?\s*([^\n]+)/gi, replacement: 'Employer: [COMPANY]' },
    { pattern: /Employee:?\s*([^\n]+)/gi, replacement: 'Employee: [PARTY A]' },
  ];

  for (const { pattern, replacement } of partyPatterns) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export function isValidEmiratesId(id: string): boolean {
  const pattern = /^784-\d{4}-\d{7}-\d$/;
  return pattern.test(id);
}

export function isValidUAEPhone(phone: string): boolean {
  const pattern = /^\+?971[\s-]?(50|52|54|55|56|58)[\s-]?\d{3}[\s-]?\d{4}$/;
  return pattern.test(phone.replace(/\s/g, ''));
}

export function isValidSaudiPhone(phone: string): boolean {
  const pattern = /^\+?966[\s-]?(5\d)[\s-]?\d{3}[\s-]?\d{4}$/;
  return pattern.test(phone.replace(/\s/g, ''));
}

// ============================================
// STRING UTILITIES
// ============================================

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
