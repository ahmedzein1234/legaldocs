'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Error - Qannoni</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(to bottom, #fff, #f8f9fa);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          @media (prefers-color-scheme: dark) {
            body { background: linear-gradient(to bottom, #0a0a0a, #1a1a1a); color: #fff; }
            .card { background: #1a1a1a; border-color: #333; }
            .subtitle { color: #888; }
            .error-id { background: #222; color: #888; }
          }
          .container { max-width: 480px; width: 100%; text-align: center; }
          .icon-container { margin-bottom: 2rem; }
          .icon-bg {
            width: 120px; height: 120px;
            background: rgba(220, 53, 69, 0.1);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .icon {
            width: 60px; height: 60px;
            color: #dc3545;
          }
          h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
          .subtitle { color: #666; margin-bottom: 1.5rem; }
          .error-id {
            display: inline-block;
            background: #f1f3f4;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.75rem;
            color: #666;
            margin-bottom: 1.5rem;
          }
          .error-id code { font-family: monospace; }
          .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }
          .btn-primary {
            background: #2563eb;
            color: white;
          }
          .btn-primary:hover { background: #1d4ed8; }
          .btn-outline {
            background: transparent;
            color: #374151;
            border: 1px solid #d1d5db;
          }
          .btn-outline:hover { background: #f3f4f6; }
          @media (prefers-color-scheme: dark) {
            .btn-outline { color: #9ca3af; border-color: #374151; }
            .btn-outline:hover { background: #1f2937; }
          }
          .footer {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.875rem;
            color: #666;
          }
          @media (prefers-color-scheme: dark) {
            .footer { border-color: #374151; }
          }
          .footer a { color: #2563eb; text-decoration: none; }
          .footer a:hover { text-decoration: underline; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon-container">
            <div className="icon-bg">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>

          <h1>Something went wrong</h1>
          <p className="subtitle">
            We apologize for the inconvenience. Our team has been notified and is working to fix it.
          </p>

          {error.digest && (
            <div className="error-id">
              Error ID: <code>{error.digest}</code>
            </div>
          )}

          <div className="actions">
            <button className="btn btn-primary" onClick={() => reset()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Try Again
            </button>
            <button className="btn btn-outline" onClick={() => window.location.href = '/'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go to Home
            </button>
          </div>

          <div className="footer">
            Need help? <a href="mailto:support@qannoni.com">Contact Support</a>
          </div>
        </div>
      </body>
    </html>
  );
}
