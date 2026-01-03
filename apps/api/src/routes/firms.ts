/**
 * Law Firm Marketplace Routes
 *
 * API endpoints for the "Uber for Law Firms" marketplace:
 * - Firm registration and profiles
 * - Service requests and bidding
 * - Anchor partner operations
 * - Engagements and reviews
 */

import { Hono } from 'hono';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import {
  createFirmMarketplaceService,
  calculateCommission,
  type ServiceType,
  type Urgency,
  type FirmSize,
} from '../lib/firm-marketplace.js';

type Bindings = {
  DB: D1Database;
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
// PUBLIC ROUTES - Firm Discovery
// ============================================

/**
 * GET /api/firms
 * Search and list law firms
 */
app.get('/', async (c) => {
  try {
    const service = createFirmMarketplaceService(c.env.DB);

    const options = {
      search: c.req.query('search'),
      category: c.req.query('category'),
      emirate: c.req.query('emirate'),
      firmSize: c.req.query('firmSize') as FirmSize | undefined,
      minRating: c.req.query('minRating') ? parseFloat(c.req.query('minRating')!) : undefined,
      verifiedOnly: c.req.query('verifiedOnly') === 'true',
      limit: parseInt(c.req.query('limit') || '20'),
      offset: parseInt(c.req.query('offset') || '0'),
    };

    const result = await service.searchFirms(options);

    return c.json({
      success: true,
      data: {
        firms: result.firms,
        pagination: {
          total: result.total,
          limit: options.limit,
          offset: options.offset,
        },
      },
    });
  } catch (error: any) {
    console.error('Error searching firms:', error);
    return c.json({ success: false, error: { code: 'SEARCH_FAILED', message: 'Failed to search firms' } }, 500);
  }
});

// ============================================
// AUTHENTICATED ROUTES - Firm Registration
// ============================================

/**
 * POST /api/firms/register
 * Register a new law firm
 */
app.post('/register', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    const { name, nameAr, email, phone, country, emirate, firmType, firmSize, specializations, description } = body;

    if (!name || !email) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name and email are required' },
      }, 400);
    }

    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.registerFirm({
      name,
      nameAr,
      email,
      phone,
      country,
      emirate,
      firmType,
      firmSize,
      specializations,
      description,
      ownerId: userId,
    });

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'REGISTRATION_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        firmId: result.firmId,
        message: 'Firm registered successfully. Pending verification.',
      },
    });
  } catch (error: any) {
    console.error('Error registering firm:', error);
    return c.json({ success: false, error: { code: 'REGISTRATION_FAILED', message: 'Failed to register firm' } }, 500);
  }
});

// ============================================
// SERVICE REQUESTS
// ============================================

/**
 * GET /api/firms/requests/open
 * Get open service requests for firms to bid on
 */
app.get('/requests/open', requireAuth, async (c) => {
  try {
    const service = createFirmMarketplaceService(c.env.DB);

    const options = {
      category: c.req.query('category'),
      serviceType: c.req.query('serviceType') as ServiceType | undefined,
      emirate: c.req.query('emirate'),
      minBudget: c.req.query('minBudget') ? parseFloat(c.req.query('minBudget')!) : undefined,
      maxBudget: c.req.query('maxBudget') ? parseFloat(c.req.query('maxBudget')!) : undefined,
      urgency: c.req.query('urgency') as Urgency | undefined,
      limit: parseInt(c.req.query('limit') || '20'),
      offset: parseInt(c.req.query('offset') || '0'),
    };

    const result = await service.getOpenRequests(options);

    return c.json({
      success: true,
      data: {
        requests: result.requests,
        pagination: {
          total: result.total,
          limit: options.limit,
          offset: options.offset,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching open requests:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch requests' } }, 500);
  }
});

/**
 * POST /api/firms/requests
 * Create a new service request
 */
app.post('/requests', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    const {
      serviceType, category, documentId, title, description,
      requiredLanguages, requiredEmirate, urgency, deadline,
      complexity, budgetMin, budgetMax,
    } = body;

    if (!serviceType || !category || !title || !description) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Service type, category, title, and description are required' },
      }, 400);
    }

    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.createServiceRequest({
      userId,
      serviceType,
      category,
      documentId,
      title,
      description,
      requiredLanguages,
      requiredEmirate,
      urgency,
      deadline,
      complexity,
      budgetMin,
      budgetMax,
    });

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'CREATE_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        requestId: result.requestId,
        message: 'Service request created as draft',
      },
    });
  } catch (error: any) {
    console.error('Error creating request:', error);
    return c.json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create request' } }, 500);
  }
});

/**
 * POST /api/firms/requests/:requestId/submit
 * Submit request for bidding
 */
app.post('/requests/:requestId/submit', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { requestId } = c.req.param();

    // Verify ownership
    const request = await c.env.DB
      .prepare('SELECT * FROM service_requests WHERE id = ? AND user_id = ?')
      .bind(requestId, userId)
      .first();

    if (!request) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } }, 404);
    }

    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.submitRequestForBidding(requestId);

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'SUBMIT_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        offeredToAnchor: result.offeredToAnchor,
        anchorDeadline: result.anchorDeadline,
        message: result.offeredToAnchor
          ? 'Request offered to anchor partner first'
          : 'Request is now open for bidding',
      },
    });
  } catch (error: any) {
    console.error('Error submitting request:', error);
    return c.json({ success: false, error: { code: 'SUBMIT_FAILED', message: 'Failed to submit request' } }, 500);
  }
});

/**
 * GET /api/firms/requests/:requestId/bids
 * Get bids for a request (for request owner)
 */
app.get('/requests/:requestId/bids', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { requestId } = c.req.param();
    const sortBy = c.req.query('sortBy') as 'price' | 'rating' | 'delivery' | 'value_score' | undefined;

    // Verify ownership
    const request = await c.env.DB
      .prepare('SELECT * FROM service_requests WHERE id = ? AND user_id = ?')
      .bind(requestId, userId)
      .first();

    if (!request) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } }, 404);
    }

    const service = createFirmMarketplaceService(c.env.DB);
    const bids = await service.getBidsForRequest(requestId, { sortBy });

    // Mark bids as viewed
    await c.env.DB
      .prepare('UPDATE request_bids SET viewed_by_user = 1 WHERE request_id = ?')
      .bind(requestId)
      .run();

    return c.json({
      success: true,
      data: { bids },
    });
  } catch (error: any) {
    console.error('Error fetching bids:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch bids' } }, 500);
  }
});

// ============================================
// BIDDING SYSTEM
// ============================================

/**
 * POST /api/firms/bids
 * Submit a bid on a request
 */
app.post('/bids', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    const {
      requestId, firmId, assignedLawyerId, bidAmount,
      deliveryDays, coverLetter, inclusions, validDays,
    } = body;

    if (!requestId || !firmId || !bidAmount || !deliveryDays) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Request ID, firm ID, bid amount, and delivery days are required' },
      }, 400);
    }

    // Verify user is a member of the firm with bid permission
    const member = await c.env.DB
      .prepare('SELECT * FROM firm_members WHERE firm_id = ? AND user_id = ? AND can_bid = 1 AND status = ?')
      .bind(firmId, userId, 'active')
      .first();

    if (!member) {
      return c.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to bid for this firm' },
      }, 403);
    }

    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.submitBid({
      requestId,
      firmId,
      submittedBy: userId,
      assignedLawyerId,
      bidAmount,
      deliveryDays,
      coverLetter,
      inclusions,
      validDays,
    });

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'BID_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        bidId: result.bidId,
        message: 'Bid submitted successfully',
      },
    });
  } catch (error: any) {
    console.error('Error submitting bid:', error);
    return c.json({ success: false, error: { code: 'BID_FAILED', message: 'Failed to submit bid' } }, 500);
  }
});

/**
 * POST /api/firms/bids/:bidId/accept
 * Accept a bid
 */
app.post('/bids/:bidId/accept', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { bidId } = c.req.param();

    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.acceptBid(bidId, userId);

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'ACCEPT_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        engagementId: result.engagementId,
        message: 'Bid accepted. Proceed with payment to start the engagement.',
      },
    });
  } catch (error: any) {
    console.error('Error accepting bid:', error);
    return c.json({ success: false, error: { code: 'ACCEPT_FAILED', message: 'Failed to accept bid' } }, 500);
  }
});

// ============================================
// ENGAGEMENTS
// ============================================

/**
 * GET /api/firms/engagements
 * Get user's engagements
 */
app.get('/engagements', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const status = c.req.query('status');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = 'user_id = ?';
    const params: any[] = [userId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const engagements = await c.env.DB
      .prepare(`
        SELECT fe.*, f.name as firm_name, f.logo_url as firm_logo,
               sr.title as request_title
        FROM firm_engagements fe
        JOIN law_firms f ON f.id = fe.firm_id
        JOIN service_requests sr ON sr.id = fe.request_id
        WHERE ${whereClause}
        ORDER BY fe.created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...params, limit, offset)
      .all();

    const countResult = await c.env.DB
      .prepare(`SELECT COUNT(*) as total FROM firm_engagements WHERE ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        engagements: engagements.results || [],
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching engagements:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch engagements' } }, 500);
  }
});

/**
 * POST /api/firms/engagements/:engagementId/pay
 * Mark engagement payment as received
 */
app.post('/engagements/:engagementId/pay', requireAuth, async (c) => {
  try {
    const { engagementId } = c.req.param();

    // In production, this would integrate with payment gateway
    // For now, just mark as paid
    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.markPaymentReceived(engagementId);

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'PAYMENT_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        message: 'Payment received. Engagement is now active.',
      },
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return c.json({ success: false, error: { code: 'PAYMENT_FAILED', message: 'Failed to process payment' } }, 500);
  }
});

/**
 * POST /api/firms/engagements/:engagementId/approve
 * Approve completed engagement
 */
app.post('/engagements/:engagementId/approve', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { engagementId } = c.req.param();

    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.approveEngagement(engagementId, userId);

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'APPROVE_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        message: 'Engagement approved and completed. You can now leave a review.',
      },
    });
  } catch (error: any) {
    console.error('Error approving engagement:', error);
    return c.json({ success: false, error: { code: 'APPROVE_FAILED', message: 'Failed to approve engagement' } }, 500);
  }
});

// ============================================
// REVIEWS
// ============================================

/**
 * POST /api/firms/reviews
 * Submit a review for a firm
 */
app.post('/reviews', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    const {
      firmId, engagementId, overallRating,
      communicationRating, expertiseRating, timelinessRating, valueRating,
      title, reviewText,
    } = body;

    if (!firmId || !engagementId || !overallRating) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Firm ID, engagement ID, and rating are required' },
      }, 400);
    }

    if (overallRating < 1 || overallRating > 5) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Rating must be between 1 and 5' },
      }, 400);
    }

    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.submitFirmReview({
      firmId,
      engagementId,
      userId,
      overallRating,
      communicationRating,
      expertiseRating,
      timelinessRating,
      valueRating,
      title,
      reviewText,
    });

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'REVIEW_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        reviewId: result.reviewId,
        message: 'Review submitted successfully',
      },
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return c.json({ success: false, error: { code: 'REVIEW_FAILED', message: 'Failed to submit review' } }, 500);
  }
});

// ============================================
// ANCHOR PARTNER ROUTES
// ============================================

/**
 * GET /api/firms/anchor
 * Get active anchor partner info (public)
 */
app.get('/anchor', async (c) => {
  try {
    const service = createFirmMarketplaceService(c.env.DB);
    const anchor = await service.getActiveAnchorPartner();

    if (!anchor) {
      return c.json({
        success: true,
        data: { anchor: null },
      });
    }

    return c.json({
      success: true,
      data: {
        anchor: {
          firm: anchor.firm,
          firstRefusalHours: anchor.anchor.firstRefusalHours,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching anchor partner:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch anchor partner' } }, 500);
  }
});

/**
 * POST /api/firms/anchor/respond/:requestId
 * Anchor partner responds to first refusal offer
 */
app.post('/anchor/respond/:requestId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { requestId } = c.req.param();
    const body = await c.req.json();
    const { accepted, declineReason } = body;

    // Verify user is a member of the anchor partner firm
    const member = await c.env.DB
      .prepare(`
        SELECT fm.*, ap.firm_id
        FROM firm_members fm
        JOIN anchor_partners ap ON ap.firm_id = fm.firm_id
        WHERE fm.user_id = ? AND ap.status = 'active' AND fm.can_accept_cases = 1
      `)
      .bind(userId)
      .first<any>();

    if (!member) {
      return c.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to respond for the anchor partner' },
      }, 403);
    }

    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.anchorRespondsToOffer(requestId, member.firm_id, accepted, declineReason);

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'RESPONSE_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        message: accepted
          ? 'Case accepted. Engagement will be created.'
          : 'Case declined. It will be opened to the marketplace.',
      },
    });
  } catch (error: any) {
    console.error('Error responding to anchor offer:', error);
    return c.json({ success: false, error: { code: 'RESPONSE_FAILED', message: 'Failed to respond' } }, 500);
  }
});

// ============================================
// FIRM DASHBOARD ROUTES
// ============================================

/**
 * GET /api/firms/my-firm
 * Get current user's firm
 */
app.get('/my-firm', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const membership = await c.env.DB
      .prepare(`
        SELECT fm.*, f.*
        FROM firm_members fm
        JOIN law_firms f ON f.id = fm.firm_id
        WHERE fm.user_id = ? AND fm.status = 'active'
      `)
      .bind(userId)
      .first<any>();

    if (!membership) {
      return c.json({
        success: true,
        data: { firm: null, membership: null },
      });
    }

    return c.json({
      success: true,
      data: {
        firm: {
          id: membership.id,
          name: membership.name,
          slug: membership.slug,
          status: membership.status,
          isVerified: membership.is_verified === 1,
          isAnchorPartner: membership.is_anchor_partner === 1,
        },
        membership: {
          role: membership.role,
          canBid: membership.can_bid === 1,
          canAcceptCases: membership.can_accept_cases === 1,
          canManageFirm: membership.can_manage_firm === 1,
          canViewFinancials: membership.can_view_financials === 1,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching user firm:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch firm' } }, 500);
  }
});

/**
 * GET /api/firms/my-firm/bids
 * Get bids submitted by user's firm
 */
app.get('/my-firm/bids', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const status = c.req.query('status');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    // Get user's firm
    const membership = await c.env.DB
      .prepare('SELECT firm_id FROM firm_members WHERE user_id = ? AND status = ?')
      .bind(userId, 'active')
      .first<{ firm_id: string }>();

    if (!membership) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'No firm membership found' } }, 404);
    }

    let whereClause = 'rb.firm_id = ?';
    const params: any[] = [membership.firm_id];

    if (status) {
      whereClause += ' AND rb.status = ?';
      params.push(status);
    }

    const bids = await c.env.DB
      .prepare(`
        SELECT rb.*, sr.title as request_title, sr.urgency, sr.budget_min, sr.budget_max
        FROM request_bids rb
        JOIN service_requests sr ON sr.id = rb.request_id
        WHERE ${whereClause}
        ORDER BY rb.created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...params, limit, offset)
      .all();

    const countResult = await c.env.DB
      .prepare(`SELECT COUNT(*) as total FROM request_bids rb WHERE ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        bids: bids.results || [],
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching firm bids:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch bids' } }, 500);
  }
});

/**
 * GET /api/firms/my-firm/engagements
 * Get engagements for user's firm
 */
app.get('/my-firm/engagements', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const status = c.req.query('status');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    // Get user's firm
    const membership = await c.env.DB
      .prepare('SELECT firm_id FROM firm_members WHERE user_id = ? AND status = ?')
      .bind(userId, 'active')
      .first<{ firm_id: string }>();

    if (!membership) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'No firm membership found' } }, 404);
    }

    let whereClause = 'fe.firm_id = ?';
    const params: any[] = [membership.firm_id];

    if (status) {
      whereClause += ' AND fe.status = ?';
      params.push(status);
    }

    const engagements = await c.env.DB
      .prepare(`
        SELECT fe.*, sr.title as request_title, u.full_name as client_name
        FROM firm_engagements fe
        JOIN service_requests sr ON sr.id = fe.request_id
        JOIN users u ON u.id = fe.user_id
        WHERE ${whereClause}
        ORDER BY fe.created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...params, limit, offset)
      .all();

    const countResult = await c.env.DB
      .prepare(`SELECT COUNT(*) as total FROM firm_engagements fe WHERE ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        engagements: engagements.results || [],
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching firm engagements:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch engagements' } }, 500);
  }
});

/**
 * POST /api/firms/my-firm/engagements/:engagementId/complete
 * Mark engagement as completed by firm
 */
app.post('/my-firm/engagements/:engagementId/complete', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { engagementId } = c.req.param();
    const body = await c.req.json();
    const { deliverableUrl } = body;

    // Get user's firm
    const membership = await c.env.DB
      .prepare('SELECT firm_id FROM firm_members WHERE user_id = ? AND status = ?')
      .bind(userId, 'active')
      .first<{ firm_id: string }>();

    if (!membership) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'No firm membership found' } }, 404);
    }

    const service = createFirmMarketplaceService(c.env.DB);
    const result = await service.completeEngagement(engagementId, membership.firm_id, deliverableUrl);

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'COMPLETE_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        message: 'Engagement marked as completed. Awaiting client approval.',
      },
    });
  } catch (error: any) {
    console.error('Error completing engagement:', error);
    return c.json({ success: false, error: { code: 'COMPLETE_FAILED', message: 'Failed to complete engagement' } }, 500);
  }
});

// ============================================
// COMMISSION CALCULATOR (Utility)
// ============================================

/**
 * GET /api/firms/calculate-commission
 * Calculate commission breakdown for a given amount
 */
app.get('/calculate-commission', async (c) => {
  try {
    const amount = parseFloat(c.req.query('amount') || '0');
    const firmRate = parseFloat(c.req.query('firmRate') || '20');
    const anchorRate = parseFloat(c.req.query('anchorRate') || '8');

    if (amount <= 0) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Amount must be positive' },
      }, 400);
    }

    const breakdown = calculateCommission(amount, firmRate, anchorRate);

    return c.json({
      success: true,
      data: { breakdown },
    });
  } catch (error: any) {
    console.error('Error calculating commission:', error);
    return c.json({ success: false, error: { code: 'CALC_FAILED', message: 'Failed to calculate commission' } }, 500);
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * GET /api/firms/admin/pending
 * Get firms pending verification
 */
app.get('/admin/pending', requireAdmin, async (c) => {
  try {
    const firms = await c.env.DB
      .prepare(`
        SELECT * FROM law_firms
        WHERE status = 'pending' OR verification_status = 'pending'
        ORDER BY created_at DESC
      `)
      .all();

    return c.json({
      success: true,
      data: { firms: firms.results || [] },
    });
  } catch (error: any) {
    console.error('Error fetching pending firms:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch firms' } }, 500);
  }
});

/**
 * POST /api/firms/admin/:firmId/verify
 * Verify a firm
 */
app.post('/admin/:firmId/verify', requireAdmin, async (c) => {
  try {
    const { firmId } = c.req.param();
    const body = await c.req.json();
    const { approved, rejectionReason } = body;

    if (approved) {
      await c.env.DB
        .prepare(`
          UPDATE law_firms
          SET status = 'active',
              verification_status = 'verified',
              is_verified = 1,
              verified_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(firmId)
        .run();
    } else {
      await c.env.DB
        .prepare(`
          UPDATE law_firms
          SET verification_status = 'rejected',
              verification_rejected_reason = ?,
              updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(rejectionReason || 'Not approved', firmId)
        .run();
    }

    return c.json({
      success: true,
      data: {
        message: approved ? 'Firm verified successfully' : 'Firm verification rejected',
      },
    });
  } catch (error: any) {
    console.error('Error verifying firm:', error);
    return c.json({ success: false, error: { code: 'VERIFY_FAILED', message: 'Failed to verify firm' } }, 500);
  }
});

/**
 * GET /api/firms/admin/stats
 * Get marketplace statistics
 */
app.get('/admin/stats', requireAdmin, async (c) => {
  try {
    const totalFirms = await c.env.DB
      .prepare("SELECT COUNT(*) as count FROM law_firms WHERE status = 'active'")
      .first<{ count: number }>();

    const totalRequests = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM service_requests')
      .first<{ count: number }>();

    const openRequests = await c.env.DB
      .prepare("SELECT COUNT(*) as count FROM service_requests WHERE status IN ('open', 'bidding')")
      .first<{ count: number }>();

    const completedEngagements = await c.env.DB
      .prepare("SELECT COUNT(*) as count FROM firm_engagements WHERE status = 'completed'")
      .first<{ count: number }>();

    const totalRevenue = await c.env.DB
      .prepare("SELECT SUM(agreed_amount) as total FROM firm_engagements WHERE status = 'completed'")
      .first<{ total: number }>();

    const totalCommission = await c.env.DB
      .prepare("SELECT SUM(platform_commission) as total FROM firm_engagements WHERE status = 'completed'")
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        totalFirms: totalFirms?.count || 0,
        totalRequests: totalRequests?.count || 0,
        openRequests: openRequests?.count || 0,
        completedEngagements: completedEngagements?.count || 0,
        totalRevenue: totalRevenue?.total || 0,
        totalCommission: totalCommission?.total || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch stats' } }, 500);
  }
});

// ============================================
// DYNAMIC ROUTES (must be last)
// ============================================

/**
 * GET /api/firms/:firmId/reviews
 * Get firm reviews
 */
app.get('/:firmId/reviews', async (c) => {
  try {
    const { firmId } = c.req.param();
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;

    const reviews = await c.env.DB
      .prepare(`
        SELECT fr.*, u.full_name as reviewer_name
        FROM firm_reviews fr
        LEFT JOIN users u ON u.id = fr.user_id
        WHERE fr.firm_id = ? AND fr.is_public = 1
        ORDER BY fr.created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(firmId, limit, offset)
      .all();

    const countResult = await c.env.DB
      .prepare('SELECT COUNT(*) as total FROM firm_reviews WHERE firm_id = ? AND is_public = 1')
      .bind(firmId)
      .first<{ total: number }>();

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
      },
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch reviews' } }, 500);
  }
});

/**
 * GET /api/firms/:idOrSlug
 * Get firm profile by ID or slug (catch-all, must be last)
 */
app.get('/:idOrSlug', async (c) => {
  try {
    const { idOrSlug } = c.req.param();
    const service = createFirmMarketplaceService(c.env.DB);

    // Try by ID first, then by slug
    let firm = await service.getFirmById(idOrSlug);
    if (!firm) {
      firm = await service.getFirmBySlug(idOrSlug);
    }

    if (!firm) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Firm not found' } }, 404);
    }

    return c.json({
      success: true,
      data: { firm },
    });
  } catch (error: any) {
    console.error('Error fetching firm:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch firm' } }, 500);
  }
});

export { app as firms };
