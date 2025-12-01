# Error Messages Localization

Complete reference for the LegalDocs API error message localization system.

## Supported Languages

- **English (en)** - Default language
- **Arabic (ar)** - العربية - Right-to-left language
- **Urdu (ur)** - اردو - Right-to-left language

## Language Detection Flow

```
┌─────────────────────────────────────────────┐
│ 1. User makes API request                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 2. Auth middleware runs                      │
│    - Checks if user is authenticated         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 3. Language detection priority:              │
│    a) User's ui_language from database       │
│    b) Accept-Language HTTP header            │
│    c) Default to 'en'                        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 4. Language stored in context                │
│    c.set('language', detectedLanguage)       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 5. Route handler uses language               │
│    const lang = c.get('language') || 'en'    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 6. Error response in user's language         │
│    Errors.unauthorized('msg', lang)          │
└─────────────────────────────────────────────┘
```

## Error Codes and Translations

### UNAUTHORIZED (401)
```typescript
{
  en: 'Authentication required',
  ar: 'المصادقة مطلوبة',
  ur: 'تصدیق ضروری ہے'
}
```

### FORBIDDEN (403)
```typescript
{
  en: 'You do not have permission to perform this action',
  ar: 'ليس لديك صلاحية للقيام بهذا الإجراء',
  ur: 'آپ کو یہ کارروائی کرنے کی اجازت نہیں ہے'
}
```

### NOT_FOUND (404)
```typescript
{
  en: 'Resource not found',
  ar: 'المورد غير موجود',
  ur: 'وسائل نہیں ملا'
}
```

### VALIDATION_ERROR (400)
```typescript
{
  en: 'Validation failed',
  ar: 'فشل التحقق من الصحة',
  ur: 'توثیق ناکام'
}
```

### CONFLICT (409)
```typescript
{
  en: 'Resource already exists',
  ar: 'المورد موجود بالفعل',
  ur: 'وسائل پہلے سے موجود ہے'
}
```

### RATE_LIMITED (429)
```typescript
{
  en: 'Too many requests. Please try again later.',
  ar: 'عدد كبير جداً من الطلبات. يرجى المحاولة مرة أخرى لاحقاً.',
  ur: 'بہت زیادہ درخواستیں۔ براہ کرم بعد میں دوبارہ کوشش کریں۔'
}
```

### INTERNAL_ERROR (500)
```typescript
{
  en: 'An unexpected error occurred',
  ar: 'حدث خطأ غير متوقع',
  ur: 'ایک غیر متوقع خرابی واقع ہوئی'
}
```

### TOKEN_EXPIRED (401)
```typescript
{
  en: 'Token has expired',
  ar: 'انتهت صلاحية الرمز',
  ur: 'ٹوکن کی میعاد ختم ہو گئی'
}
```

### INVALID_TOKEN (401)
```typescript
{
  en: 'Invalid or malformed token',
  ar: 'رمز غير صالح أو مشوه',
  ur: 'غلط یا خراب ٹوکن'
}
```

### BAD_REQUEST (400)
```typescript
{
  en: 'Invalid request format',
  ar: 'تنسيق الطلب غير صالح',
  ur: 'غلط درخواست کی شکل'
}
```

## Common Messages

### INVALID_CREDENTIALS
```typescript
{
  en: 'Invalid email or password',
  ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  ur: 'غلط ای میل یا پاس ورڈ'
}
```

### USER_EXISTS
```typescript
{
  en: 'A user with this email already exists',
  ar: 'يوجد بالفعل مستخدم بهذا البريد الإلكتروني',
  ur: 'اس ای میل کے ساتھ صارف پہلے سے موجود ہے'
}
```

### EMAIL_REGISTERED
```typescript
{
  en: 'Email already registered',
  ar: 'البريد الإلكتروني مسجل بالفعل',
  ur: 'ای میل پہلے سے رجسٹرڈ ہے'
}
```

### FILE_TOO_LARGE
```typescript
{
  en: 'File too large',
  ar: 'الملف كبير جداً',
  ur: 'فائل بہت بڑی ہے'
}
```

### UNSUPPORTED_FILE_TYPE
```typescript
{
  en: 'Unsupported file type',
  ar: 'نوع الملف غير مدعوم',
  ur: 'غیر معاون فائل کی قسم'
}
```

### ADMIN_ACCESS_REQUIRED
```typescript
{
  en: 'Admin access required',
  ar: 'يتطلب وصول المسؤول',
  ur: 'ایڈمن رسائی ضروری ہے'
}
```

### LAWYER_ACCESS_REQUIRED
```typescript
{
  en: 'Lawyer access required',
  ar: 'يتطلب وصول المحامي',
  ur: 'وکیل کی رسائی ضروری ہے'
}
```

## API Reference

### Types

```typescript
type Language = 'en' | 'ar' | 'ur';

type ErrorCode =
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

type LocalizedMessage = {
  en: string;
  ar: string;
  ur: string;
};
```

### Functions

#### getLocalizedError
Get localized error message for an error code.

```typescript
function getLocalizedError(
  code: ErrorCode,
  language: Language = 'en'
): string

// Examples:
getLocalizedError('UNAUTHORIZED', 'en')
// Returns: 'Authentication required'

getLocalizedError('UNAUTHORIZED', 'ar')
// Returns: 'المصادقة مطلوبة'

getLocalizedError('UNAUTHORIZED', 'ur')
// Returns: 'تصدیق ضروری ہے'
```

#### getLocalizedMessage
Get localized common message.

```typescript
function getLocalizedMessage(
  messageKey: keyof typeof commonMessages,
  language: Language = 'en'
): string

// Examples:
getLocalizedMessage('INVALID_CREDENTIALS', 'en')
// Returns: 'Invalid email or password'

getLocalizedMessage('FILE_TOO_LARGE', 'ar')
// Returns: 'الملف كبير جداً'
```

#### parseAcceptLanguage
Parse Accept-Language header to determine preferred language.

```typescript
function parseAcceptLanguage(
  acceptLanguageHeader?: string
): Language

// Examples:
parseAcceptLanguage('ar,en;q=0.9')
// Returns: 'ar'

parseAcceptLanguage('en-US,en;q=0.9,ur;q=0.8')
// Returns: 'en'

parseAcceptLanguage('ur,ar;q=0.8,en;q=0.7')
// Returns: 'ur'

parseAcceptLanguage('fr,de')
// Returns: 'en' (fallback)

parseAcceptLanguage()
// Returns: 'en' (fallback)
```

#### getResourceNotFoundMessage
Get localized resource not found message.

```typescript
function getResourceNotFoundMessage(
  resource: string,
  language: Language = 'en'
): string

// Examples:
getResourceNotFoundMessage('Document', 'en')
// Returns: 'Document not found'

getResourceNotFoundMessage('Document', 'ar')
// Returns: 'Document غير موجود'
```

#### getRoleRequirementMessage
Get localized role requirement message.

```typescript
function getRoleRequirementMessage(
  roles: string[],
  language: Language = 'en'
): string

// Examples:
getRoleRequirementMessage(['admin', 'lawyer'], 'en')
// Returns: 'This action requires one of the following roles: admin, lawyer'

getRoleRequirementMessage(['admin', 'lawyer'], 'ar')
// Returns: 'يتطلب هذا الإجراء أحد الأدوار التالية: admin, lawyer'
```

#### getRateLimitMessage
Get localized rate limit message with optional retry time.

```typescript
function getRateLimitMessage(
  retryAfter?: number,
  language: Language = 'en'
): string

// Examples:
getRateLimitMessage(60, 'en')
// Returns: 'Too many requests. Try again in 60 seconds.'

getRateLimitMessage(60, 'ar')
// Returns: 'عدد كبير جداً من الطلبات. حاول مرة أخرى في 60 ثانية.'

getRateLimitMessage(undefined, 'en')
// Returns: 'Too many requests. Please try again later.'
```

## Usage Examples

### Basic Error Response

```typescript
import { Context } from 'hono';
import { Errors } from '../lib/errors.js';

export async function myHandler(c: Context) {
  const language = c.get('language') || 'en';

  // Simple error
  return c.json(
    Errors.unauthorized('Auth required', language).toJSON(),
    401
  );
}
```

### Validation Error with Details

```typescript
export async function createUser(c: Context) {
  const language = c.get('language') || 'en';

  const errors = {
    email: ['Invalid email format', 'Email already exists'],
    password: ['Password too short']
  };

  return c.json(
    Errors.validation(errors, language).toJSON(),
    400
  );
}
```

### Rate Limiting

```typescript
export async function rateLimitedEndpoint(c: Context) {
  const language = c.get('language') || 'en';
  const retryAfter = 60;

  if (isRateLimited) {
    return c.json(
      Errors.rateLimited(retryAfter, language).toJSON(),
      429
    );
  }
}
```

### Custom Message with Localization

```typescript
import { getLocalizedMessage } from '../lib/error-messages.js';

export async function uploadFile(c: Context) {
  const language = c.get('language') || 'en';
  const file = await c.req.file();

  if (file.size > MAX_SIZE) {
    const message = getLocalizedMessage('FILE_TOO_LARGE', language);

    return c.json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message
      }
    }, 400);
  }
}
```

## HTTP Header Examples

### Accept-Language Header Format

```
Accept-Language: <language>[; q=<quality>][, <language>[; q=<quality>], ...]
```

### Examples

```bash
# Single language
Accept-Language: en

# Multiple languages with quality values
Accept-Language: ar,en;q=0.9

# Complex preference
Accept-Language: ur,ar;q=0.8,en;q=0.7

# Regional variants (base language is extracted)
Accept-Language: ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7
```

### Quality Values (q)
- Range: 0.0 to 1.0 (default is 1.0 if not specified)
- Higher values = higher preference
- Languages are matched in order of quality value

## Database Schema

The `users` table includes a `ui_language` field:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  ui_language TEXT DEFAULT 'en',
  -- other fields...
);
```

Valid values: `'en'`, `'ar'`, `'ur'`

## Middleware Integration

### Authentication Middleware
Automatically detects and sets language in context:

```typescript
export async function authMiddleware(c: Context, next: Next) {
  // Parses Accept-Language header
  const headerLanguage = parseAcceptLanguage(c.req.header('Accept-Language'));

  // ... authenticate user ...

  // Fetches user's ui_language from database if available
  const language = await detectUserLanguage(c, userId);
  c.set('language', language);

  await next();
}
```

### Optional Authentication
Also supports language detection:

```typescript
export async function optionalAuthMiddleware(c: Context, next: Next) {
  // Sets language from user DB or Accept-Language header
  // Falls back to 'en' if neither available
  const language = await detectUserLanguage(c, userId);
  c.set('language', language);

  await next();
}
```

## Testing

### Test Different Languages

```bash
# Test English
curl -H "Accept-Language: en" \
     http://localhost:8787/api/invalid-endpoint

# Test Arabic
curl -H "Accept-Language: ar" \
     http://localhost:8787/api/invalid-endpoint

# Test Urdu
curl -H "Accept-Language: ur" \
     http://localhost:8787/api/invalid-endpoint
```

### Test with Authentication

```bash
# User's database preference overrides header
curl -H "Authorization: Bearer <token>" \
     -H "Accept-Language: en" \
     http://localhost:8787/api/documents

# If user.ui_language = 'ar', response will be in Arabic
```

### Expected Responses

#### English Response
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

#### Arabic Response
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "المورد غير موجود"
  }
}
```

#### Urdu Response
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "وسائل نہیں ملا"
  }
}
```

## Adding New Languages

To add support for a new language:

1. Update the `Language` type in `error-messages.ts`:
```typescript
export type Language = 'en' | 'ar' | 'ur' | 'fr'; // Add 'fr' for French
```

2. Add translations to all message objects:
```typescript
export const errorMessages: Record<ErrorCode, LocalizedMessage> = {
  UNAUTHORIZED: {
    en: 'Authentication required',
    ar: 'المصادقة مطلوبة',
    ur: 'تصدیق ضروری ہے',
    fr: 'Authentification requise' // Add French
  },
  // ... repeat for all error codes
};
```

3. Update `parseAcceptLanguage` function to recognize the new language
4. Update database schema to allow the new language value
5. Test all endpoints with the new language

## Best Practices

1. **Always get language from context**: Don't hardcode language values
2. **Use type-safe helpers**: Import and use the provided helper functions
3. **Fallback to English**: Always provide 'en' as a fallback
4. **Test all languages**: Test your endpoints with all supported languages
5. **Consistent messaging**: Use error factories instead of creating errors manually
6. **User preference priority**: Database preference should override header
7. **Document custom messages**: If adding new messages, update this README

## Troubleshooting

### Language not detected
- Check if middleware is applied to the route
- Verify Accept-Language header is sent correctly
- Check user's ui_language value in database

### Always getting English responses
- Verify language is being set in context: `c.set('language', lang)`
- Check if language parameter is being passed to error functions
- Ensure middleware runs before route handlers

### Mixed language responses
- Ensure all error calls in a handler use the same language variable
- Don't mix localized and non-localized error calls

### Database language preference not working
- Verify user is authenticated
- Check if DB query is successful
- Ensure ui_language field contains valid value ('en', 'ar', or 'ur')

## Performance Considerations

- Language detection happens once per request (in middleware)
- Database query for user preference is cached during request lifecycle
- No performance impact on error responses (simple object lookups)
- Accept-Language header parsing is lightweight

## Security Notes

- Language preference is user-controlled (not sensitive data)
- No SQL injection risk (uses parameterized queries)
- No XSS risk (JSON responses are properly encoded)
- Language codes are validated before use

## Future Enhancements

Potential improvements:
- Add more languages (French, Spanish, Hindi, etc.)
- Localize validation error messages from Zod schemas
- Add date/time formatting based on language/locale
- Support regional variants (e.g., ar-SA, ar-EG)
- Add translation management system
- Cache translations for better performance
- Support pluralization rules per language
