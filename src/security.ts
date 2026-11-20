/**
 * Security helpers of the editor: HTML escaping, accepted URLs and sanitizing of the HTML
 * loaded into the writing area. Internal to the package (not exported by `index.ts`).
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/** Escapes plain text so it can be inserted into HTML, including inside a quoted attribute. */
export function escapeHtml (value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function resolveUrl (value: unknown): URL | null {
  if (typeof value !== 'string' || value.trim() === '') return null;

  try {
    return new URL(value.trim(), typeof window === 'undefined' ? 'http://localhost/' : window.location.href);
  } catch {
    return null;
  }
}

/** `http(s)` URL (absolute, or relative resolved against the page); null otherwise (`javascript:`, `data:`…). */
export function safeHttpUrl (value: unknown): string | null {
  const url = resolveUrl(value);

  return url && (url.protocol === 'http:' || url.protocol === 'https:') ? url.href : null;
}

/**
 * Path of a profile on the site (no domain, query or anchor), or null if the URL is
 * unusable. Leading slashes are collapsed to one: `//other-site.test` would otherwise
 * be a link to another domain.
 */
export function safeSitePath (value: unknown): string | null {
  const url = resolveUrl(value);
  if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) return null;

  return url.pathname.replace(/^\/{2,}/, '/');
}

/* ─────────────────────────────────────────
   Sanitizing the HTML loaded into the editor
───────────────────────────────────────── */

/** Kept tags: those the toolbar produces, plus links and mentions. */
const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h2', 'h3', 'i', 'li', 'ol', 'p', 'pre',
  's', 'span', 'strike', 'strong', 'u', 'ul'
]);

/** Tags removed along with their content (other unknown tags are stripped, text kept). */
const DROPPED_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'noscript', 'template',
  'svg', 'math', 'textarea', 'select', 'option', 'title', 'head'
]);

const TEXT_ALIGN = /^\s*text-align\s*:\s*(left|right|center|justify)\s*;?\s*$/i;

function isAllowedLink (value: string): boolean {
  const href = value.trim();
  // Site-relative path (a single "/", never "//"), anchor or explicitly allowed scheme.
  if (/^\/(?!\/)/.test(href) || href.startsWith('#')) return true;

  return /^(https?:|mailto:|tel:)/i.test(href);
}

function cleanAttributes (element: Element, tag: string): void {
  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;
    let keep = false;

    if (tag === 'a') {
      if (name === 'href') keep = isAllowedLink(value);
      else if (name === 'target') keep = value === '_blank';
      else if (name === 'class') keep = value === 'mention';
      else if (name === 'data-user-id') keep = true;
    } else if (name === 'style') {
      keep = TEXT_ALIGN.test(value);
    } else if (name === 'align') {
      keep = /^(left|right|center|justify)$/i.test(value);
    }

    if (!keep) element.removeAttribute(attribute.name);
  }

  if (tag === 'a' && element.getAttribute('target') === '_blank') {
    element.setAttribute('rel', 'noopener noreferrer');
  }
}

function cleanNode (parent: Node): void {
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) continue;

    if (child.nodeType !== Node.ELEMENT_NODE) {
      parent.removeChild(child); // commentaires, instructions de traitement
      continue;
    }

    const element = child as Element;
    const tag = element.tagName.toLowerCase();

    if (DROPPED_WITH_CONTENT.has(tag)) {
      parent.removeChild(element);
      continue;
    }

    cleanNode(element);

    if (!ALLOWED_TAGS.has(tag)) {
      while (element.firstChild) parent.insertBefore(element.firstChild, element);
      parent.removeChild(element);
      continue;
    }

    cleanAttributes(element, tag);
  }
}

/**
 * Sanitizes HTML before loading it into the writing area: allow-list of tags and
 * attributes, no script, no event handler, no `javascript:` URL. The HTML is
 * parsed in an inert document (`DOMParser`): nothing runs during sanitizing.
 */
export function sanitizeHtml (html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  cleanNode(document.body);

  return document.body.innerHTML;
}
