-- =====================================================
-- CONSULTATION CALLS - EXTENDED SCHEMA
-- Video rooms, phone calls, preparation, summaries
-- =====================================================

-- Add new columns to consultations table
-- Run as ALTER TABLE if table exists

-- Video consultation fields
ALTER TABLE consultations ADD COLUMN meeting_room_id TEXT;
ALTER TABLE consultations ADD COLUMN meeting_provider TEXT DEFAULT 'jitsi'; -- jitsi, daily, twilio
ALTER TABLE consultations ADD COLUMN meeting_password TEXT;
ALTER TABLE consultations ADD COLUMN recording_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE consultations ADD COLUMN recording_url TEXT;

-- Phone consultation fields
ALTER TABLE consultations ADD COLUMN call_sid TEXT; -- Twilio call SID
ALTER TABLE consultations ADD COLUMN call_status TEXT;
ALTER TABLE consultations ADD COLUMN masked_number TEXT;

-- Timing fields
ALTER TABLE consultations ADD COLUMN started_at TEXT;
ALTER TABLE consultations ADD COLUMN actual_duration_minutes INTEGER;

-- Summary fields
ALTER TABLE consultations ADD COLUMN consultation_summary TEXT;
ALTER TABLE consultations ADD COLUMN recommendations TEXT;
ALTER TABLE consultations ADD COLUMN action_items TEXT; -- JSON array
ALTER TABLE consultations ADD COLUMN summary_created_at TEXT;

-- Consultation Call Logs
-- Track all call-related events
CREATE TABLE IF NOT EXISTS consultation_call_logs (
    id TEXT PRIMARY KEY DEFAULT ('clog_' || lower(hex(randomblob(8)))),

    consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),

    action TEXT NOT NULL, -- room_created, joined, left, ended, initiated, answered, etc.
    call_type TEXT NOT NULL, -- video, phone

    room_id TEXT, -- For video calls
    call_sid TEXT, -- For phone calls

    duration_seconds INTEGER,
    metadata TEXT, -- JSON for additional data

    created_at TEXT DEFAULT (datetime('now'))
);

-- Consultation Preparation
-- Pre-consultation checklist and notes
CREATE TABLE IF NOT EXISTS consultation_preparation (
    id TEXT PRIMARY KEY DEFAULT ('prep_' || lower(hex(randomblob(8)))),

    consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    checklist_progress TEXT DEFAULT '[]', -- JSON array of completed item IDs
    preparation_notes TEXT,
    questions_to_ask TEXT, -- Client's prepared questions

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    UNIQUE(consultation_id, user_id)
);

-- Consultation Documents
-- Documents shared for consultation reference
CREATE TABLE IF NOT EXISTS consultation_documents (
    id TEXT PRIMARY KEY DEFAULT ('cdoc_' || lower(hex(randomblob(8)))),

    consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    shared_by TEXT NOT NULL REFERENCES users(id),
    notes TEXT, -- Notes about why this document is relevant

    shared_at TEXT DEFAULT (datetime('now')),

    UNIQUE(consultation_id, document_id)
);

-- Consultation Reminders
-- Track sent reminders
CREATE TABLE IF NOT EXISTS consultation_reminders (
    id TEXT PRIMARY KEY DEFAULT ('rem_' || lower(hex(randomblob(8)))),

    consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),

    reminder_type TEXT NOT NULL, -- 24h, 1h, 15m, starting
    channel TEXT NOT NULL, -- email, sms, whatsapp, push

    sent_at TEXT DEFAULT (datetime('now')),
    delivered_at TEXT,
    opened_at TEXT,

    UNIQUE(consultation_id, user_id, reminder_type, channel)
);

-- Video Room Sessions
-- Track active video sessions
CREATE TABLE IF NOT EXISTS video_room_sessions (
    id TEXT PRIMARY KEY DEFAULT ('vsess_' || lower(hex(randomblob(8)))),

    consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    room_id TEXT NOT NULL,
    room_name TEXT NOT NULL,
    room_url TEXT NOT NULL,
    provider TEXT NOT NULL, -- daily, jitsi, twilio

    config TEXT, -- JSON room configuration

    host_token TEXT,
    participant_token TEXT,

    status TEXT DEFAULT 'active', -- active, ended, expired

    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    ended_at TEXT,

    -- Participant tracking
    host_joined_at TEXT,
    participant_joined_at TEXT,

    -- Recording
    recording_enabled BOOLEAN DEFAULT FALSE,
    recording_started_at TEXT,
    recording_url TEXT
);

-- Phone Call Sessions
-- Track phone call details
CREATE TABLE IF NOT EXISTS phone_call_sessions (
    id TEXT PRIMARY KEY DEFAULT ('psess_' || lower(hex(randomblob(8)))),

    consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    call_sid TEXT UNIQUE, -- Twilio SID

    direction TEXT NOT NULL, -- outbound, inbound
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    masked_number TEXT,

    status TEXT DEFAULT 'initiated', -- initiated, ringing, in_progress, completed, failed, no_answer

    initiated_at TEXT DEFAULT (datetime('now')),
    answered_at TEXT,
    ended_at TEXT,
    duration_seconds INTEGER,

    recording_consent BOOLEAN DEFAULT FALSE,
    recording_url TEXT,

    call_quality TEXT, -- excellent, good, fair, poor

    -- Billing
    cost REAL,
    currency TEXT DEFAULT 'USD'
);

-- Consultation Feedback
-- Quick feedback after consultation
CREATE TABLE IF NOT EXISTS consultation_feedback (
    id TEXT PRIMARY KEY DEFAULT ('cfb_' || lower(hex(randomblob(8)))),

    consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),

    -- Quick ratings (1-5)
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    audio_quality INTEGER CHECK (audio_quality >= 1 AND audio_quality <= 5),
    video_quality INTEGER CHECK (video_quality >= 1 AND video_quality <= 5),

    -- Technical issues
    had_technical_issues BOOLEAN DEFAULT FALSE,
    technical_issues TEXT, -- JSON array of issue types

    -- Feedback text
    feedback_text TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    UNIQUE(consultation_id, user_id)
);

-- Action Items
-- Follow-up tasks from consultations
CREATE TABLE IF NOT EXISTS consultation_action_items (
    id TEXT PRIMARY KEY DEFAULT ('act_' || lower(hex(randomblob(8)))),

    consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT, -- 'lawyer' or 'client'
    due_date TEXT,
    priority TEXT DEFAULT 'medium', -- low, medium, high

    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    completed_at TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_call_logs_consultation ON consultation_call_logs(consultation_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_user ON consultation_call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_action ON consultation_call_logs(action);

CREATE INDEX IF NOT EXISTS idx_preparation_consultation ON consultation_preparation(consultation_id);
CREATE INDEX IF NOT EXISTS idx_preparation_user ON consultation_preparation(user_id);

CREATE INDEX IF NOT EXISTS idx_consultation_docs_consultation ON consultation_documents(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_docs_document ON consultation_documents(document_id);

CREATE INDEX IF NOT EXISTS idx_reminders_consultation ON consultation_reminders(consultation_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON consultation_reminders(user_id);

CREATE INDEX IF NOT EXISTS idx_video_sessions_consultation ON video_room_sessions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_room ON video_room_sessions(room_id);

CREATE INDEX IF NOT EXISTS idx_phone_sessions_consultation ON phone_call_sessions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_phone_sessions_call ON phone_call_sessions(call_sid);

CREATE INDEX IF NOT EXISTS idx_feedback_consultation ON consultation_feedback(consultation_id);

CREATE INDEX IF NOT EXISTS idx_action_items_consultation ON consultation_action_items(consultation_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON consultation_action_items(status);
