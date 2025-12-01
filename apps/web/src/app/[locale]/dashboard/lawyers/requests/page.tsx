'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Scale,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Star,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Eye,
  XCircle,
  Loader2,
  PartyPopper,
  ArrowRight,
} from 'lucide-react';

interface QuoteRequest {
  id: string;
  documentTitle: string;
  documentType: string;
  serviceType: string;
  urgency: string;
  status: 'open' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  expiresAt: string;
  quotesCount: number;
  selectedQuoteId?: string;
}

interface Quote {
  id: string;
  requestId: string;
  lawyerId: string;
  lawyerName: string;
  lawyerTitle: string;
  lawyerRating: number;
  lawyerReviews: number;
  amount: number;
  currency: string;
  estimatedDays: number;
  coverLetter: string;
  status: 'pending' | 'viewed' | 'accepted' | 'rejected';
  createdAt: string;
}

// Mock data
const mockRequests: QuoteRequest[] = [
  {
    id: 'qr_1',
    documentTitle: 'Property Sale Agreement',
    documentType: 'rental_agreement',
    serviceType: 'review',
    urgency: 'standard',
    status: 'quoted',
    createdAt: '2024-01-20T10:00:00',
    expiresAt: '2024-01-27T10:00:00',
    quotesCount: 3,
  },
  {
    id: 'qr_2',
    documentTitle: 'Employment Contract',
    documentType: 'employment_contract',
    serviceType: 'certify',
    urgency: 'urgent',
    status: 'in_progress',
    createdAt: '2024-01-18T14:00:00',
    expiresAt: '2024-01-25T14:00:00',
    quotesCount: 2,
    selectedQuoteId: 'quote_4',
  },
  {
    id: 'qr_3',
    documentTitle: 'Service Agreement - Marketing',
    documentType: 'service_agreement',
    serviceType: 'review',
    urgency: 'standard',
    status: 'open',
    createdAt: '2024-01-15T09:00:00',
    expiresAt: '2024-01-22T09:00:00',
    quotesCount: 0,
  },
];

const mockQuotes: Quote[] = [
  {
    id: 'quote_1',
    requestId: 'qr_1',
    lawyerId: 'lawyer_1',
    lawyerName: 'Ahmed Al-Mahmoud',
    lawyerTitle: 'Senior Legal Consultant',
    lawyerRating: 4.9,
    lawyerReviews: 127,
    amount: 800,
    currency: 'AED',
    estimatedDays: 3,
    coverLetter: 'I have extensive experience with property agreements and can provide a thorough review...',
    status: 'viewed',
    createdAt: '2024-01-20T12:00:00',
  },
  {
    id: 'quote_2',
    requestId: 'qr_1',
    lawyerId: 'lawyer_2',
    lawyerName: 'Sarah Khan',
    lawyerTitle: 'Legal Consultant',
    lawyerRating: 4.8,
    lawyerReviews: 89,
    amount: 650,
    currency: 'AED',
    estimatedDays: 4,
    coverLetter: 'I specialize in real estate transactions and would be happy to review your agreement...',
    status: 'pending',
    createdAt: '2024-01-20T14:00:00',
  },
  {
    id: 'quote_3',
    requestId: 'qr_1',
    lawyerId: 'lawyer_4',
    lawyerName: 'Fatima Al-Zaabi',
    lawyerTitle: 'Corporate Counsel',
    lawyerRating: 4.9,
    lawyerReviews: 72,
    amount: 1200,
    currency: 'AED',
    estimatedDays: 2,
    coverLetter: 'With my background in DIFC transactions, I can ensure your agreement meets all requirements...',
    status: 'pending',
    createdAt: '2024-01-20T16:00:00',
  },
];

export default function MyRequestsPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const translations = {
    title: isArabic ? 'طلباتي' : 'My Requests',
    subtitle: isArabic ? 'تتبع طلبات المراجعة وعروض الأسعار' : 'Track your review requests and quotes',
    all: isArabic ? 'الكل' : 'All',
    open: isArabic ? 'مفتوح' : 'Open',
    quoted: isArabic ? 'تم التسعير' : 'Quoted',
    inProgress: isArabic ? 'قيد التنفيذ' : 'In Progress',
    completed: isArabic ? 'مكتمل' : 'Completed',
    noRequests: isArabic ? 'لا توجد طلبات' : 'No requests yet',
    startNow: isArabic ? 'ابدأ بطلب مراجعة لمستندك' : 'Start by requesting a review for your document',
    findLawyer: isArabic ? 'البحث عن محامٍ' : 'Find a Lawyer',
    viewQuotes: isArabic ? 'عرض العروض' : 'View Quotes',
    quotes: isArabic ? 'عرض' : 'quotes',
    noQuotes: isArabic ? 'لا توجد عروض بعد' : 'No quotes yet',
    waiting: isArabic ? 'في انتظار عروض المحامين' : 'Waiting for lawyer quotes',
    expires: isArabic ? 'ينتهي' : 'Expires',
    review: isArabic ? 'مراجعة' : 'Review',
    certify: isArabic ? 'توثيق' : 'Certification',
    consult: isArabic ? 'استشارة' : 'Consultation',
    standard: isArabic ? 'عادي' : 'Standard',
    urgent: isArabic ? 'عاجل' : 'Urgent',
    express: isArabic ? 'سريع' : 'Express',
    acceptQuote: isArabic ? 'قبول العرض' : 'Accept Quote',
    viewDetails: isArabic ? 'عرض التفاصيل' : 'View Details',
    estimatedDelivery: isArabic ? 'التسليم المتوقع' : 'Est. delivery',
    days: isArabic ? 'أيام' : 'days',
    requestSubmitted: isArabic ? 'تم إرسال الطلب بنجاح!' : 'Request submitted successfully!',
    lawyersNotified: isArabic ? 'سيتم إخطار المحامين وستتلقى عروض الأسعار قريباً' : 'Lawyers will be notified and you will receive quotes soon',
  };

  const getStatusBadge = (status: QuoteRequest['status']) => {
    const styles = {
      open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      quoted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      accepted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      in_progress: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };

    const labels = {
      open: translations.open,
      quoted: translations.quoted,
      accepted: isArabic ? 'مقبول' : 'Accepted',
      in_progress: translations.inProgress,
      completed: translations.completed,
      cancelled: isArabic ? 'ملغي' : 'Cancelled',
    };

    return (
      <Badge className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getServiceLabel = (service: string) => {
    const labels: Record<string, string> = {
      review: translations.review,
      certify: translations.certify,
      consult: translations.consult,
    };
    return labels[service] || service;
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'urgent') {
      return <Badge variant="destructive" className="text-[10px]">{translations.urgent}</Badge>;
    }
    if (urgency === 'express') {
      return <Badge className="bg-purple-500 text-[10px]">{translations.express}</Badge>;
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredRequests = mockRequests.filter((req) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return req.status === 'open';
    if (activeTab === 'quoted') return req.status === 'quoted';
    if (activeTab === 'in_progress') return ['accepted', 'in_progress'].includes(req.status);
    if (activeTab === 'completed') return req.status === 'completed';
    return true;
  });

  const getQuotesForRequest = (requestId: string) => {
    return mockQuotes.filter((q) => q.requestId === requestId);
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {showSuccess && (
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 animate-in slide-in-from-top-2">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <PartyPopper className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">
                {translations.requestSubmitted}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {translations.lawyersNotified}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            {translations.title}
          </h1>
          <p className="text-muted-foreground mt-1">{translations.subtitle}</p>
        </div>

        <Link href={`/${locale}/dashboard/lawyers`}>
          <Button className="gap-2">
            <Scale className="h-4 w-4" />
            {translations.findLawyer}
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{translations.all}</TabsTrigger>
          <TabsTrigger value="open">{translations.open}</TabsTrigger>
          <TabsTrigger value="quoted">{translations.quoted}</TabsTrigger>
          <TabsTrigger value="in_progress">{translations.inProgress}</TabsTrigger>
          <TabsTrigger value="completed">{translations.completed}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">{translations.noRequests}</h3>
              <p className="text-muted-foreground mt-1 mb-4">{translations.startNow}</p>
              <Link href={`/${locale}/dashboard/lawyers`}>
                <Button>
                  <Scale className="h-4 w-4 me-2" />
                  {translations.findLawyer}
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const quotes = getQuotesForRequest(request.id);

                return (
                  <Card key={request.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Request Header */}
                      <div className="p-5 border-b">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.documentTitle}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px]">
                                  {getServiceLabel(request.serviceType)}
                                </Badge>
                                {getUrgencyBadge(request.urgency)}
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(request.status)}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {translations.expires} {formatDate(request.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quotes Section */}
                      {request.status === 'open' && request.quotesCount === 0 ? (
                        <div className="p-5 bg-muted/30 text-center">
                          <Loader2 className="h-6 w-6 mx-auto text-muted-foreground animate-spin mb-2" />
                          <p className="text-sm text-muted-foreground">{translations.waiting}</p>
                        </div>
                      ) : quotes.length > 0 ? (
                        <div className="p-5 bg-muted/30 space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            {quotes.length} {translations.quotes}
                          </p>

                          {quotes.slice(0, 2).map((quote) => (
                            <div
                              key={quote.id}
                              className="flex items-center justify-between p-4 bg-background rounded-xl border"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                  {quote.lawyerName.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-medium">{quote.lawyerName}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    {quote.lawyerRating}
                                    <span>·</span>
                                    {translations.estimatedDelivery}: {quote.estimatedDays} {translations.days}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-end">
                                  <p className="font-semibold text-lg text-primary">
                                    {quote.amount} {quote.currency}
                                  </p>
                                </div>
                                <Button size="sm" className="gap-1">
                                  {translations.acceptQuote}
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          {quotes.length > 2 && (
                            <Button variant="outline" className="w-full">
                              {translations.viewQuotes} ({quotes.length})
                              <ArrowRight className="h-4 w-4 ms-2" />
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
