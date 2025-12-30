import type { TDocumentDefinitions, Content, StyleDictionary, TableCell } from 'pdfmake/interfaces';
import type { DocumentDownloadData } from './api';

// Dynamically import pdfMake to avoid SSR issues
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

function formatDate(dateStr: string, language: string = 'en'): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = language === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function getStatusLabel(status: string, isRTL: boolean): { text: string; color: string } {
  const labels: Record<string, { en: string; ar: string; color: string }> = {
    draft: { en: 'Draft', ar: 'مسودة', color: '#64748b' },
    pending: { en: 'Pending', ar: 'قيد الانتظار', color: '#d97706' },
    pending_signatures: { en: 'Pending Signatures', ar: 'بانتظار التوقيعات', color: '#d97706' },
    partially_signed: { en: 'Partially Signed', ar: 'موقع جزئياً', color: '#2563eb' },
    signed: { en: 'Signed', ar: 'موقع', color: '#166534' },
    certified: { en: 'Certified', ar: 'مصدق', color: '#7c3aed' },
    expired: { en: 'Expired', ar: 'منتهي', color: '#dc2626' },
    cancelled: { en: 'Cancelled', ar: 'ملغى', color: '#dc2626' },
  };
  const label = labels[status] || { en: status, ar: status, color: '#64748b' };
  return { text: isRTL ? label.ar : label.en, color: label.color };
}

function parseContent(content: unknown): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'object') {
    // Handle TipTap/ProseMirror JSON format
    const obj = content as { type?: string; content?: unknown[]; text?: string };
    if (obj.type === 'doc' && Array.isArray(obj.content)) {
      return obj.content.map((node: any) => {
        if (node.type === 'paragraph') {
          return node.content?.map((c: any) => c.text || '').join('') || '';
        }
        if (node.type === 'heading') {
          return node.content?.map((c: any) => c.text || '').join('') || '';
        }
        return '';
      }).join('\n\n');
    }
    // Fallback: stringify
    return JSON.stringify(content, null, 2);
  }
  return String(content);
}

export async function generateDocumentPdf(data: DocumentDownloadData, language: 'en' | 'ar' = 'en'): Promise<void> {
  const isRTL = language === 'ar';
  const isDraft = data.status === 'draft';
  const statusInfo = getStatusLabel(data.status, isRTL);

  // Determine which content to use
  const content = isRTL && data.contentAr ? parseContent(data.contentAr) : parseContent(data.contentEn);
  const title = isRTL && data.titleAr ? data.titleAr : data.title;

  const styles: StyleDictionary = {
    header: {
      fontSize: 18,
      bold: true,
      color: '#1e3a8a',
      alignment: 'center',
      margin: [0, 0, 0, 5],
    },
    subheader: {
      fontSize: 11,
      color: '#475569',
      alignment: 'center',
      margin: [0, 0, 0, 3],
    },
    sectionHeader: {
      fontSize: 13,
      bold: true,
      color: '#0f172a',
      margin: [0, 15, 0, 8],
    },
    paragraph: {
      fontSize: 10,
      lineHeight: 1.6,
      alignment: 'justify',
    },
    label: {
      fontSize: 9,
      color: '#64748b',
      margin: [0, 0, 0, 2],
    },
    value: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 8],
    },
    footer: {
      fontSize: 8,
      color: '#64748b',
      alignment: 'center',
    },
  };

  const docContent: Content[] = [];

  // Header with branding
  docContent.push({
    columns: [
      {
        width: '*',
        stack: [
          { text: 'Qannoni', style: 'header', alignment: isRTL ? 'right' : 'left' },
          {
            text: isRTL ? 'وثيقة قانونية' : 'Legal Document',
            style: 'subheader',
            alignment: isRTL ? 'right' : 'left',
          },
        ],
      },
      {
        width: 'auto',
        stack: [
          {
            text: statusInfo.text.toUpperCase(),
            bold: true,
            color: statusInfo.color,
            alignment: 'center',
            margin: [10, 5, 10, 5],
          },
        ],
        fillColor: isDraft ? '#f1f5f9' : '#f0fdf4',
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // Document title
  docContent.push({
    text: title.toUpperCase(),
    style: 'header',
    alignment: 'center',
    margin: [0, 10, 0, 20],
  });

  // Document details table
  const detailsTable: TableCell[][] = [
    [
      { text: isRTL ? 'رقم المستند' : 'Document #', style: 'label' },
      { text: isRTL ? 'النوع' : 'Type', style: 'label' },
      { text: isRTL ? 'تاريخ الإنشاء' : 'Created', style: 'label' },
      { text: isRTL ? 'المالك' : 'Owner', style: 'label' },
    ],
    [
      { text: data.documentNumber, style: 'value' },
      { text: data.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), style: 'value' },
      { text: formatDate(data.createdAt, language), style: 'value' },
      { text: data.owner, style: 'value' },
    ],
  ];

  docContent.push({
    table: {
      widths: ['*', '*', '*', '*'],
      body: detailsTable,
    },
    layout: {
      fillColor: (rowIndex: number) => rowIndex === 0 ? '#f1f5f9' : null,
      hLineWidth: () => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => '#e2e8f0',
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    },
    margin: [0, 0, 0, 25],
  });

  // Document content
  if (content) {
    docContent.push({
      text: isRTL ? 'محتوى المستند' : 'DOCUMENT CONTENT',
      style: 'sectionHeader',
      alignment: isRTL ? 'right' : 'left',
    });

    const paragraphs = content.split('\n').filter(p => p.trim());
    for (const para of paragraphs) {
      docContent.push({
        text: para.trim(),
        style: 'paragraph',
        alignment: isRTL ? 'right' : 'justify',
        margin: [0, 0, 0, 8],
      });
    }
  }

  // Signers section (if any)
  if (data.signers && data.signers.length > 0) {
    docContent.push({
      text: isRTL ? 'الموقعون' : 'SIGNERS',
      style: 'sectionHeader',
      alignment: isRTL ? 'right' : 'left',
      margin: [0, 25, 0, 10],
    });

    const signersTable: TableCell[][] = [
      [
        { text: isRTL ? 'الاسم' : 'Name', fillColor: '#f1f5f9', bold: true },
        { text: isRTL ? 'الدور' : 'Role', fillColor: '#f1f5f9', bold: true },
        { text: isRTL ? 'الحالة' : 'Status', fillColor: '#f1f5f9', bold: true },
        { text: isRTL ? 'تاريخ التوقيع' : 'Signed At', fillColor: '#f1f5f9', bold: true },
      ],
    ];

    for (const signer of data.signers) {
      const signerStatus = getStatusLabel(signer.status, isRTL);
      signersTable.push([
        { text: signer.name },
        { text: signer.role.charAt(0).toUpperCase() + signer.role.slice(1) },
        { text: signerStatus.text, color: signerStatus.color, bold: true },
        { text: signer.signedAt ? formatDate(signer.signedAt, language) : '-' },
      ]);
    }

    docContent.push({
      table: {
        widths: ['*', 'auto', 'auto', '*'],
        body: signersTable,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#e2e8f0',
        vLineColor: () => '#e2e8f0',
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 0, 0, 20],
    });
  }

  // Signature placeholders for draft documents
  if (isDraft) {
    docContent.push({
      text: isRTL ? 'التوقيعات' : 'SIGNATURES',
      style: 'sectionHeader',
      alignment: 'center',
      margin: [0, 30, 0, 20],
    });

    const signatureTable: TableCell[][] = [
      [
        {
          stack: [
            { text: isRTL ? 'الطرف الأول' : 'Party A', bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            { text: '_'.repeat(35), alignment: 'center', margin: [0, 30, 0, 5] },
            { text: isRTL ? 'الاسم:' : 'Name:', alignment: 'center', fontSize: 9 },
            { text: `${isRTL ? 'التاريخ' : 'Date'}: _____________`, alignment: 'center', fontSize: 9, margin: [0, 10, 0, 0] },
          ],
        },
        {
          stack: [
            { text: isRTL ? 'الطرف الثاني' : 'Party B', bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            { text: '_'.repeat(35), alignment: 'center', margin: [0, 30, 0, 5] },
            { text: isRTL ? 'الاسم:' : 'Name:', alignment: 'center', fontSize: 9 },
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
  }

  // Disclaimer
  docContent.push({
    text: isRTL
      ? 'تنبيه: تم إنشاء هذا المستند باستخدام منصة قانوني. يُنصح بمراجعته من قبل محامٍ مرخص قبل التوقيع.'
      : 'DISCLAIMER: This document was generated using the Qannoni platform. It is recommended to have it reviewed by a licensed attorney before signing.',
    fontSize: 8,
    color: '#64748b',
    italics: true,
    alignment: 'center',
    margin: [20, 20, 20, 0],
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [50, 50, 50, 70],

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

    header: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: data.documentNumber, fontSize: 8, color: '#94a3b8', margin: [50, 20, 0, 0] },
        { text: `${currentPage} / ${pageCount}`, alignment: 'right', fontSize: 8, color: '#94a3b8', margin: [0, 20, 50, 0] },
      ],
    }),

    footer: {
      columns: [
        {
          text: `Generated by Qannoni | ${formatDate(new Date().toISOString(), language)}`,
          style: 'footer',
          margin: [50, 20, 50, 0],
        },
      ],
    },

    content: docContent,
    styles,
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.4,
    },

    info: {
      title: data.title,
      author: 'Qannoni',
      subject: `${data.documentType} - ${data.documentNumber}`,
      keywords: `legal, document, ${data.documentType}`,
      creator: 'Qannoni Platform',
      producer: 'pdfMake',
    },
  };

  const pdfMake = await getPdfMake();
  const filename = `${data.documentNumber}.pdf`;
  (pdfMake as any).createPdf(docDefinition).download(filename);
}

export default generateDocumentPdf;
