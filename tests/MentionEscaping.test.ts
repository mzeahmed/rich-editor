import {afterEach, describe, expect, it, vi} from 'vitest';
import type {EditorUser} from '../src/types.js';
import {mountEditor, openMentionBubble, USERS} from './support.js';

const user = (overrides: Partial<EditorUser>): EditorUser => ({...USERS[0], ...overrides});
const items = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('.yoo-mention-item'));

describe('bulle des mentions : données de l’application hôte', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    delete (window as unknown as {__xss?: number}).__xss;
  });

  it('affiche un nom contenant du HTML comme du texte, sans créer d’élément', async () => {
    const hostile = '<img src=x onerror="window.__xss=1">';
    const content = mountEditor([user({firstName: hostile, lastName: '<b>Martin</b>'})]);
    await openMentionBubble(content);

    const dropdown = document.querySelector('.yoo-mentions-dropdown')!;
    expect(dropdown.querySelector('.yoo-mention-name')!.textContent).toBe(`${hostile} <b>Martin</b>`);
    expect(dropdown.querySelector('img[onerror], b')).toBeNull();
    expect((window as unknown as {__xss?: number}).__xss).toBeUndefined();
  });

  it('garde un identifiant hostile dans son attribut, sans en injecter d’autres', async () => {
    const content = mountEditor([user({ID: '7" onmouseover="window.__xss=1" x="'})]);
    await openMentionBubble(content);

    const [item] = items();
    expect(item.dataset.userId).toBe('7" onmouseover="window.__xss=1" x="');
    expect(item.getAttributeNames().sort()).toEqual(['aria-selected', 'class', 'data-profile-url', 'data-user-id', 'id', 'role']);
  });

  it('remplace par les initiales un avatar qui n’est pas en http(s)', async () => {
    const content = mountEditor([user({avatarUrl: 'javascript:alert(1)'})]);
    await openMentionBubble(content);

    expect(document.querySelector('.yoo-mention-avatar img')).toBeNull();
    expect(document.querySelector('.yoo-mention-avatar-fallback')!.textContent).toBe('LM');
  });

  it('affiche l’avatar quand l’adresse est en http(s)', async () => {
    const content = mountEditor([user({avatarUrl: 'https://exemple.test/lea.png'})]);
    await openMentionBubble(content);

    expect(document.querySelector<HTMLImageElement>('.yoo-mention-avatar img')!.src).toBe('https://exemple.test/lea.png');
  });

  it('ne propose jamais un chemin de profil qui désigne un autre domaine', async () => {
    const content = mountEditor([user({profileUrl: 'https://exemple.test//autre-site.test/p'})]);
    await openMentionBubble(content);

    const profileUrl = items()[0].dataset.profileUrl!;
    expect(profileUrl.startsWith('/')).toBe(true);
    expect(profileUrl.startsWith('//')).toBe(false);
  });

  it('ignore un membre sans adresse de profil exploitable, sans erreur', async () => {
    const content = mountEditor([
      user({ID: '1', profileUrl: 'javascript:alert(1)'}),
      user({ID: '2', profileUrl: 'https://exemple.test/membres/leo/'})
    ]);
    await openMentionBubble(content);

    expect(items().map((item) => item.dataset.userId)).toEqual(['2']);
  });

  it('affiche « aucun utilisateur » quand aucun membre n’est exploitable', async () => {
    const content = mountEditor([user({profileUrl: 'http://'})]);
    await openMentionBubble(content);

    expect(items()).toHaveLength(0);
    expect(document.querySelector('.yoo-mentions-empty')).not.toBeNull();
  });
});

describe('contenu initial de l’éditeur', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as unknown as {__xss?: number}).__xss;
  });

  it('est nettoyé : aucun script, aucun gestionnaire d’événement, mentions conservées', () => {
    const content = mountEditor(
      USERS,
      '<p>Salut <a class="mention" data-user-id="7" href="/profil/lea">Léa</a>' +
        '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script></p>'
    );

    expect(content.querySelector('script, img')).toBeNull();
    expect(content.innerHTML).not.toMatch(/onerror/i);
    expect(content.textContent).toContain('Salut');
    expect(content.querySelector('a.mention')?.getAttribute('data-user-id')).toBe('7');
    expect((window as unknown as {__xss?: number}).__xss).toBeUndefined();
  });
});
