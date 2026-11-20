import {expect, vi} from 'vitest';
import Editor from '../src/Editor.js';
import type {EditorUser} from '../src/types.js';

// jsdom does not implement innerText, which the editor reads: plain-text equivalent for the tests.
Object.defineProperty(HTMLElement.prototype, 'innerText', {
  configurable: true,
  get(this: HTMLElement) {
    return this.textContent ?? '';
  },
  set(this: HTMLElement, value: string) {
    this.textContent = value;
  }
});

// Other editing APIs missing from jsdom, read by the toolbar on every key release.
Object.assign(document, {queryCommandState: () => false, queryCommandValue: () => ''});

export const USERS: EditorUser[] = [
  {
    ID: '7',
    avatarUrl: 'https://exemple.test/lea.png',
    firstName: 'Léa',
    lastName: 'Martin',
    profileUrl: 'https://exemple.test/membres/lea-martin/'
  }
];

/** Mounts the editor with mentions; the search returns `users` without waiting. */
export function mountEditor(users: EditorUser[] = USERS, initialValue = ''): HTMLElement {
  document.body.innerHTML = '<textarea id="post"></textarea>';
  document.querySelector<HTMLTextAreaElement>('#post')!.value = initialValue;

  Editor.mount('#post', {mention: true}, {
    mentions: {
      loader: {freezeElement() {}, unfreezeElement() {}},
      searchUsers: vi.fn().mockResolvedValue(users),
      encodeUserId: (id) => id,
      debounce: (callback) => callback
    }
  });

  return document.querySelector<HTMLElement>('.mzre-content')!;
}

/** Typing in the same text node (a replaced node would close the bubble) and key release. */
export function type(content: HTMLElement, text: string): void {
  const node = (content.firstChild as Text | null) ?? content.appendChild(document.createTextNode(''));
  node.data = text;

  const range = document.createRange();
  range.setStart(node, text.length);
  range.collapse(true);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);

  content.dispatchEvent(new KeyboardEvent('keyup', {code: 'KeyA'}));
}

/** Types "@le": the bubble opens then shows the search results. */
export async function openMentionBubble(content: HTMLElement): Promise<void> {
  type(content, '@');
  type(content, '@le');

  await vi.waitFor(() =>
    expect(document.querySelector('.mzre-mention-item, .mzre-mentions-empty')).not.toBeNull()
  );
}
