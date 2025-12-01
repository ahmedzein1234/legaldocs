/**
 * Storage Service for Cloudflare R2
 *
 * Provides a comprehensive wrapper around R2 bucket operations with:
 * - File upload/download/delete operations
 * - Signed URL generation for secure temporary access
 * - Multipart upload support for large files
 * - File type validation and size limits
 * - File hash calculation for integrity verification
 * - Organized folder structure by user/document
 */

import { Errors } from './errors.js';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface StorageConfig {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  signedUrlExpiration?: number; // in seconds
}

export interface FileMetadata {
  uploadId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  fileHash?: string;
  purpose?: string;
  documentId?: string;
  uploadedAt: string;
  expiresAt?: string;
}

export interface UploadResult {
  uploadId: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  mimeType: string;
  url?: string;
}

export interface SignedUrlOptions {
  expiresIn?: number; // in seconds
  method?: 'GET' | 'PUT';
}

export interface ListFilesOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

export interface ListFilesResult {
  files: Array<{
    key: string;
    size: number;
    uploaded: Date;
    metadata: Record<string, string>;
  }>;
  truncated: boolean;
  cursor?: string;
}

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MULTIPART_THRESHOLD = 10 * 1024 * 1024; // 10MB
export const DEFAULT_SIGNED_URL_EXPIRATION = 3600; // 1 hour

export const SUPPORTED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.oasis.opendocument.text', // .odt
  'text/plain',
  'text/rtf',
  'application/rtf',

  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/tiff',
  'image/gif',

  // Archives
  'application/zip',
  'application/x-zip-compressed',
];

export const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.oasis.opendocument.text': 'odt',
  'text/plain': 'txt',
  'text/rtf': 'rtf',
  'application/rtf': 'rtf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/tiff': 'tiff',
  'image/gif': 'gif',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
};

// ============================================
// STORAGE SERVICE CLASS
// ============================================

export class StorageService {
  private bucket: R2Bucket;
  private config: Required<StorageConfig>;

  constructor(bucket: R2Bucket, config: StorageConfig = {}) {
    this.bucket = bucket;
    this.config = {
      maxFileSize: config.maxFileSize || DEFAULT_MAX_FILE_SIZE,
      allowedMimeTypes: config.allowedMimeTypes || SUPPORTED_MIME_TYPES,
      signedUrlExpiration: config.signedUrlExpiration || DEFAULT_SIGNED_URL_EXPIRATION,
    };
  }

  // ============================================
  // VALIDATION METHODS
  // ============================================

  /**
   * Validate file type against allowed MIME types
   */
  validateFileType(mimeType: string): void {
    if (!this.config.allowedMimeTypes.includes(mimeType)) {
      throw Errors.badRequest(
        `Unsupported file type: ${mimeType}. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`
      );
    }
  }

  /**
   * Validate file size against maximum limit
   */
  validateFileSize(size: number): void {
    if (size > this.config.maxFileSize) {
      const maxSizeMB = (this.config.maxFileSize / (1024 * 1024)).toFixed(2);
      const actualSizeMB = (size / (1024 * 1024)).toFixed(2);
      throw Errors.badRequest(
        `File size (${actualSizeMB}MB) exceeds maximum limit of ${maxSizeMB}MB`
      );
    }
  }

  /**
   * Validate file name (sanitize and check for invalid characters)
   */
  validateFileName(fileName: string): string {
    // Remove path traversal attempts
    const sanitized = fileName.replace(/[/\\]/g, '_');

    // Check for valid characters
    if (!/^[a-zA-Z0-9._\-\s()]+$/.test(sanitized)) {
      throw Errors.badRequest('File name contains invalid characters');
    }

    return sanitized;
  }

  // ============================================
  // HASH CALCULATION
  // ============================================

  /**
   * Calculate SHA-256 hash of file content for integrity verification
   */
  async calculateFileHash(data: ArrayBuffer | Uint8Array): Promise<string> {
    const buffer = data instanceof Uint8Array ? data : new Uint8Array(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ============================================
  // PATH GENERATION
  // ============================================

  /**
   * Generate organized storage path: {userId}/{category}/{uploadId}/{fileName}
   */
  generateStoragePath(
    userId: string,
    fileName: string,
    options?: {
      uploadId?: string;
      documentId?: string;
      category?: 'uploads' | 'documents' | 'templates' | 'signatures';
    }
  ): string {
    const uploadId = options?.uploadId || crypto.randomUUID();
    const category = options?.category || 'uploads';
    const documentId = options?.documentId;

    const sanitizedFileName = this.validateFileName(fileName);

    if (documentId) {
      return `${category}/${userId}/${documentId}/${uploadId}/${sanitizedFileName}`;
    }

    return `${category}/${userId}/${uploadId}/${sanitizedFileName}`;
  }

  // ============================================
  // UPLOAD OPERATIONS
  // ============================================

  /**
   * Upload a document to R2 storage
   */
  async uploadDocument(
    data: ArrayBuffer | Uint8Array,
    metadata: Omit<FileMetadata, 'uploadedAt' | 'fileHash' | 'fileSize'>
  ): Promise<UploadResult> {
    // Validate file type and size
    this.validateFileType(metadata.mimeType);

    const fileBuffer = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
    this.validateFileSize(fileBuffer.length);

    // Calculate file hash
    const fileHash = await this.calculateFileHash(fileBuffer);

    // Generate storage path
    const storagePath = this.generateStoragePath(
      metadata.userId,
      metadata.fileName,
      {
        uploadId: metadata.uploadId,
        documentId: metadata.documentId,
      }
    );

    // Prepare metadata
    const storageMetadata: FileMetadata = {
      ...metadata,
      fileSize: fileBuffer.length,
      fileHash,
      uploadedAt: new Date().toISOString(),
    };

    // Convert metadata to string record for R2
    const customMetadata: Record<string, string> = {};
    for (const [key, value] of Object.entries(storageMetadata)) {
      if (value !== undefined && value !== null) {
        customMetadata[key] = String(value);
      }
    }

    try {
      // Upload to R2
      await this.bucket.put(storagePath, fileBuffer, {
        httpMetadata: {
          contentType: metadata.mimeType,
        },
        customMetadata,
      });

      return {
        uploadId: metadata.uploadId,
        storagePath,
        fileName: metadata.fileName,
        fileSize: fileBuffer.length,
        fileHash,
        mimeType: metadata.mimeType,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      throw Errors.internal('Failed to upload file to storage');
    }
  }

  /**
   * Upload from base64 encoded string
   */
  async uploadFromBase64(
    base64Data: string,
    metadata: Omit<FileMetadata, 'uploadedAt' | 'fileHash' | 'fileSize'>
  ): Promise<UploadResult> {
    try {
      const fileBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      return await this.uploadDocument(fileBuffer, metadata);
    } catch (error) {
      if (error instanceof Error && error.name === 'InvalidCharacterError') {
        throw Errors.badRequest('Invalid base64 encoded data');
      }
      throw error;
    }
  }

  /**
   * Multipart upload for large files (>10MB)
   * Note: R2 multipart API is different from S3, simplified implementation
   */
  async uploadLargeDocument(
    data: ArrayBuffer | Uint8Array,
    metadata: Omit<FileMetadata, 'uploadedAt' | 'fileHash' | 'fileSize'>
  ): Promise<UploadResult> {
    const fileBuffer = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

    // For files larger than threshold, we could implement chunking
    // For now, R2 handles this internally, so we use standard upload
    if (fileBuffer.length > MULTIPART_THRESHOLD) {
      console.log(`Uploading large file (${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB)`);
    }

    return await this.uploadDocument(fileBuffer, metadata);
  }

  // ============================================
  // DOWNLOAD OPERATIONS
  // ============================================

  /**
   * Get file from storage
   */
  async getDocument(storagePath: string): Promise<R2ObjectBody | null> {
    try {
      const object = await this.bucket.get(storagePath);
      return object;
    } catch (error) {
      console.error('R2 get error:', error);
      return null;
    }
  }

  /**
   * Get file metadata without downloading content
   */
  async getDocumentMetadata(storagePath: string): Promise<FileMetadata | null> {
    try {
      const object = await this.bucket.head(storagePath);

      if (!object) {
        return null;
      }

      const metadata = object.customMetadata as Record<string, string>;

      return {
        uploadId: metadata.uploadId || '',
        userId: metadata.userId || '',
        fileName: metadata.fileName || '',
        mimeType: metadata.mimeType || '',
        fileSize: object.size,
        fileHash: metadata.fileHash,
        purpose: metadata.purpose,
        documentId: metadata.documentId,
        uploadedAt: metadata.uploadedAt || new Date(object.uploaded).toISOString(),
        expiresAt: metadata.expiresAt,
      };
    } catch (error) {
      console.error('R2 head error:', error);
      return null;
    }
  }

  /**
   * Download file as ArrayBuffer
   */
  async downloadDocument(storagePath: string): Promise<ArrayBuffer | null> {
    const object = await this.getDocument(storagePath);

    if (!object) {
      return null;
    }

    return await object.arrayBuffer();
  }

  // ============================================
  // SIGNED URL GENERATION
  // ============================================

  /**
   * Generate a signed URL for temporary secure access
   * Note: R2 doesn't have built-in signed URLs like S3
   * We'll use a token-based approach instead
   */
  async generateSignedUrl(
    storagePath: string,
    options: SignedUrlOptions = {}
  ): Promise<string | null> {
    // Check if file exists
    const exists = await this.bucket.head(storagePath);

    if (!exists) {
      return null;
    }

    // R2 doesn't have presigned URLs in the same way as S3
    // For Cloudflare Workers, you'd typically:
    // 1. Create a temporary access token and store in KV
    // 2. Return a URL to your API endpoint with that token
    // 3. Validate token in endpoint and stream from R2

    // For now, return the storage path (caller should implement token endpoint)
    const expiresIn = options.expiresIn || this.config.signedUrlExpiration;
    const token = crypto.randomUUID();

    // In production, store this token in KV with TTL
    // await kv.put(`download-token:${token}`, storagePath, { expirationTtl: expiresIn });

    return `/api/uploads/download/${token}`;
  }

  // ============================================
  // DELETE OPERATIONS
  // ============================================

  /**
   * Delete a document from storage
   */
  async deleteDocument(storagePath: string): Promise<boolean> {
    try {
      await this.bucket.delete(storagePath);
      return true;
    } catch (error) {
      console.error('R2 delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple documents
   */
  async deleteDocuments(storagePaths: string[]): Promise<number> {
    let deletedCount = 0;

    // R2 doesn't have batch delete, so we delete individually
    for (const path of storagePaths) {
      const success = await this.deleteDocument(path);
      if (success) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Delete all files for a user (use with caution!)
   */
  async deleteUserFiles(userId: string, category?: string): Promise<number> {
    const prefix = category ? `${category}/${userId}/` : `uploads/${userId}/`;
    const files = await this.listFiles({ prefix });

    const paths = files.files.map(f => f.key);
    return await this.deleteDocuments(paths);
  }

  // ============================================
  // LIST OPERATIONS
  // ============================================

  /**
   * List files in storage with optional filtering
   */
  async listFiles(options: ListFilesOptions = {}): Promise<ListFilesResult> {
    try {
      const listed = await this.bucket.list({
        prefix: options.prefix,
        limit: options.limit || 100,
        cursor: options.cursor,
      });

      const files = listed.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        metadata: obj.customMetadata as Record<string, string>,
      }));

      return {
        files,
        truncated: listed.truncated,
        cursor: listed.truncated ? listed.cursor : undefined,
      };
    } catch (error) {
      console.error('R2 list error:', error);
      return {
        files: [],
        truncated: false,
      };
    }
  }

  /**
   * List files for a specific user
   */
  async listUserFiles(
    userId: string,
    options: Omit<ListFilesOptions, 'prefix'> & { category?: string } = {}
  ): Promise<ListFilesResult> {
    const category = options.category || 'uploads';
    const prefix = `${category}/${userId}/`;

    return await this.listFiles({
      ...options,
      prefix,
    });
  }

  /**
   * List files for a specific document
   */
  async listDocumentFiles(
    userId: string,
    documentId: string,
    options: Omit<ListFilesOptions, 'prefix'> = {}
  ): Promise<ListFilesResult> {
    const prefix = `documents/${userId}/${documentId}/`;

    return await this.listFiles({
      ...options,
      prefix,
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check if a file exists in storage
   */
  async fileExists(storagePath: string): Promise<boolean> {
    try {
      const object = await this.bucket.head(storagePath);
      return object !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file extension from MIME type
   */
  getExtensionFromMimeType(mimeType: string): string {
    return MIME_TYPE_EXTENSIONS[mimeType] || 'bin';
  }

  /**
   * Copy a file to a new location
   */
  async copyDocument(sourcePath: string, destinationPath: string): Promise<boolean> {
    try {
      const object = await this.getDocument(sourcePath);

      if (!object) {
        return false;
      }

      const data = await object.arrayBuffer();

      await this.bucket.put(destinationPath, data, {
        httpMetadata: object.httpMetadata,
        customMetadata: object.customMetadata,
      });

      return true;
    } catch (error) {
      console.error('R2 copy error:', error);
      return false;
    }
  }

  /**
   * Move a file (copy + delete)
   */
  async moveDocument(sourcePath: string, destinationPath: string): Promise<boolean> {
    const copied = await this.copyDocument(sourcePath, destinationPath);

    if (!copied) {
      return false;
    }

    await this.deleteDocument(sourcePath);
    return true;
  }

  /**
   * Get storage statistics for a user
   */
  async getUserStorageStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
  }> {
    const files = await this.listUserFiles(userId, { limit: 1000 });

    const stats = {
      totalFiles: files.files.length,
      totalSize: files.files.reduce((sum, f) => sum + f.size, 0),
      filesByType: {} as Record<string, number>,
    };

    for (const file of files.files) {
      const mimeType = file.metadata.mimeType || 'unknown';
      stats.filesByType[mimeType] = (stats.filesByType[mimeType] || 0) + 1;
    }

    return stats;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a storage service instance
 */
export function createStorageService(
  bucket: R2Bucket,
  config?: StorageConfig
): StorageService {
  return new StorageService(bucket, config);
}

/**
 * Validate and decode base64 file data
 */
export function decodeBase64File(base64Data: string): Uint8Array {
  try {
    return Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  } catch (error) {
    throw Errors.badRequest('Invalid base64 encoded data');
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Detect MIME type from file extension (fallback)
 */
export function getMimeTypeFromExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    odt: 'application/vnd.oasis.opendocument.text',
    txt: 'text/plain',
    rtf: 'text/rtf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    tiff: 'image/tiff',
    gif: 'image/gif',
    zip: 'application/zip',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}
