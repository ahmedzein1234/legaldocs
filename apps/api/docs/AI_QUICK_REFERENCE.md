# AI Service Quick Reference

## Import

```typescript
import { createAIService, parseJSONFromResponse, estimateTokens } from '../lib/ai.js';
```

## Create Service

```typescript
const aiService = createAIService({
  apiKey: c.env.OPENROUTER_API_KEY,
  defaultModel: 'anthropic/claude-sonnet-4',
});
```

## Quick Methods

### Generate Document
```typescript
const result = await aiService.generate({
  templateType: 'rental_agreement',
  country: 'ae',
  languages: ['en', 'ar'],
  bindingLanguage: 'ar',
  parties: [...],
  documentDetails: {...},
});
const doc = parseJSONFromResponse(result.content);
```

### Analyze Contract
```typescript
const result = await aiService.analyze({
  contractText: 'full text...',
  position: 'tenant',
  country: 'ae',
});
const analysis = parseJSONFromResponse(result.content);
```

### Chat
```typescript
const result = await aiService.chatAssistant({
  message: 'What is force majeure?',
  history: [...],
  context: { country: 'ae' },
});
```

### Summarize
```typescript
const result = await aiService.summarize({
  text: 'long document...',
  language: 'en',
  maxLength: 200,
});
```

### Translate
```typescript
const result = await aiService.translate({
  text: 'The parties agree...',
  sourceLanguage: 'en',
  targetLanguage: 'ar',
  preserveLegalTerms: true,
});
```

### OCR
```typescript
const result = await aiService.extractFromImage({
  imageData: 'base64...',
  documentType: 'emirates_id',
});
const data = parseJSONFromResponse(result.content);
```

## Endpoints

| Endpoint | Method | Model | Use Case |
|----------|--------|-------|----------|
| `/api/ai/generate` | POST | Sonnet 4 | Legal documents |
| `/api/ai/negotiate/analyze` | POST | Sonnet 4 | Contract analysis |
| `/api/ai/negotiate/chat` | POST | Haiku 3.5 | Chat responses |
| `/api/ai/ocr/extract` | POST | Sonnet 4 | Image extraction |
| `/api/ai/summarize` | POST | Haiku 3.5 | Summaries |
| `/api/ai/translate` | POST | Sonnet 4 | Translation |

## Model Costs

| Model | Input (1K) | Output (1K) |
|-------|-----------|-------------|
| Sonnet 4 | $3.00 | $15.00 |
| Haiku 3.5 | $1.00 | $5.00 |

## Token Estimation

```typescript
const tokens = estimateTokens(text);
const cost = estimateCost(inputTokens, outputTokens, model);
```

## Error Handling

```typescript
try {
  const result = await aiService.chat([...]);
} catch (error) {
  if (error.message.includes('rate limit')) {
    return c.json(Errors.rateLimited().toJSON(), 429);
  }
  return c.json(Errors.internal('AI failed').toJSON(), 500);
}
```

## Track Usage

```typescript
await trackAIUsage(c.env.DB, {
  userId,
  operation: 'generate_document',
  model: 'anthropic/claude-sonnet-4',
  inputTokens,
  outputTokens,
  cost,
  success: true,
});
```

## Streaming

```typescript
if (body.stream) {
  return stream(c, async (streamWriter) => {
    const stream = await aiService.chatStream([...], {
      onChunk: (chunk) => {
        // Process chunk
      },
    });
  });
}
```

## Country Codes

- `ae` - UAE
- `sa` - Saudi Arabia
- `qa` - Qatar
- `kw` - Kuwait
- `bh` - Bahrain
- `om` - Oman

## Document Types (OCR)

- `emirates_id`
- `passport`
- `trade_license`
- `visa`
- `contract`
- `other`

## Retry Config

Default:
- Max retries: 3
- Initial delay: 1000ms
- Max delay: 10000ms
- Backoff: 2x

## Best Practices

✅ Use Haiku for simple tasks
✅ Use Sonnet for complex legal work
✅ Track all usage in database
✅ Parse JSON with helper function
✅ Handle errors specifically
✅ Limit conversation history to 10
✅ Estimate costs before calling
✅ Use streaming for chat UIs

❌ Don't use Sonnet for simple queries
❌ Don't skip error handling
❌ Don't ignore token limits
❌ Don't send full contract in every message
