import CaseDetailClient from './case-detail-client';

// Generate static params for static export
export function generateStaticParams() {
  const locales = ['en', 'ar', 'ur'];
  return locales.map((locale) => ({
    locale,
    id: 'placeholder',
  }));
}

export default function CaseDetailPage() {
  return <CaseDetailClient />;
}
