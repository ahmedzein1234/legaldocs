import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: 'https://9e7bbc42b003b0f8157ff99ca0f6a8d5@o4510257127817217.ingest.de.sentry.io/4510461365125200',
      tracesSampleRate: 1.0,
      debug: false,
      environment: process.env.NODE_ENV,
      release: 'qannoni-web@1.0.0',
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: 'https://9e7bbc42b003b0f8157ff99ca0f6a8d5@o4510257127817217.ingest.de.sentry.io/4510461365125200',
      tracesSampleRate: 1.0,
      debug: false,
      environment: process.env.NODE_ENV,
      release: 'qannoni-web@1.0.0',
    });
  }
}
