/**
 * Cookie utilities for secure authentication
 * Implements httpOnly cookies for JWT tokens
 */

import { Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Always use secure in production
  sameSite: 'None' as const, // Required for cross-origin requests
  path: '/',
};

// Cookie names
export const ACCESS_TOKEN_COOKIE = 'qannoni_access_token';
export const REFRESH_TOKEN_COOKIE = 'qannoni_refresh_token';

// Token expiry durations (in seconds)
const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

/**
 * Get the domain for cookies based on environment
 */
function getCookieDomain(c: Context): string | undefined {
  const origin = c.req.header('origin') || '';

  // For local development, don't set domain
  if (origin.includes('localhost')) {
    return undefined;
  }

  // For production, use the root domain
  if (origin.includes('qannoni.com')) {
    return '.qannoni.com';
  }

  // For Cloudflare Pages preview deployments
  if (origin.includes('.pages.dev')) {
    return undefined; // Let browser handle it
  }

  return undefined;
}

/**
 * Set authentication cookies after login/register
 */
export function setAuthCookies(
  c: Context,
  accessToken: string,
  refreshToken: string
): void {
  const domain = getCookieDomain(c);

  // Set access token cookie (short-lived)
  setCookie(c, ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    ...(domain && { domain }),
  });

  // Set refresh token cookie (longer-lived)
  setCookie(c, REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    ...(domain && { domain }),
  });
}

/**
 * Get access token from cookie
 */
export function getAccessToken(c: Context): string | undefined {
  return getCookie(c, ACCESS_TOKEN_COOKIE);
}

/**
 * Get refresh token from cookie
 */
export function getRefreshToken(c: Context): string | undefined {
  return getCookie(c, REFRESH_TOKEN_COOKIE);
}

/**
 * Clear authentication cookies on logout
 */
export function clearAuthCookies(c: Context): void {
  const domain = getCookieDomain(c);

  deleteCookie(c, ACCESS_TOKEN_COOKIE, {
    ...COOKIE_OPTIONS,
    ...(domain && { domain }),
  });

  deleteCookie(c, REFRESH_TOKEN_COOKIE, {
    ...COOKIE_OPTIONS,
    ...(domain && { domain }),
  });
}

/**
 * Update access token cookie (for token refresh)
 */
export function updateAccessToken(c: Context, accessToken: string): void {
  const domain = getCookieDomain(c);

  setCookie(c, ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    ...(domain && { domain }),
  });
}
