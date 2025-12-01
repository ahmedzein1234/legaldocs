/**
 * Email Service - Resend API wrapper for LegalDocs
 *
 * Provides typed email sending functions using the Resend API.
 * Compatible with Cloudflare Workers (uses fetch, not Node.js modules).
 */

import {
  getWelcomeEmail,
  getPasswordResetEmail,
  getDocumentSharedEmail,
  getSignatureRequestEmail,
  getSignatureCompletedEmail,
  getDocumentReminderEmail,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type DocumentSharedEmailData,
  type SignatureRequestEmailData,
  type SignatureCompletedEmailData,
  type DocumentReminderEmailData,
} from './email-templates.js';

// Re-export types for convenience
export type {
  WelcomeEmailData,
  PasswordResetEmailData,
  DocumentSharedEmailData,
  SignatureRequestEmailData,
  SignatureCompletedEmailData,
  DocumentReminderEmailData,
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
  error?: string;
}

// ============================================
// CONSTANTS
// ============================================

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM_EMAIL = 'Qannoni <noreply@qannoni.com>';
const DEFAULT_REPLY_TO = 'support@qannoni.com';

// ============================================
// CORE EMAIL SENDING FUNCTION
// ============================================

/**
 * Send an email using Resend API
 * @param apiKey - Resend API key
 * @param options - Email options
 * @returns Result with success status and message ID or error
 */
export async function sendEmail(
  apiKey: string,
  options: EmailOptions
): Promise<SendEmailResult> {
  try {
    // Validate inputs
    if (!apiKey) {
      return {
        success: false,
        error: 'RESEND_API_KEY is not configured',
      };
    }

    if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
      return {
        success: false,
        error: 'Email recipient is required',
      };
    }

    if (!options.subject || !options.html) {
      return {
        success: false,
        error: 'Email subject and HTML content are required',
      };
    }

    // Prepare request payload
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

    // Send request to Resend API
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Resend API error: ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
}

// ============================================
// TEMPLATE-BASED EMAIL FUNCTIONS
// ============================================

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  apiKey: string,
  data: WelcomeEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getWelcomeEmail(data);

  return sendEmail(apiKey, {
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
  apiKey: string,
  to: string,
  data: PasswordResetEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getPasswordResetEmail(data);

  return sendEmail(apiKey, {
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
  apiKey: string,
  to: string,
  data: DocumentSharedEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getDocumentSharedEmail(data);

  return sendEmail(apiKey, {
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
  apiKey: string,
  to: string,
  data: SignatureRequestEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getSignatureRequestEmail(data);

  return sendEmail(apiKey, {
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
  apiKey: string,
  to: string,
  data: SignatureCompletedEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getSignatureCompletedEmail(data);

  return sendEmail(apiKey, {
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
  apiKey: string,
  to: string,
  data: DocumentReminderEmailData
): Promise<SendEmailResult> {
  const { subject, html, text } = getDocumentReminderEmail(data);

  return sendEmail(apiKey, {
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
 * Send emails to multiple recipients (sequentially to avoid rate limits)
 */
export async function sendBatchEmails(
  apiKey: string,
  emails: EmailOptions[]
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = [];

  for (const email of emails) {
    const result = await sendEmail(apiKey, email);
    results.push(result);

    // Add a small delay between emails to avoid rate limiting
    if (emails.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Send signature requests to multiple signers
 */
export async function sendSignatureRequestBatch(
  apiKey: string,
  requests: Array<{ email: string; data: SignatureRequestEmailData }>
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = [];

  for (const request of requests) {
    const result = await sendSignatureRequestEmail(apiKey, request.email, request.data);
    results.push(result);

    // Add a small delay between emails
    if (requests.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
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
