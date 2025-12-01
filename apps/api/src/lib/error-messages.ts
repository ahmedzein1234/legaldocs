/**
 * Localized error messages for API responses
 * Supports English (en), Arabic (ar), and Urdu (ur)
 */

export type Language = 'en' | 'ar' | 'ur';
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'TOKEN_EXPIRED'
  | 'INVALID_TOKEN'
  | 'BAD_REQUEST';

export type LocalizedMessage = {
  en: string;
  ar: string;
  ur: string;
};

/**
 * Error code translations
 */
export const errorMessages: Record<ErrorCode, LocalizedMessage> = {
  UNAUTHORIZED: {
    en: 'Authentication required',
    ar: 'المصادقة مطلوبة',
    ur: 'تصدیق ضروری ہے'
  },
  FORBIDDEN: {
    en: 'You do not have permission to perform this action',
    ar: 'ليس لديك صلاحية للقيام بهذا الإجراء',
    ur: 'آپ کو یہ کارروائی کرنے کی اجازت نہیں ہے'
  },
  NOT_FOUND: {
    en: 'Resource not found',
    ar: 'المورد غير موجود',
    ur: 'وسائل نہیں ملا'
  },
  VALIDATION_ERROR: {
    en: 'Validation failed',
    ar: 'فشل التحقق من الصحة',
    ur: 'توثیق ناکام'
  },
  CONFLICT: {
    en: 'Resource already exists',
    ar: 'المورد موجود بالفعل',
    ur: 'وسائل پہلے سے موجود ہے'
  },
  RATE_LIMITED: {
    en: 'Too many requests. Please try again later.',
    ar: 'عدد كبير جداً من الطلبات. يرجى المحاولة مرة أخرى لاحقاً.',
    ur: 'بہت زیادہ درخواستیں۔ براہ کرم بعد میں دوبارہ کوشش کریں۔'
  },
  INTERNAL_ERROR: {
    en: 'An unexpected error occurred',
    ar: 'حدث خطأ غير متوقع',
    ur: 'ایک غیر متوقع خرابی واقع ہوئی'
  },
  TOKEN_EXPIRED: {
    en: 'Token has expired',
    ar: 'انتهت صلاحية الرمز',
    ur: 'ٹوکن کی میعاد ختم ہو گئی'
  },
  INVALID_TOKEN: {
    en: 'Invalid or malformed token',
    ar: 'رمز غير صالح أو مشوه',
    ur: 'غلط یا خراب ٹوکن'
  },
  BAD_REQUEST: {
    en: 'Invalid request format',
    ar: 'تنسيق الطلب غير صالح',
    ur: 'غلط درخواست کی شکل'
  }
};

/**
 * Common error message translations
 */
export const commonMessages = {
  INVALID_CREDENTIALS: {
    en: 'Invalid email or password',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    ur: 'غلط ای میل یا پاس ورڈ'
  },
  USER_EXISTS: {
    en: 'A user with this email already exists',
    ar: 'يوجد بالفعل مستخدم بهذا البريد الإلكتروني',
    ur: 'اس ای میل کے ساتھ صارف پہلے سے موجود ہے'
  },
  EMAIL_REGISTERED: {
    en: 'Email already registered',
    ar: 'البريد الإلكتروني مسجل بالفعل',
    ur: 'ای میل پہلے سے رجسٹرڈ ہے'
  },
  TOKEN_EXPIRED_MESSAGE: {
    en: 'Token has expired',
    ar: 'انتهت صلاحية الرمز',
    ur: 'ٹوکن کی میعاد ختم ہو گئی'
  },
  RESOURCE_NOT_FOUND: {
    en: 'Resource not found',
    ar: 'المورد غير موجود',
    ur: 'وسائل نہیں ملا'
  },
  RATE_LIMIT_EXCEEDED: {
    en: 'Rate limit exceeded, please try again later',
    ar: 'تم تجاوز حد المعدل، يرجى المحاولة مرة أخرى لاحقاً',
    ur: 'شرح کی حد سے تجاوز، براہ کرم بعد میں دوبارہ کوشش کریں'
  },
  INVALID_REQUEST_FORMAT: {
    en: 'Invalid request format',
    ar: 'تنسيق الطلب غير صالح',
    ur: 'غلط درخواست کی شکل'
  },
  REQUIRED_FIELD_MISSING: {
    en: 'Required field missing',
    ar: 'حقل مطلوب مفقود',
    ur: 'ضروری فیلڈ غائب ہے'
  },
  FILE_TOO_LARGE: {
    en: 'File too large',
    ar: 'الملف كبير جداً',
    ur: 'فائل بہت بڑی ہے'
  },
  UNSUPPORTED_FILE_TYPE: {
    en: 'Unsupported file type',
    ar: 'نوع الملف غير مدعوم',
    ur: 'غیر معاون فائل کی قسم'
  },
  AUTHORIZATION_HEADER_REQUIRED: {
    en: 'Authorization header is required',
    ar: 'رأس التفويض مطلوب',
    ur: 'اجازت کی سرخی ضروری ہے'
  },
  INVALID_AUTHORIZATION_FORMAT: {
    en: 'Invalid authorization format. Use: Bearer <token>',
    ar: 'تنسيق التفويض غير صالح. استخدم: Bearer <token>',
    ur: 'غلط اجازت کی شکل۔ استعمال کریں: Bearer <token>'
  },
  TOKEN_REQUIRED: {
    en: 'Token is required',
    ar: 'الرمز مطلوب',
    ur: 'ٹوکن ضروری ہے'
  },
  INVALID_TOKEN_TYPE: {
    en: 'Invalid token type',
    ar: 'نوع الرمز غير صالح',
    ur: 'غلط ٹوکن کی قسم'
  },
  AUTHENTICATION_FAILED: {
    en: 'Authentication failed',
    ar: 'فشلت المصادقة',
    ur: 'تصدیق ناکام ہو گئی'
  },
  ADMIN_ACCESS_REQUIRED: {
    en: 'Admin access required',
    ar: 'يتطلب وصول المسؤول',
    ur: 'ایڈمن رسائی ضروری ہے'
  },
  LAWYER_ACCESS_REQUIRED: {
    en: 'Lawyer access required',
    ar: 'يتطلب وصول المحامي',
    ur: 'وکیل کی رسائی ضروری ہے'
  }
};

/**
 * Get localized error message for an error code
 */
export function getLocalizedError(code: ErrorCode, language: Language = 'en'): string {
  return errorMessages[code]?.[language] || errorMessages[code]?.en || 'An error occurred';
}

/**
 * Get localized common message
 */
export function getLocalizedMessage(messageKey: keyof typeof commonMessages, language: Language = 'en'): string {
  return commonMessages[messageKey]?.[language] || commonMessages[messageKey]?.en || '';
}

/**
 * Get localized message with resource name
 */
export function getResourceNotFoundMessage(resource: string, language: Language = 'en'): string {
  const messages = {
    en: `${resource} not found`,
    ar: `${resource} غير موجود`,
    ur: `${resource} نہیں ملا`
  };
  return messages[language];
}

/**
 * Get localized role requirement message
 */
export function getRoleRequirementMessage(roles: string[], language: Language = 'en'): string {
  const rolesList = roles.join(', ');
  const messages = {
    en: `This action requires one of the following roles: ${rolesList}`,
    ar: `يتطلب هذا الإجراء أحد الأدوار التالية: ${rolesList}`,
    ur: `اس کارروائی کے لیے درج ذیل میں سے ایک کردار کی ضرورت ہے: ${rolesList}`
  };
  return messages[language];
}

/**
 * Get localized rate limit message with retry time
 */
export function getRateLimitMessage(retryAfter?: number, language: Language = 'en'): string {
  if (retryAfter) {
    const messages = {
      en: `Too many requests. Try again in ${retryAfter} seconds.`,
      ar: `عدد كبير جداً من الطلبات. حاول مرة أخرى في ${retryAfter} ثانية.`,
      ur: `بہت زیادہ درخواستیں۔ ${retryAfter} سیکنڈ میں دوبارہ کوشش کریں۔`
    };
    return messages[language];
  }
  return getLocalizedError('RATE_LIMITED', language);
}

/**
 * Parse Accept-Language header to determine preferred language
 */
export function parseAcceptLanguage(acceptLanguageHeader?: string): Language {
  if (!acceptLanguageHeader) {
    return 'en';
  }

  // Parse Accept-Language header (e.g., "ar,en-US;q=0.9,en;q=0.8")
  const languages = acceptLanguageHeader
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';');
      const q = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;
      // Extract base language code (e.g., "ar" from "ar-SA")
      const baseCode = code.split('-')[0].toLowerCase();
      return { code: baseCode, q };
    })
    .sort((a, b) => b.q - a.q);

  // Find first supported language
  for (const lang of languages) {
    if (lang.code === 'ar' || lang.code === 'ur' || lang.code === 'en') {
      return lang.code as Language;
    }
  }

  return 'en';
}
