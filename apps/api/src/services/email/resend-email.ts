/**
 * Resend Email Provider (Fallback)
 *
 * Sends emails using Resend API as a fallback when Cloudflare Email
 * is not available or configured.
 *
 * @see https://resend.com/docs
 */

import type {
  EmailOptions,
  SendEmailResult,
  EmailBindings,
  EmailAddress,
} from './types.js';
import { DEFAULT_FROM_EMAIL, DEFAULT_REPLY_TO } from './types.js';

// ============================================
// CONSTANTS
// ============================================

const RESEND_API_URL = 'https://api.resend.com/emails';

// ============================================
// HELPERS
// ============================================

/**
 * Normalize email input to string array
 */
function normalizeToArray(
  input: string | string[] | EmailAddress | EmailAddress[] | undefined
): string[] | undefined {
  if (!input) return undefined;

  if (Array.isArray(input)) {
    return input.map((item) =>
      typeof item === 'string' ? item : item.name ? `${item.name} <${item.email}>` : item.email
    );
  }

  if (typeof input === 'string') {
    return [input];
  }

  return [input.name ? `${input.name} <${input.email}>` : input.email];
}

/**
 * Format from address
 */
function formatFrom(input: string | EmailAddress | undefined): string {
  if (!input) return DEFAULT_FROM_EMAIL;

  if (typeof input === 'string') return input;

  return input.name ? `${input.name} <${input.email}>` : input.email;
}

/**
 * Format reply-to address
 */
function formatReplyTo(input: string | EmailAddress | undefined): string {
  if (!input) return DEFAULT_REPLY_TO;

  if (typeof input === 'string') return input;

  return input.email;
}

// ============================================
// RESEND EMAIL SENDER
// ============================================

/**
 * Send email using Resend API
 */
export async function sendWithResend(
  env: EmailBindings,
  options: EmailOptions
): Promise<SendEmailResult> {
  const timestamp = new Date().toISOString();

  try {
    const apiKey = env.RESEND_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        provider: 'resend',
        error: 'RESEND_API_KEY is not configured',
        timestamp,
      };
    }

    // Validate required fields
    const to = normalizeToArray(options.to);
    if (!to || to.length === 0) {
      return {
        success: false,
        provider: 'resend',
        error: 'Email recipient is required',
        timestamp,
      };
    }

    if (!options.subject || !options.html) {
      return {
        success: false,
        provider: 'resend',
        error: 'Email subject and HTML content are required',
        timestamp,
      };
    }

    // Build request payload
    const payload: Record<string, any> = {
      from: formatFrom(options.from),
      to,
      subject: options.subject,
      html: options.html,
      reply_to: formatReplyTo(options.replyTo),
    };

    // Optional fields
    if (options.text) {
      payload.text = options.text;
    }

    const cc = normalizeToArray(options.cc);
    if (cc && cc.length > 0) {
      payload.cc = cc;
    }

    const bcc = normalizeToArray(options.bcc);
    if (bcc && bcc.length > 0) {
      payload.bcc = bcc;
    }

    if (options.headers) {
      payload.headers = options.headers;
    }

    if (options.tags && options.tags.length > 0) {
      payload.tags = options.tags.map((tag) => ({ name: tag, value: 'true' }));
    }

    // Send request to Resend API
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
        error: data.message || data.error?.message || `Resend API error: ${response.status}`,
        timestamp,
      };
    }

    return {
      success: true,
      provider: 'resend',
      messageId: data.id,
      timestamp,
    };
  } catch (error) {
    console.error('Resend email error:', error);
    return {
      success: false,
      provider: 'resend',
      error: error instanceof Error ? error.message : 'Unknown error sending email via Resend',
      timestamp,
    };
  }
}

/**
 * Check if Resend is available
 */
export function isResendAvailable(env: EmailBindings): boolean {
  return !!env.RESEND_API_KEY;
}

// ============================================
// BATCH SENDING
// ============================================

/**
 * Send multiple emails via Resend (sequentially)
 */
export async function sendBatchWithResend(
  env: EmailBindings,
  emails: EmailOptions[]
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = [];

  for (const email of emails) {
    const result = await sendWithResend(env, email);
    results.push(result);

    // Small delay between emails to avoid rate limiting
    if (emails.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Send batch using Resend's batch API (up to 100 emails)
 */
export async function sendBatchWithResendAPI(
  env: EmailBindings,
  emails: EmailOptions[]
): Promise<SendEmailResult[]> {
  const timestamp = new Date().toISOString();
  const apiKey = env.RESEND_API_KEY;

  if (!apiKey) {
    return emails.map(() => ({
      success: false,
      provider: 'resend' as const,
      error: 'RESEND_API_KEY is not configured',
      timestamp,
    }));
  }

  // Resend batch API only supports up to 100 emails
  if (emails.length > 100) {
    // Split into chunks and process sequentially
    const results: SendEmailResult[] = [];
    for (let i = 0; i < emails.length; i += 100) {
      const chunk = emails.slice(i, i + 100);
      const chunkResults = await sendBatchWithResendAPI(env, chunk);
      results.push(...chunkResults);
    }
    return results;
  }

  try {
    const payload = emails.map((email) => ({
      from: formatFrom(email.from),
      to: normalizeToArray(email.to),
      subject: email.subject,
      html: email.html,
      text: email.text,
      reply_to: formatReplyTo(email.replyTo),
      cc: normalizeToArray(email.cc),
      bcc: normalizeToArray(email.bcc),
    }));

    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      return emails.map(() => ({
        success: false,
        provider: 'resend' as const,
        error: data.message || `Resend batch API error: ${response.status}`,
        timestamp,
      }));
    }

    // Map response to results
    return (data.data || []).map((item: any, index: number) => ({
      success: !!item.id,
      provider: 'resend' as const,
      messageId: item.id,
      error: item.error,
      timestamp,
    }));
  } catch (error) {
    console.error('Resend batch email error:', error);
    return emails.map(() => ({
      success: false,
      provider: 'resend' as const,
      error: error instanceof Error ? error.message : 'Unknown batch error',
      timestamp,
    }));
  }
}
