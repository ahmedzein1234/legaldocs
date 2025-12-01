import { Resend } from 'resend';

/**
 * ResendClient class for managing email operations
 * Wraps the Resend SDK with error handling and type safety
 */
export class ResendClient {
  private resend: Resend;
  private initialized: boolean = false;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.RESEND_API_KEY;

    if (!key) {
      console.warn('RESEND_API_KEY is not set. Email functionality will not work.');
      this.resend = new Resend('');
    } else {
      this.resend = new Resend(key);
      this.initialized = true;
    }
  }

  /**
   * Check if the client is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Send an email using the Resend API
   * @param options Email options including from, to, subject, and html/react content
   */
  async sendEmail(options: {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    react?: React.ReactElement;
    text?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
  }) {
    if (!this.initialized) {
      throw new Error('ResendClient is not initialized. Please provide a valid RESEND_API_KEY.');
    }

    try {
      const result = await this.resend.emails.send({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        react: options.react,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      });

      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   * @param emails Array of email options
   */
  async sendBulkEmails(emails: Array<{
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    react?: React.ReactElement;
    text?: string;
    replyTo?: string;
  }>) {
    if (!this.initialized) {
      throw new Error('ResendClient is not initialized. Please provide a valid RESEND_API_KEY.');
    }

    try {
      const results = await Promise.allSettled(
        emails.map(email => this.sendEmail(email))
      );

      return results;
    } catch (error) {
      console.error('Failed to send bulk emails:', error);
      throw error;
    }
  }

  /**
   * Get the underlying Resend instance for advanced usage
   */
  getResendInstance(): Resend {
    return this.resend;
  }
}

/**
 * Create a singleton instance of ResendClient
 */
let resendClient: ResendClient | null = null;

export function getResendClient(apiKey?: string): ResendClient {
  if (!resendClient) {
    resendClient = new ResendClient(apiKey);
  }
  return resendClient;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetResendClient(): void {
  resendClient = null;
}
