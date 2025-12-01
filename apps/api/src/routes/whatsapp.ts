/**
 * WhatsApp API Routes
 * Handles WhatsApp messaging, webhooks, and session management
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware, requireRole } from '../middleware/auth.js';
import { Errors } from '../lib/errors.js';
import {
  WhatsAppService,
  createWhatsAppService,
  isWhatsAppConfigured,
  formatPhoneForWhatsApp,
  isValidPhoneNumber,
  type WhatsAppMessageStatus,
} from '../lib/whatsapp.js';
import {
  getWhatsAppMessage,
  type WhatsAppTemplateType,
  type SignatureRequestData,
  type SignatureReminderData,
  type DocumentSharedData,
  type WelcomeData,
  type OTPData,
} from '../lib/whatsapp-templates.js';
import { Language } from '../lib/error-messages.js';

// Environment bindings
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_FROM: string;
  APP_URL: string;
};

const whatsappRoutes = new Hono<{ Bindings: Bindings }>();

// Validation schemas
const sendMessageSchema = z.object({
  to: z.string().min(8, 'Phone number required'),
  message: z.string().min(1, 'Message required').max(4096, 'Message too long'),
  language: z.enum(['en', 'ar', 'ur']).optional().default('en'),
});

const sendTemplateSchema = z.object({
  to: z.string().min(8, 'Phone number required'),
  templateType: z.enum([
    'signature_request',
    'signature_reminder',
    'signature_completed',
    'document_shared',
    'document_approved',
    'document_rejected',
    'payment_reminder',
    'welcome',
    'otp_verification',
    'case_update',
    'consultation_scheduled',
    'consultation_reminder',
  ]),
  language: z.enum(['en', 'ar', 'ur']).optional().default('en'),
  data: z.record(z.any()),
});

const bulkSendSchema = z.object({
  recipients: z.array(z.object({
    phone: z.string().min(8),
    name: z.string().optional(),
    language: z.enum(['en', 'ar', 'ur']).optional().default('en'),
  })).min(1).max(100),
  templateType: z.enum([
    'signature_request',
    'signature_reminder',
    'signature_completed',
    'document_shared',
    'document_approved',
    'document_rejected',
    'payment_reminder',
    'welcome',
    'otp_verification',
    'case_update',
    'consultation_scheduled',
    'consultation_reminder',
  ]),
  data: z.record(z.any()),
});

/**
 * Check WhatsApp configuration status
 */
whatsappRoutes.get('/status', async (c) => {
  const configured = isWhatsAppConfigured(c.env);

  return c.json({
    success: true,
    data: {
      configured,
      provider: 'twilio',
      features: {
        sendText: configured,
        sendMedia: configured,
        sendTemplates: configured,
        receiveWebhooks: configured,
        sessionManagement: configured,
      },
    },
  });
});

/**
 * Send a direct WhatsApp message (authenticated)
 */
whatsappRoutes.post('/send', authMiddleware, async (c) => {
  const language = c.get('language') || 'en';

  if (!isWhatsAppConfigured(c.env)) {
    return c.json(Errors.serviceUnavailable('WhatsApp not configured', language).toJSON(), 503);
  }

  const body = await c.req.json();
  const validation = sendMessageSchema.safeParse(body);

  if (!validation.success) {
    return c.json(Errors.badRequest(validation.error.errors[0].message, language).toJSON(), 400);
  }

  const { to, message } = validation.data;

  if (!isValidPhoneNumber(to)) {
    return c.json(Errors.badRequest('Invalid phone number format', language).toJSON(), 400);
  }

  const whatsapp = createWhatsAppService(c.env);
  const result = await whatsapp.sendMessage(to, message);

  if (!result.success) {
    console.error('WhatsApp send failed:', result.error);
    return c.json(Errors.internal(`Failed to send message: ${result.error}`, language).toJSON(), 500);
  }

  // Log message to database
  const userId = c.get('userId');
  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    // Find or create session
    const formattedPhone = formatPhoneForWhatsApp(to);
    let session = await c.env.DB.prepare(
      'SELECT id FROM whatsapp_sessions WHERE phone = ?'
    ).bind(formattedPhone).first<{ id: string }>();

    if (!session) {
      const sessionId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO whatsapp_sessions (id, user_id, phone, state, created_at, updated_at)
        VALUES (?, ?, ?, 'active', ?, ?)
      `).bind(sessionId, userId, formattedPhone, now, now).run();
      session = { id: sessionId };
    }

    // Log the message
    await c.env.DB.prepare(`
      INSERT INTO whatsapp_messages (id, session_id, direction, message_type, content, twilio_sid, status, created_at)
      VALUES (?, ?, 'outbound', 'text', ?, ?, ?, ?)
    `).bind(messageId, session.id, message, result.messageSid, result.status, now).run();

    // Update usage record
    await c.env.DB.prepare(`
      UPDATE usage_records
      SET whatsapp_messages = whatsapp_messages + 1, updated_at = ?
      WHERE user_id = ? AND period_start <= ? AND period_end >= ?
    `).bind(now, userId, now, now).run();
  } catch (error) {
    console.error('Failed to log WhatsApp message:', error);
    // Don't fail the request if logging fails
  }

  return c.json({
    success: true,
    data: {
      messageSid: result.messageSid,
      status: result.status,
      to: formatPhoneForWhatsApp(to),
    },
  });
});

/**
 * Send a templated WhatsApp message
 */
whatsappRoutes.post('/send-template', authMiddleware, async (c) => {
  const language = c.get('language') || 'en';

  if (!isWhatsAppConfigured(c.env)) {
    return c.json(Errors.serviceUnavailable('WhatsApp not configured', language).toJSON(), 503);
  }

  const body = await c.req.json();
  const validation = sendTemplateSchema.safeParse(body);

  if (!validation.success) {
    return c.json(Errors.badRequest(validation.error.errors[0].message, language).toJSON(), 400);
  }

  const { to, templateType, language: msgLanguage, data } = validation.data;

  if (!isValidPhoneNumber(to)) {
    return c.json(Errors.badRequest('Invalid phone number format', language).toJSON(), 400);
  }

  // Generate message from template
  const message = getWhatsAppMessage(templateType as WhatsAppTemplateType, msgLanguage as Language, data);

  const whatsapp = createWhatsAppService(c.env);
  const result = await whatsapp.sendMessage(to, message);

  if (!result.success) {
    console.error('WhatsApp template send failed:', result.error);
    return c.json(Errors.internal(`Failed to send message: ${result.error}`, language).toJSON(), 500);
  }

  // Log to database
  const userId = c.get('userId');
  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const formattedPhone = formatPhoneForWhatsApp(to);
    let session = await c.env.DB.prepare(
      'SELECT id FROM whatsapp_sessions WHERE phone = ?'
    ).bind(formattedPhone).first<{ id: string }>();

    if (!session) {
      const sessionId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO whatsapp_sessions (id, user_id, phone, state, created_at, updated_at)
        VALUES (?, ?, ?, 'active', ?, ?)
      `).bind(sessionId, userId, formattedPhone, now, now).run();
      session = { id: sessionId };
    }

    await c.env.DB.prepare(`
      INSERT INTO whatsapp_messages (id, session_id, direction, message_type, content, template_name, twilio_sid, status, created_at)
      VALUES (?, ?, 'outbound', 'template', ?, ?, ?, ?, ?)
    `).bind(messageId, session.id, message, templateType, result.messageSid, result.status, now).run();

    // Update usage
    await c.env.DB.prepare(`
      UPDATE usage_records
      SET whatsapp_messages = whatsapp_messages + 1, updated_at = ?
      WHERE user_id = ? AND period_start <= ? AND period_end >= ?
    `).bind(now, userId, now, now).run();
  } catch (error) {
    console.error('Failed to log template message:', error);
  }

  return c.json({
    success: true,
    data: {
      messageSid: result.messageSid,
      status: result.status,
      templateType,
      to: formatPhoneForWhatsApp(to),
    },
  });
});

/**
 * Send bulk WhatsApp messages
 */
whatsappRoutes.post('/send-bulk', authMiddleware, requireRole('admin', 'lawyer'), async (c) => {
  const language = c.get('language') || 'en';

  if (!isWhatsAppConfigured(c.env)) {
    return c.json(Errors.serviceUnavailable('WhatsApp not configured', language).toJSON(), 503);
  }

  const body = await c.req.json();
  const validation = bulkSendSchema.safeParse(body);

  if (!validation.success) {
    return c.json(Errors.badRequest(validation.error.errors[0].message, language).toJSON(), 400);
  }

  const { recipients, templateType, data } = validation.data;

  const whatsapp = createWhatsAppService(c.env);
  const results: { phone: string; success: boolean; messageSid?: string; error?: string }[] = [];

  // Process with rate limiting (1 per 100ms to avoid Twilio limits)
  for (const recipient of recipients) {
    if (!isValidPhoneNumber(recipient.phone)) {
      results.push({ phone: recipient.phone, success: false, error: 'Invalid phone number' });
      continue;
    }

    // Customize data with recipient info
    const customData = {
      ...data,
      recipientName: recipient.name || data.recipientName || 'Customer',
      signerName: recipient.name || data.signerName || 'Signer',
      clientName: recipient.name || data.clientName || 'Client',
      userName: recipient.name || data.userName || 'User',
    };

    const message = getWhatsAppMessage(templateType as WhatsAppTemplateType, recipient.language as Language, customData);
    const result = await whatsapp.sendMessage(recipient.phone, message);

    results.push({
      phone: recipient.phone,
      success: result.success,
      messageSid: result.messageSid,
      error: result.error,
    });

    // Rate limit: wait 100ms between messages
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;

  // Log bulk usage
  const userId = c.get('userId');
  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(`
      UPDATE usage_records
      SET whatsapp_messages = whatsapp_messages + ?, updated_at = ?
      WHERE user_id = ? AND period_start <= ? AND period_end >= ?
    `).bind(successCount, now, userId, now, now).run();
  } catch (error) {
    console.error('Failed to update bulk usage:', error);
  }

  return c.json({
    success: true,
    data: {
      total: recipients.length,
      sent: successCount,
      failed: failedCount,
      results,
    },
  });
});

/**
 * Twilio Webhook - Receive message status updates
 */
whatsappRoutes.post('/webhook/status', async (c) => {
  // Verify Twilio signature in production
  const twilioSignature = c.req.header('X-Twilio-Signature');

  if (!twilioSignature && c.env.TWILIO_AUTH_TOKEN) {
    console.warn('Missing Twilio signature on webhook');
    // In production, you might want to reject unsigned requests
  }

  const formData = await c.req.formData();
  const messageSid = formData.get('MessageSid') as string;
  const status = formData.get('MessageStatus') as WhatsAppMessageStatus;
  const errorCode = formData.get('ErrorCode') as string | null;
  const errorMessage = formData.get('ErrorMessage') as string | null;

  if (!messageSid || !status) {
    return c.text('Missing required fields', 400);
  }

  const now = new Date().toISOString();

  try {
    // Update message status in database
    await c.env.DB.prepare(`
      UPDATE whatsapp_messages
      SET status = ?, updated_at = ?
      WHERE twilio_sid = ?
    `).bind(status, now, messageSid).run();

    // Log errors
    if (errorCode || errorMessage) {
      console.error(`WhatsApp message ${messageSid} failed:`, { errorCode, errorMessage });
    }
  } catch (error) {
    console.error('Webhook status update failed:', error);
  }

  // Twilio expects 200 OK
  return c.text('OK', 200);
});

/**
 * Twilio Webhook - Receive incoming messages
 */
whatsappRoutes.post('/webhook/incoming', async (c) => {
  const formData = await c.req.formData();

  const from = formData.get('From') as string; // whatsapp:+1234567890
  const body = formData.get('Body') as string;
  const messageSid = formData.get('MessageSid') as string;
  const profileName = formData.get('ProfileName') as string | null;
  const numMedia = parseInt(formData.get('NumMedia') as string || '0');

  const now = new Date().toISOString();

  try {
    // Find or create session
    let session = await c.env.DB.prepare(
      'SELECT id, state, context, detected_language FROM whatsapp_sessions WHERE phone = ?'
    ).bind(from).first<{ id: string; state: string; context: string; detected_language: string }>();

    if (!session) {
      const sessionId = crypto.randomUUID();
      // Auto-detect language from message (simple heuristic)
      const detectedLang = detectLanguage(body);

      await c.env.DB.prepare(`
        INSERT INTO whatsapp_sessions (id, phone, state, context, detected_language, last_message_at, created_at, updated_at)
        VALUES (?, ?, 'idle', '{}', ?, ?, ?, ?)
      `).bind(sessionId, from, detectedLang, now, now, now).run();

      session = { id: sessionId, state: 'idle', context: '{}', detected_language: detectedLang };
    } else {
      // Update last message timestamp
      await c.env.DB.prepare(`
        UPDATE whatsapp_sessions SET last_message_at = ?, updated_at = ? WHERE id = ?
      `).bind(now, now, session.id).run();
    }

    // Log incoming message
    const messageId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO whatsapp_messages (id, session_id, direction, message_type, content, twilio_sid, status, created_at)
      VALUES (?, ?, 'inbound', 'text', ?, ?, 'received', ?)
    `).bind(messageId, session.id, body, messageSid, now).run();

    // Process the message and generate response
    const response = await processIncomingMessage(
      c.env,
      session,
      body,
      from,
      profileName
    );

    // Send response via TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(response)}</Message>
</Response>`;

    return c.text(twiml, 200, { 'Content-Type': 'application/xml' });
  } catch (error) {
    console.error('Incoming message processing failed:', error);

    // Send error response
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, we couldn't process your message. Please try again later.</Message>
</Response>`;

    return c.text(errorTwiml, 200, { 'Content-Type': 'application/xml' });
  }
});

/**
 * Get message history for a session
 */
whatsappRoutes.get('/sessions/:sessionId/messages', authMiddleware, async (c) => {
  const language = c.get('language') || 'en';
  const sessionId = c.req.param('sessionId');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    const messages = await c.env.DB.prepare(`
      SELECT id, direction, message_type, content, media_url, template_name, status, created_at
      FROM whatsapp_messages
      WHERE session_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(sessionId, limit, offset).all();

    return c.json({
      success: true,
      data: messages.results,
    });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return c.json(Errors.internal('Failed to fetch messages', language).toJSON(), 500);
  }
});

/**
 * Get all WhatsApp sessions (admin only)
 */
whatsappRoutes.get('/sessions', authMiddleware, requireRole('admin'), async (c) => {
  const language = c.get('language') || 'en';
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    const sessions = await c.env.DB.prepare(`
      SELECT
        ws.id, ws.phone, ws.state, ws.detected_language, ws.last_message_at, ws.created_at,
        u.full_name as user_name, u.email as user_email,
        (SELECT COUNT(*) FROM whatsapp_messages WHERE session_id = ws.id) as message_count
      FROM whatsapp_sessions ws
      LEFT JOIN users u ON ws.user_id = u.id
      ORDER BY ws.last_message_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    return c.json({
      success: true,
      data: sessions.results,
    });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return c.json(Errors.internal('Failed to fetch sessions', language).toJSON(), 500);
  }
});

/**
 * Send OTP via WhatsApp
 */
whatsappRoutes.post('/send-otp', async (c) => {
  if (!isWhatsAppConfigured(c.env)) {
    return c.json({ success: false, error: 'WhatsApp not configured' }, 503);
  }

  const body = await c.req.json();
  const { phone, code, language = 'en' } = body;

  if (!phone || !code) {
    return c.json({ success: false, error: 'Phone and code required' }, 400);
  }

  if (!isValidPhoneNumber(phone)) {
    return c.json({ success: false, error: 'Invalid phone number' }, 400);
  }

  const message = getWhatsAppMessage('otp_verification', language as Language, {
    code,
    expiresIn: '10 minutes',
  });

  const whatsapp = createWhatsAppService(c.env);
  const result = await whatsapp.sendMessage(phone, message);

  if (!result.success) {
    console.error('OTP send failed:', result.error);
    return c.json({ success: false, error: 'Failed to send OTP' }, 500);
  }

  return c.json({
    success: true,
    messageSid: result.messageSid,
  });
});

/**
 * Test WhatsApp connection
 */
whatsappRoutes.get('/test', authMiddleware, requireRole('admin'), async (c) => {
  const language = c.get('language') || 'en';

  if (!isWhatsAppConfigured(c.env)) {
    return c.json({
      success: false,
      configured: false,
      message: 'WhatsApp/Twilio not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM.',
    });
  }

  // Test connection by checking account
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${c.env.TWILIO_ACCOUNT_SID}.json`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${c.env.TWILIO_ACCOUNT_SID}:${c.env.TWILIO_AUTH_TOKEN}`)}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return c.json({
        success: false,
        configured: true,
        message: 'Twilio credentials invalid',
        error,
      });
    }

    const account = await response.json() as {
      sid: string;
      friendly_name: string;
      status: string;
      type: string;
    };

    return c.json({
      success: true,
      configured: true,
      account: {
        sid: account.sid,
        friendlyName: account.friendly_name,
        status: account.status,
        type: account.type,
      },
      whatsappNumber: c.env.TWILIO_WHATSAPP_FROM,
    });
  } catch (error) {
    return c.json({
      success: false,
      configured: true,
      message: 'Failed to connect to Twilio',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper functions

/**
 * Simple language detection based on character ranges
 */
function detectLanguage(text: string): Language {
  // Arabic Unicode range
  const arabicRegex = /[\u0600-\u06FF]/;
  // Urdu uses Arabic script plus some additional characters
  const urduSpecificRegex = /[\u0679\u067E\u0686\u0688\u0691\u06BA\u06BE\u06C1\u06D2]/;

  if (urduSpecificRegex.test(text)) {
    return 'ur';
  }
  if (arabicRegex.test(text)) {
    return 'ar';
  }
  return 'en';
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Process incoming WhatsApp message and generate response
 */
async function processIncomingMessage(
  env: Bindings,
  session: { id: string; state: string; context: string; detected_language: string },
  message: string,
  from: string,
  profileName: string | null
): Promise<string> {
  const lang = session.detected_language as Language;
  const lowerMessage = message.toLowerCase().trim();

  // Command handlers
  const commands: Record<string, () => string> = {
    hi: () => getGreeting(lang, profileName),
    hello: () => getGreeting(lang, profileName),
    help: () => getHelpMessage(lang),
    مرحبا: () => getGreeting(lang, profileName),
    مساعدة: () => getHelpMessage(lang),
    status: () => getStatusMessage(lang),
    حالة: () => getStatusMessage(lang),
  };

  // Check for exact command match
  for (const [cmd, handler] of Object.entries(commands)) {
    if (lowerMessage === cmd || lowerMessage.startsWith(cmd + ' ')) {
      return handler();
    }
  }

  // Default response with menu
  return getDefaultResponse(lang);
}

function getGreeting(lang: Language, name: string | null): string {
  const greetings = {
    en: `Hello${name ? ` ${name}` : ''}! 👋

Welcome to LegalDocs. How can I help you today?

Reply with:
1️⃣ *help* - See available commands
2️⃣ *status* - Check your document status`,

    ar: `مرحباً${name ? ` ${name}` : ''}! 👋

أهلاً بك في LegalDocs. كيف يمكنني مساعدتك اليوم؟

أرسل:
1️⃣ *مساعدة* - عرض الأوامر المتاحة
2️⃣ *حالة* - تحقق من حالة مستنداتك`,

    ur: `السلام علیکم${name ? ` ${name}` : ''}! 👋

LegalDocs میں خوش آمدید۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟

جواب دیں:
1️⃣ *مدد* - دستیاب کمانڈز دیکھیں
2️⃣ *حیثیت* - اپنی دستاویزات کی حیثیت چیک کریں`,
  };

  return greetings[lang];
}

function getHelpMessage(lang: Language): string {
  const messages = {
    en: `📚 *LegalDocs Help*

Available commands:
• *help* - Show this help message
• *status* - Check pending documents
• *documents* - List your documents
• *sign* - View documents awaiting your signature

Need human assistance? Reply *support* to connect with our team.

_LegalDocs - Your Legal Partner_`,

    ar: `📚 *مساعدة LegalDocs*

الأوامر المتاحة:
• *مساعدة* - عرض هذه الرسالة
• *حالة* - التحقق من المستندات المعلقة
• *مستندات* - عرض مستنداتك
• *توقيع* - عرض المستندات التي تنتظر توقيعك

تحتاج مساعدة بشرية؟ أرسل *دعم* للتواصل مع فريقنا.

_LegalDocs - شريكك القانوني_`,

    ur: `📚 *LegalDocs مدد*

دستیاب کمانڈز:
• *مدد* - یہ پیغام دکھائیں
• *حیثیت* - زیر التواء دستاویزات چیک کریں
• *دستاویزات* - اپنی دستاویزات کی فہرست
• *دستخط* - دستخط کے منتظر دستاویزات دیکھیں

انسانی مدد چاہیے؟ ہماری ٹیم سے رابطے کے لیے *سپورٹ* لکھیں۔

_LegalDocs - آپ کا قانونی ساتھی_`,
  };

  return messages[lang];
}

function getStatusMessage(lang: Language): string {
  const messages = {
    en: `📊 *Document Status*

To check your document status, please log in to your LegalDocs dashboard or provide your document reference number.

Reply with your reference number (e.g., DOC-12345)`,

    ar: `📊 *حالة المستند*

للتحقق من حالة مستندك، يرجى تسجيل الدخول إلى لوحة تحكم LegalDocs أو تقديم رقم مرجع المستند.

أرسل رقم المرجع (مثال: DOC-12345)`,

    ur: `📊 *دستاویز کی حیثیت*

اپنی دستاویز کی حیثیت چیک کرنے کے لیے، براہ کرم اپنے LegalDocs ڈیش بورڈ میں لاگ ان کریں یا اپنا دستاویز حوالہ نمبر فراہم کریں۔

اپنا حوالہ نمبر بھیجیں (مثال: DOC-12345)`,
  };

  return messages[lang];
}

function getDefaultResponse(lang: Language): string {
  const messages = {
    en: `Thank you for your message!

I'm the LegalDocs assistant. For help, reply *help*.

To speak with a human, reply *support*.`,

    ar: `شكراً لرسالتك!

أنا مساعد LegalDocs. للمساعدة، أرسل *مساعدة*.

للتحدث مع شخص، أرسل *دعم*.`,

    ur: `آپ کے پیغام کا شکریہ!

میں LegalDocs اسسٹنٹ ہوں۔ مدد کے لیے *مدد* لکھیں۔

کسی شخص سے بات کرنے کے لیے *سپورٹ* لکھیں۔`,
  };

  return messages[lang];
}

export default whatsappRoutes;
