'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Building2,
  Briefcase,
  DollarSign,
  Users,
  Clock,
  Star,
  ChevronRight,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useMyFirm,
  useMyFirmBids,
  useMyFirmEngagements,
  useOpenRequests,
} from '@/hooks/useFirms';
import {
  SERVICE_TYPES,
  LEGAL_CATEGORIES,
  URGENCY_OPTIONS,
  type ServiceRequest,
  type RequestBid,
  type FirmEngagement,
} from '@/lib/firms';
import type { Locale } from '@/i18n';

const translations = {
  en: {
    title: 'Firm Dashboard',
    notMember: 'Not a Firm Member',
    notMemberDesc: 'You are not associated with any law firm. Register your firm to access the dashboard.',
    registerFirm: 'Register Your Firm',
    browseFirms: 'Browse Firms',
    overview: 'Overview',
    opportunities: 'Opportunities',
    myBids: 'My Bids',
    engagements: 'Engagements',
    totalEarnings: 'Total Earnings',
    activeCases: 'Active Cases',
    pendingBids: 'Pending Bids',
    avgRating: 'Average Rating',
    openRequests: 'Open Requests',
    openRequestsDesc: 'Browse and bid on service requests from clients',
    viewAll: 'View All',
    bid: 'Bid',
    viewDetails: 'View Details',
    noOpportunities: 'No open requests',
    noOpportunitiesDesc: 'Check back later for new opportunities',
    noBids: 'No bids yet',
    noBidsDesc: 'Start bidding on requests to grow your business',
    noEngagements: 'No engagements yet',
    noEngagementsDesc: 'Win bids to start engagements',
    budget: 'Budget',
    urgency: 'Urgency',
    bidAmount: 'Bid Amount',
    status: 'Status',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    active: 'Active',
    completed: 'Completed',
    firmStatus: 'Status',
    verified: 'Verified',
    pendingVerification: 'Pending Verification',
  },
  ar: {
    title: 'لوحة تحكم المكتب',
    notMember: 'لست عضواً في مكتب',
    notMemberDesc: 'أنت غير مرتبط بأي مكتب محاماة. سجّل مكتبك للوصول إلى لوحة التحكم.',
    registerFirm: 'سجّل مكتبك',
    browseFirms: 'تصفح المكاتب',
    overview: 'نظرة عامة',
    opportunities: 'الفرص',
    myBids: 'عروضي',
    engagements: 'التعاقدات',
    totalEarnings: 'إجمالي الأرباح',
    activeCases: 'القضايا النشطة',
    pendingBids: 'العروض المعلقة',
    avgRating: 'متوسط التقييم',
    openRequests: 'الطلبات المفتوحة',
    openRequestsDesc: 'تصفح وقدم عروضاً على طلبات الخدمة من العملاء',
    viewAll: 'عرض الكل',
    bid: 'قدم عرض',
    viewDetails: 'عرض التفاصيل',
    noOpportunities: 'لا توجد طلبات مفتوحة',
    noOpportunitiesDesc: 'تحقق لاحقاً للفرص الجديدة',
    noBids: 'لا توجد عروض بعد',
    noBidsDesc: 'ابدأ بتقديم العروض لتنمية عملك',
    noEngagements: 'لا توجد تعاقدات بعد',
    noEngagementsDesc: 'اربح العروض لبدء التعاقدات',
    budget: 'الميزانية',
    urgency: 'الإلحاح',
    bidAmount: 'مبلغ العرض',
    status: 'الحالة',
    pending: 'معلق',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    active: 'نشط',
    completed: 'مكتمل',
    firmStatus: 'الحالة',
    verified: 'موثق',
    pendingVerification: 'قيد التحقق',
  },
};

const bidStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  shortlisted: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-700',
  expired: 'bg-gray-100 text-gray-700',
};

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestCard({
  request,
  locale,
  t,
  firmId,
}: {
  request: ServiceRequest;
  locale: Locale;
  t: typeof translations.en;
  firmId: string;
}) {
  const isArabic = locale === 'ar';
  const serviceType = SERVICE_TYPES.find(s => s.value === request.serviceType);
  const category = LEGAL_CATEGORIES.find(c => c.value === request.category);
  const urgency = URGENCY_OPTIONS.find(u => u.value === request.urgency);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                {serviceType?.[isArabic ? 'labelAr' : 'labelEn']}
              </Badge>
              <Badge variant="secondary">
                {category?.[isArabic ? 'labelAr' : 'labelEn']}
              </Badge>
              {request.urgency === 'urgent' && (
                <Badge className="bg-red-100 text-red-700">
                  <Clock className="h-3 w-3 mr-1" />
                  {urgency?.[isArabic ? 'labelAr' : 'labelEn']}
                </Badge>
              )}
            </div>

            <h3 className="font-semibold mb-1">{request.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {request.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {request.budgetMin || request.budgetMax ? (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {t.budget}: AED {request.budgetMin || 0} - {request.budgetMax || 'Open'}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {request.bidCount || 0} bids
              </span>
            </div>
          </div>

          <Link href={`/${locale}/dashboard/firm/requests/${request.id}?firmId=${firmId}`}>
            <Button size="sm">
              <Send className="h-4 w-4 mr-2" />
              {t.bid}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function BidCard({
  bid,
  locale,
  t,
}: {
  bid: RequestBid & { request_title?: string };
  locale: Locale;
  t: typeof translations.en;
}) {
  const isArabic = locale === 'ar';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={bidStatusColors[bid.status] || 'bg-gray-100'}>
                {bid.status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                {bid.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                {bid.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                {t[bid.status as keyof typeof t] || bid.status}
              </Badge>
            </div>
            <h3 className="font-semibold">{(bid as any).request_title || 'Service Request'}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span>{t.bidAmount}: AED {bid.bidAmount.toLocaleString()}</span>
              <span>Delivery: {bid.deliveryDays} days</span>
            </div>
          </div>
          <Link href={`/${locale}/dashboard/firm/bids/${bid.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              {t.viewDetails}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-700',
    active: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-cyan-100 text-cyan-700',
    under_review: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    disputed: 'bg-red-100 text-red-700',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusColors[engagement.status] || 'bg-gray-100'}>
                {t[engagement.status as keyof typeof t] || engagement.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {engagement.engagementNumber}
              </span>
            </div>
            <h3 className="font-semibold">{engagement.requestTitle || 'Service Engagement'}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span>{serviceType?.[isArabic ? 'labelAr' : 'labelEn']}</span>
              <span>AED {engagement.agreedAmount.toLocaleString()}</span>
            </div>
          </div>
          <Link href={`/${locale}/dashboard/firm/engagements/${engagement.id}`}>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FirmDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const isArabic = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.en;

  const { data: firmData, isLoading: firmLoading } = useMyFirm();
  const { data: bidsData, isLoading: bidsLoading } = useMyFirmBids();
  const { data: engagementsData, isLoading: engagementsLoading } = useMyFirmEngagements();
  const { data: requestsData, isLoading: requestsLoading } = useOpenRequests({ limit: 5 });

  const firm = firmData?.data?.firm;
  const membership = firmData?.data?.membership;
  const bids = bidsData?.data?.bids || [];
  const engagements = engagementsData?.data?.engagements || [];
  const openRequests = requestsData?.data?.requests || [];

  // Loading state
  if (firmLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 max-w-6xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  // Not a firm member
  if (!firm) {
    return (
      <div className="min-h-screen bg-muted/30 py-12" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t.notMember}</h1>
          <p className="text-muted-foreground mb-6">{t.notMemberDesc}</p>
          <div className="flex gap-3 justify-center">
            <Link href={`/${locale}/dashboard/firms/register`}>
              <Button>{t.registerFirm}</Button>
            </Link>
            <Link href={`/${locale}/firms`}>
              <Button variant="outline">{t.browseFirms}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingBidsCount = bids.filter(b => b.status === 'pending').length;
  const activeEngagements = engagements.filter(e => ['active', 'in_progress'].includes(e.status)).length;
  const totalEarnings = engagements
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + e.firmPayout, 0);

  return (
    <div className="min-h-screen bg-muted/30 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{isArabic && (firm as any).nameAr ? (firm as any).nameAr : (firm as any).name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={(firm as any).isVerified ? 'default' : 'secondary'}>
                  {(firm as any).isVerified ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t.verified}
                    </>
                  ) : (
                    t.pendingVerification
                  )}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {membership?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={t.totalEarnings}
            value={`AED ${totalEarnings.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title={t.activeCases}
            value={activeEngagements}
            icon={Briefcase}
          />
          <StatCard
            title={t.pendingBids}
            value={pendingBidsCount}
            icon={Send}
          />
          <StatCard
            title={t.avgRating}
            value="4.8"
            icon={Star}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList>
            <TabsTrigger value="opportunities">{t.opportunities}</TabsTrigger>
            <TabsTrigger value="bids">{t.myBids}</TabsTrigger>
            <TabsTrigger value="engagements">{t.engagements}</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{t.openRequests}</h2>
                <p className="text-sm text-muted-foreground">{t.openRequestsDesc}</p>
              </div>
              <Link href={`/${locale}/dashboard/firm/opportunities`}>
                <Button variant="outline" size="sm">
                  {t.viewAll}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {requestsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : openRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">{t.noOpportunities}</h3>
                <p className="text-muted-foreground">{t.noOpportunitiesDesc}</p>
              </Card>
            ) : (
              openRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  locale={locale}
                  t={t}
                  firmId={(firm as any).id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="bids" className="space-y-4">
            {bidsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : bids.length === 0 ? (
              <Card className="p-8 text-center">
                <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">{t.noBids}</h3>
                <p className="text-muted-foreground">{t.noBidsDesc}</p>
              </Card>
            ) : (
              bids.map((bid) => (
                <BidCard key={bid.id} bid={bid} locale={locale} t={t} />
              ))
            )}
          </TabsContent>

          <TabsContent value="engagements" className="space-y-4">
            {engagementsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : engagements.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">{t.noEngagements}</h3>
                <p className="text-muted-foreground">{t.noEngagementsDesc}</p>
              </Card>
            ) : (
              engagements.map((engagement) => (
                <EngagementCard key={engagement.id} engagement={engagement} locale={locale} t={t} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
