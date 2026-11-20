import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import Editor from '../src/Editor.js';
import EmojiPicker from '../src/EmojiPicker.js';
import * as api from '../src/index.js';
import {setEditorLocale, setEditorMessages} from '../src/messages.js';
import {mountEditor} from './support.js';

const textarea = (placeholder = ''): HTMLTextAreaElement => {
  document.body.innerHTML = `<textarea id="note"></textarea>`;
  const field = document.querySelector<HTMLTextAreaElement>('#note')!;
  if (placeholder) field.setAttribute('placeholder', placeholder);

  return field;
};
const title = (command: string): string | null =>
  document.querySelector(`[data-cmd="${command}"]`)?.getAttribute('title') ?? null;
const tabLabels = (): string[] => Array.from(document.querySelectorAll('[role="tab"]')).map((tab) => tab.textContent ?? '');

describe('langue et textes de l’interface', () => {
  beforeEach(() => {
    setEditorLocale('en');
    setEditorMessages(undefined);
    EmojiPicker.destroy();
  });

  afterEach(() => {
    EmojiPicker.destroy();
    document.body.innerHTML = '';
  });

  it('is in English by default', () => {
    Editor.mount(textarea(), {});

    expect(title('bold')).toBe('Bold');
    expect(document.querySelector('.mzre-charcount')?.textContent).toContain('character');
    expect(document.querySelector('.mzre-content')?.getAttribute('data-placeholder')).toBe('Write here…');
  });

  it('switches to French with the locale option', () => {
    Editor.mount(textarea(), {locale: 'fr'});

    expect(title('bold')).toBe('Gras');
    expect(document.querySelector('.mzre-content')?.getAttribute('data-placeholder')).toBe('Écrivez ici…');
  });

  it('ignores an unknown language', () => {
    Editor.mount(textarea(), {locale: 'xx' as never});

    expect(title('bold')).toBe('Bold');
  });

  it('overrides a text, escaped: never HTML coming from the host application', () => {
    Editor.mount(textarea(), {}, {messages: {bold: '"><img src=x onerror="window.__xss=1"> Gras'}});

    expect(title('bold')).toBe('"><img src=x onerror="window.__xss=1"> Gras');
    expect(document.querySelector('.mzre-toolbar img')).toBeNull();
    expect((window as unknown as {__xss?: number}).__xss).toBeUndefined();
  });

  it('also escapes the textarea placeholder', () => {
    Editor.mount(textarea('"><img src=x onerror="window.__xss=2">'), {});

    expect(document.querySelector('.mzre-content')?.getAttribute('data-placeholder')).toBe('"><img src=x onerror="window.__xss=2">');
    expect(document.querySelector('.mzre-editor-wrap img')).toBeNull();
  });

  it('provides the emojis and the picker texts in the current language, and follows a change', async () => {
    await EmojiPicker.open({onSelect: vi.fn()});
    const english = tabLabels();
    expect(document.querySelector('.mzre-emoji-picker__title')?.textContent).toBe('Choose an emoji');
    expect(document.querySelector('.mzre-emoji-picker__tabs')?.getAttribute('aria-label')).toBe('Emoji categories');
    EmojiPicker.close();

    setEditorLocale('fr');
    await EmojiPicker.open({onSelect: vi.fn()});

    expect(document.querySelector('.mzre-emoji-picker__title')?.textContent).toBe('Choisir un emoji');
    expect(tabLabels()).not.toEqual(english);
    expect(tabLabels()).toHaveLength(english.length);
    expect(document.querySelectorAll('[role="tab"]')).toHaveLength(english.length);
  });

  it('exports the language settings', () => {
    expect(Object.keys(api)).toEqual(
      expect.arrayContaining(['Editor', 'EmojiPicker', 'messagesEn', 'messagesFr', 'setEditorLocale', 'setEditorMessages'])
    );
    expect(Object.keys(api.messagesEn).sort()).toEqual(Object.keys(api.messagesFr).sort());
  });
});

describe('onChange option', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is called at mount then on every change, with the content state', () => {
    const onChange = vi.fn();
    Editor.mount(textarea(), {onChange});
    const content = document.querySelector<HTMLElement>('.mzre-content')!;

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({html: '', text: '', isEmpty: true});

    content.textContent = 'Hello';
    content.dispatchEvent(new Event('input'));

    expect(onChange).toHaveBeenLastCalledWith({html: 'Hello', text: 'Hello', isEmpty: false});

    content.textContent = '   ';
    content.dispatchEvent(new Event('input'));

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({isEmpty: true}));
  });

  it('does not touch any button of the page', async () => {
    const content = mountEditor();
    const button = document.body.appendChild(document.createElement('button'));
    button.className = 'ys-create-post-btn';

    content.dispatchEvent(new KeyboardEvent('keyup', {code: 'KeyA'}));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(button.className).toBe('ys-create-post-btn');
  });
});
