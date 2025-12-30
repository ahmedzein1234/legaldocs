// Export all route modules
export { auth } from './auth.js';
export { documents } from './documents.js';
export { templates, countryConfigs } from './templates.js';
export type { CountryCode, CountryConfig } from './templates.js';
export { ai } from './ai.js';
export { signatures } from './signatures.js';
export { advisor } from './advisor.js';
export { uploads } from './uploads.js';
export { notifications } from './notifications.js';
export { lawyers } from './lawyers.js';

// Case management routes
export { cases } from './cases.js';

// Lawyer marketplace routes
export { consultations } from './lawyer-consultations.js';
export { messaging } from './lawyer-messaging.js';
export { lawyerDashboard } from './lawyer-dashboard.js';
export { payments } from './payments.js';
export { consultationCalls } from './consultation-calls.js';

// GDPR compliance routes
export { gdpr } from './gdpr.js';

// Data residency and compliance transparency
export { compliance } from './compliance.js';

// PDF generation routes
export { pdf } from './pdf.js';

// Analytics routes
export { analytics } from './analytics.js';
