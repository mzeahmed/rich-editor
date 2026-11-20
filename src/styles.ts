/**
 * Feuilles de style du paquet. Source unique : elles sont injectées dans la page à l'exécution
 * (voir `injectStyleSheet`) et écrites dans `dist/style.css` à la construction (`scripts/build-css.mjs`),
 * pour les applications dont la CSP interdit les balises `<style>` injectées.
 */

export const EDITOR_CSS = `
.yoo-editor-wrap {
  border: 1px solid #d0cdc6;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  font-family: sans-serif;
}
.yoo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  border-bottom: 1px solid #e8e5df;
  background: #f7f7f5;
}
.yoo-toolbar button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  transition: background .12s;
}
.yoo-toolbar button:hover { background: #e8e5df; }
.yoo-toolbar button.yoo-active { background: #dbeafe; color: #1d4ed8; }
.yoo-sep { width: 1px; height: 20px; background: #d0cdc6; margin: 0 4px; flex-shrink: 0; }
.yoo-toolbar select {
  border: 1px solid #d0cdc6;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 13px;
  background: #fff;
  color: #333;
  height: 28px;
  cursor: pointer;
}
.yoo-link-bar {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-bottom: 1px solid #e8e5df;
  background: #f7f7f5;
}
.yoo-link-bar input {
  flex: 1;
  border: 1px solid #d0cdc6;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  background: #fff;
  color: #333;
  outline: none;
}
.yoo-link-bar .yoo-btn-insert {
  background: #dbeafe; color: #1d4ed8;
  border: none; border-radius: 6px;
  padding: 4px 10px; font-size: 13px; cursor: pointer;
}
.yoo-link-bar .yoo-btn-remove {
  background: none; border: 1px solid #d0cdc6; color: #555;
  border-radius: 6px; padding: 4px 10px; font-size: 13px; cursor: pointer;
}
.yoo-link-bar .yoo-btn-close {
  background: none; border: none; cursor: pointer;
  font-size: 18px; line-height: 1; color: #999; padding: 0 4px;
}
.yoo-content {
  min-height: 160px;
  padding: 14px 16px;
  outline: none;
  font-size: 15px;
  line-height: 1.75;
  color: #1a1a1a;
  box-sizing: border-box;
  width: 100%;
}
.yoo-content:empty::before {
  content: attr(data-placeholder);
  color: #aaa;
  pointer-events: none;
}
.yoo-content h2 { font-size: 1.25em; font-weight: 600; margin: .75em 0 .25em; }
.yoo-content h3 { font-size: 1.1em; font-weight: 600; margin: .6em 0 .2em; }
.yoo-content ul, .yoo-content ol { padding-left: 1.5em; margin: .3em 0; }
.yoo-content a { color: #1d4ed8; }
.yoo-content blockquote {
  border-left: 3px solid #d0cdc6;
  margin: .5em 0; padding: .2em .8em;
  color: #666; font-style: italic;
}
.yoo-export-box {
  display: none;
  margin: 0 12px 8px;
  border: 1px solid #e8e5df;
  border-radius: 8px;
  background: #f7f7f5;
  padding: 10px 12px;
  font-size: 12px;
  font-family: monospace;
  color: #555;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 120px;
  overflow: auto;
}
.yoo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-top: 1px solid #e8e5df;
  background: #f7f7f5;
}
.yoo-charcount { font-size: 12px; color: #595959; }
.yoo-footer-actions { display: flex; gap: 6px; }
.yoo-btn-action {
  border: 1px solid #d0cdc6; background: none;
  border-radius: 6px; padding: 4px 10px;
  font-size: 13px; cursor: pointer; color: #555;
  transition: background .12s;
}
.yoo-btn-action:hover { background: #e8e5df; }
.yoo-btn-action.yoo-active { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }
.yoo-btn-primary {
  border: 1px solid #93c5fd; background: #dbeafe; color: #1d4ed8;
  border-radius: 6px; padding: 4px 12px;
  font-size: 13px; cursor: pointer; font-weight: 500;
  transition: opacity .12s;
}
.yoo-btn-primary:hover { opacity: .8; }

/* ── Toolbar visibility modes ── */
.yoo-toolbar-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 4px 8px;
  border-bottom: 1px solid #e8e5df;
  background: #f7f7f5;
}
.yoo-toolbar-toggle button {
  background: none;
  border: 1px solid #d0cdc6;
  border-radius: 6px;
  padding: 3px 9px;
  font-size: 12px;
  color: #777;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background .12s, color .12s;
  line-height: 1;
  height: 24px;
}
.yoo-toolbar-toggle button:hover { background: #e8e5df; color: #333; }
.yoo-toolbar-toggle button.yoo-active { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }

/* toolbar masquée par défaut (mode on-focus ou on-demand) */
.yoo-editor-wrap.yoo-toolbar-hidden .yoo-toolbar,
.yoo-editor-wrap.yoo-toolbar-hidden .yoo-link-bar {
  display: none !important;
}
.yoo-editor-wrap.yoo-toolbar-visible .yoo-toolbar {
  display: flex;
}

/* animation d'apparition */
.yoo-toolbar {
  transition: max-height .18s ease, opacity .18s ease;
  overflow: hidden;
}
.yoo-toolbar.yoo-toolbar-anim-hide {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-bottom-width: 0;
}
.yoo-toolbar.yoo-toolbar-anim-show {
  max-height: 120px;
  opacity: 1;
}

/* ── Bouton emoji positionné dans la zone de saisie ── */
.yoo-content-wrap {
  position: relative;
}
.yoo-content-wrap .yoo-emoji-button {
  position: absolute;
  bottom: 8px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #aaa;
  padding: 3px 7px;
  border-radius: 6px;
  line-height: 1;
  transition: background .12s, color .12s;
  z-index: 1;
}
.yoo-content-wrap .yoo-emoji-button:hover { background: #e8e5df; color: #666; }

/* ── Dropdown mentions (positionné en fixed via JS sur document.body) ── */
@keyframes yooMentionIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.yoo-mentions-dropdown {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, .14);
  z-index: 9999;
  overflow: hidden;
  animation: yooMentionIn .2s ease-out;
}
.yoo-mentions-dropdown .yoo-mentions-header {
  display: flex;
  justify-content: flex-end;
  padding: 4px 4px 0;
}
.yoo-mentions-dropdown .yoo-mentions-close {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #3b4c7a;
  font: inherit;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}
.yoo-mentions-dropdown .yoo-mentions-close:hover { background: #f1f2f5; }
.yoo-mentions-dropdown .yoo-mentions-close:focus-visible {
  outline: 2px solid rgba(59, 130, 246, .3);
  outline-offset: 2px;
}
.yoo-mentions-dropdown .yoo-mentions-list {
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
}
.yoo-mentions-dropdown .yoo-mentions-list::-webkit-scrollbar { width: 6px; }
.yoo-mentions-dropdown .yoo-mentions-list::-webkit-scrollbar-track { background: transparent; }
.yoo-mentions-dropdown .yoo-mentions-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, .15);
  border-radius: 3px;
}
.yoo-mentions-dropdown .yoo-mention-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background .15s, border-color .15s, transform .15s;
  border: 1px solid transparent;
}
.yoo-mentions-dropdown .yoo-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.yoo-mentions-dropdown .yoo-mention-item[aria-selected="true"],
.yoo-mentions-dropdown .yoo-mention-item:hover {
  background: rgba(59, 130, 246, .07);
  border-color: rgba(59, 130, 246, .15);
  transform: translateX(2px);
}
.yoo-mentions-dropdown .yoo-mention-item:active { transform: scale(.98); }
.yoo-mentions-dropdown .yoo-mention-item:focus {
  outline: 2px solid rgba(59, 130, 246, .3);
  outline-offset: 2px;
}
.yoo-mentions-dropdown .yoo-mention-avatar { position: relative; flex-shrink: 0; }
.yoo-mentions-dropdown .yoo-mention-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, .15);
  transition: border-color .2s, transform .2s, box-shadow .2s;
}
.yoo-mentions-dropdown .yoo-mention-item:hover .yoo-mention-avatar img {
  border-color: #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, .2);
}
.yoo-mentions-dropdown .yoo-mention-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #3b4c7a;
  font-size: 14px;
  font-weight: 600;
}
.yoo-mentions-dropdown .yoo-mention-info { flex: 1; min-width: 0; }
.yoo-mentions-dropdown .yoo-mention-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color .15s;
}
.yoo-mentions-dropdown .yoo-mention-item[aria-selected="true"] .yoo-mention-name,
.yoo-mentions-dropdown .yoo-mention-item:hover .yoo-mention-name { color: #3b82f6; }
.yoo-mentions-dropdown .yoo-mention-item[aria-selected="true"] {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}
.yoo-mentions-dropdown .yoo-mentions-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  text-align: center;
  color: #aaa;
}
.yoo-mentions-dropdown .yoo-mentions-empty-icon {
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
  opacity: .4;
  stroke-width: 1.5;
}
.yoo-mentions-dropdown .yoo-mentions-empty-text { font-size: 14px; }

/* ── Tag mention inline dans le contenu ── */
.yoo-content a.mention {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: rgba(59, 130, 246, .1);
  color: #2563eb;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid rgba(59, 130, 246, .2);
  transition: background .15s, border-color .15s, transform .15s;
}
.yoo-content a.mention:hover {
  background: rgba(59, 130, 246, .16);
  border-color: rgba(59, 130, 246, .35);
  transform: translateY(-1px);
}

/* Boutons U et S de la barre d'outils : mis en forme par classe (un attribut de style en ligne serait bloqué par une CSP stricte) */
.yoo-toolbar button.yoo-btn-underline { text-decoration: underline; }
.yoo-toolbar button.yoo-btn-strike { text-decoration: line-through; }
`;

export const EMOJI_PICKER_CSS = `
.yoo-emoji-picker[hidden] { display: none; }
.yoo-emoji-picker {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(35, 45, 85, .42);
}
.yoo-emoji-picker__dialog {
  width: min(620px, 100%);
  max-height: min(680px, calc(100vh - 40px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #dedfe5;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(35, 45, 85, .2);
  animation: yooEmojiPickerIn .16s ease-out;
}
.yoo-emoji-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid #e7e8ec;
  flex-shrink: 0;
}
.yoo-emoji-picker__title { margin: 0; color: #232d55; font: 600 18px/1.3 sans-serif; }
.yoo-emoji-picker__close,
.yoo-emoji-picker__tab,
.yoo-emoji-picker__status {
  grid-column: 1 / -1;
  margin: 0;
  padding: 48px 0;
  color: #3b4c7a;
  font: 14px/1.4 sans-serif;
  text-align: center;
}
.yoo-emoji-picker__item { font: inherit; cursor: pointer; }
.yoo-emoji-picker__close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #3b4c7a;
  font-size: 24px;
}
.yoo-emoji-picker__close:hover { background: #f1f2f5; }
.yoo-emoji-picker__tabs {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  overflow-x: auto;
  padding: 10px 12px;
  border-bottom: 1px solid #e7e8ec;
  scrollbar-width: thin;
}
.yoo-emoji-picker__tab {
  flex: 0 0 auto;
  padding: 7px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #59617a;
  font: 500 13px/1.2 sans-serif;
  white-space: nowrap;
}
.yoo-emoji-picker__tab:hover { background: #f1f7f5; color: #232d55; }
.yoo-emoji-picker__tab[aria-selected="true"] { background: #dff2ec; color: #232d55; }
.yoo-emoji-picker__panel {
  display: grid;
  grid-template-columns: repeat(10, minmax(36px, 1fr));
  gap: 3px;
  min-height: 280px;
  overflow-y: auto;
  padding: 12px;
}
.yoo-emoji-picker__item {
  aspect-ratio: 1;
  min-width: 36px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 24px;
  line-height: 1;
}
.yoo-emoji-picker__item:hover { background: #edf8f5; transform: scale(1.08); }
.yoo-emoji-picker :focus-visible { outline: 3px solid #6fc4ad; outline-offset: 2px; }
@keyframes yooEmojiPickerIn {
  from { opacity: 0; transform: translateY(8px) scale(.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@media (max-width: 640px) {
  .yoo-emoji-picker { align-items: end; padding: 0; }
  .yoo-emoji-picker__dialog { width: 100%; max-height: 78vh; border-radius: 16px 16px 0 0; }
  .yoo-emoji-picker__panel { grid-template-columns: repeat(8, minmax(34px, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .yoo-emoji-picker__dialog { animation: none; }
  .yoo-emoji-picker__item:hover { transform: none; }
}
`;

/**
 * Réglage de l'injection des styles, global à la page (comme la langue).
 *
 * - `inject: false` : le paquet n'ajoute aucune balise `<style>` ; chargez alors
 *   `@mzeahmed/rich-editor/style.css` vous-même (nécessaire sous une CSP sans `'unsafe-inline'`).
 * - `nonce` : nonce de votre CSP, posé sur les balises `<style>` injectées (`style-src 'nonce-…'`).
 */
export interface StyleOptions {
  inject?: boolean;
  nonce?: string;
}

let injectStyles = true;
let styleNonce: string | undefined;

export function setEditorStyles (options: StyleOptions): void {
  if (options.inject !== undefined) injectStyles = options.inject;
  if ('nonce' in options) styleNonce = options.nonce || undefined;
}

/** Ajoute la feuille `css` dans `<head>` sous l'identifiant `id` (une seule fois), sauf si l'injection est coupée. */
export function injectStyleSheet (id: string, css: string): void {
  if (!injectStyles || document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  if (styleNonce) style.setAttribute('nonce', styleNonce);
  style.textContent = css;
  document.head.appendChild(style);
}

export function removeStyleSheet (id: string): void {
  document.getElementById(id)?.remove();
}
