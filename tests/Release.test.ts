// @vitest-environment node
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';
// @ts-expect-error script .mjs sans déclarations de types
import {distTag, problems, releaseNotes, sections, versionOfTag} from '../scripts/release.mjs';

const MANIFEST = {
  name: '@mzeahmed/rich-editor',
  version: '1.2.0',
  license: 'MIT',
  repository: {type: 'git', url: 'git+https://github.com/exemple/rich-editor.git'},
  publishConfig: {access: 'public'}
};

const CHANGELOG = `# Changelog

## [Unreleased]

## [1.2.0] - 2026-12-01

### Added

- Une nouveauté.

## [1.1.0] - 2026-11-01

### Fixed

- Un correctif.

[Unreleased]: https://exemple.test/compare/v1.2.0...HEAD
[1.2.0]: https://exemple.test/compare/v1.1.0...v1.2.0
`;

const check = (overrides: Record<string, unknown> = {}): string[] =>
  problems({tag: 'v1.2.0', manifest: MANIFEST, changelog: CHANGELOG, ...overrides});

describe('étiquette et dist-tag', () => {
  it.each([['v1.2.0', '1.2.0'], ['v0.1.0-beta.1', '0.1.0-beta.1'], ['v10.20.30', '10.20.30']])('lit la version de %s', (tag, version) => {
    expect(versionOfTag(tag)).toBe(version);
  });

  it.each(['1.2.0', 'v1.2', 'v1.2.0.1', 'release-1', '', 'v1.2.0 ; rm -rf /'])('refuse l’étiquette %j', (tag) => {
    expect(versionOfTag(tag)).toBeNull();
  });

  it('publie une préversion sous « next », jamais sous « latest »', () => {
    expect(distTag('1.2.0')).toBe('latest');
    expect(distTag('1.2.0-beta.1')).toBe('next');
    expect(distTag('0.1.0-rc.2')).toBe('next');
  });
});

describe('journal des modifications', () => {
  it('découpe les sections et ignore les liens de référence de fin de fichier', () => {
    const all = sections(CHANGELOG);

    expect(all.map((section: {name: string}) => section.name)).toEqual(['Unreleased', '1.2.0', '1.1.0']);
    expect(all[1].date).toBe('2026-12-01');
    expect(all[2].body).toBe('### Fixed\n\n- Un correctif.');
  });

  it('extrait les notes d’une version', () => {
    expect(releaseNotes(CHANGELOG, '1.2.0')).toBe('### Added\n\n- Une nouveauté.');
    expect(() => releaseNotes(CHANGELOG, '9.9.9')).toThrow('9.9.9');
  });
});

describe('vérification avant publication', () => {
  it('accepte une version prête', () => {
    expect(check()).toEqual([]);
  });

  it('refuse une étiquette qui ne correspond pas à package.json', () => {
    expect(check({tag: 'v1.3.0'})[0]).toContain('ne correspond pas');
    expect(check({tag: 'nimporte-quoi'})[0]).toContain('format');
  });

  it('exige une section datée et décrite dans le journal', () => {
    expect(check({changelog: CHANGELOG.replace('## [1.2.0] - 2026-12-01', '## [1.2.0]')})).toEqual([expect.stringContaining('pas de date')]);
    expect(check({changelog: CHANGELOG.replace('## [1.2.0] - 2026-12-01', '## [1.2.0] - bientôt')})).toEqual([expect.stringContaining('pas de date')]);
    expect(check({changelog: CHANGELOG.replace('- Une nouveauté.', '')})).toEqual([expect.stringContaining('aucun changement')]);
    expect(check({changelog: CHANGELOG.replace('## [1.2.0] - 2026-12-01', '## [1.9.0] - 2026-12-01')})[0]).toContain('aucune section');
  });

  it('refuse de publier quand « Unreleased » contient encore des entrées', () => {
    expect(check({changelog: CHANGELOG.replace('## [Unreleased]\n', '## [Unreleased]\n\n- Oublié.\n')})).toEqual([expect.stringContaining('Unreleased')]);
  });

  it('exige les métadonnées du manifeste, dont le dépôt (provenance)', () => {
    expect(check({manifest: {...MANIFEST, repository: undefined}})).toEqual([expect.stringContaining('repository')]);
    expect(check({manifest: {...MANIFEST, license: ''}})).toEqual([expect.stringContaining('license')]);
    expect(check({manifest: {...MANIFEST, private: true}})).toEqual([expect.stringContaining('private')]);
    expect(check({manifest: {...MANIFEST, publishConfig: {}}})).toEqual([expect.stringContaining('publishConfig')]);
    expect(check({manifest: {...MANIFEST, repository: 'github:exemple/rich-editor'}})).toEqual([]);
    expect(check({manifest: {...MANIFEST, repository: {url: 'https://gitlab.com/exemple/rich-editor.git'}}})).toEqual([expect.stringContaining('GitHub')]);
  });
});

describe('journal et manifeste réels du paquet', () => {
  const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {files: string[]; engines?: {node?: string}};

  it('suit le format attendu : une section « Unreleased » en tête', () => {
    expect(sections(changelog)[0].name).toBe('Unreleased');
  });

  it('est publié avec le paquet', () => {
    expect(manifest.files).toContain('CHANGELOG.md');
  });

  it('déclare la version de Node testée en intégration continue', () => {
    expect(manifest.engines?.node).toBe('>=20');
  });

  it('le script en ligne de commande refuse un usage incorrect', () => {
    expect(() => execFileSync('node', ['scripts/release.mjs', 'inconnu'], {stdio: 'pipe'})).toThrow();
    expect(execFileSync('node', ['scripts/release.mjs', 'tag', '1.0.0-beta.1']).toString().trim()).toBe('next');
  });
});
