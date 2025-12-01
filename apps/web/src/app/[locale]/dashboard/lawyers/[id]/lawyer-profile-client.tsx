'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Scale,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  Briefcase,
  Award,
  MessageSquare,
  Video,
  Crown,
  Verified,
  TrendingUp,
  Zap,
  Languages,
  GraduationCap,
  ThumbsUp,
  Quote,
  ArrowLeft,
} from 'lucide-react';

// Mock lawyer data
const mockLawyer = {
  id: 'lawyer_1',
  firstName: 'Ahmed',
  lastName: 'Al-Mahmoud',
  title: 'Senior Legal Consultant',
  avatarUrl: undefined,
  bio: 'Specializing in real estate and corporate law with over 15 years of experience in the UAE legal system. Former legal advisor to major property developers.',
  yearsExperience: 15,
  languages: ['ar', 'en'],
  barNumber: 'DBA-2009-1234',
  barAssociation: 'Dubai Bar Association',
  licenseVerified: true,
  licenseVerifiedAt: '2023-06-15',
  emirate: 'dubai',
  city: 'Dubai Marina',
  officeAddress: 'Marina Plaza Tower, Office 1205, Dubai Marina, Dubai, UAE',
  specializations: ['real_estate', 'corporate', 'contracts'],
  consultationFee: 500,
  hourlyRate: 800,
  minProjectFee: 2000,
  currency: 'AED',
  isAvailable: true,
  responseTimeHours: 2,
  totalReviews: 127,
  averageRating: 4.9,
  totalCasesCompleted: 342,
  successRate: 98,
  featured: true,
  education: [
    { degree: 'LLM in Corporate Law', institution: 'University of Dubai', year: 2008 },
    { degree: 'LLB', institution: 'Cairo University', year: 2005 },
  ],
  certifications: [
    'Certified Legal Consultant - UAE Ministry of Justice',
    'Notary Public - Dubai Courts',
    'Arbitration Specialist - DIAC',
  ],
  availableHours: {
    sunday: { start: '09:00', end: '18:00' },
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: { start: '09:00', end: '18:00' },
    thursday: { start: '09:00', end: '14:00' },
  },
};

const mockReviews = [
  {
    id: 'rev_1',
    userName: 'Mohammed K.',
    rating: 5,
    date: '2024-01-15',
    documentType: 'Real Estate Contract',
    title: 'Excellent service and attention to detail',
    text: 'Mr. Al-Mahmoud reviewed our property purchase agreement thoroughly. Highly recommended!',
    helpful: 45,
    response: 'Thank you for your kind words.',
  },
  {
    id: 'rev_2',
    userName: 'Sarah A.',
    rating: 5,
    date: '2024-01-10',
    documentType: 'Commercial Lease',
    title: 'Professional and responsive',
    text: 'Very professional service. He responded to all my questions quickly.',
    helpful: 32,
  },
];

const specializationLabels: Record<string, { en: string; ar: string }> = {
  real_estate: { en: 'Real Estate', ar: 'العقارات' },
  corporate: { en: 'Corporate & Business', ar: 'الشركات والأعمال' },
  contracts: { en: 'Contracts', ar: 'العقود' },
};

export default function LawyerProfileClient() {
  const params = useParams();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState('about');

  const lawyer = mockLawyer;

  const translations = {
    back: isArabic ? 'رجوع' : 'Back',
    about: isArabic ? 'نبذة' : 'About',
    reviews: isArabic ? 'التقييمات' : 'Reviews',
    services: isArabic ? 'الخدمات' : 'Services',
    availability: isArabic ? 'التوفر' : 'Availability',
    verified: isArabic ? 'موثق' : 'Verified',
    available: isArabic ? 'متاح الآن' : 'Available Now',
    unavailable: isArabic ? 'غير متاح' : 'Unavailable',
    years: isArabic ? 'سنة خبرة' : 'years experience',
    reviews_count: isArabic ? 'تقييم' : 'reviews',
    cases: isArabic ? 'قضية مكتملة' : 'cases completed',
    successRate: isArabic ? 'نسبة النجاح' : 'success rate',
    consultation: isArabic ? 'استشارة أولية' : 'Initial Consultation',
    hourly: isArabic ? 'السعر بالساعة' : 'Hourly Rate',
    minProject: isArabic ? 'الحد الأدنى للمشروع' : 'Min. Project Fee',
    requestQuote: isArabic ? 'طلب عرض سعر' : 'Request Quote',
    bookConsultation: isArabic ? 'حجز استشارة' : 'Book Consultation',
    respondsIn: isArabic ? 'يرد خلال' : 'Usually responds in',
    hours: isArabic ? 'ساعات' : 'hours',
    specializations: isArabic ? 'التخصصات' : 'Specializations',
    education: isArabic ? 'التعليم' : 'Education',
    certifications: isArabic ? 'الشهادات المهنية' : 'Professional Certifications',
    barAssociation: isArabic ? 'نقابة المحامين' : 'Bar Association',
    licenseNumber: isArabic ? 'رقم الترخيص' : 'License Number',
    location: isArabic ? 'الموقع' : 'Location',
    workingHours: isArabic ? 'ساعات العمل' : 'Working Hours',
    helpful: isArabic ? 'مفيد' : 'Helpful',
    lawyerResponse: isArabic ? 'رد المحامي' : "Lawyer's Response",
    documentTypes: isArabic ? 'أنواع المستندات' : 'Document Types Handled',
    pricingNote: isArabic ? 'الأسعار تقريبية وقد تختلف حسب تعقيد المستند' : 'Prices are approximate and may vary based on document complexity',
  };

  const getSpecLabel = (specId: string) => {
    const spec = specializationLabels[specId];
    return spec ? (isArabic ? spec.ar : spec.en) : specId;
  };

  const getInitials = (firstName: string, lastName: string) => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getDayName = (day: string) => {
    const days: Record<string, { en: string; ar: string }> = {
      sunday: { en: 'Sunday', ar: 'الأحد' },
      monday: { en: 'Monday', ar: 'الإثنين' },
      tuesday: { en: 'Tuesday', ar: 'الثلاثاء' },
      wednesday: { en: 'Wednesday', ar: 'الأربعاء' },
      thursday: { en: 'Thursday', ar: 'الخميس' },
      friday: { en: 'Friday', ar: 'الجمعة' },
      saturday: { en: 'Saturday', ar: 'السبت' },
    };
    return isArabic ? days[day]?.ar : days[day]?.en;
  };

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/dashboard/lawyers`}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {translations.back}
        </Button>
      </Link>

      <Card className={cn(lawyer.featured && 'ring-2 ring-primary/20')}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="relative">
                <div className={cn('h-28 w-28 rounded-2xl flex items-center justify-center text-3xl font-semibold', lawyer.isAvailable ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                  {getInitials(lawyer.firstName, lawyer.lastName)}
                </div>
                {lawyer.licenseVerified && (
                  <div className="absolute -bottom-2 -end-2 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center border-3 border-white">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {lawyer.featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 gap-1">
                    <Crown className="h-3 w-3" />Featured
                  </Badge>
                )}
                <Badge variant={lawyer.isAvailable ? 'default' : 'secondary'} className={cn(lawyer.isAvailable && 'bg-green-500 hover:bg-green-500')}>
                  {lawyer.isAvailable ? translations.available : translations.unavailable}
                </Badge>
              </div>
            </div>

            <div className="flex-1 text-center md:text-start">
              <h1 className="text-2xl font-bold">{lawyer.firstName} {lawyer.lastName}</h1>
              <p className="text-lg text-muted-foreground">{lawyer.title}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-lg">{lawyer.averageRating}</span>
                  <span className="text-muted-foreground">({lawyer.totalReviews} {translations.reviews_count})</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  {lawyer.yearsExperience} {translations.years}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {lawyer.totalCasesCompleted} {translations.cases}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  {lawyer.successRate}% {translations.successRate}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{lawyer.city}</span>
                <span className="flex items-center gap-1"><Languages className="h-4 w-4" />{lawyer.languages.map((l) => l.toUpperCase()).join(', ')}</span>
                <span className="flex items-center gap-1"><Zap className="h-4 w-4" />{translations.respondsIn} {lawyer.responseTimeHours} {translations.hours}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              <Card className="bg-muted/50 border-0">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{translations.consultation}</span>
                    <span className="font-semibold">{lawyer.consultationFee} {lawyer.currency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{translations.hourly}</span>
                    <span className="font-semibold">{lawyer.hourlyRate} {lawyer.currency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{translations.minProject}</span>
                    <span className="font-semibold">{lawyer.minProjectFee} {lawyer.currency}</span>
                  </div>
                </CardContent>
              </Card>
              <Link href={`/${locale}/dashboard/lawyers/${lawyer.id}/quote`}>
                <Button className="w-full gap-2"><MessageSquare className="h-4 w-4" />{translations.requestQuote}</Button>
              </Link>
              <Button variant="outline" className="w-full gap-2"><Video className="h-4 w-4" />{translations.bookConsultation}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="about">{translations.about}</TabsTrigger>
          <TabsTrigger value="reviews">{translations.reviews}</TabsTrigger>
          <TabsTrigger value="services">{translations.services}</TabsTrigger>
          <TabsTrigger value="availability">{translations.availability}</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6 mt-6">
          <Card><CardContent className="p-6"><p className="text-muted-foreground leading-relaxed">{lawyer.bio}</p></CardContent></Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Scale className="h-5 w-5 text-primary" />{translations.specializations}</CardTitle></CardHeader>
              <CardContent className="pt-0"><div className="flex flex-wrap gap-2">{lawyer.specializations.map((spec) => (<Badge key={spec} variant="secondary" className="px-3 py-1">{getSpecLabel(spec)}</Badge>))}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Award className="h-5 w-5 text-primary" />{translations.barAssociation}</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span>{lawyer.barAssociation}</span></div>
                <div className="text-sm text-muted-foreground">{translations.licenseNumber}: {lawyer.barNumber}</div>
                {lawyer.licenseVerified && (<Badge variant="outline" className="text-green-600 border-green-200 bg-green-50"><Verified className="h-3 w-3 me-1" />{translations.verified}</Badge>)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" />{translations.education}</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">{lawyer.education.map((edu, i) => (<div key={i} className="flex items-start gap-2"><div className="h-2 w-2 rounded-full bg-primary mt-2" /><div><p className="font-medium">{edu.degree}</p><p className="text-sm text-muted-foreground">{edu.institution}, {edu.year}</p></div></div>))}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Award className="h-5 w-5 text-primary" />{translations.certifications}</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-2">{lawyer.certifications.map((cert, i) => (<div key={i} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /><span className="text-sm">{cert}</span></div>))}</CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />{translations.location}</CardTitle></CardHeader>
            <CardContent className="pt-0"><p className="text-muted-foreground">{lawyer.officeAddress}</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-bold">{lawyer.averageRating}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-1">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={cn('h-5 w-5', star <= Math.round(lawyer.averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground')} />))}</div>
                  <p className="text-sm text-muted-foreground mt-1">{lawyer.totalReviews} {translations.reviews_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {mockReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={cn('h-4 w-4', star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground')} />))}</div>
                      <Badge variant="outline" className="text-[10px]">{review.documentType}</Badge>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
                <h4 className="font-medium mb-2">{review.title}</h4>
                <p className="text-muted-foreground text-sm">{review.text}</p>
                {review.response && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1 flex items-center gap-1"><Quote className="h-4 w-4" />{translations.lawyerResponse}</p>
                    <p className="text-sm text-muted-foreground">{review.response}</p>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground"><ThumbsUp className="h-4 w-4" />{translations.helpful} ({review.helpful})</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="services" className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">{translations.documentTypes}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                { type: 'Document Review', price: '500-1500', time: '1-3 days' },
                { type: 'Contract Drafting', price: '2000-5000', time: '3-7 days' },
                { type: 'Legal Certification', price: '300-800', time: '1-2 days' },
                { type: 'Notarization Support', price: '500-1000', time: '1-2 days' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div><p className="font-medium">{service.type}</p><p className="text-sm text-muted-foreground">Est. {service.time}</p></div>
                  <p className="font-semibold text-primary">{service.price} AED</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground text-center">{translations.pricingNote}</p>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />{translations.workingHours}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(lawyer.availableHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{getDayName(day)}</span>
                    <span className="text-muted-foreground">{hours.start} - {hours.end}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">{translations.respondsIn} {lawyer.responseTimeHours} {translations.hours}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
