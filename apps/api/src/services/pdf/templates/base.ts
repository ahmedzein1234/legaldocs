/**
 * Base HTML Template for Professional Legal Documents
 *
 * This template provides the foundation for all PDF documents with:
 * - Professional typography with Google Fonts (Amiri for Arabic, Inter for English)
 * - RTL support for Arabic/Urdu
 * - Tailwind-inspired utility classes
 * - Print-optimized CSS
 * - Responsive design that works in browser rendering
 */

import type { PDFGenerationOptions, PartyInfo, SignerInfo, AuditEntry } from '../types.js';

// ============================================
// CSS STYLES
// ============================================

export const getBaseStyles = (isRTL: boolean = false) => `
  /* Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');

  /* CSS Reset & Base */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 11pt;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: ${isRTL ? "'Amiri', 'Cairo', 'Noto Naskh Arabic', serif" : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"};
    color: #1a1a2e;
    background-color: #ffffff;
    direction: ${isRTL ? 'rtl' : 'ltr'};
    text-align: ${isRTL ? 'right' : 'left'};
  }

  /* Page Layout */
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm 25mm;
    margin: 0 auto;
    background: #ffffff;
    position: relative;
  }

  @media print {
    .page {
      padding: 15mm 20mm;
      page-break-after: always;
    }
    .page:last-child {
      page-break-after: auto;
    }
  }

  /* Typography */
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e3a5f;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d4a6f;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    border-bottom: 2px solid #e8eef4;
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #3d5a7f;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 0.75rem;
    text-align: justify;
    hyphens: auto;
  }

  /* Header Styles */
  .document-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 1.5rem;
    border-bottom: 3px solid #1e3a5f;
    margin-bottom: 1.5rem;
  }

  .brand {
    display: flex;
    flex-direction: column;
  }

  .brand-logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e3a5f;
    letter-spacing: -0.03em;
  }

  .brand-tagline {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  .document-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .badge-draft {
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #f59e0b;
  }

  .badge-final {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #10b981;
  }

  .badge-signed {
    background-color: #dbeafe;
    color: #1e40af;
    border: 1px solid #3b82f6;
  }

  .badge-certified {
    background-color: #ede9fe;
    color: #5b21b6;
    border: 1px solid #8b5cf6;
  }

  /* Document Title */
  .document-title {
    text-align: center;
    margin: 1.5rem 0;
    padding: 1rem 0;
  }

  .document-title h1 {
    font-size: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  .document-jurisdiction {
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Reference Bar */
  .reference-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #e2e8f0;
  }

  .reference-item {
    text-align: center;
  }

  .reference-label {
    font-size: 0.625rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .reference-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e3a5f;
  }

  /* Party Cards */
  .parties-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin: 1.5rem 0;
  }

  .party-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .party-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #1e3a5f;
  }

  .party-icon {
    width: 2rem;
    height: 2rem;
    background: #1e3a5f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .party-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e3a5f;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .party-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 0.75rem;
  }

  .party-details {
    font-size: 0.8125rem;
    color: #475569;
    line-height: 1.5;
  }

  .party-detail-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .detail-label {
    color: #94a3b8;
    min-width: 4rem;
  }

  .detail-value {
    color: #1e293b;
    font-weight: 500;
  }

  /* Content Sections */
  .document-content {
    margin: 2rem 0;
  }

  .article {
    margin-bottom: 1.5rem;
  }

  .article-number {
    font-weight: 700;
    color: #1e3a5f;
    margin-bottom: 0.5rem;
  }

  .article-title {
    font-weight: 600;
    color: #2d4a6f;
    margin-bottom: 0.75rem;
    font-size: 1rem;
  }

  .article-content {
    color: #334155;
    line-height: 1.7;
  }

  /* Terms List */
  .terms-list {
    list-style: none;
    counter-reset: term-counter;
    padding: 0;
  }

  .terms-list li {
    counter-increment: term-counter;
    position: relative;
    padding-${isRTL ? 'right' : 'left'}: 2rem;
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }

  .terms-list li::before {
    content: counter(term-counter) ".";
    position: absolute;
    ${isRTL ? 'right' : 'left'}: 0;
    font-weight: 600;
    color: #1e3a5f;
  }

  /* Signature Section */
  .signatures-section {
    margin-top: 3rem;
    page-break-inside: avoid;
  }

  .signatures-title {
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    color: #1e3a5f;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  .signatures-intro {
    text-align: center;
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 2rem;
    font-style: italic;
  }

  .signatures-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }

  .signature-block {
    text-align: center;
  }

  .signature-role {
    font-weight: 600;
    color: #1e3a5f;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .signature-line {
    border-bottom: 2px solid #1e3a5f;
    width: 100%;
    height: 3rem;
    margin-bottom: 0.5rem;
    position: relative;
  }

  .signature-image {
    position: absolute;
    bottom: 0.25rem;
    left: 50%;
    transform: translateX(-50%);
    max-height: 2.5rem;
    max-width: 80%;
  }

  .signature-name {
    font-size: 0.875rem;
    color: #1e293b;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .signature-date {
    font-size: 0.75rem;
    color: #64748b;
  }

  /* Witnesses Section */
  .witnesses-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px dashed #cbd5e1;
  }

  .witnesses-title {
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1.5rem;
  }

  /* Audit Trail */
  .audit-section {
    margin-top: 2rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    font-size: 0.75rem;
  }

  .audit-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
  }

  .audit-table {
    width: 100%;
    border-collapse: collapse;
  }

  .audit-table th,
  .audit-table td {
    padding: 0.5rem;
    text-align: ${isRTL ? 'right' : 'left'};
    border-bottom: 1px solid #e2e8f0;
  }

  .audit-table th {
    background: #f1f5f9;
    font-weight: 600;
    color: #475569;
    font-size: 0.6875rem;
    text-transform: uppercase;
  }

  .audit-table td {
    color: #64748b;
  }

  /* Footer */
  .document-footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
    text-align: center;
  }

  .disclaimer {
    font-size: 0.6875rem;
    color: #94a3b8;
    font-style: italic;
    margin-bottom: 0.5rem;
  }

  .footer-info {
    font-size: 0.625rem;
    color: #cbd5e1;
  }

  /* Watermark */
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 6rem;
    font-weight: 700;
    color: rgba(220, 38, 38, 0.08);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    pointer-events: none;
    z-index: -1;
    white-space: nowrap;
  }

  /* QR Code */
  .qr-section {
    position: absolute;
    top: 20mm;
    ${isRTL ? 'left' : 'right'}: 25mm;
    text-align: center;
  }

  .qr-code {
    width: 60px;
    height: 60px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.5rem;
    color: #94a3b8;
  }

  .qr-label {
    font-size: 0.5rem;
    color: #94a3b8;
    margin-top: 0.25rem;
  }

  /* Print Styles */
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      box-shadow: none;
      border: none;
    }

    .watermark {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }

  /* Bilingual Support */
  .bilingual {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .lang-en {
    direction: ltr;
    text-align: left;
    font-family: 'Inter', sans-serif;
  }

  .lang-ar {
    direction: rtl;
    text-align: right;
    font-family: 'Amiri', 'Cairo', serif;
  }

  .divider-vertical {
    border-left: 1px solid #e2e8f0;
    margin: 0 1rem;
  }
`;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatDate(dateStr: string, language: string = 'en'): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');

  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const month = language === 'ar' ? monthNamesAr[date.getMonth()] : monthNamesEn[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'badge-draft',
    pending: 'badge-draft',
    pending_signatures: 'badge-draft',
    partially_signed: 'badge-signed',
    signed: 'badge-signed',
    certified: 'badge-certified',
    final: 'badge-final',
  };
  return statusMap[status] || 'badge-draft';
}

export function getStatusLabel(status: string, language: string): string {
  const labels: Record<string, { en: string; ar: string }> = {
    draft: { en: 'Draft', ar: 'مسودة' },
    pending: { en: 'Pending', ar: 'قيد الانتظار' },
    pending_signatures: { en: 'Pending Signatures', ar: 'بانتظار التوقيعات' },
    partially_signed: { en: 'Partially Signed', ar: 'موقع جزئياً' },
    signed: { en: 'Signed', ar: 'موقع' },
    certified: { en: 'Certified', ar: 'مصدق' },
    final: { en: 'Final', ar: 'نهائي' },
    expired: { en: 'Expired', ar: 'منتهي' },
    cancelled: { en: 'Cancelled', ar: 'ملغى' },
  };

  const label = labels[status] || { en: status, ar: status };
  return language === 'ar' ? label.ar : label.en;
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// ============================================
// COMPONENT RENDERERS
// ============================================

export function renderPartyCard(party: PartyInfo, role: string, roleAr: string, isRTL: boolean): string {
  const icon = role.includes('A') || role.includes('First') ? 'A' : 'B';

  return `
    <div class="party-card">
      <div class="party-header">
        <div class="party-icon">${icon}</div>
        <span class="party-title">${isRTL ? roleAr : role}</span>
      </div>
      <div class="party-name">${escapeHtml(isRTL && party.nameAr ? party.nameAr : party.name)}</div>
      <div class="party-details">
        <div class="party-detail-row">
          <span class="detail-label">${isRTL ? 'رقم الهوية:' : 'ID:'}</span>
          <span class="detail-value">${escapeHtml(party.idNumber)}</span>
        </div>
        ${party.nationality ? `
          <div class="party-detail-row">
            <span class="detail-label">${isRTL ? 'الجنسية:' : 'Nationality:'}</span>
            <span class="detail-value">${escapeHtml(party.nationality)}</span>
          </div>
        ` : ''}
        ${party.address ? `
          <div class="party-detail-row">
            <span class="detail-label">${isRTL ? 'العنوان:' : 'Address:'}</span>
            <span class="detail-value">${escapeHtml(isRTL && party.addressAr ? party.addressAr : party.address)}</span>
          </div>
        ` : ''}
        ${party.phone ? `
          <div class="party-detail-row">
            <span class="detail-label">${isRTL ? 'الهاتف:' : 'Phone:'}</span>
            <span class="detail-value">${escapeHtml(party.phone)}</span>
          </div>
        ` : ''}
        ${party.email ? `
          <div class="party-detail-row">
            <span class="detail-label">${isRTL ? 'البريد:' : 'Email:'}</span>
            <span class="detail-value">${escapeHtml(party.email)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function renderSignatureBlock(signer: SignerInfo, isRTL: boolean): string {
  const role = signer.role === 'signer' ? (isRTL ? 'موقع' : 'Signer') :
               signer.role === 'witness' ? (isRTL ? 'شاهد' : 'Witness') :
               signer.role === 'notary' ? (isRTL ? 'موثق' : 'Notary') :
               (isRTL ? 'معتمد' : 'Approver');

  return `
    <div class="signature-block">
      <div class="signature-role">${role}</div>
      <div class="signature-line">
        ${signer.signatureImage ? `<img src="${signer.signatureImage}" class="signature-image" alt="Signature" />` : ''}
      </div>
      <div class="signature-name">${escapeHtml(signer.name)}</div>
      <div class="signature-date">
        ${signer.signedAt ? formatDate(signer.signedAt, isRTL ? 'ar' : 'en') : `${isRTL ? 'التاريخ:' : 'Date:'} _____________`}
      </div>
    </div>
  `;
}

export function renderAuditTrail(entries: AuditEntry[], isRTL: boolean): string {
  if (!entries || entries.length === 0) return '';

  return `
    <div class="audit-section">
      <div class="audit-title">${isRTL ? 'سجل التدقيق' : 'Audit Trail'}</div>
      <table class="audit-table">
        <thead>
          <tr>
            <th>${isRTL ? 'التاريخ والوقت' : 'Date & Time'}</th>
            <th>${isRTL ? 'الحدث' : 'Event'}</th>
            <th>${isRTL ? 'التفاصيل' : 'Details'}</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(entry => `
            <tr>
              <td>${formatDate(entry.timestamp, isRTL ? 'ar' : 'en')}</td>
              <td>${escapeHtml(entry.event)}</td>
              <td>${entry.details ? escapeHtml(entry.details) : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
