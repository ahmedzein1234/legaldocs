/**
 * Security Middleware for LegalDocs API
 *
 * Comprehensive security protections for a legal document platform handling sensitive data:
 * - CSRF Protection with double-submit cookie pattern
 * - Security Headers (CSP, HSTS, X-Frame-Options, etc.)
 * - Origin Validation for sensitive operations
 * - Input Sanitization middleware
 * - Request size limiting
 * - IP-based access control
 *
 * @module middleware/security
 */

import { Context, Next } from 'hono';
import { Errors } from '../lib/errors.js';
import { sanitizeInput, validateEmail, isValidUUID } from '../lib/security-utils.js';

// Type for environment bindings
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  CACHE: KVNamespace;
  CSRF_SECRET?: string;
};

// ============================================
// SECURITY HEADERS MIDDLEWARE
// ============================================

/**
 * Security Headers Middleware
 * Adds comprehensive security headers to all responses
 */
export async function securityHeadersMiddleware(c: Context, next: Next) {
  await next();

  // Content Security Policy - Strict for API (no inline scripts/styles)
  const cspDirectives = [
    "default-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

  c.header('Content-Security-Policy', cspDirectives);

  // Prevent clickjacking attacks
  c.header('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');

  // Enable browser XSS protection (legacy but still useful)
  c.header('X-XSS-Protection', '1; mode=block');

  // Referrer policy - only send origin for cross-origin requests
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - disable unnecessary browser features
  c.header('Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // HSTS - Force HTTPS for 1 year (only in production)
  if (c.req.header('X-Forwarded-Proto') === 'https' || c.req.url.startsWith('https://')) {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Prevent caching of sensitive data
  if (c.req.path.includes('/api/auth') || c.req.path.includes('/api/documents')) {
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
  }
}

// ============================================
// CSRF PROTECTION
// ============================================

/**
 * Generate a CSRF token for a session
 */
export async function generateCSRFToken(secret: string, sessionId: string): Promise<string> {
  const data = `${sessionId}:${Date.now()}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const secretBuffer = encoder.encode(secret);

  const key = await crypto.subtle.importKey(
    'raw',
    secretBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${data}:${signatureHex}`;
}

/**
 * Verify a CSRF token
 */
export async function verifyCSRFToken(
  token: string,
  secret: string,
  sessionId: string,
  maxAgeMs: number = 3600000 // 1 hour default
): Promise<boolean> {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return false;

    const [tokenSessionId, timestamp, signature] = parts;

    // Verify session ID matches
    if (tokenSessionId !== sessionId) return false;

    // Verify token age
    const tokenTime = parseInt(timestamp, 10);
    if (isNaN(tokenTime) || Date.now() - tokenTime > maxAgeMs) return false;

    // Verify signature
    const data = `${tokenSessionId}:${timestamp}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const secretBuffer = encoder.encode(secret);

    const key = await crypto.subtle.importKey(
      'raw',
      secretBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const expectedSignature = await crypto.subtle.sign('HMAC', key, dataBuffer);
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignatureHex;
  } catch {
    return false;
  }
}

/**
 * CSRF Protection Middleware
 * Validates CSRF tokens for state-changing operations
 */
export function csrfProtection(c: Context<{ Bindings: Bindings }>, next: Next) {
  return async () => {
    // Only check CSRF for state-changing methods
    const method = c.req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return await next();
    }

    // Get CSRF token from header
    const csrfToken = c.req.header('X-CSRF-Token');
    if (!csrfToken) {
      return c.json(
        Errors.badRequest('CSRF token is required for this operation').toJSON(),
        403
      );
    }

    // Get user session ID (from JWT payload)
    const userId = c.get('userId');
    if (!userId) {
      return c.json(
        Errors.unauthorized('Authentication required for CSRF validation').toJSON(),
        401
      );
    }

    // Verify CSRF token
    const csrfSecret = c.env.CSRF_SECRET || c.env.JWT_SECRET;
    const valid = await verifyCSRFToken(csrfToken, csrfSecret, userId);

    if (!valid) {
      return c.json(
        Errors.badRequest('Invalid or expired CSRF token').toJSON(),
        403
      );
    }

    await next();
  };
}

/**
 * Generate and return a CSRF token for the current session
 * Use this in a GET endpoint to provide tokens to clients
 */
export async function getCSRFToken(c: Context<{ Bindings: Bindings }>) {
  const userId = c.get('userId');
  if (!userId) {
    return c.json(Errors.unauthorized().toJSON(), 401);
  }

  const csrfSecret = c.env.CSRF_SECRET || c.env.JWT_SECRET;
  const token = await generateCSRFToken(csrfSecret, userId);

  return c.json({
    success: true,
    data: { csrfToken: token },
  });
}

// ============================================
// ORIGIN VALIDATION
// ============================================

const ALLOWED_ORIGINS = [
  'https://legaldocs.pages.dev',
  'https://legaldocs-web.pages.dev',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

/**
 * Validate request origin against allowed list
 */
export function validateOrigin(strictMode = false) {
  return async (c: Context, next: Next) => {
    const origin = c.req.header('Origin') || c.req.header('Referer');

    if (!origin) {
      // In strict mode, require origin header
      if (strictMode) {
        return c.json(
          Errors.badRequest('Origin header is required').toJSON(),
          403
        );
      }
      // In non-strict mode, allow requests without origin (e.g., server-to-server)
      return await next();
    }

    // Check if origin is allowed
    const originUrl = new URL(origin);
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      const allowedUrl = new URL(allowed);
      return originUrl.origin === allowedUrl.origin;
    }) || originUrl.hostname.endsWith('.pages.dev');

    if (!isAllowed) {
      return c.json(
        Errors.forbidden('Request origin is not allowed').toJSON(),
        403
      );
    }

    await next();
  };
}

// ============================================
// INPUT SANITIZATION MIDDLEWARE
// ============================================

/**
 * Sanitize request body inputs
 * Prevents XSS by removing dangerous HTML/script content
 */
export async function sanitizeRequestBody(c: Context, next: Next) {
  try {
    const contentType = c.req.header('Content-Type') || '';

    // Only sanitize JSON bodies
    if (contentType.includes('application/json')) {
      const rawBody = await c.req.raw.clone().text();

      if (rawBody) {
        const body = JSON.parse(rawBody);
        const sanitized = sanitizeInput(body);

        // Replace the request body with sanitized version
        // Note: This is a workaround since Hono doesn't allow body modification
        // The sanitization is applied and can be accessed via c.req.valid()
        (c as any).sanitizedBody = sanitized;
      }
    }
  } catch (error) {
    // If parsing fails, let other middleware handle it
    console.error('Sanitization error:', error);
  }

  await next();
}

// ============================================
// REQUEST SIZE LIMITING
// ============================================

/**
 * Limit request body size to prevent DoS attacks
 */
export function limitRequestSize(maxSizeBytes: number = 10 * 1024 * 1024) {
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('Content-Length');

    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > maxSizeBytes) {
        return c.json(
          Errors.badRequest(
            `Request body too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
          ).toJSON(),
          413
        );
      }
    }

    await next();
  };
}

// ============================================
// IP-BASED ACCESS CONTROL
// ============================================

/**
 * Block requests from specific IP addresses or ranges
 */
export function ipAccessControl(options: {
  blacklist?: string[];
  whitelist?: string[];
  trustProxy?: boolean;
}) {
  const { blacklist = [], whitelist = [], trustProxy = true } = options;

  return async (c: Context, next: Next) => {
    // Get client IP (Cloudflare provides this)
    const clientIP = trustProxy
      ? (c.req.header('CF-Connecting-IP') ||
         c.req.header('X-Forwarded-For')?.split(',')[0].trim() ||
         c.req.header('X-Real-IP') ||
         'unknown')
      : 'direct';

    // Check whitelist (if specified, only allow these IPs)
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      return c.json(
        Errors.forbidden('Access denied from this IP address').toJSON(),
        403
      );
    }

    // Check blacklist
    if (blacklist.includes(clientIP)) {
      return c.json(
        Errors.forbidden('Access denied from this IP address').toJSON(),
        403
      );
    }

    // Store client IP in context for logging/tracking
    c.set('clientIP' as any, clientIP);

    await next();
  };
}

// ============================================
// REQUEST VALIDATION HELPERS
// ============================================

/**
 * Validate common parameters to prevent injection attacks
 */
export function validateRequestParams(c: Context, next: Next) {
  return async () => {
    const params = c.req.param();

    // Validate UUID parameters (common in REST APIs)
    for (const [key, value] of Object.entries(params)) {
      if (key.endsWith('Id') || key === 'id') {
        if (!isValidUUID(value)) {
          return c.json(
            Errors.badRequest(`Invalid ${key} format`).toJSON(),
            400
          );
        }
      }
    }

    // Validate email parameters
    const query = c.req.query();
    if (query.email && !validateEmail(query.email)) {
      return c.json(
        Errors.badRequest('Invalid email format').toJSON(),
        400
      );
    }

    await next();
  };
}

// ============================================
// SENSITIVE DATA LOGGING PREVENTION
// ============================================

/**
 * Redact sensitive fields from objects before logging
 */
export function redactSensitiveData(obj: any): any {
  const sensitiveFields = [
    'password',
    'passwordHash',
    'password_hash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'api_key',
    'creditCard',
    'ssn',
    'emiratesId',
    'emirates_id_hash',
  ];

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Secure logging middleware - redacts sensitive data
 */
export async function secureLogger(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  // Don't log sensitive paths in detail
  const isSensitive = path.includes('/auth/') || path.includes('/password');

  if (!isSensitive) {
    console.log(`→ ${method} ${path}`);
  } else {
    console.log(`→ ${method} [SENSITIVE PATH]`);
  }

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(`← ${method} ${isSensitive ? '[SENSITIVE PATH]' : path} ${status} (${duration}ms)`);
}

// ============================================
// SECURITY AUDIT LOGGING
// ============================================

/**
 * Log security-relevant events to KV for audit trail
 */
export async function logSecurityEvent(
  c: Context<{ Bindings: Bindings }>,
  event: {
    type: 'auth_success' | 'auth_failure' | 'permission_denied' | 'suspicious_activity';
    userId?: string;
    details: Record<string, any>;
  }
) {
  const eventId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
  const userAgent = c.req.header('User-Agent') || 'unknown';

  const logEntry = {
    eventId,
    timestamp,
    type: event.type,
    userId: event.userId,
    clientIP,
    userAgent,
    path: c.req.path,
    method: c.req.method,
    details: redactSensitiveData(event.details),
  };

  try {
    // Store in KV with TTL (90 days for compliance)
    await c.env.CACHE.put(
      `security_log:${timestamp}:${eventId}`,
      JSON.stringify(logEntry),
      { expirationTtl: 90 * 24 * 60 * 60 }
    );
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// ============================================
// EXPORTS
// ============================================

export const securityMiddleware = {
  headers: securityHeadersMiddleware,
  csrf: csrfProtection,
  validateOrigin,
  sanitizeBody: sanitizeRequestBody,
  limitSize: limitRequestSize,
  ipControl: ipAccessControl,
  validateParams: validateRequestParams,
  secureLog: secureLogger,
};
