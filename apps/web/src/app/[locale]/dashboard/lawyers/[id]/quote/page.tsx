import { locales } from '@/i18n';
import RequestQuoteClient from './quote-client';

export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, id: 'placeholder' },
  ]);
}

export default function RequestQuotePage() {
  return <RequestQuoteClient />;
}
