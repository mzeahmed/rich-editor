// Écrit dist/style.css à partir des feuilles de style du paquet (dist/styles.js, produit par tsc).
// Source unique : le même CSS est injecté à l'exécution ou chargé comme fichier (CSP stricte).
import {writeFileSync} from 'node:fs';
import {EDITOR_CSS, EMOJI_PICKER_CSS} from '../dist/styles.js';

const banner = '/* @mzeahmed/rich-editor — feuille de style. Chargez-la si vous coupez l\'injection : setEditorStyles({inject: false}). */\n';

writeFileSync(new URL('../dist/style.css', import.meta.url), `${banner}${EDITOR_CSS.trim()}\n\n${EMOJI_PICKER_CSS.trim()}\n`);
console.log('dist/style.css écrit');
