/**
 * Legal Document HTML Template
 *
 * Professional HTML template for generating legal documents as PDFs.
 * Supports bilingual content (English/Arabic), RTL layouts, and signatures.
 */

import type { PDFGenerationOptions } from '../types.js';
import {
  getBaseStyles,
  formatDate,
  getStatusBadgeClass,
  getStatusLabel,
  escapeHtml,
  renderPartyCard,
  renderSignatureBlock,
  renderAuditTrail,
} from './base.js';

// ============================================
// MAIN TEMPLATE GENERATOR
// ============================================

export function generateLegalDocumentHTML(options: PDFGenerationOptions): string {
  const {
    metadata,
    contentEn,
    contentAr,
    partyA,
    partyB,
    signers = [],
    auditTrail = [],
    language,
    country,
    isDraft = false,
    includeWatermark = true,
    includeSignatures = true,
    includeWitnesses = true,
    includeAuditTrail = false,
    includeLogo = true,
    logoUrl,
  } = options;

  const isRTL = language === 'ar' || language === 'ur';
  const content = isRTL ? (contentAr || contentEn || '') : (contentEn || '');
  const title = isRTL ? (metadata.titleAr || metadata.title) : metadata.title;

  // Parse content into sections
  const contentSections = parseContentToSections(content, isRTL);

  return `
<!DOCTYPE html>
<html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - ${metadata.documentNumber}</title>
  <style>
    ${getBaseStyles(isRTL)}
  </style>
</head>
<body>
  <div class="page">
    <!-- Watermark -->
    ${isDraft && includeWatermark ? `
      <div class="watermark">${isRTL ? 'مسودة' : 'DRAFT'}</div>
    ` : ''}

    <!-- QR Code Placeholder -->
    <div class="qr-section">
      <div class="qr-code">QR</div>
      <div class="qr-label">${isRTL ? 'تحقق' : 'Verify'}</div>
    </div>

    <!-- Header -->
    <header class="document-header">
      <div class="brand">
        ${includeLogo && logoUrl ? `
          <img src="${logoUrl}" alt="Logo" style="height: 40px; margin-bottom: 0.5rem;" />
        ` : `
          <div class="brand-logo">Qannoni</div>
        `}
        <div class="brand-tagline">${isRTL ? 'وثائق قانونية احترافية' : 'Professional Legal Documents'}</div>
      </div>
      <div class="document-badge ${getStatusBadgeClass(metadata.status)}">
        ${getStatusLabel(isDraft ? 'draft' : metadata.status, language)}
      </div>
    </header>

    <!-- Document Title -->
    <div class="document-title">
      <h1>${escapeHtml(title.toUpperCase())}</h1>
      <div class="document-jurisdiction">
        ${isRTL ? country.nameAr : country.name}
        ${country.jurisdiction ? ` - ${country.jurisdiction}` : ''}
      </div>
    </div>

    <!-- Reference Bar -->
    <div class="reference-bar">
      <div class="reference-item">
        <div class="reference-label">${isRTL ? 'رقم المرجع' : 'Reference No.'}</div>
        <div class="reference-value">${metadata.documentNumber}</div>
      </div>
      <div class="reference-item">
        <div class="reference-label">${isRTL ? 'التاريخ' : 'Date'}</div>
        <div class="reference-value">${formatDate(metadata.createdAt, language)}</div>
      </div>
      <div class="reference-item">
        <div class="reference-label">${isRTL ? 'النوع' : 'Type'}</div>
        <div class="reference-value">${formatDocumentType(metadata.documentType, isRTL)}</div>
      </div>
      <div class="reference-item">
        <div class="reference-label">${isRTL ? 'الحالة' : 'Status'}</div>
        <div class="reference-value" style="color: ${getStatusColor(metadata.status)}">
          ${getStatusLabel(metadata.status, language)}
        </div>
      </div>
    </div>

    <!-- Parties Section -->
    ${partyA && partyB ? `
      <section class="parties-section">
        <h2>${isRTL ? 'الأطراف المتعاقدة' : 'CONTRACTING PARTIES'}</h2>
        <div class="parties-grid">
          ${renderPartyCard(partyA, 'PARTY A (First Party)', 'الطرف الأول', isRTL)}
          ${renderPartyCard(partyB, 'PARTY B (Second Party)', 'الطرف الثاني', isRTL)}
        </div>
      </section>
    ` : ''}

    <!-- Document Content -->
    <section class="document-content">
      ${contentSections.map(section => renderSection(section, isRTL)).join('')}
    </section>

    <!-- Signatures Section -->
    ${includeSignatures ? `
      <section class="signatures-section">
        <h2 class="signatures-title">${isRTL ? 'التوقيعات' : 'SIGNATURES'}</h2>
        <p class="signatures-intro">
          ${isRTL
            ? 'بموجب هذا العقد، أقر الطرفان بموافقتهما الكاملة على جميع الشروط والأحكام المذكورة أعلاه.'
            : 'IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.'}
        </p>
        <div class="signatures-grid">
          ${signers.length > 0
            ? signers.filter(s => s.role === 'signer').map(signer => renderSignatureBlock(signer, isRTL)).join('')
            : `
              ${renderPlaceholderSignature(isRTL ? 'الطرف الأول' : 'Party A', partyA?.name || '', isRTL)}
              ${renderPlaceholderSignature(isRTL ? 'الطرف الثاني' : 'Party B', partyB?.name || '', isRTL)}
            `
          }
        </div>
      </section>
    ` : ''}

    <!-- Witnesses Section -->
    ${includeWitnesses ? `
      <section class="witnesses-section">
        <h3 class="witnesses-title">${isRTL ? 'الشهود' : 'WITNESSES'}</h3>
        <div class="signatures-grid">
          ${signers.filter(s => s.role === 'witness').length > 0
            ? signers.filter(s => s.role === 'witness').map(witness => renderSignatureBlock(witness, isRTL)).join('')
            : `
              ${renderPlaceholderWitness(1, isRTL)}
              ${renderPlaceholderWitness(2, isRTL)}
            `
          }
        </div>
      </section>
    ` : ''}

    <!-- Audit Trail -->
    ${includeAuditTrail && auditTrail.length > 0 ? renderAuditTrail(auditTrail, isRTL) : ''}

    <!-- Footer -->
    <footer class="document-footer">
      <p class="disclaimer">
        ${isRTL
          ? 'تنبيه: تم إنشاء هذه الوثيقة باستخدام منصة قانوني. يُنصح بمراجعتها من قبل محامٍ مرخص قبل التوقيع.'
          : 'DISCLAIMER: This document was generated using the Qannoni platform. It is recommended to have it reviewed by a licensed attorney before signing.'}
      </p>
      <p class="footer-info">
        ${isRTL ? 'تم الإنشاء بواسطة قانوني' : 'Generated by Qannoni'} | ${formatDate(new Date().toISOString(), language)}
      </p>
    </footer>
  </div>
</body>
</html>
  `;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

interface ContentSection {
  type: 'heading' | 'article' | 'paragraph' | 'list' | 'signature';
  title?: string;
  content: string;
  items?: string[];
}

function parseContentToSections(content: string, isRTL: boolean): ContentSection[] {
  const sections: ContentSection[] = [];
  const lines = content.split('\n');

  let currentSection: ContentSection | null = null;
  let listItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect article/section headings
    if (trimmed.match(/^(ARTICLE|المادة|SECTION|القسم|CLAUSE|البند)\s*\d*/i)) {
      if (currentSection) sections.push(currentSection);
      if (listItems.length > 0) {
        sections.push({ type: 'list', content: '', items: listItems });
        listItems = [];
      }
      currentSection = {
        type: 'article',
        title: trimmed,
        content: '',
      };
    }
    // Detect WHEREAS clauses
    else if (trimmed.match(/^(WHEREAS|حيث أن|RECITALS|المقدمة)/i)) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        type: 'heading',
        title: trimmed,
        content: '',
      };
    }
    // Detect numbered list items
    else if (trimmed.match(/^\d+\./)) {
      listItems.push(trimmed.replace(/^\d+\.\s*/, ''));
    }
    // Regular content
    else {
      if (currentSection) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmed;
      } else {
        sections.push({
          type: 'paragraph',
          content: trimmed,
        });
      }
    }
  }

  if (currentSection) sections.push(currentSection);
  if (listItems.length > 0) {
    sections.push({ type: 'list', content: '', items: listItems });
  }

  return sections;
}

function renderSection(section: ContentSection, isRTL: boolean): string {
  switch (section.type) {
    case 'heading':
      return `
        <div class="article">
          <h2>${escapeHtml(section.title || '')}</h2>
          ${section.content ? `<p>${escapeHtml(section.content)}</p>` : ''}
        </div>
      `;

    case 'article':
      return `
        <div class="article">
          <div class="article-title">${escapeHtml(section.title || '')}</div>
          <div class="article-content">
            ${section.content.split('\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}
          </div>
        </div>
      `;

    case 'list':
      return `
        <ul class="terms-list">
          ${(section.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      `;

    case 'paragraph':
    default:
      return `<p>${escapeHtml(section.content)}</p>`;
  }
}

function renderPlaceholderSignature(role: string, name: string, isRTL: boolean): string {
  return `
    <div class="signature-block">
      <div class="signature-role">${role}</div>
      <div class="signature-line"></div>
      <div class="signature-name">${name ? escapeHtml(name) : '_'.repeat(20)}</div>
      <div class="signature-date">${isRTL ? 'التاريخ:' : 'Date:'} _____________</div>
    </div>
  `;
}

function renderPlaceholderWitness(number: number, isRTL: boolean): string {
  return `
    <div class="signature-block">
      <div class="signature-role">${isRTL ? `الشاهد ${number}` : `Witness ${number}`}</div>
      <div class="signature-line"></div>
      <div class="signature-name">${isRTL ? 'الاسم:' : 'Name:'} _____________</div>
      <div class="signature-date">${isRTL ? 'رقم الهوية:' : 'ID:'} _____________</div>
    </div>
  `;
}

function formatDocumentType(type: string, isRTL: boolean): string {
  const types: Record<string, { en: string; ar: string }> = {
    employment_contract: { en: 'Employment Contract', ar: 'عقد عمل' },
    rental_agreement: { en: 'Rental Agreement', ar: 'عقد إيجار' },
    sale_agreement: { en: 'Sale Agreement', ar: 'عقد بيع' },
    service_agreement: { en: 'Service Agreement', ar: 'عقد خدمات' },
    nda: { en: 'Non-Disclosure Agreement', ar: 'اتفاقية عدم إفشاء' },
    power_of_attorney: { en: 'Power of Attorney', ar: 'توكيل رسمي' },
    mou: { en: 'Memorandum of Understanding', ar: 'مذكرة تفاهم' },
    partnership_agreement: { en: 'Partnership Agreement', ar: 'عقد شراكة' },
    loan_agreement: { en: 'Loan Agreement', ar: 'عقد قرض' },
    general_contract: { en: 'General Contract', ar: 'عقد عام' },
  };

  const formatted = types[type] || { en: type.replace(/_/g, ' '), ar: type };
  return isRTL ? formatted.ar : formatted.en;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: '#92400e',
    pending: '#d97706',
    pending_signatures: '#d97706',
    partially_signed: '#2563eb',
    signed: '#065f46',
    certified: '#5b21b6',
    expired: '#dc2626',
    cancelled: '#dc2626',
  };
  return colors[status] || '#64748b';
}

// ============================================
// BILINGUAL TEMPLATE
// ============================================

export function generateBilingualDocumentHTML(options: PDFGenerationOptions): string {
  const {
    metadata,
    contentEn,
    contentAr,
    partyA,
    partyB,
    signers = [],
    country,
    isDraft = false,
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(metadata.title)} - ${metadata.documentNumber}</title>
  <style>
    ${getBaseStyles(false)}

    .bilingual-container {
      display: grid;
      grid-template-columns: 1fr 1px 1fr;
      gap: 0;
    }

    .bilingual-divider {
      background: linear-gradient(to bottom, transparent, #cbd5e1, transparent);
    }

    .bilingual-column {
      padding: 0 1.5rem;
    }

    .bilingual-column.ltr {
      direction: ltr;
      text-align: left;
      font-family: 'Inter', sans-serif;
    }

    .bilingual-column.rtl {
      direction: rtl;
      text-align: right;
      font-family: 'Amiri', 'Cairo', serif;
    }
  </style>
</head>
<body>
  <div class="page">
    ${isDraft ? '<div class="watermark">DRAFT / مسودة</div>' : ''}

    <!-- Header -->
    <header class="document-header">
      <div class="brand">
        <div class="brand-logo">Qannoni | قانوني</div>
        <div class="brand-tagline">Professional Legal Documents | وثائق قانونية احترافية</div>
      </div>
      <div class="document-badge ${getStatusBadgeClass(metadata.status)}">
        ${getStatusLabel(metadata.status, 'en')} / ${getStatusLabel(metadata.status, 'ar')}
      </div>
    </header>

    <!-- Document Title -->
    <div class="document-title">
      <h1>${escapeHtml(metadata.title.toUpperCase())}</h1>
      <h1 style="font-family: 'Amiri', serif; margin-top: 0.5rem;">${escapeHtml(metadata.titleAr || metadata.title)}</h1>
      <div class="document-jurisdiction">
        ${country.name} | ${country.nameAr}
      </div>
    </div>

    <!-- Reference Bar -->
    <div class="reference-bar">
      <div class="reference-item">
        <div class="reference-label">Reference / المرجع</div>
        <div class="reference-value">${metadata.documentNumber}</div>
      </div>
      <div class="reference-item">
        <div class="reference-label">Date / التاريخ</div>
        <div class="reference-value">${formatDate(metadata.createdAt, 'en')}</div>
      </div>
      <div class="reference-item">
        <div class="reference-label">Type / النوع</div>
        <div class="reference-value">${formatDocumentType(metadata.documentType, false)}</div>
      </div>
      <div class="reference-item">
        <div class="reference-label">Status / الحالة</div>
        <div class="reference-value">${getStatusLabel(metadata.status, 'en')}</div>
      </div>
    </div>

    <!-- Bilingual Content -->
    <div class="bilingual-container">
      <div class="bilingual-column ltr">
        <h2>ENGLISH VERSION</h2>
        ${contentEn ? contentEn.split('\n').filter(p => p.trim()).map(p => `<p>${escapeHtml(p)}</p>`).join('') : ''}
      </div>
      <div class="bilingual-divider"></div>
      <div class="bilingual-column rtl">
        <h2>النسخة العربية</h2>
        ${contentAr ? contentAr.split('\n').filter(p => p.trim()).map(p => `<p>${escapeHtml(p)}</p>`).join('') : ''}
      </div>
    </div>

    <!-- Signatures -->
    <section class="signatures-section">
      <h2 class="signatures-title">SIGNATURES / التوقيعات</h2>
      <div class="signatures-grid">
        ${renderPlaceholderSignature('Party A / الطرف الأول', partyA?.name || '', false)}
        ${renderPlaceholderSignature('Party B / الطرف الثاني', partyB?.name || '', false)}
      </div>
    </section>

    <!-- Footer -->
    <footer class="document-footer">
      <p class="footer-info">
        Generated by Qannoni | تم الإنشاء بواسطة قانوني | ${formatDate(new Date().toISOString(), 'en')}
      </p>
    </footer>
  </div>
</body>
</html>
  `;
}
