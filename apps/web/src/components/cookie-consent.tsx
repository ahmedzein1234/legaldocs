'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'qannoni-cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const locale = useLocale();
  const isRTL = locale === 'ar' || locale === 'ur';

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid layout shift on initial load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const content = {
    en: {
      message: 'We use cookies to enhance your experience. By continuing to use our site, you agree to our use of cookies.',
      accept: 'Accept',
      decline: 'Decline',
      learnMore: 'Learn More',
    },
    ar: {
      message: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك. بالاستمرار في استخدام موقعنا، فإنك توافق على استخدامنا لملفات تعريف الارتباط.',
      accept: 'قبول',
      decline: 'رفض',
      learnMore: 'اعرف المزيد',
    },
    ur: {
      message: 'ہم آپ کے تجربے کو بہتر بنانے کے لیے کوکیز استعمال کرتے ہیں۔ ہماری سائٹ کا استعمال جاری رکھ کر، آپ ہماری کوکیز کے استعمال سے متفق ہیں۔',
      accept: 'قبول کریں',
      decline: 'انکار کریں',
      learnMore: 'مزید جانیں',
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t shadow-lg">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
              <Cookie className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-start">
              {t.message}{' '}
              <Link
                href={`/${locale}/legal/privacy`}
                className="text-primary hover:underline font-medium"
              >
                {t.learnMore}
              </Link>
            </p>
          </div>
          <div className={`flex items-center gap-2 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="min-w-[80px]"
            >
              {t.decline}
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="min-w-[80px]"
            >
              {t.accept}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
