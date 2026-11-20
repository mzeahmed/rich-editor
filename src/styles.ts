/**
 * Feuilles de style du paquet. Source unique : elles sont injectées dans la page à l'exécution
 * (voir `injectStyleSheet`) et écrites dans `dist/style.css` à la construction (`scripts/build-css.mjs`),
 * pour les applications dont la CSP interdit les balises `<style>` injectées.
 */

export const EDITOR_CSS = `
.mzre-editor-wrap {
  border: 1px solid #d0cdc6;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  font-family: sans-serif;
}
.mzre-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  border-bottom: 1px solid #e8e5df;
  background: #f7f7f5;
}
.mzre-toolbar button {
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
.mzre-toolbar button:hover { background: #e8e5df; }
.mzre-toolbar button.mzre-active { background: #dbeafe; color: #1d4ed8; }
.mzre-sep { width: 1px; height: 20px; background: #d0cdc6; margin: 0 4px; flex-shrink: 0; }
.mzre-toolbar select {
  border: 1px solid #d0cdc6;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 13px;
  background: #fff;
  color: #333;
  height: 28px;
  cursor: pointer;
}
.mzre-link-bar {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-bottom: 1px solid #e8e5df;
  background: #f7f7f5;
}
.mzre-link-bar input {
  flex: 1;
  border: 1px solid #d0cdc6;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  background: #fff;
  color: #333;
  outline: none;
}
.mzre-link-bar .mzre-btn-insert {
  background: #dbeafe; color: #1d4ed8;
  border: none; border-radius: 6px;
  padding: 4px 10px; font-size: 13px; cursor: pointer;
}
.mzre-link-bar .mzre-btn-remove {
  background: none; border: 1px solid #d0cdc6; color: #555;
  border-radius: 6px; padding: 4px 10px; font-size: 13px; cursor: pointer;
}
.mzre-link-bar .mzre-btn-close {
  background: none; border: none; cursor: pointer;
  font-size: 18px; line-height: 1; color: #999; padding: 0 4px;
}
.mzre-content {
  min-height: 160px;
  padding: 14px 16px;
  outline: none;
  font-size: 15px;
  line-height: 1.75;
  color: #1a1a1a;
  box-sizing: border-box;
  width: 100%;
}
.mzre-content:empty::before {
  content: attr(data-placeholder);
  color: #aaa;
  pointer-events: none;
}
.mzre-content h2 { font-size: 1.25em; font-weight: 600; margin: .75em 0 .25em; }
.mzre-content h3 { font-size: 1.1em; font-weight: 600; margin: .6em 0 .2em; }
.mzre-content ul, .mzre-content ol { padding-left: 1.5em; margin: .3em 0; }
.mzre-content a { color: #1d4ed8; }
.mzre-content blockquote {
  border-left: 3px solid #d0cdc6;
  margin: .5em 0; padding: .2em .8em;
  color: #666; font-style: italic;
}
.mzre-export-box {
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
.mzre-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-top: 1px solid #e8e5df;
  background: #f7f7f5;
}
.mzre-charcount { font-size: 12px; color: #595959; }
.mzre-footer-actions { display: flex; gap: 6px; }
.mzre-btn-action {
  border: 1px solid #d0cdc6; background: none;
  border-radius: 6px; padding: 4px 10px;
  font-size: 13px; cursor: pointer; color: #555;
  transition: background .12s;
}
.mzre-btn-action:hover { background: #e8e5df; }
.mzre-btn-action.mzre-active { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }
.mzre-btn-primary {
  border: 1px solid #93c5fd; background: #dbeafe; color: #1d4ed8;
  border-radius: 6px; padding: 4px 12px;
  font-size: 13px; cursor: pointer; font-weight: 500;
  transition: opacity .12s;
}
.mzre-btn-primary:hover { opacity: .8; }

/* ── Toolbar visibility modes ── */
.mzre-toolbar-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 4px 8px;
  border-bottom: 1px solid #e8e5df;
  background: #f7f7f5;
}
.mzre-toolbar-toggle button {
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
.mzre-toolbar-toggle button:hover { background: #e8e5df; color: #333; }
.mzre-toolbar-toggle button.mzre-active { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }

/* toolbar masquée par défaut (mode on-focus ou on-demand) */
.mzre-editor-wrap.mzre-toolbar-hidden .mzre-toolbar,
.mzre-editor-wrap.mzre-toolbar-hidden .mzre-link-bar {
  display: none !important;
}
.mzre-editor-wrap.mzre-toolbar-visible .mzre-toolbar {
  display: flex;
}

/* animation d'apparition */
.mzre-toolbar {
  transition: max-height .18s ease, opacity .18s ease;
  overflow: hidden;
}
.mzre-toolbar.mzre-toolbar-anim-hide {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-bottom-width: 0;
}
.mzre-toolbar.mzre-toolbar-anim-show {
  max-height: 120px;
  opacity: 1;
}

/* ── Bouton emoji positionné dans la zone de saisie ── */
.mzre-content-wrap {
  position: relative;
}
.mzre-content-wrap .mzre-emoji-button {
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
.mzre-content-wrap .mzre-emoji-button:hover { background: #e8e5df; color: #666; }

/* ── Dropdown mentions (positionné en fixed via JS sur document.body) ── */
@keyframes mzreMentionIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.mzre-mentions-dropdown {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, .14);
  z-index: 9999;
  overflow: hidden;
  animation: mzreMentionIn .2s ease-out;
}
.mzre-mentions-dropdown .mzre-mentions-header {
  display: flex;
  justify-content: flex-end;
  padding: 4px 4px 0;
}
.mzre-mentions-dropdown .mzre-mentions-close {
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
.mzre-mentions-dropdown .mzre-mentions-close:hover { background: #f1f2f5; }
.mzre-mentions-dropdown .mzre-mentions-close:focus-visible {
  outline: 2px solid rgba(59, 130, 246, .3);
  outline-offset: 2px;
}
.mzre-mentions-dropdown .mzre-mentions-list {
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
}
.mzre-mentions-dropdown .mzre-mentions-list::-webkit-scrollbar { width: 6px; }
.mzre-mentions-dropdown .mzre-mentions-list::-webkit-scrollbar-track { background: transparent; }
.mzre-mentions-dropdown .mzre-mentions-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, .15);
  border-radius: 3px;
}
.mzre-mentions-dropdown .mzre-mention-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background .15s, border-color .15s, transform .15s;
  border: 1px solid transparent;
}
.mzre-mentions-dropdown .mzre-sr-only {
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
.mzre-mentions-dropdown .mzre-mention-item[aria-selected="true"],
.mzre-mentions-dropdown .mzre-mention-item:hover {
  background: rgba(59, 130, 246, .07);
  border-color: rgba(59, 130, 246, .15);
  transform: translateX(2px);
}
.mzre-mentions-dropdown .mzre-mention-item:active { transform: scale(.98); }
.mzre-mentions-dropdown .mzre-mention-item:focus {
  outline: 2px solid rgba(59, 130, 246, .3);
  outline-offset: 2px;
}
.mzre-mentions-dropdown .mzre-mention-avatar { position: relative; flex-shrink: 0; }
.mzre-mentions-dropdown .mzre-mention-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, .15);
  transition: border-color .2s, transform .2s, box-shadow .2s;
}
.mzre-mentions-dropdown .mzre-mention-item:hover .mzre-mention-avatar img {
  border-color: #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, .2);
}
.mzre-mentions-dropdown .mzre-mention-avatar-fallback {
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
.mzre-mentions-dropdown .mzre-mention-info { flex: 1; min-width: 0; }
.mzre-mentions-dropdown .mzre-mention-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color .15s;
}
.mzre-mentions-dropdown .mzre-mention-item[aria-selected="true"] .mzre-mention-name,
.mzre-mentions-dropdown .mzre-mention-item:hover .mzre-mention-name { color: #3b82f6; }
.mzre-mentions-dropdown .mzre-mention-item[aria-selected="true"] {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}
.mzre-mentions-dropdown .mzre-mentions-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  text-align: center;
  color: #aaa;
}
.mzre-mentions-dropdown .mzre-mentions-empty-icon {
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
  opacity: .4;
  stroke-width: 1.5;
}
.mzre-mentions-dropdown .mzre-mentions-empty-text { font-size: 14px; }

/* ── Tag mention inline dans le contenu ── */
.mzre-content a.mention {
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
.mzre-content a.mention:hover {
  background: rgba(59, 130, 246, .16);
  border-color: rgba(59, 130, 246, .35);
  transform: translateY(-1px);
}

/* Boutons U et S de la barre d'outils : mis en forme par classe (un attribut de style en ligne serait bloqué par une CSP stricte) */
.mzre-toolbar button.mzre-btn-underline { text-decoration: underline; }
.mzre-toolbar button.mzre-btn-strike { text-decoration: line-through; }
`;

export const EMOJI_PICKER_CSS = `
.mzre-emoji-picker[hidden] { display: none; }
.mzre-emoji-picker {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(35, 45, 85, .42);
}
.mzre-emoji-picker__dialog {
  width: min(620px, 100%);
  max-height: min(680px, calc(100vh - 40px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #dedfe5;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(35, 45, 85, .2);
  animation: mzreEmojiPickerIn .16s ease-out;
}
.mzre-emoji-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid #e7e8ec;
  flex-shrink: 0;
}
.mzre-emoji-picker__title { margin: 0; color: #232d55; font: 600 18px/1.3 sans-serif; }
.mzre-emoji-picker__close,
.mzre-emoji-picker__tab,
.mzre-emoji-picker__status {
  grid-column: 1 / -1;
  margin: 0;
  padding: 48px 0;
  color: #3b4c7a;
  font: 14px/1.4 sans-serif;
  text-align: center;
}
.mzre-emoji-picker__item { font: inherit; cursor: pointer; }
.mzre-emoji-picker__close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #3b4c7a;
  font-size: 24px;
}
.mzre-emoji-picker__close:hover { background: #f1f2f5; }
.mzre-emoji-picker__tabs {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  overflow-x: auto;
  padding: 10px 12px;
  border-bottom: 1px solid #e7e8ec;
  scrollbar-width: thin;
}
.mzre-emoji-picker__tab {
  flex: 0 0 auto;
  padding: 7px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #59617a;
  font: 500 13px/1.2 sans-serif;
  white-space: nowrap;
}
.mzre-emoji-picker__tab:hover { background: #f1f7f5; color: #232d55; }
.mzre-emoji-picker__tab[aria-selected="true"] { background: #dff2ec; color: #232d55; }
.mzre-emoji-picker__panel {
  display: grid;
  grid-template-columns: repeat(10, minmax(36px, 1fr));
  gap: 3px;
  min-height: 280px;
  overflow-y: auto;
  padding: 12px;
}
.mzre-emoji-picker__item {
  aspect-ratio: 1;
  min-width: 36px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 24px;
  line-height: 1;
}
.mzre-emoji-picker__item:hover { background: #edf8f5; transform: scale(1.08); }
.mzre-emoji-picker :focus-visible { outline: 3px solid #6fc4ad; outline-offset: 2px; }
@keyframes mzreEmojiPickerIn {
  from { opacity: 0; transform: translateY(8px) scale(.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@media (max-width: 640px) {
  .mzre-emoji-picker { align-items: end; padding: 0; }
  .mzre-emoji-picker__dialog { width: 100%; max-height: 78vh; border-radius: 16px 16px 0 0; }
  .mzre-emoji-picker__panel { grid-template-columns: repeat(8, minmax(34px, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .mzre-emoji-picker__dialog { animation: none; }
  .mzre-emoji-picker__item:hover { transform: none; }
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
