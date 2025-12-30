/**
 * Verification Tracking and Renewal System
 *
 * Handles automatic tracking of verification expiry dates,
 * license renewals, and notification triggers
 */

import { sendEmail, type EmailEnv } from './email.js';
import {
  getVerificationExpiryEmail,
  getLicenseRenewalEmail,
  type VerificationExpiryEmailData,
  type LicenseRenewalEmailData,
} from './email-templates.js';

// App URL for renewal links
const APP_URL = 'https://www.qannoni.com';

interface VerificationTrackingConfig {
  // Days before expiry to send notifications
  notificationSchedule: number[]; // e.g., [90, 60, 30, 14, 7, 3, 1]

  // Auto-suspend after expiry grace period (days)
  gracePeriodDays: number;

  // Verification validity periods (in days)
  validityPeriods: {
    basic: number;
    identity: number;
    professional: number;
    enhanced: number;
  };
}

const defaultConfig: VerificationTrackingConfig = {
  notificationSchedule: [90, 60, 30, 14, 7, 3, 1],
  gracePeriodDays: 7,
  validityPeriods: {
    basic: 365, // 1 year
    identity: 730, // 2 years (matches Emirates ID)
    professional: 365, // 1 year (annual bar license renewal)
    enhanced: 365, // 1 year (annual background check)
  },
};

/**
 * Check for expiring verifications and send notifications
 */
export async function checkExpiringVerifications(
  db: D1Database,
  env: EmailEnv,
  config: VerificationTrackingConfig = defaultConfig
): Promise<{
  expiringSoon: any[];
  expired: any[];
  notificationsSent: number;
  emailsSent: number;
  emailsFailed: number;
}> {
  const today = new Date();
  const expiringSoon: any[] = [];
  const expired: any[] = [];
  let notificationsSent = 0;
  let emailsSent = 0;
  let emailsFailed = 0;

  // Get all active verifications with expiry dates
  const verifications = await db
    .prepare(`
      SELECT
        lv.id,
        lv.lawyer_id,
        lv.verification_type,
        lv.expires_at,
        l.email,
        l.first_name,
        l.last_name,
        l.verification_level
      FROM lawyer_verifications lv
      JOIN lawyers l ON l.id = lv.lawyer_id
      WHERE lv.status = 'verified'
        AND lv.expires_at IS NOT NULL
        AND l.is_active = 1
    `)
    .all();

  for (const verification of verifications.results || []) {
    const expiryDate = new Date((verification as any).expires_at);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if expired
    if (daysUntilExpiry < 0) {
      expired.push(verification);

      // Check grace period
      if (Math.abs(daysUntilExpiry) > config.gracePeriodDays) {
        // Auto-suspend lawyer
        await suspendLawyerForExpiredVerification(
          db,
          (verification as any).lawyer_id,
          (verification as any).verification_type
        );
      }
      continue;
    }

    // Check if notification should be sent
    if (config.notificationSchedule.includes(daysUntilExpiry)) {
      expiringSoon.push({
        ...verification,
        daysUntilExpiry,
      });

      // Send notification email
      const lawyerName = `${(verification as any).first_name || ''} ${(verification as any).last_name || ''}`.trim() || 'Lawyer';
      const result = await sendExpiryNotification(
        db,
        env,
        (verification as any).lawyer_id,
        lawyerName,
        (verification as any).email,
        (verification as any).verification_type,
        daysUntilExpiry
      );

      notificationsSent++;
      if (result.success) {
        emailsSent++;
      } else {
        emailsFailed++;
      }
    }
  }

  return {
    expiringSoon,
    expired,
    notificationsSent,
    emailsSent,
    emailsFailed,
  };
}

/**
 * Check for upcoming bar license renewals
 */
export async function checkBarLicenseRenewals(
  db: D1Database,
  env: EmailEnv,
  config: VerificationTrackingConfig = defaultConfig
): Promise<{
  renewalsDue: any[];
  notificationsSent: number;
  emailsSent: number;
  emailsFailed: number;
}> {
  const today = new Date();
  const renewalsDue: any[] = [];
  let notificationsSent = 0;
  let emailsSent = 0;
  let emailsFailed = 0;

  // Get lawyers with bar license expiry dates
  const lawyers = await db
    .prepare(`
      SELECT
        id,
        email,
        first_name,
        last_name,
        bar_license_number,
        bar_license_expiry_date
      FROM lawyers
      WHERE bar_license_expiry_date IS NOT NULL
        AND is_active = 1
        AND verification_status = 'verified'
    `)
    .all();

  for (const lawyer of lawyers.results || []) {
    const expiryDate = new Date((lawyer as any).bar_license_expiry_date);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if notification should be sent
    if (config.notificationSchedule.includes(daysUntilExpiry)) {
      renewalsDue.push({
        ...lawyer,
        daysUntilExpiry,
      });

      // Send renewal reminder email
      const lawyerName = `${(lawyer as any).first_name || ''} ${(lawyer as any).last_name || ''}`.trim() || 'Lawyer';
      const result = await sendLicenseRenewalNotification(
        db,
        env,
        (lawyer as any).id,
        lawyerName,
        (lawyer as any).email,
        daysUntilExpiry
      );

      notificationsSent++;
      if (result.success) {
        emailsSent++;
      } else {
        emailsFailed++;
      }
    }

    // Auto-suspend if expired beyond grace period
    if (daysUntilExpiry < -config.gracePeriodDays) {
      await suspendLawyerForExpiredLicense(db, (lawyer as any).id);
    }
  }

  return {
    renewalsDue,
    notificationsSent,
    emailsSent,
    emailsFailed,
  };
}

/**
 * Suspend lawyer for expired verification
 */
async function suspendLawyerForExpiredVerification(
  db: D1Database,
  lawyerId: string,
  verificationType: string
): Promise<void> {
  await db
    .prepare(`
      UPDATE lawyers
      SET
        is_suspended = 1,
        suspension_reason = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(
      `${verificationType} verification expired`,
      lawyerId
    )
    .run();

  // Create audit log
  await db
    .prepare(`
      INSERT INTO lawyer_audit_logs (
        id, lawyer_id, action, action_category,
        performed_by, performed_by_type,
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(
      crypto.randomUUID(),
      lawyerId,
      'lawyer_suspended',
      'status',
      'system',
      'system',
      JSON.stringify({
        reason: 'verification_expired',
        verificationType,
      })
    )
    .run();
}

/**
 * Suspend lawyer for expired bar license
 */
async function suspendLawyerForExpiredLicense(
  db: D1Database,
  lawyerId: string
): Promise<void> {
  await db
    .prepare(`
      UPDATE lawyers
      SET
        is_suspended = 1,
        suspension_reason = 'Bar license expired',
        updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(lawyerId)
    .run();

  // Create audit log
  await db
    .prepare(`
      INSERT INTO lawyer_audit_logs (
        id, lawyer_id, action, action_category,
        performed_by, performed_by_type,
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(
      crypto.randomUUID(),
      lawyerId,
      'lawyer_suspended',
      'status',
      'system',
      'system',
      JSON.stringify({
        reason: 'license_expired',
      })
    )
    .run();
}

/**
 * Send verification expiry notification
 */
async function sendExpiryNotification(
  db: D1Database,
  env: EmailEnv,
  lawyerId: string,
  lawyerName: string,
  email: string,
  verificationType: string,
  daysUntilExpiry: number
): Promise<{ success: boolean; error?: string }> {
  // Generate email content
  const emailData: VerificationExpiryEmailData = {
    lawyerName,
    email,
    verificationType,
    daysUntilExpiry,
    renewalLink: `${APP_URL}/en/dashboard/lawyer-portal/verification`,
    language: 'en', // Default to English, could be fetched from lawyer preferences
  };

  const { subject, html, text } = getVerificationExpiryEmail(emailData);

  // Send email
  const result = await sendEmail(env, {
    to: email,
    subject,
    html,
    text,
  });

  console.log(`Verification expiry notification to ${email}:`, {
    verificationType,
    daysUntilExpiry,
    success: result.success,
    error: result.error,
  });

  // Log notification
  await db
    .prepare(`
      INSERT INTO lawyer_audit_logs (
        id, lawyer_id, action, action_category,
        performed_by, performed_by_type,
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(
      crypto.randomUUID(),
      lawyerId,
      'expiry_notification_sent',
      'verification',
      'system',
      'system',
      JSON.stringify({
        verificationType,
        daysUntilExpiry,
        email,
        emailSent: result.success,
        emailError: result.error,
      })
    )
    .run();

  return result;
}

/**
 * Send bar license renewal notification
 */
async function sendLicenseRenewalNotification(
  db: D1Database,
  env: EmailEnv,
  lawyerId: string,
  lawyerName: string,
  email: string,
  daysUntilExpiry: number
): Promise<{ success: boolean; error?: string }> {
  // Generate email content
  const emailData: LicenseRenewalEmailData = {
    lawyerName,
    email,
    daysUntilExpiry,
    renewalLink: `${APP_URL}/en/dashboard/lawyer-portal/verification`,
    language: 'en', // Default to English, could be fetched from lawyer preferences
  };

  const { subject, html, text } = getLicenseRenewalEmail(emailData);

  // Send email
  const result = await sendEmail(env, {
    to: email,
    subject,
    html,
    text,
  });

  console.log(`License renewal notification to ${email}:`, {
    daysUntilExpiry,
    success: result.success,
    error: result.error,
  });

  // Log notification
  await db
    .prepare(`
      INSERT INTO lawyer_audit_logs (
        id, lawyer_id, action, action_category,
        performed_by, performed_by_type,
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(
      crypto.randomUUID(),
      lawyerId,
      'renewal_notification_sent',
      'verification',
      'system',
      'system',
      JSON.stringify({
        daysUntilExpiry,
        email,
        emailSent: result.success,
        emailError: result.error,
      })
    )
    .run();

  return result;
}

/**
 * Calculate verification statistics
 */
export async function getVerificationStats(
  db: D1Database
): Promise<{
  total: number;
  verified: number;
  pending: number;
  expired: number;
  byLevel: Record<string, number>;
  byEmirate: Record<string, number>;
}> {
  const stats = {
    total: 0,
    verified: 0,
    pending: 0,
    expired: 0,
    byLevel: {} as Record<string, number>,
    byEmirate: {} as Record<string, number>,
  };

  // Total and status counts
  const statusCounts = await db
    .prepare(`
      SELECT verification_status, COUNT(*) as count
      FROM lawyers
      WHERE is_active = 1
      GROUP BY verification_status
    `)
    .all();

  for (const row of statusCounts.results || []) {
    const status = (row as any).verification_status;
    const count = (row as any).count;
    stats.total += count;

    if (status === 'verified') stats.verified = count;
    else if (status === 'pending' || status === 'in_review') stats.pending += count;
  }

  // By verification level
  const levelCounts = await db
    .prepare(`
      SELECT verification_level, COUNT(*) as count
      FROM lawyers
      WHERE is_active = 1 AND verification_status = 'verified'
      GROUP BY verification_level
    `)
    .all();

  for (const row of levelCounts.results || []) {
    stats.byLevel[(row as any).verification_level] = (row as any).count;
  }

  // By emirate
  const emirateCounts = await db
    .prepare(`
      SELECT emirate, COUNT(*) as count
      FROM lawyers
      WHERE is_active = 1 AND verification_status = 'verified'
      GROUP BY emirate
    `)
    .all();

  for (const row of emirateCounts.results || []) {
    stats.byEmirate[(row as any).emirate] = (row as any).count;
  }

  // Expired verifications
  const expiredCount = await db
    .prepare(`
      SELECT COUNT(*) as count
      FROM lawyer_verifications
      WHERE status = 'verified'
        AND expires_at < datetime('now')
    `)
    .first<{ count: number }>();

  stats.expired = expiredCount?.count || 0;

  return stats;
}

/**
 * Generate annual re-verification requests
 */
export async function generateAnnualReverifications(
  db: D1Database,
  env: EmailEnv
): Promise<{
  generated: number;
  lawyers: string[];
  emailsSent: number;
  emailsFailed: number;
}> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Find lawyers verified more than a year ago
  const lawyers = await db
    .prepare(`
      SELECT id, email, first_name, last_name, verification_level
      FROM lawyers
      WHERE is_active = 1
        AND verification_status = 'verified'
        AND verified_at < ?
    `)
    .bind(oneYearAgo.toISOString())
    .all();

  const lawyerIds: string[] = [];
  let emailsSent = 0;
  let emailsFailed = 0;

  for (const lawyer of lawyers.results || []) {
    const lawyerId = (lawyer as any).id;
    const lawyerName = `${(lawyer as any).first_name || ''} ${(lawyer as any).last_name || ''}`.trim() || 'Lawyer';
    const email = (lawyer as any).email;

    // Update status to require re-verification
    await db
      .prepare(`
        UPDATE lawyers
        SET verification_status = 'pending', updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(lawyerId)
      .run();

    // Send re-verification notification email
    const result = await sendExpiryNotification(
      db,
      env,
      lawyerId,
      lawyerName,
      email,
      'annual_reverification',
      0 // Expired now
    );

    if (result.success) {
      emailsSent++;
    } else {
      emailsFailed++;
    }

    lawyerIds.push(lawyerId);
  }

  return {
    generated: lawyerIds.length,
    lawyers: lawyerIds,
    emailsSent,
    emailsFailed,
  };
}

/**
 * Cron job handler - should run daily
 */
export async function runDailyVerificationChecks(
  db: D1Database,
  env: EmailEnv
): Promise<{
  expiringVerifications: number;
  expiredVerifications: number;
  licenseRenewals: number;
  lawyersSuspended: number;
  notificationsSent: number;
  emailsSent: number;
  emailsFailed: number;
}> {
  const expiringResult = await checkExpiringVerifications(db, env);
  const renewalResult = await checkBarLicenseRenewals(db, env);

  return {
    expiringVerifications: expiringResult.expiringSoon.length,
    expiredVerifications: expiringResult.expired.length,
    licenseRenewals: renewalResult.renewalsDue.length,
    lawyersSuspended: expiringResult.expired.filter((v: any) => {
      const expiryDate = new Date(v.expires_at);
      const today = new Date();
      const daysSinceExpiry = Math.ceil(
        (today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceExpiry > defaultConfig.gracePeriodDays;
    }).length,
    notificationsSent: expiringResult.notificationsSent + renewalResult.notificationsSent,
    emailsSent: expiringResult.emailsSent + renewalResult.emailsSent,
    emailsFailed: expiringResult.emailsFailed + renewalResult.emailsFailed,
  };
}
