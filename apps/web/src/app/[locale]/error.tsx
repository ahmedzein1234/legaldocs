'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { captureError } from '@/lib/error-tracking';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  useEffect(() => {
    // Log the error to our error tracking service
    captureError(error, {
      digest: error.digest,
      locale,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [error, locale]);

  const content = {
    en: {
      title: 'Something went wrong',
      subtitle: 'We apologize for the inconvenience',
      description: 'An unexpected error occurred. Our team has been notified and is working to fix it.',
      tryAgain: 'Try Again',
      home: 'Go to Home',
      errorId: 'Error ID',
      reportIssue: 'Report this issue',
    },
    ar: {
      title: 'حدث خطأ ما',
      subtitle: 'نعتذر عن الإزعاج',
      description: 'حدث خطأ غير متوقع. تم إخطار فريقنا ويعمل على إصلاحه.',
      tryAgain: 'حاول مرة أخرى',
      home: 'الصفحة الرئيسية',
      errorId: 'معرف الخطأ',
      reportIssue: 'الإبلاغ عن هذه المشكلة',
    },
    ur: {
      title: 'کچھ غلط ہو گیا',
      subtitle: 'ہم تکلیف کے لیے معذرت خواہ ہیں',
      description: 'ایک غیر متوقع خرابی پیش آئی۔ ہماری ٹیم کو مطلع کر دیا گیا ہے اور وہ اسے ٹھیک کرنے پر کام کر رہی ہے۔',
      tryAgain: 'دوبارہ کوشش کریں',
      home: 'ہوم پیج',
      errorId: 'خرابی کی شناخت',
      reportIssue: 'اس مسئلے کی اطلاع دیں',
    },
  };

  const t = content[locale as keyof typeof content] || content.en;
  const isRTL = locale === 'ar' || locale === 'ur';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-destructive/5">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <h2 className="text-xl text-muted-foreground">{t.subtitle}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t.description}
          </p>
        </div>

        {/* Error ID */}
        {error.digest && (
          <div className="bg-muted/50 rounded-lg p-3 inline-block">
            <p className="text-xs text-muted-foreground">
              {t.errorId}: <code className="font-mono">{error.digest}</code>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className={`flex flex-col sm:flex-row gap-3 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <Button onClick={reset} size="lg">
            <RefreshCw className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.tryAgain}
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href={`/${locale}`}>
              <Home className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.home}
            </a>
          </Button>
        </div>

        {/* Report link */}
        <div className="pt-6 border-t">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <a href="mailto:support@qannoni.com?subject=Error%20Report">
              <Bug className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.reportIssue}
            </a>
          </Button>
        </div>

        {/* Development mode error details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mt-8">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Developer Info
            </summary>
            <pre className="mt-4 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-60">
              <strong>Message:</strong> {error.message}
              {'\n\n'}
              <strong>Stack:</strong>
              {'\n'}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
