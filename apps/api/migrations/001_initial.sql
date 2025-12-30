-- =====================================================
-- QANNONI - INITIAL DATABASE MIGRATION
-- Version: 1.0.0
-- Date: 2025-12-02
--
-- This migration creates all core tables for the Qannoni legal platform.
-- Run with: wrangler d1 execute legaldocs-db --file=./migrations/001_initial.sql
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    email_verified INTEGER DEFAULT 0,
    phone TEXT,
    phone_verified INTEGER DEFAULT 0,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    full_name_ar TEXT,
    full_name_ur TEXT,
    avatar_url TEXT,
    emirates_id_hash TEXT,
    role TEXT DEFAULT 'member',
    ui_language TEXT DEFAULT 'en',
    preferred_doc_languages TEXT DEFAULT '["en","ar"]',
    timezone TEXT DEFAULT 'Asia/Dubai',
    organization_id TEXT,
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    name_ur TEXT,
    slug TEXT UNIQUE,
    trade_license TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    plan TEXT DEFAULT 'free',
    plan_expires_at TEXT,
    settings TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    org_id TEXT,
    created_by TEXT,
    name TEXT NOT NULL,
    name_ar TEXT,
    name_ur TEXT,
    description TEXT,
    description_ar TEXT,
    description_ur TEXT,
    category TEXT,
    content_en TEXT,
    content_ar TEXT,
    content_ur TEXT,
    variables TEXT,
    is_public INTEGER DEFAULT 0,
    is_system INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (org_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    org_id TEXT,
    created_by TEXT,
    template_id TEXT,
    document_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_ar TEXT,
    title_ur TEXT,
    document_type TEXT NOT NULL,
    content_en TEXT,
    content_ar TEXT,
    content_ur TEXT,
    languages TEXT DEFAULT '["en"]',
    binding_language TEXT DEFAULT 'ar',
    pdf_url_en TEXT,
    pdf_url_ar TEXT,
    pdf_url_ur TEXT,
    pdf_url_combined TEXT,
    status TEXT DEFAULT 'draft',
    risk_score INTEGER,
    risk_details TEXT,
    blockchain_hash TEXT,
    blockchain_tx TEXT,
    blockchain_verified_at TEXT,
    metadata TEXT DEFAULT '{}',
    expires_at TEXT,
    signed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (org_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Document Signers table
CREATE TABLE IF NOT EXISTS document_signers (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    full_name TEXT NOT NULL,
    full_name_ar TEXT,
    role TEXT,
    signing_order INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    preferred_language TEXT DEFAULT 'en',
    signature_data TEXT,
    signed_at TEXT,
    signed_ip TEXT,
    signed_device TEXT,
    verification_level TEXT DEFAULT 'none',
    verification_data TEXT,
    verified_at TEXT,
    last_sent_at TEXT,
    reminder_count INTEGER DEFAULT 0,
    viewed_at TEXT,
    declined_reason TEXT,
    signing_token TEXT UNIQUE,
    token_expires_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Document Activities table
CREATE TABLE IF NOT EXISTS document_activities (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    user_id TEXT,
    signer_id TEXT,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (signer_id) REFERENCES document_signers(id)
);

-- Verification Codes table
CREATE TABLE IF NOT EXISTS verification_codes (
    id TEXT PRIMARY KEY,
    email TEXT,
    phone TEXT,
    code TEXT NOT NULL,
    type TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL
);

-- =====================================================
-- WHATSAPP INTEGRATION
-- =====================================================

-- WhatsApp Sessions table
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    phone TEXT NOT NULL,
    state TEXT DEFAULT 'idle',
    context TEXT DEFAULT '{}',
    detected_language TEXT DEFAULT 'en',
    preferred_language TEXT DEFAULT 'en',
    last_message_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- WhatsApp Messages table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    direction TEXT NOT NULL,
    message_type TEXT,
    content TEXT,
    media_url TEXT,
    template_name TEXT,
    twilio_sid TEXT,
    status TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES whatsapp_sessions(id) ON DELETE CASCADE
);

-- =====================================================
-- BLOCKCHAIN INTEGRATION
-- =====================================================

-- Blockchain Records table
CREATE TABLE IF NOT EXISTS blockchain_records (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    document_hash TEXT NOT NULL,
    transaction_hash TEXT,
    block_number INTEGER,
    chain TEXT DEFAULT 'polygon',
    contract_address TEXT,
    status TEXT DEFAULT 'pending',
    gas_used INTEGER,
    registered_at TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- =====================================================
-- SUBSCRIPTIONS
-- =====================================================

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    org_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_period_start TEXT,
    current_period_end TEXT,
    cancel_at_period_end INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- =====================================================
-- LAWYER MARKETPLACE
-- =====================================================

-- Lawyers Table
CREATE TABLE IF NOT EXISTS lawyers (
    id TEXT PRIMARY KEY DEFAULT ('lawyer_' || lower(hex(randomblob(8)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,

    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    first_name_ar TEXT,
    last_name_ar TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    whatsapp TEXT,
    avatar_url TEXT,

    -- Professional Info
    title TEXT DEFAULT 'Attorney',
    title_ar TEXT,
    bio TEXT,
    bio_ar TEXT,
    years_experience INTEGER DEFAULT 0,
    languages TEXT DEFAULT '["en","ar"]',

    -- Credentials
    bar_number TEXT,
    bar_association TEXT,
    license_number TEXT,
    license_country TEXT DEFAULT 'AE',
    license_emirate TEXT,
    license_verified INTEGER DEFAULT 0,
    license_verified_at TEXT,
    license_expiry_date TEXT,

    -- Location
    country TEXT DEFAULT 'AE',
    emirate TEXT,
    city TEXT,
    office_address TEXT,
    coordinates TEXT,

    -- Specializations (JSON array)
    specializations TEXT DEFAULT '[]',
    document_types TEXT DEFAULT '[]',

    -- Pricing
    consultation_fee REAL DEFAULT 0,
    hourly_rate REAL,
    currency TEXT DEFAULT 'AED',
    min_project_fee REAL,

    -- Availability
    is_available INTEGER DEFAULT 1,
    available_hours TEXT,
    response_time_hours INTEGER DEFAULT 24,
    max_concurrent_cases INTEGER DEFAULT 10,
    current_cases INTEGER DEFAULT 0,
    accepting_new_clients INTEGER DEFAULT 1,

    -- Stats
    total_reviews INTEGER DEFAULT 0,
    average_rating REAL DEFAULT 0,
    total_cases_completed INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0,

    -- Verification & Status
    status TEXT DEFAULT 'pending',
    verification_status TEXT DEFAULT 'unverified',
    verification_level TEXT DEFAULT 'none',
    verified_at TEXT,
    featured INTEGER DEFAULT 0,
    top_rated INTEGER DEFAULT 0,
    premium_until TEXT,
    is_active INTEGER DEFAULT 1,

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Verifications table
CREATE TABLE IF NOT EXISTS lawyer_verifications (
    id TEXT PRIMARY KEY,
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    document_data TEXT,
    submitted_at TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    review_notes TEXT,
    rejection_reason TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Badges table
CREATE TABLE IF NOT EXISTS lawyer_badges (
    id TEXT PRIMARY KEY,
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_name_ar TEXT,
    badge_icon TEXT,
    badge_color TEXT,
    verification_level TEXT,
    awarded_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Specialization Categories
CREATE TABLE IF NOT EXISTS specialization_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    description_ar TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Quote Requests
CREATE TABLE IF NOT EXISTS quote_requests (
    id TEXT PRIMARY KEY DEFAULT ('qr_' || lower(hex(randomblob(8)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
    document_type TEXT NOT NULL,
    document_title TEXT,
    document_summary TEXT,
    anonymized_content TEXT,
    original_language TEXT DEFAULT 'en',
    page_count INTEGER DEFAULT 1,
    complexity_score INTEGER DEFAULT 1,
    service_type TEXT DEFAULT 'review',
    urgency TEXT DEFAULT 'standard',
    deadline TEXT,
    budget_min REAL,
    budget_max REAL,
    currency TEXT DEFAULT 'AED',
    special_instructions TEXT,
    target_emirate TEXT,
    target_specialization TEXT,
    preferred_languages TEXT DEFAULT '["en"]',
    status TEXT DEFAULT 'open',
    expires_at TEXT,
    accepted_quote_id TEXT,
    accepted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Quotes
CREATE TABLE IF NOT EXISTS lawyer_quotes (
    id TEXT PRIMARY KEY DEFAULT ('quote_' || lower(hex(randomblob(8)))),
    request_id TEXT NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'AED',
    platform_fee REAL DEFAULT 0,
    total_amount REAL,
    estimated_hours INTEGER,
    estimated_days INTEGER,
    delivery_date TEXT,
    cover_letter TEXT,
    approach_description TEXT,
    inclusions TEXT DEFAULT '[]',
    exclusions TEXT,
    status TEXT DEFAULT 'pending',
    viewed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT
);

-- Lawyer Engagements
CREATE TABLE IF NOT EXISTS lawyer_engagements (
    id TEXT PRIMARY KEY DEFAULT ('eng_' || lower(hex(randomblob(8)))),
    quote_id TEXT NOT NULL REFERENCES lawyer_quotes(id),
    request_id TEXT NOT NULL REFERENCES quote_requests(id),
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    document_id TEXT REFERENCES documents(id),
    amount REAL NOT NULL,
    platform_fee REAL DEFAULT 0,
    deposit_amount REAL,
    deposit_paid_at TEXT,
    final_payment_amount REAL,
    final_paid_at TEXT,
    payment_status TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'pending',
    started_at TEXT,
    due_date TEXT,
    completed_at TEXT,
    chat_enabled INTEGER DEFAULT 1,
    last_message_at TEXT,
    reviewed_document_id TEXT,
    certification_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
    id TEXT PRIMARY KEY DEFAULT ('cert_' || lower(hex(randomblob(8)))),
    engagement_id TEXT REFERENCES lawyer_engagements(id),
    document_id TEXT NOT NULL REFERENCES documents(id),
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id),
    certification_type TEXT DEFAULT 'reviewed',
    certification_number TEXT UNIQUE,
    is_legally_binding INTEGER DEFAULT 0,
    jurisdiction TEXT,
    valid_from TEXT DEFAULT (datetime('now')),
    valid_until TEXT,
    lawyer_statement TEXT,
    lawyer_signature TEXT,
    lawyer_stamp TEXT,
    verification_code TEXT UNIQUE,
    verification_url TEXT,
    blockchain_tx_hash TEXT,
    certified_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Reviews
CREATE TABLE IF NOT EXISTS lawyer_reviews (
    id TEXT PRIMARY KEY DEFAULT ('rev_' || lower(hex(randomblob(8)))),
    engagement_id TEXT REFERENCES lawyer_engagements(id),
    consultation_id TEXT,
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    title TEXT,
    review_text TEXT,
    is_verified INTEGER DEFAULT 1,
    lawyer_response TEXT,
    lawyer_responded_at TEXT,
    is_visible INTEGER DEFAULT 1,
    flagged INTEGER DEFAULT 0,
    flagged_reason TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Messages
CREATE TABLE IF NOT EXISTS lawyer_messages (
    id TEXT PRIMARY KEY DEFAULT ('msg_' || lower(hex(randomblob(8)))),
    engagement_id TEXT REFERENCES lawyer_engagements(id),
    quote_id TEXT REFERENCES lawyer_quotes(id),
    sender_type TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    content TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    is_read INTEGER DEFAULT 0,
    read_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Match History
CREATE TABLE IF NOT EXISTS lawyer_match_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id),
    match_score REAL,
    match_breakdown TEXT,
    match_reasons TEXT,
    document_type TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- CONSULTATIONS
-- =====================================================

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES users(id),
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id),
    status TEXT DEFAULT 'pending',
    consultation_type TEXT DEFAULT 'video',
    scheduled_at TEXT,
    duration_minutes INTEGER DEFAULT 30,
    timezone TEXT DEFAULT 'Asia/Dubai',
    meeting_url TEXT,
    meeting_room_id TEXT,
    phone_number TEXT,
    notes TEXT,
    summary TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_amount REAL,
    payment_currency TEXT DEFAULT 'AED',
    rating INTEGER,
    review_text TEXT,
    cancelled_at TEXT,
    cancellation_reason TEXT,
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- MESSAGING
-- =====================================================

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES users(id),
    recipient_id TEXT NOT NULL REFERENCES users(id),
    consultation_id TEXT REFERENCES consultations(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    file_url TEXT,
    is_read INTEGER DEFAULT 0,
    read_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    title_ar TEXT,
    message TEXT,
    message_ar TEXT,
    data TEXT,
    is_read INTEGER DEFAULT 0,
    read_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- UPLOADS
-- =====================================================

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    filename TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    storage_key TEXT NOT NULL,
    url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- ACTIVITY LOGS
-- =====================================================

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- PAYMENTS
-- =====================================================

-- Payment Transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    payee_id TEXT REFERENCES users(id),
    consultation_id TEXT REFERENCES consultations(id),
    engagement_id TEXT REFERENCES lawyer_engagements(id),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'AED',
    provider TEXT DEFAULT 'stripe',
    provider_transaction_id TEXT,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    metadata TEXT,
    completed_at TEXT,
    refunded_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Escrow Transactions table
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL REFERENCES payment_transactions(id),
    consultation_id TEXT REFERENCES consultations(id),
    engagement_id TEXT REFERENCES lawyer_engagements(id),
    amount REAL NOT NULL,
    status TEXT DEFAULT 'held',
    released_at TEXT,
    released_to TEXT,
    disputed_at TEXT,
    dispute_reason TEXT,
    dispute_resolved_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- SIGNATURE REQUESTS (Alternative naming)
-- =====================================================

-- Signature Requests table
CREATE TABLE IF NOT EXISTS signature_requests (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    signer_name TEXT NOT NULL,
    signer_email TEXT,
    signer_phone TEXT,
    status TEXT DEFAULT 'pending',
    signed_at TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);

CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_number ON documents(document_number);

CREATE INDEX IF NOT EXISTS idx_document_signers_document ON document_signers(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signers_token ON document_signers(signing_token);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone ON whatsapp_sessions(phone);

-- Lawyer indexes
CREATE INDEX IF NOT EXISTS idx_lawyers_user ON lawyers(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyers_country ON lawyers(country);
CREATE INDEX IF NOT EXISTS idx_lawyers_emirate ON lawyers(emirate);
CREATE INDEX IF NOT EXISTS idx_lawyers_status ON lawyers(status);
CREATE INDEX IF NOT EXISTS idx_lawyers_rating ON lawyers(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyers_verification ON lawyers(verification_status, verification_level);

CREATE INDEX IF NOT EXISTS idx_lawyer_verifications_lawyer ON lawyer_verifications(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_badges_lawyer ON lawyer_badges(lawyer_id);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user ON quote_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_lawyer_quotes_request ON lawyer_quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_quotes_lawyer ON lawyer_quotes(lawyer_id);

CREATE INDEX IF NOT EXISTS idx_engagements_lawyer ON lawyer_engagements(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_engagements_user ON lawyer_engagements(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_lawyer ON lawyer_reviews(lawyer_id);

CREATE INDEX IF NOT EXISTS idx_certifications_document ON certifications(document_id);
CREATE INDEX IF NOT EXISTS idx_certifications_verification ON certifications(verification_code);

-- Consultation indexes
CREATE INDEX IF NOT EXISTS idx_consultations_client ON consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer ON consultations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled ON consultations(scheduled_at);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_consultation ON messages(consultation_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_transactions(status);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default specializations
INSERT OR IGNORE INTO specialization_categories (id, name, name_ar, icon, sort_order) VALUES
    ('real_estate', 'Real Estate', 'العقارات', 'Building2', 1),
    ('corporate', 'Corporate & Business', 'الشركات والأعمال', 'Briefcase', 2),
    ('employment', 'Employment & Labor', 'العمل والتوظيف', 'Users', 3),
    ('family', 'Family Law', 'قانون الأسرة', 'Heart', 4),
    ('criminal', 'Criminal Law', 'القانون الجنائي', 'Shield', 5),
    ('immigration', 'Immigration', 'الهجرة والإقامة', 'Globe', 6),
    ('intellectual_property', 'Intellectual Property', 'الملكية الفكرية', 'Lightbulb', 7),
    ('banking', 'Banking & Finance', 'البنوك والتمويل', 'DollarSign', 8),
    ('civil', 'Civil Litigation', 'الدعاوى المدنية', 'Scale', 9),
    ('contracts', 'Contracts', 'العقود', 'FileText', 10);

-- Insert default system templates
INSERT OR IGNORE INTO templates (id, name, name_ar, name_ur, description, category, is_system, is_public, created_at, updated_at)
VALUES
    ('tpl_deposit_receipt', 'Deposit Receipt', 'إيصال إيداع', 'جمع کی رسید', 'Standard deposit receipt for property transactions', 'real_estate', 1, 1, datetime('now'), datetime('now')),
    ('tpl_rental_agreement', 'Rental Agreement', 'عقد إيجار', 'کرایہ کا معاہدہ', 'Standard rental agreement for residential properties', 'real_estate', 1, 1, datetime('now'), datetime('now')),
    ('tpl_nda', 'Non-Disclosure Agreement', 'اتفاقية عدم إفصاح', 'عدم افشاء کا معاہدہ', 'Standard NDA for business relationships', 'nda', 1, 1, datetime('now'), datetime('now')),
    ('tpl_service_agreement', 'Service Agreement', 'اتفاقية خدمات', 'خدمات کا معاہدہ', 'General service agreement template', 'services', 1, 1, datetime('now'), datetime('now')),
    ('tpl_employment_offer', 'Employment Offer', 'عرض توظيف', 'ملازمت کی پیشکش', 'Standard employment offer letter', 'employment', 1, 1, datetime('now'), datetime('now'));
