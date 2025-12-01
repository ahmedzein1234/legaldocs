import { locales } from '@/i18n';
import LawyerProfileClient from './lawyer-profile-client';

export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, id: 'placeholder' },
  ]);
}

export default function LawyerProfilePage() {
  return <LawyerProfileClient />;
}
