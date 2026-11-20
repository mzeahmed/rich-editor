// @vitest-environment node
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {EDITOR_CSS, EMOJI_PICKER_CSS} from '../src/styles.js';

/**
 * The mention colors are CSS custom properties that hosts override. The package must never define
 * them itself (its own value would fight the host's), must always give a fallback (the default look),
 * and the README must document exactly the variables the CSS uses.
 */
const CSS = `${EDITOR_CSS}\n${EMOJI_PICKER_CSS}`;
const README = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

const used = [...new Set([...CSS.matchAll(/var\((--mzre-[a-z-]+)/g)].map((match) => match[1]))].sort();
const documented = [...new Set([...README.matchAll(/^\| `(--mzre-[a-z-]+)`/gm)].map((match) => match[1]))].sort();

describe('mention color variables', () => {
  it('are used by the stylesheet', () => {
    expect(used).toEqual([
      '--mzre-mention-active-bg',
      '--mzre-mention-active-border',
      '--mzre-mention-active-color',
      '--mzre-mention-bg',
      '--mzre-mention-border',
      '--mzre-mention-color',
      '--mzre-mention-hover-bg',
      '--mzre-mention-hover-border'
    ]);
  });

  it('are documented in the README, and only those', () => {
    expect(documented).toEqual(used);
  });

  it('always carry a fallback, so the default look needs no configuration', () => {
    const withoutFallback = [...CSS.matchAll(/var\((--mzre-[a-z-]+)\s*\)/g)].map((match) => match[1]);

    expect(withoutFallback).toEqual([]);
  });

  it('are never defined by the package, so the host value always wins', () => {
    expect(CSS).not.toMatch(/--mzre-[a-z-]+\s*:/);
  });

  it('keep the previous blue as the fallback of the bubble and of the link', () => {
    expect(CSS).toContain('var(--mzre-mention-active-color, #3b82f6)');
    expect(CSS).toContain('var(--mzre-mention-color, #2563eb)');
    expect(CSS).toContain('var(--mzre-mention-bg, rgba(59, 130, 246, .1))');
  });
});
