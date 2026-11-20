import {afterEach, describe, expect, it, vi} from 'vitest';
import type {EditorUser} from '../src/types.js';
import {mountEditor, openMentionBubble, USERS} from './support.js';

const user = (overrides: Partial<EditorUser>): EditorUser => ({...USERS[0], ...overrides});
const items = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('.mzre-mention-item'));

describe('mention bubble: data from the host application', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    delete (window as unknown as {__xss?: number}).__xss;
  });

  it('displays a name containing HTML as text, without creating an element', async () => {
    const hostile = '<img src=x onerror="window.__xss=1">';
    const content = mountEditor([user({firstName: hostile, lastName: '<b>Martin</b>'})]);
    await openMentionBubble(content);

    const dropdown = document.querySelector('.mzre-mentions-dropdown')!;
    expect(dropdown.querySelector('.mzre-mention-name')!.textContent).toBe(`${hostile} <b>Martin</b>`);
    expect(dropdown.querySelector('img[onerror], b')).toBeNull();
    expect((window as unknown as {__xss?: number}).__xss).toBeUndefined();
  });

  it('keeps a hostile id inside its attribute, without injecting others', async () => {
    const content = mountEditor([user({ID: '7" onmouseover="window.__xss=1" x="'})]);
    await openMentionBubble(content);

    const [item] = items();
    expect(item.dataset.userId).toBe('7" onmouseover="window.__xss=1" x="');
    expect(item.getAttributeNames().sort()).toEqual(['aria-selected', 'class', 'data-profile-url', 'data-user-id', 'id', 'role']);
  });

  it('replaces an avatar that is not http(s) with the initials', async () => {
    const content = mountEditor([user({avatarUrl: 'javascript:alert(1)'})]);
    await openMentionBubble(content);

    expect(document.querySelector('.mzre-mention-avatar img')).toBeNull();
    expect(document.querySelector('.mzre-mention-avatar-fallback')!.textContent).toBe('LM');
  });

  it('displays the avatar when the URL is http(s)', async () => {
    const content = mountEditor([user({avatarUrl: 'https://exemple.test/lea.png'})]);
    await openMentionBubble(content);

    expect(document.querySelector<HTMLImageElement>('.mzre-mention-avatar img')!.src).toBe('https://exemple.test/lea.png');
  });

  it('never offers a profile path that points to another domain', async () => {
    const content = mountEditor([user({profileUrl: 'https://exemple.test//autre-site.test/p'})]);
    await openMentionBubble(content);

    const profileUrl = items()[0].dataset.profileUrl!;
    expect(profileUrl.startsWith('/')).toBe(true);
    expect(profileUrl.startsWith('//')).toBe(false);
  });

  it('ignores a member without a usable profile URL, without error', async () => {
    const content = mountEditor([
      user({ID: '1', profileUrl: 'javascript:alert(1)'}),
      user({ID: '2', profileUrl: 'https://exemple.test/membres/leo/'})
    ]);
    await openMentionBubble(content);

    expect(items().map((item) => item.dataset.userId)).toEqual(['2']);
  });

  it('displays "no user" when no member is usable', async () => {
    const content = mountEditor([user({profileUrl: 'http://'})]);
    await openMentionBubble(content);

    expect(items()).toHaveLength(0);
    expect(document.querySelector('.mzre-mentions-empty')).not.toBeNull();
  });
});

describe('initial content of the editor', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as unknown as {__xss?: number}).__xss;
  });

  it('is sanitized: no script, no event handler, mentions kept', () => {
    const content = mountEditor(
      USERS,
      '<p>Hi <a class="mention" data-user-id="7" href="/profile/lea">Léa</a>' +
        '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script></p>'
    );

    expect(content.querySelector('script, img')).toBeNull();
    expect(content.innerHTML).not.toMatch(/onerror/i);
    expect(content.textContent).toContain('Hi');
    expect(content.querySelector('a.mention')?.getAttribute('data-user-id')).toBe('7');
    expect((window as unknown as {__xss?: number}).__xss).toBeUndefined();
  });
});
