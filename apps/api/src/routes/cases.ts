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

const cases = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth middleware to all routes
cases.use('*', authMiddleware);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  titleAr: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  caseType: z.enum([
    'litigation',
    'corporate',
    'real_estate',
    'employment',
    'family',
    'intellectual_property',
    'contract',
    'immigration',
    'other',
  ]),
  practiceArea: z.enum(['civil', 'criminal', 'commercial', 'administrative']).optional(),
  jurisdiction: z.string().default('AE'),
  court: z.string().max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  clientName: z.string().max(100).optional(),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().max(20).optional(),
  opposingParty: z.string().max(200).optional(),
  opposingCounsel: z.string().max(200).optional(),
  caseValue: z.number().positive().optional(),
  currency: z.string().default('AED'),
  billingType: z.enum(['hourly', 'fixed', 'contingency', 'retainer']).default('hourly'),
  hourlyRate: z.number().positive().optional(),
  retainerAmount: z.number().positive().optional(),
  courtCaseNumber: z.string().max(50).optional(),
  referenceNumber: z.string().max(50).optional(),
  statuteOfLimitations: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(5000).optional(),
});

const updateCaseSchema = createCaseSchema.partial().extend({
  status: z
    .enum(['open', 'active', 'pending', 'on_hold', 'closed', 'won', 'lost', 'settled'])
    .optional(),
  dateClosed: z.string().optional(),
  nextHearingDate: z.string().optional(),
  nextDeadline: z.string().optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  titleAr: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  taskType: z
    .enum(['task', 'deadline', 'hearing', 'filing', 'meeting', 'call', 'review', 'other'])
    .default('task'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  reminderDate: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  isCourtDeadline: z.boolean().default(false),
  courtDeadlineType: z
    .enum(['filing', 'response', 'hearing', 'appeal', 'discovery'])
    .optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'overdue']).optional(),
});

const createNoteSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000),
  contentAr: z.string().max(10000).optional(),
  noteType: z
    .enum(['note', 'update', 'communication', 'research', 'strategy'])
    .default('note'),
  isPrivate: z.boolean().default(false),
  isPinned: z.boolean().default(false),
});

const createTimeEntrySchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  descriptionAr: z.string().max(500).optional(),
  date: z.string(),
  durationMinutes: z.number().int().min(1).max(1440),
  activityType: z
    .enum([
      'research',
      'drafting',
      'meeting',
      'court',
      'travel',
      'communication',
      'review',
      'other',
    ])
    .default('other'),
  isBillable: z.boolean().default(true),
});

const linkDocumentSchema = z.object({
  documentId: z.string().uuid(),
  documentCategory: z
    .enum(['pleading', 'evidence', 'correspondence', 'contract', 'research', 'other'])
    .optional(),
  notes: z.string().max(500).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  caseType: z.string().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return crypto.randomUUID();
}

function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CASE-${year}-${random}`;
}

// ============================================
// CASE ROUTES
// ============================================

/**
 * GET /api/cases
 * List user's cases with pagination and filters
 */
cases.get('/', zValidator('query', paginationSchema), async (c) => {
  const userId = c.get('userId');
  const { page, limit, status, caseType, priority, search } = c.req.valid('query');
  const db = c.env.DB;

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions: string[] = ['created_by = ?'];
  const params: unknown[] = [userId];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (caseType) {
    conditions.push('case_type = ?');
    params.push(caseType);
  }

  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }

  if (search) {
    conditions.push('(title LIKE ? OR case_number LIKE ? OR client_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM cases WHERE ${whereClause}`)
    .bind(...params)
    .first<{ count: number }>();

  const total = countResult?.count || 0;

  // Get cases with task counts
  const result = await db
    .prepare(
      `SELECT c.*,
              (SELECT COUNT(*) FROM case_tasks WHERE case_id = c.id) as total_tasks,
              (SELECT COUNT(*) FROM case_tasks WHERE case_id = c.id AND status = 'completed') as completed_tasks,
              (SELECT COUNT(*) FROM case_tasks WHERE case_id = c.id AND status = 'pending' AND due_date < date('now')) as overdue_tasks,
              (SELECT COUNT(*) FROM case_documents WHERE case_id = c.id) as document_count
       FROM cases c
       WHERE ${whereClause}
       ORDER BY
         CASE WHEN c.priority = 'urgent' THEN 1
              WHEN c.priority = 'high' THEN 2
              WHEN c.priority = 'medium' THEN 3
              ELSE 4 END,
         c.next_deadline ASC NULLS LAST,
         c.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    success: true,
    data: {
      cases: result.results,
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
 * GET /api/cases/stats
 * Get case statistics for dashboard
 */
cases.get('/stats', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;

  const stats = await db
    .prepare(
      `SELECT
        COUNT(*) as total_cases,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_cases,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_cases,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_cases,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_cases,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_cases,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost_cases,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_cases,
        SUM(total_billed) as total_billed,
        SUM(total_paid) as total_paid
      FROM cases WHERE created_by = ?`
    )
    .bind(userId)
    .first();

  // Get upcoming deadlines
  const upcomingDeadlines = await db
    .prepare(
      `SELECT t.*, c.title as case_title, c.case_number
       FROM case_tasks t
       JOIN cases c ON t.case_id = c.id
       WHERE c.created_by = ? AND t.status = 'pending' AND t.due_date >= date('now')
       ORDER BY t.due_date ASC
       LIMIT 10`
    )
    .bind(userId)
    .all();

  // Get overdue tasks
  const overdueTasks = await db
    .prepare(
      `SELECT t.*, c.title as case_title, c.case_number
       FROM case_tasks t
       JOIN cases c ON t.case_id = c.id
       WHERE c.created_by = ? AND t.status = 'pending' AND t.due_date < date('now')
       ORDER BY t.due_date ASC
       LIMIT 10`
    )
    .bind(userId)
    .all();

  // Cases by type
  const casesByType = await db
    .prepare(
      `SELECT case_type, COUNT(*) as count
       FROM cases WHERE created_by = ?
       GROUP BY case_type`
    )
    .bind(userId)
    .all();

  return c.json({
    success: true,
    data: {
      stats,
      upcomingDeadlines: upcomingDeadlines.results,
      overdueTasks: overdueTasks.results,
      casesByType: casesByType.results,
    },
  });
});

/**
 * GET /api/cases/:id
 * Get a single case with all details
 */
cases.get('/:id', async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const caseData = await db.prepare('SELECT * FROM cases WHERE id = ?').bind(id).first();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  // Check access
  if ((caseData as { created_by: string }).created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Get tasks
  const tasks = await db
    .prepare(
      'SELECT * FROM case_tasks WHERE case_id = ? ORDER BY due_date ASC NULLS LAST, priority DESC'
    )
    .bind(id)
    .all();

  // Get notes
  const notes = await db
    .prepare(
      `SELECT n.*, u.full_name as author_name
       FROM case_notes n
       LEFT JOIN users u ON n.created_by = u.id
       WHERE n.case_id = ? AND (n.is_private = 0 OR n.created_by = ?)
       ORDER BY n.is_pinned DESC, n.created_at DESC`
    )
    .bind(id, userId)
    .all();

  // Get linked documents
  const documents = await db
    .prepare(
      `SELECT cd.*, d.title, d.document_number, d.status as document_status, d.document_type
       FROM case_documents cd
       JOIN documents d ON cd.document_id = d.id
       WHERE cd.case_id = ?
       ORDER BY cd.created_at DESC`
    )
    .bind(id)
    .all();

  // Get time entries
  const timeEntries = await db
    .prepare(
      `SELECT te.*, u.full_name as user_name
       FROM case_time_entries te
       LEFT JOIN users u ON te.user_id = u.id
       WHERE te.case_id = ?
       ORDER BY te.date DESC`
    )
    .bind(id)
    .all();

  // Get recent activities
  const activities = await db
    .prepare(
      `SELECT a.*, u.full_name as user_name
       FROM case_activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.case_id = ?
       ORDER BY a.created_at DESC
       LIMIT 50`
    )
    .bind(id)
    .all();

  // Calculate time stats
  const timeStats = await db
    .prepare(
      `SELECT
        SUM(duration_minutes) as total_minutes,
        SUM(CASE WHEN is_billable = 1 THEN duration_minutes ELSE 0 END) as billable_minutes,
        SUM(CASE WHEN is_billable = 1 THEN amount ELSE 0 END) as total_amount
       FROM case_time_entries WHERE case_id = ?`
    )
    .bind(id)
    .first();

  return c.json({
    success: true,
    data: {
      case: {
        ...caseData,
        tasks: tasks.results,
        notes: notes.results,
        documents: documents.results,
        timeEntries: timeEntries.results,
        activities: activities.results,
        timeStats,
      },
    },
  });
});

/**
 * POST /api/cases
 * Create a new case
 */
cases.post('/', zValidator('json', createCaseSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const id = generateId();
  const caseNumber = generateCaseNumber();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO cases (
        id, case_number, created_by, title, title_ar, description, description_ar,
        case_type, practice_area, jurisdiction, court, status, priority,
        client_name, client_email, client_phone, opposing_party, opposing_counsel,
        case_value, currency, billing_type, hourly_rate, retainer_amount,
        court_case_number, reference_number, statute_of_limitations, tags, notes,
        date_opened, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      caseNumber,
      userId,
      body.title,
      body.titleAr || null,
      body.description || null,
      body.descriptionAr || null,
      body.caseType,
      body.practiceArea || null,
      body.jurisdiction,
      body.court || null,
      body.priority,
      body.clientName || null,
      body.clientEmail || null,
      body.clientPhone || null,
      body.opposingParty || null,
      body.opposingCounsel || null,
      body.caseValue || null,
      body.currency,
      body.billingType,
      body.hourlyRate || null,
      body.retainerAmount || null,
      body.courtCaseNumber || null,
      body.referenceNumber || null,
      body.statuteOfLimitations || null,
      body.tags ? JSON.stringify(body.tags) : null,
      body.notes || null,
      now,
      now,
      now
    )
    .run();

  // Log activity
  await db
    .prepare(
      `INSERT INTO case_activities (id, case_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'created', '{}', ?)`
    )
    .bind(generateId(), id, userId, now)
    .run();

  const newCase = await db.prepare('SELECT * FROM cases WHERE id = ?').bind(id).first();

  return c.json(
    {
      success: true,
      data: { case: newCase },
    },
    201
  );
});

/**
 * PATCH /api/cases/:id
 * Update a case
 */
cases.patch('/:id', zValidator('json', updateCaseSchema), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT * FROM cases WHERE id = ?')
    .bind(id)
    .first<{ created_by: string }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Build update query dynamically
  const updates: string[] = [];
  const values: unknown[] = [];
  const changes: Record<string, unknown> = {};

  const fieldMap: Record<string, string> = {
    title: 'title',
    titleAr: 'title_ar',
    description: 'description',
    descriptionAr: 'description_ar',
    caseType: 'case_type',
    practiceArea: 'practice_area',
    jurisdiction: 'jurisdiction',
    court: 'court',
    status: 'status',
    priority: 'priority',
    clientName: 'client_name',
    clientEmail: 'client_email',
    clientPhone: 'client_phone',
    opposingParty: 'opposing_party',
    opposingCounsel: 'opposing_counsel',
    caseValue: 'case_value',
    currency: 'currency',
    billingType: 'billing_type',
    hourlyRate: 'hourly_rate',
    retainerAmount: 'retainer_amount',
    courtCaseNumber: 'court_case_number',
    referenceNumber: 'reference_number',
    statuteOfLimitations: 'statute_of_limitations',
    nextHearingDate: 'next_hearing_date',
    nextDeadline: 'next_deadline',
    dateClosed: 'date_closed',
    notes: 'notes',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (body[key as keyof typeof body] !== undefined) {
      updates.push(`${column} = ?`);
      values.push(body[key as keyof typeof body]);
      changes[key] = body[key as keyof typeof body];
    }
  }

  if (body.tags !== undefined) {
    updates.push('tags = ?');
    values.push(JSON.stringify(body.tags));
    changes.tags = body.tags;
  }

  if (updates.length === 0) {
    return c.json(Errors.badRequest('No fields to update').toJSON(), 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await db.prepare(`UPDATE cases SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  // Log activity
  await db
    .prepare(
      `INSERT INTO case_activities (id, case_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'updated', ?, datetime('now'))`
    )
    .bind(generateId(), id, userId, JSON.stringify(changes))
    .run();

  const updated = await db.prepare('SELECT * FROM cases WHERE id = ?').bind(id).first();

  return c.json({
    success: true,
    data: { case: updated },
  });
});

/**
 * DELETE /api/cases/:id
 * Delete a case (soft delete or archive)
 */
cases.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT * FROM cases WHERE id = ?')
    .bind(id)
    .first<{ created_by: string }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Delete related records first (cascade)
  await db.prepare('DELETE FROM case_tasks WHERE case_id = ?').bind(id).run();
  await db.prepare('DELETE FROM case_notes WHERE case_id = ?').bind(id).run();
  await db.prepare('DELETE FROM case_documents WHERE case_id = ?').bind(id).run();
  await db.prepare('DELETE FROM case_time_entries WHERE case_id = ?').bind(id).run();
  await db.prepare('DELETE FROM case_activities WHERE case_id = ?').bind(id).run();
  await db.prepare('DELETE FROM cases WHERE id = ?').bind(id).run();

  return c.json({
    success: true,
    data: { message: 'Case deleted successfully' },
  });
});

// ============================================
// TASK ROUTES
// ============================================

/**
 * GET /api/cases/:id/tasks
 * Get all tasks for a case
 */
cases.get('/:id/tasks', async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT created_by FROM cases WHERE id = ?')
    .bind(id)
    .first<{ created_by: string }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  const tasks = await db
    .prepare(
      `SELECT t.*, u.full_name as assigned_to_name
       FROM case_tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.case_id = ?
       ORDER BY
         CASE WHEN t.status = 'overdue' THEN 1
              WHEN t.status = 'pending' THEN 2
              WHEN t.status = 'in_progress' THEN 3
              ELSE 4 END,
         t.due_date ASC NULLS LAST`
    )
    .bind(id)
    .all();

  return c.json({
    success: true,
    data: { tasks: tasks.results },
  });
});

/**
 * POST /api/cases/:id/tasks
 * Create a task for a case
 */
cases.post('/:id/tasks', zValidator('json', createTaskSchema), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT created_by, next_deadline FROM cases WHERE id = ?')
    .bind(id)
    .first<{ created_by: string; next_deadline: string | null }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  const taskId = generateId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO case_tasks (
        id, case_id, created_by, assigned_to, title, title_ar, description,
        task_type, priority, status, due_date, due_time, reminder_date,
        is_court_deadline, court_deadline_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      taskId,
      id,
      userId,
      body.assignedTo || null,
      body.title,
      body.titleAr || null,
      body.description || null,
      body.taskType,
      body.priority,
      body.dueDate || null,
      body.dueTime || null,
      body.reminderDate || null,
      body.isCourtDeadline ? 1 : 0,
      body.courtDeadlineType || null,
      now,
      now
    )
    .run();

  // Update case next_deadline if this task's due date is earlier
  if (body.dueDate) {
    if (!caseData.next_deadline || body.dueDate < caseData.next_deadline) {
      await db
        .prepare("UPDATE cases SET next_deadline = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(body.dueDate, id)
        .run();
    }
  }

  // Log activity
  await db
    .prepare(
      `INSERT INTO case_activities (id, case_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'task_added', ?, ?)`
    )
    .bind(generateId(), id, userId, JSON.stringify({ taskTitle: body.title }), now)
    .run();

  const task = await db.prepare('SELECT * FROM case_tasks WHERE id = ?').bind(taskId).first();

  return c.json(
    {
      success: true,
      data: { task },
    },
    201
  );
});

/**
 * PATCH /api/cases/:caseId/tasks/:taskId
 * Update a task
 */
cases.patch('/:caseId/tasks/:taskId', zValidator('json', updateTaskSchema), async (c) => {
  const { caseId, taskId } = c.req.param();
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT created_by FROM cases WHERE id = ?')
    .bind(caseId)
    .first<{ created_by: string }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  const task = await db
    .prepare('SELECT * FROM case_tasks WHERE id = ? AND case_id = ?')
    .bind(taskId, caseId)
    .first();

  if (!task) {
    return c.json(Errors.notFound('Task').toJSON(), 404);
  }

  // Build update query
  const updates: string[] = [];
  const values: unknown[] = [];

  const fieldMap: Record<string, string> = {
    title: 'title',
    titleAr: 'title_ar',
    description: 'description',
    taskType: 'task_type',
    priority: 'priority',
    status: 'status',
    dueDate: 'due_date',
    dueTime: 'due_time',
    reminderDate: 'reminder_date',
    assignedTo: 'assigned_to',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (body[key as keyof typeof body] !== undefined) {
      updates.push(`${column} = ?`);
      values.push(body[key as keyof typeof body]);
    }
  }

  // Handle completion
  if (body.status === 'completed') {
    updates.push("completed_at = datetime('now')");
    updates.push('completed_by = ?');
    values.push(userId);
  }

  if (updates.length === 0) {
    return c.json(Errors.badRequest('No fields to update').toJSON(), 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(taskId, caseId);

  await db
    .prepare(`UPDATE case_tasks SET ${updates.join(', ')} WHERE id = ? AND case_id = ?`)
    .bind(...values)
    .run();

  // Log activity if completed
  if (body.status === 'completed') {
    await db
      .prepare(
        `INSERT INTO case_activities (id, case_id, user_id, action, details, created_at)
         VALUES (?, ?, ?, 'task_completed', ?, datetime('now'))`
      )
      .bind(generateId(), caseId, userId, JSON.stringify({ taskId }))
      .run();
  }

  const updated = await db.prepare('SELECT * FROM case_tasks WHERE id = ?').bind(taskId).first();

  return c.json({
    success: true,
    data: { task: updated },
  });
});

/**
 * DELETE /api/cases/:caseId/tasks/:taskId
 * Delete a task
 */
cases.delete('/:caseId/tasks/:taskId', async (c) => {
  const { caseId, taskId } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT created_by FROM cases WHERE id = ?')
    .bind(caseId)
    .first<{ created_by: string }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  await db.prepare('DELETE FROM case_tasks WHERE id = ? AND case_id = ?').bind(taskId, caseId).run();

  return c.json({
    success: true,
    data: { message: 'Task deleted successfully' },
  });
});

// ============================================
// NOTE ROUTES
// ============================================

/**
 * POST /api/cases/:id/notes
 * Add a note to a case
 */
cases.post('/:id/notes', zValidator('json', createNoteSchema), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT created_by FROM cases WHERE id = ?')
    .bind(id)
    .first<{ created_by: string }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  const noteId = generateId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO case_notes (
        id, case_id, created_by, content, content_ar, note_type,
        is_private, is_pinned, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      noteId,
      id,
      userId,
      body.content,
      body.contentAr || null,
      body.noteType,
      body.isPrivate ? 1 : 0,
      body.isPinned ? 1 : 0,
      now,
      now
    )
    .run();

  // Log activity
  await db
    .prepare(
      `INSERT INTO case_activities (id, case_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'note_added', '{}', ?)`
    )
    .bind(generateId(), id, userId, now)
    .run();

  const note = await db.prepare('SELECT * FROM case_notes WHERE id = ?').bind(noteId).first();

  return c.json(
    {
      success: true,
      data: { note },
    },
    201
  );
});

/**
 * DELETE /api/cases/:caseId/notes/:noteId
 * Delete a note
 */
cases.delete('/:caseId/notes/:noteId', async (c) => {
  const { caseId, noteId } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const note = await db
    .prepare('SELECT created_by FROM case_notes WHERE id = ? AND case_id = ?')
    .bind(noteId, caseId)
    .first<{ created_by: string }>();

  if (!note) {
    return c.json(Errors.notFound('Note').toJSON(), 404);
  }

  if (note.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  await db
    .prepare('DELETE FROM case_notes WHERE id = ? AND case_id = ?')
    .bind(noteId, caseId)
    .run();

  return c.json({
    success: true,
    data: { message: 'Note deleted successfully' },
  });
});

// ============================================
// DOCUMENT LINK ROUTES
// ============================================

/**
 * POST /api/cases/:id/documents
 * Link a document to a case
 */
cases.post('/:id/documents', zValidator('json', linkDocumentSchema), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT created_by FROM cases WHERE id = ?')
    .bind(id)
    .first<{ created_by: string }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Check document exists
  const document = await db
    .prepare('SELECT id FROM documents WHERE id = ?')
    .bind(body.documentId)
    .first();

  if (!document) {
    return c.json(Errors.notFound('Document').toJSON(), 404);
  }

  // Check if already linked
  const existing = await db
    .prepare('SELECT id FROM case_documents WHERE case_id = ? AND document_id = ?')
    .bind(id, body.documentId)
    .first();

  if (existing) {
    return c.json(Errors.conflict('Document already linked to this case').toJSON(), 409);
  }

  const linkId = generateId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO case_documents (id, case_id, document_id, added_by, document_category, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(linkId, id, body.documentId, userId, body.documentCategory || null, body.notes || null, now)
    .run();

  // Log activity
  await db
    .prepare(
      `INSERT INTO case_activities (id, case_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'document_added', ?, ?)`
    )
    .bind(generateId(), id, userId, JSON.stringify({ documentId: body.documentId }), now)
    .run();

  return c.json(
    {
      success: true,
      data: { message: 'Document linked successfully' },
    },
    201
  );
});

/**
 * DELETE /api/cases/:caseId/documents/:documentId
 * Unlink a document from a case
 */
cases.delete('/:caseId/documents/:documentId', async (c) => {
  const { caseId, documentId } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT created_by FROM cases WHERE id = ?')
    .bind(caseId)
    .first<{ created_by: string }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  await db
    .prepare('DELETE FROM case_documents WHERE case_id = ? AND document_id = ?')
    .bind(caseId, documentId)
    .run();

  return c.json({
    success: true,
    data: { message: 'Document unlinked successfully' },
  });
});

// ============================================
// TIME ENTRY ROUTES
// ============================================

/**
 * POST /api/cases/:id/time
 * Log time entry for a case
 */
cases.post('/:id/time', zValidator('json', createTimeEntrySchema), async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const caseData = await db
    .prepare('SELECT created_by, hourly_rate FROM cases WHERE id = ?')
    .bind(id)
    .first<{ created_by: string; hourly_rate: number | null }>();

  if (!caseData) {
    return c.json(Errors.notFound('Case').toJSON(), 404);
  }

  if (caseData.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  const entryId = generateId();
  const now = new Date().toISOString();
  const hourlyRate = caseData.hourly_rate || 0;
  const amount = body.isBillable ? (body.durationMinutes / 60) * hourlyRate : 0;

  await db
    .prepare(
      `INSERT INTO case_time_entries (
        id, case_id, user_id, description, description_ar, date, duration_minutes,
        hourly_rate, amount, activity_type, is_billable, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      entryId,
      id,
      userId,
      body.description,
      body.descriptionAr || null,
      body.date,
      body.durationMinutes,
      hourlyRate,
      amount,
      body.activityType,
      body.isBillable ? 1 : 0,
      now,
      now
    )
    .run();

  // Update case total billed
  if (body.isBillable) {
    await db
      .prepare(
        "UPDATE cases SET total_billed = total_billed + ?, updated_at = datetime('now') WHERE id = ?"
      )
      .bind(amount, id)
      .run();
  }

  // Log activity
  await db
    .prepare(
      `INSERT INTO case_activities (id, case_id, user_id, action, details, created_at)
       VALUES (?, ?, ?, 'time_logged', ?, ?)`
    )
    .bind(
      generateId(),
      id,
      userId,
      JSON.stringify({ minutes: body.durationMinutes, amount }),
      now
    )
    .run();

  const entry = await db
    .prepare('SELECT * FROM case_time_entries WHERE id = ?')
    .bind(entryId)
    .first();

  return c.json(
    {
      success: true,
      data: { timeEntry: entry },
    },
    201
  );
});

/**
 * DELETE /api/cases/:caseId/time/:entryId
 * Delete a time entry
 */
cases.delete('/:caseId/time/:entryId', async (c) => {
  const { caseId, entryId } = c.req.param();
  const userId = c.get('userId');
  const db = c.env.DB;

  const entry = await db
    .prepare('SELECT * FROM case_time_entries WHERE id = ? AND case_id = ?')
    .bind(entryId, caseId)
    .first<{ user_id: string; amount: number; is_billable: number }>();

  if (!entry) {
    return c.json(Errors.notFound('Time entry').toJSON(), 404);
  }

  if (entry.user_id !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Update case total if billable
  if (entry.is_billable && entry.amount) {
    await db
      .prepare(
        "UPDATE cases SET total_billed = total_billed - ?, updated_at = datetime('now') WHERE id = ?"
      )
      .bind(entry.amount, caseId)
      .run();
  }

  await db
    .prepare('DELETE FROM case_time_entries WHERE id = ? AND case_id = ?')
    .bind(entryId, caseId)
    .run();

  return c.json({
    success: true,
    data: { message: 'Time entry deleted successfully' },
  });
});

export { cases };
