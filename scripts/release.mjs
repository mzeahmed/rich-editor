// Aides de publication, utilisées par .github/workflows/release.yml (et testées dans tests/Release.test.ts).
//
//   node scripts/release.mjs check <tag>        vérifie qu'on peut publier (étiquette, version, journal, manifeste)
//   node scripts/release.mjs tag <version>      affiche le dist-tag npm : « latest » (stable) ou « next » (préversion)
//   node scripts/release.mjs notes <version>    affiche les notes de version, extraites du CHANGELOG.md
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const TAG = /^v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEADING = /^## \[([^\]]+)\](?: - (\S+))?\s*$/;
const LINK_REFERENCE = /^\[[^\]]+\]:\s/;

/** Version d'une étiquette `vX.Y.Z` (ou `vX.Y.Z-beta.1`) ; null si l'étiquette n'a pas ce format. */
export function versionOfTag (tag) {
  return TAG.exec(tag)?.[1] ?? null;
}

/** Dist-tag npm : une préversion ne doit jamais devenir `latest`, la version que `npm install` choisit. */
export function distTag (version) {
  return version.includes('-') ? 'next' : 'latest';
}

/** Sections du journal, dans l'ordre : `{name, date, body}` (`name` : « Unreleased » ou une version). */
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

/** Notes d'une version : le corps de sa section du journal. */
export function releaseNotes (changelog, version) {
  const section = sections(changelog).find((candidate) => candidate.name === version);

  if (!section) throw new Error(`CHANGELOG.md : aucune section « ## [${version}] ».`);

  return section.body;
}

/** Liste des raisons pour lesquelles on ne peut pas publier ; vide si tout est prêt. */
export function problems ({tag, manifest, changelog}) {
  const found = [];
  const version = versionOfTag(tag);

  if (version === null) {
    found.push(`l'étiquette « ${tag} » n'a pas le format vX.Y.Z (ou vX.Y.Z-beta.1).`);
  } else if (version !== manifest.version) {
    found.push(`l'étiquette ${tag} ne correspond pas à la version de package.json (${manifest.version}).`);
  }

  if (manifest.private === true) found.push('package.json : « private » est à true.');
  if (!manifest.license) found.push('package.json : « license » manque.');
  const repository = typeof manifest.repository === 'string' ? manifest.repository : (manifest.repository?.url ?? '');

  if (repository === '') {
    found.push('package.json : « repository » manque (npm l\'exige pour la provenance de publication).');
  } else if (!/github\.com|^github:/.test(repository)) {
    found.push(`package.json : « repository » doit pointer vers GitHub (${repository}) : la publication se fait depuis GitHub Actions.`);
  }
  if (manifest.publishConfig?.access !== 'public') found.push('package.json : publishConfig.access doit valoir « public ».');

  const all = sections(changelog);
  const section = all.find((candidate) => candidate.name === manifest.version);

  if (!section) {
    found.push(`CHANGELOG.md : aucune section « ## [${manifest.version}] - AAAA-MM-JJ ».`);
  } else {
    if (!section.date || !DATE.test(section.date)) {
      found.push(`CHANGELOG.md : la section [${manifest.version}] n'a pas de date (« - AAAA-MM-JJ »).`);
    }
    if (!/^\s*[-*] \S/m.test(section.body)) found.push(`CHANGELOG.md : la section [${manifest.version}] ne décrit aucun changement.`);
  }

  if (all.find((candidate) => candidate.name === 'Unreleased')?.body) {
    found.push('CHANGELOG.md : « [Unreleased] » n\'est pas vide : déplacez ces entrées dans la section de la version.');
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
      console.error(`Publication impossible :\n${found.map((reason) => `  ✗ ${reason}`).join('\n')}`);
      process.exit(1);
    }

    console.log(`Prêt à publier ${manifest.name}@${manifest.version} (dist-tag « ${distTag(manifest.version)} »).`);
  } else if (command === 'tag' && argument) {
    console.log(distTag(argument));
  } else if (command === 'notes' && argument) {
    console.log(releaseNotes(changelog, argument));
  } else {
    console.error('Usage : node scripts/release.mjs check <tag> | tag <version> | notes <version>');
    process.exit(2);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
