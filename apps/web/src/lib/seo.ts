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
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Qannoni',
    description: 'AI-Powered Legal Documents and Digital Signatures for UAE',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpg`,
    sameAs: [
      'https://twitter.com/qannoni',
      'https://linkedin.com/company/qannoni',
      'https://facebook.com/qannoni',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+971-4-XXX-XXXX',
      contactType: 'Customer Service',
      areaServed: ['AE', 'UAE'],
      availableLanguage: ['English', 'Arabic', 'Urdu'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '131 Continental Dr, Suite 305',
      addressLocality: 'Newark',
      addressRegion: 'DE',
      postalCode: '19713',
      addressCountry: 'US',
    },
  };
}

/**
 * Generate structured data for SoftwareApplication
 */
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Qannoni',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'AED',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '250',
    },
    description: 'AI-powered legal document generation and digital signature platform for UAE',
    featureList: [
      'AI Document Generation',
      'Digital Signatures',
      'Multilingual Support',
      'Template Library',
      'Document Management',
    ],
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
