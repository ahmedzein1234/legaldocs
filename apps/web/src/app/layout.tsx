import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LegalDocs - AI-Powered Legal Documents for GCC',
  description: 'Generate, sign, and manage legal documents in English, Arabic, and Urdu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
