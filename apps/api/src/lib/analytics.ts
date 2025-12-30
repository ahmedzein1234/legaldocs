/**
 * Analytics Service - Event Tracking for Qannoni
 *
 * Tracks key user events and business metrics for product analytics.
 * Stores events in D1 database for analysis and reporting.
 */

// ============================================
// EVENT TYPES
// ============================================

export type AnalyticsEventType =
  // User Events
  | 'user_registered'
  | 'user_logged_in'
  | 'user_logged_out'
  | 'user_profile_updated'
  // Document Events
  | 'document_created'
  | 'document_generated'
  | 'document_viewed'
  | 'document_downloaded'
  | 'document_deleted'
  | 'document_shared'
  | 'document_searched'
  | 'recommendations_viewed'
  // Template Events
  | 'template_viewed'
  | 'template_used'
  // Signature Events
  | 'signature_requested'
  | 'signature_viewed'
  | 'signature_completed'
  | 'signature_declined'
  | 'signature_reminder_sent'
  // AI Events
  | 'ai_document_generated'
  | 'ai_advisor_query'
  | 'ai_contract_reviewed'
  | 'ai_ocr_extraction'
  // Consultation Events
  | 'consultation_booked'
  | 'consultation_completed'
  | 'consultation_cancelled'
  // Lawyer Events
  | 'lawyer_registered'
  | 'lawyer_verified'
  | 'lawyer_profile_viewed'
  // Case Events
  | 'case_created'
  | 'case_updated'
  | 'case_closed'
  // Payment Events
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  // Feature Usage
  | 'feature_used';

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export interface AnalyticsContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  locale?: string;
}

// ============================================
// ANALYTICS SERVICE
// ============================================

export class AnalyticsService {
  private db: D1Database;
  private context: AnalyticsContext;

  constructor(db: D1Database, context: AnalyticsContext = {}) {
    this.db = db;
    this.context = context;
  }

  /**
   * Track an analytics event
   */
  async track(event: AnalyticsEvent): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const timestamp = event.timestamp || new Date().toISOString();

      await this.db
        .prepare(`
          INSERT INTO analytics_events (
            id, event_type, user_id, session_id,
            properties, user_agent, ip_address, country, locale,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          eventId,
          event.eventType,
          event.userId || this.context.userId || null,
          event.sessionId || this.context.sessionId || null,
          event.properties ? JSON.stringify(event.properties) : null,
          this.context.userAgent || null,
          this.context.ipAddress || null,
          this.context.country || null,
          this.context.locale || null,
          timestamp
        )
        .run();

      return { success: true, eventId };
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Track multiple events in batch
   */
  async trackBatch(events: AnalyticsEvent[]): Promise<{ success: boolean; tracked: number; failed: number }> {
    let tracked = 0;
    let failed = 0;

    for (const event of events) {
      const result = await this.track(event);
      if (result.success) {
        tracked++;
      } else {
        failed++;
      }
    }

    return { success: failed === 0, tracked, failed };
  }

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  // User Events
  async trackUserRegistered(userId: string, properties?: Record<string, any>) {
    return this.track({ eventType: 'user_registered', userId, properties });
  }

  async trackUserLoggedIn(userId: string, properties?: Record<string, any>) {
    return this.track({ eventType: 'user_logged_in', userId, properties });
  }

  // Document Events
  async trackDocumentCreated(userId: string, documentId: string, documentType: string, language?: string) {
    return this.track({
      eventType: 'document_created',
      userId,
      properties: { documentId, documentType, language },
    });
  }

  async trackDocumentGenerated(userId: string, documentId: string, documentType: string, aiModel?: string) {
    return this.track({
      eventType: 'document_generated',
      userId,
      properties: { documentId, documentType, aiModel },
    });
  }

  async trackDocumentViewed(userId: string, documentId: string) {
    return this.track({
      eventType: 'document_viewed',
      userId,
      properties: { documentId },
    });
  }

  async trackDocumentDownloaded(userId: string, documentId: string, format?: string) {
    return this.track({
      eventType: 'document_downloaded',
      userId,
      properties: { documentId, format },
    });
  }

  async trackDocumentShared(userId: string, documentId: string, recipientCount: number) {
    return this.track({
      eventType: 'document_shared',
      userId,
      properties: { documentId, recipientCount },
    });
  }

  // Template Events
  async trackTemplateViewed(userId: string | undefined, templateId: string, templateType: string) {
    return this.track({
      eventType: 'template_viewed',
      userId,
      properties: { templateId, templateType },
    });
  }

  async trackTemplateUsed(userId: string, templateId: string, templateType: string) {
    return this.track({
      eventType: 'template_used',
      userId,
      properties: { templateId, templateType },
    });
  }

  // Signature Events
  async trackSignatureRequested(userId: string, requestId: string, signerCount: number, documentType: string) {
    return this.track({
      eventType: 'signature_requested',
      userId,
      properties: { requestId, signerCount, documentType },
    });
  }

  async trackSignatureCompleted(userId: string, requestId: string, signerId: string) {
    return this.track({
      eventType: 'signature_completed',
      userId,
      properties: { requestId, signerId },
    });
  }

  async trackSignatureDeclined(userId: string, requestId: string, signerId: string, reason?: string) {
    return this.track({
      eventType: 'signature_declined',
      userId,
      properties: { requestId, signerId, reason },
    });
  }

  // AI Events
  async trackAIDocumentGenerated(userId: string, documentType: string, language: string, tokensUsed?: number) {
    return this.track({
      eventType: 'ai_document_generated',
      userId,
      properties: { documentType, language, tokensUsed },
    });
  }

  async trackAIAdvisorQuery(userId: string, category: string, queryLength: number) {
    return this.track({
      eventType: 'ai_advisor_query',
      userId,
      properties: { category, queryLength },
    });
  }

  async trackAIOCRExtraction(userId: string, documentType: string, success: boolean) {
    return this.track({
      eventType: 'ai_ocr_extraction',
      userId,
      properties: { documentType, success },
    });
  }

  // Consultation Events
  async trackConsultationBooked(userId: string, consultationId: string, lawyerId: string, type: string) {
    return this.track({
      eventType: 'consultation_booked',
      userId,
      properties: { consultationId, lawyerId, type },
    });
  }

  async trackConsultationCompleted(userId: string, consultationId: string, duration: number, rating?: number) {
    return this.track({
      eventType: 'consultation_completed',
      userId,
      properties: { consultationId, duration, rating },
    });
  }

  // Lawyer Events
  async trackLawyerRegistered(lawyerId: string, emirate: string, specializations: string[]) {
    return this.track({
      eventType: 'lawyer_registered',
      userId: lawyerId,
      properties: { emirate, specializations },
    });
  }

  async trackLawyerVerified(lawyerId: string, verificationLevel: string) {
    return this.track({
      eventType: 'lawyer_verified',
      userId: lawyerId,
      properties: { verificationLevel },
    });
  }

  async trackLawyerProfileViewed(viewerId: string | undefined, lawyerId: string) {
    return this.track({
      eventType: 'lawyer_profile_viewed',
      userId: viewerId,
      properties: { lawyerId },
    });
  }

  // Case Events
  async trackCaseCreated(userId: string, caseId: string, caseType: string) {
    return this.track({
      eventType: 'case_created',
      userId,
      properties: { caseId, caseType },
    });
  }

  async trackCaseClosed(userId: string, caseId: string, outcome: string) {
    return this.track({
      eventType: 'case_closed',
      userId,
      properties: { caseId, outcome },
    });
  }

  // Payment Events
  async trackPaymentCompleted(userId: string, transactionId: string, amount: number, currency: string) {
    return this.track({
      eventType: 'payment_completed',
      userId,
      properties: { transactionId, amount, currency },
    });
  }

  // Feature Usage
  async trackFeatureUsed(userId: string, featureName: string, metadata?: Record<string, any>) {
    return this.track({
      eventType: 'feature_used',
      userId,
      properties: { featureName, ...metadata },
    });
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create an analytics service instance from Hono context
 */
export function createAnalyticsService(
  db: D1Database,
  options?: {
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    country?: string;
    locale?: string;
  }
): AnalyticsService {
  return new AnalyticsService(db, {
    userId: options?.userId,
    sessionId: options?.sessionId,
    userAgent: options?.userAgent,
    ipAddress: options?.ipAddress,
    country: options?.country,
    locale: options?.locale,
  });
}

// ============================================
// ANALYTICS AGGREGATION QUERIES
// ============================================

export interface AnalyticsStats {
  totalEvents: number;
  uniqueUsers: number;
  eventsByType: Record<string, number>;
  topDocumentTypes: Array<{ type: string; count: number }>;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
}

/**
 * Get analytics statistics for a date range
 */
export async function getAnalyticsStats(
  db: D1Database,
  startDate: string,
  endDate: string
): Promise<AnalyticsStats> {
  // Total events
  const totalResult = await db
    .prepare(`
      SELECT COUNT(*) as total FROM analytics_events
      WHERE created_at BETWEEN ? AND ?
    `)
    .bind(startDate, endDate)
    .first<{ total: number }>();

  // Unique users
  const usersResult = await db
    .prepare(`
      SELECT COUNT(DISTINCT user_id) as users FROM analytics_events
      WHERE user_id IS NOT NULL AND created_at BETWEEN ? AND ?
    `)
    .bind(startDate, endDate)
    .first<{ users: number }>();

  // Events by type
  const eventsByTypeResult = await db
    .prepare(`
      SELECT event_type, COUNT(*) as count FROM analytics_events
      WHERE created_at BETWEEN ? AND ?
      GROUP BY event_type
      ORDER BY count DESC
    `)
    .bind(startDate, endDate)
    .all();

  const eventsByType: Record<string, number> = {};
  for (const row of eventsByTypeResult.results || []) {
    eventsByType[(row as any).event_type] = (row as any).count;
  }

  // Top document types
  const docTypesResult = await db
    .prepare(`
      SELECT json_extract(properties, '$.documentType') as type, COUNT(*) as count
      FROM analytics_events
      WHERE event_type IN ('document_created', 'document_generated')
        AND created_at BETWEEN ? AND ?
        AND properties IS NOT NULL
      GROUP BY type
      ORDER BY count DESC
      LIMIT 10
    `)
    .bind(startDate, endDate)
    .all();

  const topDocumentTypes = (docTypesResult.results || []).map((row: any) => ({
    type: row.type || 'unknown',
    count: row.count,
  }));

  // Daily active users (last 24 hours)
  const dauResult = await db
    .prepare(`
      SELECT COUNT(DISTINCT user_id) as dau FROM analytics_events
      WHERE user_id IS NOT NULL
        AND created_at >= datetime('now', '-1 day')
    `)
    .first<{ dau: number }>();

  // Monthly active users (last 30 days)
  const mauResult = await db
    .prepare(`
      SELECT COUNT(DISTINCT user_id) as mau FROM analytics_events
      WHERE user_id IS NOT NULL
        AND created_at >= datetime('now', '-30 days')
    `)
    .first<{ mau: number }>();

  return {
    totalEvents: totalResult?.total || 0,
    uniqueUsers: usersResult?.users || 0,
    eventsByType,
    topDocumentTypes,
    dailyActiveUsers: dauResult?.dau || 0,
    monthlyActiveUsers: mauResult?.mau || 0,
  };
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(
  db: D1Database,
  userId: string
): Promise<{
  totalDocuments: number;
  totalSignatures: number;
  totalConsultations: number;
  lastActive: string | null;
  favoriteDocumentType: string | null;
}> {
  const documentsResult = await db
    .prepare(`
      SELECT COUNT(*) as count FROM analytics_events
      WHERE user_id = ? AND event_type IN ('document_created', 'document_generated')
    `)
    .bind(userId)
    .first<{ count: number }>();

  const signaturesResult = await db
    .prepare(`
      SELECT COUNT(*) as count FROM analytics_events
      WHERE user_id = ? AND event_type = 'signature_requested'
    `)
    .bind(userId)
    .first<{ count: number }>();

  const consultationsResult = await db
    .prepare(`
      SELECT COUNT(*) as count FROM analytics_events
      WHERE user_id = ? AND event_type = 'consultation_booked'
    `)
    .bind(userId)
    .first<{ count: number }>();

  const lastActiveResult = await db
    .prepare(`
      SELECT MAX(created_at) as last_active FROM analytics_events
      WHERE user_id = ?
    `)
    .bind(userId)
    .first<{ last_active: string }>();

  const favoriteTypeResult = await db
    .prepare(`
      SELECT json_extract(properties, '$.documentType') as type, COUNT(*) as count
      FROM analytics_events
      WHERE user_id = ?
        AND event_type IN ('document_created', 'document_generated')
        AND properties IS NOT NULL
      GROUP BY type
      ORDER BY count DESC
      LIMIT 1
    `)
    .bind(userId)
    .first<{ type: string; count: number }>();

  return {
    totalDocuments: documentsResult?.count || 0,
    totalSignatures: signaturesResult?.count || 0,
    totalConsultations: consultationsResult?.count || 0,
    lastActive: lastActiveResult?.last_active || null,
    favoriteDocumentType: favoriteTypeResult?.type || null,
  };
}
