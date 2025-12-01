'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Shield,
  ShieldCheck,
  Award,
  Sparkles,
  Star,
  CheckCircle2,
  Trophy,
  Crown,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';

interface LawyerBadge {
  id: string;
  badge_type: string;
  badge_category: string;
  badge_name: string;
  badge_name_ar?: string;
  badge_description?: string;
  badge_description_ar?: string;
  badge_icon?: string;
  badge_color?: string;
  verification_level?: string;
  specialization_area?: string;
  is_primary?: boolean;
}

interface VerificationBadgesProps {
  badges: LawyerBadge[];
  verificationLevel?: string;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  maxDisplay?: number;
}

const iconMap: Record<string, any> = {
  'shield': Shield,
  'shield-check': ShieldCheck,
  'award': Award,
  'sparkles': Sparkles,
  'star': Star,
  'check-circle': CheckCircle2,
  'trophy': Trophy,
  'crown': Crown,
  'zap': Zap,
  'target': Target,
  'trending-up': TrendingUp,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  green: {
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-900',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800',
  },
};

const sizeMap = {
  sm: {
    badge: 'text-[10px] px-2 py-0.5',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'text-xs px-2.5 py-1',
    icon: 'h-3.5 w-3.5',
  },
  lg: {
    badge: 'text-sm px-3 py-1.5',
    icon: 'h-4 w-4',
  },
};

export function VerificationBadges({
  badges,
  verificationLevel,
  locale = 'en',
  size = 'md',
  showTooltip = true,
  maxDisplay,
}: VerificationBadgesProps) {
  const isArabic = locale === 'ar';

  // Sort badges: primary first, then by type
  const sortedBadges = [...badges].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });

  const displayBadges = maxDisplay ? sortedBadges.slice(0, maxDisplay) : sortedBadges;
  const hiddenCount = maxDisplay && sortedBadges.length > maxDisplay
    ? sortedBadges.length - maxDisplay
    : 0;

  const getBadgeIcon = (badge: LawyerBadge) => {
    const iconName = badge.badge_icon || 'shield-check';
    const Icon = iconMap[iconName] || ShieldCheck;
    return Icon;
  };

  const getBadgeColor = (badge: LawyerBadge) => {
    return colorMap[badge.badge_color || 'blue'] || colorMap.blue;
  };

  const renderBadge = (badge: LawyerBadge) => {
    const Icon = getBadgeIcon(badge);
    const colors = getBadgeColor(badge);
    const sizes = sizeMap[size];
    const badgeName = isArabic && badge.badge_name_ar ? badge.badge_name_ar : badge.badge_name;
    const badgeDescription = isArabic && badge.badge_description_ar
      ? badge.badge_description_ar
      : badge.badge_description;

    const badgeElement = (
      <Badge
        key={badge.id}
        variant="outline"
        className={cn(
          'gap-1 font-medium',
          colors.bg,
          colors.text,
          colors.border,
          sizes.badge,
          badge.is_primary && 'ring-2 ring-offset-2 ring-current'
        )}
      >
        <Icon className={sizes.icon} />
        <span>{badgeName}</span>
      </Badge>
    );

    if (showTooltip && badgeDescription) {
      return (
        <TooltipProvider key={badge.id}>
          <Tooltip>
            <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{badgeDescription}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return badgeElement;
  };

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {displayBadges.map((badge) => renderBadge(badge))}
      {hiddenCount > 0 && (
        <Badge variant="outline" className={cn('gap-1', sizeMap[size].badge)}>
          +{hiddenCount}
        </Badge>
      )}
    </div>
  );
}

// Compact badge display for lawyer cards
export function CompactVerificationBadge({
  verificationLevel,
  locale = 'en',
}: {
  verificationLevel: string;
  locale?: string;
}) {
  const isArabic = locale === 'ar';

  const levelConfig: Record<string, { icon: any; color: string; label: string; labelAr: string }> = {
    basic: {
      icon: Shield,
      color: 'blue',
      label: 'Basic',
      labelAr: 'أساسي',
    },
    identity: {
      icon: ShieldCheck,
      color: 'yellow',
      label: 'ID Verified',
      labelAr: 'موثق الهوية',
    },
    professional: {
      icon: Award,
      color: 'purple',
      label: 'Professional',
      labelAr: 'مهني',
    },
    enhanced: {
      icon: Sparkles,
      color: 'green',
      label: 'Enhanced',
      labelAr: 'محسّن',
    },
  };

  const config = levelConfig[verificationLevel] || levelConfig.basic;
  const Icon = config.icon;
  const colors = colorMap[config.color];
  const label = isArabic ? config.labelAr : config.label;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 text-[10px] px-2 py-0.5 font-medium',
        colors.bg,
        colors.text,
        colors.border
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// Large badge display for profile headers
export function ProfileVerificationBadge({
  verificationLevel,
  badges,
  locale = 'en',
}: {
  verificationLevel: string;
  badges: LawyerBadge[];
  locale?: string;
}) {
  const isArabic = locale === 'ar';

  const levelConfig: Record<string, {
    icon: any;
    color: string;
    gradient: string;
    label: string;
    labelAr: string;
    description: string;
    descriptionAr: string;
  }> = {
    basic: {
      icon: Shield,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      label: 'Basic Verified',
      labelAr: 'موثق - أساسي',
      description: 'Email and phone verified',
      descriptionAr: 'البريد الإلكتروني والهاتف موثق',
    },
    identity: {
      icon: ShieldCheck,
      color: 'yellow',
      gradient: 'from-yellow-500 to-yellow-600',
      label: 'Identity Verified',
      labelAr: 'موثق - الهوية',
      description: 'Emirates ID verified',
      descriptionAr: 'الهوية الإماراتية موثقة',
    },
    professional: {
      icon: Award,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      label: 'Professionally Verified',
      labelAr: 'موثق - مهني',
      description: 'Bar license and credentials verified',
      descriptionAr: 'ترخيص المحاماة والمؤهلات موثقة',
    },
    enhanced: {
      icon: Sparkles,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      label: 'Enhanced Verified',
      labelAr: 'موثق - محسّن',
      description: 'Full background check completed',
      descriptionAr: 'فحص الخلفية الكامل مكتمل',
    },
  };

  const config = levelConfig[verificationLevel] || levelConfig.basic;
  const Icon = config.icon;
  const label = isArabic ? config.labelAr : config.label;
  const description = isArabic ? config.descriptionAr : config.description;

  return (
    <div className="flex flex-col gap-3">
      {/* Main Verification Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r text-white shadow-lg">
        <div className={cn('h-8 w-8 rounded-full bg-white/20 flex items-center justify-center')}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={cn('bg-gradient-to-r', config.gradient)}>
          <p className="font-semibold">{label}</p>
          <p className="text-xs opacity-90">{description}</p>
        </div>
      </div>

      {/* Additional Badges */}
      {badges.length > 0 && (
        <VerificationBadges
          badges={badges}
          locale={locale}
          size="md"
          showTooltip={true}
        />
      )}
    </div>
  );
}

// Badge for UAE authority verifications
export function UAEAuthorityBadges({
  mojVerified,
  dubaiCourtsVerified,
  adJudicialVerified,
  freeZoneVerified,
  locale = 'en',
}: {
  mojVerified?: boolean;
  dubaiCourtsVerified?: boolean;
  adJudicialVerified?: boolean;
  freeZoneVerified?: boolean;
  locale?: string;
}) {
  const isArabic = locale === 'ar';

  const authorities = [
    {
      verified: mojVerified,
      label: isArabic ? 'وزارة العدل' : 'MoJ',
      fullLabel: isArabic ? 'وزارة العدل' : 'Ministry of Justice',
    },
    {
      verified: dubaiCourtsVerified,
      label: isArabic ? 'محاكم دبي' : 'Dubai Courts',
      fullLabel: isArabic ? 'محاكم دبي' : 'Dubai Courts',
    },
    {
      verified: adJudicialVerified,
      label: isArabic ? 'القضاء أبوظبي' : 'AD Judicial',
      fullLabel: isArabic ? 'القضاء أبوظبي' : 'Abu Dhabi Judicial Department',
    },
    {
      verified: freeZoneVerified,
      label: isArabic ? 'منطقة حرة' : 'Free Zone',
      fullLabel: isArabic ? 'منطقة حرة' : 'Free Zone',
    },
  ];

  const verifiedAuthorities = authorities.filter((a) => a.verified);

  if (verifiedAuthorities.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {verifiedAuthorities.map((authority, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="gap-1 text-[10px] px-2 py-0.5 font-medium bg-green-50 text-green-700 border-green-200"
              >
                <ShieldCheck className="h-3 w-3" />
                {authority.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{authority.fullLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
