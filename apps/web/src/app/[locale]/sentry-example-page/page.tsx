'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bug, CheckCircle } from 'lucide-react';

export default function SentryExamplePage() {
  const [errorSent, setErrorSent] = useState(false);

  const triggerError = () => {
    // This will throw an error and be captured by Sentry
    throw new Error('Sentry Test Error - This is a test error from Qannoni');
  };

  const triggerSentryCapture = () => {
    try {
      // Intentionally throw an error
      throw new Error('Manually captured error from Qannoni');
    } catch (error) {
      Sentry.captureException(error);
      setErrorSent(true);
    }
  };

  return (
    <div className="container max-w-2xl py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Sentry Error Testing</h1>
        <p className="text-muted-foreground">
          Use this page to verify that Sentry is properly configured and capturing errors.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Test Error Capture
          </CardTitle>
          <CardDescription>
            Click the buttons below to trigger test errors and verify Sentry integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="destructive"
              onClick={triggerError}
              className="flex-1"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Throw Uncaught Error
            </Button>

            <Button
              variant="outline"
              onClick={triggerSentryCapture}
              className="flex-1"
            >
              <Bug className="h-4 w-4 mr-2" />
              Capture Error Manually
            </Button>
          </div>

          {errorSent && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Error captured and sent to Sentry!</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <p className="font-medium mb-2">What happens when you click:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Throw Uncaught Error:</strong> Triggers an unhandled exception that Sentry automatically captures</li>
              <li><strong>Capture Error Manually:</strong> Catches an error and sends it to Sentry using captureException()</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sentry Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organization:</span>
              <span className="font-mono">elzein</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project:</span>
              <span className="font-mono">javascript-nextjs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment:</span>
              <span className="font-mono">{process.env.NODE_ENV}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Release:</span>
              <span className="font-mono">qannoni-web@1.0.0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Check your{' '}
        <a
          href="https://elzein.sentry.io/issues/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Sentry Dashboard
        </a>
        {' '}to see captured errors.
      </p>
    </div>
  );
}
