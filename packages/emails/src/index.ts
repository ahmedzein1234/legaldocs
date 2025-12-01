/**
 * @legaldocs/emails
 *
 * Email package for LegalDocs platform
 * Provides email sending functionality and React email templates
 * Supports both English and Arabic content
 */

// Export client
export { ResendClient, getResendClient, resetResendClient } from './client';

// Export email templates (to be added by another agent)
// Templates will be exported from ./templates folder
export * from './templates';
