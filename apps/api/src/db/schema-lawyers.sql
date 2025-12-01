-- =====================================================
-- LEGAL MARKETPLACE - DATABASE SCHEMA
-- Lawyers, Reviews, Quote Requests, Certifications
-- =====================================================

-- Lawyers Table
-- Stores lawyer profiles with credentials and specializations
CREATE TABLE IF NOT EXISTS lawyers (
    id TEXT PRIMARY KEY DEFAULT ('lawyer_' || lower(hex(randomblob(8)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Link to user account

    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    whatsapp TEXT,
    avatar_url TEXT,

    -- Professional Info
    title TEXT DEFAULT 'Attorney', -- Attorney, Legal Consultant, Advocate, etc.
    bio TEXT, -- Professional biography
    years_experience INTEGER DEFAULT 0,
    languages TEXT DEFAULT '["en","ar"]', -- JSON array of language codes

    -- Credentials
    bar_number TEXT, -- Bar association number
    bar_association TEXT, -- e.g., "Dubai Bar Association"
    license_number TEXT,
    license_country TEXT DEFAULT 'AE',
    license_emirate TEXT, -- Dubai, Abu Dhabi, etc.
    license_verified BOOLEAN DEFAULT FALSE,
    license_verified_at TEXT,
    license_expiry_date TEXT,

    -- Location
    country TEXT DEFAULT 'AE',
    emirate TEXT, -- Dubai, Abu Dhabi, Sharjah, etc.
    city TEXT,
    office_address TEXT,
    coordinates TEXT, -- JSON {lat, lng} for map display

    -- Specializations (JSON array)
    specializations TEXT DEFAULT '[]', -- ["real_estate", "corporate", "family", "employment"]
    document_types TEXT DEFAULT '[]', -- Document types they handle

    -- Pricing
    consultation_fee REAL DEFAULT 0, -- Initial consultation fee
    hourly_rate REAL,
    currency TEXT DEFAULT 'AED',
    min_project_fee REAL, -- Minimum fee for document review

    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    available_hours TEXT, -- JSON schedule
    response_time_hours INTEGER DEFAULT 24, -- Average response time
    max_concurrent_cases INTEGER DEFAULT 10,
    current_cases INTEGER DEFAULT 0,

    -- Stats (updated by triggers/app)
    total_reviews INTEGER DEFAULT 0,
    average_rating REAL DEFAULT 0,
    total_cases_completed INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0,

    -- Verification & Status
    status TEXT DEFAULT 'pending', -- pending, verified, suspended, inactive
    verified_at TEXT,
    featured BOOLEAN DEFAULT FALSE, -- For premium listings
    premium_until TEXT, -- Premium subscription expiry

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Specialization Categories
CREATE TABLE IF NOT EXISTS specialization_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    description_ar TEXT,
    icon TEXT, -- Icon name for UI
    sort_order INTEGER DEFAULT 0
);

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

-- Quote Requests
-- When a user requests lawyer review for a document
CREATE TABLE IF NOT EXISTS quote_requests (
    id TEXT PRIMARY KEY DEFAULT ('qr_' || lower(hex(randomblob(8)))),

    -- Requester Info
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,

    -- Document Info (anonymized copy)
    document_type TEXT NOT NULL,
    document_title TEXT,
    document_summary TEXT, -- AI-generated summary
    anonymized_content TEXT, -- Content with personal info redacted
    original_language TEXT DEFAULT 'en',
    page_count INTEGER DEFAULT 1,
    complexity_score INTEGER DEFAULT 1, -- 1-5, AI assessed

    -- Request Details
    service_type TEXT DEFAULT 'review', -- review, certify, draft, consult
    urgency TEXT DEFAULT 'standard', -- standard, urgent, express
    deadline TEXT, -- User's preferred deadline
    budget_min REAL,
    budget_max REAL,
    currency TEXT DEFAULT 'AED',
    special_instructions TEXT,

    -- Targeting
    target_emirate TEXT, -- Preferred lawyer location
    target_specialization TEXT,
    preferred_languages TEXT DEFAULT '["en"]', -- JSON array

    -- Status
    status TEXT DEFAULT 'open', -- open, quoted, accepted, in_progress, completed, cancelled, expired
    expires_at TEXT, -- When the request expires if no quotes

    -- Selected Quote
    accepted_quote_id TEXT REFERENCES lawyer_quotes(id),
    accepted_at TEXT,

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Quotes
-- Quotes submitted by lawyers for quote requests
CREATE TABLE IF NOT EXISTS lawyer_quotes (
    id TEXT PRIMARY KEY DEFAULT ('quote_' || lower(hex(randomblob(8)))),

    request_id TEXT NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,

    -- Quote Details
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'AED',
    platform_fee REAL DEFAULT 0, -- Platform's cut
    total_amount REAL, -- amount + platform_fee

    -- Timeline
    estimated_hours INTEGER, -- Estimated hours to complete
    estimated_days INTEGER, -- Estimated days to complete
    delivery_date TEXT, -- Promised delivery date

    -- Quote Message
    cover_letter TEXT, -- Lawyer's pitch/message to user
    approach_description TEXT, -- How they plan to handle the document

    -- Inclusions (JSON array)
    inclusions TEXT DEFAULT '[]', -- What's included: ["review", "revisions", "certification"]
    exclusions TEXT, -- What's NOT included

    -- Status
    status TEXT DEFAULT 'pending', -- pending, viewed, accepted, rejected, expired, withdrawn
    viewed_at TEXT, -- When user first viewed this quote

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT -- Quote expiration
);

-- Engagements
-- Active work between user and lawyer
CREATE TABLE IF NOT EXISTS lawyer_engagements (
    id TEXT PRIMARY KEY DEFAULT ('eng_' || lower(hex(randomblob(8)))),

    quote_id TEXT NOT NULL REFERENCES lawyer_quotes(id),
    request_id TEXT NOT NULL REFERENCES quote_requests(id),
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    document_id TEXT REFERENCES documents(id),

    -- Payment
    amount REAL NOT NULL,
    platform_fee REAL DEFAULT 0,
    deposit_amount REAL, -- Initial deposit paid
    deposit_paid_at TEXT,
    final_payment_amount REAL,
    final_paid_at TEXT,
    payment_status TEXT DEFAULT 'pending', -- pending, deposit_paid, fully_paid, refunded

    -- Status
    status TEXT DEFAULT 'pending', -- pending, active, review, revision, completed, cancelled, disputed

    -- Timeline
    started_at TEXT,
    due_date TEXT,
    completed_at TEXT,

    -- Communication
    chat_enabled BOOLEAN DEFAULT TRUE,
    last_message_at TEXT,

    -- Deliverables
    reviewed_document_id TEXT, -- ID of reviewed/certified document
    certification_id TEXT REFERENCES certifications(id),

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Certifications
-- Legal certifications added by lawyers
CREATE TABLE IF NOT EXISTS certifications (
    id TEXT PRIMARY KEY DEFAULT ('cert_' || lower(hex(randomblob(8)))),

    engagement_id TEXT REFERENCES lawyer_engagements(id),
    document_id TEXT NOT NULL REFERENCES documents(id),
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id),

    -- Certification Details
    certification_type TEXT DEFAULT 'reviewed', -- reviewed, notarized, attested, apostille
    certification_number TEXT UNIQUE, -- Official certification number

    -- Legal Validity
    is_legally_binding BOOLEAN DEFAULT FALSE,
    jurisdiction TEXT, -- Jurisdiction where valid
    valid_from TEXT DEFAULT (datetime('now')),
    valid_until TEXT, -- Expiry if applicable

    -- Lawyer's Statement
    lawyer_statement TEXT, -- Lawyer's certification statement
    lawyer_signature TEXT, -- Digital signature or image URL
    lawyer_stamp TEXT, -- Stamp image URL

    -- Verification
    verification_code TEXT UNIQUE, -- QR code / verification code
    verification_url TEXT,
    blockchain_tx_hash TEXT, -- If registered on blockchain

    -- Timestamps
    certified_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Lawyer Reviews
-- Reviews from users after engagement completion
CREATE TABLE IF NOT EXISTS lawyer_reviews (
    id TEXT PRIMARY KEY DEFAULT ('rev_' || lower(hex(randomblob(8)))),

    engagement_id TEXT NOT NULL REFERENCES lawyer_engagements(id),
    lawyer_id TEXT NOT NULL REFERENCES lawyers(id),
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

    -- Verification
    is_verified BOOLEAN DEFAULT TRUE, -- Verified purchase/engagement

    -- Response
    lawyer_response TEXT,
    lawyer_responded_at TEXT,

    -- Moderation
    is_visible BOOLEAN DEFAULT TRUE,
    flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Messages between users and lawyers
CREATE TABLE IF NOT EXISTS lawyer_messages (
    id TEXT PRIMARY KEY DEFAULT ('msg_' || lower(hex(randomblob(8)))),

    engagement_id TEXT REFERENCES lawyer_engagements(id),
    quote_id TEXT REFERENCES lawyer_quotes(id), -- For pre-engagement questions

    sender_type TEXT NOT NULL, -- 'user' or 'lawyer'
    sender_id TEXT NOT NULL,

    message_type TEXT DEFAULT 'text', -- text, file, system
    content TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,

    -- Read status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyers_country ON lawyers(country);
CREATE INDEX IF NOT EXISTS idx_lawyers_emirate ON lawyers(emirate);
CREATE INDEX IF NOT EXISTS idx_lawyers_status ON lawyers(status);
CREATE INDEX IF NOT EXISTS idx_lawyers_rating ON lawyers(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyers_specializations ON lawyers(specializations);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_document ON quote_requests(document_id);

CREATE INDEX IF NOT EXISTS idx_lawyer_quotes_request ON lawyer_quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_quotes_lawyer ON lawyer_quotes(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_quotes_status ON lawyer_quotes(status);

CREATE INDEX IF NOT EXISTS idx_engagements_lawyer ON lawyer_engagements(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_engagements_user ON lawyer_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_engagements_status ON lawyer_engagements(status);

CREATE INDEX IF NOT EXISTS idx_reviews_lawyer ON lawyer_reviews(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON lawyer_reviews(overall_rating);

CREATE INDEX IF NOT EXISTS idx_certifications_document ON certifications(document_id);
CREATE INDEX IF NOT EXISTS idx_certifications_verification ON certifications(verification_code);
