'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Shield,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Upload,
  PenTool,
  QrCode,
  Calendar,
  AlertTriangle,
  Info,
  Stamp,
  Lock,
  Globe,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface Engagement {
  id: string;
  documentTitle: string;
  documentType: string;
  clientName: string;
  status: 'ready_to_certify' | 'certified';
  completedAt?: string;
}

const mockEngagements: Engagement[] = [
  {
    id: 'eng_1',
    documentTitle: 'Commercial Lease Agreement - Dubai Marina',
    documentType: 'Tenancy Contract',
    clientName: 'Ahmed M.',
    status: 'ready_to_certify',
  },
  {
    id: 'eng_2',
    documentTitle: 'Employment Contract - Senior Developer',
    documentType: 'Employment Contract',
    clientName: 'Sara K.',
    status: 'ready_to_certify',
  },
];

const certificationTypes = [
  {
    id: 'reviewed',
    name: 'Legal Review',
    nameAr: 'مراجعة قانونية',
    description: 'Document has been legally reviewed',
    descriptionAr: 'تمت مراجعة المستند قانونياً',
    icon: FileText,
    isLegallyBinding: false,
  },
  {
    id: 'attested',
    name: 'Legal Attestation',
    nameAr: 'تصديق قانوني',
    description: 'Legally attested by licensed attorney',
    descriptionAr: 'موثق قانونياً من محامي مرخص',
    icon: Shield,
    isLegallyBinding: true,
  },
  {
    id: 'notarized',
    name: 'Notarization',
    nameAr: 'توثيق رسمي',
    description: 'Notarized for official use',
    descriptionAr: 'موثق للاستخدام الرسمي',
    icon: Stamp,
    isLegallyBinding: true,
  },
];

const jurisdictions = [
  { id: 'dubai', name: 'Dubai, UAE', nameAr: 'دبي، الإمارات' },
  { id: 'abu_dhabi', name: 'Abu Dhabi, UAE', nameAr: 'أبوظبي، الإمارات' },
  { id: 'sharjah', name: 'Sharjah, UAE', nameAr: 'الشارقة، الإمارات' },
  { id: 'uae_federal', name: 'UAE Federal', nameAr: 'الإمارات الفدرالية' },
  { id: 'gcc', name: 'GCC Region', nameAr: 'دول مجلس التعاون' },
];

export default function CertifyDocumentPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [step, setStep] = useState(1);
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [certificationType, setCertificationType] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [validityPeriod, setValidityPeriod] = useState('12');
  const [lawyerStatement, setLawyerStatement] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [certificationComplete, setCertificationComplete] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSelectEngagement = (engagement: Engagement) => {
    setSelectedEngagement(engagement);
    setStep(2);
  };

  const handleSubmitCertification = () => {
    // Generate verification code
    const code = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setVerificationCode(code);
    setCertificationComplete(true);
    setStep(4);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCertType = certificationTypes.find(t => t.id === certificationType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/dashboard/lawyer-portal`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {isArabic ? 'توثيق المستند' : 'Certify Document'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? 'إضافة توثيق قانوني للمستندات المكتملة'
                  : 'Add legal certification to completed documents'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        {!certificationComplete && (
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    step >= s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      'w-20 h-1 mx-2 rounded transition-all',
                      step > s ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Select Document */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {isArabic ? 'اختر المستند للتوثيق' : 'Select Document to Certify'}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? 'اختر المستند المكتمل الذي تريد توثيقه'
                    : 'Choose a completed engagement to certify'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockEngagements.map((engagement) => (
                  <Card
                    key={engagement.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                      selectedEngagement?.id === engagement.id && 'border-primary ring-2 ring-primary/20'
                    )}
                    onClick={() => handleSelectEngagement(engagement)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{engagement.documentTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              {engagement.documentType} • {engagement.clientName}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          {isArabic ? 'جاهز للتوثيق' : 'Ready to Certify'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mockEngagements.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {isArabic
                        ? 'لا توجد مستندات جاهزة للتوثيق'
                        : 'No documents ready for certification'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Certification Type */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {isArabic ? 'نوع التوثيق' : 'Certification Type'}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? 'اختر نوع التوثيق القانوني المناسب'
                    : 'Choose the appropriate legal certification type'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Info */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    {isArabic ? 'المستند المختار' : 'Selected Document'}
                  </p>
                  <p className="font-medium">{selectedEngagement?.documentTitle}</p>
                </div>

                {/* Certification Types */}
                <div className="grid gap-4">
                  {certificationTypes.map((type) => (
                    <Card
                      key={type.id}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary',
                        certificationType === type.id && 'border-primary ring-2 ring-primary/20'
                      )}
                      onClick={() => setCertificationType(type.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'h-12 w-12 rounded-xl flex items-center justify-center',
                            type.isLegallyBinding ? 'bg-green-100' : 'bg-blue-100'
                          )}>
                            <type.icon className={cn(
                              'h-6 w-6',
                              type.isLegallyBinding ? 'text-green-600' : 'text-blue-600'
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {isArabic ? type.nameAr : type.name}
                              </h3>
                              {type.isLegallyBinding && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Lock className="h-3 w-3 mr-1" />
                                  {isArabic ? 'ملزم قانونياً' : 'Legally Binding'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {isArabic ? type.descriptionAr : type.description}
                            </p>
                          </div>
                          <div className={cn(
                            'h-6 w-6 rounded-full border-2 flex items-center justify-center',
                            certificationType === type.id
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/30'
                          )}>
                            {certificationType === type.id && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Jurisdiction & Validity */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? 'الاختصاص القضائي' : 'Jurisdiction'}</Label>
                    <Select value={jurisdiction} onValueChange={setJurisdiction}>
                      <SelectTrigger>
                        <SelectValue placeholder={isArabic ? 'اختر الاختصاص' : 'Select jurisdiction'} />
                      </SelectTrigger>
                      <SelectContent>
                        {jurisdictions.map((j) => (
                          <SelectItem key={j.id} value={j.id}>
                            <span className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              {isArabic ? j.nameAr : j.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'مدة الصلاحية (شهور)' : 'Validity Period (months)'}</Label>
                    <Select value={validityPeriod} onValueChange={setValidityPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 {isArabic ? 'أشهر' : 'months'}</SelectItem>
                        <SelectItem value="12">12 {isArabic ? 'شهر' : 'months'}</SelectItem>
                        <SelectItem value="24">24 {isArabic ? 'شهر' : 'months'}</SelectItem>
                        <SelectItem value="unlimited">{isArabic ? 'غير محدود' : 'Unlimited'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    {isArabic ? 'رجوع' : 'Back'}
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!certificationType || !jurisdiction}
                  >
                    {isArabic ? 'التالي' : 'Continue'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Statement & Signature */}
        {step === 3 && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-primary" />
                  {isArabic ? 'البيان والتوقيع' : 'Statement & Signature'}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? 'أضف بيانك القانوني ووقع على التوثيق'
                    : 'Add your legal statement and sign the certification'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {isArabic ? 'المستند' : 'Document'}
                    </span>
                    <span className="font-medium text-sm">{selectedEngagement?.documentTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {isArabic ? 'نوع التوثيق' : 'Certification'}
                    </span>
                    <span className="font-medium text-sm">
                      {isArabic ? selectedCertType?.nameAr : selectedCertType?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {isArabic ? 'الاختصاص' : 'Jurisdiction'}
                    </span>
                    <span className="font-medium text-sm">
                      {jurisdictions.find(j => j.id === jurisdiction)?.[isArabic ? 'nameAr' : 'name']}
                    </span>
                  </div>
                </div>

                {/* Lawyer Statement */}
                <div className="space-y-2">
                  <Label>{isArabic ? 'البيان القانوني' : 'Legal Statement'}</Label>
                  <Textarea
                    placeholder={isArabic
                      ? 'أضف بيانك القانوني حول المستند...'
                      : 'Add your legal statement regarding the document...'}
                    value={lawyerStatement}
                    onChange={(e) => setLawyerStatement(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? 'سيظهر هذا البيان في شهادة التوثيق'
                      : 'This statement will appear on the certification certificate'}
                  </p>
                </div>

                {/* Digital Signature */}
                <div className="space-y-2">
                  <Label>{isArabic ? 'التوقيع الرقمي' : 'Digital Signature'}</Label>
                  <div className="border-2 border-dashed rounded-xl p-8 text-center">
                    <PenTool className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      {isArabic
                        ? 'سيتم استخدام توقيعك الرقمي المسجل'
                        : 'Your registered digital signature will be used'}
                    </p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      {isArabic ? 'تحديث التوقيع' : 'Update Signature'}
                    </Button>
                  </div>
                </div>

                {/* Warning */}
                {selectedCertType?.isLegallyBinding && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700">
                      <p className="font-medium">
                        {isArabic ? 'تحذير قانوني' : 'Legal Warning'}
                      </p>
                      <p>
                        {isArabic
                          ? 'هذا التوثيق ملزم قانونياً. تأكد من مراجعة المستند بالكامل قبل التوقيع.'
                          : 'This certification is legally binding. Ensure you have thoroughly reviewed the document before signing.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    {isArabic
                      ? 'أقر بأنني راجعت المستند بالكامل وأتحمل المسؤولية القانونية عن هذا التوثيق'
                      : 'I confirm that I have fully reviewed the document and accept legal responsibility for this certification'}
                  </label>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    {isArabic ? 'رجوع' : 'Back'}
                  </Button>
                  <Button
                    onClick={handleSubmitCertification}
                    disabled={!termsAccepted || !lawyerStatement}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    {isArabic ? 'إصدار التوثيق' : 'Issue Certification'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && certificationComplete && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200 bg-green-50/30">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {isArabic ? 'تم التوثيق بنجاح!' : 'Certification Complete!'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {isArabic
                    ? 'تم إصدار شهادة التوثيق للمستند بنجاح'
                    : 'The certification has been successfully issued for the document'}
                </p>

                {/* Verification Code */}
                <Card className="bg-white mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <QrCode className="h-16 w-16 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {isArabic ? 'رمز التحقق' : 'Verification Code'}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-2xl font-mono font-bold text-primary">
                        {verificationCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyCode}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {isArabic
                        ? 'يمكن التحقق من هذه الشهادة عبر موقعنا'
                        : 'This certificate can be verified on our website'}
                    </p>
                  </CardContent>
                </Card>

                {/* Summary */}
                <div className="text-sm text-muted-foreground space-y-1 mb-6">
                  <p>
                    <strong>{isArabic ? 'المستند' : 'Document'}:</strong> {selectedEngagement?.documentTitle}
                  </p>
                  <p>
                    <strong>{isArabic ? 'نوع التوثيق' : 'Type'}:</strong>{' '}
                    {isArabic ? selectedCertType?.nameAr : selectedCertType?.name}
                  </p>
                  <p>
                    <strong>{isArabic ? 'تاريخ الإصدار' : 'Issued'}:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    {isArabic ? 'تحميل الشهادة' : 'Download Certificate'}
                  </Button>
                  <Link href={`/${locale}/dashboard/lawyer-portal`}>
                    <Button className="gap-2 w-full">
                      {isArabic ? 'العودة للبوابة' : 'Back to Portal'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
