import { Language, getLocalizedError } from './error-messages.js';

/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error {
  public language: Language;

  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, string[]>,
    language: Language = 'en'
  ) {
    super(message);
    this.name = 'ApiError';
    this.language = language;
  }

  toJSON() {
    // Use localized message if available, otherwise fall back to the provided message
    const localizedMessage = getLocalizedError(this.code, this.language);

    return {
      success: false,
      error: {
        code: this.code,
        message: localizedMessage || this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export type ErrorCode =
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

/**
 * Pre-defined error factories for common cases
 */
export const Errors = {
  // Authentication errors
  unauthorized: (message = 'Authentication required', language: Language = 'en') =>
    new ApiError('UNAUTHORIZED', message, 401, undefined, language),

  invalidCredentials: (language: Language = 'en') =>
    new ApiError('UNAUTHORIZED', 'Invalid email or password', 401, undefined, language),

  tokenExpired: (language: Language = 'en') =>
    new ApiError('TOKEN_EXPIRED', 'Token has expired', 401, undefined, language),

  invalidToken: (language: Language = 'en') =>
    new ApiError('INVALID_TOKEN', 'Invalid or malformed token', 401, undefined, language),

  // Authorization errors
  forbidden: (message = 'You do not have permission to perform this action', language: Language = 'en') =>
    new ApiError('FORBIDDEN', message, 403, undefined, language),

  // Resource errors
  notFound: (resource = 'Resource', language: Language = 'en') =>
    new ApiError('NOT_FOUND', `${resource} not found`, 404, undefined, language),

  // Validation errors
  validation: (details: Record<string, string[]>, language: Language = 'en') =>
    new ApiError('VALIDATION_ERROR', 'Validation failed', 400, details, language),

  badRequest: (message: string, language: Language = 'en') =>
    new ApiError('BAD_REQUEST', message, 400, undefined, language),

  // Conflict errors
  conflict: (message: string, language: Language = 'en') =>
    new ApiError('CONFLICT', message, 409, undefined, language),

  userExists: (language: Language = 'en') =>
    new ApiError('CONFLICT', 'A user with this email already exists', 409, undefined, language),

  // Rate limiting
  rateLimited: (retryAfter?: number, language: Language = 'en') =>
    new ApiError(
      'RATE_LIMITED',
      `Too many requests. ${retryAfter ? `Try again in ${retryAfter} seconds.` : 'Please try again later.'}`,
      429,
      undefined,
      language
    ),

  // Server errors
  internal: (message = 'An unexpected error occurred', language: Language = 'en') =>
    new ApiError('INTERNAL_ERROR', message, 500, undefined, language),

  // Service unavailable
  serviceUnavailable: (message = 'Service temporarily unavailable', language: Language = 'en') =>
    new ApiError('INTERNAL_ERROR', message, 503, undefined, language),
};

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Convert Zod validation errors to our error format
 */
export function formatZodError(error: { issues: Array<{ path: (string | number)[]; message: string }> }): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(issue.message);
  }

  return details;
}
