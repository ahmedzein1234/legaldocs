/**
 * Security Utilities for LegalDocs API
 *
 * Comprehensive security helpers for handling sensitive legal data:
 * - Input sanitization and validation
 * - XSS prevention
 * - SQL injection prevention
 * - File upload validation
 * - Data encryption utilities
 * - PII detection and handling
 *
 * @module lib/security-utils
 */

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize string input to prevent XSS attacks
 * Removes dangerous HTML tags and JavaScript
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:text\/html/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object and embed tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize HTML input - more permissive, allows safe HTML tags
 * Use for rich text content where some HTML is expected
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';

  // Allow only safe tags
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const tagPattern = new RegExp(`<(?!\/?(${allowedTags.join('|')})\\b)[^>]+>`, 'gi');

  return input
    .replace(tagPattern, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
}

/**
 * Recursively sanitize an object's string values
 */
export function sanitizeInput(input: any): any {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }

  if (typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Also sanitize keys to prevent prototype pollution
      const safeKey = sanitizeString(key);
      if (safeKey !== '__proto__' && safeKey !== 'constructor' && safeKey !== 'prototype') {
        sanitized[safeKey] = sanitizeInput(value);
      }
    }
    return sanitized;
  }

  return input;
}

// ============================================
// SQL INJECTION PREVENTION
// ============================================

/**
 * Escape SQL string literals
 * Note: Always use parameterized queries! This is a backup defense layer.
 */
export function escapeSQLString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/\0/g, '\\0')   // Escape null bytes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\x1a/g, '\\Z'); // Escape EOF
}

/**
 * Validate and sanitize SQL LIKE pattern
 * Prevents LIKE injection attacks
 */
export function sanitizeLikePattern(pattern: string): string {
  if (typeof pattern !== 'string') return '';

  return pattern
    .replace(/[%_\[\]]/g, match => `\\${match}`)  // Escape LIKE wildcards
    .slice(0, 100);  // Limit length
}

/**
 * Validate SQL identifier (table/column name)
 * Prevents SQL injection through dynamic identifiers
 */
export function validateSQLIdentifier(identifier: string): boolean {
  if (typeof identifier !== 'string') return false;

  // Only allow alphanumeric characters and underscores
  // Must start with a letter
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(identifier) && identifier.length <= 64;
}

/**
 * Validate ORDER BY clause
 * Prevents SQL injection through sorting parameters
 */
export function validateOrderBy(
  column: string,
  direction: string = 'ASC',
  allowedColumns: string[]
): { column: string; direction: 'ASC' | 'DESC' } | null {
  // Validate column is in allowed list
  if (!allowedColumns.includes(column)) {
    return null;
  }

  // Validate column name format
  if (!validateSQLIdentifier(column)) {
    return null;
  }

  // Validate direction
  const dir = direction.toUpperCase();
  if (dir !== 'ASC' && dir !== 'DESC') {
    return null;
  }

  return { column, direction: dir as 'ASC' | 'DESC' };
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string') return false;

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate UUID format (v4)
 */
export function isValidUUID(uuid: string): boolean {
  if (typeof uuid !== 'string') return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  if (typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate phone number (international format)
 */
export function validatePhoneNumber(phone: string): boolean {
  if (typeof phone !== 'string') return false;

  // Allow + followed by 7-15 digits (international format)
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
}

/**
 * Validate UAE Emirates ID format
 */
export function validateEmiratesID(emiratesId: string): boolean {
  if (typeof emiratesId !== 'string') return false;

  // Format: 784-YYYY-NNNNNNN-N (15 digits total)
  const cleanId = emiratesId.replace(/[\s\-]/g, '');
  return /^784\d{12}$/.test(cleanId);
}

/**
 * Validate date string (ISO 8601 format)
 */
export function isValidISODate(dateStr: string): boolean {
  if (typeof dateStr !== 'string') return false;

  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate integer within range
 */
export function isValidInteger(value: any, min?: number, max?: number): boolean {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (!Number.isInteger(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;

  return true;
}

// ============================================
// FILE UPLOAD VALIDATION
// ============================================

/**
 * Allowed MIME types for file uploads
 */
export const SAFE_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/rtf',
  ],
  archives: [
    'application/zip',
    'application/x-zip-compressed',
  ],
};

/**
 * Get all allowed MIME types
 */
export function getAllowedMimeTypes(): string[] {
  return [
    ...SAFE_MIME_TYPES.images,
    ...SAFE_MIME_TYPES.documents,
    ...SAFE_MIME_TYPES.archives,
  ];
}

/**
 * Validate file MIME type
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return getAllowedMimeTypes().includes(mimeType.toLowerCase());
}

/**
 * Validate file extension
 */
export function isAllowedFileExtension(filename: string): boolean {
  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.rtf',
    '.zip',
  ];

  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return allowedExtensions.includes(ext);
}

/**
 * Validate file size
 */
export function isValidFileSize(sizeBytes: number, maxSizeMB: number = 100): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return sizeBytes > 0 && sizeBytes <= maxBytes;
}

/**
 * Comprehensive file upload validation
 */
export function validateFileUpload(file: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  maxSizeMB?: number;
}): { valid: boolean; error?: string } {
  // Check file name
  if (!file.fileName || file.fileName.length > 255) {
    return { valid: false, error: 'Invalid file name' };
  }

  // Check for path traversal in filename
  if (file.fileName.includes('..') || file.fileName.includes('/') || file.fileName.includes('\\')) {
    return { valid: false, error: 'Invalid file name characters' };
  }

  // Check extension
  if (!isAllowedFileExtension(file.fileName)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check MIME type
  if (!isAllowedMimeType(file.mimeType)) {
    return { valid: false, error: 'File MIME type not allowed' };
  }

  // Check size
  if (!isValidFileSize(file.sizeBytes, file.maxSizeMB)) {
    const maxMB = file.maxSizeMB || 100;
    return { valid: false, error: `File size exceeds ${maxMB}MB limit` };
  }

  return { valid: true };
}

/**
 * Generate safe filename (sanitize user input)
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed';

  return filename
    // Remove path separators
    .replace(/[/\\]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Replace unsafe characters with underscore
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Remove leading/trailing dots and spaces
    .replace(/^[.\s]+|[.\s]+$/g, '')
    // Limit length
    .slice(0, 255)
    || 'unnamed';
}

// ============================================
// PII (PERSONALLY IDENTIFIABLE INFORMATION) DETECTION
// ============================================

/**
 * Detect if text contains Emirates ID
 */
export function containsEmiratesID(text: string): boolean {
  if (typeof text !== 'string') return false;
  return /784[\s\-]?\d{4}[\s\-]?\d{7}[\s\-]?\d/.test(text);
}

/**
 * Detect if text contains credit card number
 */
export function containsCreditCard(text: string): boolean {
  if (typeof text !== 'string') return false;

  // Basic Luhn algorithm check for credit card patterns
  const cleanText = text.replace(/[\s\-]/g, '');
  const cardPattern = /\b\d{13,19}\b/g;
  const matches = cleanText.match(cardPattern);

  if (!matches) return false;

  return matches.some(match => luhnCheck(match));
}

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Detect potential email addresses
 */
export function containsEmail(text: string): boolean {
  if (typeof text !== 'string') return false;
  return /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
}

/**
 * Mask Emirates ID in text for logging/display
 */
export function maskEmiratesID(text: string): string {
  if (typeof text !== 'string') return text;

  return text.replace(
    /784[\s\-]?\d{4}[\s\-]?\d{7}[\s\-]?\d/g,
    '784-****-*******-*'
  );
}

/**
 * Mask email addresses in text
 */
export function maskEmail(email: string): string {
  if (typeof email !== 'string') return email;

  const [local, domain] = email.split('@');
  if (!local || !domain) return email;

  const maskedLocal = local.length > 2
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : '*'.repeat(local.length);

  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number
 */
export function maskPhoneNumber(phone: string): string {
  if (typeof phone !== 'string') return phone;

  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.length < 4) return '*'.repeat(cleaned.length);

  return cleaned.slice(0, 3) + '*'.repeat(cleaned.length - 6) + cleaned.slice(-3);
}

// ============================================
// DATA ENCRYPTION UTILITIES
// ============================================

/**
 * Hash sensitive data (one-way, for comparison purposes)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Constant-time string comparison (prevents timing attacks)
 */
export function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// ============================================
// RATE LIMITING HELPERS
// ============================================

/**
 * Generate rate limit key for specific user action
 */
export function getRateLimitKey(
  type: 'auth' | 'api' | 'upload' | 'ai' | 'sensitive',
  identifier: string
): string {
  return `ratelimit:${type}:${identifier}`;
}

/**
 * Check if IP is from Cloudflare (for DDOS protection validation)
 */
export function isCloudflareIP(ip: string): boolean {
  // Cloudflare IP ranges (simplified - in production, maintain full list)
  const cloudflareRanges = [
    '173.245.48.0/20',
    '103.21.244.0/22',
    '103.22.200.0/22',
    '103.31.4.0/22',
    '141.101.64.0/18',
    '108.162.192.0/18',
    '190.93.240.0/20',
    '188.114.96.0/20',
    '197.234.240.0/22',
    '198.41.128.0/17',
  ];

  // In production, implement proper CIDR matching
  return true; // Placeholder
}

// ============================================
// EXPORTS
// ============================================

export const SecurityUtils = {
  // Sanitization
  sanitizeString,
  sanitizeHTML,
  sanitizeInput,
  sanitizeFilename,

  // SQL Protection
  escapeSQLString,
  sanitizeLikePattern,
  validateSQLIdentifier,
  validateOrderBy,

  // Validation
  validateEmail,
  isValidUUID,
  isValidURL,
  validatePhoneNumber,
  validateEmiratesID,
  isValidISODate,
  isValidInteger,

  // File Upload
  isAllowedMimeType,
  isAllowedFileExtension,
  isValidFileSize,
  validateFileUpload,
  getAllowedMimeTypes,

  // PII Detection & Masking
  containsEmiratesID,
  containsCreditCard,
  containsEmail,
  maskEmiratesID,
  maskEmail,
  maskPhoneNumber,

  // Encryption
  hashData,
  generateSecureToken,
  secureCompare,

  // Rate Limiting
  getRateLimitKey,
  isCloudflareIP,
};
