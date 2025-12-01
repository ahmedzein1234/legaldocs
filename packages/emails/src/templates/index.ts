/**
 * Email Templates for LegalDocs Platform
 *
 * All email templates with support for English and Arabic (RTL) content
 * Built with @react-email/components for responsive, beautiful emails
 *
 * Templates:
 * - WelcomeEmail: Welcome new users
 * - VerifyEmail: Email verification
 * - PasswordReset: Password reset requests
 * - SignatureRequest: Document signature requests
 * - DocumentSigned: Document signed notifications
 * - SignatureComplete: All signatures collected
 * - ConsultationBooked: Consultation booking confirmations
 * - ConsultationReminder: Consultation reminders
 * - LawyerVerification: Lawyer account verification
 * - CaseUpdate: Case status updates
 */

// Email Templates
export { WelcomeEmail, default as Welcome } from "./welcome";
export { VerifyEmail, default as VerifyEmailTemplate } from "./verify-email";
export { PasswordReset, default as PasswordResetTemplate } from "./password-reset";
export { SignatureRequest, default as SignatureRequestTemplate } from "./signature-request";
export { DocumentSigned, default as DocumentSignedTemplate } from "./document-signed";
export { SignatureComplete, default as SignatureCompleteTemplate } from "./signature-complete";
export { ConsultationBooked, default as ConsultationBookedTemplate } from "./consultation-booked";
export { ConsultationReminder, default as ConsultationReminderTemplate } from "./consultation-reminder";
export { LawyerVerification, default as LawyerVerificationTemplate } from "./lawyer-verification";
export { CaseUpdate, default as CaseUpdateTemplate } from "./case-update";
