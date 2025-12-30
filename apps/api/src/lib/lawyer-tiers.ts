/**
 * Lawyer Tier System
 *
 * Automatic tier calculation and badge awarding based on lawyer performance metrics.
 * Tiers: Bronze → Silver → Gold → Platinum
 */

export type LawyerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierRequirements {
  minConsultations: number;
  minRating: number;
  minReviews: number;
  minYearsExperience: number;
  minCompletedCases: number;
  minSuccessRate: number;
  minResponseHours: number; // max response time (lower is better)
  requiresVerification: string; // minimum verification level
}

export interface LawyerMetrics {
  totalConsultations: number;
  averageRating: number;
  totalReviews: number;
  yearsExperience: number;
  completedCases: number;
  successRate: number;
  responseTimeHours: number;
  verificationLevel: string;
}

export interface TierCalculationResult {
  currentTier: LawyerTier;
  nextTier: LawyerTier | null;
  progress: {
    consultations: { current: number; required: number; met: boolean };
    rating: { current: number; required: number; met: boolean };
    reviews: { current: number; required: number; met: boolean };
    experience: { current: number; required: number; met: boolean };
    cases: { current: number; required: number; met: boolean };
    successRate: { current: number; required: number; met: boolean };
    responseTime: { current: number; required: number; met: boolean };
    verification: { current: string; required: string; met: boolean };
  };
  overallProgress: number; // 0-100 percentage to next tier
  tierBenefits: string[];
}

// Tier requirements configuration
export const TIER_REQUIREMENTS: Record<LawyerTier, TierRequirements> = {
  bronze: {
    minConsultations: 0,
    minRating: 0,
    minReviews: 0,
    minYearsExperience: 0,
    minCompletedCases: 0,
    minSuccessRate: 0,
    minResponseHours: 48, // Must respond within 48 hours
    requiresVerification: 'none',
  },
  silver: {
    minConsultations: 10,
    minRating: 4.0,
    minReviews: 5,
    minYearsExperience: 1,
    minCompletedCases: 5,
    minSuccessRate: 70,
    minResponseHours: 24,
    requiresVerification: 'basic',
  },
  gold: {
    minConsultations: 50,
    minRating: 4.5,
    minReviews: 20,
    minYearsExperience: 3,
    minCompletedCases: 30,
    minSuccessRate: 80,
    minResponseHours: 12,
    requiresVerification: 'professional',
  },
  platinum: {
    minConsultations: 200,
    minRating: 4.8,
    minReviews: 75,
    minYearsExperience: 5,
    minCompletedCases: 100,
    minSuccessRate: 90,
    minResponseHours: 6,
    requiresVerification: 'enhanced',
  },
};

// Tier benefits
export const TIER_BENEFITS: Record<LawyerTier, string[]> = {
  bronze: [
    'Basic profile listing',
    'Up to 5 active consultations',
    'Standard support',
  ],
  silver: [
    'Highlighted profile badge',
    'Up to 15 active consultations',
    'Priority in search results',
    'Monthly performance report',
  ],
  gold: [
    'Gold badge on profile',
    'Up to 30 active consultations',
    'Featured in "Top Lawyers" section',
    'Weekly performance insights',
    'Priority customer support',
  ],
  platinum: [
    'Platinum badge with special styling',
    'Unlimited active consultations',
    'Homepage featured listing',
    'Real-time analytics dashboard',
    'Dedicated account manager',
    'Priority placement in matching',
    'Exclusive webinar access',
  ],
};

// Tier display configuration
export const TIER_CONFIG: Record<LawyerTier, {
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  bronze: {
    name: 'Bronze',
    nameAr: 'برونزي',
    icon: 'award',
    color: '#CD7F32',
    bgColor: '#FDF5E6',
    borderColor: '#CD7F32',
  },
  silver: {
    name: 'Silver',
    nameAr: 'فضي',
    icon: 'star',
    color: '#C0C0C0',
    bgColor: '#F5F5F5',
    borderColor: '#C0C0C0',
  },
  gold: {
    name: 'Gold',
    nameAr: 'ذهبي',
    icon: 'crown',
    color: '#FFD700',
    bgColor: '#FFFEF0',
    borderColor: '#FFD700',
  },
  platinum: {
    name: 'Platinum',
    nameAr: 'بلاتيني',
    icon: 'diamond',
    color: '#E5E4E2',
    bgColor: '#F8F8FF',
    borderColor: '#A0A0A0',
  },
};

// Verification level hierarchy for comparison
const VERIFICATION_LEVELS = ['none', 'basic', 'identity', 'professional', 'enhanced'];

function meetsVerificationRequirement(current: string, required: string): boolean {
  const currentIdx = VERIFICATION_LEVELS.indexOf(current || 'none');
  const requiredIdx = VERIFICATION_LEVELS.indexOf(required);
  return currentIdx >= requiredIdx;
}

/**
 * Calculate the current tier for a lawyer based on their metrics
 */
export function calculateTier(metrics: LawyerMetrics): LawyerTier {
  const tiers: LawyerTier[] = ['platinum', 'gold', 'silver', 'bronze'];

  for (const tier of tiers) {
    const req = TIER_REQUIREMENTS[tier];
    if (
      metrics.totalConsultations >= req.minConsultations &&
      metrics.averageRating >= req.minRating &&
      metrics.totalReviews >= req.minReviews &&
      metrics.yearsExperience >= req.minYearsExperience &&
      metrics.completedCases >= req.minCompletedCases &&
      metrics.successRate >= req.minSuccessRate &&
      metrics.responseTimeHours <= req.minResponseHours &&
      meetsVerificationRequirement(metrics.verificationLevel, req.requiresVerification)
    ) {
      return tier;
    }
  }

  return 'bronze';
}

/**
 * Get the next tier after the current one
 */
export function getNextTier(currentTier: LawyerTier): LawyerTier | null {
  const tierOrder: LawyerTier[] = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1];
  }
  return null;
}

/**
 * Calculate detailed tier progress for a lawyer
 */
export function calculateTierProgress(metrics: LawyerMetrics): TierCalculationResult {
  const currentTier = calculateTier(metrics);
  const nextTier = getNextTier(currentTier);

  let progress: TierCalculationResult['progress'];
  let overallProgress = 100;

  if (nextTier) {
    const req = TIER_REQUIREMENTS[nextTier];

    progress = {
      consultations: {
        current: metrics.totalConsultations,
        required: req.minConsultations,
        met: metrics.totalConsultations >= req.minConsultations,
      },
      rating: {
        current: metrics.averageRating,
        required: req.minRating,
        met: metrics.averageRating >= req.minRating,
      },
      reviews: {
        current: metrics.totalReviews,
        required: req.minReviews,
        met: metrics.totalReviews >= req.minReviews,
      },
      experience: {
        current: metrics.yearsExperience,
        required: req.minYearsExperience,
        met: metrics.yearsExperience >= req.minYearsExperience,
      },
      cases: {
        current: metrics.completedCases,
        required: req.minCompletedCases,
        met: metrics.completedCases >= req.minCompletedCases,
      },
      successRate: {
        current: metrics.successRate,
        required: req.minSuccessRate,
        met: metrics.successRate >= req.minSuccessRate,
      },
      responseTime: {
        current: metrics.responseTimeHours,
        required: req.minResponseHours,
        met: metrics.responseTimeHours <= req.minResponseHours,
      },
      verification: {
        current: metrics.verificationLevel,
        required: req.requiresVerification,
        met: meetsVerificationRequirement(metrics.verificationLevel, req.requiresVerification),
      },
    };

    // Calculate overall progress percentage
    const requirements = Object.values(progress);
    const metCount = requirements.filter(r => r.met).length;
    overallProgress = Math.round((metCount / requirements.length) * 100);
  } else {
    // Already at platinum, show current metrics
    const req = TIER_REQUIREMENTS.platinum;
    progress = {
      consultations: {
        current: metrics.totalConsultations,
        required: req.minConsultations,
        met: true,
      },
      rating: {
        current: metrics.averageRating,
        required: req.minRating,
        met: true,
      },
      reviews: {
        current: metrics.totalReviews,
        required: req.minReviews,
        met: true,
      },
      experience: {
        current: metrics.yearsExperience,
        required: req.minYearsExperience,
        met: true,
      },
      cases: {
        current: metrics.completedCases,
        required: req.minCompletedCases,
        met: true,
      },
      successRate: {
        current: metrics.successRate,
        required: req.minSuccessRate,
        met: true,
      },
      responseTime: {
        current: metrics.responseTimeHours,
        required: req.minResponseHours,
        met: true,
      },
      verification: {
        current: metrics.verificationLevel,
        required: req.requiresVerification,
        met: true,
      },
    };
  }

  return {
    currentTier,
    nextTier,
    progress,
    overallProgress,
    tierBenefits: TIER_BENEFITS[currentTier],
  };
}

/**
 * Get all tier information for display
 */
export function getAllTierInfo(): Array<{
  tier: LawyerTier;
  config: typeof TIER_CONFIG.bronze;
  requirements: TierRequirements;
  benefits: string[];
}> {
  const tiers: LawyerTier[] = ['bronze', 'silver', 'gold', 'platinum'];
  return tiers.map(tier => ({
    tier,
    config: TIER_CONFIG[tier],
    requirements: TIER_REQUIREMENTS[tier],
    benefits: TIER_BENEFITS[tier],
  }));
}

/**
 * Award or update tier badge for a lawyer
 */
export async function updateLawyerTierBadge(
  db: D1Database,
  lawyerId: string,
  newTier: LawyerTier,
  previousTier?: LawyerTier
): Promise<{ success: boolean; badgeId?: string; upgraded?: boolean }> {
  const tierConfig = TIER_CONFIG[newTier];

  // Check if lawyer already has a tier badge
  const existingBadge = await db
    .prepare(`
      SELECT id, badge_name FROM lawyer_badges
      WHERE lawyer_id = ? AND badge_type = 'tier' AND is_active = 1
    `)
    .bind(lawyerId)
    .first<{ id: string; badge_name: string }>();

  const badgeName = `${tierConfig.name} Tier`;
  const upgraded = previousTier && previousTier !== newTier;

  if (existingBadge) {
    // Update existing badge
    await db
      .prepare(`
        UPDATE lawyer_badges
        SET badge_name = ?, badge_name_ar = ?, badge_icon = ?, badge_color = ?,
            tier_level = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(
        badgeName,
        `مستوى ${tierConfig.nameAr}`,
        tierConfig.icon,
        tierConfig.color,
        newTier,
        existingBadge.id
      )
      .run();

    return { success: true, badgeId: existingBadge.id, upgraded };
  } else {
    // Create new tier badge
    const badgeId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO lawyer_badges (
          id, lawyer_id, badge_type, badge_category,
          badge_name, badge_name_ar, badge_icon, badge_color,
          tier_level, is_active, display_order, awarded_at, created_at
        ) VALUES (?, ?, 'tier', 'achievement', ?, ?, ?, ?, ?, 1, 1, datetime('now'), datetime('now'))
      `)
      .bind(
        badgeId,
        lawyerId,
        badgeName,
        `مستوى ${tierConfig.nameAr}`,
        tierConfig.icon,
        tierConfig.color,
        newTier
      )
      .run();

    return { success: true, badgeId, upgraded };
  }
}

/**
 * Get lawyer metrics from database
 */
export async function getLawyerMetrics(
  db: D1Database,
  lawyerId: string
): Promise<LawyerMetrics | null> {
  const lawyer = await db
    .prepare(`
      SELECT
        years_experience,
        total_cases_completed,
        total_reviews,
        average_rating,
        success_rate,
        response_time_hours,
        verification_level
      FROM lawyers
      WHERE id = ?
    `)
    .bind(lawyerId)
    .first<{
      years_experience: number;
      total_cases_completed: number;
      total_reviews: number;
      average_rating: number;
      success_rate: number;
      response_time_hours: number;
      verification_level: string;
    }>();

  if (!lawyer) return null;

  // Get total consultations count
  const consultationsResult = await db
    .prepare(`
      SELECT COUNT(*) as count FROM consultations
      WHERE lawyer_id = ? AND status IN ('completed', 'paid')
    `)
    .bind(lawyerId)
    .first<{ count: number }>();

  return {
    totalConsultations: consultationsResult?.count || 0,
    averageRating: lawyer.average_rating || 0,
    totalReviews: lawyer.total_reviews || 0,
    yearsExperience: lawyer.years_experience || 0,
    completedCases: lawyer.total_cases_completed || 0,
    successRate: lawyer.success_rate || 0,
    responseTimeHours: lawyer.response_time_hours || 48,
    verificationLevel: lawyer.verification_level || 'none',
  };
}

/**
 * Calculate and update tier for a lawyer
 */
export async function recalculateLawyerTier(
  db: D1Database,
  lawyerId: string
): Promise<TierCalculationResult | null> {
  const metrics = await getLawyerMetrics(db, lawyerId);
  if (!metrics) return null;

  const tierProgress = calculateTierProgress(metrics);

  // Get current tier from database
  const currentTierBadge = await db
    .prepare(`
      SELECT tier_level FROM lawyer_badges
      WHERE lawyer_id = ? AND badge_type = 'tier' AND is_active = 1
    `)
    .bind(lawyerId)
    .first<{ tier_level: string }>();

  const previousTier = (currentTierBadge?.tier_level as LawyerTier) || 'bronze';

  // Update badge if tier changed
  if (tierProgress.currentTier !== previousTier) {
    await updateLawyerTierBadge(db, lawyerId, tierProgress.currentTier, previousTier);
  }

  return tierProgress;
}
