# How to Add SEO to Individual Pages

This guide shows you how to add SEO metadata to any page in the LegalDocs application.

## Quick Start

### 1. For a Simple Page (Same metadata for all locales)

```typescript
// src/app/[locale]/your-page/page.tsx
import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata: Metadata = genMeta({
  title: 'Your Page Title - LegalDocs UAE',
  description: 'Your page description optimized for search engines (150-160 chars)',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  locale: 'en',
  path: '/en/your-page',
});

export default function YourPage() {
  // Your page component
}
```

### 2. For Locale-Specific Metadata (Recommended)

```typescript
// src/app/[locale]/your-page/page.tsx
import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/seo';
import { Locale } from '@/i18n';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;

  // Define metadata for each locale
  const metadataByLocale: Record<Locale, any> = {
    en: {
      title: 'Your Page - LegalDocs UAE',
      description: 'English description for search engines',
      keywords: ['legal documents', 'UAE', 'your keywords'],
    },
    ar: {
      title: 'صفحتك - وثائق قانونية الإمارات',
      description: 'وصف باللغة العربية لمحركات البحث',
      keywords: ['وثائق قانونية', 'الإمارات'],
    },
    ur: {
      title: 'آپ کا صفحہ - LegalDocs UAE',
      description: 'اردو میں تفصیل سرچ انجنوں کے لیے',
      keywords: ['قانونی دستاویزات', 'UAE'],
    },
  };

  const currentLocale = locale as Locale;
  const localizedMeta = metadataByLocale[currentLocale];

  return genMeta({
    ...localizedMeta,
    locale: currentLocale,
    path: `/${locale}/your-page`,
  });
}

export default function YourPage() {
  // Your page component
}
```

### 3. Using Pre-defined Metadata Helpers

```typescript
// src/app/[locale]/templates/page.tsx
import { Metadata } from 'next';
import { generateMetadata as genMeta, getTemplatesMetadata } from '@/lib/seo';
import { Locale } from '@/i18n';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const metadata = getTemplatesMetadata(locale as Locale);

  return genMeta({
    ...metadata,
    locale: locale as Locale,
    path: `/${locale}/templates`,
  });
}

export default function TemplatesPage() {
  // Your page component
}
```

## Adding Structured Data to a Page

### 1. Add Breadcrumb Schema

```typescript
// In your page component
import { BreadcrumbSchema } from '@/components/seo/structured-data';

export default function YourPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://legaldocs.ae/en' },
    { name: 'Templates', url: 'https://legaldocs.ae/en/templates' },
    { name: 'Current Page', url: 'https://legaldocs.ae/en/templates/employment' },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      {/* Your page content */}
    </>
  );
}
```

### 2. Add FAQ Schema (for FAQ pages)

```typescript
// In your FAQ page
import { FAQSchema } from '@/components/seo/structured-data';

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is LegalDocs?',
      answer: 'LegalDocs is an AI-powered platform for creating legal documents in UAE.',
    },
    {
      question: 'Is it legally binding?',
      answer: 'Yes, all documents are legally compliant with UAE laws.',
    },
    // Add more FAQs
  ];

  return (
    <>
      <FAQSchema faqs={faqs} />
      {/* Your FAQ content */}
    </>
  );
}
```

### 3. Add Product Schema (for template pages)

```typescript
// In your template detail page
import { TemplateProductSchema } from '@/components/seo/structured-data';

export default function TemplatePage() {
  const template = {
    name: 'Employment Contract',
    description: 'Professional employment contract template for UAE',
    category: 'Employment',
    language: 'en',
  };

  return (
    <>
      <TemplateProductSchema template={template} />
      {/* Your template content */}
    </>
  );
}
```

## Creating a New Metadata Helper

If you have a specific page type that needs custom metadata:

```typescript
// In src/lib/seo.ts

export function getYourPageMetadata(locale: Locale): SEOMetadata {
  const metadata: Record<Locale, SEOMetadata> = {
    en: {
      title: 'Your Page Title - LegalDocs UAE',
      description: 'Your detailed description here...',
      keywords: ['keyword1', 'keyword2', 'keyword3'],
      ogTitle: 'Social Media Title',
      ogDescription: 'Social media description',
    },
    ar: {
      title: 'عنوان صفحتك - LegalDocs الإمارات',
      description: 'وصفك التفصيلي هنا...',
      keywords: ['كلمة1', 'كلمة2', 'كلمة3'],
      ogTitle: 'عنوان وسائل التواصل الاجتماعي',
      ogDescription: 'وصف وسائل التواصل الاجتماعي',
    },
    ur: {
      title: 'آپ کے صفحہ کا عنوان - LegalDocs UAE',
      description: 'آپ کی تفصیلی تفصیل یہاں...',
      keywords: ['لفظ1', 'لفظ2', 'لفظ3'],
      ogTitle: 'سوشل میڈیا عنوان',
      ogDescription: 'سوشل میڈیا تفصیل',
    },
  };

  return metadata[locale];
}
```

## SEO Best Practices Checklist

When adding SEO to a page, make sure you:

### Title Tags
- [ ] Keep titles under 60 characters
- [ ] Include primary keyword near the beginning
- [ ] Make it unique for each page
- [ ] Include brand name (LegalDocs)
- [ ] Add location if relevant (UAE, Dubai)

### Meta Descriptions
- [ ] Keep between 150-160 characters
- [ ] Include primary and secondary keywords naturally
- [ ] Make it compelling (call-to-action)
- [ ] Make it unique for each page
- [ ] Accurately describe page content

### Keywords
- [ ] Include 3-5 relevant keywords
- [ ] Mix primary and long-tail keywords
- [ ] Include location-based keywords
- [ ] Don't keyword stuff

### Content
- [ ] Use H1 tag (only one per page)
- [ ] Use H2, H3 for hierarchy
- [ ] Include keywords in first paragraph
- [ ] Write for humans, not just search engines
- [ ] Use semantic HTML

### Structured Data
- [ ] Add appropriate schema markup
- [ ] Test with Google Rich Results Test
- [ ] Validate with Schema.org validator

## Testing Your SEO Implementation

### 1. Build and Run Locally
```bash
npm run build
npm run start
```

### 2. Check Your Page
Visit: `http://localhost:3000/en/your-page`

View source and verify:
- Title tag is correct
- Meta description is present
- Keywords are included
- Structured data is present (search for "application/ld+json")

### 3. Use SEO Tools
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Validator:** https://validator.schema.org/
- **Meta Tags Inspector:** https://metatags.io/

### 4. Check Mobile Responsiveness
```bash
# Open DevTools > Toggle device toolbar
# Test on different screen sizes
```

## Common Mistakes to Avoid

❌ **Don't:**
- Duplicate titles across pages
- Keyword stuff
- Write meta descriptions over 160 chars
- Ignore mobile optimization
- Skip structured data
- Use generic descriptions

✅ **Do:**
- Write unique content for each page
- Include location (UAE, Dubai)
- Use natural language
- Test on mobile devices
- Add relevant schema markup
- Monitor performance

## Examples from LegalDocs

### Homepage
```typescript
// Already implemented in src/app/[locale]/layout.tsx
// Uses getHomeMetadata() helper
```

### Templates Page
```typescript
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const metadata = getTemplatesMetadata(locale as Locale);
  return genMeta({ ...metadata, locale, path: `/${locale}/templates` });
}
```

### Document Generation Page
```typescript
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const metadata = getGenerateMetadata(locale as Locale);
  return genMeta({ ...metadata, locale, path: `/${locale}/dashboard/generate` });
}
```

## Need Help?

Refer to these files:
- `src/lib/seo.ts` - All SEO utilities
- `src/components/seo/structured-data.tsx` - Schema components
- `SEO_IMPLEMENTATION.md` - Complete SEO documentation
- Next.js Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

---

**Quick Reference:**
- SEO Library: `src/lib/seo.ts`
- Schema Components: `src/components/seo/structured-data.tsx`
- Sitemap: Auto-generated at `/sitemap.xml`
- Robots: Auto-generated at `/robots.txt`
- OG Images: Auto-generated at `/[locale]/opengraph-image`
