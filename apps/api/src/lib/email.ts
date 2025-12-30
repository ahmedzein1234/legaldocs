/**
 * Email Service - Unified Email API for LegalDocs
 *
 * Provides typed email sending functions using:
 * 1. Cloudflare Email Workers (primary) - No API keys needed
 * 2. Resend API (fallback) - For production reliability
 *
 * Compatible with Cloudflare Workers.
 */

import {
  getWelcomeEmail,
  getPasswordResetEmail,
  getDocumentSharedEmail,
  getSignatureRequestEmail,
  getSignatureCompletedEmail,
  getDocumentReminderEmail,
  getVerificationExpiryEmail,
  getLicenseRenewalEmail,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type DocumentSharedEmailData,
  type SignatureRequestEmailData,
  type SignatureCompletedEmailData,
  type DocumentReminderEmailData,
  type VerificationExpiryEmailData,
  type LicenseRenewalEmailData,
} from './email-templates.js';

// Re-export types for convenience
export type {
  WelcomeEmailData,
  PasswordResetEmailData,
  DocumentSharedEmailData,
  SignatureRequestEmailData,
  SignatureCompletedEmailData,
  DocumentReminderEmailData,
  VerificationExpiryEmailData,
  LicenseRenewalEmailData,
};

// Re-export template functions
export {
  getVerificationExpiryEmail,
  getLicenseRenewalEmail,
};

// ============================================
// TYPES
// ============================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider?: 'cloudflare' | 'resend';
  error?: string;
}

export interface EmailEnv {
  // Cloudflare Email binding
  EMAIL?: {
    send(message: any): Promise<void>;
  };
  // Resend API key (fallback)
  RESEND_API_KEY?: string;
}

// ============================================
// CONSTANTS
// ============================================

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM_EMAIL = 'Qannoni <noreply@qannoni.com>';
const DEFAULT_REPLY_TO = 'support@qannoni.com';
const SENDER_DOMAIN = 'qannoni.com';

// ============================================
// MIME MESSAGE BUILDER
// ============================================

function buildMimeMessage(options: EmailOptions): string {
  const from = options.from || DEFAULT_FROM_EMAIL;
  const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
  const subject = options.subject;
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36)}@${SENDER_DOMAIN}>`,
  ];

  if (options.cc) {
    const cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
    headers.push(`Cc: ${cc}`);
  }

  if (options.replyTo) {
    headers.push(`Reply-To: ${options.replyTo}`);
  }

  // Build multipart message
  if (options.html && options.text) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);

    const body = [
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      btoa(unescape(encodeURIComponent(options.text))),
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      btoa(unescape(encodeURIComponent(options.html))),
      ``,
      `--${boundary}--`,
    ].join('\r\n');

    return headers.join('\r\n') + '\r\n\r\n' + body;
  }

  // HTML only
  headers.push(`Content-Type: text/html; charset=UTF-8`);
  headers.push(`Content-Transfer-Encoding: base64`);
  return headers.join('\r\n') + '\r\n\r\n' + btoa(unescape(encodeURIComponent(options.html)));
}

// ============================================
// EMAIL PROVIDERS
// ============================================

/**
 * Send email using Cloudflare Email Workers
 */
async function sendWithCloudflare(env: EmailEnv, options: EmailOptions): Promise<SendEmailResult> {
  try {
    if (!env.EMAIL) {
      return { success: false, error: 'Cloudflare Email binding not available' };
    }

    const mimeMessage = buildMimeMessage(options);
    const from = options.from || DEFAULT_FROM_EMAIL;
    const fromEmail = from.match(/<(.+)>/)?.[1] || from;
    const to = Array.isArray(options.to) ? options.to[0] : options.to;

    // Dynamic import for cloudflare:email module
    let EmailMessage: any;
    try {
      const emailModule = await import('cloudflare:email');
      EmailMessage = emailModule.EmailMessage;
    } catch {
      // Create compatible class if module not available
      EmailMessage = class {
        constructor(public from: string, public to: string, public raw: string) {}
      };
    }

    const message = new EmailMessage(fromEmail, to, mimeMessage);
    await env.EMAIL.send(message);

    return {
      success: true,
      provider: 'cloudflare',
      messageId: `cf_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    };
  } catch (error) {
    console.error('Cloudflare email error:', error);
    return {
      success: false,
      provider: 'cloudflare',
      error: error instanceof Error ? error.message : 'Unknown Cloudflare email error',
    };
  }
}

/**
 * Send email using Resend API
 */
async function sendWithResend(apiKey: string, options: EmailOptions): Promise<SendEmailResult> {
  try {
    const payload = {
      from: options.from || DEFAULT_FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo || DEFAULT_REPLY_TO,
      ...(options.cc && { cc: Array.isArray(options.cc) ? options.cc : [options.cc] }),
      ...(options.bcc && { bcc: Array.isArray(options.bcc) ? options.bcc : [options.bcc] }),
    };

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      return {
        success: false,
        provider: 'resend',
        error: data.message || `Resend API error: ${response.status}`,
      };
    }

    return {
      success: true,
      provider: 'resend',
      messageId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      provider: 'resend',
      error: error instanceof Error ? error.message : 'Unknown Resend error',
    };
  }
}

// ============================================
// CORE EMAIL SENDING FUNCTION
// ============================================

/**
 * Send an email using the best available provider
 *
 * Priority:
 * 1. Cloudflare Email Workers (if EMAIL binding available)
 * 2. Resend API (if RESEND_API_KEY available)
 *
 * @param envOrApiKey - Environment object with bindings OR Resend API key (legacy)
 * @param options - Email options
 */
export async function sendEmail(
  envOrApiKey: EmailEnv | string,
  options: EmailOptions
): Promise<SendEmailResult> {
  // Validate inputs
  if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
    return { success: false, error: 'Email recipient is required' };
  }

  if (!options.subject || !options.html) {
    return { success: false, error: 'Email subject and HTML content are required' };
  }

  // Handle legacy API key format
  if (typeof envOrApiKey === 'string') {
    if (!envOrApiKey) {
      return { success: false, error: 'API key is required' };
    }
    return sendWithResend(envOrApiKey, options);
  }

  const env = envOrApiKey;

  // Try Cloudflare Email first
  if (env.EMAIL) {
    const result = await sendWithCloudflare(env, options);

    // If successful, return
    if (result.success) {
      return result;
    }

    // If failed and Resend available, try fallback
    if (env.RESEND_API_KEY) {
      console.warn('Cloudflare email failed, trying Resend fallback:', result.error);
      return sendWithResend(env.RESEND_API_KEY, options);
    }

    return result;
  }

  // Try Resend
  if (env.RESEND_API_KEY) {
    return sendWithResend(env.RESEND_API_KEY, options);
  }

  return {
    success: false,
    error: 'No email provider configured. Set up Cloudflare Email or RESEND_API_KEY.',
  };
}

// ============================================
// TEMPLATE-BASED EMAIL FUNCTIONS
// ============================================

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  envOrApiKey: EmailEnv | string,
  data: WelcomeEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getWelcomeEmail(data);

  return sendEmail(envOrApiKey, {
    to: data.userEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  envOrApiKey: EmailEnv | string,
  to: string,
  data: PasswordResetEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getPasswordResetEmail(data);

  return sendEmail(envOrApiKey, {
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send document shared notification email
 */
export async function sendDocumentSharedEmail(
  envOrApiKey: EmailEnv | string,
  to: string,
  data: DocumentSharedEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getDocumentSharedEmail(data);

  return sendEmail(envOrApiKey, {
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send signature request email
 */
export async function sendSignatureRequestEmail(
  envOrApiKey: EmailEnv | string,
  to: string,
  data: SignatureRequestEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getSignatureRequestEmail(data);

  return sendEmail(envOrApiKey, {
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send signature completed notification email
 */
export async function sendSignatureCompletedEmail(
  envOrApiKey: EmailEnv | string,
  to: string,
  data: SignatureCompletedEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getSignatureCompletedEmail(data);

  return sendEmail(envOrApiKey, {
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send document reminder email
 */
export async function sendDocumentReminderEmail(
  envOrApiKey: EmailEnv | string,
  to: string,
  data: DocumentReminderEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getDocumentReminderEmail(data);

  return sendEmail(envOrApiKey, {
    to,
    subject,
    html,
    text,
  });
}

// ============================================
// BATCH EMAIL FUNCTIONS
// ============================================

/**
 * Send emails to multiple recipients (sequentially)
 */
export async function sendBatchEmails(
  envOrApiKey: EmailEnv | string,
  emails: EmailOptions[]
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = [];

  for (const email of emails) {
    const result = await sendEmail(envOrApiKey, email);
    results.push(result);

    // Add delay between emails
    if (emails.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Send signature requests to multiple signers
 */
export async function sendSignatureRequestBatch(
  envOrApiKey: EmailEnv | string,
  requests: Array<{ email: string; data: SignatureRequestEmailData }>
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = [];

  for (const request of requests) {
    const result = await sendSignatureRequestEmail(envOrApiKey, request.email, request.data);
    results.push(result);

    if (requests.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extract language preference from user data or default to English
 */
export function getEmailLanguage(userLanguage?: string): 'en' | 'ar' {
  if (userLanguage === 'ar' || userLanguage === 'ar-SA') {
    return 'ar';
  }
  return 'en';
}

/**
 * Format email recipient with name
 */
export function formatEmailRecipient(email: string, name?: string): string {
  if (name) {
    return `${name} <${email}>`;
  }
  return email;
}

/**
 * Check if email provider is available
 */
export function isEmailAvailable(env: EmailEnv): boolean {
  return !!env.EMAIL || !!env.RESEND_API_KEY;
}

/**
 * Get current email provider
 */
export function getEmailProvider(env: EmailEnv): 'cloudflare' | 'resend' | 'none' {
  if (env.EMAIL) return 'cloudflare';
  if (env.RESEND_API_KEY) return 'resend';
  return 'none';
}

// ============================================
// ERROR HANDLING
// ============================================

export class EmailError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_RECIPIENT' | 'API_ERROR' | 'MISSING_CONFIG' | 'VALIDATION_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

/**
 * Handle email sending errors gracefully
 */
export function handleEmailError(error: unknown): EmailError {
  if (error instanceof EmailError) {
    return error;
  }

  if (error instanceof Error) {
    return new EmailError(error.message, 'API_ERROR');
  }

  return new EmailError('Unknown email error occurred', 'API_ERROR');
}
