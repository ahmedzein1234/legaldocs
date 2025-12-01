# AI Service Library

## Overview

The AI Service library (`ai.ts`) provides a comprehensive, production-ready wrapper around the OpenRouter API for integrating Claude AI models into the LegalDocs platform.

## Features

- **Automatic Retry Logic**: Exponential backoff for transient failures
- **Error Handling**: Comprehensive error detection and recovery
- **Token Tracking**: Accurate token counting and cost estimation
- **Streaming Support**: Real-time responses for chat interfaces
- **Model Selection**: Intelligent model selection based on task complexity
- **Specialized Prompts**: Legal-specific prompts for UAE/GCC documents
- **Cloudflare Workers Compatible**: No Node.js dependencies

## Quick Start

### Basic Usage

```typescript
import { createAIService } from './lib/ai.js';

// Create service instance
const aiService = createAIService({
  apiKey: 'sk-or-v1-...',
  defaultModel: 'anthropic/claude-sonnet-4',
  referer: 'https://yourdomain.com',
  appTitle: 'YourApp',
});

// Generate a document
const result = await aiService.generate({
  templateType: 'rental_agreement',
  country: 'ae',
  languages: ['en', 'ar'],
  bindingLanguage: 'ar',
  parties: [...],
  documentDetails: {...},
});

console.log(result.content);
console.log('Tokens used:', result.usage);
```

## Core Methods

### 1. chat()

Make a non-streaming API call with custom messages.

```typescript
const response = await aiService.chat(
  [
    { role: 'system', content: 'You are a legal expert...' },
    { role: 'user', content: 'What is force majeure?' },
  ],
  {
    model: 'anthropic/claude-3.5-haiku',
    maxTokens: 2000,
    temperature: 0.7,
  }
);

console.log(response.content);
console.log('Cost:', response.usage);
```

### 2. chatStream()

Make a streaming API call for real-time responses.

```typescript
const stream = await aiService.chatStream(
  [
    { role: 'system', content: 'You are a legal expert...' },
    { role: 'user', content: 'Explain contract law...' },
  ],
  {
    model: 'anthropic/claude-3.5-haiku',
    maxTokens: 2000,
    onChunk: (chunk) => {
      console.log('Chunk:', chunk.content);
      if (chunk.done) {
        console.log('Usage:', chunk.usage);
      }
    },
  }
);

// Process the stream
const reader = stream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Process chunk
}
```

### 3. generate()

Generate a legal document with specialized prompts.

```typescript
const response = await aiService.generate({
  templateType: 'employment_contract',
  country: 'ae',
  jurisdiction: 'Dubai',
  languages: ['en', 'ar'],
  bindingLanguage: 'ar',
  parties: [
    {
      role: 'employer',
      name: 'ABC Company LLC',
      entityType: 'company',
      tradeLicense: 'DED-123456',
    },
    {
      role: 'employee',
      name: 'John Doe',
      entityType: 'individual',
      emiratesId: '784-1990-1234567-8',
    },
  ],
  documentDetails: {
    position: 'Software Engineer',
    salary: 15000,
    currency: 'AED',
    startDate: '2024-01-01',
    probationPeriod: '6 months',
  },
});

const document = parseJSONFromResponse(response.content);
```

### 4. analyze()

Analyze a contract for risks and opportunities.

```typescript
const response = await aiService.analyze({
  contractText: 'Full contract text here...',
  position: 'buyer',
  country: 'ae',
  language: 'en',
});

const analysis = parseJSONFromResponse(response.content);
console.log('Risk score:', analysis.riskSummary.overallScore);
console.log('Top risks:', analysis.riskSummary.topRisks);
```

### 5. summarize()

Create a concise summary of a document.

```typescript
const response = await aiService.summarize({
  text: 'Long legal document text...',
  language: 'en',
  maxLength: 200,
});

console.log('Summary:', response.content);
```

### 6. translate()

Translate legal text while preserving terminology.

```typescript
const response = await aiService.translate({
  text: 'The parties hereby agree...',
  sourceLanguage: 'en',
  targetLanguage: 'ar',
  preserveLegalTerms: true,
});

console.log('Translation:', response.content);
```

### 7. extractFromImage()

Extract structured data from document images.

```typescript
const response = await aiService.extractFromImage({
  imageData: 'base64_encoded_image',
  documentType: 'emirates_id',
  expectedFields: ['fullName', 'idNumber', 'nationality'],
});

const data = parseJSONFromResponse(response.content);
console.log('Extracted:', data);
```

### 8. chatAssistant()

Interactive chat with context awareness.

```typescript
const response = await aiService.chatAssistant({
  message: 'What are my rights as a tenant?',
  history: [
    { role: 'user', content: 'I have a rental issue' },
    { role: 'assistant', content: 'I can help with that...' },
  ],
  context: {
    contractText: 'Optional contract context...',
    position: 'tenant',
    country: 'ae',
  },
});

console.log('Response:', response.content);
```

## Helper Functions

### parseJSONFromResponse()

Extract JSON from AI responses (handles markdown code blocks).

```typescript
import { parseJSONFromResponse } from './lib/ai.js';

const text = '```json\n{"key": "value"}\n```';
const data = parseJSONFromResponse(text);
// Returns: { key: "value" }
```

### estimateTokens()

Roughly estimate token count for text.

```typescript
import { estimateTokens } from './lib/ai.js';

const count = estimateTokens('Hello world');
// Returns: ~3 tokens
```

### estimateCost()

Calculate estimated API cost.

```typescript
import { estimateCost } from './lib/ai.js';

const cost = estimateCost(1000, 2000, 'anthropic/claude-sonnet-4');
// Returns: 0.033 (in USD)
```

### selectModel()

Automatically select optimal model for a task.

```typescript
import { selectModel } from './lib/ai.js';

const model = selectModel({
  type: 'generate',
  complexity: 'complex',
});
// Returns: 'anthropic/claude-sonnet-4'

const chatModel = selectModel({
  type: 'chat',
  complexity: 'simple',
});
// Returns: 'anthropic/claude-3.5-haiku'
```

## Configuration Options

### AIServiceConfig

```typescript
interface AIServiceConfig {
  apiKey: string;              // OpenRouter API key (required)
  defaultModel?: AIModel;      // Default model to use
  retryConfig?: {
    maxRetries?: number;       // Default: 3
    initialDelayMs?: number;   // Default: 1000
    maxDelayMs?: number;       // Default: 10000
    backoffMultiplier?: number; // Default: 2
  };
  referer?: string;            // HTTP referer for OpenRouter
  appTitle?: string;           // App title for OpenRouter
}
```

## Model Specifications

### Claude Sonnet 4

```typescript
{
  model: 'anthropic/claude-sonnet-4',
  maxTokens: 8000,
  costPer1kInput: 3.0,   // USD
  costPer1kOutput: 15.0,  // USD
  bestFor: [
    'Complex legal documents',
    'Detailed analysis',
    'Multi-language generation',
  ],
}
```

### Claude Haiku 3.5

```typescript
{
  model: 'anthropic/claude-3.5-haiku',
  maxTokens: 8000,
  costPer1kInput: 1.0,   // USD
  costPer1kOutput: 5.0,   // USD
  bestFor: [
    'Simple queries',
    'Quick analysis',
    'Chat responses',
  ],
}
```

## Retry Logic

The service automatically retries failed requests with exponential backoff:

### Retryable Errors
- HTTP 5xx (server errors)
- HTTP 429 (rate limiting)
- Network timeouts
- Connection failures

### Retry Schedule
```
Attempt 1: Immediate
Attempt 2: 1 second delay
Attempt 3: 2 second delay
Attempt 4: 4 second delay (max: 10 seconds)
```

## Error Handling

### Error Types

```typescript
try {
  const response = await aiService.chat([...]);
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Handle rate limiting
  } else if (error.message.includes('insufficient funds')) {
    // Handle quota exceeded
  } else if (error.message.includes('timeout')) {
    // Handle timeout
  } else {
    // Handle other errors
  }
}
```

## Specialized Prompts

### Document Generation

Prompts include:
- Country-specific legal requirements
- Compliance notes (Sharia, labor laws, etc.)
- Language requirements
- Document structure guidelines
- Cultural considerations

### Contract Analysis

Prompts provide:
- Risk assessment framework
- Clause categorization
- Market comparison
- Missing clause detection
- Compliance checking

### OCR Extraction

Prompts specify:
- Expected document fields
- Field validation rules
- Format requirements
- Arabic text handling
- Error tolerance

## Best Practices

### 1. Token Management

```typescript
// Estimate tokens before making call
const estimatedTokens = estimateTokens(text);
if (estimatedTokens > 7000) {
  // Split or summarize text
}

// Track actual usage
const response = await aiService.chat([...]);
console.log('Actual tokens:', response.usage.total_tokens);
```

### 2. Cost Optimization

```typescript
// Use appropriate model for task
const model = selectModel({ type: 'chat', complexity: 'simple' });

// Limit max tokens for responses
const response = await aiService.chat([...], {
  maxTokens: 500, // Limit output length
});

// Batch similar requests
const summaries = await Promise.all(
  documents.map(doc => aiService.summarize({ text: doc }))
);
```

### 3. Error Recovery

```typescript
// Let retry logic handle transient errors
try {
  const response = await aiService.chat([...]);
} catch (error) {
  // Only non-retryable errors reach here
  if (error.message.includes('quota')) {
    // Notify admin
  }
  throw error;
}
```

### 4. Streaming for UX

```typescript
// Use streaming for better user experience
if (isInteractive) {
  const stream = await aiService.chatStream([...], {
    onChunk: (chunk) => {
      // Update UI in real-time
      updateUI(chunk.content);
    },
  });
} else {
  // Use regular call for batch processing
  const response = await aiService.chat([...]);
}
```

## Examples

### Example 1: Multi-Language Document

```typescript
const response = await aiService.generate({
  templateType: 'sales_contract',
  country: 'ae',
  languages: ['en', 'ar', 'ur'],
  bindingLanguage: 'ar',
  parties: [
    {
      role: 'seller',
      name: 'Mohammed Trading LLC',
      tradeLicense: 'DED-123456',
    },
    {
      role: 'buyer',
      name: 'Ahmed Ahmed',
      emiratesId: '784-1985-7654321-2',
    },
  ],
  documentDetails: {
    item: 'Commercial Vehicle',
    price: 50000,
    currency: 'AED',
    deliveryDate: '2024-03-01',
  },
});

const document = parseJSONFromResponse(response.content);
// document.en, document.ar, document.ur all populated
```

### Example 2: Risk Analysis with Context

```typescript
const analysis = await aiService.analyze({
  contractText: fullContractText,
  position: 'employee',
  country: 'ae',
  language: 'en',
});

const data = parseJSONFromResponse(analysis.content);

// Check overall risk
if (data.riskSummary.overallLevel === 'critical') {
  console.log('HIGH RISK CONTRACT');
  console.log('Top concerns:', data.riskSummary.topRisks);
}

// Review specific clauses
data.clauses.forEach(clause => {
  if (clause.riskLevel === 'high' || clause.riskLevel === 'critical') {
    console.log(`Risky clause: ${clause.text}`);
    console.log(`Issues: ${clause.issues.join(', ')}`);
    console.log(`Suggestions: ${clause.suggestions.join(', ')}`);
  }
});
```

### Example 3: Interactive Chat Session

```typescript
const conversationHistory = [];

async function chat(userMessage) {
  conversationHistory.push({
    role: 'user',
    content: userMessage,
  });

  const response = await aiService.chatAssistant({
    message: userMessage,
    history: conversationHistory.slice(-10), // Last 10 messages
    context: {
      country: 'ae',
    },
  });

  conversationHistory.push({
    role: 'assistant',
    content: response.content,
  });

  return response.content;
}

// Usage
await chat('What is a trade license?');
await chat('How do I get one in Dubai?');
await chat('What documents do I need?');
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { estimateTokens, estimateCost, selectModel } from './ai.js';

describe('AI Service', () => {
  it('should estimate tokens correctly', () => {
    const count = estimateTokens('Hello world');
    expect(count).toBeGreaterThan(0);
  });

  it('should calculate cost correctly', () => {
    const cost = estimateCost(1000, 2000, 'anthropic/claude-sonnet-4');
    expect(cost).toBe(0.033);
  });

  it('should select appropriate model', () => {
    const model = selectModel({ type: 'generate', complexity: 'complex' });
    expect(model).toBe('anthropic/claude-sonnet-4');
  });
});
```

## Troubleshooting

### Common Issues

1. **"API request failed with status 401"**
   - Check API key is correct
   - Verify key has not expired

2. **"Rate limit exceeded"**
   - Automatic retry will handle this
   - If persistent, check OpenRouter quota

3. **"Invalid JSON response"**
   - AI sometimes returns text with JSON
   - Use `parseJSONFromResponse()` helper
   - Check prompt clarity

4. **High costs**
   - Use Haiku for simple tasks
   - Limit max_tokens parameter
   - Monitor with cost estimation

## Support

For issues or questions:
- Review OpenRouter documentation
- Check Cloudflare Workers logs
- Monitor token usage in database
- Contact support with request metadata

## License

Part of LegalDocs platform - subject to platform license terms.
