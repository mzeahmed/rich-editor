import {describe, expect, it} from 'vitest';
import {escapeHtml, safeHttpUrl, safeSitePath, sanitizeHtml} from '../src/security.js';

describe('escapeHtml', () => {
  it('neutralise les caractères du HTML, y compris dans un attribut', () => {
    expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe('&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;');
  });

  it('accepte nombres, null et undefined', () => {
    expect(escapeHtml(42)).toBe('42');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('safeHttpUrl', () => {
  it('garde les adresses http(s) et résout les adresses relatives sur la page', () => {
    expect(safeHttpUrl('https://exemple.test/a.png')).toBe('https://exemple.test/a.png');
    expect(safeHttpUrl('/avatars/a.png')).toBe(`${window.location.origin}/avatars/a.png`);
  });

  it.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x', '', '   '])(
    'refuse %j',
    (value) => expect(safeHttpUrl(value)).toBeNull()
  );

  it('refuse ce qui n’est pas une chaîne', () => {
    expect(safeHttpUrl(undefined)).toBeNull();
    expect(safeHttpUrl(42)).toBeNull();
  });
});

describe('safeSitePath', () => {
  it('ne garde que le chemin, sans domaine, requête ni ancre', () => {
    expect(safeSitePath('https://exemple.test/membres/lea/?a=1#b')).toBe('/membres/lea/');
    expect(safeSitePath('/membres/lea')).toBe('/membres/lea');
  });

  it('ne laisse jamais un chemin qui désigne un autre domaine', () => {
    expect(safeSitePath('https://exemple.test//autre-site.test/p')).toBe('/autre-site.test/p');
  });

  it.each(['javascript:alert(1)', 'mailto:a@b.test', '', null])('refuse %j', (value) =>
    expect(safeSitePath(value)).toBeNull()
  );
});

describe('sanitizeHtml', () => {
  it('conserve la mise en forme, les liens et les mentions', () => {
    const html =
      '<p>Bonjour <strong>toi</strong> <a class="mention" data-user-id="7" href="/profil/lea" target="_blank">Léa</a></p>' +
      '<ul><li>un</li></ul><h2>Titre</h2>';
    const clean = sanitizeHtml(html);

    expect(clean).toContain('<strong>toi</strong>');
    expect(clean).toContain('class="mention"');
    expect(clean).toContain('data-user-id="7"');
    expect(clean).toContain('href="/profil/lea"');
    expect(clean).toContain('<ul><li>un</li></ul>');
    expect(clean).toContain('<h2>Titre</h2>');
  });

  it('ajoute rel="noopener noreferrer" aux liens qui s’ouvrent dans un nouvel onglet', () => {
    expect(sanitizeHtml('<a href="https://exemple.test" target="_blank">x</a>')).toContain('rel="noopener noreferrer"');
  });

  it('retire scripts, gestionnaires d’événements et balises dangereuses, avec leur contenu', () => {
    const clean = sanitizeHtml(
      'Salut<script>window.__xss=1</script><img src=x onerror="window.__xss=2"><iframe src="https://a.test"></iframe>' +
        '<svg><script>window.__xss=3</script></svg><p onclick="window.__xss=4">p</p><style>p{}</style>'
    );

    expect(clean).not.toMatch(/script|onerror|onclick|iframe|svg|style|<img/i);
    expect(clean).toContain('Salut');
    expect(clean).toContain('<p>p</p>');
  });

  it('refuse les adresses javascript: et les liens vers un autre domaine sans schéma', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href=" JaVaScRiPt:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href="//autre-site.test">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href="mailto:a@b.test">x</a>')).toContain('href="mailto:a@b.test"');
  });

  it('ne garde du style que l’alignement du texte', () => {
    expect(sanitizeHtml('<div style="text-align: center">x</div>')).toContain('style="text-align: center"');
    expect(sanitizeHtml('<div style="background:url(javascript:alert(1))">x</div>')).toBe('<div>x</div>');
    expect(sanitizeHtml('<div style="text-align:center;position:fixed">x</div>')).toBe('<div>x</div>');
  });

  it('retire une balise inconnue en gardant son texte, et les commentaires', () => {
    expect(sanitizeHtml('<custom-tag>texte</custom-tag><!-- caché -->')).toBe('texte');
  });
});
