'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Users,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRegisterFirm } from '@/hooks/useFirms';
import {
  LEGAL_CATEGORIES,
  EMIRATES,
  FIRM_SIZES,
  type FirmType,
  type FirmSize,
} from '@/lib/firms';
import type { Locale } from '@/i18n';

const translations = {
  en: {
    title: 'Register Your Law Firm',
    subtitle: 'Join Qannoni marketplace and connect with clients seeking legal services',
    back: 'Back',
    basicInfo: 'Basic Information',
    firmName: 'Firm Name',
    firmNameAr: 'Firm Name (Arabic)',
    email: 'Business Email',
    phone: 'Phone Number',
    location: 'Location',
    emirate: 'Emirate',
    selectEmirate: 'Select emirate',
    firmDetails: 'Firm Details',
    firmType: 'Firm Type',
    firmSize: 'Firm Size',
    selectSize: 'Select size',
    specializations: 'Practice Areas',
    selectSpecializations: 'Select your areas of expertise',
    description: 'Description',
    descriptionPlaceholder: 'Tell clients about your firm, experience, and what makes you unique...',
    termsTitle: 'Terms & Conditions',
    terms: 'I agree to the platform terms and conditions',
    commission: 'I understand the platform charges a 20% commission on completed engagements',
    submit: 'Submit Registration',
    submitting: 'Submitting...',
    successTitle: 'Registration Submitted!',
    successDesc: 'Your firm registration is pending verification. We will review your application and get back to you within 2-3 business days.',
    goToDashboard: 'Go to Dashboard',
    browseFirms: 'Browse Other Firms',
    local: 'Local Firm',
    international: 'International Firm',
    boutique: 'Boutique Firm',
    optional: 'Optional',
  },
  ar: {
    title: 'سجّل مكتب المحاماة الخاص بك',
    subtitle: 'انضم إلى سوق قانوني وتواصل مع العملاء الباحثين عن خدمات قانونية',
    back: 'رجوع',
    basicInfo: 'المعلومات الأساسية',
    firmName: 'اسم المكتب',
    firmNameAr: 'اسم المكتب (بالعربية)',
    email: 'البريد الإلكتروني للعمل',
    phone: 'رقم الهاتف',
    location: 'الموقع',
    emirate: 'الإمارة',
    selectEmirate: 'اختر الإمارة',
    firmDetails: 'تفاصيل المكتب',
    firmType: 'نوع المكتب',
    firmSize: 'حجم المكتب',
    selectSize: 'اختر الحجم',
    specializations: 'مجالات الممارسة',
    selectSpecializations: 'اختر مجالات خبرتك',
    description: 'الوصف',
    descriptionPlaceholder: 'أخبر العملاء عن مكتبك وخبرتك وما يميزك...',
    termsTitle: 'الشروط والأحكام',
    terms: 'أوافق على شروط وأحكام المنصة',
    commission: 'أفهم أن المنصة تفرض عمولة 20% على التعاقدات المكتملة',
    submit: 'إرسال التسجيل',
    submitting: 'جاري الإرسال...',
    successTitle: 'تم إرسال التسجيل!',
    successDesc: 'تسجيل مكتبك قيد المراجعة. سنراجع طلبك ونعود إليك خلال 2-3 أيام عمل.',
    goToDashboard: 'الذهاب إلى لوحة التحكم',
    browseFirms: 'تصفح المكاتب الأخرى',
    local: 'مكتب محلي',
    international: 'مكتب دولي',
    boutique: 'مكتب متخصص',
    optional: 'اختياري',
  },
};

const firmTypes: { value: FirmType; labelEn: string; labelAr: string }[] = [
  { value: 'local', labelEn: 'Local Firm', labelAr: 'مكتب محلي' },
  { value: 'international', labelEn: 'International Firm', labelAr: 'مكتب دولي' },
  { value: 'boutique', labelEn: 'Boutique Firm', labelAr: 'مكتب متخصص' },
];

export default function RegisterFirmPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const router = useRouter();
  const isArabic = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emirate, setEmirate] = useState('');
  const [firmType, setFirmType] = useState<FirmType>('local');
  const [firmSize, setFirmSize] = useState<FirmSize>('small');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [commissionAccepted, setCommissionAccepted] = useState(false);

  const registerFirm = useRegisterFirm();

  const isValid = name && email && emirate && specializations.length > 0 && termsAccepted && commissionAccepted;

  const handleSpecializationToggle = (spec: string) => {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter(s => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      await registerFirm.mutateAsync({
        name,
        nameAr: nameAr || undefined,
        email,
        phone: phone || undefined,
        emirate,
        firmType,
        firmSize,
        specializations,
        description: description || undefined,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error registering firm:', error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 py-12" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t.successTitle}</h1>
            <p className="text-muted-foreground mb-6">{t.successDesc}</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/${locale}/dashboard`}>
                <Button>{t.goToDashboard}</Button>
              </Link>
              <Link href={`/${locale}/firms`}>
                <Button variant="outline">{t.browseFirms}</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/firms`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t.basicInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label>{t.firmName} *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label>{t.firmNameAr} <span className="text-muted-foreground">({t.optional})</span></Label>
                  <Input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="mt-1.5"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label>{t.email} *</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label>{t.phone} <span className="text-muted-foreground">({t.optional})</span></Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>{t.emirate} *</Label>
                <Select value={emirate} onValueChange={setEmirate}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={t.selectEmirate} />
                  </SelectTrigger>
                  <SelectContent>
                    {EMIRATES.map((em) => (
                      <SelectItem key={em.value} value={em.value}>
                        {isArabic ? em.labelAr : em.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Firm Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t.firmDetails}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.firmType}</Label>
                  <Select value={firmType} onValueChange={(v) => setFirmType(v as FirmType)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {firmTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {isArabic ? type.labelAr : type.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.firmSize}</Label>
                  <Select value={firmSize} onValueChange={(v) => setFirmSize(v as FirmSize)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={t.selectSize} />
                    </SelectTrigger>
                    <SelectContent>
                      {FIRM_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {isArabic ? size.labelAr : size.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t.specializations} *</Label>
                <p className="text-sm text-muted-foreground mb-2">{t.selectSpecializations}</p>
                <div className="flex flex-wrap gap-2">
                  {LEGAL_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat.value}
                      variant={specializations.includes(cat.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleSpecializationToggle(cat.value)}
                    >
                      {isArabic ? cat.labelAr : cat.labelEn}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t.description} <span className="text-muted-foreground">({t.optional})</span></Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  rows={4}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <Card>
            <CardHeader>
              <CardTitle>{t.termsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="terms" className="font-normal cursor-pointer">
                  {t.terms}
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="commission"
                  checked={commissionAccepted}
                  onCheckedChange={(checked) => setCommissionAccepted(checked as boolean)}
                />
                <Label htmlFor="commission" className="font-normal cursor-pointer">
                  {t.commission}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={!isValid || registerFirm.isPending}
          >
            {registerFirm.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.submitting}
              </>
            ) : (
              t.submit
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
