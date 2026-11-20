// Contrôle du paquet construit, avant publication : import dans Node et feuille de style exportée.
import {readFileSync} from 'node:fs';

const failures = [];

// 1) Le paquet s'importe côté serveur (aucun accès au DOM ni import JSON à l'évaluation).
try {
  await import('../dist/index.js');
  console.log('import Node OK');
} catch (error) {
  failures.push(`import Node impossible : ${error.message}`);
}

// 2) La feuille de style existe, contient les deux composants et ne dépend de rien d'extérieur.
try {
  const css = readFileSync(new URL('../dist/style.css', import.meta.url), 'utf8');
  for (const selector of ['.mzre-editor-wrap', '.mzre-mentions-dropdown', '.mzre-emoji-picker']) {
    if (!css.includes(selector)) failures.push(`dist/style.css ne contient pas ${selector}`);
  }
  if (css.includes('@import')) failures.push('dist/style.css contient un @import');
  console.log(`style.css OK (${css.length} octets)`);
} catch (error) {
  failures.push(`dist/style.css illisible : ${error.message}`);
}

// 3) Les exports déclarés dans package.json existent.
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (manifest.exports?.['./style.css'] !== './dist/style.css') failures.push('exports["./style.css"] manquant dans package.json');

if (failures.length) {
  console.error(failures.map((failure) => `✗ ${failure}`).join('\n'));
  process.exit(1);
}
