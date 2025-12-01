-- =====================================================
-- LEGAL MARKETPLACE - EXTENDED SCHEMA
-- Consultations, Conversations, Matching, Analytics
-- =====================================================

-- Update lawyers table with additional fields
-- (Run these as ALTER TABLE if table exists)

-- Consultations Table
-- Video/phone/in-person consultations between clients and lawyers
CREATE TABLE IF NOT EXISTS consultations (
    id TEXT PRIMARY KEY DEFAULT ('cons_' || lower(hex(randomblob(8)))),

    -- Parties
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    lawyer_user_id TEXT REFERENCES users(id), -- Lawyer's user account for notifications

    -- Scheduling
    scheduled_at TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    consultation_type TEXT DEFAULT 'video', -- video, phone, in_person
    timezone TEXT DEFAULT 'Asia/Dubai',

    -- Details
    topic TEXT,
    description TEXT,
    document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
    urgency TEXT DEFAULT 'standard', -- standard, urgent, express
    preferred_language TEXT DEFAULT 'en',

    -- Client Info (denormalized for easy access)
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,

    -- Pricing
    fee_amount REAL NOT NULL DEFAULT 0,
    platform_fee REAL DEFAULT 0,
    total_amount REAL,
    currency TEXT DEFAULT 'AED',

    -- Payment
    payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded, failed
    payment_id TEXT, -- External payment reference
    paid_at TEXT,

    -- Meeting
    meeting_link TEXT,
    meeting_provider TEXT DEFAULT 'internal', -- internal, zoom, google_meet
    meeting_password TEXT,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled, declined, no_show
    confirmed_at TEXT,
    started_at TEXT,
    completed_at TEXT,
    cancelled_at TEXT,
    cancelled_by TEXT,
    cancellation_reason TEXT,

    -- Rescheduling
    reschedule_count INTEGER DEFAULT 0,
    reschedule_reason TEXT,
    last_rescheduled_at TEXT,
    last_rescheduled_by TEXT,

    -- Notes (lawyer only)
    lawyer_notes TEXT,
    recommendations TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TEXT,

    -- General
    notes TEXT,

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Conversations Table
-- Messaging threads between clients and lawyers
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY DEFAULT ('conv_' || lower(hex(randomblob(8)))),

    -- Parties
    client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    lawyer_user_id TEXT REFERENCES users(id),

    -- Context
    subject TEXT,
    reference_type TEXT, -- consultation, engagement, quote, general
    reference_id TEXT,

    -- Status
    status TEXT DEFAULT 'active', -- active, closed, archived

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Conversation Messages Table
CREATE TABLE IF NOT EXISTS conversation_messages (
    id TEXT PRIMARY KEY DEFAULT ('msg_' || lower(hex(randomblob(8)))),

    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Sender
    sender_id TEXT NOT NULL,
    sender_type TEXT NOT NULL, -- client, lawyer, system

    -- Content
    content TEXT,
    message_type TEXT DEFAULT 'text', -- text, file, system, template

    -- File attachment
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_mime_type TEXT,

    -- Read status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TEXT,

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now'))
);

-- Message Templates Table
-- Pre-written responses for lawyers
CREATE TABLE IF NOT EXISTS message_templates (
    id TEXT PRIMARY KEY DEFAULT ('tmpl_' || lower(hex(randomblob(8)))),

    lawyer_id TEXT REFERENCES lawyers(id) ON DELETE CASCADE,
    is_global BOOLEAN DEFAULT FALSE, -- Platform-wide templates

    name TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- general, greeting, followup, closing, legal

    use_count INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (datetime('now'))
);

-- Add consultation_id to lawyer_reviews if not exists
-- This links reviews to specific consultations
ALTER TABLE lawyer_reviews ADD COLUMN consultation_id TEXT REFERENCES consultations(id);

-- User Lawyer Preferences Table
-- Stores user preferences for lawyer matching
CREATE TABLE IF NOT EXISTS user_lawyer_preferences (
    id TEXT PRIMARY KEY DEFAULT ('pref_' || lower(hex(randomblob(8)))),

    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Preferences
    preferred_specializations TEXT DEFAULT '[]', -- JSON array
    preferred_emirates TEXT DEFAULT '[]', -- JSON array
    preferred_languages TEXT DEFAULT '["en", "ar"]', -- JSON array
    budget_min REAL,
    budget_max REAL,
    prefer_verified BOOLEAN DEFAULT TRUE,
    prefer_featured BOOLEAN DEFAULT FALSE,
    max_response_time_hours INTEGER DEFAULT 24,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Match History Table
-- Records of lawyer matches shown to users
CREATE TABLE IF NOT EXISTS lawyer_match_history (
    id TEXT PRIMARY KEY DEFAULT ('match_' || lower(hex(randomblob(8)))),

    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,

    -- Match details
    match_score REAL,
    match_breakdown TEXT, -- JSON with score breakdown
    match_reasons TEXT, -- JSON array of reasons

    -- User action
    action TEXT, -- viewed, contacted, booked, dismissed
    action_at TEXT,

    -- Context
    search_query TEXT,
    document_type TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Performance Metrics Table
-- Daily aggregated metrics for analytics
CREATE TABLE IF NOT EXISTS lawyer_performance_metrics (
    id TEXT PRIMARY KEY DEFAULT ('metric_' || lower(hex(randomblob(8)))),

    lawyer_id TEXT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- YYYY-MM-DD

    -- Consultation metrics
    consultations_scheduled INTEGER DEFAULT 0,
    consultations_completed INTEGER DEFAULT 0,
    consultations_cancelled INTEGER DEFAULT 0,
    consultation_revenue REAL DEFAULT 0,

    -- Engagement metrics
    quotes_submitted INTEGER DEFAULT 0,
    quotes_accepted INTEGER DEFAULT 0,
    engagements_completed INTEGER DEFAULT 0,
    engagement_revenue REAL DEFAULT 0,

    -- Communication metrics
    messages_sent INTEGER DEFAULT 0,
    avg_response_time_minutes REAL,

    -- Profile metrics
    profile_views INTEGER DEFAULT 0,
    contact_requests INTEGER DEFAULT 0,

    -- Review metrics
    reviews_received INTEGER DEFAULT 0,
    avg_rating_received REAL,

    UNIQUE(lawyer_id, date)
);

-- Lawyer Availability Exceptions Table
-- For blocking out specific dates/times
CREATE TABLE IF NOT EXISTS lawyer_availability_exceptions (
    id TEXT PRIMARY KEY DEFAULT ('avail_' || lower(hex(randomblob(8)))),

    lawyer_id TEXT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,

    exception_type TEXT NOT NULL, -- blocked, holiday, modified_hours
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    start_time TEXT, -- For modified_hours
    end_time TEXT,   -- For modified_hours
    reason TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

-- Payment Transactions Table
-- Track all payments in the system
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY DEFAULT ('pay_' || lower(hex(randomblob(8)))),

    -- Reference
    reference_type TEXT NOT NULL, -- consultation, engagement, subscription
    reference_id TEXT NOT NULL,

    -- Parties
    payer_id TEXT NOT NULL REFERENCES users(id),
    payee_id TEXT REFERENCES users(id), -- Lawyer's user_id for payouts
    lawyer_id TEXT REFERENCES lawyers(id),

    -- Amount
    amount REAL NOT NULL,
    platform_fee REAL DEFAULT 0,
    net_amount REAL, -- After platform fee
    currency TEXT DEFAULT 'AED',

    -- Payment details
    payment_method TEXT, -- card, bank_transfer, wallet
    payment_provider TEXT, -- stripe, tap, etc.
    provider_transaction_id TEXT,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, refunded

    -- Timestamps
    initiated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,

    -- Error handling
    error_code TEXT,
    error_message TEXT
);

-- Escrow Table
-- Hold funds for engagements
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id TEXT PRIMARY KEY DEFAULT ('escrow_' || lower(hex(randomblob(8)))),

    engagement_id TEXT NOT NULL REFERENCES lawyer_engagements(id) ON DELETE CASCADE,

    -- Parties
    client_id TEXT NOT NULL REFERENCES users(id),
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id),

    -- Amount
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'AED',

    -- Status
    status TEXT DEFAULT 'held', -- held, released, refunded, disputed

    -- Timestamps
    held_at TEXT DEFAULT (datetime('now')),
    released_at TEXT,
    released_to TEXT, -- lawyer or client

    -- Dispute handling
    disputed_at TEXT,
    dispute_reason TEXT,
    dispute_resolved_at TEXT,
    dispute_resolution TEXT
);

-- Insert default message templates
INSERT OR IGNORE INTO message_templates (id, is_global, name, content, category) VALUES
    ('tmpl_greeting_1', 1, 'Welcome Message', 'Thank you for reaching out. I have reviewed your query and would be happy to assist you. Could you please provide more details about your legal matter?', 'greeting'),
    ('tmpl_greeting_2', 1, 'مرحبا - Welcome (Arabic)', 'شكراً لتواصلك معنا. لقد اطلعت على استفسارك وسأكون سعيداً بمساعدتك. هل يمكنك تقديم المزيد من التفاصيل حول قضيتك القانونية؟', 'greeting'),
    ('tmpl_followup_1', 1, 'Follow-up Request', 'I wanted to follow up on our previous conversation. Have you had a chance to review the documents I sent? Please let me know if you have any questions.', 'followup'),
    ('tmpl_closing_1', 1, 'Consultation Complete', 'Thank you for the consultation today. As discussed, I will prepare the necessary documents and send them for your review. Please dont hesitate to reach out if you have any questions.', 'closing'),
    ('tmpl_legal_1', 1, 'Document Ready', 'Your document has been reviewed and is ready for your review. Please find the attached annotated version with my comments and recommendations.', 'legal');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer ON consultations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled ON consultations(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lawyer ON conversations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON conversation_messages(is_read) WHERE is_read = 0;

CREATE INDEX IF NOT EXISTS idx_match_history_user ON lawyer_match_history(user_id);
CREATE INDEX IF NOT EXISTS idx_match_history_lawyer ON lawyer_match_history(lawyer_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_lawyer_date ON lawyer_performance_metrics(lawyer_id, date);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payer ON payment_transactions(payer_id);

CREATE INDEX IF NOT EXISTS idx_escrow_engagement ON escrow_transactions(engagement_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_transactions(status);
