// @vitest-environment node
import {readdirSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

/**
 * The package is public: its code must know nothing about the applications that use it. This guard
 * fails if a selector, a translation domain or a product-specific class comes back.
 */
const SOURCES = readdirSync(new URL('../src/', import.meta.url))
  .filter((file) => file.endsWith('.ts'))
  .map((file) => ({file, code: readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')}));

describe('package source code', () => {
  it.each([
    ['yoostart', /yoostart/i],
    ['former "yoo" prefix', /\byoo|\.yoo|yoo-|data-yoo/i],
    ['wordpress', /wordpress/i],
    ['quill', /quill/i],
    ['bootstrap', /bootstrap|\bbs\./i],
    ['class starting with "ys-"', /\bys-[a-z]/],
    ['translation domain', /__\(/]
  ])('contains no reference to: %s', (_name, pattern) => {
    const found = SOURCES.filter(({code}) => pattern.test(code)).map(({file}) => file);

    expect(found).toEqual([]);
  });
});
