'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Star,
  CheckCircle2,
  Building2,
  Users,
  Clock,
  Phone,
  Mail,
  Globe,
  Award,
  Briefcase,
  MessageSquare,
  Calendar,
  Shield,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useFirm, useFirmReviews } from '@/hooks/useFirms';
import {
  LEGAL_CATEGORIES,
  EMIRATES,
  type FirmReview,
} from '@/lib/firms';
import type { Locale } from '@/i18n';

interface FirmProfileClientProps {
  locale: Locale;
  slug: string;
}

const translations = {
  en: {
    back: 'Back to Firms',
    loading: 'Loading...',
    notFound: 'Firm not found',
    notFoundDesc: 'The law firm you are looking for does not exist.',
    verified: 'Verified',
    anchorPartner: 'Anchor Partner',
    featured: 'Featured',
    overview: 'Overview',
    services: 'Services',
    reviews: 'Reviews',
    contact: 'Contact',
    about: 'About',
    specializations: 'Practice Areas',
    stats: 'Statistics',
    totalCases: 'Cases Completed',
    totalReviews: 'Reviews',
    avgRating: 'Average Rating',
    responseTime: 'Response Time',
    hours: 'hours',
    lawyers: 'Lawyers',
    established: 'Established',
    contactInfo: 'Contact Information',
    getConsultation: 'Get a Consultation',
    requestQuote: 'Request Quote',
    fromPrice: 'From',
    perConsultation: 'per consultation',
    ratings: 'Ratings Breakdown',
    communication: 'Communication',
    expertise: 'Expertise',
    timeliness: 'Timeliness',
    value: 'Value for Money',
    noReviews: 'No reviews yet',
    noReviewsDesc: 'Be the first to review this firm',
    verifiedClient: 'Verified Client',
    showMore: 'Show More',
    showLess: 'Show Less',
  },
  ar: {
    back: 'العودة إلى المكاتب',
    loading: 'جاري التحميل...',
    notFound: 'المكتب غير موجود',
    notFoundDesc: 'مكتب المحاماة الذي تبحث عنه غير موجود.',
    verified: 'موثق',
    anchorPartner: 'شريك رئيسي',
    featured: 'مميز',
    overview: 'نظرة عامة',
    services: 'الخدمات',
    reviews: 'التقييمات',
    contact: 'التواصل',
    about: 'عن المكتب',
    specializations: 'مجالات الممارسة',
    stats: 'الإحصائيات',
    totalCases: 'القضايا المنجزة',
    totalReviews: 'التقييمات',
    avgRating: 'متوسط التقييم',
    responseTime: 'وقت الاستجابة',
    hours: 'ساعات',
    lawyers: 'محامين',
    established: 'تأسس',
    contactInfo: 'معلومات التواصل',
    getConsultation: 'احصل على استشارة',
    requestQuote: 'اطلب عرض سعر',
    fromPrice: 'من',
    perConsultation: 'للاستشارة',
    ratings: 'تفاصيل التقييمات',
    communication: 'التواصل',
    expertise: 'الخبرة',
    timeliness: 'الالتزام بالوقت',
    value: 'القيمة مقابل السعر',
    noReviews: 'لا توجد تقييمات بعد',
    noReviewsDesc: 'كن أول من يقيم هذا المكتب',
    verifiedClient: 'عميل موثق',
    showMore: 'عرض المزيد',
    showLess: 'عرض أقل',
  },
};

function ReviewCard({ review, locale, t }: { review: FirmReview; locale: Locale; t: typeof translations.en }) {
  const [expanded, setExpanded] = useState(false);
  const isArabic = locale === 'ar';
  const reviewText = review.reviewText || '';
  const shouldTruncate = reviewText.length > 200;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.reviewerName || 'Anonymous'}</span>
              {review.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t.verifiedClient}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {new Date(review.createdAt).toLocaleDateString(isArabic ? 'ar-AE' : 'en-AE')}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.overallRating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
              />
            ))}
          </div>
        </div>

        {review.title && (
          <h4 className="font-medium mb-2">{review.title}</h4>
        )}

        {reviewText && (
          <p className="text-sm text-muted-foreground">
            {shouldTruncate && !expanded ? `${reviewText.slice(0, 200)}...` : reviewText}
          </p>
        )}

        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 p-0 h-auto"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                {t.showLess}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {t.showMore}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function RatingBar({ label, value, max = 5 }: { label: string; value?: number; max?: number }) {
  const percentage = value ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-28 text-muted-foreground">{label}</span>
      <Progress value={percentage} className="flex-1 h-2" />
      <span className="text-sm font-medium w-8">{value?.toFixed(1) || '-'}</span>
    </div>
  );
}

export function FirmProfileClient({ locale, slug }: FirmProfileClientProps) {
  const isArabic = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.en;

  const { data, isLoading, error } = useFirm(slug);
  const { data: reviewsData, isLoading: reviewsLoading } = useFirmReviews(
    data?.data?.firm?.id || '',
    1,
    10
  );

  const firm = data?.data?.firm;
  const reviews = reviewsData?.data?.reviews || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="min-h-screen bg-muted/30 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 text-center py-16">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t.notFound}</h1>
          <p className="text-muted-foreground mb-6">{t.notFoundDesc}</p>
          <Link href={`/${locale}/firms`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/${locale}/firms`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-background py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-xl flex items-center justify-center">
              {firm.logoUrl ? (
                <img src={firm.logoUrl} alt={firm.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Building2 className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {isArabic && firm.nameAr ? firm.nameAr : firm.name}
                </h1>
                {firm.isAnchorPartner && (
                  <Badge className="bg-amber-500">
                    <Award className="h-3 w-3 mr-1" />
                    {t.anchorPartner}
                  </Badge>
                )}
                {firm.isVerified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t.verified}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {firm.emirate && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {EMIRATES.find(e => e.value === firm.emirate)?.[isArabic ? 'labelAr' : 'labelEn']}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {firm.totalLawyers} {t.lawyers}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {t.responseTime}: {firm.responseTimeHours} {t.hours}
                </span>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-bold">{firm.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">
                  ({firm.totalReviews} {t.reviews.toLowerCase()})
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  {firm.totalCasesCompleted} {t.totalCases.toLowerCase()}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2">
              {firm.minConsultationFee && (
                <div className="text-right mb-2">
                  <span className="text-sm text-muted-foreground">{t.fromPrice}</span>
                  <div className="text-2xl font-bold">AED {firm.minConsultationFee}</div>
                  <span className="text-sm text-muted-foreground">{t.perConsultation}</span>
                </div>
              )}
              <Link href={`/${locale}/dashboard/requests/new?firm=${firm.id}`}>
                <Button size="lg" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t.getConsultation}
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                {t.requestQuote}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">{t.overview}</TabsTrigger>
                <TabsTrigger value="reviews">
                  {t.reviews} ({firm.totalReviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About */}
                {(firm.description || firm.descriptionAr) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t.about}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {isArabic && firm.descriptionAr ? firm.descriptionAr : firm.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Specializations */}
                {firm.specializations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t.specializations}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {firm.specializations.map((spec) => {
                          const category = LEGAL_CATEGORIES.find(c => c.value === spec);
                          return (
                            <Badge key={spec} variant="secondary" className="text-sm py-1.5 px-3">
                              {category ? (isArabic ? category.labelAr : category.labelEn) : spec}
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t.stats}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Briefcase className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{firm.totalCasesCompleted}</div>
                        <div className="text-sm text-muted-foreground">{t.totalCases}</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{firm.totalReviews}</div>
                        <div className="text-sm text-muted-foreground">{t.totalReviews}</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Star className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                        <div className="text-2xl font-bold">{firm.averageRating.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">{t.avgRating}</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{firm.responseTimeHours}h</div>
                        <div className="text-sm text-muted-foreground">{t.responseTime}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {/* Rating Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t.ratings}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <RatingBar label={t.communication} value={4.8} />
                    <RatingBar label={t.expertise} value={4.9} />
                    <RatingBar label={t.timeliness} value={4.7} />
                    <RatingBar label={t.value} value={4.6} />
                  </CardContent>
                </Card>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <Card className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">{t.noReviews}</h3>
                    <p className="text-muted-foreground">{t.noReviewsDesc}</p>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} locale={locale} t={t} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t.contactInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {firm.phone && (
                  <a
                    href={`tel:${firm.phone}`}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <span>{firm.phone}</span>
                  </a>
                )}
                {firm.email && (
                  <a
                    href={`mailto:${firm.email}`}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="truncate">{firm.email}</span>
                  </a>
                )}
                {firm.emirate && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>
                      {EMIRATES.find(e => e.value === firm.emirate)?.[isArabic ? 'labelAr' : 'labelEn']}, UAE
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="p-4 space-y-3">
                {firm.isVerified && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Verified Firm</div>
                      <div className="text-sm text-muted-foreground">Identity confirmed</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ThumbsUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Money Back Guarantee</div>
                    <div className="text-sm text-muted-foreground">If not satisfied</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Fast Response</div>
                    <div className="text-sm text-muted-foreground">Within {firm.responseTimeHours} hours</div>
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
