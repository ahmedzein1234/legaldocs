'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

// Translations
const translations = {
  en: {
    title: 'Company Formation Wizard',
    subtitle: 'Start your business in UAE in minutes',
    steps: {
      businessType: 'Business Type',
      jurisdiction: 'Jurisdiction',
      details: 'Company Details',
      shareholders: 'Shareholders',
      documents: 'Documents',
      review: 'Review & Submit',
    },
    businessType: {
      title: 'What type of business are you starting?',
      description: 'Select the business structure that best fits your needs',
      options: {
        llc: {
          name: 'Limited Liability Company (LLC)',
          description: 'Most popular choice for UAE mainland businesses. Requires local sponsor.',
          features: ['100% foreign ownership possible', 'Trade in UAE market', 'Government contracts eligible'],
        },
        fzco: {
          name: 'Free Zone Company (FZCO)',
          description: 'Best for trading, e-commerce, and international businesses.',
          features: ['100% foreign ownership', '0% corporate tax', 'Full repatriation of profits'],
        },
        branch: {
          name: 'Branch Office',
          description: 'Extension of existing foreign company in UAE.',
          features: ['No capital required', 'Same legal entity as parent', 'Quick setup'],
        },
        freelancer: {
          name: 'Freelance Permit',
          description: 'For individual professionals and consultants.',
          features: ['Low cost setup', 'Work visa included', 'No office required'],
        },
      },
    },
    jurisdiction: {
      title: 'Choose your jurisdiction',
      description: 'Each free zone offers different benefits',
      mainland: 'UAE Mainland',
      freeZones: 'Free Zones',
      zones: {
        mainland: {
          name: 'Dubai Mainland (DED)',
          cost: 'From AED 15,000',
          timeline: '5-7 days',
          features: ['Trade anywhere in UAE', 'Government contracts', 'Local sponsor required'],
        },
        dmcc: {
          name: 'DMCC (Dubai)',
          cost: 'From AED 20,000',
          timeline: '2-3 days',
          features: ['Commodities trading hub', 'Premium business address', 'JLT location'],
        },
        difc: {
          name: 'DIFC (Financial)',
          cost: 'From AED 50,000',
          timeline: '5-7 days',
          features: ['Common law jurisdiction', 'Financial services', 'Prestigious address'],
        },
        rakez: {
          name: 'RAKEZ (Ras Al Khaimah)',
          cost: 'From AED 5,500',
          timeline: '1-2 days',
          features: ['Lowest cost option', 'Quick setup', 'Industrial & office options'],
        },
        ajman: {
          name: 'Ajman Free Zone',
          cost: 'From AED 7,000',
          timeline: '1-2 days',
          features: ['Cost-effective', 'E-commerce friendly', 'Trading licenses'],
        },
        shams: {
          name: 'Sharjah Media City (SHAMS)',
          cost: 'From AED 5,750',
          timeline: '1-2 days',
          features: ['Media & creative licenses', 'Freelancer friendly', 'Virtual office'],
        },
        ifza: {
          name: 'IFZA (Dubai)',
          cost: 'From AED 11,000',
          timeline: '2-3 days',
          features: ['Modern free zone', 'Flexible packages', 'Multiple visas'],
        },
        meydan: {
          name: 'Meydan Free Zone',
          cost: 'From AED 8,500',
          timeline: '2-3 days',
          features: ['Racing district location', 'General trading', 'Visa packages'],
        },
      },
    },
    details: {
      title: 'Company Details',
      description: 'Provide your company information',
      companyName: 'Company Name',
      companyNameAr: 'Company Name (Arabic)',
      namePlaceholder: 'Enter company name',
      nameOptions: 'Name Options',
      nameOption1: 'First choice',
      nameOption2: 'Second choice',
      nameOption3: 'Third choice',
      activities: 'Business Activities',
      activitiesPlaceholder: 'Select business activities',
      activitiesHint: 'You can select up to 3 activities',
      shareCapital: 'Share Capital (AED)',
      shareCapitalHint: 'Minimum varies by free zone',
      officeType: 'Office Type',
      officeOptions: {
        flexi: 'Flexi Desk',
        dedicated: 'Dedicated Desk',
        office: 'Private Office',
        warehouse: 'Warehouse',
      },
    },
    shareholders: {
      title: 'Shareholders & Directors',
      description: 'Add company owners and directors',
      addShareholder: 'Add Shareholder',
      addDirector: 'Add Director',
      shareholder: 'Shareholder',
      director: 'Director',
      fullName: 'Full Name',
      nationality: 'Nationality',
      passportNumber: 'Passport Number',
      emiratesId: 'Emirates ID',
      email: 'Email',
      phone: 'Phone',
      shares: 'Shares (%)',
      isDirector: 'Also a Director',
      uploadPassport: 'Upload Passport',
      uploadEmiratesId: 'Upload Emirates ID',
    },
    documents: {
      title: 'Required Documents',
      description: 'Upload the necessary documents',
      required: 'Required',
      optional: 'Optional',
      uploaded: 'Uploaded',
      pending: 'Pending',
      docs: {
        passport: 'Passport Copy (Color)',
        visa: 'UAE Visa (if applicable)',
        emiratesId: 'Emirates ID (if applicable)',
        photo: 'Passport Photo',
        noc: 'NOC from Sponsor',
        bank: 'Bank Reference Letter',
        businessPlan: 'Business Plan',
        parentCompanyDocs: 'Parent Company Documents',
      },
    },
    review: {
      title: 'Review & Submit',
      description: 'Review your application before submitting',
      summary: 'Application Summary',
      businessType: 'Business Type',
      jurisdiction: 'Jurisdiction',
      companyName: 'Company Name',
      activities: 'Activities',
      shareholders: 'Shareholders',
      documents: 'Documents',
      estimatedCost: 'Estimated Cost',
      timeline: 'Setup Timeline',
      submit: 'Submit Application',
      submitting: 'Submitting...',
      terms: 'I agree to the terms and conditions',
    },
    pricing: {
      title: 'Estimated Costs',
      licenseFee: 'License Fee',
      registrationFee: 'Registration Fee',
      visaFee: 'Visa Fee',
      officeFee: 'Office Fee',
      serviceFee: 'Service Fee',
      total: 'Total Estimated',
      note: 'Final costs may vary based on requirements',
    },
    actions: {
      back: 'Back',
      next: 'Next',
      save: 'Save Draft',
      submit: 'Submit Application',
    },
    success: {
      title: 'Application Submitted!',
      message: 'Your company formation application has been received.',
      reference: 'Reference Number',
      nextSteps: 'Next Steps',
      step1: 'Our team will review your application within 24 hours',
      step2: 'You will receive a call to discuss the next steps',
      step3: 'Document verification and name reservation',
      step4: 'License issuance and visa processing',
      dashboard: 'Go to Dashboard',
      trackStatus: 'Track Status',
    },
  },
  ar: {
    title: 'معالج تأسيس الشركات',
    subtitle: 'ابدأ عملك في الإمارات في دقائق',
    steps: {
      businessType: 'نوع النشاط',
      jurisdiction: 'الولاية القضائية',
      details: 'تفاصيل الشركة',
      shareholders: 'المساهمون',
      documents: 'المستندات',
      review: 'المراجعة والإرسال',
    },
    businessType: {
      title: 'ما نوع النشاط الذي تبدأه؟',
      description: 'اختر هيكل الشركة الذي يناسب احتياجاتك',
      options: {
        llc: {
          name: 'شركة ذات مسؤولية محدودة',
          description: 'الخيار الأكثر شيوعاً للأعمال في البر الرئيسي الإماراتي.',
          features: ['ملكية أجنبية 100% ممكنة', 'التجارة في السوق الإماراتي', 'مؤهلة للعقود الحكومية'],
        },
        fzco: {
          name: 'شركة منطقة حرة',
          description: 'الأفضل للتجارة والتجارة الإلكترونية والأعمال الدولية.',
          features: ['ملكية أجنبية 100%', '0% ضريبة شركات', 'تحويل كامل للأرباح'],
        },
        branch: {
          name: 'مكتب فرعي',
          description: 'امتداد لشركة أجنبية قائمة في الإمارات.',
          features: ['لا يتطلب رأس مال', 'نفس الكيان القانوني للشركة الأم', 'إعداد سريع'],
        },
        freelancer: {
          name: 'تصريح عمل حر',
          description: 'للمهنيين والاستشاريين الأفراد.',
          features: ['تكلفة إعداد منخفضة', 'تأشيرة عمل مضمنة', 'لا يتطلب مكتب'],
        },
      },
    },
    jurisdiction: {
      title: 'اختر ولايتك القضائية',
      description: 'كل منطقة حرة تقدم مزايا مختلفة',
      mainland: 'البر الرئيسي الإماراتي',
      freeZones: 'المناطق الحرة',
      zones: {
        mainland: {
          name: 'البر الرئيسي دبي (DED)',
          cost: 'من 15,000 درهم',
          timeline: '5-7 أيام',
          features: ['التجارة في أي مكان بالإمارات', 'العقود الحكومية', 'يتطلب كفيل محلي'],
        },
        dmcc: {
          name: 'DMCC (دبي)',
          cost: 'من 20,000 درهم',
          timeline: '2-3 أيام',
          features: ['مركز تجارة السلع', 'عنوان تجاري متميز', 'موقع JLT'],
        },
        difc: {
          name: 'DIFC (مالي)',
          cost: 'من 50,000 درهم',
          timeline: '5-7 أيام',
          features: ['ولاية القانون العام', 'الخدمات المالية', 'عنوان مرموق'],
        },
        rakez: {
          name: 'RAKEZ (رأس الخيمة)',
          cost: 'من 5,500 درهم',
          timeline: '1-2 يوم',
          features: ['أقل تكلفة', 'إعداد سريع', 'خيارات صناعية ومكتبية'],
        },
        ajman: {
          name: 'منطقة عجمان الحرة',
          cost: 'من 7,000 درهم',
          timeline: '1-2 يوم',
          features: ['اقتصادية', 'صديقة للتجارة الإلكترونية', 'تراخيص تجارية'],
        },
        shams: {
          name: 'مدينة الشارقة للإعلام (SHAMS)',
          cost: 'من 5,750 درهم',
          timeline: '1-2 يوم',
          features: ['تراخيص إعلامية وإبداعية', 'صديقة للعمل الحر', 'مكتب افتراضي'],
        },
        ifza: {
          name: 'IFZA (دبي)',
          cost: 'من 11,000 درهم',
          timeline: '2-3 أيام',
          features: ['منطقة حرة حديثة', 'باقات مرنة', 'تأشيرات متعددة'],
        },
        meydan: {
          name: 'منطقة ميدان الحرة',
          cost: 'من 8,500 درهم',
          timeline: '2-3 أيام',
          features: ['موقع منطقة السباق', 'التجارة العامة', 'باقات التأشيرات'],
        },
      },
    },
    details: {
      title: 'تفاصيل الشركة',
      description: 'قدم معلومات شركتك',
      companyName: 'اسم الشركة',
      companyNameAr: 'اسم الشركة (بالعربية)',
      namePlaceholder: 'أدخل اسم الشركة',
      nameOptions: 'خيارات الاسم',
      nameOption1: 'الخيار الأول',
      nameOption2: 'الخيار الثاني',
      nameOption3: 'الخيار الثالث',
      activities: 'الأنشطة التجارية',
      activitiesPlaceholder: 'اختر الأنشطة التجارية',
      activitiesHint: 'يمكنك اختيار حتى 3 أنشطة',
      shareCapital: 'رأس المال (درهم)',
      shareCapitalHint: 'الحد الأدنى يختلف حسب المنطقة الحرة',
      officeType: 'نوع المكتب',
      officeOptions: {
        flexi: 'مكتب مرن',
        dedicated: 'مكتب مخصص',
        office: 'مكتب خاص',
        warehouse: 'مستودع',
      },
    },
    shareholders: {
      title: 'المساهمون والمديرون',
      description: 'أضف مالكي الشركة والمديرين',
      addShareholder: 'إضافة مساهم',
      addDirector: 'إضافة مدير',
      shareholder: 'مساهم',
      director: 'مدير',
      fullName: 'الاسم الكامل',
      nationality: 'الجنسية',
      passportNumber: 'رقم جواز السفر',
      emiratesId: 'الهوية الإماراتية',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      shares: 'الأسهم (%)',
      isDirector: 'أيضاً مدير',
      uploadPassport: 'تحميل جواز السفر',
      uploadEmiratesId: 'تحميل الهوية الإماراتية',
    },
    documents: {
      title: 'المستندات المطلوبة',
      description: 'قم بتحميل المستندات اللازمة',
      required: 'مطلوب',
      optional: 'اختياري',
      uploaded: 'تم التحميل',
      pending: 'قيد الانتظار',
      docs: {
        passport: 'نسخة جواز السفر (ملون)',
        visa: 'تأشيرة الإمارات (إن وجدت)',
        emiratesId: 'الهوية الإماراتية (إن وجدت)',
        photo: 'صورة شخصية',
        noc: 'شهادة عدم ممانعة',
        bank: 'خطاب مرجعي بنكي',
        businessPlan: 'خطة العمل',
        parentCompanyDocs: 'مستندات الشركة الأم',
      },
    },
    review: {
      title: 'المراجعة والإرسال',
      description: 'راجع طلبك قبل الإرسال',
      summary: 'ملخص الطلب',
      businessType: 'نوع النشاط',
      jurisdiction: 'الولاية القضائية',
      companyName: 'اسم الشركة',
      activities: 'الأنشطة',
      shareholders: 'المساهمون',
      documents: 'المستندات',
      estimatedCost: 'التكلفة المقدرة',
      timeline: 'مدة التأسيس',
      submit: 'إرسال الطلب',
      submitting: 'جاري الإرسال...',
      terms: 'أوافق على الشروط والأحكام',
    },
    pricing: {
      title: 'التكاليف المقدرة',
      licenseFee: 'رسوم الترخيص',
      registrationFee: 'رسوم التسجيل',
      visaFee: 'رسوم التأشيرة',
      officeFee: 'رسوم المكتب',
      serviceFee: 'رسوم الخدمة',
      total: 'الإجمالي المقدر',
      note: 'قد تختلف التكاليف النهائية بناءً على المتطلبات',
    },
    actions: {
      back: 'رجوع',
      next: 'التالي',
      save: 'حفظ المسودة',
      submit: 'إرسال الطلب',
    },
    success: {
      title: 'تم إرسال الطلب!',
      message: 'تم استلام طلب تأسيس شركتك.',
      reference: 'رقم المرجع',
      nextSteps: 'الخطوات التالية',
      step1: 'سيقوم فريقنا بمراجعة طلبك خلال 24 ساعة',
      step2: 'ستتلقى مكالمة لمناقشة الخطوات التالية',
      step3: 'التحقق من المستندات وحجز الاسم',
      step4: 'إصدار الترخيص ومعالجة التأشيرة',
      dashboard: 'الذهاب إلى لوحة التحكم',
      trackStatus: 'تتبع الحالة',
    },
  },
};

// Business activities options
const businessActivities = [
  { id: 'general_trading', en: 'General Trading', ar: 'التجارة العامة' },
  { id: 'ecommerce', en: 'E-Commerce', ar: 'التجارة الإلكترونية' },
  { id: 'it_services', en: 'IT Services', ar: 'خدمات تقنية المعلومات' },
  { id: 'consultancy', en: 'Business Consultancy', ar: 'الاستشارات التجارية' },
  { id: 'marketing', en: 'Marketing Services', ar: 'خدمات التسويق' },
  { id: 'import_export', en: 'Import & Export', ar: 'الاستيراد والتصدير' },
  { id: 'real_estate', en: 'Real Estate', ar: 'العقارات' },
  { id: 'food_trading', en: 'Food Trading', ar: 'تجارة المواد الغذائية' },
  { id: 'construction', en: 'Construction', ar: 'البناء والتشييد' },
  { id: 'media_production', en: 'Media Production', ar: 'الإنتاج الإعلامي' },
  { id: 'education', en: 'Educational Services', ar: 'الخدمات التعليمية' },
  { id: 'healthcare', en: 'Healthcare', ar: 'الرعاية الصحية' },
];

type Step = 'businessType' | 'jurisdiction' | 'details' | 'shareholders' | 'documents' | 'review';

interface Shareholder {
  id: string;
  fullName: string;
  nationality: string;
  passportNumber: string;
  email: string;
  phone: string;
  shares: number;
  isDirector: boolean;
}

export default function CompanyFormationPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';

  const [currentStep, setCurrentStep] = useState<Step>('businessType');
  const [formData, setFormData] = useState({
    businessType: '',
    jurisdiction: '',
    companyName1: '',
    companyName2: '',
    companyName3: '',
    activities: [] as string[],
    shareCapital: 100000,
    officeType: 'flexi',
    shareholders: [] as Shareholder[],
    documents: {} as Record<string, boolean>,
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const steps: Step[] = ['businessType', 'jurisdiction', 'details', 'shareholders', 'documents', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const addShareholder = () => {
    setFormData({
      ...formData,
      shareholders: [
        ...formData.shareholders,
        {
          id: crypto.randomUUID(),
          fullName: '',
          nationality: '',
          passportNumber: '',
          email: '',
          phone: '',
          shares: 0,
          isDirector: false,
        },
      ],
    });
  };

  const updateShareholder = (id: string, field: keyof Shareholder, value: string | number | boolean) => {
    setFormData({
      ...formData,
      shareholders: formData.shareholders.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  };

  const removeShareholder = (id: string) => {
    setFormData({
      ...formData,
      shareholders: formData.shareholders.filter((s) => s.id !== id),
    });
  };

  if (isSubmitted) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.success.title}</h1>
            <p className="text-gray-600 mb-6">{t.success.message}</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">{t.success.reference}</p>
              <p className="text-2xl font-mono font-bold text-blue-600">CF-2026-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
            </div>

            <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">{t.success.nextSteps}</h3>
              <ol className="space-y-2">
                {[t.success.step1, t.success.step2, t.success.step3, t.success.step4].map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm text-blue-800">
                    <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {t.success.dashboard}
              </button>
              <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                {t.success.trackStatus}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-blue-100">{t.subtitle}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex flex-col items-center ${index > 0 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index < currentStepIndex
                        ? 'bg-green-600 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${index === currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {t.steps[step]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block h-1 flex-1 mx-2 ${
                      index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Step 1: Business Type */}
          {currentStep === 'businessType' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t.businessType.title}</h2>
              <p className="text-gray-600 mb-6">{t.businessType.description}</p>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(t.businessType.options).map(([key, option]) => (
                  <button
                    key={key}
                    onClick={() => setFormData({ ...formData, businessType: key })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.businessType === key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{option.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                    <ul className="space-y-1">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Jurisdiction */}
          {currentStep === 'jurisdiction' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t.jurisdiction.title}</h2>
              <p className="text-gray-600 mb-6">{t.jurisdiction.description}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(t.jurisdiction.zones).map(([key, zone]) => (
                  <button
                    key={key}
                    onClick={() => setFormData({ ...formData, jurisdiction: key })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.jurisdiction === key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{zone.name}</h3>
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className="text-green-600 font-medium">{zone.cost}</span>
                      <span className="text-gray-500">{zone.timeline}</span>
                    </div>
                    <ul className="space-y-1">
                      {zone.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Company Details */}
          {currentStep === 'details' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t.details.title}</h2>
              <p className="text-gray-600 mb-6">{t.details.description}</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.details.nameOptions}
                  </label>
                  <div className="space-y-3">
                    {[1, 2, 3].map((num) => (
                      <div key={num}>
                        <label className="block text-xs text-gray-500 mb-1">
                          {t.details[`nameOption${num}` as 'nameOption1' | 'nameOption2' | 'nameOption3']}
                        </label>
                        <input
                          type="text"
                          value={formData[`companyName${num}` as keyof typeof formData] as string}
                          onChange={(e) => setFormData({ ...formData, [`companyName${num}`]: e.target.value })}
                          placeholder={t.details.namePlaceholder}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.details.activities}
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{t.details.activitiesHint}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {businessActivities.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => {
                          const activities = formData.activities.includes(activity.id)
                            ? formData.activities.filter((a) => a !== activity.id)
                            : formData.activities.length < 3
                            ? [...formData.activities, activity.id]
                            : formData.activities;
                          setFormData({ ...formData, activities });
                        }}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          formData.activities.includes(activity.id)
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        {locale === 'ar' ? activity.ar : activity.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.details.shareCapital}
                    </label>
                    <input
                      type="number"
                      value={formData.shareCapital}
                      onChange={(e) => setFormData({ ...formData, shareCapital: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t.details.shareCapitalHint}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.details.officeType}
                    </label>
                    <select
                      value={formData.officeType}
                      onChange={(e) => setFormData({ ...formData, officeType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(t.details.officeOptions).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Shareholders */}
          {currentStep === 'shareholders' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t.shareholders.title}</h2>
              <p className="text-gray-600 mb-6">{t.shareholders.description}</p>

              {formData.shareholders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 mb-4">No shareholders added yet</p>
                  <button
                    onClick={addShareholder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t.shareholders.addShareholder}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.shareholders.map((shareholder, index) => (
                    <div key={shareholder.id} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">
                          {t.shareholders.shareholder} {index + 1}
                        </h3>
                        <button
                          onClick={() => removeShareholder(shareholder.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t.shareholders.fullName}</label>
                          <input
                            type="text"
                            value={shareholder.fullName}
                            onChange={(e) => updateShareholder(shareholder.id, 'fullName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t.shareholders.nationality}</label>
                          <input
                            type="text"
                            value={shareholder.nationality}
                            onChange={(e) => updateShareholder(shareholder.id, 'nationality', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t.shareholders.passportNumber}</label>
                          <input
                            type="text"
                            value={shareholder.passportNumber}
                            onChange={(e) => updateShareholder(shareholder.id, 'passportNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t.shareholders.email}</label>
                          <input
                            type="email"
                            value={shareholder.email}
                            onChange={(e) => updateShareholder(shareholder.id, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t.shareholders.phone}</label>
                          <input
                            type="tel"
                            value={shareholder.phone}
                            onChange={(e) => updateShareholder(shareholder.id, 'phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t.shareholders.shares}</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={shareholder.shares}
                            onChange={(e) => updateShareholder(shareholder.id, 'shares', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={shareholder.isDirector}
                            onChange={(e) => updateShareholder(shareholder.id, 'isDirector', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-600">{t.shareholders.isDirector}</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addShareholder}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    + {t.shareholders.addShareholder}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Documents */}
          {currentStep === 'documents' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t.documents.title}</h2>
              <p className="text-gray-600 mb-6">{t.documents.description}</p>
              <div className="space-y-4">
                {Object.entries(t.documents.docs).map(([key, label]) => (
                  <div
                    key={key}
                    className={`p-4 border rounded-xl flex items-center justify-between ${
                      formData.documents[key] ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        formData.documents[key] ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {formData.documents[key] ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">
                          {formData.documents[key] ? t.documents.uploaded : t.documents.pending}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        documents: { ...formData.documents, [key]: !formData.documents[key] },
                      })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.documents[key]
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {formData.documents[key] ? t.documents.uploaded : 'Upload'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 'review' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t.review.title}</h2>
              <p className="text-gray-600 mb-6">{t.review.description}</p>

              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{t.review.summary}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t.review.businessType}</p>
                      <p className="font-medium">{t.businessType.options[formData.businessType as keyof typeof t.businessType.options]?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.review.jurisdiction}</p>
                      <p className="font-medium">{t.jurisdiction.zones[formData.jurisdiction as keyof typeof t.jurisdiction.zones]?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.review.companyName}</p>
                      <p className="font-medium">{formData.companyName1 || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.review.shareholders}</p>
                      <p className="font-medium">{formData.shareholders.length} added</p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">{t.pricing.title}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t.pricing.licenseFee}</span>
                      <span className="font-medium">AED 8,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t.pricing.registrationFee}</span>
                      <span className="font-medium">AED 2,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t.pricing.visaFee}</span>
                      <span className="font-medium">AED 3,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t.pricing.officeFee}</span>
                      <span className="font-medium">AED 5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t.pricing.serviceFee}</span>
                      <span className="font-medium">AED 1,500</span>
                    </div>
                    <hr className="border-blue-200 my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-blue-900">{t.pricing.total}</span>
                      <span className="text-blue-900">AED 20,500</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-3">{t.pricing.note}</p>
                </div>

                {/* Terms */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">{t.review.terms}</span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStepIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.actions.back}
            </button>

            <div className="flex gap-3">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                {t.actions.save}
              </button>

              {currentStep === 'review' ? (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.agreedToTerms || isSubmitting}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    formData.agreedToTerms && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? t.review.submitting : t.actions.submit}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.actions.next}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
