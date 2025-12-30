/**
 * Logo Generator Route
 * Generates logo using OpenRouter's Gemini image model
 */

import { Hono } from 'hono';
import { authMiddleware, adminOnly } from '../middleware/index.js';

type Bindings = {
  OPENROUTER_API_KEY: string;
  STORAGE: R2Bucket;
};

type Variables = {
  userId: string;
  userRole: string;
};

const logoGenerator = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Admin-only route to generate logo
logoGenerator.post('/generate', authMiddleware, adminOnly, async (c) => {
  const apiKey = c.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return c.json({ success: false, error: 'OpenRouter API key not configured' }, 500);
  }

  const logoPrompt = `Create a professional, modern logo for "Qannoni" - an AI-powered legal document platform for UAE and GCC region.

Design requirements:
- Clean, minimalist design suitable for a legal tech company
- Professional and trustworthy feel
- Should work well on both light and dark backgrounds
- Should include the word "Qannoni" in a clean modern font
- Incorporate a subtle legal/document icon element (like scales of justice, document, shield, or pen)
- Color scheme: Deep blue (#1e3a5f) as primary color with gold/amber (#d4af37) as accent
- The design should convey: trust, innovation, professionalism, and Arabic/Middle Eastern cultural connection
- "Qannoni" (قانوني) means "legal" in Arabic - consider subtle Arabic design influences
- Square format (1:1 aspect ratio) suitable for app icon and favicon
- Simple enough to be recognizable at small sizes

Style: Modern, flat design, tech-forward, professional legal services branding`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.qannoni.com',
        'X-Title': 'Qannoni Logo Generator',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        modalities: ['text', 'image'],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: logoPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return c.json({
        success: false,
        error: `API request failed: ${response.status}`,
        details: errorText
      }, 500);
    }

    const data = await response.json() as {
      choices?: Array<{
        message: {
          content: string | Array<{ type: string; image_url?: { url: string }; data?: string }>;
          images?: string[];
        };
      }>;
      error?: { message: string };
    };

    if (data.error) {
      return c.json({ success: false, error: data.error.message }, 500);
    }

    const message = data.choices?.[0]?.message;
    if (!message) {
      return c.json({
        success: false,
        error: 'No message in response',
        response: data
      }, 500);
    }

    // Extract image from response
    let imageData: string | null = null;

    // Check message.images array
    if (message.images && message.images.length > 0) {
      imageData = message.images[0];
    }

    // Check multipart content
    if (!imageData && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image' || part.type === 'image_url') {
          imageData = part.image_url?.url || part.data || null;
          break;
        }
      }
    }

    // Check if content is data URL
    if (!imageData && typeof message.content === 'string' && message.content.startsWith('data:image')) {
      imageData = message.content;
    }

    if (!imageData) {
      return c.json({
        success: false,
        error: 'No image in response',
        messageContent: message.content,
        messageImages: message.images
      }, 500);
    }

    // Extract base64 data
    let base64Data = imageData;
    let mimeType = 'image/png';

    if (imageData.startsWith('data:image')) {
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    // Store in R2
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const filename = `logos/qannoni-logo-${Date.now()}.png`;

    await c.env.STORAGE.put(filename, imageBuffer, {
      httpMetadata: {
        contentType: mimeType,
      },
    });

    return c.json({
      success: true,
      data: {
        filename,
        size: imageBuffer.length,
        mimeType,
        // Return the base64 data URL for immediate use
        dataUrl: `data:${mimeType};base64,${base64Data}`,
      },
    });
  } catch (error) {
    console.error('Logo generation error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get latest generated logo
logoGenerator.get('/latest', async (c) => {
  try {
    const list = await c.env.STORAGE.list({ prefix: 'logos/' });

    if (list.objects.length === 0) {
      return c.json({ success: false, error: 'No logos found' }, 404);
    }

    // Get the most recent logo
    const latestLogo = list.objects.sort((a, b) =>
      (b.uploaded?.getTime() || 0) - (a.uploaded?.getTime() || 0)
    )[0];

    const logo = await c.env.STORAGE.get(latestLogo.key);
    if (!logo) {
      return c.json({ success: false, error: 'Logo not found' }, 404);
    }

    const contentType = logo.httpMetadata?.contentType || 'image/png';

    return new Response(logo.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error fetching logo:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { logoGenerator };
