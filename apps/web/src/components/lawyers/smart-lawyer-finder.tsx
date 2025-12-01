'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Scale,
  Search,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  Briefcase,
  Globe,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Filter,
  Target,
  MessageSquare,
  Video,
  TrendingUp,
  Shield,
  Award,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';

interface MatchPreferences {
  documentType?: string;
  specialization?: string;
  emirate?: string;
  languages?: string[];
  budgetMin?: number;
  budgetMax?: number;
  urgency?: 'standard' | 'urgent' | 'express';
  preferVerified?: boolean;
  preferFeatured?: boolean;
  caseComplexity?: 'simple' | 'moderate' | 'complex';
}

interface MatchScore {
  totalScore: number;
  breakdown: {
    specializationScore: number;
    locationScore: number;
    languageScore: number;
    budgetScore: number;
    responseTimeScore: number;
    performanceScore: number;
    availabilityScore: number;
    experienceScore: number;
  };
  matchReasons: string[];
  compatibilityLevel: 'excellent' | 'good' | 'fair' | 'low';
}

interface MatchExplanation {
  title: string;
  description: string;
  highlights: string[];
}

interface MatchedLawyer {
  id: string;
  first_name: string;
  last_name: string;
  specializations: string[];
  languages: string[];
  emirate: string;
  consultation_fee: number;
  hourly_rate: number;
  response_time_hours: number;
  average_rating: number;
  total_reviews: number;
  total_cases_completed: number;
  success_rate: number;
  verification_level: string;
  is_available: boolean;
  featured: boolean;
  years_experience: number;
  matchScore: MatchScore;
  matchExplanation: MatchExplanation;
}

const documentTypes = [
  { id: 'rental_agreement', name: 'Rental Agreement', nameAr: 'عقد إيجار' },
  { id: 'sale_agreement', name: 'Sale Agreement', nameAr: 'عقد بيع' },
  { id: 'employment_contract', name: 'Employment Contract', nameAr: 'عقد عمل' },
  { id: 'nda', name: 'Non-Disclosure Agreement', nameAr: 'اتفاقية عدم إفشاء' },
  { id: 'service_agreement', name: 'Service Agreement', nameAr: 'اتفاقية خدمة' },
  { id: 'partnership_agreement', name: 'Partnership Agreement', nameAr: 'اتفاقية شراكة' },
  { id: 'power_of_attorney', name: 'Power of Attorney', nameAr: 'توكيل رسمي' },
  { id: 'will', name: 'Will/Testament', nameAr: 'وصية' },
  { id: 'commercial_lease', name: 'Commercial Lease', nameAr: 'إيجار تجاري' },
];

const specializations = [
  { id: 'real_estate', name: 'Real Estate', nameAr: 'العقارات' },
  { id: 'corporate', name: 'Corporate & Business', nameAr: 'الشركات والأعمال' },
  { id: 'employment', name: 'Employment & Labor', nameAr: 'العمل والتوظيف' },
  { id: 'family', name: 'Family Law', nameAr: 'قانون الأسرة' },
  { id: 'contracts', name: 'Contracts', nameAr: 'العقود' },
  { id: 'banking', name: 'Banking & Finance', nameAr: 'البنوك والتمويل' },
  { id: 'immigration', name: 'Immigration', nameAr: 'الهجرة والإقامة' },
  { id: 'intellectual_property', name: 'Intellectual Property', nameAr: 'الملكية الفكرية' },
];

const emirates = [
  { id: 'dubai', name: 'Dubai', nameAr: 'دبي' },
  { id: 'abu_dhabi', name: 'Abu Dhabi', nameAr: 'أبوظبي' },
  { id: 'sharjah', name: 'Sharjah', nameAr: 'الشارقة' },
  { id: 'ajman', name: 'Ajman', nameAr: 'عجمان' },
  { id: 'ras_al_khaimah', name: 'Ras Al Khaimah', nameAr: 'رأس الخيمة' },
  { id: 'fujairah', name: 'Fujairah', nameAr: 'الفجيرة' },
  { id: 'umm_al_quwain', name: 'Umm Al Quwain', nameAr: 'أم القيوين' },
];

const languages = [
  { id: 'en', name: 'English', nameAr: 'الإنجليزية' },
  { id: 'ar', name: 'Arabic', nameAr: 'العربية' },
  { id: 'ur', name: 'Urdu', nameAr: 'الأردية' },
  { id: 'hi', name: 'Hindi', nameAr: 'الهندية' },
  { id: 'fr', name: 'French', nameAr: 'الفرنسية' },
];

interface SmartLawyerFinderProps {
  apiBaseUrl?: string;
  initialDocumentType?: string;
  onLawyerSelect?: (lawyer: MatchedLawyer) => void;
}

export function SmartLawyerFinder({
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '',
  initialDocumentType,
  onLawyerSelect,
}: SmartLawyerFinderProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lawyers, setLawyers] = useState<MatchedLawyer[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Preferences state
  const [preferences, setPreferences] = useState<MatchPreferences>({
    documentType: initialDocumentType,
    preferVerified: true,
    urgency: 'standard',
    caseComplexity: 'moderate',
  });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'ar']);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 2000]);

  const translations = {
    title: isArabic ? 'البحث الذكي عن محامي' : 'Smart Lawyer Finder',
    subtitle: isArabic
      ? 'دعنا نجد لك المحامي المناسب بناءً على احتياجاتك'
      : "Let us find the right lawyer based on your needs",
    findLawyers: isArabic ? 'البحث عن محامين' : 'Find Lawyers',
    documentType: isArabic ? 'نوع المستند' : 'Document Type',
    selectDocument: isArabic ? 'اختر نوع المستند' : 'Select document type',
    specialization: isArabic ? 'التخصص' : 'Specialization',
    selectSpecialization: isArabic ? 'اختر التخصص' : 'Select specialization',
    location: isArabic ? 'الموقع' : 'Location',
    anyLocation: isArabic ? 'أي موقع' : 'Any location',
    languages: isArabic ? 'اللغات' : 'Languages',
    budget: isArabic ? 'الميزانية' : 'Budget (AED)',
    urgency: isArabic ? 'الأولوية' : 'Urgency',
    standard: isArabic ? 'عادي' : 'Standard',
    urgent: isArabic ? 'عاجل' : 'Urgent',
    express: isArabic ? 'سريع جداً' : 'Express',
    complexity: isArabic ? 'مستوى التعقيد' : 'Complexity',
    simple: isArabic ? 'بسيط' : 'Simple',
    moderate: isArabic ? 'متوسط' : 'Moderate',
    complex: isArabic ? 'معقد' : 'Complex',
    verifiedOnly: isArabic ? 'المحامون الموثقون فقط' : 'Verified lawyers only',
    featuredFirst: isArabic ? 'المميزون أولاً' : 'Featured first',
    filters: isArabic ? 'المزيد من الفلاتر' : 'More Filters',
    hideFilters: isArabic ? 'إخفاء الفلاتر' : 'Hide Filters',
    results: isArabic ? 'نتائج' : 'results',
    noResults: isArabic ? 'لم يتم العثور على محامين مطابقين' : 'No matching lawyers found',
    tryAdjusting: isArabic ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria',
    matchScore: isArabic ? 'نسبة التوافق' : 'Match Score',
    excellent: isArabic ? 'ممتاز' : 'Excellent',
    good: isArabic ? 'جيد' : 'Good',
    fair: isArabic ? 'متوسط' : 'Fair',
    low: isArabic ? 'محدود' : 'Low',
    viewProfile: isArabic ? 'عرض الملف' : 'View Profile',
    bookConsultation: isArabic ? 'حجز استشارة' : 'Book Consultation',
    years: isArabic ? 'سنوات خبرة' : 'years exp.',
    reviews: isArabic ? 'تقييم' : 'reviews',
    successRate: isArabic ? 'نسبة النجاح' : 'success',
    respondsIn: isArabic ? 'يرد خلال' : 'Responds in',
    hours: isArabic ? 'ساعات' : 'hours',
    whyMatch: isArabic ? 'لماذا هذا التوافق؟' : 'Why this match?',
    searching: isArabic ? 'جاري البحث...' : 'Searching...',
    error: isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.',
    retry: isArabic ? 'إعادة المحاولة' : 'Retry',
    consultation: isArabic ? 'استشارة' : 'Consultation',
  };

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        ...preferences,
        languages: selectedLanguages,
        budgetMin: budgetRange[0] > 0 ? budgetRange[0] : undefined,
        budgetMax: budgetRange[1] < 2000 ? budgetRange[1] : undefined,
        limit: 10,
      };

      const response = await fetch(`${apiBaseUrl}/api/lawyers/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      if (data.success) {
        setLawyers(data.data.lawyers || []);
      } else {
        throw new Error(data.error?.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching lawyers:', err);
      setError(translations.error);
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCompatibilityLabel = (level: string) => {
    switch (level) {
      case 'excellent':
        return translations.excellent;
      case 'good':
        return translations.good;
      case 'fair':
        return translations.fair;
      default:
        return translations.low;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">{translations.title}</h2>
        </div>
        <p className="text-muted-foreground">{translations.subtitle}</p>
      </div>

      {/* Main Search Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Primary Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Document Type */}
            <div className="space-y-2">
              <Label>{translations.documentType}</Label>
              <Select
                value={preferences.documentType}
                onValueChange={(v) => setPreferences({ ...preferences, documentType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={translations.selectDocument} />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((dt) => (
                    <SelectItem key={dt.id} value={dt.id}>
                      {isArabic ? dt.nameAr : dt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label>{translations.specialization}</Label>
              <Select
                value={preferences.specialization}
                onValueChange={(v) => setPreferences({ ...preferences, specialization: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={translations.selectSpecialization} />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {isArabic ? s.nameAr : s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>{translations.location}</Label>
              <Select
                value={preferences.emirate || 'any'}
                onValueChange={(v) =>
                  setPreferences({ ...preferences, emirate: v === 'any' ? undefined : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={translations.anyLocation} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{translations.anyLocation}</SelectItem>
                  {emirates.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {isArabic ? e.nameAr : e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggle More Filters */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? translations.hideFilters : translations.filters}
          </Button>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              {/* Languages */}
              <div className="space-y-2">
                <Label>{translations.languages}</Label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Badge
                      key={lang.id}
                      variant={selectedLanguages.includes(lang.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedLanguages((prev) =>
                          prev.includes(lang.id)
                            ? prev.filter((l) => l !== lang.id)
                            : [...prev, lang.id]
                        );
                      }}
                    >
                      {isArabic ? lang.nameAr : lang.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label>
                  {translations.budget}: {budgetRange[0]} - {budgetRange[1]} AED
                </Label>
                <Slider
                  value={budgetRange}
                  onValueChange={(v) => setBudgetRange(v as [number, number])}
                  max={2000}
                  step={50}
                  className="mt-2"
                />
              </div>

              {/* Urgency */}
              <div className="space-y-2">
                <Label>{translations.urgency}</Label>
                <Select
                  value={preferences.urgency}
                  onValueChange={(v) =>
                    setPreferences({
                      ...preferences,
                      urgency: v as 'standard' | 'urgent' | 'express',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">{translations.standard}</SelectItem>
                    <SelectItem value="urgent">{translations.urgent}</SelectItem>
                    <SelectItem value="express">{translations.express}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Complexity */}
              <div className="space-y-2">
                <Label>{translations.complexity}</Label>
                <Select
                  value={preferences.caseComplexity}
                  onValueChange={(v) =>
                    setPreferences({
                      ...preferences,
                      caseComplexity: v as 'simple' | 'moderate' | 'complex',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">{translations.simple}</SelectItem>
                    <SelectItem value="moderate">{translations.moderate}</SelectItem>
                    <SelectItem value="complex">{translations.complex}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-3 md:col-span-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="verified"
                    checked={preferences.preferVerified}
                    onCheckedChange={(v) =>
                      setPreferences({ ...preferences, preferVerified: Boolean(v) })
                    }
                  />
                  <label htmlFor="verified" className="text-sm cursor-pointer">
                    {translations.verifiedOnly}
                  </label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="featured"
                    checked={preferences.preferFeatured}
                    onCheckedChange={(v) =>
                      setPreferences({ ...preferences, preferFeatured: Boolean(v) })
                    }
                  />
                  <label htmlFor="featured" className="text-sm cursor-pointer">
                    {translations.featuredFirst}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Search Button */}
          <Button onClick={fetchMatches} disabled={loading} className="w-full gap-2" size="lg">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {translations.searching}
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                {translations.findLawyers}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchMatches} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {translations.retry}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {lawyers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {lawyers.length} {translations.results}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              {isArabic ? 'مرتب حسب التوافق' : 'Sorted by match score'}
            </div>
          </div>

          <div className="space-y-4">
            {lawyers.map((lawyer, index) => (
              <Card
                key={lawyer.id}
                className={cn(
                  'relative overflow-hidden transition-all hover:shadow-lg',
                  index === 0 && 'ring-2 ring-primary/30'
                )}
              >
                {/* Match Score Badge */}
                <div className="absolute top-3 end-3 z-10">
                  <Badge
                    className={cn(
                      'gap-1 text-white',
                      getCompatibilityColor(lawyer.matchScore.compatibilityLevel)
                    )}
                  >
                    <Target className="h-3 w-3" />
                    {Math.round(lawyer.matchScore.totalScore)}% {translations.matchScore}
                  </Badge>
                </div>

                {index === 0 && (
                  <div className="absolute top-3 start-3 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 gap-1">
                      <Award className="h-3 w-3" />
                      {isArabic ? 'أفضل توافق' : 'Best Match'}
                    </Badge>
                  </div>
                )}

                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="h-16 w-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
                        {lawyer.first_name.charAt(0)}
                        {lawyer.last_name.charAt(0)}
                      </div>
                      {lawyer.verification_level !== 'none' && (
                        <div className="absolute -bottom-1 -end-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-white">
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {lawyer.first_name} {lawyer.last_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {emirates.find((e) => e.id === lawyer.emirate)?.[
                                isArabic ? 'nameAr' : 'name'
                              ] || lawyer.emirate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              {lawyer.years_experience} {translations.years}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {(Array.isArray(lawyer.languages)
                                ? lawyer.languages
                                : JSON.parse(lawyer.languages || '[]')
                              )
                                .map((l: string) => l.toUpperCase())
                                .join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{lawyer.average_rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({lawyer.total_reviews} {translations.reviews})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                          <span>{lawyer.success_rate}% {translations.successRate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Zap className="h-3.5 w-3.5" />
                          {translations.respondsIn} {lawyer.response_time_hours}h
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {translations.whyMatch}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {lawyer.matchExplanation.highlights.map((reason, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{translations.consultation}</p>
                        <p className="font-semibold">{lawyer.consultation_fee} AED</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/${locale}/dashboard/lawyers/${lawyer.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          {translations.viewProfile}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/${locale}/dashboard/lawyers/${lawyer.id}/book`}>
                        <Button size="sm" className="gap-1">
                          <Video className="h-4 w-4" />
                          {translations.bookConsultation}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && lawyers.length === 0 && !error && (
        <Card className="p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">{translations.noResults}</h3>
          <p className="text-muted-foreground mt-1">{translations.tryAdjusting}</p>
        </Card>
      )}
    </div>
  );
}
