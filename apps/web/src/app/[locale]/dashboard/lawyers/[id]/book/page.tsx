import { Metadata } from 'next';
import { locales } from '@/i18n';
import ConsultationBookingClient from './booking-client';

export const metadata: Metadata = {
  title: 'Book Consultation | LegalDocs',
  description: 'Book a consultation with a verified lawyer',
};

// Required for static export with dynamic routes
export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, id: 'placeholder' },
  ]);
}

export default function BookConsultationPage() {
  return <ConsultationBookingClient />;
}
