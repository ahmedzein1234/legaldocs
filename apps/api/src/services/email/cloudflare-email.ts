/**
 * Cloudflare Email Provider
 *
 * Sends emails using Cloudflare Email Workers (send_email binding).
 * Requires Email Routing to be enabled on the domain.
 *
 * @see https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/
 */

import type {
  EmailOptions,
  SendEmailResult,
  EmailBindings,
  EmailAddress,
} from './types.js';
import { DEFAULT_FROM_EMAIL, SENDER_DOMAIN } from './types.js';

// ============================================
// MIME MESSAGE BUILDER
// ============================================

/**
 * Build a MIME message string for email
 * This is a simple implementation - for complex emails, consider using mimetext library
 */
function buildMimeMessage(options: EmailOptions): string {
  const from = normalizeEmailAddress(options.from || DEFAULT_FROM_EMAIL);
  const to = normalizeRecipients(options.to);
  const subject = options.subject;
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;

  const headers = [
    `From: ${formatEmailHeader(from)}`,
    `To: ${to.map(formatEmailHeader).join(', ')}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36)}@${SENDER_DOMAIN}>`,
  ];

  // Add CC
  if (options.cc) {
    const cc = normalizeRecipients(options.cc);
    headers.push(`Cc: ${cc.map(formatEmailHeader).join(', ')}`);
  }

  // Add Reply-To
  if (options.replyTo) {
    const replyTo = normalizeEmailAddress(options.replyTo);
    headers.push(`Reply-To: ${formatEmailHeader(replyTo)}`);
  }

  // Add custom headers
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      headers.push(`${key}: ${value}`);
    }
  }

  // Build multipart message if both HTML and text
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
  if (options.html) {
    headers.push(`Content-Type: text/html; charset=UTF-8`);
    headers.push(`Content-Transfer-Encoding: base64`);
    return headers.join('\r\n') + '\r\n\r\n' + btoa(unescape(encodeURIComponent(options.html)));
  }

  // Text only
  headers.push(`Content-Type: text/plain; charset=UTF-8`);
  headers.push(`Content-Transfer-Encoding: base64`);
  return headers.join('\r\n') + '\r\n\r\n' + btoa(unescape(encodeURIComponent(options.text || '')));
}

/**
 * Normalize email input to EmailAddress
 */
function normalizeEmailAddress(input: string | EmailAddress): EmailAddress {
  if (typeof input === 'string') {
    // Parse "Name <email>" format
    const match = input.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    return { email: input };
  }
  return input;
}

/**
 * Normalize recipients to EmailAddress array
 */
function normalizeRecipients(
  input: string | string[] | EmailAddress | EmailAddress[]
): EmailAddress[] {
  if (Array.isArray(input)) {
    return input.map(normalizeEmailAddress);
  }
  return [normalizeEmailAddress(input)];
}

/**
 * Format email address for MIME header
 */
function formatEmailHeader(addr: EmailAddress): string {
  if (addr.name) {
    // Encode name if it contains non-ASCII characters
    const encodedName = /[^\x00-\x7F]/.test(addr.name)
      ? `=?UTF-8?B?${btoa(unescape(encodeURIComponent(addr.name)))}?=`
      : `"${addr.name.replace(/"/g, '\\"')}"`;
    return `${encodedName} <${addr.email}>`;
  }
  return addr.email;
}

/**
 * Get the first recipient email as string
 */
function getFirstRecipient(input: string | string[] | EmailAddress | EmailAddress[]): string {
  const recipients = normalizeRecipients(input);
  return recipients[0]?.email || '';
}

// ============================================
// CLOUDFLARE EMAIL SENDER
// ============================================

/**
 * Send email using Cloudflare Email Workers binding
 */
export async function sendWithCloudflare(
  env: EmailBindings,
  options: EmailOptions
): Promise<SendEmailResult> {
  const timestamp = new Date().toISOString();

  try {
    // Check for email binding
    const emailBinding = env.EMAIL || env.EMAIL_NOTIFICATIONS;

    if (!emailBinding) {
      return {
        success: false,
        provider: 'cloudflare',
        error: 'Cloudflare Email binding not configured. Enable send_email in wrangler.toml',
        timestamp,
      };
    }

    // Build MIME message
    const mimeMessage = buildMimeMessage(options);

    // Get sender and recipient
    const from = normalizeEmailAddress(options.from || DEFAULT_FROM_EMAIL);
    const to = getFirstRecipient(options.to);

    if (!to) {
      return {
        success: false,
        provider: 'cloudflare',
        error: 'No recipient specified',
        timestamp,
      };
    }

    // Validate sender domain
    if (!from.email.endsWith(`@${SENDER_DOMAIN}`)) {
      return {
        success: false,
        provider: 'cloudflare',
        error: `Sender must be from ${SENDER_DOMAIN} domain`,
        timestamp,
      };
    }

    // Create EmailMessage using dynamic import for cloudflare:email module
    // Note: In production, you'd use the actual cloudflare:email module
    const EmailMessage = await getEmailMessageClass();

    const message = new EmailMessage(from.email, to, mimeMessage);

    // Send via Cloudflare
    await emailBinding.send(message);

    return {
      success: true,
      provider: 'cloudflare',
      messageId: `cf_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      timestamp,
    };
  } catch (error) {
    console.error('Cloudflare email error:', error);
    return {
      success: false,
      provider: 'cloudflare',
      error: error instanceof Error ? error.message : 'Unknown error sending email via Cloudflare',
      timestamp,
    };
  }
}

/**
 * Check if Cloudflare Email is available
 */
export function isCloudflareEmailAvailable(env: EmailBindings): boolean {
  return !!(env.EMAIL || env.EMAIL_NOTIFICATIONS || env.EMAIL_SUPPORT);
}

/**
 * Get EmailMessage class from cloudflare:email module
 * This is a workaround for environments where the module isn't available
 */
async function getEmailMessageClass(): Promise<any> {
  try {
    // Dynamic import of cloudflare:email module
    const emailModule = await import('cloudflare:email');
    return emailModule.EmailMessage;
  } catch {
    // Fallback: create a compatible class
    return class EmailMessage {
      readonly from: string;
      readonly to: string;
      readonly raw: string;

      constructor(from: string, to: string, raw: string) {
        this.from = from;
        this.to = to;
        this.raw = raw;
      }
    };
  }
}

// ============================================
// BATCH SENDING
// ============================================

/**
 * Send multiple emails via Cloudflare (sequentially)
 */
export async function sendBatchWithCloudflare(
  env: EmailBindings,
  emails: EmailOptions[]
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = [];

  for (const email of emails) {
    const result = await sendWithCloudflare(env, email);
    results.push(result);

    // Small delay between emails to avoid rate limiting
    if (emails.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  return results;
}
