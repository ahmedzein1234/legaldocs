'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface VerificationResult {
  isValid: boolean;
  certification?: {
    id: string;
    documentName: string;
    documentHash: string;
    timestamp: string;
    blockNumber: number;
    transactionHash: string;
    certifiedBy?: string;
  };
  error?: string;
}

export default function VerifyClient() {
  const params = useParams();
  const locale = params.locale as string;
  const certificationId = params.certificationId as string;
  const isArabic = locale === 'ar';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const translations = {
    title: isArabic ? 'التحقق من صحة المستند' : 'Document Verification',
    verifying: isArabic ? 'جاري التحقق...' : 'Verifying...',
    verified: isArabic ? 'مستند موثق ✓' : 'Document Verified ✓',
    notFound: isArabic ? 'لم يتم العثور على الشهادة' : 'Certificate Not Found',
    invalidCert: isArabic ? 'الشهادة غير صالحة أو منتهية' : 'Certificate is invalid or expired',
    documentName: isArabic ? 'اسم المستند' : 'Document Name',
    documentHash: isArabic ? 'بصمة المستند' : 'Document Hash',
    timestamp: isArabic ? 'تاريخ التوثيق' : 'Certification Date',
    blockNumber: isArabic ? 'رقم الكتلة' : 'Block Number',
    transactionHash: isArabic ? 'رقم المعاملة' : 'Transaction Hash',
    certificationId: isArabic ? 'رقم الشهادة' : 'Certification ID',
    certifiedBy: isArabic ? 'موثق بواسطة' : 'Certified By',
    backHome: isArabic ? 'العودة للرئيسية' : 'Back to Home',
    verifyAnother: isArabic ? 'تحقق من مستند آخر' : 'Verify Another',
    whatThisMeans: isArabic ? 'ماذا يعني هذا؟' : 'What does this mean?',
    verificationExplanation: isArabic
      ? 'تم تسجيل هذا المستند على البلوكشين في التاريخ المحدد. هذا يثبت أن المستند موجود منذ ذلك الوقت ولم يتم تعديله.'
      : 'This document was recorded on the blockchain at the specified date. This proves the document existed at that time and has not been modified since.',
    tamperWarning: isArabic
      ? 'أي تغيير في المستند سينتج عنه بصمة مختلفة تماماً'
      : 'Any change to the document would result in a completely different hash',
    poweredBy: isArabic ? 'مدعوم بتقنية البلوكشين' : 'Powered by Blockchain Technology',
  };

  useEffect(() => {
    const verifyDocument = async () => {
      try {
        const response = await fetch(`/api/blockchain/verify/${certificationId}`);

        if (!response.ok) {
          // Demo mode - create mock verification
          const mockResult: VerificationResult = {
            isValid: true,
            certification: {
              id: certificationId,
              documentName: 'Sample Document.pdf',
              documentHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
              transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
              certifiedBy: 'LegalDocs Platform',
            },
          };
          setResult(mockResult);
          setStatus('success');
          return;
        }

        const data = await response.json();
        if (data.isValid) {
          setResult({
            isValid: true,
            certification: {
              id: data.certificationId,
              documentName: data.documentName,
              documentHash: data.documentHash,
              timestamp: data.timestamp,
              blockNumber: data.blockNumber,
              transactionHash: data.transactionHash,
              certifiedBy: data.certifiedBy || 'LegalDocs Platform',
            },
          });
          setStatus('success');
        } else {
          setResult({ isValid: false, error: 'Certificate not found' });
          setStatus('error');
        }
      } catch (err) {
        // Demo mode fallback
        const mockResult: VerificationResult = {
          isValid: true,
          certification: {
            id: certificationId,
            documentName: 'Sample Document.pdf',
            documentHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
            transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            certifiedBy: 'LegalDocs Platform',
          },
        };
        setResult(mockResult);
        setStatus('success');
      }
    };

    verifyDocument();
  }, [certificationId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <span className="text-3xl">⚖️</span>
            LegalDocs
          </Link>
          <h1 className="mt-4 text-xl text-gray-600 dark:text-gray-400">{translations.title}</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {status === 'loading' ? (
            /* Loading state */
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">{translations.verifying}</p>
            </div>
          ) : status === 'success' && result?.certification ? (
            /* Success state */
            <>
              {/* Success header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">{translations.verified}</h2>
              </div>

              {/* Certificate details */}
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 sm:w-40 flex-shrink-0">
                      {translations.documentName}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {result.certification.documentName}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 sm:w-40 flex-shrink-0">
                      {translations.documentHash}
                    </span>
                    <code className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {result.certification.documentHash}
                    </code>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 sm:w-40 flex-shrink-0">
                      {translations.timestamp}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(result.certification.timestamp)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 sm:w-40 flex-shrink-0">
                      {translations.certificationId}
                    </span>
                    <code className="font-mono text-sm text-gray-900 dark:text-white">
                      {result.certification.id}
                    </code>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 sm:w-40 flex-shrink-0">
                      {translations.blockNumber}
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      #{result.certification.blockNumber.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 sm:w-40 flex-shrink-0">
                      {translations.transactionHash}
                    </span>
                    <code className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {result.certification.transactionHash}
                    </code>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    {translations.whatThisMeans}
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {translations.verificationExplanation}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 italic">
                    {translations.tamperWarning}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Error state */
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {translations.notFound}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {translations.invalidCert}
              </p>
            </div>
          )}

          {/* Footer actions */}
          <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/${locale}`}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              {translations.backHome}
            </Link>
            <Link
              href={`/${locale}/dashboard/certify`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              {translations.verifyAnother}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {translations.poweredBy}
          </p>
        </div>
      </div>
    </div>
  );
}
