'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  MessageSquare,
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle,
  Loader2,
  Send,
  Upload,
  X,
  File,
  Image,
  FileIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateServiceRequest, useSubmitRequestForBidding } from '@/hooks/useFirms';
import {
  SERVICE_TYPES,
  LEGAL_CATEGORIES,
  EMIRATES,
  URGENCY_OPTIONS,
  type ServiceType,
  type Urgency,
} from '@/lib/firms';
import { useParams } from 'next/navigation';
import type { Locale } from '@/i18n';

const translations = {
  en: {
    title: 'Request Legal Service',
    subtitle: 'Describe your legal needs and get quotes from verified law firms',
    step1: 'Service Type',
    step2: 'Details',
    step3: 'Budget & Timeline',
    step4: 'Review & Submit',
    back: 'Back',
    next: 'Next',
    submit: 'Submit Request',
    submitting: 'Submitting...',
    serviceType: 'What type of service do you need?',
    category: 'Legal Category',
    selectCategory: 'Select a category',
    requestTitle: 'Request Title',
    titlePlaceholder: 'e.g., Employment Contract Review',
    description: 'Describe Your Needs',
    descriptionPlaceholder: 'Provide details about your legal matter, what you need help with, and any specific requirements...',
    languages: 'Preferred Languages',
    english: 'English',
    arabic: 'Arabic',
    bothLanguages: 'Both',
    emirate: 'Location Preference',
    anyEmirate: 'Any Emirates',
    urgency: 'How urgent is this?',
    budgetRange: 'Budget Range (AED)',
    budgetMin: 'Minimum',
    budgetMax: 'Maximum',
    optional: 'Optional',
    reviewTitle: 'Review Your Request',
    reviewDesc: 'Please review your request details before submitting',
    editRequest: 'Edit',
    successTitle: 'Request Submitted!',
    successDesc: 'Your request has been submitted. Law firms will start bidding soon.',
    successAnchor: 'Your request has been offered to our anchor partner first. They have 4 hours to respond.',
    viewRequests: 'View My Requests',
    browseFirms: 'Browse Firms',
    attachments: 'Attachments',
    attachmentsDesc: 'Upload relevant documents (contracts, correspondence, etc.)',
    dragDrop: 'Drag & drop files here, or click to browse',
    maxFileSize: 'Max 10MB per file. PDF, Word, Images accepted.',
    uploading: 'Uploading...',
    uploadError: 'Upload failed',
    removeFile: 'Remove',
  },
  ar: {
    title: 'اطلب خدمة قانونية',
    subtitle: 'صف احتياجاتك القانونية واحصل على عروض من مكاتب المحاماة الموثقة',
    step1: 'نوع الخدمة',
    step2: 'التفاصيل',
    step3: 'الميزانية والوقت',
    step4: 'المراجعة والإرسال',
    back: 'رجوع',
    next: 'التالي',
    submit: 'إرسال الطلب',
    submitting: 'جاري الإرسال...',
    serviceType: 'ما نوع الخدمة التي تحتاجها؟',
    category: 'الفئة القانونية',
    selectCategory: 'اختر الفئة',
    requestTitle: 'عنوان الطلب',
    titlePlaceholder: 'مثال: مراجعة عقد عمل',
    description: 'صف احتياجاتك',
    descriptionPlaceholder: 'قدم تفاصيل عن مسألتك القانونية، ما تحتاج مساعدة فيه، وأي متطلبات محددة...',
    languages: 'اللغات المفضلة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    bothLanguages: 'كلاهما',
    emirate: 'تفضيل الموقع',
    anyEmirate: 'أي إمارة',
    urgency: 'ما مدى إلحاح هذا الأمر؟',
    budgetRange: 'نطاق الميزانية (درهم)',
    budgetMin: 'الحد الأدنى',
    budgetMax: 'الحد الأقصى',
    optional: 'اختياري',
    reviewTitle: 'راجع طلبك',
    reviewDesc: 'يرجى مراجعة تفاصيل طلبك قبل الإرسال',
    editRequest: 'تعديل',
    successTitle: 'تم إرسال الطلب!',
    successDesc: 'تم إرسال طلبك. ستبدأ مكاتب المحاماة في تقديم العروض قريباً.',
    successAnchor: 'تم عرض طلبك على شريكنا الرئيسي أولاً. لديهم 4 ساعات للرد.',
    viewRequests: 'عرض طلباتي',
    browseFirms: 'تصفح المكاتب',
    attachments: 'المرفقات',
    attachmentsDesc: 'ارفع المستندات ذات الصلة (عقود، مراسلات، إلخ)',
    dragDrop: 'اسحب وأفلت الملفات هنا، أو انقر للتصفح',
    maxFileSize: 'حجم أقصى 10 ميجابايت لكل ملف. PDF، Word، صور مقبولة.',
    uploading: 'جاري الرفع...',
    uploadError: 'فشل الرفع',
    removeFile: 'إزالة',
  },
};

const steps = ['step1', 'step2', 'step3', 'step4'] as const;

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadId?: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType === 'application/pdf') return FileText;
  return File;
}

export default function NewRequestPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const router = useRouter();
  const searchParams = useSearchParams();
  const preferredFirmId = searchParams?.get('firm') || undefined;

  const isArabic = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [anchorOffered, setAnchorOffered] = useState(false);

  // Form state
  const [serviceType, setServiceType] = useState<ServiceType>('consultation');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [languages, setLanguages] = useState<string[]>(['en']);
  const [emirate, setEmirate] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('standard');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  const createRequest = useCreateServiceRequest();

  // File upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        continue;
      }

      const fileId = crypto.randomUUID();
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
      };

      setAttachments(prev => [...prev, newFile]);

      try {
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to API
        const response = await fetch('/api/uploads/direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileData: base64,
            category: 'uploads',
          }),
        });

        const result = await response.json();

        if (result.success) {
          setAttachments(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'success', uploadId: result.data.uploadId }
                : f
            )
          );
        } else {
          throw new Error(result.error?.message || 'Upload failed');
        }
      } catch (error) {
        setAttachments(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, status: 'error', error: (error as Error).message }
              : f
          )
        );
      }
    }
  };

  const removeFile = (fileId: string) => {
    setAttachments(prev => prev.filter(f => f.id !== fileId));
  };
  const submitForBidding = useSubmitRequestForBidding();

  const isStepValid = () => {
    switch (step) {
      case 0:
        return serviceType && category;
      case 1:
        return title.trim().length >= 5 && description.trim().length >= 20;
      case 2:
        return urgency;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Get successfully uploaded attachment IDs
      const attachmentIds = attachments
        .filter(f => f.status === 'success' && f.uploadId)
        .map(f => f.uploadId as string);

      // Create the request
      const result = await createRequest.mutateAsync({
        serviceType,
        category,
        title,
        description,
        requiredLanguages: languages,
        requiredEmirate: emirate || undefined,
        urgency,
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      });

      if (result.success && result.data?.requestId) {
        // Submit for bidding
        const bidResult = await submitForBidding.mutateAsync(result.data.requestId);
        setAnchorOffered(bidResult.data?.offeredToAnchor || false);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
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
            <p className="text-muted-foreground mb-6">
              {anchorOffered ? t.successAnchor : t.successDesc}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/${locale}/dashboard/requests`}>
                <Button>{t.viewRequests}</Button>
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
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </Link>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-full h-1 mx-2 ${
                    i < step ? 'bg-primary' : 'bg-muted'
                  }`}
                  style={{ width: '60px' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {/* Step 1: Service Type */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">{t.serviceType}</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {SERVICE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setServiceType(type.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          serviceType === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">
                          {isArabic ? type.labelAr : type.labelEn}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{t.category}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={t.selectCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      {LEGAL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {isArabic ? cat.labelAr : cat.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label>{t.requestTitle}</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t.titlePlaceholder}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>{t.description}</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.descriptionPlaceholder}
                    rows={6}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {description.length} / 20 minimum characters
                  </p>
                </div>

                <div>
                  <Label>{t.languages}</Label>
                  <RadioGroup
                    value={languages.length > 1 ? 'both' : languages[0]}
                    onValueChange={(v) => {
                      if (v === 'both') setLanguages(['en', 'ar']);
                      else setLanguages([v]);
                    }}
                    className="flex gap-4 mt-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="en" id="lang-en" />
                      <Label htmlFor="lang-en">{t.english}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ar" id="lang-ar" />
                      <Label htmlFor="lang-ar">{t.arabic}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="lang-both" />
                      <Label htmlFor="lang-both">{t.bothLanguages}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>{t.emirate} <span className="text-muted-foreground">({t.optional})</span></Label>
                  <Select value={emirate} onValueChange={setEmirate}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={t.anyEmirate} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t.anyEmirate}</SelectItem>
                      {EMIRATES.map((em) => (
                        <SelectItem key={em.value} value={em.value}>
                          {isArabic ? em.labelAr : em.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload */}
                <div>
                  <Label>{t.attachments} <span className="text-muted-foreground">({t.optional})</span></Label>
                  <p className="text-sm text-muted-foreground mb-2">{t.attachmentsDesc}</p>

                  {/* Upload Area */}
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-primary');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-primary');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-primary');
                      handleFileUpload(e.dataTransfer.files);
                    }}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">{t.dragDrop}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.maxFileSize}</p>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </div>

                  {/* Uploaded Files List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file) => {
                        const FileIcon = getFileIcon(file.type);
                        return (
                          <div
                            key={file.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              file.status === 'error' ? 'border-red-200 bg-red-50' : 'border-border bg-muted/30'
                            }`}
                          >
                            <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                                {file.status === 'uploading' && ` • ${t.uploading}`}
                                {file.status === 'error' && ` • ${t.uploadError}`}
                              </p>
                            </div>
                            {file.status === 'uploading' ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            ) : file.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : null}
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1 hover:bg-muted rounded"
                              title={t.removeFile}
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Budget & Timeline */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">{t.urgency}</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {URGENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setUrgency(opt.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          urgency === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">
                          {isArabic ? opt.labelAr : opt.labelEn}
                        </div>
                        <div className="text-sm text-muted-foreground">{opt.days}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{t.budgetRange} <span className="text-muted-foreground">({t.optional})</span></Label>
                  <div className="grid grid-cols-2 gap-4 mt-1.5">
                    <div>
                      <Input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder={t.budgetMin}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder={t.budgetMax}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">{t.reviewTitle}</h2>
                  <p className="text-muted-foreground">{t.reviewDesc}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start py-3 border-b">
                    <div>
                      <div className="text-sm text-muted-foreground">{t.serviceType.replace('?', '')}</div>
                      <div className="font-medium">
                        {SERVICE_TYPES.find(s => s.value === serviceType)?.[isArabic ? 'labelAr' : 'labelEn']}
                        {' - '}
                        {LEGAL_CATEGORIES.find(c => c.value === category)?.[isArabic ? 'labelAr' : 'labelEn']}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(0)}>{t.editRequest}</Button>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b">
                    <div className="flex-1 pr-4">
                      <div className="text-sm text-muted-foreground">{t.requestTitle}</div>
                      <div className="font-medium">{title}</div>
                      <div className="text-sm text-muted-foreground mt-2">{t.description}</div>
                      <div className="text-sm mt-1">{description}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>{t.editRequest}</Button>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b">
                    <div>
                      <div className="text-sm text-muted-foreground">{t.urgency.replace('?', '')}</div>
                      <div className="font-medium">
                        {URGENCY_OPTIONS.find(u => u.value === urgency)?.[isArabic ? 'labelAr' : 'labelEn']}
                      </div>
                      {(budgetMin || budgetMax) && (
                        <>
                          <div className="text-sm text-muted-foreground mt-2">{t.budgetRange}</div>
                          <div className="font-medium">
                            AED {budgetMin || '0'} - {budgetMax || 'Open'}
                          </div>
                        </>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>{t.editRequest}</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.back}
              </Button>

              {step < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  {t.next}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createRequest.isPending || submitForBidding.isPending}
                >
                  {createRequest.isPending || submitForBidding.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t.submit}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
