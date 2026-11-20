import {afterEach, describe, expect, it, vi} from 'vitest';
import {mountEditor, openMentionBubble, type} from './support.js';

const bubbles = (): number => document.querySelectorAll('.mzre-mentions-dropdown').length;

describe('mention bubble', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('closes with the cross, without inserting a mention', async () => {
    const content = mountEditor();
    await openMentionBubble(content);
    expect(bubbles()).toBe(1);

    document.querySelector<HTMLButtonElement>('.mzre-mentions-close')!.click();

    expect(bubbles()).toBe(0);
    expect(content.querySelector('a.mention')).toBeNull();
  });

  it('has an accessible cross, also when no member matches', async () => {
    const content = mountEditor([]);
    await openMentionBubble(content);

    expect(document.querySelector('.mzre-mentions-empty')).not.toBeNull();
    expect(document.querySelector('.mzre-mentions-close')?.getAttribute('aria-label')).toBe('Close');
  });

  it('closes when pressing outside, including in the editor’s text', async () => {
    const content = mountEditor();
    await openMentionBubble(content);

    document.body.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    expect(bubbles()).toBe(0);

    await openMentionBubble(content);
    content.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    expect(bubbles()).toBe(0);
  });

  it('stays open when pressing inside the bubble', async () => {
    const content = mountEditor();
    await openMentionBubble(content);

    document.querySelector('.mzre-mention-name')!.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    document.querySelector('.mzre-mentions-header')!.dispatchEvent(new Event('pointerdown', {bubbles: true}));

    expect(bubbles()).toBe(1);
  });

  it('leaves a single bubble when "@" is typed again', async () => {
    const content = mountEditor();
    await openMentionBubble(content);

    type(content, '@le @');

    expect(bubbles()).toBe(1);
  });

  it('removes its listener from the page on close', async () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const content = mountEditor();
    await openMentionBubble(content);

    const [, handler] = add.mock.calls.find(([type]) => 'pointerdown' === type)!;
    document.querySelector<HTMLButtonElement>('.mzre-mentions-close')!.click();

    expect(remove).toHaveBeenCalledWith('pointerdown', handler, true);
  });
});
