import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, rateLimiters } from '../middleware/index.js';
import { Errors } from '../lib/errors.js';
import {
  createStorageService,
  StorageService,
  SUPPORTED_MIME_TYPES,
  formatFileSize,
} from '../lib/storage.js';

// Types for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  OPENROUTER_API_KEY: string;
};

type Variables = {
  userId: string;
  userRole: string;
};

const uploads = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth middleware to all routes
uploads.use('*', authMiddleware);

// ============================================
// CONSTANTS
// ============================================

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB (increased from 10MB)

// ============================================
// VALIDATION SCHEMAS
// ============================================

const uploadSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  fileData: z.string(), // Base64 encoded file
  purpose: z.enum(['reference', 'template', 'analysis']),
  language: z.enum(['en', 'ar', 'auto']).default('auto'),
  extractClauses: z.boolean().default(true),
  extractParties: z.boolean().default(true),
  extractFinancials: z.boolean().default(true),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildExtractionPrompt(purpose: string, language: string): string {
  const languageInstruction = language === 'auto'
    ? 'Detect the language automatically'
    : `Primary language: ${language}`;

  return `You are a legal document analyzer specializing in UAE/GCC legal documents.

Extract structured information from the uploaded document.

Purpose: ${purpose}
${languageInstruction}

Extract and return as JSON:
{
  "documentType": "Contract type or document category",
  "title": "Document title",
  "language": "Detected language(s)",
  "parties": [
    {
      "name": "Party name",
      "nameAr": "Arabic name if present",
      "role": "Their role (buyer, seller, landlord, etc.)",
      "type": "individual|company",
      "identifiers": {
        "emiratesId": "If present",
        "tradeLicense": "If present",
        "passportNumber": "If present"
      },
      "address": "Address if present",
      "contact": "Contact info if present"
    }
  ],
  "keyDates": {
    "effectiveDate": "When document takes effect",
    "expiryDate": "When it expires",
    "signingDate": "When signed",
    "otherDates": [{"label": "Description", "date": "Date"}]
  },
  "financialTerms": {
    "totalValue": "Total contract value",
    "currency": "Currency",
    "paymentSchedule": [{"amount": "X", "dueDate": "Y", "description": "Z"}],
    "penalties": "Any penalty clauses",
    "deposits": "Security deposits"
  },
  "keyClauses": [
    {
      "type": "termination|payment|confidentiality|liability|etc.",
      "summary": "Brief summary",
      "fullText": "Full clause text",
      "riskLevel": "low|medium|high"
    }
  ],
  "obligations": {
    "party1": ["List of obligations"],
    "party2": ["List of obligations"]
  },
  "specialConditions": ["Any unusual or special conditions"],
  "signatures": {
    "signed": true|false,
    "signers": [{"name": "Name", "date": "Date signed"}]
  },
  "metadata": {
    "pageCount": "Number of pages",
    "hasAttachments": true|false,
    "quality": "good|fair|poor"
  }
}`;
}

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/uploads/extract
 * Upload and extract document content
 */
uploads.post('/extract', rateLimiters.aiGeneration, zValidator('json', uploadSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const apiKey = c.env.OPENROUTER_API_KEY;
  const cache = c.env.CACHE;

  if (!apiKey) {
    return c.json(Errors.internal('AI service not configured').toJSON(), 500);
  }

  // Create storage service instance
  const storageService = createStorageService(c.env.STORAGE, {
    maxFileSize: MAX_FILE_SIZE,
  });

  const uploadId = crypto.randomUUID();

  try {
    // Upload file using storage service (includes validation)
    const uploadResult = await storageService.uploadFromBase64(body.fileData, {
      uploadId,
      userId,
      fileName: body.fileName,
      mimeType: body.mimeType,
      purpose: body.purpose,
    });

    const fileBuffer = Uint8Array.from(atob(body.fileData), c => c.charCodeAt(0));

    const extractionPrompt = buildExtractionPrompt(body.purpose, body.language);

    // Build message based on file type
    const messages: Array<{role: string; content: any}> = [
      { role: 'system', content: extractionPrompt },
    ];

    if (body.mimeType.startsWith('image/')) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: body.mimeType,
              data: body.fileData,
            },
          },
          {
            type: 'text',
            text: 'Please analyze this document image and extract all information as specified.',
          },
        ],
      });
    } else if (body.mimeType === 'application/pdf') {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'file',
            source: {
              type: 'base64',
              media_type: body.mimeType,
              data: body.fileData,
            },
          },
          {
            type: 'text',
            text: 'Please analyze this PDF document and extract all information as specified.',
          },
        ],
      });
    } else if (body.mimeType === 'text/plain' || body.mimeType === 'text/rtf') {
      const textContent = new TextDecoder().decode(fileBuffer);
      messages.push({
        role: 'user',
        content: `Please analyze this document and extract all information as specified.\n\nDocument content:\n${textContent}`,
      });
    } else {
      // For Word docs, send as text note
      messages.push({
        role: 'user',
        content: `Please analyze this ${body.mimeType} document and extract all information as specified.\n\n[Document: ${body.fileName}]`,
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.qannoni.com',
        'X-Title': 'LegalDocs Document Extraction',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        max_tokens: 8000,
        messages,
      }),
    });

    const result = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      error?: { message: string };
    };

    if (result.error) {
      console.error('OpenRouter extraction error:', result.error);
      return c.json({
        success: false,
        error: {
          code: 'EXTRACTION_FAILED',
          message: 'Document extraction failed: ' + result.error.message,
        },
        data: { uploadId, status: 'error' },
      }, 500);
    }

    const extractedContent = result.choices[0].message.content;

    // Parse extraction result
    let extraction;
    try {
      const jsonMatch = extractedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extraction = JSON.parse(jsonMatch[0]);
      } else {
        extraction = { rawText: extractedContent, parseError: true };
      }
    } catch {
      extraction = { rawText: extractedContent, parseError: true };
    }

    // Store extraction result in KV cache
    await cache.put(`extraction:${uploadId}`, JSON.stringify({
      uploadId,
      userId,
      fileName: uploadResult.fileName,
      mimeType: uploadResult.mimeType,
      fileSize: uploadResult.fileSize,
      fileHash: uploadResult.fileHash,
      storagePath: uploadResult.storagePath,
      purpose: body.purpose,
      extraction,
      createdAt: new Date().toISOString(),
    }), { expirationTtl: 60 * 60 * 24 * 7 }); // 7 days TTL

    return c.json({
      success: true,
      data: {
        uploadId,
        status: 'completed',
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        fileHash: uploadResult.fileHash,
        fileSizeFormatted: formatFileSize(uploadResult.fileSize),
        extraction,
      },
    });
  } catch (error) {
    console.error('Upload/extraction error:', error);

    // Delete uploaded file if extraction fails
    try {
      const storageService = createStorageService(c.env.STORAGE);
      const storagePath = storageService.generateStoragePath(userId, body.fileName, { uploadId });
      await storageService.deleteDocument(storagePath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return c.json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to process document',
      },
      data: { uploadId, status: 'error' },
    }, 500);
  }
});

/**
 * GET /api/uploads/:uploadId
 * Get extraction result
 */
uploads.get('/:uploadId', async (c) => {
  const userId = c.get('userId');
  const { uploadId } = c.req.param();
  const cache = c.env.CACHE;

  const cached = await cache.get(`extraction:${uploadId}`);
  if (!cached) {
    return c.json(Errors.notFound('Upload').toJSON(), 404);
  }

  const result = JSON.parse(cached);
  if (result.userId !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  return c.json({ success: true, data: result });
});

/**
 * GET /api/uploads
 * List user's uploads
 */
uploads.get('/', async (c) => {
  // Note: KV doesn't support listing efficiently
  // In production, store metadata in D1
  return c.json({
    success: true,
    data: {
      uploads: [],
      message: 'Upload listing requires database storage',
    },
  });
});

/**
 * DELETE /api/uploads/:uploadId
 * Delete an upload
 */
uploads.delete('/:uploadId', async (c) => {
  const userId = c.get('userId');
  const { uploadId } = c.req.param();
  const cache = c.env.CACHE;

  const cached = await cache.get(`extraction:${uploadId}`);
  if (!cached) {
    return c.json(Errors.notFound('Upload').toJSON(), 404);
  }

  const result = JSON.parse(cached);
  if (result.userId !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Create storage service
  const storageService = createStorageService(c.env.STORAGE);

  // Delete from R2
  const deleted = await storageService.deleteDocument(result.storagePath);

  if (!deleted) {
    console.error('Failed to delete file from storage:', result.storagePath);
  }

  // Delete from cache
  await cache.delete(`extraction:${uploadId}`);

  return c.json({
    success: true,
    data: {
      message: 'Upload deleted successfully',
      fileDeleted: deleted,
    },
  });
});

// ============================================
// NEW FILE MANAGEMENT ROUTES
// ============================================

/**
 * POST /api/uploads/direct
 * Direct file upload without extraction (for general file storage)
 */
uploads.post('/direct', rateLimiters.upload, zValidator('json', z.object({
  fileName: z.string(),
  mimeType: z.string(),
  fileData: z.string(), // Base64 encoded
  documentId: z.string().optional(),
  category: z.enum(['uploads', 'documents', 'templates', 'signatures']).default('uploads'),
})), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  const storageService = createStorageService(c.env.STORAGE, {
    maxFileSize: MAX_FILE_SIZE,
  });

  const uploadId = crypto.randomUUID();

  try {
    const uploadResult = await storageService.uploadFromBase64(body.fileData, {
      uploadId,
      userId,
      fileName: body.fileName,
      mimeType: body.mimeType,
      documentId: body.documentId,
    });

    // Store metadata in cache for quick access
    await c.env.CACHE.put(
      `file:${uploadId}`,
      JSON.stringify({
        ...uploadResult,
        userId,
        category: body.category,
        uploadedAt: new Date().toISOString(),
      }),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
    );

    return c.json({
      success: true,
      data: {
        uploadId,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        fileSizeFormatted: formatFileSize(uploadResult.fileSize),
        fileHash: uploadResult.fileHash,
        mimeType: uploadResult.mimeType,
        storagePath: uploadResult.storagePath,
      },
    });
  } catch (error) {
    console.error('Direct upload error:', error);
    return c.json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: error instanceof Error ? error.message : 'Failed to upload file',
      },
    }, 500);
  }
});

/**
 * GET /api/uploads/file/:uploadId
 * Download a file by upload ID
 */
uploads.get('/file/:uploadId', async (c) => {
  const userId = c.get('userId');
  const { uploadId } = c.req.param();
  const cache = c.env.CACHE;

  // Check cache first
  const cached = await cache.get(`file:${uploadId}`);
  if (!cached) {
    return c.json(Errors.notFound('File').toJSON(), 404);
  }

  const fileInfo = JSON.parse(cached);
  if (fileInfo.userId !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  // Get file from storage
  const storageService = createStorageService(c.env.STORAGE);
  const fileData = await storageService.downloadDocument(fileInfo.storagePath);

  if (!fileData) {
    return c.json(Errors.notFound('File').toJSON(), 404);
  }

  // Return file
  return c.body(fileData, 200, {
    'Content-Type': fileInfo.mimeType,
    'Content-Disposition': `attachment; filename="${fileInfo.fileName}"`,
    'Content-Length': fileInfo.fileSize.toString(),
  });
});

/**
 * GET /api/uploads/stats
 * Get storage statistics for the current user
 */
uploads.get('/stats', async (c) => {
  const userId = c.get('userId');
  const storageService = createStorageService(c.env.STORAGE);

  try {
    const stats = await storageService.getUserStorageStats(userId);

    return c.json({
      success: true,
      data: {
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        totalSizeFormatted: formatFileSize(stats.totalSize),
        filesByType: stats.filesByType,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return c.json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve storage statistics',
      },
    }, 500);
  }
});

/**
 * GET /api/uploads/list
 * List user's uploaded files
 */
uploads.get('/list', async (c) => {
  const userId = c.get('userId');
  const category = c.req.query('category') as 'uploads' | 'documents' | undefined;
  const limit = parseInt(c.req.query('limit') || '50');
  const cursor = c.req.query('cursor');

  const storageService = createStorageService(c.env.STORAGE);

  try {
    const result = await storageService.listUserFiles(userId, {
      category,
      limit,
      cursor,
    });

    const files = result.files.map(file => ({
      key: file.key,
      fileName: file.metadata.fileName || file.key.split('/').pop(),
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      mimeType: file.metadata.mimeType,
      uploadedAt: file.metadata.uploadedAt || file.uploaded.toISOString(),
      uploadId: file.metadata.uploadId,
      fileHash: file.metadata.fileHash,
    }));

    return c.json({
      success: true,
      data: {
        files,
        hasMore: result.truncated,
        cursor: result.cursor,
      },
    });
  } catch (error) {
    console.error('List files error:', error);
    return c.json({
      success: false,
      error: {
        code: 'LIST_ERROR',
        message: 'Failed to list files',
      },
    }, 500);
  }
});

/**
 * POST /api/uploads/batch-delete
 * Delete multiple files at once
 */
uploads.post('/batch-delete', zValidator('json', z.object({
  uploadIds: z.array(z.string()).min(1).max(100),
})), async (c) => {
  const userId = c.get('userId');
  const { uploadIds } = c.req.valid('json');
  const cache = c.env.CACHE;
  const storageService = createStorageService(c.env.STORAGE);

  const results = {
    deleted: [] as string[],
    failed: [] as string[],
    notFound: [] as string[],
  };

  for (const uploadId of uploadIds) {
    try {
      const cached = await cache.get(`file:${uploadId}`);

      if (!cached) {
        results.notFound.push(uploadId);
        continue;
      }

      const fileInfo = JSON.parse(cached);

      if (fileInfo.userId !== userId) {
        results.failed.push(uploadId);
        continue;
      }

      const deleted = await storageService.deleteDocument(fileInfo.storagePath);

      if (deleted) {
        await cache.delete(`file:${uploadId}`);
        results.deleted.push(uploadId);
      } else {
        results.failed.push(uploadId);
      }
    } catch (error) {
      console.error(`Error deleting ${uploadId}:`, error);
      results.failed.push(uploadId);
    }
  }

  return c.json({
    success: true,
    data: {
      deleted: results.deleted.length,
      failed: results.failed.length,
      notFound: results.notFound.length,
      details: results,
    },
  });
});

/**
 * GET /api/uploads/metadata/:uploadId
 * Get file metadata without downloading
 */
uploads.get('/metadata/:uploadId', async (c) => {
  const userId = c.get('userId');
  const { uploadId } = c.req.param();
  const cache = c.env.CACHE;

  const cached = await cache.get(`file:${uploadId}`);
  if (!cached) {
    return c.json(Errors.notFound('File').toJSON(), 404);
  }

  const fileInfo = JSON.parse(cached);
  if (fileInfo.userId !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  return c.json({
    success: true,
    data: {
      uploadId,
      fileName: fileInfo.fileName,
      mimeType: fileInfo.mimeType,
      fileSize: fileInfo.fileSize,
      fileSizeFormatted: formatFileSize(fileInfo.fileSize),
      fileHash: fileInfo.fileHash,
      storagePath: fileInfo.storagePath,
      uploadedAt: fileInfo.uploadedAt,
    },
  });
});

export { uploads };
