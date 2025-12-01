import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/index.js';
import { Errors } from '../lib/errors.js';
import {
  createWhatsAppService,
  isWhatsAppConfigured,
  isValidPhoneNumber,
} from '../lib/whatsapp.js';
import {
  getWhatsAppMessage,
  type SignatureRequestData,
  type SignatureReminderData,
  type SignatureCompletedData,
} from '../lib/whatsapp-templates.js';
import { Language } from '../lib/error-messages.js';

// Types for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  RESEND_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_FROM: string;
  APP_URL: string;
};

type Variables = {
  userId: string;
  userRole: string;
};

const signatures = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const signatureRequestSchema = z.object({
  documentId: z.string(),
  documentName: z.string(),
  documentType: z.string(),
  title: z.string(),
  message: z.string().optional(),
  signers: z.array(z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(['signer', 'approver', 'witness', 'cc']),
    deliveryMethod: z.enum(['email', 'whatsapp', 'both']),
  })),
  signingOrder: z.enum(['sequential', 'parallel']).default('sequential'),
  expiresInDays: z.number().min(1).max(90).default(30),
  reminderFrequency: z.enum(['none', 'daily', 'weekly']).default('none'),
  allowDecline: z.boolean().default(true),
  requireVerification: z.boolean().default(false),
});

const submitSignatureSchema = z.object({
  signatureType: z.enum(['draw', 'type', 'upload']),
  signatureData: z.string(),
  verificationCode: z.string().optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateSigningToken(requestId: string, index: number): string {
  // Use base64url encoding for URL-safe tokens
  const data = `${requestId}:${index}:${Date.now()}`;
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function decodeSigningToken(token: string): { requestId: string; signerIndex: number } | null {
  try {
    // Restore base64 padding
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(padded);
    const parts = decoded.split(':');
    return {
      requestId: parts[0],
      signerIndex: parseInt(parts[1], 10),
    };
  } catch {
    return null;
  }
}

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/signatures/request
 * Create a signature request
 */
signatures.post('/request', authMiddleware, zValidator('json', signatureRequestSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const cache = c.env.CACHE;

  // Validate signers have required contact info
  for (const signer of body.signers) {
    if (signer.role !== 'cc') {
      if (signer.deliveryMethod === 'email' && !signer.email) {
        return c.json(Errors.badRequest(`Email required for ${signer.name}`).toJSON(), 400);
      }
      if (signer.deliveryMethod === 'whatsapp' && !signer.phone) {
        return c.json(Errors.badRequest(`Phone required for ${signer.name}`).toJSON(), 400);
      }
      if (signer.deliveryMethod === 'both' && (!signer.email || !signer.phone)) {
        return c.json(Errors.badRequest(`Both email and phone required for ${signer.name}`).toJSON(), 400);
      }
    }
  }

  const requestId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  const expiresAt = new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000);

  // Create signers with unique IDs and tokens
  const signers = body.signers.map((s, index) => ({
    id: `signer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: s.role,
    order: index + 1,
    status: s.role === 'cc' ? 'signed' : 'pending',
    deliveryMethod: s.deliveryMethod,
    signingToken: generateSigningToken(requestId, index),
  }));

  const signatureRequest = {
    id: requestId,
    userId,
    documentId: body.documentId,
    documentName: body.documentName,
    documentType: body.documentType,
    title: body.title,
    message: body.message,
    signers,
    currentSignerIndex: 0,
    signingOrder: body.signingOrder,
    expiresAt: expiresAt.toISOString(),
    reminderFrequency: body.reminderFrequency,
    allowDecline: body.allowDecline,
    requireVerification: body.requireVerification,
    status: 'pending',
    auditTrail: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: 'request_created',
        actorId: userId,
        details: `Signature request created for ${body.documentName}`,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Store in KV cache
  await cache.put(`signature:${requestId}`, JSON.stringify(signatureRequest), {
    expirationTtl: body.expiresInDays * 24 * 60 * 60 + 86400,
  });

  // Generate signing URLs
  const baseUrl = c.env.APP_URL || 'https://www.qannoni.com';
  const signingUrls = signers
    .filter(s => s.role !== 'cc')
    .map(s => ({
      signerId: s.id,
      name: s.name,
      signingUrl: `${baseUrl}/en/sign/${s.signingToken}`,
      deliveryMethod: s.deliveryMethod,
      email: s.email,
      phone: s.phone,
    }));

  // Send signature request notifications via WhatsApp
  const notificationResults: { name: string; method: string; success: boolean; error?: string }[] = [];

  if (isWhatsAppConfigured(c.env)) {
    const whatsapp = createWhatsAppService(c.env);

    // Get sender info
    let senderName = 'LegalDocs User';
    try {
      const user = await c.env.DB.prepare(
        'SELECT full_name FROM users WHERE id = ?'
      ).bind(userId).first<{ full_name: string }>();
      if (user?.full_name) {
        senderName = user.full_name;
      }
    } catch (error) {
      console.error('Failed to get user name:', error);
    }

    for (const signer of signingUrls) {
      if (
        (signer.deliveryMethod === 'whatsapp' || signer.deliveryMethod === 'both') &&
        signer.phone &&
        isValidPhoneNumber(signer.phone)
      ) {
        const message = getWhatsAppMessage('signature_request', 'en' as Language, {
          signerName: signer.name,
          documentName: body.documentName,
          senderName,
          signingUrl: signer.signingUrl,
          expiresIn: `${body.expiresInDays} days`,
        } as SignatureRequestData);

        const result = await whatsapp.sendMessage(signer.phone, message);
        notificationResults.push({
          name: signer.name,
          method: 'whatsapp',
          success: result.success,
          error: result.error,
        });

        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  return c.json({
    success: true,
    data: {
      requestId,
      status: 'pending',
      signers: signingUrls,
      expiresAt: expiresAt.toISOString(),
      notificationsSent: notificationResults,
    },
  }, 201);
});

/**
 * GET /api/signatures/:requestId
 * Get signature request status
 */
signatures.get('/:requestId', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { requestId } = c.req.param();
  const cache = c.env.CACHE;

  const cached = await cache.get(`signature:${requestId}`);
  if (!cached) {
    return c.json(Errors.notFound('Signature request').toJSON(), 404);
  }

  const request = JSON.parse(cached);
  if (request.userId !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  return c.json({ success: true, data: request });
});

/**
 * GET /api/signatures
 * List user's signature requests
 */
signatures.get('/', authMiddleware, async (c) => {
  // Note: KV doesn't support listing efficiently
  // In production, store metadata in D1
  return c.json({
    success: true,
    data: {
      requests: [],
      message: 'Signature request listing requires database storage',
    },
  });
});

/**
 * POST /api/signatures/:requestId/cancel
 * Cancel a signature request
 */
signatures.post('/:requestId/cancel', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { requestId } = c.req.param();
  const cache = c.env.CACHE;

  const cached = await cache.get(`signature:${requestId}`);
  if (!cached) {
    return c.json(Errors.notFound('Signature request').toJSON(), 404);
  }

  const request = JSON.parse(cached);
  if (request.userId !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  if (request.status === 'completed') {
    return c.json(Errors.badRequest('Cannot cancel a completed signature request').toJSON(), 400);
  }

  request.status = 'cancelled';
  request.updatedAt = new Date().toISOString();
  request.auditTrail.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'request_cancelled',
    actorId: userId,
    details: 'Signature request cancelled by owner',
  });

  await cache.put(`signature:${requestId}`, JSON.stringify(request), {
    expirationTtl: 86400, // Keep for 1 day after cancellation
  });

  return c.json({ success: true, data: { message: 'Signature request cancelled' } });
});

/**
 * POST /api/signatures/:requestId/remind
 * Send reminder to pending signers
 */
signatures.post('/:requestId/remind', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { requestId } = c.req.param();
  const cache = c.env.CACHE;

  const cached = await cache.get(`signature:${requestId}`);
  if (!cached) {
    return c.json(Errors.notFound('Signature request').toJSON(), 404);
  }

  const request = JSON.parse(cached);
  if (request.userId !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Send actual reminders via email/WhatsApp
  const pendingSigners = request.signers.filter(
    (s: any) => s.status === 'pending' || s.status === 'viewed'
  );

  const baseUrl = c.env.APP_URL || 'https://www.qannoni.com';
  const daysRemaining = Math.ceil(
    (new Date(request.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const reminderResults: { name: string; method: string; success: boolean; error?: string }[] = [];

  // Send WhatsApp reminders
  if (isWhatsAppConfigured(c.env)) {
    const whatsapp = createWhatsAppService(c.env);

    for (const signer of pendingSigners) {
      if (
        (signer.deliveryMethod === 'whatsapp' || signer.deliveryMethod === 'both') &&
        signer.phone &&
        isValidPhoneNumber(signer.phone)
      ) {
        const signingUrl = `${baseUrl}/en/sign/${signer.signingToken}`;
        const message = getWhatsAppMessage('signature_reminder', 'en' as Language, {
          signerName: signer.name,
          documentName: request.documentName,
          daysRemaining,
          signingUrl,
        } as SignatureReminderData);

        const result = await whatsapp.sendMessage(signer.phone, message);
        reminderResults.push({
          name: signer.name,
          method: 'whatsapp',
          success: result.success,
          error: result.error,
        });
      }
    }
  }

  // TODO: Also send email reminders for email/both delivery methods

  request.auditTrail.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'reminder_sent',
    actorId: userId,
    details: `Reminder sent to ${pendingSigners.length} signers`,
  });

  await cache.put(`signature:${requestId}`, JSON.stringify(request), {
    expirationTtl: Math.max(1, Math.floor((new Date(request.expiresAt).getTime() - Date.now()) / 1000) + 86400),
  });

  return c.json({
    success: true,
    data: {
      message: `Reminder sent to ${pendingSigners.length} pending signers`,
      pendingSigners: pendingSigners.map((s: any) => s.name),
      deliveryResults: reminderResults,
    },
  });
});

// ============================================
// PUBLIC SIGNING ROUTES
// ============================================

/**
 * GET /api/sign/:token
 * Get document for signing (public route)
 */
signatures.get('/public/:token', async (c) => {
  const { token } = c.req.param();
  const cache = c.env.CACHE;

  const decoded = decodeSigningToken(token);
  if (!decoded) {
    return c.json(Errors.badRequest('Invalid signing link').toJSON(), 400);
  }

  const { requestId, signerIndex } = decoded;

  const cached = await cache.get(`signature:${requestId}`);
  if (!cached) {
    return c.json(Errors.notFound('Signature request not found or expired').toJSON(), 404);
  }

  const request = JSON.parse(cached);

  // Check if expired
  if (new Date(request.expiresAt) < new Date()) {
    return c.json(
      { success: false, error: { code: 'EXPIRED', message: 'Signature request has expired' } },
      410
    );
  }

  const signer = request.signers[signerIndex];
  if (!signer) {
    return c.json(Errors.notFound('Signer').toJSON(), 404);
  }

  if (signer.status === 'signed') {
    return c.json(
      { success: false, error: { code: 'ALREADY_SIGNED', message: 'Document already signed' } },
      400
    );
  }

  // Check signing order
  if (request.signingOrder === 'sequential' && signerIndex !== request.currentSignerIndex) {
    return c.json(
      { success: false, error: { code: 'NOT_YOUR_TURN', message: 'Please wait for previous signers' } },
      400
    );
  }

  // Update to viewed status
  if (signer.status === 'pending') {
    signer.status = 'viewed';
    signer.viewedAt = new Date().toISOString();
    request.auditTrail.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: 'document_viewed',
      actorId: signer.id,
      actorName: signer.name,
      details: `${signer.name} viewed the document`,
    });
    request.updatedAt = new Date().toISOString();

    await cache.put(`signature:${requestId}`, JSON.stringify(request), {
      expirationTtl: Math.max(1, Math.floor((new Date(request.expiresAt).getTime() - Date.now()) / 1000) + 86400),
    });
  }

  return c.json({
    success: true,
    data: {
      requestId,
      documentName: request.documentName,
      documentType: request.documentType,
      title: request.title,
      message: request.message,
      signer: {
        id: signer.id,
        name: signer.name,
        role: signer.role,
        status: signer.status,
      },
      requireVerification: request.requireVerification,
      allowDecline: request.allowDecline,
      expiresAt: request.expiresAt,
    },
  });
});

/**
 * POST /api/sign/:token
 * Submit signature (public route)
 */
signatures.post('/public/:token', zValidator('json', submitSignatureSchema), async (c) => {
  const { token } = c.req.param();
  const body = c.req.valid('json');
  const cache = c.env.CACHE;

  const decoded = decodeSigningToken(token);
  if (!decoded) {
    return c.json(Errors.badRequest('Invalid signing link').toJSON(), 400);
  }

  const { requestId, signerIndex } = decoded;

  const cached = await cache.get(`signature:${requestId}`);
  if (!cached) {
    return c.json(Errors.notFound('Signature request not found or expired').toJSON(), 404);
  }

  const request = JSON.parse(cached);

  // Check if expired
  if (new Date(request.expiresAt) < new Date()) {
    return c.json(
      { success: false, error: { code: 'EXPIRED', message: 'Signature request has expired' } },
      410
    );
  }

  const signer = request.signers[signerIndex];
  if (!signer) {
    return c.json(Errors.notFound('Signer').toJSON(), 404);
  }

  if (signer.status === 'signed') {
    return c.json(
      { success: false, error: { code: 'ALREADY_SIGNED', message: 'Document already signed' } },
      400
    );
  }

  // Check signing order
  if (request.signingOrder === 'sequential' && signerIndex !== request.currentSignerIndex) {
    return c.json(
      { success: false, error: { code: 'NOT_YOUR_TURN', message: 'Please wait for previous signers' } },
      400
    );
  }

  // Update signer status
  signer.status = 'signed';
  signer.signedAt = new Date().toISOString();
  signer.signatureType = body.signatureType;
  signer.signatureData = body.signatureData;
  signer.ipAddress = c.req.header('CF-Connecting-IP') || 'unknown';

  request.auditTrail.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'document_signed',
    actorId: signer.id,
    actorName: signer.name,
    details: `${signer.name} signed the document using ${body.signatureType}`,
    ipAddress: signer.ipAddress,
  });

  // Move to next signer if sequential
  if (request.signingOrder === 'sequential') {
    request.currentSignerIndex++;
  }

  // Check if all signed
  const allSigned = request.signers
    .filter((s: any) => s.role !== 'cc')
    .every((s: any) => s.status === 'signed');

  if (allSigned) {
    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.auditTrail.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: 'signing_completed',
      details: 'All parties have signed the document',
    });
  }

  request.updatedAt = new Date().toISOString();

  await cache.put(`signature:${requestId}`, JSON.stringify(request), {
    expirationTtl: Math.max(1, Math.floor((new Date(request.expiresAt).getTime() - Date.now()) / 1000) + 86400),
  });

  return c.json({
    success: true,
    data: {
      message: 'Signature submitted successfully',
      status: request.status,
      allSigned,
    },
  });
});

/**
 * POST /api/sign/:token/decline
 * Decline to sign (public route)
 */
signatures.post('/public/:token/decline', zValidator('json', z.object({ reason: z.string().optional() })), async (c) => {
  const { token } = c.req.param();
  const body = c.req.valid('json');
  const cache = c.env.CACHE;

  const decoded = decodeSigningToken(token);
  if (!decoded) {
    return c.json(Errors.badRequest('Invalid signing link').toJSON(), 400);
  }

  const { requestId, signerIndex } = decoded;

  const cached = await cache.get(`signature:${requestId}`);
  if (!cached) {
    return c.json(Errors.notFound('Signature request not found or expired').toJSON(), 404);
  }

  const request = JSON.parse(cached);

  if (!request.allowDecline) {
    return c.json(Errors.badRequest('Declining is not allowed for this document').toJSON(), 400);
  }

  const signer = request.signers[signerIndex];
  if (!signer) {
    return c.json(Errors.notFound('Signer').toJSON(), 404);
  }

  signer.status = 'declined';
  signer.declinedAt = new Date().toISOString();
  signer.declineReason = body.reason;

  request.status = 'declined';
  request.updatedAt = new Date().toISOString();

  request.auditTrail.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'signing_declined',
    actorId: signer.id,
    actorName: signer.name,
    details: `${signer.name} declined to sign${body.reason ? `: ${body.reason}` : ''}`,
  });

  await cache.put(`signature:${requestId}`, JSON.stringify(request), {
    expirationTtl: 86400 * 7, // Keep for 7 days after decline
  });

  return c.json({
    success: true,
    data: { message: 'Signature declined' },
  });
});

export { signatures };
