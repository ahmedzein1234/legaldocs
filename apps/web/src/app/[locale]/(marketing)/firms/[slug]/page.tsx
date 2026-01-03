import { Metadata } from 'next';
import { FirmProfileClient } from './firm-profile-client';
import { locales, type Locale } from '@/i18n';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, slug: 'placeholder' },
  ]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const isArabic = locale === 'ar';

  // In production, fetch firm data here for dynamic metadata
  return {
    title: isArabic ? 'مكتب محاماة | قانوني' : 'Law Firm | Qannoni',
    description: isArabic
      ? 'عرض ملف مكتب المحاماة - التخصصات، التقييمات، والخدمات'
      : 'View law firm profile - specializations, ratings, and services',
  };
}

export default async function FirmProfilePage({ params }: PageProps) {
  const { locale, slug } = await params;

  return <FirmProfileClient locale={locale as Locale} slug={slug} />;
}
