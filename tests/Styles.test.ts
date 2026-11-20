import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import Editor from '../src/Editor.js';
import EmojiPicker from '../src/EmojiPicker.js';
import {EDITOR_CSS, EMOJI_PICKER_CSS, setEditorStyles} from '../src/styles.js';
import './support.js';

const textarea = (): HTMLTextAreaElement => {
  document.body.innerHTML = '<textarea id="note"></textarea>';

  return document.querySelector<HTMLTextAreaElement>('#note')!;
};
const styleTags = (): HTMLStyleElement[] => Array.from(document.querySelectorAll<HTMLStyleElement>('style'));

describe('style injection', () => {
  beforeEach(() => {
    EmojiPicker.destroy();
    styleTags().forEach((tag) => tag.remove());
    setEditorStyles({inject: true, nonce: undefined});
  });

  afterEach(() => {
    EmojiPicker.destroy();
    document.body.innerHTML = '';
    styleTags().forEach((tag) => tag.remove());
    setEditorStyles({inject: true, nonce: undefined});
  });

  it('injects the editor and picker styles by default, once each', async () => {
    Editor.mount(textarea(), {});
    await EmojiPicker.open({onSelect: vi.fn()});
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(styleTags().map((tag) => tag.id).sort()).toEqual(['mzre-editor-styles', 'mzre-emoji-picker-styles']);
    expect(document.getElementById('mzre-editor-styles')!.textContent).toBe(EDITOR_CSS);
    expect(document.getElementById('mzre-emoji-picker-styles')!.textContent).toBe(EMOJI_PICKER_CSS);
  });

  it('adds no style tag when injection is off (mount option)', async () => {
    Editor.mount(textarea(), {styles: {inject: false}});
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(styleTags()).toHaveLength(0);
    // The editor and the picker still work, until the page loads style.css.
    expect(document.querySelector('.mzre-content')).not.toBeNull();
    expect(document.querySelectorAll('.mzre-emoji-picker__item').length).toBeGreaterThan(0);
  });

  it('sets the CSP nonce on the injected tags', async () => {
    setEditorStyles({nonce: 'abc123'});
    Editor.mount(textarea(), {});
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(styleTags()).toHaveLength(2);
    styleTags().forEach((tag) => expect(tag.getAttribute('nonce')).toBe('abc123'));
  });

  it('removes the nonce when given an empty value', () => {
    setEditorStyles({nonce: 'abc123'});
    setEditorStyles({nonce: undefined});
    Editor.mount(textarea(), {});

    expect(document.getElementById('mzre-editor-styles')!.hasAttribute('nonce')).toBe(false);
  });
});

describe('toolbar without a style attribute', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('styles the U and S buttons through a class, not a style="" attribute', () => {
    Editor.mount(textarea(), {});

    expect(document.querySelectorAll('.mzre-toolbar [style]')).toHaveLength(0);
    expect(document.querySelector('[data-cmd="underline"]')!.classList.contains('mzre-btn-underline')).toBe(true);
    expect(document.querySelector('[data-cmd="strikeThrough"]')!.classList.contains('mzre-btn-strike')).toBe(true);
    expect(EDITOR_CSS).toContain('.mzre-toolbar button.mzre-btn-underline');
    expect(EDITOR_CSS).toContain('.mzre-toolbar button.mzre-btn-strike');
  });
});
