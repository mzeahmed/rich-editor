import {describe, expect, it} from 'vitest';
import {escapeHtml, safeHttpUrl, safeSitePath, sanitizeHtml} from '../src/security.js';

describe('escapeHtml', () => {
  it('neutralizes HTML characters, including inside an attribute', () => {
    expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe('&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;');
  });

  it('accepte nombres, null et undefined', () => {
    expect(escapeHtml(42)).toBe('42');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('safeHttpUrl', () => {
  it('keeps http(s) URLs and resolves relative URLs against the page', () => {
    expect(safeHttpUrl('https://exemple.test/a.png')).toBe('https://exemple.test/a.png');
    expect(safeHttpUrl('/avatars/a.png')).toBe(`${window.location.origin}/avatars/a.png`);
  });

  it.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x', '', '   '])(
    'refuse %j',
    (value) => expect(safeHttpUrl(value)).toBeNull()
  );

  it('rejects anything that is not a string', () => {
    expect(safeHttpUrl(undefined)).toBeNull();
    expect(safeHttpUrl(42)).toBeNull();
  });
});

describe('safeSitePath', () => {
  it('keeps only the path, without domain, query or anchor', () => {
    expect(safeSitePath('https://exemple.test/membres/lea/?a=1#b')).toBe('/membres/lea/');
    expect(safeSitePath('/membres/lea')).toBe('/membres/lea');
  });

  it('never lets through a path that points to another domain', () => {
    expect(safeSitePath('https://exemple.test//autre-site.test/p')).toBe('/autre-site.test/p');
  });

  it.each(['javascript:alert(1)', 'mailto:a@b.test', '', null])('refuse %j', (value) =>
    expect(safeSitePath(value)).toBeNull()
  );
});

describe('sanitizeHtml', () => {
  it('keeps the formatting, the links and the mentions', () => {
    const html =
      '<p>Hello <strong>you</strong> <a class="mention" data-user-id="7" href="/profile/lea" target="_blank">Léa</a></p>' +
      '<ul><li>one</li></ul><h2>Title</h2>';
    const clean = sanitizeHtml(html);

    expect(clean).toContain('<strong>you</strong>');
    expect(clean).toContain('class="mention"');
    expect(clean).toContain('data-user-id="7"');
    expect(clean).toContain('href="/profile/lea"');
    expect(clean).toContain('<ul><li>one</li></ul>');
    expect(clean).toContain('<h2>Title</h2>');
  });

  it('adds rel="noopener noreferrer" to links that open in a new tab', () => {
    expect(sanitizeHtml('<a href="https://exemple.test" target="_blank">x</a>')).toContain('rel="noopener noreferrer"');
  });

  it('removes scripts, event handlers and dangerous tags, along with their content', () => {
    const clean = sanitizeHtml(
      'Hi<script>window.__xss=1</script><img src=x onerror="window.__xss=2"><iframe src="https://a.test"></iframe>' +
        '<svg><script>window.__xss=3</script></svg><p onclick="window.__xss=4">p</p><style>p{}</style>'
    );

    expect(clean).not.toMatch(/script|onerror|onclick|iframe|svg|style|<img/i);
    expect(clean).toContain('Hi');
    expect(clean).toContain('<p>p</p>');
  });

  it('rejects javascript: URLs and scheme-less links to another domain', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href=" JaVaScRiPt:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href="//autre-site.test">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href="mailto:a@b.test">x</a>')).toContain('href="mailto:a@b.test"');
  });

  it('keeps only text alignment from the style', () => {
    expect(sanitizeHtml('<div style="text-align: center">x</div>')).toContain('style="text-align: center"');
    expect(sanitizeHtml('<div style="background:url(javascript:alert(1))">x</div>')).toBe('<div>x</div>');
    expect(sanitizeHtml('<div style="text-align:center;position:fixed">x</div>')).toBe('<div>x</div>');
  });

  it('removes an unknown tag while keeping its text, and the comments', () => {
    expect(sanitizeHtml('<custom-tag>text</custom-tag><!-- hidden -->')).toBe('text');
  });
});
