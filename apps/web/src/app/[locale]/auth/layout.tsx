'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();

  return (
    <AuthGuard requireAuth={false} redirectTo={`/${locale}/dashboard`}>
      <div className="min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between">
          <div>
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="Qannoni"
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-contain"
                priority
              />
              <span className="text-2xl font-bold">Qannoni</span>
            </Link>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              {locale === 'ar' ? 'وثائق قانونية بالذكاء الاصطناعي لدول الخليج' : 'AI-Powered Legal Documents for the GCC'}
            </h1>
            <p className="text-lg opacity-90">
              {locale === 'ar'
                ? 'إنشاء وتوقيع وإدارة الوثائق القانونية بالعربية والإنجليزية والأردية. موثوق من آلاف المحترفين في الإمارات والسعودية وغيرها.'
                : 'Create, sign, and manage legal documents in Arabic, English, and Urdu. Trusted by thousands of professionals across the UAE, Saudi Arabia, and beyond.'}
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm opacity-80">{locale === 'ar' ? 'وثيقة منشأة' : 'Documents Created'}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm opacity-80">{locale === 'ar' ? 'مستخدم سعيد' : 'Happy Users'}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm opacity-80">{locale === 'ar' ? 'وقت التشغيل' : 'Uptime'}</div>
              </div>
            </div>
          </div>

          <div className="text-sm opacity-70">
            © 2025 Qannoni. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
