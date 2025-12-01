/**
 * Payment & Escrow System
 *
 * Secure payment handling for:
 * - Consultation payments
 * - Engagement deposits and final payments
 * - Escrow management
 * - Refund processing
 */

import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY?: string;
};

type Variables = {
  userId: string;
  userEmail: string;
  userRole: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Platform fee percentage
const PLATFORM_FEE_PERCENT = 10;

// ============================================
// PAYMENT INITIATION
// ============================================

/**
 * POST /api/payments/consultation/:consultationId
 * Initiate payment for a consultation
 */
app.post('/consultation/:consultationId', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const body = await c.req.json();

    const { paymentMethod = 'card' } = body;

    // Get consultation
    const consultation = await db
      .prepare(`
        SELECT * FROM consultations WHERE id = ? AND user_id = ?
      `)
      .bind(consultationId, userId)
      .first<{
        id: string;
        user_id: string;
        lawyer_id: string;
        fee_amount: number;
        platform_fee: number;
        total_amount: number;
        payment_status: string;
        status: string;
      }>();

    if (!consultation) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Consultation not found' } }, 404);
    }

    if (consultation.payment_status === 'paid') {
      return c.json({
        success: false,
        error: { code: 'ALREADY_PAID', message: 'This consultation has already been paid for' },
      }, 400);
    }

    if (consultation.status !== 'confirmed') {
      return c.json({
        success: false,
        error: { code: 'NOT_CONFIRMED', message: 'Please wait for the lawyer to confirm the consultation' },
      }, 400);
    }

    // Create payment transaction
    const transactionId = crypto.randomUUID();
    const amount = consultation.total_amount || consultation.fee_amount * 1.1;
    const platformFee = consultation.platform_fee || consultation.fee_amount * 0.1;

    // Get lawyer's user_id for payee
    const lawyer = await db
      .prepare('SELECT user_id FROM lawyers WHERE id = ?')
      .bind(consultation.lawyer_id)
      .first<{ user_id: string }>();

    await db
      .prepare(`
        INSERT INTO payment_transactions (
          id, reference_type, reference_id,
          payer_id, payee_id, lawyer_id,
          amount, platform_fee, net_amount, currency,
          payment_method, status, initiated_at
        ) VALUES (
          ?, 'consultation', ?,
          ?, ?, ?,
          ?, ?, ?, 'AED',
          ?, 'pending', datetime('now')
        )
      `)
      .bind(
        transactionId, consultationId,
        userId, lawyer?.user_id || null, consultation.lawyer_id,
        amount, platformFee, amount - platformFee,
        paymentMethod
      )
      .run();

    // In production, this would integrate with Stripe/Tap
    // For now, we'll simulate a payment intent
    const paymentIntent = {
      id: `pi_${crypto.randomUUID().slice(0, 24)}`,
      amount: Math.round(amount * 100), // In fils/cents
      currency: 'aed',
      status: 'requires_payment_method',
      client_secret: `${transactionId}_secret_${crypto.randomUUID().slice(0, 16)}`,
    };

    return c.json({
      success: true,
      data: {
        transactionId,
        paymentIntent,
        amount,
        currency: 'AED',
        breakdown: {
          consultationFee: consultation.fee_amount,
          platformFee,
          total: amount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error initiating payment:', error);
    return c.json({ success: false, error: { code: 'PAYMENT_FAILED', message: 'Failed to initiate payment' } }, 500);
  }
});

/**
 * POST /api/payments/engagement/:engagementId
 * Pay for an engagement (deposit or final payment)
 */
app.post('/engagement/:engagementId', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { engagementId } = c.req.param();
    const body = await c.req.json();

    const { paymentType = 'deposit', paymentMethod = 'card' } = body;

    // Get engagement
    const engagement = await db
      .prepare(`
        SELECT * FROM lawyer_engagements WHERE id = ? AND user_id = ?
      `)
      .bind(engagementId, userId)
      .first<{
        id: string;
        user_id: string;
        lawyer_id: string;
        amount: number;
        platform_fee: number;
        deposit_amount: number;
        deposit_paid_at: string | null;
        payment_status: string;
      }>();

    if (!engagement) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Engagement not found' } }, 404);
    }

    // Determine payment amount
    let paymentAmount: number;
    let referenceType: string;

    if (paymentType === 'deposit') {
      if (engagement.deposit_paid_at) {
        return c.json({
          success: false,
          error: { code: 'DEPOSIT_PAID', message: 'Deposit has already been paid' },
        }, 400);
      }
      // Deposit is typically 50%
      paymentAmount = engagement.deposit_amount || engagement.amount * 0.5;
      referenceType = 'engagement_deposit';
    } else {
      if (!engagement.deposit_paid_at) {
        return c.json({
          success: false,
          error: { code: 'DEPOSIT_REQUIRED', message: 'Please pay the deposit first' },
        }, 400);
      }
      // Final payment is remaining amount
      paymentAmount = engagement.amount - (engagement.deposit_amount || engagement.amount * 0.5);
      referenceType = 'engagement_final';
    }

    const platformFee = paymentAmount * (PLATFORM_FEE_PERCENT / 100);
    const totalAmount = paymentAmount + platformFee;

    // Create transaction
    const transactionId = crypto.randomUUID();

    await db
      .prepare(`
        INSERT INTO payment_transactions (
          id, reference_type, reference_id,
          payer_id, lawyer_id,
          amount, platform_fee, net_amount, currency,
          payment_method, status, initiated_at
        ) VALUES (
          ?, ?, ?,
          ?, ?,
          ?, ?, ?, 'AED',
          ?, 'pending', datetime('now')
        )
      `)
      .bind(
        transactionId, referenceType, engagementId,
        userId, engagement.lawyer_id,
        totalAmount, platformFee, totalAmount - platformFee,
        paymentMethod
      )
      .run();

    // Create escrow entry for the payment
    await db
      .prepare(`
        INSERT INTO escrow_transactions (
          id, engagement_id, client_id, lawyer_id,
          amount, currency, status, held_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, 'AED', 'held', datetime('now')
        )
      `)
      .bind(crypto.randomUUID(), engagementId, userId, engagement.lawyer_id, paymentAmount)
      .run();

    return c.json({
      success: true,
      data: {
        transactionId,
        paymentType,
        amount: totalAmount,
        currency: 'AED',
        breakdown: {
          serviceAmount: paymentAmount,
          platformFee,
          total: totalAmount,
        },
        clientSecret: `${transactionId}_secret_${crypto.randomUUID().slice(0, 16)}`,
      },
    });
  } catch (error: any) {
    console.error('Error initiating engagement payment:', error);
    return c.json({ success: false, error: { code: 'PAYMENT_FAILED', message: 'Failed to initiate payment' } }, 500);
  }
});

/**
 * POST /api/payments/:transactionId/confirm
 * Confirm a payment (webhook or manual confirmation)
 */
app.post('/:transactionId/confirm', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { transactionId } = c.req.param();
    const body = await c.req.json();

    const { providerTransactionId } = body;

    // Get transaction
    const transaction = await db
      .prepare('SELECT * FROM payment_transactions WHERE id = ? AND payer_id = ?')
      .bind(transactionId, userId)
      .first<{
        id: string;
        reference_type: string;
        reference_id: string;
        status: string;
        amount: number;
      }>();

    if (!transaction) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } }, 404);
    }

    if (transaction.status === 'completed') {
      return c.json({
        success: false,
        error: { code: 'ALREADY_COMPLETED', message: 'Transaction already completed' },
      }, 400);
    }

    // Update transaction status
    await db
      .prepare(`
        UPDATE payment_transactions
        SET status = 'completed', provider_transaction_id = ?, completed_at = datetime('now')
        WHERE id = ?
      `)
      .bind(providerTransactionId || null, transactionId)
      .run();

    // Update related entity
    if (transaction.reference_type === 'consultation') {
      await db
        .prepare(`
          UPDATE consultations
          SET payment_status = 'paid', paid_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(transaction.reference_id)
        .run();
    } else if (transaction.reference_type === 'engagement_deposit') {
      await db
        .prepare(`
          UPDATE lawyer_engagements
          SET payment_status = 'deposit_paid', deposit_paid_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(transaction.reference_id)
        .run();
    } else if (transaction.reference_type === 'engagement_final') {
      await db
        .prepare(`
          UPDATE lawyer_engagements
          SET payment_status = 'fully_paid', final_paid_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(transaction.reference_id)
        .run();
    }

    return c.json({
      success: true,
      data: {
        transactionId,
        status: 'completed',
        message: 'Payment confirmed successfully',
      },
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return c.json({ success: false, error: { code: 'CONFIRM_FAILED', message: 'Failed to confirm payment' } }, 500);
  }
});

// ============================================
// ESCROW MANAGEMENT
// ============================================

/**
 * POST /api/payments/escrow/:escrowId/release
 * Release escrow funds to lawyer (after work completion)
 */
app.post('/escrow/:escrowId/release', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { escrowId } = c.req.param();

    // Get escrow
    const escrow = await db
      .prepare(`
        SELECT e.*, eng.status as engagement_status, eng.user_id as client_id
        FROM escrow_transactions e
        JOIN lawyer_engagements eng ON eng.id = e.engagement_id
        WHERE e.id = ?
      `)
      .bind(escrowId)
      .first<{
        id: string;
        engagement_id: string;
        client_id: string;
        lawyer_id: string;
        amount: number;
        status: string;
        engagement_status: string;
      }>();

    if (!escrow) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Escrow not found' } }, 404);
    }

    // Only client can release escrow
    if (escrow.client_id !== userId) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Only the client can release escrow' } }, 403);
    }

    if (escrow.status !== 'held') {
      return c.json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Escrow is not in held status' },
      }, 400);
    }

    // Engagement must be completed
    if (escrow.engagement_status !== 'completed') {
      return c.json({
        success: false,
        error: { code: 'NOT_COMPLETED', message: 'Engagement must be completed before releasing escrow' },
      }, 400);
    }

    // Release escrow
    await db
      .prepare(`
        UPDATE escrow_transactions
        SET status = 'released', released_at = datetime('now'), released_to = 'lawyer'
        WHERE id = ?
      `)
      .bind(escrowId)
      .run();

    // Update lawyer's balance/stats
    await db
      .prepare(`
        UPDATE lawyers
        SET total_cases_completed = total_cases_completed + 1, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(escrow.lawyer_id)
      .run();

    return c.json({
      success: true,
      data: {
        escrowId,
        status: 'released',
        releasedTo: 'lawyer',
        amount: escrow.amount,
        message: 'Escrow released successfully',
      },
    });
  } catch (error: any) {
    console.error('Error releasing escrow:', error);
    return c.json({ success: false, error: { code: 'RELEASE_FAILED', message: 'Failed to release escrow' } }, 500);
  }
});

/**
 * POST /api/payments/escrow/:escrowId/dispute
 * Initiate a dispute on escrow
 */
app.post('/escrow/:escrowId/dispute', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { escrowId } = c.req.param();
    const body = await c.req.json();

    const { reason } = body;

    if (!reason) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dispute reason is required' },
      }, 400);
    }

    // Get escrow
    const escrow = await db
      .prepare(`
        SELECT e.*, eng.user_id as client_id
        FROM escrow_transactions e
        JOIN lawyer_engagements eng ON eng.id = e.engagement_id
        WHERE e.id = ?
      `)
      .bind(escrowId)
      .first<{
        id: string;
        client_id: string;
        lawyer_id: string;
        status: string;
      }>();

    if (!escrow) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Escrow not found' } }, 404);
    }

    // Either party can dispute
    const lawyerUser = await db
      .prepare('SELECT user_id FROM lawyers WHERE id = ?')
      .bind(escrow.lawyer_id)
      .first<{ user_id: string }>();

    if (escrow.client_id !== userId && lawyerUser?.user_id !== userId) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized' } }, 403);
    }

    if (escrow.status !== 'held') {
      return c.json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Escrow is not in held status' },
      }, 400);
    }

    // Update escrow status
    await db
      .prepare(`
        UPDATE escrow_transactions
        SET status = 'disputed', disputed_at = datetime('now'), dispute_reason = ?
        WHERE id = ?
      `)
      .bind(reason, escrowId)
      .run();

    // Create notification for admin
    await db
      .prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id, created_at)
        VALUES (?, 'admin', 'escrow_dispute', 'New Escrow Dispute', ?, 'escrow', ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), `Dispute reason: ${reason}`, escrowId)
      .run();

    return c.json({
      success: true,
      data: {
        escrowId,
        status: 'disputed',
        message: 'Dispute submitted. Our team will review and respond within 48 hours.',
      },
    });
  } catch (error: any) {
    console.error('Error disputing escrow:', error);
    return c.json({ success: false, error: { code: 'DISPUTE_FAILED', message: 'Failed to submit dispute' } }, 500);
  }
});

// ============================================
// REFUNDS
// ============================================

/**
 * POST /api/payments/:transactionId/refund
 * Request a refund
 */
app.post('/:transactionId/refund', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { transactionId } = c.req.param();
    const body = await c.req.json();

    const { reason, amount: requestedAmount } = body;

    // Get transaction
    const transaction = await db
      .prepare('SELECT * FROM payment_transactions WHERE id = ? AND payer_id = ?')
      .bind(transactionId, userId)
      .first<{
        id: string;
        reference_type: string;
        reference_id: string;
        amount: number;
        status: string;
      }>();

    if (!transaction) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } }, 404);
    }

    if (transaction.status !== 'completed') {
      return c.json({
        success: false,
        error: { code: 'NOT_COMPLETED', message: 'Only completed payments can be refunded' },
      }, 400);
    }

    // Check refund eligibility based on type
    if (transaction.reference_type === 'consultation') {
      const consultation = await db
        .prepare('SELECT status, scheduled_at FROM consultations WHERE id = ?')
        .bind(transaction.reference_id)
        .first<{ status: string; scheduled_at: string }>();

      // Can only refund if consultation was cancelled before it started
      if (consultation && consultation.status !== 'cancelled') {
        return c.json({
          success: false,
          error: { code: 'NOT_ELIGIBLE', message: 'Consultation must be cancelled for refund' },
        }, 400);
      }
    }

    const refundAmount = requestedAmount || transaction.amount;

    // Create refund transaction
    const refundId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO payment_transactions (
          id, reference_type, reference_id,
          payer_id, amount, currency, payment_method,
          status, initiated_at
        ) VALUES (
          ?, 'refund', ?,
          ?, ?, 'AED', 'original',
          'pending', datetime('now')
        )
      `)
      .bind(refundId, transactionId, userId, -refundAmount)
      .run();

    // Update original transaction
    await db
      .prepare(`
        UPDATE payment_transactions
        SET status = 'refunded'
        WHERE id = ?
      `)
      .bind(transactionId)
      .run();

    // Update consultation payment status
    if (transaction.reference_type === 'consultation') {
      await db
        .prepare(`
          UPDATE consultations SET payment_status = 'refunded', updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(transaction.reference_id)
        .run();
    }

    return c.json({
      success: true,
      data: {
        refundId,
        originalTransactionId: transactionId,
        amount: refundAmount,
        status: 'processing',
        message: 'Refund initiated. Funds will be returned within 5-10 business days.',
      },
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return c.json({ success: false, error: { code: 'REFUND_FAILED', message: 'Failed to process refund' } }, 500);
  }
});

// ============================================
// PAYMENT HISTORY
// ============================================

/**
 * GET /api/payments/history
 * Get payment history for user
 */
app.get('/history', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    const type = c.req.query('type'); // consultation, engagement, all

    let whereClause = 'payer_id = ?';
    const params: any[] = [userId];

    if (type && type !== 'all') {
      whereClause += ' AND reference_type LIKE ?';
      params.push(`${type}%`);
    }

    const transactions = await db
      .prepare(`
        SELECT * FROM payment_transactions
        WHERE ${whereClause}
        ORDER BY initiated_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...params, limit, offset)
      .all();

    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM payment_transactions WHERE ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        transactions: transactions.results || [],
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment history:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch payment history' } }, 500);
  }
});

/**
 * GET /api/payments/:transactionId
 * Get payment details
 */
app.get('/:transactionId', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const { transactionId } = c.req.param();

    const transaction = await db
      .prepare('SELECT * FROM payment_transactions WHERE id = ?')
      .bind(transactionId)
      .first();

    if (!transaction) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } }, 404);
    }

    // Authorization check
    const txn = transaction as { payer_id: string; payee_id: string | null };
    if (txn.payer_id !== userId && txn.payee_id !== userId && userRole !== 'admin') {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized' } }, 403);
    }

    return c.json({
      success: true,
      data: { transaction },
    });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch transaction' } }, 500);
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * POST /api/payments/admin/escrow/:escrowId/resolve
 * Admin resolves a disputed escrow
 */
app.post('/admin/escrow/:escrowId/resolve', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { escrowId } = c.req.param();
    const body = await c.req.json();

    const { resolution, releaseTo, refundPercentage } = body;

    // releaseTo: 'lawyer', 'client', 'split'
    // refundPercentage: for split, percentage to client

    const escrow = await db
      .prepare('SELECT * FROM escrow_transactions WHERE id = ? AND status = ?')
      .bind(escrowId, 'disputed')
      .first<{
        id: string;
        engagement_id: string;
        client_id: string;
        lawyer_id: string;
        amount: number;
      }>();

    if (!escrow) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Disputed escrow not found' } }, 404);
    }

    // Update escrow
    await db
      .prepare(`
        UPDATE escrow_transactions
        SET
          status = 'released',
          released_at = datetime('now'),
          released_to = ?,
          dispute_resolved_at = datetime('now'),
          dispute_resolution = ?
        WHERE id = ?
      `)
      .bind(releaseTo, resolution, escrowId)
      .run();

    // Handle refunds if needed
    if (releaseTo === 'client' || (releaseTo === 'split' && refundPercentage > 0)) {
      const refundAmount =
        releaseTo === 'client' ? escrow.amount : escrow.amount * (refundPercentage / 100);

      await db
        .prepare(`
          INSERT INTO payment_transactions (
            id, reference_type, reference_id,
            payer_id, amount, currency, status, initiated_at, completed_at
          ) VALUES (
            ?, 'dispute_refund', ?,
            ?, ?, 'AED', 'completed', datetime('now'), datetime('now')
          )
        `)
        .bind(crypto.randomUUID(), escrowId, escrow.client_id, -refundAmount)
        .run();
    }

    // Notify parties
    await db
      .prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id, created_at)
        VALUES (?, ?, 'dispute_resolved', 'Dispute Resolved', ?, 'escrow', ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), escrow.client_id, resolution, escrowId)
      .run();

    return c.json({
      success: true,
      data: {
        escrowId,
        resolution,
        releasedTo: releaseTo,
        message: 'Dispute resolved successfully',
      },
    });
  } catch (error: any) {
    console.error('Error resolving dispute:', error);
    return c.json({ success: false, error: { code: 'RESOLVE_FAILED', message: 'Failed to resolve dispute' } }, 500);
  }
});

export { app as payments };
