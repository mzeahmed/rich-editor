import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import EmojiPicker from '../src/EmojiPicker.js';

const panel = (): HTMLElement => document.querySelector<HTMLElement>('.yoo-emoji-picker__panel')!;
const tabs = (): HTMLButtonElement[] => Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));

describe('EmojiPicker : chargement à la demande des emojis', () => {
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

  it('affiche la fenêtre aussitôt avec un état de chargement, puis les emojis', async () => {
    const ready = EmojiPicker.open({onSelect: vi.fn()});

    expect(document.querySelector<HTMLElement>('.yoo-emoji-picker')?.hidden).toBe(false);
    expect(panel().getAttribute('aria-busy')).toBe('true');
    expect(panel().querySelector('[role="status"]')?.textContent).toContain('Loading');
    expect(document.querySelectorAll('.yoo-emoji-picker__item')).toHaveLength(0);

    await ready;

    expect(panel().hasAttribute('aria-busy')).toBe(false);
    expect(document.querySelectorAll('.yoo-emoji-picker__item').length).toBeGreaterThan(0);
    expect(tabs().length).toBeGreaterThan(1);
    expect(document.activeElement).toBe(tabs()[0]);
  });

  it('ne crée pas les onglets en double quand on rouvre pendant le chargement', async () => {
    await Promise.all([EmojiPicker.open({onSelect: vi.fn()}), EmojiPicker.open({onSelect: vi.fn()})]);
    const count = tabs().length;

    EmojiPicker.close();
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(count).toBeGreaterThan(1);
    expect(tabs()).toHaveLength(count);
  });

  it('remet le focus sur l’onglet actif quand on rouvre une fois les données chargées', async () => {
    await EmojiPicker.open({onSelect: vi.fn()});
    tabs()[2].click();
    EmojiPicker.close();

    await EmojiPicker.open({onSelect: vi.fn()});

    expect(document.activeElement).toBe(tabs()[2]);
  });

  it('affiche une erreur sans rejeter la promesse quand le chargement échoue, puis réessaie', async () => {
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
    expect(document.querySelectorAll('.yoo-emoji-picker__item')).toHaveLength(1);
    Picker.destroy();
  });
});
