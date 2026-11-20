import {getEditorLocale, message} from './messages.js';
import type {EditorLocale} from './messages.js';
import {escapeHtml} from './security.js';
import {EMOJI_PICKER_CSS, injectStyleSheet, removeStyleSheet} from './styles.js';
import type {EmojiPickerOptions} from './types.js';

interface EmojiRecord {
  emoji: string;
  label: string;
  group?: number;
}

interface EmojiGroup {
  key: string;
  message: string;
  order: number;
}

interface EmojiData {
  emojis: EmojiRecord[];
  groups: EmojiGroup[];
}

const ROOT_CLASS = 'mzre-emoji-picker';
const STYLE_ID = 'mzre-emoji-picker-styles';

/**
 * Chargeurs des données d'emojis, un par langue. Les imports sont écrits en toutes lettres : les
 * bundlers en font un fichier séparé par langue, chargé à la demande.
 */
const LOADERS: Record<EditorLocale, () => Promise<[{default: unknown}, {default: {groups: unknown}}]>> = {
  en: () => Promise.all([import('emojibase-data/en/data.json'), import('emojibase-data/en/messages.json')]),
  fr: () => Promise.all([import('emojibase-data/fr/data.json'), import('emojibase-data/fr/messages.json')])
};

const emojiData = new Map<EditorLocale, Promise<EmojiData>>();

/**
 * Charge les données d'emojis de la langue à la première ouverture seulement (une fois par langue).
 * Un import statique alourdirait le paquet de tous ses utilisateurs (~1 Mo) et ferait échouer son
 * import côté serveur : Node refuse un import JSON sans attribut. En cas d'échec, la prochaine
 * ouverture réessaie.
 */
function loadEmojiData(locale: EditorLocale): Promise<EmojiData> {
  let loading = emojiData.get(locale);

  if (!loading) {
    loading = LOADERS[locale]().then(([data, messages]) => {
      const emojis = data.default as EmojiRecord[];

      return {
        emojis,
        groups: (messages.default.groups as EmojiGroup[])
          .filter(group => emojis.some(emoji => emoji.group === group.order))
      };
    }).catch((error: unknown) => {
      emojiData.delete(locale);

      throw error;
    });
    emojiData.set(locale, loading);
  }

  return loading;
}



export default class EmojiPicker {
  private static root: HTMLElement | null = null;
  private static panel: HTMLElement | null = null;
  private static tabs: HTMLButtonElement[] = [];
  private static onSelect: ((emoji: string) => void) | null = null;
  private static previousFocus: HTMLElement | null = null;
  private static previousBodyOverflow = '';
  private static data: EmojiData | null = null;
  private static dataLocale: EditorLocale | null = null;
  private static pending: Promise<void> | null = null;

  /**
   * Ouvre le sélecteur : la fenêtre s'affiche aussitôt, les emojis arrivent dès que leurs données
   * sont chargées. La promesse est résolue une fois les emojis affichés (ou, en cas d'échec de
   * chargement, une fois le message d'erreur affiché) : elle n'est jamais rejetée.
   */
  static open(options: EmojiPickerOptions): Promise<void> {
    this.ensureMounted();
    this.onSelect = options.onSelect;
    this.previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const title = this.root!.querySelector<HTMLElement>('.mzre-emoji-picker__title');
    const close = this.root!.querySelector<HTMLButtonElement>('.mzre-emoji-picker__close');
    if (title) title.textContent = options.title ?? message('chooseEmoji');
    if (close) close.setAttribute('aria-label', options.closeLabel ?? message('close'));
    this.root!.querySelector('.mzre-emoji-picker__tabs')?.setAttribute('aria-label', message('emojiCategories'));

    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.root!.hidden = false;
    document.addEventListener('keydown', this.handleDocumentKeydown);

    // Données déjà chargées : on retombe sur l'onglet actif ; sinon sur la zone, en attendant.
    if (this.hasCurrentData()) this.focusSelectedTab();
    else this.panel?.focus();

    return this.showEmojis();
  }

  static close(): void {
    if (!this.root || this.root.hidden) return;

    this.root.hidden = true;
    this.onSelect = null;
    document.body.style.overflow = this.previousBodyOverflow;
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    this.previousFocus?.focus();
    this.previousFocus = null;
  }

  static destroy(): void {
    if (this.root && !this.root.hidden) this.close();
    this.root?.remove();
    removeStyleSheet(STYLE_ID);
    this.root = null;
    this.panel = null;
    this.tabs = [];
    this.onSelect = null;
    this.data = null;
    this.dataLocale = null;
    this.pending = null;
  }

  /** Les données affichées sont celles de la langue courante (elle peut changer entre deux ouvertures). */
  private static hasCurrentData(): boolean {
    return this.data !== null && this.dataLocale === getEditorLocale();
  }

  /** Une seule mise en place à la fois : une réouverture pendant le chargement attend la même. */
  private static showEmojis(): Promise<void> {
    if (this.hasCurrentData()) return Promise.resolve();

    if (this.pending) return this.pending;

    const pending: Promise<void> = this.renderEmojis().finally(() => {
      // Seulement si c'est toujours elle : un destroy() puis un nouvel open() peut l'avoir remplacée.
      if (this.pending === pending) this.pending = null;
    });
    this.pending = pending;

    return pending;
  }

  private static focusSelectedTab(): void {
    this.tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.focus();
  }

  /** Affiche les catégories et les emojis, ou l'erreur de chargement ; ne rejette jamais. */
  private static async renderEmojis(): Promise<void> {
    const root = this.root;
    const locale = getEditorLocale();

    this.panel?.setAttribute('aria-busy', 'true');
    this.setPanelMessage(message('emojiLoading'));

    try {
      const data = await loadEmojiData(locale);
      // Détruit ou remonté entre-temps : ces données ne concernent plus cette fenêtre.
      if (this.root !== root || !root) return;

      this.data = data;
      this.dataLocale = locale;
      const tabsContainer = root.querySelector<HTMLElement>('.mzre-emoji-picker__tabs')!;
      tabsContainer.replaceChildren();
      this.tabs = data.groups.map((group, index) => this.createTab(group, index, tabsContainer));
      this.activateGroup(0);
      if (!root.hidden) this.focusSelectedTab();
    } catch (error) {
      console.error('[EmojiPicker] chargement des emojis impossible', error);
      if (this.root === root) this.setPanelMessage(message('emojiLoadError'));
    } finally {
      if (this.root === root) this.panel?.removeAttribute('aria-busy');
    }
  }

  private static setPanelMessage(message: string): void {
    const paragraph = document.createElement('p');
    paragraph.className = 'mzre-emoji-picker__status';
    paragraph.setAttribute('role', 'status');
    paragraph.textContent = message;
    this.panel?.replaceChildren(paragraph);
  }

  private static ensureMounted(): void {
    if (this.root?.isConnected) return;

    injectStyleSheet(STYLE_ID, EMOJI_PICKER_CSS);

    const root = document.createElement('div');
    root.className = ROOT_CLASS;
    root.hidden = true;
    root.innerHTML = `
      <section class="mzre-emoji-picker__dialog" role="dialog" aria-modal="true" aria-labelledby="mzre-emoji-picker-title">
        <header class="mzre-emoji-picker__header">
          <h2 class="mzre-emoji-picker__title" id="mzre-emoji-picker-title">${escapeHtml(message('chooseEmoji'))}</h2>
          <button class="mzre-emoji-picker__close" type="button" aria-label="${escapeHtml(message('close'))}">×</button>
        </header>
        <div class="mzre-emoji-picker__tabs" role="tablist" aria-label="${escapeHtml(message('emojiCategories'))}"></div>
        <div class="mzre-emoji-picker__panel" role="tabpanel" tabindex="0"></div>
      </section>
    `;

    root.addEventListener('click', event => {
      if (event.target === root) this.close();
    });
    root.querySelector('.mzre-emoji-picker__close')?.addEventListener('click', () => this.close());

    this.root = root;
    this.panel = root.querySelector<HTMLElement>('.mzre-emoji-picker__panel');
    document.body.appendChild(root);
  }

  private static createTab(group: EmojiGroup, index: number, container: HTMLElement): HTMLButtonElement {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'mzre-emoji-picker__tab';
    tab.id = `mzre-emoji-tab-${group.key}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(index === 0));
    tab.setAttribute('aria-controls', 'mzre-emoji-picker-panel');
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.textContent = group.message;
    tab.addEventListener('click', () => this.activateGroup(index));
    tab.addEventListener('keydown', event => this.handleTabKeydown(event, index));
    container.appendChild(tab);

    return tab;
  }

  private static activateGroup(index: number): void {
    const group = this.data?.groups[index];
    if (!group || !this.panel) return;

    this.tabs.forEach((tab, tabIndex) => {
      tab.setAttribute('aria-selected', String(tabIndex === index));
      tab.tabIndex = tabIndex === index ? 0 : -1;
    });
    this.panel.id = 'mzre-emoji-picker-panel';
    this.panel.setAttribute('aria-labelledby', `mzre-emoji-tab-${group.key}`);
    this.panel.replaceChildren();

    this.data!.emojis.filter(emoji => emoji.group === group.order).forEach(emoji => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mzre-emoji-picker__item';
      button.textContent = emoji.emoji;
      button.title = emoji.label;
      button.setAttribute('aria-label', emoji.label);
      button.addEventListener('click', () => {
        const callback = this.onSelect;
        this.close();
        callback?.(emoji.emoji);
      });
      this.panel!.appendChild(button);
    });
    this.panel.scrollTop = 0;
  }

  private static handleTabKeydown(event: KeyboardEvent, index: number): void {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % this.tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + this.tabs.length) % this.tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = this.tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    this.activateGroup(nextIndex);
    this.tabs[nextIndex]?.focus();
  }

  private static handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();

      return;
    }

    if (event.key !== 'Tab' || !this.root) return;
    const focusable = Array.from(this.root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(element => !element.hidden);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
}
