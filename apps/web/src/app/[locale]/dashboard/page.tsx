'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Sparkles,
  FileStack,
  Send,
  Scale,
  PenTool,
  Handshake,
  ScanLine,
  Shield,
  ArrowRight,
  Zap,
  Target,
  Award,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { DocumentCard } from '@/components/documents/document-card';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/lib/user-preferences-context';
import { SimpleDashboard } from '@/components/dashboard/simple-dashboard';
import { ProDashboard } from '@/components/dashboard/pro-dashboard';

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { isProMode, isSimpleMode, isLoading } = useUserPreferences();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render mode-specific dashboard
  if (isSimpleMode) {
    return <SimpleDashboard />;
  }

  if (isProMode) {
    return <ProDashboard />;
  }

  // Default fallback to original dashboard (shouldn't happen)

  const translations = {
    welcome: isArabic ? 'مرحباً' : 'Welcome back',
    overview: isArabic ? 'إليك ملخص نشاطك اليوم' : "Here's what's happening with your documents",
    quickActions: isArabic ? 'إجراءات سريعة' : 'Quick Actions',
    recentDocs: isArabic ? 'المستندات الأخيرة' : 'Recent Documents',
    viewAll: isArabic ? 'عرض الكل' : 'View all',
    activity: isArabic ? 'النشاط الأخير' : 'Recent Activity',
    features: isArabic ? 'أدوات متقدمة' : 'Power Tools',
    aiPowered: isArabic ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered',
    new: isArabic ? 'جديد' : 'New',
    totalDocs: isArabic ? 'إجمالي المستندات' : 'Total Documents',
    pending: isArabic ? 'قيد الانتظار' : 'Pending',
    signed: isArabic ? 'موقعة' : 'Signed',
    avgTime: isArabic ? 'متوسط الوقت' : 'Avg. Time',
    thisMonth: isArabic ? 'هذا الشهر' : 'this month',
    hoursAgo: isArabic ? 'منذ ساعات' : 'hours ago',
    dayAgo: isArabic ? 'منذ يوم' : 'day ago',
    getStarted: isArabic ? 'ابدأ الآن' : 'Get Started',
    productivity: isArabic ? 'إنتاجيتك' : 'Your Productivity',
    goals: isArabic ? 'الأهداف' : 'Goals',
    streak: isArabic ? 'أيام متتالية' : 'day streak',
    docsCreated: isArabic ? 'مستندات تم إنشاؤها' : 'docs created',
    timeSaved: isArabic ? 'ساعات تم توفيرها' : 'hours saved',
  };

  const stats = [
    {
      title: translations.totalDocs,
      value: '24',
      icon: FileText,
      trend: { value: 12, isPositive: true },
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: translations.pending,
      value: '7',
      icon: Clock,
      trend: { value: 3, isPositive: false },
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      title: translations.signed,
      value: '18',
      icon: CheckCircle,
      trend: { value: 8, isPositive: true },
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      title: translations.avgTime,
      value: '4.2h',
      icon: TrendingUp,
      trend: { value: 15, isPositive: true },
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  const recentDocuments = [
    {
      id: '1',
      documentNumber: 'DOC-2024-001',
      title: 'Deposit Receipt - Marina Tower',
      type: 'deposit_receipt',
      status: 'signed' as const,
      signersCount: 2,
      signedCount: 2,
      createdAt: `2 ${translations.hoursAgo}`,
    },
    {
      id: '2',
      documentNumber: 'DOC-2024-002',
      title: 'Rental Agreement - JBR',
      type: 'rental_agreement',
      status: 'pending' as const,
      signersCount: 3,
      signedCount: 1,
      createdAt: `5 ${translations.hoursAgo}`,
    },
    {
      id: '3',
      documentNumber: 'DOC-2024-003',
      title: 'NDA - Tech Solutions LLC',
      type: 'nda',
      status: 'draft' as const,
      signersCount: 0,
      signedCount: 0,
      createdAt: `1 ${translations.dayAgo}`,
    },
  ];

  const quickActions = [
    {
      title: isArabic ? 'إنشاء مستند' : 'Create Document',
      description: isArabic ? 'أنشئ مستنداً قانونياً جديداً' : 'Generate a new legal document',
      icon: Sparkles,
      href: `/${locale}/dashboard/generate`,
      color: 'from-blue-600 to-indigo-600',
      badge: translations.aiPowered,
    },
    {
      title: isArabic ? 'طلب توقيع' : 'Request Signature',
      description: isArabic ? 'أرسل مستنداً للتوقيع' : 'Send document for signing',
      icon: PenTool,
      href: `/${locale}/dashboard/signatures/new`,
      color: 'from-green-600 to-emerald-600',
    },
    {
      title: isArabic ? 'استشارة قانونية' : 'Legal Consult',
      description: isArabic ? 'اسأل المستشار القانوني' : 'Ask the AI legal advisor',
      icon: Scale,
      href: `/${locale}/dashboard/advisor/consult`,
      color: 'from-purple-600 to-pink-600',
      badge: translations.aiPowered,
    },
  ];

  const powerTools = [
    {
      title: isArabic ? 'التفاوض الذكي' : 'Smart Negotiation',
      description: isArabic ? 'حلل العقود واحصل على اقتراحات' : 'Analyze contracts & get suggestions',
      icon: Handshake,
      href: `/${locale}/dashboard/negotiate`,
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      badge: translations.new,
    },
    {
      title: isArabic ? 'مسح المستندات' : 'OCR Scanner',
      description: isArabic ? 'استخرج البيانات من الهويات' : 'Extract data from IDs & docs',
      icon: ScanLine,
      href: `/${locale}/dashboard/scan`,
      color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    },
    {
      title: isArabic ? 'التوثيق بالبلوكشين' : 'Blockchain Certify',
      description: isArabic ? 'وثّق مستنداتك بشكل دائم' : 'Permanently certify documents',
      icon: Shield,
      href: `/${locale}/dashboard/certify`,
      color: 'bg-gradient-to-br from-violet-500 to-purple-500',
      badge: translations.new,
    },
    {
      title: isArabic ? 'مراجعة العقود' : 'Contract Review',
      description: isArabic ? 'راجع العقود واكتشف المخاطر' : 'Review contracts & spot risks',
      icon: FileText,
      href: `/${locale}/dashboard/advisor/review`,
      color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      badge: translations.aiPowered,
    },
  ];

  const activities = [
    {
      icon: CheckCircle,
      iconColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      title: isArabic ? 'تم التوقيع' : 'Document signed',
      description: 'Marina Tower deposit was signed by all parties',
      time: `2 ${translations.hoursAgo}`,
    },
    {
      icon: Clock,
      iconColor: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      title: isArabic ? 'قيد الانتظار' : 'Pending signature',
      description: 'JBR Rental awaiting signature from John',
      time: `5 ${translations.hoursAgo}`,
    },
    {
      icon: Send,
      iconColor: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      title: isArabic ? 'تم الإرسال' : 'Document sent',
      description: 'Service Agreement sent to 3 recipients',
      time: `1 ${translations.dayAgo}`,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-blue-600 p-6 md:p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {translations.welcome}, Ahmed 👋
            </h1>
            <p className="mt-1 text-primary-foreground/80">
              {translations.overview}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/dashboard/generate`}>
              <Button size="lg" variant="secondary" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Sparkles className="h-4 w-4" />
                {isArabic ? 'إنشاء مستند' : 'New Document'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Productivity Stats */}
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">7</p>
              <p className="text-xs text-primary-foreground/70">{translations.streak}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-primary-foreground/70">{translations.docsCreated}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-primary-foreground/70">{translations.timeSaved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{translations.quickActions}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="group relative overflow-hidden rounded-xl border bg-card p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={cn(
                  'absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br',
                  action.color
                )} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br',
                      action.color
                    )}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {translations.getStarted}
                    <ArrowRight className="h-4 w-4 ms-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={cn('p-2.5 rounded-xl', stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.trend && (
                  <Badge variant={stat.trend.isPositive ? 'default' : 'destructive'} className="text-xs">
                    {stat.trend.isPositive ? '↑' : '↓'} {stat.trend.value}%
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Power Tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{translations.features}</h2>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {translations.aiPowered}
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {powerTools.map((tool, index) => (
            <Link key={index} href={tool.href}>
              <div className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={cn('h-24 flex items-center justify-center', tool.color)}>
                  <tool.icon className="h-10 w-10 text-white" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm">{tool.title}</h3>
                    {tool.badge && (
                      <Badge variant="secondary" className="text-[10px]">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">{translations.recentDocs}</CardTitle>
            </div>
            <Link href={`/${locale}/dashboard/documents`}>
              <Button variant="ghost" size="sm" className="gap-1">
                {translations.viewAll}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                {...doc}
                onView={() => console.log('View', doc.id)}
                onSend={() => console.log('Send', doc.id)}
                onDownload={() => console.log('Download', doc.id)}
                onDelete={() => console.log('Delete', doc.id)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{translations.activity}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className={cn('p-2 rounded-lg transition-transform group-hover:scale-110', activity.iconColor)}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              {translations.viewAll}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
