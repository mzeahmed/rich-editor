// Writes dist/style.css from the package's stylesheets (dist/styles.js, produced by tsc).
// Single source: the same CSS is injected at runtime or loaded as a file (strict CSP).
import {writeFileSync} from 'node:fs';
import {EDITOR_CSS, EMOJI_PICKER_CSS} from '../dist/styles.js';

const banner = '/* @mzeahmed/rich-editor — stylesheet. Load it if you turn injection off: setEditorStyles({inject: false}). */\n';

writeFileSync(new URL('../dist/style.css', import.meta.url), `${banner}${EDITOR_CSS.trim()}\n\n${EMOJI_PICKER_CSS.trim()}\n`);
console.log('dist/style.css written');
