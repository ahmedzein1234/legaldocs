/**
 * Subscription & Pricing Service
 *
 * Manages subscription plans, usage tracking, and billing for Qannoni.
 *
 * Pricing Tiers:
 * - Free: 3 docs/month, 3 AI generations
 * - Professional (AED 149/mo): 25 docs, 50 AI generations
 * - Business (AED 449/mo): unlimited docs, 200 AI generations
 * - Enterprise: Custom pricing
 */

// ============================================
// TYPES
// ============================================

export type PlanSlug = 'free' | 'professional' | 'business' | 'enterprise';

export interface PricingPlan {
  id: string;
  name: string;
  nameAr: string;
  slug: PlanSlug;
  description: string;
  descriptionAr: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  limits: PlanLimits;
  features: string[];
  isPopular: boolean;
  displayOrder: number;
}

export interface PlanLimits {
  documentsPerMonth: number; // -1 = unlimited
  aiGenerationsPerMonth: number;
  signaturesPerMonth: number;
  storageMb: number;
  teamMembers: number;
}

export interface Subscription {
  id: string;
  userId: string;
  orgId?: string;
  planId: string;
  plan: PlanSlug;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired';
  pricePaid: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate?: string;
  trialEndsAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageTracking {
  id: string;
  userId: string;
  subscriptionId?: string;
  periodStart: string;
  periodEnd: string;
  documentsCreated: number;
  documentsGenerated: number;
  aiGenerationsUsed: number;
  signaturesSent: number;
  storageUsedMb: number;
  limits: PlanLimits;
}

export interface UsageStatus {
  plan: PlanSlug;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  periodStart: string;
  periodEnd: string;
  usage: {
    documents: { used: number; limit: number; percentage: number; unlimited: boolean };
    aiGenerations: { used: number; limit: number; percentage: number; unlimited: boolean };
    signatures: { used: number; limit: number; percentage: number; unlimited: boolean };
    storage: { usedMb: number; limitMb: number; percentage: number; unlimited: boolean };
    teamMembers: { used: number; limit: number; percentage: number; unlimited: boolean };
  };
  canCreate: {
    document: boolean;
    aiGeneration: boolean;
    signature: boolean;
  };
  upgradeNeeded: boolean;
}

// ============================================
// PLAN DEFINITIONS
// ============================================

export const PRICING_PLANS: Record<PlanSlug, Omit<PricingPlan, 'id'>> = {
  free: {
    name: 'Free',
    nameAr: 'مجاني',
    slug: 'free',
    description: 'Perfect for individuals getting started with legal documents',
    descriptionAr: 'مثالي للأفراد الذين يبدأون بالوثائق القانونية',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'AED',
    limits: {
      documentsPerMonth: 3,
      aiGenerationsPerMonth: 3,
      signaturesPerMonth: 1,
      storageMb: 100,
      teamMembers: 1,
    },
    features: [
      'basic_templates',
      'pdf_export',
      'email_support',
    ],
    isPopular: false,
    displayOrder: 1,
  },
  professional: {
    name: 'Professional',
    nameAr: 'احترافي',
    slug: 'professional',
    description: 'For professionals who need more documents and AI power',
    descriptionAr: 'للمحترفين الذين يحتاجون إلى المزيد من المستندات وقوة الذكاء الاصطناعي',
    priceMonthly: 149,
    priceYearly: 1490,
    currency: 'AED',
    limits: {
      documentsPerMonth: 25,
      aiGenerationsPerMonth: 50,
      signaturesPerMonth: 10,
      storageMb: 1000,
      teamMembers: 3,
    },
    features: [
      'basic_templates',
      'premium_templates',
      'pdf_export',
      'ai_document_generation',
      'ai_contract_review',
      'e_signatures',
      'priority_support',
      'custom_branding',
    ],
    isPopular: true,
    displayOrder: 2,
  },
  business: {
    name: 'Business',
    nameAr: 'أعمال',
    slug: 'business',
    description: 'For growing businesses with unlimited document needs',
    descriptionAr: 'للشركات النامية ذات الاحتياجات غير المحدودة من المستندات',
    priceMonthly: 449,
    priceYearly: 4490,
    currency: 'AED',
    limits: {
      documentsPerMonth: -1, // Unlimited
      aiGenerationsPerMonth: 200,
      signaturesPerMonth: 50,
      storageMb: 10000,
      teamMembers: 10,
    },
    features: [
      'basic_templates',
      'premium_templates',
      'pdf_export',
      'ai_document_generation',
      'ai_contract_review',
      'ai_clause_suggestions',
      'e_signatures',
      'bulk_operations',
      'team_collaboration',
      'audit_trail',
      'api_access',
      'dedicated_support',
      'custom_branding',
      'analytics_dashboard',
    ],
    isPopular: false,
    displayOrder: 3,
  },
  enterprise: {
    name: 'Enterprise',
    nameAr: 'مؤسسة',
    slug: 'enterprise',
    description: 'Custom solutions for large organizations',
    descriptionAr: 'حلول مخصصة للمؤسسات الكبيرة',
    priceMonthly: 0, // Custom pricing
    priceYearly: 0,
    currency: 'AED',
    limits: {
      documentsPerMonth: -1,
      aiGenerationsPerMonth: -1,
      signaturesPerMonth: -1,
      storageMb: -1,
      teamMembers: -1,
    },
    features: [
      'all_features',
      'white_label',
      'dedicated_account_manager',
      'custom_integrations',
      'sla_guarantee',
      'on_premise_option',
      'training_included',
      '24_7_support',
    ],
    isPopular: false,
    displayOrder: 4,
  },
};

// Feature display names
export const FEATURE_NAMES: Record<string, { en: string; ar: string }> = {
  basic_templates: { en: 'Basic Templates', ar: 'القوالب الأساسية' },
  premium_templates: { en: 'Premium Templates', ar: 'القوالب المتميزة' },
  pdf_export: { en: 'PDF Export', ar: 'تصدير PDF' },
  ai_document_generation: { en: 'AI Document Generation', ar: 'إنشاء المستندات بالذكاء الاصطناعي' },
  ai_contract_review: { en: 'AI Contract Review', ar: 'مراجعة العقود بالذكاء الاصطناعي' },
  ai_clause_suggestions: { en: 'AI Clause Suggestions', ar: 'اقتراحات البنود بالذكاء الاصطناعي' },
  e_signatures: { en: 'E-Signatures', ar: 'التوقيعات الإلكترونية' },
  bulk_operations: { en: 'Bulk Operations', ar: 'العمليات المجمعة' },
  team_collaboration: { en: 'Team Collaboration', ar: 'التعاون الجماعي' },
  audit_trail: { en: 'Audit Trail', ar: 'سجل المراجعة' },
  api_access: { en: 'API Access', ar: 'الوصول إلى API' },
  email_support: { en: 'Email Support', ar: 'دعم البريد الإلكتروني' },
  priority_support: { en: 'Priority Support', ar: 'الدعم المميز' },
  dedicated_support: { en: 'Dedicated Support', ar: 'دعم مخصص' },
  custom_branding: { en: 'Custom Branding', ar: 'العلامة التجارية المخصصة' },
  analytics_dashboard: { en: 'Analytics Dashboard', ar: 'لوحة التحليلات' },
  all_features: { en: 'All Features', ar: 'جميع الميزات' },
  white_label: { en: 'White Label', ar: 'العلامة البيضاء' },
  dedicated_account_manager: { en: 'Dedicated Account Manager', ar: 'مدير حساب مخصص' },
  custom_integrations: { en: 'Custom Integrations', ar: 'تكاملات مخصصة' },
  sla_guarantee: { en: 'SLA Guarantee', ar: 'ضمان اتفاقية مستوى الخدمة' },
  on_premise_option: { en: 'On-Premise Option', ar: 'خيار التثبيت المحلي' },
  training_included: { en: 'Training Included', ar: 'التدريب متضمن' },
  '24_7_support': { en: '24/7 Support', ar: 'دعم على مدار الساعة' },
};

// ============================================
// SUBSCRIPTION SERVICE
// ============================================

export class SubscriptionService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Get all active pricing plans
   */
  async getPlans(): Promise<PricingPlan[]> {
    const result = await this.db
      .prepare(`
        SELECT * FROM pricing_plans
        WHERE is_active = 1
        ORDER BY display_order ASC
      `)
      .all();

    return (result.results || []).map((row: any) => this.mapPlan(row));
  }

  /**
   * Get a specific plan by slug
   */
  async getPlanBySlug(slug: PlanSlug): Promise<PricingPlan | null> {
    const row = await this.db
      .prepare('SELECT * FROM pricing_plans WHERE slug = ? AND is_active = 1')
      .bind(slug)
      .first();

    return row ? this.mapPlan(row) : null;
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const row = await this.db
      .prepare(`
        SELECT s.*, p.slug as plan_slug
        FROM subscriptions s
        LEFT JOIN pricing_plans p ON p.id = s.plan_id
        WHERE (s.user_id = ? OR s.org_id IN (SELECT organization_id FROM users WHERE id = ?))
          AND s.status IN ('active', 'trialing')
        ORDER BY s.created_at DESC
        LIMIT 1
      `)
      .bind(userId, userId)
      .first();

    return row ? this.mapSubscription(row) : null;
  }

  /**
   * Get user's current usage status
   */
  async getUserUsageStatus(userId: string): Promise<UsageStatus> {
    // Get subscription or default to free
    const subscription = await this.getUserSubscription(userId);
    const planSlug: PlanSlug = subscription?.plan || 'free';
    const planDef = PRICING_PLANS[planSlug];

    // Get or create current period tracking
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    let tracking = await this.db
      .prepare(`
        SELECT * FROM usage_tracking
        WHERE user_id = ? AND period_start <= ? AND period_end >= ?
        LIMIT 1
      `)
      .bind(userId, now.toISOString(), now.toISOString())
      .first<any>();

    if (!tracking) {
      // Create tracking record for this period
      const trackingId = `ut_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await this.db
        .prepare(`
          INSERT INTO usage_tracking (
            id, user_id, subscription_id, period_start, period_end,
            documents_created, ai_generations_used, signatures_sent, storage_used_mb,
            documents_limit, ai_generations_limit, signatures_limit, storage_limit_mb
          ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?)
        `)
        .bind(
          trackingId, userId, subscription?.id || null, periodStart, periodEnd,
          planDef.limits.documentsPerMonth,
          planDef.limits.aiGenerationsPerMonth,
          planDef.limits.signaturesPerMonth,
          planDef.limits.storageMb
        )
        .run();

      tracking = {
        documents_created: 0,
        ai_generations_used: 0,
        signatures_sent: 0,
        storage_used_mb: 0,
      };
    }

    // Count team members
    const teamCount = await this.db
      .prepare('SELECT COUNT(*) as count FROM users WHERE organization_id = (SELECT organization_id FROM users WHERE id = ?)')
      .bind(userId)
      .first<{ count: number }>();

    const limits = planDef.limits;
    const usage = {
      documents: {
        used: tracking.documents_created || 0,
        limit: limits.documentsPerMonth,
        percentage: limits.documentsPerMonth === -1 ? 0 : Math.min(100, Math.round(((tracking.documents_created || 0) / limits.documentsPerMonth) * 100)),
        unlimited: limits.documentsPerMonth === -1,
      },
      aiGenerations: {
        used: tracking.ai_generations_used || 0,
        limit: limits.aiGenerationsPerMonth,
        percentage: limits.aiGenerationsPerMonth === -1 ? 0 : Math.min(100, Math.round(((tracking.ai_generations_used || 0) / limits.aiGenerationsPerMonth) * 100)),
        unlimited: limits.aiGenerationsPerMonth === -1,
      },
      signatures: {
        used: tracking.signatures_sent || 0,
        limit: limits.signaturesPerMonth,
        percentage: limits.signaturesPerMonth === -1 ? 0 : Math.min(100, Math.round(((tracking.signatures_sent || 0) / limits.signaturesPerMonth) * 100)),
        unlimited: limits.signaturesPerMonth === -1,
      },
      storage: {
        usedMb: tracking.storage_used_mb || 0,
        limitMb: limits.storageMb,
        percentage: limits.storageMb === -1 ? 0 : Math.min(100, Math.round(((tracking.storage_used_mb || 0) / limits.storageMb) * 100)),
        unlimited: limits.storageMb === -1,
      },
      teamMembers: {
        used: teamCount?.count || 1,
        limit: limits.teamMembers,
        percentage: limits.teamMembers === -1 ? 0 : Math.min(100, Math.round(((teamCount?.count || 1) / limits.teamMembers) * 100)),
        unlimited: limits.teamMembers === -1,
      },
    };

    return {
      plan: planSlug,
      planName: planDef.name,
      billingCycle: subscription?.billingCycle || 'monthly',
      periodStart,
      periodEnd,
      usage,
      canCreate: {
        document: usage.documents.unlimited || usage.documents.used < usage.documents.limit,
        aiGeneration: usage.aiGenerations.unlimited || usage.aiGenerations.used < usage.aiGenerations.limit,
        signature: usage.signatures.unlimited || usage.signatures.used < usage.signatures.limit,
      },
      upgradeNeeded: !usage.documents.unlimited && usage.documents.percentage >= 80,
    };
  }

  /**
   * Record usage event
   */
  async recordUsage(
    userId: string,
    eventType: 'document_created' | 'ai_generation' | 'signature_sent' | 'storage_upload',
    resourceId?: string,
    quantity: number = 1,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; allowed: boolean; remaining?: number }> {
    const status = await this.getUserUsageStatus(userId);

    // Check if action is allowed
    let allowed = true;
    let fieldToUpdate = '';
    let currentUsed = 0;
    let limit = -1;

    switch (eventType) {
      case 'document_created':
        allowed = status.canCreate.document;
        fieldToUpdate = 'documents_created';
        currentUsed = status.usage.documents.used;
        limit = status.usage.documents.limit;
        break;
      case 'ai_generation':
        allowed = status.canCreate.aiGeneration;
        fieldToUpdate = 'ai_generations_used';
        currentUsed = status.usage.aiGenerations.used;
        limit = status.usage.aiGenerations.limit;
        break;
      case 'signature_sent':
        allowed = status.canCreate.signature;
        fieldToUpdate = 'signatures_sent';
        currentUsed = status.usage.signatures.used;
        limit = status.usage.signatures.limit;
        break;
      case 'storage_upload':
        allowed = status.usage.storage.unlimited || status.usage.storage.usedMb < status.usage.storage.limitMb;
        fieldToUpdate = 'storage_used_mb';
        break;
    }

    if (!allowed) {
      return { success: false, allowed: false, remaining: 0 };
    }

    // Record the event
    const eventId = `ue_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await this.db
      .prepare(`
        INSERT INTO usage_events (id, user_id, event_type, resource_id, quantity, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(eventId, userId, eventType, resourceId || null, quantity, metadata ? JSON.stringify(metadata) : null)
      .run();

    // Update tracking
    const now = new Date();
    await this.db
      .prepare(`
        UPDATE usage_tracking
        SET ${fieldToUpdate} = ${fieldToUpdate} + ?, updated_at = datetime('now')
        WHERE user_id = ? AND period_start <= ? AND period_end >= ?
      `)
      .bind(quantity, userId, now.toISOString(), now.toISOString())
      .run();

    const remaining = limit === -1 ? -1 : Math.max(0, limit - currentUsed - quantity);

    return { success: true, allowed: true, remaining };
  }

  /**
   * Check if user can perform an action
   */
  async canPerformAction(
    userId: string,
    action: 'create_document' | 'generate_ai' | 'send_signature' | 'upload_file'
  ): Promise<{ allowed: boolean; remaining: number; upgradeRequired: boolean }> {
    const status = await this.getUserUsageStatus(userId);

    switch (action) {
      case 'create_document':
        return {
          allowed: status.canCreate.document,
          remaining: status.usage.documents.unlimited ? -1 : status.usage.documents.limit - status.usage.documents.used,
          upgradeRequired: !status.canCreate.document,
        };
      case 'generate_ai':
        return {
          allowed: status.canCreate.aiGeneration,
          remaining: status.usage.aiGenerations.unlimited ? -1 : status.usage.aiGenerations.limit - status.usage.aiGenerations.used,
          upgradeRequired: !status.canCreate.aiGeneration,
        };
      case 'send_signature':
        return {
          allowed: status.canCreate.signature,
          remaining: status.usage.signatures.unlimited ? -1 : status.usage.signatures.limit - status.usage.signatures.used,
          upgradeRequired: !status.canCreate.signature,
        };
      case 'upload_file':
        return {
          allowed: status.usage.storage.unlimited || status.usage.storage.usedMb < status.usage.storage.limitMb,
          remaining: status.usage.storage.unlimited ? -1 : status.usage.storage.limitMb - status.usage.storage.usedMb,
          upgradeRequired: !status.usage.storage.unlimited && status.usage.storage.usedMb >= status.usage.storage.limitMb,
        };
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    planSlug: PlanSlug,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    promoCode?: string
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    try {
      const plan = await this.getPlanBySlug(planSlug);
      if (!plan) {
        return { success: false, error: 'Invalid plan' };
      }

      // Check for existing active subscription
      const existing = await this.getUserSubscription(userId);
      if (existing && existing.status === 'active') {
        return { success: false, error: 'User already has an active subscription' };
      }

      // Calculate price
      let price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
      let discountApplied = 0;

      // Apply promo code if provided
      if (promoCode) {
        const promo = await this.db
          .prepare(`
            SELECT * FROM promo_codes
            WHERE code = ? AND is_active = 1
              AND (valid_from IS NULL OR valid_from <= datetime('now'))
              AND (valid_until IS NULL OR valid_until >= datetime('now'))
              AND (max_uses IS NULL OR current_uses < max_uses)
          `)
          .bind(promoCode.toUpperCase())
          .first<any>();

        if (promo) {
          // Check if applicable to this plan
          const applicablePlans = JSON.parse(promo.applicable_plans || '[]');
          if (applicablePlans.length === 0 || applicablePlans.includes(plan.id)) {
            if (promo.discount_type === 'percentage') {
              discountApplied = price * (promo.discount_value / 100);
            } else {
              discountApplied = promo.discount_value;
            }
            price = Math.max(0, price - discountApplied);

            // Update promo usage
            await this.db
              .prepare('UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = ?')
              .bind(promo.id)
              .run();
          }
        }
      }

      // Create subscription
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date();
      const periodEnd = billingCycle === 'yearly'
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      await this.db
        .prepare(`
          INSERT INTO subscriptions (
            id, user_id, plan_id, plan, billing_cycle, status,
            price_paid, currency, current_period_start, current_period_end, next_billing_date,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `)
        .bind(
          subscriptionId, userId, plan.id, planSlug, billingCycle,
          price === 0 ? 'active' : 'active', // Would be 'pending' for paid plans in production
          price, plan.currency, now.toISOString(), periodEnd.toISOString(), periodEnd.toISOString()
        )
        .run();

      // Record promo redemption
      if (promoCode && discountApplied > 0) {
        await this.db
          .prepare(`
            INSERT INTO promo_redemptions (id, code_id, user_id, subscription_id, discount_applied)
            SELECT ?, id, ?, ?, ? FROM promo_codes WHERE code = ?
          `)
          .bind(
            `pr_${Date.now()}`,
            userId, subscriptionId, discountApplied, promoCode.toUpperCase()
          )
          .run();
      }

      const subscription = await this.getUserSubscription(userId);
      return { success: true, subscription: subscription || undefined };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    userId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return { success: false, error: 'No active subscription found' };
      }

      await this.db
        .prepare(`
          UPDATE subscriptions
          SET status = 'cancelled', cancelled_at = datetime('now'), cancellation_reason = ?, cancel_at_period_end = 1, updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(reason || null, subscription.id)
        .run();

      return { success: true };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if user has a specific feature
   */
  async hasFeature(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    const planSlug: PlanSlug = subscription?.plan || 'free';
    const plan = PRICING_PLANS[planSlug];

    return plan.features.includes(feature) || plan.features.includes('all_features');
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private mapPlan(row: any): PricingPlan {
    return {
      id: row.id,
      name: row.name,
      nameAr: row.name_ar,
      slug: row.slug as PlanSlug,
      description: row.description,
      descriptionAr: row.description_ar,
      priceMonthly: row.price_monthly,
      priceYearly: row.price_yearly,
      currency: row.currency,
      limits: {
        documentsPerMonth: row.documents_per_month,
        aiGenerationsPerMonth: row.ai_generations_per_month,
        signaturesPerMonth: row.signatures_per_month,
        storageMb: row.storage_mb,
        teamMembers: row.team_members,
      },
      features: JSON.parse(row.features || '[]'),
      isPopular: row.is_popular === 1,
      displayOrder: row.display_order,
    };
  }

  private mapSubscription(row: any): Subscription {
    return {
      id: row.id,
      userId: row.user_id,
      orgId: row.org_id,
      planId: row.plan_id,
      plan: (row.plan_slug || row.plan) as PlanSlug,
      billingCycle: row.billing_cycle || 'monthly',
      status: row.status,
      pricePaid: row.price_paid,
      currency: row.currency,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      nextBillingDate: row.next_billing_date,
      trialEndsAt: row.trial_ends_at,
      cancelledAt: row.cancelled_at,
      cancellationReason: row.cancellation_reason,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createSubscriptionService(db: D1Database): SubscriptionService {
  return new SubscriptionService(db);
}

// ============================================
// MIDDLEWARE HELPER
// ============================================

/**
 * Middleware to check subscription limits before allowing an action
 */
export async function checkSubscriptionLimit(
  db: D1Database,
  userId: string,
  action: 'create_document' | 'generate_ai' | 'send_signature' | 'upload_file'
): Promise<{ allowed: boolean; message?: string }> {
  const service = new SubscriptionService(db);
  const result = await service.canPerformAction(userId, action);

  if (!result.allowed) {
    const messages: Record<string, string> = {
      create_document: 'You have reached your monthly document limit. Please upgrade your plan to create more documents.',
      generate_ai: 'You have reached your monthly AI generation limit. Please upgrade your plan for more AI features.',
      send_signature: 'You have reached your monthly signature limit. Please upgrade your plan to send more signature requests.',
      upload_file: 'You have reached your storage limit. Please upgrade your plan for more storage.',
    };
    return { allowed: false, message: messages[action] };
  }

  return { allowed: true };
}
