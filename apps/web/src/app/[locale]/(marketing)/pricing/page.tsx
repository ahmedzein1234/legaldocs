import { Metadata } from 'next';
import { PricingPageClient } from './pricing-page-client';
import {
  generateMetadata as generateSEOMetadata,
  getPricingMetadata,
  generateSoftwareApplicationSchema,
} from '@/lib/seo';
import type { Locale } from '@/i18n';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const seoData = getPricingMetadata(locale as Locale);

  return generateSEOMetadata({
    ...seoData,
    locale: locale as Locale,
    path: '/pricing',
  });
}

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;

  // Generate structured data for SEO
  const softwareSchema = generateSoftwareApplicationSchema();

  return (
    <>
      {/* Structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <PricingPageClient locale={locale as Locale} />
    </>
  );
}
