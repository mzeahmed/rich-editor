// @vitest-environment node
import {readdirSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

/**
 * The package must stay usable under a strict CSP (without 'unsafe-inline'): only the
 * <style> tags added by `styles.ts` (can be disabled, with a nonce) are tolerated; no style="" attribute,
 * no inline event handler, no eval. Styles set through the CSSOM API
 * (`element.style.left = …`) are not covered by the CSP.
 */
const SOURCES = readdirSync(new URL('../src/', import.meta.url))
  .filter((file) => file.endsWith('.ts'))
  .map((file) => ({file, code: readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')}));

const offenders = (pattern: RegExp, except: string[] = []): string[] =>
  SOURCES.filter(({file, code}) => !except.includes(file) && pattern.test(code)).map(({file}) => file);

describe('strict CSP compatibility', () => {
  it('generates no style="" attribute in the HTML', () => {
    expect(offenders(/\sstyle=["'`$]/)).toEqual([]);
    expect(offenders(/setAttribute\(\s*['"]style['"]/)).toEqual([]);
  });

  it('creates a <style> tag only in styles.ts', () => {
    expect(offenders(/createElement\(\s*['"]style['"]\s*\)/, ['styles.ts'])).toEqual([]);
    expect(offenders(/<style[\s>]/, ['styles.ts'])).toEqual([]);
  });

  it('uses neither an inline event handler nor eval', () => {
    expect(offenders(/\son[a-z]+=["'`$]/)).toEqual([]);
    expect(offenders(/\beval\(|new Function\(/)).toEqual([]);
  });
});
