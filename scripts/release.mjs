// Release helpers, used by .github/workflows/release.yml (and tested in tests/Release.test.ts).
//
//   node scripts/release.mjs check <tag>        checks that the release can be published (tag, version, changelog, manifest)
//   node scripts/release.mjs tag <version>      prints the npm dist-tag: "latest" (stable) or "next" (pre-release)
//   node scripts/release.mjs notes <version>    prints the release notes, extracted from CHANGELOG.md
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const TAG = /^v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEADING = /^## \[([^\]]+)\](?: - (\S+))?\s*$/;
const LINK_REFERENCE = /^\[[^\]]+\]:\s/;

/** Version of a `vX.Y.Z` tag (or `vX.Y.Z-beta.1`); null if the tag does not have this format. */
export function versionOfTag (tag) {
  return TAG.exec(tag)?.[1] ?? null;
}

/** npm dist-tag: a pre-release must never become `latest`, the version `npm install` picks. */
export function distTag (version) {
  return version.includes('-') ? 'next' : 'latest';
}

/** Changelog sections, in order: `{name, date, body}` (`name`: "Unreleased" or a version). */
export function sections (changelog) {
  const found = [];

  for (const line of changelog.split('\n')) {
    const heading = HEADING.exec(line);

    if (heading) {
      found.push({name: heading[1], date: heading[2] ?? null, lines: []});
    } else if (found.length > 0) {
      found.at(-1).lines.push(line);
    }
  }

  return found.map(({name, date, lines}) => ({
    name,
    date,
    body: lines.filter((line) => !LINK_REFERENCE.test(line)).join('\n').trim()
  }));
}

/** Notes of a version: the body of its changelog section. */
export function releaseNotes (changelog, version) {
  const section = sections(changelog).find((candidate) => candidate.name === version);

  if (!section) throw new Error(`CHANGELOG.md: no "## [${version}]" section.`);

  return section.body;
}

/** List of reasons why publishing is not possible; empty when everything is ready. */
export function problems ({tag, manifest, changelog}) {
  const found = [];
  const version = versionOfTag(tag);

  if (version === null) {
    found.push(`tag "${tag}" is not in the vX.Y.Z format (or vX.Y.Z-beta.1).`);
  } else if (version !== manifest.version) {
    found.push(`tag ${tag} does not match the package.json version (${manifest.version}).`);
  }

  if (manifest.private === true) found.push('package.json: "private" is set to true.');
  if (!manifest.license) found.push('package.json: "license" is missing.');
  const repository = typeof manifest.repository === 'string' ? manifest.repository : (manifest.repository?.url ?? '');

  if (repository === '') {
    found.push('package.json: "repository" is missing (npm requires it for publish provenance).');
  } else if (!/github\.com|^github:/.test(repository)) {
    found.push(`package.json: "repository" must point to GitHub (${repository}): publishing runs from GitHub Actions.`);
  }
  if (manifest.publishConfig?.access !== 'public') found.push('package.json: publishConfig.access must be "public".');

  const all = sections(changelog);
  const section = all.find((candidate) => candidate.name === manifest.version);

  if (!section) {
    found.push(`CHANGELOG.md: no "## [${manifest.version}] - YYYY-MM-DD" section.`);
  } else {
    if (!section.date || !DATE.test(section.date)) {
      found.push(`CHANGELOG.md: section [${manifest.version}] has no date ("- YYYY-MM-DD").`);
    }
    if (!/^\s*[-*] \S/m.test(section.body)) found.push(`CHANGELOG.md: section [${manifest.version}] describes no change.`);
  }

  if (all.find((candidate) => candidate.name === 'Unreleased')?.body) {
    found.push('CHANGELOG.md: "[Unreleased]" is not empty: move its entries into the version section.');
  }

  return found;
}

function main ([command, argument]) {
  const root = new URL('../', import.meta.url);
  const changelog = readFileSync(new URL('CHANGELOG.md', root), 'utf8');

  if (command === 'check') {
    const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
    const found = problems({tag: argument ?? '', manifest, changelog});

    if (found.length > 0) {
      console.error(`Cannot publish:\n${found.map((reason) => `  ✗ ${reason}`).join('\n')}`);
      process.exit(1);
    }

    console.log(`Ready to publish ${manifest.name}@${manifest.version} (dist-tag "${distTag(manifest.version)}").`);
  } else if (command === 'tag' && argument) {
    console.log(distTag(argument));
  } else if (command === 'notes' && argument) {
    console.log(releaseNotes(changelog, argument));
  } else {
    console.error('Usage: node scripts/release.mjs check <tag> | tag <version> | notes <version>');
    process.exit(2);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
