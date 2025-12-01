-- AI Usage Tracking Table
-- Track all AI API calls for analytics, billing, and cost management

CREATE TABLE IF NOT EXISTS ai_usage (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    estimated_cost REAL NOT NULL DEFAULT 0.0,
    success INTEGER NOT NULL DEFAULT 1,
    error_message TEXT,
    created_at TEXT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_operation ON ai_usage(operation);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_created ON ai_usage(user_id, created_at);

-- View for user AI usage statistics
CREATE VIEW IF NOT EXISTS v_user_ai_stats AS
SELECT
    user_id,
    operation,
    model,
    COUNT(*) as total_requests,
    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests,
    SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_requests,
    SUM(input_tokens) as total_input_tokens,
    SUM(output_tokens) as total_output_tokens,
    SUM(total_tokens) as total_tokens,
    SUM(estimated_cost) as total_cost,
    AVG(estimated_cost) as avg_cost_per_request,
    MIN(created_at) as first_request,
    MAX(created_at) as last_request
FROM ai_usage
GROUP BY user_id, operation, model;

-- View for daily AI usage aggregation
CREATE VIEW IF NOT EXISTS v_daily_ai_usage AS
SELECT
    DATE(created_at) as usage_date,
    operation,
    model,
    COUNT(*) as total_requests,
    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests,
    SUM(total_tokens) as total_tokens,
    SUM(estimated_cost) as total_cost
FROM ai_usage
GROUP BY DATE(created_at), operation, model
ORDER BY usage_date DESC;
