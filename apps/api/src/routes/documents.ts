import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Errors } from '../lib/errors.js';
import { authMiddleware } from '../middleware/index.js';

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

// Apply auth middleware to all routes
documents.use('*', authMiddleware);

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

/**
 * GET /api/documents
 * List user's documents with pagination and filters
 */
documents.get('/', zValidator('query', paginationSchema), async (c) => {
  const userId = c.get('userId');
  const { page, limit, status, type, search } = c.req.valid('query');
  const db = c.env.DB;

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions: string[] = ['created_by = ?'];
  const params: any[] = [userId];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (type) {
    conditions.push('document_type = ?');
    params.push(type);
  }

  if (search) {
    conditions.push('(title LIKE ? OR document_number LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM documents WHERE ${whereClause}`)
    .bind(...params)
    .first<{ count: number }>();

  const total = countResult?.count || 0;

  // Get documents
  const result = await db
    .prepare(
      `SELECT d.*,
              (SELECT COUNT(*) FROM document_signers WHERE document_id = d.id) as signer_count,
              (SELECT COUNT(*) FROM document_signers WHERE document_id = d.id AND status = 'signed') as signed_count
       FROM documents d
       WHERE ${whereClause}
       ORDER BY d.created_at DESC
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
