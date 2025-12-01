'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (locale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{localeFlags[currentLocale]}</span>
        <span className="hidden md:inline">{localeNames[currentLocale]}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute end-0 mt-2 w-48 bg-background rounded-lg shadow-lg border z-50">
            {locales.map(locale => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={cn(
                  'w-full px-4 py-3 text-start hover:bg-accent flex items-center gap-3 transition-colors first:rounded-t-lg last:rounded-b-lg',
                  locale === currentLocale && 'bg-accent'
                )}
              >
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{localeFlags[locale]}</span>
                <div className="flex-1">
                  <div className="font-medium">{localeNames[locale]}</div>
                </div>
                {locale === currentLocale && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
