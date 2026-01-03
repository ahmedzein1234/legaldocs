-- Migration: Request Attachments
-- Adds support for file attachments to service requests

-- Request attachments table
CREATE TABLE IF NOT EXISTS request_attachments (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  upload_id TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_request_attachments_request_id ON request_attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_request_attachments_upload_id ON request_attachments(upload_id);
