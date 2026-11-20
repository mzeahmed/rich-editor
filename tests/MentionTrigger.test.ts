import {afterEach, describe, expect, it, vi} from 'vitest';
import {mountEditor, openMentionBubble, type} from './support.js';

const bubbles = (): number => document.querySelectorAll('.mzre-mentions-dropdown').length;
const results = (): Element | null => document.querySelector('.mzre-mention-item, .mzre-mentions-empty');

/** The delay the integration really applies: only the last key release of a burst gets through. */
const realDebounce: Parameters<typeof mountEditor>[2] = (callback, delay) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
};

const wait = (milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));

describe('mention trigger', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('opens when letters follow the @ without a pause (only the last key release is seen)', async () => {
    const content = mountEditor(undefined, '', realDebounce);

    type(content, '@');
    type(content, '@l');
    type(content, '@le');

    await vi.waitFor(() => expect(results()).not.toBeNull());
    expect(bubbles()).toBe(1);
  });

  it('opens for a mention typed at once in the middle of a sentence', async () => {
    const content = mountEditor(undefined, '', realDebounce);

    type(content, 'Hello @le');

    await vi.waitFor(() => expect(results()).not.toBeNull());
    expect(bubbles()).toBe(1);
  });

  it('does not open for an @ inside a word, such as an e-mail address', async () => {
    const content = mountEditor();

    type(content, 'jean@le');
    await wait(30);

    expect(bubbles()).toBe(0);
  });

  it('stays closed after Escape while the same @term is still in the text', async () => {
    const content = mountEditor();
    await openMentionBubble(content);

    content.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape', bubbles: true, cancelable: true}));
    expect(bubbles()).toBe(0);

    type(content, '@le');
    type(content, '@le');
    await wait(30);

    expect(bubbles()).toBe(0);
  });

  it('opens again for a new @, even at the position that was dismissed', async () => {
    const content = mountEditor();
    await openMentionBubble(content);
    document.querySelector<HTMLButtonElement>('.mzre-mentions-close')!.click();
    expect(bubbles()).toBe(0);

    type(content, '');
    type(content, '@');

    expect(bubbles()).toBe(1);
  });

  it('closes when the caret leaves the mention', async () => {
    const content = mountEditor();
    await openMentionBubble(content);
    expect(bubbles()).toBe(1);

    type(content, '@le and more');

    expect(bubbles()).toBe(0);
  });
});
