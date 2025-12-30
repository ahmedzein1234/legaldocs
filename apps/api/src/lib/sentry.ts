/**
 * Sentry Error Tracking for Cloudflare Workers
 * Using official @sentry/cloudflare SDK
 */

import * as Sentry from '@sentry/cloudflare';

export const SENTRY_DSN = 'https://9e7bbc42b003b0f8157ff99ca0f6a8d5@o4510257127817217.ingest.de.sentry.io/4510461365125200';

/**
 * Wrap the Hono app with Sentry
 */
export { Sentry };

/**
 * Capture an error manually
 */
export function captureError(error: Error | unknown, extras?: Record<string, unknown>): void {
  if (error instanceof Error) {
    Sentry.captureException(error, { extra: extras });
  } else {
    Sentry.captureMessage(String(error), { level: 'error', extra: extras });
  }
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.captureMessage(message, { level });
}

/**
 * Set user context for Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  category?: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}): void {
  Sentry.addBreadcrumb({
    ...breadcrumb,
    timestamp: Date.now() / 1000,
  });
}
