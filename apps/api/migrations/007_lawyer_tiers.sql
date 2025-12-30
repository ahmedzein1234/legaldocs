-- Lawyer Tier System Migration
-- Adds tier support to the lawyer badges system

-- Add tier_level column to lawyer_badges table
ALTER TABLE lawyer_badges ADD COLUMN tier_level TEXT;

-- Create index for tier badges
CREATE INDEX IF NOT EXISTS idx_lawyer_badges_tier ON lawyer_badges(lawyer_id, badge_type, tier_level);

-- Add tier-related indexes for faster tier calculations
CREATE INDEX IF NOT EXISTS idx_lawyers_tier_metrics ON lawyers(
  is_active,
  verification_status,
  years_experience,
  total_reviews,
  average_rating
);

-- Create tier history table to track tier changes over time
CREATE TABLE IF NOT EXISTS lawyer_tier_history (
  id TEXT PRIMARY KEY,
  lawyer_id TEXT NOT NULL,
  previous_tier TEXT,
  new_tier TEXT NOT NULL,
  trigger_reason TEXT, -- 'consultation_completed', 'review_received', 'verification_approved', 'manual', 'recalculation'
  metrics_snapshot TEXT, -- JSON snapshot of metrics at time of change
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (lawyer_id) REFERENCES lawyers(id)
);

-- Indexes for tier history
CREATE INDEX IF NOT EXISTS idx_tier_history_lawyer ON lawyer_tier_history(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_tier_history_created ON lawyer_tier_history(created_at);
CREATE INDEX IF NOT EXISTS idx_tier_history_tier ON lawyer_tier_history(new_tier);
