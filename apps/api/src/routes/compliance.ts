/**
 * Compliance Routes
 *
 * Provides transparency about data residency and compliance with:
 * - UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021)
 * - EU General Data Protection Regulation (GDPR)
 * - GCC Data Protection Framework
 *
 * @module routes/compliance
 */

import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
};

const compliance = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/compliance/data-residency
 * Information about where user data is stored
 */
compliance.get('/data-residency', async (c) => {
  return c.json({
    success: true,
    data: {
      overview: {
        provider: 'Cloudflare, Inc.',
        providerAddress: '101 Townsend Street, San Francisco, CA 94107, USA',
        dataProcessingAgreement: 'https://www.cloudflare.com/cloudflare-customer-dpa/',
        gdprCompliance: 'https://www.cloudflare.com/trust-hub/gdpr/',
      },
      dataStorage: {
        database: {
          service: 'Cloudflare D1',
          type: 'Distributed SQLite',
          description: 'Primary database for user accounts, documents, cases, and application data',
          replication: 'Global edge replication with primary storage in nearest Cloudflare data center',
          encryption: {
            atRest: true,
            inTransit: true,
            algorithm: 'AES-256',
          },
        },
        fileStorage: {
          service: 'Cloudflare R2',
          type: 'Object Storage',
          description: 'Storage for uploaded documents, signatures, and attachments',
          replication: 'Global distribution with automatic geo-routing',
          encryption: {
            atRest: true,
            inTransit: true,
            algorithm: 'AES-256',
          },
        },
        cache: {
          service: 'Cloudflare KV',
          type: 'Key-Value Store',
          description: 'Session data, rate limiting, and temporary cache',
          retention: 'Configurable TTL, typically 24 hours or less',
          encryption: {
            atRest: true,
            inTransit: true,
          },
        },
      },
      uaeCompliance: {
        law: 'UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021)',
        status: 'Compliant',
        measures: [
          'Data encryption at rest and in transit',
          'User consent obtained before data collection',
          'Right to access, rectify, and delete personal data',
          'Data breach notification procedures in place',
          'Data minimization principles applied',
          'Purpose limitation for data processing',
        ],
        dataTransfer: {
          mechanism: 'Cloudflare operates under Standard Contractual Clauses (SCCs)',
          adequacyDecision: 'UAE has not issued adequacy decisions; SCCs provide lawful transfer basis',
          cloudflarePresence: {
            middleEast: [
              'Dubai, UAE',
              'Abu Dhabi, UAE (planned)',
              'Riyadh, Saudi Arabia',
              'Doha, Qatar',
              'Manama, Bahrain',
              'Kuwait City, Kuwait',
              'Muscat, Oman',
            ],
            note: 'Cloudflare routes traffic to the nearest data center for optimal performance',
          },
        },
      },
      gdprCompliance: {
        regulation: 'EU General Data Protection Regulation (2016/679)',
        status: 'Compliant',
        dataController: {
          name: 'Qannoni',
          email: 'privacy@qannoni.com',
          address: 'Dubai, United Arab Emirates',
        },
        dataProcessor: {
          name: 'Cloudflare, Inc.',
          dpaUrl: 'https://www.cloudflare.com/cloudflare-customer-dpa/',
        },
        legalBasis: [
          'Consent (Article 6(1)(a)) - for optional features',
          'Contract performance (Article 6(1)(b)) - for service delivery',
          'Legal obligation (Article 6(1)(c)) - for compliance requirements',
          'Legitimate interest (Article 6(1)(f)) - for security and fraud prevention',
        ],
        dataSubjectRights: {
          access: 'GET /api/gdpr/export',
          portability: 'GET /api/gdpr/export/download',
          erasure: 'DELETE /api/gdpr/account',
          rectification: 'PATCH /api/auth/profile',
          information: 'GET /api/gdpr/rights',
        },
      },
      gccCompliance: {
        frameworks: [
          'Saudi Arabia Personal Data Protection Law (PDPL)',
          'Qatar Data Privacy Protection Law',
          'Bahrain Personal Data Protection Law',
          'Kuwait Data Protection Regulations',
        ],
        status: 'Compatible',
        notes: 'Platform is designed to meet the highest data protection standards across all GCC jurisdictions',
      },
      securityMeasures: {
        authentication: {
          method: 'JWT with HMAC-SHA256 signing',
          storage: 'httpOnly secure cookies',
          sessionDuration: '24 hours (access token), 7 days (refresh token)',
        },
        passwords: {
          hashing: 'PBKDF2',
          iterations: 100000,
          saltLength: '16 bytes',
        },
        transport: {
          protocol: 'TLS 1.3',
          hsts: 'Enabled with 2-year max-age',
          certificateProvider: 'Cloudflare Universal SSL',
        },
        headers: {
          csp: 'Strict Content Security Policy',
          xFrameOptions: 'DENY',
          xContentTypeOptions: 'nosniff',
          referrerPolicy: 'strict-origin-when-cross-origin',
        },
      },
      dataRetention: {
        activeAccounts: 'Data retained while account is active',
        inactiveAccounts: 'Accounts may be flagged after 2 years of inactivity',
        deletedAccounts: 'All data permanently deleted within 30 days of deletion request',
        activityLogs: '90 days',
        securityLogs: '90 days',
        signedDocuments: 'Retained for legal validity period (varies by document type)',
      },
      thirdPartyServices: [
        {
          name: 'OpenRouter',
          purpose: 'AI-powered document generation and legal assistance',
          dataShared: 'Document prompts (no personal identifiers)',
          privacyPolicy: 'https://openrouter.ai/privacy',
        },
        {
          name: 'Resend',
          purpose: 'Transactional email delivery',
          dataShared: 'Email addresses for notifications',
          privacyPolicy: 'https://resend.com/privacy',
        },
        {
          name: 'Twilio',
          purpose: 'WhatsApp and SMS notifications',
          dataShared: 'Phone numbers for messaging',
          privacyPolicy: 'https://www.twilio.com/legal/privacy',
        },
        {
          name: 'Sentry',
          purpose: 'Error monitoring and performance tracking',
          dataShared: 'Error logs (anonymized)',
          privacyPolicy: 'https://sentry.io/privacy/',
          dataCenter: 'EU (de.sentry.io)',
        },
      ],
      contactInformation: {
        dataProtectionOfficer: {
          email: 'dpo@qannoni.com',
          responseTime: 'Within 30 days as per GDPR requirements',
        },
        privacyInquiries: 'privacy@qannoni.com',
        securityIncidents: 'security@qannoni.com',
      },
      lastUpdated: '2025-12-02',
      version: '1.0',
    },
  });
});

/**
 * GET /api/compliance/certifications
 * List of compliance certifications and attestations
 */
compliance.get('/certifications', async (c) => {
  return c.json({
    success: true,
    data: {
      platformCertifications: [
        {
          name: 'SOC 2 Type II',
          status: 'Planned',
          provider: 'Via Cloudflare infrastructure',
          description: 'Service Organization Control 2 compliance',
        },
        {
          name: 'ISO 27001',
          status: 'Planned',
          provider: 'Via Cloudflare infrastructure',
          description: 'Information Security Management System',
        },
      ],
      infrastructureCertifications: {
        provider: 'Cloudflare',
        certifications: [
          'ISO 27001:2013',
          'ISO 27701:2019',
          'SOC 2 Type II',
          'PCI DSS Level 1',
          'HIPAA',
          'FedRAMP Moderate',
          'C5 (Germany)',
        ],
        source: 'https://www.cloudflare.com/trust-hub/compliance-resources/',
      },
      selfAssessments: [
        {
          name: 'GDPR Compliance Self-Assessment',
          status: 'Completed',
          date: '2025-12-01',
        },
        {
          name: 'UAE PDPL Compliance Review',
          status: 'Completed',
          date: '2025-12-01',
        },
        {
          name: 'Security Hardening Audit',
          status: 'In Progress',
          date: '2025-12-02',
        },
      ],
    },
  });
});

export { compliance };
