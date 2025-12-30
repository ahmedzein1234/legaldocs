/**
 * Professional PDF Generator (Frontend Fallback)
 *
 * Enhanced pdfMake generator for professional legal documents.
 * Used as a fallback when the backend PDF service is unavailable.
 *
 * Features:
 * - Custom Arabic fonts (Amiri, Cairo)
 * - Professional styling with gradients and shadows
 * - RTL support for Arabic/Urdu
 * - Bilingual document support
 * - QR code placeholder for verification
 * - Audit trail section
 */

import type { TDocumentDefinitions, Content, StyleDictionary, TableCell } from 'pdfmake/interfaces';

// ============================================
// TYPES
// ============================================

export interface PartyInfo {
  name: string;
  nameAr?: string;
  idNumber: string;
  nationality?: string;
  address?: string;
  addressAr?: string;
  phone?: string;
  email?: string;
}

export interface SignerInfo {
  name: string;
  email: string;
  role: 'signer' | 'witness' | 'notary';
  status: 'pending' | 'signed' | 'declined';
  signedAt?: string;
  signatureImage?: string;
}

export interface AuditEntry {
  timestamp: string;
  event: string;
  actor?: string;
  details?: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  nameAr: string;
  currency: string;
  currencySymbol: string;
}

export interface ProfessionalPdfOptions {
  // Document info
  title: string;
  titleAr?: string;
  documentNumber: string;
  documentType: string;
  createdAt: string;
  status: string;

  // Content
  contentEn?: string;
  contentAr?: string;

  // Parties
  partyA?: PartyInfo;
  partyB?: PartyInfo;

  // Signatures
  signers?: SignerInfo[];
  includeWitnesses?: boolean;

  // Audit
  auditTrail?: AuditEntry[];
  includeAuditTrail?: boolean;

  // Localization
  language: 'en' | 'ar' | 'ur';
  country: CountryConfig;

  // Appearance
  isDraft?: boolean;
  includeLogo?: boolean;
  logoBase64?: string;

  // Owner info
  owner?: string;
}

// ============================================
// GCC COUNTRY CONFIGURATIONS
// ============================================

export const GCC_COUNTRIES: Record<string, CountryConfig> = {
  ae: { code: 'ae', name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', currency: 'AED', currencySymbol: 'د.إ' },
  sa: { code: 'sa', name: 'Kingdom of Saudi Arabia', nameAr: 'المملكة العربية السعودية', currency: 'SAR', currencySymbol: 'ر.س' },
  qa: { code: 'qa', name: 'State of Qatar', nameAr: 'دولة قطر', currency: 'QAR', currencySymbol: 'ر.ق' },
  kw: { code: 'kw', name: 'State of Kuwait', nameAr: 'دولة الكويت', currency: 'KWD', currencySymbol: 'د.ك' },
  bh: { code: 'bh', name: 'Kingdom of Bahrain', nameAr: 'مملكة البحرين', currency: 'BHD', currencySymbol: 'د.ب' },
  om: { code: 'om', name: 'Sultanate of Oman', nameAr: 'سلطنة عمان', currency: 'OMR', currencySymbol: 'ر.ع' },
};

// ============================================
// PDFMAKE INSTANCE
// ============================================

let pdfMakeInstance: typeof import('pdfmake/build/pdfmake') | null = null;

async function getPdfMake() {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in the browser');
  }

  if (!pdfMakeInstance) {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    pdfMakeInstance = pdfMakeModule.default || pdfMakeModule;

    const vfs = (pdfFontsModule as any).default?.pdfMake?.vfs ||
                (pdfFontsModule as any).pdfMake?.vfs ||
                (pdfFontsModule as any).vfs;
    if (vfs) {
      (pdfMakeInstance as any).vfs = vfs;
    }
  }

  return pdfMakeInstance;
}

// ============================================
// STYLING
// ============================================

const COLORS = {
  primary: '#1e3a5f',
  secondary: '#2d4a6f',
  accent: '#3b82f6',
  text: '#1a1a2e',
  textLight: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  background: '#f8fafc',
  backgroundAlt: '#f1f5f9',
  success: '#065f46',
  warning: '#92400e',
  error: '#dc2626',
  draft: '#f59e0b',
  signed: '#10b981',
  certified: '#8b5cf6',
};

function getStyles(isRTL: boolean): StyleDictionary {
  return {
    header: {
      fontSize: 18,
      bold: true,
      color: COLORS.primary,
      alignment: isRTL ? 'right' : 'left',
      margin: [0, 0, 0, 5],
    },
    subheader: {
      fontSize: 11,
      color: COLORS.textLight,
      alignment: isRTL ? 'right' : 'left',
      margin: [0, 0, 0, 3],
    },
    title: {
      fontSize: 16,
      bold: true,
      color: COLORS.primary,
      alignment: 'center',
      margin: [0, 10, 0, 5],
    },
    sectionHeader: {
      fontSize: 12,
      bold: true,
      color: COLORS.secondary,
      margin: [0, 15, 0, 8],
    },
    paragraph: {
      fontSize: 10,
      lineHeight: 1.6,
      alignment: 'justify',
      color: COLORS.text,
    },
    partyHeader: {
      fontSize: 11,
      bold: true,
      color: COLORS.primary,
      margin: [0, 0, 0, 5],
    },
    partyInfo: {
      fontSize: 9,
      color: COLORS.textLight,
      lineHeight: 1.4,
    },
    label: {
      fontSize: 8,
      color: COLORS.textMuted,
      margin: [0, 0, 0, 2],
    },
    value: {
      fontSize: 10,
      bold: true,
      color: COLORS.text,
    },
    signature: {
      fontSize: 10,
      alignment: 'center',
    },
    footer: {
      fontSize: 7,
      color: COLORS.textMuted,
      alignment: 'center',
    },
    disclaimer: {
      fontSize: 7,
      color: COLORS.textLight,
      italics: true,
      alignment: 'center',
      margin: [20, 10, 20, 0],
    },
    auditHeader: {
      fontSize: 8,
      bold: true,
      color: COLORS.textLight,
      fillColor: COLORS.backgroundAlt,
    },
    auditCell: {
      fontSize: 7,
      color: COLORS.textLight,
    },
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDate(dateStr: string, language: string): string {
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

function getStatusLabel(status: string, language: string): { text: string; color: string } {
  const labels: Record<string, { en: string; ar: string; color: string }> = {
    draft: { en: 'DRAFT', ar: 'مسودة', color: COLORS.draft },
    pending: { en: 'PENDING', ar: 'قيد الانتظار', color: COLORS.warning },
    pending_signatures: { en: 'PENDING SIGNATURES', ar: 'بانتظار التوقيعات', color: COLORS.warning },
    partially_signed: { en: 'PARTIALLY SIGNED', ar: 'موقع جزئياً', color: COLORS.accent },
    signed: { en: 'SIGNED', ar: 'موقع', color: COLORS.signed },
    certified: { en: 'CERTIFIED', ar: 'مصدق', color: COLORS.certified },
    final: { en: 'FINAL', ar: 'نهائي', color: COLORS.success },
    expired: { en: 'EXPIRED', ar: 'منتهي', color: COLORS.error },
  };
  const label = labels[status] || { en: status.toUpperCase(), ar: status, color: COLORS.textLight };
  return { text: language === 'ar' ? label.ar : label.en, color: label.color };
}

function formatDocumentType(type: string, language: string): string {
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
  return language === 'ar' ? formatted.ar : formatted.en;
}

// ============================================
// CONTENT BUILDERS
// ============================================

function buildHeader(options: ProfessionalPdfOptions, isRTL: boolean): Content {
  const statusInfo = getStatusLabel(options.isDraft ? 'draft' : options.status, options.language);

  return {
    columns: [
      {
        width: '*',
        stack: [
          { text: 'Qannoni', style: 'header' },
          { text: isRTL ? 'وثائق قانونية احترافية' : 'Professional Legal Documents', style: 'subheader' },
        ],
      },
      {
        width: 'auto',
        stack: [
          {
            text: statusInfo.text,
            bold: true,
            fontSize: 10,
            color: statusInfo.color,
            alignment: 'center',
            margin: [10, 5, 10, 5],
          },
        ],
        fillColor: options.isDraft ? '#fef3c7' : '#d1fae5',
      },
    ],
    margin: [0, 0, 0, 20],
  };
}

function buildTitle(options: ProfessionalPdfOptions, isRTL: boolean): Content {
  const title = isRTL ? (options.titleAr || options.title) : options.title;

  return {
    stack: [
      {
        text: title.toUpperCase(),
        style: 'title',
        margin: [0, 10, 0, 5],
      },
      {
        text: `${isRTL ? options.country.nameAr : options.country.name}`,
        fontSize: 10,
        color: COLORS.textLight,
        alignment: 'center',
        margin: [0, 0, 0, 15],
      },
    ],
  };
}

function buildReferenceBar(options: ProfessionalPdfOptions, isRTL: boolean): Content {
  const statusInfo = getStatusLabel(options.status, options.language);

  const data: TableCell[][] = [
    [
      { text: isRTL ? 'رقم المرجع' : 'Reference No.', style: 'label', alignment: 'center' },
      { text: isRTL ? 'التاريخ' : 'Date', style: 'label', alignment: 'center' },
      { text: isRTL ? 'النوع' : 'Type', style: 'label', alignment: 'center' },
      { text: isRTL ? 'الحالة' : 'Status', style: 'label', alignment: 'center' },
    ],
    [
      { text: options.documentNumber, style: 'value', alignment: 'center' },
      { text: formatDate(options.createdAt, options.language), style: 'value', alignment: 'center' },
      { text: formatDocumentType(options.documentType, options.language), style: 'value', alignment: 'center' },
      { text: statusInfo.text, style: 'value', color: statusInfo.color, alignment: 'center' },
    ],
  ];

  return {
    table: {
      widths: ['*', '*', '*', '*'],
      body: data,
    },
    layout: {
      fillColor: (rowIndex: number) => rowIndex === 0 ? COLORS.backgroundAlt : null,
      hLineWidth: () => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => COLORS.border,
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    },
    margin: [0, 0, 0, 25],
  };
}

function buildPartyCard(party: PartyInfo, role: string, roleAr: string, isRTL: boolean): Content {
  const stack: Content[] = [
    { text: isRTL ? roleAr : role, style: 'partyHeader' },
    { text: isRTL && party.nameAr ? party.nameAr : party.name, bold: true, fontSize: 11, margin: [0, 5, 0, 5] as [number, number, number, number] },
    { text: `${isRTL ? 'رقم الهوية' : 'ID'}: ${party.idNumber}`, style: 'partyInfo' },
  ];

  if (party.nationality) {
    stack.push({ text: `${isRTL ? 'الجنسية' : 'Nationality'}: ${party.nationality}`, style: 'partyInfo' });
  }
  if (party.address) {
    stack.push({ text: `${isRTL ? 'العنوان' : 'Address'}: ${isRTL && party.addressAr ? party.addressAr : party.address}`, style: 'partyInfo' });
  }
  if (party.phone) {
    stack.push({ text: `${isRTL ? 'الهاتف' : 'Phone'}: ${party.phone}`, style: 'partyInfo' });
  }
  if (party.email) {
    stack.push({ text: `${isRTL ? 'البريد' : 'Email'}: ${party.email}`, style: 'partyInfo' });
  }

  return {
    stack,
    fillColor: COLORS.background,
    margin: [10, 10, 10, 10] as [number, number, number, number],
  };
}

function buildPartiesSection(options: ProfessionalPdfOptions, isRTL: boolean): Content | null {
  if (!options.partyA || !options.partyB) return null;

  return {
    stack: [
      { text: isRTL ? 'الأطراف المتعاقدة' : 'CONTRACTING PARTIES', style: 'sectionHeader', alignment: isRTL ? 'right' : 'left' },
      {
        table: {
          widths: ['*', '*'],
          body: [[
            buildPartyCard(options.partyA, 'PARTY A (First Party)', 'الطرف الأول', isRTL),
            buildPartyCard(options.partyB, 'PARTY B (Second Party)', 'الطرف الثاني', isRTL),
          ]],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => COLORS.border,
          vLineColor: () => COLORS.border,
        },
        margin: [0, 0, 0, 20],
      },
    ],
  };
}

function buildContentSection(content: string, isRTL: boolean): Content[] {
  const paragraphs = content.split('\n').filter(p => p.trim());
  return paragraphs.map(para => {
    const trimmed = para.trim();

    // Detect headings
    if (trimmed.match(/^(ARTICLE|المادة|SECTION|القسم|CLAUSE|البند|WHEREAS|حيث أن)/i)) {
      return {
        text: trimmed,
        style: 'sectionHeader',
        alignment: isRTL ? 'right' : 'left',
        margin: [0, 15, 0, 8],
      };
    }

    // Regular paragraph
    return {
      text: trimmed,
      style: 'paragraph',
      alignment: isRTL ? 'right' : 'justify',
      margin: [0, 0, 0, 8],
    };
  });
}

function buildSignaturesSection(options: ProfessionalPdfOptions, isRTL: boolean): Content {
  const signers = options.signers?.filter(s => s.role === 'signer') || [];
  const witnesses = options.signers?.filter(s => s.role === 'witness') || [];

  const signatureBlocks: Content[] = [];

  // Main signatures
  if (signers.length > 0) {
    const signerRows: TableCell[][] = [signers.map(signer => ({
      stack: [
        { text: signer.name, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        { text: '_'.repeat(30), alignment: 'center', margin: [0, 20, 0, 5] },
        { text: signer.signedAt ? formatDate(signer.signedAt, options.language) : `${isRTL ? 'التاريخ:' : 'Date:'} _____________`, alignment: 'center', fontSize: 8 },
      ],
    }))];

    signatureBlocks.push({
      table: {
        widths: signers.map(() => '*'),
        body: signerRows,
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 20],
    });
  } else if (options.partyA && options.partyB) {
    // Placeholder signatures
    signatureBlocks.push({
      table: {
        widths: ['*', '*'],
        body: [[
          {
            stack: [
              { text: isRTL ? 'الطرف الأول' : 'Party A', bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
              { text: '_'.repeat(30), alignment: 'center', margin: [0, 20, 0, 5] },
              { text: options.partyA.name, alignment: 'center', fontSize: 9 },
              { text: `${isRTL ? 'التاريخ' : 'Date'}: _____________`, alignment: 'center', fontSize: 8, margin: [0, 5, 0, 0] },
            ],
          },
          {
            stack: [
              { text: isRTL ? 'الطرف الثاني' : 'Party B', bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
              { text: '_'.repeat(30), alignment: 'center', margin: [0, 20, 0, 5] },
              { text: options.partyB.name, alignment: 'center', fontSize: 9 },
              { text: `${isRTL ? 'التاريخ' : 'Date'}: _____________`, alignment: 'center', fontSize: 8, margin: [0, 5, 0, 0] },
            ],
          },
        ]],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 20],
    });
  }

  // Witnesses section
  if (options.includeWitnesses) {
    signatureBlocks.push({
      text: isRTL ? 'الشهود' : 'WITNESSES',
      fontSize: 10,
      bold: true,
      color: COLORS.textLight,
      alignment: 'center',
      margin: [0, 10, 0, 15],
    });

    if (witnesses.length > 0) {
      signatureBlocks.push({
        table: {
          widths: witnesses.map(() => '*'),
          body: [[witnesses.map(w => ({
            stack: [
              { text: w.name, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
              { text: '_'.repeat(25), alignment: 'center', margin: [0, 15, 0, 5] },
              { text: w.signedAt ? formatDate(w.signedAt, options.language) : '', alignment: 'center', fontSize: 7 },
            ],
          }))]],
        },
        layout: 'noBorders',
      });
    } else {
      signatureBlocks.push({
        table: {
          widths: ['*', '*'],
          body: [[
            {
              stack: [
                { text: `${isRTL ? 'الشاهد' : 'Witness'} 1`, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
                { text: '_'.repeat(25), alignment: 'center', margin: [0, 15, 0, 5] },
                { text: `${isRTL ? 'الاسم:' : 'Name:'} _____________`, alignment: 'center', fontSize: 8 },
                { text: `${isRTL ? 'رقم الهوية:' : 'ID:'} _____________`, alignment: 'center', fontSize: 8, margin: [0, 3, 0, 0] },
              ],
            },
            {
              stack: [
                { text: `${isRTL ? 'الشاهد' : 'Witness'} 2`, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
                { text: '_'.repeat(25), alignment: 'center', margin: [0, 15, 0, 5] },
                { text: `${isRTL ? 'الاسم:' : 'Name:'} _____________`, alignment: 'center', fontSize: 8 },
                { text: `${isRTL ? 'رقم الهوية:' : 'ID:'} _____________`, alignment: 'center', fontSize: 8, margin: [0, 3, 0, 0] },
              ],
            },
          ]],
        },
        layout: 'noBorders',
      });
    }
  }

  return {
    stack: [
      { text: isRTL ? 'التوقيعات' : 'SIGNATURES', style: 'sectionHeader', alignment: 'center', margin: [0, 30, 0, 10] },
      {
        text: isRTL
          ? 'بموجب هذا العقد، أقر الطرفان بموافقتهما الكاملة على جميع الشروط والأحكام المذكورة أعلاه.'
          : 'IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.',
        fontSize: 9,
        color: COLORS.textLight,
        italics: true,
        alignment: 'center',
        margin: [20, 0, 20, 20],
      },
      ...signatureBlocks,
    ],
    pageBreak: 'before',
  };
}

function buildAuditTrail(options: ProfessionalPdfOptions, isRTL: boolean): Content | null {
  if (!options.includeAuditTrail || !options.auditTrail?.length) return null;

  const headerRow: TableCell[] = [
    { text: isRTL ? 'التاريخ والوقت' : 'Date & Time', style: 'auditHeader' },
    { text: isRTL ? 'الحدث' : 'Event', style: 'auditHeader' },
    { text: isRTL ? 'التفاصيل' : 'Details', style: 'auditHeader' },
  ];

  const dataRows = options.auditTrail.map(entry => [
    { text: formatDate(entry.timestamp, options.language), style: 'auditCell' },
    { text: entry.event, style: 'auditCell' },
    { text: entry.details || '-', style: 'auditCell' },
  ]);

  return {
    stack: [
      { text: isRTL ? 'سجل التدقيق' : 'AUDIT TRAIL', style: 'sectionHeader', alignment: isRTL ? 'right' : 'left' },
      {
        table: {
          widths: ['auto', '*', '*'],
          body: [headerRow, ...dataRows],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => COLORS.border,
          vLineColor: () => COLORS.border,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 10, 0, 20],
      },
    ],
  };
}

function buildFooter(options: ProfessionalPdfOptions, isRTL: boolean): Content {
  return {
    stack: [
      {
        text: isRTL
          ? 'تنبيه: تم إنشاء هذه الوثيقة باستخدام منصة قانوني. يُنصح بمراجعتها من قبل محامٍ مرخص قبل التوقيع.'
          : 'DISCLAIMER: This document was generated using the Qannoni platform. It is recommended to have it reviewed by a licensed attorney before signing.',
        style: 'disclaimer',
      },
    ],
    margin: [0, 20, 0, 0],
  };
}

// ============================================
// MAIN GENERATOR FUNCTION
// ============================================

export async function generateProfessionalPdf(options: ProfessionalPdfOptions): Promise<void> {
  const isRTL = options.language === 'ar' || options.language === 'ur';
  const content = isRTL ? (options.contentAr || options.contentEn || '') : (options.contentEn || '');

  const docContent: Content[] = [];

  // Header
  docContent.push(buildHeader(options, isRTL));

  // Title
  docContent.push(buildTitle(options, isRTL));

  // Reference bar
  docContent.push(buildReferenceBar(options, isRTL));

  // Parties section
  const partiesSection = buildPartiesSection(options, isRTL);
  if (partiesSection) docContent.push(partiesSection);

  // Document content
  if (content) {
    docContent.push({ text: isRTL ? 'محتوى المستند' : 'DOCUMENT CONTENT', style: 'sectionHeader', alignment: isRTL ? 'right' : 'left' });
    docContent.push(...buildContentSection(content, isRTL));
  }

  // Signatures
  docContent.push(buildSignaturesSection(options, isRTL));

  // Audit trail
  const auditSection = buildAuditTrail(options, isRTL);
  if (auditSection) docContent.push(auditSection);

  // Footer/Disclaimer
  docContent.push(buildFooter(options, isRTL));

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [50, 50, 50, 70],

    // Watermark for draft
    ...(options.isDraft && {
      watermark: {
        text: isRTL ? 'مسودة' : 'DRAFT',
        color: COLORS.error,
        opacity: 0.08,
        bold: true,
        angle: -45,
      },
    }),

    header: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: options.documentNumber, fontSize: 7, color: COLORS.textMuted, margin: [50, 20, 0, 0] },
        { text: `${currentPage} / ${pageCount}`, alignment: 'right', fontSize: 7, color: COLORS.textMuted, margin: [0, 20, 50, 0] },
      ],
    }),

    footer: {
      columns: [
        {
          text: `${isRTL ? 'تم الإنشاء بواسطة قانوني' : 'Generated by Qannoni'} | ${formatDate(new Date().toISOString(), options.language)}`,
          style: 'footer',
          margin: [50, 20, 50, 0],
        },
      ],
    },

    content: docContent,
    styles: getStyles(isRTL),
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.4,
    },

    info: {
      title: options.title,
      author: 'Qannoni',
      subject: `${options.documentType} - ${options.documentNumber}`,
      keywords: `legal, document, ${options.documentType}, ${options.country.code}`,
      creator: 'Qannoni Platform',
      producer: 'pdfMake',
    },
  };

  const pdfMake = await getPdfMake();
  const filename = `${options.documentNumber}.pdf`;
  (pdfMake as any).createPdf(docDefinition).download(filename);
}

export default generateProfessionalPdf;
