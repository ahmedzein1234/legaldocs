import type { TDocumentDefinitions, Content, StyleDictionary, TableCell } from 'pdfmake/interfaces';

// We need to dynamically import pdfMake to avoid SSR issues
let pdfMakeInstance: typeof import('pdfmake/build/pdfmake') | null = null;

async function getPdfMake() {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in the browser');
  }

  if (!pdfMakeInstance) {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    pdfMakeInstance = pdfMakeModule.default || pdfMakeModule;

    // Set up fonts
    const vfs = (pdfFontsModule as any).default?.pdfMake?.vfs ||
                (pdfFontsModule as any).pdfMake?.vfs ||
                (pdfFontsModule as any).vfs;
    if (vfs) {
      (pdfMakeInstance as any).vfs = vfs;
    }
  }

  return pdfMakeInstance;
}

// GCC Country configurations
interface CountryConfig {
  name: string;
  nameAr: string;
  currency: string;
  currencySymbol: string;
}

const countryConfigs: Record<string, CountryConfig> = {
  ae: { name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', currency: 'AED', currencySymbol: 'د.إ' },
  sa: { name: 'Kingdom of Saudi Arabia', nameAr: 'المملكة العربية السعودية', currency: 'SAR', currencySymbol: 'ر.س' },
  qa: { name: 'State of Qatar', nameAr: 'دولة قطر', currency: 'QAR', currencySymbol: 'ر.ق' },
  kw: { name: 'State of Kuwait', nameAr: 'دولة الكويت', currency: 'KWD', currencySymbol: 'د.ك' },
  bh: { name: 'Kingdom of Bahrain', nameAr: 'مملكة البحرين', currency: 'BHD', currencySymbol: 'د.ب' },
  om: { name: 'Sultanate of Oman', nameAr: 'سلطنة عمان', currency: 'OMR', currencySymbol: 'ر.ع' },
};

export interface PartyInfo {
  name: string;
  idNumber: string;
  nationality?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PdfGeneratorOptions {
  title: string;
  content: string;
  htmlContent?: string;
  language: 'en' | 'ar' | 'ur';
  country: string;
  jurisdiction?: string;
  partyA: PartyInfo;
  partyB: PartyInfo;
  amount?: string;
  isDraft?: boolean;
  includeWitnesses?: boolean;
  documentType?: string;
}

// Parse simple text to structured content
function parseTextToContent(text: string, isRTL: boolean): Content[] {
  const lines = text.split('\n');
  const content: Content[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      content.push({ text: ' ', margin: [0, 5, 0, 5] });
      continue;
    }

    // Detect headings
    if (trimmedLine.match(/^(ARTICLE|المادة|Section|القسم|WHEREAS|حيث أن)/i)) {
      content.push({
        text: trimmedLine,
        style: 'heading',
        alignment: isRTL ? 'right' : 'left',
        margin: [0, 15, 0, 10],
      });
    }
    // Detect signature lines
    else if (trimmedLine.includes('___') || trimmedLine.match(/^(Signature|التوقيع|Date|التاريخ)/i)) {
      content.push({
        text: trimmedLine,
        style: 'signature',
        alignment: isRTL ? 'right' : 'left',
        margin: [0, 5, 0, 5],
      });
    }
    // Regular paragraph
    else {
      content.push({
        text: trimmedLine,
        style: 'paragraph',
        alignment: 'justify',
        margin: [0, 3, 0, 3],
      });
    }
  }

  return content;
}

// Format date in GCC format
function formatDate(date: Date, language: string): string {
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = language === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Generate document reference number
function generateRefNumber(country: string, docType: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${country.toUpperCase()}-${(docType || 'DOC').substring(0, 4).toUpperCase()}-${timestamp}`;
}

export async function generatePdf(options: PdfGeneratorOptions): Promise<void> {
  const {
    title,
    content,
    language,
    country,
    jurisdiction,
    partyA,
    partyB,
    amount,
    isDraft = true,
    includeWitnesses = true,
    documentType,
  } = options;

  const isRTL = language === 'ar' || language === 'ur';
  const countryConfig = countryConfigs[country] || countryConfigs.ae;
  const refNumber = generateRefNumber(country, documentType || 'DOC');
  const currentDate = formatDate(new Date(), language);

  // Define styles
  const styles: StyleDictionary = {
    header: {
      fontSize: 20,
      bold: true,
      color: '#1e3a8a',
      alignment: 'center',
      margin: [0, 0, 0, 10],
    },
    subheader: {
      fontSize: 11,
      color: '#475569',
      alignment: 'center',
      margin: [0, 0, 0, 5],
    },
    heading: {
      fontSize: 13,
      bold: true,
      color: '#0f172a',
      margin: [0, 15, 0, 8],
    },
    paragraph: {
      fontSize: 11,
      lineHeight: 1.6,
      alignment: 'justify',
    },
    partyHeader: {
      fontSize: 12,
      bold: true,
      color: '#1e3a8a',
      margin: [0, 0, 0, 5],
    },
    partyInfo: {
      fontSize: 10,
      color: '#334155',
      lineHeight: 1.4,
    },
    signature: {
      fontSize: 10,
      margin: [0, 5, 0, 5],
    },
    footer: {
      fontSize: 8,
      color: '#64748b',
      alignment: 'center',
    },
    refNumber: {
      fontSize: 9,
      color: '#64748b',
      alignment: isRTL ? 'left' : 'right',
    },
    disclaimer: {
      fontSize: 8,
      color: '#dc2626',
      italics: true,
      alignment: 'center',
      margin: [20, 10, 20, 0],
    },
  };

  // Build document content
  const docContent: Content[] = [];

  // Header with branding
  docContent.push({
    columns: [
      {
        width: '*',
        stack: [
          { text: 'LegalDocs', style: 'header', alignment: isRTL ? 'right' : 'left' },
          {
            text: isRTL ? 'وثائق قانونية احترافية' : 'Professional Legal Documents',
            style: 'subheader',
            alignment: isRTL ? 'right' : 'left'
          },
        ],
      },
      {
        width: 80,
        stack: [
          {
            text: 'QR Code',
            alignment: 'center',
            fontSize: 8,
            color: '#94a3b8',
            margin: [0, 20, 0, 0],
          },
        ],
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // Document title
  docContent.push({
    text: title.toUpperCase(),
    style: 'header',
    alignment: 'center',
    margin: [0, 10, 0, 5],
  });

  // Jurisdiction info
  docContent.push({
    text: `${isRTL ? countryConfig.nameAr : countryConfig.name}${jurisdiction ? ` - ${jurisdiction}` : ''}`,
    style: 'subheader',
    alignment: 'center',
    margin: [0, 0, 0, 15],
  });

  // Reference bar
  const refBarData: TableCell[][] = [
    [
      { text: isRTL ? 'رقم المرجع' : 'Reference No.', style: 'partyInfo', alignment: isRTL ? 'right' : 'left' },
      { text: isRTL ? 'التاريخ' : 'Date', style: 'partyInfo', alignment: 'center' },
      { text: isRTL ? 'اللغة' : 'Language', style: 'partyInfo', alignment: 'center' },
      { text: isRTL ? 'الحالة' : 'Status', style: 'partyInfo', alignment: isRTL ? 'left' : 'right' },
    ],
    [
      { text: refNumber, bold: true, alignment: isRTL ? 'right' : 'left' },
      { text: currentDate, bold: true, alignment: 'center' },
      { text: language.toUpperCase(), bold: true, alignment: 'center' },
      { text: isDraft ? (isRTL ? 'مسودة' : 'DRAFT') : (isRTL ? 'نهائي' : 'FINAL'), bold: true, color: isDraft ? '#f59e0b' : '#22c55e', alignment: isRTL ? 'left' : 'right' },
    ],
  ];

  docContent.push({
    table: {
      widths: ['*', 'auto', 'auto', '*'],
      body: refBarData,
    },
    layout: {
      fillColor: (rowIndex: number) => rowIndex === 0 ? '#f1f5f9' : null,
      hLineWidth: () => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => '#e2e8f0',
      paddingLeft: () => 10,
      paddingRight: () => 10,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    },
    margin: [0, 0, 0, 25],
  });

  // Parties section - build party info arrays
  const partyAStack: Content[] = [
    { text: isRTL ? 'الطرف الأول' : 'PARTY A (First Party)', style: 'partyHeader' },
    { text: partyA.name, bold: true, fontSize: 12, margin: [0, 5, 0, 3] as [number, number, number, number] },
    { text: `${isRTL ? 'رقم الهوية' : 'ID'}: ${partyA.idNumber}`, style: 'partyInfo' },
  ];
  if (partyA.nationality) partyAStack.push({ text: `${isRTL ? 'الجنسية' : 'Nationality'}: ${partyA.nationality}`, style: 'partyInfo' });
  if (partyA.address) partyAStack.push({ text: `${isRTL ? 'العنوان' : 'Address'}: ${partyA.address}`, style: 'partyInfo' });
  if (partyA.phone) partyAStack.push({ text: `${isRTL ? 'الهاتف' : 'Phone'}: ${partyA.phone}`, style: 'partyInfo' });
  if (partyA.email) partyAStack.push({ text: `${isRTL ? 'البريد' : 'Email'}: ${partyA.email}`, style: 'partyInfo' });

  const partyBStack: Content[] = [
    { text: isRTL ? 'الطرف الثاني' : 'PARTY B (Second Party)', style: 'partyHeader' },
    { text: partyB.name, bold: true, fontSize: 12, margin: [0, 5, 0, 3] as [number, number, number, number] },
    { text: `${isRTL ? 'رقم الهوية' : 'ID'}: ${partyB.idNumber}`, style: 'partyInfo' },
  ];
  if (partyB.nationality) partyBStack.push({ text: `${isRTL ? 'الجنسية' : 'Nationality'}: ${partyB.nationality}`, style: 'partyInfo' });
  if (partyB.address) partyBStack.push({ text: `${isRTL ? 'العنوان' : 'Address'}: ${partyB.address}`, style: 'partyInfo' });
  if (partyB.phone) partyBStack.push({ text: `${isRTL ? 'الهاتف' : 'Phone'}: ${partyB.phone}`, style: 'partyInfo' });
  if (partyB.email) partyBStack.push({ text: `${isRTL ? 'البريد' : 'Email'}: ${partyB.email}`, style: 'partyInfo' });

  const partiesTable = [
    [
      {
        stack: partyAStack,
        fillColor: '#f8fafc',
        margin: [10, 10, 10, 10] as [number, number, number, number],
      },
      {
        stack: partyBStack,
        fillColor: '#f8fafc',
        margin: [10, 10, 10, 10] as [number, number, number, number],
      },
    ],
  ];

  docContent.push({
    table: {
      widths: ['*', '*'],
      body: partiesTable,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1',
    },
    margin: [0, 0, 0, 25],
  });

  // Document content
  const parsedContent = parseTextToContent(content, isRTL);
  docContent.push(...parsedContent);

  // Signature section
  docContent.push({
    text: isRTL ? 'التوقيعات' : 'SIGNATURES',
    style: 'heading',
    alignment: 'center',
    margin: [0, 40, 0, 20],
    pageBreak: 'before',
  });

  docContent.push({
    text: isRTL
      ? 'بموجب هذا العقد، أقر الطرفان بموافقتهما الكاملة على جميع الشروط والأحكام المذكورة أعلاه.'
      : 'IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.',
    style: 'paragraph',
    alignment: 'center',
    margin: [20, 0, 20, 30],
  });

  const signatureTable: TableCell[][] = [
    [
      {
        stack: [
          { text: isRTL ? 'الطرف الأول' : 'Party A', bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
          { text: '_'.repeat(35), alignment: 'center', margin: [0, 30, 0, 5] },
          { text: partyA.name, alignment: 'center', fontSize: 10 },
          { text: `${isRTL ? 'التاريخ' : 'Date'}: _____________`, alignment: 'center', fontSize: 9, margin: [0, 10, 0, 0] },
        ],
      },
      {
        stack: [
          { text: isRTL ? 'الطرف الثاني' : 'Party B', bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
          { text: '_'.repeat(35), alignment: 'center', margin: [0, 30, 0, 5] },
          { text: partyB.name, alignment: 'center', fontSize: 10 },
          { text: `${isRTL ? 'التاريخ' : 'Date'}: _____________`, alignment: 'center', fontSize: 9, margin: [0, 10, 0, 0] },
        ],
      },
    ],
  ];

  docContent.push({
    table: {
      widths: ['*', '*'],
      body: signatureTable,
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 30],
  });

  // Witnesses section
  if (includeWitnesses) {
    docContent.push({
      text: isRTL ? 'الشهود' : 'WITNESSES',
      style: 'heading',
      alignment: 'center',
      margin: [0, 20, 0, 15],
    });

    const witnessTable: TableCell[][] = [
      [
        {
          stack: [
            { text: `${isRTL ? 'الشاهد' : 'Witness'} 1`, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
            { text: '_'.repeat(30), alignment: 'center', margin: [0, 20, 0, 5] },
            { text: `${isRTL ? 'الاسم' : 'Name'}: _____________`, alignment: 'center', fontSize: 9 },
            { text: `${isRTL ? 'رقم الهوية' : 'ID'}: _____________`, alignment: 'center', fontSize: 9, margin: [0, 5, 0, 0] },
          ],
        },
        {
          stack: [
            { text: `${isRTL ? 'الشاهد' : 'Witness'} 2`, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
            { text: '_'.repeat(30), alignment: 'center', margin: [0, 20, 0, 5] },
            { text: `${isRTL ? 'الاسم' : 'Name'}: _____________`, alignment: 'center', fontSize: 9 },
            { text: `${isRTL ? 'رقم الهوية' : 'ID'}: _____________`, alignment: 'center', fontSize: 9, margin: [0, 5, 0, 0] },
          ],
        },
      ],
    ];

    docContent.push({
      table: {
        widths: ['*', '*'],
        body: witnessTable,
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 30],
    });
  }

  // Disclaimer
  docContent.push({
    text: isRTL
      ? 'تنبيه: تم إنشاء هذه الوثيقة باستخدام الذكاء الاصطناعي. يُنصح بمراجعتها من قبل محامٍ مرخص قبل التوقيع.'
      : 'DISCLAIMER: This document was generated using AI. It is recommended to have it reviewed by a licensed attorney before signing.',
    style: 'disclaimer',
  });

  // Build document definition
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [60, 60, 60, 80], // 1 inch margins approximately

    // Watermark for draft
    ...(isDraft && {
      watermark: {
        text: isRTL ? 'مسودة' : 'DRAFT',
        color: '#dc2626',
        opacity: 0.1,
        bold: true,
        angle: -45,
      },
    }),

    // Header
    header: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: refNumber, style: 'refNumber', margin: [60, 20, 0, 0] },
        { text: `${currentPage} / ${pageCount}`, alignment: 'right', fontSize: 9, color: '#64748b', margin: [0, 20, 60, 0] },
      ],
    }),

    // Footer
    footer: {
      columns: [
        {
          text: `Generated by LegalDocs | ${currentDate}`,
          style: 'footer',
          margin: [60, 20, 60, 0],
        },
      ],
    },

    content: docContent,
    styles,
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
      lineHeight: 1.5,
    },

    // Document metadata
    info: {
      title: title,
      author: 'LegalDocs',
      subject: `${documentType || 'Legal Document'} - ${refNumber}`,
      keywords: `legal, document, ${country}, ${documentType}`,
      creator: 'LegalDocs Platform',
      producer: 'pdfMake',
    },
  };

  // Generate and download PDF
  const pdfMake = await getPdfMake();
  (pdfMake as any).createPdf(docDefinition).download(`${refNumber}.pdf`);
}

export default generatePdf;
