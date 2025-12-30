/**
 * PDF Services Index
 *
 * Export all PDF generation services and types.
 */

// Types
export * from './types.js';

// Generator
export {
  PDFGenerator,
  createPDFGenerator,
  generatePDF,
  generatePDFFromHTML,
} from './generator.js';

// Templates
export {
  generateLegalDocumentHTML,
  generateBilingualDocumentHTML,
  getBaseStyles,
  formatDate,
  escapeHtml,
} from './templates/index.js';
