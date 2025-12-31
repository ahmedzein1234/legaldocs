/**
 * Subscription & Pricing Routes
 *
 * API endpoints for managing subscriptions, pricing plans, and usage.
 */

import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  createSubscriptionService,
  PRICING_PLANS,
  FEATURE_NAMES,
  type PlanSlug,
} from '../lib/subscriptions.js';
import { createAnalyticsService } from '../lib/analytics.js';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  JWT_SECRET: string;
};

type Variables = {
  userId: string;
  userEmail: string;
  userRole: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// PUBLIC ROUTES - Pricing Plans
// ============================================

/**
 * GET /api/subscriptions/plans
 * Get all available pricing plans
 */
app.get('/plans', async (c) => {
  try {
    const service = createSubscriptionService(c.env.DB);
    const plans = await service.getPlans();
    const language = c.req.query('lang') || 'en';

    // Format plans with feature details
    const formattedPlans = plans.map((plan) => ({
      ...plan,
      features: plan.features.map((feature) => ({
        key: feature,
        name: language === 'ar' ? FEATURE_NAMES[feature]?.ar : FEATURE_NAMES[feature]?.en,
      })),
      displayName: language === 'ar' ? plan.nameAr : plan.name,
      displayDescription: language === 'ar' ? plan.descriptionAr : plan.description,
      savings: plan.priceYearly > 0
        ? Math.round(((plan.priceMonthly * 12 - plan.priceYearly) / (plan.priceMonthly * 12)) * 100)
        : 0,
    }));

    return c.json({
      success: true,
      data: { plans: formattedPlans },
    });
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch plans' } }, 500);
  }
});

/**
 * GET /api/subscriptions/plans/:slug
 * Get a specific plan by slug
 */
app.get('/plans/:slug', async (c) => {
  try {
    const { slug } = c.req.param();
    const service = createSubscriptionService(c.env.DB);
    const plan = await service.getPlanBySlug(slug as PlanSlug);
    const language = c.req.query('lang') || 'en';

    if (!plan) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Plan not found' } }, 404);
    }

    const formattedPlan = {
      ...plan,
      features: plan.features.map((feature) => ({
        key: feature,
        name: language === 'ar' ? FEATURE_NAMES[feature]?.ar : FEATURE_NAMES[feature]?.en,
      })),
      displayName: language === 'ar' ? plan.nameAr : plan.name,
      displayDescription: language === 'ar' ? plan.descriptionAr : plan.description,
    };

    return c.json({
      success: true,
      data: { plan: formattedPlan },
    });
  } catch (error: any) {
    console.error('Error fetching plan:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch plan' } }, 500);
  }
});

/**
 * GET /api/subscriptions/compare
 * Get comparison data for all plans
 */
app.get('/compare', async (c) => {
  try {
    const language = c.req.query('lang') || 'en';

    const comparisonFeatures = [
      { key: 'documents_per_month', name: language === 'ar' ? 'المستندات شهرياً' : 'Documents per month' },
      { key: 'ai_generations', name: language === 'ar' ? 'توليدات الذكاء الاصطناعي' : 'AI Generations' },
      { key: 'e_signatures', name: language === 'ar' ? 'التوقيعات الإلكترونية' : 'E-Signatures' },
      { key: 'storage', name: language === 'ar' ? 'التخزين' : 'Storage' },
      { key: 'team_members', name: language === 'ar' ? 'أعضاء الفريق' : 'Team Members' },
      { key: 'templates', name: language === 'ar' ? 'القوالب' : 'Templates' },
      { key: 'ai_contract_review', name: language === 'ar' ? 'مراجعة العقود بالذكاء الاصطناعي' : 'AI Contract Review' },
      { key: 'priority_support', name: language === 'ar' ? 'الدعم المميز' : 'Priority Support' },
      { key: 'api_access', name: language === 'ar' ? 'الوصول إلى API' : 'API Access' },
      { key: 'custom_branding', name: language === 'ar' ? 'العلامة التجارية المخصصة' : 'Custom Branding' },
    ];

    const plans = Object.entries(PRICING_PLANS).map(([slug, plan]) => ({
      slug,
      name: language === 'ar' ? plan.nameAr : plan.name,
      price: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      values: {
        documents_per_month: plan.limits.documentsPerMonth === -1 ? 'Unlimited' : plan.limits.documentsPerMonth.toString(),
        ai_generations: plan.limits.aiGenerationsPerMonth === -1 ? 'Unlimited' : plan.limits.aiGenerationsPerMonth.toString(),
        e_signatures: plan.limits.signaturesPerMonth === -1 ? 'Unlimited' : plan.limits.signaturesPerMonth.toString(),
        storage: plan.limits.storageMb === -1 ? 'Unlimited' : `${plan.limits.storageMb / 1000} GB`,
        team_members: plan.limits.teamMembers === -1 ? 'Unlimited' : plan.limits.teamMembers.toString(),
        templates: plan.features.includes('premium_templates') || plan.features.includes('all_features') ? 'All' : 'Basic',
        ai_contract_review: plan.features.includes('ai_contract_review') || plan.features.includes('all_features'),
        priority_support: plan.features.includes('priority_support') || plan.features.includes('dedicated_support') || plan.features.includes('all_features'),
        api_access: plan.features.includes('api_access') || plan.features.includes('all_features'),
        custom_branding: plan.features.includes('custom_branding') || plan.features.includes('all_features'),
      },
    }));

    return c.json({
      success: true,
      data: { features: comparisonFeatures, plans },
    });
  } catch (error: any) {
    console.error('Error fetching comparison:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch comparison' } }, 500);
  }
});

// ============================================
// AUTHENTICATED ROUTES - User Subscription
// ============================================

/**
 * GET /api/subscriptions/me
 * Get current user's subscription
 */
app.get('/me', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const service = createSubscriptionService(c.env.DB);
    const subscription = await service.getUserSubscription(userId);

    if (!subscription) {
      // Return free plan info
      return c.json({
        success: true,
        data: {
          subscription: null,
          plan: 'free',
          planDetails: PRICING_PLANS.free,
        },
      });
    }

    const planDetails = PRICING_PLANS[subscription.plan];

    return c.json({
      success: true,
      data: {
        subscription,
        plan: subscription.plan,
        planDetails,
      },
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch subscription' } }, 500);
  }
});

/**
 * GET /api/subscriptions/usage
 * Get current usage status
 */
app.get('/usage', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const service = createSubscriptionService(c.env.DB);
    const usage = await service.getUserUsageStatus(userId);

    return c.json({
      success: true,
      data: { usage },
    });
  } catch (error: any) {
    console.error('Error fetching usage:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch usage' } }, 500);
  }
});

/**
 * POST /api/subscriptions/subscribe
 * Subscribe to a plan
 */
app.post('/subscribe', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { planSlug, billingCycle = 'monthly', promoCode } = body;

    if (!planSlug) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Plan slug is required' },
      }, 400);
    }

    const service = createSubscriptionService(c.env.DB);
    const result = await service.createSubscription(userId, planSlug, billingCycle, promoCode);

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'SUBSCRIPTION_FAILED', message: result.error },
      }, 400);
    }

    // Track analytics
    const analytics = createAnalyticsService(c.env.DB, { userId });
    await analytics.track({
      eventType: 'payment_completed',
      userId,
      properties: {
        planSlug,
        billingCycle,
        promoCode: promoCode || null,
      },
    });

    return c.json({
      success: true,
      data: {
        subscription: result.subscription,
        message: 'Subscription created successfully',
      },
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return c.json({ success: false, error: { code: 'SUBSCRIPTION_FAILED', message: 'Failed to create subscription' } }, 500);
  }
});

/**
 * POST /api/subscriptions/cancel
 * Cancel current subscription
 */
app.post('/cancel', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { reason } = body;

    const service = createSubscriptionService(c.env.DB);
    const result = await service.cancelSubscription(userId, reason);

    if (!result.success) {
      return c.json({
        success: false,
        error: { code: 'CANCELLATION_FAILED', message: result.error },
      }, 400);
    }

    return c.json({
      success: true,
      data: {
        message: 'Subscription will be cancelled at the end of the billing period',
      },
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return c.json({ success: false, error: { code: 'CANCELLATION_FAILED', message: 'Failed to cancel subscription' } }, 500);
  }
});

/**
 * POST /api/subscriptions/check-feature
 * Check if user has access to a feature
 */
app.post('/check-feature', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { feature } = body;

    if (!feature) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Feature is required' },
      }, 400);
    }

    const service = createSubscriptionService(c.env.DB);
    const hasFeature = await service.hasFeature(userId, feature);

    return c.json({
      success: true,
      data: { hasFeature },
    });
  } catch (error: any) {
    console.error('Error checking feature:', error);
    return c.json({ success: false, error: { code: 'CHECK_FAILED', message: 'Failed to check feature' } }, 500);
  }
});

/**
 * POST /api/subscriptions/check-limit
 * Check if user can perform an action
 */
app.post('/check-limit', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { action } = body;

    const validActions = ['create_document', 'generate_ai', 'send_signature', 'upload_file'];
    if (!action || !validActions.includes(action)) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid action is required' },
      }, 400);
    }

    const service = createSubscriptionService(c.env.DB);
    const result = await service.canPerformAction(userId, action);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error checking limit:', error);
    return c.json({ success: false, error: { code: 'CHECK_FAILED', message: 'Failed to check limit' } }, 500);
  }
});

// ============================================
// PROMO CODE ROUTES
// ============================================

/**
 * POST /api/subscriptions/promo/validate
 * Validate a promo code
 */
app.post('/promo/validate', async (c) => {
  try {
    const body = await c.req.json();
    const { code, planSlug } = body;

    if (!code) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Promo code is required' },
      }, 400);
    }

    const promo = await c.env.DB
      .prepare(`
        SELECT * FROM promo_codes
        WHERE code = ? AND is_active = 1
          AND (valid_from IS NULL OR valid_from <= datetime('now'))
          AND (valid_until IS NULL OR valid_until >= datetime('now'))
          AND (max_uses IS NULL OR current_uses < max_uses)
      `)
      .bind(code.toUpperCase())
      .first<any>();

    if (!promo) {
      return c.json({
        success: false,
        error: { code: 'INVALID_CODE', message: 'Invalid or expired promo code' },
      }, 400);
    }

    // Check if applicable to plan
    const applicablePlans = JSON.parse(promo.applicable_plans || '[]');
    if (planSlug && applicablePlans.length > 0) {
      const planId = `plan_${planSlug}`;
      if (!applicablePlans.includes(planId)) {
        return c.json({
          success: false,
          error: { code: 'NOT_APPLICABLE', message: 'Promo code is not valid for this plan' },
        }, 400);
      }
    }

    return c.json({
      success: true,
      data: {
        code: promo.code,
        discountType: promo.discount_type,
        discountValue: promo.discount_value,
        description: promo.description,
        remainingUses: promo.max_uses ? promo.max_uses - promo.current_uses : null,
      },
    });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return c.json({ success: false, error: { code: 'VALIDATION_FAILED', message: 'Failed to validate promo code' } }, 500);
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * GET /api/subscriptions/admin/stats
 * Get subscription statistics
 */
app.get('/admin/stats', requireAdmin, async (c) => {
  try {
    const db = c.env.DB;

    // Total subscriptions by plan
    const byPlan = await db
      .prepare(`
        SELECT plan, COUNT(*) as count
        FROM subscriptions
        WHERE status = 'active'
        GROUP BY plan
      `)
      .all();

    // MRR (Monthly Recurring Revenue)
    const mrr = await db
      .prepare(`
        SELECT
          SUM(CASE WHEN billing_cycle = 'monthly' THEN price_paid ELSE price_paid / 12 END) as mrr
        FROM subscriptions
        WHERE status = 'active'
      `)
      .first<{ mrr: number }>();

    // Total active subscribers
    const activeCount = await db
      .prepare('SELECT COUNT(*) as count FROM subscriptions WHERE status = ?')
      .bind('active')
      .first<{ count: number }>();

    // Recent signups (last 7 days)
    const recentSignups = await db
      .prepare(`
        SELECT COUNT(*) as count
        FROM subscriptions
        WHERE created_at >= datetime('now', '-7 days')
      `)
      .first<{ count: number }>();

    // Churn (cancellations in last 30 days)
    const churn = await db
      .prepare(`
        SELECT COUNT(*) as count
        FROM subscriptions
        WHERE cancelled_at >= datetime('now', '-30 days')
      `)
      .first<{ count: number }>();

    return c.json({
      success: true,
      data: {
        activeSubscribers: activeCount?.count || 0,
        mrr: mrr?.mrr || 0,
        recentSignups: recentSignups?.count || 0,
        churnLast30Days: churn?.count || 0,
        byPlan: byPlan.results || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching subscription stats:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch stats' } }, 500);
  }
});

/**
 * POST /api/subscriptions/admin/promo
 * Create a new promo code
 */
app.post('/admin/promo', requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const {
      code,
      description,
      discountType = 'percentage',
      discountValue,
      validFrom,
      validUntil,
      maxUses,
      applicablePlans = [],
      firstTimeOnly = false,
    } = body;

    if (!code || !discountValue) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Code and discount value are required' },
      }, 400);
    }

    const promoId = `promo_${Date.now()}`;
    await c.env.DB
      .prepare(`
        INSERT INTO promo_codes (
          id, code, description, discount_type, discount_value,
          valid_from, valid_until, max_uses, applicable_plans, first_time_only
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        promoId, code.toUpperCase(), description, discountType, discountValue,
        validFrom || null, validUntil || null, maxUses || null, JSON.stringify(applicablePlans), firstTimeOnly ? 1 : 0
      )
      .run();

    return c.json({
      success: true,
      data: {
        id: promoId,
        code: code.toUpperCase(),
        message: 'Promo code created successfully',
      },
    });
  } catch (error: any) {
    console.error('Error creating promo code:', error);
    return c.json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create promo code' } }, 500);
  }
});

/**
 * GET /api/subscriptions/admin/subscriptions
 * List all subscriptions
 */
app.get('/admin/subscriptions', requireAdmin, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    const status = c.req.query('status');
    const plan = c.req.query('plan');

    let whereClause = '1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND s.status = ?';
      params.push(status);
    }
    if (plan) {
      whereClause += ' AND s.plan = ?';
      params.push(plan);
    }

    const subscriptions = await c.env.DB
      .prepare(`
        SELECT s.*, u.email, u.full_name
        FROM subscriptions s
        LEFT JOIN users u ON u.id = s.user_id
        WHERE ${whereClause}
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...params, limit, offset)
      .all();

    const countResult = await c.env.DB
      .prepare(`SELECT COUNT(*) as total FROM subscriptions s WHERE ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        subscriptions: subscriptions.results || [],
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch subscriptions' } }, 500);
  }
});

export { app as subscriptions };
