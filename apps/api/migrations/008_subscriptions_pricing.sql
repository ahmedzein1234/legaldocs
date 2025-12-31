-- =====================================================
-- QANNONI - SUBSCRIPTION & PRICING SYSTEM
-- Version: 1.0.0
-- Date: 2025-12-31
--
-- Implements pricing tiers:
-- - Free: 3 docs/month, 3 AI generations
-- - Professional: AED 149/month - 25 docs, 50 AI generations
-- - Business: AED 449/month - unlimited docs, 200 AI generations
-- - Enterprise: Custom pricing - white-label, API access
-- =====================================================

-- =====================================================
-- PRICING PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS pricing_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    description_ar TEXT,

    -- Pricing
    price_monthly REAL NOT NULL DEFAULT 0,
    price_yearly REAL,
    currency TEXT DEFAULT 'AED',

    -- Limits
    documents_per_month INTEGER DEFAULT 3,
    ai_generations_per_month INTEGER DEFAULT 3,
    signatures_per_month INTEGER DEFAULT 1,
    storage_mb INTEGER DEFAULT 100,
    team_members INTEGER DEFAULT 1,

    -- Features (JSON array of feature keys)
    features TEXT DEFAULT '[]',

    -- Settings
    is_active INTEGER DEFAULT 1,
    is_popular INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- ENHANCED SUBSCRIPTIONS TABLE
-- =====================================================

-- Add new columns to existing subscriptions table
ALTER TABLE subscriptions ADD COLUMN plan_id TEXT REFERENCES pricing_plans(id);
ALTER TABLE subscriptions ADD COLUMN user_id TEXT REFERENCES users(id);
ALTER TABLE subscriptions ADD COLUMN billing_cycle TEXT DEFAULT 'monthly';
ALTER TABLE subscriptions ADD COLUMN price_paid REAL;
ALTER TABLE subscriptions ADD COLUMN currency TEXT DEFAULT 'AED';
ALTER TABLE subscriptions ADD COLUMN next_billing_date TEXT;
ALTER TABLE subscriptions ADD COLUMN trial_ends_at TEXT;
ALTER TABLE subscriptions ADD COLUMN cancelled_at TEXT;
ALTER TABLE subscriptions ADD COLUMN cancellation_reason TEXT;

-- =====================================================
-- USAGE TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_tracking (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    org_id TEXT REFERENCES organizations(id),
    subscription_id TEXT REFERENCES subscriptions(id),

    -- Period
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,

    -- Usage counts
    documents_created INTEGER DEFAULT 0,
    documents_generated INTEGER DEFAULT 0,
    ai_generations_used INTEGER DEFAULT 0,
    signatures_sent INTEGER DEFAULT 0,
    storage_used_mb REAL DEFAULT 0,

    -- Limits (snapshot from plan)
    documents_limit INTEGER,
    ai_generations_limit INTEGER,
    signatures_limit INTEGER,
    storage_limit_mb INTEGER,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- USAGE EVENTS TABLE (detailed tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    org_id TEXT REFERENCES organizations(id),
    tracking_id TEXT REFERENCES usage_tracking(id),

    event_type TEXT NOT NULL, -- 'document_created', 'ai_generation', 'signature_sent', 'storage_upload'
    resource_id TEXT,
    resource_type TEXT,
    quantity INTEGER DEFAULT 1,
    metadata TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- SUBSCRIPTION INVOICES
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_invoices (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL REFERENCES subscriptions(id),
    user_id TEXT NOT NULL REFERENCES users(id),

    invoice_number TEXT UNIQUE NOT NULL,

    -- Amounts
    subtotal REAL NOT NULL,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    total REAL NOT NULL,
    currency TEXT DEFAULT 'AED',

    -- Period
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, paid, failed, void
    paid_at TEXT,
    payment_method TEXT,
    payment_transaction_id TEXT,

    -- PDF
    pdf_url TEXT,

    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- PROMO CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,

    -- Discount
    discount_type TEXT DEFAULT 'percentage', -- percentage, fixed
    discount_value REAL NOT NULL,

    -- Validity
    valid_from TEXT,
    valid_until TEXT,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,

    -- Restrictions
    applicable_plans TEXT DEFAULT '[]', -- JSON array of plan IDs
    min_subscription_months INTEGER DEFAULT 1,
    first_time_only INTEGER DEFAULT 0,

    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- PROMO CODE REDEMPTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_redemptions (
    id TEXT PRIMARY KEY,
    code_id TEXT NOT NULL REFERENCES promo_codes(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    subscription_id TEXT REFERENCES subscriptions(id),

    discount_applied REAL NOT NULL,
    redeemed_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pricing_plans_slug ON pricing_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_events_user ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON subscription_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- =====================================================
-- SEED DEFAULT PRICING PLANS
-- =====================================================

INSERT OR IGNORE INTO pricing_plans (
    id, name, name_ar, slug, description, description_ar,
    price_monthly, price_yearly, currency,
    documents_per_month, ai_generations_per_month, signatures_per_month, storage_mb, team_members,
    features, is_active, is_popular, display_order
) VALUES
    -- Free Plan
    (
        'plan_free',
        'Free',
        'مجاني',
        'free',
        'Perfect for individuals getting started with legal documents',
        'مثالي للأفراد الذين يبدأون بالوثائق القانونية',
        0, 0, 'AED',
        3, 3, 1, 100, 1,
        '["basic_templates", "pdf_export", "email_support"]',
        1, 0, 1
    ),
    -- Professional Plan
    (
        'plan_professional',
        'Professional',
        'احترافي',
        'professional',
        'For professionals who need more documents and AI power',
        'للمحترفين الذين يحتاجون إلى المزيد من المستندات وقوة الذكاء الاصطناعي',
        149, 1490, 'AED',
        25, 50, 10, 1000, 3,
        '["basic_templates", "premium_templates", "pdf_export", "ai_document_generation", "ai_contract_review", "e_signatures", "priority_support", "custom_branding"]',
        1, 1, 2
    ),
    -- Business Plan
    (
        'plan_business',
        'Business',
        'أعمال',
        'business',
        'For growing businesses with unlimited document needs',
        'للشركات النامية ذات الاحتياجات غير المحدودة من المستندات',
        449, 4490, 'AED',
        -1, 200, 50, 10000, 10,
        '["basic_templates", "premium_templates", "pdf_export", "ai_document_generation", "ai_contract_review", "ai_clause_suggestions", "e_signatures", "bulk_operations", "team_collaboration", "audit_trail", "api_access", "dedicated_support", "custom_branding", "analytics_dashboard"]',
        1, 0, 3
    ),
    -- Enterprise Plan
    (
        'plan_enterprise',
        'Enterprise',
        'مؤسسة',
        'enterprise',
        'Custom solutions for large organizations',
        'حلول مخصصة للمؤسسات الكبيرة',
        0, 0, 'AED',
        -1, -1, -1, -1, -1,
        '["all_features", "white_label", "dedicated_account_manager", "custom_integrations", "sla_guarantee", "on_premise_option", "training_included", "24_7_support"]',
        1, 0, 4
    );

-- Create initial "First 1000 Free" promo code
INSERT OR IGNORE INTO promo_codes (
    id, code, description,
    discount_type, discount_value,
    valid_from, valid_until, max_uses,
    applicable_plans, first_time_only, is_active
) VALUES (
    'promo_launch_2025',
    'LAUNCH2025',
    'First 1000 users get 3 months free Professional plan',
    'percentage', 100,
    datetime('now'), datetime('now', '+6 months'), 1000,
    '["plan_professional"]', 1, 1
);
