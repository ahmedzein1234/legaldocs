/**
 * Email Service Types
 *
 * Type definitions for the unified email service supporting
 * Cloudflare Email Workers and Resend fallback.
 */

// ============================================
// EMAIL OPTIONS
// ============================================

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: string | string[] | EmailAddress | EmailAddress[];
  subject: string;
  html: string;
  text?: string;
  from?: string | EmailAddress;
  replyTo?: string | EmailAddress;
  cc?: string | string[] | EmailAddress | EmailAddress[];
  bcc?: string | string[] | EmailAddress | EmailAddress[];
  headers?: Record<string, string>;
  tags?: string[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: 'cloudflare' | 'resend' | 'none';
  error?: string;
  timestamp: string;
}

// ============================================
// EMAIL PROVIDER TYPES
// ============================================

export type EmailProvider = 'cloudflare' | 'resend' | 'auto';

export interface EmailProviderConfig {
  provider: EmailProvider;
  cloudflare?: {
    enabled: boolean;
    senderDomain: string;
  };
  resend?: {
    enabled: boolean;
    apiKey: string;
  };
}

// ============================================
// CLOUDFLARE EMAIL TYPES
// ============================================

/**
 * Cloudflare Email Message class interface
 * From cloudflare:email module
 */
export interface CloudflareEmailMessage {
  readonly from: string;
  readonly to: string;
  readonly raw: ReadableStream | string;
}

/**
 * Cloudflare send_email binding interface
 */
export interface CloudflareSendEmailBinding {
  send(message: CloudflareEmailMessage): Promise<void>;
}

// ============================================
// ENVIRONMENT BINDINGS
// ============================================

export interface EmailBindings {
  // Cloudflare Email Workers binding
  EMAIL?: CloudflareSendEmailBinding;

  // Alternative named bindings for different purposes
  EMAIL_SUPPORT?: CloudflareSendEmailBinding;
  EMAIL_NOTIFICATIONS?: CloudflareSendEmailBinding;

  // Resend API key (fallback)
  RESEND_API_KEY?: string;

  // App configuration
  APP_URL?: string;
  ENVIRONMENT?: string;
}

// ============================================
// TEMPLATE DATA TYPES
// ============================================

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  language: 'en' | 'ar' | 'ur';
}

export interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
  expiresInHours: number;
  language: 'en' | 'ar' | 'ur';
}

export interface DocumentSharedEmailData {
  recipientName: string;
  senderName: string;
  documentName: string;
  documentType: string;
  viewLink: string;
  message?: string;
  language: 'en' | 'ar' | 'ur';
}

export interface SignatureRequestEmailData {
  signerName: string;
  senderName: string;
  documentName: string;
  documentType: string;
  signingLink: string;
  message?: string;
  expiresAt: string;
  role: 'signer' | 'approver' | 'witness' | 'cc';
  language: 'en' | 'ar' | 'ur';
}

export interface SignatureCompletedEmailData {
  recipientName: string;
  documentName: string;
  signerName: string;
  completedAt: string;
  downloadLink: string;
  language: 'en' | 'ar' | 'ur';
}

export interface DocumentReminderEmailData {
  signerName: string;
  documentName: string;
  signingLink: string;
  expiresAt: string;
  language: 'en' | 'ar' | 'ur';
}

export interface VerificationCodeEmailData {
  userName: string;
  code: string;
  expiresInMinutes: number;
  language: 'en' | 'ar' | 'ur';
}

export interface ConsultationBookedEmailData {
  clientName: string;
  lawyerName: string;
  consultationType: string;
  scheduledAt: string;
  duration: number;
  meetingLink?: string;
  language: 'en' | 'ar' | 'ur';
}

export interface ConsultationReminderEmailData {
  recipientName: string;
  lawyerName: string;
  consultationType: string;
  scheduledAt: string;
  meetingLink?: string;
  language: 'en' | 'ar' | 'ur';
}

// ============================================
// EMAIL SERVICE INTERFACE
// ============================================

export interface IEmailService {
  send(options: EmailOptions): Promise<SendEmailResult>;
  sendWelcome(data: WelcomeEmailData): Promise<SendEmailResult>;
  sendPasswordReset(to: string, data: PasswordResetEmailData): Promise<SendEmailResult>;
  sendDocumentShared(to: string, data: DocumentSharedEmailData): Promise<SendEmailResult>;
  sendSignatureRequest(to: string, data: SignatureRequestEmailData): Promise<SendEmailResult>;
  sendSignatureCompleted(to: string, data: SignatureCompletedEmailData): Promise<SendEmailResult>;
  sendDocumentReminder(to: string, data: DocumentReminderEmailData): Promise<SendEmailResult>;
  sendVerificationCode(to: string, data: VerificationCodeEmailData): Promise<SendEmailResult>;
  sendBatch(emails: EmailOptions[]): Promise<SendEmailResult[]>;
  getProvider(): EmailProvider;
  isAvailable(): boolean;
}

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_FROM_EMAIL = 'Qannoni <noreply@qannoni.com>';
export const DEFAULT_REPLY_TO = 'support@qannoni.com';
export const SENDER_DOMAIN = 'qannoni.com';
