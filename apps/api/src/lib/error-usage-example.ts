/**
 * Example usage of localized error messages
 * This file demonstrates how to use the localized error system in route handlers
 */

import { Context } from 'hono';
import { Errors } from './errors.js';
import { getLocalizedMessage, Language } from './error-messages.js';

/**
 * Example: Authentication endpoint
 */
export async function loginExample(c: Context) {
  // Get user's preferred language from context (set by auth middleware)
  const language: Language = c.get('language') || 'en';

  // Example: Invalid credentials
  const email = 'test@example.com';
  const password = 'wrong-password';

  // Simulate authentication failure
  const isValid = false;

  if (!isValid) {
    // Returns localized error message based on user's language
    return c.json(Errors.invalidCredentials(language).toJSON(), 401);

    // Response examples:
    // EN: { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } }
    // AR: { success: false, error: { code: 'UNAUTHORIZED', message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' } }
    // UR: { success: false, error: { code: 'UNAUTHORIZED', message: 'غلط ای میل یا پاس ورڈ' } }
  }
}

/**
 * Example: Resource not found
 */
export async function getDocumentExample(c: Context) {
  const language: Language = c.get('language') || 'en';
  const documentId = c.req.param('id');

  // Simulate document not found
  const document = null;

  if (!document) {
    // Pass the resource name and language
    return c.json(Errors.notFound('Document', language).toJSON(), 404);

    // Response examples:
    // EN: { success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } }
    // AR: { success: false, error: { code: 'NOT_FOUND', message: 'المورد غير موجود' } }
    // UR: { success: false, error: { code: 'NOT_FOUND', message: 'وسائل نہیں ملا' } }
  }
}

/**
 * Example: Validation error with details
 */
export async function createUserExample(c: Context) {
  const language: Language = c.get('language') || 'en';

  // Simulate validation errors
  const validationErrors = {
    email: ['Invalid email format'],
    password: ['Password must be at least 8 characters'],
  };

  if (Object.keys(validationErrors).length > 0) {
    return c.json(Errors.validation(validationErrors, language).toJSON(), 400);

    // Response examples:
    // EN: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: {...} } }
    // AR: { success: false, error: { code: 'VALIDATION_ERROR', message: 'فشل التحقق من الصحة', details: {...} } }
    // UR: { success: false, error: { code: 'VALIDATION_ERROR', message: 'توثیق ناکام', details: {...} } }
  }
}

/**
 * Example: Rate limiting
 */
export async function rateLimitedExample(c: Context) {
  const language: Language = c.get('language') || 'en';
  const retryAfter = 60; // seconds

  // Check rate limit (simulated)
  const isRateLimited = true;

  if (isRateLimited) {
    return c.json(Errors.rateLimited(retryAfter, language).toJSON(), 429);

    // Response examples:
    // EN: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again in 60 seconds.' } }
    // AR: { success: false, error: { code: 'RATE_LIMITED', message: 'عدد كبير جداً من الطلبات. حاول مرة أخرى في 60 ثانية.' } }
    // UR: { success: false, error: { code: 'RATE_LIMITED', message: 'بہت زیادہ درخواستیں۔ 60 سیکنڈ میں دوبارہ کوشش کریں۔' } }
  }
}

/**
 * Example: Permission denied
 */
export async function forbiddenExample(c: Context) {
  const language: Language = c.get('language') || 'en';
  const userRole = c.get('userRole');

  // Check if user has permission (simulated)
  if (userRole !== 'admin') {
    return c.json(Errors.forbidden('Admin access required', language).toJSON(), 403);

    // Response examples:
    // EN: { success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' } }
    // AR: { success: false, error: { code: 'FORBIDDEN', message: 'ليس لديك صلاحية للقيام بهذا الإجراء' } }
    // UR: { success: false, error: { code: 'FORBIDDEN', message: 'آپ کو یہ کارروائی کرنے کی اجازت نہیں ہے' } }
  }
}

/**
 * Example: Using common messages directly
 */
export async function customMessageExample(c: Context) {
  const language: Language = c.get('language') || 'en';

  // Get a localized message for custom error handling
  const message = getLocalizedMessage('FILE_TOO_LARGE', language);

  return c.json({
    success: false,
    error: {
      code: 'BAD_REQUEST',
      message: message,
    },
  }, 400);
}

/**
 * Example: No authentication (public endpoint)
 */
export async function publicEndpointExample(c: Context) {
  // For public endpoints without authentication,
  // language is still detected from Accept-Language header
  // if optionalAuthMiddleware is used
  const language: Language = c.get('language') || 'en';

  // Handle errors with detected language
  return c.json(Errors.badRequest('Invalid request format', language).toJSON(), 400);
}

/**
 * Testing different Accept-Language headers:
 *
 * 1. Arabic user:
 *    Header: Accept-Language: ar,en;q=0.9
 *    Result: Arabic error messages
 *
 * 2. Urdu user:
 *    Header: Accept-Language: ur,en;q=0.9
 *    Result: Urdu error messages
 *
 * 3. English user:
 *    Header: Accept-Language: en
 *    Result: English error messages
 *
 * 4. Multi-language preference:
 *    Header: Accept-Language: ur,ar;q=0.8,en;q=0.7
 *    Result: Urdu error messages (highest priority)
 *
 * 5. Unsupported language:
 *    Header: Accept-Language: fr,de
 *    Result: English error messages (default fallback)
 *
 * 6. Authenticated user with DB preference:
 *    - User has ui_language='ar' in database
 *    - Header: Accept-Language: en
 *    - Result: Arabic error messages (DB preference takes priority)
 */
