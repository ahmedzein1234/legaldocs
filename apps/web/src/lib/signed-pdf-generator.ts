import type { TDocumentDefinitions, Content, StyleDictionary, TableCell } from 'pdfmake/interfaces';

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

export interface SignerInfo {
  name: string;
  role: string;
  status: string;
  signedAt?: string;
  signatureType?: string;
}

export interface SignatureData {
  signerName: string;
  signatureData: string;
  signatureType: string;
  signedAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actorName?: string;
  details: string;
}

export interface SignedDocumentData {
  requestId: string;
  documentName: string;
  documentType: string;
  title: string;
  content?: {
    contentEn?: unknown;
    contentAr?: unknown;
    title?: string;
    titleAr?: string;
    documentType?: string;
  } | null;
  status: string;
  signers: SignerInfo[];
  owner: string;
  createdAt: string;
  completedAt?: string;
  auditTrail: AuditEntry[];
  signature: SignatureData;
}

function formatDate(dateStr: string, language: string = 'en'): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = language === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} at ${hours}:${minutes}`;
}

export async function generateSignedPdf(data: SignedDocumentData, language: 'en' | 'ar' = 'en'): Promise<void> {
  const isRTL = language === 'ar';
  const isComplete = data.status === 'completed';

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
      lineHeight: 1.5,
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
    signedBadge: {
      fontSize: 11,
      bold: true,
      color: '#166534',
    },
    pendingBadge: {
      fontSize: 11,
      bold: true,
      color: '#d97706',
    },
    footer: {
      fontSize: 8,
      color: '#64748b',
      alignment: 'center',
    },
    auditItem: {
      fontSize: 8,
      color: '#475569',
      lineHeight: 1.3,
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
            text: isRTL ? 'وثيقة قانونية موقعة' : 'Signed Legal Document',
            style: 'subheader',
            alignment: isRTL ? 'right' : 'left',
          },
        ],
      },
      {
        width: 'auto',
        stack: [
          {
            text: isComplete
              ? (isRTL ? '✓ مكتمل' : '✓ COMPLETED')
              : (isRTL ? '⏳ قيد التوقيع' : '⏳ IN PROGRESS'),
            style: isComplete ? 'signedBadge' : 'pendingBadge',
            alignment: 'center',
            margin: [10, 5, 10, 5],
          },
        ],
        ...(isComplete ? {
          fillColor: '#dcfce7',
        } : {
          fillColor: '#fef3c7',
        }),
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // Document title
  docContent.push({
    text: data.documentName.toUpperCase(),
    style: 'header',
    alignment: 'center',
    margin: [0, 10, 0, 5],
  });

  docContent.push({
    text: data.title,
    style: 'subheader',
    alignment: 'center',
    margin: [0, 0, 0, 20],
  });

  // Document details table
  const detailsTable: TableCell[][] = [
    [
      { text: isRTL ? 'رقم المستند' : 'Document ID', style: 'label' },
      { text: isRTL ? 'النوع' : 'Type', style: 'label' },
      { text: isRTL ? 'تاريخ الإنشاء' : 'Created', style: 'label' },
      { text: isRTL ? 'الحالة' : 'Status', style: 'label' },
    ],
    [
      { text: data.requestId, style: 'value' },
      { text: data.documentType, style: 'value' },
      { text: formatDate(data.createdAt, language), style: 'value' },
      {
        text: isComplete ? (isRTL ? 'مكتمل' : 'Completed') : (isRTL ? 'قيد المعالجة' : 'In Progress'),
        style: 'value',
        color: isComplete ? '#166534' : '#d97706',
      },
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

  // Signers section
  docContent.push({
    text: isRTL ? 'الموقعون' : 'SIGNERS',
    style: 'sectionHeader',
    alignment: isRTL ? 'right' : 'left',
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
    const statusColor = signer.status === 'signed' ? '#166534' :
                        signer.status === 'declined' ? '#dc2626' : '#d97706';
    const statusText = signer.status === 'signed' ? (isRTL ? '✓ موقع' : '✓ Signed') :
                       signer.status === 'declined' ? (isRTL ? '✗ رفض' : '✗ Declined') :
                       (isRTL ? '⏳ قيد الانتظار' : '⏳ Pending');

    signersTable.push([
      { text: signer.name },
      { text: signer.role.charAt(0).toUpperCase() + signer.role.slice(1) },
      { text: statusText, color: statusColor, bold: true },
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
    margin: [0, 0, 0, 25],
  });

  // Signature section
  if (data.signature?.signatureData) {
    docContent.push({
      text: isRTL ? 'التوقيع' : 'SIGNATURE',
      style: 'sectionHeader',
      alignment: isRTL ? 'right' : 'left',
    });

    docContent.push({
      columns: [
        {
          width: '*',
          stack: [
            { text: isRTL ? 'الموقع' : 'Signed by', style: 'label' },
            { text: data.signature.signerName, style: 'value' },
            { text: isRTL ? 'نوع التوقيع' : 'Signature Type', style: 'label' },
            { text: data.signature.signatureType.charAt(0).toUpperCase() + data.signature.signatureType.slice(1), style: 'value' },
            { text: isRTL ? 'التاريخ والوقت' : 'Date & Time', style: 'label' },
            { text: formatDate(data.signature.signedAt, language), style: 'value' },
          ],
        },
        {
          width: 200,
          stack: [
            {
              image: data.signature.signatureData,
              width: 180,
              height: 80,
              alignment: 'center',
            },
          ],
          margin: [10, 0, 0, 0],
        },
      ],
      margin: [0, 0, 0, 25],
    });
  }

  // Audit trail section
  if (data.auditTrail && data.auditTrail.length > 0) {
    docContent.push({
      text: isRTL ? 'سجل التدقيق' : 'AUDIT TRAIL',
      style: 'sectionHeader',
      alignment: isRTL ? 'right' : 'left',
      pageBreak: 'before',
    });

    docContent.push({
      text: isRTL
        ? 'يوثق هذا السجل جميع الأحداث المتعلقة بهذا المستند.'
        : 'This audit trail documents all events related to this document.',
      style: 'paragraph',
      margin: [0, 0, 0, 15],
    });

    const auditTable: TableCell[][] = [
      [
        { text: isRTL ? 'التاريخ والوقت' : 'Date & Time', fillColor: '#f1f5f9', bold: true },
        { text: isRTL ? 'الحدث' : 'Event', fillColor: '#f1f5f9', bold: true },
        { text: isRTL ? 'التفاصيل' : 'Details', fillColor: '#f1f5f9', bold: true },
      ],
    ];

    for (const entry of data.auditTrail) {
      const actionDisplay = entry.action
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      auditTable.push([
        { text: formatDate(entry.timestamp, language), style: 'auditItem' },
        { text: actionDisplay, style: 'auditItem', bold: true },
        { text: entry.details || '-', style: 'auditItem' },
      ]);
    }

    docContent.push({
      table: {
        widths: ['auto', 'auto', '*'],
        body: auditTable,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#e2e8f0',
        vLineColor: () => '#e2e8f0',
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
      margin: [0, 0, 0, 25],
    });
  }

  // Legal disclaimer
  docContent.push({
    text: isRTL
      ? 'إخلاء المسؤولية: تم توقيع هذا المستند إلكترونيًا باستخدام منصة قانوني. يتم التحقق من التوقيعات الإلكترونية وتخزينها بشكل آمن. للتحقق من صحة هذا المستند، يرجى الاتصال بنا.'
      : 'DISCLAIMER: This document was electronically signed using the Qannoni platform. Electronic signatures are verified and securely stored. To verify the authenticity of this document, please contact us.',
    fontSize: 8,
    color: '#64748b',
    italics: true,
    alignment: 'center',
    margin: [20, 20, 20, 0],
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [50, 50, 50, 70],

    header: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: data.requestId, fontSize: 8, color: '#94a3b8', margin: [50, 20, 0, 0] },
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
      title: data.documentName,
      author: 'Qannoni',
      subject: `Signed Document - ${data.requestId}`,
      keywords: `legal, signed, document, ${data.documentType}`,
      creator: 'Qannoni Platform',
      producer: 'pdfMake',
    },
  };

  const pdfMake = await getPdfMake();
  const filename = `${data.requestId}-signed.pdf`;
  (pdfMake as any).createPdf(docDefinition).download(filename);
}

export default generateSignedPdf;
