'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  FolderKanban,
  Save,
  Users,
  Calendar,
  DollarSign,
  Scale,
  FileText,
  Upload,
  X,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DocumentUploader } from '@/components/upload/document-uploader';
import { type DocumentExtraction } from '@/lib/document-upload';
import {
  type CaseType,
  type CasePriority,
  type CaseDocument,
  generateCaseId,
  formatCaseType,
} from '@/lib/legal-advisor';

const caseTypes: { value: CaseType; label: string; labelAr: string }[] = [
  { value: 'contract_dispute', label: 'Contract Dispute', labelAr: 'نزاع تعاقدي' },
  { value: 'employment_dispute', label: 'Employment Dispute', labelAr: 'نزاع عمالي' },
  { value: 'real_estate_dispute', label: 'Real Estate Dispute', labelAr: 'نزاع عقاري' },
  { value: 'commercial_litigation', label: 'Commercial Litigation', labelAr: 'تقاضي تجاري' },
  { value: 'debt_collection', label: 'Debt Collection', labelAr: 'تحصيل الديون' },
  { value: 'intellectual_property', label: 'Intellectual Property', labelAr: 'ملكية فكرية' },
  { value: 'corporate_matter', label: 'Corporate Matter', labelAr: 'شؤون الشركات' },
  { value: 'regulatory_compliance', label: 'Regulatory Compliance', labelAr: 'الامتثال التنظيمي' },
  { value: 'contract_negotiation', label: 'Contract Negotiation', labelAr: 'تفاوض العقود' },
  { value: 'contract_review', label: 'Contract Review', labelAr: 'مراجعة العقود' },
  { value: 'legal_opinion', label: 'Legal Opinion', labelAr: 'رأي قانوني' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
];

const priorities: { value: CasePriority; label: string; labelAr: string; color: string }[] = [
  { value: 'low', label: 'Low', labelAr: 'منخفضة', color: 'bg-slate-100 text-slate-800' },
  { value: 'medium', label: 'Medium', labelAr: 'متوسطة', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', labelAr: 'عالية', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', labelAr: 'عاجلة', color: 'bg-red-100 text-red-800' },
];

const countries = [
  { code: 'ae', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'sa', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'qa', name: 'Qatar', nameAr: 'قطر' },
  { code: 'kw', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'bh', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'om', name: 'Oman', nameAr: 'عمان' },
];

const documentTypes: { value: CaseDocument['type']; label: string; labelAr: string }[] = [
  { value: 'contract', label: 'Contract', labelAr: 'عقد' },
  { value: 'evidence', label: 'Evidence', labelAr: 'دليل' },
  { value: 'correspondence', label: 'Correspondence', labelAr: 'مراسلات' },
  { value: 'court_filing', label: 'Court Filing', labelAr: 'ملف محكمة' },
  { value: 'legal_brief', label: 'Legal Brief', labelAr: 'مذكرة قانونية' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
];

interface UploadedDocument {
  id: string;
  name: string;
  type: CaseDocument['type'];
  extraction?: DocumentExtraction;
  uploadedAt: Date;
}

export default function NewCasePage() {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === 'ar';

  // Form state
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [caseType, setCaseType] = React.useState<CaseType>('contract_dispute');
  const [priority, setPriority] = React.useState<CasePriority>('medium');
  const [clientName, setClientName] = React.useState('');
  const [opposingParty, setOpposingParty] = React.useState('');
  const [country, setCountry] = React.useState('ae');
  const [jurisdiction, setJurisdiction] = React.useState('');
  const [claimAmount, setClaimAmount] = React.useState('');
  const [currency, setCurrency] = React.useState('AED');
  const [caseNumber, setCaseNumber] = React.useState('');

  // Documents
  const [documents, setDocuments] = React.useState<UploadedDocument[]>([]);
  const [showUploader, setShowUploader] = React.useState(false);
  const [currentDocType, setCurrentDocType] = React.useState<CaseDocument['type']>('contract');

  // Dropdowns
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = React.useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
  const [showDocTypeDropdown, setShowDocTypeDropdown] = React.useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const typeRef = React.useRef<HTMLDivElement>(null);
  const priorityRef = React.useRef<HTMLDivElement>(null);
  const countryRef = React.useRef<HTMLDivElement>(null);
  const docTypeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (docTypeRef.current && !docTypeRef.current.contains(event.target as Node)) {
        setShowDocTypeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDocumentExtracted = (extraction: DocumentExtraction) => {
    const newDoc: UploadedDocument = {
      id: extraction.id,
      name: extraction.fileName,
      type: currentDocType,
      extraction,
      uploadedAt: new Date(),
    };
    setDocuments(prev => [...prev, newDoc]);
    setShowUploader(false);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(isRTL ? 'يرجى إدخال عنوان القضية' : 'Please enter a case title');
      return;
    }

    if (!clientName.trim()) {
      setError(isRTL ? 'يرجى إدخال اسم العميل' : 'Please enter the client name');
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, this would call the API to create the case
      const caseId = generateCaseId();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to the new case
      router.push(`/${locale}/dashboard/advisor/cases/${caseId}`);
    } catch (err) {
      setError(isRTL ? 'حدث خطأ أثناء إنشاء القضية' : 'Error creating case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeInfo = caseTypes.find(t => t.value === caseType);
  const selectedPriorityInfo = priorities.find(p => p.value === priority);
  const selectedCountryInfo = countries.find(c => c.code === country);
  const selectedDocTypeInfo = documentTypes.find(d => d.value === currentDocType);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/dashboard/advisor/cases`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            {isRTL ? 'قضية جديدة' : 'New Case'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'أنشئ ملف قضية جديد وأضف المستندات' : 'Create a new case file and add documents'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'عنوان القضية' : 'Case Title'} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isRTL ? 'مثال: نزاع إيجار - برج المارينا' : 'e.g., Rental Dispute - Marina Tower'}
                    className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'وصف القضية' : 'Case Description'}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isRTL ? 'وصف تفصيلي للقضية...' : 'Detailed description of the case...'}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Type and Priority */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Case Type */}
                  <div className="relative" ref={typeRef}>
                    <label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'نوع القضية' : 'Case Type'}
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="w-full justify-between"
                    >
                      {isRTL ? selectedTypeInfo?.labelAr : selectedTypeInfo?.label}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    {showTypeDropdown && (
                      <div className="absolute top-full mt-1 z-50 w-full bg-popover border rounded-lg shadow-lg p-1 max-h-60 overflow-y-auto">
                        {caseTypes.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              setCaseType(type.value);
                              setShowTypeDropdown(false);
                            }}
                            className={cn(
                              "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent",
                              caseType === type.value && "bg-accent"
                            )}
                          >
                            {isRTL ? type.labelAr : type.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="relative" ref={priorityRef}>
                    <label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'الأولوية' : 'Priority'}
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                      className="w-full justify-between"
                    >
                      <Badge className={selectedPriorityInfo?.color}>
                        {isRTL ? selectedPriorityInfo?.labelAr : selectedPriorityInfo?.label}
                      </Badge>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    {showPriorityDropdown && (
                      <div className="absolute top-full mt-1 z-50 w-full bg-popover border rounded-lg shadow-lg p-1">
                        {priorities.map(p => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => {
                              setPriority(p.value);
                              setShowPriorityDropdown(false);
                            }}
                            className={cn(
                              "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent flex items-center",
                              priority === p.value && "bg-accent"
                            )}
                          >
                            <Badge className={p.color}>
                              {isRTL ? p.labelAr : p.label}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {isRTL ? 'الأطراف' : 'Parties'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'اسم العميل / الموكل' : 'Client Name'} *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={isRTL ? 'اسم العميل' : 'Client name'}
                      className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'الطرف المقابل' : 'Opposing Party'}
                    </label>
                    <input
                      type="text"
                      value={opposingParty}
                      onChange={(e) => setOpposingParty(e.target.value)}
                      placeholder={isRTL ? 'اسم الطرف المقابل (إن وجد)' : 'Opposing party name (if any)'}
                      className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Jurisdiction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  {isRTL ? 'الاختصاص القضائي' : 'Jurisdiction'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Country */}
                  <div className="relative" ref={countryRef}>
                    <label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'الدولة' : 'Country'}
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full justify-between"
                    >
                      {isRTL ? selectedCountryInfo?.nameAr : selectedCountryInfo?.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    {showCountryDropdown && (
                      <div className="absolute top-full mt-1 z-50 w-full bg-popover border rounded-lg shadow-lg p-1">
                        {countries.map(c => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountry(c.code);
                              setShowCountryDropdown(false);
                            }}
                            className={cn(
                              "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent",
                              country === c.code && "bg-accent"
                            )}
                          >
                            {isRTL ? c.nameAr : c.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Jurisdiction Details */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'المحكمة / الجهة' : 'Court / Authority'}
                    </label>
                    <input
                      type="text"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      placeholder={isRTL ? 'مثال: محكمة دبي الابتدائية' : 'e.g., Dubai Court of First Instance'}
                      className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'رقم القضية (إن وجد)' : 'Case Number (if any)'}
                  </label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder={isRTL ? 'رقم القضية في المحكمة' : 'Court case number'}
                    className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {isRTL ? 'المعلومات المالية' : 'Financial Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'قيمة المطالبة' : 'Claim Amount'}
                    </label>
                    <input
                      type="number"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'العملة' : 'Currency'}
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="AED">AED - UAE Dirham</option>
                      <option value="SAR">SAR - Saudi Riyal</option>
                      <option value="QAR">QAR - Qatari Riyal</option>
                      <option value="KWD">KWD - Kuwaiti Dinar</option>
                      <option value="BHD">BHD - Bahraini Dinar</option>
                      <option value="OMR">OMR - Omani Rial</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Documents */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {isRTL ? 'المستندات' : 'Documents'}
                </CardTitle>
                <CardDescription>
                  {isRTL
                    ? 'أضف المستندات المتعلقة بالقضية'
                    : 'Add documents related to the case'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document List */}
                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {documentTypes.find(t => t.value === doc.type)?.[isRTL ? 'labelAr' : 'label']}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(doc.id)}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {!showUploader ? (
                  <div className="space-y-3">
                    {/* Document Type Selection */}
                    <div className="relative" ref={docTypeRef}>
                      <label className="text-sm font-medium mb-2 block">
                        {isRTL ? 'نوع المستند' : 'Document Type'}
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDocTypeDropdown(!showDocTypeDropdown)}
                        className="w-full justify-between"
                      >
                        {isRTL ? selectedDocTypeInfo?.labelAr : selectedDocTypeInfo?.label}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      {showDocTypeDropdown && (
                        <div className="absolute top-full mt-1 z-50 w-full bg-popover border rounded-lg shadow-lg p-1">
                          {documentTypes.map(dt => (
                            <button
                              key={dt.value}
                              type="button"
                              onClick={() => {
                                setCurrentDocType(dt.value);
                                setShowDocTypeDropdown(false);
                              }}
                              className={cn(
                                "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent",
                                currentDocType === dt.value && "bg-accent"
                              )}
                            >
                              {isRTL ? dt.labelAr : dt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUploader(true)}
                      className="w-full gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isRTL ? 'رفع مستند' : 'Upload Document'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <DocumentUploader
                      onExtracted={handleDocumentExtracted}
                      purpose="reference"
                      language={locale as 'en' | 'ar'}
                      compact={false}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowUploader(false)}
                      className="w-full"
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                )}

                {documents.length === 0 && !showUploader && (
                  <p className="text-xs text-muted-foreground text-center">
                    {isRTL
                      ? 'لم يتم إضافة مستندات بعد'
                      : 'No documents added yet'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <Card>
              <CardContent className="pt-6">
                {error && (
                  <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isRTL ? 'إنشاء القضية' : 'Create Case'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {isRTL
                    ? 'يمكنك إضافة المزيد من المستندات والتفاصيل لاحقاً'
                    : 'You can add more documents and details later'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
