# Security Implementation Guide

Quick reference guide for implementing the new security features in LegalDocs API.

---

## Quick Start

### 1. Apply Security Headers (Required)

**File:** `apps/api/src/index.ts`

```typescript
import { securityHeadersMiddleware } from './middleware/index.js';

// Add after CORS, before error handler
app.use('*', securityHeadersMiddleware);
```

### 2. Add CSRF Token Endpoint (Required for Frontend)

**File:** `apps/api/src/routes/auth.ts`

```typescript
import { getCSRFToken } from '../middleware/index.js';

// Add this route
auth.get('/csrf-token', authMiddleware, getCSRFToken);
```

**Frontend Usage:**
```typescript
// 1. Get CSRF token when user logs in
const { csrfToken } = await fetch('/api/auth/csrf-token', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
}).then(r => r.json());

// 2. Include in all state-changing requests
await fetch('/api/auth/change-password', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'X-CSRF-Token': csrfToken,  // <- Add this
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ currentPassword, newPassword })
});
```

---

## Common Security Patterns

### Pattern 1: Protected Sensitive Route

```typescript
import { authMiddleware, csrfProtection, rateLimiters } from '../middleware/index.js';

router.post('/sensitive-operation',
  authMiddleware,           // 1. Require authentication
  csrfProtection,          // 2. Validate CSRF token
  rateLimiters.sensitive,  // 3. Strict rate limiting
  zValidator('json', schema),
  async (c) => {
    // Your handler
  }
);
```

### Pattern 2: File Upload Route

```typescript
import { authMiddleware, rateLimiters, limitRequestSize } from '../middleware/index.js';
import { validateFileUpload, sanitizeFilename } from '../lib/security-utils.js';

router.post('/upload',
  authMiddleware,
  limitRequestSize(100 * 1024 * 1024), // 100MB
  rateLimiters.upload,
  zValidator('json', uploadSchema),
  async (c) => {
    const { fileName, mimeType, fileData } = c.req.valid('json');

    // Validate file
    const validation = validateFileUpload({
      fileName,
      mimeType,
      sizeBytes: Buffer.from(fileData, 'base64').length,
      maxSizeMB: 100
    });

    if (!validation.valid) {
      return c.json(Errors.badRequest(validation.error!).toJSON(), 400);
    }

    // Sanitize filename
    const safeFileName = sanitizeFilename(fileName);

    // Process upload...
  }
);
```

### Pattern 3: User Input Sanitization

```typescript
import { sanitizeRequestBody } from '../middleware/index.js';
import { sanitizeInput } from '../lib/security-utils.js';

// Option A: Use middleware (automatic)
router.post('/create-document',
  authMiddleware,
  sanitizeRequestBody,  // Automatically sanitizes JSON body
  zValidator('json', schema),
  async (c) => {
    const body = c.req.valid('json');
    // body is already sanitized
  }
);

// Option B: Manual sanitization
router.post('/create-document',
  authMiddleware,
  zValidator('json', schema),
  async (c) => {
    const body = c.req.valid('json');
    const sanitized = sanitizeInput(body);
    // Use sanitized data
  }
);
```

### Pattern 4: Origin Validation

```typescript
import { validateOrigin } from '../middleware/index.js';

// For sensitive operations
router.post('/delete-account',
  authMiddleware,
  validateOrigin(true),  // Strict mode - requires valid Origin header
  rateLimiters.sensitive,
  async (c) => {
    // Only processes if Origin is in allowlist
  }
);
```

### Pattern 5: SQL Query with Validation

```typescript
import { validateOrderBy, validateSQLIdentifier } from '../lib/security-utils.js';

router.get('/documents',
  authMiddleware,
  async (c) => {
    const sortBy = c.req.query('sortBy') || 'created_at';
    const order = c.req.query('order') || 'DESC';

    // Validate ORDER BY to prevent SQL injection
    const sortConfig = validateOrderBy(
      sortBy,
      order,
      ['created_at', 'title', 'status', 'updated_at'] // Whitelist
    );

    if (!sortConfig) {
      return c.json(Errors.badRequest('Invalid sort parameters').toJSON(), 400);
    }

    // Safe to use in query
    const results = await db
      .prepare(`SELECT * FROM documents ORDER BY ${sortConfig.column} ${sortConfig.direction}`)
      .all();
  }
);
```

### Pattern 6: Security Event Logging

```typescript
import { logSecurityEvent } from '../middleware/index.js';

// Log successful authentication
await logSecurityEvent(c, {
  type: 'auth_success',
  userId: user.id,
  details: { email: user.email, method: 'password' }
});

// Log failed authentication
await logSecurityEvent(c, {
  type: 'auth_failure',
  details: { email: body.email, reason: 'invalid_password' }
});

// Log permission denied
await logSecurityEvent(c, {
  type: 'permission_denied',
  userId: c.get('userId'),
  details: { resource: 'document', action: 'delete', documentId }
});

// Log suspicious activity
await logSecurityEvent(c, {
  type: 'suspicious_activity',
  userId: c.get('userId'),
  details: { activity: 'multiple_failed_uploads', count: 5 }
});
```

### Pattern 7: PII Masking for Logs

```typescript
import { maskEmail, maskPhoneNumber, maskEmiratesID } from '../lib/security-utils.js';

// Before logging user data
console.log('User profile updated:', {
  userId: user.id,
  email: maskEmail(user.email),           // j***@example.com
  phone: maskPhoneNumber(user.phone),     // +971***123
  emiratesId: maskEmiratesID(user.emiratesId) // 784-****-*******-*
});
```

---

## Route-Specific Implementations

### Auth Routes (`apps/api/src/routes/auth.ts`)

```typescript
// Registration - use registration rate limiter
auth.post('/register',
  rateLimiters.registration,  // Changed from rateLimiters.auth
  zValidator('json', registerSchema),
  async (c) => { ... }
);

// Login - keep auth rate limiter
auth.post('/login',
  rateLimiters.auth,
  zValidator('json', loginSchema),
  async (c) => { ... }
);

// Password change - add CSRF
auth.post('/change-password',
  authMiddleware,
  csrfProtection,  // Add this
  rateLimiters.sensitive,
  zValidator('json', changePasswordSchema),
  async (c) => { ... }
);

// Profile update - add CSRF and sanitization
auth.patch('/profile',
  authMiddleware,
  csrfProtection,  // Add this
  sanitizeRequestBody,  // Add this
  zValidator('json', updateProfileSchema),
  async (c) => { ... }
);
```

### Document Routes (`apps/api/src/routes/documents.ts`)

```typescript
import { sanitizeRequestBody, rateLimiters } from '../middleware/index.js';

// Create document
documents.post('/',
  authMiddleware,
  sanitizeRequestBody,  // Add this
  rateLimiters.documentGeneration,  // Add this
  zValidator('json', createDocumentSchema),
  async (c) => { ... }
);

// Update document
documents.patch('/:id',
  authMiddleware,
  sanitizeRequestBody,  // Add this
  zValidator('json', updateDocumentSchema),
  async (c) => { ... }
);
```

### Upload Routes (`apps/api/src/routes/uploads.ts`)

```typescript
import { limitRequestSize } from '../middleware/index.js';
import { validateFileUpload } from '../lib/security-utils.js';

uploads.post('/extract',
  authMiddleware,
  limitRequestSize(100 * 1024 * 1024),  // Add this
  rateLimiters.aiGeneration,
  zValidator('json', uploadSchema),
  async (c) => {
    const body = c.req.valid('json');

    // Add file validation
    const validation = validateFileUpload({
      fileName: body.fileName,
      mimeType: body.mimeType,
      sizeBytes: Buffer.from(body.fileData, 'base64').length,
      maxSizeMB: 100
    });

    if (!validation.valid) {
      return c.json(Errors.badRequest(validation.error!).toJSON(), 400);
    }

    // Continue with upload...
  }
);
```

---

## Environment Configuration

### Required Environment Variables

Add to your `.env` and Cloudflare Workers secrets:

```bash
# Required (existing)
JWT_SECRET=<your-strong-secret-here>

# Optional (uses JWT_SECRET if not set)
CSRF_SECRET=<separate-csrf-secret>
```

### Generating Secure Secrets

```bash
# Generate a secure random secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

---

## Validation Helpers Reference

### Email Validation
```typescript
import { validateEmail } from '../lib/security-utils.js';

if (!validateEmail(email)) {
  return c.json(Errors.badRequest('Invalid email format').toJSON(), 400);
}
```

### UUID Validation
```typescript
import { isValidUUID } from '../lib/security-utils.js';

const { documentId } = c.req.param();
if (!isValidUUID(documentId)) {
  return c.json(Errors.badRequest('Invalid document ID').toJSON(), 400);
}
```

### Phone Number Validation
```typescript
import { validatePhoneNumber } from '../lib/security-utils.js';

if (phone && !validatePhoneNumber(phone)) {
  return c.json(Errors.badRequest('Invalid phone number').toJSON(), 400);
}
```

### Emirates ID Validation
```typescript
import { validateEmiratesID } from '../lib/security-utils.js';

if (emiratesId && !validateEmiratesID(emiratesId)) {
  return c.json(Errors.badRequest('Invalid Emirates ID format').toJSON(), 400);
}
```

---

## Rate Limiter Reference

| Limiter | Window | Limit | Use Case |
|---------|--------|-------|----------|
| `auth` | 15 min | 10 | Login, token refresh |
| `registration` | 1 hour | 3 | New account registration |
| `api` | 1 min | 100 | General API calls |
| `aiGeneration` | 1 min | 10 | AI document generation |
| `upload` | 1 min | 20 | File uploads |
| `documentGeneration` | 1 min | 20 | Document creation |
| `signatureRequest` | 1 hour | 50 | Signature requests |
| `search` | 1 min | 30 | Search queries |
| `sensitive` | 1 hour | 5 | Password reset, account deletion |
| `email` | 1 hour | 10 | Email sending |
| `public` | 1 min | 20 | Unauthenticated endpoints |

---

## Testing Security Features

### Test CSRF Protection

```typescript
// Should succeed
const csrfToken = await getCSRFToken();
await fetch('/api/auth/change-password', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ currentPassword, newPassword })
});

// Should fail with 403
await fetch('/api/auth/change-password', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    // Missing X-CSRF-Token header
  },
  body: JSON.stringify({ currentPassword, newPassword })
});
```

### Test Rate Limiting

```bash
# Trigger rate limit (should get 429 on 11th request)
for i in {1..15}; do
  curl -X POST http://localhost:8787/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Request $i"
done
```

### Test Input Sanitization

```typescript
// XSS attempt - should be sanitized
const response = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    title: '<script>alert("XSS")</script>Test Document',
    content: 'Hello <img src=x onerror="alert(1)">'
  })
});

// Should be stored as:
// title: "Test Document"
// content: "Hello "
```

---

## Troubleshooting

### CSRF Token Issues

**Problem:** Getting 403 "Invalid or expired CSRF token"

**Solutions:**
1. Token expires after 1 hour - get a new token
2. Ensure `X-CSRF-Token` header is set correctly
3. Check that user is authenticated before getting CSRF token
4. Verify CSRF_SECRET environment variable is set

### Rate Limiting Issues

**Problem:** Getting rate limited too quickly

**Solutions:**
1. Check if you're using the correct rate limiter
2. Verify IP address detection (check CF-Connecting-IP header)
3. In development, temporarily increase limits
4. Clear rate limit store if needed (restart server)

### CORS Issues

**Problem:** Request blocked by CORS after adding security headers

**Solutions:**
1. Ensure origin is in ALLOWED_ORIGINS list
2. Check that CORS middleware is before security headers
3. Verify Origin header is being sent
4. Add your development domain to allowlist

---

## Migration Checklist

- [ ] Add `securityHeadersMiddleware` to `apps/api/src/index.ts`
- [ ] Add CSRF token endpoint to auth routes
- [ ] Update frontend to request and include CSRF tokens
- [ ] Add `csrfProtection` to sensitive routes
- [ ] Update registration route to use `rateLimiters.registration`
- [ ] Add `sanitizeRequestBody` to document routes
- [ ] Add file validation to upload routes
- [ ] Add `limitRequestSize` to upload routes
- [ ] Implement security event logging for auth events
- [ ] Add PII masking to log statements
- [ ] Update environment variables with CSRF_SECRET
- [ ] Test all security features
- [ ] Update API documentation

---

## Additional Resources

- **Full Security Audit:** See `SECURITY_AUDIT_REPORT.md`
- **Security Middleware:** `apps/api/src/middleware/security.ts`
- **Security Utils:** `apps/api/src/lib/security-utils.ts`
- **Rate Limiters:** `apps/api/src/middleware/rate-limit.ts`

---

**Last Updated:** November 30, 2025
