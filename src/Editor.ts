/**
 * Éditeur riche autonome — 0 dépendance externe.
 * Remplace automatiquement les <textarea> par un éditeur contenteditable enrichi.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * UTILISATION DE BASE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1) Tous les <textarea> de la page
 *    Editor.init();
 *
 * 2) Sélecteur CSS ciblé
 *    Editor.init({ selector: '.richtext' });
 *
 * 3) Exclure certains textarea
 *    Editor.init({ exclude: '.no-editor' });
 *
 * 4) Monter sur un élément précis (DOM dynamique)
 *    Editor.mount('#my-textarea');
 *    Editor.mount(textareaElement);
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * OPTIONS TOOLBAR
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * toolbar: 'always'  → barre toujours visible (défaut)
 *    Editor.init({ toolbar: 'always' });
 *
 * toolbar: 'focus'   → barre affichée uniquement quand le champ est focusé
 *    Editor.init({ toolbar: 'focus' });
 *
 * toolbar: 'toggle'  → bouton "Mise en forme" pour afficher/masquer la barre
 *    Editor.init({ toolbar: 'toggle' });
 *
 * toolbar: 'never'   → aucune barre (champ de saisie simple enrichi)
 *    Editor.init({ toolbar: 'never' });
 *
 * Surcharge par textarea individuel via attribut data :
 *    <textarea data-yoo-toolbar="focus"></textarea>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FOOTER (compteur de caractères + boutons HTML / Effacer / Copier)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Masquer le footer (utile pour les champs embarqués, ex. messagerie) :
 *    Editor.mount('#msg-textarea', { footer: false });
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HAUTEUR DE LA ZONE DE SAISIE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Via les options JS :
 *    Editor.mount('#my-textarea', { minHeight: '80px', maxHeight: '300px' });
 *
 * Via attributs data sur le <textarea> (prioritaires sur les options JS) :
 *    <textarea data-yoo-min-height="60px" data-yoo-max-height="200px"></textarea>
 *
 * Quand maxHeight est défini, overflow-y: auto est activé automatiquement.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EMOJI
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Ajoute un bouton 😊 inline à la zone de saisie. Le sélecteur est fourni par le paquet
 * (aucune modale à préparer) ; ses données sont chargées à la première ouverture.
 *
 *    Editor.mount('#editor', { emoji: true });
 *
 * Combiné sans toolbar (type champ de post/commentaire) :
 *    Editor.mount('#post-textarea', {
 *      toolbar: 'never',
 *      footer: false,
 *      emoji: true,
 *    });
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MENTIONS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Active la saisie assistée des mentions @utilisateur (nécessite integrations.mentions) :
 *   · Frappe @ → bulle de recherche d'utilisateurs (integrations.mentions.searchUsers)
 *   · Sélection → insère <a class="mention" href="/profil" data-user-id="…">Prénom Nom</a>
 *   · Fermeture sur Espace / Échap / Entrée, par la croix, ou par un clic à l'extérieur
 *
 * Activation simple :
 *    Editor.mount('#editor', { mention: true }, { mentions: … });
 *
 * Combinaison complète (type formulaire de publication), avec un bouton « publier » désactivé
 * tant que le champ est vide (onChange est aussi appelé une fois au montage) :
 *    Editor.mount('#post-textarea', {
 *      toolbar: 'never',
 *      footer: false,
 *      emoji: true,
 *      mention: true,
 *      onChange: ({ isEmpty }) => { publishButton.disabled = isEmpty; },
 *    }, { mentions: … });
 *
 * Combinaison commentaire :
 *    Editor.mount('#comment-textarea', {
 *      toolbar: 'never',
 *      footer: false,
 *      emoji: true,
 *      mention: true,
 *    });
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LANGUE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Interface et emojis en anglais par défaut ; { locale: 'fr' } (ou setEditorLocale('fr')) pour le
 * français. Un texte peut être remplacé : integrations.messages = { close: 'Fermer' }.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CAS D'USAGE COMPLETS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * A) Éditeur de contenu riche (article, description longue)
 *    Editor.init({
 *      selector: 'textarea.rich-content',
 *      toolbar: 'always',
 *      minHeight: '300px',
 *    });
 *
 * B) Éditeur compact pour commentaires (toolbar au focus)
 *    Editor.init({
 *      selector: 'textarea.comment',
 *      toolbar: 'focus',
 *      minHeight: '80px',
 *      maxHeight: '200px',
 *      footer: false,
 *    });
 *
 * C) Champ de saisie messagerie (sans toolbar, sans footer, hauteur fixe)
 *    Editor.mount('#messaging-textarea', {
 *      toolbar: 'never',
 *      footer: false,
 *      minHeight: '40px',
 *      maxHeight: '120px',
 *    });
 *
 * D) Éditeur avec barre optionnelle via bouton toggle
 *    Editor.mount('#post-content', { toolbar: 'toggle' });
 *
 * E) Montage sur un élément ajouté dynamiquement (ex. modale ouverte)
 *    modal.addEventListener('shown', () => { // événement d'ouverture de votre modale
 *      Editor.mount('#modal-textarea', { toolbar: 'focus', minHeight: '120px' });
 *    });
 *
 * F) Surcharge par textarea individuel (attributs data, sans JS supplémentaire)
 *    <textarea
 *      data-yoo-toolbar="toggle"
 *      data-yoo-min-height="100px"
 *      data-yoo-max-height="400px"
 *    ></textarea>
 *    puis : Editor.init();   ← les attributs data prennent le dessus
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHAÎNAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * init() et mount() retournent la classe, le chaînage est possible :
 *    Editor
 *      .init({ selector: '.rich', toolbar: 'always' })
 *      .mount('#extra-field', { toolbar: 'never', footer: false });
 */

import EmojiPicker from './EmojiPicker.js';
import {escapeHtml, safeHttpUrl, safeSitePath, sanitizeHtml} from './security.js';
import {EDITOR_CSS, injectStyleSheet, setEditorStyles} from './styles.js';
import type {StyleOptions} from './styles.js';
import {message as t, setEditorLocale, setEditorMessages} from './messages.js';
import type {EditorLocale, EditorMessages} from './messages.js';
import type {EditorIntegrations, EditorMentionIntegration, EditorUser,} from './types.js';

/** Texte de l'interface, échappé pour être inséré dans du HTML. */
const te = (key: keyof EditorMessages): string => escapeHtml(t(key));

/** État du contenu, transmis à `onChange` à chaque modification et une fois au montage. */
export interface EditorChange {
  html: string;
  text: string;
  isEmpty: boolean;
}

export interface EditorOptions {
  selector?: string;
  exclude?: string;
  /** 'always' | 'toggle' | 'focus' | 'never' — défaut : 'always' */
  toolbar?: 'always' | 'toggle' | 'focus' | 'never';
  /** Afficher ou masquer le footer (compteur + boutons) — défaut : true */
  footer?: boolean;
  /** Hauteur minimale de la zone de saisie (ex: '80px', '4rem') — défaut : '160px' */
  minHeight?: string;
  /** Hauteur maximale de la zone de saisie avant scroll (ex: '400px') */
  maxHeight?: string;
  /** Ajoute un bouton emoji inline à la zone de saisie */
  emoji?: boolean;
  /** Active les mentions @ (nécessite `integrations.mentions`) */
  mention?: boolean;
  /** Langue de l'interface et des emojis : 'en' (défaut) ou 'fr'. Réglage global de la page. */
  locale?: EditorLocale;
  /**
   * Injection des styles (réglage global de la page) : `{inject: false}` pour charger vous-même
   * `@mzeahmed/rich-editor/style.css`, `{nonce}` pour une CSP à nonce. Voir `setEditorStyles()`.
   */
  styles?: StyleOptions;
  /**
   * Appelé à chaque modification du contenu (saisie, barre d'outils, mention) et une fois au
   * montage : de quoi activer ou désactiver un bouton « publier » selon que le champ est vide.
   */
  onChange?: (change: EditorChange) => void;
}

interface MentionState {
  isSearch: boolean;
  atNode: Text | null;
  atOffset: number;
  previousTerm: string | null;
  dropdown: HTMLElement | null;
  /** Zone de saisie : porte les attributs ARIA tant que la bulle est ouverte. */
  content: HTMLElement;
  /** Option choisie au clavier (-1 : aucune, Entrée garde alors son rôle habituel). */
  activeIndex: number;
  /** Identifiant de la liste d'options, cible de `aria-controls`. */
  listId: string | null;
  /** Retire l'écouteur « clic à l'extérieur » posé à l'ouverture de la bulle. */
  stopOutsideClose: (() => void) | null;
}

let mentionBubbleCount = 0;

/**
 * Attributs ARIA que la zone de saisie (rôle `textbox`) porte tant que la bulle des mentions est
 * ouverte. Seuls ceux que ce rôle accepte : `aria-expanded` et `aria-haspopup` ne le sont pas.
 */
const MENTION_ARIA = ['aria-autocomplete', 'aria-controls', 'aria-activedescendant'];

/* ─────────────────────────────────────────
   CSS injecté une seule fois dans <head>
───────────────────────────────────────── */


/* ─────────────────────────────────────────
   SVG icons inline
───────────────────────────────────────── */
const ICONS: Record<string, string> = {
  ul: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="2" cy="3.5" r="1.3" fill="currentColor"/><rect x="5" y="2.8" width="8" height="1.4" rx="0.7" fill="currentColor"/><circle cx="2" cy="7" r="1.3" fill="currentColor"/><rect x="5" y="6.3" width="8" height="1.4" rx="0.7" fill="currentColor"/><circle cx="2" cy="10.5" r="1.3" fill="currentColor"/><rect x="5" y="9.8" width="8" height="1.4" rx="0.7" fill="currentColor"/></svg>`,
  ol: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><text x="0" y="5" font-size="5" fill="currentColor" font-family="sans-serif">1.</text><rect x="5" y="2.8" width="8" height="1.4" rx="0.7" fill="currentColor"/><text x="0" y="9" font-size="5" fill="currentColor" font-family="sans-serif">2.</text><rect x="5" y="6.3" width="8" height="1.4" rx="0.7" fill="currentColor"/><text x="0" y="13" font-size="5" fill="currentColor" font-family="sans-serif">3.</text><rect x="5" y="9.8" width="8" height="1.4" rx="0.7" fill="currentColor"/></svg>`,
  alignL: `<svg width="14" height="12" viewBox="0 0 14 12"><rect y="0" width="14" height="1.5" rx=".75" fill="currentColor"/><rect y="3.5" width="10" height="1.5" rx=".75" fill="currentColor"/><rect y="7" width="14" height="1.5" rx=".75" fill="currentColor"/><rect y="10.5" width="8" height="1.5" rx=".75" fill="currentColor"/></svg>`,
  alignC: `<svg width="14" height="12" viewBox="0 0 14 12"><rect y="0" width="14" height="1.5" rx=".75" fill="currentColor"/><rect x="2" y="3.5" width="10" height="1.5" rx=".75" fill="currentColor"/><rect y="7" width="14" height="1.5" rx=".75" fill="currentColor"/><rect x="3" y="10.5" width="8" height="1.5" rx=".75" fill="currentColor"/></svg>`,
  alignR: `<svg width="14" height="12" viewBox="0 0 14 12"><rect y="0" width="14" height="1.5" rx=".75" fill="currentColor"/><rect x="4" y="3.5" width="10" height="1.5" rx=".75" fill="currentColor"/><rect y="7" width="14" height="1.5" rx=".75" fill="currentColor"/><rect x="6" y="10.5" width="8" height="1.5" rx=".75" fill="currentColor"/></svg>`,
  link: `<svg width="15" height="14" viewBox="0 0 15 14" fill="none"><path d="M6 8.5a3.5 3.5 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5L6.5 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M9 5.5a3.5 3.5 0 0 0-5 0L2 7.5a3.536 3.536 0 0 0 5 5L8.5 11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  clear: `<svg width="15" height="14" viewBox="0 0 15 14" fill="none"><path d="M3 11h9M5.5 3h5l-2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><line x1="2" y1="2" x2="13" y2="12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  undo: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5h6a4 4 0 0 1 0 8H6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2 5l3-3M2 5l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  redo: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 5H6a4 4 0 0 0 0 8h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M12 5l-3-3M12 5l-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

export default class Editor {

  /* ─────────────────────────────────────────
     Inject CSS une seule fois
  ───────────────────────────────────────── */
  private static injectStyles (): void {
    injectStyleSheet('yoo-editor-styles', EDITOR_CSS);
  }

  /* ─────────────────────────────────────────
     Fabrique le HTML d'un éditeur
  ───────────────────────────────────────── */
  private static buildEditorHTML (placeholder: string, toolbarMode: string, label: string): string {
    const toggleBar = toolbarMode === 'toggle'
      ? `<div class="yoo-toolbar-toggle">
           <button type="button" class="yoo-toggle-btn" title="${te('toggleToolbar')}">
             <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect y="0" width="12" height="1.5" rx=".75" fill="currentColor"/><rect y="4" width="12" height="1.5" rx=".75" fill="currentColor"/><rect y="8" width="12" height="1.5" rx=".75" fill="currentColor"/></svg>
             ${te('formatting')}
           </button>
         </div>`
      : '';

    // Pour le mode 'never', toolbar et link bar ne sont pas rendus dans le DOM
    // `type="button"` sur chaque bouton : sans lui, un <button> dans un
    // <form> vaut implicitement type="submit" et soumet le formulaire hôte
    // au clic (ex. FeedComposer.tsx) au lieu d'exécuter sa commande d'édition.
    const toolbarAndLinkBar = toolbarMode !== 'never' ? `
      <div class="yoo-toolbar">
        <select class="yoo-block-select" aria-label="${te('textStyle')}">
          <option value="p">${te('paragraph')}</option>
          <option value="h2">${te('heading')}</option>
          <option value="h3">${te('subheading')}</option>
          <option value="blockquote">${te('quote')}</option>
        </select>
        <div class="yoo-sep"></div>
        <button type="button" data-cmd="bold"               title="${te('bold')}"><b>B</b></button>
        <button type="button" data-cmd="italic"             title="${te('italic')}"><i>I</i></button>
        <button type="button" data-cmd="underline"          title="${te('underline')}" class="yoo-btn-underline">U</button>
        <button type="button" data-cmd="strikeThrough"      title="${te('strikethrough')}" class="yoo-btn-strike">S</button>
        <div class="yoo-sep"></div>
        <button type="button" data-cmd="insertUnorderedList" title="${te('bulletList')}">${ICONS.ul}</button>
        <button type="button" data-cmd="insertOrderedList"   title="${te('numberedList')}">${ICONS.ol}</button>
        <div class="yoo-sep"></div>
        <button type="button" data-cmd="justifyLeft"   title="${te('alignLeft')}">${ICONS.alignL}</button>
        <button type="button" data-cmd="justifyCenter" title="${te('alignCenter')}">${ICONS.alignC}</button>
        <button type="button" data-cmd="justifyRight"  title="${te('alignRight')}">${ICONS.alignR}</button>
        <div class="yoo-sep"></div>
        <button type="button" data-action="link"        title="${te('insertLink')}">${ICONS.link}</button>
        <button type="button" data-cmd="removeFormat"   title="${te('clearFormatting')}">${ICONS.clear}</button>
        <div class="yoo-sep"></div>
        <button type="button" data-cmd="undo"  title="${te('undo')}">${ICONS.undo}</button>
        <button type="button" data-cmd="redo"  title="${te('redo')}">${ICONS.redo}</button>
      </div>

      <div class="yoo-link-bar">
        <input type="text" class="yoo-link-input" placeholder="https://" />
        <button type="button" class="yoo-btn-insert">${te('insert')}</button>
        <button type="button" class="yoo-btn-remove">${te('remove')}</button>
        <button type="button" class="yoo-btn-close">×</button>
      </div>` : '';

    return `
      ${toggleBar}
      ${toolbarAndLinkBar}

      <div class="yoo-content-wrap"><div
        class="yoo-content"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        aria-label="${escapeHtml(label) || escapeHtml(placeholder) || te('placeholder')}"
        data-placeholder="${escapeHtml(placeholder) || te('placeholder')}"
      ></div></div>

      <div class="yoo-export-box"></div>

      <div class="yoo-footer">
        <span class="yoo-charcount">0 ${te('character')}</span>
        <div class="yoo-footer-actions">
          <button type="button" class="yoo-btn-action yoo-btn-html">${te('html')}</button>
          <button type="button" class="yoo-btn-action yoo-btn-clear">${te('clear')}</button>
          <button type="button" class="yoo-btn-primary yoo-btn-copy">${te('copyContent')}</button>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────
     Monte l'éditeur sur un <textarea>
  ───────────────────────────────────────── */
  private static mountEditor (textarea: HTMLTextAreaElement, opts: EditorOptions = {}, integrations: EditorIntegrations = {}): void {
    if (textarea.dataset.yooMounted) return;

    if (opts.locale) setEditorLocale(opts.locale);
    if (integrations.messages) setEditorMessages(integrations.messages);

    textarea.dataset.yooMounted = 'true';

    const placeholder = textarea.getAttribute('placeholder') ?? '';
    const initialValue = textarea.value ?? '';
    const toolbarMode = (textarea.dataset.yooToolbar ?? opts.toolbar ?? 'always') as EditorOptions['toolbar'];
    const showFooter = opts.footer !== false;
    const minHeight = textarea.dataset.yooMinHeight ?? opts.minHeight ?? null;
    const maxHeight = textarea.dataset.yooMaxHeight ?? opts.maxHeight ?? null;

    const wrap = document.createElement('div');
    wrap.className = 'yoo-editor-wrap';
    // Nom accessible de la zone de saisie : l'aria-label du textarea, sinon son placeholder.
    wrap.innerHTML = Editor.buildEditorHTML(placeholder, toolbarMode!, textarea.getAttribute('aria-label') ?? '');

    textarea.parentNode!.insertBefore(wrap, textarea);
    textarea.style.display = 'none';

    const content = wrap.querySelector<HTMLElement>('.yoo-content')!;
    const toolbar = wrap.querySelector<HTMLElement>('.yoo-toolbar');
    const linkBar = wrap.querySelector<HTMLElement>('.yoo-link-bar');
    const linkInput = wrap.querySelector<HTMLInputElement>('.yoo-link-input');
    const exportBox = wrap.querySelector<HTMLElement>('.yoo-export-box')!;
    const charCount = wrap.querySelector<HTMLElement>('.yoo-charcount')!;
    const blockSelect = wrap.querySelector<HTMLSelectElement>('.yoo-block-select');
    const btnHtml = wrap.querySelector<HTMLButtonElement>('.yoo-btn-html')!;
    const btnClear = wrap.querySelector<HTMLButtonElement>('.yoo-btn-clear')!;
    const btnCopy = wrap.querySelector<HTMLButtonElement>('.yoo-btn-copy')!;
    const toggleBtn = wrap.querySelector<HTMLButtonElement>('.yoo-toggle-btn');

    // Masquer le footer si demandé
    if (!showFooter) {
      const footer = wrap.querySelector<HTMLElement>('.yoo-footer');
      if (footer) footer.style.display = 'none';
      exportBox.style.display = 'none';
    }

    // Appliquer les hauteurs personnalisées
    if (minHeight) content.style.minHeight = minHeight;
    if (maxHeight) {
      content.style.maxHeight = maxHeight;
      content.style.overflowY = 'auto';
    }

    let savedRange: Range | null = null;

    /* ── Visibilité toolbar ── */
    const showToolbar = (): void => {
      if (!toolbar) return;

      toolbar.classList.remove('yoo-toolbar-anim-hide');
      toolbar.classList.add('yoo-toolbar-anim-show');
      wrap.classList.remove('yoo-toolbar-hidden');
      wrap.classList.add('yoo-toolbar-visible');
      toggleBtn?.classList.add('yoo-active');
    };

    const hideToolbar = (): void => {
      if (!toolbar) return;

      toolbar.classList.remove('yoo-toolbar-anim-show');
      toolbar.classList.add('yoo-toolbar-anim-hide');
      wrap.classList.remove('yoo-toolbar-visible');
      wrap.classList.add('yoo-toolbar-hidden');
      toggleBtn?.classList.remove('yoo-active');
    };

    // toolbarMode 'never' : toolbar absent du DOM, rien à faire
    if (toolbarMode === 'focus') {
      hideToolbar();
      content.addEventListener('focus', showToolbar);
      content.addEventListener('blur', () => {
        // Petit délai pour laisser le clic toolbar se déclencher avant de masquer
        setTimeout(() => { if (!wrap.contains(document.activeElement)) hideToolbar(); }, 150);
      });
    } else if (toolbarMode === 'toggle') {
      hideToolbar();
      toggleBtn!.addEventListener('click', () => {
        wrap.classList.contains('yoo-toolbar-visible') ? hideToolbar() : showToolbar();
      });
    } else if (toolbarMode !== 'never') {
      showToolbar();
    }

    // Contenu initial nettoyé : une valeur stockée et rechargée ne doit jamais exécuter de script.
    if (initialValue) content.innerHTML = sanitizeHtml(initialValue);

    /* ── Sync vers le textarea caché ── */
    const emitChange = (): void => {
      const text = content.innerText ?? '';
      opts.onChange?.({html: content.innerHTML, text, isEmpty: text.trim() === ''});
    };
    const sync = (): void => {
      textarea.value = content.innerHTML;
      emitChange();
    };

    /* ── Compteur de caractères ── */
    const refreshCount = (): void => {
      const n = content.innerText.replace(/\n/g, '').length;
      charCount.textContent = n + (n <= 1 ? ` ${t('character')}` : ` ${t('characters')}`);
    };

    /* ── Exécuter une commande ── */
    const exec = (cmd: string, val: string | null = null): void => {
      content.focus();
      if (savedRange) {
        const sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(savedRange);
        savedRange = null;
      }

      document.execCommand(cmd, false, val ?? undefined);
      refreshToolbar();
      sync();
    };

    /* ── Style de bloc ── */
    const setBlock = (tag: string): void => {
      content.focus();
      document.execCommand('formatBlock', false, tag);
      sync();
    };

    /* ── État des boutons toolbar ── */
    const refreshToolbar = (): void => {
      if (!toolbar || !blockSelect) return;

      const stateCmds = new Set([
        'bold', 'italic', 'underline', 'strikeThrough',
        'insertUnorderedList', 'insertOrderedList',
      ]);
      toolbar.querySelectorAll<HTMLButtonElement>('button[data-cmd]').forEach(btn => {
        if (stateCmds.has(btn.dataset.cmd!)) {
          btn.classList.toggle('yoo-active', document.queryCommandState(btn.dataset.cmd!));
        }
      });
      const block = document.queryCommandValue('formatBlock').toLowerCase();
      blockSelect.value = ['p', 'h2', 'h3', 'blockquote'].includes(block) ? block : 'p';
    };

    /* ── Barre de lien ── */
    const openLinkBar = (): void => {
      if (!linkBar || !linkInput) return;
      const sel = window.getSelection();
      if (sel?.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
      linkBar.style.display = 'flex';
      setTimeout(() => linkInput.focus(), 50);
    };

    const closeLinkBar = (): void => { if (linkBar) linkBar.style.display = 'none'; };

    const insertLink = (): void => {
      if (!linkInput) return;
      const url = linkInput.value.trim();
      if (!url) return;
      exec('createLink', url);
      content.querySelectorAll('a').forEach(a => (a as HTMLAnchorElement).target = '_blank');
      linkInput.value = '';
      closeLinkBar();
    };

    /* ── HTML export ── */
    const toggleHTML = (): void => {
      const visible = exportBox.style.display !== 'none' && exportBox.style.display !== '';
      if (visible) {
        exportBox.style.display = 'none';
        btnHtml.classList.remove('yoo-active');
      } else {
        exportBox.textContent = content.innerHTML;
        exportBox.style.display = 'block';
        btnHtml.classList.add('yoo-active');
      }
    };

    /* ── Effacer ── */
    const clearContent = (): void => {
      if (content.innerText.trim() && !confirm(t('clearConfirm'))) return;
      content.innerHTML = '';
      refreshCount();
      sync();
      if (exportBox.style.display !== 'none') exportBox.textContent = '';
    };

    /* ── Copier ── */
    const copyHTML = (): void => {
      navigator.clipboard.writeText(content.innerHTML).then(() => {
        const orig = btnCopy.textContent!;
        btnCopy.textContent = t('copied');
        setTimeout(() => (btnCopy.textContent = orig), 1500);
      });
    };

    /* ── Événements toolbar (absent en mode 'never') ── */
    if (toolbar) {
      toolbar.addEventListener('click', (e: MouseEvent) => {
        const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-cmd]');

        if (btn) {
          exec(btn.dataset.cmd!);
          return;
        }

        const actionBtn = (e.target as Element).closest<HTMLButtonElement>('button[data-action]');
        if (actionBtn?.dataset.action === 'link') openLinkBar();
      });

      blockSelect!.addEventListener('change', () => setBlock(blockSelect!.value));
    }

    /* ── Événements barre de lien (absent en mode 'never') ── */
    if (linkBar && linkInput) {
      wrap.querySelector('.yoo-btn-insert')!.addEventListener('click', insertLink);
      wrap.querySelector('.yoo-btn-remove')!.addEventListener('click', () => {
        exec('unlink');
        closeLinkBar();
      });
      wrap.querySelector('.yoo-btn-close')!.addEventListener('click', closeLinkBar);
      linkInput.addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Enter') insertLink(); });
    }

    /* ── Événements footer ── */
    btnHtml.addEventListener('click', toggleHTML);
    btnClear.addEventListener('click', clearContent);
    btnCopy.addEventListener('click', copyHTML);

    /* ── Événements zone de saisie ── */
    content.addEventListener('input', () => {
      sync();
      refreshCount();
      if (exportBox.style.display !== 'none') exportBox.textContent = content.innerHTML;
    });
    if (toolbar) {
      content.addEventListener('keyup', refreshToolbar);
      content.addEventListener('mouseup', refreshToolbar);
    }
    content.addEventListener('mousedown', () => {
      const sel = window.getSelection();
      if (sel?.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
    });

    content.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
    });

    refreshCount();
    emitChange();

    if (opts.emoji) {
      Editor._addEmojiInEditor(content, wrap);
    }

    if (opts.mention) {
      if (!integrations.mentions) throw new Error('Editor requires a mention integration.');
      Editor._setupMentions(content, integrations.mentions);
    }
  }

  /* ─────────────────────────────────────────
     Emoji
  ───────────────────────────────────────── */

  private static _addEmojiInEditor (content: HTMLElement, wrap: HTMLElement): void {
    const button = document.createElement('button');
    button.textContent = '😊';
    button.className = 'yoo-emoji-button';
    button.type = 'button';
    button.title = t('addEmoji');
    button.setAttribute('aria-label', t('addEmoji'));

    // mousedown.preventDefault() keeps the contenteditable focused so the
    // selection is still valid when the click handler calls _saveSelection().
    button.addEventListener('mousedown', (e) => { e.preventDefault(); });

    button.addEventListener('click', (e) => {
      e.preventDefault();
      const savedRange = Editor._saveSelection();
      Editor._showEmojiPicker(content, savedRange);
    });

    const contentWrap = wrap.querySelector<HTMLElement>('.yoo-content-wrap');
    if (contentWrap) {
      contentWrap.style.position = contentWrap.style.position || 'relative';
      contentWrap.appendChild(button);
      // Prevent text from being hidden under the button
      content.style.paddingRight = '44px';
    }
  }

  private static _saveSelection (): Range | null {
    const sel = window.getSelection();
    return sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
  }

  private static _showEmojiPicker (content: HTMLElement, savedRange: Range | null): void {
    EmojiPicker.open({
      title: t('chooseEmoji'),
      closeLabel: t('close'),
      onSelect: (emoji: string) => {
      const range = savedRange && content.contains(savedRange.commonAncestorContainer)
        ? savedRange
        : document.createRange();

      if (!savedRange || !content.contains(range.commonAncestorContainer)) {
        range.selectNodeContents(content);
        range.collapse(false);
      }

      range.deleteContents();
      const emojiNode = document.createTextNode(emoji);
      range.insertNode(emojiNode);
      range.setStartAfter(emojiNode);
      range.collapse(true);

      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      // Déclenche la synchronisation du contenteditable vers le textarea source.
      content.dispatchEvent(new Event('input', {bubbles: true}));
      content.focus();
      },
    });
  }

  /* ─────────────────────────────────────────
     Mentions
  ───────────────────────────────────────── */

  private static _setupMentions (
    content: HTMLElement,
    integration: EditorMentionIntegration
  ): void {
    const state: MentionState = {
      isSearch: false,
      atNode: null,
      atOffset: 0,
      previousTerm: null,
      dropdown: null,
      content,
      activeIndex: -1,
      listId: null,
      stopOutsideClose: null,
    };

    // En capture : avant le gestionnaire de l'éditeur (la touche Tab insère sinon des espaces).
    content.addEventListener('keydown', (e: KeyboardEvent) => {
      Editor._handleMentionKeydown(e, content, state, integration);
    }, true);

    content.addEventListener('keyup', integration.debounce((e: KeyboardEvent) => {
      Editor._handleMentionSearch(e, content, state, integration);
    }, 300));
  }

  private static _handleMentionSearch (
    e: KeyboardEvent,
    content: HTMLElement,
    state: MentionState,
    integration: EditorMentionIntegration
  ): void {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;

    const range = sel.getRangeAt(0);
    const node = range.endContainer;

    if (node.nodeType !== Node.TEXT_NODE) return;

    const textNode = node as Text;
    const textBeforeCursor = (textNode.textContent ?? '').substring(0, range.endOffset);
    const lastChar = textBeforeCursor[textBeforeCursor.length - 1];

    if (lastChar === '@') {
      // Un nouveau « @ » alors qu'une bulle est ouverte : l'ancienne ne doit pas rester à l'écran.
      Editor._closeMentionDropdown(state);
      state.isSearch = true;
      state.atNode = textNode;
      state.atOffset = range.endOffset - 1;
      state.previousTerm = null;
      state.dropdown = Editor._showMentionDropdown(content, state, integration);
      Editor._closeOnOutsidePointer(state);
      return;
    }

    if (!state.isSearch) return;

    if (
      e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter' ||
      content.innerText.trim() === '' || state.atNode !== textNode
    ) {
      Editor._closeMentionDropdown(state);
      return;
    }

    const atIndex = textBeforeCursor.lastIndexOf('@');
    if (atIndex === -1) {
      Editor._closeMentionDropdown(state);
      return;
    }

    const term = textBeforeCursor.substring(atIndex + 1).trim();

    if (term.length >= 2 && term !== state.previousTerm) {
      state.previousTerm = term;
      Editor._performMentionSearch(term, content, state, integration);
    }
  }

  /**
   * Crée la bulle sur document.body en position fixed — contourne overflow:hidden de
   * .yoo-editor-wrap, identique au pattern du picker emoji. Positionnée au bas de la zone de saisie,
   * décalée vers le haut si besoin.
   *
   * Sa structure est posée une fois : en-tête avec la croix, zone d'annonce pour les lecteurs
   * d'écran (présente avant ses changements, sinon rien n'est lu) et zone des résultats. Elle reste
   * cachée tant qu'il n'y a rien à montrer.
   */
  private static _showMentionDropdown (
    content: HTMLElement,
    state: MentionState,
    integration: EditorMentionIntegration
  ): HTMLElement {
    const dropdown = document.createElement('div');
    dropdown.className = 'yoo-mentions-dropdown';
    // Repère nommé : le contenu de la bulle, ajoutée à la fin de la page, n'est sinon dans aucun repère.
    dropdown.setAttribute('role', 'region');
    dropdown.setAttribute('aria-label', t('mentionSuggestions'));
    dropdown.hidden = true;
    state.listId = `yoo-mentions-list-${++mentionBubbleCount}`;
    dropdown.innerHTML = `
      <div class="yoo-mentions-header">
        <button type="button" class="yoo-mentions-close" aria-label="${te('close')}">×</button>
      </div>
      <div class="yoo-sr-only" role="status" aria-live="polite"></div>
      <div class="yoo-mentions-results"></div>`;

    // Garde le focus dans la zone de saisie quand on appuie sur la croix : la fermeture se fait sur
    // le clic, traité ci-dessous.
    dropdown.querySelector('.yoo-mentions-close')!.addEventListener('mousedown', (e) => e.preventDefault());
    dropdown.addEventListener('click', (e: Event) => {
      if ((e.target as Element).closest('.yoo-mentions-close')) {
        Editor._closeMentionDropdown(state);
        return;
      }

      const option = (e.target as Element).closest<HTMLElement>('.yoo-mention-item');
      if (option) Editor._insertMention(option, content, state, integration);
    });

    document.body.appendChild(dropdown);
    Editor._positionDropdown(dropdown, content);
    return dropdown;
  }

  private static _positionDropdown (dropdown: HTMLElement, content: HTMLElement): void {
    const rect = content.getBoundingClientRect();
    const width = Math.min(Math.round(rect.width), 420);
    const dropH = 300; // hauteur estimée max du dropdown

    dropdown.style.left = `${Math.round(rect.left)}px`;
    dropdown.style.width = `${width}px`;

    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow >= dropH || spaceBelow >= 150) {
      // Sous la zone de saisie
      dropdown.style.top = `${Math.round(rect.bottom + 4)}px`;
      dropdown.style.bottom = 'auto';
    } else {
      // Au-dessus si pas assez de place en bas
      dropdown.style.bottom = `${Math.round(window.innerHeight - rect.top + 4)}px`;
      dropdown.style.top = 'auto';
    }
  }

  /**
   * Ferme la bulle dès qu'on appuie (souris ou doigt) ailleurs que sur elle, y compris dans le texte
   * de l'éditeur. L'écouteur est posé à l'ouverture et retiré par _closeMentionDropdown().
   */
  private static _closeOnOutsidePointer (state: MentionState): void {
    const onPointerDown = (event: Event): void => {
      const target = event.target as Node | null;
      if (target && state.dropdown?.contains(target)) return;

      Editor._closeMentionDropdown(state);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    state.stopOutsideClose = (): void => document.removeEventListener('pointerdown', onPointerDown, true);
  }

  private static _closeMentionDropdown (state: MentionState): void {
    state.isSearch = false;
    state.atNode = null;
    state.previousTerm = null;
    state.stopOutsideClose?.();
    state.stopOutsideClose = null;
    state.dropdown?.remove();
    state.dropdown = null;
    state.activeIndex = -1;
    state.listId = null;
    MENTION_ARIA.forEach((attribute) => state.content.removeAttribute(attribute));
  }

  private static _performMentionSearch (
    term: string,
    content: HTMLElement,
    state: MentionState,
    integration: EditorMentionIntegration
  ): void {
    const dropdown = state.dropdown;
    if (!dropdown) return;

    integration.loader.unfreezeElement();
    setTimeout(() => { integration.loader.freezeElement(dropdown); }, 100);

    integration.searchUsers(term)
      .then((users) => {
        if (users) {
          Editor._renderMentionResults(users, dropdown, state);
        }
      })
      .catch((error) => { console.error('[Editor Mentions]', error); })
      .finally(() => integration.loader.unfreezeElement());
  }

  private static _renderMentionResults (
    users: EditorUser[],
    dropdown: HTMLElement,
    state: MentionState
  ): void {
    const listId = state.listId;
    const results = dropdown.querySelector<HTMLElement>('.yoo-mentions-results');
    const status = dropdown.querySelector<HTMLElement>('[role="status"]');
    // Bulle fermée ou remplacée pendant la recherche : ces résultats ne la concernent plus.
    if (!listId || !results || !status || state.dropdown !== dropdown) return;

    // Les textes et adresses viennent de l'application hôte : échappés ici, jamais insérés bruts.
    // Un membre sans adresse de profil exploitable n'est pas proposé.
    const items = users
      .filter((user): user is EditorUser => user !== null)
      .map((user, index) => Editor._mentionItemHtml(user, `${listId}-option-${index}`))
      .filter((item) => item !== '');

    state.activeIndex = -1;
    state.content.removeAttribute('aria-activedescendant');
    state.content.setAttribute('aria-autocomplete', 'list');

    if (!items.length) {
      results.innerHTML = `
        <div class="yoo-mentions-empty">
          <svg class="yoo-mentions-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="yoo-mentions-empty-text">${te('noUserFound')}</span>
        </div>`;
      state.content.removeAttribute('aria-controls');
      status.textContent = t('noUserFound');
      dropdown.hidden = false;
      return;
    }

    results.innerHTML = `<div class="yoo-mentions-list" role="listbox" id="${listId}" aria-label="${te('mentionSuggestions')}">${items.join('')}</div>`;
    state.content.setAttribute('aria-controls', listId);
    status.textContent = (items.length === 1 ? t('mentionResultsOne') : t('mentionResultsMany'))
      .replace('{count}', String(items.length));
    dropdown.hidden = false;
  }

  /** Options affichées dans la bulle (vide tant qu'elle n'a pas de résultats). */
  private static _mentionOptions (state: MentionState): HTMLElement[] {
    return Array.from(state.dropdown?.querySelectorAll<HTMLElement>('.yoo-mention-item') ?? []);
  }

  /** Choisit une option au clavier : `aria-selected` sur l'option, `aria-activedescendant` sur la zone de saisie. */
  private static _setActiveMention (state: MentionState, index: number): void {
    const options = Editor._mentionOptions(state);

    options.forEach((option, position) => option.setAttribute('aria-selected', String(position === index)));
    state.activeIndex = index;

    const active = options[index];
    if (active) {
      state.content.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView?.({block: 'nearest'});
    } else {
      state.content.removeAttribute('aria-activedescendant');
    }
  }

  /**
   * Clavier, tant que la bulle est ouverte. Le focus ne quitte jamais la zone de saisie :
   *   · Échap          → ferme la bulle sans toucher au texte (et sans fermer une modale hôte)
   *   · Flèches haut/bas, Début/Fin → choisissent une suggestion (avec Début/Fin seulement une fois
   *     une suggestion choisie ; sinon ils déplacent le curseur comme d'habitude)
   *   · Entrée ou Tab  → insèrent la suggestion choisie ; sans choix, ils gardent leur rôle habituel
   */
  private static _handleMentionKeydown (
    e: KeyboardEvent,
    content: HTMLElement,
    state: MentionState,
    integration: EditorMentionIntegration
  ): void {
    if (!state.isSearch || e.isComposing) return;

    const stop = (): void => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    if (e.key === 'Escape') {
      stop();
      e.stopPropagation();
      Editor._closeMentionDropdown(state);
      return;
    }

    const options = Editor._mentionOptions(state);
    if (!options.length) return;

    const active = state.activeIndex;

    if (e.key === 'ArrowDown') {
      stop();
      Editor._setActiveMention(state, (active + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      stop();
      Editor._setActiveMention(state, active <= 0 ? options.length - 1 : active - 1);
    } else if (e.key === 'Home' && active >= 0) {
      stop();
      Editor._setActiveMention(state, 0);
    } else if (e.key === 'End' && active >= 0) {
      stop();
      Editor._setActiveMention(state, options.length - 1);
    } else if ((e.key === 'Enter' || e.key === 'Tab') && active >= 0) {
      stop();
      Editor._insertMention(options[active], content, state, integration);
    }
  }

  /** Ligne d'un membre dans la bulle ; chaîne vide si son adresse de profil est inexploitable. */
  private static _mentionItemHtml (user: EditorUser, id: string): string {
    const profilePath = safeSitePath(user.profileUrl);
    if (profilePath === null) return '';

    const firstName = String(user.firstName ?? '');
    const lastName = String(user.lastName ?? '');
    const name = `${firstName} ${lastName}`.trim();
    const avatar = safeHttpUrl(user.avatarUrl);
    const initials = ([...firstName][0] ?? '') + ([...lastName][0] ?? '');

    // Avatar décoratif : le nom est lu juste à côté.
    const avatarHtml = avatar
      ? `<img src="${escapeHtml(avatar)}" alt="" loading="lazy" />`
      : `<span class="yoo-mention-avatar-fallback" aria-hidden="true">${escapeHtml(initials.toUpperCase())}</span>`;

    return `
          <div class="yoo-mention-item" id="${escapeHtml(id)}" data-user-id="${escapeHtml(user.ID)}" data-profile-url="${escapeHtml(profilePath)}" role="option" aria-selected="false">
            <div class="yoo-mention-avatar">${avatarHtml}</div>
            <div class="yoo-mention-info">
              <span class="yoo-mention-name">${escapeHtml(name)}</span>
            </div>
          </div>`;
  }

  private static _insertMention (
    item: HTMLElement,
    content: HTMLElement,
    state: MentionState,
    integration: EditorMentionIntegration
  ): void {
    if (!state.atNode) return;

    const username = item.querySelector('.yoo-mention-name')?.textContent?.trim() ?? '';
    const profileUrl = item.dataset.profileUrl ?? '';
    const userId = integration.encodeUserId(item.dataset.userId ?? '');

    // Calculer la fin du @terme depuis l'état sauvegardé — ne pas utiliser
    // la sélection courante : le focus a quitté le contenteditable lors du clic
    // sur le dropdown, rendant l'offset invalide pour state.atNode.
    const nodeLen = state.atNode.textContent?.length ?? 0;
    const termLen = 1 + (state.previousTerm?.length ?? 0); // 1 = le @ lui-même
    const endOffset = Math.min(state.atOffset + termLen, nodeLen);

    // Supprimer le texte "@terme" puis insérer le blot mention
    const deleteRange = document.createRange();
    deleteRange.setStart(state.atNode, state.atOffset);
    deleteRange.setEnd(state.atNode, endOffset);
    deleteRange.deleteContents();

    const mentionEl = document.createElement('a');
    mentionEl.href = profileUrl;
    mentionEl.dataset.userId = userId;
    mentionEl.target = '_blank';
    mentionEl.className = 'mention';
    mentionEl.textContent = username;
    deleteRange.insertNode(mentionEl);

    // Remettre le focus sur le contenteditable (perdu lors du clic sur le dropdown)
    // puis déplacer le curseur après la mention et insérer un espace séparateur.
    content.focus();
    const sel = window.getSelection()!;
    const newRange = document.createRange();
    newRange.setStartAfter(mentionEl);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    document.execCommand('insertText', false, ' ');

    Editor._closeMentionDropdown(state);

    // Déclenche le listener 'input' existant qui appelle sync() + refreshCount()
    content.dispatchEvent(new Event('input'));
  }

  /* ─────────────────────────────────────────
     API publique
  ───────────────────────────────────────── */

  /**
   * Initialise l'éditeur sur tous les textarea correspondant au sélecteur.
   *
   * @param options.selector  Sélecteur CSS cible (défaut : 'textarea')
   * @param options.exclude   Sélecteur CSS à exclure
   * @param options.toolbar   Mode toolbar : 'always' | 'toggle' | 'focus' | 'never'
   * @param options.footer    Afficher le footer — défaut : true
   * @param options.minHeight Hauteur minimale de la zone de saisie (ex: '160px')
   * @param options.maxHeight Hauteur maximale avant scroll (ex: '400px')
   *
   * Les attributs data-yoo-* sur chaque textarea sont prioritaires sur les options JS.
   * Voir le bloc de documentation en tête de fichier pour les cas d'usage détaillés.
   *
   * @returns Editor (chaînable)
   */
  static init (options: EditorOptions = {}, integrations: EditorIntegrations = {}): typeof Editor {
    if (options.styles) setEditorStyles(options.styles);
    Editor.injectStyles();

    const selector = options.selector ?? 'textarea';
    const exclude = options.exclude ?? null;

    (Array.from(document.querySelectorAll<HTMLElement>(selector)) as HTMLElement[])
      .filter((el): el is HTMLTextAreaElement => el.tagName === 'TEXTAREA')
      .filter(el => !exclude || !el.matches(exclude))
      .forEach(el => Editor.mountEditor(el, options, integrations));

    return Editor;
  }

  /**
   * Monte l'éditeur sur un textarea précis.
   * Idéal pour les éléments ajoutés dynamiquement au DOM (modales, widgets ajax…).
   *
   * @param target   Élément HTMLTextAreaElement ou sélecteur CSS
   * @param options  Mêmes options que init()
   *
   * @param integrations
   * @returns Editor (chaînable)
   */
  static mount (
    target: HTMLTextAreaElement | string,
    options: EditorOptions = {},
    integrations: EditorIntegrations = {}
  ): typeof Editor {
    if (options.styles) setEditorStyles(options.styles);
    Editor.injectStyles();
    const el = typeof target === 'string'
      ? document.querySelector<HTMLTextAreaElement>(target)
      : target;
    if (el?.tagName === 'TEXTAREA') Editor.mountEditor(el as HTMLTextAreaElement, options, integrations);

    return Editor;
  }
}
