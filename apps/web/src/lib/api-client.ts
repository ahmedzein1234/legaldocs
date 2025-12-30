/**
 * Typed API Client for LegalDocs
 *
 * SECURITY: This client uses httpOnly cookies for authentication.
 * - Cookies are set by the backend via Set-Cookie headers
 * - Cookies are automatically included via credentials: 'include'
 * - No tokens are stored in localStorage (prevents XSS attacks)
 *
 * Provides a centralized, type-safe way to make API requests with:
 * - Automatic cookie-based authentication
 * - Error handling and response parsing
 * - Base URL configuration via environment variable
 * - Request/response logging in development
 * - Sentry error tracking
 */

import { captureError } from './error-tracking';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// Only log in browser during development
const isClient = typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

const log = (...args: unknown[]) => {
  if (isClient && isDevelopment) console.log(...args);
};

// CSRF token cache
let csrfToken: string | null = null;
let csrfTokenExpiry: number = 0;
const CSRF_TOKEN_TTL = 50 * 60 * 1000; // 50 minutes (tokens valid for 1 hour)

/**
 * Fetch a fresh CSRF token from the backend
 */
async function fetchCSRFToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.data?.csrfToken || null;
      csrfTokenExpiry = Date.now() + CSRF_TOKEN_TTL;
      return csrfToken;
    }
  } catch (error) {
    log('[CSRF] Failed to fetch token:', error);
  }
  return null;
}

/**
 * Get a valid CSRF token, fetching a new one if needed
 */
async function getCSRFToken(): Promise<string | null> {
  // Return cached token if still valid
  if (csrfToken && Date.now() < csrfTokenExpiry) {
    return csrfToken;
  }
  return fetchCSRFToken();
}

/**
 * Clear cached CSRF token (call on logout)
 */
export function clearCSRFToken(): void {
  csrfToken = null;
  csrfTokenExpiry = 0;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: HeadersInit;
}

/**
 * Makes a typed API request to the backend
 * Authentication is handled via httpOnly cookies (credentials: 'include')
 *
 * @param endpoint - API endpoint (e.g., '/api/documents')
 * @param options - Request options including method, body, headers
 * @returns Typed response data
 * @throws ApiError on request failure
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers: customHeaders } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // Add CSRF token for state-changing operations (POST, PATCH, PUT, DELETE)
  // Skip for auth endpoints as they handle CSRF differently
  const isStateChanging = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
  const isAuthEndpoint = endpoint.includes('/api/auth/');

  if (isStateChanging && !isAuthEndpoint) {
    const token = await getCSRFToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  const url = `${API_URL}${endpoint}`;
  log(`[API] ${method} ${url}`, body ? JSON.stringify(body).substring(0, 200) + '...' : '');

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // Include httpOnly cookies in requests
    });

    log(`[API] Response status: ${response.status}`);

    // Parse response body
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: unknown;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      const errorMessage =
        (isJson && typeof data === 'object' && data && 'error' in data)
          ? String(data.error)
          : `API request failed with status ${response.status}`;

      // Send error to Sentry instead of console.error
      captureError(new ApiError(errorMessage, response.status, data), {
        endpoint,
        method,
        status: response.status,
      });
      throw new ApiError(errorMessage, response.status, data);
    }

    log(`[API] Success response:`, JSON.stringify(data).substring(0, 200) + '...');
    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors - send to Sentry
    captureError(error, {
      type: 'network_error',
      endpoint,
      method,
    });
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      undefined,
      error
    );
  }
}

/**
 * API Client with cookie-based authentication
 * All requests include credentials: 'include' for httpOnly cookies
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * @deprecated Use apiClient directly - authentication is handled via httpOnly cookies
 */
export function createApiClient(_token?: string | null) {
  // Token parameter ignored - auth is via cookies
  return apiClient;
}

/**
 * @deprecated Tokens are no longer stored in localStorage for security
 * Authentication is handled via httpOnly cookies
 */
export function getStoredToken(): string | null {
  console.warn('getStoredToken is deprecated. Authentication is now handled via httpOnly cookies.');
  return null;
}

/**
 * @deprecated Use apiClient directly - authentication is handled via httpOnly cookies
 */
export function getAuthenticatedClient() {
  return apiClient;
}

/**
 * Public API client (same as apiClient - cookies determine auth state)
 */
export const publicApi = apiClient;
