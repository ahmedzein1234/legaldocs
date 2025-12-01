'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  Star,
  Zap,
} from 'lucide-react';

// Mock documents for selection
const mockDocuments = [
  {
    id: 'doc_1',
    title: 'Property Sale Agreement',
    type: 'rental_agreement',
    createdAt: '2024-01-20',
    status: 'draft',
  },
  {
    id: 'doc_2',
    title: 'Employment Contract - Senior Developer',
    type: 'employment_contract',
    createdAt: '2024-01-18',
    status: 'draft',
  },
  {
    id: 'doc_3',
    title: 'Service Agreement - Marketing',
    type: 'service_agreement',
    createdAt: '2024-01-15',
    status: 'draft',
  },
];

// Mock lawyer
const mockLawyer = {
  id: 'lawyer_1',
  firstName: 'Ahmed',
  lastName: 'Al-Mahmoud',
  title: 'Senior Legal Consultant',
  averageRating: 4.9,
  totalReviews: 127,
  responseTimeHours: 2,
  consultationFee: 500,
  currency: 'AED',
};

export default function RequestQuoteClient() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [step, setStep] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('review');
  const [urgency, setUrgency] = useState<string>('standard');
  const [deadline, setDeadline] = useState<string>('');
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToAnonymization, setAgreedToAnonymization] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lawyer = mockLawyer;

  const translations = {
    back: isArabic ? 'رجوع' : 'Back',
    requestQuote: isArabic ? 'طلب عرض سعر' : 'Request Quote',
    from: isArabic ? 'من' : 'from',
    step1: isArabic ? 'اختر المستند' : 'Select Document',
    step2: isArabic ? 'تفاصيل الخدمة' : 'Service Details',
    step3: isArabic ? 'مراجعة وإرسال' : 'Review & Submit',
    selectDocument: isArabic ? 'اختر المستند للمراجعة' : 'Select Document for Review',
    noDocuments: isArabic ? 'لا توجد مستندات' : 'No documents available',
    createDocument: isArabic ? 'أنشئ مستنداً أولاً' : 'Create a document first',
    serviceType: isArabic ? 'نوع الخدمة' : 'Service Type',
    review: isArabic ? 'مراجعة المستند' : 'Document Review',
    reviewDesc: isArabic ? 'مراجعة شاملة مع تعديلات مقترحة' : 'Comprehensive review with suggested edits',
    certify: isArabic ? 'توثيق قانوني' : 'Legal Certification',
    certifyDesc: isArabic ? 'توثيق رسمي يجعل المستند ملزماً قانونياً' : 'Official certification making document legally binding',
    consult: isArabic ? 'استشارة' : 'Consultation',
    consultDesc: isArabic ? 'مناقشة المستند والحصول على نصائح' : 'Discuss document and get advice',
    urgency: isArabic ? 'الأولوية' : 'Urgency',
    standard: isArabic ? 'عادي' : 'Standard',
    standardTime: isArabic ? '3-5 أيام عمل' : '3-5 business days',
    urgent: isArabic ? 'عاجل' : 'Urgent',
    urgentTime: isArabic ? '1-2 أيام عمل' : '1-2 business days',
    express: isArabic ? 'سريع جداً' : 'Express',
    expressTime: isArabic ? 'خلال 24 ساعة' : 'Within 24 hours',
    deadline: isArabic ? 'الموعد النهائي المطلوب' : 'Preferred Deadline',
    optional: isArabic ? 'اختياري' : 'Optional',
    budget: isArabic ? 'الميزانية المتوقعة' : 'Expected Budget',
    min: isArabic ? 'الحد الأدنى' : 'Min',
    max: isArabic ? 'الحد الأقصى' : 'Max',
    specialInstructions: isArabic ? 'تعليمات خاصة' : 'Special Instructions',
    specialInstructionsPlaceholder: isArabic
      ? 'أي متطلبات أو ملاحظات خاصة...'
      : 'Any specific requirements or notes...',
    privacyNotice: isArabic ? 'إشعار الخصوصية' : 'Privacy Notice',
    privacyText: isArabic
      ? 'سيتم إخفاء معلوماتك الشخصية (الأسماء، أرقام الهوية، العناوين) من المستند حتى تقبل عرض السعر'
      : 'Your personal information (names, ID numbers, addresses) will be hidden from the document until you accept a quote',
    anonymizedPreview: isArabic ? 'معاينة مخفية الهوية' : 'Anonymized Preview',
    whatLawyerSees: isArabic ? 'ما يراه المحامي' : 'What the lawyer sees',
    originalInfo: isArabic ? 'المعلومات الأصلية' : 'Original Information',
    hiddenInfo: isArabic ? 'المعلومات المخفية' : 'Hidden Information',
    termsAgreement: isArabic
      ? 'أوافق على شروط الخدمة وسياسة الخصوصية'
      : 'I agree to the Terms of Service and Privacy Policy',
    anonymizationAgreement: isArabic
      ? 'أفهم أن معلوماتي الشخصية ستكون مخفية حتى أقبل عرض السعر'
      : 'I understand my personal information will be hidden until I accept a quote',
    next: isArabic ? 'التالي' : 'Next',
    previous: isArabic ? 'السابق' : 'Previous',
    submitRequest: isArabic ? 'إرسال الطلب' : 'Submit Request',
    submitting: isArabic ? 'جاري الإرسال...' : 'Submitting...',
    reviewSummary: isArabic ? 'ملخص الطلب' : 'Request Summary',
    estimatedResponse: isArabic ? 'الرد المتوقع' : 'Expected Response',
    hours: isArabic ? 'ساعات' : 'hours',
    document: isArabic ? 'المستند' : 'Document',
    service: isArabic ? 'الخدمة' : 'Service',
    priority: isArabic ? 'الأولوية' : 'Priority',
  };

  const serviceTypes = [
    {
      id: 'review',
      name: translations.review,
      description: translations.reviewDesc,
      icon: Eye,
      priceRange: '500-1500',
    },
    {
      id: 'certify',
      name: translations.certify,
      description: translations.certifyDesc,
      icon: CheckCircle2,
      priceRange: '800-2000',
    },
    {
      id: 'consult',
      name: translations.consult,
      description: translations.consultDesc,
      icon: MessageSquare,
      priceRange: '500/hour',
    },
  ];

  const urgencyOptions = [
    { id: 'standard', name: translations.standard, time: translations.standardTime, multiplier: 1 },
    { id: 'urgent', name: translations.urgent, time: translations.urgentTime, multiplier: 1.5 },
    { id: 'express', name: translations.express, time: translations.expressTime, multiplier: 2 },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.push(`/${locale}/dashboard/lawyers/requests?success=true`);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedDocument !== '';
      case 2:
        return serviceType !== '' && urgency !== '';
      case 3:
        return agreedToTerms && agreedToAnonymization;
      default:
        return false;
    }
  };

  const selectedDoc = mockDocuments.find((d) => d.id === selectedDocument);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/${locale}/dashboard/lawyers/${params.id}`}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {translations.back}
        </Button>
      </Link>

      <div className="text-center">
        <h1 className="text-2xl font-bold">{translations.requestQuote}</h1>
        <p className="text-muted-foreground mt-1">
          {translations.from} {lawyer.firstName} {lawyer.lastName}
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{lawyer.averageRating}</span>
            <span className="text-sm text-muted-foreground">({lawyer.totalReviews})</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            {translations.estimatedResponse}: {lawyer.responseTimeHours} {translations.hours}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all',
                s === step
                  ? 'bg-primary text-primary-foreground scale-110'
                  : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div className={cn('w-12 h-1 mx-2 rounded-full transition-all', s < step ? 'bg-green-500' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between px-4">
        <span className={cn('text-sm', step >= 1 ? 'text-foreground' : 'text-muted-foreground')}>{translations.step1}</span>
        <span className={cn('text-sm', step >= 2 ? 'text-foreground' : 'text-muted-foreground')}>{translations.step2}</span>
        <span className={cn('text-sm', step >= 3 ? 'text-foreground' : 'text-muted-foreground')}>{translations.step3}</span>
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{translations.selectDocument}</h3>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'اختر المستند الذي تريد مراجعته من المحامي' : 'Choose the document you want the lawyer to review'}
                </p>
              </div>
              {mockDocuments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">{translations.noDocuments}</p>
                  <p className="text-sm text-muted-foreground mb-4">{translations.createDocument}</p>
                  <Link href={`/${locale}/dashboard/generate`}>
                    <Button><Sparkles className="h-4 w-4 me-2" />{isArabic ? 'إنشاء مستند' : 'Create Document'}</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc.id)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-start',
                        selectedDocument === doc.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', selectedDocument === doc.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">{isArabic ? 'أنشئ في' : 'Created'} {doc.createdAt}</p>
                      </div>
                      {selectedDocument === doc.id && <CheckCircle2 className="h-6 w-6 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-lg font-semibold">{translations.serviceType}</Label>
                <RadioGroup value={serviceType} onValueChange={setServiceType}>
                  <div className="grid gap-3">
                    {serviceTypes.map((service) => (
                      <label key={service.id} className={cn('flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all', serviceType === service.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                        <RadioGroupItem value={service.id} className="sr-only" />
                        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', serviceType === service.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                          <service.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <Badge variant="outline">{service.priceRange} AED</Badge>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-semibold">{translations.urgency}</Label>
                <RadioGroup value={urgency} onValueChange={setUrgency}>
                  <div className="grid grid-cols-3 gap-3">
                    {urgencyOptions.map((option) => (
                      <label key={option.id} className={cn('flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all text-center', urgency === option.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                        <RadioGroupItem value={option.id} className="sr-only" />
                        <Clock className={cn('h-6 w-6 mb-2', urgency === option.id ? 'text-primary' : 'text-muted-foreground')} />
                        <p className="font-medium">{option.name}</p>
                        <p className="text-xs text-muted-foreground">{option.time}</p>
                        {option.multiplier > 1 && <Badge variant="secondary" className="mt-2 text-[10px]">+{(option.multiplier - 1) * 100}%</Badge>}
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">{translations.deadline}<Badge variant="outline" className="text-[10px]">{translations.optional}</Badge></Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">{translations.budget} (AED)<Badge variant="outline" className="text-[10px]">{translations.optional}</Badge></Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">{translations.min}</Label>
                    <Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="500" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{translations.max}</Label>
                    <Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="2000" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{translations.specialInstructions}</Label>
                <Textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder={translations.specialInstructionsPlaceholder} rows={4} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">{translations.privacyNotice}</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{translations.privacyText}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2"><EyeOff className="h-5 w-5" />{translations.anonymizedPreview}</h4>
                <p className="text-sm text-muted-foreground">{translations.whatLawyerSees}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400"><Eye className="h-4 w-4" />{translations.originalInfo}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Name:</strong> Ahmed Mohammed Al-Rashid</p>
                      <p><strong>ID:</strong> 784-1990-1234567-1</p>
                      <p><strong>Address:</strong> Dubai Marina, Tower 5</p>
                      <p><strong>Phone:</strong> +971 50 123 4567</p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400"><EyeOff className="h-4 w-4" />{translations.hiddenInfo}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Name:</strong> <span className="bg-muted px-2 py-0.5 rounded">[Party A]</span></p>
                      <p><strong>ID:</strong> <span className="bg-muted px-2 py-0.5 rounded">[HIDDEN]</span></p>
                      <p><strong>Address:</strong> <span className="bg-muted px-2 py-0.5 rounded">[HIDDEN]</span></p>
                      <p><strong>Phone:</strong> <span className="bg-muted px-2 py-0.5 rounded">[HIDDEN]</span></p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{translations.reviewSummary}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">{translations.document}:</span><span className="font-medium">{selectedDoc?.title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{translations.service}:</span><span className="font-medium">{serviceTypes.find((s) => s.id === serviceType)?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{translations.priority}:</span><span className="font-medium">{urgencyOptions.find((u) => u.id === urgency)?.name}</span></div>
                  {deadline && <div className="flex justify-between"><span className="text-muted-foreground">{translations.deadline}:</span><span className="font-medium">{deadline}</span></div>}
                  {(budgetMin || budgetMax) && <div className="flex justify-between"><span className="text-muted-foreground">{translations.budget}:</span><span className="font-medium">{budgetMin || '0'} - {budgetMax || '∞'} AED</span></div>}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">{translations.termsAgreement}</Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="anonymization" checked={agreedToAnonymization} onCheckedChange={(checked) => setAgreedToAnonymization(checked as boolean)} />
                  <Label htmlFor="anonymization" className="text-sm cursor-pointer">{translations.anonymizationAgreement}</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1} className="gap-2">
          <ArrowLeft className="h-4 w-4" />{translations.previous}
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="gap-2">
            {translations.next}<ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="gap-2">
            {isSubmitting ? (
              <><span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />{translations.submitting}</>
            ) : (
              <><MessageSquare className="h-4 w-4" />{translations.submitRequest}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
