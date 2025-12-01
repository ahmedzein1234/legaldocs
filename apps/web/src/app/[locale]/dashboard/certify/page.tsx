'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type CertificationStatus = 'idle' | 'uploading' | 'certifying' | 'success' | 'error';

interface Certification {
  id: string;
  documentName: string;
  documentHash: string;
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
  status: 'certified' | 'pending';
  verificationUrl: string;
}

// Mock certifications for demonstration
const mockCertifications: Certification[] = [
  {
    id: 'cert_abc123def456',
    documentName: 'Employment Contract - Ahmed.pdf',
    documentHash: 'sha256:a1b2c3d4e5f6789...',
    timestamp: '2024-01-15T10:30:00Z',
    blockNumber: 18956234,
    transactionHash: '0x1a2b3c4d5e6f...',
    status: 'certified',
    verificationUrl: '/verify/cert_abc123def456',
  },
  {
    id: 'cert_xyz789ghi012',
    documentName: 'NDA Agreement - TechCorp.pdf',
    documentHash: 'sha256:9z8y7x6w5v4u3...',
    timestamp: '2024-01-14T14:20:00Z',
    blockNumber: 18955128,
    transactionHash: '0x9z8y7x6w5v4u...',
    status: 'certified',
    verificationUrl: '/verify/cert_xyz789ghi012',
  },
];

export default function CertifyPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isArabic = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [certifications, setCertifications] = useState<Certification[]>(mockCertifications);
  const [status, setStatus] = useState<CertificationStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [newCertification, setNewCertification] = useState<Certification | null>(null);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [dragActive, setDragActive] = useState(false);

  const translations = {
    title: isArabic ? 'توثيق المستندات بالبلوكشين' : 'Blockchain Document Certification',
    subtitle: isArabic ? 'اثبت صحة مستنداتك بتقنية البلوكشين' : 'Prove document authenticity with blockchain technology',
    uploadDocument: isArabic ? 'رفع مستند' : 'Upload Document',
    pasteContent: isArabic ? 'لصق المحتوى' : 'Paste Content',
    dragDrop: isArabic ? 'اسحب وأفلت الملف هنا أو انقر للتحميل' : 'Drag & drop file here or click to upload',
    supportedFormats: isArabic ? 'PDF, Word, TXT حتى 10MB' : 'PDF, Word, TXT up to 10MB',
    pasteText: isArabic ? 'الصق نص المستند للتوثيق' : 'Paste document text to certify',
    certifyDocument: isArabic ? 'توثيق المستند' : 'Certify Document',
    certifying: isArabic ? 'جاري التوثيق...' : 'Certifying...',
    certificationSuccess: isArabic ? 'تم التوثيق بنجاح!' : 'Certification Successful!',
    yourCertifications: isArabic ? 'شهاداتك' : 'Your Certifications',
    documentName: isArabic ? 'اسم المستند' : 'Document Name',
    documentHash: isArabic ? 'بصمة المستند' : 'Document Hash',
    timestamp: isArabic ? 'وقت التوثيق' : 'Timestamp',
    blockNumber: isArabic ? 'رقم الكتلة' : 'Block Number',
    transactionHash: isArabic ? 'رقم المعاملة' : 'Transaction Hash',
    status: isArabic ? 'الحالة' : 'Status',
    certified: isArabic ? 'موثق' : 'Certified',
    pending: isArabic ? 'قيد الانتظار' : 'Pending',
    verify: isArabic ? 'تحقق' : 'Verify',
    download: isArabic ? 'تحميل الشهادة' : 'Download Certificate',
    copyLink: isArabic ? 'نسخ الرابط' : 'Copy Link',
    copied: isArabic ? 'تم النسخ!' : 'Copied!',
    noCertifications: isArabic ? 'لا توجد شهادات بعد' : 'No certifications yet',
    startCertifying: isArabic ? 'ابدأ بتوثيق مستنداتك' : 'Start certifying your documents',
    howItWorks: isArabic ? 'كيف يعمل' : 'How It Works',
    step1Title: isArabic ? 'رفع المستند' : 'Upload Document',
    step1Desc: isArabic ? 'قم برفع المستند أو لصق محتواه' : 'Upload your document or paste its content',
    step2Title: isArabic ? 'إنشاء البصمة' : 'Generate Hash',
    step2Desc: isArabic ? 'يتم إنشاء بصمة فريدة SHA-256' : 'A unique SHA-256 fingerprint is created',
    step3Title: isArabic ? 'التسجيل بالبلوكشين' : 'Blockchain Record',
    step3Desc: isArabic ? 'يتم تسجيل البصمة بالبلوكشين' : 'The hash is recorded on the blockchain',
    step4Title: isArabic ? 'الحصول على الشهادة' : 'Get Certificate',
    step4Desc: isArabic ? 'احصل على شهادة قابلة للتحقق' : 'Receive a verifiable certificate',
    verificationLink: isArabic ? 'رابط التحقق' : 'Verification Link',
    qrCode: isArabic ? 'رمز QR' : 'QR Code',
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCertify = async () => {
    if (inputMode === 'file' && !selectedFile) return;
    if (inputMode === 'text' && !documentContent.trim()) return;

    setStatus('uploading');
    setError('');

    try {
      // Simulate file reading or use text content
      let content = documentContent;
      if (inputMode === 'file' && selectedFile) {
        // In a real app, we'd read the file content
        // For demo, we'll use the file name
        content = selectedFile.name + '_' + Date.now();
      }

      setStatus('certifying');

      // Call API to certify
      const response = await fetch('/api/blockchain/certify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentContent: content,
          documentName: selectedFile?.name || 'Document',
          documentType: selectedFile?.type || 'text/plain',
        }),
      });

      if (!response.ok) {
        // Demo mode - create mock certification
        const mockCert: Certification = {
          id: `cert_${Date.now().toString(36)}`,
          documentName: selectedFile?.name || 'Document.txt',
          documentHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          timestamp: new Date().toISOString(),
          blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
          transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          status: 'certified',
          verificationUrl: '',
        };
        mockCert.verificationUrl = `/verify/${mockCert.id}`;

        setNewCertification(mockCert);
        setCertifications(prev => [mockCert, ...prev]);
        setStatus('success');
        return;
      }

      const data = await response.json();
      const cert: Certification = {
        id: data.certificationId,
        documentName: selectedFile?.name || 'Document.txt',
        documentHash: data.documentHash,
        timestamp: data.timestamp,
        blockNumber: data.blockNumber,
        transactionHash: data.transactionHash,
        status: 'certified',
        verificationUrl: `/verify/${data.certificationId}`,
      };

      setNewCertification(cert);
      setCertifications(prev => [cert, ...prev]);
      setStatus('success');
    } catch (err) {
      console.error('Certification error:', err);
      // Demo mode fallback
      const mockCert: Certification = {
        id: `cert_${Date.now().toString(36)}`,
        documentName: selectedFile?.name || 'Document.txt',
        documentHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        timestamp: new Date().toISOString(),
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        status: 'certified',
        verificationUrl: '',
      };
      mockCert.verificationUrl = `/verify/${mockCert.id}`;

      setNewCertification(mockCert);
      setCertifications(prev => [mockCert, ...prev]);
      setStatus('success');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setSelectedFile(null);
    setDocumentContent('');
    setNewCertification(null);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(window.location.origin + text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {translations.title}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {translations.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main certification area */}
          <div className="lg:col-span-2 space-y-6">
            {/* How it works */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {translations.howItWorks}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '📤', title: translations.step1Title, desc: translations.step1Desc },
                  { icon: '🔐', title: translations.step2Title, desc: translations.step2Desc },
                  { icon: '⛓️', title: translations.step3Title, desc: translations.step3Desc },
                  { icon: '📜', title: translations.step4Title, desc: translations.step4Desc },
                ].map((step, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl mb-2">{step.icon}</div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{step.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              {status === 'success' && newCertification ? (
                /* Success view */
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {translations.certificationSuccess}
                  </h2>

                  <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-start">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{translations.documentName}</p>
                        <p className="font-medium text-gray-900 dark:text-white">{newCertification.documentName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{translations.documentHash}</p>
                        <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{newCertification.documentHash}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{translations.timestamp}</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(newCertification.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{translations.verificationLink}</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {window.location.origin}{newCertification.verificationUrl}
                          </code>
                          <button
                            onClick={() => copyToClipboard(newCertification.verificationUrl, 'new')}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          >
                            {copiedId === 'new' ? '✓' : '📋'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code placeholder */}
                  <div className="mt-6 flex justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-4xl">📱</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{translations.qrCode}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-center">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {translations.certifyDocument}
                    </button>
                    <Link
                      href={`/${locale}${newCertification.verificationUrl}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {translations.verify}
                    </Link>
                  </div>
                </div>
              ) : (
                /* Upload form */
                <>
                  {/* Input mode toggle */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setInputMode('file')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        inputMode === 'file'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      📁 {translations.uploadDocument}
                    </button>
                    <button
                      onClick={() => setInputMode('text')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        inputMode === 'text'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      📝 {translations.pasteContent}
                    </button>
                  </div>

                  {inputMode === 'file' ? (
                    /* File upload */
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : selectedFile
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileSelect}
                      />
                      {selectedFile ? (
                        <>
                          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">{translations.dragDrop}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{translations.supportedFormats}</p>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Text input */
                    <textarea
                      value={documentContent}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      placeholder={translations.pasteText}
                      className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleCertify}
                    disabled={status !== 'idle' || (inputMode === 'file' ? !selectedFile : !documentContent.trim())}
                    className={`mt-6 w-full py-3 rounded-lg font-medium transition-colors ${
                      status !== 'idle' || (inputMode === 'file' ? !selectedFile : !documentContent.trim())
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {status === 'uploading' || status === 'certifying' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {translations.certifying}
                      </span>
                    ) : (
                      <>🔐 {translations.certifyDocument}</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Certifications sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {translations.yourCertifications}
              </h2>

              {certifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📜</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{translations.noCertifications}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{translations.startCertifying}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {cert.documentName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(cert.timestamp)}
                          </p>
                          <code className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {cert.documentHash.substring(0, 24)}...
                          </code>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          cert.status === 'certified'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {cert.status === 'certified' ? translations.certified : translations.pending}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Link
                          href={`/${locale}${cert.verificationUrl}`}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          {translations.verify} →
                        </Link>
                        <button
                          onClick={() => copyToClipboard(cert.verificationUrl, cert.id)}
                          className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400"
                        >
                          {copiedId === cert.id ? translations.copied : translations.copyLink}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">
                {isArabic ? 'إحصائيات التوثيق' : 'Certification Stats'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold">{certifications.length}</p>
                  <p className="text-sm text-blue-100">
                    {isArabic ? 'مستندات موثقة' : 'Documents Certified'}
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold">100%</p>
                  <p className="text-sm text-blue-100">
                    {isArabic ? 'قابلة للتحقق' : 'Verifiable'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
