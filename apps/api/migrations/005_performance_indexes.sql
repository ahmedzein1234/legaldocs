-- =====================================================
-- PERFORMANCE INDEXES MIGRATION
-- Additional indexes for improved query performance
-- Run with: wrangler d1 execute legaldocs-db --file=./migrations/005_performance_indexes.sql
-- =====================================================

-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================

-- For role-based queries (admin dashboards, lawyer listings)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- For active user queries
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- For organization-based queries
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id) WHERE organization_id IS NOT NULL;

-- Composite index for active users by role
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);

-- For last login tracking (inactive users, engagement metrics)
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

-- =====================================================
-- DOCUMENTS TABLE INDEXES
-- =====================================================

-- For document type filtering
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- For organization's documents
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(org_id) WHERE org_id IS NOT NULL;

-- For template-based documents
CREATE INDEX IF NOT EXISTS idx_documents_template ON documents(template_id) WHERE template_id IS NOT NULL;

-- Composite: user's documents by status (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_documents_user_status ON documents(created_by, status);

-- For expiring documents
CREATE INDEX IF NOT EXISTS idx_documents_expires ON documents(expires_at) WHERE expires_at IS NOT NULL;

-- For signed documents (blockchain verification)
CREATE INDEX IF NOT EXISTS idx_documents_signed ON documents(signed_at) WHERE signed_at IS NOT NULL;

-- For blockchain verified documents
CREATE INDEX IF NOT EXISTS idx_documents_blockchain ON documents(blockchain_hash) WHERE blockchain_hash IS NOT NULL;

-- Recent documents (dashboard, activity feeds)
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);

-- =====================================================
-- DOCUMENT SIGNERS TABLE INDEXES
-- =====================================================

-- For finding documents by signer email
CREATE INDEX IF NOT EXISTS idx_signers_email ON document_signers(email) WHERE email IS NOT NULL;

-- For finding pending signatures (reminder system)
CREATE INDEX IF NOT EXISTS idx_signers_pending ON document_signers(status, last_sent_at) WHERE status = 'pending';

-- For signer by status
CREATE INDEX IF NOT EXISTS idx_signers_status ON document_signers(status);

-- =====================================================
-- DOCUMENT ACTIVITIES TABLE INDEXES
-- =====================================================

-- For audit trail queries
CREATE INDEX IF NOT EXISTS idx_doc_activities_doc ON document_activities(document_id, created_at DESC);

-- For user activity history
CREATE INDEX IF NOT EXISTS idx_doc_activities_user ON document_activities(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- =====================================================
-- TEMPLATES TABLE INDEXES
-- =====================================================

-- For public template listings
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public, category) WHERE is_public = 1;

-- For system templates
CREATE INDEX IF NOT EXISTS idx_templates_system ON templates(is_system) WHERE is_system = 1;

-- For organization templates
CREATE INDEX IF NOT EXISTS idx_templates_org ON templates(org_id) WHERE org_id IS NOT NULL;

-- For popular templates
CREATE INDEX IF NOT EXISTS idx_templates_usage ON templates(usage_count DESC);

-- =====================================================
-- VERIFICATION CODES TABLE INDEXES
-- =====================================================

-- For code lookup (login, verification)
CREATE INDEX IF NOT EXISTS idx_verification_email ON verification_codes(email, type, expires_at) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_verification_phone ON verification_codes(phone, type, expires_at) WHERE phone IS NOT NULL;

-- For cleanup of expired codes
CREATE INDEX IF NOT EXISTS idx_verification_expires ON verification_codes(expires_at);

-- =====================================================
-- WHATSAPP TABLES INDEXES
-- =====================================================

-- For session state management
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_state ON whatsapp_sessions(state, last_message_at);

-- For user's sessions
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user ON whatsapp_sessions(user_id) WHERE user_id IS NOT NULL;

-- For recent messages
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session ON whatsapp_messages(session_id, created_at DESC);

-- =====================================================
-- BLOCKCHAIN RECORDS INDEXES
-- =====================================================

-- For verification queries
CREATE INDEX IF NOT EXISTS idx_blockchain_hash ON blockchain_records(document_hash);

-- For transaction lookup
CREATE INDEX IF NOT EXISTS idx_blockchain_tx ON blockchain_records(transaction_hash) WHERE transaction_hash IS NOT NULL;

-- For pending registrations
CREATE INDEX IF NOT EXISTS idx_blockchain_pending ON blockchain_records(status) WHERE status = 'pending';

-- =====================================================
-- LAWYERS TABLE ADDITIONAL INDEXES
-- =====================================================

-- For lawyer user account lookup
CREATE INDEX IF NOT EXISTS idx_lawyers_user ON lawyers(user_id) WHERE user_id IS NOT NULL;

-- For available lawyers
CREATE INDEX IF NOT EXISTS idx_lawyers_available ON lawyers(is_available, status) WHERE is_available = 1 AND status = 'verified';

-- For featured lawyers (premium listings)
CREATE INDEX IF NOT EXISTS idx_lawyers_featured ON lawyers(featured, average_rating DESC) WHERE featured = 1;

-- For lawyer search by location and specialization
CREATE INDEX IF NOT EXISTS idx_lawyers_location_spec ON lawyers(country, emirate, status);

-- For consultation fee filtering
CREATE INDEX IF NOT EXISTS idx_lawyers_fee ON lawyers(consultation_fee);

-- =====================================================
-- CONSULTATIONS TABLE ADDITIONAL INDEXES
-- =====================================================

-- For upcoming consultations (reminders, dashboard)
CREATE INDEX IF NOT EXISTS idx_consultations_upcoming ON consultations(scheduled_at, status) WHERE status IN ('pending', 'confirmed');

-- For payment processing
CREATE INDEX IF NOT EXISTS idx_consultations_payment ON consultations(payment_status, status);

-- For lawyer's schedule
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer_schedule ON consultations(lawyer_id, scheduled_at, status);

-- =====================================================
-- CASES TABLE ADDITIONAL INDEXES
-- =====================================================

-- For organization's cases
CREATE INDEX IF NOT EXISTS idx_cases_org ON cases(org_id) WHERE org_id IS NOT NULL;

-- For court deadline tracking
CREATE INDEX IF NOT EXISTS idx_cases_hearing ON cases(next_hearing_date) WHERE next_hearing_date IS NOT NULL;

-- For priority sorting
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority, status);

-- For client lookup
CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_email) WHERE client_email IS NOT NULL;

-- =====================================================
-- PAYMENT AND ESCROW INDEXES
-- =====================================================

-- For payment status queries
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_transactions(status, completed_at);

-- For payee lookup (lawyer payouts)
CREATE INDEX IF NOT EXISTS idx_payments_payee ON payment_transactions(payee_id, status) WHERE payee_id IS NOT NULL;

-- For provider transaction lookup
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payment_transactions(provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;

-- For disputed escrow
CREATE INDEX IF NOT EXISTS idx_escrow_disputed ON escrow_transactions(status, disputed_at) WHERE status = 'disputed';

-- =====================================================
-- ACTIVITY LOGS TABLE (if exists)
-- =====================================================

-- For user activity lookup (GDPR exports)
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id, created_at DESC);

-- For resource activity
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- =====================================================
-- NOTIFICATIONS TABLE (if exists)
-- =====================================================

-- For unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = 0;

-- For notification cleanup
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- =====================================================
-- UPLOADS TABLE (if exists)
-- =====================================================

-- For user uploads
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id, created_at DESC);

-- For storage cleanup
CREATE INDEX IF NOT EXISTS idx_uploads_storage ON uploads(storage_key);

-- =====================================================
-- MESSAGES TABLE (if exists)
-- =====================================================

-- For conversation lookup
CREATE INDEX IF NOT EXISTS idx_messages_consultation ON messages(consultation_id, created_at DESC) WHERE consultation_id IS NOT NULL;

-- For unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread_recipient ON messages(recipient_id, is_read) WHERE is_read = 0;

-- =====================================================
-- LAWYER QUOTES ADDITIONAL INDEXES
-- =====================================================

-- For pending quotes (expiring soon)
CREATE INDEX IF NOT EXISTS idx_quotes_expires ON lawyer_quotes(expires_at, status) WHERE status = 'pending';

-- =====================================================
-- SIGNATURE REQUESTS (if exists, alternative naming)
-- =====================================================

-- For pending signature requests
CREATE INDEX IF NOT EXISTS idx_signature_requests_pending ON signature_requests(status, created_at) WHERE status = 'pending';

-- For document's signature requests
CREATE INDEX IF NOT EXISTS idx_signature_requests_document ON signature_requests(document_id);
