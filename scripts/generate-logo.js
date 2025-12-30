/**
 * Logo Generator Script for Qannoni
 * Uses OpenRouter's Gemini 2.5 Flash Image Preview model
 *
 * Usage: node generate-logo.js <OPENROUTER_API_KEY>
 */

const fs = require('fs');
const path = require('path');

const OPENROUTER_API_KEY = process.argv[2];

if (!OPENROUTER_API_KEY) {
  console.error('Usage: node generate-logo.js <OPENROUTER_API_KEY>');
  process.exit(1);
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

Style: Modern, flat design, tech-forward, professional legal services branding
`;

async function generateLogo() {
  console.log('🎨 Generating Qannoni logo using OpenRouter AI...\n');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.qannoni.com',
        'X-Title': 'Qannoni Logo Generator',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
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
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Response received from OpenRouter\n');

    // Debug: Log the full response structure
    console.log('📋 Response structure:');
    console.log(JSON.stringify(data, null, 2).substring(0, 2000));
    console.log('\n');

    // Extract image from response
    const message = data.choices?.[0]?.message;

    if (!message) {
      console.error('No message in response');
      throw new Error('No message in API response');
    }

    // Check for images in the response - multiple possible formats
    let imageData = null;
    let mimeType = 'image/png';

    // Format 1: message.images array (could be objects or strings)
    if (message.images && Array.isArray(message.images) && message.images.length > 0) {
      const img = message.images[0];
      if (typeof img === 'string') {
        imageData = img;
      } else if (typeof img === 'object') {
        // Handle nested image_url structure: {type: 'image_url', image_url: {url: 'data:...'}}
        if (img.image_url) {
          imageData = typeof img.image_url === 'string' ? img.image_url : img.image_url.url;
        } else {
          imageData = img.url || img.data || img.b64_json || img.base64;
        }
      }
      console.log('Found image in message.images, extracted:', imageData ? 'yes' : 'no');
    }

    // Format 2: multipart content array
    if (!imageData && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image' || part.type === 'image_url') {
          if (part.image_url) {
            imageData = part.image_url.url || part.image_url;
          } else {
            imageData = part.data || part.url || part.b64_json || part.base64;
          }
          if (part.media_type) mimeType = part.media_type;
          console.log('Found image in content array, type:', part.type);
          break;
        }
        // Check for inline_data format (Gemini style)
        if (part.inline_data) {
          imageData = part.inline_data.data;
          mimeType = part.inline_data.mime_type || mimeType;
          console.log('Found image in inline_data');
          break;
        }
      }
    }

    // Format 3: Direct data URL in content string
    if (!imageData && typeof message.content === 'string') {
      if (message.content.startsWith('data:image')) {
        imageData = message.content;
        console.log('Found image as data URL in content');
      }
    }

    if (!imageData) {
      console.log('\n❌ No image found in response.');
      console.log('Message content type:', typeof message.content);
      console.log('Message has images:', !!message.images);

      // Print text content if available
      if (typeof message.content === 'string') {
        console.log('\n📝 Text response:', message.content.substring(0, 500));
      } else if (Array.isArray(message.content)) {
        const textParts = message.content.filter(p => p.type === 'text');
        if (textParts.length > 0) {
          console.log('\n📝 Text response:', textParts.map(p => p.text).join('\n').substring(0, 500));
        }
      }

      throw new Error('No image found in response. The model may have returned text only.');
    }

    // Handle base64 data URL format
    let base64Data = imageData;
    if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    // Determine file extension from mime type
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';

    // Save the image
    const outputDir = path.join(__dirname, '..', 'apps', 'web', 'public');
    const outputPath = path.join(outputDir, `logo-generated.${ext}`);

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(outputPath, imageBuffer);

    console.log(`🎉 Logo saved to: ${outputPath}`);
    console.log(`📏 File size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`🖼️ MIME type: ${mimeType}`);

    // Also save any text response
    if (Array.isArray(message.content)) {
      const textParts = message.content.filter(p => p.type === 'text');
      if (textParts.length > 0) {
        console.log('\n📝 AI Description:', textParts.map(p => p.text).join('\n'));
      }
    }

  } catch (error) {
    console.error('❌ Error generating logo:', error.message);
    process.exit(1);
  }
}

generateLogo();
