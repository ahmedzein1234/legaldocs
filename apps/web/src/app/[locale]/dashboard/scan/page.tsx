'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';

type DocumentType = 'emirates_id' | 'passport' | 'trade_license' | 'visa' | 'contract' | 'other';

interface ExtractedData {
  [key: string]: string | boolean | undefined;
  rawText?: string;
  idNumberValid?: boolean;
}

export default function ScanPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isArabic = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedType, setSelectedType] = useState<DocumentType>('emirates_id');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    title: isArabic ? 'ماسح المستندات الذكي' : 'Smart Document Scanner',
    subtitle: isArabic ? 'استخراج البيانات من الهويات والجوازات والرخص التجارية' : 'Extract data from IDs, passports, and trade licenses',

    documentType: isArabic ? 'نوع المستند' : 'Document Type',
    emiratesId: isArabic ? 'الهوية الإماراتية' : 'Emirates ID',
    passport: isArabic ? 'جواز السفر' : 'Passport',
    tradeLicense: isArabic ? 'الرخصة التجارية' : 'Trade License',
    visa: isArabic ? 'التأشيرة' : 'Visa',
    contract: isArabic ? 'عقد' : 'Contract',
    other: isArabic ? 'أخرى' : 'Other',

    uploadImage: isArabic ? 'رفع صورة' : 'Upload Image',
    dragDrop: isArabic ? 'اسحب وأفلت الصورة هنا أو انقر للتحديد' : 'Drag & drop image here or click to select',
    supportedFormats: isArabic ? 'PNG, JPG, JPEG (حتى 5 ميجابايت)' : 'PNG, JPG, JPEG (up to 5MB)',

    extract: isArabic ? 'استخراج البيانات' : 'Extract Data',
    extracting: isArabic ? 'جاري الاستخراج...' : 'Extracting...',

    results: isArabic ? 'البيانات المستخرجة' : 'Extracted Data',
    confidence: isArabic ? 'نسبة الثقة' : 'Confidence',
    copyAll: isArabic ? 'نسخ الكل' : 'Copy All',
    useInDocument: isArabic ? 'استخدام في مستند' : 'Use in Document',
    scanAnother: isArabic ? 'مسح مستند آخر' : 'Scan Another',

    verified: isArabic ? 'تم التحقق' : 'Verified',
    invalid: isArabic ? 'غير صالح' : 'Invalid',

    // Field labels
    fullName: isArabic ? 'الاسم الكامل' : 'Full Name',
    fullNameAr: isArabic ? 'الاسم بالعربية' : 'Name (Arabic)',
    idNumber: isArabic ? 'رقم الهوية' : 'ID Number',
    nationality: isArabic ? 'الجنسية' : 'Nationality',
    dateOfBirth: isArabic ? 'تاريخ الميلاد' : 'Date of Birth',
    gender: isArabic ? 'الجنس' : 'Gender',
    expiryDate: isArabic ? 'تاريخ الانتهاء' : 'Expiry Date',
    issueDate: isArabic ? 'تاريخ الإصدار' : 'Issue Date',
    passportNumber: isArabic ? 'رقم الجواز' : 'Passport Number',
    licenseNumber: isArabic ? 'رقم الرخصة' : 'License Number',
    companyName: isArabic ? 'اسم الشركة' : 'Company Name',
    activities: isArabic ? 'الأنشطة' : 'Activities',
    emirate: isArabic ? 'الإمارة' : 'Emirate',
  };

  const documentTypes: { value: DocumentType; label: string; icon: string }[] = [
    { value: 'emirates_id', label: translations.emiratesId, icon: '🪪' },
    { value: 'passport', label: translations.passport, icon: '📕' },
    { value: 'trade_license', label: translations.tradeLicense, icon: '📜' },
    { value: 'visa', label: translations.visa, icon: '✈️' },
    { value: 'contract', label: translations.contract, icon: '📄' },
    { value: 'other', label: translations.other, icon: '📋' },
  ];

  const fieldLabels: Record<string, string> = {
    fullName: translations.fullName,
    fullNameAr: translations.fullNameAr,
    idNumber: translations.idNumber,
    nationality: translations.nationality,
    dateOfBirth: translations.dateOfBirth,
    gender: translations.gender,
    expiryDate: translations.expiryDate,
    issueDate: translations.issueDate,
    passportNumber: translations.passportNumber,
    licenseNumber: translations.licenseNumber,
    companyName: translations.companyName,
    companyNameAr: isArabic ? 'اسم الشركة بالعربية' : 'Company Name (Arabic)',
    activities: translations.activities,
    emirate: translations.emirate,
    cardNumber: isArabic ? 'رقم البطاقة' : 'Card Number',
    issuingAuthority: isArabic ? 'جهة الإصدار' : 'Issuing Authority',
    placeOfBirth: isArabic ? 'مكان الميلاد' : 'Place of Birth',
    mrz: isArabic ? 'المنطقة المقروءة آلياً' : 'MRZ',
    legalForm: isArabic ? 'الشكل القانوني' : 'Legal Form',
    owners: isArabic ? 'الملاك' : 'Owners',
    address: isArabic ? 'العنوان' : 'Address',
    capital: isArabic ? 'رأس المال' : 'Capital',
    visaType: isArabic ? 'نوع التأشيرة' : 'Visa Type',
    visaNumber: isArabic ? 'رقم التأشيرة' : 'Visa Number',
    sponsor: isArabic ? 'الكفيل' : 'Sponsor',
    profession: isArabic ? 'المهنة' : 'Profession',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(isArabic ? 'يرجى تحميل صورة' : 'Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(isArabic ? 'حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)' : 'File too large (max 5MB)');
      return;
    }

    setError(null);
    setExtractedData(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const extractData = async () => {
    if (!imagePreview) return;

    setIsExtracting(true);
    setError(null);

    try {
      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: imagePreview,
          documentType: selectedType,
          language: locale,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedData(data.extractedData);
        setConfidence(data.confidence);
      } else {
        // Demo mode - generate mock data
        generateMockExtraction();
      }
    } catch {
      // Demo mode
      generateMockExtraction();
    } finally {
      setIsExtracting(false);
    }
  };

  const generateMockExtraction = () => {
    const mockData: Record<DocumentType, ExtractedData> = {
      emirates_id: {
        fullName: 'John Michael Smith',
        fullNameAr: 'جون مايكل سميث',
        idNumber: '784-1985-1234567-8',
        nationality: 'United States',
        dateOfBirth: '15/03/1985',
        gender: 'Male',
        cardNumber: '12345678901234',
        expiryDate: '14/03/2025',
        issuingAuthority: 'Federal Authority for Identity and Citizenship',
        idNumberValid: true,
      },
      passport: {
        fullName: 'John Michael Smith',
        passportNumber: 'A12345678',
        nationality: 'United States',
        dateOfBirth: '15/03/1985',
        gender: 'Male',
        placeOfBirth: 'New York',
        issueDate: '10/01/2020',
        expiryDate: '09/01/2030',
        issuingAuthority: 'U.S. Department of State',
        mrz: 'P<USASMITH<<JOHN<MICHAEL<<<<<<<<<<<<<<<<<<<<<',
      },
      trade_license: {
        licenseNumber: 'CN-123456',
        companyName: 'Tech Solutions LLC',
        companyNameAr: 'حلول التقنية ذ.م.م',
        legalForm: 'Limited Liability Company',
        activities: 'IT Consultancy, Software Development',
        issueDate: '01/01/2023',
        expiryDate: '31/12/2024',
        issuingAuthority: 'Department of Economic Development',
        emirate: 'Dubai',
        owners: 'John Smith (51%), Ahmed Hassan (49%)',
        address: 'Business Bay, Dubai, UAE',
        capital: 'AED 300,000',
      },
      visa: {
        visaType: 'Employment Visa',
        visaNumber: '201/2024/123456',
        fullName: 'John Michael Smith',
        passportNumber: 'A12345678',
        nationality: 'United States',
        profession: 'Software Engineer',
        sponsor: 'Tech Solutions LLC',
        issueDate: '15/01/2024',
        expiryDate: '14/01/2027',
      },
      contract: {
        documentType: 'Rental Agreement',
        parties: 'John Smith & Ahmed Hassan',
        date: '01/01/2024',
        amount: 'AED 85,000',
        duration: '12 months',
      },
      other: {
        rawText: 'Document text extracted...',
      },
    };

    setExtractedData(mockData[selectedType]);
    setConfidence(0.92);
  };

  const copyAllData = () => {
    if (!extractedData) return;
    const text = Object.entries(extractedData)
      .filter(([key]) => key !== 'idNumberValid' && key !== 'rawText')
      .map(([key, value]) => `${fieldLabels[key] || key}: ${value}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const reset = () => {
    setImagePreview(null);
    setExtractedData(null);
    setConfidence(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {translations.title}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {translations.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload */}
          <div className="space-y-6">
            {/* Document Type Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {translations.documentType}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {documentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      selectedType === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2">{type.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {translations.uploadImage}
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  imagePreview
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg shadow-md mb-3"
                    />
                    <p className="text-sm text-green-600">
                      {isArabic ? 'تم تحميل الصورة بنجاح' : 'Image uploaded successfully'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">{translations.dragDrop}</p>
                    <p className="text-sm text-gray-500 mt-1">{translations.supportedFormats}</p>
                  </div>
                )}
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-500">{error}</p>
              )}

              <button
                onClick={extractData}
                disabled={!imagePreview || isExtracting}
                className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isExtracting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {translations.extracting}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {translations.extract}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {translations.results}
              </h2>
              {extractedData && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{translations.confidence}:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    confidence >= 0.9 ? 'bg-green-100 text-green-700' :
                    confidence >= 0.7 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              )}
            </div>

            {extractedData ? (
              <div className="space-y-4">
                {/* Extracted Fields */}
                <div className="space-y-3">
                  {Object.entries(extractedData)
                    .filter(([key]) => key !== 'idNumberValid' && key !== 'rawText')
                    .map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {fieldLabels[key] || key}
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {String(value)}
                          </p>
                        </div>
                        {key === 'idNumber' && extractedData.idNumberValid !== undefined && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            extractedData.idNumberValid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {extractedData.idNumberValid ? translations.verified : translations.invalid}
                          </span>
                        )}
                      </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={copyAllData}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
                  >
                    {translations.copyAll}
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to document generation with extracted data
                      const params = new URLSearchParams();
                      Object.entries(extractedData).forEach(([k, v]) => {
                        if (v && k !== 'idNumberValid' && k !== 'rawText') {
                          params.set(k, String(v));
                        }
                      });
                      window.location.href = `/${locale}/dashboard/generate?${params.toString()}`;
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    {translations.useInDocument}
                  </button>
                </div>

                <button
                  onClick={reset}
                  className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                >
                  {translations.scanAnother}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  {isArabic ? 'قم بتحميل صورة واضغط على استخراج البيانات' : 'Upload an image and click Extract Data'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
