# @mzeahmed/rich-editor

[![npm version](https://img.shields.io/npm/v/@mzeahmed/rich-editor)](https://www.npmjs.com/package/@mzeahmed/rich-editor)
[![license](https://img.shields.io/npm/l/@mzeahmed/rich-editor)](https://github.com/mzeahmed/rich-editor/blob/main/LICENSE)
[![TypeScript types](https://img.shields.io/npm/types/@mzeahmed/rich-editor)](https://www.npmjs.com/package/@mzeahmed/rich-editor)
[![node](https://img.shields.io/node/v/@mzeahmed/rich-editor)](https://nodejs.org/)

A small, framework-agnostic rich text editor built on `contenteditable`, with **@mentions**, a
built-in **emoji picker**, strict-CSP support and keyboard accessibility.

> **Status: early release (0.x).** The API may still change between minor versions.

- Turns any `<textarea>` into an editor and keeps its value in sync (HTML).
- Optional toolbar, footer (character counter, HTML view, copy, clear), inline emoji button.
- `@mentions` with a suggestion bubble that is fully usable with the keyboard.
- Interface and emojis in English or French, every text can be overridden.
- Works under a strict Content-Security-Policy (no inline styles required).
- Safe to import on the server (SSR); the editor itself needs a browser DOM.
- Escapes everything it renders and sanitizes the HTML it loads. No runtime dependency other than
  `emojibase-data`, which is loaded lazily.

## Installation

```bash
npm install @mzeahmed/rich-editor
```

## Quick start

```ts
import Editor from '@mzeahmed/rich-editor';

const textarea = document.querySelector<HTMLTextAreaElement>('#message')!;

Editor.mount(textarea, {
  toolbar: 'always',
  emoji: true,
});
```

The `<textarea>` is hidden and replaced by the editor. Its `value` always holds the editor's
**HTML**, so it keeps working inside a regular `<form>`.

Mount every textarea of a page, or a selection:

```ts
import Editor from '@mzeahmed/rich-editor';

Editor.init({selector: 'textarea.richtext', exclude: '.plain', toolbar: 'focus'});
```

`mount()` and `init()` ignore a textarea that is already mounted. There is currently no way to
unmount an editor (see [Limitations](#limitations)).

## Options

Passed as the second argument of `Editor.mount()` / `Editor.init()`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `selector` | `string` | `'textarea'` | CSS selector of the textareas to mount (`init()` only). |
| `exclude` | `string` | – | CSS selector of textareas to skip (`init()` only). |
| `toolbar` | `'always' \| 'toggle' \| 'focus' \| 'never'` | `'always'` | Formatting toolbar: always visible, behind a toggle button, shown on focus, or absent. |
| `footer` | `boolean` | `true` | Footer with the character counter and the HTML / Clear / Copy buttons. |
| `minHeight` | `string` | `'160px'` | Minimum height of the writing area (any CSS length). |
| `maxHeight` | `string` | – | Maximum height before the area scrolls. |
| `emoji` | `boolean` | `false` | Adds an inline emoji button that opens the built-in picker. |
| `mention` | `boolean` | `false` | Enables `@mentions`. Requires `integrations.mentions`. |
| `locale` | `'en' \| 'fr'` | `'en'` | Language of the interface and of the emojis. Page-wide setting. |
| `mentionColors` | `MentionColors` | – | Colors of the mention bubble and of the mention link, for this editor. See [Mention colors](#mention-colors). |
| `styles` | `{inject?: boolean; nonce?: string}` | `{inject: true}` | How styles reach the page. See [Styles and CSP](#styles-and-csp). Page-wide setting. |
| `onChange` | `(change: EditorChange) => void` | – | Called on every change and once at mount. |

A few options can also be set per textarea with data attributes, which take precedence:
`data-mzre-toolbar="toggle"`, `data-mzre-min-height="100px"`, `data-mzre-max-height="400px"`.

The third argument carries the [integrations](#mentions) (`mentions`, `messages`).

## Reading the content

The textarea's `value` is updated on every change. For finer control, use `onChange`:

```ts
import Editor, {type EditorChange} from '@mzeahmed/rich-editor';

declare const textarea: HTMLTextAreaElement;
declare const publishButton: HTMLButtonElement;

Editor.mount(textarea, {
  onChange: ({html, text, isEmpty}: EditorChange) => {
    publishButton.disabled = isEmpty;
    console.log(html, text);
  },
});
```

`onChange` receives `{html, text, isEmpty}`. It is called once at mount (so you can set the initial
state of a "publish" button), then after every typing, toolbar action or inserted mention. The
editor never touches any element outside of itself.

> The HTML written to the textarea comes from a browser. **Sanitize it on your server** before
> storing or displaying it, as you would with any user-submitted HTML.

## Mentions

Set `mention: true` and provide the `mentions` integration. The editor asks you for users, you
decide where they come from:

```ts
import Editor, {type EditorMentionIntegration, type EditorUser} from '@mzeahmed/rich-editor';

declare const textarea: HTMLTextAreaElement;

const mentions: EditorMentionIntegration = {
  // Called while a search is running: show a busy state if you want one.
  loader: {
    freezeElement: (element) => element.setAttribute('aria-busy', 'true'),
    unfreezeElement: () =>
      document
        .querySelectorAll('.mzre-mentions-dropdown[aria-busy="true"]')
        .forEach((element) => element.removeAttribute('aria-busy')),
  },
  // Return RAW text: the editor escapes names, ids and URLs itself.
  searchUsers: async (term): Promise<EditorUser[]> => {
    const response = await fetch(`/api/members?q=${encodeURIComponent(term)}`);

    return (await response.json()) as EditorUser[];
  },
  // How a user id is written into the mention (`data-user-id`).
  encodeUserId: (id) => id,
  // Debounce the search while the user is typing.
  debounce: (callback, delay) => {
    let timer: number | undefined;

    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), delay);
    };
  },
};

Editor.mount(textarea, {mention: true}, {mentions});
```

An `EditorUser` is `{ID: string | number, avatarUrl: string, firstName: string, lastName: string,
profileUrl: string}`.

**How it behaves**

- Typing `@` at the start of a word, then at least two letters, opens a bubble with the matching users.
  Typing fast works (`@le` typed at once opens it); an `@` inside a word, such as in an e-mail
  address, does not.
- Choosing a user inserts `<a class="mention" href="/path/of/profile" data-user-id="…"
  target="_blank">First Last</a>`. Only the **path** of `profileUrl` is kept in the link.
- The bubble stays next to the writing area while the page or a scrolling container moves, and is
  hidden while the writing area is out of view.
- The bubble closes when you choose a user, press Space, Enter or Escape, click its **×** button, or
  click anywhere outside of it.
- Users without a usable `profileUrl` (`http(s)` or relative) are not offered. An avatar that is not
  an `http(s)` URL is replaced by the user's initials.

## Emoji picker

With `emoji: true`, an emoji button is added to the editor. The picker is also available on its own:

```ts
import {EmojiPicker} from '@mzeahmed/rich-editor';

await EmojiPicker.open({
  onSelect: (emoji) => console.log(emoji),
  title: 'Pick one', // optional, defaults to the localized text
  closeLabel: 'Close', // optional
});

EmojiPicker.close();
```

`open()` shows the dialog immediately and returns a promise that resolves once the emojis are
displayed (or, if loading fails, once the error message is displayed: it never rejects). The emoji
data (~700 KB per language) is loaded **on first open** as a separate file by your bundler, so
importing the package stays light. `EmojiPicker.destroy()` removes the dialog from the page.

## Localization

The interface and the emoji data are in English by default. French is built in:

```ts
import Editor, {messagesFr, setEditorLocale, setEditorMessages} from '@mzeahmed/rich-editor';

declare const textarea: HTMLTextAreaElement;

// For one mount…
Editor.mount(textarea, {locale: 'fr'});

// …or for the whole page.
setEditorLocale('fr');

// Override individual texts (escaped by the editor, never inserted as HTML).
setEditorMessages({bold: 'Bold (Ctrl+B)', placeholder: 'Write your message…'});

// Same thing, through the integrations argument.
Editor.mount(textarea, {}, {messages: {close: 'Fermer'}});

console.log(Object.keys(messagesFr));
```

`messagesEn` and `messagesFr` list every text (toolbar, footer, emoji picker, mention bubble).
The language is a **page-wide setting**: the last `mount()`, `init()` or `setEditorLocale()` wins,
for all editors and for the emoji picker. Only `en` and `fr` are bundled; to add a language, pass
all the texts through `setEditorMessages()` (emoji labels stay in English or French).

## Styles and CSP

By default the editor injects its own styles into `<head>` (two `<style>` elements). A Content
Security Policy without `'unsafe-inline'` blocks them. Two options:

```ts
import '@mzeahmed/rich-editor/style.css';
import {setEditorStyles} from '@mzeahmed/rich-editor';

// 1. Load the stylesheet yourself and turn injection off (no <style> element is added).
setEditorStyles({inject: false});

// 2. Or keep the injection and give it the nonce of your CSP (style-src 'nonce-…').
setEditorStyles({inject: true, nonce: document.querySelector<HTMLMetaElement>('meta[name="csp-nonce"]')?.content});
```

The same can be passed on mount: `Editor.mount(textarea, {styles: {inject: false}})`.

The markup produced by the editor contains **no `style="…"` attribute and no inline event
handler**. It was verified in a browser under `default-src 'none'; script-src 'self';
style-src 'self'` (no violation); with the default injection and no nonce, that policy blocks the
styles. If your CSP restricts `img-src`, allow the origin of your users' avatars.

## Mention colors

### At mount (per editor)

Pass the colors you want in the `mentionColors` option. Any CSS color works (`#0f9d7a`, `rgb(…)`,
`hsl(…)`, a name, or `var(--brand)`); what you leave out keeps its default.

```ts
import Editor from '@mzeahmed/rich-editor';

declare const textarea: HTMLTextAreaElement;
declare const mentions: import('@mzeahmed/rich-editor').EditorMentionIntegration;

Editor.mount(textarea, {
  mention: true,
  mentionColors: {
    // Hovered or chosen user in the bubble
    active: '#0f9d7a',
    activeBackground: 'rgba(15, 157, 122, .08)',
    activeBorder: 'rgba(15, 157, 122, .25)',
    // Mention link inside the editor
    link: '#0b7a5f',
    linkBackground: 'rgba(15, 157, 122, .1)',
    linkBorder: 'rgba(15, 157, 122, .3)',
    linkHoverBackground: 'rgba(15, 157, 122, .18)',
    linkHoverBorder: 'rgba(15, 157, 122, .4)',
  },
}, {mentions});
```

| Option | Used for |
| --- | --- |
| `active` | Name, avatar border and outline of the **hovered / chosen user** in the bubble |
| `activeBackground` | Background of the hovered / chosen user |
| `activeBorder` | Border of the hovered / chosen user, avatar border, keyboard focus ring |
| `link` | Text color of the mention link in the editor |
| `linkBackground` | Background of the mention link |
| `linkBorder` | Border of the mention link |
| `linkHoverBackground` | Background of the mention link on hover |
| `linkHoverBorder` | Border of the mention link on hover |

Each editor keeps its own colors: two editors on the same page can look different. The colors are
applied through the CSSOM (`style.setProperty`), so they work under a strict CSP. Empty and
non-string values are ignored.

### With CSS (for the whole page)

Behind the option, the colors are CSS custom properties. You can set them yourself in your
stylesheet to style every editor of the page at once; an editor's `mentionColors` wins over them.
Nothing is set by the package, so your values always win over the defaults, which are the blue below.

| Variable | Used for | Default |
| --- | --- | --- |
| `--mzre-mention-active-color` | Name, avatar border and outline of the **hovered / chosen user** in the bubble | `#3b82f6` |
| `--mzre-mention-active-bg` | Background of the hovered / chosen user | `rgba(59, 130, 246, .07)` |
| `--mzre-mention-active-border` | Border of the hovered / chosen user, avatar border, keyboard focus ring | `rgba(59, 130, 246, .15)` |
| `--mzre-mention-color` | Text color of the mention link in the editor | `#2563eb` |
| `--mzre-mention-bg` | Background of the mention link | `rgba(59, 130, 246, .1)` |
| `--mzre-mention-border` | Border of the mention link | `rgba(59, 130, 246, .2)` |
| `--mzre-mention-hover-bg` | Background of the mention link on hover | `rgba(59, 130, 246, .16)` |
| `--mzre-mention-hover-border` | Border of the mention link on hover | `rgba(59, 130, 246, .35)` |

```css
:root {
  --mzre-mention-active-color: #0f9d7a;
  --mzre-mention-active-bg: rgba(15, 157, 122, .08);
  --mzre-mention-active-border: rgba(15, 157, 122, .25);
  --mzre-mention-color: #0b7a5f;
  --mzre-mention-bg: rgba(15, 157, 122, .1);
  --mzre-mention-border: rgba(15, 157, 122, .25);
}
```

The bubble is appended to `<body>`, outside of your editor's container: with CSS, set the
`--mzre-mention-active-*` variables on `:root` or `body` (or on an ancestor of both), not on the
editor's wrapper. The `--mzre-mention-*` variables of the link can also be set on any ancestor of the
editor. (The `mentionColors` option has no such constraint: the package puts each value where it
belongs.)

They work under a strict CSP, and they can be changed at any time from JavaScript, for example for a
dark theme: `document.documentElement.style.setProperty('--mzre-mention-color', '#7dd3fc')`.

## Security

- **Output escaping.** Names, ids, URLs and every localized text are escaped before being rendered.
  `searchUsers()` must return **raw** text, never pre-escaped text (it would be displayed escaped
  twice).
- **URLs.** Avatars and profile links must be `http(s)` or relative. `javascript:`, `data:` and
  similar schemes are refused. A profile path starting with `//` can never point to another site.
- **Initial content.** The HTML found in the textarea when the editor is mounted is sanitized with an
  allow-list: `a`, `b`, `blockquote`, `br`, `code`, `div`, `em`, `h2`, `h3`, `i`, `li`, `ol`, `p`,
  `pre`, `s`, `span`, `strike`, `strong`, `u`, `ul`. Links keep `http(s):`, `mailto:`, `tel:`,
  site-relative paths and anchors; the only style kept is `text-align`. Scripts, event handlers
  (`onerror`…), `javascript:` links, images and unknown tags are removed (unknown tags keep their text).
  Mentions are preserved.
- **Output.** The HTML produced by the editor is user input. Sanitize it on the server.

## Accessibility

The writing area has the `textbox` role (multiline). Its accessible name comes from the textarea's
`aria-label`, or else its `placeholder`: give your fields an explicit name.

The mention bubble is driven entirely from the keyboard **without moving focus out of the writing
area** (a listbox linked to the field through `aria-activedescendant`):

| Key | Effect |
| --- | --- |
| `@` then 2 letters | Opens the bubble. Screen readers announce the number of suggestions. |
| `↓` / `↑` | Choose the next / previous suggestion (wraps around). |
| `Home` / `End` | First / last suggestion, once one is chosen (otherwise they move the caret). |
| `Enter` or `Tab` | Insert the chosen suggestion. With no choice, they keep their usual role. |
| `Escape` | Closes the bubble without touching the text (and without closing a surrounding modal). |

While the bubble is open, the writing area carries `aria-autocomplete`, `aria-controls` and
`aria-activedescendant`; the bubble is a labelled `region` containing a `listbox` of `option`s, plus
a polite live region for announcements. An `axe-core` audit (WCAG 2.1 A/AA and best practices) with
the bubble open and one suggestion chosen reports no violation.

> Automated audits only catch part of the problems. The package has **not** been tested yet with
> NVDA, JAWS or VoiceOver.

## Server-side rendering and compatibility

- **Importing** the package in Node (SSR, tests) is safe: it touches neither the DOM nor JSON at
  evaluation time. Call `mount()` / `init()` / `EmojiPicker.open()` in the browser only.
- **Format:** ESM only, with TypeScript declarations. `@mzeahmed/rich-editor/style.css` is the
  stylesheet.
- **Bundlers:** the emoji data is loaded with a dynamic `import()` of JSON files from
  `emojibase-data`; bundlers such as Vite, webpack, Rollup or esbuild turn them into separate
  chunks. Verified with Vite.
- **Browsers:** requires `contenteditable` and, for formatting commands, `document.execCommand`
  (deprecated by the standards but still supported by evergreen browsers). Verified in Chromium and
  in jsdom; Firefox and Safari have not been tested yet.

## Limitations

- No `destroy()` / unmount method for an editor yet.
- The language and the style injection are **page-wide** settings, not per editor.
- Only English and French are bundled.
- Formatting relies on `document.execCommand`.
- The footer's "HTML", "Clear" and "Copy" buttons are part of the footer: hide them all with
  `footer: false`.

## Development

```bash
npm ci
npm test              # unit and DOM tests (Vitest + jsdom)
npm run build         # tsc + dist/style.css
npm run check:package # imports dist in Node, checks style.css and the exports
```

`npm pack` runs the build and `check:package` automatically (`prepack`).

Changes are listed in [CHANGELOG.md](./CHANGELOG.md). Releases are published from a version tag, with
npm provenance: see [RELEASING.md](./RELEASING.md).

## License

[MIT](./LICENSE)
