/**
 * Email Services Index
 *
 * Export unified email service supporting Cloudflare Email and Resend.
 */

// Types
export type {
  EmailOptions,
  SendEmailResult,
  EmailBindings,
  EmailProvider,
  EmailAddress,
  IEmailService,
  WelcomeEmailData,
  PasswordResetEmailData,
  DocumentSharedEmailData,
  SignatureRequestEmailData,
  SignatureCompletedEmailData,
  DocumentReminderEmailData,
  VerificationCodeEmailData,
  ConsultationBookedEmailData,
  ConsultationReminderEmailData,
} from './types.js';

export { DEFAULT_FROM_EMAIL, DEFAULT_REPLY_TO, SENDER_DOMAIN } from './types.js';

// Service
export {
  EmailService,
  createEmailService,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendDocumentSharedEmail,
  sendSignatureRequestEmail,
  sendSignatureCompletedEmail,
  sendDocumentReminderEmail,
  sendBatchEmails,
} from './email-service.js';

// Providers
export { sendWithCloudflare, isCloudflareEmailAvailable } from './cloudflare-email.js';
export { sendWithResend, isResendAvailable } from './resend-email.js';
