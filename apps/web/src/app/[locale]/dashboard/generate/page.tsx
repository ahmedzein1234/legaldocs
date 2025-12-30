'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Sparkles,
  FileText,
  Globe,
  Building2,
  User,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Download,
  Edit,
  Edit2,
  Edit3,
  Send,
  Save,
  Phone,
  Mail,
  MessageCircle,
  X,
  Copy,
  MessageSquarePlus,
  Bot,
  SendHorizontal,
  AlertTriangle,
  Flag,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Type,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { documentsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { StepWizard, StepContent } from '@/components/ui/step-wizard';
import { Badge } from '@/components/ui/badge';
import { AlertWithIcon } from '@/components/ui/alert';
import { categoryLabels } from '@/lib/templates-data';
import dynamic from 'next/dynamic';
import { generatePdf } from '@/lib/pdf-generator';
import { DocumentTypeSelector } from '@/components/generate/document-type-selector';
import { EnhancedWizard, WizardNavigation, StepContentWrapper } from '@/components/generate/enhanced-wizard';
import { PartyInfoForm } from '@/components/generate/party-info-form';
import { SavedProfiles, SavedProfile } from '@/components/generate/saved-profiles';
import { RecentFill, RecentDocumentCards, saveToRecentDocuments } from '@/components/generate/recent-fill';
import { IdScanner } from '@/components/generate/id-scanner';

// Dynamically import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(
  () => import('@/components/editor/tiptap-editor').then(mod => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => React.createElement('div', { className: 'animate-pulse bg-muted rounded-lg h-[400px]' })
  }
);

const documentTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  deposit_receipt: DollarSign,
  rental_agreement: Building2,
  nda: FileText,
  service_agreement: Users,
  employment_contract: User,
  power_of_attorney: FileText,
  custom: MessageSquarePlus,
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PartyInfo {
  name: string;
  idNumber: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
}

type CountryCode = 'ae' | 'sa' | 'qa' | 'kw' | 'bh' | 'om';

interface CountryInfo {
  code: CountryCode;
  name: string;
  nameAr: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  languageRequired: 'ar_only' | 'ar_primary' | 'bilingual';
  jurisdictions?: { id: string; name: string; nameAr: string }[];
}

const countries: CountryInfo[] = [
  {
    code: 'ae',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات',
    flag: '🇦🇪',
    currency: 'AED',
    currencySymbol: 'د.إ',
    languageRequired: 'bilingual',
    jurisdictions: [
      { id: 'dubai', name: 'Dubai', nameAr: 'دبي' },
      { id: 'abu_dhabi', name: 'Abu Dhabi', nameAr: 'أبوظبي' },
      { id: 'sharjah', name: 'Sharjah', nameAr: 'الشارقة' },
      { id: 'ajman', name: 'Ajman', nameAr: 'عجمان' },
      { id: 'rak', name: 'Ras Al Khaimah', nameAr: 'رأس الخيمة' },
      { id: 'fujairah', name: 'Fujairah', nameAr: 'الفجيرة' },
      { id: 'uaq', name: 'Umm Al Quwain', nameAr: 'أم القيوين' },
      { id: 'difc', name: 'DIFC', nameAr: 'مركز دبي المالي' },
      { id: 'adgm', name: 'ADGM', nameAr: 'سوق أبوظبي العالمي' },
    ],
  },
  {
    code: 'sa',
    name: 'Saudi Arabia',
    nameAr: 'السعودية',
    flag: '🇸🇦',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    languageRequired: 'ar_only',
    jurisdictions: [
      { id: 'riyadh', name: 'Riyadh', nameAr: 'الرياض' },
      { id: 'jeddah', name: 'Jeddah', nameAr: 'جدة' },
      { id: 'dammam', name: 'Dammam', nameAr: 'الدمام' },
    ],
  },
  {
    code: 'qa',
    name: 'Qatar',
    nameAr: 'قطر',
    flag: '🇶🇦',
    currency: 'QAR',
    currencySymbol: 'ر.ق',
    languageRequired: 'bilingual',
    jurisdictions: [
      { id: 'doha', name: 'Doha', nameAr: 'الدوحة' },
      { id: 'qfc', name: 'Qatar Financial Centre', nameAr: 'مركز قطر للمال' },
    ],
  },
  {
    code: 'kw',
    name: 'Kuwait',
    nameAr: 'الكويت',
    flag: '🇰🇼',
    currency: 'KWD',
    currencySymbol: 'د.ك',
    languageRequired: 'bilingual',
  },
  {
    code: 'bh',
    name: 'Bahrain',
    nameAr: 'البحرين',
    flag: '🇧🇭',
    currency: 'BHD',
    currencySymbol: 'د.ب',
    languageRequired: 'bilingual',
  },
  {
    code: 'om',
    name: 'Oman',
    nameAr: 'عُمان',
    flag: '🇴🇲',
    currency: 'OMR',
    currencySymbol: 'ر.ع',
    languageRequired: 'bilingual',
  },
];

interface FormData {
  documentType: string;
  language: string;
  country: CountryCode;
  jurisdiction?: string;
  partyA: PartyInfo;
  partyB: PartyInfo;
  propertyAddress?: string;
  amount?: string;
  startDate?: string;
  endDate?: string;
  additionalTerms?: string;
  // Custom document fields
  customTitle?: string;
  customDescription?: string;
}

const emptyParty: PartyInfo = {
  name: '',
  idNumber: '',
  nationality: '',
  address: '',
  phone: '',
  email: '',
  whatsapp: '',
};

const initialFormData: FormData = {
  documentType: '',
  language: 'en',
  country: 'ae',
  jurisdiction: undefined,
  partyA: { ...emptyParty },
  partyB: { ...emptyParty },
  propertyAddress: '',
  amount: '',
  startDate: '',
  endDate: '',
  additionalTerms: '',
  customTitle: '',
  customDescription: '',
};

function GeneratePageContent() {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'ar' | 'ur';
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Get URL params for pre-selection from templates page
  const preSelectedType = searchParams.get('type') || '';
  const preSelectedLang = searchParams.get('lang') || locale;

  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState<FormData>({
    ...initialFormData,
    language: preSelectedLang,
    documentType: preSelectedType,
  });
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [saveError, setSaveError] = React.useState<string>('');
  const [savedDocumentId, setSavedDocumentId] = React.useState<string | null>(null);
  const [showSendDialog, setShowSendDialog] = React.useState(false);
  const [sendMethod, setSendMethod] = React.useState<'email' | 'whatsapp' | 'both'>('both');
  const [copyEmail, setCopyEmail] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);
  // Chat state for custom documents
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Document editing state
  const [isEditing, setIsEditing] = React.useState(false);
  const [editMode, setEditMode] = React.useState<'direct' | 'ai'>('direct');
  const [editableContent, setEditableContent] = React.useState('');
  const [editableHtml, setEditableHtml] = React.useState('');
  const [editHistory, setEditHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [aiEditInput, setAiEditInput] = React.useState('');
  const [isAiEditing, setIsAiEditing] = React.useState(false);
  const [aiEditMessages, setAiEditMessages] = React.useState<ChatMessage[]>([]);
  const aiEditChatRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Get localized document types
  const documentTypes = React.useMemo(() => [
    {
      id: 'deposit_receipt',
      name: t('generator.documentTypes.depositReceipt.name'),
      description: t('generator.documentTypes.depositReceipt.description'),
      category: categoryLabels.real_estate[locale] || 'Real Estate',
    },
    {
      id: 'rental_agreement',
      name: t('generator.documentTypes.rentalAgreement.name'),
      description: t('generator.documentTypes.rentalAgreement.description'),
      category: categoryLabels.real_estate[locale] || 'Real Estate',
    },
    {
      id: 'nda',
      name: t('generator.documentTypes.nda.name'),
      description: t('generator.documentTypes.nda.description'),
      category: categoryLabels.business[locale] || 'Business',
    },
    {
      id: 'service_agreement',
      name: t('generator.documentTypes.serviceAgreement.name'),
      description: t('generator.documentTypes.serviceAgreement.description'),
      category: categoryLabels.business[locale] || 'Business',
    },
    {
      id: 'employment_contract',
      name: t('generator.documentTypes.employmentContract.name'),
      description: t('generator.documentTypes.employmentContract.description'),
      category: categoryLabels.employment[locale] || 'Employment',
    },
    {
      id: 'power_of_attorney',
      name: t('generator.documentTypes.powerOfAttorney.name'),
      description: t('generator.documentTypes.powerOfAttorney.description'),
      category: categoryLabels.legal[locale] || 'Legal',
    },
    {
      id: 'custom',
      name: 'Custom Document',
      description: 'Describe your requirements and AI will generate a custom legal document',
      category: 'Custom',
    },
  ], [t, locale]);

  const languages = [
    { id: 'en', name: t('templates.languages.en'), code: 'EN' },
    { id: 'ar', name: t('templates.languages.ar'), code: 'AR' },
    { id: 'ur', name: t('templates.languages.ur'), code: 'UR' },
  ];

  const steps = [
    {
      id: 'type',
      title: t('generator.steps.type'),
      titleAr: 'نوع المستند',
      description: t('generator.steps.typeDesc'),
      descriptionAr: 'اختر نوع المستند والبلد'
    },
    {
      id: 'details',
      title: t('generator.steps.details'),
      titleAr: 'التفاصيل',
      description: t('generator.steps.detailsDesc'),
      descriptionAr: 'أدخل معلومات الأطراف'
    },
    {
      id: 'generate',
      title: t('generator.steps.generate'),
      titleAr: 'إنشاء',
      description: t('generator.steps.generateDesc'),
      descriptionAr: 'إنشاء المستند'
    },
    {
      id: 'review',
      title: t('generator.steps.review'),
      titleAr: 'مراجعة',
      description: t('generator.steps.reviewDesc'),
      descriptionAr: 'راجع وحرر'
    },
  ];

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      // Generate document
      await handleGenerate();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Scroll to bottom of chat
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle chat message send
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      // Call AI to understand requirements and suggest document structure
      const response = await fetch('https://legaldocs-api.a-m-zein.workers.dev/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'custom_chat',
          language: formData.language,
          customPrompt: userMessage,
          chatHistory: chatMessages,
          parties: {
            partyA: formData.partyA,
            partyB: formData.partyB,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content || data.response || 'I understand your requirements. Please provide any additional details or click "Continue" to proceed with party details.'
      }]);

      // If AI suggests a title, update the form
      if (data.suggestedTitle) {
        updateFormData({ customTitle: data.suggestedTitle });
      }
      if (data.suggestedDescription) {
        updateFormData({ customDescription: data.suggestedDescription });
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I understand. Let me help you create this document. Please provide more details about what you need, or click "Continue" to fill in the party details and I\'ll generate a document based on your requirements.'
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Initialize chat when custom document is selected
  React.useEffect(() => {
    if (formData.documentType === 'custom' && chatMessages.length === 0) {
      setChatMessages([{
        role: 'assistant',
        content: `Hello! I'll help you create a custom legal document. Please describe what kind of document you need. For example:

• "I need a freelance contract for web development services"
• "Create a loan agreement between two individuals"
• "Draft a partnership agreement for a new business"
• "I need a vehicle sale agreement"

What would you like to create today?`
      }]);
    }
  }, [formData.documentType, chatMessages.length]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Build the request based on document type
      const isCustom = formData.documentType === 'custom';

      // Get selected country for currency
      const selectedCountry = countries.find(c => c.code === formData.country);

      const requestBody = {
        documentType: isCustom ? 'custom' : formData.documentType,
        language: formData.language,
        country: formData.country,
        jurisdiction: formData.jurisdiction,
        parties: {
          partyA: formData.partyA,
          partyB: formData.partyB,
        },
        details: {
          propertyAddress: formData.propertyAddress,
          amount: formData.amount,
          currency: selectedCountry?.currency || 'AED',
          startDate: formData.startDate,
          endDate: formData.endDate,
          additionalTerms: formData.additionalTerms,
        },
        // Custom document specific fields
        ...(isCustom && {
          customTitle: formData.customTitle,
          customDescription: formData.customDescription,
          customPrompt: chatMessages.filter(m => m.role === 'user').map(m => m.content).join('\n'),
          chatHistory: chatMessages,
        }),
      };

      const response = await fetch('https://legaldocs-api.a-m-zein.workers.dev/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.somethingWentWrong'));
      }

      setGeneratedContent(data.content);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.somethingWentWrong'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate a title from document type and party names
  const generateDocumentTitle = () => {
    // For custom documents, use the custom title if provided
    if (formData.documentType === 'custom' && formData.customTitle) {
      return `${formData.customTitle} - ${formData.partyA.name} & ${formData.partyB.name}`;
    }
    const docType = documentTypes.find((d) => d.id === formData.documentType);
    const typeName = docType?.name || formData.documentType;
    return `${typeName} - ${formData.partyA.name} & ${formData.partyB.name}`;
  };

  // Save document as draft
  const handleSaveAsDraft = async () => {
    if (typeof window !== 'undefined') {
      console.log('[Save Draft] Starting save, authenticated:', isAuthenticated ? 'yes' : 'no');
    }

    if (!isAuthenticated) {
      setSaveError(t('errors.loginRequired') || 'Please log in to save documents');
      return;
    }

    if (!generatedContent) {
      setSaveError(t('errors.noContent') || 'No content to save');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const title = generateDocumentTitle();
      const lang = formData.language as 'en' | 'ar' | 'ur';

      // Store the generated content with metadata
      const contentObj = {
        text: generatedContent,
        parties: {
          partyA: formData.partyA,
          partyB: formData.partyB,
        },
        details: {
          propertyAddress: formData.propertyAddress,
          amount: formData.amount,
          startDate: formData.startDate,
          endDate: formData.endDate,
          additionalTerms: formData.additionalTerms,
        },
        generatedAt: new Date().toISOString(),
      };

      // Build the request payload
      const payload = {
        title,
        titleAr: lang === 'ar' ? title : undefined,
        titleUr: lang === 'ur' ? title : undefined,
        documentType: formData.documentType,
        contentEn: lang === 'en' ? contentObj : undefined,
        contentAr: lang === 'ar' ? contentObj : undefined,
        contentUr: lang === 'ur' ? contentObj : undefined,
        languages: [formData.language],
        bindingLanguage: formData.language === 'ar' ? 'ar' : 'en',
      };

      if (typeof window !== 'undefined') {
        console.log('[Save Draft] Payload:', JSON.stringify(payload, null, 2));
      }

      const { document } = await documentsApi.create(payload);

      if (typeof window !== 'undefined') {
        console.log('[Save Draft] Success, document ID:', document.id);
      }
      setSavedDocumentId(document.id);

      // Save to recent documents for quick-fill feature
      const selectedDocType = documentTypes.find((d) => d.id === formData.documentType);
      saveToRecentDocuments({
        type: formData.documentType,
        typeName: selectedDocType?.name || formData.documentType,
        partyA: formData.partyA,
        partyB: formData.partyB,
      });

      // Navigate to documents list or document view
      router.push(`/${locale}/dashboard/documents`);
    } catch (err) {
      if (typeof window !== 'undefined') {
        console.error('[Save Draft] Error:', err);
      }
      setSaveError(err instanceof Error ? err.message : t('errors.saveFailed') || 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // Send for signature (saves first, then navigates to signing flow)
  const handleSendForSignature = async () => {
    if (typeof window !== 'undefined') {
      console.log('[Send for Signature] Starting, authenticated:', isAuthenticated ? 'yes' : 'no');
    }

    if (!isAuthenticated) {
      setSaveError(t('errors.loginRequired') || 'Please log in to send documents');
      return;
    }

    if (!generatedContent) {
      setSaveError(t('errors.noContent') || 'No content to save');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const title = generateDocumentTitle();
      const lang = formData.language as 'en' | 'ar' | 'ur';

      const contentObj = {
        text: generatedContent,
        parties: {
          partyA: formData.partyA,
          partyB: formData.partyB,
        },
        details: {
          propertyAddress: formData.propertyAddress,
          amount: formData.amount,
          startDate: formData.startDate,
          endDate: formData.endDate,
          additionalTerms: formData.additionalTerms,
        },
        generatedAt: new Date().toISOString(),
      };

      const payload = {
        title,
        titleAr: lang === 'ar' ? title : undefined,
        titleUr: lang === 'ur' ? title : undefined,
        documentType: formData.documentType,
        contentEn: lang === 'en' ? contentObj : undefined,
        contentAr: lang === 'ar' ? contentObj : undefined,
        contentUr: lang === 'ur' ? contentObj : undefined,
        languages: [formData.language],
        bindingLanguage: formData.language === 'ar' ? 'ar' : 'en',
      };

      if (typeof window !== 'undefined') {
        console.log('[Send for Signature] Payload:', JSON.stringify(payload, null, 2));
      }

      const { document } = await documentsApi.create(payload);

      if (typeof window !== 'undefined') {
        console.log('[Send for Signature] Success, document ID:', document.id);
      }

      // Navigate to the document's signing setup page
      router.push(`/${locale}/dashboard/documents/${document.id}/send`);
    } catch (err) {
      if (typeof window !== 'undefined') {
        console.error('[Send for Signature] Error:', err);
      }
      setSaveError(err instanceof Error ? err.message : t('errors.saveFailed') || 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate and download PDF using pdfMake
  const handleDownloadPdf = async () => {
    const contentToUse = isEditing ? editableContent : generatedContent;
    if (!contentToUse) return;

    const docType = documentTypes.find((d) => d.id === formData.documentType);

    try {
      await generatePdf({
        title: docType?.name || 'Legal Document',
        content: contentToUse,
        htmlContent: editableHtml,
        language: formData.language as 'en' | 'ar' | 'ur',
        country: formData.country,
        jurisdiction: formData.jurisdiction,
        partyA: formData.partyA,
        partyB: formData.partyB,
        amount: formData.amount,
        isDraft: true,
        includeWitnesses: true,
        documentType: formData.documentType,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      setSaveError('Failed to generate PDF. Please try again.');
    }
  };

  // Legacy PDF generation (print-based) - kept for fallback
  const handleDownloadPdfLegacy = async () => {
    if (!generatedContent) return;

    const docType = documentTypes.find((d) => d.id === formData.documentType);
    const selectedCountry = countries.find(c => c.code === formData.country);
    const isRTL = formData.language === 'ar' || formData.language === 'ur';
    const docRefNumber = `${formData.country.toUpperCase()}-${formData.documentType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const monthNames = formData.language === 'ar'
        ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${formData.language}" dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${docType?.name || 'Legal Document'} - ${docRefNumber}</title>
        <style>
          /* Professional Legal Document Fonts */
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Serif:wght@400;600;700&family=Times+New+Roman&family=Roboto:wght@400;500;700&display=swap');

          /* CSS Reset and Base Styles */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          /* Page Setup - Professional Legal Margins (1 inch = 2.54cm) */
          @page {
            size: A4;
            margin: 2.54cm 2.54cm 2.54cm 2.54cm;

            /* Page numbers in footer */
            @bottom-right {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 10pt;
              font-family: 'Noto Serif', 'Noto Sans Arabic', serif;
              color: #666;
            }

            @bottom-left {
              content: "${docRefNumber}";
              font-size: 9pt;
              font-family: 'Noto Serif', 'Noto Sans Arabic', serif;
              color: #999;
            }
          }

          /* Body - Professional Legal Typography */
          body {
            font-family: ${isRTL ? "'Noto Sans Arabic', 'Noto Serif', serif" : "'Noto Serif', 'Times New Roman', 'Noto Sans Arabic', serif"};
            font-size: 12pt;
            line-height: 1.8;
            color: #000000;
            background: #ffffff;
            counter-reset: page article section clause;
            text-align: ${isRTL ? 'right' : 'left'};
            direction: ${isRTL ? 'rtl' : 'ltr'};
          }

          /* Professional Header with Branding */
          .document-header {
            position: relative;
            border-bottom: 3px double #1e3a8a;
            padding-bottom: 25px;
            margin-bottom: 35px;
            page-break-after: avoid;
          }

          .header-logo-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            flex-direction: ${isRTL ? 'row-reverse' : 'row'};
          }

          .company-logo {
            flex: 1;
          }

          .company-name {
            font-size: 20pt;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
          }

          .company-tagline {
            font-size: 9pt;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .qr-placeholder {
            width: 80px;
            height: 80px;
            border: 2px solid #e2e8f0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            font-size: 8pt;
            color: #94a3b8;
            text-align: center;
            padding: 8px;
            line-height: 1.3;
          }

          .document-title-section {
            text-align: center;
            margin-top: 20px;
          }

          .document-title {
            font-size: 18pt;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
          }

          .document-subtitle {
            font-size: 11pt;
            color: #475569;
            font-weight: 600;
            margin-bottom: 12px;
          }

          /* Document Reference Bar */
          .reference-bar {
            display: flex;
            justify-content: space-between;
            background: linear-gradient(to ${isRTL ? 'left' : 'right'}, #f1f5f9, #e2e8f0);
            padding: 12px 20px;
            border-radius: 6px;
            margin-top: 15px;
            border: 1px solid #cbd5e1;
            flex-direction: ${isRTL ? 'row-reverse' : 'row'};
          }

          .ref-item {
            display: flex;
            flex-direction: column;
            align-items: ${isRTL ? 'flex-end' : 'flex-start'};
          }

          .ref-label {
            font-size: 8pt;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 2px;
          }

          .ref-value {
            font-size: 10pt;
            color: #0f172a;
            font-weight: 600;
            font-family: 'Roboto', 'Noto Sans Arabic', monospace;
          }

          /* Jurisdiction and Country Info */
          .jurisdiction-info {
            background: #fef3c7;
            border-left: ${isRTL ? 'none' : '4px solid #f59e0b'};
            border-right: ${isRTL ? '4px solid #f59e0b' : 'none'};
            padding: 12px 16px;
            margin: 20px 0;
            border-radius: 4px;
          }

          .jurisdiction-info p {
            font-size: 10pt;
            color: #78350f;
            margin: 4px 0;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-direction: ${isRTL ? 'row-reverse' : 'row'};
          }

          .jurisdiction-info strong {
            font-weight: 700;
            color: #92400e;
          }

          /* Parties Section - Professional Layout */
          .parties-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
            page-break-inside: avoid;
          }

          .party-card {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 18px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .party-header {
            font-size: 10pt;
            font-weight: 700;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #dbeafe;
          }

          .party-name {
            font-size: 13pt;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
          }

          .party-info {
            font-size: 10pt;
            color: #334155;
            line-height: 1.6;
            margin: 4px 0;
          }

          .party-info-label {
            font-weight: 600;
            color: #64748b;
            display: inline-block;
            min-width: ${isRTL ? 'auto' : '90px'};
            margin-${isRTL ? 'left' : 'right'}: 8px;
          }

          /* Document Content - Legal Structure */
          .document-content {
            margin: 40px 0;
            text-align: justify;
            line-height: 2;
            hyphens: auto;
            -webkit-hyphens: auto;
            word-wrap: break-word;
          }

          /* Article/Section Numbering */
          .article {
            counter-increment: article;
            margin: 20px 0;
            page-break-inside: avoid;
          }

          .article::before {
            content: "${isRTL ? 'المادة' : 'Article'} " counter(article) ": ";
            font-weight: 700;
            color: #1e3a8a;
          }

          /* Draft Watermark */
          .draft-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120pt;
            font-weight: 900;
            color: rgba(220, 38, 38, 0.08);
            z-index: -1;
            pointer-events: none;
            text-transform: uppercase;
            letter-spacing: 20px;
            user-select: none;
          }

          /* Line Numbers for Legal Review (optional) */
          .line-numbers {
            counter-reset: line;
          }

          .line-numbers p {
            counter-increment: line;
            position: relative;
            padding-${isRTL ? 'right' : 'left'}: 45px;
          }

          .line-numbers p::before {
            content: counter(line);
            position: absolute;
            ${isRTL ? 'right' : 'left'}: 0;
            width: 35px;
            text-align: ${isRTL ? 'left' : 'right'};
            color: #94a3b8;
            font-size: 8pt;
            font-family: 'Roboto', monospace;
          }

          /* Signature Section */
          .signature-section {
            margin-top: 60px;
            page-break-inside: avoid;
          }

          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 30px;
          }

          .signature-block {
            text-align: ${isRTL ? 'right' : 'left'};
          }

          .signature-space {
            height: 80px;
            border-bottom: 2px solid #000000;
            margin-bottom: 12px;
            position: relative;
          }

          .signature-date-line {
            position: absolute;
            bottom: -30px;
            ${isRTL ? 'right' : 'left'}: 0;
            font-size: 9pt;
            color: #64748b;
          }

          .signature-name {
            font-weight: 700;
            font-size: 11pt;
            color: #0f172a;
            margin-bottom: 4px;
          }

          .signature-label {
            font-size: 9pt;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .signature-details {
            font-size: 9pt;
            color: #475569;
            margin-top: 8px;
            line-height: 1.4;
          }

          /* Witness Section */
          .witness-section {
            margin-top: 50px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 30px;
          }

          .witness-title {
            font-weight: 700;
            font-size: 11pt;
            color: #1e3a8a;
            margin-bottom: 20px;
            text-transform: uppercase;
          }

          /* Document Footer */
          .document-footer {
            margin-top: 60px;
            padding-top: 25px;
            border-top: 2px solid #e2e8f0;
            font-size: 9pt;
            color: #64748b;
            text-align: center;
          }

          .footer-info {
            margin: 8px 0;
          }

          .footer-disclaimer {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 12px;
            margin-top: 15px;
            text-align: ${isRTL ? 'right' : 'left'};
          }

          .footer-disclaimer p {
            font-size: 8pt;
            color: #991b1b;
            line-height: 1.5;
            margin: 4px 0;
          }

          /* Page Numbers */
          .page-number {
            position: fixed;
            bottom: 20px;
            ${isRTL ? 'left' : 'right'}: 30px;
            font-size: 10pt;
            color: #64748b;
            font-family: 'Roboto', monospace;
          }

          /* Print Styles */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }

            .no-print {
              display: none !important;
            }

            .page-break {
              page-break-before: always;
            }

            .avoid-break {
              page-break-inside: avoid;
            }

            /* Ensure proper page breaks */
            h1, h2, h3, .signature-section, .parties-section {
              page-break-after: avoid;
            }
          }

          /* Accessibility */
          @media screen {
            body {
              max-width: 210mm;
              margin: 20px auto;
              padding: 20mm;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
          }
        </style>
      </head>
      <body>
        <!-- Draft Watermark -->
        <div class="draft-watermark">${isRTL ? 'مسودة' : 'DRAFT'}</div>

        <!-- Document Header -->
        <header class="document-header">
          <div class="header-logo-section">
            <div class="company-logo">
              <div class="company-name">LegalDocs</div>
              <div class="company-tagline">${isRTL ? 'وثائق قانونية مدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي' : 'AI-Powered Legal Documents for GCC'}</div>
            </div>
            <div class="qr-placeholder">
              ${isRTL ? 'رمز QR للتحقق' : 'QR Code for Verification'}
            </div>
          </div>

          <div class="document-title-section">
            <div class="document-title">${docType?.name || 'Legal Document'}</div>
            <div class="document-subtitle">
              ${selectedCountry?.flag} ${isRTL ? selectedCountry?.nameAr : selectedCountry?.name}
              ${formData.jurisdiction ? ` - ${isRTL
                ? countries.find(c => c.code === formData.country)?.jurisdictions?.find(j => j.id === formData.jurisdiction)?.nameAr
                : countries.find(c => c.code === formData.country)?.jurisdictions?.find(j => j.id === formData.jurisdiction)?.name}`
                : ''}
            </div>
          </div>

          <div class="reference-bar">
            <div class="ref-item">
              <div class="ref-label">${isRTL ? 'رقم المرجع' : 'Reference No.'}</div>
              <div class="ref-value">${docRefNumber}</div>
            </div>
            <div class="ref-item">
              <div class="ref-label">${isRTL ? 'التاريخ' : 'Date'}</div>
              <div class="ref-value">${formatDate(new Date())}</div>
            </div>
            <div class="ref-item">
              <div class="ref-label">${isRTL ? 'اللغة' : 'Language'}</div>
              <div class="ref-value">${formData.language.toUpperCase()}</div>
            </div>
            <div class="ref-item">
              <div class="ref-label">${isRTL ? 'الحالة' : 'Status'}</div>
              <div class="ref-value" style="color: #dc2626;">${isRTL ? 'مسودة' : 'DRAFT'}</div>
            </div>
          </div>
        </header>

        <!-- Jurisdiction Information -->
        <div class="jurisdiction-info">
          <p><strong>${isRTL ? 'الاختصاص القضائي:' : 'Jurisdiction:'}</strong> ${isRTL ? selectedCountry?.nameAr : selectedCountry?.name}</p>
          <p><strong>${isRTL ? 'القانون الحاكم:' : 'Governing Law:'}</strong> ${isRTL
            ? `قوانين ${selectedCountry?.nameAr}${formData.jurisdiction ? ` - ${countries.find(c => c.code === formData.country)?.jurisdictions?.find(j => j.id === formData.jurisdiction)?.nameAr}` : ''}`
            : `Laws of ${selectedCountry?.name}${formData.jurisdiction ? ` - ${countries.find(c => c.code === formData.country)?.jurisdictions?.find(j => j.id === formData.jurisdiction)?.name}` : ''}`
          }</p>
          ${selectedCountry?.languageRequired === 'ar_only' ? `
            <p><strong>${isRTL ? 'ملاحظة:' : 'Note:'}</strong> ${isRTL
              ? 'هذا المستند باللغة العربية كما هو مطلوب بموجب القانون. اللغة العربية هي اللغة الملزمة قانونًا.'
              : 'This document is in Arabic as required by law. Arabic is the legally binding language.'
            }</p>
          ` : selectedCountry?.languageRequired === 'ar_primary' ? `
            <p><strong>${isRTL ? 'ملاحظة:' : 'Note:'}</strong> ${isRTL
              ? 'في حالة وجود أي تناقض بين النسخ، تسود النسخة العربية.'
              : 'In case of any discrepancy between versions, the Arabic version shall prevail.'
            }</p>
          ` : ''}
        </div>

        <!-- Parties Section -->
        <section class="parties-section avoid-break">
          <div class="party-card">
            <div class="party-header">${isRTL ? 'الطرف الأول' : 'First Party (Party A)'}</div>
            <div class="party-name">${formData.partyA.name}</div>
            ${formData.partyA.idNumber ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'رقم الهوية:' : 'ID Number:'}</span>
                ${formData.partyA.idNumber}
              </div>
            ` : ''}
            ${formData.partyA.nationality ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'الجنسية:' : 'Nationality:'}</span>
                ${formData.partyA.nationality}
              </div>
            ` : ''}
            ${formData.partyA.address ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'العنوان:' : 'Address:'}</span>
                ${formData.partyA.address}
              </div>
            ` : ''}
            ${formData.partyA.phone ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'الهاتف:' : 'Phone:'}</span>
                ${formData.partyA.phone}
              </div>
            ` : ''}
            ${formData.partyA.email ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'البريد الإلكتروني:' : 'Email:'}</span>
                ${formData.partyA.email}
              </div>
            ` : ''}
          </div>

          <div class="party-card">
            <div class="party-header">${isRTL ? 'الطرف الثاني' : 'Second Party (Party B)'}</div>
            <div class="party-name">${formData.partyB.name}</div>
            ${formData.partyB.idNumber ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'رقم الهوية:' : 'ID Number:'}</span>
                ${formData.partyB.idNumber}
              </div>
            ` : ''}
            ${formData.partyB.nationality ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'الجنسية:' : 'Nationality:'}</span>
                ${formData.partyB.nationality}
              </div>
            ` : ''}
            ${formData.partyB.address ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'العنوان:' : 'Address:'}</span>
                ${formData.partyB.address}
              </div>
            ` : ''}
            ${formData.partyB.phone ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'الهاتف:' : 'Phone:'}</span>
                ${formData.partyB.phone}
              </div>
            ` : ''}
            ${formData.partyB.email ? `
              <div class="party-info">
                <span class="party-info-label">${isRTL ? 'البريد الإلكتروني:' : 'Email:'}</span>
                ${formData.partyB.email}
              </div>
            ` : ''}
          </div>
        </section>

        <!-- Document Content -->
        <main class="document-content">
          ${generatedContent}
        </main>

        <!-- Signature Section -->
        <section class="signature-section avoid-break">
          <div class="signature-grid">
            <div class="signature-block">
              <div class="signature-space">
                <div class="signature-date-line">${isRTL ? 'التاريخ: ___________' : 'Date: ___________'}</div>
              </div>
              <div class="signature-name">${formData.partyA.name}</div>
              <div class="signature-label">${isRTL ? 'توقيع الطرف الأول' : 'First Party Signature'}</div>
              <div class="signature-details">
                ${formData.partyA.idNumber ? `${isRTL ? 'رقم الهوية' : 'ID'}: ${formData.partyA.idNumber}<br>` : ''}
                ${formData.partyA.nationality ? `${isRTL ? 'الجنسية' : 'Nationality'}: ${formData.partyA.nationality}` : ''}
              </div>
            </div>

            <div class="signature-block">
              <div class="signature-space">
                <div class="signature-date-line">${isRTL ? 'التاريخ: ___________' : 'Date: ___________'}</div>
              </div>
              <div class="signature-name">${formData.partyB.name}</div>
              <div class="signature-label">${isRTL ? 'توقيع الطرف الثاني' : 'Second Party Signature'}</div>
              <div class="signature-details">
                ${formData.partyB.idNumber ? `${isRTL ? 'رقم الهوية' : 'ID'}: ${formData.partyB.idNumber}<br>` : ''}
                ${formData.partyB.nationality ? `${isRTL ? 'الجنسية' : 'Nationality'}: ${formData.partyB.nationality}` : ''}
              </div>
            </div>
          </div>
        </section>

        <!-- Witness Section (Optional for GCC legal documents) -->
        <section class="witness-section avoid-break">
          <div class="witness-title">${isRTL ? 'الشهود' : 'Witnesses'}</div>
          <div class="signature-grid">
            <div class="signature-block">
              <div class="signature-space">
                <div class="signature-date-line">${isRTL ? 'التاريخ: ___________' : 'Date: ___________'}</div>
              </div>
              <div class="signature-label">${isRTL ? 'اسم الشاهد الأول' : 'Witness 1 Name'}: ___________________</div>
              <div class="signature-details" style="margin-top: 15px;">
                ${isRTL ? 'رقم الهوية' : 'ID Number'}: ___________________
              </div>
            </div>

            <div class="signature-block">
              <div class="signature-space">
                <div class="signature-date-line">${isRTL ? 'التاريخ: ___________' : 'Date: ___________'}</div>
              </div>
              <div class="signature-label">${isRTL ? 'اسم الشاهد الثاني' : 'Witness 2 Name'}: ___________________</div>
              <div class="signature-details" style="margin-top: 15px;">
                ${isRTL ? 'رقم الهوية' : 'ID Number'}: ___________________
              </div>
            </div>
          </div>
        </section>

        <!-- Document Footer -->
        <footer class="document-footer">
          <div class="footer-info">
            ${isRTL
              ? `تم إنشاء هذا المستند بواسطة منصة LegalDocs AI`
              : `This document was generated using LegalDocs AI platform`
            }
          </div>
          <div class="footer-info">
            ${isRTL
              ? `تاريخ الإنشاء: ${formatDate(new Date())}`
              : `Generated on: ${formatDate(new Date())}`
            }
          </div>
          <div class="footer-info" style="font-family: 'Roboto', monospace; font-size: 8pt;">
            ${isRTL ? 'رقم المرجع' : 'Reference'}: ${docRefNumber}
          </div>

          <div class="footer-disclaimer">
            <p><strong>${isRTL ? 'إخلاء المسؤولية القانوني:' : 'Legal Disclaimer:'}</strong></p>
            <p>${isRTL
              ? 'هذا المستند عبارة عن مسودة تم إنشاؤها بواسطة الذكاء الاصطناعي ويجب مراجعتها من قبل محامٍ مؤهل قبل التوقيع أو الاستخدام. لا تتحمل LegalDocs أي مسؤولية عن صحة أو قابلية تنفيذ هذا المستند. استشر دائمًا مستشارًا قانونيًا مؤهلاً قبل إبرام أي اتفاقية قانونية.'
              : 'This document is an AI-generated draft and must be reviewed by a qualified attorney before signing or use. LegalDocs assumes no liability for the accuracy or enforceability of this document. Always consult with qualified legal counsel before entering into any legal agreement.'
            }</p>
            <p>${isRTL
              ? `للأسئلة القانونية، يُرجى استشارة محامٍ مرخص في ${selectedCountry?.nameAr}.`
              : `For legal questions, please consult a licensed attorney in ${selectedCountry?.name}.`
            }</p>
          </div>
        </footer>

        <!-- Page Number (for screen view) -->
        <div class="page-number no-print">${isRTL ? '١ صفحة' : 'Page 1'}</div>

        <script>
          // Auto-print when page loads
          window.onload = function() {
            // Small delay to ensure all styles are loaded
            setTimeout(function() {
              window.print();
            }, 500);
          };

          // Close window after print dialog is closed
          window.onafterprint = function() {
            // Optional: could close the window, but keeping it open allows users to review
            // window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Copy document content to clipboard
  const handleCopyContent = async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Open send dialog
  const openSendDialog = () => {
    setShowSendDialog(true);
  };

  // Start editing mode
  const handleStartEditing = () => {
    setEditableContent(generatedContent);
    setEditHistory([generatedContent]);
    setHistoryIndex(0);
    setIsEditing(true);
    setAiEditMessages([{
      role: 'assistant',
      content: `I'm ready to help you edit this document. You can ask me to:

- Add or remove clauses
- Change specific terms or amounts
- Make the language more formal or simple
- Add specific legal protections
- Translate sections
- Fix any errors

What would you like to change?`
    }]);
  };

  // Cancel editing
  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditableContent('');
    setEditHistory([]);
    setHistoryIndex(-1);
    setAiEditMessages([]);
  };

  // Apply edits
  const handleApplyEdits = () => {
    setGeneratedContent(editableContent);
    setIsEditing(false);
    setEditHistory([]);
    setHistoryIndex(-1);
    setAiEditMessages([]);
  };

  // Direct text edit with history
  const handleDirectEdit = (newContent: string) => {
    setEditableContent(newContent);
    // Add to history (debounced - only add if significantly different)
    const lastHistoryItem = editHistory[historyIndex];
    if (lastHistoryItem && Math.abs(newContent.length - lastHistoryItem.length) > 10) {
      const newHistory = editHistory.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditableContent(editHistory[historyIndex - 1]);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditableContent(editHistory[historyIndex + 1]);
    }
  };

  // Insert text at cursor position
  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editableContent.substring(start, end);
    const newContent =
      editableContent.substring(0, start) +
      before + selectedText + after +
      editableContent.substring(end);
    setEditableContent(newContent);
    // Save to history
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // AI-powered editing
  const handleAiEdit = async () => {
    if (!aiEditInput.trim() || isAiEditing) return;

    const userRequest = aiEditInput.trim();
    setAiEditInput('');
    setAiEditMessages(prev => [...prev, { role: 'user', content: userRequest }]);
    setIsAiEditing(true);

    try {
      const response = await fetch('https://legaldocs-api.a-m-zein.workers.dev/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'edit_document',
          language: formData.language,
          country: formData.country,
          customPrompt: `You are editing an existing legal document. The user wants to make changes.

CURRENT DOCUMENT:
---
${editableContent}
---

USER REQUEST: ${userRequest}

Please provide the COMPLETE updated document with the requested changes applied. Only output the document text, no explanations.`,
          parties: {
            partyA: formData.partyA,
            partyB: formData.partyB,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to edit document');
      }

      const newContent = data.content || editableContent;
      setEditableContent(newContent);

      // Save to history
      const newHistory = editHistory.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setAiEditMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've updated the document based on your request. The changes have been applied. Would you like any other modifications?`
      }]);
    } catch (err) {
      setAiEditMessages(prev => [...prev, {
        role: 'assistant',
        content: `I encountered an error while editing. Please try again or make the changes manually in the text editor.`
      }]);
    } finally {
      setIsAiEditing(false);
    }
  };

  // Scroll AI edit chat to bottom
  React.useEffect(() => {
    aiEditChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiEditMessages]);

  const selectedDocType = documentTypes.find((d) => d.id === formData.documentType);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.documentType && !!formData.language;
      case 1:
        return (
          formData.partyA.name &&
          formData.partyA.idNumber &&
          formData.partyB.name &&
          formData.partyB.idNumber
        );
      case 2:
        return !isGenerating;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Enhanced Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <Link href={`/${locale}/dashboard`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {t('generator.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('generator.subtitle')}
          </p>
        </div>
        {/* Progress indicator */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
          <span className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'التقدم' : 'Progress'}
          </span>
          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium">{currentStep + 1}/{steps.length}</span>
        </div>
      </div>

      {/* Enhanced Step Wizard */}
      <EnhancedWizard
        steps={steps}
        currentStep={currentStep}
        onStepClick={(step) => step < currentStep && setCurrentStep(step)}
        locale={locale}
        className="mb-6"
      />

      {/* Step Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 md:p-8">
          {/* Step 1: Document Type - Using Enhanced DocumentTypeSelector */}
          {currentStep === 0 && (
            <StepContent>
              <div className="space-y-8">
                {/* Document Type Selection */}
                <DocumentTypeSelector
                  selectedType={formData.documentType}
                  onSelect={(type) => updateFormData({ documentType: type })}
                  locale={locale}
                />

                {/* Chat Interface for Custom Documents */}
                {formData.documentType === 'custom' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Describe Your Document</h3>
                    </div>

                    {/* Chat Messages */}
                    <div className="border rounded-lg bg-muted/30 h-64 overflow-y-auto p-4 space-y-4">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted border'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted border rounded-lg px-4 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Describe the legal document you need..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChatMessage();
                          }
                        }}
                        disabled={isChatLoading}
                      />
                      <Button
                        onClick={handleSendChatMessage}
                        disabled={!chatInput.trim() || isChatLoading}
                        size="icon"
                      >
                        <SendHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Custom Document Title (optional) */}
                    <div className="grid gap-4 pt-2">
                      <div>
                        <Label htmlFor="customTitle">Document Title (optional)</Label>
                        <Input
                          id="customTitle"
                          value={formData.customTitle}
                          onChange={(e) => updateFormData({ customTitle: e.target.value })}
                          placeholder="e.g., Freelance Web Development Agreement"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          AI will suggest a title based on your conversation if not provided
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Country Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Select Country
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {countries.map((country) => {
                      const selectedCountry = formData.country === country.code;
                      return (
                        <Card
                          key={country.code}
                          className={`cursor-pointer transition-all hover:border-primary ${
                            selectedCountry ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => {
                            updateFormData({
                              country: country.code,
                              jurisdiction: undefined,
                              // Auto-set language for Saudi Arabia (Arabic only)
                              ...(country.languageRequired === 'ar_only' && { language: 'ar' })
                            });
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{country.flag}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">
                                  {locale === 'ar' ? country.nameAr : country.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {country.currency} ({country.currencySymbol})
                                </p>
                              </div>
                              {selectedCountry && <Check className="h-5 w-5 text-primary" />}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Language Requirement Warning for Saudi Arabia */}
                  {formData.country === 'sa' && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          Arabic Language Required
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Saudi Arabia requires all legal documents to be in Arabic. Non-compliance can result in fines of SAR 100,000+.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Jurisdiction Selection (for countries with jurisdictions) */}
                {countries.find(c => c.code === formData.country)?.jurisdictions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Select Jurisdiction
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {countries.find(c => c.code === formData.country)?.jurisdictions?.map((jurisdiction) => (
                        <Button
                          key={jurisdiction.id}
                          variant={formData.jurisdiction === jurisdiction.id ? 'default' : 'outline'}
                          onClick={() => updateFormData({ jurisdiction: jurisdiction.id })}
                          className="justify-start"
                        >
                          {locale === 'ar' ? jurisdiction.nameAr : jurisdiction.name}
                        </Button>
                      ))}
                    </div>
                    {formData.country === 'ae' && (formData.jurisdiction === 'difc' || formData.jurisdiction === 'adgm') && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                        <p className="text-blue-800 dark:text-blue-200">
                          <strong>Note:</strong> {formData.jurisdiction === 'difc' ? 'DIFC' : 'ADGM'} operates under common law jurisdiction (English law principles).
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Language Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {t('generator.selectLanguage')}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {languages.map((lang) => {
                      const selectedCountry = countries.find(c => c.code === formData.country);
                      const isDisabled = selectedCountry?.languageRequired === 'ar_only' && lang.id !== 'ar';
                      return (
                        <Button
                          key={lang.id}
                          variant={formData.language === lang.id ? 'default' : 'outline'}
                          onClick={() => updateFormData({ language: lang.id })}
                          className="gap-2"
                          disabled={isDisabled}
                        >
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{lang.code}</span>
                          {lang.name}
                          {isDisabled && <span className="text-xs">(Not allowed)</span>}
                        </Button>
                      );
                    })}
                  </div>
                  {countries.find(c => c.code === formData.country)?.languageRequired === 'ar_primary' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Arabic is the primary legal language. Other languages may be used but Arabic takes precedence in disputes.
                    </p>
                  )}
                </div>
              </div>
            </StepContent>
          )}

          {/* Step 2: Details - Using Enhanced PartyInfoForm */}
          {currentStep === 1 && (
            <StepContent>
              <div className="space-y-6">
                {/* Quick Fill Options */}
                <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-xl border border-dashed">
                  <span className="text-sm font-medium text-muted-foreground">
                    {locale === 'ar' ? 'تعبئة سريعة:' : 'Quick Fill:'}
                  </span>

                  {/* Saved Profiles */}
                  <SavedProfiles
                    locale={locale}
                    onSelect={(profile) => {
                      // Fill Party A with selected profile
                      updateFormData({
                        partyA: {
                          name: profile.data.name,
                          idNumber: profile.data.idNumber,
                          nationality: profile.data.nationality,
                          address: profile.data.address,
                          phone: profile.data.phone,
                          email: profile.data.email,
                          whatsapp: profile.data.whatsapp,
                        }
                      });
                    }}
                  />

                  {/* Recent Documents */}
                  <RecentFill
                    locale={locale}
                    onSelectPartyA={(data) => updateFormData({ partyA: data })}
                    onSelectPartyB={(data) => updateFormData({ partyB: data })}
                    onSelectBoth={(partyA, partyB) => updateFormData({ partyA, partyB })}
                  />

                  {/* ID Scanner */}
                  <IdScanner
                    locale={locale}
                    onExtract={(data) => {
                      // Fill Party A with extracted data
                      updateFormData({
                        partyA: {
                          ...formData.partyA,
                          name: data.name || formData.partyA.name,
                          idNumber: data.idNumber || formData.partyA.idNumber,
                          nationality: data.nationality || formData.partyA.nationality,
                          address: data.address || formData.partyA.address,
                        }
                      });
                    }}
                  />
                </div>

                {/* Party Forms with Enhanced UI */}
                <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
                  {/* Party A - Enhanced Form */}
                  <PartyInfoForm
                    party={formData.partyA}
                    onChange={(party) => updateFormData({ partyA: party })}
                    title={t('generator.partyA')}
                    titleAr="الطرف الأول"
                    subtitle={locale === 'ar' ? 'المالك / المؤجر / البائع' : 'Owner / Landlord / Seller'}
                    subtitleAr="المالك / المؤجر / البائع"
                    locale={locale}
                    partyType="individual"
                  />

                  {/* Party B - Enhanced Form */}
                  <PartyInfoForm
                    party={formData.partyB}
                    onChange={(party) => updateFormData({ partyB: party })}
                    title={t('generator.partyB')}
                    titleAr="الطرف الثاني"
                    subtitle={locale === 'ar' ? 'المستأجر / المشتري' : 'Tenant / Buyer'}
                    subtitleAr="المستأجر / المشتري"
                    locale={locale}
                    partyType="individual"
                  />
                </div>

                {/* Additional Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t('generator.additionalDetails')}</CardTitle>
                    <CardDescription>
                      {t('generator.additionalDetailsDesc')} {selectedDocType?.name || ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {['deposit_receipt', 'rental_agreement', 'sales_contract'].includes(
                        formData.documentType
                      ) && (
                        <div className="sm:col-span-2">
                          <Label htmlFor="propertyAddress">{t('generator.propertyAddress')}</Label>
                          <Input
                            id="propertyAddress"
                            value={formData.propertyAddress}
                            onChange={(e) =>
                              updateFormData({ propertyAddress: e.target.value })
                            }
                            placeholder={t('generator.propertyAddress')}
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="amount">
                          {t('generator.amount')} ({countries.find(c => c.code === formData.country)?.currency || 'AED'})
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {countries.find(c => c.code === formData.country)?.currencySymbol || 'د.إ'}
                          </span>
                          <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => updateFormData({ amount: e.target.value })}
                            placeholder="0.00"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 grid-cols-2">
                        <div>
                          <Label htmlFor="startDate">{t('generator.startDate')}</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => updateFormData({ startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">{t('generator.endDate')}</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => updateFormData({ endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="additionalTerms">{t('generator.additionalTerms')}</Label>
                      <Textarea
                        id="additionalTerms"
                        value={formData.additionalTerms}
                        onChange={(e) => updateFormData({ additionalTerms: e.target.value })}
                        placeholder={t('generator.additionalTermsPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </StepContent>
          )}

          {/* Step 3: Generate */}
          {currentStep === 2 && (
            <StepContent>
              <div className="text-center py-12 space-y-6">
                {isGenerating ? (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{t('generator.generating')}</h3>
                      <p className="text-muted-foreground mt-1">
                        {t('generator.generatingDesc')}
                      </p>
                    </div>
                  </>
                ) : error ? (
                  <>
                    <AlertWithIcon
                      variant="destructive"
                      title={t('generator.generationFailed')}
                      description={error}
                    />
                    <Button onClick={handleGenerate}>{t('generator.tryAgain')}</Button>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10">
                      <Sparkles className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{t('generator.readyToGenerate')}</h3>
                      <p className="text-muted-foreground mt-1">
                        {t('generator.readyToGenerateDesc')}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-start max-w-md mx-auto">
                      <h4 className="font-medium mb-2">{t('generator.summary')}:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>{t('documents.columns.document')}: {selectedDocType?.name}</li>
                        <li className="flex items-center gap-2">
                          Country: <span className="inline-flex items-center gap-1">
                            {countries.find(c => c.code === formData.country)?.flag}
                            {locale === 'ar'
                              ? countries.find(c => c.code === formData.country)?.nameAr
                              : countries.find(c => c.code === formData.country)?.name}
                          </span>
                        </li>
                        {formData.jurisdiction && (
                          <li>
                            Jurisdiction: {locale === 'ar'
                              ? countries.find(c => c.code === formData.country)?.jurisdictions?.find(j => j.id === formData.jurisdiction)?.nameAr
                              : countries.find(c => c.code === formData.country)?.jurisdictions?.find(j => j.id === formData.jurisdiction)?.name}
                          </li>
                        )}
                        <li>
                          {t('templates.languages.all').replace('All ', '')}: {languages.find((l) => l.id === formData.language)?.name}
                        </li>
                        <li>{t('generator.partyA')}: {formData.partyA.name}</li>
                        <li>{t('generator.partyB')}: {formData.partyB.name}</li>
                        {formData.amount && (
                          <li>
                            {t('generator.amount')}: {countries.find(c => c.code === formData.country)?.currency || 'AED'} {formData.amount}
                          </li>
                        )}
                      </ul>
                    </div>
                    <Button onClick={handleGenerate} size="lg" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      {t('actions.generate')}
                    </Button>
                  </>
                )}
              </div>
            </StepContent>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <StepContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-semibold">{t('generator.reviewDocument')}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {!isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleStartEditing}
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit Document
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleCopyContent}
                        >
                          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleDownloadPdf}
                        >
                          <Download className="h-4 w-4" />
                          {t('documents.actions.downloadPdf') || 'Download PDF'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-2"
                          onClick={handleApplyEdits}
                        >
                          <Check className="h-4 w-4" />
                          Apply Changes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleCancelEditing}
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Editing Mode */}
                {isEditing ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* Left: Document Editor */}
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Document Editor
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            {/* Edit Mode Toggle */}
                            <div className="flex border rounded-md overflow-hidden mr-2">
                              <Button
                                variant={editMode === 'direct' ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-none h-7 px-2 text-xs"
                                onClick={() => setEditMode('direct')}
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Text
                              </Button>
                              <Button
                                variant={editMode === 'ai' ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-none h-7 px-2 text-xs"
                                onClick={() => setEditMode('ai')}
                              >
                                <Wand2 className="h-3 w-3 mr-1" />
                                AI
                              </Button>
                            </div>
                            {/* Undo/Redo */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={handleUndo}
                              disabled={historyIndex <= 0}
                            >
                              <Undo className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={handleRedo}
                              disabled={historyIndex >= editHistory.length - 1}
                            >
                              <Redo className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {editMode === 'direct' && (
                          <TiptapEditor
                            content={editableContent}
                            onChange={(text) => handleDirectEdit(text)}
                            onHtmlChange={(html) => setEditableHtml(html)}
                            placeholder="Start editing your document..."
                            direction={formData.language === 'ar' || formData.language === 'ur' ? 'rtl' : 'ltr'}
                            minHeight="400px"
                          />
                        )}
                        {editMode === 'ai' && (
                          <div className="space-y-3">
                            {/* AI Chat Messages */}
                            <div className="border rounded-lg bg-muted/30 h-[300px] overflow-y-auto p-3 space-y-3">
                              {aiEditMessages.map((message, index) => (
                                <div
                                  key={index}
                                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                      message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background border'
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                  </div>
                                </div>
                              ))}
                              {isAiEditing && (
                                <div className="flex justify-start">
                                  <div className="bg-background border rounded-lg px-3 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                </div>
                              )}
                              <div ref={aiEditChatRef} />
                            </div>
                            {/* AI Input */}
                            <div className="flex gap-2">
                              <Input
                                value={aiEditInput}
                                onChange={(e) => setAiEditInput(e.target.value)}
                                placeholder="Tell AI what to change... (e.g., 'Add a penalty clause for late payments')"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAiEdit();
                                  }
                                }}
                                disabled={isAiEditing}
                              />
                              <Button
                                onClick={handleAiEdit}
                                disabled={!aiEditInput.trim() || isAiEditing}
                                size="icon"
                              >
                                {isAiEditing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <SendHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-1">
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => setAiEditInput('Make the language more formal')}
                              >
                                More formal
                              </Badge>
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => setAiEditInput('Simplify the language')}
                              >
                                Simplify
                              </Badge>
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => setAiEditInput('Add a confidentiality clause')}
                              >
                                + Confidentiality
                              </Badge>
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => setAiEditInput('Add a dispute resolution clause')}
                              >
                                + Dispute Resolution
                              </Badge>
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => setAiEditInput('Add penalty for breach of contract')}
                              >
                                + Penalty Clause
                              </Badge>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Right: Live Preview */}
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Live Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div
                          className="prose prose-sm max-w-none dark:prose-invert h-[460px] overflow-y-auto border rounded-lg p-4 bg-white dark:bg-gray-950"
                          dir={formData.language === 'ar' || formData.language === 'ur' ? 'rtl' : 'ltr'}
                          dangerouslySetInnerHTML={{
                            __html: editableHtml || editableContent.replace(/\n/g, '<br/>') || '<p class="text-muted-foreground">Start typing to see preview...</p>'
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  /* Non-editing view */
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        style={{ whiteSpace: 'pre-wrap' }}
                        dir={formData.language === 'ar' || formData.language === 'ur' ? 'rtl' : 'ltr'}
                      >
                        {generatedContent || t('common.loading')}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Error display */}
                {saveError && (
                  <AlertWithIcon
                    variant="destructive"
                    title={t('errors.error') || 'Error'}
                    description={saveError}
                  />
                )}

                {/* Success message if document was saved */}
                {savedDocumentId && (
                  <AlertWithIcon
                    title={t('generator.documentSaved') || 'Document Saved'}
                    description={t('generator.documentSavedDesc') || 'Your document has been saved successfully.'}
                  />
                )}

                <div className="flex justify-between items-center pt-4 border-t flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    disabled={isSaving}
                  >
                    {t('generator.startOver')}
                  </Button>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleSaveAsDraft}
                      disabled={isSaving || !isAuthenticated}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('common.saving') || 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {t('generator.saveAsDraft')}
                        </>
                      )}
                    </Button>
                    <Button
                      className="gap-2"
                      onClick={openSendDialog}
                      disabled={isSaving || !isAuthenticated}
                    >
                      <Send className="h-4 w-4" />
                      {t('editor.sendForSignature') || 'Send for Signature'}
                    </Button>
                  </div>
                </div>

                {/* Login prompt if not authenticated */}
                {!isAuthenticated && (
                  <div className="text-center text-sm text-muted-foreground">
                    <Link
                      href={`/${locale}/auth/login`}
                      className="text-primary hover:underline"
                    >
                      {t('auth.login')}
                    </Link>
                    {' '}{t('generator.toSaveDocument') || 'to save your document'}
                  </div>
                )}
              </div>
            </StepContent>
          )}

          {/* Send for Signature Dialog */}
          {showSendDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setShowSendDialog(false)}
              />
              <Card className="relative z-50 w-full max-w-lg mx-4 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Send for Signature
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSendDialog(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Choose how to send the document to parties for signature
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Send Method Selection */}
                  <div className="space-y-3">
                    <Label>Send Via</Label>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={sendMethod === 'email' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSendMethod('email')}
                        className="gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email Only
                      </Button>
                      <Button
                        variant={sendMethod === 'whatsapp' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSendMethod('whatsapp')}
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp Only
                      </Button>
                      <Button
                        variant={sendMethod === 'both' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSendMethod('both')}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Both
                      </Button>
                    </div>
                  </div>

                  {/* Recipients Summary */}
                  <div className="space-y-3">
                    <Label>Recipients</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{formData.partyA.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(sendMethod === 'email' || sendMethod === 'both') && formData.partyA.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {formData.partyA.email}
                              </span>
                            )}
                            {(sendMethod === 'whatsapp' || sendMethod === 'both') && formData.partyA.whatsapp && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" /> {formData.partyA.whatsapp}
                              </span>
                            )}
                            {!formData.partyA.email && !formData.partyA.whatsapp && (
                              <span className="text-destructive">No contact info provided</span>
                            )}
                          </p>
                        </div>
                        <Badge variant="outline">Party A</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{formData.partyB.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(sendMethod === 'email' || sendMethod === 'both') && formData.partyB.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {formData.partyB.email}
                              </span>
                            )}
                            {(sendMethod === 'whatsapp' || sendMethod === 'both') && formData.partyB.whatsapp && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" /> {formData.partyB.whatsapp}
                              </span>
                            )}
                            {!formData.partyB.email && !formData.partyB.whatsapp && (
                              <span className="text-destructive">No contact info provided</span>
                            )}
                          </p>
                        </div>
                        <Badge variant="outline">Party B</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Send Copy To */}
                  <div className="space-y-2">
                    <Label htmlFor="copyEmail">Send a Copy To (Optional)</Label>
                    <Input
                      id="copyEmail"
                      type="email"
                      value={copyEmail}
                      onChange={(e) => setCopyEmail(e.target.value)}
                      placeholder="your-email@example.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Receive a copy of the document and signature notifications
                    </p>
                  </div>

                  {/* Warning if missing contact info */}
                  {((sendMethod === 'email' || sendMethod === 'both') && (!formData.partyA.email || !formData.partyB.email)) && (
                    <AlertWithIcon
                      variant="destructive"
                      title="Missing Email"
                      description="Please add email addresses for both parties to send via email."
                    />
                  )}
                  {((sendMethod === 'whatsapp' || sendMethod === 'both') && (!formData.partyA.whatsapp || !formData.partyB.whatsapp)) && (
                    <AlertWithIcon
                      variant="destructive"
                      title="Missing WhatsApp"
                      description="Please add WhatsApp numbers for both parties to send via WhatsApp."
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowSendDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => {
                        setShowSendDialog(false);
                        handleSendForSignature();
                      }}
                      disabled={
                        isSaving ||
                        ((sendMethod === 'email' || sendMethod === 'both') && (!formData.partyA.email || !formData.partyB.email)) ||
                        ((sendMethod === 'whatsapp' || sendMethod === 'both') && (!formData.partyA.whatsapp || !formData.partyB.whatsapp))
                      }
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Document
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Navigation */}
          {currentStep < 3 && (
            <WizardNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onBack={handleBack}
              onNext={handleNext}
              isNextDisabled={!canProceed()}
              isLoading={isGenerating}
              locale={locale}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback for Suspense with enhanced skeleton
function GeneratePageLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-8 w-64 bg-muted rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="hidden md:flex h-10 w-40 bg-muted rounded-xl animate-pulse" />
      </div>

      {/* Wizard skeleton */}
      <div className="hidden md:flex items-center justify-between">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
              <div className="space-y-1">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse hidden lg:block" />
              </div>
            </div>
            {i < 4 && <div className="flex-1 h-1 mx-4 bg-muted rounded-full" />}
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-6">
            {/* Search bar skeleton */}
            <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />

            {/* Category pills skeleton */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-24 bg-muted rounded-full animate-pulse" />
              ))}
            </div>

            {/* Cards skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<GeneratePageLoading />}>
      <GeneratePageContent />
    </Suspense>
  );
}
