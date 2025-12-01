/**
 * Lawyer-Client Messaging System
 *
 * Real-time messaging between lawyers and clients with:
 * - Threaded conversations
 * - File attachments
 * - Read receipts
 * - System messages
 * - Template responses
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  JWT_SECRET: string;
};

type Variables = {
  userId: string;
  userEmail: string;
  userRole: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// CONVERSATION MANAGEMENT
// ============================================

/**
 * GET /api/messages/conversations
 * Get all conversations for the user
 */
app.get('/conversations', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    // Get user's lawyer profile if they have one
    const lawyerProfile = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    const lawyerId = lawyerProfile?.id;

    // Get conversations where user is either client or lawyer
    const conversations = await db
      .prepare(`
        SELECT
          conv.*,
          l.first_name as lawyer_first_name,
          l.last_name as lawyer_last_name,
          l.avatar_url as lawyer_avatar,
          u.name as client_name,
          u.email as client_email,
          (SELECT content FROM conversation_messages WHERE conversation_id = conv.id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM conversation_messages WHERE conversation_id = conv.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
          (SELECT COUNT(*) FROM conversation_messages WHERE conversation_id = conv.id AND is_read = 0 AND sender_id != ?) as unread_count
        FROM conversations conv
        LEFT JOIN lawyers l ON l.id = conv.lawyer_id
        LEFT JOIN users u ON u.id = conv.client_id
        WHERE conv.client_id = ? OR conv.lawyer_id = ?
        ORDER BY
          COALESCE(
            (SELECT created_at FROM conversation_messages WHERE conversation_id = conv.id ORDER BY created_at DESC LIMIT 1),
            conv.created_at
          ) DESC
        LIMIT ? OFFSET ?
      `)
      .bind(userId, userId, lawyerId || '', limit, offset)
      .all();

    const countResult = await db
      .prepare(`
        SELECT COUNT(*) as total FROM conversations
        WHERE client_id = ? OR lawyer_id = ?
      `)
      .bind(userId, lawyerId || '')
      .first<{ total: number }>();

    // Format conversations
    const formatted = (conversations.results || []).map((conv: any) => ({
      ...conv,
      isClient: conv.client_id === userId,
      otherParty: conv.client_id === userId
        ? { name: `${conv.lawyer_first_name} ${conv.lawyer_last_name}`, avatar: conv.lawyer_avatar }
        : { name: conv.client_name, email: conv.client_email },
    }));

    return c.json({
      success: true,
      data: {
        conversations: formatted,
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch conversations' } }, 500);
  }
});

/**
 * POST /api/messages/conversations
 * Start a new conversation with a lawyer
 */
app.post('/conversations', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const body = await c.req.json();

    const { lawyerId, subject, initialMessage, referenceType, referenceId } = body;

    if (!lawyerId) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Lawyer ID is required' },
      }, 400);
    }

    // Get lawyer
    const lawyer = await db
      .prepare('SELECT id, user_id, first_name, last_name FROM lawyers WHERE id = ? AND is_active = 1')
      .bind(lawyerId)
      .first<{ id: string; user_id: string; first_name: string; last_name: string }>();

    if (!lawyer) {
      return c.json({ success: false, error: { code: 'LAWYER_NOT_FOUND', message: 'Lawyer not found' } }, 404);
    }

    // Check for existing conversation
    let conversation = await db
      .prepare(`
        SELECT id FROM conversations
        WHERE client_id = ? AND lawyer_id = ?
          AND (reference_type IS NULL OR reference_type = ?)
      `)
      .bind(userId, lawyerId, referenceType || null)
      .first<{ id: string }>();

    let conversationId: string;

    if (conversation) {
      conversationId = conversation.id;
    } else {
      // Create new conversation
      conversationId = crypto.randomUUID();
      await db
        .prepare(`
          INSERT INTO conversations (
            id, client_id, lawyer_id, lawyer_user_id,
            subject, reference_type, reference_id,
            status, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?,
            ?, ?, ?,
            'active', datetime('now'), datetime('now')
          )
        `)
        .bind(
          conversationId, userId, lawyerId, lawyer.user_id,
          subject || 'New Conversation', referenceType || null, referenceId || null
        )
        .run();
    }

    // Add initial message if provided
    if (initialMessage) {
      const messageId = crypto.randomUUID();
      await db
        .prepare(`
          INSERT INTO conversation_messages (
            id, conversation_id, sender_id, sender_type,
            content, message_type, is_read, created_at
          ) VALUES (
            ?, ?, ?, 'client',
            ?, 'text', 0, datetime('now')
          )
        `)
        .bind(messageId, conversationId, userId, initialMessage)
        .run();

      // Notify lawyer
      await db
        .prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id, created_at)
          VALUES (?, ?, 'new_message', 'New Message', ?, 'conversation', ?, datetime('now'))
        `)
        .bind(
          crypto.randomUUID(),
          lawyer.user_id,
          `You have a new message`,
          conversationId
        )
        .run();
    }

    return c.json({
      success: true,
      data: {
        conversationId,
        lawyerName: `${lawyer.first_name} ${lawyer.last_name}`,
        isNew: !conversation,
      },
    }, conversation ? 200 : 201);
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return c.json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create conversation' } }, 500);
  }
});

/**
 * GET /api/messages/conversations/:id
 * Get conversation with messages
 */
app.get('/conversations/:id', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = (page - 1) * limit;

    // Get user's lawyer profile
    const lawyerProfile = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    // Get conversation
    const conversation = await db
      .prepare(`
        SELECT
          conv.*,
          l.first_name as lawyer_first_name,
          l.last_name as lawyer_last_name,
          l.avatar_url as lawyer_avatar,
          u.name as client_name,
          u.email as client_email
        FROM conversations conv
        LEFT JOIN lawyers l ON l.id = conv.lawyer_id
        LEFT JOIN users u ON u.id = conv.client_id
        WHERE conv.id = ? AND (conv.client_id = ? OR conv.lawyer_id = ?)
      `)
      .bind(id, userId, lawyerProfile?.id || '')
      .first();

    if (!conversation) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } }, 404);
    }

    // Get messages
    const messages = await db
      .prepare(`
        SELECT * FROM conversation_messages
        WHERE conversation_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(id, limit, offset)
      .all();

    // Mark messages as read
    await db
      .prepare(`
        UPDATE conversation_messages
        SET is_read = 1, read_at = datetime('now')
        WHERE conversation_id = ? AND sender_id != ? AND is_read = 0
      `)
      .bind(id, userId)
      .run();

    const countResult = await db
      .prepare('SELECT COUNT(*) as total FROM conversation_messages WHERE conversation_id = ?')
      .bind(id)
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        conversation: {
          ...conversation,
          isClient: (conversation as any).client_id === userId,
        },
        messages: (messages.results || []).reverse(), // Chronological order
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch conversation' } }, 500);
  }
});

/**
 * POST /api/messages/conversations/:id/messages
 * Send a message in a conversation
 */
app.post('/conversations/:id/messages', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json();

    const { content, messageType = 'text', fileUrl, fileName, fileSize, fileMimeType } = body;

    if (!content && messageType === 'text') {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Message content is required' },
      }, 400);
    }

    // Get user's lawyer profile
    const lawyerProfile = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    // Verify access to conversation
    const conversation = await db
      .prepare(`
        SELECT * FROM conversations
        WHERE id = ? AND (client_id = ? OR lawyer_id = ?)
      `)
      .bind(id, userId, lawyerProfile?.id || '')
      .first<{
        id: string;
        client_id: string;
        lawyer_id: string;
        lawyer_user_id: string;
        status: string;
      }>();

    if (!conversation) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } }, 404);
    }

    if (conversation.status !== 'active') {
      return c.json({
        success: false,
        error: { code: 'CONVERSATION_CLOSED', message: 'This conversation is closed' },
      }, 400);
    }

    // Determine sender type
    const senderType = conversation.client_id === userId ? 'client' : 'lawyer';

    // Create message
    const messageId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO conversation_messages (
          id, conversation_id, sender_id, sender_type,
          content, message_type, file_url, file_name, file_size, file_mime_type,
          is_read, created_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          0, datetime('now')
        )
      `)
      .bind(
        messageId, id, userId, senderType,
        content, messageType, fileUrl || null, fileName || null, fileSize || null, fileMimeType || null
      )
      .run();

    // Update conversation timestamp
    await db
      .prepare('UPDATE conversations SET updated_at = datetime("now") WHERE id = ?')
      .bind(id)
      .run();

    // Notify recipient
    const recipientId = conversation.client_id === userId ? conversation.lawyer_user_id : conversation.client_id;
    await db
      .prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id, created_at)
        VALUES (?, ?, 'new_message', 'New Message', ?, 'conversation', ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), recipientId, content?.substring(0, 100) || 'New file attachment', id)
      .run();

    return c.json({
      success: true,
      data: {
        messageId,
        conversationId: id,
        content,
        messageType,
        senderType,
        createdAt: new Date().toISOString(),
      },
    }, 201);
  } catch (error: any) {
    console.error('Error sending message:', error);
    return c.json({ success: false, error: { code: 'SEND_FAILED', message: 'Failed to send message' } }, 500);
  }
});

/**
 * PATCH /api/messages/conversations/:id/status
 * Close or archive a conversation
 */
app.patch('/conversations/:id/status', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json();

    const { status } = body; // active, closed, archived

    // Get user's lawyer profile
    const lawyerProfile = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    // Verify access
    const conversation = await db
      .prepare(`
        SELECT * FROM conversations
        WHERE id = ? AND (client_id = ? OR lawyer_id = ?)
      `)
      .bind(id, userId, lawyerProfile?.id || '')
      .first();

    if (!conversation) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } }, 404);
    }

    await db
      .prepare('UPDATE conversations SET status = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(status, id)
      .run();

    return c.json({
      success: true,
      data: {
        conversationId: id,
        status,
      },
    });
  } catch (error: any) {
    console.error('Error updating conversation:', error);
    return c.json({ success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update conversation' } }, 500);
  }
});

// ============================================
// TEMPLATE RESPONSES (for lawyers)
// ============================================

/**
 * GET /api/messages/templates
 * Get lawyer's message templates
 */
app.get('/templates', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');

    const lawyerProfile = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    if (!lawyerProfile) {
      return c.json({ success: false, error: { code: 'NOT_LAWYER', message: 'Not a lawyer profile' } }, 403);
    }

    const templates = await db
      .prepare(`
        SELECT * FROM message_templates
        WHERE lawyer_id = ? OR is_global = 1
        ORDER BY use_count DESC, name ASC
      `)
      .bind(lawyerProfile.id)
      .all();

    return c.json({
      success: true,
      data: { templates: templates.results || [] },
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch templates' } }, 500);
  }
});

/**
 * POST /api/messages/templates
 * Create a message template
 */
app.post('/templates', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const body = await c.req.json();

    const { name, content, category } = body;

    const lawyerProfile = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    if (!lawyerProfile) {
      return c.json({ success: false, error: { code: 'NOT_LAWYER', message: 'Not a lawyer profile' } }, 403);
    }

    const templateId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO message_templates (id, lawyer_id, name, content, category, use_count, created_at)
        VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
      `)
      .bind(templateId, lawyerProfile.id, name, content, category || 'general')
      .run();

    return c.json({
      success: true,
      data: { templateId, name, content, category },
    }, 201);
  } catch (error: any) {
    console.error('Error creating template:', error);
    return c.json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create template' } }, 500);
  }
});

// ============================================
// UNREAD COUNT
// ============================================

/**
 * GET /api/messages/unread
 * Get total unread message count
 */
app.get('/unread', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');

    const lawyerProfile = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    const result = await db
      .prepare(`
        SELECT COUNT(*) as unread_count
        FROM conversation_messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE (c.client_id = ? OR c.lawyer_id = ?)
          AND m.sender_id != ?
          AND m.is_read = 0
      `)
      .bind(userId, lawyerProfile?.id || '', userId)
      .first<{ unread_count: number }>();

    return c.json({
      success: true,
      data: { unreadCount: result?.unread_count || 0 },
    });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch unread count' } }, 500);
  }
});

export { app as messaging };
