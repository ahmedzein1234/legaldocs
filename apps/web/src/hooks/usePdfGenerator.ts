/**
 * PDF Generator Hook
 *
 * Unified hook for generating professional PDFs.
 * Uses the backend service when available, falls back to client-side pdfMake.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { generateProfessionalPdf, GCC_COUNTRIES, type ProfessionalPdfOptions } from '@/lib/pdf-professional';

// ============================================
// TYPES
// ============================================

export interface PdfGeneratorOptions {
  documentId: string;
  language?: 'en' | 'ar' | 'ur';
  format?: 'standard' | 'professional' | 'bilingual';
  includeSignatures?: boolean;
  includeWitnesses?: boolean;
  includeAuditTrail?: boolean;
  isDraft?: boolean;
}

export interface PdfPreviewOptions {
  title: string;
  titleAr?: string;
  documentType: string;
  contentEn?: string;
  contentAr?: string;
  language?: 'en' | 'ar' | 'ur';
  country?: string;
  partyA?: {
    name: string;
    idNumber: string;
    nationality?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  partyB?: {
    name: string;
    idNumber: string;
    nationality?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  isDraft?: boolean;
}

export interface UsePdfGeneratorResult {
  // State
  isGenerating: boolean;
  error: string | null;
  progress: number;

  // Methods
  generatePdf: (options: PdfGeneratorOptions) => Promise<void>;
  generatePreview: (options: PdfPreviewOptions) => Promise<void>;
  downloadFromUrl: (url: string, filename: string) => Promise<void>;

  // Service info
  isServiceAvailable: boolean;
  checkServiceHealth: () => Promise<boolean>;
}

// ============================================
// API CLIENT
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
    },
    credentials: 'include',
  });
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function usePdfGenerator(): UsePdfGeneratorResult {
  const { isAuthenticated } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);

  /**
   * Check if the backend PDF service is available
   */
  const checkServiceHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/pdf/health`);
      if (response.ok) {
        const data = await response.json();
        const available = data.data?.status === 'available';
        setIsServiceAvailable(available);
        return available;
      }
      setIsServiceAvailable(false);
      return false;
    } catch {
      setIsServiceAvailable(false);
      return false;
    }
  }, []);

  /**
   * Generate PDF for an existing document
   */
  const generatePdf = useCallback(
    async (options: PdfGeneratorOptions): Promise<void> => {
      setIsGenerating(true);
      setError(null);
      setProgress(10);

      try {
        // Try backend service first
        if (isServiceAvailable && isAuthenticated) {
          setProgress(30);

          const response = await fetchWithAuth(
            '/api/pdf/generate',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                documentId: options.documentId,
                language: options.language || 'en',
                format: options.format || 'professional',
                includeSignatures: options.includeSignatures ?? true,
                includeWitnesses: options.includeWitnesses ?? true,
                includeAuditTrail: options.includeAuditTrail ?? false,
                isDraft: options.isDraft,
              }),
            }
          );

          setProgress(70);

          if (response.ok) {
            const blob = await response.blob();
            const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'document.pdf';

            // Download the file
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setProgress(100);
            return;
          }

          // If backend fails, try fallback
          console.warn('Backend PDF generation failed, trying fallback...');
        }

        // Fallback to client-side generation
        setProgress(50);
        await generateFallbackPdf(options);
        setProgress(100);
      } catch (err) {
        console.error('PDF generation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate PDF');

        // Try fallback on error
        try {
          await generateFallbackPdf(options);
        } catch (fallbackErr) {
          setError('PDF generation failed. Please try again.');
        }
      } finally {
        setIsGenerating(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [isServiceAvailable, isAuthenticated]
  );

  /**
   * Generate preview PDF without saving
   */
  const generatePreview = useCallback(
    async (options: PdfPreviewOptions): Promise<void> => {
      setIsGenerating(true);
      setError(null);
      setProgress(10);

      try {
        // Try backend service first
        if (isServiceAvailable && isAuthenticated) {
          setProgress(30);

          const response = await fetchWithAuth(
            '/api/pdf/preview',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(options),
            }
          );

          setProgress(70);

          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Open in new tab for preview
            window.open(url, '_blank');

            setProgress(100);
            return;
          }
        }

        // Fallback to client-side preview
        setProgress(50);
        const country = GCC_COUNTRIES[options.country || 'ae'] || GCC_COUNTRIES.ae;

        await generateProfessionalPdf({
          title: options.title,
          titleAr: options.titleAr,
          documentNumber: `PREVIEW-${Date.now().toString(36).toUpperCase()}`,
          documentType: options.documentType,
          createdAt: new Date().toISOString(),
          status: 'draft',
          contentEn: options.contentEn,
          contentAr: options.contentAr,
          partyA: options.partyA,
          partyB: options.partyB,
          language: options.language || 'en',
          country,
          isDraft: options.isDraft ?? true,
          includeWitnesses: true,
        });

        setProgress(100);
      } catch (err) {
        console.error('Preview generation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate preview');
      } finally {
        setIsGenerating(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [isServiceAvailable, isAuthenticated]
  );

  /**
   * Download PDF from a URL
   */
  const downloadFromUrl = useCallback(
    async (url: string, filename: string): Promise<void> => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Download failed');

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Download failed');
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    isGenerating,
    error,
    progress,
    generatePdf,
    generatePreview,
    downloadFromUrl,
    isServiceAvailable,
    checkServiceHealth,
  };
}

// ============================================
// FALLBACK PDF GENERATION
// ============================================

async function generateFallbackPdf(options: PdfGeneratorOptions): Promise<void> {
  // Fetch document data from API
  const response = await fetchWithAuth(
    `/api/documents/${options.documentId}`,
    {}
  );

  if (!response.ok) {
    throw new Error('Failed to fetch document data');
  }

  const { data } = await response.json();
  const doc = data.document;

  // Parse content
  const contentEn = typeof doc.content_en === 'string'
    ? doc.content_en
    : extractTextContent(doc.content_en);
  const contentAr = typeof doc.content_ar === 'string'
    ? doc.content_ar
    : extractTextContent(doc.content_ar);

  const country = GCC_COUNTRIES[doc.country || 'ae'] || GCC_COUNTRIES.ae;

  await generateProfessionalPdf({
    title: doc.title,
    titleAr: doc.title_ar,
    documentNumber: doc.document_number,
    documentType: doc.document_type,
    createdAt: doc.created_at,
    status: doc.status,
    contentEn,
    contentAr,
    language: options.language || 'en',
    country,
    isDraft: options.isDraft ?? doc.status === 'draft',
    includeWitnesses: options.includeWitnesses ?? true,
    includeAuditTrail: options.includeAuditTrail ?? false,
    signers: data.signers?.map((s: any) => ({
      name: s.name,
      email: s.email,
      role: s.role?.toLowerCase() === 'witness' ? 'witness' : 'signer',
      status: s.status,
      signedAt: s.signed_at,
    })),
    owner: doc.owner_name,
  });
}

function extractTextContent(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch {
      return content;
    }
  }

  if (content.type === 'doc' && Array.isArray(content.content)) {
    return content.content
      .map((node: any) => {
        if (node.type === 'paragraph' || node.type === 'heading') {
          return node.content?.map((c: any) => c.text || '').join('') || '';
        }
        return '';
      })
      .filter(Boolean)
      .join('\n\n');
  }

  return '';
}

export default usePdfGenerator;
