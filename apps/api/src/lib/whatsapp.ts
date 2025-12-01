/**
 * WhatsApp/Twilio Integration Service
 * Handles sending WhatsApp messages via Twilio API
 */

import { Language } from './error-messages.js';

// Twilio API base URL
const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

// Message status types
export type WhatsAppMessageStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'undelivered';

// Message direction
export type MessageDirection = 'inbound' | 'outbound';

// Message types
export type WhatsAppMessageType =
  | 'text'
  | 'template'
  | 'media'
  | 'interactive'
  | 'location';

// Template message parameters
export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
}

// WhatsApp message payload
export interface WhatsAppMessage {
  to: string;
  body?: string;
  mediaUrl?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParameters?: TemplateParameter[];
}

// Twilio response types
export interface TwilioMessageResponse {
  sid: string;
  status: WhatsAppMessageStatus;
  to: string;
  from: string;
  body: string;
  date_created: string;
  date_sent: string | null;
  error_code: string | null;
  error_message: string | null;
}

// WhatsApp service configuration
export interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string; // Format: whatsapp:+14155238886
}

// Send result
export interface SendResult {
  success: boolean;
  messageSid?: string;
  status?: WhatsAppMessageStatus;
  error?: string;
  errorCode?: string;
}

/**
 * Format phone number to E.164 format for WhatsApp
 * @param phone - Phone number in various formats
 * @param defaultCountryCode - Default country code (UAE: 971)
 */
export function formatPhoneForWhatsApp(phone: string, defaultCountryCode: string = '971'): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If starts with +, remove it for processing
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 00, remove it
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // If starts with 0 (local number), add country code
  if (cleaned.startsWith('0')) {
    cleaned = defaultCountryCode + cleaned.substring(1);
  }

  // If doesn't start with country code, add it
  if (!cleaned.startsWith(defaultCountryCode) && cleaned.length <= 10) {
    cleaned = defaultCountryCode + cleaned;
  }

  // Return in WhatsApp format
  return `whatsapp:+${cleaned}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[^\d]/g, '');
  // Phone should be between 8 and 15 digits
  return cleaned.length >= 8 && cleaned.length <= 15;
}

/**
 * WhatsApp Service Class
 */
export class WhatsAppService {
  private config: WhatsAppConfig;
  private apiBase: string;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    this.apiBase = `${TWILIO_API_BASE}/Accounts/${config.accountSid}`;
  }

  /**
   * Get Basic Auth header for Twilio API
   */
  private getAuthHeader(): string {
    const credentials = btoa(`${this.config.accountSid}:${this.config.authToken}`);
    return `Basic ${credentials}`;
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendMessage(to: string, body: string): Promise<SendResult> {
    try {
      const formattedTo = formatPhoneForWhatsApp(to);

      const formData = new URLSearchParams();
      formData.append('To', formattedTo);
      formData.append('From', this.config.fromNumber);
      formData.append('Body', body);

      const response = await fetch(`${this.apiBase}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json() as TwilioMessageResponse;

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || 'Failed to send WhatsApp message',
          errorCode: data.error_code || undefined,
        };
      }

      return {
        success: true,
        messageSid: data.sid,
        status: data.status,
      };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a media message via WhatsApp
   */
  async sendMediaMessage(to: string, mediaUrl: string, caption?: string): Promise<SendResult> {
    try {
      const formattedTo = formatPhoneForWhatsApp(to);

      const formData = new URLSearchParams();
      formData.append('To', formattedTo);
      formData.append('From', this.config.fromNumber);
      formData.append('MediaUrl', mediaUrl);
      if (caption) {
        formData.append('Body', caption);
      }

      const response = await fetch(`${this.apiBase}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json() as TwilioMessageResponse;

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || 'Failed to send media message',
          errorCode: data.error_code || undefined,
        };
      }

      return {
        success: true,
        messageSid: data.sid,
        status: data.status,
      };
    } catch (error) {
      console.error('WhatsApp media send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a template message via WhatsApp
   * Templates must be pre-approved by WhatsApp Business
   */
  async sendTemplateMessage(
    to: string,
    templateSid: string,
    variables?: Record<string, string>
  ): Promise<SendResult> {
    try {
      const formattedTo = formatPhoneForWhatsApp(to);

      const formData = new URLSearchParams();
      formData.append('To', formattedTo);
      formData.append('From', this.config.fromNumber);
      formData.append('ContentSid', templateSid);

      if (variables) {
        formData.append('ContentVariables', JSON.stringify(variables));
      }

      const response = await fetch(`${this.apiBase}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json() as TwilioMessageResponse;

      if (!response.ok) {
        return {
          success: false,
          error: data.error_message || 'Failed to send template message',
          errorCode: data.error_code || undefined,
        };
      }

      return {
        success: true,
        messageSid: data.sid,
        status: data.status,
      };
    } catch (error) {
      console.error('WhatsApp template send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get message status from Twilio
   */
  async getMessageStatus(messageSid: string): Promise<WhatsAppMessageStatus | null> {
    try {
      const response = await fetch(`${this.apiBase}/Messages/${messageSid}.json`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        console.error('Failed to get message status:', response.status);
        return null;
      }

      const data = await response.json() as TwilioMessageResponse;
      return data.status;
    } catch (error) {
      console.error('Error getting message status:', error);
      return null;
    }
  }

  /**
   * Verify Twilio webhook signature
   * This prevents webhook spoofing attacks
   */
  static async verifyWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, string>,
    authToken: string
  ): Promise<boolean> {
    try {
      // Sort parameters and create validation string
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}${params[key]}`)
        .join('');

      const data = url + sortedParams;

      // Create HMAC-SHA1 signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(authToken),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(data)
      );

      // Convert to base64
      const computedSignature = btoa(
        String.fromCharCode(...new Uint8Array(signatureBuffer))
      );

      return signature === computedSignature;
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }
}

/**
 * Create WhatsApp service instance from environment
 */
export function createWhatsAppService(env: {
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_FROM: string;
}): WhatsAppService {
  return new WhatsAppService({
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    fromNumber: env.TWILIO_WHATSAPP_FROM,
  });
}

/**
 * Check if WhatsApp is configured
 */
export function isWhatsAppConfigured(env: {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_WHATSAPP_FROM?: string;
}): boolean {
  return !!(
    env.TWILIO_ACCOUNT_SID &&
    env.TWILIO_AUTH_TOKEN &&
    env.TWILIO_WHATSAPP_FROM
  );
}
