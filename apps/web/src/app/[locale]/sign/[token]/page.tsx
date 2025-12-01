import { locales } from '@/i18n';
import SigningClient from './signing-client';

export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, token: 'placeholder' },
  ]);
}

export default function SigningPage() {
  return <SigningClient />;
}
