// @vitest-environment node
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';
// @ts-expect-error .mjs script without type declarations
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

- A new feature.

## [1.1.0] - 2026-11-01

### Fixed

- A fix.

[Unreleased]: https://exemple.test/compare/v1.2.0...HEAD
[1.2.0]: https://exemple.test/compare/v1.1.0...v1.2.0
`;

const check = (overrides: Record<string, unknown> = {}): string[] =>
  problems({tag: 'v1.2.0', manifest: MANIFEST, changelog: CHANGELOG, ...overrides});

describe('tag and dist-tag', () => {
  it.each([['v1.2.0', '1.2.0'], ['v0.1.0-beta.1', '0.1.0-beta.1'], ['v10.20.30', '10.20.30']])('reads the version of %s', (tag, version) => {
    expect(versionOfTag(tag)).toBe(version);
  });

  it.each(['1.2.0', 'v1.2', 'v1.2.0.1', 'release-1', '', 'v1.2.0 ; rm -rf /'])('rejects the tag %j', (tag) => {
    expect(versionOfTag(tag)).toBeNull();
  });

  it('publishes a pre-release under "next", never under "latest"', () => {
    expect(distTag('1.2.0')).toBe('latest');
    expect(distTag('1.2.0-beta.1')).toBe('next');
    expect(distTag('0.1.0-rc.2')).toBe('next');
  });
});

describe('changelog', () => {
  it('splits the sections and ignores the reference links at the end of the file', () => {
    const all = sections(CHANGELOG);

    expect(all.map((section: {name: string}) => section.name)).toEqual(['Unreleased', '1.2.0', '1.1.0']);
    expect(all[1].date).toBe('2026-12-01');
    expect(all[2].body).toBe('### Fixed\n\n- A fix.');
  });

  it('extracts the notes of a version', () => {
    expect(releaseNotes(CHANGELOG, '1.2.0')).toBe('### Added\n\n- A new feature.');
    expect(() => releaseNotes(CHANGELOG, '9.9.9')).toThrow('9.9.9');
  });
});

describe('pre-publication check', () => {
  it('accepts a version that is ready', () => {
    expect(check()).toEqual([]);
  });

  it('rejects a tag that does not match package.json', () => {
    expect(check({tag: 'v1.3.0'})[0]).toContain('does not match');
    expect(check({tag: 'anything'})[0]).toContain('format');
  });

  it('requires a dated and described section in the changelog', () => {
    expect(check({changelog: CHANGELOG.replace('## [1.2.0] - 2026-12-01', '## [1.2.0]')})).toEqual([expect.stringContaining('has no date')]);
    expect(check({changelog: CHANGELOG.replace('## [1.2.0] - 2026-12-01', '## [1.2.0] - soon')})).toEqual([expect.stringContaining('has no date')]);
    expect(check({changelog: CHANGELOG.replace('- A new feature.', '')})).toEqual([expect.stringContaining('describes no change')]);
    expect(check({changelog: CHANGELOG.replace('## [1.2.0] - 2026-12-01', '## [1.9.0] - 2026-12-01')})[0]).toContain('section');
  });

  it('refuses to publish while "Unreleased" still has entries', () => {
    expect(check({changelog: CHANGELOG.replace('## [Unreleased]\n', '## [Unreleased]\n\n- Forgotten.\n')})).toEqual([expect.stringContaining('Unreleased')]);
  });

  it('requires the manifest metadata, including the repository (provenance)', () => {
    expect(check({manifest: {...MANIFEST, repository: undefined}})).toEqual([expect.stringContaining('repository')]);
    expect(check({manifest: {...MANIFEST, license: ''}})).toEqual([expect.stringContaining('license')]);
    expect(check({manifest: {...MANIFEST, private: true}})).toEqual([expect.stringContaining('private')]);
    expect(check({manifest: {...MANIFEST, publishConfig: {}}})).toEqual([expect.stringContaining('publishConfig')]);
    expect(check({manifest: {...MANIFEST, repository: 'github:exemple/rich-editor'}})).toEqual([]);
    expect(check({manifest: {...MANIFEST, repository: {url: 'https://gitlab.com/exemple/rich-editor.git'}}})).toEqual([expect.stringContaining('GitHub')]);
  });
});

describe('actual changelog and manifest of the package', () => {
  const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {files: string[]; engines?: {node?: string}};

  it('follows the expected format: an "Unreleased" section first', () => {
    expect(sections(changelog)[0].name).toBe('Unreleased');
  });

  it('is published with the package', () => {
    expect(manifest.files).toContain('CHANGELOG.md');
  });

  it('declares the Node version tested in continuous integration', () => {
    expect(manifest.engines?.node).toBe('>=20');
  });

  it('the command-line script rejects incorrect usage', () => {
    expect(() => execFileSync('node', ['scripts/release.mjs', 'inconnu'], {stdio: 'pipe'})).toThrow();
    expect(execFileSync('node', ['scripts/release.mjs', 'tag', '1.0.0-beta.1']).toString().trim()).toBe('next');
  });
});
