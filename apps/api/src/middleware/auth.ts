import { Context, Next } from 'hono';
import { verifyToken, TokenError, TokenPayload } from '../lib/jwt.js';
import { Errors, ApiError } from '../lib/errors.js';
import { Language, parseAcceptLanguage } from '../lib/error-messages.js';

// Extend Hono's Variables type
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
    userRole: string;
    tokenPayload: TokenPayload;
    language: Language;
  }
}

// Type for environment bindings
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  CACHE: KVNamespace;
};

/**
 * Helper function to detect user's preferred language
 * Priority: 1. User DB preference (if authenticated), 2. Accept-Language header, 3. Default to 'en'
 */
async function detectUserLanguage(c: Context<{ Bindings: Bindings }>, userId?: string): Promise<Language> {
  // If user is authenticated, try to get their preference from database
  if (userId && c.env.DB) {
    try {
      const result = await c.env.DB.prepare(
        'SELECT ui_language FROM users WHERE id = ?'
      ).bind(userId).first<{ ui_language: string }>();

      if (result?.ui_language && ['en', 'ar', 'ur'].includes(result.ui_language)) {
        return result.ui_language as Language;
      }
    } catch (error) {
      console.error('Error fetching user language preference:', error);
    }
  }

  // Fall back to Accept-Language header
  const acceptLanguage = c.req.header('Accept-Language');
  return parseAcceptLanguage(acceptLanguage);
}

/**
 * Authentication middleware
 * Validates JWT token and sets user context
 */
export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  // Detect language early (from header, will be updated after auth if user has preference)
  const headerLanguage = parseAcceptLanguage(c.req.header('Accept-Language'));

  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json(Errors.unauthorized('Authorization header is required', headerLanguage).toJSON(), 401);
  }

  if (!authHeader.startsWith('Bearer ')) {
    return c.json(Errors.unauthorized('Invalid authorization format. Use: Bearer <token>', headerLanguage).toJSON(), 401);
  }

  const token = authHeader.substring(7);

  if (!token) {
    return c.json(Errors.unauthorized('Token is required', headerLanguage).toJSON(), 401);
  }

  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);

    // Check if it's an access token (not refresh token)
    if (payload.type !== 'access') {
      return c.json(Errors.unauthorized('Invalid token type', headerLanguage).toJSON(), 401);
    }

    // Set user info in context
    c.set('userId', payload.userId);
    c.set('userEmail', payload.email);
    c.set('userRole', payload.role);
    c.set('tokenPayload', payload);

    // Detect and set user's preferred language
    const language = await detectUserLanguage(c, payload.userId);
    c.set('language', language);

    await next();
  } catch (error) {
    if (error instanceof TokenError) {
      if (error.code === 'TOKEN_EXPIRED') {
        return c.json(Errors.tokenExpired(headerLanguage).toJSON(), 401);
      }
      return c.json(Errors.invalidToken(headerLanguage).toJSON(), 401);
    }

    console.error('Auth middleware error:', error);
    return c.json(Errors.internal('Authentication failed', headerLanguage).toJSON(), 500);
  }
}

/**
 * Optional authentication middleware
 * Sets user context if token is valid, but doesn't fail if not present
 */
export async function optionalAuthMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    if (token) {
      try {
        const payload = await verifyToken(token, c.env.JWT_SECRET);

        if (payload.type === 'access') {
          c.set('userId', payload.userId);
          c.set('userEmail', payload.email);
          c.set('userRole', payload.role);
          c.set('tokenPayload', payload);

          // Detect and set user's preferred language
          const language = await detectUserLanguage(c, payload.userId);
          c.set('language', language);
        }
      } catch {
        // Token is invalid but we continue anyway for optional auth
      }
    }
  }

  // If no valid token, still set language from header
  if (!c.get('language')) {
    const headerLanguage = parseAcceptLanguage(c.req.header('Accept-Language'));
    c.set('language', headerLanguage);
  }

  await next();
}

/**
 * Role-based authorization middleware
 * Must be used after authMiddleware
 */
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get('userRole');
    const language = c.get('language') || 'en';

    if (!userRole) {
      return c.json(Errors.unauthorized('Authentication required', language).toJSON(), 401);
    }

    if (!allowedRoles.includes(userRole)) {
      return c.json(
        Errors.forbidden(`This action requires one of the following roles: ${allowedRoles.join(', ')}`, language).toJSON(),
        403
      );
    }

    await next();
  };
}

/**
 * Admin-only middleware
 */
export async function adminOnly(c: Context, next: Next) {
  const userRole = c.get('userRole');
  const language = c.get('language') || 'en';

  if (userRole !== 'admin') {
    return c.json(Errors.forbidden('Admin access required', language).toJSON(), 403);
  }

  await next();
}

/**
 * Lawyer-only middleware
 */
export async function lawyerOnly(c: Context, next: Next) {
  const userRole = c.get('userRole');
  const language = c.get('language') || 'en';

  if (userRole !== 'lawyer' && userRole !== 'admin') {
    return c.json(Errors.forbidden('Lawyer access required', language).toJSON(), 403);
  }

  await next();
}

/**
 * Alias for authMiddleware - for backward compatibility
 */
export const requireAuth = authMiddleware;

/**
 * Alias for adminOnly - for backward compatibility
 */
export const requireAdmin = adminOnly;
