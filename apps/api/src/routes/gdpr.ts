/**
 * GDPR Compliance Routes
 *
 * Implements data subject rights under GDPR and UAE PDPL:
 * - Right of Access (data export)
 * - Right to Erasure (account deletion)
 * - Right to Data Portability
 *
 * @module routes/gdpr
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, rateLimiters } from '../middleware/index.js';
import { Errors } from '../lib/errors.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { clearAuthCookies } from '../lib/cookies.js';

// Types for Cloudflare bindings
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

const gdpr = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to confirm account deletion'),
  confirmation: z.literal('DELETE MY ACCOUNT', {
    errorMap: () => ({ message: 'Please type "DELETE MY ACCOUNT" to confirm' }),
  }),
});

// ============================================
// DATA EXPORT (Right of Access)
// ============================================

/**
 * GET /api/gdpr/export
 * Export all user data in JSON format (GDPR Article 15 & 20)
 */
gdpr.get('/export', authMiddleware, rateLimiters.sensitive, async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  const storage = c.env.STORAGE;

  try {
    // Fetch user profile
    const user = await db
      .prepare(
        `SELECT id, email, full_name, full_name_ar, full_name_ur, phone, avatar_url,
                role, ui_language, preferred_doc_languages, organization_id,
                created_at, updated_at, last_login_at
         FROM users WHERE id = ?`
      )
      .bind(userId)
      .first();

    if (!user) {
      return c.json(Errors.notFound('User').toJSON(), 404);
    }

    // Fetch user's documents
    const documents = await db
      .prepare(
        `SELECT id, title, document_type, status, language, country_code,
                parties, metadata, content_en, content_ar, content_ur,
                created_at, updated_at, signed_at, certified_at
         FROM documents WHERE user_id = ?`
      )
      .bind(userId)
      .all();

    // Fetch signatures (as signer and owner)
    const signatures = await db
      .prepare(
        `SELECT sr.id, sr.document_id, sr.signer_name, sr.signer_email,
                sr.status, sr.signed_at, sr.ip_address, sr.created_at
         FROM signature_requests sr
         JOIN documents d ON sr.document_id = d.id
         WHERE d.user_id = ? OR sr.signer_email = (SELECT email FROM users WHERE id = ?)`
      )
      .bind(userId, userId)
      .all();

    // Fetch cases (if lawyer)
    const cases = await db
      .prepare(
        `SELECT id, title, case_type, status, priority, description,
                client_name, client_email, client_phone,
                created_at, updated_at, closed_at
         FROM cases WHERE user_id = ?`
      )
      .bind(userId)
      .all();

    // Fetch consultations
    const consultations = await db
      .prepare(
        `SELECT id, lawyer_id, status, consultation_type, scheduled_at,
                duration_minutes, notes, rating, created_at
         FROM consultations WHERE client_id = ? OR lawyer_id = ?`
      )
      .bind(userId, userId)
      .all();

    // Fetch messages
    const messages = await db
      .prepare(
        `SELECT id, sender_id, recipient_id, consultation_id, content,
                is_read, created_at
         FROM messages WHERE sender_id = ? OR recipient_id = ?`
      )
      .bind(userId, userId)
      .all();

    // Fetch lawyer profile if applicable
    const lawyerProfile = await db
      .prepare(
        `SELECT id, bar_number, specializations, years_experience, languages,
                hourly_rate, bio, verification_status, verified_at,
                rating_average, rating_count, created_at
         FROM lawyers WHERE user_id = ?`
      )
      .bind(userId)
      .first();

    // Fetch activity log (last 90 days)
    const activityLogs = await db
      .prepare(
        `SELECT id, action, resource_type, resource_id, ip_address,
                user_agent, created_at
         FROM activity_logs
         WHERE user_id = ? AND created_at > datetime('now', '-90 days')
         ORDER BY created_at DESC`
      )
      .bind(userId)
      .all();

    // Get list of uploaded files
    const files = await db
      .prepare(
        `SELECT id, filename, file_type, file_size, storage_key, created_at
         FROM uploads WHERE user_id = ?`
      )
      .bind(userId)
      .all();

    // Compile export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      dataSubject: {
        profile: user,
        lawyerProfile: lawyerProfile || null,
      },
      documents: documents.results || [],
      signatures: signatures.results || [],
      cases: cases.results || [],
      consultations: consultations.results || [],
      messages: messages.results || [],
      files: files.results || [],
      activityLogs: activityLogs.results || [],
      metadata: {
        totalDocuments: documents.results?.length || 0,
        totalSignatures: signatures.results?.length || 0,
        totalCases: cases.results?.length || 0,
        totalConsultations: consultations.results?.length || 0,
        totalMessages: messages.results?.length || 0,
        totalFiles: files.results?.length || 0,
      },
    };

    return c.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('Data export error:', error);
    return c.json(Errors.internal('Failed to export data').toJSON(), 500);
  }
});

/**
 * GET /api/gdpr/export/download
 * Download exported data as a JSON file
 */
gdpr.get('/export/download', authMiddleware, rateLimiters.sensitive, async (c) => {
  const userId = c.get('userId');
  const userEmail = c.get('userEmail');
  const db = c.env.DB;

  try {
    // Reuse the export logic
    const exportResponse = await fetch(c.req.url.replace('/download', ''), {
      headers: c.req.raw.headers,
    });

    if (!exportResponse.ok) {
      return c.json(Errors.internal('Failed to generate export').toJSON(), 500);
    }

    const exportData = await exportResponse.json();

    // Return as downloadable JSON file
    const filename = `qannoni-data-export-${userEmail}-${new Date().toISOString().split('T')[0]}.json`;

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Download export error:', error);
    return c.json(Errors.internal('Failed to download export').toJSON(), 500);
  }
});

// ============================================
// DATA DELETION (Right to Erasure)
// ============================================

/**
 * DELETE /api/gdpr/account
 * Permanently delete user account and all associated data (GDPR Article 17)
 */
gdpr.delete(
  '/account',
  authMiddleware,
  rateLimiters.sensitive,
  zValidator('json', deleteAccountSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const db = c.env.DB;
    const storage = c.env.STORAGE;

    try {
      // Verify password
      const user = await db
        .prepare('SELECT password_hash, email FROM users WHERE id = ?')
        .bind(userId)
        .first<{ password_hash: string; email: string }>();

      if (!user) {
        return c.json(Errors.notFound('User').toJSON(), 404);
      }

      const valid = await verifyPassword(body.password, user.password_hash);
      if (!valid) {
        return c.json(Errors.badRequest('Incorrect password').toJSON(), 400);
      }

      // Begin deletion process
      // Note: D1 doesn't support transactions, so we do sequential deletions

      // 1. Delete uploaded files from R2
      const uploads = await db
        .prepare('SELECT storage_key FROM uploads WHERE user_id = ?')
        .bind(userId)
        .all<{ storage_key: string }>();

      for (const upload of uploads.results || []) {
        try {
          await storage.delete(upload.storage_key);
        } catch (e) {
          console.error(`Failed to delete file ${upload.storage_key}:`, e);
        }
      }

      // 2. Delete activity logs
      await db
        .prepare('DELETE FROM activity_logs WHERE user_id = ?')
        .bind(userId)
        .run();

      // 3. Delete messages
      await db
        .prepare('DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?')
        .bind(userId, userId)
        .run();

      // 4. Delete consultations (anonymize if involved as lawyer)
      await db
        .prepare('DELETE FROM consultations WHERE client_id = ?')
        .bind(userId)
        .run();

      // Anonymize consultations where user was the lawyer
      await db
        .prepare(
          `UPDATE consultations SET notes = '[DELETED]'
           WHERE lawyer_id = ?`
        )
        .bind(userId)
        .run();

      // 5. Delete cases
      await db
        .prepare('DELETE FROM cases WHERE user_id = ?')
        .bind(userId)
        .run();

      // 6. Delete signature requests (owned documents)
      await db
        .prepare(
          `DELETE FROM signature_requests
           WHERE document_id IN (SELECT id FROM documents WHERE user_id = ?)`
        )
        .bind(userId)
        .run();

      // 7. Delete documents
      await db
        .prepare('DELETE FROM documents WHERE user_id = ?')
        .bind(userId)
        .run();

      // 8. Delete lawyer profile if exists
      await db
        .prepare('DELETE FROM lawyers WHERE user_id = ?')
        .bind(userId)
        .run();

      // 9. Delete uploads records
      await db
        .prepare('DELETE FROM uploads WHERE user_id = ?')
        .bind(userId)
        .run();

      // 10. Delete notifications
      await db
        .prepare('DELETE FROM notifications WHERE user_id = ?')
        .bind(userId)
        .run();

      // 11. Finally, delete the user account
      await db
        .prepare('DELETE FROM users WHERE id = ?')
        .bind(userId)
        .run();

      // Clear authentication cookies
      clearAuthCookies(c);

      // Log deletion for audit (anonymized)
      console.log(`[GDPR] Account deleted: ${user.email.substring(0, 3)}***`);

      return c.json({
        success: true,
        data: {
          message: 'Your account and all associated data have been permanently deleted.',
          deletedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Account deletion error:', error);
      return c.json(Errors.internal('Failed to delete account').toJSON(), 500);
    }
  }
);

// ============================================
// DATA SUBJECT RIGHTS INFO
// ============================================

/**
 * GET /api/gdpr/rights
 * Information about data subject rights
 */
gdpr.get('/rights', async (c) => {
  return c.json({
    success: true,
    data: {
      rights: [
        {
          name: 'Right of Access',
          description: 'You can request a copy of all personal data we hold about you.',
          endpoint: 'GET /api/gdpr/export',
        },
        {
          name: 'Right to Portability',
          description: 'You can download your data in a machine-readable format (JSON).',
          endpoint: 'GET /api/gdpr/export/download',
        },
        {
          name: 'Right to Erasure',
          description: 'You can request permanent deletion of your account and all data.',
          endpoint: 'DELETE /api/gdpr/account',
        },
        {
          name: 'Right to Rectification',
          description: 'You can update your personal information at any time.',
          endpoint: 'PATCH /api/auth/profile',
        },
        {
          name: 'Right to Object',
          description: 'Contact us to object to processing of your data.',
          contact: 'privacy@qannoni.com',
        },
      ],
      dataRetention: {
        activeAccounts: 'Data retained while account is active',
        deletedAccounts: 'All data permanently deleted upon account deletion',
        activityLogs: '90 days',
        securityLogs: '90 days',
      },
      dataController: {
        name: 'Qannoni',
        email: 'privacy@qannoni.com',
        address: 'Dubai, United Arab Emirates',
      },
      applicableLaws: [
        'EU General Data Protection Regulation (GDPR)',
        'UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021)',
      ],
    },
  });
});

export { gdpr };
