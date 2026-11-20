import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {EditorUser} from '../src/types.js';
import {setEditorLocale} from '../src/messages.js';
import {mountEditor, openMentionBubble, type, USERS} from './support.js';

const TWO_USERS: EditorUser[] = [
  {...USERS[0], ID: '7', firstName: 'Léa', lastName: 'Martin'},
  {...USERS[0], ID: '8', firstName: 'Leo', lastName: 'Durand', profileUrl: 'https://exemple.test/membres/leo-durand/'}
];

const attr = (element: Element | null, name: string): string | null => element?.getAttribute(name) ?? null;
const bubble = (): HTMLElement | null => document.querySelector<HTMLElement>('.mzre-mentions-dropdown');
const options = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('.mzre-mention-item'));
const status = (): string => document.querySelector('.mzre-mentions-dropdown [role="status"]')?.textContent ?? '';

/** Key pressed in the writing area; returns the event so `defaultPrevented` can be read. */
function press(content: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true, ...init});
  content.dispatchEvent(event);

  return event;
}

describe('mention bubble: accessibility', () => {
  beforeEach(() => {
    setEditorLocale('en');
    // jsdom has no execCommand, which inserting a mention calls to add the trailing space.
    Object.assign(document, {execCommand: vi.fn()});
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('gives the writing area a role and a name', () => {
    const content = mountEditor();

    expect(attr(content, 'role')).toBe('textbox');
    expect(attr(content, 'aria-multiline')).toBe('true');
    expect(attr(content, 'aria-label')).toBe('Write here…');
  });

  it('names the bubble (landmark) and the toolbar’s style selector', async () => {
    const content = mountEditor(USERS);
    await openMentionBubble(content);

    expect(attr(bubble(), 'role')).toBe('region');
    expect(attr(bubble(), 'aria-label')).toBe('Mention suggestions');
    expect(attr(document.querySelector('.mzre-block-select'), 'aria-label')).toBe('Text style');
  });

  it('exposes an options list linked to the writing area', async () => {
    const content = mountEditor(TWO_USERS);
    await openMentionBubble(content);

    const listbox = document.querySelector('[role="listbox"]')!;
    expect(attr(listbox, 'aria-label')).toBe('Mention suggestions');
    expect(attr(content, 'aria-autocomplete')).toBe('list');
    // textbox role: these two attributes are not allowed on it.
    expect(content.hasAttribute('aria-expanded')).toBe(false);
    expect(content.hasAttribute('aria-haspopup')).toBe(false);
    expect(attr(content, 'aria-controls')).toBe(listbox.id);
    expect(content.hasAttribute('aria-activedescendant')).toBe(false);

    expect(options()).toHaveLength(2);
    options().forEach((option) => {
      expect(attr(option, 'role')).toBe('option');
      expect(attr(option, 'aria-selected')).toBe('false');
      expect(option.id).toMatch(/^mzre-mentions-list-\d+-option-\d+$/);
      expect(option.hasAttribute('tabindex')).toBe(false);
    });
    expect(new Set(options().map((option) => option.id)).size).toBe(2);
  });

  it('stays hidden while there is no result to show', async () => {
    const content = mountEditor();
    type(content, '@');

    expect(bubble()?.hidden).toBe(true);
    expect(status()).toBe('');

    type(content, '@le');
    await vi.waitFor(() => expect(bubble()?.hidden).toBe(false));
  });

  it('announces the number of suggestions, or the absence of results, in a region that exists beforehand', async () => {
    const content = mountEditor(TWO_USERS);
    type(content, '@');
    const region = document.querySelector('.mzre-mentions-dropdown [role="status"]');
    expect(region).not.toBeNull();

    type(content, '@le');
    await vi.waitFor(() => expect(status()).toContain('2 suggestions available'));
    expect(document.querySelector('.mzre-mentions-dropdown [role="status"]')).toBe(region);

    document.body.innerHTML = '';
    const empty = mountEditor([]);
    await openMentionBubble(empty);
    expect(status()).toBe('No user found');
  });

  it('announces "1 suggestion" in the singular and in the chosen language', async () => {
    const content = mountEditor(USERS);
    await openMentionBubble(content);
    expect(status()).toContain('1 suggestion available');

    document.body.innerHTML = '';
    setEditorLocale('fr');
    const french = mountEditor(USERS);
    await openMentionBubble(french);
    expect(status()).toContain('1 suggestion disponible');
    expect(attr(document.querySelector('[role="listbox"]'), 'aria-label')).toBe('Suggestions de mention');
  });

  it('chooses a suggestion with the arrow keys, wrapping around, and tells the writing area', async () => {
    const content = mountEditor(TWO_USERS);
    await openMentionBubble(content);

    const down = press(content, 'ArrowDown');
    expect(down.defaultPrevented).toBe(true);
    expect(options().map((option) => attr(option, 'aria-selected'))).toEqual(['true', 'false']);
    expect(attr(content, 'aria-activedescendant')).toBe(options()[0].id);

    press(content, 'ArrowDown');
    expect(attr(content, 'aria-activedescendant')).toBe(options()[1].id);

    press(content, 'ArrowDown');
    expect(attr(options()[0], 'aria-selected')).toBe('true');

    press(content, 'ArrowUp');
    expect(attr(options()[1], 'aria-selected')).toBe('true');
    expect(options().filter((option) => attr(option, 'aria-selected') === 'true')).toHaveLength(1);
  });

  it('starts from the last suggestion with Arrow Up, and Home/End only work once a choice is made', async () => {
    const content = mountEditor(TWO_USERS);
    await openMentionBubble(content);

    // With no choice: Home and End move the caret as usual.
    expect(press(content, 'Home').defaultPrevented).toBe(false);
    expect(press(content, 'End').defaultPrevented).toBe(false);

    press(content, 'ArrowUp');
    expect(attr(options()[1], 'aria-selected')).toBe('true');
    expect(press(content, 'Home').defaultPrevented).toBe(true);
    expect(attr(options()[0], 'aria-selected')).toBe('true');
    press(content, 'End');
    expect(attr(options()[1], 'aria-selected')).toBe('true');
  });

  it('inserts the chosen suggestion with Enter, and closes the bubble', async () => {
    const content = mountEditor(TWO_USERS);
    await openMentionBubble(content);
    press(content, 'ArrowDown');
    press(content, 'ArrowDown');

    const enter = press(content, 'Enter');

    expect(enter.defaultPrevented).toBe(true);
    expect(content.querySelector('a.mention')?.getAttribute('data-user-id')).toBe('8');
    expect(content.querySelector('a.mention')?.textContent).toBe('Leo Durand');
    expect(bubble()).toBeNull();
    ['aria-autocomplete', 'aria-controls', 'aria-activedescendant'].forEach((name) =>
      expect(content.hasAttribute(name)).toBe(false)
    );
  });

  it('also inserts with Tab when a suggestion is chosen', async () => {
    const content = mountEditor(TWO_USERS);
    await openMentionBubble(content);
    press(content, 'ArrowDown');

    const tab = press(content, 'Tab');

    expect(tab.defaultPrevented).toBe(true);
    expect(content.querySelector('a.mention')?.getAttribute('data-user-id')).toBe('7');
  });

  it('leaves Enter and Tab to their usual role when no suggestion is chosen', async () => {
    const content = mountEditor(TWO_USERS);
    await openMentionBubble(content);

    expect(press(content, 'Enter').defaultPrevented).toBe(false);
    // Tab keeps the editor's behavior (inserting spaces), it does not insert a mention.
    press(content, 'Tab');
    expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, expect.stringContaining('&nbsp;'));
    expect(content.querySelector('a.mention')).toBeNull();
  });

  it('closes at once with Escape, without touching the text or closing a surrounding modal', async () => {
    const content = mountEditor(TWO_USERS);
    await openMentionBubble(content);
    const reachedPage = vi.fn();
    document.addEventListener('keydown', reachedPage);

    const escape = press(content, 'Escape');
    document.removeEventListener('keydown', reachedPage);

    expect(escape.defaultPrevented).toBe(true);
    expect(reachedPage).not.toHaveBeenCalled();
    expect(bubble()).toBeNull();
    expect(content.textContent).toBe('@le');
    expect(content.hasAttribute('aria-autocomplete')).toBe(false);
  });

  it('removes the ARIA attributes when closed with the cross', async () => {
    const content = mountEditor(TWO_USERS);
    await openMentionBubble(content);
    press(content, 'ArrowDown');

    document.querySelector<HTMLButtonElement>('.mzre-mentions-close')!.click();

    expect(bubble()).toBeNull();
    expect(content.hasAttribute('aria-activedescendant')).toBe(false);
    expect(content.hasAttribute('aria-controls')).toBe(false);
  });

  it('intercepts no key without an open bubble, nor during text composition', async () => {
    const closed = mountEditor(TWO_USERS);
    expect(press(closed, 'ArrowDown').defaultPrevented).toBe(false);
    expect(press(closed, 'Escape').defaultPrevented).toBe(false);

    const content = mountEditor(TWO_USERS);
    await openMentionBubble(content);
    expect(press(content, 'ArrowDown', {isComposing: true}).defaultPrevented).toBe(false);
    expect(options().some((option) => attr(option, 'aria-selected') === 'true')).toBe(false);
  });

  it('keeps the list free of decoration: the avatar is decorative, the name is read next to it', async () => {
    const content = mountEditor(USERS);
    await openMentionBubble(content);

    expect(attr(document.querySelector('.mzre-mention-avatar img'), 'alt')).toBe('');
    expect(document.querySelector('.mzre-mention-name')?.textContent).toBe('Léa Martin');
  });
});
