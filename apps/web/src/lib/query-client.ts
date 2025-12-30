import { QueryClient } from '@tanstack/react-query';
import { captureError } from './error-tracking';

/**
 * Creates and configures a new QueryClient instance with sensible defaults
 * for the LegalDocs application.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data considered fresh for 30 seconds
        staleTime: 1000 * 30,

        // Cache data for 5 minutes
        gcTime: 1000 * 60 * 5,

        // Retry failed requests up to 2 times
        retry: 2,

        // Retry with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus for important data
        refetchOnWindowFocus: true,

        // Don't refetch on mount if data is still fresh
        refetchOnMount: true,

        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,

        // Send errors to Sentry
        onError: (error) => {
          captureError(error, { type: 'mutation_error' });
        },
      },
    },
  });
}

// Singleton instance for the browser
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets or creates a singleton QueryClient instance for browser usage.
 * Creates a new instance for SSR to avoid sharing state between requests.
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return createQueryClient();
  } else {
    // Browser: reuse the same query client
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient();
    }
    return browserQueryClient;
  }
}
