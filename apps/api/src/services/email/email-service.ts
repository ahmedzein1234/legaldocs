/**
 * Unified Email Service
 *
 * Provides a unified interface for sending emails using:
 * 1. Cloudflare Email Workers (primary)
 * 2. Resend API (fallback)
 *
 * Automatically selects the best available provider.
 */

import type {
  EmailOptions,
  SendEmailResult,
  EmailBindings,
  EmailProvider,
  IEmailService,
  WelcomeEmailData,
  PasswordResetEmailData,
  DocumentSharedEmailData,
  SignatureRequestEmailData,
  SignatureCompletedEmailData,
  DocumentReminderEmailData,
  VerificationCodeEmailData,
} from './types.js';

import { sendWithCloudflare, sendBatchWithCloudflare, isCloudflareEmailAvailable } from './cloudflare-email.js';
import { sendWithResend, sendBatchWithResend, isResendAvailable } from './resend-email.js';

// Import templates from existing lib
import {
  getWelcomeEmail,
  getPasswordResetEmail,
  getDocumentSharedEmail,
  getSignatureRequestEmail,
  getSignatureCompletedEmail,
  getDocumentReminderEmail,
} from '../../lib/email-templates.js';

// ============================================
// EMAIL SERVICE CLASS
// ============================================

export class EmailService implements IEmailService {
  private env: EmailBindings;
  private preferredProvider: EmailProvider;

  constructor(env: EmailBindings, preferredProvider: EmailProvider = 'auto') {
    this.env = env;
    this.preferredProvider = preferredProvider;
  }

  /**
   * Get the currently active email provider
   */
  getProvider(): EmailProvider {
    if (this.preferredProvider !== 'auto') {
      return this.preferredProvider;
    }

    // Auto-select: prefer Cloudflare, fallback to Resend
    if (isCloudflareEmailAvailable(this.env)) {
      return 'cloudflare';
    }

    if (isResendAvailable(this.env)) {
      return 'resend';
    }

    return 'auto'; // No provider available
  }

  /**
   * Check if email service is available
   */
  isAvailable(): boolean {
    return isCloudflareEmailAvailable(this.env) || isResendAvailable(this.env);
  }

  /**
   * Send a single email
   */
  async send(options: EmailOptions): Promise<SendEmailResult> {
    const provider = this.getProvider();

    // Try Cloudflare first
    if (provider === 'cloudflare' || (provider === 'auto' && isCloudflareEmailAvailable(this.env))) {
      const result = await sendWithCloudflare(this.env, options);

      // If Cloudflare fails and Resend is available, try fallback
      if (!result.success && isResendAvailable(this.env)) {
        console.warn('Cloudflare email failed, trying Resend fallback:', result.error);
        return sendWithResend(this.env, options);
      }

      return result;
    }

    // Try Resend
    if (provider === 'resend' || (provider === 'auto' && isResendAvailable(this.env))) {
      return sendWithResend(this.env, options);
    }

    // No provider available
    return {
      success: false,
      provider: 'none',
      error: 'No email provider configured. Set up Cloudflare Email or RESEND_API_KEY.',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send multiple emails
   */
  async sendBatch(emails: EmailOptions[]): Promise<SendEmailResult[]> {
    if (emails.length === 0) return [];

    const provider = this.getProvider();

    if (provider === 'cloudflare' || (provider === 'auto' && isCloudflareEmailAvailable(this.env))) {
      return sendBatchWithCloudflare(this.env, emails);
    }

    if (provider === 'resend' || (provider === 'auto' && isResendAvailable(this.env))) {
      return sendBatchWithResend(this.env, emails);
    }

    // No provider available
    return emails.map(() => ({
      success: false,
      provider: 'none' as const,
      error: 'No email provider configured',
      timestamp: new Date().toISOString(),
    }));
  }

  // ============================================
  // TEMPLATE-BASED METHODS
  // ============================================

  /**
   * Send welcome email
   */
  async sendWelcome(data: WelcomeEmailData): Promise<SendEmailResult> {
    const { subject, html, text } = getWelcomeEmail(data);

    return this.send({
      to: data.userEmail,
      subject,
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: string, data: PasswordResetEmailData): Promise<SendEmailResult> {
    const { subject, html, text } = getPasswordResetEmail(data);

    return this.send({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Send document shared notification
   */
  async sendDocumentShared(to: string, data: DocumentSharedEmailData): Promise<SendEmailResult> {
    const { subject, html, text } = getDocumentSharedEmail(data);

    return this.send({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Send signature request email
   */
  async sendSignatureRequest(to: string, data: SignatureRequestEmailData): Promise<SendEmailResult> {
    const { subject, html, text } = getSignatureRequestEmail(data);

    return this.send({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Send signature completed notification
   */
  async sendSignatureCompleted(to: string, data: SignatureCompletedEmailData): Promise<SendEmailResult> {
    const { subject, html, text } = getSignatureCompletedEmail(data);

    return this.send({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Send document reminder email
   */
  async sendDocumentReminder(to: string, data: DocumentReminderEmailData): Promise<SendEmailResult> {
    const { subject, html, text } = getDocumentReminderEmail(data);

    return this.send({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Send verification code email
   */
  async sendVerificationCode(to: string, data: VerificationCodeEmailData): Promise<SendEmailResult> {
    const { language, userName, code, expiresInMinutes } = data;

    const subjects = {
      en: 'Your Verification Code - Qannoni',
      ar: 'رمز التحقق الخاص بك - قانوني',
      ur: 'آپ کا تصدیقی کوڈ - قانوني',
    };

    const html = this.buildVerificationCodeEmail(data);
    const text =
      language === 'ar'
        ? `مرحباً ${userName}،\n\nرمز التحقق الخاص بك هو: ${code}\n\nهذا الرمز صالح لمدة ${expiresInMinutes} دقيقة.\n\nشكراً،\nفريق Qannoni`
        : language === 'ur'
          ? `${userName} خوش آمدید،\n\nآپ کا تصدیقی کوڈ ہے: ${code}\n\nیہ کوڈ ${expiresInMinutes} منٹ کے لیے درست ہے۔\n\nشکریہ،\nQannoni ٹیم`
          : `Hello ${userName},\n\nYour verification code is: ${code}\n\nThis code is valid for ${expiresInMinutes} minutes.\n\nBest regards,\nThe Qannoni Team`;

    return this.send({
      to,
      subject: subjects[language],
      html,
      text,
    });
  }

  /**
   * Build verification code email HTML
   */
  private buildVerificationCodeEmail(data: VerificationCodeEmailData): string {
    const { language, userName, code, expiresInMinutes } = data;
    const isRTL = language === 'ar' || language === 'ur';

    const greeting =
      language === 'ar' ? `مرحباً ${userName}،` : language === 'ur' ? `${userName} خوش آمدید،` : `Hello ${userName},`;

    const message =
      language === 'ar'
        ? 'استخدم الرمز التالي للتحقق من حسابك:'
        : language === 'ur'
          ? 'اپنے اکاؤنٹ کی تصدیق کے لیے درج ذیل کوڈ استعمال کریں:'
          : 'Use the following code to verify your account:';

    const expiry =
      language === 'ar'
        ? `هذا الرمز صالح لمدة ${expiresInMinutes} دقيقة.`
        : language === 'ur'
          ? `یہ کوڈ ${expiresInMinutes} منٹ کے لیے درست ہے۔`
          : `This code is valid for ${expiresInMinutes} minutes.`;

    return `
<!DOCTYPE html>
<html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Qannoni</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
      <div style="font-size: 28px; font-weight: bold; color: #ffffff;">Qannoni</div>
    </div>
    <div style="padding: 40px 30px;">
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">${greeting}</div>
      <div style="font-size: 15px; color: #4b5563; margin-bottom: 20px;">${message}</div>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</div>
      </div>
      <div style="font-size: 14px; color: #6b7280; text-align: center;">${expiry}</div>
    </div>
    <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <div style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Qannoni. All rights reserved.</div>
    </div>
  </div>
</body>
</html>
    `;
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create an email service instance
 */
export function createEmailService(env: EmailBindings, preferredProvider: EmailProvider = 'auto'): EmailService {
  return new EmailService(env, preferredProvider);
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Send a single email (auto-select provider)
 */
export async function sendEmail(env: EmailBindings, options: EmailOptions): Promise<SendEmailResult> {
  const service = new EmailService(env);
  return service.send(options);
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(env: EmailBindings, data: WelcomeEmailData): Promise<SendEmailResult> {
  const service = new EmailService(env);
  return service.sendWelcome(data);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  env: EmailBindings,
  to: string,
  data: PasswordResetEmailData
): Promise<SendEmailResult> {
  const service = new EmailService(env);
  return service.sendPasswordReset(to, data);
}

/**
 * Send document shared email
 */
export async function sendDocumentSharedEmail(
  env: EmailBindings,
  to: string,
  data: DocumentSharedEmailData
): Promise<SendEmailResult> {
  const service = new EmailService(env);
  return service.sendDocumentShared(to, data);
}

/**
 * Send signature request email
 */
export async function sendSignatureRequestEmail(
  env: EmailBindings,
  to: string,
  data: SignatureRequestEmailData
): Promise<SendEmailResult> {
  const service = new EmailService(env);
  return service.sendSignatureRequest(to, data);
}

/**
 * Send signature completed email
 */
export async function sendSignatureCompletedEmail(
  env: EmailBindings,
  to: string,
  data: SignatureCompletedEmailData
): Promise<SendEmailResult> {
  const service = new EmailService(env);
  return service.sendSignatureCompleted(to, data);
}

/**
 * Send document reminder email
 */
export async function sendDocumentReminderEmail(
  env: EmailBindings,
  to: string,
  data: DocumentReminderEmailData
): Promise<SendEmailResult> {
  const service = new EmailService(env);
  return service.sendDocumentReminder(to, data);
}

/**
 * Send batch emails
 */
export async function sendBatchEmails(env: EmailBindings, emails: EmailOptions[]): Promise<SendEmailResult[]> {
  const service = new EmailService(env);
  return service.sendBatch(emails);
}
