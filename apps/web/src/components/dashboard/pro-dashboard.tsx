'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  FileText,
  FolderOpen,
  PenTool,
  Users,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Scale,
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  Timer,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useUserPreferences, roleConfigs } from '@/lib/user-preferences-context';

export function ProDashboard() {
  const locale = useLocale() as 'en' | 'ar';
  const isArabic = locale === 'ar';
  const { preferences, isLegalProfessional } = useUserPreferences();
  const roleConfig = roleConfigs[preferences.role];

  // Mock data for dashboard
  const stats = [
    {
      label: isArabic ? 'القضايا النشطة' : 'Active Cases',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: <Briefcase className="h-5 w-5" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: isArabic ? 'المستندات' : 'Documents',
      value: preferences.usageStats.documentsCreated.toString(),
      change: '+5',
      trend: 'up',
      icon: <FileText className="h-5 w-5" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: isArabic ? 'الساعات القابلة للفوترة' : 'Billable Hours',
      value: '86.5',
      change: '+12.3',
      trend: 'up',
      icon: <Timer className="h-5 w-5" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: isArabic ? 'الإيرادات المعلقة' : 'Pending Revenue',
      value: isArabic ? '٤٥٠٠٠ د.إ' : 'AED 45,000',
      change: '+15%',
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  // Recent cases
  const recentCases = [
    {
      id: 'CASE-2025-001',
      title: isArabic ? 'نزاع عقاري - العين' : 'Property Dispute - Al Ain',
      status: 'active',
      statusLabel: isArabic ? 'نشط' : 'Active',
      priority: 'high',
      client: isArabic ? 'أحمد محمد' : 'Ahmed Mohammed',
      nextDeadline: '2 days',
    },
    {
      id: 'CASE-2025-002',
      title: isArabic ? 'مراجعة عقد تجاري' : 'Commercial Contract Review',
      status: 'pending',
      statusLabel: isArabic ? 'قيد المراجعة' : 'Under Review',
      priority: 'medium',
      client: isArabic ? 'شركة الخليج' : 'Gulf Corporation',
      nextDeadline: '1 week',
    },
    {
      id: 'CASE-2025-003',
      title: isArabic ? 'نزاع عمالي' : 'Employment Dispute',
      status: 'active',
      statusLabel: isArabic ? 'نشط' : 'Active',
      priority: 'low',
      client: isArabic ? 'سارة أحمد' : 'Sara Ahmed',
      nextDeadline: '2 weeks',
    },
  ];

  // Tasks due soon
  const upcomingTasks = [
    {
      id: 1,
      title: isArabic ? 'مراجعة عقد الإيجار' : 'Review rental contract',
      case: 'CASE-2025-001',
      dueDate: 'Tomorrow',
      priority: 'high',
    },
    {
      id: 2,
      title: isArabic ? 'إعداد المذكرة القانونية' : 'Prepare legal memo',
      case: 'CASE-2025-002',
      dueDate: 'In 3 days',
      priority: 'medium',
    },
    {
      id: 3,
      title: isArabic ? 'جلسة محكمة' : 'Court hearing',
      case: 'CASE-2025-001',
      dueDate: 'In 5 days',
      priority: 'high',
    },
  ];

  // Performance metrics
  const performanceMetrics = [
    { label: isArabic ? 'معدل إنجاز القضايا' : 'Case Completion Rate', value: 85, target: 90 },
    { label: isArabic ? 'رضا العملاء' : 'Client Satisfaction', value: 92, target: 95 },
    { label: isArabic ? 'كفاءة الفوترة' : 'Billing Efficiency', value: 78, target: 85 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string, label: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      closed: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isArabic ? 'لوحة التحكم المتقدمة' : 'Pro Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? `${roleConfig.label.ar} - نظرة عامة على أدائك`
              : `${roleConfig.label.en} - Overview of your performance`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/dashboard/cases/new`}>
            <Button variant="outline" className="gap-2 rounded-xl">
              <Briefcase className="h-4 w-4" />
              {isArabic ? 'قضية جديدة' : 'New Case'}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/generate`}>
            <Button className="gap-2 rounded-xl shadow-lg">
              <Plus className="h-4 w-4" />
              {isArabic ? 'مستند جديد' : 'New Document'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.bgColor, stat.color)}>
                  {stat.icon}
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                )}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <Card className="lg:col-span-2 rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {isArabic ? 'القضايا الأخيرة' : 'Recent Cases'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'آخر القضايا النشطة' : 'Your latest active cases'}
                </CardDescription>
              </div>
              <Link href={`/${locale}/dashboard/cases`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  {isArabic ? 'عرض الكل' : 'View All'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCases.map((caseItem) => (
                <Link key={caseItem.id} href={`/${locale}/dashboard/cases/${caseItem.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className={cn('w-2 h-12 rounded-full', getPriorityColor(caseItem.priority))} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{caseItem.id}</span>
                        {getStatusBadge(caseItem.status, caseItem.statusLabel)}
                      </div>
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {caseItem.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{caseItem.client}</p>
                    </div>
                    <div className="text-end">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {caseItem.nextDeadline}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {isArabic ? 'المهام القادمة' : 'Upcoming Tasks'}
              </CardTitle>
              <Badge variant="secondary">
                {upcomingTasks.length} {isArabic ? 'مهمة' : 'tasks'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className={cn('w-2 h-2 rounded-full mt-2', getPriorityColor(task.priority))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{task.case}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-amber-600 font-medium">{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3 gap-2">
              <Plus className="h-4 w-4" />
              {isArabic ? 'إضافة مهمة' : 'Add Task'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <Card className="lg:col-span-2 rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {isArabic ? 'مؤشرات الأداء' : 'Performance Metrics'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'تقدمك نحو الأهداف' : 'Your progress towards goals'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{metric.value}%</span>
                    <span className="text-xs text-muted-foreground">
                      / {metric.target}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      metric.value >= metric.target
                        ? 'bg-green-500'
                        : metric.value >= metric.target * 0.8
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/${locale}/dashboard/advisor`}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Scale className="h-4 w-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-sm font-medium">
                    {isArabic ? 'المستشار القانوني' : 'Legal Advisor'}
                  </p>
                  <p className="text-xs text-muted-foreground">AI</p>
                </div>
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/signatures`}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <PenTool className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-start">
                  <p className="text-sm font-medium">
                    {isArabic ? 'طلب توقيع' : 'Request Signature'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'رقمي' : 'Digital'}
                  </p>
                </div>
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/templates`}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-start">
                  <p className="text-sm font-medium">
                    {isArabic ? 'القوالب' : 'Templates'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'مكتبة' : 'Library'}
                  </p>
                </div>
              </Button>
            </Link>
            {isLegalProfessional && (
              <Link href={`/${locale}/dashboard/lawyer-portal`}>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-medium">
                      {isArabic ? 'بوابة المحامي' : 'Lawyer Portal'}
                    </p>
                    <p className="text-xs text-muted-foreground">Pro</p>
                  </div>
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart Placeholder */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {isArabic ? 'نشاطك هذا الشهر' : 'Your Activity This Month'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'المستندات والقضايا والساعات' : 'Documents, cases, and hours'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {isArabic ? 'مستندات' : 'Documents'}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {isArabic ? 'ساعات' : 'Hours'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
            <div className="text-center">
              <Activity className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'رسم بياني للنشاط قريباً' : 'Activity chart coming soon'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
