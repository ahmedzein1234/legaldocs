/**
 * Typed API Client for LegalDocs
 *
 * Provides a centralized, type-safe way to make API requests with:
 * - Automatic token injection from auth context
 * - Error handling and response parsing
 * - Base URL configuration via environment variable
 * - Request/response logging in development
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// Only log in browser, not during SSR
const isClient = typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

const log = (...args: unknown[]) => {
  if (isClient && isDevelopment) console.log(...args);
};

const logError = (...args: unknown[]) => {
  if (isClient) console.error(...args);
};

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
  token?: string | null;
  headers?: HeadersInit;
}

/**
 * Makes a typed API request to the backend
 * @param endpoint - API endpoint (e.g., '/api/documents')
 * @param options - Request options including method, body, token, headers
 * @returns Typed response data
 * @throws ApiError on request failure
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, token, headers: customHeaders } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // Inject authorization token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  log(`[API] ${method} ${url}`, body ? JSON.stringify(body).substring(0, 200) + '...' : '');

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
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

      logError(`[API] Error response:`, data);
      throw new ApiError(errorMessage, response.status, data);
    }

    log(`[API] Success response:`, JSON.stringify(data).substring(0, 200) + '...');
    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    logError(`[API] Network error:`, error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      undefined,
      error
    );
  }
}

/**
 * API Client factory that automatically injects the auth token
 * @param token - Authentication token to use for all requests
 * @returns API client with bound token
 */
export function createApiClient(token: string | null) {
  return {
    get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'token'>) =>
      apiRequest<T>(endpoint, { ...options, method: 'GET', token }),

    post: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body' | 'token'>) =>
      apiRequest<T>(endpoint, { ...options, method: 'POST', body, token }),

    patch: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body' | 'token'>) =>
      apiRequest<T>(endpoint, { ...options, method: 'PATCH', body, token }),

    put: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body' | 'token'>) =>
      apiRequest<T>(endpoint, { ...options, method: 'PUT', body, token }),

    delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'token'>) =>
      apiRequest<T>(endpoint, { ...options, method: 'DELETE', token }),
  };
}

/**
 * Public API client (no auth required)
 */
export const publicApi = createApiClient(null);

/**
 * Helper to get auth token from localStorage (client-side only)
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('legaldocs_token');
}

/**
 * Creates an authenticated API client using the stored token
 */
export function getAuthenticatedClient() {
  return createApiClient(getStoredToken());
}
