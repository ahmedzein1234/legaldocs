import { HomePageClient } from './home-page-client';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  return <HomePageClient locale={locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  const meta = {
    en: {
      title: 'Qannoni - Smart Legal Documents for UAE & GCC',
      description: 'Create legally-binding documents in minutes. AI-powered contract generation, digital signatures, and expert legal consultations for UAE businesses.',
    },
    ar: {
      title: 'Qannoni - وثائق قانونية ذكية للإمارات والخليج',
      description: 'أنشئ مستندات ملزمة قانونياً في دقائق. توليد عقود بالذكاء الاصطناعي، توقيعات رقمية، واستشارات قانونية متخصصة.',
    },
  };

  const content = meta[locale as keyof typeof meta] || meta.en;

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      type: 'website',
    },
  };
}
