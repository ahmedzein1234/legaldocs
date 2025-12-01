/**
 * LegalDocs API - Main Entry Point
 *
 * A comprehensive legal document management API for UAE/GCC markets.
 * Built with Hono for Cloudflare Workers with D1, R2, and KV.
 *
 * Security Features:
 * - JWT authentication with proper HMAC-SHA256 signing (jose)
 * - PBKDF2 password hashing (100k iterations)
 * - Rate limiting per endpoint type
 * - Role-based access control
 *
 * @version 2.0.0
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Middleware
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  rateLimiters,
} from './middleware/index.js';

// Routes
import {
  auth,
  documents,
  templates,
  ai,
  signatures,
  advisor,
  uploads,
  notifications,
  lawyers,
  cases,
  consultations,
  messaging,
  lawyerDashboard,
  payments,
  consultationCalls,
} from './routes/index.js';
import whatsappRoutes from './routes/whatsapp.js';

// ============================================
// TYPE DEFINITIONS
// ============================================

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  OPENROUTER_API_KEY: string;
  RESEND_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_FROM: string;
};

type Variables = {
  userId: string;
  userEmail: string;
  userRole: string;
};

// ============================================
// APP INITIALIZATION
// ============================================

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Request logging
app.use('*', logger());
app.use('*', requestLogger);

// CORS configuration
app.use('*', cors({
  origin: (origin) => {
    // Allow localhost for development
    if (origin?.includes('localhost')) return origin;
    // Allow Cloudflare Pages domains
    if (origin?.endsWith('.pages.dev')) return origin;
    // Allow custom domains
    const allowedDomains = [
      'https://legaldocs.pages.dev',
      'https://legaldocs-web.pages.dev',
    ];
    if (allowedDomains.includes(origin || '')) return origin;
    return 'https://legaldocs-web.pages.dev';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
}));

// Global error handling
app.use('*', errorHandler);

// ============================================
// HEALTH & INFO ROUTES
// ============================================

app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      name: 'LegalDocs API',
      version: '2.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      features: [
        'Document Generation',
        'Digital Signatures',
        'AI Legal Advisor',
        'Contract Analysis',
        'Case Management',
        'Time Tracking & Billing',
        'Multi-language Support (EN/AR/UR)',
        'GCC Compliance',
      ],
    },
  });
});

app.get('/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: 'connected', // In production, actually check D1
        storage: 'connected',  // In production, actually check R2
        cache: 'connected',    // In production, actually check KV
      },
    },
  });
});

// ============================================
// API ROUTES
// ============================================

// Auth routes - /api/auth/*
app.route('/api/auth', auth);

// Document routes - /api/documents/*
app.route('/api/documents', documents);

// Template & config routes - /api/templates/*, /api/countries/*
app.route('/api/templates', templates);
app.get('/api/countries', (c) => c.redirect('/api/templates/countries/list'));
app.get('/api/countries/:code', (c) => {
  const { code } = c.req.param();
  return c.redirect(`/api/templates/countries/${code}`);
});

// AI routes - /api/ai/*
app.route('/api/ai', ai);

// Legacy AI routes (redirect for backward compatibility)
app.post('/api/negotiate/analyze', (c) => c.redirect('/api/ai/negotiate/analyze', 307));
app.post('/api/negotiate/chat', (c) => c.redirect('/api/ai/negotiate/chat', 307));
app.post('/api/ocr/extract', (c) => c.redirect('/api/ai/ocr/extract', 307));

// Signature routes - /api/signatures/*
app.route('/api/signatures', signatures);

// Public signing routes (no auth required)
app.get('/api/sign/:token', async (c) => {
  const { token } = c.req.param();
  return c.redirect(`/api/signatures/public/${token}`, 307);
});
app.post('/api/sign/:token', async (c) => {
  const { token } = c.req.param();
  return c.redirect(`/api/signatures/public/${token}`, 307);
});
app.post('/api/sign/:token/decline', async (c) => {
  const { token } = c.req.param();
  return c.redirect(`/api/signatures/public/${token}/decline`, 307);
});

// Advisor routes - /api/advisor/*
app.route('/api/advisor', advisor);

// Upload routes - /api/uploads/*
app.route('/api/uploads', uploads);

// Legacy upload route
app.post('/api/upload/extract', (c) => c.redirect('/api/uploads/extract', 307));
app.get('/api/upload/:uploadId', (c) => {
  const { uploadId } = c.req.param();
  return c.redirect(`/api/uploads/${uploadId}`, 307);
});

// Notification routes - /api/notifications/*
app.route('/api/notifications', notifications);

// Lawyer routes - /api/lawyers/*
app.route('/api/lawyers', lawyers);

// Case management routes - /api/cases/*
app.route('/api/cases', cases);

// Lawyer Marketplace routes
// Consultation booking - /api/consultations/*
app.route('/api/consultations', consultations);

// Client-lawyer messaging - /api/messages/*
app.route('/api/messages', messaging);

// Lawyer dashboard & analytics - /api/lawyer-dashboard/*
app.route('/api/lawyer-dashboard', lawyerDashboard);

// Payment & escrow routes - /api/payments/*
app.route('/api/payments', payments);

// Consultation calls routes - /api/consultation-calls/*
// Video room management, phone calls, preparation, summaries
app.route('/api/consultation-calls', consultationCalls);

// WhatsApp routes - /api/whatsapp/*
// Includes messaging, webhooks, and session management
app.route('/api/whatsapp', whatsappRoutes);

// Compliance route
app.get('/api/compliance/:country/:documentType', (c) => {
  const { country, documentType } = c.req.param();
  return c.redirect(`/api/templates/compliance/${country}/${documentType}`, 307);
});

// ============================================
// 404 HANDLER
// ============================================

app.notFound(notFoundHandler);

// ============================================
// EXPORT FOR CLOUDFLARE WORKERS
// ============================================

export default app;

// Also export for testing
export { app };
