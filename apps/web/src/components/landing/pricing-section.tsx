'use client';

import * as React from 'react';
import { Check, X, Sparkles, Crown, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PricingFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: PricingFeature[];
  popular?: boolean;
  badge?: string;
  icon?: typeof Sparkles;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  maxDocuments?: number | 'unlimited';
  maxSignatures?: number | 'unlimited';
}

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
  className?: string;
  billingPeriod?: 'monthly' | 'yearly';
  onBillingChange?: (period: 'monthly' | 'yearly') => void;
  onSelectPlan?: (tierId: string) => void;
  showComparison?: boolean;
}

const defaultTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for individuals getting started',
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: 'AED',
    icon: Zap,
    buttonText: 'Get Started',
    buttonVariant: 'outline',
    maxDocuments: 5,
    maxSignatures: 3,
    features: [
      { name: '5 documents per month', included: true },
      { name: '3 digital signatures', included: true },
      { name: 'Basic templates', included: true },
      { name: 'English documents only', included: true },
      { name: 'Email support', included: true },
      { name: 'AI document generation', included: false },
      { name: 'Blockchain certification', included: false },
      { name: 'Multi-language support', included: false },
      { name: 'Legal AI advisor', included: false },
      { name: 'Priority support', included: false },
      { name: 'Team collaboration', included: false },
      { name: 'API access', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Ideal for professionals and small businesses',
    price: {
      monthly: 199,
      yearly: 1990, // ~165/month (2 months free)
    },
    currency: 'AED',
    popular: true,
    badge: 'Most Popular',
    icon: Sparkles,
    buttonText: 'Start Free Trial',
    buttonVariant: 'default',
    maxDocuments: 100,
    maxSignatures: 'unlimited',
    features: [
      { name: '100 documents per month', included: true, highlight: true },
      { name: 'Unlimited digital signatures', included: true, highlight: true },
      { name: 'All premium templates', included: true },
      { name: 'Multi-language support (EN, AR, UR)', included: true, highlight: true },
      { name: 'AI document generation', included: true, highlight: true },
      { name: 'Blockchain certification', included: true, highlight: true },
      { name: 'Legal AI advisor', included: true, highlight: true },
      { name: 'Contract review & analysis', included: true },
      { name: 'Version history', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Team collaboration (up to 5)', included: true },
      { name: 'API access', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large teams and organizations',
    price: {
      monthly: 0, // Custom pricing
      yearly: 0,
    },
    currency: 'AED',
    icon: Crown,
    buttonText: 'Contact Sales',
    buttonVariant: 'secondary',
    maxDocuments: 'unlimited',
    maxSignatures: 'unlimited',
    features: [
      { name: 'Unlimited documents', included: true, highlight: true },
      { name: 'Unlimited digital signatures', included: true, highlight: true },
      { name: 'All premium templates', included: true },
      { name: 'Multi-language support', included: true },
      { name: 'AI document generation', included: true },
      { name: 'Blockchain certification', included: true },
      { name: 'Legal AI advisor', included: true },
      { name: 'Advanced analytics & reporting', included: true, highlight: true },
      { name: 'Custom templates & branding', included: true, highlight: true },
      { name: 'Dedicated account manager', included: true, highlight: true },
      { name: 'Unlimited team members', included: true, highlight: true },
      { name: 'API access & integrations', included: true, highlight: true },
      { name: 'SLA guarantee', included: true, highlight: true },
      { name: 'Custom contract & billing', included: true },
    ],
  },
];

function PricingCard({ tier, billingPeriod, onSelect, isPopular }: {
  tier: PricingTier;
  billingPeriod: 'monthly' | 'yearly';
  onSelect?: (tierId: string) => void;
  isPopular?: boolean;
}) {
  const Icon = tier.icon || Sparkles;
  const price = tier.price[billingPeriod];
  const isCustomPricing = price === 0 && tier.id === 'enterprise';

  return (
    <Card
      className={cn(
        'relative flex flex-col h-full transition-all duration-300',
        isPopular && 'border-2 border-primary shadow-xl scale-105 z-10'
      )}
    >
      {tier.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1">
            {tier.badge}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-8">
        <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary w-fit">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl">{tier.name}</CardTitle>
        <CardDescription className="text-base">{tier.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-8 text-center">
          {isCustomPricing ? (
            <div className="text-3xl font-bold">Custom</div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold">{price}</span>
                <span className="text-muted-foreground">
                  {tier.currency}
                  {price > 0 && `/${billingPeriod === 'monthly' ? 'mo' : 'yr'}`}
                </span>
              </div>
              {billingPeriod === 'yearly' && price > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Billed annually ({Math.round(price / 12)} AED/month)
                </p>
              )}
            </>
          )}
        </div>

        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className={cn(
                  'h-5 w-5 flex-shrink-0 mt-0.5',
                  feature.highlight ? 'text-primary' : 'text-green-600'
                )} />
              ) : (
                <X className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground/50" />
              )}
              <span className={cn(
                'text-sm',
                !feature.included && 'text-muted-foreground',
                feature.highlight && 'font-semibold text-foreground'
              )}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full gap-2"
          variant={tier.buttonVariant || 'default'}
          size="lg"
          onClick={() => onSelect?.(tier.id)}
        >
          {tier.buttonText}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PricingSection({
  title = 'Simple, Transparent Pricing',
  subtitle = 'Choose the perfect plan for your needs. Upgrade, downgrade, or cancel anytime.',
  tiers = defaultTiers,
  className,
  billingPeriod: controlledBillingPeriod,
  onBillingChange,
  onSelectPlan,
  showComparison = true,
}: PricingSectionProps) {
  const [internalBillingPeriod, setInternalBillingPeriod] = React.useState<'monthly' | 'yearly'>('monthly');

  const billingPeriod = controlledBillingPeriod || internalBillingPeriod;

  const handleBillingChange = (period: 'monthly' | 'yearly') => {
    if (onBillingChange) {
      onBillingChange(period);
    } else {
      setInternalBillingPeriod(period);
    }
  };

  const yearlySavings = Math.round(((1 - (tiers[1]?.price.yearly / 12) / tiers[1]?.price.monthly) * 100) || 0);

  return (
    <section className={cn('py-16 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 rounded-full bg-muted">
            <button
              onClick={() => handleBillingChange('monthly')}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-all',
                billingPeriod === 'monthly'
                  ? 'bg-background text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => handleBillingChange('yearly')}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                billingPeriod === 'yearly'
                  ? 'bg-background text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              {yearlySavings > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Save {yearlySavings}%
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-6 items-start mb-12">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              billingPeriod={billingPeriod}
              onSelect={onSelectPlan}
              isPopular={tier.popular}
            />
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            All plans include 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Secure payment
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              24/7 support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Comparison Table
export function PricingComparison({ tiers = defaultTiers }: { tiers?: PricingTier[] }) {
  const allFeatures = Array.from(
    new Set(tiers.flatMap(tier => tier.features.map(f => f.name)))
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-start p-4 font-semibold">Features</th>
            {tiers.map(tier => (
              <th key={tier.id} className="text-center p-4 font-semibold">
                {tier.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((featureName, index) => (
            <tr key={index} className="border-b hover:bg-muted/50">
              <td className="p-4">{featureName}</td>
              {tiers.map(tier => {
                const feature = tier.features.find(f => f.name === featureName);
                return (
                  <td key={tier.id} className="text-center p-4">
                    {feature?.included ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
