# Professional PDF Generation System

## Overview

The LegalDocs platform now includes a comprehensive PDF generation system that produces professionally designed legal documents. The system uses a hybrid approach combining:

1. **Cloudflare Browser Rendering** - Server-side HTML-to-PDF conversion for pixel-perfect results
2. **Enhanced pdfMake** - Client-side fallback for when backend is unavailable

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│  usePdfGenerator Hook                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Try Backend PDF Service                              │   │
│  │ POST /api/pdf/generate                               │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                               │
│                    Success? │ No                            │
│                       │     └──────────────────────┐       │
│                       ▼                            ▼       │
│               Return PDF              Use pdfMake Fallback  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API (Cloudflare Workers)                 │
│                                                             │
│  POST /api/pdf/generate                                     │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Fetch document from D1                            │   │
│  │ 2. Generate HTML from template                       │   │
│  │ 3. Render PDF via Browser Rendering                  │   │
│  │ 4. Return PDF binary                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Professional Styling
- Custom typography with Google Fonts
  - **English**: Inter, system fonts
  - **Arabic**: Amiri, Cairo, Noto Naskh Arabic
- Color scheme optimized for legal documents
- Print-ready layout with proper margins
- Gradient headers and styled sections

### Bilingual Support
- Full RTL support for Arabic and Urdu
- Side-by-side bilingual document format
- Automatic direction detection
- Proper font rendering for Arabic text

### Document Components
- Professional header with branding
- Status badges (Draft, Signed, Certified)
- Reference information bar
- Party information cards
- Structured content sections
- Signature blocks with placeholders
- Witness sections
- Audit trail table
- Footer with disclaimer

### GCC Country Support
- United Arab Emirates (AE)
- Kingdom of Saudi Arabia (SA)
- State of Qatar (QA)
- State of Kuwait (KW)
- Kingdom of Bahrain (BH)
- Sultanate of Oman (OM)

## API Endpoints

### Generate PDF
```
POST /api/pdf/generate
Authorization: Bearer <token>

Request Body:
{
  "documentId": "uuid",
  "language": "en" | "ar" | "ur",
  "format": "standard" | "professional" | "bilingual",
  "includeSignatures": true,
  "includeWitnesses": true,
  "includeAuditTrail": false,
  "isDraft": false
}

Response: PDF binary (application/pdf)
```

### Preview PDF
```
POST /api/pdf/preview
Authorization: Bearer <token>

Request Body:
{
  "title": "string",
  "titleAr": "string (optional)",
  "documentType": "string",
  "contentEn": "string (optional)",
  "contentAr": "string (optional)",
  "language": "en" | "ar" | "ur",
  "country": "ae" | "sa" | "qa" | "kw" | "bh" | "om",
  "partyA": { name, idNumber, ... },
  "partyB": { name, idNumber, ... },
  "isDraft": true
}

Response: PDF binary (application/pdf)
```

### Generate from HTML
```
POST /api/pdf/from-html
Authorization: Bearer <token>

Request Body:
{
  "html": "<html>...</html>",
  "filename": "document.pdf"
}

Response: PDF binary (application/pdf)
```

### Health Check
```
GET /api/pdf/health

Response:
{
  "success": true,
  "data": {
    "status": "available" | "unavailable",
    "methods": {
      "browserRendering": true,
      "restAPI": true
    },
    "supportedFormats": ["A4", "LETTER", "LEGAL"],
    "supportedLanguages": ["en", "ar", "ur"]
  }
}
```

## Configuration

### Enable Browser Rendering

1. Uncomment the browser binding in `wrangler.toml`:
```toml
browser = { binding = "BROWSER" }
```

2. Update compatibility settings:
```toml
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat_v2"]
```

### REST API Fallback

If Browser Rendering binding is not available, the system can use Cloudflare's REST API:

```bash
wrangler secret put CF_ACCOUNT_ID
wrangler secret put CF_API_TOKEN
```

## Frontend Usage

### Using the Hook

```tsx
import { usePdfGenerator } from '@/hooks';

function DocumentActions({ documentId }: { documentId: string }) {
  const { generatePdf, isGenerating, error, progress } = usePdfGenerator();

  const handleDownload = async () => {
    await generatePdf({
      documentId,
      language: 'en',
      format: 'professional',
      includeSignatures: true,
    });
  };

  return (
    <button onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? `Generating... ${progress}%` : 'Download PDF'}
    </button>
  );
}
```

### Preview Generation

```tsx
const { generatePreview } = usePdfGenerator();

await generatePreview({
  title: 'Employment Contract',
  titleAr: 'عقد عمل',
  documentType: 'employment_contract',
  contentEn: 'Contract content...',
  contentAr: 'محتوى العقد...',
  language: 'ar',
  country: 'ae',
  partyA: { name: 'Company Name', idNumber: '123456' },
  partyB: { name: 'Employee Name', idNumber: '789012' },
});
```

## File Structure

```
apps/api/src/services/pdf/
├── index.ts              # Main exports
├── types.ts              # TypeScript interfaces
├── generator.ts          # PDF generator class
└── templates/
    ├── index.ts          # Template exports
    ├── base.ts           # Base CSS and utilities
    └── legal-document.ts # Legal document template

apps/web/src/
├── lib/
│   └── pdf-professional.ts  # Enhanced pdfMake generator
└── hooks/
    └── usePdfGenerator.ts   # React hook for PDF generation
```

## Pricing (Cloudflare Browser Rendering)

| Plan | Included | Additional |
|------|----------|------------|
| Workers Free | 10 min/day | N/A |
| Workers Paid | 10 hours/month | $0.09/hour |

Estimated cost for 1000 PDFs/month (30 sec each): ~$0.85

## Best Practices

1. **Cache Generated PDFs**: Store in R2 for repeated downloads
2. **Use Preview for Draft**: Generate final PDF only when needed
3. **Optimize HTML**: Minimize CSS and inline fonts
4. **Handle Errors**: Always implement fallback to pdfMake
5. **Monitor Usage**: Track Browser Rendering usage in Cloudflare dashboard

## Troubleshooting

### "No PDF generation method available"
- Enable Browser Rendering binding in wrangler.toml
- Or configure CF_ACCOUNT_ID and CF_API_TOKEN secrets

### Arabic text not rendering correctly
- Ensure Google Fonts are loading (requires network access)
- Verify RTL direction is set correctly

### PDF generation timeout
- Reduce HTML complexity
- Check for external resource loading issues
- Increase worker timeout if needed

## Future Enhancements

- [ ] QR code generation for document verification
- [ ] Digital signature embedding (cryptographic)
- [ ] PDF/A compliance for archival
- [ ] Template designer UI
- [ ] Batch PDF generation
- [ ] PDF merge functionality
