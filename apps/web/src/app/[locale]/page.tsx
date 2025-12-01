import { HomePageClient } from './(marketing)/home-page-client';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: PageProps) {
  const { locale } = await params;
  return <HomePageClient locale={locale} />;
}
