import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { hashPassword, verifyPassword, needsRehash } from '../lib/password.js';
import { generateTokenPair, verifyToken, TokenError } from '../lib/jwt.js';
import { Errors } from '../lib/errors.js';
import { authMiddleware, rateLimiters } from '../middleware/index.js';
import { sendWelcomeEmail, getEmailLanguage } from '../lib/email.js';

// Types for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
};

type Variables = {
  userId: string;
  userEmail: string;
  userRole: string;
};

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  fullNameAr: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  fullNameAr: z.string().max(100).optional(),
  phone: z.string().optional(),
  uiLanguage: z.enum(['en', 'ar', 'ur']).optional(),
  preferredDocLanguages: z.array(z.string()).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return crypto.randomUUID();
}

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * POST /api/auth/register
 * Register a new user
 */
auth.post('/register', rateLimiters.auth, zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json');
  const db = c.env.DB;

  // Check if user exists
  const existing = await db
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(body.email.toLowerCase())
    .first();

  if (existing) {
    return c.json(Errors.userExists().toJSON(), 409);
  }

  const id = generateId();
  const passwordHash = await hashPassword(body.password);

  await db
    .prepare(
      `INSERT INTO users (id, email, password_hash, full_name, full_name_ar, phone, role, ui_language, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'user', 'en', datetime('now'), datetime('now'))`
    )
    .bind(
      id,
      body.email.toLowerCase(),
      passwordHash,
      body.fullName,
      body.fullNameAr || null,
      body.phone || null
    )
    .run();

  // Generate tokens
  const { accessToken, refreshToken, expiresAt } = await generateTokenPair(
    { userId: id, email: body.email.toLowerCase(), role: 'user' },
    c.env.JWT_SECRET
  );

  // Send welcome email (non-blocking - don't wait for result)
  const emailLanguage = getEmailLanguage('en'); // Default to 'en', could be from user preference
  sendWelcomeEmail(c.env.RESEND_API_KEY, {
    userName: body.fullName,
    userEmail: body.email.toLowerCase(),
    language: emailLanguage,
  }).catch(error => {
    // Log error but don't fail registration
    console.error('Failed to send welcome email:', error);
  });

  return c.json({
    success: true,
    data: {
      user: {
        id,
        email: body.email.toLowerCase(),
        fullName: body.fullName,
        fullNameAr: body.fullNameAr,
        role: 'user',
        uiLanguage: 'en',
      },
      accessToken,
      refreshToken,
      expiresAt,
    },
  });
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
auth.post('/login', rateLimiters.auth, zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const db = c.env.DB;

  const user = await db
    .prepare(
      `SELECT id, email, password_hash, full_name, full_name_ar, phone, role, ui_language, preferred_doc_languages
       FROM users WHERE email = ?`
    )
    .bind(body.email.toLowerCase())
    .first<{
      id: string;
      email: string;
      password_hash: string;
      full_name: string;
      full_name_ar: string | null;
      phone: string | null;
      role: string;
      ui_language: string;
      preferred_doc_languages: string | null;
    }>();

  if (!user) {
    return c.json(Errors.invalidCredentials().toJSON(), 401);
  }

  const valid = await verifyPassword(body.password, user.password_hash);
  if (!valid) {
    return c.json(Errors.invalidCredentials().toJSON(), 401);
  }

  // Check if password needs rehashing (legacy hash upgrade)
  if (needsRehash(user.password_hash)) {
    const newHash = await hashPassword(body.password);
    await db
      .prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(newHash, user.id)
      .run();
  }

  // Update last login
  await db
    .prepare('UPDATE users SET last_login_at = datetime(\'now\') WHERE id = ?')
    .bind(user.id)
    .run();

  // Generate tokens
  const { accessToken, refreshToken, expiresAt } = await generateTokenPair(
    { userId: user.id, email: user.email, role: user.role },
    c.env.JWT_SECRET
  );

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        fullNameAr: user.full_name_ar,
        phone: user.phone,
        role: user.role,
        uiLanguage: user.ui_language || 'en',
        preferredDocLanguages: user.preferred_doc_languages
          ? JSON.parse(user.preferred_doc_languages)
          : ['en'],
      },
      accessToken,
      refreshToken,
      expiresAt,
    },
  });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
auth.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken: token } = c.req.valid('json');

  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);

    if (payload.type !== 'refresh') {
      return c.json(Errors.invalidToken().toJSON(), 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken, expiresAt } = await generateTokenPair(
      { userId: payload.userId, email: payload.email, role: payload.role },
      c.env.JWT_SECRET
    );

    return c.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresAt,
      },
    });
  } catch (error) {
    if (error instanceof TokenError) {
      if (error.code === 'TOKEN_EXPIRED') {
        return c.json(Errors.tokenExpired().toJSON(), 401);
      }
    }
    return c.json(Errors.invalidToken().toJSON(), 401);
  }
});

// ============================================
// PROTECTED ROUTES
// ============================================

/**
 * GET /api/auth/me
 * Get current user profile
 */
auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;

  const user = await db
    .prepare(
      `SELECT id, email, full_name, full_name_ar, full_name_ur, phone, avatar_url, role,
              ui_language, preferred_doc_languages, organization_id, created_at
       FROM users WHERE id = ?`
    )
    .bind(userId)
    .first();

  if (!user) {
    return c.json(Errors.notFound('User').toJSON(), 404);
  }

  return c.json({
    success: true,
    data: { user },
  });
});

/**
 * PATCH /api/auth/profile
 * Update current user profile
 */
auth.patch('/profile', authMiddleware, zValidator('json', updateProfileSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const db = c.env.DB;

  const updates: string[] = [];
  const values: any[] = [];

  if (body.fullName !== undefined) {
    updates.push('full_name = ?');
    values.push(body.fullName);
  }
  if (body.fullNameAr !== undefined) {
    updates.push('full_name_ar = ?');
    values.push(body.fullNameAr);
  }
  if (body.phone !== undefined) {
    updates.push('phone = ?');
    values.push(body.phone);
  }
  if (body.uiLanguage !== undefined) {
    updates.push('ui_language = ?');
    values.push(body.uiLanguage);
  }
  if (body.preferredDocLanguages !== undefined) {
    updates.push('preferred_doc_languages = ?');
    values.push(JSON.stringify(body.preferredDocLanguages));
  }

  if (updates.length === 0) {
    return c.json(Errors.badRequest('No fields to update').toJSON(), 400);
  }

  updates.push('updated_at = datetime(\'now\')');
  values.push(userId);

  await db
    .prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  const user = await db
    .prepare(
      `SELECT id, email, full_name, full_name_ar, phone, avatar_url, role, ui_language, preferred_doc_languages
       FROM users WHERE id = ?`
    )
    .bind(userId)
    .first();

  return c.json({
    success: true,
    data: { user },
  });
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
auth.post(
  '/change-password',
  authMiddleware,
  rateLimiters.sensitive,
  zValidator('json', changePasswordSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const db = c.env.DB;

    const user = await db
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .bind(userId)
      .first<{ password_hash: string }>();

    if (!user) {
      return c.json(Errors.notFound('User').toJSON(), 404);
    }

    const valid = await verifyPassword(body.currentPassword, user.password_hash);
    if (!valid) {
      return c.json(Errors.badRequest('Current password is incorrect').toJSON(), 400);
    }

    const newHash = await hashPassword(body.newPassword);
    await db
      .prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(newHash, userId)
      .run();

    return c.json({
      success: true,
      data: { message: 'Password changed successfully' },
    });
  }
);

/**
 * POST /api/auth/logout
 * Logout (for future token blacklist implementation)
 */
auth.post('/logout', authMiddleware, async (c) => {
  // In a production system, you would:
  // 1. Add the refresh token to a blacklist
  // 2. Invalidate any active sessions
  // For now, we just return success and let the client clear tokens

  return c.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});

export { auth };
