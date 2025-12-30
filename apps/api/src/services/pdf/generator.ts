/**
 * PDF Generator Service
 *
 * Generates professional PDFs using Cloudflare Browser Rendering.
 * Falls back to REST API if Puppeteer binding is not available.
 */

import type { PDFGenerationOptions, PDFGenerationResult, BrowserRenderingOptions } from './types.js';
import { generateLegalDocumentHTML, generateBilingualDocumentHTML } from './templates/index.js';

// ============================================
// TYPES
// ============================================

interface Env {
  BROWSER?: any; // Cloudflare Browser Rendering binding
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
  STORAGE?: R2Bucket;
}

// ============================================
// DEFAULT OPTIONS
// ============================================

const DEFAULT_RENDER_OPTIONS: BrowserRenderingOptions = {
  width: 794, // A4 width in pixels at 96 DPI
  height: 1123, // A4 height in pixels at 96 DPI
  scale: 1,
  printBackground: true,
  preferCSSPageSize: true,
  margin: {
    top: '0mm',
    right: '0mm',
    bottom: '0mm',
    left: '0mm',
  },
  displayHeaderFooter: false,
};

// ============================================
// MAIN PDF GENERATOR CLASS
// ============================================

export class PDFGenerator {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Generate a PDF from document options
   */
  async generate(options: PDFGenerationOptions): Promise<PDFGenerationResult> {
    try {
      // Generate HTML from template
      const html = this.generateHTML(options);

      // Try Puppeteer first, then fall back to REST API
      let pdfBuffer: ArrayBuffer;

      if (this.env.BROWSER) {
        pdfBuffer = await this.generateWithPuppeteer(html, options);
      } else if (this.env.CF_ACCOUNT_ID && this.env.CF_API_TOKEN) {
        pdfBuffer = await this.generateWithRestAPI(html, options);
      } else {
        throw new Error('No PDF generation method available. Configure BROWSER binding or CF_API_TOKEN.');
      }

      // Generate filename
      const filename = this.generateFilename(options);

      // Optionally store in R2
      let pdfUrl: string | undefined;
      if (this.env.STORAGE) {
        pdfUrl = await this.storeInR2(pdfBuffer, filename, options);
      }

      return {
        success: true,
        pdfBuffer,
        pdfUrl,
        filename,
        size: pdfBuffer.byteLength,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        filename: '',
        generatedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate HTML from options
   */
  private generateHTML(options: PDFGenerationOptions): string {
    // If both English and Arabic content exist, generate bilingual
    if (options.contentEn && options.contentAr && options.language === 'en') {
      // Check if user wants bilingual output
      const isBilingual = options.contentEn && options.contentAr;
      if (isBilingual) {
        return generateBilingualDocumentHTML(options);
      }
    }

    return generateLegalDocumentHTML(options);
  }

  /**
   * Generate PDF using Puppeteer (Cloudflare Browser Rendering)
   */
  private async generateWithPuppeteer(html: string, options: PDFGenerationOptions): Promise<ArrayBuffer> {
    // Dynamic import for Puppeteer
    const puppeteer = await import('@cloudflare/puppeteer');

    const browser = await puppeteer.default.launch(this.env.BROWSER);

    try {
      const page = await browser.newPage();

      // Set viewport
      await page.setViewport({
        width: DEFAULT_RENDER_OPTIONS.width,
        height: DEFAULT_RENDER_OPTIONS.height,
      });

      // Set content and wait for fonts to load
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Wait for fonts to be ready
      await page.evaluate(() => {
        return document.fonts.ready;
      });

      // Generate PDF
      const pdf = await page.pdf({
        format: options.paperSize || 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
        displayHeaderFooter: options.includeHeader || options.includeFooter || false,
        headerTemplate: options.includeHeader ? this.getHeaderTemplate(options) : undefined,
        footerTemplate: options.includeFooter ? this.getFooterTemplate(options) : undefined,
      });

      return pdf.buffer;
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate PDF using Cloudflare Browser Rendering REST API
   */
  private async generateWithRestAPI(html: string, options: PDFGenerationOptions): Promise<ArrayBuffer> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.env.CF_ACCOUNT_ID}/browser-rendering/pdf`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          pdfOptions: {
            printBackground: true,
            format: options.paperSize || 'A4',
            margin: {
              top: '0mm',
              right: '0mm',
              bottom: '0mm',
              left: '0mm',
            },
          },
          gotoOptions: {
            waitUntil: 'networkidle0',
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Browser Rendering API error: ${error}`);
    }

    return response.arrayBuffer();
  }

  /**
   * Store PDF in R2 bucket
   */
  private async storeInR2(
    pdfBuffer: ArrayBuffer,
    filename: string,
    options: PDFGenerationOptions
  ): Promise<string> {
    const key = `pdfs/${options.metadata.documentNumber}/${filename}`;

    await this.env.STORAGE!.put(key, pdfBuffer, {
      httpMetadata: {
        contentType: 'application/pdf',
        contentDisposition: `attachment; filename="${filename}"`,
      },
      customMetadata: {
        documentId: options.documentId,
        documentNumber: options.metadata.documentNumber,
        language: options.language,
        generatedAt: new Date().toISOString(),
      },
    });

    // Return a signed URL or public URL based on your setup
    return key;
  }

  /**
   * Generate filename for the PDF
   */
  private generateFilename(options: PDFGenerationOptions): string {
    const { metadata, language } = options;
    const sanitizedTitle = metadata.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    return `${metadata.documentNumber}-${sanitizedTitle}-${language}.pdf`;
  }

  /**
   * Get header template HTML
   */
  private getHeaderTemplate(options: PDFGenerationOptions): string {
    const isRTL = options.language === 'ar' || options.language === 'ur';

    return `
      <div style="width: 100%; font-size: 8px; padding: 0 20mm; display: flex; justify-content: space-between; color: #94a3b8;">
        <span>${options.metadata.documentNumber}</span>
        <span>Qannoni</span>
      </div>
    `;
  }

  /**
   * Get footer template HTML
   */
  private getFooterTemplate(options: PDFGenerationOptions): string {
    return `
      <div style="width: 100%; font-size: 8px; padding: 0 20mm; display: flex; justify-content: space-between; color: #94a3b8;">
        <span>Generated by Qannoni</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `;
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createPDFGenerator(env: Env): PDFGenerator {
  return new PDFGenerator(env);
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick function to generate a PDF from options
 */
export async function generatePDF(
  env: Env,
  options: PDFGenerationOptions
): Promise<PDFGenerationResult> {
  const generator = new PDFGenerator(env);
  return generator.generate(options);
}

/**
 * Generate PDF directly from HTML string
 */
export async function generatePDFFromHTML(
  env: Env,
  html: string,
  filename: string = 'document.pdf'
): Promise<PDFGenerationResult> {
  try {
    let pdfBuffer: ArrayBuffer;

    if (env.BROWSER) {
      const puppeteer = await import('@cloudflare/puppeteer');
      const browser = await puppeteer.default.launch(env.BROWSER);

      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.fonts.ready);
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
        });
        pdfBuffer = pdf.buffer;
      } finally {
        await browser.close();
      }
    } else if (env.CF_ACCOUNT_ID && env.CF_API_TOKEN) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/browser-rendering/pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ html }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${await response.text()}`);
      }

      pdfBuffer = await response.arrayBuffer();
    } else {
      throw new Error('No PDF generation method available');
    }

    return {
      success: true,
      pdfBuffer,
      filename,
      size: pdfBuffer.byteLength,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      filename,
      generatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
