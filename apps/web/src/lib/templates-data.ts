// Multilingual templates data
export interface TemplateItem {
  id: string;
  category: string;
  languages: ('en' | 'ar' | 'ur')[];
  popularity: number;
  estimatedTime: string;
  isNew?: boolean;
  isPremium?: boolean;
}

export interface LocalizedTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  language: 'en' | 'ar' | 'ur';
  popularity: number;
  estimatedTime: string;
  isNew?: boolean;
  isPremium?: boolean;
}

// Template definitions with multilingual content
export const templatesData: Record<string, Record<string, { name: string; description: string }>> = {
  deposit_receipt: {
    en: {
      name: 'Deposit Receipt',
      description: 'Standard deposit receipt for real estate transactions with acknowledgment of payment',
    },
    ar: {
      name: 'إيصال إيداع',
      description: 'إيصال إيداع قياسي للمعاملات العقارية مع إقرار باستلام الدفعة',
    },
    ur: {
      name: 'جمع کی رسید',
      description: 'رئیل اسٹیٹ لین دین کے لیے معیاری جمع رسید جس میں ادائیگی کی تصدیق شامل ہے',
    },
  },
  rental_agreement: {
    en: {
      name: 'Rental Agreement',
      description: 'Comprehensive rental agreement covering terms, conditions, and obligations for both parties',
    },
    ar: {
      name: 'عقد إيجار',
      description: 'عقد إيجار شامل يغطي الشروط والأحكام والالتزامات لكلا الطرفين',
    },
    ur: {
      name: 'کرایہ کا معاہدہ',
      description: 'جامع کرایہ داری کا معاہدہ جو دونوں فریقوں کی شرائط، احکام اور ذمہ داریوں کا احاطہ کرتا ہے',
    },
  },
  nda: {
    en: {
      name: 'Non-Disclosure Agreement',
      description: 'Standard NDA to protect confidential information between parties',
    },
    ar: {
      name: 'اتفاقية عدم إفصاح',
      description: 'اتفاقية عدم إفصاح قياسية لحماية المعلومات السرية بين الأطراف',
    },
    ur: {
      name: 'عدم افشاء کا معاہدہ',
      description: 'فریقین کے درمیان خفیہ معلومات کی حفاظت کے لیے معیاری NDA',
    },
  },
  employment_contract: {
    en: {
      name: 'Employment Contract',
      description: 'Full employment agreement with salary, benefits, and termination clauses',
    },
    ar: {
      name: 'عقد توظيف',
      description: 'اتفاقية توظيف كاملة مع الراتب والمزايا وشروط إنهاء العقد',
    },
    ur: {
      name: 'ملازمت کا معاہدہ',
      description: 'تنخواہ، فوائد اور برطرفی کی شقوں کے ساتھ مکمل ملازمت کا معاہدہ',
    },
  },
  power_of_attorney: {
    en: {
      name: 'Power of Attorney',
      description: 'Grant legal authority to another person to act on your behalf',
    },
    ar: {
      name: 'توكيل رسمي',
      description: 'منح صلاحية قانونية لشخص آخر للتصرف نيابة عنك',
    },
    ur: {
      name: 'وکالت نامہ',
      description: 'کسی دوسرے شخص کو آپ کی جانب سے کام کرنے کا قانونی اختیار دیں',
    },
  },
  service_agreement: {
    en: {
      name: 'Service Agreement',
      description: 'Professional services agreement with scope, timeline, and payment terms',
    },
    ar: {
      name: 'اتفاقية خدمات',
      description: 'اتفاقية خدمات مهنية مع النطاق والجدول الزمني وشروط الدفع',
    },
    ur: {
      name: 'خدمات کا معاہدہ',
      description: 'دائرہ کار، ٹائم لائن اور ادائیگی کی شرائط کے ساتھ پیشہ ورانہ خدمات کا معاہدہ',
    },
  },
  sales_contract: {
    en: {
      name: 'Sales Contract',
      description: 'Property sales contract with terms, conditions, and payment schedule',
    },
    ar: {
      name: 'عقد بيع',
      description: 'عقد بيع عقار مع الشروط والأحكام وجدول الدفع',
    },
    ur: {
      name: 'فروخت کا معاہدہ',
      description: 'شرائط، احکام اور ادائیگی کے شیڈول کے ساتھ جائیداد کی فروخت کا معاہدہ',
    },
  },
  mou: {
    en: {
      name: 'Memorandum of Understanding',
      description: 'MOU for partnership or collaboration between organizations',
    },
    ar: {
      name: 'مذكرة تفاهم',
      description: 'مذكرة تفاهم للشراكة أو التعاون بين المؤسسات',
    },
    ur: {
      name: 'مفاہمتی یادداشت',
      description: 'تنظیموں کے درمیان شراکت یا تعاون کے لیے MOU',
    },
  },
};

// Template metadata
export const templatesMeta: TemplateItem[] = [
  { id: 'deposit_receipt', category: 'real_estate', languages: ['en', 'ar', 'ur'], popularity: 156, estimatedTime: '5 min' },
  { id: 'rental_agreement', category: 'real_estate', languages: ['en', 'ar', 'ur'], popularity: 234, estimatedTime: '15 min' },
  { id: 'nda', category: 'business', languages: ['en', 'ar', 'ur'], popularity: 189, estimatedTime: '10 min' },
  { id: 'employment_contract', category: 'employment', languages: ['en', 'ar', 'ur'], popularity: 145, estimatedTime: '20 min', isNew: true },
  { id: 'power_of_attorney', category: 'legal', languages: ['en', 'ar', 'ur'], popularity: 98, estimatedTime: '10 min', isPremium: true },
  { id: 'service_agreement', category: 'business', languages: ['en', 'ar', 'ur'], popularity: 112, estimatedTime: '15 min' },
  { id: 'sales_contract', category: 'real_estate', languages: ['en', 'ar', 'ur'], popularity: 167, estimatedTime: '25 min', isNew: true, isPremium: true },
  { id: 'mou', category: 'business', languages: ['en', 'ar', 'ur'], popularity: 89, estimatedTime: '20 min' },
];

// Get templates for a specific language
export function getTemplatesForLanguage(language: 'en' | 'ar' | 'ur'): LocalizedTemplate[] {
  return templatesMeta
    .filter((t) => t.languages.includes(language))
    .map((t) => ({
      id: t.id,
      name: templatesData[t.id]?.[language]?.name || templatesData[t.id]?.en?.name || t.id,
      description: templatesData[t.id]?.[language]?.description || templatesData[t.id]?.en?.description || '',
      category: t.category,
      language,
      popularity: t.popularity,
      estimatedTime: t.estimatedTime,
      isNew: t.isNew,
      isPremium: t.isPremium,
    }));
}

// Get all templates with all language versions
export function getAllTemplates(): LocalizedTemplate[] {
  const templates: LocalizedTemplate[] = [];
  for (const meta of templatesMeta) {
    for (const lang of meta.languages) {
      templates.push({
        id: `${meta.id}_${lang}`,
        name: templatesData[meta.id]?.[lang]?.name || meta.id,
        description: templatesData[meta.id]?.[lang]?.description || '',
        category: meta.category,
        language: lang,
        popularity: meta.popularity,
        estimatedTime: meta.estimatedTime,
        isNew: meta.isNew,
        isPremium: meta.isPremium,
      });
    }
  }
  return templates;
}

// Category labels in all languages
export const categoryLabels: Record<string, Record<string, string>> = {
  all: { en: 'All Categories', ar: 'جميع الفئات', ur: 'تمام زمرے' },
  real_estate: { en: 'Real Estate', ar: 'العقارات', ur: 'رئیل اسٹیٹ' },
  business: { en: 'Business', ar: 'الأعمال', ur: 'کاروبار' },
  employment: { en: 'Employment', ar: 'التوظيف', ur: 'ملازمت' },
  legal: { en: 'Legal', ar: 'قانوني', ur: 'قانونی' },
};

// Document type labels
export const documentTypeLabels: Record<string, Record<string, string>> = {
  deposit_receipt: { en: 'Deposit Receipt', ar: 'إيصال إيداع', ur: 'جمع کی رسید' },
  rental_agreement: { en: 'Rental Agreement', ar: 'عقد إيجار', ur: 'کرایہ کا معاہدہ' },
  nda: { en: 'NDA', ar: 'اتفاقية عدم إفصاح', ur: 'عدم افشاء کا معاہدہ' },
  service_agreement: { en: 'Service Agreement', ar: 'اتفاقية خدمات', ur: 'خدمات کا معاہدہ' },
  employment_contract: { en: 'Employment Contract', ar: 'عقد توظيف', ur: 'ملازمت کا معاہدہ' },
  power_of_attorney: { en: 'Power of Attorney', ar: 'توكيل رسمي', ur: 'وکالت نامہ' },
  mou: { en: 'MOU', ar: 'مذكرة تفاهم', ur: 'مفاہمتی یادداشت' },
  sales_contract: { en: 'Sales Contract', ar: 'عقد بيع', ur: 'فروخت کا معاہدہ' },
};

// Status labels
export const statusLabels: Record<string, Record<string, string>> = {
  draft: { en: 'Draft', ar: 'مسودة', ur: 'مسودہ' },
  pending: { en: 'Pending', ar: 'قيد الانتظار', ur: 'زیر التواء' },
  signed: { en: 'Signed', ar: 'موقّع', ur: 'دستخط شدہ' },
  expired: { en: 'Expired', ar: 'منتهي الصلاحية', ur: 'میعاد ختم' },
  cancelled: { en: 'Cancelled', ar: 'ملغي', ur: 'منسوخ' },
};
