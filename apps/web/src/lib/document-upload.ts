/**
 * Document Upload System for LegalDocs
 * Handles file uploads, text extraction, and smart content analysis
 */

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    name: 'PDF Document',
    icon: 'file-text',
  },
  word: {
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ],
    extensions: ['.docx', '.doc'],
    name: 'Word Document',
    icon: 'file-text',
  },
  image: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/tiff'],
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.tiff'],
    name: 'Image (OCR)',
    icon: 'image',
  },
  text: {
    mimeTypes: ['text/plain', 'text/rtf'],
    extensions: ['.txt', '.rtf'],
    name: 'Text File',
    icon: 'file',
  },
} as const;

export type FileCategory = keyof typeof SUPPORTED_FILE_TYPES;

// All supported MIME types
export const ALL_MIME_TYPES: string[] = Object.values(SUPPORTED_FILE_TYPES).flatMap(t => [...t.mimeTypes]);
export const ALL_EXTENSIONS: string[] = Object.values(SUPPORTED_FILE_TYPES).flatMap(t => [...t.extensions]);

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Upload status
export type UploadStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'extracting'
  | 'analyzing'
  | 'completed'
  | 'error';

// Extracted party information
export interface ExtractedParty {
  name?: string;
  nameAr?: string;
  type: 'individual' | 'company' | 'unknown';
  role?: string; // landlord, tenant, employer, employee, etc.
  idNumber?: string;
  nationality?: string;
  address?: string;
  phone?: string;
  email?: string;
  registrationNumber?: string; // for companies
  confidence: number; // 0-1 confidence score
}

// Extracted financial terms
export interface ExtractedFinancials {
  currency?: string;
  amounts: {
    value: number;
    description: string;
    type: 'rent' | 'deposit' | 'salary' | 'fee' | 'penalty' | 'total' | 'other';
    frequency?: 'one-time' | 'monthly' | 'annual' | 'weekly';
    confidence: number;
  }[];
  paymentTerms?: string;
}

// Extracted dates
export interface ExtractedDates {
  effectiveDate?: string;
  startDate?: string;
  endDate?: string;
  signatureDate?: string;
  noticePeriod?: string;
  renewalDate?: string;
  customDates: {
    label: string;
    date: string;
    confidence: number;
  }[];
}

// Extracted clause
export interface ExtractedClause {
  id: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  type:
    | 'preamble'
    | 'recital'
    | 'definition'
    | 'obligation'
    | 'right'
    | 'termination'
    | 'confidentiality'
    | 'indemnity'
    | 'liability'
    | 'dispute'
    | 'governing_law'
    | 'signature'
    | 'witness'
    | 'schedule'
    | 'other';
  importance: 'critical' | 'standard' | 'optional';
  confidence: number;
}

// Extracted property details (for real estate docs)
export interface ExtractedProperty {
  type?: string; // apartment, villa, office, etc.
  address?: string;
  size?: string;
  unit?: string;
  building?: string;
  area?: string;
  emirate?: string;
  ejariNumber?: string;
  titleDeedNumber?: string;
}

// Full extraction result
export interface DocumentExtraction {
  id: string;
  fileName: string;
  fileType: FileCategory;
  fileSize: number;
  uploadedAt: Date;

  // Document classification
  documentType: string;
  documentTypeConfidence: number;
  language: 'en' | 'ar' | 'mixed' | 'unknown';
  jurisdiction?: string;

  // Raw extracted text
  rawText: string;
  pageCount?: number;

  // Smart extractions
  parties: ExtractedParty[];
  financials: ExtractedFinancials;
  dates: ExtractedDates;
  clauses: ExtractedClause[];
  property?: ExtractedProperty;

  // Summary
  summary: string;
  summaryAr?: string;

  // Key terms for quick reference
  keyTerms: {
    term: string;
    value: string;
    confidence: number;
  }[];

  // Warnings and notes
  warnings: string[];
  notes: string[];

  // Processing metadata
  processingTime: number;
  extractionModel: string;
  status: UploadStatus;
  error?: string;
}

// Upload request
export interface UploadRequest {
  file: File;
  purpose: 'reference' | 'template' | 'analysis';
  language?: 'en' | 'ar' | 'auto';
  extractClauses?: boolean;
  extractParties?: boolean;
  extractFinancials?: boolean;
}

// Upload response
export interface UploadResponse {
  uploadId: string;
  status: UploadStatus;
  extraction?: DocumentExtraction;
  error?: string;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check MIME type
  if (!ALL_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported: PDF, Word, Images, Text`,
    };
  }

  // Check extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALL_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension: ${ext}`,
    };
  }

  return { valid: true };
}

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): FileCategory | null {
  for (const [category, config] of Object.entries(SUPPORTED_FILE_TYPES)) {
    if ((config.mimeTypes as readonly string[]).includes(mimeType)) {
      return category as FileCategory;
    }
  }
  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Generate unique upload ID
 */
export function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert File to base64 for API transmission
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Create extraction prompt for AI
 */
export function createExtractionPrompt(
  purpose: UploadRequest['purpose'],
  language: 'en' | 'ar' | 'auto'
): string {
  const basePrompt = `You are a legal document analysis expert specializing in GCC (Gulf Cooperation Council) legal documents. Analyze the provided document and extract structured information.

IMPORTANT EXTRACTION RULES:
1. Extract ALL parties mentioned (individuals and companies)
2. Identify ALL financial terms with exact amounts and currencies
3. Extract ALL dates with context (effective, start, end, etc.)
4. Identify key clauses and categorize them
5. Detect the document type and jurisdiction
6. Note any warnings or unusual terms
7. Provide confidence scores (0-1) for extracted data

RESPONSE FORMAT (JSON):
{
  "documentType": "rental_agreement|employment_contract|nda|service_agreement|power_of_attorney|mou|sales_contract|other",
  "documentTypeConfidence": 0.95,
  "language": "en|ar|mixed",
  "jurisdiction": "Dubai, UAE",

  "parties": [
    {
      "name": "John Smith",
      "nameAr": "جون سميث",
      "type": "individual|company",
      "role": "landlord|tenant|employer|employee|party_a|party_b",
      "idNumber": "784-XXXX-XXXXXXX-X",
      "nationality": "UAE",
      "address": "...",
      "confidence": 0.9
    }
  ],

  "financials": {
    "currency": "AED",
    "amounts": [
      {"value": 50000, "description": "Annual Rent", "type": "rent", "frequency": "annual", "confidence": 0.95}
    ],
    "paymentTerms": "..."
  },

  "dates": {
    "effectiveDate": "2024-01-01",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "noticePeriod": "30 days",
    "customDates": []
  },

  "clauses": [
    {
      "id": "clause_1",
      "title": "Term of Agreement",
      "content": "...",
      "type": "obligation|right|termination|...",
      "importance": "critical|standard|optional",
      "confidence": 0.85
    }
  ],

  "property": {
    "type": "apartment",
    "address": "...",
    "size": "1500 sq ft",
    "ejariNumber": "..."
  },

  "summary": "Brief summary of the document...",
  "summaryAr": "ملخص موجز...",

  "keyTerms": [
    {"term": "Rent Amount", "value": "AED 50,000/year", "confidence": 0.95}
  ],

  "warnings": ["Missing witness signatures", "Unusual penalty clause"],
  "notes": ["Document appears to be a draft"]
}`;

  if (purpose === 'template') {
    return basePrompt + `

ADDITIONAL TEMPLATE EXTRACTION:
- Identify all variable/placeholder fields that should be filled in
- Mark sections that are boilerplate vs customizable
- Suggest variable names for each placeholder (e.g., {{party_a_name}}, {{rent_amount}})
- Include template variables in the response as:
  "templateVariables": [
    {"name": "party_a_name", "currentValue": "John Smith", "type": "text"}
  ]`;
  }

  return basePrompt;
}

/**
 * Parse AI extraction response
 */
export function parseExtractionResponse(
  response: string,
  uploadId: string,
  fileName: string,
  fileType: FileCategory,
  fileSize: number
): DocumentExtraction {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      id: uploadId,
      fileName,
      fileType,
      fileSize,
      uploadedAt: new Date(),

      documentType: data.documentType || 'unknown',
      documentTypeConfidence: data.documentTypeConfidence || 0,
      language: data.language || 'unknown',
      jurisdiction: data.jurisdiction,

      rawText: data.rawText || '',
      pageCount: data.pageCount,

      parties: data.parties || [],
      financials: data.financials || { amounts: [] },
      dates: data.dates || { customDates: [] },
      clauses: data.clauses || [],
      property: data.property,

      summary: data.summary || '',
      summaryAr: data.summaryAr,

      keyTerms: data.keyTerms || [],
      warnings: data.warnings || [],
      notes: data.notes || [],

      processingTime: 0,
      extractionModel: 'claude-sonnet-4',
      status: 'completed',
    };
  } catch (error) {
    return {
      id: uploadId,
      fileName,
      fileType,
      fileSize,
      uploadedAt: new Date(),

      documentType: 'unknown',
      documentTypeConfidence: 0,
      language: 'unknown',

      rawText: response,

      parties: [],
      financials: { amounts: [] },
      dates: { customDates: [] },
      clauses: [],

      summary: 'Failed to parse document extraction',
      keyTerms: [],
      warnings: ['Extraction parsing failed'],
      notes: [],

      processingTime: 0,
      extractionModel: 'claude-sonnet-4',
      status: 'error',
      error: 'Failed to parse AI response',
    };
  }
}

export default {
  SUPPORTED_FILE_TYPES,
  ALL_MIME_TYPES,
  ALL_EXTENSIONS,
  MAX_FILE_SIZE,
  validateFile,
  getFileCategory,
  formatFileSize,
  generateUploadId,
  fileToBase64,
  createExtractionPrompt,
  parseExtractionResponse,
};
