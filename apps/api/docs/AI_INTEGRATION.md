# AI Integration Documentation

## Overview

The LegalDocs API integrates Claude AI via OpenRouter to provide powerful legal document generation, analysis, and processing capabilities. This integration includes comprehensive error handling, retry logic, token tracking, and cost management.

## Architecture

### Core Components

1. **AI Service Library** (`src/lib/ai.ts`)
   - Wraps OpenRouter API calls
   - Handles retries with exponential backoff
   - Provides helper functions for different AI tasks
   - Includes specialized prompts for UAE/GCC legal documents
   - Supports both streaming and non-streaming responses

2. **AI Routes** (`src/routes/ai.ts`)
   - RESTful API endpoints for AI operations
   - Request validation with Zod schemas
   - Token usage tracking and cost estimation
   - Comprehensive error handling

3. **Database Tracking** (`migrations/002_ai_usage.sql`)
   - Tracks all AI API calls
   - Stores token usage and costs
   - Enables analytics and billing

## Model Selection

### Claude Sonnet 4 (`anthropic/claude-sonnet-4`)
- **Best for**: Complex legal documents, detailed analysis, multi-language generation
- **Max tokens**: 8,000
- **Cost**: $3/1k input tokens, $15/1k output tokens
- **Used for**:
  - Document generation
  - Contract analysis
  - Legal translation
  - OCR extraction

### Claude Haiku 3.5 (`anthropic/claude-3.5-haiku`)
- **Best for**: Simple queries, quick analysis, chat responses
- **Max tokens**: 8,000
- **Cost**: $1/1k input tokens, $5/1k output tokens
- **Used for**:
  - Chat assistant
  - Document summarization
  - Quick responses

## API Endpoints

### 1. Generate Legal Document

**Endpoint**: `POST /api/ai/generate`

**Description**: Generate a professional legal document using AI with comprehensive prompts tailored for UAE/GCC legal requirements.

**Request Body**:
```json
{
  "templateType": "rental_agreement",
  "parties": [
    {
      "role": "landlord",
      "name": "Ahmed Al Maktoum",
      "entityType": "individual",
      "emiratesId": "784-1234-1234567-1",
      "phone": "+971501234567",
      "email": "ahmed@example.com"
    }
  ],
  "documentDetails": {
    "propertyAddress": "Villa 123, Palm Jumeirah",
    "rentAmount": 120000,
    "currency": "AED",
    "duration": "1 year"
  },
  "languages": ["en", "ar"],
  "bindingLanguage": "ar",
  "country": "ae",
  "jurisdiction": "Dubai"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "generated": {
      "en": {
        "title": "Residential Rental Agreement",
        "parties": "...",
        "recitals": "...",
        "clauses": [...],
        "signatures": "..."
      },
      "ar": {
        "title": "عقد إيجار سكني",
        "parties": "...",
        "recitals": "...",
        "clauses": [...],
        "signatures": "..."
      }
    },
    "languages": ["en", "ar"],
    "metadata": {
      "model": "anthropic/claude-sonnet-4",
      "tokens": {
        "input": 1234,
        "output": 3456,
        "total": 4690
      },
      "estimatedCost": 0.0557,
      "processingTime": 8234
    }
  }
}
```

### 2. Analyze Contract

**Endpoint**: `POST /api/ai/negotiate/analyze`

**Description**: Comprehensive contract risk assessment from a specific party's perspective.

**Request Body**:
```json
{
  "contractText": "Full contract text here...",
  "position": "tenant",
  "language": "en",
  "country": "ae"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "analysis": {
      "clauses": [
        {
          "id": "clause_1",
          "text": "The Tenant shall pay rent...",
          "category": "payment",
          "riskLevel": "medium",
          "riskScore": 55,
          "issues": ["No grace period specified"],
          "suggestions": ["Add 5-day grace period"],
          "marketComparison": "Standard in UAE market"
        }
      ],
      "riskSummary": {
        "overallScore": 62,
        "overallLevel": "medium",
        "topRisks": [...],
        "missingClauses": [...]
      }
    },
    "metadata": {
      "model": "anthropic/claude-sonnet-4",
      "tokens": {...},
      "estimatedCost": 0.0234,
      "processingTime": 5678
    }
  }
}
```

### 3. Chat Assistant

**Endpoint**: `POST /api/ai/negotiate/chat`

**Description**: Interactive chat with AI legal assistant. Supports streaming for real-time responses.

**Request Body**:
```json
{
  "message": "What does force majeure mean in UAE contracts?",
  "contractText": "Optional contract context...",
  "position": "buyer",
  "history": [
    {
      "role": "user",
      "content": "Previous question"
    },
    {
      "role": "assistant",
      "content": "Previous answer"
    }
  ],
  "stream": false
}
```

**Response** (non-streaming):
```json
{
  "success": true,
  "data": {
    "response": "Force majeure in UAE contracts refers to...",
    "metadata": {
      "model": "anthropic/claude-3.5-haiku",
      "tokens": {...},
      "estimatedCost": 0.0056,
      "processingTime": 1234
    }
  }
}
```

**Response** (streaming):
Server-Sent Events (SSE) stream with chunks:
```
data: {"content": "Force", "done": false}
data: {"content": " majeure", "done": false}
data: {"content": "", "done": true}
```

### 4. OCR Extraction

**Endpoint**: `POST /api/ai/ocr/extract`

**Description**: Extract structured data from document images (Emirates ID, passport, trade license, etc.).

**Request Body**:
```json
{
  "imageData": "base64_encoded_image_data",
  "documentType": "emirates_id",
  "language": "en",
  "expectedFields": ["fullName", "idNumber", "nationality"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extracted": {
      "fullName": "Ahmed Mohammed Al Maktoum",
      "fullNameAr": "أحمد محمد المكتوم",
      "idNumber": "784-1990-1234567-8",
      "nationality": "United Arab Emirates",
      "dateOfBirth": "15/03/1990",
      "gender": "Male",
      "cardNumber": "123-4567-8901234-5",
      "expiryDate": "20/12/2028"
    },
    "documentType": "emirates_id",
    "metadata": {
      "model": "anthropic/claude-sonnet-4",
      "tokens": {...},
      "estimatedCost": 0.0145,
      "processingTime": 3456
    }
  }
}
```

### 5. Summarize Document

**Endpoint**: `POST /api/ai/summarize`

**Description**: Generate concise summaries of legal documents.

**Request Body**:
```json
{
  "text": "Long document text...",
  "language": "en",
  "maxLength": 200
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": "This rental agreement establishes...",
    "metadata": {
      "model": "anthropic/claude-3.5-haiku",
      "tokens": {...},
      "estimatedCost": 0.0034,
      "processingTime": 1567
    }
  }
}
```

### 6. Translate Document

**Endpoint**: `POST /api/ai/translate`

**Description**: Translate legal text while preserving legal terminology.

**Request Body**:
```json
{
  "text": "The parties hereby agree...",
  "sourceLanguage": "en",
  "targetLanguage": "ar",
  "preserveLegalTerms": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "translation": "يتفق الطرفان بموجب هذا...",
    "sourceLanguage": "en",
    "targetLanguage": "ar",
    "metadata": {
      "model": "anthropic/claude-sonnet-4",
      "tokens": {...},
      "estimatedCost": 0.0189,
      "processingTime": 2345
    }
  }
}
```

## Error Handling

### Error Types

1. **Rate Limiting** (429)
   - Automatic retry with exponential backoff
   - Returns `RATE_LIMITED` error code

2. **Quota Exceeded** (503)
   - When AI service quota is exhausted
   - Returns `INTERNAL_ERROR` with specific message

3. **Timeout** (504)
   - When request takes too long
   - Returns `INTERNAL_ERROR` with timeout message

4. **Invalid Response** (500)
   - When AI returns unparseable response
   - Returns `INTERNAL_ERROR`

### Example Error Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Try again in 30 seconds."
  }
}
```

## Retry Logic

The AI service implements exponential backoff for retryable errors:

- **Max retries**: 3
- **Initial delay**: 1000ms
- **Max delay**: 10000ms
- **Backoff multiplier**: 2x

Retryable conditions:
- HTTP 5xx errors
- HTTP 429 (rate limit)
- Network timeouts
- Connection errors

## Cost Management

### Token Estimation
- English text: ~4 characters per token
- Arabic text: ~2 characters per token
- Images: Estimated based on file size

### Cost Tracking
All API calls are tracked in the `ai_usage` table with:
- User ID
- Operation type
- Model used
- Input/output tokens
- Estimated cost
- Success/failure status
- Timestamp

### Usage Analytics

Query user statistics:
```sql
SELECT * FROM v_user_ai_stats WHERE user_id = ?;
```

Query daily usage:
```sql
SELECT * FROM v_daily_ai_usage WHERE usage_date >= ?;
```

## Specialized Legal Prompts

### UAE/GCC Compliance
All prompts include:
- Country-specific legal requirements
- Compliance notes (Sharia compliance, labor laws, etc.)
- Cultural considerations
- Proper legal Arabic terminology
- Jurisdiction-specific regulations

### Document Structure
Generated documents include:
- Professional legal formatting
- Proper clause numbering
- Comprehensive recitals (WHEREAS clauses)
- Party identification blocks
- Signature blocks with witness requirements
- Governing law and jurisdiction clauses

## Best Practices

### 1. Model Selection
- Use Sonnet 4 for complex legal tasks requiring accuracy
- Use Haiku 3.5 for simple queries to reduce costs
- Let the service auto-select based on task complexity

### 2. Token Optimization
- Trim unnecessary whitespace
- Limit conversation history to last 10 messages
- Use summarization for very long documents

### 3. Error Handling
- Always check the `success` field
- Handle specific error codes appropriately
- Display user-friendly error messages

### 4. Streaming
- Use streaming for chat interfaces
- Provides better user experience
- Reduces perceived latency

### 5. Cost Control
- Monitor usage via analytics views
- Set rate limits per user/organization
- Implement usage quotas if needed

## Configuration

### Environment Variables
```bash
# OpenRouter API Key (required)
OPENROUTER_API_KEY=sk-or-v1-...

# Optional: Custom referer for OpenRouter
HTTP_REFERER=https://your-domain.com

# Optional: Application title for OpenRouter
APP_TITLE=YourApp
```

### Cloudflare Workers Configuration
```toml
[vars]
OPENROUTER_API_KEY = "your-api-key"
```

## Cloudflare Workers Compatibility

All code is fully compatible with Cloudflare Workers:
- No Node.js-specific APIs (fs, path, etc.)
- Uses Web Standards (fetch, Response, ReadableStream)
- Compatible with D1 database
- Edge-optimized with minimal cold starts

## Future Enhancements

Potential improvements:
1. Add support for Claude Opus for most complex tasks
2. Implement caching for frequently generated documents
3. Add batch processing for multiple documents
4. Implement webhook support for long-running tasks
5. Add support for fine-tuned models
6. Implement A/B testing for prompt variations
7. Add multi-modal support (images in document generation)

## Support

For issues or questions:
- Check error logs in Cloudflare Workers dashboard
- Review usage statistics in database
- Monitor OpenRouter dashboard for API issues
- Contact support with request IDs from metadata

## License

This integration is part of the LegalDocs platform and subject to its license terms.
