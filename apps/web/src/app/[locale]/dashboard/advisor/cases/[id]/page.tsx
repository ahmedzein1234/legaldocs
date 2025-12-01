import { locales } from '@/i18n';
import CaseDetailClient from './case-detail-client';

export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, id: 'placeholder' },
  ]);
}

export default function CaseDetailPage() {
  return <CaseDetailClient />;
}
