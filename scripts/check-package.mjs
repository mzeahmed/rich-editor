// Checks the built package before publication: import in Node and exported stylesheet.
import {readFileSync} from 'node:fs';

const failures = [];

// 1) The package can be imported on the server (no DOM access and no JSON import at evaluation time).
try {
  await import('../dist/index.js');
  console.log('import Node OK');
} catch (error) {
  failures.push(`Node import failed: ${error.message}`);
}

// 2) The stylesheet exists, contains both components and depends on nothing external.
try {
  const css = readFileSync(new URL('../dist/style.css', import.meta.url), 'utf8');
  for (const selector of ['.mzre-editor-wrap', '.mzre-mentions-dropdown', '.mzre-emoji-picker']) {
    if (!css.includes(selector)) failures.push(`dist/style.css does not contain ${selector}`);
  }
  if (css.includes('@import')) failures.push('dist/style.css contains an @import');
  console.log(`style.css OK (${css.length} characters)`);
} catch (error) {
  failures.push(`dist/style.css unreadable: ${error.message}`);
}

// 3) The exports declared in package.json exist.
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (manifest.exports?.['./style.css'] !== './dist/style.css') failures.push('exports["./style.css"] missing from package.json');

if (failures.length) {
  console.error(failures.map((failure) => `✗ ${failure}`).join('\n'));
  process.exit(1);
}
