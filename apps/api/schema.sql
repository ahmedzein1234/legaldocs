-- Cloudflare D1 Database Schema for LegalDocs
-- Run with: wrangler d1 execute legaldocs-db --file=./schema.sql

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_number ON documents(document_number);
CREATE INDEX IF NOT EXISTS idx_document_signers_document ON document_signers(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signers_token ON document_signers(signing_token);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone ON whatsapp_sessions(phone);

-- Insert default system templates
INSERT OR IGNORE INTO templates (id, name, name_ar, name_ur, description, category, is_system, is_public, created_at, updated_at)
VALUES
    ('tpl_deposit_receipt', 'Deposit Receipt', 'إيصال إيداع', 'جمع کی رسید', 'Standard deposit receipt for property transactions', 'real_estate', 1, 1, datetime('now'), datetime('now')),
    ('tpl_rental_agreement', 'Rental Agreement', 'عقد إيجار', 'کرایہ کا معاہدہ', 'Standard rental agreement for residential properties', 'real_estate', 1, 1, datetime('now'), datetime('now')),
    ('tpl_nda', 'Non-Disclosure Agreement', 'اتفاقية عدم إفصاح', 'عدم افشاء کا معاہدہ', 'Standard NDA for business relationships', 'nda', 1, 1, datetime('now'), datetime('now')),
    ('tpl_service_agreement', 'Service Agreement', 'اتفاقية خدمات', 'خدمات کا معاہدہ', 'General service agreement template', 'services', 1, 1, datetime('now'), datetime('now')),
    ('tpl_employment_offer', 'Employment Offer', 'عرض توظيف', 'ملازمت کی پیشکش', 'Standard employment offer letter', 'employment', 1, 1, datetime('now'), datetime('now'));
