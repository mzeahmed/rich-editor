import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import EmojiPicker from '../src/EmojiPicker.js';

describe('EmojiPicker', () => {
  beforeEach(() => {
    EmojiPicker.destroy();
    document.body.innerHTML = '';
  });

  afterEach(() => EmojiPicker.destroy());

  it('creates and reuses a single accessible modal', async () => {
    await EmojiPicker.open({onSelect: vi.fn()});
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(document.querySelectorAll('.mzre-emoji-picker')).toHaveLength(1);
    expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true');
    expect(document.querySelector('.modal, [data-bs-toggle]')).toBeNull();
  });

  it('selects an emoji and closes the modal', async () => {
    const onSelect = vi.fn();
    await EmojiPicker.open({onSelect});
    const emojiButton = document.querySelector<HTMLButtonElement>('.mzre-emoji-picker__item')!;

    emojiButton.click();

    expect(onSelect).toHaveBeenCalledWith(emojiButton.textContent);
    expect(document.querySelector<HTMLElement>('.mzre-emoji-picker')?.hidden).toBe(true);
  });

  it('changes category through its tabs', async () => {
    await EmojiPicker.open({onSelect: vi.fn()});
    const tabs = document.querySelectorAll<HTMLButtonElement>('[role="tab"]');

    tabs[1].click();

    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(document.querySelector('.mzre-emoji-picker__panel')?.getAttribute('aria-labelledby')).toBe(tabs[1].id);
  });

  it('closes with Escape and restores focus', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    await EmojiPicker.open({onSelect: vi.fn()});

    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));

    expect(document.querySelector<HTMLElement>('.mzre-emoji-picker')?.hidden).toBe(true);
    expect(document.activeElement).toBe(opener);
  });

  it('closes when its backdrop is clicked', async () => {
    await EmojiPicker.open({onSelect: vi.fn()});
    const backdrop = document.querySelector<HTMLElement>('.mzre-emoji-picker')!;

    backdrop.click();

    expect(backdrop.hidden).toBe(true);
  });
});
