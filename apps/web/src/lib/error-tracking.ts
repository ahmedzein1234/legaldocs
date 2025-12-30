'use client';

/**
 * Error Tracking Utility
 *
 * This module provides error tracking functionality for the Qannoni web app.
 * It integrates with Sentry when configured, and provides fallback logging.
 */

import * as Sentry from '@sentry/nextjs';

// Sentry is now always enabled with hardcoded DSN
const isSentryEnabled = typeof window !== 'undefined';

/**
 * Initialize error tracking
 * Call this in your app's entry point
 */
export function initErrorTracking() {
  if (typeof window === 'undefined') return;

  // Set up global error handlers
  window.onerror = (message, source, lineno, colno, error) => {
    captureError(error || new Error(String(message)), {
      source,
      lineno,
      colno,
    });
  };

  window.onunhandledrejection = (event) => {
    captureError(event.reason, {
      type: 'unhandledRejection',
    });
  };

  console.log('[ErrorTracking] Initialized', isSentryEnabled ? 'with Sentry' : 'without Sentry');
}

/**
 * Capture an error
 */
export function captureError(
  error: Error | unknown,
  extras?: Record<string, unknown>
): void {
  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorTracking]', error, extras);
  }

  // Send to Sentry if configured
  if (isSentryEnabled) {
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: extras });
    } else {
      Sentry.captureMessage(String(error), {
        level: 'error',
        extra: extras,
      });
    }
  }
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  extras?: Record<string, unknown>
): void {
  // Log based on level
  if (level === 'error') {
    console.error('[ErrorTracking]', message, extras);
  } else if (level === 'warning') {
    console.warn('[ErrorTracking]', message, extras);
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[ErrorTracking]', message, extras);
  }

  // Send to Sentry if configured
  if (isSentryEnabled) {
    Sentry.captureMessage(message, {
      level,
      extra: extras,
    });
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; name?: string } | null): void {
  if (isSentryEnabled) {
    Sentry.setUser(user);
  }
}

/**
 * Add a breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  category?: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}): void {
  if (isSentryEnabled) {
    Sentry.addBreadcrumb({
      ...breadcrumb,
      timestamp: Date.now() / 1000,
    });
  }
}

/**
 * Higher-order function to wrap async functions with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureError(error, {
        ...context,
        functionName: fn.name || 'anonymous',
        args: args.map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg).slice(0, 100) : String(arg)
        ),
      });
      throw error;
    }
  }) as T;
}

/**
 * Error boundary helper - use with React Error Boundaries
 */
export function logComponentError(error: Error, errorInfo: { componentStack: string }): void {
  captureError(error, {
    componentStack: errorInfo.componentStack,
  });
}
