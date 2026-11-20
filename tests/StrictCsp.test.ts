// @vitest-environment node
import {readdirSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

/**
 * Le paquet doit rester utilisable sous une CSP stricte (sans 'unsafe-inline') : seules les balises
 * <style> posées par `styles.ts` (désactivables, avec nonce) sont tolérées ; ni attribut style="",
 * ni gestionnaire d'événement en ligne, ni eval. Les styles posés par l'API CSSOM
 * (`element.style.left = …`) ne sont pas concernés par la CSP.
 */
const SOURCES = readdirSync(new URL('../src/', import.meta.url))
  .filter((file) => file.endsWith('.ts'))
  .map((file) => ({file, code: readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')}));

const offenders = (pattern: RegExp, except: string[] = []): string[] =>
  SOURCES.filter(({file, code}) => !except.includes(file) && pattern.test(code)).map(({file}) => file);

describe('compatibilité avec une CSP stricte', () => {
  it('ne génère aucun attribut style="" dans le HTML', () => {
    expect(offenders(/\sstyle=["'`$]/)).toEqual([]);
    expect(offenders(/setAttribute\(\s*['"]style['"]/)).toEqual([]);
  });

  it('ne crée de balise <style> que dans styles.ts', () => {
    expect(offenders(/createElement\(\s*['"]style['"]\s*\)/, ['styles.ts'])).toEqual([]);
    expect(offenders(/<style[\s>]/, ['styles.ts'])).toEqual([]);
  });

  it('n’utilise ni gestionnaire d’événement en ligne ni eval', () => {
    expect(offenders(/\son[a-z]+=["'`$]/)).toEqual([]);
    expect(offenders(/\beval\(|new Function\(/)).toEqual([]);
  });
});
