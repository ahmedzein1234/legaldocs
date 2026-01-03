'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Briefcase,
  DollarSign,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserEngagements } from '@/hooks/useFirms';
import {
  SERVICE_TYPES,
  LEGAL_CATEGORIES,
  type ServiceRequest,
  type RequestStatus,
  type FirmEngagement,
} from '@/lib/firms';
import type { Locale } from '@/i18n';

const translations = {
  en: {
    title: 'My Legal Requests',
    subtitle: 'Manage your service requests and engagements',
    newRequest: 'New Request',
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    noRequests: 'No requests yet',
    noRequestsDesc: 'Create your first service request to get started',
    status: {
      draft: 'Draft',
      pending_review: 'Pending Review',
      open: 'Open for Bidding',
      bidding: 'Receiving Bids',
      anchor_review: 'Anchor Review',
      assigned: 'Assigned',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
      pending_payment: 'Pending Payment',
      active: 'Active',
      under_review: 'Under Review',
    },
    bids: 'bids',
    viewDetails: 'View Details',
    budget: 'Budget',
    agreedAmount: 'Agreed Amount',
    firm: 'Firm',
    engagements: 'Engagements',
    requests: 'Requests',
  },
  ar: {
    title: 'طلباتي القانونية',
    subtitle: 'إدارة طلبات الخدمة والتعاقدات',
    newRequest: 'طلب جديد',
    all: 'الكل',
    active: 'نشط',
    completed: 'مكتمل',
    noRequests: 'لا توجد طلبات بعد',
    noRequestsDesc: 'أنشئ طلبك الأول للبدء',
    status: {
      draft: 'مسودة',
      pending_review: 'قيد المراجعة',
      open: 'مفتوح للعروض',
      bidding: 'يستقبل العروض',
      anchor_review: 'مراجعة الشريك',
      assigned: 'تم التعيين',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      disputed: 'متنازع عليه',
      pending_payment: 'بانتظار الدفع',
      active: 'نشط',
      under_review: 'قيد المراجعة',
    },
    bids: 'عروض',
    viewDetails: 'عرض التفاصيل',
    budget: 'الميزانية',
    agreedAmount: 'المبلغ المتفق عليه',
    firm: 'المكتب',
    engagements: 'التعاقدات',
    requests: 'الطلبات',
  },
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  open: 'bg-blue-100 text-blue-700',
  bidding: 'bg-blue-100 text-blue-700',
  anchor_review: 'bg-purple-100 text-purple-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-cyan-100 text-cyan-700',
  active: 'bg-cyan-100 text-cyan-700',
  under_review: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  disputed: 'bg-red-100 text-red-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-4 w-4" />,
  pending_review: <Clock className="h-4 w-4" />,
  open: <Users className="h-4 w-4" />,
  bidding: <Users className="h-4 w-4" />,
  anchor_review: <Clock className="h-4 w-4" />,
  assigned: <CheckCircle className="h-4 w-4" />,
  in_progress: <Briefcase className="h-4 w-4" />,
  active: <Briefcase className="h-4 w-4" />,
  under_review: <AlertCircle className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  disputed: <AlertCircle className="h-4 w-4" />,
  pending_payment: <DollarSign className="h-4 w-4" />,
};

function EngagementCard({
  engagement,
  locale,
  t,
}: {
  engagement: FirmEngagement;
  locale: Locale;
  t: typeof translations.en;
}) {
  const isArabic = locale === 'ar';
  const serviceType = SERVICE_TYPES.find(s => s.value === engagement.serviceType);
  const category = LEGAL_CATEGORIES.find(c => c.value === engagement.category);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusColors[engagement.status] || 'bg-gray-100'}>
                {statusIcons[engagement.status]}
                <span className="ml-1">{t.status[engagement.status as keyof typeof t.status] || engagement.status}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                {engagement.engagementNumber}
              </span>
            </div>

            <h3 className="font-semibold mb-1">
              {engagement.requestTitle || 'Service Engagement'}
            </h3>

            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>
                {serviceType?.[isArabic ? 'labelAr' : 'labelEn']}
              </span>
              {category && (
                <>
                  <span>•</span>
                  <span>{category[isArabic ? 'labelAr' : 'labelEn']}</span>
                </>
              )}
              {engagement.firmName && (
                <>
                  <span>•</span>
                  <span>{t.firm}: {engagement.firmName}</span>
                </>
              )}
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t.agreedAmount}: </span>
                <span className="font-semibold">AED {engagement.agreedAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Link href={`/${locale}/dashboard/engagements/${engagement.id}`}>
            <Button variant="ghost" size="sm">
              {t.viewDetails}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function RequestsPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const isArabic = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const { data, isLoading } = useUserEngagements(
    filter === 'completed' ? 'completed' : filter === 'active' ? 'active' : undefined
  );

  const engagements = data?.data?.engagements || [];

  return (
    <div className="min-h-screen bg-muted/30 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          <Link href={`/${locale}/dashboard/requests/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.newRequest}
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">{t.all}</TabsTrigger>
            <TabsTrigger value="active">{t.active}</TabsTrigger>
            <TabsTrigger value="completed">{t.completed}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : engagements.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.noRequests}</h3>
              <p className="text-muted-foreground mb-6">{t.noRequestsDesc}</p>
              <Link href={`/${locale}/dashboard/requests/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.newRequest}
                </Button>
              </Link>
            </Card>
          ) : (
            engagements.map((engagement) => (
              <EngagementCard
                key={engagement.id}
                engagement={engagement}
                locale={locale}
                t={t}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
