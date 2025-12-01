# Storage Service Documentation

## Overview

The Storage Service provides a comprehensive wrapper around Cloudflare R2 bucket operations for the LegalDocs API. It handles file uploads, downloads, deletions, and management with proper validation, security, and organization.

## Features

- **File Upload/Download/Delete**: Complete CRUD operations for file management
- **Signed URLs**: Secure temporary access to files (token-based approach)
- **Large File Support**: Handles files up to 100MB with efficient processing
- **File Validation**: MIME type and size validation
- **File Integrity**: SHA-256 hash calculation and verification
- **Organized Storage**: Folder structure by user/document/category
- **Metadata Storage**: Rich metadata attached to each file
- **Batch Operations**: Delete multiple files at once
- **Storage Statistics**: Track user storage usage

## Architecture

### Storage Path Structure

```
{category}/{userId}/{uploadId}/{fileName}
```

Or with document ID:

```
{category}/{userId}/{documentId}/{uploadId}/{fileName}
```

**Categories:**
- `uploads` - General user uploads
- `documents` - Generated legal documents
- `templates` - Document templates
- `signatures` - Signature-related files

### Example Paths

```
uploads/user-123/abc-def-ghi/contract.pdf
documents/user-123/doc-456/xyz-123/signed_contract.pdf
templates/user-123/template-789/abc-123/template.docx
```

## Installation & Setup

The storage service is already configured in the API. R2 bucket binding is defined in `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "legaldocs-storage"
```

## Usage

### Creating a Storage Service Instance

```typescript
import { createStorageService } from '../lib/storage.js';

// In a Hono route handler
const storageService = createStorageService(c.env.STORAGE, {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: SUPPORTED_MIME_TYPES, // optional, uses defaults
  signedUrlExpiration: 3600, // 1 hour, optional
});
```

### Uploading Files

#### From Base64

```typescript
const uploadResult = await storageService.uploadFromBase64(
  base64Data,
  {
    uploadId: crypto.randomUUID(),
    userId: 'user-123',
    fileName: 'contract.pdf',
    mimeType: 'application/pdf',
    purpose: 'reference',
    documentId: 'doc-456', // optional
  }
);

// Returns:
// {
//   uploadId: 'abc-def-ghi',
//   storagePath: 'uploads/user-123/abc-def-ghi/contract.pdf',
//   fileName: 'contract.pdf',
//   fileSize: 1234567,
//   fileHash: 'sha256-hash',
//   mimeType: 'application/pdf'
// }
```

#### From ArrayBuffer/Uint8Array

```typescript
const uploadResult = await storageService.uploadDocument(
  fileBuffer,
  {
    uploadId: crypto.randomUUID(),
    userId: 'user-123',
    fileName: 'document.pdf',
    mimeType: 'application/pdf',
  }
);
```

#### Large Files

```typescript
// Automatically handles files >10MB efficiently
const uploadResult = await storageService.uploadLargeDocument(
  largeFileBuffer,
  metadata
);
```

### Downloading Files

#### Get File Object

```typescript
const fileObject = await storageService.getDocument(storagePath);

if (fileObject) {
  const arrayBuffer = await fileObject.arrayBuffer();
  // Use the file data
}
```

#### Download as ArrayBuffer

```typescript
const fileData = await storageService.downloadDocument(storagePath);

if (fileData) {
  // Return to user
  return c.body(fileData, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="document.pdf"'
  });
}
```

#### Get Metadata Only

```typescript
const metadata = await storageService.getDocumentMetadata(storagePath);

// Returns:
// {
//   uploadId: 'abc-def-ghi',
//   userId: 'user-123',
//   fileName: 'contract.pdf',
//   mimeType: 'application/pdf',
//   fileSize: 1234567,
//   fileHash: 'sha256-hash',
//   purpose: 'reference',
//   uploadedAt: '2024-01-15T10:30:00Z',
//   ...
// }
```

### Deleting Files

#### Delete Single File

```typescript
const deleted = await storageService.deleteDocument(storagePath);
// Returns: true if successful
```

#### Delete Multiple Files

```typescript
const deletedCount = await storageService.deleteDocuments([
  'path/to/file1.pdf',
  'path/to/file2.pdf',
  'path/to/file3.pdf',
]);
// Returns: number of successfully deleted files
```

#### Delete All User Files

```typescript
// Delete all uploads for a user
const count = await storageService.deleteUserFiles('user-123', 'uploads');

// Delete all files for a user (all categories)
const totalCount = await storageService.deleteUserFiles('user-123');
```

### Listing Files

#### List User Files

```typescript
const result = await storageService.listUserFiles('user-123', {
  category: 'uploads',
  limit: 50,
  cursor: 'optional-cursor-for-pagination',
});

// Returns:
// {
//   files: [
//     {
//       key: 'uploads/user-123/abc/file.pdf',
//       size: 1234567,
//       uploaded: Date,
//       metadata: { ... }
//     },
//     ...
//   ],
//   truncated: false,
//   cursor: undefined
// }
```

#### List Document Files

```typescript
const result = await storageService.listDocumentFiles(
  'user-123',
  'doc-456',
  { limit: 20 }
);
```

#### List All Files with Prefix

```typescript
const result = await storageService.listFiles({
  prefix: 'uploads/user-123/',
  limit: 100,
});
```

### File Operations

#### Copy File

```typescript
const copied = await storageService.copyDocument(
  'source/path/file.pdf',
  'destination/path/file.pdf'
);
```

#### Move File

```typescript
const moved = await storageService.moveDocument(
  'source/path/file.pdf',
  'destination/path/file.pdf'
);
// Copies then deletes source
```

#### Check if File Exists

```typescript
const exists = await storageService.fileExists(storagePath);
```

### Storage Statistics

```typescript
const stats = await storageService.getUserStorageStats('user-123');

// Returns:
// {
//   totalFiles: 42,
//   totalSize: 123456789,
//   filesByType: {
//     'application/pdf': 30,
//     'image/jpeg': 12,
//     ...
//   }
// }
```

## API Endpoints

### POST /api/uploads/extract
Upload and extract document content using AI.

**Request:**
```json
{
  "fileName": "contract.pdf",
  "mimeType": "application/pdf",
  "fileData": "base64-encoded-data",
  "purpose": "reference",
  "language": "auto",
  "extractClauses": true,
  "extractParties": true,
  "extractFinancials": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "abc-def-ghi",
    "status": "completed",
    "fileName": "contract.pdf",
    "fileSize": 1234567,
    "fileHash": "sha256-hash",
    "fileSizeFormatted": "1.18 MB",
    "extraction": { ... }
  }
}
```

### POST /api/uploads/direct
Direct file upload without extraction.

**Request:**
```json
{
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "fileData": "base64-encoded-data",
  "documentId": "doc-456",
  "category": "documents"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "abc-def-ghi",
    "fileName": "document.pdf",
    "fileSize": 1234567,
    "fileSizeFormatted": "1.18 MB",
    "fileHash": "sha256-hash",
    "mimeType": "application/pdf",
    "storagePath": "documents/user-123/doc-456/abc/document.pdf"
  }
}
```

### GET /api/uploads/file/:uploadId
Download a file by upload ID.

**Response:** Binary file with appropriate headers

### GET /api/uploads/:uploadId
Get extraction result.

### GET /api/uploads/metadata/:uploadId
Get file metadata without downloading.

### GET /api/uploads/list
List user's uploaded files.

**Query Parameters:**
- `category` - Filter by category (uploads, documents, etc.)
- `limit` - Max files to return (default: 50)
- `cursor` - Pagination cursor

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "key": "uploads/user-123/abc/file.pdf",
        "fileName": "file.pdf",
        "size": 1234567,
        "sizeFormatted": "1.18 MB",
        "mimeType": "application/pdf",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "uploadId": "abc-def-ghi",
        "fileHash": "sha256-hash"
      }
    ],
    "hasMore": false,
    "cursor": null
  }
}
```

### GET /api/uploads/stats
Get storage statistics for the current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 42,
    "totalSize": 123456789,
    "totalSizeFormatted": "117.74 MB",
    "filesByType": {
      "application/pdf": 30,
      "image/jpeg": 12
    }
  }
}
```

### DELETE /api/uploads/:uploadId
Delete an upload.

### POST /api/uploads/batch-delete
Delete multiple files at once.

**Request:**
```json
{
  "uploadIds": ["id1", "id2", "id3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": 2,
    "failed": 0,
    "notFound": 1,
    "details": {
      "deleted": ["id1", "id2"],
      "failed": [],
      "notFound": ["id3"]
    }
  }
}
```

## Supported File Types

### Documents
- PDF (`.pdf`)
- Word Documents (`.doc`, `.docx`)
- OpenDocument Text (`.odt`)
- Plain Text (`.txt`)
- Rich Text Format (`.rtf`)

### Images
- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- WebP (`.webp`)
- TIFF (`.tiff`)
- GIF (`.gif`)

### Archives
- ZIP (`.zip`)

## File Size Limits

- **Default Maximum**: 100MB per file
- **Multipart Threshold**: 10MB (automatic handling)
- **Configurable** via `StorageConfig.maxFileSize`

## Security Features

### Validation
- MIME type validation against allowlist
- File size validation
- File name sanitization (prevents path traversal)
- Character validation in file names

### File Integrity
- SHA-256 hash calculation on upload
- Hash stored in metadata for verification
- Can verify file hasn't been tampered with

### Access Control
- All routes require authentication
- User ID embedded in storage path
- Files only accessible by owner
- Rate limiting on uploads (20 per minute per user)

### Metadata Privacy
- User-specific metadata stored with files
- Metadata includes: userId, uploadId, fileName, mimeType, fileSize, fileHash, purpose, timestamps

## Error Handling

The storage service throws `ApiError` exceptions for:

- **Unsupported file type**: `BAD_REQUEST` with list of supported types
- **File too large**: `BAD_REQUEST` with size limits
- **Invalid file name**: `BAD_REQUEST` with character requirements
- **Invalid base64**: `BAD_REQUEST` when decoding fails
- **Upload failure**: `INTERNAL_ERROR` when R2 operation fails

All errors follow the standard API error format:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "File size (150MB) exceeds maximum limit of 100MB"
  }
}
```

## Rate Limiting

Upload endpoints are rate limited to prevent abuse:

- **Extract endpoint**: 10 requests per minute (AI rate limit)
- **Direct upload**: 20 requests per minute
- **Other endpoints**: Standard API rate limit (100 req/min)

Rate limit headers included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After` (when limited)

## Caching

File metadata is cached in Cloudflare KV for quick access:

- **Extraction results**: 7 days TTL (`extraction:{uploadId}`)
- **Direct uploads**: 30 days TTL (`file:{uploadId}`)

This reduces R2 reads for frequently accessed metadata.

## Best Practices

1. **Always validate before upload**: Use `validateFileType()` and `validateFileSize()` if custom validation needed
2. **Calculate hashes**: File hashes ensure integrity and can detect duplicates
3. **Use appropriate categories**: Organize files by category for better management
4. **Clean up failed uploads**: Delete files if subsequent operations fail
5. **Implement pagination**: Use cursor-based pagination for listing large file sets
6. **Cache metadata**: Store frequently accessed metadata in KV
7. **Set appropriate TTLs**: Balance cache performance vs. freshness

## Cloudflare Workers Compatibility

The storage service is fully compatible with Cloudflare Workers:

✅ Uses Web Crypto API (not Node.js crypto)
✅ Uses R2 bucket bindings (not S3 SDK)
✅ No file system access
✅ No Node.js-specific imports
✅ Properly typed with `@cloudflare/workers-types`
✅ ESM module format
✅ All async operations

## Performance Considerations

- **R2 Operations**: R2 read/write operations count toward your plan limits
- **KV Caching**: Reduces R2 reads for metadata
- **Multipart Uploads**: Files >10MB are logged but handled normally (R2 manages this internally)
- **List Operations**: Paginated to avoid memory issues with large buckets
- **Batch Deletes**: Processes sequentially (R2 doesn't support batch operations)

## Future Enhancements

Potential improvements:
- [ ] Implement signed URLs with KV-backed tokens
- [ ] Add image resizing/optimization
- [ ] Support for streaming large files
- [ ] Duplicate detection via file hashes
- [ ] File versioning
- [ ] Bulk upload support
- [ ] Storage quota enforcement per user
- [ ] CDN integration for public files

## Examples

### Complete Upload Flow

```typescript
import { createStorageService, formatFileSize } from '../lib/storage.js';

// In route handler
uploads.post('/upload', async (c) => {
  const userId = c.get('userId');
  const { fileName, mimeType, fileData } = await c.req.json();

  // Create service
  const storage = createStorageService(c.env.STORAGE, {
    maxFileSize: 50 * 1024 * 1024, // 50MB
  });

  try {
    // Upload file
    const result = await storage.uploadFromBase64(fileData, {
      uploadId: crypto.randomUUID(),
      userId,
      fileName,
      mimeType,
    });

    // Cache metadata
    await c.env.CACHE.put(
      `file:${result.uploadId}`,
      JSON.stringify(result),
      { expirationTtl: 86400 } // 24 hours
    );

    return c.json({
      success: true,
      data: {
        ...result,
        fileSizeFormatted: formatFileSize(result.fileSize),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: error.message,
      },
    }, 500);
  }
});
```

### Download with Access Control

```typescript
uploads.get('/download/:uploadId', async (c) => {
  const userId = c.get('userId');
  const { uploadId } = c.req.param();

  // Get metadata from cache
  const cached = await c.env.CACHE.get(`file:${uploadId}`);
  if (!cached) {
    return c.json({ error: 'File not found' }, 404);
  }

  const fileInfo = JSON.parse(cached);

  // Verify ownership
  if (fileInfo.userId !== userId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  // Download file
  const storage = createStorageService(c.env.STORAGE);
  const fileData = await storage.downloadDocument(fileInfo.storagePath);

  if (!fileData) {
    return c.json({ error: 'File not found in storage' }, 404);
  }

  // Return file
  return c.body(fileData, 200, {
    'Content-Type': fileInfo.mimeType,
    'Content-Disposition': `attachment; filename="${fileInfo.fileName}"`,
    'Content-Length': fileInfo.fileSize.toString(),
  });
});
```

## Support

For issues or questions:
- Check the error messages (they include details)
- Review the TypeScript types for parameter requirements
- Check Cloudflare R2 documentation for bucket limits
- Monitor R2 usage in Cloudflare dashboard

## License

Part of the LegalDocs API project.
