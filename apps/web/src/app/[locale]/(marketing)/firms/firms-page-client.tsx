'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  CheckCircle2,
  Building2,
  Users,
  Clock,
  Filter,
  X,
  ChevronDown,
  Award,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirms, useAnchorPartner } from '@/hooks/useFirms';
import {
  LEGAL_CATEGORIES,
  EMIRATES,
  FIRM_SIZES,
  type LawFirm,
  type FirmSize,
} from '@/lib/firms';
import type { Locale } from '@/i18n';

interface FirmsPageClientProps {
  locale: Locale;
}

const translations = {
  en: {
    title: 'Find the Right Law Firm',
    subtitle: 'Browse verified law firms in UAE for your legal needs',
    searchPlaceholder: 'Search by firm name or specialization...',
    filters: 'Filters',
    clearFilters: 'Clear',
    category: 'Practice Area',
    emirate: 'Location',
    firmSize: 'Firm Size',
    minRating: 'Min Rating',
    verifiedOnly: 'Verified Only',
    allCategories: 'All Practice Areas',
    allLocations: 'All Emirates',
    allSizes: 'All Sizes',
    anyRating: 'Any Rating',
    noFirms: 'No law firms found',
    noFirmsDesc: 'Try adjusting your search or filters',
    viewProfile: 'View Profile',
    reviews: 'reviews',
    cases: 'cases',
    lawyers: 'lawyers',
    responseTime: 'Responds in',
    hours: 'hrs',
    verified: 'Verified',
    anchorPartner: 'Anchor Partner',
    featured: 'Featured',
    from: 'From',
    consultation: 'consultation',
    registerFirm: 'Register Your Firm',
    needLegalHelp: 'Need legal help?',
    postRequest: 'Post a Request',
    getQuotes: 'Get quotes from multiple firms',
  },
  ar: {
    title: 'اعثر على مكتب المحاماة المناسب',
    subtitle: 'تصفح مكاتب المحاماة الموثقة في الإمارات لاحتياجاتك القانونية',
    searchPlaceholder: 'ابحث باسم المكتب أو التخصص...',
    filters: 'الفلاتر',
    clearFilters: 'مسح',
    category: 'مجال الممارسة',
    emirate: 'الموقع',
    firmSize: 'حجم المكتب',
    minRating: 'الحد الأدنى للتقييم',
    verifiedOnly: 'الموثقين فقط',
    allCategories: 'جميع المجالات',
    allLocations: 'جميع الإمارات',
    allSizes: 'جميع الأحجام',
    anyRating: 'أي تقييم',
    noFirms: 'لا توجد مكاتب محاماة',
    noFirmsDesc: 'حاول تعديل البحث أو الفلاتر',
    viewProfile: 'عرض الملف',
    reviews: 'تقييم',
    cases: 'قضية',
    lawyers: 'محامي',
    responseTime: 'يرد خلال',
    hours: 'ساعة',
    verified: 'موثق',
    anchorPartner: 'شريك رئيسي',
    featured: 'مميز',
    from: 'من',
    consultation: 'استشارة',
    registerFirm: 'سجّل مكتبك',
    needLegalHelp: 'تحتاج مساعدة قانونية؟',
    postRequest: 'أرسل طلب',
    getQuotes: 'احصل على عروض من عدة مكاتب',
  },
};

function FirmCard({ firm, locale, t }: { firm: LawFirm; locale: Locale; t: typeof translations.en }) {
  const isArabic = locale === 'ar';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            {firm.logoUrl ? (
              <img src={firm.logoUrl} alt={firm.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/${locale}/firms/${firm.slug || firm.id}`}
                  className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
                >
                  {isArabic && firm.nameAr ? firm.nameAr : firm.name}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {firm.emirate && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {EMIRATES.find(e => e.value === firm.emirate)?.[isArabic ? 'labelAr' : 'labelEn'] || firm.emirate}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {firm.totalLawyers} {t.lawyers}
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1">
                {firm.isAnchorPartner && (
                  <Badge variant="default" className="bg-amber-500">
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
                {firm.isFeatured && !firm.isAnchorPartner && (
                  <Badge variant="outline">{t.featured}</Badge>
                )}
              </div>
            </div>

            {/* Specializations */}
            {firm.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {firm.specializations.slice(0, 3).map((spec) => {
                  const category = LEGAL_CATEGORIES.find(c => c.value === spec);
                  return (
                    <Badge key={spec} variant="outline" className="text-xs">
                      {category ? (isArabic ? category.labelAr : category.labelEn) : spec}
                    </Badge>
                  );
                })}
                {firm.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{firm.specializations.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-4 text-sm">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{firm.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({firm.totalReviews} {t.reviews})</span>
              </div>

              {/* Cases */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{firm.totalCasesCompleted} {t.cases}</span>
              </div>

              {/* Response Time */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{t.responseTime} {firm.responseTimeHours} {t.hours}</span>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              {firm.minConsultationFee ? (
                <div className="text-sm">
                  <span className="text-muted-foreground">{t.from} </span>
                  <span className="font-semibold text-lg">AED {firm.minConsultationFee}</span>
                  <span className="text-muted-foreground"> / {t.consultation}</span>
                </div>
              ) : (
                <div></div>
              )}
              <Link href={`/${locale}/firms/${firm.slug || firm.id}`}>
                <Button size="sm">{t.viewProfile}</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FirmCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between pt-4 border-t">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FirmsPageClient({ locale }: FirmsPageClientProps) {
  const isArabic = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [emirate, setEmirate] = useState<string>('');
  const [firmSize, setFirmSize] = useState<FirmSize | ''>('');
  const [minRating, setMinRating] = useState<number | undefined>();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useFirms({
    search: search || undefined,
    category: category || undefined,
    emirate: emirate || undefined,
    firmSize: firmSize || undefined,
    minRating,
    verifiedOnly,
    limit: 20,
  });

  const { data: anchorData } = useAnchorPartner();

  const firms = data?.data?.firms || [];
  const hasFilters = category || emirate || firmSize || minRating || verifiedOnly;

  const clearFilters = () => {
    setCategory('');
    setEmirate('');
    setFirmSize('');
    setMinRating(undefined);
    setVerifiedOnly(false);
  };

  return (
    <div className="min-h-screen bg-muted/30" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.title}</h1>
            <p className="text-lg text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary text-primary-foreground' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t.filters}
              {hasFilters && (
                <Badge variant="secondary" className="ml-2">{Object.values({ category, emirate, firmSize, minRating, verifiedOnly }).filter(Boolean).length}</Badge>
              )}
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                {t.clearFilters}
              </Button>
            )}
            <div className="flex-1" />
            <Link href={`/${locale}/dashboard/firms/register`}>
              <Button variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                {t.registerFirm}
              </Button>
            </Link>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-background rounded-lg border grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.category}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.allCategories} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t.allCategories}</SelectItem>
                    {LEGAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {isArabic ? cat.labelAr : cat.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.emirate}</label>
                <Select value={emirate} onValueChange={setEmirate}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.allLocations} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t.allLocations}</SelectItem>
                    {EMIRATES.map((em) => (
                      <SelectItem key={em.value} value={em.value}>
                        {isArabic ? em.labelAr : em.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.firmSize}</label>
                <Select value={firmSize} onValueChange={(v) => setFirmSize(v as FirmSize | '')}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.allSizes} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t.allSizes}</SelectItem>
                    {FIRM_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {isArabic ? size.labelAr : size.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.minRating}</label>
                <Select
                  value={minRating?.toString() || ''}
                  onValueChange={(v) => setMinRating(v ? parseFloat(v) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.anyRating} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t.anyRating}</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {isLoading ? (
              <>
                <FirmCardSkeleton />
                <FirmCardSkeleton />
                <FirmCardSkeleton />
              </>
            ) : firms.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t.noFirms}</h3>
                <p className="text-muted-foreground">{t.noFirmsDesc}</p>
              </Card>
            ) : (
              firms.map((firm) => (
                <FirmCard key={firm.id} firm={firm} locale={locale} t={t} />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA Card */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{t.needLegalHelp}</h3>
                <p className="text-sm opacity-90 mb-4">{t.getQuotes}</p>
                <Link href={`/${locale}/dashboard/requests/new`}>
                  <Button variant="secondary" className="w-full">
                    {t.postRequest}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Anchor Partner Card */}
            {anchorData?.data?.anchor && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold">{t.anchorPartner}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      {anchorData.data.anchor.firm.logoUrl ? (
                        <img
                          src={anchorData.data.anchor.firm.logoUrl}
                          alt={anchorData.data.anchor.firm.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/${locale}/firms/${anchorData.data.anchor.firm.slug || anchorData.data.anchor.firm.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {isArabic && anchorData.data.anchor.firm.nameAr
                          ? anchorData.data.anchor.firm.nameAr
                          : anchorData.data.anchor.firm.name}
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{anchorData.data.anchor.firm.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
