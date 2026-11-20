import {expect, vi} from 'vitest';
import Editor from '../src/Editor.js';
import type {EditorUser} from '../src/types.js';

// jsdom n'implémente pas innerText, que l'éditeur lit : équivalent texte brut pour les tests.
Object.defineProperty(HTMLElement.prototype, 'innerText', {
  configurable: true,
  get(this: HTMLElement) {
    return this.textContent ?? '';
  },
  set(this: HTMLElement, value: string) {
    this.textContent = value;
  }
});

// Autres API d'édition absentes de jsdom, lues par la barre d'outils à chaque touche relâchée.
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

/** Monte l'éditeur avec les mentions ; la recherche renvoie `users` sans attendre. */
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

  return document.querySelector<HTMLElement>('.yoo-content')!;
}

/** Saisie dans le même nœud texte (un nœud remplacé fermerait la bulle) et touche relâchée. */
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

/** Tape « @le » : la bulle s'ouvre puis affiche les résultats de la recherche. */
export async function openMentionBubble(content: HTMLElement): Promise<void> {
  type(content, '@');
  type(content, '@le');

  await vi.waitFor(() =>
    expect(document.querySelector('.yoo-mention-item, .yoo-mentions-empty')).not.toBeNull()
  );
}
