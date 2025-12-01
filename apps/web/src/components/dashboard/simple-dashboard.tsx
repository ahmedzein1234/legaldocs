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
  FileSearch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUserPreferences, roleConfigs } from '@/lib/user-preferences-context';

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function QuickAction({ href, icon, title, description, gradient }: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group relative rounded-2xl p-6 text-white overflow-hidden cursor-pointer',
          'bg-gradient-to-br shadow-lg hover:shadow-xl transition-shadow',
          gradient
        )}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
          <ArrowRight className="h-5 w-5 mt-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>
    </Link>
  );
}

export function SimpleDashboard() {
  const locale = useLocale() as 'en' | 'ar';
  const isArabic = locale === 'ar';
  const { preferences, incrementUsage } = useUserPreferences();
  const roleConfig = roleConfigs[preferences.role];

  // Recent documents (mock data)
  const recentDocuments = [
    { id: 1, name: isArabic ? 'عقد إيجار' : 'Rental Agreement', status: 'completed', date: '2 days ago' },
    { id: 2, name: isArabic ? 'اتفاقية عدم إفشاء' : 'NDA Agreement', status: 'pending', date: '5 days ago' },
    { id: 3, name: isArabic ? 'عقد عمل' : 'Employment Contract', status: 'completed', date: '1 week ago' },
  ];

  // Quick actions based on role
  const quickActions = [
    {
      href: `/${locale}/dashboard/generate`,
      icon: <Sparkles className="h-6 w-6" />,
      title: isArabic ? 'إنشاء مستند' : 'Create Document',
      description: isArabic ? 'إنشاء مستند قانوني بالذكاء الاصطناعي' : 'Generate a legal document with AI',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      href: `/${locale}/dashboard/templates`,
      icon: <FolderOpen className="h-6 w-6" />,
      title: isArabic ? 'القوالب' : 'Templates',
      description: isArabic ? 'تصفح القوالب الجاهزة' : 'Browse ready-made templates',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      href: `/${locale}/dashboard/signatures`,
      icon: <PenTool className="h-6 w-6" />,
      title: isArabic ? 'التوقيعات' : 'Signatures',
      description: isArabic ? 'وقع مستنداتك رقمياً' : 'Sign documents digitally',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      href: `/${locale}/dashboard/lawyers`,
      icon: <Users className="h-6 w-6" />,
      title: isArabic ? 'ابحث عن محامي' : 'Find a Lawyer',
      description: isArabic ? 'تواصل مع محامين معتمدين' : 'Connect with verified lawyers',
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  // Stats for simple mode
  const stats = [
    {
      label: isArabic ? 'المستندات' : 'Documents',
      value: preferences.usageStats.documentsCreated,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: isArabic ? 'التوقيعات' : 'Signatures',
      value: preferences.usageStats.signaturesRequested,
      icon: <PenTool className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isArabic ? 'مرحباً بك!' : 'Welcome!'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? `أنت مسجل كـ ${roleConfig.label.ar}`
              : `You're signed in as ${roleConfig.label.en}`}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/generate`}>
          <Button size="lg" className="gap-2 rounded-xl shadow-lg">
            <Plus className="h-5 w-5" />
            {isArabic ? 'مستند جديد' : 'New Document'}
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isArabic ? 'المستندات الأخيرة' : 'Recent Documents'}
          </h2>
          <Link href={`/${locale}/dashboard/documents`}>
            <Button variant="ghost" size="sm" className="gap-1">
              {isArabic ? 'عرض الكل' : 'View All'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-0">
            {recentDocuments.length > 0 ? (
              <div className="divide-y">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {doc.date}
                      </div>
                    </div>
                    {doc.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {isArabic ? 'لا توجد مستندات بعد' : 'No documents yet'}
                </p>
                <Link href={`/${locale}/dashboard/generate`}>
                  <Button variant="link" className="mt-2">
                    {isArabic ? 'أنشئ مستندك الأول' : 'Create your first document'}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Tip of the day */}
      <Card className="rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">
                {isArabic ? 'نصيحة اليوم' : 'Tip of the day'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? 'استخدم الذكاء الاصطناعي لإنشاء مستندات قانونية مخصصة في ثوانٍ. جرب وصف احتياجاتك بلغة بسيطة!'
                  : 'Use AI to create customized legal documents in seconds. Try describing your needs in simple language!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
