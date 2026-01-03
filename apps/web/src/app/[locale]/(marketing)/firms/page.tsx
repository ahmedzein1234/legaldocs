import { Metadata } from 'next';
import { FirmsPageClient } from './firms-page-client';
import type { Locale } from '@/i18n';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return {
    title: isArabic ? 'مكاتب المحاماة | قانوني' : 'Law Firms | Qannoni',
    description: isArabic
      ? 'تصفح مكاتب المحاماة الموثقة في الإمارات. احصل على استشارة قانونية، مراجعة العقود، وخدمات قانونية متنوعة من أفضل المحامين.'
      : 'Browse verified law firms in UAE. Get legal consultations, contract review, and diverse legal services from top lawyers.',
    openGraph: {
      title: isArabic ? 'مكاتب المحاماة | قانوني' : 'Law Firms | Qannoni',
      description: isArabic
        ? 'تصفح مكاتب المحاماة الموثقة في الإمارات'
        : 'Browse verified law firms in UAE',
    },
  };
}

export default async function FirmsPage({ params }: PageProps) {
  const { locale } = await params;

  return <FirmsPageClient locale={locale as Locale} />;
}
