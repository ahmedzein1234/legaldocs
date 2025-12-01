import { locales } from '@/i18n';
import VerifyClient from './verify-client';

export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, certificationId: 'placeholder' },
  ]);
}

export default function VerifyPage() {
  return <VerifyClient />;
}
