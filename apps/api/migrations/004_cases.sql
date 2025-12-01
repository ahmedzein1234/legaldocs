-- Case Management Schema for LegalDocs
-- Run with: wrangler d1 execute legaldocs-db --file=./migrations/004_cases.sql

-- Cases/Matters table
CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    case_number TEXT UNIQUE NOT NULL,
    created_by TEXT NOT NULL,
    org_id TEXT,

    -- Basic info
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT,
    description_ar TEXT,

    -- Case classification
    case_type TEXT NOT NULL, -- litigation, corporate, real_estate, employment, family, intellectual_property, contract, immigration, other
    practice_area TEXT, -- civil, criminal, commercial, administrative
    jurisdiction TEXT DEFAULT 'AE', -- AE, SA, QA, KW, BH, OM
    court TEXT, -- Dubai Courts, DIFC Courts, Abu Dhabi Courts, etc.

    -- Status tracking
    status TEXT DEFAULT 'open', -- open, active, pending, on_hold, closed, won, lost, settled
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent

    -- Parties
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    opposing_party TEXT,
    opposing_counsel TEXT,

    -- Financial
    case_value REAL,
    currency TEXT DEFAULT 'AED',
    billing_type TEXT DEFAULT 'hourly', -- hourly, fixed, contingency, retainer
    hourly_rate REAL,
    retainer_amount REAL,
    total_billed REAL DEFAULT 0,
    total_paid REAL DEFAULT 0,

    -- Important dates
    date_opened TEXT,
    date_closed TEXT,
    statute_of_limitations TEXT,
    next_hearing_date TEXT,
    next_deadline TEXT,

    -- Reference numbers
    court_case_number TEXT,
    reference_number TEXT,

    -- Assigned team
    assigned_lawyer_id TEXT,
    assigned_team TEXT, -- JSON array of user IDs

    -- Metadata
    tags TEXT, -- JSON array
    custom_fields TEXT, -- JSON object
    notes TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (org_id) REFERENCES organizations(id),
    FOREIGN KEY (assigned_lawyer_id) REFERENCES users(id)
);

-- Case Tasks/Deadlines table
CREATE TABLE IF NOT EXISTS case_tasks (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    assigned_to TEXT,

    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT,

    task_type TEXT DEFAULT 'task', -- task, deadline, hearing, filing, meeting, call, review, other
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled, overdue

    due_date TEXT,
    due_time TEXT,
    reminder_date TEXT,
    reminder_sent INTEGER DEFAULT 0,

    completed_at TEXT,
    completed_by TEXT,

    -- For court deadlines
    is_court_deadline INTEGER DEFAULT 0,
    court_deadline_type TEXT, -- filing, response, hearing, appeal, discovery

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (completed_by) REFERENCES users(id)
);

-- Case Notes/Comments table
CREATE TABLE IF NOT EXISTS case_notes (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    created_by TEXT NOT NULL,

    content TEXT NOT NULL,
    content_ar TEXT,
    note_type TEXT DEFAULT 'note', -- note, update, communication, research, strategy

    is_private INTEGER DEFAULT 0, -- Only visible to creator
    is_pinned INTEGER DEFAULT 0,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Case Documents link table (links existing documents to cases)
CREATE TABLE IF NOT EXISTS case_documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    added_by TEXT NOT NULL,

    document_category TEXT, -- pleading, evidence, correspondence, contract, research, other
    notes TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(id),
    UNIQUE(case_id, document_id)
);

-- Case Time Entries table (for billing)
CREATE TABLE IF NOT EXISTS case_time_entries (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    description TEXT NOT NULL,
    description_ar TEXT,

    date TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    hourly_rate REAL,
    amount REAL,

    activity_type TEXT, -- research, drafting, meeting, court, travel, communication, review, other
    is_billable INTEGER DEFAULT 1,
    is_billed INTEGER DEFAULT 0,
    invoice_id TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Case Activities/Audit Log
CREATE TABLE IF NOT EXISTS case_activities (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    user_id TEXT,

    action TEXT NOT NULL, -- created, updated, status_changed, task_added, task_completed, document_added, note_added, time_logged
    details TEXT, -- JSON with change details

    ip_address TEXT,
    user_agent TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_case_type ON cases(case_type);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_lawyer ON cases(assigned_lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_next_deadline ON cases(next_deadline);

CREATE INDEX IF NOT EXISTS idx_case_tasks_case_id ON case_tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_case_tasks_due_date ON case_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_case_tasks_status ON case_tasks(status);
CREATE INDEX IF NOT EXISTS idx_case_tasks_assigned_to ON case_tasks(assigned_to);

CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_time_entries_case_id ON case_time_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_case_activities_case_id ON case_activities(case_id);
