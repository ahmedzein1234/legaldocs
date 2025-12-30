/**
 * HTML Sanitization Utility
 *
 * SECURITY: Sanitizes HTML content to prevent XSS attacks.
 * Used for sanitizing user-generated content from rich text editors.
 *
 * This is a lightweight sanitizer that allows safe HTML tags commonly used
 * in legal documents while blocking potentially dangerous content.
 */

// Allowed HTML tags for legal documents
const ALLOWED_TAGS = new Set([
  // Text formatting
  'p', 'br', 'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins',
  'sup', 'sub', 'mark',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Lists
  'ul', 'ol', 'li',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // Block elements
  'blockquote', 'pre', 'code', 'hr',
  // Links (href sanitized separately)
  'a',
]);

// Allowed attributes per tag
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'dir', 'lang', 'title', 'style', 'data-article', 'data-clause']),
  'a': new Set(['href', 'target', 'rel']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
  'col': new Set(['span']),
  'colgroup': new Set(['span']),
  'table': new Set(['border', 'cellpadding', 'cellspacing']),
};

// Dangerous URL protocols
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'];

// Dangerous CSS properties
const DANGEROUS_CSS_PROPERTIES = [
  'expression',
  'behavior',
  '-moz-binding',
  'javascript',
];

/**
 * Check if a URL is safe
 */
function isSafeUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase().trim();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerUrl.startsWith(protocol)) {
      return false;
    }
  }
  return true;
}

/**
 * Sanitize CSS style value
 */
function sanitizeStyle(style: string): string {
  const lowerStyle = style.toLowerCase();
  for (const prop of DANGEROUS_CSS_PROPERTIES) {
    if (lowerStyle.includes(prop)) {
      return '';
    }
  }
  // Remove url() that could contain javascript
  if (lowerStyle.includes('url(')) {
    return style.replace(/url\s*\([^)]*\)/gi, '');
  }
  return style;
}

/**
 * Check if an attribute is allowed for a tag
 */
function isAllowedAttribute(tagName: string, attrName: string): boolean {
  const globalAllowed = ALLOWED_ATTRIBUTES['*'];
  const tagAllowed = ALLOWED_ATTRIBUTES[tagName];

  const lowerAttr = attrName.toLowerCase();

  if (globalAllowed?.has(lowerAttr)) return true;
  if (tagAllowed?.has(lowerAttr)) return true;

  return false;
}

/**
 * Sanitize HTML string to prevent XSS attacks
 *
 * @param html - Raw HTML string from the editor
 * @returns Sanitized HTML string safe for storage and display
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (should sanitize on client before sending)
    return html;
  }

  // Parse HTML using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Walk through all elements and sanitize
  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  const elementsToRemove: Element[] = [];
  let currentNode: Element | null = walker.currentNode as Element;

  while (currentNode) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const tagName = currentNode.tagName.toLowerCase();

      // Remove disallowed tags entirely
      if (!ALLOWED_TAGS.has(tagName)) {
        elementsToRemove.push(currentNode);
      } else {
        // Sanitize attributes
        const attrsToRemove: string[] = [];

        for (const attr of Array.from(currentNode.attributes)) {
          const attrName = attr.name.toLowerCase();

          // Check if attribute is allowed
          if (!isAllowedAttribute(tagName, attrName)) {
            attrsToRemove.push(attr.name);
            continue;
          }

          // Special handling for href
          if (attrName === 'href' && !isSafeUrl(attr.value)) {
            attrsToRemove.push(attr.name);
            continue;
          }

          // Special handling for style
          if (attrName === 'style') {
            const sanitizedStyle = sanitizeStyle(attr.value);
            if (sanitizedStyle !== attr.value) {
              currentNode.setAttribute('style', sanitizedStyle);
            }
          }

          // Block event handlers (onclick, onerror, etc.)
          if (attrName.startsWith('on')) {
            attrsToRemove.push(attr.name);
          }
        }

        // Remove disallowed attributes
        for (const attrName of attrsToRemove) {
          currentNode.removeAttribute(attrName);
        }

        // Force target="_blank" links to have rel="noopener noreferrer"
        if (tagName === 'a' && currentNode.getAttribute('target') === '_blank') {
          currentNode.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }

    currentNode = walker.nextNode() as Element | null;
  }

  // Remove disallowed elements (replace with their text content)
  for (const element of elementsToRemove) {
    const textContent = element.textContent || '';
    element.replaceWith(document.createTextNode(textContent));
  }

  return doc.body.innerHTML;
}

/**
 * Escape HTML entities for plain text display
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return html.replace(/<[^>]*>/g, '');
  }

  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export default sanitizeHtml;
