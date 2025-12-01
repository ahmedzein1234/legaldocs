/**
 * Digital Signature System for LegalDocs
 * Handles document signing via Email and WhatsApp
 */

// Signature request status
export type SignatureStatus =
  | 'draft'
  | 'pending'
  | 'viewed'
  | 'signed'
  | 'declined'
  | 'expired'
  | 'cancelled';

// Delivery method
export type DeliveryMethod = 'email' | 'whatsapp' | 'both';

// Signer role
export type SignerRole =
  | 'signer'
  | 'approver'
  | 'witness'
  | 'cc';

// Signature type
export type SignatureType =
  | 'draw'      // Hand-drawn signature
  | 'type'      // Typed signature
  | 'upload'    // Uploaded signature image
  | 'stamp';    // Company stamp

// Signer information
export interface Signer {
  id: string;
  name: string;
  nameAr?: string;
  email?: string;
  phone?: string;         // For WhatsApp (with country code)
  role: SignerRole;
  order: number;          // Signing order (1, 2, 3...)
  status: SignatureStatus;
  deliveryMethod: DeliveryMethod;

  // Signature details
  signedAt?: Date;
  signatureType?: SignatureType;
  signatureData?: string; // Base64 signature image or typed name
  ipAddress?: string;
  userAgent?: string;

  // Verification
  verificationCode?: string;
  verificationSentAt?: Date;
  verifiedAt?: Date;

  // Timestamps
  viewedAt?: Date;
  reminderSentAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
}

// Signature field placement on document
export interface SignatureField {
  id: string;
  signerId: string;
  type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
  page: number;
  x: number;           // X position (percentage)
  y: number;           // Y position (percentage)
  width: number;       // Width (percentage)
  height: number;      // Height (percentage)
  required: boolean;
  placeholder?: string;
  value?: string;
}

// Signature request
export interface SignatureRequest {
  id: string;
  userId: string;

  // Document info
  documentId: string;
  documentName: string;
  documentUrl?: string;
  documentType: string;

  // Request details
  title: string;
  message?: string;        // Message to signers
  messageAr?: string;

  // Signers
  signers: Signer[];
  currentSignerIndex: number;
  signingOrder: 'sequential' | 'parallel';

  // Fields
  fields: SignatureField[];

  // Settings
  expiresAt?: Date;
  reminderFrequency?: 'none' | 'daily' | 'weekly';
  lastReminderAt?: Date;
  allowDecline: boolean;
  requireVerification: boolean;  // OTP verification

  // Status
  status: SignatureStatus;
  completedAt?: Date;

  // Signed document
  signedDocumentUrl?: string;

  // Audit trail
  auditTrail: AuditEvent[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Audit event for tracking
export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

// Email template data
export interface EmailTemplateData {
  recipientName: string;
  senderName: string;
  documentTitle: string;
  message?: string;
  signingUrl: string;
  expiresAt?: string;
  companyName: string;
}

// WhatsApp message data
export interface WhatsAppMessageData {
  recipientPhone: string;
  recipientName: string;
  documentTitle: string;
  signingUrl: string;
  message?: string;
}

// Signature verification
export interface SignatureVerification {
  signerId: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  verified: boolean;
}

// Create signature request payload
export interface CreateSignatureRequestPayload {
  documentId: string;
  documentName: string;
  documentType: string;
  title: string;
  message?: string;
  signers: {
    name: string;
    email?: string;
    phone?: string;
    role: SignerRole;
    deliveryMethod: DeliveryMethod;
  }[];
  signingOrder: 'sequential' | 'parallel';
  expiresInDays?: number;
  reminderFrequency?: 'none' | 'daily' | 'weekly';
  allowDecline?: boolean;
  requireVerification?: boolean;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateSignatureRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `sig_${timestamp}_${random}`;
}

export function generateSignerId(): string {
  return `signer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSigningToken(requestId: string, signerId: string): string {
  const data = `${requestId}:${signerId}:${Date.now()}`;
  // In production, this would be a proper JWT or encrypted token
  return Buffer.from(data).toString('base64url');
}

export function parseSigningToken(token: string): { requestId: string; signerId: string } | null {
  try {
    const data = Buffer.from(token, 'base64url').toString();
    const [requestId, signerId] = data.split(':');
    return { requestId, signerId };
  } catch {
    return null;
  }
}

export function getStatusColor(status: SignatureStatus): string {
  const colors: Record<SignatureStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    viewed: 'bg-blue-100 text-blue-800',
    signed: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
}

export function getStatusLabel(status: SignatureStatus, isArabic: boolean = false): string {
  const labels: Record<SignatureStatus, { en: string; ar: string }> = {
    draft: { en: 'Draft', ar: 'مسودة' },
    pending: { en: 'Pending', ar: 'قيد الانتظار' },
    viewed: { en: 'Viewed', ar: 'تم العرض' },
    signed: { en: 'Signed', ar: 'موقع' },
    declined: { en: 'Declined', ar: 'مرفوض' },
    expired: { en: 'Expired', ar: 'منتهي الصلاحية' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' },
  };
  return isArabic ? labels[status].ar : labels[status].en;
}

export function getRoleLabel(role: SignerRole, isArabic: boolean = false): string {
  const labels: Record<SignerRole, { en: string; ar: string }> = {
    signer: { en: 'Signer', ar: 'موقع' },
    approver: { en: 'Approver', ar: 'معتمد' },
    witness: { en: 'Witness', ar: 'شاهد' },
    cc: { en: 'CC', ar: 'نسخة' },
  };
  return isArabic ? labels[role].ar : labels[role].en;
}

export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Ensure it starts with country code
  if (!cleaned.startsWith('+')) {
    // Default to UAE if no country code
    if (cleaned.startsWith('0')) {
      cleaned = '+971' + cleaned.substring(1);
    } else if (cleaned.startsWith('971')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+971' + cleaned;
    }
  }

  return cleaned;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Basic validation for international phone numbers
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleaned);
}

// Calculate request progress
export function calculateProgress(request: SignatureRequest): number {
  const totalSigners = request.signers.filter(s => s.role !== 'cc').length;
  if (totalSigners === 0) return 0;

  const signedCount = request.signers.filter(s => s.status === 'signed').length;
  return Math.round((signedCount / totalSigners) * 100);
}

// Check if request is complete
export function isRequestComplete(request: SignatureRequest): boolean {
  return request.signers
    .filter(s => s.role !== 'cc')
    .every(s => s.status === 'signed');
}

// Get next signer in sequential signing
export function getNextSigner(request: SignatureRequest): Signer | null {
  if (request.signingOrder === 'parallel') {
    return request.signers.find(s => s.status === 'pending' && s.role !== 'cc') || null;
  }

  // Sequential: find the first pending signer by order
  return request.signers
    .filter(s => s.status === 'pending' && s.role !== 'cc')
    .sort((a, b) => a.order - b.order)[0] || null;
}

// Email templates
export const emailTemplates = {
  signatureRequest: {
    subject: {
      en: (documentTitle: string) => `Please sign: ${documentTitle}`,
      ar: (documentTitle: string) => `يرجى التوقيع: ${documentTitle}`,
    },
    body: {
      en: (data: EmailTemplateData) => `
Dear ${data.recipientName},

${data.senderName} has requested your signature on "${data.documentTitle}".

${data.message ? `Message: ${data.message}\n\n` : ''}
Please click the link below to review and sign the document:
${data.signingUrl}

${data.expiresAt ? `This request expires on ${data.expiresAt}.\n\n` : ''}
If you have any questions, please contact the sender directly.

Best regards,
${data.companyName}
      `.trim(),
      ar: (data: EmailTemplateData) => `
عزيزي/عزيزتي ${data.recipientName}،

طلب ${data.senderName} توقيعك على "${data.documentTitle}".

${data.message ? `الرسالة: ${data.message}\n\n` : ''}
يرجى النقر على الرابط أدناه لمراجعة وتوقيع المستند:
${data.signingUrl}

${data.expiresAt ? `ينتهي هذا الطلب في ${data.expiresAt}.\n\n` : ''}
إذا كان لديك أي أسئلة، يرجى الاتصال بالمرسل مباشرة.

مع أطيب التحيات،
${data.companyName}
      `.trim(),
    },
  },
  reminder: {
    subject: {
      en: (documentTitle: string) => `Reminder: Please sign ${documentTitle}`,
      ar: (documentTitle: string) => `تذكير: يرجى التوقيع على ${documentTitle}`,
    },
  },
  completed: {
    subject: {
      en: (documentTitle: string) => `Document signed: ${documentTitle}`,
      ar: (documentTitle: string) => `تم توقيع المستند: ${documentTitle}`,
    },
  },
};

// WhatsApp message templates
export const whatsAppTemplates = {
  signatureRequest: {
    en: (data: WhatsAppMessageData) => `
Hi ${data.recipientName},

You have been requested to sign "${data.documentTitle}".

${data.message ? `Message: ${data.message}\n\n` : ''}
Click here to sign: ${data.signingUrl}

- LegalDocs
    `.trim(),
    ar: (data: WhatsAppMessageData) => `
مرحباً ${data.recipientName}،

تم طلب توقيعك على "${data.documentTitle}".

${data.message ? `الرسالة: ${data.message}\n\n` : ''}
انقر هنا للتوقيع: ${data.signingUrl}

- LegalDocs
    `.trim(),
  },
  reminder: {
    en: (data: WhatsAppMessageData) => `
Reminder: Please sign "${data.documentTitle}".

Sign here: ${data.signingUrl}
    `.trim(),
    ar: (data: WhatsAppMessageData) => `
تذكير: يرجى التوقيع على "${data.documentTitle}".

وقع هنا: ${data.signingUrl}
    `.trim(),
  },
  verification: {
    en: (code: string) => `Your LegalDocs verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    ar: (code: string) => `رمز التحقق الخاص بك من LegalDocs هو: ${code}\n\nينتهي هذا الرمز خلال 10 دقائق.`,
  },
};

export default {
  generateSignatureRequestId,
  generateSignerId,
  generateVerificationCode,
  generateSigningToken,
  parseSigningToken,
  getStatusColor,
  getStatusLabel,
  getRoleLabel,
  formatPhoneForWhatsApp,
  validateEmail,
  validatePhone,
  calculateProgress,
  isRequestComplete,
  getNextSigner,
  emailTemplates,
  whatsAppTemplates,
};
