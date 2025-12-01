'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Scale,
  MessageSquare,
  FileSearch,
  FolderKanban,
  GitCompare,
  Plus,
  ArrowRight,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Briefcase,
  Gavel,
  FileWarning,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import {
  getCaseStatusColor,
  getCasePriorityColor,
  formatCaseType,
  formatCaseStatus,
  type Case,
  type CaseStatus,
  type ConsultationSession,
} from '@/lib/legal-advisor';

// Mock data for demonstration
const mockCases: Partial<Case>[] = [
  {
    id: 'CASE-2025-ABC123',
    title: 'Rental Dispute - Marina Towers',
    caseType: 'real_estate_dispute',
    status: 'in_progress',
    priority: 'high',
    clientName: 'Ahmed Al Mansouri',
    opposingParty: 'Marina Properties LLC',
    country: 'ae',
    claimAmount: 150000,
    currency: 'AED',
    strengthScore: 72,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'CASE-2025-DEF456',
    title: 'Employment Contract Review',
    caseType: 'contract_review',
    status: 'pending_action',
    priority: 'medium',
    clientName: 'Tech Solutions FZE',
    country: 'ae',
    strengthScore: 85,
    createdAt: new Date('2025-01-20'),
  },
  {
    id: 'CASE-2025-GHI789',
    title: 'Commercial Lease Negotiation',
    caseType: 'contract_negotiation',
    status: 'open',
    priority: 'low',
    clientName: 'Global Trading LLC',
    opposingParty: 'City Center Mall',
    country: 'ae',
    claimAmount: 500000,
    currency: 'AED',
    createdAt: new Date('2025-01-25'),
  },
];

const mockRecentConsultations: Partial<ConsultationSession>[] = [
  {
    id: 'session_1',
    title: 'Termination Clause Review',
    topic: 'contract_review',
    country: 'ae',
    createdAt: new Date('2025-01-28'),
  },
  {
    id: 'session_2',
    title: 'Dispute Resolution Options',
    topic: 'dispute_advice',
    country: 'ae',
    createdAt: new Date('2025-01-27'),
  },
  {
    id: 'session_3',
    title: 'Labor Law Compliance Check',
    topic: 'compliance_check',
    country: 'ae',
    createdAt: new Date('2025-01-26'),
  },
];

export default function AdvisorHubPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const stats = [
    {
      title: isRTL ? 'القضايا النشطة' : 'Active Cases',
      value: '5',
      icon: Briefcase,
      trend: { value: 2, isPositive: true },
    },
    {
      title: isRTL ? 'المراجعات المعلقة' : 'Pending Reviews',
      value: '3',
      icon: FileSearch,
      trend: { value: 1, isPositive: false },
    },
    {
      title: isRTL ? 'الاستشارات هذا الشهر' : 'Consultations This Month',
      value: '12',
      icon: MessageSquare,
      trend: { value: 25, isPositive: true },
    },
    {
      title: isRTL ? 'معدل النجاح' : 'Success Rate',
      value: '87%',
      icon: TrendingUp,
      trend: { value: 5, isPositive: true },
    },
  ];

  const advisorFeatures = [
    {
      title: isRTL ? 'استشارة قانونية' : 'Legal Consultation',
      description: isRTL
        ? 'احصل على مشورة قانونية فورية من خبير ذكاء اصطناعي'
        : 'Get instant legal advice from an AI expert',
      icon: MessageSquare,
      href: `/${locale}/dashboard/advisor/consult`,
      color: 'bg-blue-500',
      stats: '24/7 Available',
    },
    {
      title: isRTL ? 'مراجعة العقود' : 'Contract Review',
      description: isRTL
        ? 'تحليل شامل للعقود مع تقييم المخاطر'
        : 'Comprehensive contract analysis with risk assessment',
      icon: FileSearch,
      href: `/${locale}/dashboard/advisor/review`,
      color: 'bg-purple-500',
      stats: '150+ Reviews',
    },
    {
      title: isRTL ? 'إدارة القضايا' : 'Case Management',
      description: isRTL
        ? 'نظم قضاياك ووثائقك في مكان واحد'
        : 'Organize your cases and documents in one place',
      icon: FolderKanban,
      href: `/${locale}/dashboard/advisor/cases`,
      color: 'bg-green-500',
      stats: '12 Active',
    },
    {
      title: isRTL ? 'مقارنة العقود' : 'Contract Comparison',
      description: isRTL
        ? 'قارن العقود بمعايير السوق'
        : 'Compare contracts against market standards',
      icon: GitCompare,
      href: `/${locale}/dashboard/advisor/compare`,
      color: 'bg-orange-500',
      stats: 'New Feature',
    },
  ];

  const getTopicLabel = (topic: string, isArabic: boolean): string => {
    const labels: Record<string, { en: string; ar: string }> = {
      general_inquiry: { en: 'General', ar: 'عام' },
      contract_review: { en: 'Contract Review', ar: 'مراجعة العقد' },
      dispute_advice: { en: 'Dispute', ar: 'نزاع' },
      compliance_check: { en: 'Compliance', ar: 'الامتثال' },
      risk_assessment: { en: 'Risk', ar: 'المخاطر' },
      strategy_planning: { en: 'Strategy', ar: 'الاستراتيجية' },
    };
    return labels[topic]?.[isArabic ? 'ar' : 'en'] || topic;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              {isRTL ? 'المستشار القانوني' : 'Legal Advisor'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isRTL
              ? 'مستشارك القانوني الذكي لقوانين دول الخليج'
              : 'Your AI-powered legal advisor for GCC law'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/dashboard/advisor/consult`}>
            <Button className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {isRTL ? 'استشارة جديدة' : 'New Consultation'}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/advisor/cases/new`}>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? 'قضية جديدة' : 'New Case'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {advisorFeatures.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.stats}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-sm text-primary font-medium">
                  {isRTL ? 'ابدأ الآن' : 'Get Started'}
                  <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Cases */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {isRTL ? 'القضايا النشطة' : 'Active Cases'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'قضاياك الحالية والمعلقة' : 'Your current and pending cases'}
              </CardDescription>
            </div>
            <Link href={`/${locale}/dashboard/advisor/cases`}>
              <Button variant="ghost" size="sm">
                {isRTL ? 'عرض الكل' : 'View All'}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{caseItem.title}</h4>
                    <Badge
                      variant="secondary"
                      className={getCasePriorityColor(caseItem.priority!)}
                    >
                      {caseItem.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{caseItem.clientName}</span>
                    {caseItem.opposingParty && (
                      <>
                        <span>vs</span>
                        <span>{caseItem.opposingParty}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={getCaseStatusColor(caseItem.status!)}>
                      {formatCaseStatus(caseItem.status!, isRTL)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatCaseType(caseItem.caseType!, isRTL)}
                    </span>
                  </div>
                </div>
                {caseItem.strengthScore !== undefined && (
                  <div className="text-center ml-4">
                    <div className="text-2xl font-bold text-primary">
                      {caseItem.strengthScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isRTL ? 'قوة القضية' : 'Case Strength'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {isRTL ? 'الاستشارات الأخيرة' : 'Recent Consultations'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'استشاراتك القانونية الأخيرة' : 'Your recent legal consultations'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRecentConsultations.map((session) => (
              <div
                key={session.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-full bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getTopicLabel(session.topic!, isRTL)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {session.createdAt?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Link href={`/${locale}/dashboard/advisor/consult`}>
              <Button variant="outline" className="w-full gap-2 mt-2">
                <Plus className="h-4 w-4" />
                {isRTL ? 'استشارة جديدة' : 'New Consultation'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
          <CardDescription>
            {isRTL ? 'ابدأ بالخدمة المناسبة لاحتياجاتك' : 'Start with the right service for your needs'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={`/${locale}/dashboard/advisor/review`}>
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">
                    {isRTL ? 'فحص المخاطر' : 'Risk Check'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'تحقق من مخاطر العقد' : 'Check contract risks'}
                  </p>
                </div>
              </div>
            </Link>
            <Link href={`/${locale}/dashboard/advisor/consult`}>
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <Gavel className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">
                    {isRTL ? 'نصيحة قانونية' : 'Legal Advice'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'اسأل خبيرنا القانوني' : 'Ask our legal expert'}
                  </p>
                </div>
              </div>
            </Link>
            <Link href={`/${locale}/dashboard/advisor/cases/new`}>
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <FolderKanban className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium">
                    {isRTL ? 'إنشاء قضية' : 'Create Case'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'ابدأ ملف قضية جديد' : 'Start a new case file'}
                  </p>
                </div>
              </div>
            </Link>
            <Link href={`/${locale}/dashboard/advisor/compare`}>
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <FileWarning className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-medium">
                    {isRTL ? 'مقارنة العقود' : 'Compare Contracts'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'قارن بمعايير السوق' : 'Compare to market standard'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
