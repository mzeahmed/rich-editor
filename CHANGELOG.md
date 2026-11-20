# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/). While the version is `0.x`, a minor version
may contain breaking changes; they are always listed here.

Before a release, the pending entries below `[Unreleased]` are moved under a heading
`## [x.y.z] - YYYY-MM-DD` (see [RELEASING.md](./RELEASING.md)).

## [Unreleased]

## [0.2.0] - 2026-11-20

### Added

- The colors of the mention bubble and of the mention link are customizable, per editor, with the new
  `mentionColors` option (`active`, `activeBackground`, `activeBorder` for the hovered or chosen user;
  `link`, `linkBackground`, `linkBorder`, `linkHoverBackground`, `linkHoverBorder` for the link in the
  editor) and the exported `MentionColors` type. The values are applied through the CSSOM, so they work
  under a strict CSP.
- The same colors are CSS custom properties (`--mzre-mention-active-color`, `--mzre-mention-active-bg`,
  `--mzre-mention-active-border`, `--mzre-mention-color`, `--mzre-mention-bg`, `--mzre-mention-border`,
  `--mzre-mention-hover-bg`, `--mzre-mention-hover-border`) to style every editor of a page from your
  stylesheet. The defaults are the previous blue, so nothing changes unless you set them.

## [0.1.2] - 2026-11-20

### Fixed

- The mention bubble now follows the writing area when the page (or a scrolling container such as a
  modal) scrolls or the window is resized. It used to stay where it opened. It is hidden while the
  writing area is out of the viewport.

## [0.1.1] - 2026-11-20

### Fixed

- The mention bubble now opens when the letters follow the `@` without a pause: it used to open only
  if the `@` was seen alone by the debounced key handler, so typing `@le` quickly opened nothing.
- An `@` inside a word (such as `jean@…` in an e-mail address) no longer opens the bubble.
- The bubble now closes when the text after the `@` contains a space, even if no Space key release
  was seen (paste, fast typing).
- A bubble dismissed with Escape, the cross or a click outside no longer reopens by itself while
  the same `@term` is still being typed; typing a new `@` opens it again.

## [0.1.0] - 2026-11-20

First public release.

### Added

- `Editor.mount()` and `Editor.init()` turn `<textarea>` elements into rich text editors based on
  `contenteditable`; the textarea keeps the editor's HTML as its value.
- Options: `toolbar` (`always`, `toggle`, `focus`, `never`), `footer`, `minHeight`, `maxHeight`,
  `emoji`, `mention`, `locale`, `styles`, `onChange`, plus `selector` / `exclude` for `init()`.
  `data-mzre-toolbar`, `data-mzre-min-height` and `data-mzre-max-height` override them per textarea.
- `onChange({html, text, isEmpty})`, called at mount and on every change (typing, toolbar,
  mention), for example to enable or disable a "publish" button.
- `@mentions`: a suggestion bubble fed by your `searchUsers()` integration. It closes with its
  **×** button, with Escape, or by clicking outside. Selecting a user inserts
  `<a class="mention" data-user-id="…">`.
- Emoji picker, inline in the editor (`emoji: true`) or standalone (`EmojiPicker.open()`, which
  returns a promise). Emoji data is loaded on first open, as a separate file per language.
- English (default) and French interface and emoji data: `locale`, `setEditorLocale()`,
  `messagesEn`, `messagesFr`; every text can be overridden with `setEditorMessages()` or
  `integrations.messages`.
- Strict Content-Security-Policy support: a `@mzeahmed/rich-editor/style.css` stylesheet,
  `setEditorStyles({inject, nonce})` to turn injection off or to set a CSP nonce, and no
  `style="…"` attribute or inline event handler in the produced markup.
- TypeScript declarations, ESM build, and `npm run check:package` (checks that the built package
  imports in Node and ships its stylesheet), run before every publication.

### Security

- Names, ids, URLs and localized texts are escaped before being rendered; avatar and profile URLs
  must be `http(s)` or relative, and a profile path starting with `//` can never point to another
  site.
- The HTML found in the textarea at mount time is sanitized with an allow-list of tags and
  attributes; scripts, event handlers, `javascript:` links and images are removed.

### Accessibility

- The writing area has the `textbox` role and an accessible name.
- The mention bubble is fully usable from the keyboard without moving focus out of the writing
  area (arrow keys, `Home` / `End`, `Enter` / `Tab`, `Escape`): a labelled `region` with a
  `listbox` of `option`s, `aria-activedescendant`, and polite announcements of the number of
  suggestions. An `axe-core` audit reports no violation with the bubble open.
- The toolbar's text-style menu has an accessible name, and the character counter meets the
  contrast requirement.

### Known limitations

- No way to unmount an editor yet.
- The language and the style injection are page-wide settings.
- Only English and French are bundled.
- Formatting relies on `document.execCommand`.
- Not yet tested with screen readers (NVDA, JAWS, VoiceOver), nor in Firefox and Safari.
