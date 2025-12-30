/**
 * Notifications Routes - Email and WhatsApp notifications
 *
 * Provides endpoints for sending various types of notifications
 * including signature requests, reminders, and document sharing.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, rateLimiters } from '../middleware/index.js';
import { Errors } from '../lib/errors.js';
import {
  sendSignatureRequestEmail,
  sendDocumentReminderEmail,
  sendDocumentSharedEmail,
  type SignatureRequestEmailData,
  type DocumentReminderEmailData,
  type DocumentSharedEmailData,
} from '../services/email/index.js';
import { getEmailLanguage } from '../lib/email.js';

// ============================================
// TYPES
// ============================================

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  RESEND_API_KEY?: string;
  // Cloudflare Email Workers binding (optional)
  EMAIL?: {
    send(message: any): Promise<void>;
  };
};

type Variables = {
  userId: string;
  userEmail: string;
  userRole: string;
};

const notifications = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const signatureRequestNotificationSchema = z.object({
  requestId: z.string(),
  signers: z.array(z.object({
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['signer', 'approver', 'witness', 'cc']),
    signingLink: z.string().url(),
    language: z.enum(['en', 'ar']).optional(),
  })),
  documentName: z.string(),
  documentType: z.string(),
  message: z.string().optional(),
  expiresAt: z.string(),
});

const reminderNotificationSchema = z.object({
  requestId: z.string(),
  signerIds: z.array(z.string()).optional(), // If not provided, send to all pending signers
});

const documentSharedNotificationSchema = z.object({
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string(),
    language: z.enum(['en', 'ar']).optional(),
  })),
  documentName: z.string(),
  documentType: z.string(),
  viewLink: z.string().url(),
  message: z.string().optional(),
});

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/notifications/send-signature-request
 * Send signature request notifications to signers
 */
notifications.post(
  '/send-signature-request',
  authMiddleware,
  rateLimiters.api,
  zValidator('json', signatureRequestNotificationSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');

    // Get sender information
    const sender = await c.env.DB
      .prepare('SELECT full_name, full_name_ar FROM users WHERE id = ?')
      .bind(userId)
      .first<{ full_name: string; full_name_ar: string | null }>();

    if (!sender) {
      return c.json(Errors.notFound('User').toJSON(), 404);
    }

    // Prepare and send emails to each signer
    // Uses Cloudflare Email Workers if available, falls back to Resend
    const results = await Promise.all(
      body.signers
        .filter(signer => signer.email)
        .map(async (signer) => {
          const language = signer.language || 'en';
          const senderName = language === 'ar' && sender.full_name_ar
            ? sender.full_name_ar
            : sender.full_name;

          const emailData: SignatureRequestEmailData = {
            signerName: signer.name,
            senderName,
            documentName: body.documentName,
            documentType: body.documentType,
            signingLink: signer.signingLink,
            message: body.message,
            expiresAt: body.expiresAt,
            role: signer.role,
            language,
          };

          return sendSignatureRequestEmail(c.env, signer.email, emailData);
        })
    );

    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Log to audit trail
    const errors = results
      .filter(r => !r.success)
      .map(r => r.error)
      .filter(Boolean);

    return c.json({
      success: true,
      data: {
        requestId: body.requestId,
        sent: successful,
        failed,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  }
);

/**
 * POST /api/notifications/send-reminder
 * Send reminder notifications to pending signers
 */
notifications.post(
  '/send-reminder',
  authMiddleware,
  rateLimiters.api,
  zValidator('json', reminderNotificationSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const cache = c.env.CACHE;

    // Get signature request from cache
    const cached = await cache.get(`signature:${body.requestId}`);
    if (!cached) {
      return c.json(Errors.notFound('Signature request').toJSON(), 404);
    }

    const request = JSON.parse(cached);

    // Verify ownership
    if (request.userId !== userId) {
      return c.json(Errors.forbidden().toJSON(), 403);
    }

    // Get sender information
    const sender = await c.env.DB
      .prepare('SELECT full_name, full_name_ar FROM users WHERE id = ?')
      .bind(userId)
      .first<{ full_name: string; full_name_ar: string | null }>();

    if (!sender) {
      return c.json(Errors.notFound('User').toJSON(), 404);
    }

    // Filter signers to remind
    const signersToRemind = request.signers.filter((signer: any) => {
      // Only remind pending or viewed signers
      if (signer.status !== 'pending' && signer.status !== 'viewed') {
        return false;
      }

      // If specific signers requested, only include those
      if (body.signerIds && body.signerIds.length > 0) {
        return body.signerIds.includes(signer.id);
      }

      return true;
    });

    if (signersToRemind.length === 0) {
      return c.json(
        Errors.badRequest('No pending signers to remind').toJSON(),
        400
      );
    }

    // Send reminder emails
    // Uses Cloudflare Email Workers if available, falls back to Resend
    const results = await Promise.all(
      signersToRemind
        .filter((signer: any) => signer.email)
        .map(async (signer: any) => {
          const language = getEmailLanguage(signer.language);
          const baseUrl = 'https://www.qannoni.com';

          const emailData: DocumentReminderEmailData = {
            signerName: signer.name,
            documentName: request.documentName,
            signingLink: `${baseUrl}/en/sign/${signer.signingToken}`,
            expiresAt: request.expiresAt,
            language,
          };

          return sendDocumentReminderEmail(c.env, signer.email, emailData);
        })
    );

    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Update audit trail
    request.auditTrail.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: 'reminder_sent',
      actorId: userId,
      details: `Reminder sent to ${successful} signers`,
    });

    request.updatedAt = new Date().toISOString();

    // Save updated request
    await cache.put(`signature:${body.requestId}`, JSON.stringify(request), {
      expirationTtl: Math.max(
        1,
        Math.floor((new Date(request.expiresAt).getTime() - Date.now()) / 1000) + 86400
      ),
    });

    return c.json({
      success: true,
      data: {
        requestId: body.requestId,
        remindersSent: successful,
        failed,
        signers: signersToRemind.map((s: any) => s.name),
      },
    });
  }
);

/**
 * POST /api/notifications/send-document-shared
 * Send document shared notifications
 */
notifications.post(
  '/send-document-shared',
  authMiddleware,
  rateLimiters.api,
  zValidator('json', documentSharedNotificationSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');

    // Get sender information
    const sender = await c.env.DB
      .prepare('SELECT full_name, full_name_ar FROM users WHERE id = ?')
      .bind(userId)
      .first<{ full_name: string; full_name_ar: string | null }>();

    if (!sender) {
      return c.json(Errors.notFound('User').toJSON(), 404);
    }

    // Send emails to all recipients
    // Uses Cloudflare Email Workers if available, falls back to Resend
    const results = await Promise.all(
      body.recipients.map(async (recipient) => {
        const language = recipient.language || 'en';
        const senderName = language === 'ar' && sender.full_name_ar
          ? sender.full_name_ar
          : sender.full_name;

        const emailData: DocumentSharedEmailData = {
          recipientName: recipient.name,
          senderName,
          documentName: body.documentName,
          documentType: body.documentType,
          viewLink: body.viewLink,
          message: body.message,
          language,
        };

        return sendDocumentSharedEmail(c.env, recipient.email, emailData);
      })
    );

    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    const errors = results
      .filter(r => !r.success)
      .map(r => r.error)
      .filter(Boolean);

    return c.json({
      success: true,
      data: {
        sent: successful,
        failed,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  }
);

/**
 * GET /api/notifications/test
 * Test endpoint to verify email configuration
 */
notifications.get('/test', authMiddleware, async (c) => {
  const hasCloudflare = !!c.env.EMAIL;
  const hasResend = !!c.env.RESEND_API_KEY;

  if (!hasCloudflare && !hasResend) {
    return c.json(
      {
        success: false,
        error: 'No email provider configured. Set up Cloudflare Email or RESEND_API_KEY.',
      },
      500
    );
  }

  // Determine active provider (Cloudflare preferred if available)
  const provider = hasCloudflare ? 'Cloudflare Email Workers' : 'Resend';
  const fallback = hasCloudflare && hasResend ? 'Resend (fallback)' : null;

  return c.json({
    success: true,
    data: {
      message: 'Email service is configured',
      provider,
      fallback,
      cloudflareAvailable: hasCloudflare,
      resendAvailable: hasResend,
    },
  });
});

export { notifications };
