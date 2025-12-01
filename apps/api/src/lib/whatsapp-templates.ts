/**
 * WhatsApp Message Templates
 * Bilingual templates for WhatsApp notifications (English, Arabic, Urdu)
 */

import { Language } from './error-messages.js';

// Template types
export type WhatsAppTemplateType =
  | 'signature_request'
  | 'signature_reminder'
  | 'signature_completed'
  | 'document_shared'
  | 'document_approved'
  | 'document_rejected'
  | 'payment_reminder'
  | 'welcome'
  | 'otp_verification'
  | 'case_update'
  | 'consultation_scheduled'
  | 'consultation_reminder';

// Template data interfaces
export interface SignatureRequestData {
  signerName: string;
  documentName: string;
  senderName: string;
  signingUrl: string;
  expiresIn?: string;
}

export interface SignatureReminderData {
  signerName: string;
  documentName: string;
  daysRemaining: number;
  signingUrl: string;
}

export interface SignatureCompletedData {
  documentName: string;
  signerCount: number;
  downloadUrl: string;
}

export interface DocumentSharedData {
  recipientName: string;
  documentName: string;
  senderName: string;
  viewUrl: string;
}

export interface PaymentReminderData {
  clientName: string;
  amount: string;
  currency: string;
  dueDate: string;
  invoiceNumber: string;
  paymentUrl: string;
}

export interface WelcomeData {
  userName: string;
  dashboardUrl: string;
}

export interface OTPData {
  code: string;
  expiresIn: string;
}

export interface CaseUpdateData {
  clientName: string;
  caseNumber: string;
  updateType: string;
  description: string;
  portalUrl: string;
}

export interface ConsultationData {
  clientName: string;
  lawyerName: string;
  date: string;
  time: string;
  meetingUrl?: string;
}

// Message templates with translations
const templates: Record<WhatsAppTemplateType, Record<Language, (data: any) => string>> = {
  signature_request: {
    en: (data: SignatureRequestData) =>
      `📝 *Signature Request*

Hello ${data.signerName},

${data.senderName} has requested your signature on "${data.documentName}".

Please review and sign the document at your earliest convenience:
${data.signingUrl}

${data.expiresIn ? `⏰ This request expires in ${data.expiresIn}.` : ''}

_LegalDocs - Secure Digital Signatures_`,

    ar: (data: SignatureRequestData) =>
      `📝 *طلب توقيع*

مرحباً ${data.signerName}،

طلب منك ${data.senderName} التوقيع على "${data.documentName}".

يرجى مراجعة المستند وتوقيعه في أقرب وقت ممكن:
${data.signingUrl}

${data.expiresIn ? `⏰ ينتهي هذا الطلب خلال ${data.expiresIn}.` : ''}

_LegalDocs - توقيعات رقمية آمنة_`,

    ur: (data: SignatureRequestData) =>
      `📝 *دستخط کی درخواست*

السلام علیکم ${data.signerName}،

${data.senderName} نے "${data.documentName}" پر آپ کے دستخط کی درخواست کی ہے۔

براہ کرم جلد از جلد دستاویز کا جائزہ لیں اور دستخط کریں:
${data.signingUrl}

${data.expiresIn ? `⏰ یہ درخواست ${data.expiresIn} میں ختم ہو جائے گی۔` : ''}

_LegalDocs - محفوظ ڈیجیٹل دستخط_`,
  },

  signature_reminder: {
    en: (data: SignatureReminderData) =>
      `⏰ *Signature Reminder*

Hello ${data.signerName},

This is a friendly reminder that "${data.documentName}" is still awaiting your signature.

⚠️ Only ${data.daysRemaining} day${data.daysRemaining > 1 ? 's' : ''} remaining!

Sign now: ${data.signingUrl}

_LegalDocs - Secure Digital Signatures_`,

    ar: (data: SignatureReminderData) =>
      `⏰ *تذكير بالتوقيع*

مرحباً ${data.signerName}،

هذا تذكير ودي بأن "${data.documentName}" لا يزال بانتظار توقيعك.

⚠️ متبقي ${data.daysRemaining} يوم فقط!

وقّع الآن: ${data.signingUrl}

_LegalDocs - توقيعات رقمية آمنة_`,

    ur: (data: SignatureReminderData) =>
      `⏰ *دستخط کی یاد دہانی*

السلام علیکم ${data.signerName}،

یہ ایک دوستانہ یاد دہانی ہے کہ "${data.documentName}" ابھی بھی آپ کے دستخط کا منتظر ہے۔

⚠️ صرف ${data.daysRemaining} دن باقی ہیں!

ابھی دستخط کریں: ${data.signingUrl}

_LegalDocs - محفوظ ڈیجیٹل دستخط_`,
  },

  signature_completed: {
    en: (data: SignatureCompletedData) =>
      `✅ *Document Signed*

Great news! "${data.documentName}" has been signed by all ${data.signerCount} parties.

📥 Download your signed document:
${data.downloadUrl}

_LegalDocs - Secure Digital Signatures_`,

    ar: (data: SignatureCompletedData) =>
      `✅ *تم توقيع المستند*

أخبار سارة! تم توقيع "${data.documentName}" من قبل جميع الأطراف الـ ${data.signerCount}.

📥 قم بتنزيل المستند الموقع:
${data.downloadUrl}

_LegalDocs - توقيعات رقمية آمنة_`,

    ur: (data: SignatureCompletedData) =>
      `✅ *دستاویز پر دستخط ہو گئے*

خوشخبری! "${data.documentName}" پر تمام ${data.signerCount} فریقین نے دستخط کر دیے ہیں۔

📥 اپنی دستخط شدہ دستاویز ڈاؤن لوڈ کریں:
${data.downloadUrl}

_LegalDocs - محفوظ ڈیجیٹل دستخط_`,
  },

  document_shared: {
    en: (data: DocumentSharedData) =>
      `📄 *Document Shared*

Hello ${data.recipientName},

${data.senderName} has shared "${data.documentName}" with you.

View document: ${data.viewUrl}

_LegalDocs - Legal Document Platform_`,

    ar: (data: DocumentSharedData) =>
      `📄 *تم مشاركة مستند*

مرحباً ${data.recipientName}،

شارك ${data.senderName} معك "${data.documentName}".

عرض المستند: ${data.viewUrl}

_LegalDocs - منصة المستندات القانونية_`,

    ur: (data: DocumentSharedData) =>
      `📄 *دستاویز شیئر کی گئی*

السلام علیکم ${data.recipientName}،

${data.senderName} نے "${data.documentName}" آپ کے ساتھ شیئر کی ہے۔

دستاویز دیکھیں: ${data.viewUrl}

_LegalDocs - قانونی دستاویزات کا پلیٹ فارم_`,
  },

  document_approved: {
    en: (data: { documentName: string; approverName: string }) =>
      `✅ *Document Approved*

"${data.documentName}" has been approved by ${data.approverName}.

_LegalDocs - Legal Document Platform_`,

    ar: (data: { documentName: string; approverName: string }) =>
      `✅ *تمت الموافقة على المستند*

تمت الموافقة على "${data.documentName}" من قبل ${data.approverName}.

_LegalDocs - منصة المستندات القانونية_`,

    ur: (data: { documentName: string; approverName: string }) =>
      `✅ *دستاویز منظور*

"${data.documentName}" کو ${data.approverName} نے منظور کر لیا۔

_LegalDocs - قانونی دستاویزات کا پلیٹ فارم_`,
  },

  document_rejected: {
    en: (data: { documentName: string; rejectorName: string; reason?: string }) =>
      `❌ *Document Rejected*

"${data.documentName}" has been rejected by ${data.rejectorName}.
${data.reason ? `\nReason: ${data.reason}` : ''}

_LegalDocs - Legal Document Platform_`,

    ar: (data: { documentName: string; rejectorName: string; reason?: string }) =>
      `❌ *تم رفض المستند*

تم رفض "${data.documentName}" من قبل ${data.rejectorName}.
${data.reason ? `\nالسبب: ${data.reason}` : ''}

_LegalDocs - منصة المستندات القانونية_`,

    ur: (data: { documentName: string; rejectorName: string; reason?: string }) =>
      `❌ *دستاویز مسترد*

"${data.documentName}" کو ${data.rejectorName} نے مسترد کر دیا۔
${data.reason ? `\nوجہ: ${data.reason}` : ''}

_LegalDocs - قانونی دستاویزات کا پلیٹ فارم_`,
  },

  payment_reminder: {
    en: (data: PaymentReminderData) =>
      `💳 *Payment Reminder*

Hello ${data.clientName},

Invoice #${data.invoiceNumber} for ${data.currency} ${data.amount} is due on ${data.dueDate}.

Pay now: ${data.paymentUrl}

_LegalDocs - Legal Document Platform_`,

    ar: (data: PaymentReminderData) =>
      `💳 *تذكير بالدفع*

مرحباً ${data.clientName}،

الفاتورة رقم ${data.invoiceNumber} بقيمة ${data.amount} ${data.currency} مستحقة في ${data.dueDate}.

ادفع الآن: ${data.paymentUrl}

_LegalDocs - منصة المستندات القانونية_`,

    ur: (data: PaymentReminderData) =>
      `💳 *ادائیگی کی یاد دہانی*

السلام علیکم ${data.clientName}،

انوائس نمبر ${data.invoiceNumber} ${data.currency} ${data.amount} کی رقم ${data.dueDate} کو واجب الادا ہے۔

ابھی ادائیگی کریں: ${data.paymentUrl}

_LegalDocs - قانونی دستاویزات کا پلیٹ فارم_`,
  },

  welcome: {
    en: (data: WelcomeData) =>
      `🎉 *Welcome to LegalDocs*

Hello ${data.userName}!

Your account has been created successfully. You can now:

✅ Create legal documents
✅ Get digital signatures
✅ Consult with lawyers
✅ Manage your contracts

Get started: ${data.dashboardUrl}

_LegalDocs - Your Legal Partner_`,

    ar: (data: WelcomeData) =>
      `🎉 *مرحباً بك في LegalDocs*

مرحباً ${data.userName}!

تم إنشاء حسابك بنجاح. يمكنك الآن:

✅ إنشاء مستندات قانونية
✅ الحصول على توقيعات رقمية
✅ استشارة المحامين
✅ إدارة عقودك

ابدأ الآن: ${data.dashboardUrl}

_LegalDocs - شريكك القانوني_`,

    ur: (data: WelcomeData) =>
      `🎉 *LegalDocs میں خوش آمدید*

السلام علیکم ${data.userName}!

آپ کا اکاؤنٹ کامیابی سے بن گیا ہے۔ اب آپ کر سکتے ہیں:

✅ قانونی دستاویزات بنائیں
✅ ڈیجیٹل دستخط حاصل کریں
✅ وکلاء سے مشورہ کریں
✅ اپنے معاہدوں کا انتظام کریں

شروع کریں: ${data.dashboardUrl}

_LegalDocs - آپ کا قانونی ساتھی_`,
  },

  otp_verification: {
    en: (data: OTPData) =>
      `🔐 *Verification Code*

Your LegalDocs verification code is:

*${data.code}*

This code expires in ${data.expiresIn}.

⚠️ Never share this code with anyone.

_LegalDocs - Secure Authentication_`,

    ar: (data: OTPData) =>
      `🔐 *رمز التحقق*

رمز التحقق الخاص بك في LegalDocs هو:

*${data.code}*

ينتهي هذا الرمز خلال ${data.expiresIn}.

⚠️ لا تشارك هذا الرمز مع أي شخص.

_LegalDocs - مصادقة آمنة_`,

    ur: (data: OTPData) =>
      `🔐 *تصدیقی کوڈ*

آپ کا LegalDocs تصدیقی کوڈ ہے:

*${data.code}*

یہ کوڈ ${data.expiresIn} میں ختم ہو جائے گا۔

⚠️ یہ کوڈ کسی کے ساتھ شیئر نہ کریں۔

_LegalDocs - محفوظ تصدیق_`,
  },

  case_update: {
    en: (data: CaseUpdateData) =>
      `📋 *Case Update*

Hello ${data.clientName},

*Case #${data.caseNumber}*
Update: ${data.updateType}

${data.description}

View details: ${data.portalUrl}

_LegalDocs - Legal Services_`,

    ar: (data: CaseUpdateData) =>
      `📋 *تحديث القضية*

مرحباً ${data.clientName}،

*القضية رقم ${data.caseNumber}*
التحديث: ${data.updateType}

${data.description}

عرض التفاصيل: ${data.portalUrl}

_LegalDocs - الخدمات القانونية_`,

    ur: (data: CaseUpdateData) =>
      `📋 *کیس اپڈیٹ*

السلام علیکم ${data.clientName}،

*کیس نمبر ${data.caseNumber}*
اپڈیٹ: ${data.updateType}

${data.description}

تفصیلات دیکھیں: ${data.portalUrl}

_LegalDocs - قانونی خدمات_`,
  },

  consultation_scheduled: {
    en: (data: ConsultationData) =>
      `📅 *Consultation Scheduled*

Hello ${data.clientName},

Your consultation with ${data.lawyerName} has been scheduled.

📅 Date: ${data.date}
⏰ Time: ${data.time}
${data.meetingUrl ? `🔗 Meeting Link: ${data.meetingUrl}` : ''}

_LegalDocs - Legal Consultation_`,

    ar: (data: ConsultationData) =>
      `📅 *تم جدولة الاستشارة*

مرحباً ${data.clientName}،

تم جدولة استشارتك مع ${data.lawyerName}.

📅 التاريخ: ${data.date}
⏰ الوقت: ${data.time}
${data.meetingUrl ? `🔗 رابط الاجتماع: ${data.meetingUrl}` : ''}

_LegalDocs - استشارة قانونية_`,

    ur: (data: ConsultationData) =>
      `📅 *مشاورت طے ہو گئی*

السلام علیکم ${data.clientName}،

${data.lawyerName} کے ساتھ آپ کی مشاورت طے ہو گئی ہے۔

📅 تاریخ: ${data.date}
⏰ وقت: ${data.time}
${data.meetingUrl ? `🔗 میٹنگ لنک: ${data.meetingUrl}` : ''}

_LegalDocs - قانونی مشاورت_`,
  },

  consultation_reminder: {
    en: (data: ConsultationData) =>
      `⏰ *Consultation Reminder*

Hello ${data.clientName},

Your consultation with ${data.lawyerName} is in 1 hour.

📅 Date: ${data.date}
⏰ Time: ${data.time}
${data.meetingUrl ? `🔗 Join: ${data.meetingUrl}` : ''}

_LegalDocs - Legal Consultation_`,

    ar: (data: ConsultationData) =>
      `⏰ *تذكير بالاستشارة*

مرحباً ${data.clientName}،

استشارتك مع ${data.lawyerName} بعد ساعة واحدة.

📅 التاريخ: ${data.date}
⏰ الوقت: ${data.time}
${data.meetingUrl ? `🔗 انضم: ${data.meetingUrl}` : ''}

_LegalDocs - استشارة قانونية_`,

    ur: (data: ConsultationData) =>
      `⏰ *مشاورت کی یاد دہانی*

السلام علیکم ${data.clientName}،

${data.lawyerName} کے ساتھ آپ کی مشاورت 1 گھنٹے میں ہے۔

📅 تاریخ: ${data.date}
⏰ وقت: ${data.time}
${data.meetingUrl ? `🔗 شامل ہوں: ${data.meetingUrl}` : ''}

_LegalDocs - قانونی مشاورت_`,
  },
};

/**
 * Get WhatsApp message from template
 */
export function getWhatsAppMessage<T extends WhatsAppTemplateType>(
  templateType: T,
  language: Language,
  data: Parameters<(typeof templates)[T][Language]>[0]
): string {
  const templateFn = templates[templateType][language];
  return templateFn(data);
}

/**
 * Get supported languages for WhatsApp templates
 */
export function getSupportedLanguages(): Language[] {
  return ['en', 'ar', 'ur'];
}

/**
 * Quick reply button options (for interactive messages)
 */
export const quickReplyButtons = {
  en: {
    yes: 'Yes',
    no: 'No',
    viewDocument: 'View Document',
    signNow: 'Sign Now',
    remindLater: 'Remind Later',
    contactSupport: 'Contact Support',
    download: 'Download',
    approve: 'Approve',
    reject: 'Reject',
  },
  ar: {
    yes: 'نعم',
    no: 'لا',
    viewDocument: 'عرض المستند',
    signNow: 'وقّع الآن',
    remindLater: 'ذكرني لاحقاً',
    contactSupport: 'اتصل بالدعم',
    download: 'تحميل',
    approve: 'موافق',
    reject: 'رفض',
  },
  ur: {
    yes: 'جی ہاں',
    no: 'نہیں',
    viewDocument: 'دستاویز دیکھیں',
    signNow: 'ابھی دستخط کریں',
    remindLater: 'بعد میں یاد دلائیں',
    contactSupport: 'سپورٹ سے رابطہ کریں',
    download: 'ڈاؤن لوڈ',
    approve: 'منظور',
    reject: 'مسترد',
  },
};
