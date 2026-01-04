import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, getDirection, type Locale } from '@/i18n';
import { AuthProvider } from '@/lib/auth-context';
import { UserPreferencesProvider } from '@/lib/user-preferences-context';
import { ClientOnly } from '@/components/ui/client-only';
import { QueryProvider } from '@/providers/query-provider';
import { generateMetadata as genMeta, getHomeMetadata, SITE_URL } from '@/lib/seo';
import { GlobalSchemas } from '@/components/seo/structured-data';
import { CookieConsent } from '@/components/cookie-consent';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import '@/styles/globals.css';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const homeMetadata = getHomeMetadata(locale as Locale);

  return genMeta({
    ...homeMetadata,
    locale: locale as Locale,
    path: `/${locale}`,
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();
  const direction = getDirection(locale as Locale);

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <GlobalSchemas />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LegalDocs" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={direction === 'rtl' ? 'font-arabic' : 'font-sans'} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ClientOnly
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
              }
            >
              <UserPreferencesProvider>
                <AuthProvider>{children}</AuthProvider>
                <CookieConsent />
                <PWAInstallPrompt locale={locale} />
              </UserPreferencesProvider>
            </ClientOnly>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
