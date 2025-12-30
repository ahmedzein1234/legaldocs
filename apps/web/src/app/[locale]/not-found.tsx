'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const content = {
    en: {
      title: '404',
      subtitle: 'Page Not Found',
      description: "Sorry, we couldn't find the page you're looking for. It may have been moved, deleted, or never existed.",
      home: 'Go to Home',
      back: 'Go Back',
      dashboard: 'Go to Dashboard',
      help: 'Need help? Contact us at support@qannoni.com',
    },
    ar: {
      title: '404',
      subtitle: 'الصفحة غير موجودة',
      description: 'عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها أو أنها لم تكن موجودة.',
      home: 'الصفحة الرئيسية',
      back: 'العودة',
      dashboard: 'لوحة التحكم',
      help: 'تحتاج مساعدة؟ تواصل معنا على support@qannoni.com',
    },
    ur: {
      title: '404',
      subtitle: 'صفحہ نہیں ملا',
      description: 'معذرت، ہم وہ صفحہ نہیں ڈھونڈ سکے جو آپ تلاش کر رہے ہیں۔ شاید اسے منتقل کیا گیا ہے، حذف کیا گیا ہے، یا یہ کبھی موجود نہیں تھا۔',
      home: 'ہوم پیج',
      back: 'واپس جائیں',
      dashboard: 'ڈیش بورڈ',
      help: 'مدد چاہیے؟ ہم سے رابطہ کریں support@qannoni.com',
    },
  };

  const t = content[locale as keyof typeof content] || content.en;
  const isRTL = locale === 'ar' || locale === 'ur';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
              <FileQuestion className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-background border-4 border-background shadow-lg flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-7xl font-bold text-primary">{t.title}</h1>
          <h2 className="text-2xl font-semibold">{t.subtitle}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t.description}
          </p>
        </div>

        {/* Actions */}
        <div className={`flex flex-col sm:flex-row gap-3 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <Button asChild size="lg">
            <Link href={`/${locale}`}>
              <Home className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.home}
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
            {t.back}
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href={`/${locale}/dashboard`}>
              {t.dashboard}
            </Link>
          </Button>
        </div>

        {/* Help text */}
        <p className="text-sm text-muted-foreground pt-8 border-t">
          {t.help}
        </p>
      </div>
    </div>
  );
}
