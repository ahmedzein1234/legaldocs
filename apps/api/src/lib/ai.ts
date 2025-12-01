/**
 * AI Service Library for LegalDocs
 * Wraps OpenRouter API calls with retry logic, streaming support,
 * and specialized prompts for UAE/GCC legal documents
 */

import { countryConfigs, type CountryCode } from '../routes/templates.js';

// ============================================
// TYPES
// ============================================

export type AIModel =
  | 'anthropic/claude-sonnet-4'
  | 'anthropic/claude-3.5-haiku';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; [key: string]: unknown }>;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface AIServiceConfig {
  apiKey: string;
  defaultModel?: AIModel;
  retryConfig?: Partial<RetryConfig>;
  referer?: string;
  appTitle?: string;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Model configurations
const MODEL_CONFIGS = {
  'anthropic/claude-sonnet-4': {
    maxTokens: 8000,
    costPer1kInput: 3.0,
    costPer1kOutput: 15.0,
    bestFor: ['complex legal documents', 'detailed analysis', 'multi-language generation'],
  },
  'anthropic/claude-3.5-haiku': {
    maxTokens: 8000,
    costPer1kInput: 1.0,
    costPer1kOutput: 5.0,
    bestFor: ['simple queries', 'quick analysis', 'chat responses'],
  },
} as const;

// ============================================
// AI SERVICE CLASS
// ============================================

export class AIService {
  private config: AIServiceConfig;
  private retryConfig: RetryConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config.retryConfig,
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay
   */
  private getRetryDelay(attempt: number): number {
    const delay = this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(error: unknown, statusCode?: number): boolean {
    if (statusCode) {
      // Retry on server errors and rate limits
      return statusCode >= 500 || statusCode === 429;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('timeout') ||
             message.includes('network') ||
             message.includes('fetch');
    }

    return false;
  }

  /**
   * Make API call with retry logic
   */
  private async callWithRetry<T>(
    fn: () => Promise<T>,
    attempt = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const shouldRetry = attempt < this.retryConfig.maxRetries &&
                          this.isRetryableError(error);

      if (shouldRetry) {
        const delay = this.getRetryDelay(attempt);
        await this.sleep(delay);
        return this.callWithRetry(fn, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Make a non-streaming API call
   */
  async chat(
    messages: AIMessage[],
    options: {
      model?: AIModel;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<AIResponse> {
    const model = options.model || this.config.defaultModel || 'anthropic/claude-sonnet-4';
    const maxTokens = options.maxTokens || MODEL_CONFIGS[model].maxTokens;

    return this.callWithRetry(async () => {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': this.config.referer || 'https://www.qannoni.com',
          'X-Title': this.config.appTitle || 'LegalDocs',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature: options.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(
          errorData.error?.message || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
        usage?: {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
        };
        model?: string;
        error?: { message: string };
      };

      if (data.error) {
        throw new Error(data.error.message);
      }

      return {
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model,
      };
    });
  }

  /**
   * Make a streaming API call
   */
  async chatStream(
    messages: AIMessage[],
    options: {
      model?: AIModel;
      maxTokens?: number;
      temperature?: number;
      onChunk?: (chunk: AIStreamChunk) => void;
    } = {}
  ): Promise<ReadableStream<Uint8Array>> {
    const model = options.model || this.config.defaultModel || 'anthropic/claude-sonnet-4';
    const maxTokens = options.maxTokens || MODEL_CONFIGS[model].maxTokens;

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': this.config.referer || 'https://www.qannoni.com',
        'X-Title': this.config.appTitle || 'LegalDocs',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: options.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(
        errorData.error?.message || `API request failed with status ${response.status}`
      );
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Create a transform stream to process SSE events
    const transformStream = new TransformStream({
      transform: (chunk, controller) => {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n').filter(line => line.trim().startsWith('data: '));

        for (const line of lines) {
          const data = line.replace(/^data: /, '').trim();

          if (data === '[DONE]') {
            if (options.onChunk) {
              options.onChunk({ content: '', done: true });
            }
            continue;
          }

          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
              usage?: {
                prompt_tokens: number;
                completion_tokens: number;
                total_tokens: number;
              };
            };

            const content = parsed.choices?.[0]?.delta?.content || '';

            if (content || parsed.usage) {
              if (options.onChunk) {
                options.onChunk({
                  content,
                  done: false,
                  usage: parsed.usage,
                });
              }
            }
          } catch (e) {
            // Skip invalid JSON chunks
            console.warn('Failed to parse SSE chunk:', e);
          }
        }

        controller.enqueue(chunk);
      },
    });

    return response.body.pipeThrough(transformStream);
  }

  /**
   * Generate a legal document
   */
  async generate(params: {
    templateType: string;
    country: CountryCode;
    jurisdiction?: string;
    languages: string[];
    bindingLanguage: string;
    parties: unknown[];
    documentDetails: Record<string, unknown>;
  }): Promise<AIResponse> {
    const config = countryConfigs[params.country];

    const systemPrompt = this.buildDocumentPrompt(
      params.templateType,
      params.country,
      params.jurisdiction,
      params.languages,
      params.bindingLanguage
    );

    const userContent = `Generate a ${params.templateType} document with these details:

PARTIES:
${JSON.stringify(params.parties, null, 2)}

DOCUMENT DETAILS:
${JSON.stringify(params.documentDetails, null, 2)}

REQUIREMENTS:
- Languages: ${params.languages.join(', ')}
- Binding language: ${params.bindingLanguage}
- Country: ${config.name}
${params.jurisdiction ? `- Jurisdiction: ${params.jurisdiction}` : ''}

Return the document in the following JSON structure:
{
  "en": {
    "title": "Document Title",
    "parties": "Party section with full details",
    "recitals": "WHEREAS clauses explaining the background",
    "clauses": [
      {
        "number": "1",
        "title": "Clause Title",
        "content": "Detailed clause content",
        "subclauses": ["1.1 Subclause content"]
      }
    ],
    "signatures": "Signature block with party details"
  },
  "ar": {
    "title": "عنوان الوثيقة",
    "parties": "قسم الأطراف بالتفاصيل الكاملة",
    "recitals": "حيث أن... شروط توضيحية",
    "clauses": [
      {
        "number": "١",
        "title": "عنوان البند",
        "content": "محتوى البند المفصل",
        "subclauses": ["١-١ محتوى البند الفرعي"]
      }
    ],
    "signatures": "كتلة التوقيع مع تفاصيل الأطراف"
  }
}`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];

    return this.chat(messages, {
      model: 'anthropic/claude-sonnet-4', // Use Sonnet for complex document generation
      maxTokens: 8000,
    });
  }

  /**
   * Analyze a contract for negotiation
   */
  async analyze(params: {
    contractText: string;
    position: string;
    country: CountryCode;
    language?: string;
  }): Promise<AIResponse> {
    const systemPrompt = this.buildAnalysisPrompt(params.country, params.position);

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this contract and provide a comprehensive risk assessment:\n\n${params.contractText}` },
    ];

    return this.chat(messages, {
      model: 'anthropic/claude-sonnet-4', // Use Sonnet for detailed analysis
      maxTokens: 8000,
    });
  }

  /**
   * Summarize a document
   */
  async summarize(params: {
    text: string;
    language?: string;
    maxLength?: number;
  }): Promise<AIResponse> {
    const systemPrompt = `You are a legal document summarization expert.
Provide clear, concise summaries that capture the essential points while maintaining legal accuracy.
${params.language ? `Output language: ${params.language}` : ''}
${params.maxLength ? `Maximum length: approximately ${params.maxLength} words` : ''}`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Summarize this document:\n\n${params.text}` },
    ];

    return this.chat(messages, {
      model: 'anthropic/claude-3.5-haiku', // Use Haiku for quick summaries
      maxTokens: 2000,
    });
  }

  /**
   * Translate legal text
   */
  async translate(params: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
    preserveLegalTerms?: boolean;
  }): Promise<AIResponse> {
    const systemPrompt = `You are a professional legal translator specializing in UAE/GCC legal documents.
${params.preserveLegalTerms ? 'Preserve technical legal terms and provide transliterations where appropriate.' : ''}

Source language: ${params.sourceLanguage}
Target language: ${params.targetLanguage}

Maintain legal accuracy and formality in the translation.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Translate this legal text:\n\n${params.text}` },
    ];

    return this.chat(messages, {
      model: 'anthropic/claude-sonnet-4', // Use Sonnet for accurate legal translation
      maxTokens: 6000,
    });
  }

  /**
   * Extract data from document images (OCR)
   */
  async extractFromImage(params: {
    imageData: string;
    documentType: string;
    expectedFields?: string[];
  }): Promise<AIResponse> {
    const systemPrompt = this.buildOCRPrompt(params.documentType, params.expectedFields);

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: params.imageData,
            },
          },
          {
            type: 'text',
            text: 'Extract all information from this document as specified. Return valid JSON only.',
          },
        ],
      },
    ];

    return this.chat(messages, {
      model: 'anthropic/claude-sonnet-4', // Use Sonnet for accurate OCR
      maxTokens: 4000,
    });
  }

  /**
   * Chat assistant for legal queries
   */
  async chatAssistant(params: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    context?: {
      contractText?: string;
      position?: string;
      country?: CountryCode;
    };
  }): Promise<AIResponse> {
    let systemPrompt = `You are a knowledgeable legal assistant specializing in UAE/GCC law.
Provide practical, actionable advice while being clear about when users should consult a licensed attorney.
Use bullet points for clarity. Reference specific laws when relevant.`;

    if (params.context?.country) {
      const config = countryConfigs[params.context.country];
      systemPrompt += `\n\nJurisdiction: ${config.name}`;
      systemPrompt += `\nKey compliance areas: ${config.complianceNotes.join('; ')}`;
    }

    if (params.context?.contractText) {
      systemPrompt += `\n\nCONTRACT CONTEXT:\n${params.context.contractText.substring(0, 2000)}...`;
    }

    if (params.context?.position) {
      systemPrompt += `\n\nUSER'S POSITION: ${params.context.position}`;
    }

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(params.history?.slice(-10) || []).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: params.message },
    ];

    return this.chat(messages, {
      model: 'anthropic/claude-3.5-haiku', // Use Haiku for quick chat responses
      maxTokens: 2000,
    });
  }

  // ============================================
  // PROMPT BUILDERS
  // ============================================

  private buildDocumentPrompt(
    templateType: string,
    country: CountryCode,
    jurisdiction: string | undefined,
    languages: string[],
    bindingLanguage: string
  ): string {
    const config = countryConfigs[country];

    return `You are an expert legal document generator specializing in ${config.name} law.
You have extensive knowledge of ${config.name} legal standards, regulations, and best practices.

TASK: Generate a professional ${templateType} document that complies with ${config.name} legal requirements.

KEY REQUIREMENTS:
1. Legal Compliance:
   - Follow ${config.name} legal standards and formatting conventions
   - Ensure compliance with: ${config.complianceNotes.join('; ')}
   - ${config.languageRequired === 'ar' ? 'Arabic text MUST be legally binding' : 'Follow language requirements as specified'}
   ${jurisdiction ? `- Apply ${jurisdiction}-specific regulations and requirements` : ''}

2. Language Requirements:
   - Generate content in: ${languages.join(', ')}
   - Binding language: ${bindingLanguage}
   - Ensure accurate legal terminology in all languages
   - Arabic text must use proper legal Arabic (فصحى قانونية)

3. Document Structure:
   - Professional legal formatting with proper clause numbering
   - Clear party identification with all required details
   - Comprehensive recitals (WHEREAS clauses) explaining context
   - Well-structured clauses with logical flow
   - Proper signature blocks with witness requirements

4. Content Quality:
   - Use precise legal language appropriate for ${config.name}
   - Include all standard protective clauses
   - Address jurisdiction, dispute resolution, and governing law
   - Ensure all monetary amounts, dates, and terms are clearly specified
   - Add appropriate disclaimers and notices

5. Cultural & Regional Considerations:
   - Respect ${config.name} cultural norms and business practices
   - Use appropriate honorifics and formal address
   - Consider local customs in contract structuring
   - Ensure Sharia compliance where required

CRITICAL: Return ONLY valid JSON with no additional text or markdown.`;
  }

  private buildAnalysisPrompt(country: CountryCode, position: string): string {
    const config = countryConfigs[country];

    return `You are an expert contract analyst specializing in ${config.name} law.
Analyze contracts from the perspective of the specified party, identifying risks and opportunities.

ANALYSIS FRAMEWORK:

1. Clause-by-Clause Review:
   - Identify each significant clause
   - Categorize by type (payment, termination, liability, etc.)
   - Assess risk level for the ${position}
   - Provide specific concerns and recommendations

2. Risk Assessment:
   - Rate overall contract risk (0-100 score)
   - Identify top 3-5 critical risks
   - Flag missing essential clauses
   - Compare terms to market standards in ${config.name}

3. Legal Compliance:
   - Check compliance with: ${config.complianceNotes.join('; ')}
   - Identify potential regulatory issues
   - Note any terms that may be unenforceable
   - Highlight jurisdiction and governing law implications

4. Commercial Terms:
   - Evaluate payment terms fairness
   - Assess liability caps and indemnities
   - Review termination rights and notice periods
   - Analyze renewal and variation clauses

5. Recommendations:
   - Suggest specific clause modifications
   - Propose additional protective clauses
   - Recommend negotiation priorities
   - Flag dealbreakers vs. negotiable points

Return analysis as structured JSON with clear categorization and actionable insights.
Focus on practical, commercial advice specific to ${config.name} business environment.`;
  }

  private buildOCRPrompt(documentType: string, expectedFields?: string[]): string {
    const basePrompts: Record<string, string> = {
      emirates_id: `Extract all information from this UAE Emirates ID card:

REQUIRED FIELDS:
- Full Name (English): Full name as shown in English
- Full Name (Arabic): Full name in Arabic script
- ID Number: 15-digit number (format: 784-XXXX-XXXXXXX-X)
- Nationality: Country of citizenship
- Date of Birth: In DD/MM/YYYY format
- Gender: Male/Female
- Card Number: Card serial number
- Expiry Date: Card expiration date

Return as JSON with exact field names: fullName, fullNameAr, idNumber, nationality, dateOfBirth, gender, cardNumber, expiryDate.`,

      passport: `Extract all information from this passport:

REQUIRED FIELDS:
- Full Name: As shown on passport
- Passport Number: Passport identification number
- Nationality: Issuing country
- Date of Birth: In DD/MM/YYYY format
- Gender: M/F
- Place of Birth: City/Country of birth
- Issue Date: Date passport was issued
- Expiry Date: Passport expiration date
- MRZ: Machine-readable zone (2-3 lines at bottom)

Return as JSON with fields: fullName, passportNumber, nationality, dateOfBirth, gender, placeOfBirth, issueDate, expiryDate, mrz.`,

      trade_license: `Extract all information from this UAE Trade License:

REQUIRED FIELDS:
- License Number: Official license number
- Company Name (English): Legal company name in English
- Company Name (Arabic): Legal company name in Arabic
- Legal Form: LLC, FZE, FZCO, etc.
- Activities: List of licensed business activities
- Issue Date: License issue date
- Expiry Date: License expiration date
- Issuing Authority: DED, Free Zone Authority, etc.
- Owner/Partners: Names of owners or partners
- Registered Address: Official company address

Return as JSON with fields: licenseNumber, companyName, companyNameAr, legalForm, activities (array), issueDate, expiryDate, issuingAuthority, owners (array), registeredAddress.`,

      visa: `Extract all information from this UAE Visa:

REQUIRED FIELDS:
- Visa Type: Employment, Residence, Visit, etc.
- Visa Number: Official visa number
- Full Name: Visa holder's name
- Passport Number: Associated passport number
- Nationality: Visa holder's nationality
- Profession: Job title or profession
- Sponsor Name: Sponsoring company or individual
- Sponsor Number: Sponsor's license/ID number
- Issue Date: Visa issue date
- Expiry Date: Visa expiration date
- UID Number: Unique identification number

Return as JSON.`,

      contract: `Extract and structure key information from this contract:

REQUIRED INFORMATION:
- Document Type: Contract category (lease, employment, service, etc.)
- Parties: All contracting parties with roles
- Effective Date: Contract start date
- Expiry Date: Contract end date (if applicable)
- Key Terms: Major obligations and rights
- Financial Terms: Amounts, payment schedules, currencies
- Termination: Notice periods and conditions
- Governing Law: Jurisdiction and applicable law
- Signatures: Signature status and dates

Return as structured JSON with clear categorization.`,

      other: `Extract all visible text and structure from this document.

Identify and extract:
- Document Type: Best guess at document category
- Dates: All dates found in the document
- Names: Individuals and entities mentioned
- Numbers: Reference numbers, amounts, IDs
- Key Information: Any significant data points
- Language: Primary language(s) used

Organize extracted information logically in JSON format.`,
    };

    let prompt = basePrompts[documentType] || basePrompts.other;

    if (expectedFields && expectedFields.length > 0) {
      prompt += `\n\nPRIORITY FIELDS: ${expectedFields.join(', ')}`;
    }

    prompt += `\n\nIMPORTANT:
- Extract text exactly as shown
- Preserve Arabic text accurately
- Use standard date formats (DD/MM/YYYY)
- Return ONLY valid JSON with no additional text
- If a field is not visible, use null or omit it
- Double-check all numbers for accuracy`;

    return prompt;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse JSON from AI response (handles markdown code blocks)
 */
export function parseJSONFromResponse(text: string): unknown {
  // Try to find JSON in code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim());
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  // If no JSON found, throw error
  throw new Error('No valid JSON found in response');
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English, ~2 for Arabic
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const otherChars = text.length - arabicChars;

  return Math.ceil((otherChars / 4) + (arabicChars / 2));
}

/**
 * Calculate API cost estimate
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: AIModel
): number {
  const config = MODEL_CONFIGS[model];
  const inputCost = (inputTokens / 1000) * config.costPer1kInput;
  const outputCost = (outputTokens / 1000) * config.costPer1kOutput;

  return inputCost + outputCost;
}

/**
 * Select optimal model based on task complexity
 */
export function selectModel(task: {
  type: 'generate' | 'analyze' | 'summarize' | 'translate' | 'chat' | 'ocr';
  complexity?: 'simple' | 'complex';
  estimatedOutputTokens?: number;
}): AIModel {
  // Use Sonnet for complex tasks
  if (task.complexity === 'complex' ||
      task.type === 'generate' ||
      task.type === 'analyze' ||
      task.type === 'translate' ||
      task.type === 'ocr') {
    return 'anthropic/claude-sonnet-4';
  }

  // Use Haiku for simple tasks
  if (task.type === 'chat' || task.type === 'summarize') {
    return 'anthropic/claude-3.5-haiku';
  }

  // Default to Haiku for cost efficiency
  return 'anthropic/claude-3.5-haiku';
}

/**
 * Create AI service instance
 */
export function createAIService(config: AIServiceConfig): AIService {
  return new AIService(config);
}
