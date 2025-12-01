'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Scale,
  Search,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  Globe,
  Briefcase,
  Building2,
  Users,
  Heart,
  Shield,
  DollarSign,
  FileText,
  ChevronRight,
  Sparkles,
  Award,
  MessageSquare,
  Phone,
  Video,
  Crown,
  Verified,
  TrendingUp,
  Zap,
} from 'lucide-react';

// Types
interface Lawyer {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  avatarUrl?: string;
  bio: string;
  yearsExperience: number;
  languages: string[];
  barAssociation: string;
  licenseVerified: boolean;
  emirate: string;
  city: string;
  specializations: string[];
  consultationFee: number;
  hourlyRate: number;
  currency: string;
  isAvailable: boolean;
  responseTimeHours: number;
  totalReviews: number;
  averageRating: number;
  totalCasesCompleted: number;
  successRate: number;
  featured: boolean;
}

interface Specialization {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
}

const specializations: Specialization[] = [
  { id: 'real_estate', name: 'Real Estate', nameAr: 'العقارات', icon: 'Building2' },
  { id: 'corporate', name: 'Corporate & Business', nameAr: 'الشركات والأعمال', icon: 'Briefcase' },
  { id: 'employment', name: 'Employment & Labor', nameAr: 'العمل والتوظيف', icon: 'Users' },
  { id: 'family', name: 'Family Law', nameAr: 'قانون الأسرة', icon: 'Heart' },
  { id: 'criminal', name: 'Criminal Law', nameAr: 'القانون الجنائي', icon: 'Shield' },
  { id: 'immigration', name: 'Immigration', nameAr: 'الهجرة والإقامة', icon: 'Globe' },
  { id: 'contracts', name: 'Contracts', nameAr: 'العقود', icon: 'FileText' },
  { id: 'banking', name: 'Banking & Finance', nameAr: 'البنوك والتمويل', icon: 'DollarSign' },
];

const emirates = [
  { id: 'dubai', name: 'Dubai', nameAr: 'دبي' },
  { id: 'abu_dhabi', name: 'Abu Dhabi', nameAr: 'أبوظبي' },
  { id: 'sharjah', name: 'Sharjah', nameAr: 'الشارقة' },
  { id: 'ajman', name: 'Ajman', nameAr: 'عجمان' },
  { id: 'rak', name: 'Ras Al Khaimah', nameAr: 'رأس الخيمة' },
  { id: 'fujairah', name: 'Fujairah', nameAr: 'الفجيرة' },
  { id: 'uaq', name: 'Umm Al Quwain', nameAr: 'أم القيوين' },
];

// Mock lawyers data
const mockLawyers: Lawyer[] = [
  {
    id: 'lawyer_1',
    firstName: 'Ahmed',
    lastName: 'Al-Mahmoud',
    title: 'Senior Legal Consultant',
    avatarUrl: undefined,
    bio: 'Specializing in real estate and corporate law with over 15 years of experience in the UAE legal system. Former legal advisor to major property developers.',
    yearsExperience: 15,
    languages: ['ar', 'en'],
    barAssociation: 'Dubai Bar Association',
    licenseVerified: true,
    emirate: 'dubai',
    city: 'Dubai Marina',
    specializations: ['real_estate', 'corporate', 'contracts'],
    consultationFee: 500,
    hourlyRate: 800,
    currency: 'AED',
    isAvailable: true,
    responseTimeHours: 2,
    totalReviews: 127,
    averageRating: 4.9,
    totalCasesCompleted: 342,
    successRate: 98,
    featured: true,
  },
  {
    id: 'lawyer_2',
    firstName: 'Sarah',
    lastName: 'Khan',
    title: 'Employment Law Specialist',
    avatarUrl: undefined,
    bio: 'Expert in UAE labor law, employment contracts, and workplace disputes. Helped hundreds of employees and employers navigate complex labor regulations.',
    yearsExperience: 8,
    languages: ['en', 'ar', 'ur'],
    barAssociation: 'Abu Dhabi Bar Association',
    licenseVerified: true,
    emirate: 'abu_dhabi',
    city: 'Al Reem Island',
    specializations: ['employment', 'corporate', 'immigration'],
    consultationFee: 350,
    hourlyRate: 600,
    currency: 'AED',
    isAvailable: true,
    responseTimeHours: 4,
    totalReviews: 89,
    averageRating: 4.8,
    totalCasesCompleted: 215,
    successRate: 96,
    featured: true,
  },
  {
    id: 'lawyer_3',
    firstName: 'Mohammed',
    lastName: 'Al-Rashid',
    title: 'Legal Advocate',
    avatarUrl: undefined,
    bio: 'Family law specialist with deep expertise in divorce, custody, and inheritance matters under UAE and Sharia law.',
    yearsExperience: 12,
    languages: ['ar', 'en'],
    barAssociation: 'Sharjah Bar Association',
    licenseVerified: true,
    emirate: 'sharjah',
    city: 'Al Majaz',
    specializations: ['family', 'civil'],
    consultationFee: 400,
    hourlyRate: 700,
    currency: 'AED',
    isAvailable: false,
    responseTimeHours: 24,
    totalReviews: 156,
    averageRating: 4.7,
    totalCasesCompleted: 428,
    successRate: 94,
    featured: false,
  },
  {
    id: 'lawyer_4',
    firstName: 'Fatima',
    lastName: 'Al-Zaabi',
    title: 'Corporate Counsel',
    avatarUrl: undefined,
    bio: 'Experienced corporate lawyer specializing in company formation, M&A, and commercial contracts across the GCC region.',
    yearsExperience: 10,
    languages: ['ar', 'en', 'fr'],
    barAssociation: 'Dubai Bar Association',
    licenseVerified: true,
    emirate: 'dubai',
    city: 'DIFC',
    specializations: ['corporate', 'banking', 'contracts'],
    consultationFee: 600,
    hourlyRate: 1000,
    currency: 'AED',
    isAvailable: true,
    responseTimeHours: 3,
    totalReviews: 72,
    averageRating: 4.9,
    totalCasesCompleted: 189,
    successRate: 99,
    featured: true,
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Briefcase,
  Users,
  Heart,
  Shield,
  Globe,
  FileText,
  DollarSign,
  Scale,
};

export default function LawyersMarketplacePage() {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState<string>('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [lawyers, setLawyers] = useState<Lawyer[]>(mockLawyers);
  const [showFilters, setShowFilters] = useState(false);

  const translations = {
    title: isArabic ? 'سوق المحامين' : 'Lawyer Marketplace',
    subtitle: isArabic
      ? 'اعثر على محامٍ معتمد لمراجعة وتوثيق مستنداتك'
      : 'Find a verified lawyer to review and certify your documents',
    search: isArabic ? 'ابحث عن محامٍ...' : 'Search for a lawyer...',
    allLocations: isArabic ? 'جميع المواقع' : 'All Locations',
    allSpecializations: isArabic ? 'جميع التخصصات' : 'All Specializations',
    sortBy: isArabic ? 'ترتيب حسب' : 'Sort by',
    rating: isArabic ? 'التقييم' : 'Rating',
    experience: isArabic ? 'الخبرة' : 'Experience',
    price: isArabic ? 'السعر' : 'Price',
    responseTime: isArabic ? 'سرعة الرد' : 'Response Time',
    filters: isArabic ? 'تصفية' : 'Filters',
    featured: isArabic ? 'مميز' : 'Featured',
    verified: isArabic ? 'موثق' : 'Verified',
    available: isArabic ? 'متاح' : 'Available',
    unavailable: isArabic ? 'غير متاح' : 'Unavailable',
    years: isArabic ? 'سنوات' : 'years',
    reviews: isArabic ? 'تقييم' : 'reviews',
    cases: isArabic ? 'قضية' : 'cases',
    successRate: isArabic ? 'نسبة النجاح' : 'success rate',
    consultation: isArabic ? 'استشارة' : 'Consultation',
    hourly: isArabic ? 'بالساعة' : 'Hourly',
    viewProfile: isArabic ? 'عرض الملف' : 'View Profile',
    requestQuote: isArabic ? 'طلب عرض سعر' : 'Request Quote',
    respondsIn: isArabic ? 'يرد خلال' : 'Responds in',
    hours: isArabic ? 'ساعات' : 'hours',
    resultsFound: isArabic ? 'نتيجة' : 'results found',
    noResults: isArabic ? 'لم يتم العثور على محامين' : 'No lawyers found',
    tryDifferent: isArabic ? 'جرب معايير بحث مختلفة' : 'Try different search criteria',
    whyChoose: isArabic ? 'لماذا تختار محامٍ معتمد؟' : 'Why choose a verified lawyer?',
    benefit1: isArabic ? 'مستندات ملزمة قانونياً' : 'Legally binding documents',
    benefit2: isArabic ? 'مراجعة احترافية' : 'Professional review',
    benefit3: isArabic ? 'حماية مصالحك' : 'Protect your interests',
    benefit4: isArabic ? 'توثيق رسمي' : 'Official certification',
  };

  // Filter lawyers
  const filteredLawyers = lawyers.filter((lawyer) => {
    const matchesSearch =
      searchQuery === '' ||
      `${lawyer.firstName} ${lawyer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEmirate = selectedEmirate === 'all' || lawyer.emirate === selectedEmirate;

    const matchesSpecialization =
      selectedSpecialization === 'all' ||
      lawyer.specializations.includes(selectedSpecialization);

    return matchesSearch && matchesEmirate && matchesSpecialization;
  });

  // Sort lawyers
  const sortedLawyers = [...filteredLawyers].sort((a, b) => {
    // Featured always first
    if (a.featured !== b.featured) return a.featured ? -1 : 1;

    switch (sortBy) {
      case 'rating':
        return b.averageRating - a.averageRating;
      case 'experience':
        return b.yearsExperience - a.yearsExperience;
      case 'price':
        return a.consultationFee - b.consultationFee;
      case 'responseTime':
        return a.responseTimeHours - b.responseTimeHours;
      default:
        return 0;
    }
  });

  const getSpecIcon = (iconName: string) => {
    return iconMap[iconName] || Scale;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Scale className="h-5 w-5 text-white" />
            </div>
            {translations.title}
          </h1>
          <p className="text-muted-foreground mt-1">{translations.subtitle}</p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-muted/50 rounded-xl">
            <p className="text-2xl font-bold text-primary">{lawyers.length}</p>
            <p className="text-xs text-muted-foreground">{isArabic ? 'محامي' : 'Lawyers'}</p>
          </div>
          <div className="text-center px-4 py-2 bg-muted/50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">
              {lawyers.filter((l) => l.licenseVerified).length}
            </p>
            <p className="text-xs text-muted-foreground">{translations.verified}</p>
          </div>
        </div>
      </div>

      {/* Benefits Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">{translations.whyChoose}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: CheckCircle2, text: translations.benefit1 },
              { icon: Award, text: translations.benefit2 },
              { icon: Shield, text: translations.benefit3 },
              { icon: Verified, text: translations.benefit4 },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <benefit.icon className="h-4 w-4 text-primary" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={translations.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 h-12 rounded-xl"
          />
        </div>

        {/* Location Filter */}
        <Select value={selectedEmirate} onValueChange={setSelectedEmirate}>
          <SelectTrigger className="w-full md:w-48 h-12 rounded-xl">
            <MapPin className="h-4 w-4 me-2 text-muted-foreground" />
            <SelectValue placeholder={translations.allLocations} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{translations.allLocations}</SelectItem>
            {emirates.map((emirate) => (
              <SelectItem key={emirate.id} value={emirate.id}>
                {isArabic ? emirate.nameAr : emirate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Specialization Filter */}
        <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
          <SelectTrigger className="w-full md:w-56 h-12 rounded-xl">
            <Briefcase className="h-4 w-4 me-2 text-muted-foreground" />
            <SelectValue placeholder={translations.allSpecializations} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{translations.allSpecializations}</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec.id} value={spec.id}>
                {isArabic ? spec.nameAr : spec.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-44 h-12 rounded-xl">
            <SlidersHorizontal className="h-4 w-4 me-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">{translations.rating}</SelectItem>
            <SelectItem value="experience">{translations.experience}</SelectItem>
            <SelectItem value="price">{translations.price}</SelectItem>
            <SelectItem value="responseTime">{translations.responseTime}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Specialization Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSpecialization('all')}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            selectedSpecialization === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {translations.allSpecializations}
        </button>
        {specializations.map((spec) => {
          const Icon = getSpecIcon(spec.icon);
          return (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialization(spec.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                selectedSpecialization === spec.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {isArabic ? spec.nameAr : spec.name}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sortedLawyers.length} {translations.resultsFound}
        </p>
      </div>

      {/* Lawyers Grid */}
      {sortedLawyers.length === 0 ? (
        <Card className="p-12 text-center">
          <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">{translations.noResults}</h3>
          <p className="text-muted-foreground mt-1">{translations.tryDifferent}</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedLawyers.map((lawyer) => (
            <LawyerCard
              key={lawyer.id}
              lawyer={lawyer}
              locale={locale}
              translations={translations}
              specializations={specializations}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Lawyer Card Component
function LawyerCard({
  lawyer,
  locale,
  translations,
  specializations,
}: {
  lawyer: Lawyer;
  locale: string;
  translations: Record<string, string>;
  specializations: Specialization[];
}) {
  const isArabic = locale === 'ar';

  const getEmirateDisplay = (emirateId: string) => {
    const emirate = emirates.find((e) => e.id === emirateId);
    return emirate ? (isArabic ? emirate.nameAr : emirate.name) : emirateId;
  };

  const getSpecDisplay = (specId: string) => {
    const spec = specializations.find((s) => s.id === specId);
    return spec ? (isArabic ? spec.nameAr : spec.name) : specId;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className={cn(
      'group relative overflow-hidden transition-all hover:shadow-lg',
      lawyer.featured && 'ring-2 ring-primary/20'
    )}>
      {/* Featured Badge */}
      {lawyer.featured && (
        <div className="absolute top-3 end-3 z-10">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 gap-1">
            <Crown className="h-3 w-3" />
            {translations.featured}
          </Badge>
        </div>
      )}

      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              'h-16 w-16 rounded-xl flex items-center justify-center text-lg font-semibold',
              lawyer.isAvailable
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}>
              {lawyer.avatarUrl ? (
                <img
                  src={lawyer.avatarUrl}
                  alt={`${lawyer.firstName} ${lawyer.lastName}`}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                getInitials(lawyer.firstName, lawyer.lastName)
              )}
            </div>
            {/* Verification Badge */}
            {lawyer.licenseVerified && (
              <div className="absolute -bottom-1 -end-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-white dark:border-gray-900">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {lawyer.firstName} {lawyer.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{lawyer.title}</p>
              </div>
              {/* Availability */}
              <Badge
                variant={lawyer.isAvailable ? 'default' : 'secondary'}
                className={cn(
                  'text-[10px]',
                  lawyer.isAvailable && 'bg-green-500 hover:bg-green-500'
                )}
              >
                {lawyer.isAvailable ? translations.available : translations.unavailable}
              </Badge>
            </div>

            {/* Location & Experience */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {getEmirateDisplay(lawyer.emirate)}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {lawyer.yearsExperience} {translations.years}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {lawyer.languages.map((l) => l.toUpperCase()).join(', ')}
              </span>
            </div>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{lawyer.averageRating}</span>
                <span className="text-sm text-muted-foreground">
                  ({lawyer.totalReviews} {translations.reviews})
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span>{lawyer.totalCasesCompleted} {translations.cases}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                <span>{lawyer.successRate}% {translations.successRate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{lawyer.bio}</p>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {lawyer.specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="outline" className="text-[10px]">
              {getSpecDisplay(spec)}
            </Badge>
          ))}
          {lawyer.specializations.length > 3 && (
            <Badge variant="outline" className="text-[10px]">
              +{lawyer.specializations.length - 3}
            </Badge>
          )}
        </div>

        {/* Pricing & Response Time */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{translations.consultation}</p>
              <p className="font-semibold">
                {lawyer.consultationFee} {lawyer.currency}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{translations.hourly}</p>
              <p className="font-semibold">
                {lawyer.hourlyRate} {lawyer.currency}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            {translations.respondsIn} {lawyer.responseTimeHours}h
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link href={`/${locale}/dashboard/lawyers/${lawyer.id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              {translations.viewProfile}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/lawyers/${lawyer.id}/quote`} className="flex-1">
            <Button className="w-full gap-2">
              <MessageSquare className="h-4 w-4" />
              {translations.requestQuote}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
