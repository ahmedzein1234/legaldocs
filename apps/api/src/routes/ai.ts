import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { stream } from 'hono/streaming';
import { authMiddleware, rateLimiters } from '../middleware/index.js';
import { Errors } from '../lib/errors.js';
import { countryConfigs, type CountryCode } from './templates.js';
import {
  createAIService,
  parseJSONFromResponse,
  estimateTokens,
  estimateCost,
  selectModel,
  type AIModel,
} from '../lib/ai.js';

// Types for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  OPENROUTER_API_KEY: string;
};

type Variables = {
  userId: string;
  userRole: string;
};

const ai = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const generateDocumentSchema = z.object({
  templateType: z.string(),
  parties: z.array(z.object({
    role: z.string(),
    name: z.string(),
    nameAr: z.string().optional(),
    entityType: z.enum(['individual', 'company']),
    emiratesId: z.string().optional(),
    tradeLicense: z.string().optional(),
    address: z.string().optional(),
    nationality: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  })),
  documentDetails: z.record(z.unknown()),
  languages: z.array(z.enum(['en', 'ar', 'ur'])).default(['en', 'ar']),
  bindingLanguage: z.enum(['en', 'ar']).default('ar'),
  country: z.enum(['ae', 'sa', 'qa', 'kw', 'bh', 'om']).default('ae'),
  jurisdiction: z.string().optional(),
});

const negotiationAnalyzeSchema = z.object({
  contractText: z.string().min(50),
  position: z.enum([
    'buyer', 'seller', 'landlord', 'tenant',
    'employer', 'employee', 'service_provider', 'client', 'neutral'
  ]),
  language: z.string().default('en'),
  country: z.enum(['ae', 'sa', 'qa', 'kw', 'bh', 'om']).default('ae'),
});

const negotiationChatSchema = z.object({
  message: z.string().min(1),
  contractText: z.string().optional(),
  position: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
  stream: z.boolean().optional().default(false),
});

const ocrExtractSchema = z.object({
  imageData: z.string(), // Base64 encoded image
  documentType: z.enum(['emirates_id', 'passport', 'trade_license', 'visa', 'contract', 'other']),
  language: z.string().default('en'),
  expectedFields: z.array(z.string()).optional(),
});

const summarizeSchema = z.object({
  text: z.string().min(50),
  language: z.string().optional().default('en'),
  maxLength: z.number().optional(),
});

const translateSchema = z.object({
  text: z.string().min(1),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  preserveLegalTerms: z.boolean().optional().default(true),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Track AI usage in database
 */
async function trackAIUsage(
  db: D1Database,
  params: {
    userId: string;
    operation: string;
    model: AIModel;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    success: boolean;
    errorMessage?: string;
  }
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO ai_usage (
          user_id, operation, model, input_tokens, output_tokens,
          total_tokens, estimated_cost, success, error_message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        params.userId,
        params.operation,
        params.model,
        params.inputTokens,
        params.outputTokens,
        params.inputTokens + params.outputTokens,
        params.cost,
        params.success ? 1 : 0,
        params.errorMessage || null,
        new Date().toISOString()
      )
      .run();
  } catch (error) {
    // Don't fail the request if usage tracking fails
    console.error('Failed to track AI usage:', error);
  }
}

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/ai/generate
 * Generate a legal document using AI with enhanced prompts and error handling
 */
ai.post(
  '/generate',
  authMiddleware,
  rateLimiters.aiGeneration,
  zValidator('json', generateDocumentSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const apiKey = c.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return c.json(Errors.internal('AI service not configured').toJSON(), 500);
    }

    const aiService = createAIService({
      apiKey,
      defaultModel: 'anthropic/claude-sonnet-4',
      referer: 'https://www.qannoni.com',
      appTitle: 'LegalDocs Document Generation',
    });

    const startTime = Date.now();
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      // Estimate input tokens for cost tracking
      const estimatedInput = estimateTokens(JSON.stringify(body));
      inputTokens = estimatedInput;

      // Generate document using AI service
      const response = await aiService.generate({
        templateType: body.templateType,
        country: body.country,
        jurisdiction: body.jurisdiction,
        languages: body.languages,
        bindingLanguage: body.bindingLanguage,
        parties: body.parties,
        documentDetails: body.documentDetails,
      });

      // Update token counts from actual usage
      if (response.usage) {
        inputTokens = response.usage.prompt_tokens;
        outputTokens = response.usage.completion_tokens;
      } else {
        outputTokens = estimateTokens(response.content);
      }

      // Parse JSON from response
      const generated = parseJSONFromResponse(response.content);

      // Calculate cost
      const cost = estimateCost(inputTokens, outputTokens, 'anthropic/claude-sonnet-4');

      // Track usage
      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'generate_document',
        model: 'anthropic/claude-sonnet-4',
        inputTokens,
        outputTokens,
        cost,
        success: true,
      });

      return c.json({
        success: true,
        data: {
          generated,
          languages: body.languages,
          metadata: {
            model: response.model || 'anthropic/claude-sonnet-4',
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: inputTokens + outputTokens,
            },
            estimatedCost: cost,
            processingTime: Date.now() - startTime,
          },
        },
      });
    } catch (error) {
      console.error('AI generation error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Track failed usage
      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'generate_document',
        model: 'anthropic/claude-sonnet-4',
        inputTokens,
        outputTokens,
        cost: estimateCost(inputTokens, outputTokens, 'anthropic/claude-sonnet-4'),
        success: false,
        errorMessage,
      });

      // Return appropriate error based on error type
      if (errorMessage.includes('rate limit')) {
        return c.json(Errors.rateLimited().toJSON(), 429);
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('quota')) {
        return c.json(Errors.internal('AI service quota exceeded').toJSON(), 503);
      } else if (errorMessage.includes('timeout')) {
        return c.json(Errors.internal('Request timed out, please try again').toJSON(), 504);
      }

      return c.json(Errors.internal('Failed to generate document').toJSON(), 500);
    }
  }
);

/**
 * POST /api/ai/negotiate/analyze
 * Analyze a contract for negotiation with comprehensive risk assessment
 */
ai.post(
  '/negotiate/analyze',
  authMiddleware,
  rateLimiters.aiGeneration,
  zValidator('json', negotiationAnalyzeSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const apiKey = c.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return c.json(Errors.internal('AI service not configured').toJSON(), 500);
    }

    const aiService = createAIService({
      apiKey,
      defaultModel: 'anthropic/claude-sonnet-4',
      referer: 'https://www.qannoni.com',
      appTitle: 'LegalDocs Negotiation Analysis',
    });

    const startTime = Date.now();
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const estimatedInput = estimateTokens(body.contractText);
      inputTokens = estimatedInput;

      const response = await aiService.analyze({
        contractText: body.contractText,
        position: body.position,
        country: body.country,
        language: body.language,
      });

      if (response.usage) {
        inputTokens = response.usage.prompt_tokens;
        outputTokens = response.usage.completion_tokens;
      } else {
        outputTokens = estimateTokens(response.content);
      }

      const analysis = parseJSONFromResponse(response.content);
      const cost = estimateCost(inputTokens, outputTokens, 'anthropic/claude-sonnet-4');

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'analyze_contract',
        model: 'anthropic/claude-sonnet-4',
        inputTokens,
        outputTokens,
        cost,
        success: true,
      });

      return c.json({
        success: true,
        data: {
          analysis,
          metadata: {
            model: response.model || 'anthropic/claude-sonnet-4',
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: inputTokens + outputTokens,
            },
            estimatedCost: cost,
            processingTime: Date.now() - startTime,
          },
        },
      });
    } catch (error) {
      console.error('Negotiation analysis error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'analyze_contract',
        model: 'anthropic/claude-sonnet-4',
        inputTokens,
        outputTokens,
        cost: estimateCost(inputTokens, outputTokens, 'anthropic/claude-sonnet-4'),
        success: false,
        errorMessage,
      });

      if (errorMessage.includes('rate limit')) {
        return c.json(Errors.rateLimited().toJSON(), 429);
      }

      return c.json(Errors.internal('Analysis failed').toJSON(), 500);
    }
  }
);

/**
 * POST /api/ai/negotiate/chat
 * Chat with AI about contract negotiation (supports streaming)
 */
ai.post(
  '/negotiate/chat',
  authMiddleware,
  rateLimiters.aiGeneration,
  zValidator('json', negotiationChatSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const apiKey = c.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return c.json(Errors.internal('AI service not configured').toJSON(), 500);
    }

    const aiService = createAIService({
      apiKey,
      defaultModel: 'anthropic/claude-3.5-haiku', // Use Haiku for quick chat
      referer: 'https://www.qannoni.com',
      appTitle: 'LegalDocs Chat',
    });

    const startTime = Date.now();
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      // Determine country context from contract text or default to UAE
      const country: CountryCode = 'ae'; // Could be extracted from context

      const estimatedInput = estimateTokens(
        body.message + (body.contractText || '') + (body.history || []).map(h => h.content).join('')
      );
      inputTokens = estimatedInput;

      // Handle streaming response
      if (body.stream) {
        let fullContent = '';

        return stream(c, async (streamWriter) => {
          try {
            const responseStream = await aiService.chatStream(
              [],
              {
                model: 'anthropic/claude-3.5-haiku',
                maxTokens: 2000,
                onChunk: (chunk) => {
                  if (chunk.content) {
                    fullContent += chunk.content;
                  }
                  if (chunk.usage) {
                    inputTokens = chunk.usage.prompt_tokens;
                    outputTokens = chunk.usage.completion_tokens;
                  }
                },
              }
            );

            // Process stream - use chatAssistant for proper context
            const response = await aiService.chatAssistant({
              message: body.message,
              history: body.history as Array<{ role: 'user' | 'assistant'; content: string }> | undefined,
              context: {
                contractText: body.contractText,
                position: body.position,
                country,
              },
            });

            // For streaming, we'll send chunks
            await streamWriter.write(`data: ${JSON.stringify({ content: response.content, done: false })}\n\n`);
            await streamWriter.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);

            // Track usage after stream completes
            const cost = estimateCost(
              inputTokens,
              outputTokens || estimateTokens(response.content),
              'anthropic/claude-3.5-haiku'
            );

            await trackAIUsage(c.env.DB, {
              userId,
              operation: 'chat',
              model: 'anthropic/claude-3.5-haiku',
              inputTokens,
              outputTokens: outputTokens || estimateTokens(response.content),
              cost,
              success: true,
            });
          } catch (error) {
            console.error('Chat stream error:', error);
            await streamWriter.write(
              `data: ${JSON.stringify({ error: 'Stream failed', done: true })}\n\n`
            );
          }
        });
      }

      // Non-streaming response
      const response = await aiService.chatAssistant({
        message: body.message,
        history: body.history as Array<{ role: 'user' | 'assistant'; content: string }> | undefined,
        context: {
          contractText: body.contractText,
          position: body.position,
          country,
        },
      });

      if (response.usage) {
        inputTokens = response.usage.prompt_tokens;
        outputTokens = response.usage.completion_tokens;
      } else {
        outputTokens = estimateTokens(response.content);
      }

      const cost = estimateCost(inputTokens, outputTokens, 'anthropic/claude-3.5-haiku');

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'chat',
        model: 'anthropic/claude-3.5-haiku',
        inputTokens,
        outputTokens,
        cost,
        success: true,
      });

      return c.json({
        success: true,
        data: {
          response: response.content,
          metadata: {
            model: response.model || 'anthropic/claude-3.5-haiku',
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: inputTokens + outputTokens,
            },
            estimatedCost: cost,
            processingTime: Date.now() - startTime,
          },
        },
      });
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'chat',
        model: 'anthropic/claude-3.5-haiku',
        inputTokens,
        outputTokens,
        cost: estimateCost(inputTokens, outputTokens, 'anthropic/claude-3.5-haiku'),
        success: false,
        errorMessage,
      });

      if (errorMessage.includes('rate limit')) {
        return c.json(Errors.rateLimited().toJSON(), 429);
      }

      return c.json(Errors.internal('Chat failed').toJSON(), 500);
    }
  }
);

/**
 * POST /api/ai/ocr/extract
 * Extract text and data from document images with enhanced accuracy
 */
ai.post(
  '/ocr/extract',
  authMiddleware,
  rateLimiters.aiGeneration,
  zValidator('json', ocrExtractSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const apiKey = c.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return c.json(Errors.internal('AI service not configured').toJSON(), 500);
    }

    const aiService = createAIService({
      apiKey,
      defaultModel: 'anthropic/claude-sonnet-4',
      referer: 'https://www.qannoni.com',
      appTitle: 'LegalDocs OCR',
    });

    const startTime = Date.now();
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      // Estimate based on image size (rough approximation)
      inputTokens = Math.ceil(body.imageData.length / 1000);

      const response = await aiService.extractFromImage({
        imageData: body.imageData,
        documentType: body.documentType,
        expectedFields: body.expectedFields,
      });

      if (response.usage) {
        inputTokens = response.usage.prompt_tokens;
        outputTokens = response.usage.completion_tokens;
      } else {
        outputTokens = estimateTokens(response.content);
      }

      const extracted = parseJSONFromResponse(response.content);
      const cost = estimateCost(inputTokens, outputTokens, 'anthropic/claude-sonnet-4');

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'ocr_extract',
        model: 'anthropic/claude-sonnet-4',
        inputTokens,
        outputTokens,
        cost,
        success: true,
      });

      return c.json({
        success: true,
        data: {
          extracted,
          documentType: body.documentType,
          metadata: {
            model: response.model || 'anthropic/claude-sonnet-4',
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: inputTokens + outputTokens,
            },
            estimatedCost: cost,
            processingTime: Date.now() - startTime,
          },
        },
      });
    } catch (error) {
      console.error('OCR extraction error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'ocr_extract',
        model: 'anthropic/claude-sonnet-4',
        inputTokens,
        outputTokens,
        cost: estimateCost(inputTokens, outputTokens, 'anthropic/claude-sonnet-4'),
        success: false,
        errorMessage,
      });

      if (errorMessage.includes('rate limit')) {
        return c.json(Errors.rateLimited().toJSON(), 429);
      }

      return c.json(Errors.internal('OCR extraction failed').toJSON(), 500);
    }
  }
);

/**
 * POST /api/ai/summarize
 * Summarize legal documents
 */
ai.post(
  '/summarize',
  authMiddleware,
  rateLimiters.aiGeneration,
  zValidator('json', summarizeSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const apiKey = c.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return c.json(Errors.internal('AI service not configured').toJSON(), 500);
    }

    const aiService = createAIService({
      apiKey,
      defaultModel: 'anthropic/claude-3.5-haiku',
      referer: 'https://www.qannoni.com',
      appTitle: 'LegalDocs Summarization',
    });

    const startTime = Date.now();
    let inputTokens = estimateTokens(body.text);
    let outputTokens = 0;

    try {
      const response = await aiService.summarize({
        text: body.text,
        language: body.language,
        maxLength: body.maxLength,
      });

      if (response.usage) {
        inputTokens = response.usage.prompt_tokens;
        outputTokens = response.usage.completion_tokens;
      } else {
        outputTokens = estimateTokens(response.content);
      }

      const cost = estimateCost(inputTokens, outputTokens, 'anthropic/claude-3.5-haiku');

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'summarize',
        model: 'anthropic/claude-3.5-haiku',
        inputTokens,
        outputTokens,
        cost,
        success: true,
      });

      return c.json({
        success: true,
        data: {
          summary: response.content,
          metadata: {
            model: response.model || 'anthropic/claude-3.5-haiku',
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: inputTokens + outputTokens,
            },
            estimatedCost: cost,
            processingTime: Date.now() - startTime,
          },
        },
      });
    } catch (error) {
      console.error('Summarization error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'summarize',
        model: 'anthropic/claude-3.5-haiku',
        inputTokens,
        outputTokens,
        cost: estimateCost(inputTokens, outputTokens, 'anthropic/claude-3.5-haiku'),
        success: false,
        errorMessage,
      });

      return c.json(Errors.internal('Summarization failed').toJSON(), 500);
    }
  }
);

/**
 * POST /api/ai/translate
 * Translate legal documents with preservation of legal terminology
 */
ai.post(
  '/translate',
  authMiddleware,
  rateLimiters.aiGeneration,
  zValidator('json', translateSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const apiKey = c.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return c.json(Errors.internal('AI service not configured').toJSON(), 500);
    }

    const aiService = createAIService({
      apiKey,
      defaultModel: 'anthropic/claude-sonnet-4',
      referer: 'https://www.qannoni.com',
      appTitle: 'LegalDocs Translation',
    });

    const startTime = Date.now();
    let inputTokens = estimateTokens(body.text);
    let outputTokens = 0;

    try {
      const response = await aiService.translate({
        text: body.text,
        sourceLanguage: body.sourceLanguage,
        targetLanguage: body.targetLanguage,
        preserveLegalTerms: body.preserveLegalTerms,
      });

      if (response.usage) {
        inputTokens = response.usage.prompt_tokens;
        outputTokens = response.usage.completion_tokens;
      } else {
        outputTokens = estimateTokens(response.content);
      }

      const cost = estimateCost(inputTokens, outputTokens, 'anthropic/claude-sonnet-4');

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'translate',
        model: 'anthropic/claude-sonnet-4',
        inputTokens,
        outputTokens,
        cost,
        success: true,
      });

      return c.json({
        success: true,
        data: {
          translation: response.content,
          sourceLanguage: body.sourceLanguage,
          targetLanguage: body.targetLanguage,
          metadata: {
            model: response.model || 'anthropic/claude-sonnet-4',
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: inputTokens + outputTokens,
            },
            estimatedCost: cost,
            processingTime: Date.now() - startTime,
          },
        },
      });
    } catch (error) {
      console.error('Translation error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await trackAIUsage(c.env.DB, {
        userId,
        operation: 'translate',
        model: 'anthropic/claude-sonnet-4',
        inputTokens,
        outputTokens,
        cost: estimateCost(inputTokens, outputTokens, 'anthropic/claude-sonnet-4'),
        success: false,
        errorMessage,
      });

      return c.json(Errors.internal('Translation failed').toJSON(), 500);
    }
  }
);

export { ai };
