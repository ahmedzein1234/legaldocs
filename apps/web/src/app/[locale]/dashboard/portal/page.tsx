'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  ChevronRight,
  Bell,
  Shield,
  Scale,
  FileSignature,
  Building2,
  Gavel,
  Timer,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserEngagements } from '@/hooks/useFirms';
import type { Locale } from '@/i18n';

const translations = {
  en: {
    title: 'Legal Portal',
    subtitle: 'Your complete legal overview',
    welcome: 'Welcome back',
    legalHealthScore: 'Legal Health Score',
    healthGood: 'Good Standing',
    healthWarning: 'Needs Attention',
    healthCritical: 'Action Required',
    viewDetails: 'View Details',
    activeCases: 'Active Cases',
    pendingSignatures: 'Pending Signatures',
    upcomingDeadlines: 'Upcoming Deadlines',
    totalSpent: 'Total Spent',
    thisMonth: 'this month',
    overview: 'Overview',
    cases: 'Cases',
    documents: 'Documents',
    calendar: 'Calendar',
    activity: 'Activity',
    recentActivity: 'Recent Activity',
    viewAll: 'View All',
    noCases: 'No active cases',
    noCasesDesc: 'Start a service request to get legal help',
    startRequest: 'Start Request',
    deadlinesThisWeek: 'Deadlines This Week',
    noDeadlines: 'No upcoming deadlines',
    documentsNeedingAction: 'Documents Needing Action',
    sign: 'Sign',
    review: 'Review',
    quickActions: 'Quick Actions',
    newDocument: 'New Document',
    findLawyer: 'Find Lawyer',
    bookConsultation: 'Book Consultation',
    uploadDocument: 'Upload Document',
    caseProgress: 'Case Progress',
    status: {
      active: 'Active',
      pending: 'Pending',
      completed: 'Completed',
      in_progress: 'In Progress',
      under_review: 'Under Review',
    },
    engagementsWith: 'Engagements with',
    lawyers: 'Lawyers',
    firms: 'Firms',
    complianceAlerts: 'Compliance Alerts',
    expiringDocuments: 'Expiring Documents',
    missingDocuments: 'Missing Documents',
    legalTips: 'Legal Tips',
    tip1: 'Keep employment contracts updated annually',
    tip2: 'Review NDAs before sharing sensitive information',
    tip3: 'Renew trade licenses 30 days before expiry',
  },
  ar: {
    title: 'البوابة القانونية',
    subtitle: 'نظرتك القانونية الشاملة',
    welcome: 'مرحباً بعودتك',
    legalHealthScore: 'مؤشر الصحة القانونية',
    healthGood: 'وضع جيد',
    healthWarning: 'يحتاج انتباه',
    healthCritical: 'إجراء مطلوب',
    viewDetails: 'عرض التفاصيل',
    activeCases: 'القضايا النشطة',
    pendingSignatures: 'التوقيعات المعلقة',
    upcomingDeadlines: 'المواعيد القادمة',
    totalSpent: 'إجمالي الإنفاق',
    thisMonth: 'هذا الشهر',
    overview: 'نظرة عامة',
    cases: 'القضايا',
    documents: 'المستندات',
    calendar: 'التقويم',
    activity: 'النشاط',
    recentActivity: 'النشاط الأخير',
    viewAll: 'عرض الكل',
    noCases: 'لا توجد قضايا نشطة',
    noCasesDesc: 'ابدأ طلب خدمة للحصول على مساعدة قانونية',
    startRequest: 'بدء طلب',
    deadlinesThisWeek: 'المواعيد هذا الأسبوع',
    noDeadlines: 'لا توجد مواعيد قادمة',
    documentsNeedingAction: 'المستندات التي تحتاج إجراء',
    sign: 'توقيع',
    review: 'مراجعة',
    quickActions: 'إجراءات سريعة',
    newDocument: 'مستند جديد',
    findLawyer: 'ابحث عن محامي',
    bookConsultation: 'حجز استشارة',
    uploadDocument: 'رفع مستند',
    caseProgress: 'تقدم القضية',
    status: {
      active: 'نشط',
      pending: 'معلق',
      completed: 'مكتمل',
      in_progress: 'قيد التنفيذ',
      under_review: 'قيد المراجعة',
    },
    engagementsWith: 'تعاقدات مع',
    lawyers: 'محامين',
    firms: 'مكاتب',
    complianceAlerts: 'تنبيهات الامتثال',
    expiringDocuments: 'مستندات منتهية الصلاحية',
    missingDocuments: 'مستندات مفقودة',
    legalTips: 'نصائح قانونية',
    tip1: 'حدّث عقود العمل سنوياً',
    tip2: 'راجع اتفاقيات السرية قبل مشاركة المعلومات',
    tip3: 'جدد الرخص التجارية قبل 30 يوماً من انتهائها',
  },
};

// Mock data for demo - in production, this would come from API
const mockHealthScore = 78;
const mockStats = {
  activeCases: 3,
  pendingSignatures: 2,
  upcomingDeadlines: 5,
  totalSpent: 4500,
  spentChange: 12,
};

const mockDeadlines = [
  { id: '1', title: 'Contract Review Deadline', date: '2026-01-06', type: 'case', urgent: true },
  { id: '2', title: 'Signature Required: NDA', date: '2026-01-07', type: 'signature', urgent: true },
  { id: '3', title: 'Consultation with Al Rashid Law', date: '2026-01-08', type: 'consultation', urgent: false },
  { id: '4', title: 'Trade License Renewal', date: '2026-01-15', type: 'compliance', urgent: false },
];

const mockActivity = [
  { id: '1', action: 'Document signed', item: 'Employment Contract - Ahmed', time: '2 hours ago', icon: FileSignature },
  { id: '2', action: 'New bid received', item: 'Contract Review Request', time: '5 hours ago', icon: DollarSign },
  { id: '3', action: 'Case updated', item: 'Real Estate Dispute #1234', time: '1 day ago', icon: Briefcase },
  { id: '4', action: 'Consultation completed', item: 'Legal Advice Session', time: '2 days ago', icon: MessageSquare },
];

const mockDocumentsNeedingAction = [
  { id: '1', title: 'Rental Agreement - Dubai Marina', action: 'sign', dueDate: '2026-01-05' },
  { id: '2', title: 'Service Agreement Draft', action: 'review', dueDate: '2026-01-06' },
];

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  changeLabel?: string;
  href?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{Math.abs(change)}% {changeLabel}</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function HealthScoreCard({ score, t }: { score: number; t: typeof translations.en }) {
  const getHealthStatus = (score: number) => {
    if (score >= 70) return { label: t.healthGood, color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 40) return { label: t.healthWarning, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: t.healthCritical, color: 'text-red-600', bg: 'bg-red-100' };
  };

  const status = getHealthStatus(score);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{t.legalHealthScore}</h3>
            <Badge className={`${status.bg} ${status.color} mt-1`}>
              <Shield className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${score * 2.26} 226`}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{score}</span>
            </div>
          </div>
        </div>
        <Progress value={score} className="h-2" />
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">3 items need attention</span>
          <Link href="#" className="text-primary hover:underline flex items-center">
            {t.viewDetails}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientPortalPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const isArabic = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.en;

  const { data: engagementsData, isLoading } = useUserEngagements();
  const engagements = engagementsData?.data?.engagements || [];

  return (
    <div className="min-h-screen bg-muted/30 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        {/* Top Section: Health Score + Stats */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Health Score */}
          <div className="lg:col-span-1">
            <HealthScoreCard score={mockHealthScore} t={t} />
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <StatCard
              title={t.activeCases}
              value={mockStats.activeCases}
              icon={Briefcase}
              href={`/${locale}/dashboard/requests`}
            />
            <StatCard
              title={t.pendingSignatures}
              value={mockStats.pendingSignatures}
              icon={FileSignature}
              href={`/${locale}/dashboard/signatures`}
            />
            <StatCard
              title={t.upcomingDeadlines}
              value={mockStats.upcomingDeadlines}
              icon={Calendar}
              href={`/${locale}/dashboard/calendar`}
            />
            <StatCard
              title={t.totalSpent}
              value={`AED ${mockStats.totalSpent.toLocaleString()}`}
              icon={DollarSign}
              change={mockStats.spentChange}
              changeLabel={t.thisMonth}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href={`/${locale}/dashboard/generate`}>
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">{t.newDocument}</span>
                </Button>
              </Link>
              <Link href={`/${locale}/firms`}>
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span className="text-sm">{t.findLawyer}</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/lawyers`}>
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <Scale className="h-5 w-5" />
                  <span className="text-sm">{t.bookConsultation}</span>
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/requests/new`}>
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">{t.startRequest}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Cases & Deadlines */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t.deadlinesThisWeek}
                </CardTitle>
                <Link href={`/${locale}/dashboard/calendar`}>
                  <Button variant="ghost" size="sm">
                    {t.viewAll}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {mockDeadlines.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t.noDeadlines}</p>
                ) : (
                  <div className="space-y-3">
                    {mockDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          deadline.urgent ? 'border-red-200 bg-red-50' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {deadline.urgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          <div>
                            <p className="font-medium text-sm">{deadline.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(deadline.date).toLocaleDateString(locale, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={deadline.urgent ? 'destructive' : 'secondary'}>
                          {deadline.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Needing Action */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t.documentsNeedingAction}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDocumentsNeedingAction.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium text-sm">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(doc.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant={doc.action === 'sign' ? 'default' : 'outline'}>
                        {doc.action === 'sign' ? t.sign : t.review}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Engagements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  {t.activeCases}
                </CardTitle>
                <Link href={`/${locale}/dashboard/requests`}>
                  <Button variant="ghost" size="sm">
                    {t.viewAll}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : engagements.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">{t.noCases}</p>
                    <p className="text-sm text-muted-foreground mb-4">{t.noCasesDesc}</p>
                    <Link href={`/${locale}/dashboard/requests/new`}>
                      <Button size="sm">{t.startRequest}</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {engagements.slice(0, 3).map((engagement: any) => (
                      <Link
                        key={engagement.id}
                        href={`/${locale}/dashboard/engagements/${engagement.id}`}
                        className="block"
                      >
                        <div className="p-3 rounded-lg border hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{engagement.requestTitle || 'Legal Service'}</p>
                            <Badge variant="secondary">
                              {t.status[engagement.status as keyof typeof t.status] || engagement.status}
                            </Badge>
                          </div>
                          {engagement.firmName && (
                            <p className="text-xs text-muted-foreground">
                              {t.engagementsWith} {engagement.firmName}
                            </p>
                          )}
                          <div className="mt-2">
                            <Progress value={60} className="h-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Tips */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  {t.recentActivity}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.item}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Alerts */}
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  {t.complianceAlerts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t.expiringDocuments}</span>
                    <Badge variant="outline" className="bg-yellow-100">2</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t.missingDocuments}</span>
                    <Badge variant="outline" className="bg-red-100">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-primary" />
                  {t.legalTips}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t.tip1}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t.tip2}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t.tip3}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
