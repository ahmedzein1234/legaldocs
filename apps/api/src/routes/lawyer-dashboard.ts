/**
 * Lawyer Dashboard & Analytics
 *
 * Comprehensive analytics and metrics for lawyers including:
 * - Performance overview
 * - Revenue analytics
 * - Client insights
 * - Case statistics
 * - Response time metrics
 * - Review analysis
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
// DASHBOARD OVERVIEW
// ============================================

/**
 * GET /api/lawyer-dashboard/overview
 * Get lawyer dashboard overview with key metrics
 */
app.get('/overview', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');

    // Get lawyer profile
    const lawyer = await db
      .prepare(`
        SELECT * FROM lawyers WHERE user_id = ?
      `)
      .bind(userId)
      .first();

    if (!lawyer) {
      return c.json({ success: false, error: { code: 'NOT_LAWYER', message: 'Lawyer profile not found' } }, 404);
    }

    const lawyerId = (lawyer as any).id;

    // Get current month dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    // Active consultations
    const activeConsultations = await db
      .prepare(`
        SELECT COUNT(*) as count FROM consultations
        WHERE lawyer_id = ? AND status IN ('pending', 'confirmed')
      `)
      .bind(lawyerId)
      .first<{ count: number }>();

    // This month's consultations
    const monthlyConsultations = await db
      .prepare(`
        SELECT COUNT(*) as count FROM consultations
        WHERE lawyer_id = ? AND created_at >= ?
      `)
      .bind(lawyerId, monthStart)
      .first<{ count: number }>();

    // Last month's consultations for comparison
    const lastMonthConsultations = await db
      .prepare(`
        SELECT COUNT(*) as count FROM consultations
        WHERE lawyer_id = ? AND created_at >= ? AND created_at < ?
      `)
      .bind(lawyerId, lastMonthStart, monthStart)
      .first<{ count: number }>();

    // This month's revenue
    const monthlyRevenue = await db
      .prepare(`
        SELECT COALESCE(SUM(fee_amount), 0) as total FROM consultations
        WHERE lawyer_id = ? AND payment_status = 'paid' AND created_at >= ?
      `)
      .bind(lawyerId, monthStart)
      .first<{ total: number }>();

    // Last month's revenue
    const lastMonthRevenue = await db
      .prepare(`
        SELECT COALESCE(SUM(fee_amount), 0) as total FROM consultations
        WHERE lawyer_id = ? AND payment_status = 'paid'
          AND created_at >= ? AND created_at < ?
      `)
      .bind(lawyerId, lastMonthStart, monthStart)
      .first<{ total: number }>();

    // Active engagements (quote work)
    const activeEngagements = await db
      .prepare(`
        SELECT COUNT(*) as count FROM lawyer_engagements
        WHERE lawyer_id = ? AND status IN ('active', 'review')
      `)
      .bind(lawyerId)
      .first<{ count: number }>();

    // Pending quotes
    const pendingQuotes = await db
      .prepare(`
        SELECT COUNT(*) as count FROM lawyer_quotes
        WHERE lawyer_id = ? AND status = 'pending'
      `)
      .bind(lawyerId)
      .first<{ count: number }>();

    // Unread messages
    const unreadMessages = await db
      .prepare(`
        SELECT COUNT(*) as count FROM conversation_messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE c.lawyer_id = ? AND m.sender_type = 'client' AND m.is_read = 0
      `)
      .bind(lawyerId)
      .first<{ count: number }>();

    // Recent reviews
    const recentReviews = await db
      .prepare(`
        SELECT * FROM lawyer_reviews
        WHERE lawyer_id = ? AND is_visible = 1
        ORDER BY created_at DESC LIMIT 5
      `)
      .bind(lawyerId)
      .all();

    // Rating distribution
    const ratingDistribution = await db
      .prepare(`
        SELECT overall_rating, COUNT(*) as count
        FROM lawyer_reviews
        WHERE lawyer_id = ? AND is_visible = 1
        GROUP BY overall_rating
        ORDER BY overall_rating DESC
      `)
      .bind(lawyerId)
      .all();

    // Calculate trends
    const consultationTrend = lastMonthConsultations?.count
      ? ((monthlyConsultations?.count || 0) - lastMonthConsultations.count) / lastMonthConsultations.count * 100
      : 0;

    const revenueTrend = lastMonthRevenue?.total
      ? ((monthlyRevenue?.total || 0) - lastMonthRevenue.total) / lastMonthRevenue.total * 100
      : 0;

    return c.json({
      success: true,
      data: {
        profile: {
          id: lawyerId,
          name: `${(lawyer as any).first_name} ${(lawyer as any).last_name}`,
          averageRating: (lawyer as any).average_rating,
          totalReviews: (lawyer as any).total_reviews,
          totalCasesCompleted: (lawyer as any).total_cases_completed,
          successRate: (lawyer as any).success_rate,
          verificationLevel: (lawyer as any).verification_level,
          featured: (lawyer as any).featured,
          isAvailable: (lawyer as any).is_available,
        },
        metrics: {
          activeConsultations: activeConsultations?.count || 0,
          monthlyConsultations: monthlyConsultations?.count || 0,
          consultationTrend: Math.round(consultationTrend),
          monthlyRevenue: monthlyRevenue?.total || 0,
          revenueTrend: Math.round(revenueTrend),
          activeEngagements: activeEngagements?.count || 0,
          pendingQuotes: pendingQuotes?.count || 0,
          unreadMessages: unreadMessages?.count || 0,
        },
        recentReviews: recentReviews.results || [],
        ratingDistribution: ratingDistribution.results || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch dashboard' } }, 500);
  }
});

/**
 * GET /api/lawyer-dashboard/analytics
 * Get detailed analytics for lawyer
 */
app.get('/analytics', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const period = c.req.query('period') || '30'; // days

    const lawyer = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    if (!lawyer) {
      return c.json({ success: false, error: { code: 'NOT_LAWYER', message: 'Lawyer profile not found' } }, 404);
    }

    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();

    // Daily consultations
    const dailyConsultations = await db
      .prepare(`
        SELECT
          DATE(scheduled_at) as date,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM consultations
        WHERE lawyer_id = ? AND created_at >= ?
        GROUP BY DATE(scheduled_at)
        ORDER BY date ASC
      `)
      .bind(lawyer.id, startDate)
      .all();

    // Revenue by period
    const revenueData = await db
      .prepare(`
        SELECT
          DATE(created_at) as date,
          SUM(fee_amount) as revenue,
          COUNT(*) as transactions
        FROM consultations
        WHERE lawyer_id = ? AND payment_status = 'paid' AND created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `)
      .bind(lawyer.id, startDate)
      .all();

    // Client acquisition
    const newClients = await db
      .prepare(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM consultations
        WHERE lawyer_id = ? AND created_at >= ?
          AND user_id NOT IN (
            SELECT DISTINCT user_id FROM consultations
            WHERE lawyer_id = ? AND created_at < ?
          )
      `)
      .bind(lawyer.id, startDate, lawyer.id, startDate)
      .first<{ count: number }>();

    const returningClients = await db
      .prepare(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM consultations c1
        WHERE lawyer_id = ? AND created_at >= ?
          AND EXISTS (
            SELECT 1 FROM consultations c2
            WHERE c2.lawyer_id = ? AND c2.user_id = c1.user_id
            AND c2.created_at < c1.created_at
          )
      `)
      .bind(lawyer.id, startDate, lawyer.id)
      .first<{ count: number }>();

    // Popular services/specializations
    const serviceBreakdown = await db
      .prepare(`
        SELECT
          consultation_type,
          COUNT(*) as count,
          SUM(fee_amount) as revenue
        FROM consultations
        WHERE lawyer_id = ? AND created_at >= ?
        GROUP BY consultation_type
        ORDER BY count DESC
      `)
      .bind(lawyer.id, startDate)
      .all();

    // Response time analytics
    const avgResponseTime = await db
      .prepare(`
        SELECT
          AVG(
            CAST(
              (julianday(confirmed_at) - julianday(created_at)) * 24 AS REAL
            )
          ) as avg_hours
        FROM consultations
        WHERE lawyer_id = ? AND confirmed_at IS NOT NULL AND created_at >= ?
      `)
      .bind(lawyer.id, startDate)
      .first<{ avg_hours: number }>();

    // Review trends
    const reviewTrend = await db
      .prepare(`
        SELECT
          strftime('%Y-%W', created_at) as week,
          AVG(overall_rating) as avg_rating,
          COUNT(*) as count
        FROM lawyer_reviews
        WHERE lawyer_id = ? AND created_at >= ?
        GROUP BY week
        ORDER BY week ASC
      `)
      .bind(lawyer.id, startDate)
      .all();

    return c.json({
      success: true,
      data: {
        period: parseInt(period),
        consultations: {
          daily: dailyConsultations.results || [],
          total: (dailyConsultations.results || []).reduce((sum: number, d: any) => sum + d.total, 0),
          completed: (dailyConsultations.results || []).reduce((sum: number, d: any) => sum + d.completed, 0),
          cancelled: (dailyConsultations.results || []).reduce((sum: number, d: any) => sum + d.cancelled, 0),
        },
        revenue: {
          daily: revenueData.results || [],
          total: (revenueData.results || []).reduce((sum: number, d: any) => sum + (d.revenue || 0), 0),
        },
        clients: {
          new: newClients?.count || 0,
          returning: returningClients?.count || 0,
          retentionRate: returningClients?.count && newClients?.count
            ? Math.round((returningClients.count / (newClients.count + returningClients.count)) * 100)
            : 0,
        },
        services: serviceBreakdown.results || [],
        performance: {
          avgResponseTimeHours: Math.round((avgResponseTime?.avg_hours || 0) * 10) / 10,
        },
        reviews: {
          trend: reviewTrend.results || [],
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch analytics' } }, 500);
  }
});

/**
 * GET /api/lawyer-dashboard/calendar
 * Get lawyer's schedule calendar view
 */
app.get('/calendar', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const startDate = c.req.query('start') || new Date().toISOString().split('T')[0];
    const endDate = c.req.query('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const lawyer = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    if (!lawyer) {
      return c.json({ success: false, error: { code: 'NOT_LAWYER', message: 'Lawyer profile not found' } }, 404);
    }

    // Get all scheduled events
    const consultations = await db
      .prepare(`
        SELECT
          c.id, c.scheduled_at, c.duration_minutes, c.consultation_type,
          c.status, c.topic, c.meeting_link,
          u.name as client_name
        FROM consultations c
        LEFT JOIN users u ON u.id = c.user_id
        WHERE c.lawyer_id = ?
          AND DATE(c.scheduled_at) >= ?
          AND DATE(c.scheduled_at) <= ?
          AND c.status NOT IN ('cancelled', 'declined')
        ORDER BY c.scheduled_at ASC
      `)
      .bind(lawyer.id, startDate, endDate)
      .all();

    // Get engagement deadlines
    const engagementDeadlines = await db
      .prepare(`
        SELECT
          e.id, e.due_date, e.status,
          qr.document_title
        FROM lawyer_engagements e
        LEFT JOIN quote_requests qr ON qr.id = e.request_id
        WHERE e.lawyer_id = ?
          AND DATE(e.due_date) >= ?
          AND DATE(e.due_date) <= ?
          AND e.status IN ('active', 'review')
        ORDER BY e.due_date ASC
      `)
      .bind(lawyer.id, startDate, endDate)
      .all();

    // Format events
    const events = [
      ...(consultations.results || []).map((c: any) => ({
        id: c.id,
        type: 'consultation',
        title: c.topic || `Consultation with ${c.client_name || 'Client'}`,
        start: c.scheduled_at,
        end: new Date(new Date(c.scheduled_at).getTime() + c.duration_minutes * 60000).toISOString(),
        status: c.status,
        consultationType: c.consultation_type,
        meetingLink: c.meeting_link,
        clientName: c.client_name,
      })),
      ...(engagementDeadlines.results || []).map((e: any) => ({
        id: e.id,
        type: 'deadline',
        title: `Deadline: ${e.document_title || 'Document review'}`,
        start: e.due_date,
        end: e.due_date,
        status: e.status,
        allDay: true,
      })),
    ];

    return c.json({
      success: true,
      data: {
        events,
        startDate,
        endDate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching calendar:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch calendar' } }, 500);
  }
});

/**
 * GET /api/lawyer-dashboard/earnings
 * Get detailed earnings report
 */
app.get('/earnings', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const year = parseInt(c.req.query('year') || new Date().getFullYear().toString());

    const lawyer = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    if (!lawyer) {
      return c.json({ success: false, error: { code: 'NOT_LAWYER', message: 'Lawyer profile not found' } }, 404);
    }

    // Monthly earnings
    const monthlyEarnings = await db
      .prepare(`
        SELECT
          strftime('%m', created_at) as month,
          SUM(fee_amount) as consultation_revenue,
          COUNT(*) as consultation_count
        FROM consultations
        WHERE lawyer_id = ?
          AND payment_status = 'paid'
          AND strftime('%Y', created_at) = ?
        GROUP BY month
        ORDER BY month ASC
      `)
      .bind(lawyer.id, year.toString())
      .all();

    // Engagement earnings
    const engagementEarnings = await db
      .prepare(`
        SELECT
          strftime('%m', completed_at) as month,
          SUM(amount) as engagement_revenue,
          SUM(platform_fee) as platform_fees,
          COUNT(*) as engagement_count
        FROM lawyer_engagements
        WHERE lawyer_id = ?
          AND payment_status = 'fully_paid'
          AND strftime('%Y', completed_at) = ?
        GROUP BY month
        ORDER BY month ASC
      `)
      .bind(lawyer.id, year.toString())
      .all();

    // Total earnings
    const totalConsultationRevenue = (monthlyEarnings.results || [])
      .reduce((sum: number, m: any) => sum + (m.consultation_revenue || 0), 0);

    const totalEngagementRevenue = (engagementEarnings.results || [])
      .reduce((sum: number, e: any) => sum + (e.engagement_revenue || 0), 0);

    const totalPlatformFees = (engagementEarnings.results || [])
      .reduce((sum: number, e: any) => sum + (e.platform_fees || 0), 0);

    // Pending payments
    const pendingPayments = await db
      .prepare(`
        SELECT
          SUM(fee_amount) as pending_consultations,
          (SELECT SUM(amount - COALESCE(deposit_amount, 0)) FROM lawyer_engagements
           WHERE lawyer_id = ? AND payment_status = 'deposit_paid') as pending_engagements
        FROM consultations
        WHERE lawyer_id = ? AND payment_status = 'pending' AND status = 'confirmed'
      `)
      .bind(lawyer.id, lawyer.id)
      .first<{ pending_consultations: number; pending_engagements: number }>();

    return c.json({
      success: true,
      data: {
        year,
        summary: {
          totalRevenue: totalConsultationRevenue + totalEngagementRevenue,
          consultationRevenue: totalConsultationRevenue,
          engagementRevenue: totalEngagementRevenue,
          platformFees: totalPlatformFees,
          netEarnings: totalConsultationRevenue + totalEngagementRevenue - totalPlatformFees,
          pendingPayments: (pendingPayments?.pending_consultations || 0) + (pendingPayments?.pending_engagements || 0),
        },
        monthly: {
          consultations: monthlyEarnings.results || [],
          engagements: engagementEarnings.results || [],
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch earnings' } }, 500);
  }
});

/**
 * GET /api/lawyer-dashboard/clients
 * Get client list and insights
 */
app.get('/clients', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    const sort = c.req.query('sort') || 'recent'; // recent, revenue, consultations

    const lawyer = await db
      .prepare('SELECT id FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string }>();

    if (!lawyer) {
      return c.json({ success: false, error: { code: 'NOT_LAWYER', message: 'Lawyer profile not found' } }, 404);
    }

    let orderBy = 'last_consultation DESC';
    if (sort === 'revenue') {
      orderBy = 'total_revenue DESC';
    } else if (sort === 'consultations') {
      orderBy = 'consultation_count DESC';
    }

    const clients = await db
      .prepare(`
        SELECT
          u.id, u.name, u.email,
          COUNT(c.id) as consultation_count,
          SUM(CASE WHEN c.payment_status = 'paid' THEN c.fee_amount ELSE 0 END) as total_revenue,
          MAX(c.scheduled_at) as last_consultation,
          MIN(c.scheduled_at) as first_consultation
        FROM users u
        JOIN consultations c ON c.user_id = u.id
        WHERE c.lawyer_id = ?
        GROUP BY u.id
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `)
      .bind(lawyer.id, limit, offset)
      .all();

    const countResult = await db
      .prepare(`
        SELECT COUNT(DISTINCT user_id) as total
        FROM consultations WHERE lawyer_id = ?
      `)
      .bind(lawyer.id)
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        clients: clients.results || [],
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch clients' } }, 500);
  }
});

/**
 * GET /api/lawyer-dashboard/quote-requests
 * Get available quote requests to respond to
 */
app.get('/quote-requests', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const status = c.req.query('status') || 'open';
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const lawyer = await db
      .prepare('SELECT id, specializations, emirate FROM lawyers WHERE user_id = ?')
      .bind(userId)
      .first<{ id: string; specializations: string; emirate: string }>();

    if (!lawyer) {
      return c.json({ success: false, error: { code: 'NOT_LAWYER', message: 'Lawyer profile not found' } }, 404);
    }

    // Get quote requests matching lawyer's specializations
    const requests = await db
      .prepare(`
        SELECT
          qr.*,
          (SELECT COUNT(*) FROM lawyer_quotes WHERE request_id = qr.id) as quote_count,
          (SELECT 1 FROM lawyer_quotes WHERE request_id = qr.id AND lawyer_id = ?) as already_quoted
        FROM quote_requests qr
        WHERE qr.status = ?
          AND qr.expires_at > datetime('now')
        ORDER BY qr.urgency DESC, qr.created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(lawyer.id, status, limit, offset)
      .all();

    const countResult = await db
      .prepare(`
        SELECT COUNT(*) as total FROM quote_requests
        WHERE status = ? AND expires_at > datetime('now')
      `)
      .bind(status)
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        requests: requests.results || [],
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching quote requests:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch quote requests' } }, 500);
  }
});

export { app as lawyerDashboard };
