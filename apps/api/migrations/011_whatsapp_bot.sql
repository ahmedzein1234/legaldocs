-- Migration: WhatsApp Legal Bot
-- Adds support for document analysis via WhatsApp

-- Document analyses table
CREATE TABLE IF NOT EXISTS whatsapp_document_analyses (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'contract',
  risk_score INTEGER DEFAULT 50,
  analysis_json TEXT,
  lawyer_referral_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (session_id) REFERENCES whatsapp_sessions(id) ON DELETE CASCADE
);

-- Lawyer referrals from WhatsApp bot
CREATE TABLE IF NOT EXISTS whatsapp_lawyer_referrals (
  id TEXT PRIMARY KEY,
  analysis_id TEXT,
  session_id TEXT NOT NULL,
  lawyer_id TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  responded_at TEXT,

  FOREIGN KEY (analysis_id) REFERENCES whatsapp_document_analyses(id) ON DELETE SET NULL,
  FOREIGN KEY (session_id) REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bot configuration table
CREATE TABLE IF NOT EXISTS whatsapp_bot_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  auto_respond BOOLEAN DEFAULT 1,
  document_analysis_enabled BOOLEAN DEFAULT 1,
  lawyer_matching_enabled BOOLEAN DEFAULT 1,
  max_daily_analyses INTEGER DEFAULT 100,
  response_language TEXT DEFAULT 'auto',
  welcome_message_en TEXT,
  welcome_message_ar TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by TEXT
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_document_analyses_session ON whatsapp_document_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_document_analyses_created ON whatsapp_document_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_lawyer_referrals_status ON whatsapp_lawyer_referrals(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_lawyer_referrals_lawyer ON whatsapp_lawyer_referrals(lawyer_id);

-- Insert default bot config
INSERT OR IGNORE INTO whatsapp_bot_config (id, welcome_message_en, welcome_message_ar) VALUES (
  'default',
  'Welcome to LegalDocs! Send us any contract or legal document photo for instant AI analysis.',
  'مرحباً بك في LegalDocs! أرسل لنا صورة أي عقد أو مستند قانوني للتحليل الفوري بالذكاء الاصطناعي.'
);
