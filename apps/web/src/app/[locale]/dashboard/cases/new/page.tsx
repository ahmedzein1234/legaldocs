'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  User,
  Building2,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Loader2,
  Scale,
  AlertCircle,
} from 'lucide-react';
import { casesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function NewCasePage() {
  const locale = useLocale() as 'en' | 'ar' | 'ur';
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');

  // Form state
  const [formData, setFormData] = React.useState({
    title: '',
    titleAr: '',
    description: '',
    caseType: '',
    practiceArea: '',
    jurisdiction: 'AE',
    court: '',
    priority: 'medium',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    opposingParty: '',
    opposingCounsel: '',
    caseValue: '',
    currency: 'AED',
    billingType: 'hourly',
    hourlyRate: '',
    courtCaseNumber: '',
    referenceNumber: '',
    statuteOfLimitations: '',
    notes: '',
  });

  // Labels
  const caseTypes = [
    { value: 'litigation', en: 'Litigation', ar: 'التقاضي' },
    { value: 'corporate', en: 'Corporate', ar: 'الشركات' },
    { value: 'real_estate', en: 'Real Estate', ar: 'العقارات' },
    { value: 'employment', en: 'Employment', ar: 'العمل' },
    { value: 'family', en: 'Family Law', ar: 'قانون الأسرة' },
    { value: 'intellectual_property', en: 'Intellectual Property', ar: 'الملكية الفكرية' },
    { value: 'contract', en: 'Contract', ar: 'العقود' },
    { value: 'immigration', en: 'Immigration', ar: 'الهجرة' },
    { value: 'other', en: 'Other', ar: 'أخرى' },
  ];

  const practiceAreas = [
    { value: 'civil', en: 'Civil', ar: 'مدني' },
    { value: 'criminal', en: 'Criminal', ar: 'جنائي' },
    { value: 'commercial', en: 'Commercial', ar: 'تجاري' },
    { value: 'administrative', en: 'Administrative', ar: 'إداري' },
  ];

  const jurisdictions = [
    { value: 'AE', en: 'UAE', ar: 'الإمارات' },
    { value: 'SA', en: 'Saudi Arabia', ar: 'السعودية' },
    { value: 'QA', en: 'Qatar', ar: 'قطر' },
    { value: 'KW', en: 'Kuwait', ar: 'الكويت' },
    { value: 'BH', en: 'Bahrain', ar: 'البحرين' },
    { value: 'OM', en: 'Oman', ar: 'عمان' },
  ];

  const courts = [
    { value: 'dubai_courts', en: 'Dubai Courts', ar: 'محاكم دبي' },
    { value: 'difc_courts', en: 'DIFC Courts', ar: 'محاكم مركز دبي المالي' },
    { value: 'abu_dhabi_courts', en: 'Abu Dhabi Courts', ar: 'محاكم أبوظبي' },
    { value: 'adgm_courts', en: 'ADGM Courts', ar: 'محاكم سوق أبوظبي العالمي' },
    { value: 'sharjah_courts', en: 'Sharjah Courts', ar: 'محاكم الشارقة' },
    { value: 'federal_courts', en: 'Federal Courts', ar: 'المحاكم الاتحادية' },
    { value: 'labour_court', en: 'Labour Court', ar: 'محكمة العمل' },
    { value: 'other', en: 'Other', ar: 'أخرى' },
  ];

  const priorities = [
    { value: 'low', en: 'Low', ar: 'منخفضة' },
    { value: 'medium', en: 'Medium', ar: 'متوسطة' },
    { value: 'high', en: 'High', ar: 'عالية' },
    { value: 'urgent', en: 'Urgent', ar: 'عاجلة' },
  ];

  const billingTypes = [
    { value: 'hourly', en: 'Hourly', ar: 'بالساعة' },
    { value: 'fixed', en: 'Fixed Fee', ar: 'رسم ثابت' },
    { value: 'contingency', en: 'Contingency', ar: 'نسبة من النتيجة' },
    { value: 'retainer', en: 'Retainer', ar: 'اشتراك' },
  ];

  const currencies = [
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'QAR', label: 'QAR - Qatari Riyal' },
    { value: 'KWD', label: 'KWD - Kuwaiti Dinar' },
    { value: 'BHD', label: 'BHD - Bahraini Dinar' },
    { value: 'OMR', label: 'OMR - Omani Rial' },
    { value: 'USD', label: 'USD - US Dollar' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        titleAr: formData.titleAr || undefined,
        description: formData.description || undefined,
        caseType: formData.caseType,
        practiceArea: formData.practiceArea || undefined,
        jurisdiction: formData.jurisdiction,
        court: formData.court || undefined,
        priority: formData.priority,
        clientName: formData.clientName || undefined,
        clientEmail: formData.clientEmail || undefined,
        clientPhone: formData.clientPhone || undefined,
        opposingParty: formData.opposingParty || undefined,
        opposingCounsel: formData.opposingCounsel || undefined,
        caseValue: formData.caseValue ? parseFloat(formData.caseValue) : undefined,
        currency: formData.currency,
        billingType: formData.billingType,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        courtCaseNumber: formData.courtCaseNumber || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        statuteOfLimitations: formData.statuteOfLimitations || undefined,
        tags: tags.length > 0 ? tags : undefined,
        notes: formData.notes || undefined,
      };

      const response = await casesApi.create(payload);

      if (response.success) {
        // Navigate to the new case detail page
        router.push(`/${locale}/dashboard/cases/${response.data.case.id}`);
      }
    } catch (err) {
      console.error('Error creating case:', err);
      setError(err instanceof Error ? err.message : locale === 'ar' ? 'حدث خطأ أثناء إنشاء القضية' : 'Failed to create case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Link href={`/${locale}/dashboard/cases`} className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {locale === 'ar' ? 'العودة للقضايا' : 'Back to Cases'}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {locale === 'ar' ? 'إنشاء قضية جديدة' : 'Create New Case'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'أدخل تفاصيل القضية لبدء التتبع' : 'Enter case details to start tracking'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{locale === 'ar' ? 'خطأ' : 'Error'}</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">
                  {locale === 'ar' ? 'عنوان القضية *' : 'Case Title *'}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: شركة أ ضد شركة ب' : 'e.g., Company A vs. Company B'}
                  required
                />
              </div>

              <div>
                <Label htmlFor="caseType">
                  {locale === 'ar' ? 'نوع القضية *' : 'Case Type *'}
                </Label>
                <Select value={formData.caseType} onValueChange={(v) => handleInputChange('caseType', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'ar' ? 'اختر النوع' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {caseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {locale === 'ar' ? type.ar : type.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="practiceArea">
                  {locale === 'ar' ? 'مجال الممارسة' : 'Practice Area'}
                </Label>
                <Select value={formData.practiceArea} onValueChange={(v) => handleInputChange('practiceArea', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'ar' ? 'اختر المجال' : 'Select area'} />
                  </SelectTrigger>
                  <SelectContent>
                    {practiceAreas.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {locale === 'ar' ? area.ar : area.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="jurisdiction">
                  {locale === 'ar' ? 'الاختصاص القضائي' : 'Jurisdiction'}
                </Label>
                <Select value={formData.jurisdiction} onValueChange={(v) => handleInputChange('jurisdiction', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictions.map((j) => (
                      <SelectItem key={j.value} value={j.value}>
                        {locale === 'ar' ? j.ar : j.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="court">
                  {locale === 'ar' ? 'المحكمة' : 'Court'}
                </Label>
                <Select value={formData.court} onValueChange={(v) => handleInputChange('court', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'ar' ? 'اختر المحكمة' : 'Select court'} />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.value} value={court.value}>
                        {locale === 'ar' ? court.ar : court.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">
                  {locale === 'ar' ? 'الأولوية' : 'Priority'}
                </Label>
                <Select value={formData.priority} onValueChange={(v) => handleInputChange('priority', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {locale === 'ar' ? p.ar : p.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="courtCaseNumber">
                  {locale === 'ar' ? 'رقم القضية في المحكمة' : 'Court Case Number'}
                </Label>
                <Input
                  id="courtCaseNumber"
                  value={formData.courtCaseNumber}
                  onChange={(e) => handleInputChange('courtCaseNumber', e.target.value)}
                  placeholder="DC-2025-1234"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">
                  {locale === 'ar' ? 'الوصف' : 'Description'}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={locale === 'ar' ? 'وصف مختصر للقضية...' : 'Brief description of the case...'}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {locale === 'ar' ? 'معلومات العميل' : 'Client Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">
                  {locale === 'ar' ? 'اسم العميل' : 'Client Name'}
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder={locale === 'ar' ? 'الاسم الكامل أو اسم الشركة' : 'Full name or company name'}
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">
                  {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  placeholder="+971 XX XXX XXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opposing Party */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              {locale === 'ar' ? 'الطرف المقابل' : 'Opposing Party'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="opposingParty">
                  {locale === 'ar' ? 'اسم الطرف المقابل' : 'Opposing Party Name'}
                </Label>
                <Input
                  id="opposingParty"
                  value={formData.opposingParty}
                  onChange={(e) => handleInputChange('opposingParty', e.target.value)}
                  placeholder={locale === 'ar' ? 'الاسم الكامل أو اسم الشركة' : 'Full name or company name'}
                />
              </div>

              <div>
                <Label htmlFor="opposingCounsel">
                  {locale === 'ar' ? 'محامي الطرف المقابل' : 'Opposing Counsel'}
                </Label>
                <Input
                  id="opposingCounsel"
                  value={formData.opposingCounsel}
                  onChange={(e) => handleInputChange('opposingCounsel', e.target.value)}
                  placeholder={locale === 'ar' ? 'اسم المحامي أو المكتب' : 'Lawyer or firm name'}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {locale === 'ar' ? 'المعلومات المالية' : 'Financial Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="caseValue">
                  {locale === 'ar' ? 'قيمة القضية' : 'Case Value'}
                </Label>
                <div className="flex gap-2">
                  <Select value={formData.currency} onValueChange={(v) => handleInputChange('currency', v)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="caseValue"
                    type="number"
                    value={formData.caseValue}
                    onChange={(e) => handleInputChange('caseValue', e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="billingType">
                  {locale === 'ar' ? 'نوع الفوترة' : 'Billing Type'}
                </Label>
                <Select value={formData.billingType} onValueChange={(v) => handleInputChange('billingType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {billingTypes.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {locale === 'ar' ? b.ar : b.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.billingType === 'hourly' && (
                <div>
                  <Label htmlFor="hourlyRate">
                    {locale === 'ar' ? 'السعر بالساعة' : 'Hourly Rate'}
                  </Label>
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">{formData.currency}</span>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="text-muted-foreground">/ {locale === 'ar' ? 'ساعة' : 'hour'}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Important Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {locale === 'ar' ? 'التواريخ المهمة' : 'Important Dates'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="statuteOfLimitations">
                  {locale === 'ar' ? 'تاريخ تقادم الدعوى' : 'Statute of Limitations'}
                </Label>
                <Input
                  id="statuteOfLimitations"
                  type="date"
                  value={formData.statuteOfLimitations}
                  onChange={(e) => handleInputChange('statuteOfLimitations', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {locale === 'ar' ? 'الوسوم' : 'Tags'}
            </CardTitle>
            <CardDescription>
              {locale === 'ar' ? 'أضف وسوم لتسهيل البحث والتصنيف' : 'Add tags for easier searching and categorization'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={locale === 'ar' ? 'أدخل وسم...' : 'Enter a tag...'}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                {locale === 'ar' ? 'إضافة' : 'Add'}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={locale === 'ar' ? 'أي ملاحظات إضافية حول القضية...' : 'Any additional notes about the case...'}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/${locale}/dashboard/cases`}>
            <Button type="button" variant="outline">
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                {locale === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'إنشاء القضية' : 'Create Case'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
