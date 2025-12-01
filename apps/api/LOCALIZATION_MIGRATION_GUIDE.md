# Error Localization Migration Guide

This guide explains how to update existing route handlers to use the new localized error messages.

## Overview

The error handling system now supports three languages:
- **English (en)** - Default
- **Arabic (ar)** - العربية
- **Urdu (ur)** - اردو

## What Changed

### 1. New File Created
- **`src/lib/error-messages.ts`** - Contains all localized error messages and helper functions

### 2. Files Modified
- **`src/lib/errors.ts`** - Updated to support language parameter
- **`src/middleware/auth.ts`** - Now detects and sets user language in context

### 3. Language Detection Priority
1. User's `ui_language` preference from database (if authenticated)
2. `Accept-Language` HTTP header
3. Default to `'en'`

## Migration Steps

### Before (Old Code)
```typescript
import { Errors } from '../lib/errors.js';

export async function myHandler(c: Context) {
  // Old way - no language support
  return c.json(Errors.unauthorized().toJSON(), 401);
}
```

### After (New Code)
```typescript
import { Errors } from '../lib/errors.js';

export async function myHandler(c: Context) {
  // Get user's language from context (set by middleware)
  const language = c.get('language') || 'en';

  // New way - with language support
  return c.json(Errors.unauthorized('Authentication required', language).toJSON(), 401);
}
```

## Error Factory Function Signatures

All error factory functions now accept a `language` parameter as the **last argument**:

### Authentication Errors
```typescript
// Old: Errors.unauthorized()
// New: Errors.unauthorized(message?, language?)
Errors.unauthorized('Custom message', language)

// Old: Errors.invalidCredentials()
// New: Errors.invalidCredentials(language?)
Errors.invalidCredentials(language)

// Old: Errors.tokenExpired()
// New: Errors.tokenExpired(language?)
Errors.tokenExpired(language)

// Old: Errors.invalidToken()
// New: Errors.invalidToken(language?)
Errors.invalidToken(language)
```

### Authorization Errors
```typescript
// Old: Errors.forbidden()
// New: Errors.forbidden(message?, language?)
Errors.forbidden('Admin access required', language)
```

### Resource Errors
```typescript
// Old: Errors.notFound('Document')
// New: Errors.notFound(resource?, language?)
Errors.notFound('Document', language)
```

### Validation Errors
```typescript
// Old: Errors.validation(details)
// New: Errors.validation(details, language?)
Errors.validation({ email: ['Invalid format'] }, language)
```

### Other Errors
```typescript
// Old: Errors.badRequest('message')
// New: Errors.badRequest(message, language?)
Errors.badRequest('Invalid format', language)

// Old: Errors.conflict('message')
// New: Errors.conflict(message, language?)
Errors.conflict('Resource exists', language)

// Old: Errors.userExists()
// New: Errors.userExists(language?)
Errors.userExists(language)

// Old: Errors.rateLimited(60)
// New: Errors.rateLimited(retryAfter?, language?)
Errors.rateLimited(60, language)

// Old: Errors.internal('message')
// New: Errors.internal(message?, language?)
Errors.internal('Server error', language)
```

## Files That Need Updates

The following files use error handlers and should be updated:

1. `src/routes/auth.ts` - Authentication endpoints
2. `src/routes/documents.ts` - Document management
3. `src/routes/signatures.ts` - Signature handling
4. `src/routes/advisor.ts` - AI advisor
5. `src/routes/ai.ts` - AI features
6. `src/routes/uploads.ts` - File uploads
7. `src/routes/notifications.ts` - Notifications
8. `src/middleware/rate-limit.ts` - Rate limiting
9. `src/lib/storage.ts` - Storage utilities
10. `src/middleware/error-handler.ts` - Global error handler

## Update Pattern

For each file, follow this pattern:

### 1. Import Language Type (Optional)
```typescript
import { Language } from '../lib/error-messages.js';
```

### 2. Get Language from Context
```typescript
// At the start of your handler
const language = c.get('language') || 'en';
```

### 3. Pass Language to Error Functions
```typescript
// Update all error calls
return c.json(Errors.unauthorized('Message', language).toJSON(), 401);
```

## Example: Complete Migration

### Before
```typescript
import { Context } from 'hono';
import { Errors } from '../lib/errors.js';

export async function login(c: Context) {
  const { email, password } = await c.req.json();

  // Validate credentials
  if (!isValid) {
    return c.json(Errors.invalidCredentials().toJSON(), 401);
  }

  // Check if user exists
  if (!user) {
    return c.json(Errors.notFound('User').toJSON(), 404);
  }

  // Return success
  return c.json({ success: true, token });
}
```

### After
```typescript
import { Context } from 'hono';
import { Errors } from '../lib/errors.js';

export async function login(c: Context) {
  // Get user's preferred language
  const language = c.get('language') || 'en';

  const { email, password } = await c.req.json();

  // Validate credentials (now localized)
  if (!isValid) {
    return c.json(Errors.invalidCredentials(language).toJSON(), 401);
  }

  // Check if user exists (now localized)
  if (!user) {
    return c.json(Errors.notFound('User', language).toJSON(), 404);
  }

  // Return success
  return c.json({ success: true, token });
}
```

## Testing Localization

### Test with Different Languages

#### 1. Test with Accept-Language Header
```bash
# English
curl -H "Accept-Language: en" http://localhost:8787/api/auth/login

# Arabic
curl -H "Accept-Language: ar" http://localhost:8787/api/auth/login

# Urdu
curl -H "Accept-Language: ur" http://localhost:8787/api/auth/login

# Multiple languages (picks first supported)
curl -H "Accept-Language: ur,ar;q=0.8,en;q=0.7" http://localhost:8787/api/auth/login
```

#### 2. Test with Authenticated User
```bash
# User's DB preference (ui_language) takes priority
curl -H "Authorization: Bearer <token>" \
     -H "Accept-Language: en" \
     http://localhost:8787/api/documents

# If user has ui_language='ar', response will be in Arabic
# even though Accept-Language header says 'en'
```

### Expected Responses

#### English (en)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

#### Arabic (ar)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة"
  }
}
```

#### Urdu (ur)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "غلط ای میل یا پاس ورڈ"
  }
}
```

## Backwards Compatibility

All error functions have default parameters, so existing code will continue to work:

```typescript
// This still works (defaults to English)
Errors.unauthorized().toJSON()

// But this is better (uses user's language)
Errors.unauthorized('Message', language).toJSON()
```

## Best Practices

1. **Always get language from context**: `const language = c.get('language') || 'en'`
2. **Pass language to all error functions**: Even if defaulting to English
3. **Use the middleware**: Ensure `authMiddleware` or `optionalAuthMiddleware` is applied
4. **Test all languages**: Test your endpoints with different Accept-Language headers
5. **Update user preferences**: Allow users to change their `ui_language` in settings

## Common Localized Messages

All these messages are available in English, Arabic, and Urdu:

- Authentication required
- Invalid email or password
- Token has expired
- Invalid or malformed token
- You do not have permission to perform this action
- Resource not found
- Validation failed
- User already exists
- Rate limit exceeded
- An unexpected error occurred
- Admin access required
- Lawyer access required
- File too large
- Unsupported file type

## Additional Helpers

### Get Custom Localized Messages
```typescript
import { getLocalizedMessage } from '../lib/error-messages.js';

const message = getLocalizedMessage('FILE_TOO_LARGE', language);
// Returns: 'File too large' (en) | 'الملف كبير جداً' (ar) | 'فائل بہت بڑی ہے' (ur)
```

### Parse Accept-Language Header
```typescript
import { parseAcceptLanguage } from '../lib/error-messages.js';

const language = parseAcceptLanguage('ar,en;q=0.9');
// Returns: 'ar'
```

## Next Steps

1. Update route handlers one by one
2. Test each updated route with different languages
3. Verify database `ui_language` preference is respected
4. Add language selection to user settings UI
5. Consider localizing validation error messages from Zod schemas

## Need Help?

Check the example file: `src/lib/error-usage-example.ts` for comprehensive usage examples.
