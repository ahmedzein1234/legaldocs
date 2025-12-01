'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Bot, AlertTriangle, Clock, Hash, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentFooterProps {
  /**
   * Document ID or reference number
   */
  documentId?: string;

  /**
   * Timestamp when document was generated
   */
  generatedAt?: Date | string;

  /**
   * Document version (optional)
   */
  version?: string;

  /**
   * Whether this document was AI-generated
   */
  isAiGenerated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to show in print view
   */
  showInPrint?: boolean;
}

export function DocumentFooter({
  documentId,
  generatedAt,
  version = '1.0',
  isAiGenerated = true,
  className,
  showInPrint = true,
}: DocumentFooterProps) {
  const locale = useLocale();
  const t = useTranslations('components.documentFooter');
  const isRTL = locale === 'ar' || locale === 'ur';

  const timestamp = generatedAt
    ? new Date(generatedAt).toLocaleString(locale === 'ar' ? 'ar-AE' : locale === 'ur' ? 'ur-PK' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Dubai',
      })
    : new Date().toLocaleString(locale === 'ar' ? 'ar-AE' : locale === 'ur' ? 'ur-PK' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Dubai',
      });

  return (
    <div
      className={cn(
        'border-t-2 border-dashed border-muted-foreground/30 pt-6 mt-12 space-y-4',
        !showInPrint && 'print:hidden',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* AI Generation Notice */}
      {isAiGenerated && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <Bot className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {t('aiGenerated.title')}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {t('aiGenerated.description')}
            </p>
          </div>
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-red-900 dark:text-red-200">
            {t('disclaimer.title')}
          </p>
          <p className="text-xs text-red-800 dark:text-red-300">
            {t('disclaimer.description')}
          </p>
        </div>
      </div>

      {/* Professional Review Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            {t('review.title')}
          </p>
          <p className="text-xs text-blue-800 dark:text-blue-300">
            {t('review.description')}
          </p>
        </div>
      </div>

      {/* Document Metadata */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {documentId && (
            <div className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" />
              <span className="font-medium">{t('metadata.documentId')}:</span>
              <span className="font-mono">{documentId}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">{t('metadata.generatedAt')}:</span>
            <span>{timestamp}</span>
          </div>

          {version && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{t('metadata.version')}:</span>
              <span className="font-mono">{version}</span>
            </div>
          )}
        </div>

        {/* Software Attribution */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            {t('footer.generatedBy')}{' '}
            <span className="font-semibold">LegalDocs</span> •{' '}
            {t('footer.softwarePlatform')} •{' '}
            <span className="font-medium">{t('footer.notLegalAdvice')}</span>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {t('footer.website')}: www.legaldocs.ae • {t('footer.email')}: support@legaldocs.ae
          </p>
        </div>
      </div>

      {/* QR Code Placeholder (optional) */}
      <div className="hidden print:block pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold mb-1">{t('verification.title')}</p>
            <p className="text-xs text-muted-foreground">
              {t('verification.description')}
            </p>
          </div>
          {documentId && (
            <div className="flex items-center justify-center h-20 w-20 bg-muted rounded border">
              <span className="text-xs text-muted-foreground">QR</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal version for short documents
 */
export function MinimalDocumentFooter({
  documentId,
  className,
}: Pick<DocumentFooterProps, 'documentId' | 'className'>) {
  const t = useTranslations('components.documentFooter');
  const locale = useLocale();
  const isRTL = locale === 'ar' || locale === 'ur';

  return (
    <div
      className={cn('border-t mt-8 pt-4 space-y-2', className)}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
        <span>{t('minimal.disclaimer')}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('footer.generatedBy')} <span className="font-semibold">LegalDocs</span> •{' '}
        {t('footer.softwarePlatform')}
        {documentId && (
          <>
            {' • '}
            {t('metadata.documentId')}: <span className="font-mono">{documentId}</span>
          </>
        )}
      </p>
    </div>
  );
}
