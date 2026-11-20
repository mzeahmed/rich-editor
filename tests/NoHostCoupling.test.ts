// @vitest-environment node
import {readdirSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

/**
 * Le paquet est public : son code ne doit rien savoir des applications qui l'utilisent. Ce garde-fou
 * échoue si un sélecteur, un domaine de traduction ou une classe propre à un produit y revient.
 */
const SOURCES = readdirSync(new URL('../src/', import.meta.url))
  .filter((file) => file.endsWith('.ts'))
  .map((file) => ({file, code: readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')}));

describe('code source du paquet', () => {
  it.each([
    ['yoostart', /yoostart/i],
    ['préfixe « yoo » (ancien nom)', /\byoo|\.yoo|yoo-|data-yoo/i],
    ['wordpress', /wordpress/i],
    ['quill', /quill/i],
    ['bootstrap', /bootstrap|\bbs\./i],
    ['classe en « ys- »', /\bys-[a-z]/],
    ['domaine de traduction', /__\(/]
  ])('ne contient pas de référence à : %s', (_name, pattern) => {
    const found = SOURCES.filter(({code}) => pattern.test(code)).map(({file}) => file);

    expect(found).toEqual([]);
  });
});
