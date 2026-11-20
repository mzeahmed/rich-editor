/**
 * Standalone rich text editor.
 * Automatically replaces <textarea> elements with an enhanced contenteditable editor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BASIC USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1) Every <textarea> on the page
 *    Editor.init();
 *
 * 2) Targeted CSS selector
 *    Editor.init({ selector: '.richtext' });
 *
 * 3) Exclude some textareas
 *    Editor.init({ exclude: '.no-editor' });
 *
 * 4) Mount on a specific element (dynamic DOM)
 *    Editor.mount('#my-textarea');
 *    Editor.mount(textareaElement);
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TOOLBAR OPTIONS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * toolbar: 'always'  → toolbar always visible (default)
 *    Editor.init({ toolbar: 'always' });
 *
 * toolbar: 'focus'   → toolbar shown only while the field is focused
 *    Editor.init({ toolbar: 'focus' });
 *
 * toolbar: 'toggle'  → a "Formatting" button shows/hides the toolbar
 *    Editor.init({ toolbar: 'toggle' });
 *
 * toolbar: 'never'   → no toolbar (plain rich input field)
 *    Editor.init({ toolbar: 'never' });
 *
 * Per-textarea override through a data attribute:
 *    <textarea data-mzre-toolbar="focus"></textarea>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FOOTER (character counter + HTML / Clear / Copy buttons)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Hide the footer (useful for embedded fields, e.g. messaging):
 *    Editor.mount('#msg-textarea', { footer: false });
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HEIGHT OF THE WRITING AREA
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Through the JS options:
 *    Editor.mount('#my-textarea', { minHeight: '80px', maxHeight: '300px' });
 *
 * Through data attributes on the <textarea> (they take precedence over the JS options):
 *    <textarea data-mzre-min-height="60px" data-mzre-max-height="200px"></textarea>
 *
 * When maxHeight is set, overflow-y: auto is enabled automatically.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EMOJI
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Adds an inline 😊 button to the writing area. The picker is provided by the package
 * (no modal to prepare); its data is loaded on first open.
 *
 *    Editor.mount('#editor', { emoji: true });
 *
 * Combined with no toolbar (post/comment field style):
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
 * Enables assisted @user mentions (requires integrations.mentions):
 *   · Typing @ → user search bubble (integrations.mentions.searchUsers)
 *   · Selection → inserts <a class="mention" href="/profile" data-user-id="…">First Last</a>
 *   · Closes on Space / Escape / Enter, with the cross, or by clicking outside
 *
 * Simple activation:
 *    Editor.mount('#editor', { mention: true }, { mentions: … });
 *
 * Full combination (publishing form style), with a "publish" button disabled
 * while the field is empty (onChange is also called once at mount):
 *    Editor.mount('#post-textarea', {
 *      toolbar: 'never',
 *      footer: false,
 *      emoji: true,
 *      mention: true,
 *      onChange: ({ isEmpty }) => { publishButton.disabled = isEmpty; },
 *    }, { mentions: … });
 *
 * Comment combination:
 *    Editor.mount('#comment-textarea', {
 *      toolbar: 'never',
 *      footer: false,
 *      emoji: true,
 *      mention: true,
 *    });
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LANGUAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Interface and emojis in English by default; { locale: 'fr' } (or setEditorLocale('fr')) for
 * French. A text can be overridden: integrations.messages = { close: 'Dismiss' }.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * COMPLETE USE CASES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * A) Rich content editor (article, long description)
 *    Editor.init({
 *      selector: 'textarea.rich-content',
 *      toolbar: 'always',
 *      minHeight: '300px',
 *    });
 *
 * B) Compact comment editor (toolbar on focus)
 *    Editor.init({
 *      selector: 'textarea.comment',
 *      toolbar: 'focus',
 *      minHeight: '80px',
 *      maxHeight: '200px',
 *      footer: false,
 *    });
 *
 * C) Messaging input field (no toolbar, no footer, fixed height)
 *    Editor.mount('#messaging-textarea', {
 *      toolbar: 'never',
 *      footer: false,
 *      minHeight: '40px',
 *      maxHeight: '120px',
 *    });
 *
 * D) Editor with an optional toolbar behind a toggle button
 *    Editor.mount('#post-content', { toolbar: 'toggle' });
 *
 * E) Mounting on a dynamically added element (e.g. an opened modal)
 *    modal.addEventListener('shown', () => { // your modal's open event
 *      Editor.mount('#modal-textarea', { toolbar: 'focus', minHeight: '120px' });
 *    });
 *
 * F) Per-textarea override (data attributes, no extra JS)
 *    <textarea
 *      data-mzre-toolbar="toggle"
 *      data-mzre-min-height="100px"
 *      data-mzre-max-height="400px"
 *    ></textarea>
 *    then: Editor.init();   ← the data attributes take precedence
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHAINING
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * init() and mount() return the class, so calls can be chained:
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

/** Interface text, escaped so it can be inserted into HTML. */
const te = (key: keyof EditorMessages): string => escapeHtml(t(key));

/** Content state, passed to `onChange` on every change and once at mount. */
export interface EditorChange {
  html: string;
  text: string;
  isEmpty: boolean;
}

export interface EditorOptions {
  selector?: string;
  exclude?: string;
  /** 'always' | 'toggle' | 'focus' | 'never' — default: 'always' */
  toolbar?: 'always' | 'toggle' | 'focus' | 'never';
  /** Show or hide the footer (counter + buttons) — default: true */
  footer?: boolean;
  /** Minimum height of the writing area (e.g. '80px', '4rem') — default: '160px' */
  minHeight?: string;
  /** Maximum height of the writing area before it scrolls (e.g. '400px') */
  maxHeight?: string;
  /** Adds an inline emoji button to the writing area */
  emoji?: boolean;
  /** Enables @mentions (requires `integrations.mentions`) */
  mention?: boolean;
  /** Language of the interface and of the emojis: 'en' (default) or 'fr'. Page-wide setting. */
  locale?: EditorLocale;
  /**
   * Style injection (page-wide setting): `{inject: false}` to load
   * `@mzeahmed/rich-editor/style.css` yourself, `{nonce}` for a nonce-based CSP. See `setEditorStyles()`.
   */
  styles?: StyleOptions;
  /**
   * Called on every content change (typing, toolbar, mention) and once at
   * mount: handy to enable or disable a "publish" button depending on whether the field is empty.
   */
  onChange?: (change: EditorChange) => void;
}

interface MentionState {
  isSearch: boolean;
  atNode: Text | null;
  atOffset: number;
  previousTerm: string | null;
  dropdown: HTMLElement | null;
  /** Writing area: carries the ARIA attributes while the bubble is open. */
  content: HTMLElement;
  /** Option chosen with the keyboard (-1: none, Enter then keeps its usual role). */
  activeIndex: number;
  /** Id of the options list, target of `aria-controls`. */
  listId: string | null;
  /** Removes the "click outside" listener set when the bubble opened. */
  stopOutsideClose: (() => void) | null;
  /** Last "@" the user dismissed (Escape, cross, click outside): it must not reopen by itself. */
  dismissed: {node: Text; offset: number} | null;
}

let mentionBubbleCount = 0;

/**
 * ARIA attributes carried by the writing area (`textbox` role) while the mention bubble is
 * open. Only those this role accepts: `aria-expanded` and `aria-haspopup` are not allowed.
 */
const MENTION_ARIA = ['aria-autocomplete', 'aria-controls', 'aria-activedescendant'];

/* ─────────────────────────────────────────
   CSS injected only once into <head>
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
     Inject CSS only once
  ───────────────────────────────────────── */
  private static injectStyles (): void {
    injectStyleSheet('mzre-editor-styles', EDITOR_CSS);
  }

  /* ─────────────────────────────────────────
     Builds the HTML of an editor
  ───────────────────────────────────────── */
  private static buildEditorHTML (placeholder: string, toolbarMode: string, label: string): string {
    const toggleBar = toolbarMode === 'toggle'
      ? `<div class="mzre-toolbar-toggle">
           <button type="button" class="mzre-toggle-btn" title="${te('toggleToolbar')}">
             <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect y="0" width="12" height="1.5" rx=".75" fill="currentColor"/><rect y="4" width="12" height="1.5" rx=".75" fill="currentColor"/><rect y="8" width="12" height="1.5" rx=".75" fill="currentColor"/></svg>
             ${te('formatting')}
           </button>
         </div>`
      : '';

    // In 'never' mode, the toolbar and the link bar are not rendered in the DOM
    // `type="button"` on every button: without it, a <button> inside a
    // <form> implicitly has type="submit" and submits the host form
    // on click instead of running its editing command.
    const toolbarAndLinkBar = toolbarMode !== 'never' ? `
      <div class="mzre-toolbar">
        <select class="mzre-block-select" aria-label="${te('textStyle')}">
          <option value="p">${te('paragraph')}</option>
          <option value="h2">${te('heading')}</option>
          <option value="h3">${te('subheading')}</option>
          <option value="blockquote">${te('quote')}</option>
        </select>
        <div class="mzre-sep"></div>
        <button type="button" data-cmd="bold"               title="${te('bold')}"><b>B</b></button>
        <button type="button" data-cmd="italic"             title="${te('italic')}"><i>I</i></button>
        <button type="button" data-cmd="underline"          title="${te('underline')}" class="mzre-btn-underline">U</button>
        <button type="button" data-cmd="strikeThrough"      title="${te('strikethrough')}" class="mzre-btn-strike">S</button>
        <div class="mzre-sep"></div>
        <button type="button" data-cmd="insertUnorderedList" title="${te('bulletList')}">${ICONS.ul}</button>
        <button type="button" data-cmd="insertOrderedList"   title="${te('numberedList')}">${ICONS.ol}</button>
        <div class="mzre-sep"></div>
        <button type="button" data-cmd="justifyLeft"   title="${te('alignLeft')}">${ICONS.alignL}</button>
        <button type="button" data-cmd="justifyCenter" title="${te('alignCenter')}">${ICONS.alignC}</button>
        <button type="button" data-cmd="justifyRight"  title="${te('alignRight')}">${ICONS.alignR}</button>
        <div class="mzre-sep"></div>
        <button type="button" data-action="link"        title="${te('insertLink')}">${ICONS.link}</button>
        <button type="button" data-cmd="removeFormat"   title="${te('clearFormatting')}">${ICONS.clear}</button>
        <div class="mzre-sep"></div>
        <button type="button" data-cmd="undo"  title="${te('undo')}">${ICONS.undo}</button>
        <button type="button" data-cmd="redo"  title="${te('redo')}">${ICONS.redo}</button>
      </div>

      <div class="mzre-link-bar">
        <input type="text" class="mzre-link-input" placeholder="https://" />
        <button type="button" class="mzre-btn-insert">${te('insert')}</button>
        <button type="button" class="mzre-btn-remove">${te('remove')}</button>
        <button type="button" class="mzre-btn-close">×</button>
      </div>` : '';

    return `
      ${toggleBar}
      ${toolbarAndLinkBar}

      <div class="mzre-content-wrap"><div
        class="mzre-content"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        aria-label="${escapeHtml(label) || escapeHtml(placeholder) || te('placeholder')}"
        data-placeholder="${escapeHtml(placeholder) || te('placeholder')}"
      ></div></div>

      <div class="mzre-export-box"></div>

      <div class="mzre-footer">
        <span class="mzre-charcount">0 ${te('character')}</span>
        <div class="mzre-footer-actions">
          <button type="button" class="mzre-btn-action mzre-btn-html">${te('html')}</button>
          <button type="button" class="mzre-btn-action mzre-btn-clear">${te('clear')}</button>
          <button type="button" class="mzre-btn-primary mzre-btn-copy">${te('copyContent')}</button>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────
     Mounts the editor on a <textarea>
  ───────────────────────────────────────── */
  private static mountEditor (textarea: HTMLTextAreaElement, opts: EditorOptions = {}, integrations: EditorIntegrations = {}): void {
    if (textarea.dataset.mzreMounted) return;

    if (opts.locale) setEditorLocale(opts.locale);
    if (integrations.messages) setEditorMessages(integrations.messages);

    textarea.dataset.mzreMounted = 'true';

    const placeholder = textarea.getAttribute('placeholder') ?? '';
    const initialValue = textarea.value ?? '';
    const toolbarMode = (textarea.dataset.mzreToolbar ?? opts.toolbar ?? 'always') as EditorOptions['toolbar'];
    const showFooter = opts.footer !== false;
    const minHeight = textarea.dataset.mzreMinHeight ?? opts.minHeight ?? null;
    const maxHeight = textarea.dataset.mzreMaxHeight ?? opts.maxHeight ?? null;

    const wrap = document.createElement('div');
    wrap.className = 'mzre-editor-wrap';
    // Accessible name of the writing area: the textarea's aria-label, else its placeholder.
    wrap.innerHTML = Editor.buildEditorHTML(placeholder, toolbarMode!, textarea.getAttribute('aria-label') ?? '');

    textarea.parentNode!.insertBefore(wrap, textarea);
    textarea.style.display = 'none';

    const content = wrap.querySelector<HTMLElement>('.mzre-content')!;
    const toolbar = wrap.querySelector<HTMLElement>('.mzre-toolbar');
    const linkBar = wrap.querySelector<HTMLElement>('.mzre-link-bar');
    const linkInput = wrap.querySelector<HTMLInputElement>('.mzre-link-input');
    const exportBox = wrap.querySelector<HTMLElement>('.mzre-export-box')!;
    const charCount = wrap.querySelector<HTMLElement>('.mzre-charcount')!;
    const blockSelect = wrap.querySelector<HTMLSelectElement>('.mzre-block-select');
    const btnHtml = wrap.querySelector<HTMLButtonElement>('.mzre-btn-html')!;
    const btnClear = wrap.querySelector<HTMLButtonElement>('.mzre-btn-clear')!;
    const btnCopy = wrap.querySelector<HTMLButtonElement>('.mzre-btn-copy')!;
    const toggleBtn = wrap.querySelector<HTMLButtonElement>('.mzre-toggle-btn');

    // Hide the footer if requested
    if (!showFooter) {
      const footer = wrap.querySelector<HTMLElement>('.mzre-footer');
      if (footer) footer.style.display = 'none';
      exportBox.style.display = 'none';
    }

    // Apply the custom heights
    if (minHeight) content.style.minHeight = minHeight;
    if (maxHeight) {
      content.style.maxHeight = maxHeight;
      content.style.overflowY = 'auto';
    }

    let savedRange: Range | null = null;

    /* ── Toolbar visibility ── */
    const showToolbar = (): void => {
      if (!toolbar) return;

      toolbar.classList.remove('mzre-toolbar-anim-hide');
      toolbar.classList.add('mzre-toolbar-anim-show');
      wrap.classList.remove('mzre-toolbar-hidden');
      wrap.classList.add('mzre-toolbar-visible');
      toggleBtn?.classList.add('mzre-active');
    };

    const hideToolbar = (): void => {
      if (!toolbar) return;

      toolbar.classList.remove('mzre-toolbar-anim-show');
      toolbar.classList.add('mzre-toolbar-anim-hide');
      wrap.classList.remove('mzre-toolbar-visible');
      wrap.classList.add('mzre-toolbar-hidden');
      toggleBtn?.classList.remove('mzre-active');
    };

    // toolbarMode 'never': no toolbar in the DOM, nothing to do
    if (toolbarMode === 'focus') {
      hideToolbar();
      content.addEventListener('focus', showToolbar);
      content.addEventListener('blur', () => {
        // Short delay so the toolbar click can fire before hiding
        setTimeout(() => { if (!wrap.contains(document.activeElement)) hideToolbar(); }, 150);
      });
    } else if (toolbarMode === 'toggle') {
      hideToolbar();
      toggleBtn!.addEventListener('click', () => {
        wrap.classList.contains('mzre-toolbar-visible') ? hideToolbar() : showToolbar();
      });
    } else if (toolbarMode !== 'never') {
      showToolbar();
    }

    // Initial content sanitized: a stored and reloaded value must never run a script.
    if (initialValue) content.innerHTML = sanitizeHtml(initialValue);

    /* ── Sync to the hidden textarea ── */
    const emitChange = (): void => {
      const text = content.innerText ?? '';
      opts.onChange?.({html: content.innerHTML, text, isEmpty: text.trim() === ''});
    };
    const sync = (): void => {
      textarea.value = content.innerHTML;
      emitChange();
    };

    /* ── Character counter ── */
    const refreshCount = (): void => {
      const n = content.innerText.replace(/\n/g, '').length;
      charCount.textContent = n + (n <= 1 ? ` ${t('character')}` : ` ${t('characters')}`);
    };

    /* ── Run a command ── */
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

    /* ── Block style ── */
    const setBlock = (tag: string): void => {
      content.focus();
      document.execCommand('formatBlock', false, tag);
      sync();
    };

    /* ── Toolbar button state ── */
    const refreshToolbar = (): void => {
      if (!toolbar || !blockSelect) return;

      const stateCmds = new Set([
        'bold', 'italic', 'underline', 'strikeThrough',
        'insertUnorderedList', 'insertOrderedList',
      ]);
      toolbar.querySelectorAll<HTMLButtonElement>('button[data-cmd]').forEach(btn => {
        if (stateCmds.has(btn.dataset.cmd!)) {
          btn.classList.toggle('mzre-active', document.queryCommandState(btn.dataset.cmd!));
        }
      });
      const block = document.queryCommandValue('formatBlock').toLowerCase();
      blockSelect.value = ['p', 'h2', 'h3', 'blockquote'].includes(block) ? block : 'p';
    };

    /* ── Link bar ── */
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
        btnHtml.classList.remove('mzre-active');
      } else {
        exportBox.textContent = content.innerHTML;
        exportBox.style.display = 'block';
        btnHtml.classList.add('mzre-active');
      }
    };

    /* ── Clear ── */
    const clearContent = (): void => {
      if (content.innerText.trim() && !confirm(t('clearConfirm'))) return;
      content.innerHTML = '';
      refreshCount();
      sync();
      if (exportBox.style.display !== 'none') exportBox.textContent = '';
    };

    /* ── Copy ── */
    const copyHTML = (): void => {
      navigator.clipboard.writeText(content.innerHTML).then(() => {
        const orig = btnCopy.textContent!;
        btnCopy.textContent = t('copied');
        setTimeout(() => (btnCopy.textContent = orig), 1500);
      });
    };

    /* ── Toolbar events (absent in 'never' mode) ── */
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

    /* ── Link bar events (absent in 'never' mode) ── */
    if (linkBar && linkInput) {
      wrap.querySelector('.mzre-btn-insert')!.addEventListener('click', insertLink);
      wrap.querySelector('.mzre-btn-remove')!.addEventListener('click', () => {
        exec('unlink');
        closeLinkBar();
      });
      wrap.querySelector('.mzre-btn-close')!.addEventListener('click', closeLinkBar);
      linkInput.addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Enter') insertLink(); });
    }

    /* ── Footer events ── */
    btnHtml.addEventListener('click', toggleHTML);
    btnClear.addEventListener('click', clearContent);
    btnCopy.addEventListener('click', copyHTML);

    /* ── Writing area events ── */
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
    button.className = 'mzre-emoji-button';
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

    const contentWrap = wrap.querySelector<HTMLElement>('.mzre-content-wrap');
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

      // Triggers the sync from the contenteditable to the source textarea.
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
      dismissed: null,
    };

    // In capture phase: before the editor's handler (otherwise Tab inserts spaces).
    content.addEventListener('keydown', (e: KeyboardEvent) => {
      Editor._handleMentionKeydown(e, content, state, integration);
    }, true);

    // Debounced: a burst of key releases ("@le" typed quickly) reaches the handler only once, with
    // the last one. It therefore looks at the text before the caret, not at the key that was pressed.
    content.addEventListener('keyup', integration.debounce(() => {
      Editor._handleMentionSearch(content, state, integration);
    }, 300));
  }

  /**
   * The "@term" that ends at the caret: an "@" at the start of a word (not inside an e-mail
   * address) followed by characters with no space. `index` is the position of the "@".
   */
  private static _findMentionTrigger (textBeforeCursor: string): {index: number; term: string} | null {
    const match = /(^|\s)@([^\s@]*)$/.exec(textBeforeCursor);

    return match ? {index: match.index + match[1].length, term: match[2]} : null;
  }

  private static _handleMentionSearch (
    content: HTMLElement,
    state: MentionState,
    integration: EditorMentionIntegration
  ): void {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;

    const range = sel.getRangeAt(0);
    const node = range.endContainer;

    if (node.nodeType !== Node.TEXT_NODE) {
      if (state.isSearch) Editor._closeMentionDropdown(state);
      return;
    }

    const textNode = node as Text;
    const trigger = Editor._findMentionTrigger((textNode.textContent ?? '').substring(0, range.endOffset));

    if (!trigger) {
      if (state.isSearch) Editor._closeMentionDropdown(state);
      return;
    }

    const isCurrent = state.isSearch && state.atNode === textNode && state.atOffset === trigger.index;

    if (!isCurrent) {
      // A "@" the user dismissed stays dismissed while they keep typing after it; a freshly typed
      // "@" (nothing after it yet) always opens, even at the same position.
      const dismissed = state.dismissed;
      if (trigger.term !== '' && dismissed?.node === textNode && dismissed.offset === trigger.index) return;

      // A new "@" while a bubble is open: the old one must not stay on screen.
      Editor._closeMentionDropdown(state);
      state.dismissed = null;
      state.isSearch = true;
      state.atNode = textNode;
      state.atOffset = trigger.index;
      state.previousTerm = null;
      state.dropdown = Editor._showMentionDropdown(content, state, integration);
      Editor._closeOnOutsidePointer(state);
    }

    if (trigger.term.length >= 2 && trigger.term !== state.previousTerm) {
      state.previousTerm = trigger.term;
      Editor._performMentionSearch(trigger.term, content, state, integration);
    }
  }

  /**
   * Creates the bubble on document.body with fixed positioning — works around the overflow:hidden of
   * .mzre-editor-wrap, same pattern as the emoji picker. Placed below the writing area,
   * shifted upward if needed.
   *
   * Its structure is built once: a header with the cross, an announcement area for screen
   * readers (present before it changes, otherwise nothing is read) and a results area. It stays
   * hidden while there is nothing to show.
   */
  private static _showMentionDropdown (
    content: HTMLElement,
    state: MentionState,
    integration: EditorMentionIntegration
  ): HTMLElement {
    const dropdown = document.createElement('div');
    dropdown.className = 'mzre-mentions-dropdown';
    // Named landmark: the bubble's content, appended at the end of the page, would otherwise be in no landmark.
    dropdown.setAttribute('role', 'region');
    dropdown.setAttribute('aria-label', t('mentionSuggestions'));
    dropdown.hidden = true;
    state.listId = `mzre-mentions-list-${++mentionBubbleCount}`;
    dropdown.innerHTML = `
      <div class="mzre-mentions-header">
        <button type="button" class="mzre-mentions-close" aria-label="${te('close')}">×</button>
      </div>
      <div class="mzre-sr-only" role="status" aria-live="polite"></div>
      <div class="mzre-mentions-results"></div>`;

    // Keeps focus in the writing area when the cross is pressed: closing happens on
    // the click, handled below.
    dropdown.querySelector('.mzre-mentions-close')!.addEventListener('mousedown', (e) => e.preventDefault());
    dropdown.addEventListener('click', (e: Event) => {
      if ((e.target as Element).closest('.mzre-mentions-close')) {
        Editor._closeMentionDropdown(state);
        return;
      }

      const option = (e.target as Element).closest<HTMLElement>('.mzre-mention-item');
      if (option) Editor._insertMention(option, content, state, integration);
    });

    document.body.appendChild(dropdown);
    Editor._positionDropdown(dropdown, content);
    return dropdown;
  }

  private static _positionDropdown (dropdown: HTMLElement, content: HTMLElement): void {
    const rect = content.getBoundingClientRect();
    const width = Math.min(Math.round(rect.width), 420);
    const dropH = 300; // estimated max height of the dropdown

    dropdown.style.left = `${Math.round(rect.left)}px`;
    dropdown.style.width = `${width}px`;

    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow >= dropH || spaceBelow >= 150) {
      // Below the writing area
      dropdown.style.top = `${Math.round(rect.bottom + 4)}px`;
      dropdown.style.bottom = 'auto';
    } else {
      // Above if there is not enough room below
      dropdown.style.bottom = `${Math.round(window.innerHeight - rect.top + 4)}px`;
      dropdown.style.top = 'auto';
    }
  }

  /**
   * Closes the bubble as soon as the user presses (mouse or finger) anywhere but on it, including in the text
   * of the editor. The listener is added on open and removed by _closeMentionDropdown().
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
    state.dismissed = state.atNode ? {node: state.atNode, offset: state.atOffset} : null;
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
    const results = dropdown.querySelector<HTMLElement>('.mzre-mentions-results');
    const status = dropdown.querySelector<HTMLElement>('[role="status"]');
    // Bubble closed or replaced during the search: these results no longer concern it.
    if (!listId || !results || !status || state.dropdown !== dropdown) return;

    // Texts and URLs come from the host application: escaped here, never inserted raw.
    // A member without a usable profile URL is not offered.
    const items = users
      .filter((user): user is EditorUser => user !== null)
      .map((user, index) => Editor._mentionItemHtml(user, `${listId}-option-${index}`))
      .filter((item) => item !== '');

    state.activeIndex = -1;
    state.content.removeAttribute('aria-activedescendant');
    state.content.setAttribute('aria-autocomplete', 'list');

    if (!items.length) {
      results.innerHTML = `
        <div class="mzre-mentions-empty">
          <svg class="mzre-mentions-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="mzre-mentions-empty-text">${te('noUserFound')}</span>
        </div>`;
      state.content.removeAttribute('aria-controls');
      status.textContent = t('noUserFound');
      dropdown.hidden = false;
      return;
    }

    results.innerHTML = `<div class="mzre-mentions-list" role="listbox" id="${listId}" aria-label="${te('mentionSuggestions')}">${items.join('')}</div>`;
    state.content.setAttribute('aria-controls', listId);
    status.textContent = (items.length === 1 ? t('mentionResultsOne') : t('mentionResultsMany'))
      .replace('{count}', String(items.length));
    dropdown.hidden = false;
  }

  /** Options shown in the bubble (empty until it has results). */
  private static _mentionOptions (state: MentionState): HTMLElement[] {
    return Array.from(state.dropdown?.querySelectorAll<HTMLElement>('.mzre-mention-item') ?? []);
  }

  /** Chooses an option with the keyboard: `aria-selected` on the option, `aria-activedescendant` on the writing area. */
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
   * Keyboard, while the bubble is open. Focus never leaves the writing area:
   *   · Escape         → closes the bubble without touching the text (and without closing a host modal)
   *   · Up/Down arrows, Home/End → choose a suggestion (Home/End only once
   *     a suggestion is chosen; otherwise they move the caret as usual)
   *   · Enter or Tab  → insert the chosen suggestion; with no choice, they keep their usual role
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

  /** A member's row in the bubble; empty string if their profile URL is unusable. */
  private static _mentionItemHtml (user: EditorUser, id: string): string {
    const profilePath = safeSitePath(user.profileUrl);
    if (profilePath === null) return '';

    const firstName = String(user.firstName ?? '');
    const lastName = String(user.lastName ?? '');
    const name = `${firstName} ${lastName}`.trim();
    const avatar = safeHttpUrl(user.avatarUrl);
    const initials = ([...firstName][0] ?? '') + ([...lastName][0] ?? '');

    // Decorative avatar: the name is read right next to it.
    const avatarHtml = avatar
      ? `<img src="${escapeHtml(avatar)}" alt="" loading="lazy" />`
      : `<span class="mzre-mention-avatar-fallback" aria-hidden="true">${escapeHtml(initials.toUpperCase())}</span>`;

    return `
          <div class="mzre-mention-item" id="${escapeHtml(id)}" data-user-id="${escapeHtml(user.ID)}" data-profile-url="${escapeHtml(profilePath)}" role="option" aria-selected="false">
            <div class="mzre-mention-avatar">${avatarHtml}</div>
            <div class="mzre-mention-info">
              <span class="mzre-mention-name">${escapeHtml(name)}</span>
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

    const username = item.querySelector('.mzre-mention-name')?.textContent?.trim() ?? '';
    const profileUrl = item.dataset.profileUrl ?? '';
    const userId = integration.encodeUserId(item.dataset.userId ?? '');

    // Compute the end of the @term from the saved state — do not use
    // the current selection: focus left the contenteditable on the click
    // on the dropdown, making the offset invalid for state.atNode.
    const nodeLen = state.atNode.textContent?.length ?? 0;
    const termLen = 1 + (state.previousTerm?.length ?? 0); // 1 = the @ itself
    const endOffset = Math.min(state.atOffset + termLen, nodeLen);

    // Remove the "@term" text then insert the mention blot
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

    // Put focus back on the contenteditable (lost on the dropdown click)
    // then move the caret after the mention and insert a separator space.
    content.focus();
    const sel = window.getSelection()!;
    const newRange = document.createRange();
    newRange.setStartAfter(mentionEl);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    document.execCommand('insertText', false, ' ');

    Editor._closeMentionDropdown(state);

    // Triggers the existing 'input' listener that calls sync() + refreshCount()
    content.dispatchEvent(new Event('input'));
  }

  /* ─────────────────────────────────────────
     Public API
  ───────────────────────────────────────── */

  /**
   * Initializes the editor on every textarea matching the selector.
   *
   * @param options.selector  CSS selector to target (default: 'textarea')
   * @param options.exclude   CSS selector to exclude
   * @param options.toolbar   Toolbar mode: 'always' | 'toggle' | 'focus' | 'never'
   * @param options.footer    Show the footer — default: true
   * @param options.minHeight Minimum height of the writing area (e.g. '160px')
   * @param options.maxHeight Maximum height before it scrolls (e.g. '400px')
   *
   * The data-mzre-* attributes on each textarea take precedence over the JS options.
   * See the documentation block at the top of the file for detailed use cases.
   *
   * @returns Editor (chainable)
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
   * Mounts the editor on a specific textarea.
   * Ideal for elements added dynamically to the DOM (modals, ajax widgets…).
   *
   * @param target   HTMLTextAreaElement element or CSS selector
   * @param options  Same options as init()
   *
   * @param integrations
   * @returns Editor (chainable)
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
