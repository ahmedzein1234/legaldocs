import { Context, Next } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ApiError, isApiError, Errors, formatZodError } from '../lib/errors.js';
import { ZodError } from 'zod';

/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Error caught by handler:', error);

    // Handle our custom API errors
    if (isApiError(error)) {
      return c.json(error.toJSON(), error.statusCode as ContentfulStatusCode);
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const details = formatZodError(error);
      return c.json(Errors.validation(details).toJSON(), 400);
    }

    // Handle unknown errors - in Workers, we don't have process.env
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    return c.json(Errors.internal(message).toJSON(), 500);
  }
}

/**
 * Not found handler for unmatched routes
 */
export function notFoundHandler(c: Context) {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
    },
    404
  );
}

/**
 * Request logging middleware with timing
 */
export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const { method, path } = c.req;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // Color code based on status
  const statusColor =
    status >= 500 ? '🔴' : status >= 400 ? '🟠' : status >= 300 ? '🟡' : '🟢';

  console.log(`${statusColor} ${method} ${path} ${status} ${duration}ms`);
}

/**
 * Response wrapper middleware
 * Wraps successful responses in a consistent format
 */
export async function responseWrapper(c: Context, next: Next) {
  await next();

  // Only wrap JSON responses that aren't already wrapped
  const contentType = c.res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    try {
      const body = await c.res.json() as Record<string, unknown>;

      // Already wrapped or is an error response
      if (body.success !== undefined || body.error) {
        return;
      }

      // Wrap the response
      const wrappedBody = {
        success: true,
        data: body,
      };

      c.res = new Response(JSON.stringify(wrappedBody), {
        status: c.res.status,
        headers: c.res.headers,
      });
    } catch {
      // Not valid JSON, skip
    }
  }
}
