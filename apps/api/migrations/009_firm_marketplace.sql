-- =====================================================
-- QANNONI - LAW FIRM MARKETPLACE & BIDDING SYSTEM
-- Version: 1.0.0
-- Date: 2025-01-02
--
-- Implements:
-- - Law firm registration and profiles
-- - Anchor partner management
-- - Case/service request system
-- - Competitive bidding
-- - Revenue sharing and commissions
-- - Ratings and reviews
-- =====================================================

-- =====================================================
-- LAW FIRMS
-- =====================================================

-- Main law firms table
CREATE TABLE IF NOT EXISTS law_firms (
    id TEXT PRIMARY KEY DEFAULT ('firm_' || lower(hex(randomblob(8)))),

    -- Basic Info
    name TEXT NOT NULL,
    name_ar TEXT,
    slug TEXT UNIQUE,
    logo_url TEXT,
    cover_image_url TEXT,

    -- Contact
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    whatsapp TEXT,
    website TEXT,

    -- Location
    country TEXT DEFAULT 'AE',
    emirate TEXT,
    city TEXT,
    address TEXT,
    address_ar TEXT,
    po_box TEXT,
    coordinates TEXT, -- JSON {lat, lng}

    -- Legal Registration
    trade_license_number TEXT,
    trade_license_expiry TEXT,
    bar_registration_number TEXT,
    regulatory_authority TEXT, -- e.g., "Dubai Courts", "DIFC", "ADGM"

    -- Firm Details
    firm_type TEXT DEFAULT 'local', -- local, international, boutique
    firm_size TEXT DEFAULT 'small', -- solo, small (2-10), medium (11-50), large (50+)
    year_established INTEGER,
    languages TEXT DEFAULT '["en", "ar"]', -- JSON array

    -- Specializations (JSON array of category IDs)
    specializations TEXT DEFAULT '[]',

    -- Description
    description TEXT,
    description_ar TEXT,
    tagline TEXT,
    tagline_ar TEXT,

    -- Stats (updated by triggers/jobs)
    total_lawyers INTEGER DEFAULT 0,
    total_cases_completed INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    average_rating REAL DEFAULT 0,
    response_time_hours INTEGER DEFAULT 24,
    success_rate REAL DEFAULT 0,

    -- Pricing
    min_consultation_fee REAL,
    max_consultation_fee REAL,
    min_hourly_rate REAL,
    max_hourly_rate REAL,
    currency TEXT DEFAULT 'AED',

    -- Platform Settings
    is_anchor_partner INTEGER DEFAULT 0,
    is_verified INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    is_premium INTEGER DEFAULT 0,
    accepts_bidding INTEGER DEFAULT 1,
    auto_accept_threshold REAL, -- Auto-accept bids below this amount

    -- Status
    status TEXT DEFAULT 'pending', -- pending, active, suspended, inactive
    verification_status TEXT DEFAULT 'unverified', -- unverified, pending, verified, rejected
    verified_at TEXT,
    suspended_at TEXT,
    suspension_reason TEXT,

    -- Billing
    commission_rate REAL DEFAULT 20, -- Platform commission percentage
    payout_method TEXT DEFAULT 'bank_transfer',
    payout_details TEXT, -- JSON with bank details

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Firm members (lawyers/staff belonging to firm)
CREATE TABLE IF NOT EXISTS firm_members (
    id TEXT PRIMARY KEY DEFAULT ('fm_' || lower(hex(randomblob(8)))),
    firm_id TEXT NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    lawyer_id TEXT REFERENCES lawyers(id) ON DELETE SET NULL,

    -- Role within firm
    role TEXT DEFAULT 'lawyer', -- owner, partner, senior_associate, associate, lawyer, paralegal, admin
    title TEXT,
    title_ar TEXT,

    -- Permissions
    can_bid INTEGER DEFAULT 0,
    can_accept_cases INTEGER DEFAULT 0,
    can_manage_firm INTEGER DEFAULT 0,
    can_view_financials INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'active', -- active, inactive, invited
    invited_at TEXT,
    joined_at TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    UNIQUE(firm_id, user_id),
    UNIQUE(firm_id, lawyer_id)
);

-- Firm verification documents
CREATE TABLE IF NOT EXISTS firm_verifications (
    id TEXT PRIMARY KEY DEFAULT ('fv_' || lower(hex(randomblob(8)))),
    firm_id TEXT NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,

    verification_type TEXT NOT NULL, -- trade_license, bar_registration, insurance, office_lease
    document_url TEXT,
    document_number TEXT,
    expiry_date TEXT,

    -- Review
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, expired
    reviewed_by TEXT REFERENCES users(id),
    reviewed_at TEXT,
    review_notes TEXT,
    rejection_reason TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Firm service areas (what they offer)
CREATE TABLE IF NOT EXISTS firm_services (
    id TEXT PRIMARY KEY DEFAULT ('fs_' || lower(hex(randomblob(8)))),
    firm_id TEXT NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,

    service_type TEXT NOT NULL, -- consultation, document_review, document_drafting, case_representation, notarization, translation
    category TEXT, -- employment, real_estate, corporate, family, etc.

    -- Pricing
    price_type TEXT DEFAULT 'fixed', -- fixed, hourly, project, quote
    price_min REAL,
    price_max REAL,
    currency TEXT DEFAULT 'AED',

    -- Details
    description TEXT,
    description_ar TEXT,
    delivery_days INTEGER,

    is_active INTEGER DEFAULT 1,

    created_at TEXT DEFAULT (datetime('now')),

    UNIQUE(firm_id, service_type, category)
);

-- =====================================================
-- ANCHOR PARTNER SYSTEM
-- =====================================================

-- Anchor partner agreements
CREATE TABLE IF NOT EXISTS anchor_partners (
    id TEXT PRIMARY KEY DEFAULT ('ap_' || lower(hex(randomblob(8)))),
    firm_id TEXT NOT NULL UNIQUE REFERENCES law_firms(id) ON DELETE CASCADE,

    -- Agreement Terms
    agreement_type TEXT DEFAULT 'category_exclusive', -- full_exclusive, category_exclusive, non_exclusive
    exclusive_categories TEXT DEFAULT '[]', -- JSON array of category IDs

    -- Revenue Share
    revenue_share_percent REAL DEFAULT 8, -- % of ALL platform transactions
    minimum_guarantee REAL DEFAULT 0, -- Monthly minimum payment
    retainer_amount REAL DEFAULT 0, -- Fixed monthly retainer

    -- Their Commission Rate (lower than marketplace)
    partner_commission_rate REAL DEFAULT 10, -- vs 20% for regular firms

    -- First Refusal
    first_refusal_enabled INTEGER DEFAULT 1,
    first_refusal_hours INTEGER DEFAULT 4, -- Hours to respond
    first_refusal_min_value REAL DEFAULT 0, -- Only for cases above this value

    -- Obligations
    template_review_hours_monthly INTEGER DEFAULT 10,
    availability_hours_weekly INTEGER DEFAULT 20,
    response_time_hours INTEGER DEFAULT 4,

    -- Contract Period
    contract_start_date TEXT NOT NULL,
    contract_end_date TEXT,
    auto_renew INTEGER DEFAULT 1,
    notice_period_days INTEGER DEFAULT 180,

    -- Status
    status TEXT DEFAULT 'active', -- draft, active, suspended, terminated
    terminated_at TEXT,
    termination_reason TEXT,

    -- Performance Tracking
    total_revenue_generated REAL DEFAULT 0,
    total_revenue_share_paid REAL DEFAULT 0,
    cases_accepted INTEGER DEFAULT 0,
    cases_declined INTEGER DEFAULT 0,
    templates_reviewed INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Anchor partner revenue tracking (monthly)
CREATE TABLE IF NOT EXISTS anchor_revenue_share (
    id TEXT PRIMARY KEY DEFAULT ('ars_' || lower(hex(randomblob(8)))),
    anchor_id TEXT NOT NULL REFERENCES anchor_partners(id) ON DELETE CASCADE,
    firm_id TEXT NOT NULL REFERENCES law_firms(id),

    -- Period
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,

    -- Platform Revenue (their share is calculated from this)
    platform_transaction_volume REAL DEFAULT 0,
    platform_commission_earned REAL DEFAULT 0,

    -- Their Earnings
    revenue_share_amount REAL DEFAULT 0, -- % of platform commissions
    retainer_amount REAL DEFAULT 0,
    template_review_fees REAL DEFAULT 0,
    bonus_amount REAL DEFAULT 0,

    total_earned REAL DEFAULT 0,

    -- Deductions
    deductions REAL DEFAULT 0,
    deduction_notes TEXT,

    net_payable REAL DEFAULT 0,

    -- Payment
    payment_status TEXT DEFAULT 'pending', -- pending, processing, paid, disputed
    paid_at TEXT,
    payment_reference TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    UNIQUE(anchor_id, period_start)
);

-- =====================================================
-- SERVICE REQUESTS (Cases needing lawyers)
-- =====================================================

-- Service requests from users
CREATE TABLE IF NOT EXISTS service_requests (
    id TEXT PRIMARY KEY DEFAULT ('sr_' || lower(hex(randomblob(8)))),
    request_number TEXT UNIQUE NOT NULL, -- SR-2025-00001

    -- Requester
    user_id TEXT NOT NULL REFERENCES users(id),
    organization_id TEXT REFERENCES organizations(id),

    -- Request Type
    service_type TEXT NOT NULL, -- consultation, document_review, document_drafting, case_representation, other
    category TEXT NOT NULL, -- employment, real_estate, corporate, family, etc.

    -- Related Document (if any)
    document_id TEXT REFERENCES documents(id),

    -- Details
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT NOT NULL,
    description_ar TEXT,

    -- Requirements
    required_languages TEXT DEFAULT '["en"]', -- JSON array
    required_emirate TEXT,
    urgency TEXT DEFAULT 'standard', -- urgent (24h), express (3 days), standard (7 days), flexible
    deadline TEXT,

    -- Complexity
    complexity TEXT DEFAULT 'medium', -- simple, medium, complex, highly_complex
    estimated_hours INTEGER,
    page_count INTEGER,

    -- Budget
    budget_type TEXT DEFAULT 'range', -- fixed, range, open
    budget_min REAL,
    budget_max REAL,
    currency TEXT DEFAULT 'AED',

    -- Attachments
    attachments TEXT DEFAULT '[]', -- JSON array of {url, name, type}

    -- Preferences
    preferred_firm_id TEXT REFERENCES law_firms(id),
    preferred_lawyer_id TEXT REFERENCES lawyers(id),
    firm_size_preference TEXT, -- any, boutique, medium, large

    -- Workflow Status
    status TEXT DEFAULT 'draft', -- draft, pending_review, open, bidding, anchor_review, assigned, in_progress, completed, cancelled, disputed

    -- Anchor Partner First Refusal
    anchor_offered_at TEXT,
    anchor_response_deadline TEXT,
    anchor_accepted INTEGER,
    anchor_declined_reason TEXT,

    -- Assignment
    assigned_firm_id TEXT REFERENCES law_firms(id),
    assigned_lawyer_id TEXT REFERENCES lawyers(id),
    assigned_at TEXT,
    accepted_bid_id TEXT, -- References request_bids(id)

    -- Pricing (final)
    final_price REAL,
    platform_commission REAL,
    anchor_share REAL,
    firm_payout REAL,

    -- Completion
    started_at TEXT,
    completed_at TEXT,
    delivered_at TEXT,

    -- Cancellation
    cancelled_at TEXT,
    cancelled_by TEXT,
    cancellation_reason TEXT,

    -- User Rating (after completion)
    user_rating INTEGER,
    user_review TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Bids from firms on service requests
CREATE TABLE IF NOT EXISTS request_bids (
    id TEXT PRIMARY KEY DEFAULT ('bid_' || lower(hex(randomblob(8)))),
    request_id TEXT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    firm_id TEXT NOT NULL REFERENCES law_firms(id),

    -- Bidder
    submitted_by TEXT NOT NULL REFERENCES users(id),
    assigned_lawyer_id TEXT REFERENCES lawyers(id),

    -- Bid Details
    bid_amount REAL NOT NULL,
    currency TEXT DEFAULT 'AED',

    -- Breakdown
    service_fee REAL NOT NULL,
    platform_commission REAL, -- Calculated: service_fee * commission_rate
    firm_receives REAL, -- Calculated: service_fee - platform_commission

    -- Delivery
    estimated_hours INTEGER,
    delivery_days INTEGER NOT NULL,
    delivery_date TEXT,

    -- Proposal
    cover_letter TEXT,
    cover_letter_ar TEXT,
    approach_description TEXT,

    -- Inclusions/Exclusions
    inclusions TEXT DEFAULT '[]', -- JSON array
    exclusions TEXT,
    terms_conditions TEXT,

    -- Experience (for this bid)
    relevant_experience TEXT,
    similar_cases_count INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, shortlisted, accepted, rejected, withdrawn, expired

    -- User Interaction
    viewed_by_user INTEGER DEFAULT 0,
    viewed_at TEXT,
    shortlisted_at TEXT,

    -- Acceptance/Rejection
    accepted_at TEXT,
    rejected_at TEXT,
    rejection_reason TEXT,
    withdrawn_at TEXT,
    withdrawal_reason TEXT,

    -- Expiry
    valid_until TEXT,
    expired_at TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    UNIQUE(request_id, firm_id)
);

-- =====================================================
-- ENGAGEMENTS (Accepted Work)
-- =====================================================

-- Firm engagements (when bid is accepted or direct assignment)
CREATE TABLE IF NOT EXISTS firm_engagements (
    id TEXT PRIMARY KEY DEFAULT ('eng_' || lower(hex(randomblob(8)))),
    engagement_number TEXT UNIQUE NOT NULL, -- ENG-2025-00001

    -- Links
    request_id TEXT NOT NULL REFERENCES service_requests(id),
    bid_id TEXT REFERENCES request_bids(id),
    firm_id TEXT NOT NULL REFERENCES law_firms(id),
    user_id TEXT NOT NULL REFERENCES users(id),

    -- Assigned Resources
    lead_lawyer_id TEXT REFERENCES lawyers(id),
    team_members TEXT DEFAULT '[]', -- JSON array of lawyer_ids

    -- Service Details
    service_type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,

    -- Financials
    agreed_amount REAL NOT NULL,
    currency TEXT DEFAULT 'AED',

    -- Commission Breakdown
    platform_commission_rate REAL, -- Snapshot of rate at time of engagement
    platform_commission REAL,
    anchor_share_rate REAL,
    anchor_share REAL,
    firm_payout REAL,

    -- Payment Schedule
    payment_type TEXT DEFAULT 'full_upfront', -- full_upfront, milestone, completion, deposit_balance
    deposit_percent REAL DEFAULT 100,
    deposit_amount REAL,
    deposit_paid INTEGER DEFAULT 0,
    deposit_paid_at TEXT,
    balance_amount REAL DEFAULT 0,
    balance_paid INTEGER DEFAULT 0,
    balance_paid_at TEXT,

    -- Timeline
    expected_start_date TEXT,
    expected_end_date TEXT,
    actual_start_date TEXT,
    actual_end_date TEXT,

    -- Status
    status TEXT DEFAULT 'pending_payment', -- pending_payment, active, in_progress, under_review, completed, cancelled, disputed

    -- Deliverables
    deliverables TEXT DEFAULT '[]', -- JSON array of {name, description, status, delivered_at}

    -- Communication
    chat_enabled INTEGER DEFAULT 1,
    last_message_at TEXT,

    -- Completion
    completed_at TEXT,
    completion_notes TEXT,
    final_deliverable_url TEXT,

    -- Client Approval
    client_approved INTEGER,
    client_approved_at TEXT,
    revision_requested INTEGER DEFAULT 0,
    revision_count INTEGER DEFAULT 0,

    -- Cancellation
    cancelled_at TEXT,
    cancelled_by TEXT, -- user_id or firm_id
    cancellation_reason TEXT,
    refund_amount REAL,
    refund_processed INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Engagement milestones (for milestone-based payments)
CREATE TABLE IF NOT EXISTS engagement_milestones (
    id TEXT PRIMARY KEY DEFAULT ('ms_' || lower(hex(randomblob(8)))),
    engagement_id TEXT NOT NULL REFERENCES firm_engagements(id) ON DELETE CASCADE,

    -- Milestone Details
    title TEXT NOT NULL,
    description TEXT,
    order_number INTEGER NOT NULL,

    -- Amount
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'AED',

    -- Timeline
    due_date TEXT,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, in_progress, submitted, approved, rejected, paid

    -- Delivery
    submitted_at TEXT,
    deliverable_url TEXT,
    deliverable_notes TEXT,

    -- Approval
    approved_at TEXT,
    rejected_at TEXT,
    rejection_reason TEXT,

    -- Payment
    paid_at TEXT,
    payment_reference TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- REVIEWS & RATINGS
-- =====================================================

-- Firm reviews (from clients)
CREATE TABLE IF NOT EXISTS firm_reviews (
    id TEXT PRIMARY KEY DEFAULT ('fr_' || lower(hex(randomblob(8)))),
    firm_id TEXT NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    engagement_id TEXT REFERENCES firm_engagements(id),
    request_id TEXT REFERENCES service_requests(id),

    -- Reviewer
    user_id TEXT NOT NULL REFERENCES users(id),

    -- Ratings (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

    -- Review Content
    title TEXT,
    review_text TEXT,

    -- Service Context
    service_type TEXT,
    category TEXT,
    engagement_value REAL,

    -- Verification
    is_verified INTEGER DEFAULT 1, -- Verified = from actual engagement

    -- Firm Response
    firm_response TEXT,
    firm_responded_at TEXT,
    responded_by TEXT REFERENCES users(id),

    -- Moderation
    is_visible INTEGER DEFAULT 1,
    is_flagged INTEGER DEFAULT 0,
    flagged_reason TEXT,
    moderated_at TEXT,
    moderated_by TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    UNIQUE(engagement_id, user_id)
);

-- =====================================================
-- FINANCIAL TRACKING
-- =====================================================

-- Platform commissions log
CREATE TABLE IF NOT EXISTS platform_commissions (
    id TEXT PRIMARY KEY DEFAULT ('pc_' || lower(hex(randomblob(8)))),

    -- Source
    engagement_id TEXT REFERENCES firm_engagements(id),
    request_id TEXT REFERENCES service_requests(id),
    firm_id TEXT NOT NULL REFERENCES law_firms(id),

    -- Transaction
    transaction_type TEXT NOT NULL, -- engagement, consultation, subscription_referral
    transaction_amount REAL NOT NULL,
    currency TEXT DEFAULT 'AED',

    -- Commission Calculation
    commission_rate REAL NOT NULL,
    commission_amount REAL NOT NULL,

    -- Anchor Share (if applicable)
    anchor_partner_id TEXT REFERENCES anchor_partners(id),
    anchor_share_rate REAL DEFAULT 0,
    anchor_share_amount REAL DEFAULT 0,

    -- Net to Platform
    net_platform_amount REAL NOT NULL, -- commission_amount - anchor_share_amount

    -- Status
    status TEXT DEFAULT 'pending', -- pending, confirmed, paid_out
    confirmed_at TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

-- Firm payouts
CREATE TABLE IF NOT EXISTS firm_payouts (
    id TEXT PRIMARY KEY DEFAULT ('fp_' || lower(hex(randomblob(8)))),
    firm_id TEXT NOT NULL REFERENCES law_firms(id),

    -- Period
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,

    -- Earnings
    gross_earnings REAL NOT NULL,
    total_commissions_deducted REAL NOT NULL,
    adjustments REAL DEFAULT 0,
    adjustment_notes TEXT,
    net_payout REAL NOT NULL,
    currency TEXT DEFAULT 'AED',

    -- Included Engagements
    engagement_ids TEXT DEFAULT '[]', -- JSON array
    engagement_count INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, processing, paid, failed, on_hold

    -- Payment Details
    payout_method TEXT,
    bank_details TEXT, -- Encrypted/masked
    payment_reference TEXT,

    -- Timing
    scheduled_date TEXT,
    processed_at TEXT,
    paid_at TEXT,
    failed_at TEXT,
    failure_reason TEXT,

    -- Approval
    approved_by TEXT,
    approved_at TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Firm earnings ledger (detailed transaction log)
CREATE TABLE IF NOT EXISTS firm_earnings_ledger (
    id TEXT PRIMARY KEY DEFAULT ('fel_' || lower(hex(randomblob(8)))),
    firm_id TEXT NOT NULL REFERENCES law_firms(id),

    -- Transaction
    transaction_type TEXT NOT NULL, -- earning, commission, payout, refund, adjustment
    reference_type TEXT, -- engagement, consultation, bid, payout
    reference_id TEXT,

    -- Amount
    amount REAL NOT NULL, -- Positive for earnings, negative for deductions
    currency TEXT DEFAULT 'AED',

    -- Balance
    balance_before REAL,
    balance_after REAL,

    -- Description
    description TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- MESSAGING (Firm-User Communication)
-- =====================================================

-- Engagement messages
CREATE TABLE IF NOT EXISTS engagement_messages (
    id TEXT PRIMARY KEY DEFAULT ('em_' || lower(hex(randomblob(8)))),
    engagement_id TEXT NOT NULL REFERENCES firm_engagements(id) ON DELETE CASCADE,

    -- Can also be used for pre-engagement (bid) communication
    bid_id TEXT REFERENCES request_bids(id),
    request_id TEXT REFERENCES service_requests(id),

    -- Sender
    sender_type TEXT NOT NULL, -- user, firm, system
    sender_id TEXT NOT NULL, -- user_id or firm_member_id

    -- Content
    message_type TEXT DEFAULT 'text', -- text, file, system_notification
    content TEXT NOT NULL,

    -- Attachments
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,

    -- Read Status
    is_read INTEGER DEFAULT 0,
    read_at TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- FIRM AVAILABILITY & CALENDAR
-- =====================================================

-- Firm availability slots
CREATE TABLE IF NOT EXISTS firm_availability (
    id TEXT PRIMARY KEY DEFAULT ('fa_' || lower(hex(randomblob(8)))),
    firm_id TEXT NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    lawyer_id TEXT REFERENCES lawyers(id),

    -- Slot Type
    slot_type TEXT DEFAULT 'consultation', -- consultation, case_work, blocked

    -- Time
    day_of_week INTEGER, -- 0=Sunday, 6=Saturday (NULL for specific date)
    specific_date TEXT, -- For one-off availability
    start_time TEXT NOT NULL, -- HH:MM
    end_time TEXT NOT NULL,
    timezone TEXT DEFAULT 'Asia/Dubai',

    -- Recurring
    is_recurring INTEGER DEFAULT 1,
    recurring_until TEXT,

    -- Capacity
    max_bookings INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,

    is_active INTEGER DEFAULT 1,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Law firms indexes
CREATE INDEX IF NOT EXISTS idx_law_firms_slug ON law_firms(slug);
CREATE INDEX IF NOT EXISTS idx_law_firms_status ON law_firms(status);
CREATE INDEX IF NOT EXISTS idx_law_firms_country ON law_firms(country);
CREATE INDEX IF NOT EXISTS idx_law_firms_emirate ON law_firms(emirate);
CREATE INDEX IF NOT EXISTS idx_law_firms_rating ON law_firms(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_law_firms_anchor ON law_firms(is_anchor_partner);
CREATE INDEX IF NOT EXISTS idx_law_firms_verified ON law_firms(is_verified);

-- Firm members indexes
CREATE INDEX IF NOT EXISTS idx_firm_members_firm ON firm_members(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_members_user ON firm_members(user_id);
CREATE INDEX IF NOT EXISTS idx_firm_members_lawyer ON firm_members(lawyer_id);

-- Service requests indexes
CREATE INDEX IF NOT EXISTS idx_service_requests_user ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(category);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned ON service_requests(assigned_firm_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_created ON service_requests(created_at DESC);

-- Bids indexes
CREATE INDEX IF NOT EXISTS idx_request_bids_request ON request_bids(request_id);
CREATE INDEX IF NOT EXISTS idx_request_bids_firm ON request_bids(firm_id);
CREATE INDEX IF NOT EXISTS idx_request_bids_status ON request_bids(status);

-- Engagements indexes
CREATE INDEX IF NOT EXISTS idx_firm_engagements_request ON firm_engagements(request_id);
CREATE INDEX IF NOT EXISTS idx_firm_engagements_firm ON firm_engagements(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_engagements_user ON firm_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_firm_engagements_status ON firm_engagements(status);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_firm_reviews_firm ON firm_reviews(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_reviews_rating ON firm_reviews(overall_rating);

-- Commissions indexes
CREATE INDEX IF NOT EXISTS idx_platform_commissions_firm ON platform_commissions(firm_id);
CREATE INDEX IF NOT EXISTS idx_platform_commissions_engagement ON platform_commissions(engagement_id);

-- Payouts indexes
CREATE INDEX IF NOT EXISTS idx_firm_payouts_firm ON firm_payouts(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_payouts_status ON firm_payouts(status);
CREATE INDEX IF NOT EXISTS idx_firm_payouts_period ON firm_payouts(period_start, period_end);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_engagement_messages_engagement ON engagement_messages(engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagement_messages_bid ON engagement_messages(bid_id);

-- Anchor partner indexes
CREATE INDEX IF NOT EXISTS idx_anchor_partners_firm ON anchor_partners(firm_id);
CREATE INDEX IF NOT EXISTS idx_anchor_partners_status ON anchor_partners(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-generate request number
CREATE TRIGGER IF NOT EXISTS generate_request_number
AFTER INSERT ON service_requests
WHEN NEW.request_number IS NULL
BEGIN
    UPDATE service_requests
    SET request_number = 'SR-' || strftime('%Y', 'now') || '-' || printf('%05d', NEW.rowid)
    WHERE id = NEW.id;
END;

-- Auto-generate engagement number
CREATE TRIGGER IF NOT EXISTS generate_engagement_number
AFTER INSERT ON firm_engagements
WHEN NEW.engagement_number IS NULL
BEGIN
    UPDATE firm_engagements
    SET engagement_number = 'ENG-' || strftime('%Y', 'now') || '-' || printf('%05d', NEW.rowid)
    WHERE id = NEW.id;
END;

-- Update firm stats after review
CREATE TRIGGER IF NOT EXISTS update_firm_rating_after_review
AFTER INSERT ON firm_reviews
BEGIN
    UPDATE law_firms
    SET
        total_reviews = (SELECT COUNT(*) FROM firm_reviews WHERE firm_id = NEW.firm_id AND is_visible = 1),
        average_rating = (SELECT AVG(overall_rating) FROM firm_reviews WHERE firm_id = NEW.firm_id AND is_visible = 1),
        updated_at = datetime('now')
    WHERE id = NEW.firm_id;
END;

-- Update firm case count after engagement completion
CREATE TRIGGER IF NOT EXISTS update_firm_cases_after_completion
AFTER UPDATE OF status ON firm_engagements
WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
    UPDATE law_firms
    SET
        total_cases_completed = total_cases_completed + 1,
        updated_at = datetime('now')
    WHERE id = NEW.firm_id;
END;

-- =====================================================
-- VIEWS
-- =====================================================

-- Active firms with stats
CREATE VIEW IF NOT EXISTS v_active_firms AS
SELECT
    f.*,
    COALESCE(ap.id, NULL) as anchor_partner_id,
    COALESCE(ap.revenue_share_percent, 0) as anchor_revenue_share,
    (SELECT COUNT(*) FROM firm_members WHERE firm_id = f.id AND status = 'active') as active_members,
    (SELECT COUNT(*) FROM firm_engagements WHERE firm_id = f.id AND status = 'completed') as completed_engagements,
    (SELECT COUNT(*) FROM request_bids WHERE firm_id = f.id AND status = 'accepted') as won_bids,
    (SELECT COUNT(*) FROM request_bids WHERE firm_id = f.id) as total_bids
FROM law_firms f
LEFT JOIN anchor_partners ap ON ap.firm_id = f.id AND ap.status = 'active'
WHERE f.status = 'active';

-- Open requests available for bidding
CREATE VIEW IF NOT EXISTS v_open_requests AS
SELECT
    sr.*,
    u.full_name as requester_name,
    u.email as requester_email,
    (SELECT COUNT(*) FROM request_bids WHERE request_id = sr.id) as bid_count,
    (SELECT MIN(bid_amount) FROM request_bids WHERE request_id = sr.id AND status = 'pending') as lowest_bid,
    (SELECT MAX(bid_amount) FROM request_bids WHERE request_id = sr.id AND status = 'pending') as highest_bid
FROM service_requests sr
JOIN users u ON u.id = sr.user_id
WHERE sr.status IN ('open', 'bidding');

-- =====================================================
-- SEED DATA
-- =====================================================

-- Note: Service categories are defined inline in the application
-- No seed data required for initial migration
