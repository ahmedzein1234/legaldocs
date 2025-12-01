/**
 * Lawyer Consultation Booking System
 *
 * Full-featured consultation scheduling with:
 * - Available time slots
 * - Booking management
 * - Video consultation integration
 * - Reminders and notifications
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
// TIME SLOT MANAGEMENT
// ============================================

/**
 * GET /api/consultations/lawyers/:lawyerId/availability
 * Get available time slots for a lawyer
 */
app.get('/lawyers/:lawyerId/availability', async (c) => {
  try {
    const db = c.env.DB;
    const { lawyerId } = c.req.param();
    const startDate = c.req.query('start') || new Date().toISOString().split('T')[0];
    const endDate = c.req.query('end') || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const consultationType = c.req.query('type') || 'video'; // video, phone, in_person

    // Get lawyer's available hours
    const lawyer = await db
      .prepare(`
        SELECT id, available_hours, consultation_fee, is_available, accepting_new_clients
        FROM lawyers WHERE id = ? AND is_active = 1
      `)
      .bind(lawyerId)
      .first<{
        id: string;
        available_hours: string;
        consultation_fee: number;
        is_available: boolean;
        accepting_new_clients: boolean;
      }>();

    if (!lawyer) {
      return c.json({ success: false, error: { code: 'LAWYER_NOT_FOUND', message: 'Lawyer not found' } }, 404);
    }

    if (!lawyer.is_available || !lawyer.accepting_new_clients) {
      return c.json({
        success: true,
        data: {
          lawyerId,
          available: false,
          message: 'Lawyer is not currently accepting consultations',
          slots: [],
        },
      });
    }

    // Get existing bookings
    const bookings = await db
      .prepare(`
        SELECT scheduled_at, duration_minutes, status
        FROM consultations
        WHERE lawyer_id = ?
          AND scheduled_at >= ?
          AND scheduled_at <= ?
          AND status NOT IN ('cancelled', 'declined')
      `)
      .bind(lawyerId, startDate, endDate + 'T23:59:59')
      .all<{ scheduled_at: string; duration_minutes: number; status: string }>();

    // Parse available hours
    const availableHours = JSON.parse(lawyer.available_hours || '{}');
    const bookedSlots = new Set(
      (bookings.results || []).map((b) => new Date(b.scheduled_at).getTime())
    );

    // Generate available slots
    const slots: Array<{
      date: string;
      time: string;
      datetime: string;
      available: boolean;
      duration: number;
    }> = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const slotDuration = 30; // 30 minute slots

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayHours = availableHours[dayName];

      if (!dayHours) continue;

      const [startHour, startMin] = dayHours.start.split(':').map(Number);
      const [endHour, endMin] = dayHours.end.split(':').map(Number);

      for (let h = startHour; h < endHour || (h === endHour && 0 < endMin); h++) {
        for (let m = 0; m < 60; m += slotDuration) {
          if (h === startHour && m < startMin) continue;
          if (h === endHour && m >= endMin) continue;

          const slotDate = new Date(d);
          slotDate.setHours(h, m, 0, 0);

          // Skip past slots
          if (slotDate <= new Date()) continue;

          const isBooked = bookedSlots.has(slotDate.getTime());

          slots.push({
            date: slotDate.toISOString().split('T')[0],
            time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
            datetime: slotDate.toISOString(),
            available: !isBooked,
            duration: slotDuration,
          });
        }
      }
    }

    return c.json({
      success: true,
      data: {
        lawyerId,
        available: true,
        consultationFee: lawyer.consultation_fee,
        consultationType,
        slots: slots.slice(0, 100), // Limit to 100 slots
      },
    });
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch availability' } }, 500);
  }
});

// ============================================
// CONSULTATION BOOKING
// ============================================

/**
 * POST /api/consultations/book
 * Book a consultation with a lawyer
 */
app.post('/book', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const body = await c.req.json();

    const {
      lawyerId,
      scheduledAt,
      durationMinutes = 30,
      consultationType = 'video',
      topic,
      description,
      documentId,
      urgency = 'standard',
      preferredLanguage = 'en',
    } = body;

    // Validate required fields
    if (!lawyerId || !scheduledAt) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Lawyer ID and scheduled time are required' },
      }, 400);
    }

    // Check lawyer exists and is available
    const lawyer = await db
      .prepare(`
        SELECT id, first_name, last_name, consultation_fee, is_available, accepting_new_clients, user_id
        FROM lawyers WHERE id = ? AND is_active = 1
      `)
      .bind(lawyerId)
      .first<{
        id: string;
        first_name: string;
        last_name: string;
        consultation_fee: number;
        is_available: boolean;
        accepting_new_clients: boolean;
        user_id: string;
      }>();

    if (!lawyer) {
      return c.json({ success: false, error: { code: 'LAWYER_NOT_FOUND', message: 'Lawyer not found' } }, 404);
    }

    if (!lawyer.is_available || !lawyer.accepting_new_clients) {
      return c.json({
        success: false,
        error: { code: 'LAWYER_UNAVAILABLE', message: 'Lawyer is not currently accepting consultations' },
      }, 400);
    }

    // Check for scheduling conflicts
    const scheduledDate = new Date(scheduledAt);
    const endTime = new Date(scheduledDate.getTime() + durationMinutes * 60 * 1000);

    const conflict = await db
      .prepare(`
        SELECT id FROM consultations
        WHERE lawyer_id = ?
          AND status NOT IN ('cancelled', 'declined')
          AND (
            (scheduled_at <= ? AND datetime(scheduled_at, '+' || duration_minutes || ' minutes') > ?)
            OR (scheduled_at < ? AND scheduled_at >= ?)
          )
      `)
      .bind(lawyerId, scheduledAt, scheduledAt, endTime.toISOString(), scheduledAt)
      .first();

    if (conflict) {
      return c.json({
        success: false,
        error: { code: 'SLOT_UNAVAILABLE', message: 'This time slot is no longer available' },
      }, 400);
    }

    // Get user info
    const user = await db
      .prepare('SELECT name, email, phone FROM users WHERE id = ?')
      .bind(userId)
      .first<{ name: string; email: string; phone: string }>();

    // Calculate fees
    const fee = lawyer.consultation_fee * (durationMinutes / 30);
    const platformFee = fee * 0.1; // 10% platform fee
    const totalAmount = fee + platformFee;

    // Generate meeting link (placeholder - would integrate with video service)
    const meetingLink = consultationType === 'video'
      ? `https://meet.legaldocs.ae/c/${crypto.randomUUID().slice(0, 8)}`
      : null;

    // Create consultation
    const consultationId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO consultations (
          id, user_id, lawyer_id, lawyer_user_id,
          scheduled_at, duration_minutes, consultation_type,
          topic, description, document_id, urgency, preferred_language,
          fee_amount, platform_fee, total_amount, currency,
          meeting_link, status, payment_status,
          client_name, client_email, client_phone,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, 'AED',
          ?, 'pending', 'pending',
          ?, ?, ?,
          datetime('now'), datetime('now')
        )
      `)
      .bind(
        consultationId, userId, lawyerId, lawyer.user_id,
        scheduledAt, durationMinutes, consultationType,
        topic || null, description || null, documentId || null, urgency, preferredLanguage,
        fee, platformFee, totalAmount,
        meetingLink,
        user?.name || null, user?.email || null, user?.phone || null
      )
      .run();

    // Create notification for lawyer
    await db
      .prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id, created_at)
        VALUES (?, ?, 'consultation_request', 'New Consultation Request', ?, 'consultation', ?, datetime('now'))
      `)
      .bind(
        crypto.randomUUID(),
        lawyer.user_id,
        `You have a new consultation request for ${new Date(scheduledAt).toLocaleDateString()}`,
        consultationId
      )
      .run();

    return c.json({
      success: true,
      data: {
        consultationId,
        lawyerId,
        lawyerName: `${lawyer.first_name} ${lawyer.last_name}`,
        scheduledAt,
        durationMinutes,
        consultationType,
        meetingLink,
        fee: {
          amount: fee,
          platformFee,
          total: totalAmount,
          currency: 'AED',
        },
        status: 'pending',
        message: 'Consultation booked successfully. Awaiting lawyer confirmation.',
      },
    }, 201);
  } catch (error: any) {
    console.error('Error booking consultation:', error);
    return c.json({ success: false, error: { code: 'BOOKING_FAILED', message: 'Failed to book consultation' } }, 500);
  }
});

/**
 * GET /api/consultations
 * Get user's consultations
 */
app.get('/', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const status = c.req.query('status'); // pending, confirmed, completed, cancelled
    const role = c.req.query('role') || 'client'; // client or lawyer
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = role === 'lawyer' ? 'lawyer_user_id = ?' : 'user_id = ?';
    const params: any[] = [userId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const consultations = await db
      .prepare(`
        SELECT
          c.*,
          l.first_name as lawyer_first_name,
          l.last_name as lawyer_last_name,
          l.avatar_url as lawyer_avatar,
          l.specializations as lawyer_specializations
        FROM consultations c
        JOIN lawyers l ON l.id = c.lawyer_id
        WHERE ${whereClause}
        ORDER BY c.scheduled_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...params, limit, offset)
      .all();

    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM consultations WHERE ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        consultations: consultations.results || [],
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching consultations:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch consultations' } }, 500);
  }
});

/**
 * GET /api/consultations/:id
 * Get consultation details
 */
app.get('/:id', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();

    const consultation = await db
      .prepare(`
        SELECT
          c.*,
          l.first_name as lawyer_first_name,
          l.last_name as lawyer_last_name,
          l.avatar_url as lawyer_avatar,
          l.email as lawyer_email,
          l.phone as lawyer_phone,
          l.specializations as lawyer_specializations
        FROM consultations c
        JOIN lawyers l ON l.id = c.lawyer_id
        WHERE c.id = ? AND (c.user_id = ? OR c.lawyer_user_id = ?)
      `)
      .bind(id, userId, userId)
      .first();

    if (!consultation) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Consultation not found' } }, 404);
    }

    return c.json({
      success: true,
      data: { consultation },
    });
  } catch (error: any) {
    console.error('Error fetching consultation:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch consultation' } }, 500);
  }
});

/**
 * PATCH /api/consultations/:id/status
 * Update consultation status (confirm, cancel, complete)
 */
app.patch('/:id/status', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json();

    const { status, cancellationReason, notes } = body;

    // Validate status
    const validStatuses = ['confirmed', 'cancelled', 'declined', 'completed', 'no_show'];
    if (!validStatuses.includes(status)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Invalid status' },
      }, 400);
    }

    // Get consultation
    const consultation = await db
      .prepare('SELECT * FROM consultations WHERE id = ?')
      .bind(id)
      .first<{
        id: string;
        user_id: string;
        lawyer_user_id: string;
        status: string;
        scheduled_at: string;
      }>();

    if (!consultation) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Consultation not found' } }, 404);
    }

    // Authorization check
    const isClient = consultation.user_id === userId;
    const isLawyer = consultation.lawyer_user_id === userId;

    if (!isClient && !isLawyer) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized' } }, 403);
    }

    // Status transition rules
    if (status === 'confirmed' && !isLawyer) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Only lawyers can confirm consultations' },
      }, 403);
    }

    if (status === 'declined' && !isLawyer) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Only lawyers can decline consultations' },
      }, 403);
    }

    // Update consultation
    const updates: string[] = ['status = ?', 'updated_at = datetime("now")'];
    const values: any[] = [status];

    if (cancellationReason) {
      updates.push('cancellation_reason = ?');
      values.push(cancellationReason);
    }

    if (notes) {
      updates.push('notes = ?');
      values.push(notes);
    }

    if (status === 'confirmed') {
      updates.push('confirmed_at = datetime("now")');
    } else if (status === 'completed') {
      updates.push('completed_at = datetime("now")');
    } else if (status === 'cancelled' || status === 'declined') {
      updates.push('cancelled_at = datetime("now")');
      updates.push('cancelled_by = ?');
      values.push(userId);
    }

    values.push(id);

    await db
      .prepare(`UPDATE consultations SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    // Create notification
    const notifyUserId = isClient ? consultation.lawyer_user_id : consultation.user_id;
    const statusMessages: Record<string, string> = {
      confirmed: 'Your consultation has been confirmed',
      cancelled: 'A consultation has been cancelled',
      declined: 'Your consultation request was declined',
      completed: 'Your consultation has been completed',
    };

    if (statusMessages[status]) {
      await db
        .prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id, created_at)
          VALUES (?, ?, 'consultation_update', 'Consultation Update', ?, 'consultation', ?, datetime('now'))
        `)
        .bind(crypto.randomUUID(), notifyUserId, statusMessages[status], id)
        .run();
    }

    return c.json({
      success: true,
      data: {
        consultationId: id,
        status,
        message: `Consultation ${status} successfully`,
      },
    });
  } catch (error: any) {
    console.error('Error updating consultation:', error);
    return c.json({ success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update consultation' } }, 500);
  }
});

/**
 * POST /api/consultations/:id/reschedule
 * Reschedule a consultation
 */
app.post('/:id/reschedule', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json();

    const { newScheduledAt, reason } = body;

    if (!newScheduledAt) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'New scheduled time is required' },
      }, 400);
    }

    // Get consultation
    const consultation = await db
      .prepare('SELECT * FROM consultations WHERE id = ?')
      .bind(id)
      .first<{
        id: string;
        user_id: string;
        lawyer_user_id: string;
        lawyer_id: string;
        status: string;
        scheduled_at: string;
        duration_minutes: number;
      }>();

    if (!consultation) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Consultation not found' } }, 404);
    }

    // Authorization check
    if (consultation.user_id !== userId && consultation.lawyer_user_id !== userId) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized' } }, 403);
    }

    // Can't reschedule completed or cancelled
    if (['completed', 'cancelled', 'declined'].includes(consultation.status)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Cannot reschedule this consultation' },
      }, 400);
    }

    // Check for conflicts with new time
    const newDate = new Date(newScheduledAt);
    const endTime = new Date(newDate.getTime() + consultation.duration_minutes * 60 * 1000);

    const conflict = await db
      .prepare(`
        SELECT id FROM consultations
        WHERE lawyer_id = ?
          AND id != ?
          AND status NOT IN ('cancelled', 'declined')
          AND (
            (scheduled_at <= ? AND datetime(scheduled_at, '+' || duration_minutes || ' minutes') > ?)
            OR (scheduled_at < ? AND scheduled_at >= ?)
          )
      `)
      .bind(consultation.lawyer_id, id, newScheduledAt, newScheduledAt, endTime.toISOString(), newScheduledAt)
      .first();

    if (conflict) {
      return c.json({
        success: false,
        error: { code: 'SLOT_UNAVAILABLE', message: 'This time slot is not available' },
      }, 400);
    }

    // Update consultation
    await db
      .prepare(`
        UPDATE consultations
        SET
          scheduled_at = ?,
          status = 'pending',
          reschedule_count = COALESCE(reschedule_count, 0) + 1,
          reschedule_reason = ?,
          last_rescheduled_at = datetime('now'),
          last_rescheduled_by = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(newScheduledAt, reason || null, userId, id)
      .run();

    // Notify other party
    const notifyUserId = consultation.user_id === userId ? consultation.lawyer_user_id : consultation.user_id;
    await db
      .prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id, created_at)
        VALUES (?, ?, 'consultation_rescheduled', 'Consultation Rescheduled', ?, 'consultation', ?, datetime('now'))
      `)
      .bind(
        crypto.randomUUID(),
        notifyUserId,
        `A consultation has been rescheduled to ${new Date(newScheduledAt).toLocaleDateString()}`,
        id
      )
      .run();

    return c.json({
      success: true,
      data: {
        consultationId: id,
        newScheduledAt,
        message: 'Consultation rescheduled successfully',
      },
    });
  } catch (error: any) {
    console.error('Error rescheduling consultation:', error);
    return c.json({ success: false, error: { code: 'RESCHEDULE_FAILED', message: 'Failed to reschedule' } }, 500);
  }
});

/**
 * POST /api/consultations/:id/notes
 * Add notes to a consultation (lawyer only)
 */
app.post('/:id/notes', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json();

    const { notes, recommendations, followUpRequired, followUpDate } = body;

    // Get consultation
    const consultation = await db
      .prepare('SELECT lawyer_user_id, status FROM consultations WHERE id = ?')
      .bind(id)
      .first<{ lawyer_user_id: string; status: string }>();

    if (!consultation) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Consultation not found' } }, 404);
    }

    // Only lawyers can add notes
    if (consultation.lawyer_user_id !== userId) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Only the assigned lawyer can add notes' },
      }, 403);
    }

    // Update consultation
    await db
      .prepare(`
        UPDATE consultations
        SET
          lawyer_notes = ?,
          recommendations = ?,
          follow_up_required = ?,
          follow_up_date = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(
        notes || null,
        recommendations || null,
        followUpRequired ? 1 : 0,
        followUpDate || null,
        id
      )
      .run();

    return c.json({
      success: true,
      data: {
        consultationId: id,
        message: 'Notes saved successfully',
      },
    });
  } catch (error: any) {
    console.error('Error saving notes:', error);
    return c.json({ success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save notes' } }, 500);
  }
});

/**
 * POST /api/consultations/:id/review
 * Leave a review after consultation (client only)
 */
app.post('/:id/review', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json();

    const {
      overallRating,
      communicationRating,
      expertiseRating,
      timelinessRating,
      valueRating,
      title,
      reviewText,
    } = body;

    // Validate rating
    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Rating must be between 1 and 5' },
      }, 400);
    }

    // Get consultation
    const consultation = await db
      .prepare('SELECT user_id, lawyer_id, status FROM consultations WHERE id = ?')
      .bind(id)
      .first<{ user_id: string; lawyer_id: string; status: string }>();

    if (!consultation) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Consultation not found' } }, 404);
    }

    // Only clients can review
    if (consultation.user_id !== userId) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Only clients can leave reviews' },
      }, 403);
    }

    // Must be completed
    if (consultation.status !== 'completed') {
      return c.json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Can only review completed consultations' },
      }, 400);
    }

    // Check for existing review
    const existingReview = await db
      .prepare('SELECT id FROM lawyer_reviews WHERE consultation_id = ?')
      .bind(id)
      .first();

    if (existingReview) {
      return c.json({
        success: false,
        error: { code: 'ALREADY_REVIEWED', message: 'You have already reviewed this consultation' },
      }, 400);
    }

    // Create review
    const reviewId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO lawyer_reviews (
          id, consultation_id, lawyer_id, user_id,
          overall_rating, communication_rating, expertise_rating,
          timeliness_rating, value_rating, title, review_text,
          is_verified, is_visible, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          1, 1, datetime('now'), datetime('now')
        )
      `)
      .bind(
        reviewId, id, consultation.lawyer_id, userId,
        overallRating, communicationRating || null, expertiseRating || null,
        timelinessRating || null, valueRating || null, title || null, reviewText || null
      )
      .run();

    // Update lawyer stats
    const stats = await db
      .prepare(`
        SELECT
          COUNT(*) as total_reviews,
          AVG(overall_rating) as avg_rating
        FROM lawyer_reviews
        WHERE lawyer_id = ? AND is_visible = 1
      `)
      .bind(consultation.lawyer_id)
      .first<{ total_reviews: number; avg_rating: number }>();

    await db
      .prepare(`
        UPDATE lawyers
        SET
          total_reviews = ?,
          average_rating = ROUND(?, 2),
          updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(stats?.total_reviews || 0, stats?.avg_rating || 0, consultation.lawyer_id)
      .run();

    return c.json({
      success: true,
      data: {
        reviewId,
        message: 'Review submitted successfully',
      },
    }, 201);
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return c.json({ success: false, error: { code: 'SUBMIT_FAILED', message: 'Failed to submit review' } }, 500);
  }
});

export { app as consultations };
