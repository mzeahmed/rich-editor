import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import EmojiPicker from '../src/EmojiPicker.js';

const panel = (): HTMLElement => document.querySelector<HTMLElement>('.mzre-emoji-picker__panel')!;
const tabs = (): HTMLButtonElement[] => Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));

describe('EmojiPicker: emojis are loaded on demand', () => {
  beforeEach(() => {
    EmojiPicker.destroy();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    EmojiPicker.destroy();
    vi.restoreAllMocks();
    vi.doUnmock('emojibase-data/en/data.json');
    vi.doUnmock('emojibase-data/en/messages.json');
    vi.resetModules();
  });

  it('shows the window at once with a loading state, then the emojis', async () => {
    const ready = EmojiPicker.open({onSelect: vi.fn()});

    expect(document.querySelector<HTMLElement>('.mzre-emoji-picker')?.hidden).toBe(false);
    expect(panel().getAttribute('aria-busy')).toBe('true');
    expect(panel().querySelector('[role="status"]')?.textContent).toContain('Loading');
    expect(document.querySelectorAll('.mzre-emoji-picker__item')).toHaveLength(0);

    await ready;

    expect(panel().hasAttribute('aria-busy')).toBe(false);
    expect(document.querySelectorAll('.mzre-emoji-picker__item').length).toBeGreaterThan(0);
    expect(tabs().length).toBeGreaterThan(1);
    expect(document.activeElement).toBe(tabs()[0]);
  });

  it('does not create duplicate tabs when reopened during loading', async () => {
    await Promise.all([EmojiPicker.open({onSelect: vi.fn()}), EmojiPicker.open({onSelect: vi.fn()})]);
    const count = tabs().length;

    EmojiPicker.close();
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(count).toBeGreaterThan(1);
    expect(tabs()).toHaveLength(count);
  });

  it('puts focus back on the active tab when reopened once the data is loaded', async () => {
    await EmojiPicker.open({onSelect: vi.fn()});
    tabs()[2].click();
    EmojiPicker.close();

    await EmojiPicker.open({onSelect: vi.fn()});

    expect(document.activeElement).toBe(tabs()[2]);
  });

  it('shows an error without rejecting the promise when loading fails, then retries', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let attempts = 0;
    vi.resetModules();
    vi.doMock('emojibase-data/en/data.json', () => {
      attempts++;
      if (attempts === 1) throw new Error('chunk indisponible');

      return {default: [{emoji: '😀', label: 'sourire', group: 0}]};
    });
    vi.doMock('emojibase-data/en/messages.json', () => ({default: {groups: [{key: 'smileys', message: 'Visages', order: 0}]}}));
    const {default: Picker} = await import('../src/EmojiPicker.js');

    await expect(Picker.open({onSelect: vi.fn()})).resolves.toBeUndefined();
    expect(panel().textContent).toContain('Could not load');
    expect(panel().hasAttribute('aria-busy')).toBe(false);
    expect(error).toHaveBeenCalled();

    Picker.close();
    await Picker.open({onSelect: vi.fn()});

    expect(attempts).toBe(2);
    expect(document.querySelectorAll('.mzre-emoji-picker__item')).toHaveLength(1);
    Picker.destroy();
  });
});
