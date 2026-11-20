import {afterEach, describe, expect, it, vi} from 'vitest';
import {mountEditor, openMentionBubble, type} from './support.js';

const bubbles = (): number => document.querySelectorAll('.yoo-mentions-dropdown').length;

describe('bulle des mentions', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('se ferme avec la croix, sans insérer de mention', async () => {
    const content = mountEditor();
    await openMentionBubble(content);
    expect(bubbles()).toBe(1);

    document.querySelector<HTMLButtonElement>('.yoo-mentions-close')!.click();

    expect(bubbles()).toBe(0);
    expect(content.querySelector('a.mention')).toBeNull();
  });

  it('a une croix accessible, aussi quand aucun membre ne correspond', async () => {
    const content = mountEditor([]);
    await openMentionBubble(content);

    expect(document.querySelector('.yoo-mentions-empty')).not.toBeNull();
    expect(document.querySelector('.yoo-mentions-close')?.getAttribute('aria-label')).toBe('Close');
  });

  it('se ferme quand on appuie en dehors, y compris dans le texte de l’éditeur', async () => {
    const content = mountEditor();
    await openMentionBubble(content);

    document.body.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    expect(bubbles()).toBe(0);

    await openMentionBubble(content);
    content.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    expect(bubbles()).toBe(0);
  });

  it('reste ouverte quand on appuie dans la bulle', async () => {
    const content = mountEditor();
    await openMentionBubble(content);

    document.querySelector('.yoo-mention-name')!.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    document.querySelector('.yoo-mentions-header')!.dispatchEvent(new Event('pointerdown', {bubbles: true}));

    expect(bubbles()).toBe(1);
  });

  it('ne laisse qu’une seule bulle quand on retape « @ »', async () => {
    const content = mountEditor();
    await openMentionBubble(content);

    type(content, '@le @');

    expect(bubbles()).toBe(1);
  });

  it('retire son écouteur de la page à la fermeture', async () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const content = mountEditor();
    await openMentionBubble(content);

    const [, handler] = add.mock.calls.find(([type]) => 'pointerdown' === type)!;
    document.querySelector<HTMLButtonElement>('.yoo-mentions-close')!.click();

    expect(remove).toHaveBeenCalledWith('pointerdown', handler, true);
  });
});
