import { ConsultationsListClient } from './consultations-list-client';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ConsultationsPage({ params }: PageProps) {
  const { locale } = await params;

  return <ConsultationsListClient locale={locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'استشاراتي' : 'My Consultations',
    description: locale === 'ar'
      ? 'إدارة استشاراتك القانونية'
      : 'Manage your legal consultations',
  };
}
