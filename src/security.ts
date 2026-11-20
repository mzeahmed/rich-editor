/**
 * Fonctions de sécurité de l'éditeur : échappement HTML, adresses acceptées et nettoyage du HTML
 * chargé dans la zone de saisie. Internes au paquet (non exportées par `index.ts`).
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/** Échappe un texte brut pour l'insérer dans du HTML, y compris dans un attribut entre guillemets. */
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

/** Adresse `http(s)` (absolue ou relative, résolue sur la page) ; null sinon (`javascript:`, `data:`…). */
export function safeHttpUrl (value: unknown): string | null {
  const url = resolveUrl(value);

  return url && (url.protocol === 'http:' || url.protocol === 'https:') ? url.href : null;
}

/**
 * Chemin d'un profil sur le site (sans domaine, requête ni ancre), ou null si l'adresse est
 * inexploitable. Les barres obliques de tête sont réduites à une : `//autre-site.test` serait
 * sinon un lien vers un autre domaine.
 */
export function safeSitePath (value: unknown): string | null {
  const url = resolveUrl(value);
  if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) return null;

  return url.pathname.replace(/^\/{2,}/, '/');
}

/* ─────────────────────────────────────────
   Nettoyage du HTML chargé dans l'éditeur
───────────────────────────────────────── */

/** Balises conservées : celles que produit la barre d'outils, plus les liens et les mentions. */
const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h2', 'h3', 'i', 'li', 'ol', 'p', 'pre',
  's', 'span', 'strike', 'strong', 'u', 'ul'
]);

/** Balises supprimées avec leur contenu (les autres balises inconnues sont retirées, texte gardé). */
const DROPPED_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'noscript', 'template',
  'svg', 'math', 'textarea', 'select', 'option', 'title', 'head'
]);

const TEXT_ALIGN = /^\s*text-align\s*:\s*(left|right|center|justify)\s*;?\s*$/i;

function isAllowedLink (value: string): boolean {
  const href = value.trim();
  // Chemin relatif au site (« / » seul, jamais « // »), ancre ou schéma explicitement permis.
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
 * Nettoie du HTML avant de le charger dans la zone de saisie : liste blanche de balises et
 * d'attributs, ni script ni gestionnaire d'événement ni adresse `javascript:`. Le HTML est
 * analysé dans un document inerte (`DOMParser`) : rien ne s'exécute pendant le nettoyage.
 */
export function sanitizeHtml (html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  cleanNode(document.body);

  return document.body.innerHTML;
}
