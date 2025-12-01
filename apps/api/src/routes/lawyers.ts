/**
 * Lawyer Verification & Management Routes
 *
 * Comprehensive lawyer verification system for UAE/GCC market
 * Supports multi-level verification with UAE-specific authorities
 */

import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  calculateMatchScore,
  rankLawyers,
  getMatchExplanation,
  type MatchPreferences,
  type LawyerProfile,
} from '../lib/lawyer-matching.js';

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
// PUBLIC ROUTES - Lawyer Discovery
// ============================================

/**
 * GET /api/lawyers
 * List all verified lawyers with filtering and sorting
 */
app.get('/', async (c) => {
  try {
    const db = c.env.DB;

    // Query parameters
    const emirate = c.req.query('emirate');
    const specialization = c.req.query('specialization');
    const language = c.req.query('language');
    const minRating = parseFloat(c.req.query('rating') || '0');
    const sortBy = c.req.query('sort') || 'rating'; // rating, experience, price, response_time
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = ['is_active = 1', 'verification_status = "verified"'];
    const params: any[] = [];

    if (emirate) {
      conditions.push('emirate = ?');
      params.push(emirate);
    }

    if (language) {
      // Note: SQLite doesn't have native JSON array search, need to use LIKE
      conditions.push('languages LIKE ?');
      params.push(`%"${language}"%`);
    }

    if (minRating > 0) {
      conditions.push('average_rating >= ?');
      params.push(minRating);
    }

    if (specialization) {
      conditions.push('specializations LIKE ?');
      params.push(`%"${specialization}"%`);
    }

    // Build ORDER BY
    let orderBy = 'featured DESC, ';
    switch (sortBy) {
      case 'experience':
        orderBy += 'years_experience DESC';
        break;
      case 'price':
        orderBy += 'consultation_fee ASC';
        break;
      case 'response_time':
        orderBy += 'response_time_hours ASC';
        break;
      default:
        orderBy += 'average_rating DESC, total_reviews DESC';
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM lawyers WHERE ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    // Get lawyers
    const lawyers = await db
      .prepare(`
        SELECT
          id, first_name, last_name, first_name_ar, last_name_ar,
          title, title_ar, bio, bio_ar, avatar_url,
          emirate, city, years_experience, languages, specializations,
          bar_association, consultation_fee, hourly_rate, currency,
          is_available, response_time_hours, accepting_new_clients,
          total_cases_completed, total_reviews, average_rating, success_rate,
          verification_level, featured, top_rated
        FROM lawyers
        WHERE ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `)
      .bind(...params, limit, offset)
      .all();

    // Get badges for each lawyer
    const lawyerIds = lawyers.results?.map((l: any) => l.id) || [];
    let badges = [];

    if (lawyerIds.length > 0) {
      const placeholders = lawyerIds.map(() => '?').join(',');
      badges = await db
        .prepare(`
          SELECT lawyer_id, badge_type, badge_name, badge_name_ar, badge_icon, badge_color
          FROM lawyer_badges
          WHERE lawyer_id IN (${placeholders}) AND is_active = 1
          ORDER BY display_order ASC
        `)
        .bind(...lawyerIds)
        .all();
    }

    // Attach badges to lawyers
    const lawyersWithBadges = lawyers.results?.map((lawyer: any) => ({
      ...lawyer,
      languages: JSON.parse(lawyer.languages || '[]'),
      specializations: JSON.parse(lawyer.specializations || '[]'),
      badges: badges.results?.filter((b: any) => b.lawyer_id === lawyer.id) || [],
    }));

    return c.json({
      success: true,
      data: {
        lawyers: lawyersWithBadges,
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching lawyers:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'FETCH_LAWYERS_FAILED',
          message: 'Failed to fetch lawyers',
        },
      },
      500
    );
  }
});

/**
 * GET /api/lawyers/:id
 * Get detailed lawyer profile
 */
app.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const { id } = c.req.param();

    // Get lawyer details
    const lawyer = await db
      .prepare(`
        SELECT * FROM lawyers WHERE id = ? AND is_active = 1
      `)
      .bind(id)
      .first();

    if (!lawyer) {
      return c.json(
        {
          success: false,
          error: {
            code: 'LAWYER_NOT_FOUND',
            message: 'Lawyer not found',
          },
        },
        404
      );
    }

    // Get badges
    const badges = await db
      .prepare(`
        SELECT * FROM lawyer_badges
        WHERE lawyer_id = ? AND is_active = 1
        ORDER BY display_order ASC
      `)
      .bind(id)
      .all();

    // Get published reviews
    const reviews = await db
      .prepare(`
        SELECT
          id, rating, title, comment,
          communication_rating, professionalism_rating, expertise_rating, value_rating,
          lawyer_response, responded_at, created_at, is_verified
        FROM lawyer_reviews
        WHERE lawyer_id = ? AND is_published = 1
        ORDER BY created_at DESC
        LIMIT 20
      `)
      .bind(id)
      .all();

    return c.json({
      success: true,
      data: {
        lawyer: {
          ...lawyer,
          languages: JSON.parse((lawyer as any).languages || '[]'),
          specializations: JSON.parse((lawyer as any).specializations || '[]'),
        },
        badges: badges.results || [],
        reviews: reviews.results || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching lawyer:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'FETCH_LAWYER_FAILED',
          message: 'Failed to fetch lawyer details',
        },
      },
      500
    );
  }
});

// ============================================
// LAWYER ROUTES - Profile Management
// ============================================

/**
 * POST /api/lawyers/register
 * Register as a new lawyer
 */
app.post('/register', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const body = await c.req.json();

    const {
      firstName,
      lastName,
      firstNameAr,
      lastNameAr,
      title,
      titleAr,
      bio,
      bioAr,
      email,
      phone,
      emirate,
      city,
      officeAddress,
      yearsExperience,
      languages,
      specializations,
      barAssociation,
      barLicenseNumber,
      consultationFee,
      hourlyRate,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !emirate) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
          },
        },
        400
      );
    }

    // Check if email already registered
    const existing = await db
      .prepare('SELECT id FROM lawyers WHERE email = ?')
      .bind(email)
      .first();

    if (existing) {
      return c.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
          },
        },
        400
      );
    }

    // Create lawyer profile
    const lawyerId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO lawyers (
          id, user_id, first_name, last_name, first_name_ar, last_name_ar,
          title, title_ar, bio, bio_ar, email, phone,
          emirate, city, office_address, years_experience,
          languages, specializations, bar_association, bar_license_number,
          consultation_fee, hourly_rate, verification_status, verification_level,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          'pending', 'none', datetime('now'), datetime('now')
        )
      `)
      .bind(
        lawyerId,
        userId,
        firstName,
        lastName,
        firstNameAr || null,
        lastNameAr || null,
        title || null,
        titleAr || null,
        bio || null,
        bioAr || null,
        email,
        phone || null,
        emirate,
        city || null,
        officeAddress || null,
        yearsExperience || 0,
        JSON.stringify(languages || ['en', 'ar']),
        JSON.stringify(specializations || []),
        barAssociation || null,
        barLicenseNumber || null,
        consultationFee || null,
        hourlyRate || null
      )
      .run();

    // Create audit log
    await db
      .prepare(`
        INSERT INTO lawyer_audit_logs (
          id, lawyer_id, action, action_category, performed_by, performed_by_type, created_at
        ) VALUES (?, ?, 'profile_created', 'profile', ?, 'lawyer', datetime('now'))
      `)
      .bind(crypto.randomUUID(), lawyerId, userId)
      .run();

    return c.json({
      success: true,
      data: {
        lawyerId,
        message: 'Lawyer profile created successfully',
      },
    }, 201);
  } catch (error: any) {
    console.error('Error registering lawyer:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Failed to register lawyer profile',
        },
      },
      500
    );
  }
});

/**
 * PATCH /api/lawyers/:id
 * Update lawyer profile
 */
app.patch('/:id', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json();

    // Verify ownership
    const lawyer = await db
      .prepare('SELECT user_id FROM lawyers WHERE id = ?')
      .bind(id)
      .first<{ user_id: string }>();

    if (!lawyer || lawyer.user_id !== userId) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized to update this profile',
          },
        },
        403
      );
    }

    // Build update query dynamically
    const allowedFields = [
      'first_name', 'last_name', 'first_name_ar', 'last_name_ar',
      'title', 'title_ar', 'bio', 'bio_ar', 'phone', 'emirate', 'city',
      'office_address', 'years_experience', 'languages', 'specializations',
      'consultation_fee', 'hourly_rate', 'is_available', 'response_time_hours',
      'accepting_new_clients', 'avatar_url',
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(body)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        updates.push(`${snakeKey} = ?`);
        if (snakeKey === 'languages' || snakeKey === 'specializations') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }

    if (updates.length === 0) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No valid fields to update',
          },
        },
        400
      );
    }

    updates.push('updated_at = datetime("now")');
    values.push(id);

    await db
      .prepare(`UPDATE lawyers SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return c.json({
      success: true,
      data: {
        message: 'Profile updated successfully',
      },
    });
  } catch (error: any) {
    console.error('Error updating lawyer:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update profile',
        },
      },
      500
    );
  }
});

// ============================================
// VERIFICATION ROUTES
// ============================================

/**
 * POST /api/lawyers/:id/verification
 * Submit verification documents
 */
app.post('/:id/verification', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json();

    const {
      verificationType, // email, phone, identity, professional, enhanced
      documentType,
      documentUrl,
      documentBackUrl,
      emiratesId,
      emiratesIdExpiry,
      passportNumber,
      passportExpiry,
      nationality,
      dateOfBirth,
      licenseAuthority,
      licenseNumber,
      licenseIssueDate,
      licenseExpiryDate,
      practicingCertUrl,
      reference1Name,
      reference1Contact,
      reference2Name,
      reference2Contact,
    } = body;

    // Verify ownership
    const lawyer = await db
      .prepare('SELECT user_id, verification_level FROM lawyers WHERE id = ?')
      .bind(id)
      .first<{ user_id: string; verification_level: string }>();

    if (!lawyer || lawyer.user_id !== userId) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized',
          },
        },
        403
      );
    }

    // Create verification record
    const verificationId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO lawyer_verifications (
          id, lawyer_id, verification_type, status,
          document_type, document_url, document_back_url,
          emirates_id, emirates_id_expiry, passport_number, passport_expiry,
          nationality, date_of_birth,
          license_authority, license_number, license_issue_date, license_expiry_date,
          practicing_cert_url,
          reference1_name, reference1_contact, reference2_name, reference2_contact,
          submitted_at
        ) VALUES (
          ?, ?, ?, 'pending',
          ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?,
          ?,
          ?, ?, ?, ?,
          datetime('now')
        )
      `)
      .bind(
        verificationId,
        id,
        verificationType,
        documentType || null,
        documentUrl || null,
        documentBackUrl || null,
        emiratesId || null,
        emiratesIdExpiry || null,
        passportNumber || null,
        passportExpiry || null,
        nationality || null,
        dateOfBirth || null,
        licenseAuthority || null,
        licenseNumber || null,
        licenseIssueDate || null,
        licenseExpiryDate || null,
        practicingCertUrl || null,
        reference1Name || null,
        reference1Contact || null,
        reference2Name || null,
        reference2Contact || null
      )
      .run();

    // Update lawyer verification status
    await db
      .prepare(`
        UPDATE lawyers
        SET verification_status = 'in_review', updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(id)
      .run();

    return c.json({
      success: true,
      data: {
        verificationId,
        message: 'Verification submitted successfully',
      },
    }, 201);
  } catch (error: any) {
    console.error('Error submitting verification:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: 'Failed to submit verification',
        },
      },
      500
    );
  }
});

/**
 * GET /api/lawyers/:id/verifications
 * Get verification history
 */
app.get('/:id/verifications', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const { id } = c.req.param();

    // Verify ownership or admin
    const lawyer = await db
      .prepare('SELECT user_id FROM lawyers WHERE id = ?')
      .bind(id)
      .first<{ user_id: string }>();

    if (!lawyer || (lawyer.user_id !== userId && userRole !== 'admin')) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized',
          },
        },
        403
      );
    }

    const verifications = await db
      .prepare(`
        SELECT * FROM lawyer_verifications
        WHERE lawyer_id = ?
        ORDER BY submitted_at DESC
      `)
      .bind(id)
      .all();

    return c.json({
      success: true,
      data: {
        verifications: verifications.results || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching verifications:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch verifications',
        },
      },
      500
    );
  }
});

// ============================================
// ADMIN ROUTES - Verification Review
// ============================================

/**
 * GET /api/lawyers/admin/pending
 * Get pending verifications (Admin only)
 */
app.get('/admin/pending', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;

    const pending = await db
      .prepare(`
        SELECT
          lv.*,
          l.first_name, l.last_name, l.email, l.emirate
        FROM lawyer_verifications lv
        JOIN lawyers l ON l.id = lv.lawyer_id
        WHERE lv.status = 'pending' OR lv.status = 'in_review'
        ORDER BY lv.submitted_at ASC
      `)
      .all();

    return c.json({
      success: true,
      data: {
        pending: pending.results || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching pending verifications:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch pending verifications',
        },
      },
      500
    );
  }
});

/**
 * POST /api/lawyers/admin/verify/:verificationId
 * Approve verification (Admin only)
 */
app.post('/admin/verify/:verificationId', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { verificationId } = c.req.param();
    const body = await c.req.json();

    const { reviewNotes, expiresAt, mojVerified, dubaiCourtsVerified, adJudicialVerified } = body;

    // Get verification details
    const verification = await db
      .prepare('SELECT lawyer_id, verification_type FROM lawyer_verifications WHERE id = ?')
      .bind(verificationId)
      .first<{ lawyer_id: string; verification_type: string }>();

    if (!verification) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VERIFICATION_NOT_FOUND',
            message: 'Verification not found',
          },
        },
        404
      );
    }

    // Update verification
    await db
      .prepare(`
        UPDATE lawyer_verifications
        SET
          status = 'verified',
          reviewed_by = ?,
          reviewed_at = datetime('now'),
          verified_at = datetime('now'),
          review_notes = ?,
          expires_at = ?,
          moj_verified = ?,
          dubai_courts_verified = ?,
          ad_judicial_verified = ?
        WHERE id = ?
      `)
      .bind(
        userId,
        reviewNotes || null,
        expiresAt || null,
        mojVerified ? 1 : 0,
        dubaiCourtsVerified ? 1 : 0,
        adJudicialVerified ? 1 : 0,
        verificationId
      )
      .run();

    // Update lawyer verification level
    const verificationLevelMap: Record<string, string> = {
      email: 'basic',
      phone: 'basic',
      identity: 'identity',
      professional: 'professional',
      enhanced: 'enhanced',
    };

    const newLevel = verificationLevelMap[verification.verification_type] || 'basic';

    await db
      .prepare(`
        UPDATE lawyers
        SET
          verification_status = 'verified',
          verification_level = ?,
          verified_at = datetime('now'),
          updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(newLevel, verification.lawyer_id)
      .run();

    // Award verification badge
    const badgeId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO lawyer_badges (
          id, lawyer_id, badge_type, badge_category,
          badge_name, badge_name_ar, verification_level,
          badge_icon, badge_color, is_active, is_primary, awarded_at
        ) VALUES (
          ?, ?, 'verification', 'trust',
          ?, ?, ?,
          'shield-check', 'green', 1, 1, datetime('now')
        )
      `)
      .bind(
        badgeId,
        verification.lawyer_id,
        `${newLevel.charAt(0).toUpperCase() + newLevel.slice(1)} Verified`,
        `موثق - ${newLevel}`,
        newLevel
      )
      .run();

    return c.json({
      success: true,
      data: {
        message: 'Verification approved successfully',
      },
    });
  } catch (error: any) {
    console.error('Error approving verification:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'APPROVAL_FAILED',
          message: 'Failed to approve verification',
        },
      },
      500
    );
  }
});

/**
 * POST /api/lawyers/admin/reject/:verificationId
 * Reject verification (Admin only)
 */
app.post('/admin/reject/:verificationId', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { verificationId } = c.req.param();
    const body = await c.req.json();

    const { rejectionReason, reviewNotes } = body;

    if (!rejectionReason) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Rejection reason is required',
          },
        },
        400
      );
    }

    // Get verification details
    const verification = await db
      .prepare('SELECT lawyer_id FROM lawyer_verifications WHERE id = ?')
      .bind(verificationId)
      .first<{ lawyer_id: string }>();

    if (!verification) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VERIFICATION_NOT_FOUND',
            message: 'Verification not found',
          },
        },
        404
      );
    }

    // Update verification
    await db
      .prepare(`
        UPDATE lawyer_verifications
        SET
          status = 'rejected',
          reviewed_by = ?,
          reviewed_at = datetime('now'),
          review_notes = ?,
          rejection_reason = ?
        WHERE id = ?
      `)
      .bind(userId, reviewNotes || null, rejectionReason, verificationId)
      .run();

    // Update lawyer status
    await db
      .prepare(`
        UPDATE lawyers
        SET verification_status = 'rejected', updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(verification.lawyer_id)
      .run();

    return c.json({
      success: true,
      data: {
        message: 'Verification rejected',
      },
    });
  } catch (error: any) {
    console.error('Error rejecting verification:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'REJECTION_FAILED',
          message: 'Failed to reject verification',
        },
      },
      500
    );
  }
});

/**
 * POST /api/lawyers/admin/:id/badge
 * Award badge to lawyer (Admin only)
 */
app.post('/admin/:id/badge', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json();

    const {
      badgeType,
      badgeCategory,
      badgeName,
      badgeNameAr,
      badgeIcon,
      badgeColor,
      specializationArea,
      yearsRange,
      performanceMetric,
      performanceValue,
    } = body;

    const badgeId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO lawyer_badges (
          id, lawyer_id, badge_type, badge_category,
          badge_name, badge_name_ar, badge_icon, badge_color,
          specialization_area, years_range, performance_metric, performance_value,
          is_active, issued_by, awarded_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now')
        )
      `)
      .bind(
        badgeId,
        id,
        badgeType,
        badgeCategory,
        badgeName,
        badgeNameAr || null,
        badgeIcon || null,
        badgeColor || null,
        specializationArea || null,
        yearsRange || null,
        performanceMetric || null,
        performanceValue || null,
        userId
      )
      .run();

    return c.json({
      success: true,
      data: {
        badgeId,
        message: 'Badge awarded successfully',
      },
    }, 201);
  } catch (error: any) {
    console.error('Error awarding badge:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'BADGE_FAILED',
          message: 'Failed to award badge',
        },
      },
      500
    );
  }
});

// ============================================
// LAWYER MATCHING ROUTES
// ============================================

/**
 * POST /api/lawyers/match
 * Find best matching lawyers based on user preferences
 */
app.post('/match', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const locale = (c.req.header('Accept-Language')?.includes('ar') ? 'ar' : 'en') as 'en' | 'ar';

    const preferences: MatchPreferences = {
      documentType: body.documentType,
      specialization: body.specialization,
      emirate: body.emirate,
      languages: body.languages,
      budgetMin: body.budgetMin,
      budgetMax: body.budgetMax,
      urgency: body.urgency,
      preferredResponseTime: body.preferredResponseTime,
      preferVerified: body.preferVerified ?? true,
      preferFeatured: body.preferFeatured,
      caseComplexity: body.caseComplexity,
    };

    const limit = parseInt(body.limit || '10');

    // Fetch all active verified lawyers
    const lawyersResult = await db
      .prepare(`
        SELECT
          id, first_name, last_name, specializations, languages,
          emirate, consultation_fee, hourly_rate, response_time_hours,
          average_rating, total_reviews, total_cases_completed, success_rate,
          verification_level, is_available, accepting_new_clients, featured,
          years_experience, current_cases, max_concurrent_cases
        FROM lawyers
        WHERE is_active = 1
          AND verification_status = 'verified'
          AND is_available = 1
          AND accepting_new_clients = 1
      `)
      .all();

    const lawyers = (lawyersResult.results || []) as LawyerProfile[];

    // Rank lawyers using matching algorithm
    const rankedLawyers = rankLawyers(lawyers, preferences, limit);

    // Add match explanations
    const lawyersWithExplanations = rankedLawyers.map((lawyer) => ({
      ...lawyer,
      matchExplanation: getMatchExplanation(lawyer.matchScore, locale),
    }));

    // Log match history if user is authenticated
    const userId = c.get('userId');
    if (userId && lawyersWithExplanations.length > 0) {
      // Log top matches asynchronously
      const matchPromises = lawyersWithExplanations.slice(0, 5).map((lawyer) =>
        db
          .prepare(`
            INSERT INTO lawyer_match_history (
              id, user_id, lawyer_id, match_score, match_breakdown, match_reasons,
              document_type, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `)
          .bind(
            crypto.randomUUID(),
            userId,
            lawyer.id,
            lawyer.matchScore.totalScore,
            JSON.stringify(lawyer.matchScore.breakdown),
            JSON.stringify(lawyer.matchScore.matchReasons),
            preferences.documentType || null
          )
          .run()
          .catch(() => {}) // Ignore errors in logging
      );
      Promise.all(matchPromises).catch(() => {});
    }

    return c.json({
      success: true,
      data: {
        lawyers: lawyersWithExplanations,
        total: lawyersWithExplanations.length,
        preferences,
      },
    });
  } catch (error: any) {
    console.error('Error matching lawyers:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'MATCH_FAILED',
          message: 'Failed to find matching lawyers',
        },
      },
      500
    );
  }
});

/**
 * GET /api/lawyers/specializations
 * Get all specialization categories
 */
app.get('/specializations', async (c) => {
  try {
    const db = c.env.DB;

    const specializations = await db
      .prepare(`
        SELECT * FROM specialization_categories
        ORDER BY sort_order ASC
      `)
      .all();

    return c.json({
      success: true,
      data: {
        specializations: specializations.results || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching specializations:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch specializations',
        },
      },
      500
    );
  }
});

/**
 * GET /api/lawyers/:id/reviews
 * Get reviews for a specific lawyer
 */
app.get('/:id/reviews', async (c) => {
  try {
    const db = c.env.DB;
    const { id } = c.req.param();
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    const sortBy = c.req.query('sort') || 'recent'; // recent, rating_high, rating_low, helpful

    let orderBy = 'created_at DESC';
    if (sortBy === 'rating_high') {
      orderBy = 'overall_rating DESC, created_at DESC';
    } else if (sortBy === 'rating_low') {
      orderBy = 'overall_rating ASC, created_at DESC';
    }

    const reviews = await db
      .prepare(`
        SELECT
          r.*,
          CASE WHEN r.consultation_id IS NOT NULL THEN 'consultation' ELSE 'engagement' END as review_source
        FROM lawyer_reviews r
        WHERE r.lawyer_id = ? AND r.is_visible = 1
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `)
      .bind(id, limit, offset)
      .all();

    const countResult = await db
      .prepare(`
        SELECT COUNT(*) as total FROM lawyer_reviews
        WHERE lawyer_id = ? AND is_visible = 1
      `)
      .bind(id)
      .first<{ total: number }>();

    // Rating breakdown
    const ratingBreakdown = await db
      .prepare(`
        SELECT
          overall_rating,
          COUNT(*) as count
        FROM lawyer_reviews
        WHERE lawyer_id = ? AND is_visible = 1
        GROUP BY overall_rating
        ORDER BY overall_rating DESC
      `)
      .bind(id)
      .all();

    // Average sub-ratings
    const avgRatings = await db
      .prepare(`
        SELECT
          ROUND(AVG(communication_rating), 1) as communication,
          ROUND(AVG(expertise_rating), 1) as expertise,
          ROUND(AVG(timeliness_rating), 1) as timeliness,
          ROUND(AVG(value_rating), 1) as value
        FROM lawyer_reviews
        WHERE lawyer_id = ? AND is_visible = 1
      `)
      .bind(id)
      .first<{
        communication: number;
        expertise: number;
        timeliness: number;
        value: number;
      }>();

    return c.json({
      success: true,
      data: {
        reviews: reviews.results || [],
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
        ratingBreakdown: ratingBreakdown.results || [],
        averageRatings: avgRatings || {},
      },
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch reviews',
        },
      },
      500
    );
  }
});

/**
 * POST /api/lawyers/:id/reviews/:reviewId/response
 * Lawyer responds to a review
 */
app.post('/:id/reviews/:reviewId/response', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id, reviewId } = c.req.param();
    const body = await c.req.json();

    const { response } = body;

    if (!response) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Response text is required',
          },
        },
        400
      );
    }

    // Verify lawyer owns this profile
    const lawyer = await db
      .prepare('SELECT user_id FROM lawyers WHERE id = ?')
      .bind(id)
      .first<{ user_id: string }>();

    if (!lawyer || lawyer.user_id !== userId) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized to respond to this review',
          },
        },
        403
      );
    }

    // Update review with response
    await db
      .prepare(`
        UPDATE lawyer_reviews
        SET lawyer_response = ?, lawyer_responded_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ? AND lawyer_id = ?
      `)
      .bind(response, reviewId, id)
      .run();

    return c.json({
      success: true,
      data: {
        message: 'Response added successfully',
      },
    });
  } catch (error: any) {
    console.error('Error adding response:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'RESPONSE_FAILED',
          message: 'Failed to add response',
        },
      },
      500
    );
  }
});

export { app as lawyers };
