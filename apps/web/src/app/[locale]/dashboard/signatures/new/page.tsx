'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DeliveryMethod,
  SignerRole,
  getRoleLabel,
  validateEmail,
  validatePhone,
  formatPhoneForWhatsApp,
} from '@/lib/digital-signature';

interface SignerInput {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: SignerRole;
  deliveryMethod: DeliveryMethod;
}

export default function NewSignatureRequestPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isArabic = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    signingOrder: 'sequential' as 'sequential' | 'parallel',
    expiresInDays: 7,
    reminderFrequency: 'daily' as 'none' | 'daily' | 'weekly',
    allowDecline: true,
    requireVerification: true,
  });

  const [document, setDocument] = useState<File | null>(null);
  const [signers, setSigners] = useState<SignerInput[]>([
    {
      id: '1',
      name: '',
      email: '',
      phone: '',
      role: 'signer',
      deliveryMethod: 'email',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const translations = {
    title: isArabic ? 'طلب توقيع جديد' : 'New Signature Request',
    subtitle: isArabic ? 'أرسل مستندًا للتوقيع عبر البريد الإلكتروني أو الواتساب' : 'Send a document for signature via Email or WhatsApp',
    back: isArabic ? 'رجوع' : 'Back',

    // Document section
    documentSection: isArabic ? 'المستند' : 'Document',
    uploadDocument: isArabic ? 'رفع المستند' : 'Upload Document',
    dragDrop: isArabic ? 'اسحب وأفلت الملف هنا أو انقر للتحديد' : 'Drag & drop file here or click to select',
    supportedFormats: isArabic ? 'PDF, DOC, DOCX (حتى 10 ميجابايت)' : 'PDF, DOC, DOCX (up to 10MB)',

    // Details section
    detailsSection: isArabic ? 'تفاصيل الطلب' : 'Request Details',
    requestTitle: isArabic ? 'عنوان الطلب' : 'Request Title',
    requestTitlePlaceholder: isArabic ? 'مثال: عقد عمل - أحمد' : 'e.g., Employment Contract - Ahmed',
    message: isArabic ? 'رسالة للموقعين (اختياري)' : 'Message to signers (optional)',
    messagePlaceholder: isArabic ? 'أضف رسالة شخصية للموقعين...' : 'Add a personal message to the signers...',

    // Signers section
    signersSection: isArabic ? 'الموقعون' : 'Signers',
    addSigner: isArabic ? 'إضافة موقع' : 'Add Signer',
    signerName: isArabic ? 'الاسم' : 'Name',
    signerEmail: isArabic ? 'البريد الإلكتروني' : 'Email',
    signerPhone: isArabic ? 'رقم الهاتف (واتساب)' : 'Phone (WhatsApp)',
    signerRole: isArabic ? 'الدور' : 'Role',
    deliveryMethod: isArabic ? 'طريقة الإرسال' : 'Delivery Method',
    removeSigner: isArabic ? 'إزالة' : 'Remove',

    // Delivery options
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    whatsapp: isArabic ? 'واتساب' : 'WhatsApp',
    both: isArabic ? 'كلاهما' : 'Both',

    // Settings section
    settingsSection: isArabic ? 'الإعدادات' : 'Settings',
    signingOrder: isArabic ? 'ترتيب التوقيع' : 'Signing Order',
    sequential: isArabic ? 'متتابع (واحد تلو الآخر)' : 'Sequential (one after another)',
    parallel: isArabic ? 'متوازي (الكل في نفس الوقت)' : 'Parallel (all at once)',
    expiresIn: isArabic ? 'ينتهي خلال' : 'Expires in',
    days: isArabic ? 'أيام' : 'days',
    reminders: isArabic ? 'التذكيرات' : 'Reminders',
    none: isArabic ? 'بدون' : 'None',
    daily: isArabic ? 'يومي' : 'Daily',
    weekly: isArabic ? 'أسبوعي' : 'Weekly',
    allowDecline: isArabic ? 'السماح بالرفض' : 'Allow Decline',
    requireOTP: isArabic ? 'طلب التحقق برمز OTP' : 'Require OTP Verification',

    // Submit
    sendRequest: isArabic ? 'إرسال طلب التوقيع' : 'Send Signature Request',
    sending: isArabic ? 'جاري الإرسال...' : 'Sending...',

    // Errors
    documentRequired: isArabic ? 'يرجى رفع المستند' : 'Please upload a document',
    titleRequired: isArabic ? 'يرجى إدخال العنوان' : 'Please enter a title',
    signerNameRequired: isArabic ? 'يرجى إدخال اسم الموقع' : 'Please enter signer name',
    emailRequired: isArabic ? 'البريد الإلكتروني مطلوب لطريقة الإرسال هذه' : 'Email is required for this delivery method',
    phoneRequired: isArabic ? 'رقم الهاتف مطلوب لطريقة الإرسال هذه' : 'Phone is required for this delivery method',
    invalidEmail: isArabic ? 'بريد إلكتروني غير صالح' : 'Invalid email address',
    invalidPhone: isArabic ? 'رقم هاتف غير صالح' : 'Invalid phone number',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, document: 'Invalid file type' });
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, document: 'File too large (max 10MB)' });
        return;
      }
      setDocument(file);
      setErrors({ ...errors, document: '' });
    }
  };

  const addSigner = () => {
    setSigners([
      ...signers,
      {
        id: Date.now().toString(),
        name: '',
        email: '',
        phone: '',
        role: 'signer',
        deliveryMethod: 'email',
      },
    ]);
  };

  const removeSigner = (id: string) => {
    if (signers.length > 1) {
      setSigners(signers.filter(s => s.id !== id));
    }
  };

  const updateSigner = (id: string, field: keyof SignerInput, value: string) => {
    setSigners(signers.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!document) {
      newErrors.document = translations.documentRequired;
    }

    if (!formData.title.trim()) {
      newErrors.title = translations.titleRequired;
    }

    signers.forEach((signer, index) => {
      if (!signer.name.trim()) {
        newErrors[`signer_${index}_name`] = translations.signerNameRequired;
      }

      if (signer.deliveryMethod === 'email' || signer.deliveryMethod === 'both') {
        if (!signer.email.trim()) {
          newErrors[`signer_${index}_email`] = translations.emailRequired;
        } else if (!validateEmail(signer.email)) {
          newErrors[`signer_${index}_email`] = translations.invalidEmail;
        }
      }

      if (signer.deliveryMethod === 'whatsapp' || signer.deliveryMethod === 'both') {
        if (!signer.phone.trim()) {
          newErrors[`signer_${index}_phone`] = translations.phoneRequired;
        } else if (!validatePhone(signer.phone)) {
          newErrors[`signer_${index}_phone`] = translations.invalidPhone;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, this would upload the document and create the signature request
      const payload = {
        documentName: document?.name,
        documentType: document?.type,
        title: formData.title,
        message: formData.message,
        signers: signers.map((s, index) => ({
          name: s.name,
          email: s.email || undefined,
          phone: s.phone ? formatPhoneForWhatsApp(s.phone) : undefined,
          role: s.role,
          deliveryMethod: s.deliveryMethod,
        })),
        signingOrder: formData.signingOrder,
        expiresInDays: formData.expiresInDays,
        reminderFrequency: formData.reminderFrequency,
        allowDecline: formData.allowDecline,
        requireVerification: formData.requireVerification,
      };

      console.log('Creating signature request:', payload);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirect to signatures list
      router.push(`/${locale}/dashboard/signatures`);
    } catch (error) {
      console.error('Error creating signature request:', error);
      setErrors({ submit: 'Failed to create signature request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/signatures`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <svg className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {translations.back}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {translations.title}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {translations.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Document Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {translations.documentSection}
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                document
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : errors.document
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {document ? (
                <div>
                  <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium text-gray-900 dark:text-white">{document.name}</p>
                  <p className="text-sm text-gray-500">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">{translations.dragDrop}</p>
                  <p className="text-sm text-gray-500 mt-1">{translations.supportedFormats}</p>
                </div>
              )}
            </div>
            {errors.document && (
              <p className="mt-2 text-sm text-red-500">{errors.document}</p>
            )}
          </div>

          {/* Request Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {translations.detailsSection}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {translations.requestTitle} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={translations.requestTitlePlaceholder}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {translations.message}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={translations.messagePlaceholder}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Signers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {translations.signersSection}
              </h2>
              <button
                type="button"
                onClick={addSigner}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {translations.addSigner}
              </button>
            </div>

            <div className="space-y-6">
              {signers.map((signer, index) => (
                <div key={signer.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-gray-500">
                      {isArabic ? `موقع ${index + 1}` : `Signer ${index + 1}`}
                    </span>
                    {signers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSigner(signer.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        {translations.removeSigner}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translations.signerName} *
                      </label>
                      <input
                        type="text"
                        value={signer.name}
                        onChange={(e) => updateSigner(signer.id, 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors[`signer_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`signer_${index}_name`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`signer_${index}_name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translations.signerRole}
                      </label>
                      <select
                        value={signer.role}
                        onChange={(e) => updateSigner(signer.id, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {(['signer', 'approver', 'witness', 'cc'] as SignerRole[]).map((role) => (
                          <option key={role} value={role}>
                            {getRoleLabel(role, isArabic)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translations.signerEmail}
                      </label>
                      <input
                        type="email"
                        value={signer.email}
                        onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors[`signer_${index}_email`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`signer_${index}_email`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`signer_${index}_email`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translations.signerPhone}
                      </label>
                      <input
                        type="tel"
                        value={signer.phone}
                        onChange={(e) => updateSigner(signer.id, 'phone', e.target.value)}
                        placeholder="+971 50 123 4567"
                        className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors[`signer_${index}_phone`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`signer_${index}_phone`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`signer_${index}_phone`]}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {translations.deliveryMethod}
                      </label>
                      <div className="flex gap-4">
                        {(['email', 'whatsapp', 'both'] as DeliveryMethod[]).map((method) => (
                          <label key={method} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`delivery_${signer.id}`}
                              value={method}
                              checked={signer.deliveryMethod === method}
                              onChange={(e) => updateSigner(signer.id, 'deliveryMethod', e.target.value)}
                              className="text-blue-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                              {method === 'email' && '📧'}
                              {method === 'whatsapp' && '📱'}
                              {method === 'both' && '📧📱'}
                              {method === 'email' ? translations.email : method === 'whatsapp' ? translations.whatsapp : translations.both}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {translations.settingsSection}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {translations.signingOrder}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="signingOrder"
                      value="sequential"
                      checked={formData.signingOrder === 'sequential'}
                      onChange={(e) => setFormData({ ...formData, signingOrder: 'sequential' })}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translations.sequential}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="signingOrder"
                      value="parallel"
                      checked={formData.signingOrder === 'parallel'}
                      onChange={(e) => setFormData({ ...formData, signingOrder: 'parallel' })}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translations.parallel}</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {translations.expiresIn}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={formData.expiresInDays}
                      onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{translations.days}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {translations.reminders}
                  </label>
                  <select
                    value={formData.reminderFrequency}
                    onChange={(e) => setFormData({ ...formData, reminderFrequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="none">{translations.none}</option>
                    <option value="daily">{translations.daily}</option>
                    <option value="weekly">{translations.weekly}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowDecline}
                    onChange={(e) => setFormData({ ...formData, allowDecline: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{translations.allowDecline}</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requireVerification}
                    onChange={(e) => setFormData({ ...formData, requireVerification: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{translations.requireOTP}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {translations.sending}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {translations.sendRequest}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
