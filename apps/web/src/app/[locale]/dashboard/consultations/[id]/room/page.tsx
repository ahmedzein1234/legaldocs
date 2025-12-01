import { locales } from '@/i18n';
import { ConsultationRoomClient } from './consultation-room-client';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

// Required for static export with dynamic routes
export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, id: 'placeholder' },
  ]);
}

export default async function ConsultationRoomPage({ params }: PageProps) {
  const { locale, id } = await params;

  return <ConsultationRoomClient locale={locale} consultationId={id} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'غرفة الاستشارة' : 'Consultation Room',
    description: locale === 'ar'
      ? 'غرفة الاستشارة الافتراضية مع المحامي'
      : 'Virtual consultation room with your lawyer',
  };
}
