// @vitest-environment node
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {describe, expect, it} from 'vitest';

/**
 * Les exemples TypeScript du README doivent compiler contre les vrais types du paquet : une
 * documentation dont le code ne compile plus est pire que pas de documentation.
 *
 * Chaque bloc ```ts est compilé séparément (en strict), avec quelques variables de page déclarées
 * (`textarea`, `publishButton`). Les blocs ```bash ne sont pas concernés.
 */
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const README = readFileSync(`${ROOT}README.md`, 'utf8');
const BLOCKS = [...README.matchAll(/```ts\n([\s\S]*?)```/g)].map((match) => match[1]);

const PRELUDE = `
declare const textarea: HTMLTextAreaElement;
declare const publishButton: HTMLButtonElement;
`;

function diagnose(code: string): string[] {
  const files = new Map<string, string>([
    ['/virtual/prelude.d.ts', PRELUDE],
    ['/virtual/example.ts', code]
  ]);
  const options: ts.CompilerOptions = {
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    skipLibCheck: true,
    types: [],
    baseUrl: ROOT,
    paths: {'@mzeahmed/rich-editor': ['src/index.ts']}
  };
  const host = ts.createCompilerHost(options);
  const {readFile, fileExists, getSourceFile} = host;

  host.fileExists = (file) => files.has(file) || fileExists.call(host, file);
  host.readFile = (file) => files.get(file) ?? readFile.call(host, file);
  host.getSourceFile = (file, languageVersion, ...rest) =>
    files.has(file)
      ? ts.createSourceFile(file, files.get(file)!, languageVersion, true)
      : getSourceFile.call(host, file, languageVersion, ...rest);

  const program = ts.createProgram(['/virtual/prelude.d.ts', '/virtual/example.ts'], options, host);

  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file?.fileName.startsWith('/virtual/'))
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
}

describe('README', () => {
  it('contient des exemples TypeScript', () => {
    expect(BLOCKS.length).toBeGreaterThanOrEqual(7);
  });

  it.each(BLOCKS.map((code, index) => [index + 1, code] as const))('l’exemple %i compile', (_index, code) => {
    expect(diagnose(code)).toEqual([]);
  });

  it('refuse un exemple faux : le contrôle détecte bien une erreur de type', () => {
    expect(diagnose("import Editor from '@mzeahmed/rich-editor';\nEditor.mount(textarea, {toolbar: 'sometimes'});").length).toBeGreaterThan(0);
  });

  it('mentionne chaque option et chaque export public', async () => {
    const api = await import('../src/index.js');

    for (const name of Object.keys(api).filter((key) => key !== 'default')) {
      expect(README, `${name} absent du README`).toMatch(new RegExp(`\\b${name}\\b`));
    }

    for (const option of ['selector', 'exclude', 'toolbar', 'footer', 'minHeight', 'maxHeight', 'emoji', 'mention', 'locale', 'styles', 'onChange']) {
      expect(README, `option ${option} absente du README`).toContain(`\`${option}\``);
    }
  });
});
