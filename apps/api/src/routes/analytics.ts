import { Hono } from 'hono';
import { authMiddleware } from '../middleware/index.js';
import { Errors } from '../lib/errors.js';
import { getAnalyticsStats, getUserActivitySummary } from '../lib/analytics.js';

// Types for Cloudflare bindings
type Bindings = {
  DB: D1Database;
};

type Variables = {
  userId: string;
  userRole: string;
};

const analytics = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * GET /api/analytics/stats
 * Get overall analytics statistics (admin only)
 */
analytics.get('/stats', authMiddleware, async (c) => {
  const userRole = c.get('userRole');

  // Only admins can access overall analytics
  if (userRole !== 'admin') {
    return c.json(Errors.forbidden('Admin access required').toJSON(), 403);
  }

  const { startDate, endDate } = c.req.query();

  // Default to last 30 days if no dates provided
  const end = endDate || new Date().toISOString();
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const stats = await getAnalyticsStats(c.env.DB, start, end);

    return c.json({
      success: true,
      data: {
        ...stats,
        dateRange: { start, end },
      },
    });
  } catch (error) {
    console.error('Failed to get analytics stats:', error);
    return c.json(Errors.internal('Failed to retrieve analytics').toJSON(), 500);
  }
});

/**
 * GET /api/analytics/me
 * Get current user's activity summary
 */
analytics.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  try {
    const summary = await getUserActivitySummary(c.env.DB, userId);

    return c.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Failed to get user activity summary:', error);
    return c.json(Errors.internal('Failed to retrieve activity summary').toJSON(), 500);
  }
});

/**
 * GET /api/analytics/events
 * Get recent analytics events (admin only)
 */
analytics.get('/events', authMiddleware, async (c) => {
  const userRole = c.get('userRole');

  // Only admins can access raw events
  if (userRole !== 'admin') {
    return c.json(Errors.forbidden('Admin access required').toJSON(), 403);
  }

  const { limit = '50', offset = '0', eventType, userId } = c.req.query();

  try {
    let query = `
      SELECT id, event_type, user_id, properties, country, created_at
      FROM analytics_events
      WHERE 1=1
    `;
    const params: any[] = [];

    if (eventType) {
      query += ' AND event_type = ?';
      params.push(eventType);
    }

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const result = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      success: true,
      data: {
        events: (result.results || []).map((row: any) => ({
          id: row.id,
          eventType: row.event_type,
          userId: row.user_id,
          properties: row.properties ? JSON.parse(row.properties) : null,
          country: row.country,
          createdAt: row.created_at,
        })),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      },
    });
  } catch (error) {
    console.error('Failed to get analytics events:', error);
    return c.json(Errors.internal('Failed to retrieve events').toJSON(), 500);
  }
});

/**
 * GET /api/analytics/dashboard
 * Get dashboard metrics (admin only)
 */
analytics.get('/dashboard', authMiddleware, async (c) => {
  const userRole = c.get('userRole');

  if (userRole !== 'admin') {
    return c.json(Errors.forbidden('Admin access required').toJSON(), 403);
  }

  try {
    // Get various metrics in parallel
    const [
      totalUsers,
      totalDocuments,
      totalSignatures,
      totalConsultations,
      recentRegistrations,
      popularDocTypes,
    ] = await Promise.all([
      // Total users
      c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>(),

      // Total documents
      c.env.DB.prepare('SELECT COUNT(*) as count FROM documents').first<{ count: number }>(),

      // Total signature requests (from analytics)
      c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM analytics_events
        WHERE event_type = 'signature_requested'
      `).first<{ count: number }>(),

      // Total consultations
      c.env.DB.prepare('SELECT COUNT(*) as count FROM consultations').first<{ count: number }>(),

      // Recent registrations (last 7 days)
      c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM analytics_events
        WHERE event_type = 'user_registered'
          AND created_at >= datetime('now', '-7 days')
      `).first<{ count: number }>(),

      // Popular document types (last 30 days)
      c.env.DB.prepare(`
        SELECT json_extract(properties, '$.documentType') as type, COUNT(*) as count
        FROM analytics_events
        WHERE event_type IN ('document_created', 'document_generated')
          AND created_at >= datetime('now', '-30 days')
          AND properties IS NOT NULL
        GROUP BY type
        ORDER BY count DESC
        LIMIT 5
      `).all(),
    ]);

    return c.json({
      success: true,
      data: {
        totals: {
          users: totalUsers?.count || 0,
          documents: totalDocuments?.count || 0,
          signatures: totalSignatures?.count || 0,
          consultations: totalConsultations?.count || 0,
        },
        recent: {
          registrationsLast7Days: recentRegistrations?.count || 0,
        },
        popularDocumentTypes: (popularDocTypes.results || []).map((row: any) => ({
          type: row.type || 'unknown',
          count: row.count,
        })),
      },
    });
  } catch (error) {
    console.error('Failed to get dashboard metrics:', error);
    return c.json(Errors.internal('Failed to retrieve dashboard metrics').toJSON(), 500);
  }
});

export { analytics };
