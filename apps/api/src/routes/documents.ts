import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Errors } from '../lib/errors.js';
import { authMiddleware } from '../middleware/index.js';
import { createAnalyticsService } from '../lib/analytics.js';
import {
  getPersonalizedRecommendations,
  getPopularDocuments,
  getDocumentSuggestions,
  getRelatedDocuments,
} from '../lib/document-recommendations.js';

// Types for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
};

type Variables = {
  userId: string;
  userRole: string;
};

const documents = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Note: Auth middleware is applied selectively - some routes are public

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  titleAr: z.string().max(200).optional(),
  titleUr: z.string().max(200).optional(),
  documentType: z.string().min(1, 'Document type is required'),
  contentEn: z.record(z.unknown()).optional(),
  contentAr: z.record(z.unknown()).optional(),
  contentUr: z.record(z.unknown()).optional(),
  languages: z.array(z.string()).default(['en']),
  bindingLanguage: z.string().default('ar'),
  templateId: z.string().uuid().optional(),
});

const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleAr: z.string().max(200).optional(),
  titleUr: z.string().max(200).optional(),
  contentEn: z.record(z.unknown()).optional(),
  contentAr: z.record(z.unknown()).optional(),
  contentUr: z.record(z.unknown()).optional(),
  status: z
    .enum([
      'draft',
      'pending_review',
      'pending_signatures',
      'partially_signed',
      'signed',
      'certified',
      'archived',
    ])
    .optional(),
});

const addSignerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.string().max(50).default('Signer'),
  order: z.number().int().min(1).default(1),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  // Advanced filters
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
  hasSigned: z.enum(['true', 'false']).optional(), // Filter by signature status
  sortBy: z.enum(['created_at', 'updated_at', 'title', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return crypto.randomUUID();
}

function generateDocumentNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DR-${year}-${random}`;
}

function generateSigningToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

// ============================================
// ROUTES
// ============================================

// ============================================
// RECOMMENDATIONS ROUTES (before auth middleware)
// ============================================

/**
 * GET /api/documents/recommendations
 * Get personalized document recommendations for authenticated users
 */
documents.get('/recommendations', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;

  const limit = parseInt(c.req.query('limit') || '6');
  const userRole = c.req.query('role') || 'default';

  try {
    const recommendations = await getPersonalizedRecommendations(db, userId, {
      limit,
      userRole,
    });

    // Track recommendation view (non-blocking)
    const analytics = createAnalyticsService(db, {
      userId,
      userAgent: c.req.header('User-Agent'),
      ipAddress: c.req.header('CF-Connecting-IP'),
      country: c.req.header('CF-IPCountry'),
    });
    analytics.track({
      eventType: 'recommendations_viewed',
      userId,
      properties: {
        recommendationCount: recommendations.length,
        userRole,
      },
    }).catch(err => console.error('Analytics error:', err));

    return c.json({
      success: true,
      data: {
        recommendations,
        personalized: true,
      },
    });
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return c.json(Errors.internal('Failed to get recommendations').toJSON(), 500);
  }
});

/**
 * GET /api/documents/popular
 * Get popular documents (public endpoint)
 */
documents.get('/popular', async (c) => {
  const db = c.env.DB;
  const limit = parseInt(c.req.query('limit') || '6');

  try {
    const recommendations = await getPopularDocuments(db, limit);

    return c.json({
      success: true,
      data: {
        recommendations,
        personalized: false,
      },
    });
  } catch (error) {
    console.error('Failed to get popular documents:', error);
    return c.json(Errors.internal('Failed to get popular documents').toJSON(), 500);
  }
});

/**
 * GET /api/documents/:id/suggestions
 * Get related document suggestions based on a specific document
 */
documents.get('/:id/suggestions', authMiddleware, async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  // Verify user owns the document
  const doc = await db
    .prepare('SELECT created_by FROM documents WHERE id = ?')
    .bind(id)
    .first<{ created_by: string }>();

  if (!doc) {
    return c.json(Errors.notFound('Document').toJSON(), 404);
  }

  if (doc.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  try {
    const suggestions = await getDocumentSuggestions(db, id);

    return c.json({
      success: true,
      data: {
        suggestions,
        documentId: id,
      },
    });
  } catch (error) {
    console.error('Failed to get document suggestions:', error);
    return c.json(Errors.internal('Failed to get suggestions').toJSON(), 500);
  }
});

/**
 * GET /api/documents/related/:type
 * Get related documents for a document type (public)
 */
documents.get('/related/:type', async (c) => {
  const { type } = c.req.param();

  try {
    const related = getRelatedDocuments(type);

    return c.json({
      success: true,
      data: {
        documentType: type,
        related,
      },
    });
  } catch (error) {
    console.error('Failed to get related documents:', error);
    return c.json(Errors.internal('Failed to get related documents').toJSON(), 500);
  }
});

// Apply auth middleware to remaining routes
documents.use('*', authMiddleware);

/**
 * GET /api/documents
 * List user's documents with pagination, search, and advanced filters
 *
 * Search supports:
 * - Multi-language titles (English, Arabic, Urdu)
 * - Document number
 * - Document type
 *
 * Advanced filters:
 * - status: Filter by document status
 * - type: Filter by document type
 * - dateFrom/dateTo: Filter by creation date range
 * - hasSigned: Filter documents with/without signatures
 * - sortBy/sortOrder: Sort results
 */
documents.get('/', zValidator('query', paginationSchema), async (c) => {
  const userId = c.get('userId');
  const {
    page,
    limit,
    status,
    type,
    search,
    dateFrom,
    dateTo,
    hasSigned,
    sortBy,
    sortOrder,
  } = c.req.valid('query');
  const db = c.env.DB;

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions: string[] = ['d.created_by = ?'];
  const params: any[] = [userId];

  // Status filter
  if (status) {
    conditions.push('d.status = ?');
    params.push(status);
  }

  // Document type filter
  if (type) {
    conditions.push('d.document_type = ?');
    params.push(type);
  }

  // Enhanced search: multi-language titles, document number, document type
  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push(`(
      d.title LIKE ? OR
      d.title_ar LIKE ? OR
      d.title_ur LIKE ? OR
      d.document_number LIKE ? OR
      d.document_type LIKE ?
    )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Date range filters
  if (dateFrom) {
    conditions.push('d.created_at >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push('d.created_at <= ?');
    params.push(dateTo);
  }

  // Filter by signature status
  if (hasSigned === 'true') {
    conditions.push('EXISTS (SELECT 1 FROM document_signers WHERE document_id = d.id AND status = \'signed\')');
  } else if (hasSigned === 'false') {
    conditions.push('NOT EXISTS (SELECT 1 FROM document_signers WHERE document_id = d.id AND status = \'signed\')');
  }

  const whereClause = conditions.join(' AND ');

  // Validate sort column to prevent SQL injection
  const validSortColumns = ['created_at', 'updated_at', 'title', 'status'];
  const sortColumn = validSortColumns.includes(sortBy) ? `d.${sortBy}` : 'd.created_at';
  const orderDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

  // Get total count
  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM documents d WHERE ${whereClause}`)
    .bind(...params)
    .first<{ count: number }>();

  const total = countResult?.count || 0;

  // Get documents with signer counts
  const result = await db
    .prepare(
      `SELECT d.*,
              (SELECT COUNT(*) FROM document_signers WHERE document_id = d.id) as signer_count,
              (SELECT COUNT(*) FROM document_signers WHERE document_id = d.id AND status = 'signed') as signed_count
       FROM documents d
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${orderDirection}
       LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    success: true,
    data: {
      documents: result.results,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        filters: {
          status,
          type,
          search,
          dateFrom,
          dateTo,
          hasSigned,
          sortBy,
          sortOrder,
        },
      },
    },
  });
});

/**
 * GET /api/documents/search
 * Full-text search across documents including content
 *
 * This is a more comprehensive search than the list endpoint,
 * as it also searches within document content (JSON fields).
 */
const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  includeContent: z.enum(['true', 'false']).default('false'),
});

documents.get('/search', zValidator('query', searchSchema), async (c) => {
  const userId = c.get('userId');
  const { q: query, page, limit, includeContent } = c.req.valid('query');
  const db = c.env.DB;

  const offset = (page - 1) * limit;
  const searchTerm = `%${query}%`;

  // Build search query with relevance scoring
  // SQLite doesn't have native full-text search without FTS extension,
  // so we use LIKE with multiple fields and add relevance hints
  const searchConditions = `
    (
      d.title LIKE ? OR
      d.title_ar LIKE ? OR
      d.title_ur LIKE ? OR
      d.document_number LIKE ? OR
      d.document_type LIKE ? OR
      d.content_en LIKE ? OR
      d.content_ar LIKE ?
    )
  `;

  // Get total count
  const countResult = await db
    .prepare(`
      SELECT COUNT(*) as count
      FROM documents d
      WHERE d.created_by = ? AND ${searchConditions}
    `)
    .bind(userId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    .first<{ count: number }>();

  const total = countResult?.count || 0;

  // Get matching documents with relevance scoring
  // We calculate a simple relevance score based on which fields match
  const selectFields = includeContent === 'true'
    ? 'd.*'
    : `d.id, d.document_number, d.title, d.title_ar, d.title_ur, d.document_type, d.status, d.created_at, d.updated_at`;

  const result = await db
    .prepare(`
      SELECT ${selectFields},
             (SELECT COUNT(*) FROM document_signers WHERE document_id = d.id) as signer_count,
             (SELECT COUNT(*) FROM document_signers WHERE document_id = d.id AND status = 'signed') as signed_count,
             -- Relevance scoring: title matches score higher than content matches
             CASE
               WHEN d.title LIKE ? THEN 100
               WHEN d.title_ar LIKE ? THEN 90
               WHEN d.title_ur LIKE ? THEN 90
               WHEN d.document_number LIKE ? THEN 80
               WHEN d.document_type LIKE ? THEN 50
               WHEN d.content_en LIKE ? THEN 30
               WHEN d.content_ar LIKE ? THEN 30
               ELSE 0
             END as relevance
      FROM documents d
      WHERE d.created_by = ? AND ${searchConditions}
      ORDER BY relevance DESC, d.updated_at DESC
      LIMIT ? OFFSET ?
    `)
    .bind(
      // For relevance scoring
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      // For WHERE clause
      userId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      // For pagination
      limit, offset
    )
    .all();

  // Highlight search matches in results (simple version)
  const highlightMatches = (text: string | null, query: string): string | null => {
    if (!text) return null;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '**$1**');
  };

  const documents = (result.results || []).map((doc: any) => ({
    ...doc,
    // Add highlighted snippets for search results
    highlights: {
      title: doc.title?.toLowerCase().includes(query.toLowerCase())
        ? highlightMatches(doc.title, query)
        : null,
      titleAr: doc.title_ar?.toLowerCase().includes(query.toLowerCase())
        ? highlightMatches(doc.title_ar, query)
        : null,
    },
  }));

  // Track search analytics (non-blocking)
  const analytics = createAnalyticsService(db, {
    userId,
    userAgent: c.req.header('User-Agent'),
    ipAddress: c.req.header('CF-Connecting-IP'),
    country: c.req.header('CF-IPCountry'),
  });
  analytics.track({
    eventType: 'document_searched',
    userId,
    properties: {
      query,
      resultsCount: total,
      page,
      includeContent: includeContent === 'true',
    },
  }).catch(err => console.error('Analytics error:', err));

  return c.json({
    success: true,
    data: {
      query,
      documents,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * GET /api/documents/:id
 * Get a single document with signers
 */
documents.get('/:id', async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const document = await db
    .prepare('SELECT * FROM documents WHERE id = ?')
    .bind(id)
    .first();

  if (!document) {
    return c.json(Errors.notFound('Document').toJSON(), 404);
  }

  // Check access (owner or org member)
  if ((document as any).created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Get signers
  const signers = await db
    .prepare('SELECT * FROM document_signers WHERE document_id = ? ORDER BY "order"')
    .bind(id)
    .all();

  // Get activity log
  const activities = await db
    .prepare(
      `SELECT * FROM document_activities WHERE document_id = ? ORDER BY created_at DESC LIMIT 20`
    )
    .bind(id)
    .all();

  return c.json({
    success: true,
    data: {
      document: {
        ...document,
        signers: signers.results,
        activities: activities.results,
      },
    },
  });
});

/**
 * GET /api/documents/:id/download
 * Get document data formatted for PDF generation
 */
documents.get('/:id/download', async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const document = await db
    .prepare('SELECT * FROM documents WHERE id = ?')
    .bind(id)
    .first();

  if (!document) {
    return c.json(Errors.notFound('Document').toJSON(), 404);
  }

  if ((document as any).created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Get signers
  const signers = await db
    .prepare('SELECT * FROM document_signers WHERE document_id = ? ORDER BY "order"')
    .bind(id)
    .all();

  // Get user info for owner
  const owner = await db
    .prepare('SELECT full_name, email FROM users WHERE id = ?')
    .bind(userId)
    .first<{ full_name: string; email: string }>();

  // Parse content
  const contentEn = (document as any).content_en ? JSON.parse((document as any).content_en) : null;
  const contentAr = (document as any).content_ar ? JSON.parse((document as any).content_ar) : null;

  return c.json({
    success: true,
    data: {
      documentId: id,
      documentNumber: (document as any).document_number,
      title: (document as any).title,
      titleAr: (document as any).title_ar,
      documentType: (document as any).document_type,
      status: (document as any).status,
      contentEn,
      contentAr,
      languages: JSON.parse((document as any).languages || '["en"]'),
      bindingLanguage: (document as any).binding_language,
      owner: owner?.full_name || owner?.email || 'Unknown',
      signers: signers.results.map((s: any) => ({
        name: s.name,
        email: s.email,
        role: s.role,
        status: s.status,
        signedAt: s.signed_at,
      })),
      createdAt: (document as any).created_at,
      updatedAt: (document as any).updated_at,
    },
  });
});

/**
 * POST /api/documents
 * Create a new document
 */
documents.post('/', zValidator('json', createDocumentSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const id = generateId();
  const documentNumber = generateDocumentNumber();

  await db
    .prepare(
      `INSERT INTO documents (
        id, document_number, title, title_ar, title_ur, document_type,
        content_en, content_ar, content_ur, languages, binding_language,
        template_id, status, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, datetime('now'), datetime('now'))`
    )
    .bind(
      id,
      documentNumber,
      body.title,
      body.titleAr || null,
      body.titleUr || null,
      body.documentType,
      JSON.stringify(body.contentEn || {}),
      JSON.stringify(body.contentAr || {}),
      JSON.stringify(body.contentUr || {}),
      JSON.stringify(body.languages),
      body.bindingLanguage,
      body.templateId || null,
      userId
    )
    .run();

  // Log activity
  await db
    .prepare(
      `INSERT INTO document_activities (id, document_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'created', '{}', datetime('now'))`
    )
    .bind(generateId(), id, userId)
    .run();

  const document = await db.prepare('SELECT * FROM documents WHERE id = ?').bind(id).first();

  return c.json(
    {
      success: true,
      data: { document },
    },
    201
  );
});

/**
 * PATCH /api/documents/:id
 * Update a document
 */
documents.patch('/:id', zValidator('json', updateDocumentSchema), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const document = await db
    .prepare('SELECT * FROM documents WHERE id = ?')
    .bind(id)
    .first<{ created_by: string; status: string }>();

  if (!document) {
    return c.json(Errors.notFound('Document').toJSON(), 404);
  }

  if (document.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  if (document.status === 'signed' || document.status === 'certified') {
    return c.json(Errors.badRequest('Cannot edit a signed or certified document').toJSON(), 400);
  }

  // Build update query
  const updates: string[] = [];
  const values: any[] = [];
  const changes: Record<string, unknown> = {};

  if (body.title !== undefined) {
    updates.push('title = ?');
    values.push(body.title);
    changes.title = body.title;
  }
  if (body.titleAr !== undefined) {
    updates.push('title_ar = ?');
    values.push(body.titleAr);
    changes.titleAr = body.titleAr;
  }
  if (body.titleUr !== undefined) {
    updates.push('title_ur = ?');
    values.push(body.titleUr);
    changes.titleUr = body.titleUr;
  }
  if (body.contentEn !== undefined) {
    updates.push('content_en = ?');
    values.push(JSON.stringify(body.contentEn));
    changes.contentEn = 'updated';
  }
  if (body.contentAr !== undefined) {
    updates.push('content_ar = ?');
    values.push(JSON.stringify(body.contentAr));
    changes.contentAr = 'updated';
  }
  if (body.contentUr !== undefined) {
    updates.push('content_ur = ?');
    values.push(JSON.stringify(body.contentUr));
    changes.contentUr = 'updated';
  }
  if (body.status !== undefined) {
    updates.push('status = ?');
    values.push(body.status);
    changes.status = body.status;
  }

  if (updates.length === 0) {
    return c.json(Errors.badRequest('No fields to update').toJSON(), 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await db.prepare(`UPDATE documents SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  // Log activity
  await db
    .prepare(
      `INSERT INTO document_activities (id, document_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'updated', ?, datetime('now'))`
    )
    .bind(generateId(), id, userId, JSON.stringify(changes))
    .run();

  const updated = await db.prepare('SELECT * FROM documents WHERE id = ?').bind(id).first();

  return c.json({
    success: true,
    data: { document: updated },
  });
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
documents.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const document = await db
    .prepare('SELECT * FROM documents WHERE id = ?')
    .bind(id)
    .first<{ created_by: string; status: string }>();

  if (!document) {
    return c.json(Errors.notFound('Document').toJSON(), 404);
  }

  if (document.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  if (document.status === 'signed' || document.status === 'certified') {
    return c.json(Errors.badRequest('Cannot delete a signed or certified document').toJSON(), 400);
  }

  // Delete related records first
  await db.prepare('DELETE FROM document_signers WHERE document_id = ?').bind(id).run();
  await db.prepare('DELETE FROM document_activities WHERE document_id = ?').bind(id).run();
  await db.prepare('DELETE FROM documents WHERE id = ?').bind(id).run();

  return c.json({
    success: true,
    data: { message: 'Document deleted successfully' },
  });
});

// ============================================
// SIGNER ROUTES
// ============================================

/**
 * POST /api/documents/:id/signers
 * Add a signer to a document
 */
documents.post('/:id/signers', zValidator('json', addSignerSchema), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const document = await db
    .prepare('SELECT * FROM documents WHERE id = ?')
    .bind(id)
    .first<{ created_by: string; status: string }>();

  if (!document) {
    return c.json(Errors.notFound('Document').toJSON(), 404);
  }

  if (document.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  if (document.status === 'signed' || document.status === 'certified') {
    return c.json(Errors.badRequest('Cannot add signers to a signed document').toJSON(), 400);
  }

  // Check if signer already exists
  const existing = await db
    .prepare('SELECT id FROM document_signers WHERE document_id = ? AND email = ?')
    .bind(id, body.email.toLowerCase())
    .first();

  if (existing) {
    return c.json(Errors.conflict('Signer with this email already exists').toJSON(), 409);
  }

  const signerId = generateId();
  const signingToken = generateSigningToken();
  const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  await db
    .prepare(
      `INSERT INTO document_signers (
        id, document_id, name, email, phone, role, "order", status,
        signing_token, token_expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, datetime('now'))`
    )
    .bind(
      signerId,
      id,
      body.name,
      body.email.toLowerCase(),
      body.phone || null,
      body.role,
      body.order,
      signingToken,
      tokenExpiresAt
    )
    .run();

  // Update document status if needed
  if (document.status === 'draft') {
    await db
      .prepare("UPDATE documents SET status = 'pending_signatures', updated_at = datetime('now') WHERE id = ?")
      .bind(id)
      .run();
  }

  // Log activity
  await db
    .prepare(
      `INSERT INTO document_activities (id, document_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'signer_added', ?, datetime('now'))`
    )
    .bind(generateId(), id, userId, JSON.stringify({ signerEmail: body.email }))
    .run();

  const signer = await db
    .prepare('SELECT * FROM document_signers WHERE id = ?')
    .bind(signerId)
    .first();

  return c.json(
    {
      success: true,
      data: { signer },
    },
    201
  );
});

/**
 * DELETE /api/documents/:id/signers/:signerId
 * Remove a signer from a document
 */
documents.delete('/:id/signers/:signerId', async (c) => {
  const { id, signerId } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const document = await db
    .prepare('SELECT * FROM documents WHERE id = ?')
    .bind(id)
    .first<{ created_by: string; status: string }>();

  if (!document) {
    return c.json(Errors.notFound('Document').toJSON(), 404);
  }

  if (document.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  const signer = await db
    .prepare('SELECT * FROM document_signers WHERE id = ? AND document_id = ?')
    .bind(signerId, id)
    .first<{ status: string; email: string }>();

  if (!signer) {
    return c.json(Errors.notFound('Signer').toJSON(), 404);
  }

  if (signer.status === 'signed') {
    return c.json(Errors.badRequest('Cannot remove a signer who has already signed').toJSON(), 400);
  }

  await db.prepare('DELETE FROM document_signers WHERE id = ?').bind(signerId).run();

  // Log activity
  await db
    .prepare(
      `INSERT INTO document_activities (id, document_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'signer_removed', ?, datetime('now'))`
    )
    .bind(generateId(), id, userId, JSON.stringify({ signerEmail: signer.email }))
    .run();

  return c.json({
    success: true,
    data: { message: 'Signer removed successfully' },
  });
});

export { documents };
