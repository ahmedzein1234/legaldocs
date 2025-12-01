'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, X, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DisclaimerBannerProps {
  /**
   * The page/context where the banner is shown
   * Used to track dismissal per-page
   */
  context?: 'generate' | 'editor' | 'review' | 'global';

  /**
   * Whether the banner should be sticky at the top
   */
  sticky?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Custom message override
   */
  customMessage?: string;
}

const STORAGE_KEY_PREFIX = 'legaldocs_disclaimer_dismissed';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function DisclaimerBanner({
  context = 'global',
  sticky = true,
  className,
  customMessage,
}: DisclaimerBannerProps) {
  const locale = useLocale();
  const t = useTranslations('components.disclaimerBanner');
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed for this context
    const storageKey = `${STORAGE_KEY_PREFIX}_${context}`;
    const dismissedData = localStorage.getItem(storageKey);

    if (dismissedData) {
      try {
        const { timestamp } = JSON.parse(dismissedData);
        const now = Date.now();

        // Show banner again if session expired
        if (now - timestamp > SESSION_DURATION) {
          localStorage.removeItem(storageKey);
          setIsVisible(true);
        }
      } catch {
        // Invalid data, show banner
        localStorage.removeItem(storageKey);
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, [context]);

  const handleDismiss = () => {
    setIsClosing(true);

    // Save dismissal to localStorage
    const storageKey = `${STORAGE_KEY_PREFIX}_${context}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ timestamp: Date.now() })
    );

    // Animate out then hide
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full z-30 transition-all duration-300',
        sticky && 'sticky top-0',
        isClosing && 'opacity-0 -translate-y-2',
        className
      )}
    >
      <Alert className="rounded-none border-x-0 border-t-0 border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-sm">
        <div className="flex items-start gap-3 w-full">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />

          <AlertDescription className="flex-1 text-amber-900 dark:text-amber-200 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="flex-1">
                {customMessage || t('message')}
              </span>

              <Link
                href={`/${locale}/legal/disclaimer`}
                className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium underline underline-offset-4 whitespace-nowrap inline-flex items-center gap-1 group"
              >
                <Info className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                {t('learnMore')}
              </Link>
            </div>
          </AlertDescription>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex-shrink-0"
            onClick={handleDismiss}
            aria-label={t('dismiss')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}

/**
 * Variant specifically for document generation pages
 */
export function GenerateDisclaimerBanner() {
  const t = useTranslations('components.disclaimerBanner');

  return (
    <DisclaimerBanner
      context="generate"
      customMessage={t('generateMessage')}
      sticky={true}
    />
  );
}

/**
 * Variant for document review pages
 */
export function ReviewDisclaimerBanner() {
  const t = useTranslations('components.disclaimerBanner');

  return (
    <DisclaimerBanner
      context="review"
      customMessage={t('reviewMessage')}
      sticky={true}
    />
  );
}

/**
 * Variant for document editor
 */
export function EditorDisclaimerBanner() {
  const t = useTranslations('components.disclaimerBanner');

  return (
    <DisclaimerBanner
      context="editor"
      customMessage={t('editorMessage')}
      sticky={false}
    />
  );
}
