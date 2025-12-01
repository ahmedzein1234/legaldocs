import { locales } from '@/i18n';
import { ConsultationSummaryClient } from './consultation-summary-client';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

// Required for static export with dynamic routes
export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, id: 'placeholder' },
  ]);
}

export default async function ConsultationSummaryPage({ params }: PageProps) {
  const { locale, id } = await params;

  return <ConsultationSummaryClient locale={locale} consultationId={id} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'ملخص الاستشارة' : 'Consultation Summary',
    description: locale === 'ar'
      ? 'ملخص استشارتك القانونية'
      : 'Summary of your legal consultation',
  };
}
