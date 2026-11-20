import {afterEach, describe, expect, it, vi} from 'vitest';
import Editor from '../src/Editor.js';
import type {MentionColors} from '../src/types.js';
import {USERS, openMentionBubble} from './support.js';

const wrap = (index = 0): HTMLElement => document.querySelectorAll<HTMLElement>('.mzre-editor-wrap')[index]!;
const bubble = (): HTMLElement => document.querySelector<HTMLElement>('.mzre-mentions-dropdown')!;

/** Mounts one editor with mentions and the given colors; returns its writing area. */
function mount(colors?: MentionColors, id = 'post'): HTMLElement {
  document.body.insertAdjacentHTML('beforeend', `<textarea id="${id}"></textarea>`);

  Editor.mount(`#${id}`, {mention: true, mentionColors: colors}, {
    mentions: {
      loader: {freezeElement() {}, unfreezeElement() {}},
      searchUsers: vi.fn().mockResolvedValue(USERS),
      encodeUserId: (value) => value,
      debounce: (callback) => callback
    }
  });

  return document.querySelectorAll<HTMLElement>('.mzre-content')[document.querySelectorAll('.mzre-content').length - 1]!;
}

describe('mention colors option', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('sets the link colors on the editor, as custom properties', () => {
    mount({link: '#0b7a5f', linkBackground: 'rgba(15, 157, 122, .1)', linkBorder: '#0f9d7a', linkHoverBackground: '#d1fae5', linkHoverBorder: '#34d399'});

    const style = wrap().style;
    expect(style.getPropertyValue('--mzre-mention-color')).toBe('#0b7a5f');
    expect(style.getPropertyValue('--mzre-mention-bg')).toBe('rgba(15, 157, 122, .1)');
    expect(style.getPropertyValue('--mzre-mention-border')).toBe('#0f9d7a');
    expect(style.getPropertyValue('--mzre-mention-hover-bg')).toBe('#d1fae5');
    expect(style.getPropertyValue('--mzre-mention-hover-border')).toBe('#34d399');
  });

  it('sets the chosen-user colors on the bubble itself, which is outside the editor', async () => {
    const content = mount({active: '#0f9d7a', activeBackground: 'rgba(15, 157, 122, .08)', activeBorder: 'rgba(15, 157, 122, .25)'});
    await openMentionBubble(content);

    expect(bubble().style.getPropertyValue('--mzre-mention-active-color')).toBe('#0f9d7a');
    expect(bubble().style.getPropertyValue('--mzre-mention-active-bg')).toBe('rgba(15, 157, 122, .08)');
    expect(bubble().style.getPropertyValue('--mzre-mention-active-border')).toBe('rgba(15, 157, 122, .25)');
    // The bubble colors do not leak onto the editor, and the link colors not onto the bubble.
    expect(wrap().style.getPropertyValue('--mzre-mention-active-color')).toBe('');
  });

  it('sets only what is given, and nothing at all by default', async () => {
    const content = mount({link: '#0b7a5f'});
    await openMentionBubble(content);

    expect(wrap().style.getPropertyValue('--mzre-mention-color')).toBe('#0b7a5f');
    expect(wrap().style.getPropertyValue('--mzre-mention-bg')).toBe('');
    expect(bubble().style.getPropertyValue('--mzre-mention-active-color')).toBe('');

    document.body.innerHTML = '';
    mount();
    expect(wrap().getAttribute('style')).toBeNull();
  });

  it('ignores empty and non-string values', () => {
    mount({link: '', linkBackground: '   ', linkBorder: 42 as unknown as string, linkHoverBackground: null as unknown as string});

    expect(wrap().getAttribute('style')).toBeNull();
  });

  it('keeps each editor’s own colors', async () => {
    mount({link: '#111111'}, 'first');
    const second = mount({link: '#222222', active: '#333333'}, 'second');

    expect(wrap(0).style.getPropertyValue('--mzre-mention-color')).toBe('#111111');
    expect(wrap(1).style.getPropertyValue('--mzre-mention-color')).toBe('#222222');

    await openMentionBubble(second);
    expect(bubble().style.getPropertyValue('--mzre-mention-active-color')).toBe('#333333');
  });
});
