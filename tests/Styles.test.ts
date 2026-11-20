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

describe('injection des styles', () => {
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

  it('injecte les styles de l’éditeur et du sélecteur par défaut, une seule fois chacun', async () => {
    Editor.mount(textarea(), {});
    await EmojiPicker.open({onSelect: vi.fn()});
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(styleTags().map((tag) => tag.id).sort()).toEqual(['yoo-editor-styles', 'yoo-emoji-picker-styles']);
    expect(document.getElementById('yoo-editor-styles')!.textContent).toBe(EDITOR_CSS);
    expect(document.getElementById('yoo-emoji-picker-styles')!.textContent).toBe(EMOJI_PICKER_CSS);
  });

  it('n’ajoute aucune balise style quand l’injection est coupée (option de montage)', async () => {
    Editor.mount(textarea(), {styles: {inject: false}});
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(styleTags()).toHaveLength(0);
    // L'éditeur et le sélecteur fonctionnent quand même, en attendant que la page charge style.css.
    expect(document.querySelector('.yoo-content')).not.toBeNull();
    expect(document.querySelectorAll('.yoo-emoji-picker__item').length).toBeGreaterThan(0);
  });

  it('pose le nonce de la CSP sur les balises injectées', async () => {
    setEditorStyles({nonce: 'abc123'});
    Editor.mount(textarea(), {});
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(styleTags()).toHaveLength(2);
    styleTags().forEach((tag) => expect(tag.getAttribute('nonce')).toBe('abc123'));
  });

  it('retire le nonce quand on lui donne une valeur vide', () => {
    setEditorStyles({nonce: 'abc123'});
    setEditorStyles({nonce: undefined});
    Editor.mount(textarea(), {});

    expect(document.getElementById('yoo-editor-styles')!.hasAttribute('nonce')).toBe(false);
  });
});

describe('barre d’outils sans attribut style', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('met en forme les boutons U et S par classe, pas par attribut style=""', () => {
    Editor.mount(textarea(), {});

    expect(document.querySelectorAll('.yoo-toolbar [style]')).toHaveLength(0);
    expect(document.querySelector('[data-cmd="underline"]')!.classList.contains('yoo-btn-underline')).toBe(true);
    expect(document.querySelector('[data-cmd="strikeThrough"]')!.classList.contains('yoo-btn-strike')).toBe(true);
    expect(EDITOR_CSS).toContain('.yoo-toolbar button.yoo-btn-underline');
    expect(EDITOR_CSS).toContain('.yoo-toolbar button.yoo-btn-strike');
  });
});
