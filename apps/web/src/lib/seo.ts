import { Metadata } from 'next';
import { Locale } from '@/i18n';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qannoni.com';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  image?: string;
  noIndex?: boolean;
}

/**
 * Generate comprehensive metadata for SEO optimization
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  image,
  noIndex = false,
  locale = 'en',
  path = '',
}: SEOMetadata & { locale?: Locale; path?: string }): Metadata {
  const url = `${SITE_URL}${path}`;
  const defaultImage = `${SITE_URL}/og-image.jpg`;
  const imageUrl = image || defaultImage;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Qannoni' }],
    creator: 'Qannoni',
    publisher: 'Qannoni',
    robots: noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${path}`,
        ar: `${SITE_URL}/ar${path}`,
        ur: `${SITE_URL}/ur${path}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_AE' : locale === 'ur' ? 'ur_PK' : 'en_AE',
      url,
      title: ogTitle || title,
      description: ogDescription || description,
      siteName: 'Qannoni',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle || title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle || ogTitle || title,
      description: twitterDescription || ogDescription || description,
      images: [imageUrl],
      creator: '@qannoni',
      site: '@qannoni',
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  };
}

/**
 * Homepage metadata generator
 */
export function getHomeMetadata(locale: Locale): SEOMetadata {
  const metadata: Record<Locale, SEOMetadata> = {
    en: {
      title: 'Qannoni - AI-Powered Legal Documents & Digital Signatures UAE',
      description:
        'Create, manage, and sign legal documents in UAE with AI assistance. Employment contracts, NDAs, rental agreements in English, Arabic & Urdu. Secure digital signatures, instant document generation.',
      keywords: [
        'legal documents UAE',
        'digital signature UAE',
        'document generation Dubai',
        'employment contract template UAE',
        'NDA template UAE',
        'rental agreement UAE',
        'AI legal documents',
        'electronic signature UAE',
        'legal contract templates',
        'Dubai legal documents',
        'UAE document signing',
        'legal document automation',
      ],
      ogTitle: 'Qannoni UAE - AI Legal Document Generation & Digital Signatures',
      ogDescription:
        'Generate professional legal documents instantly with AI. Multilingual support (English, Arabic, Urdu). Secure e-signatures. Trusted by businesses across UAE.',
    },
    ar: {
      title: 'عقود قانونية - وثائق قانونية بالذكاء الاصطناعي والتوقيعات الرقمية في الإمارات',
      description:
        'إنشاء وإدارة وتوقيع الوثائق القانونية في الإمارات بمساعدة الذكاء الاصطناعي. عقود العمل، اتفاقيات السرية، عقود الإيجار بالعربية والإنجليزية والأردية. توقيعات رقمية آمنة، إنشاء فوري للوثائق.',
      keywords: [
        'عقود قانونية',
        'عقود قانونية الإمارات',
        'التوقيع الرقمي الإمارات',
        'إنشاء المستندات دبي',
        'نموذج عقد عمل الإمارات',
        'اتفاقية سرية',
        'عقد إيجار الإمارات',
        'وثائق قانونية بالذكاء الاصطناعي',
        'التوقيع الإلكتروني',
      ],
      ogTitle: 'Qannoni الإمارات - إنشاء وثائق قانونية بالذكاء الاصطناعي',
      ogDescription:
        'إنشاء وثائق قانونية احترافية فوريًا بالذكاء الاصطناعي. دعم متعدد اللغات (عربي، إنجليزي، أردي). توقيعات إلكترونية آمنة.',
    },
    ur: {
      title: 'قانونی دستاویزات - AI کے ساتھ قانونی دستاویزات اور ڈیجیٹل دستخط متحدہ عرب امارات',
      description:
        'متحدہ عرب امارات میں AI کی مدد سے قانونی دستاویزات بنائیں، منظم کریں اور دستخط کریں۔ ملازمت کے معاہدے، رازداری کے معاہدے، کرایہ کے معاہدے اردو، عربی اور انگریزی میں۔ محفوظ ڈیجیٹل دستخط۔',
      keywords: [
        'قانونی دستاویزات متحدہ عرب امارات',
        'ڈیجیٹل دستخط',
        'دستاویز بنانا دبئی',
        'ملازمت کا معاہدہ',
        'رازداری کا معاہدہ',
        'کرایہ کا معاہدہ',
      ],
      ogTitle: 'Qannoni UAE - AI قانونی دستاویزات اور ڈیجیٹل دستخط',
      ogDescription:
        'AI کے ساتھ فوری طور پر پیشہ ورانہ قانونی دستاویزات بنائیں۔ کثیر لسانی معاونت۔ محفوظ ای-دستخط۔',
    },
  };

  return metadata[locale];
}

/**
 * Templates page metadata
 */
export function getTemplatesMetadata(locale: Locale): SEOMetadata {
  const metadata: Record<Locale, SEOMetadata> = {
    en: {
      title: 'Legal Document Templates - Employment, NDA, Rental Agreements | Qannoni UAE',
      description:
        'Browse 100+ professional legal document templates for UAE. Employment contracts, NDAs, rental agreements, service agreements in English, Arabic & Urdu. Free & premium templates.',
      keywords: [
        'legal templates UAE',
        'employment contract template UAE',
        'NDA template Arabic',
        'rental agreement template Dubai',
        'service agreement template',
        'power of attorney UAE',
        'legal contract templates',
        'free legal templates',
      ],
      ogTitle: 'Professional Legal Document Templates - UAE',
      ogDescription:
        'Access 100+ legal templates tailored for UAE law. Employment contracts, NDAs, agreements in multiple languages. Start creating professional documents today.',
    },
    ar: {
      title: 'قوالب الوثائق القانونية - عقود العمل، اتفاقيات السرية، عقود الإيجار | الإمارات',
      description:
        'تصفح أكثر من 100 قالب وثيقة قانونية احترافية للإمارات. عقود العمل، اتفاقيات السرية، عقود الإيجار، اتفاقيات الخدمة بالعربية والإنجليزية والأردية.',
      keywords: [
        'قوالب قانونية الإمارات',
        'نموذج عقد عمل',
        'نموذج اتفاقية سرية',
        'عقد إيجار دبي',
        'اتفاقية خدمة',
      ],
      ogTitle: 'قوالب وثائق قانونية احترافية - الإمارات',
      ogDescription: 'الوصول إلى أكثر من 100 قالب قانوني مصمم للقانون الإماراتي. عقود العمل، اتفاقيات السرية بلغات متعددة.',
    },
    ur: {
      title: 'قانونی دستاویز کے سانچے - ملازمت، رازداری، کرایہ کے معاہدے | متحدہ عرب امارات',
      description:
        '100+ پیشہ ورانہ قانونی دستاویز کے سانچے براؤز کریں۔ ملازمت کے معاہدے، رازداری کے معاہدے، کرایہ کے معاہدے اردو، عربی اور انگریزی میں۔',
      keywords: [
        'قانونی سانچے',
        'ملازمت کا معاہدہ',
        'رازداری کا معاہدہ',
        'کرایہ کا معاہدہ',
      ],
      ogTitle: 'پیشہ ورانہ قانونی دستاویز کے سانچے - UAE',
      ogDescription: '100+ قانونی سانچوں تک رسائی حاصل کریں۔ ملازمت کے معاہدے، رازداری کے معاہدے متعدد زبانوں میں۔',
    },
  };

  return metadata[locale];
}

/**
 * Document generation page metadata
 */
export function getGenerateMetadata(locale: Locale): SEOMetadata {
  const metadata: Record<Locale, SEOMetadata> = {
    en: {
      title: 'AI Document Generator - Create Legal Documents in Minutes | Qannoni UAE',
      description:
        'Generate professional legal documents with AI in minutes. Employment contracts, NDAs, agreements in English, Arabic & Urdu. Smart forms, instant generation, legally compliant.',
      keywords: [
        'AI document generator',
        'legal document automation',
        'generate employment contract',
        'AI legal documents',
        'automatic document creation',
        'smart legal forms',
      ],
      ogTitle: 'AI-Powered Legal Document Generator - UAE',
      ogDescription:
        'Create professional legal documents in minutes with AI assistance. Just answer a few questions and get legally compliant documents instantly.',
    },
    ar: {
      title: 'مولد الوثائق بالذكاء الاصطناعي - إنشاء وثائق قانونية في دقائق | الإمارات',
      description:
        'إنشاء وثائق قانونية احترافية بالذكاء الاصطناعي في دقائق. عقود العمل، اتفاقيات السرية، الاتفاقيات بالعربية والإنجليزية والأردية.',
      keywords: [
        'مولد الوثائق بالذكاء الاصطناعي',
        'أتمتة الوثائق القانونية',
        'إنشاء عقد عمل',
        'وثائق قانونية بالذكاء الاصطناعي',
      ],
      ogTitle: 'مولد الوثائق القانونية بالذكاء الاصطناعي - الإمارات',
      ogDescription: 'إنشاء وثائق قانونية احترافية في دقائق بمساعدة الذكاء الاصطناعي. أجب عن أسئلة قليلة واحصل على وثائق متوافقة قانونيًا.',
    },
    ur: {
      title: 'AI دستاویز جنریٹر - منٹوں میں قانونی دستاویزات بنائیں | متحدہ عرب امارات',
      description:
        'AI کے ساتھ منٹوں میں پیشہ ورانہ قانونی دستاویزات بنائیں۔ ملازمت کے معاہدے، رازداری کے معاہدے اردو، عربی اور انگریزی میں۔',
      keywords: [
        'AI دستاویز جنریٹر',
        'قانونی دستاویز خودکار',
        'ملازمت کا معاہدہ بنائیں',
      ],
      ogTitle: 'AI کے ساتھ قانونی دستاویز جنریٹر - UAE',
      ogDescription: 'AI کی مدد سے منٹوں میں پیشہ ورانہ قانونی دستاویزات بنائیں۔',
    },
  };

  return metadata[locale];
}

/**
 * Digital signature page metadata
 */
export function getSignatureMetadata(locale: Locale): SEOMetadata {
  const metadata: Record<Locale, SEOMetadata> = {
    en: {
      title: 'Digital Signature & E-Signature Solutions | Secure Document Signing UAE',
      description:
        'Secure digital signature and e-signature solutions for UAE. Sign documents online, legally binding signatures, multi-party signing, audit trail. Compliant with UAE laws.',
      keywords: [
        'digital signature UAE',
        'e-signature UAE',
        'electronic signature',
        'online document signing',
        'secure digital signing',
        'legally binding signature',
      ],
      ogTitle: 'Secure Digital Signature Solutions - UAE',
      ogDescription:
        'Sign documents securely online with legally binding digital signatures. Compliant with UAE laws, instant signing, complete audit trail.',
    },
    ar: {
      title: 'التوقيع الرقمي والتوقيع الإلكتروني | حلول توقيع المستندات الآمنة الإمارات',
      description:
        'حلول التوقيع الرقمي والإلكتروني الآمنة للإمارات. توقيع المستندات عبر الإنترنت، توقيعات ملزمة قانونيًا، توقيع متعدد الأطراف.',
      keywords: [
        'التوقيع الرقمي الإمارات',
        'التوقيع الإلكتروني',
        'توقيع المستندات عبر الإنترنت',
        'توقيع رقمي آمن',
      ],
      ogTitle: 'حلول التوقيع الرقمي الآمنة - الإمارات',
      ogDescription: 'وقّع المستندات بأمان عبر الإنترنت مع توقيعات رقمية ملزمة قانونيًا. متوافق مع قوانين الإمارات.',
    },
    ur: {
      title: 'ڈیجیٹل دستخط اور ای-دستخط | محفوظ دستاویز پر دستخط متحدہ عرب امارات',
      description:
        'متحدہ عرب امارات کے لیے محفوظ ڈیجیٹل دستخط اور ای-دستخط کے حل۔ آن لائن دستاویزات پر دستخط کریں، قانونی طور پر پابند دستخط۔',
      keywords: [
        'ڈیجیٹل دستخط',
        'ای-دستخط',
        'آن لائن دستاویز پر دستخط',
      ],
      ogTitle: 'محفوظ ڈیجیٹل دستخط کے حل - UAE',
      ogDescription: 'قانونی طور پر پابند ڈیجیٹل دستخطوں کے ساتھ آن لائن محفوظ طریقے سے دستاویزات پر دستخط کریں۔',
    },
  };

  return metadata[locale];
}

/**
 * Generate structured data for Organization
 * Primary business location: Dubai, UAE (operational headquarters)
 * Registered company: Ai Creative Innovations, LLC (Delaware, USA)
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Qannoni',
    legalName: 'Ai Creative Innovations, LLC',
    description: 'AI-Powered Legal Documents and Digital Signatures for UAE & GCC',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpg`,
    image: `${SITE_URL}/og-image.jpg`,
    sameAs: [
      'https://twitter.com/qannoni',
      'https://linkedin.com/company/qannoni',
      'https://facebook.com/qannoni',
      'https://instagram.com/qannoni',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@qannoni.com',
        areaServed: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
        availableLanguage: ['English', 'Arabic', 'Urdu'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'Sales',
        email: 'sales@qannoni.com',
        areaServed: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
        availableLanguage: ['English', 'Arabic'],
      },
    ],
    // Primary service location: UAE (Dubai)
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    areaServed: [
      {
        '@type': 'Country',
        name: 'United Arab Emirates',
        sameAs: 'https://en.wikipedia.org/wiki/United_Arab_Emirates',
      },
      {
        '@type': 'Country',
        name: 'Saudi Arabia',
      },
      {
        '@type': 'Country',
        name: 'Qatar',
      },
      {
        '@type': 'Country',
        name: 'Kuwait',
      },
      {
        '@type': 'Country',
        name: 'Bahrain',
      },
      {
        '@type': 'Country',
        name: 'Oman',
      },
    ],
    founder: {
      '@type': 'Person',
      name: 'Ai Creative Innovations Team',
    },
    foundingDate: '2024',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '10-50',
    },
  };
}

/**
 * Generate structured data for SoftwareApplication with pricing tiers
 */
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Qannoni',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    applicationSubCategory: 'Legal Document Management',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        description: '3 documents per month, 3 AI generations, basic templates',
        price: '0',
        priceCurrency: 'AED',
        priceValidUntil: '2025-12-31',
      },
      {
        '@type': 'Offer',
        name: 'Professional Plan',
        description: '25 documents per month, 50 AI generations, premium templates, e-signatures',
        price: '149',
        priceCurrency: 'AED',
        priceValidUntil: '2025-12-31',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '149',
          priceCurrency: 'AED',
          unitText: 'month',
          billingDuration: 'P1M',
        },
      },
      {
        '@type': 'Offer',
        name: 'Business Plan',
        description: 'Unlimited documents, 200 AI generations, team collaboration, API access',
        price: '449',
        priceCurrency: 'AED',
        priceValidUntil: '2025-12-31',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '449',
          priceCurrency: 'AED',
          unitText: 'month',
          billingDuration: 'P1M',
        },
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '250',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'AI-powered legal document generation and digital signature platform for UAE & GCC',
    featureList: [
      'AI Document Generation',
      'Digital Signatures',
      'Multilingual Support (English, Arabic, Urdu)',
      '100+ Template Library',
      'Document Management',
      'Contract Review AI',
      'Team Collaboration',
      'Audit Trail',
      'API Access',
      'Custom Branding',
    ],
    screenshot: `${SITE_URL}/screenshots/dashboard.png`,
    softwareVersion: '2.0',
    datePublished: '2024-01-01',
  };
}

/**
 * Generate structured data for WebSite with SearchAction
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Qannoni',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Product schema for templates
 */
export function generateTemplateProductSchema(template: {
  name: string;
  description: string;
  category: string;
  language: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: template.name,
    description: template.description,
    category: template.category,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'AED',
      availability: 'https://schema.org/InStock',
    },
    inLanguage: template.language,
  };
}

/**
 * Pricing page metadata
 */
export function getPricingMetadata(locale: Locale): SEOMetadata {
  const metadata: Record<Locale, SEOMetadata> = {
    en: {
      title: 'Pricing Plans - Qannoni Legal Document Platform | Free to Enterprise',
      description:
        'Choose the perfect Qannoni plan for your legal document needs. Free plan with 3 documents/month, Professional at AED 149/month, Business at AED 449/month. No hidden fees.',
      keywords: [
        'legal document pricing UAE',
        'document automation cost',
        'Qannoni pricing',
        'legal software pricing',
        'document generation subscription',
        'e-signature pricing UAE',
        'affordable legal documents',
        'free legal templates UAE',
      ],
      ogTitle: 'Qannoni Pricing - Plans Starting Free',
      ogDescription:
        'Professional legal document automation starting free. Upgrade to Professional (AED 149) or Business (AED 449) for more features.',
    },
    ar: {
      title: 'خطط الأسعار - منصة الوثائق القانونية | من مجاني إلى مؤسسات',
      description:
        'اختر خطة Qannoni المثالية لاحتياجاتك من الوثائق القانونية. خطة مجانية مع 3 وثائق شهريًا، احترافي بـ 149 درهم شهريًا، أعمال بـ 449 درهم شهريًا.',
      keywords: [
        'أسعار الوثائق القانونية الإمارات',
        'تكلفة أتمتة الوثائق',
        'أسعار قانوني',
        'اشتراك إنشاء الوثائق',
      ],
      ogTitle: 'أسعار Qannoni - خطط تبدأ مجانًا',
      ogDescription:
        'أتمتة الوثائق القانونية الاحترافية تبدأ مجانًا. ترقية إلى احترافي أو أعمال لمزيد من الميزات.',
    },
    ur: {
      title: 'قیمتوں کے منصوبے - قانونی دستاویز پلیٹ فارم | مفت سے انٹرپرائز تک',
      description:
        'اپنی قانونی دستاویز کی ضروریات کے لیے بہترین Qannoni پلان منتخب کریں۔ 3 دستاویزات/ماہ کے ساتھ مفت پلان، پروفیشنل AED 149/ماہ۔',
      keywords: [
        'قانونی دستاویز کی قیمت',
        'دستاویز خودکار لاگت',
        'Qannoni قیمتیں',
      ],
      ogTitle: 'Qannoni قیمتیں - مفت سے شروع',
      ogDescription: 'پیشہ ورانہ قانونی دستاویز خودکار مفت سے شروع۔',
    },
  };

  return metadata[locale];
}

/**
 * Template-specific landing page metadata for SEO
 */
export const TEMPLATE_LANDING_PAGES: Record<string, {
  en: SEOMetadata;
  ar: SEOMetadata;
  ur: SEOMetadata;
  faqs: { question: string; answer: string }[];
}> = {
  'employment-contract': {
    en: {
      title: 'Employment Contract Template UAE - Free Download | Qannoni',
      description:
        'Download professional UAE employment contract templates in English & Arabic. MOL compliant, includes probation period, visa requirements, end of service benefits. Free and premium options.',
      keywords: [
        'employment contract template UAE',
        'UAE labor contract',
        'employment agreement Dubai',
        'MOL employment contract',
        'limited contract UAE',
        'unlimited contract UAE',
        'job contract template',
        'work contract UAE',
        'labor law UAE',
      ],
      ogTitle: 'UAE Employment Contract Template - MOL Compliant',
      ogDescription:
        'Create legally compliant employment contracts for UAE. Includes all mandatory clauses, probation terms, and end of service calculations.',
    },
    ar: {
      title: 'نموذج عقد عمل الإمارات - تحميل مجاني | قانوني',
      description:
        'تحميل نماذج عقود عمل احترافية للإمارات بالعربية والإنجليزية. متوافق مع وزارة العمل، يشمل فترة الاختبار ومتطلبات التأشيرة ومكافأة نهاية الخدمة.',
      keywords: [
        'نموذج عقد عمل الإمارات',
        'عقد عمل محدد المدة',
        'عقد عمل غير محدد المدة',
        'قانون العمل الإماراتي',
      ],
      ogTitle: 'نموذج عقد عمل الإمارات - متوافق مع وزارة العمل',
      ogDescription: 'إنشاء عقود عمل متوافقة قانونيًا للإمارات.',
    },
    ur: {
      title: 'ملازمت کا معاہدہ ٹیمپلیٹ UAE - مفت ڈاؤن لوڈ | قانونی',
      description:
        'انگریزی اور عربی میں UAE کے پیشہ ورانہ ملازمت کے معاہدے کے ٹیمپلیٹس ڈاؤن لوڈ کریں۔',
      keywords: [
        'ملازمت کا معاہدہ UAE',
        'کام کا معاہدہ',
        'نوکری کا معاہدہ',
      ],
      ogTitle: 'UAE ملازمت کا معاہدہ ٹیمپلیٹ',
      ogDescription: 'UAE کے لیے قانونی طور پر مطابق ملازمت کے معاہدے بنائیں۔',
    },
    faqs: [
      {
        question: 'What must be included in a UAE employment contract?',
        answer: 'UAE employment contracts must include: employee and employer details, job title, start date, salary and benefits, working hours, leave entitlements, probation period (max 6 months), contract type (limited/unlimited), and notice period. All contracts must comply with UAE Labour Law (Federal Decree Law No. 33 of 2021).',
      },
      {
        question: 'What is the difference between limited and unlimited contracts in UAE?',
        answer: 'Limited contracts have a fixed end date (max 3 years) and cannot be terminated early without penalties. Unlimited contracts have no end date and can be terminated by either party with proper notice. As of 2022, all new contracts in UAE must be limited term.',
      },
      {
        question: 'Is Arabic mandatory for UAE employment contracts?',
        answer: 'Yes, UAE employment contracts must be in Arabic to be legally binding. English translations are commonly provided but the Arabic version takes precedence in case of disputes.',
      },
    ],
  },
  'nda': {
    en: {
      title: 'NDA Template UAE - Non-Disclosure Agreement | Qannoni',
      description:
        'Professional NDA templates for UAE businesses. Protect confidential information with legally binding non-disclosure agreements. One-way and mutual NDA options in English & Arabic.',
      keywords: [
        'NDA template UAE',
        'non-disclosure agreement Dubai',
        'confidentiality agreement UAE',
        'business NDA template',
        'mutual NDA',
        'employee NDA UAE',
        'trade secret protection',
        'confidential information agreement',
      ],
      ogTitle: 'UAE NDA Template - Protect Your Confidential Information',
      ogDescription:
        'Create legally binding NDAs for your UAE business. One-way and mutual options. Instant generation in English and Arabic.',
    },
    ar: {
      title: 'نموذج اتفاقية عدم إفصاح الإمارات | قانوني',
      description:
        'نماذج اتفاقيات عدم إفصاح احترافية للشركات الإماراتية. حماية المعلومات السرية مع اتفاقيات ملزمة قانونيًا.',
      keywords: [
        'اتفاقية عدم إفصاح الإمارات',
        'اتفاقية السرية دبي',
        'حماية الأسرار التجارية',
      ],
      ogTitle: 'نموذج اتفاقية عدم الإفصاح - الإمارات',
      ogDescription: 'إنشاء اتفاقيات عدم إفصاح ملزمة قانونيًا لشركتك.',
    },
    ur: {
      title: 'NDA ٹیمپلیٹ UAE - عدم افشاء کا معاہدہ | قانونی',
      description:
        'UAE کاروبار کے لیے پیشہ ورانہ NDA ٹیمپلیٹس۔ قانونی طور پر پابند معاہدوں کے ساتھ خفیہ معلومات کی حفاظت کریں۔',
      keywords: [
        'NDA ٹیمپلیٹ UAE',
        'رازداری کا معاہدہ',
        'خفیہ معلومات',
      ],
      ogTitle: 'UAE NDA ٹیمپلیٹ',
      ogDescription: 'اپنے UAE کاروبار کے لیے قانونی طور پر پابند NDAs بنائیں۔',
    },
    faqs: [
      {
        question: 'Are NDAs enforceable in the UAE?',
        answer: 'Yes, NDAs are fully enforceable in the UAE under Federal Law No. 5 of 1985 (Civil Transactions Law). They protect confidential business information, trade secrets, and proprietary data. For maximum enforceability, NDAs should clearly define confidential information and include reasonable time limits.',
      },
      {
        question: 'What is the difference between one-way and mutual NDAs?',
        answer: 'A one-way (unilateral) NDA protects one party\'s confidential information, typically used with employees or contractors. A mutual (bilateral) NDA protects both parties\' information, commonly used in business partnerships, M&A discussions, or joint ventures.',
      },
    ],
  },
  'rental-agreement': {
    en: {
      title: 'Rental Agreement Template Dubai & UAE - Ejari Compliant | Qannoni',
      description:
        'Create Ejari-compliant rental agreements for Dubai and UAE. Residential and commercial tenancy contracts in English & Arabic. Includes all RERA requirements and standard clauses.',
      keywords: [
        'rental agreement Dubai',
        'tenancy contract UAE',
        'Ejari rental agreement',
        'RERA compliant lease',
        'Dubai rental contract template',
        'commercial lease UAE',
        'residential rental agreement',
        'property rental contract',
      ],
      ogTitle: 'Dubai Rental Agreement Template - Ejari & RERA Compliant',
      ogDescription:
        'Generate legally compliant rental agreements for Dubai. Ejari-ready templates with all mandatory RERA clauses included.',
    },
    ar: {
      title: 'نموذج عقد إيجار دبي والإمارات - متوافق مع إيجاري | قانوني',
      description:
        'إنشاء عقود إيجار متوافقة مع إيجاري لدبي والإمارات. عقود إيجار سكنية وتجارية بالعربية والإنجليزية.',
      keywords: [
        'عقد إيجار دبي',
        'عقد إيجار الإمارات',
        'عقد إيجاري',
        'عقد إيجار سكني',
        'عقد إيجار تجاري',
      ],
      ogTitle: 'نموذج عقد إيجار دبي - متوافق مع إيجاري وريرا',
      ogDescription: 'إنشاء عقود إيجار متوافقة قانونيًا لدبي.',
    },
    ur: {
      title: 'کرایہ کا معاہدہ ٹیمپلیٹ دبئی اور UAE | قانونی',
      description:
        'دبئی اور UAE کے لیے Ejari کے مطابق کرایہ کے معاہدے بنائیں۔ انگریزی اور عربی میں رہائشی اور تجارتی کرایہ داری کے معاہدے۔',
      keywords: [
        'کرایہ کا معاہدہ دبئی',
        'کرایہ داری کا معاہدہ UAE',
        'Ejari معاہدہ',
      ],
      ogTitle: 'دبئی کرایہ کا معاہدہ ٹیمپلیٹ',
      ogDescription: 'دبئی کے لیے قانونی طور پر مطابق کرایہ کے معاہدے بنائیں۔',
    },
    faqs: [
      {
        question: 'Is Ejari registration mandatory in Dubai?',
        answer: 'Yes, Ejari registration is mandatory for all rental agreements in Dubai. Ejari is the official system to register tenancy contracts and is required for utility connections, visa applications, and legal protection. Unregistered contracts may not be enforceable.',
      },
      {
        question: 'What are the standard rental increase rules in Dubai?',
        answer: 'Rental increases in Dubai are regulated by RERA\'s Rental Index Calculator. Increases are capped based on how much below market rate the current rent is. If rent is less than 10% below market rate, no increase is allowed. Maximum increase is 20% if rent is more than 40% below market rate.',
      },
      {
        question: 'What notice period is required for lease termination?',
        answer: 'In Dubai, tenants must provide 90 days written notice before the lease expiry date for non-renewal. Landlords must provide 12 months notice if they want to terminate for personal use or sale of property.',
      },
    ],
  },
};

/**
 * Get SEO metadata for a template landing page
 */
export function getTemplateLandingMetadata(
  templateSlug: string,
  locale: Locale
): SEOMetadata | null {
  const template = TEMPLATE_LANDING_PAGES[templateSlug];
  if (!template) return null;
  return template[locale];
}

/**
 * Get FAQs for a template landing page
 */
export function getTemplateFAQs(templateSlug: string): { question: string; answer: string }[] {
  return TEMPLATE_LANDING_PAGES[templateSlug]?.faqs || [];
}

/**
 * Generate LocalBusiness schema for enhanced local SEO
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Qannoni',
    description: 'AI-powered legal document generation and digital signature platform',
    image: `${SITE_URL}/logo.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.2048,
      longitude: 55.2708,
    },
    url: SITE_URL,
    priceRange: 'AED 0 - AED 449',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 25.2048,
        longitude: 55.2708,
      },
      geoRadius: '500000', // 500km radius covering UAE and nearby GCC
    },
  };
}
