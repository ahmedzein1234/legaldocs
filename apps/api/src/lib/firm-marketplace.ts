/**
 * Firm Marketplace Service
 *
 * Manages law firm registration, bidding system, and anchor partner operations.
 * Implements the "Uber for Law Firms" model.
 */

// ============================================
// TYPES
// ============================================

export type FirmStatus = 'pending' | 'active' | 'suspended' | 'inactive';
export type FirmType = 'local' | 'international' | 'boutique';
export type FirmSize = 'solo' | 'small' | 'medium' | 'large';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type ServiceType = 'consultation' | 'document_review' | 'document_drafting' | 'case_representation' | 'notarization' | 'translation' | 'other';
export type RequestStatus = 'draft' | 'pending_review' | 'open' | 'bidding' | 'anchor_review' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type BidStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
export type EngagementStatus = 'pending_payment' | 'active' | 'in_progress' | 'under_review' | 'completed' | 'cancelled' | 'disputed';
export type Urgency = 'urgent' | 'express' | 'standard' | 'flexible';

export interface LawFirm {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  logoUrl?: string;
  email: string;
  phone?: string;
  country: string;
  emirate?: string;
  city?: string;
  firmType: FirmType;
  firmSize: FirmSize;
  specializations: string[];
  description?: string;
  descriptionAr?: string;
  totalLawyers: number;
  totalCasesCompleted: number;
  totalReviews: number;
  averageRating: number;
  responseTimeHours: number;
  minConsultationFee?: number;
  maxConsultationFee?: number;
  isAnchorPartner: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  status: FirmStatus;
  verificationStatus: VerificationStatus;
  commissionRate: number;
  createdAt: string;
}

export interface AnchorPartner {
  id: string;
  firmId: string;
  agreementType: 'full_exclusive' | 'category_exclusive' | 'non_exclusive';
  exclusiveCategories: string[];
  revenueSharePercent: number;
  minimumGuarantee: number;
  retainerAmount: number;
  partnerCommissionRate: number;
  firstRefusalEnabled: boolean;
  firstRefusalHours: number;
  contractStartDate: string;
  contractEndDate?: string;
  status: 'draft' | 'active' | 'suspended' | 'terminated';
  totalRevenueGenerated: number;
  casesAccepted: number;
  casesDeclined: number;
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  userId: string;
  serviceType: ServiceType;
  category: string;
  documentId?: string;
  title: string;
  description: string;
  requiredLanguages: string[];
  requiredEmirate?: string;
  urgency: Urgency;
  deadline?: string;
  complexity: 'simple' | 'medium' | 'complex' | 'highly_complex';
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  status: RequestStatus;
  anchorOfferedAt?: string;
  anchorResponseDeadline?: string;
  assignedFirmId?: string;
  assignedLawyerId?: string;
  acceptedBidId?: string;
  finalPrice?: number;
  platformCommission?: number;
  anchorShare?: number;
  bidCount?: number;
  lowestBid?: number;
  highestBid?: number;
  createdAt: string;
}

export interface RequestBid {
  id: string;
  requestId: string;
  firmId: string;
  submittedBy: string;
  assignedLawyerId?: string;
  bidAmount: number;
  currency: string;
  serviceFee: number;
  platformCommission: number;
  firmReceives: number;
  estimatedHours?: number;
  deliveryDays: number;
  deliveryDate?: string;
  coverLetter?: string;
  inclusions: string[];
  status: BidStatus;
  viewedByUser: boolean;
  validUntil?: string;
  createdAt: string;
}

export interface FirmEngagement {
  id: string;
  engagementNumber: string;
  requestId: string;
  bidId?: string;
  firmId: string;
  userId: string;
  leadLawyerId?: string;
  serviceType: ServiceType;
  category: string;
  agreedAmount: number;
  platformCommissionRate: number;
  platformCommission: number;
  anchorShareRate: number;
  anchorShare: number;
  firmPayout: number;
  paymentType: 'full_upfront' | 'milestone' | 'completion' | 'deposit_balance';
  depositAmount: number;
  depositPaid: boolean;
  status: EngagementStatus;
  expectedEndDate?: string;
  completedAt?: string;
  createdAt: string;
}

// ============================================
// COMMISSION CALCULATOR
// ============================================

export interface CommissionBreakdown {
  transactionAmount: number;
  platformCommissionRate: number;
  platformCommission: number;
  anchorShareRate: number;
  anchorShare: number;
  netPlatformCommission: number;
  firmPayout: number;
}

export function calculateCommission(
  transactionAmount: number,
  firmCommissionRate: number = 20, // Default 20% platform fee
  anchorShareRate: number = 8 // Default 8% of platform commission to anchor
): CommissionBreakdown {
  const platformCommission = transactionAmount * (firmCommissionRate / 100);
  const anchorShare = platformCommission * (anchorShareRate / 100);
  const netPlatformCommission = platformCommission - anchorShare;
  const firmPayout = transactionAmount - platformCommission;

  return {
    transactionAmount,
    platformCommissionRate: firmCommissionRate,
    platformCommission,
    anchorShareRate,
    anchorShare,
    netPlatformCommission,
    firmPayout,
  };
}

// ============================================
// FIRM MARKETPLACE SERVICE
// ============================================

export class FirmMarketplaceService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ============================================
  // FIRM MANAGEMENT
  // ============================================

  /**
   * Register a new law firm
   */
  async registerFirm(data: {
    name: string;
    nameAr?: string;
    email: string;
    phone?: string;
    country?: string;
    emirate?: string;
    firmType?: FirmType;
    firmSize?: FirmSize;
    specializations?: string[];
    description?: string;
    ownerId: string; // User registering the firm
  }): Promise<{ success: boolean; firmId?: string; error?: string }> {
    try {
      const firmId = `firm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // Check if email already exists
      const existing = await this.db
        .prepare('SELECT id FROM law_firms WHERE email = ?')
        .bind(data.email)
        .first();

      if (existing) {
        return { success: false, error: 'A firm with this email already exists' };
      }

      // Create firm
      await this.db
        .prepare(`
          INSERT INTO law_firms (
            id, name, name_ar, slug, email, phone,
            country, emirate, firm_type, firm_size,
            specializations, description, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `)
        .bind(
          firmId,
          data.name,
          data.nameAr || null,
          slug,
          data.email,
          data.phone || null,
          data.country || 'AE',
          data.emirate || null,
          data.firmType || 'local',
          data.firmSize || 'small',
          JSON.stringify(data.specializations || []),
          data.description || null
        )
        .run();

      // Add owner as firm member
      await this.db
        .prepare(`
          INSERT INTO firm_members (
            id, firm_id, user_id, role,
            can_bid, can_accept_cases, can_manage_firm, can_view_financials,
            status, joined_at
          ) VALUES (?, ?, ?, 'owner', 1, 1, 1, 1, 'active', datetime('now'))
        `)
        .bind(`fm_${Date.now()}`, firmId, data.ownerId)
        .run();

      return { success: true, firmId };
    } catch (error) {
      console.error('Error registering firm:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get firm by ID
   */
  async getFirmById(firmId: string): Promise<LawFirm | null> {
    const row = await this.db
      .prepare('SELECT * FROM law_firms WHERE id = ?')
      .bind(firmId)
      .first();

    return row ? this.mapFirm(row) : null;
  }

  /**
   * Get firm by slug
   */
  async getFirmBySlug(slug: string): Promise<LawFirm | null> {
    const row = await this.db
      .prepare('SELECT * FROM law_firms WHERE slug = ?')
      .bind(slug)
      .first();

    return row ? this.mapFirm(row) : null;
  }

  /**
   * Search firms
   */
  async searchFirms(options: {
    search?: string;
    category?: string;
    emirate?: string;
    firmSize?: FirmSize;
    minRating?: number;
    verifiedOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ firms: LawFirm[]; total: number }> {
    const conditions: string[] = ["status = 'active'"];
    const params: any[] = [];

    if (options.search) {
      conditions.push('(name LIKE ? OR name_ar LIKE ? OR description LIKE ?)');
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (options.category) {
      conditions.push("specializations LIKE ?");
      params.push(`%"${options.category}"%`);
    }

    if (options.emirate) {
      conditions.push('emirate = ?');
      params.push(options.emirate);
    }

    if (options.firmSize) {
      conditions.push('firm_size = ?');
      params.push(options.firmSize);
    }

    if (options.minRating) {
      conditions.push('average_rating >= ?');
      params.push(options.minRating);
    }

    if (options.verifiedOnly) {
      conditions.push('is_verified = 1');
    }

    const whereClause = conditions.join(' AND ');
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    const firms = await this.db
      .prepare(`
        SELECT * FROM law_firms
        WHERE ${whereClause}
        ORDER BY is_featured DESC, is_anchor_partner DESC, average_rating DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...params, limit, offset)
      .all();

    const countResult = await this.db
      .prepare(`SELECT COUNT(*) as total FROM law_firms WHERE ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    return {
      firms: (firms.results || []).map((row: any) => this.mapFirm(row)),
      total: countResult?.total || 0,
    };
  }

  // ============================================
  // ANCHOR PARTNER MANAGEMENT
  // ============================================

  /**
   * Get active anchor partner
   */
  async getActiveAnchorPartner(): Promise<{ anchor: AnchorPartner; firm: LawFirm } | null> {
    const row = await this.db
      .prepare(`
        SELECT ap.*, f.*,
          ap.id as anchor_id, ap.status as anchor_status
        FROM anchor_partners ap
        JOIN law_firms f ON f.id = ap.firm_id
        WHERE ap.status = 'active'
        LIMIT 1
      `)
      .first();

    if (!row) return null;

    return {
      anchor: this.mapAnchorPartner(row),
      firm: this.mapFirm(row),
    };
  }

  /**
   * Offer case to anchor partner (first right of refusal)
   */
  async offerToAnchorPartner(requestId: string): Promise<{
    offered: boolean;
    deadline?: string;
    error?: string;
  }> {
    const anchor = await this.getActiveAnchorPartner();

    if (!anchor || !anchor.anchor.firstRefusalEnabled) {
      return { offered: false };
    }

    // Get the request
    const request = await this.db
      .prepare('SELECT * FROM service_requests WHERE id = ?')
      .bind(requestId)
      .first<any>();

    if (!request) {
      return { offered: false, error: 'Request not found' };
    }

    // Check if category is in anchor's exclusive categories
    if (anchor.anchor.exclusiveCategories.length > 0) {
      if (!anchor.anchor.exclusiveCategories.includes(request.category)) {
        return { offered: false }; // Not in exclusive categories
      }
    }

    // Check minimum value threshold
    if (anchor.anchor.firstRefusalEnabled && request.budget_min) {
      // Allow first refusal for all values (or implement threshold logic)
    }

    // Calculate deadline
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + anchor.anchor.firstRefusalHours);

    // Update request
    await this.db
      .prepare(`
        UPDATE service_requests
        SET status = 'anchor_review',
            anchor_offered_at = datetime('now'),
            anchor_response_deadline = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(deadline.toISOString(), requestId)
      .run();

    return { offered: true, deadline: deadline.toISOString() };
  }

  /**
   * Anchor partner responds to offer
   */
  async anchorRespondsToOffer(
    requestId: string,
    firmId: string,
    accepted: boolean,
    declineReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const request = await this.db
        .prepare('SELECT * FROM service_requests WHERE id = ? AND status = ?')
        .bind(requestId, 'anchor_review')
        .first<any>();

      if (!request) {
        return { success: false, error: 'Request not found or not in anchor review' };
      }

      if (accepted) {
        // Assign to anchor partner
        await this.db
          .prepare(`
            UPDATE service_requests
            SET status = 'assigned',
                anchor_accepted = 1,
                assigned_firm_id = ?,
                assigned_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ?
          `)
          .bind(firmId, requestId)
          .run();

        // Update anchor stats
        await this.db
          .prepare(`
            UPDATE anchor_partners
            SET cases_accepted = cases_accepted + 1, updated_at = datetime('now')
            WHERE firm_id = ?
          `)
          .bind(firmId)
          .run();
      } else {
        // Decline - open to marketplace
        await this.db
          .prepare(`
            UPDATE service_requests
            SET status = 'open',
                anchor_accepted = 0,
                anchor_declined_reason = ?,
                updated_at = datetime('now')
            WHERE id = ?
          `)
          .bind(declineReason || null, requestId)
          .run();

        // Update anchor stats
        await this.db
          .prepare(`
            UPDATE anchor_partners
            SET cases_declined = cases_declined + 1, updated_at = datetime('now')
            WHERE firm_id = ?
          `)
          .bind(firmId)
          .run();
      }

      return { success: true };
    } catch (error) {
      console.error('Error processing anchor response:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================
  // SERVICE REQUESTS
  // ============================================

  /**
   * Create a service request
   */
  async createServiceRequest(data: {
    userId: string;
    serviceType: ServiceType;
    category: string;
    documentId?: string;
    title: string;
    description: string;
    requiredLanguages?: string[];
    requiredEmirate?: string;
    urgency?: Urgency;
    deadline?: string;
    complexity?: string;
    budgetMin?: number;
    budgetMax?: number;
  }): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const requestId = `sr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      await this.db
        .prepare(`
          INSERT INTO service_requests (
            id, user_id, service_type, category, document_id,
            title, description, required_languages, required_emirate,
            urgency, deadline, complexity, budget_min, budget_max,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
        `)
        .bind(
          requestId,
          data.userId,
          data.serviceType,
          data.category,
          data.documentId || null,
          data.title,
          data.description,
          JSON.stringify(data.requiredLanguages || ['en']),
          data.requiredEmirate || null,
          data.urgency || 'standard',
          data.deadline || null,
          data.complexity || 'medium',
          data.budgetMin || null,
          data.budgetMax || null
        )
        .run();

      return { success: true, requestId };
    } catch (error) {
      console.error('Error creating service request:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Submit request for bidding
   */
  async submitRequestForBidding(requestId: string): Promise<{
    success: boolean;
    offeredToAnchor: boolean;
    anchorDeadline?: string;
    error?: string;
  }> {
    try {
      // First, offer to anchor partner
      const anchorOffer = await this.offerToAnchorPartner(requestId);

      if (anchorOffer.offered) {
        return {
          success: true,
          offeredToAnchor: true,
          anchorDeadline: anchorOffer.deadline,
        };
      }

      // No anchor or anchor declined, open for bidding
      await this.db
        .prepare(`
          UPDATE service_requests
          SET status = 'open', updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(requestId)
        .run();

      return { success: true, offeredToAnchor: false };
    } catch (error) {
      console.error('Error submitting request for bidding:', error);
      return {
        success: false,
        offeredToAnchor: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get open requests for firms to bid on
   */
  async getOpenRequests(options: {
    category?: string;
    serviceType?: ServiceType;
    emirate?: string;
    minBudget?: number;
    maxBudget?: number;
    urgency?: Urgency;
    limit?: number;
    offset?: number;
  }): Promise<{ requests: ServiceRequest[]; total: number }> {
    const conditions: string[] = ["status IN ('open', 'bidding')"];
    const params: any[] = [];

    if (options.category) {
      conditions.push('category = ?');
      params.push(options.category);
    }

    if (options.serviceType) {
      conditions.push('service_type = ?');
      params.push(options.serviceType);
    }

    if (options.emirate) {
      conditions.push('(required_emirate = ? OR required_emirate IS NULL)');
      params.push(options.emirate);
    }

    if (options.minBudget) {
      conditions.push('budget_max >= ?');
      params.push(options.minBudget);
    }

    if (options.maxBudget) {
      conditions.push('budget_min <= ?');
      params.push(options.maxBudget);
    }

    if (options.urgency) {
      conditions.push('urgency = ?');
      params.push(options.urgency);
    }

    const whereClause = conditions.join(' AND ');
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    const requests = await this.db
      .prepare(`
        SELECT sr.*,
          (SELECT COUNT(*) FROM request_bids WHERE request_id = sr.id) as bid_count,
          (SELECT MIN(bid_amount) FROM request_bids WHERE request_id = sr.id AND status = 'pending') as lowest_bid,
          (SELECT MAX(bid_amount) FROM request_bids WHERE request_id = sr.id AND status = 'pending') as highest_bid
        FROM service_requests sr
        WHERE ${whereClause}
        ORDER BY
          CASE urgency WHEN 'urgent' THEN 1 WHEN 'express' THEN 2 WHEN 'standard' THEN 3 ELSE 4 END,
          created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...params, limit, offset)
      .all();

    const countResult = await this.db
      .prepare(`SELECT COUNT(*) as total FROM service_requests sr WHERE ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    return {
      requests: (requests.results || []).map((row: any) => this.mapServiceRequest(row)),
      total: countResult?.total || 0,
    };
  }

  // ============================================
  // BIDDING SYSTEM
  // ============================================

  /**
   * Submit a bid on a request
   */
  async submitBid(data: {
    requestId: string;
    firmId: string;
    submittedBy: string;
    assignedLawyerId?: string;
    bidAmount: number;
    deliveryDays: number;
    coverLetter?: string;
    inclusions?: string[];
    validDays?: number;
  }): Promise<{ success: boolean; bidId?: string; error?: string }> {
    try {
      // Check if request is open
      const request = await this.db
        .prepare('SELECT * FROM service_requests WHERE id = ? AND status IN (?, ?)')
        .bind(data.requestId, 'open', 'bidding')
        .first<any>();

      if (!request) {
        return { success: false, error: 'Request not open for bidding' };
      }

      // Check if firm already bid
      const existingBid = await this.db
        .prepare('SELECT id FROM request_bids WHERE request_id = ? AND firm_id = ?')
        .bind(data.requestId, data.firmId)
        .first();

      if (existingBid) {
        return { success: false, error: 'Your firm has already bid on this request' };
      }

      // Get firm's commission rate
      const firm = await this.db
        .prepare('SELECT commission_rate FROM law_firms WHERE id = ?')
        .bind(data.firmId)
        .first<{ commission_rate: number }>();

      const commissionRate = firm?.commission_rate || 20;
      const platformCommission = data.bidAmount * (commissionRate / 100);
      const firmReceives = data.bidAmount - platformCommission;

      const bidId = `bid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + (data.validDays || 7));

      await this.db
        .prepare(`
          INSERT INTO request_bids (
            id, request_id, firm_id, submitted_by, assigned_lawyer_id,
            bid_amount, service_fee, platform_commission, firm_receives,
            delivery_days, cover_letter, inclusions, valid_until,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `)
        .bind(
          bidId,
          data.requestId,
          data.firmId,
          data.submittedBy,
          data.assignedLawyerId || null,
          data.bidAmount,
          data.bidAmount,
          platformCommission,
          firmReceives,
          data.deliveryDays,
          data.coverLetter || null,
          JSON.stringify(data.inclusions || []),
          validUntil.toISOString()
        )
        .run();

      // Update request status to 'bidding' if it was 'open'
      if (request.status === 'open') {
        await this.db
          .prepare("UPDATE service_requests SET status = 'bidding', updated_at = datetime('now') WHERE id = ?")
          .bind(data.requestId)
          .run();
      }

      return { success: true, bidId };
    } catch (error) {
      console.error('Error submitting bid:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get bids for a request
   */
  async getBidsForRequest(requestId: string, options?: {
    sortBy?: 'price' | 'rating' | 'delivery' | 'value_score';
  }): Promise<RequestBid[]> {
    let orderBy = 'created_at DESC';

    switch (options?.sortBy) {
      case 'price':
        orderBy = 'bid_amount ASC';
        break;
      case 'delivery':
        orderBy = 'delivery_days ASC';
        break;
      case 'rating':
        orderBy = '(SELECT average_rating FROM law_firms WHERE id = request_bids.firm_id) DESC';
        break;
      case 'value_score':
        // Value score: lower price + higher rating + faster delivery
        orderBy = `(
          (bid_amount / (SELECT MAX(bid_amount) FROM request_bids WHERE request_id = ?)) * 0.3 +
          (1 - (SELECT average_rating FROM law_firms WHERE id = request_bids.firm_id) / 5) * 0.4 +
          (delivery_days / (SELECT MAX(delivery_days) FROM request_bids WHERE request_id = ?)) * 0.3
        ) ASC`;
        break;
    }

    const bids = await this.db
      .prepare(`
        SELECT rb.*, f.name as firm_name, f.logo_url as firm_logo,
               f.average_rating as firm_rating, f.total_cases_completed as firm_cases
        FROM request_bids rb
        JOIN law_firms f ON f.id = rb.firm_id
        WHERE rb.request_id = ? AND rb.status IN ('pending', 'shortlisted')
        ORDER BY ${orderBy}
      `)
      .bind(requestId)
      .all();

    return (bids.results || []).map((row: any) => this.mapBid(row));
  }

  /**
   * Accept a bid
   */
  async acceptBid(bidId: string, userId: string): Promise<{
    success: boolean;
    engagementId?: string;
    error?: string;
  }> {
    try {
      // Get bid and request
      const bid = await this.db
        .prepare(`
          SELECT rb.*, sr.user_id as request_user_id, sr.id as request_id,
                 sr.service_type, sr.category
          FROM request_bids rb
          JOIN service_requests sr ON sr.id = rb.request_id
          WHERE rb.id = ? AND rb.status = 'pending'
        `)
        .bind(bidId)
        .first<any>();

      if (!bid) {
        return { success: false, error: 'Bid not found or already processed' };
      }

      if (bid.request_user_id !== userId) {
        return { success: false, error: 'Only the request owner can accept bids' };
      }

      // Get anchor partner for revenue share calculation
      const anchor = await this.getActiveAnchorPartner();
      const anchorShareRate = anchor?.anchor.revenueSharePercent || 0;
      const anchorShare = bid.platform_commission * (anchorShareRate / 100);

      // Create engagement
      const engagementId = `eng_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      await this.db
        .prepare(`
          INSERT INTO firm_engagements (
            id, request_id, bid_id, firm_id, user_id,
            lead_lawyer_id, service_type, category,
            agreed_amount, platform_commission_rate, platform_commission,
            anchor_share_rate, anchor_share, firm_payout,
            payment_type, deposit_percent, deposit_amount,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'full_upfront', 100, ?, 'pending_payment')
        `)
        .bind(
          engagementId,
          bid.request_id,
          bidId,
          bid.firm_id,
          userId,
          bid.assigned_lawyer_id,
          bid.service_type,
          bid.category,
          bid.bid_amount,
          bid.platform_commission / bid.bid_amount * 100,
          bid.platform_commission,
          anchorShareRate,
          anchorShare,
          bid.firm_receives,
          bid.bid_amount
        )
        .run();

      // Update bid status
      await this.db
        .prepare("UPDATE request_bids SET status = 'accepted', accepted_at = datetime('now') WHERE id = ?")
        .bind(bidId)
        .run();

      // Reject other bids
      await this.db
        .prepare("UPDATE request_bids SET status = 'rejected' WHERE request_id = ? AND id != ?")
        .bind(bid.request_id, bidId)
        .run();

      // Update request
      await this.db
        .prepare(`
          UPDATE service_requests
          SET status = 'assigned',
              assigned_firm_id = ?,
              accepted_bid_id = ?,
              final_price = ?,
              platform_commission = ?,
              anchor_share = ?,
              assigned_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(bid.firm_id, bidId, bid.bid_amount, bid.platform_commission, anchorShare, bid.request_id)
        .run();

      return { success: true, engagementId };
    } catch (error) {
      console.error('Error accepting bid:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================
  // ENGAGEMENTS
  // ============================================

  /**
   * Mark engagement payment as received
   */
  async markPaymentReceived(engagementId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db
        .prepare(`
          UPDATE firm_engagements
          SET deposit_paid = 1,
              deposit_paid_at = datetime('now'),
              status = 'active',
              actual_start_date = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(engagementId)
        .run();

      // Update request status
      await this.db
        .prepare(`
          UPDATE service_requests
          SET status = 'in_progress', started_at = datetime('now'), updated_at = datetime('now')
          WHERE id = (SELECT request_id FROM firm_engagements WHERE id = ?)
        `)
        .bind(engagementId)
        .run();

      return { success: true };
    } catch (error) {
      console.error('Error marking payment received:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Complete an engagement
   */
  async completeEngagement(
    engagementId: string,
    firmId: string,
    deliverableUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const engagement = await this.db
        .prepare('SELECT * FROM firm_engagements WHERE id = ? AND firm_id = ?')
        .bind(engagementId, firmId)
        .first<any>();

      if (!engagement) {
        return { success: false, error: 'Engagement not found' };
      }

      if (engagement.status !== 'active' && engagement.status !== 'in_progress') {
        return { success: false, error: 'Engagement not in active state' };
      }

      await this.db
        .prepare(`
          UPDATE firm_engagements
          SET status = 'under_review',
              final_deliverable_url = ?,
              updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(deliverableUrl || null, engagementId)
        .run();

      return { success: true };
    } catch (error) {
      console.error('Error completing engagement:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Client approves completed work
   */
  async approveEngagement(engagementId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const engagement = await this.db
        .prepare('SELECT * FROM firm_engagements WHERE id = ? AND user_id = ?')
        .bind(engagementId, userId)
        .first<any>();

      if (!engagement) {
        return { success: false, error: 'Engagement not found' };
      }

      // Mark as completed
      await this.db
        .prepare(`
          UPDATE firm_engagements
          SET status = 'completed',
              client_approved = 1,
              client_approved_at = datetime('now'),
              completed_at = datetime('now'),
              actual_end_date = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(engagementId)
        .run();

      // Update request
      await this.db
        .prepare(`
          UPDATE service_requests
          SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(engagement.request_id)
        .run();

      // Record commission
      await this.db
        .prepare(`
          INSERT INTO platform_commissions (
            id, engagement_id, request_id, firm_id,
            transaction_type, transaction_amount, currency,
            commission_rate, commission_amount,
            anchor_partner_id, anchor_share_rate, anchor_share_amount,
            net_platform_amount, status
          ) VALUES (?, ?, ?, ?, 'engagement', ?, 'AED', ?, ?,
            (SELECT id FROM anchor_partners WHERE status = 'active' LIMIT 1),
            ?, ?, ?, 'confirmed')
        `)
        .bind(
          `pc_${Date.now()}`,
          engagementId,
          engagement.request_id,
          engagement.firm_id,
          engagement.agreed_amount,
          engagement.platform_commission_rate,
          engagement.platform_commission,
          engagement.anchor_share_rate || 0,
          engagement.anchor_share || 0,
          engagement.platform_commission - (engagement.anchor_share || 0)
        )
        .run();

      // Update firm ledger
      await this.db
        .prepare(`
          INSERT INTO firm_earnings_ledger (
            id, firm_id, transaction_type, reference_type, reference_id,
            amount, description
          ) VALUES (?, ?, 'earning', 'engagement', ?, ?, ?)
        `)
        .bind(
          `fel_${Date.now()}`,
          engagement.firm_id,
          engagementId,
          engagement.firm_payout,
          `Engagement ${engagement.engagement_number} completed`
        )
        .run();

      return { success: true };
    } catch (error) {
      console.error('Error approving engagement:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================
  // REVIEWS
  // ============================================

  /**
   * Submit a review for a firm
   */
  async submitFirmReview(data: {
    firmId: string;
    engagementId: string;
    userId: string;
    overallRating: number;
    communicationRating?: number;
    expertiseRating?: number;
    timelinessRating?: number;
    valueRating?: number;
    title?: string;
    reviewText?: string;
  }): Promise<{ success: boolean; reviewId?: string; error?: string }> {
    try {
      // Verify engagement belongs to user and is completed
      const engagement = await this.db
        .prepare('SELECT * FROM firm_engagements WHERE id = ? AND user_id = ? AND status = ?')
        .bind(data.engagementId, data.userId, 'completed')
        .first<any>();

      if (!engagement) {
        return { success: false, error: 'Engagement not found or not completed' };
      }

      if (engagement.firm_id !== data.firmId) {
        return { success: false, error: 'Firm does not match engagement' };
      }

      const reviewId = `fr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      await this.db
        .prepare(`
          INSERT INTO firm_reviews (
            id, firm_id, engagement_id, request_id, user_id,
            overall_rating, communication_rating, expertise_rating,
            timeliness_rating, value_rating, title, review_text,
            service_type, category, engagement_value, is_verified
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `)
        .bind(
          reviewId,
          data.firmId,
          data.engagementId,
          engagement.request_id,
          data.userId,
          data.overallRating,
          data.communicationRating || null,
          data.expertiseRating || null,
          data.timelinessRating || null,
          data.valueRating || null,
          data.title || null,
          data.reviewText || null,
          engagement.service_type,
          engagement.category,
          engagement.agreed_amount
        )
        .run();

      // Trigger will update firm rating automatically

      return { success: true, reviewId };
    } catch (error) {
      console.error('Error submitting review:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private mapFirm(row: any): LawFirm {
    return {
      id: row.id,
      name: row.name,
      nameAr: row.name_ar,
      slug: row.slug,
      logoUrl: row.logo_url,
      email: row.email,
      phone: row.phone,
      country: row.country,
      emirate: row.emirate,
      city: row.city,
      firmType: row.firm_type,
      firmSize: row.firm_size,
      specializations: JSON.parse(row.specializations || '[]'),
      description: row.description,
      descriptionAr: row.description_ar,
      totalLawyers: row.total_lawyers || 0,
      totalCasesCompleted: row.total_cases_completed || 0,
      totalReviews: row.total_reviews || 0,
      averageRating: row.average_rating || 0,
      responseTimeHours: row.response_time_hours || 24,
      minConsultationFee: row.min_consultation_fee,
      maxConsultationFee: row.max_consultation_fee,
      isAnchorPartner: row.is_anchor_partner === 1,
      isVerified: row.is_verified === 1,
      isFeatured: row.is_featured === 1,
      status: row.status,
      verificationStatus: row.verification_status,
      commissionRate: row.commission_rate || 20,
      createdAt: row.created_at,
    };
  }

  private mapAnchorPartner(row: any): AnchorPartner {
    return {
      id: row.anchor_id || row.id,
      firmId: row.firm_id,
      agreementType: row.agreement_type,
      exclusiveCategories: JSON.parse(row.exclusive_categories || '[]'),
      revenueSharePercent: row.revenue_share_percent || 8,
      minimumGuarantee: row.minimum_guarantee || 0,
      retainerAmount: row.retainer_amount || 0,
      partnerCommissionRate: row.partner_commission_rate || 10,
      firstRefusalEnabled: row.first_refusal_enabled === 1,
      firstRefusalHours: row.first_refusal_hours || 4,
      contractStartDate: row.contract_start_date,
      contractEndDate: row.contract_end_date,
      status: row.anchor_status || row.status,
      totalRevenueGenerated: row.total_revenue_generated || 0,
      casesAccepted: row.cases_accepted || 0,
      casesDeclined: row.cases_declined || 0,
    };
  }

  private mapServiceRequest(row: any): ServiceRequest {
    return {
      id: row.id,
      requestNumber: row.request_number,
      userId: row.user_id,
      serviceType: row.service_type,
      category: row.category,
      documentId: row.document_id,
      title: row.title,
      description: row.description,
      requiredLanguages: JSON.parse(row.required_languages || '["en"]'),
      requiredEmirate: row.required_emirate,
      urgency: row.urgency,
      deadline: row.deadline,
      complexity: row.complexity,
      budgetMin: row.budget_min,
      budgetMax: row.budget_max,
      currency: row.currency || 'AED',
      status: row.status,
      anchorOfferedAt: row.anchor_offered_at,
      anchorResponseDeadline: row.anchor_response_deadline,
      assignedFirmId: row.assigned_firm_id,
      assignedLawyerId: row.assigned_lawyer_id,
      acceptedBidId: row.accepted_bid_id,
      finalPrice: row.final_price,
      platformCommission: row.platform_commission,
      anchorShare: row.anchor_share,
      bidCount: row.bid_count,
      lowestBid: row.lowest_bid,
      highestBid: row.highest_bid,
      createdAt: row.created_at,
    };
  }

  private mapBid(row: any): RequestBid {
    return {
      id: row.id,
      requestId: row.request_id,
      firmId: row.firm_id,
      submittedBy: row.submitted_by,
      assignedLawyerId: row.assigned_lawyer_id,
      bidAmount: row.bid_amount,
      currency: row.currency || 'AED',
      serviceFee: row.service_fee,
      platformCommission: row.platform_commission,
      firmReceives: row.firm_receives,
      estimatedHours: row.estimated_hours,
      deliveryDays: row.delivery_days,
      deliveryDate: row.delivery_date,
      coverLetter: row.cover_letter,
      inclusions: JSON.parse(row.inclusions || '[]'),
      status: row.status,
      viewedByUser: row.viewed_by_user === 1,
      validUntil: row.valid_until,
      createdAt: row.created_at,
    };
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createFirmMarketplaceService(db: D1Database): FirmMarketplaceService {
  return new FirmMarketplaceService(db);
}
