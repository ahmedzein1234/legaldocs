/**
 * PDF Generation Routes
 *
 * API endpoints for generating professional PDF documents.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Errors } from '../lib/errors.js';
import { authMiddleware } from '../middleware/index.js';
import {
  generatePDF,
  generatePDFFromHTML,
  generateLegalDocumentHTML,
  GCC_COUNTRIES,
  type PDFGenerationOptions,
  type DocumentMetadata,
  type PartyInfo,
  type SignerInfo,
} from '../services/pdf/index.js';

// ============================================
// TYPES
// ============================================

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  BROWSER?: any;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
};

type Variables = {
  userId: string;
  userRole: string;
};

const pdf = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const generatePDFSchema = z.object({
  documentId: z.string().uuid(),
  language: z.enum(['en', 'ar', 'ur']).default('en'),
  format: z.enum(['standard', 'professional', 'bilingual']).default('professional'),
  includeSignatures: z.boolean().default(true),
  includeWitnesses: z.boolean().default(true),
  includeAuditTrail: z.boolean().default(false),
  isDraft: z.boolean().optional(),
});

const generateFromHTMLSchema = z.object({
  html: z.string().min(1, 'HTML content is required'),
  filename: z.string().default('document.pdf'),
});

const previewSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional(),
  documentType: z.string().default('general_contract'),
  contentEn: z.string().optional(),
  contentAr: z.string().optional(),
  language: z.enum(['en', 'ar', 'ur']).default('en'),
  country: z.string().default('ae'),
  partyA: z.object({
    name: z.string(),
    idNumber: z.string(),
    nationality: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  partyB: z.object({
    name: z.string(),
    idNumber: z.string(),
    nationality: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  isDraft: z.boolean().default(true),
});

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

/**
 * GET /api/pdf/health
 * Health check for PDF service
 */
pdf.get('/health', async (c) => {
  const hasBrowser = !!c.env.BROWSER;
  const hasRestAPI = !!(c.env.CF_ACCOUNT_ID && c.env.CF_API_TOKEN);

  return c.json({
    success: true,
    data: {
      status: hasBrowser || hasRestAPI ? 'available' : 'unavailable',
      methods: {
        browserRendering: hasBrowser,
        restAPI: hasRestAPI,
      },
      supportedFormats: ['A4', 'LETTER', 'LEGAL'],
      supportedLanguages: ['en', 'ar', 'ur'],
    },
  });
});

// ============================================
// AUTHENTICATED ROUTES
// ============================================

pdf.use('/*', authMiddleware);

/**
 * POST /api/pdf/generate
 * Generate PDF for a document
 */
pdf.post('/generate', zValidator('json', generatePDFSchema), async (c) => {
  const body = c.req.valid('json');
  const userId = c.get('userId');
  const db = c.env.DB;

  // Fetch document
  const document = await db
    .prepare(`
      SELECT d.*, u.name as owner_name, u.email as owner_email
      FROM documents d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.id = ?
    `)
    .bind(body.documentId)
    .first<any>();

  if (!document) {
    return c.json(Errors.notFound('Document').toJSON(), 404);
  }

  // Check access
  if (document.created_by !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Fetch signers
  const signers = await db
    .prepare('SELECT * FROM document_signers WHERE document_id = ? ORDER BY "order"')
    .bind(body.documentId)
    .all<any>();

  // Fetch audit trail if requested
  let auditTrail: any[] = [];
  if (body.includeAuditTrail) {
    const activities = await db
      .prepare('SELECT * FROM document_activities WHERE document_id = ? ORDER BY created_at DESC')
      .bind(body.documentId)
      .all<any>();
    auditTrail = activities.results?.map((a: any) => ({
      timestamp: a.created_at,
      event: a.action,
      actor: a.user_id,
      details: a.details,
      ipAddress: a.ip_address,
    })) || [];
  }

  // Parse content from JSON
  const contentEn = document.content_en ? parseContent(document.content_en) : '';
  const contentAr = document.content_ar ? parseContent(document.content_ar) : '';

  // Get country config
  const countryCode = document.country || 'ae';
  const country = GCC_COUNTRIES[countryCode] || GCC_COUNTRIES.ae;

  // Build PDF options
  const pdfOptions: PDFGenerationOptions = {
    documentId: body.documentId,
    metadata: {
      documentNumber: document.document_number,
      documentType: document.document_type,
      title: document.title,
      titleAr: document.title_ar,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
      status: body.isDraft !== undefined ? (body.isDraft ? 'draft' : document.status) : document.status,
      owner: document.owner_name || 'Unknown',
      ownerEmail: document.owner_email,
    },
    contentEn,
    contentAr,
    signers: signers.results?.map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role?.toLowerCase() === 'witness' ? 'witness' : 'signer',
      status: s.status,
      signedAt: s.signed_at,
      signatureImage: s.signature_data,
    })) || [],
    auditTrail,
    language: body.language,
    country,
    isDraft: body.isDraft ?? document.status === 'draft',
    includeSignatures: body.includeSignatures,
    includeWitnesses: body.includeWitnesses,
    includeAuditTrail: body.includeAuditTrail,
  };

  // Generate PDF
  const result = await generatePDF(c.env, pdfOptions);

  if (!result.success) {
    return c.json(Errors.internal(`PDF generation failed: ${result.error}`).toJSON(), 500);
  }

  // Log activity
  await db
    .prepare(`
      INSERT INTO document_activities (id, document_id, user_id, action, details, created_at)
      VALUES (?, ?, ?, 'pdf_generated', ?, datetime('now'))
    `)
    .bind(
      crypto.randomUUID(),
      body.documentId,
      userId,
      JSON.stringify({ language: body.language, format: body.format })
    )
    .run();

  // Return PDF
  return new Response(result.pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': String(result.size || 0),
      'X-PDF-Generated-At': result.generatedAt,
    },
  });
});

/**
 * POST /api/pdf/preview
 * Generate a preview PDF without saving
 */
pdf.post('/preview', zValidator('json', previewSchema), async (c) => {
  const body = c.req.valid('json');
  const userId = c.get('userId');

  const countryCode = body.country || 'ae';
  const country = GCC_COUNTRIES[countryCode] || GCC_COUNTRIES.ae;

  const pdfOptions: PDFGenerationOptions = {
    documentId: 'preview',
    metadata: {
      documentNumber: `PREVIEW-${Date.now().toString(36).toUpperCase()}`,
      documentType: body.documentType,
      title: body.title,
      titleAr: body.titleAr,
      createdAt: new Date().toISOString(),
      status: 'draft',
      owner: 'Preview',
    },
    contentEn: body.contentEn,
    contentAr: body.contentAr,
    partyA: body.partyA as PartyInfo,
    partyB: body.partyB as PartyInfo,
    language: body.language,
    country,
    isDraft: body.isDraft,
    includeSignatures: true,
    includeWitnesses: true,
    includeWatermark: true,
  };

  const result = await generatePDF(c.env, pdfOptions);

  if (!result.success) {
    return c.json(Errors.internal(`PDF generation failed: ${result.error}`).toJSON(), 500);
  }

  return new Response(result.pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${result.filename}"`,
      'Content-Length': String(result.size || 0),
    },
  });
});

/**
 * POST /api/pdf/from-html
 * Generate PDF from raw HTML (for custom templates)
 */
pdf.post('/from-html', zValidator('json', generateFromHTMLSchema), async (c) => {
  const body = c.req.valid('json');

  const result = await generatePDFFromHTML(c.env, body.html, body.filename);

  if (!result.success) {
    return c.json(Errors.internal(`PDF generation failed: ${result.error}`).toJSON(), 500);
  }

  return new Response(result.pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': String(result.size || 0),
    },
  });
});

/**
 * GET /api/pdf/templates
 * List available PDF templates
 */
pdf.get('/templates', async (c) => {
  const templates = [
    {
      id: 'employment_contract',
      name: 'Employment Contract',
      nameAr: 'عقد عمل',
      description: 'Standard employment agreement template',
    },
    {
      id: 'rental_agreement',
      name: 'Rental Agreement',
      nameAr: 'عقد إيجار',
      description: 'Residential or commercial rental contract',
    },
    {
      id: 'sale_agreement',
      name: 'Sale Agreement',
      nameAr: 'عقد بيع',
      description: 'Asset or property sale contract',
    },
    {
      id: 'service_agreement',
      name: 'Service Agreement',
      nameAr: 'عقد خدمات',
      description: 'Professional services contract',
    },
    {
      id: 'nda',
      name: 'Non-Disclosure Agreement',
      nameAr: 'اتفاقية عدم إفشاء',
      description: 'Confidentiality and non-disclosure agreement',
    },
    {
      id: 'power_of_attorney',
      name: 'Power of Attorney',
      nameAr: 'توكيل رسمي',
      description: 'Legal authorization document',
    },
    {
      id: 'mou',
      name: 'Memorandum of Understanding',
      nameAr: 'مذكرة تفاهم',
      description: 'Preliminary agreement between parties',
    },
    {
      id: 'general_contract',
      name: 'General Contract',
      nameAr: 'عقد عام',
      description: 'Customizable general-purpose contract',
    },
  ];

  return c.json({
    success: true,
    data: { templates },
  });
});

/**
 * GET /api/pdf/countries
 * List supported GCC countries with their configurations
 */
pdf.get('/countries', async (c) => {
  return c.json({
    success: true,
    data: { countries: Object.values(GCC_COUNTRIES) },
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseContent(content: string | object): string {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return extractTextFromProseMirror(parsed);
    } catch {
      return content;
    }
  }

  return extractTextFromProseMirror(content);
}

function extractTextFromProseMirror(doc: any): string {
  if (!doc || typeof doc !== 'object') return '';

  if (doc.type === 'text') {
    return doc.text || '';
  }

  if (doc.type === 'doc' || doc.type === 'paragraph' || doc.type === 'heading') {
    if (Array.isArray(doc.content)) {
      const text = doc.content.map((node: any) => extractTextFromProseMirror(node)).join('');
      return doc.type === 'paragraph' || doc.type === 'heading' ? text + '\n\n' : text;
    }
  }

  if (Array.isArray(doc.content)) {
    return doc.content.map((node: any) => extractTextFromProseMirror(node)).join('');
  }

  return '';
}

export { pdf };
