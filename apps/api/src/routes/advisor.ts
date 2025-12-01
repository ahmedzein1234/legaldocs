import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, rateLimiters } from '../middleware/index.js';
import { Errors } from '../lib/errors.js';
import { countryConfigs, type CountryCode } from './templates.js';

// Types for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  OPENROUTER_API_KEY: string;
};

type Variables = {
  userId: string;
  userRole: string;
};

const advisor = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth middleware to all routes
advisor.use('*', authMiddleware);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const consultationSchema = z.object({
  query: z.string().min(10, 'Query must be at least 10 characters'),
  category: z.enum([
    'contract_review',
    'dispute_resolution',
    'employment_law',
    'real_estate',
    'corporate',
    'family_law',
    'intellectual_property',
    'general',
  ]),
  context: z.object({
    documentText: z.string().optional(),
    previousMessages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).optional(),
  }).optional(),
  country: z.enum(['ae', 'sa', 'qa', 'kw', 'bh', 'om']).default('ae'),
  language: z.string().default('en'),
});

const reviewSchema = z.object({
  documentText: z.string().min(100),
  documentType: z.string(),
  reviewType: z.enum(['quick', 'comprehensive', 'compliance']),
  perspective: z.string().optional(),
  country: z.enum(['ae', 'sa', 'qa', 'kw', 'bh', 'om']).default('ae'),
});

const strategySchema = z.object({
  situation: z.string().min(50),
  caseType: z.enum([
    'civil',
    'commercial',
    'labor',
    'real_estate',
    'family',
    'criminal',
    'administrative',
  ]),
  objective: z.string(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  budget: z.enum(['limited', 'moderate', 'flexible']).optional(),
  country: z.enum(['ae', 'sa', 'qa', 'kw', 'bh', 'om']).default('ae'),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildConsultationPrompt(category: string, country: CountryCode): string {
  const config = countryConfigs[country];

  const categoryDescriptions: Record<string, string> = {
    contract_review: 'contract analysis and drafting',
    dispute_resolution: 'dispute resolution and litigation',
    employment_law: 'employment and labor law',
    real_estate: 'real estate and property law',
    corporate: 'corporate and commercial law',
    family_law: 'family law and personal status',
    intellectual_property: 'intellectual property law',
    general: 'general legal matters',
  };

  return `You are a senior legal advisor specializing in ${categoryDescriptions[category]} in ${config.name}.

Your role:
- Provide accurate, practical legal guidance
- Reference specific ${config.name} laws and regulations
- Explain complex legal concepts clearly
- Identify potential risks and opportunities
- Recommend appropriate next steps

Legal framework:
- Country: ${config.name}
- Language requirement: ${config.languageRequired === 'ar' ? 'Arabic mandatory' : 'Arabic/English'}
- E-signature validity: ${config.eSignatureValid ? 'Valid' : 'Limited'}
- Key compliance notes: ${config.complianceNotes.join('; ')}

Important: Always clarify that this is general guidance and recommend consulting with a licensed attorney for specific situations.`;
}

function buildReviewPrompt(
  documentType: string,
  reviewType: string,
  country: CountryCode
): string {
  const config = countryConfigs[country];

  const reviewDepth = {
    quick: 'Focus on key issues and red flags. Be concise.',
    comprehensive: 'Provide detailed analysis of all clauses, risks, and recommendations.',
    compliance: 'Focus specifically on regulatory compliance and legal requirements.',
  };

  return `You are a legal document reviewer specializing in ${config.name} law.

Review this ${documentType} document and provide analysis.

Review type: ${reviewType}
Instructions: ${reviewDepth[reviewType as keyof typeof reviewDepth]}

Consider:
- ${config.name} legal requirements
- Language requirements: ${config.languageRequired}
- Compliance with: ${config.complianceNotes.join('; ')}

Return structured JSON analysis:
{
  "summary": "Brief overview of the document",
  "overallRisk": "low|medium|high|critical",
  "issues": [
    {
      "severity": "low|medium|high|critical",
      "clause": "The problematic clause",
      "issue": "What's wrong",
      "recommendation": "How to fix it",
      "legalBasis": "Relevant law or regulation"
    }
  ],
  "missingClauses": [
    {
      "clause": "What's missing",
      "importance": "essential|recommended|optional",
      "reason": "Why it matters"
    }
  ],
  "complianceStatus": {
    "compliant": true|false,
    "issues": ["List of compliance issues"]
  },
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "What to do",
      "reason": "Why"
    }
  ]
}`;
}

function buildStrategyPrompt(caseType: string, country: CountryCode): string {
  const config = countryConfigs[country];

  return `You are a senior litigation strategist specializing in ${config.name} law.

Analyze the situation and develop a legal strategy.

Case type: ${caseType}
Jurisdiction: ${config.name}
Legal system considerations: ${config.complianceNotes.join('; ')}

Provide strategy in JSON format:
{
  "caseAssessment": {
    "strengths": ["List of strong points"],
    "weaknesses": ["List of vulnerabilities"],
    "opportunities": ["Potential advantages"],
    "threats": ["Potential risks"],
    "winProbability": "low|medium|high",
    "estimatedDuration": "X-Y months"
  },
  "recommendedApproach": {
    "primary": "Main strategy",
    "alternatives": ["Alternative approaches"],
    "reasoning": "Why this approach"
  },
  "arguments": [
    {
      "title": "Argument title",
      "summary": "Brief summary",
      "legalBasis": ["Relevant laws"],
      "strength": "weak|moderate|strong",
      "anticipatedCounter": "What opponent might say",
      "rebuttal": "How to respond"
    }
  ],
  "timeline": {
    "keyDates": [
      {"date": "When", "event": "What happens", "importance": "critical|important|normal"}
    ]
  },
  "nextSteps": [
    {"step": "Action", "deadline": "When", "responsible": "Who"}
  ],
  "estimatedCosts": {
    "legal": "X-Y range",
    "court": "X-Y range",
    "total": "X-Y range",
    "currency": "${config.currency}"
  }
}`;
}

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/advisor/consult
 * General legal consultation
 */
advisor.post('/consult', rateLimiters.aiGeneration, zValidator('json', consultationSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const apiKey = c.env.OPENROUTER_API_KEY;
  const cache = c.env.CACHE;

  if (!apiKey) {
    return c.json(Errors.internal('AI service not configured').toJSON(), 500);
  }

  const systemPrompt = buildConsultationPrompt(body.category, body.country);

  const messages: Array<{role: string; content: string}> = [
    { role: 'system', content: systemPrompt },
  ];

  // Add context/history if provided
  if (body.context?.previousMessages) {
    messages.push(...body.context.previousMessages.slice(-10));
  }

  // Add document context if provided
  let userMessage = body.query;
  if (body.context?.documentText) {
    userMessage = `Context document:\n${body.context.documentText.substring(0, 3000)}\n\nQuestion: ${body.query}`;
  }

  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.qannoni.com',
        'X-Title': 'LegalDocs Advisor',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        max_tokens: 4000,
        messages,
      }),
    });

    const result = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      error?: { message: string };
    };

    if (result.error) {
      return c.json(Errors.internal('Consultation failed').toJSON(), 500);
    }

    const advice = result.choices[0].message.content;

    // Store session for continuity
    const sessionId = crypto.randomUUID();
    await cache.put(`advisor:${sessionId}`, JSON.stringify({
      userId,
      category: body.category,
      messages: [...messages, { role: 'assistant', content: advice }],
      createdAt: new Date().toISOString(),
    }), { expirationTtl: 60 * 60 * 24 }); // 24 hours

    return c.json({
      success: true,
      data: {
        sessionId,
        advice,
        category: body.category,
        country: body.country,
        disclaimer: 'This is general legal guidance. Please consult a licensed attorney for specific legal advice.',
      },
    });
  } catch (error) {
    console.error('Consultation error:', error);
    return c.json(Errors.internal('Consultation failed').toJSON(), 500);
  }
});

/**
 * POST /api/advisor/review
 * Document review
 */
advisor.post('/review', rateLimiters.aiGeneration, zValidator('json', reviewSchema), async (c) => {
  const body = c.req.valid('json');
  const apiKey = c.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return c.json(Errors.internal('AI service not configured').toJSON(), 500);
  }

  const systemPrompt = buildReviewPrompt(body.documentType, body.reviewType, body.country);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.qannoni.com',
        'X-Title': 'LegalDocs Review',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        max_tokens: 8000,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Please review this document:\n\n${body.documentText}${body.perspective ? `\n\nReview from the perspective of: ${body.perspective}` : ''}`,
          },
        ],
      }),
    });

    const result = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      error?: { message: string };
    };

    if (result.error) {
      return c.json(Errors.internal('Review failed').toJSON(), 500);
    }

    const content = result.choices[0].message.content;

    // Parse JSON from response
    let review;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        review = JSON.parse(jsonMatch[0]);
      } else {
        review = { rawReview: content };
      }
    } catch {
      review = { rawReview: content };
    }

    return c.json({
      success: true,
      data: {
        review,
        documentType: body.documentType,
        reviewType: body.reviewType,
        country: body.country,
      },
    });
  } catch (error) {
    console.error('Review error:', error);
    return c.json(Errors.internal('Review failed').toJSON(), 500);
  }
});

/**
 * POST /api/advisor/strategy
 * Legal strategy development
 */
advisor.post('/strategy', rateLimiters.aiGeneration, zValidator('json', strategySchema), async (c) => {
  const body = c.req.valid('json');
  const apiKey = c.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return c.json(Errors.internal('AI service not configured').toJSON(), 500);
  }

  const systemPrompt = buildStrategyPrompt(body.caseType, body.country);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.qannoni.com',
        'X-Title': 'LegalDocs Strategy',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        max_tokens: 8000,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Situation:\n${body.situation}\n\nObjective: ${body.objective}\n\nUrgency: ${body.urgency}${body.budget ? `\nBudget: ${body.budget}` : ''}\n\nPlease develop a comprehensive legal strategy.`,
          },
        ],
      }),
    });

    const result = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      error?: { message: string };
    };

    if (result.error) {
      return c.json(Errors.internal('Strategy development failed').toJSON(), 500);
    }

    const content = result.choices[0].message.content;

    // Parse JSON from response
    let strategy;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        strategy = JSON.parse(jsonMatch[0]);
      } else {
        strategy = { rawStrategy: content };
      }
    } catch {
      strategy = { rawStrategy: content };
    }

    return c.json({
      success: true,
      data: {
        strategy,
        caseType: body.caseType,
        country: body.country,
        disclaimer: 'This strategy is for informational purposes only. Please consult a licensed attorney.',
      },
    });
  } catch (error) {
    console.error('Strategy error:', error);
    return c.json(Errors.internal('Strategy development failed').toJSON(), 500);
  }
});

/**
 * GET /api/advisor/session/:sessionId
 * Get a previous consultation session
 */
advisor.get('/session/:sessionId', async (c) => {
  const userId = c.get('userId');
  const { sessionId } = c.req.param();
  const cache = c.env.CACHE;

  const cached = await cache.get(`advisor:${sessionId}`);
  if (!cached) {
    return c.json(Errors.notFound('Session').toJSON(), 404);
  }

  const session = JSON.parse(cached);
  if (session.userId !== userId) {
    return c.json(Errors.forbidden().toJSON(), 403);
  }

  return c.json({ success: true, data: session });
});

/**
 * GET /api/advisor/sessions
 * List user's consultation sessions
 */
advisor.get('/sessions', async (c) => {
  // Note: KV doesn't support listing efficiently
  // In production, store session metadata in D1
  return c.json({
    success: true,
    data: {
      sessions: [],
      message: 'Session listing requires database storage',
    },
  });
});

export { advisor };
