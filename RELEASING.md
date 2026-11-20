# Releasing

Nothing is pushed to `main` directly: every change, a release included, goes through a pull request.
The model is the one of the Yoostart API and front repositories.

| Step | Workflow | What it does |
| --- | --- | --- |
| Pull request into `main` | [`ci.yml`](./.github/workflows/ci.yml) | Quality only: tests on Node 20 and 22, build, package check, dependency audit. The `Quality` check must pass to merge. |
| Merge into `main` | [`sync-develop.yml`](./.github/workflows/sync-develop.yml) | Merges `main` into `develop` (no force push; a conflict fails the job and is left to fix by hand). |
| Tag `vX.Y.Z` on `main` | [`release.yml`](./.github/workflows/release.yml) | Checks the release, runs the tests, publishes to npm with provenance and creates the GitHub release. |

Every new branch is created from `develop` (up to date with `origin/develop`), never from `main`,
and its name has no `/`: use hyphens (`mention-trigger-fix`).

Versions follow [Semantic Versioning](https://semver.org/). While the version is `0.x`, a minor
version may contain breaking changes (always listed in [CHANGELOG.md](./CHANGELOG.md)).

## One-time setup

1. **Declare the repository.** npm refuses a provenance statement when `package.json` does not point
   to the repository that built the package. Add, with your real URL:

   ```json
   "repository": {"type": "git", "url": "git+https://github.com/<owner>/rich-editor.git"}
   ```

   `node scripts/release.mjs check` fails while this is missing. Adding `homepage` and `bugs` is also
   worthwhile: npm shows them on the package page.
2. **npm account and scope.** The package is `@mzeahmed/rich-editor`: the scope must exist (your npm
   username, or an organization) and you must be allowed to publish in it. Turn on two-factor
   authentication for the account. Scoped packages are private by default; `publishConfig.access` is
   already `public`.
3. **Publish token.** On npmjs.com, create an *automation* (or granular, publish-only, limited to this
   package) access token and store it as the repository secret **`NPM_TOKEN`**
   (Settings → Secrets and variables → Actions).
   npm also supports *trusted publishing* (GitHub OIDC, no stored token): if you prefer it, configure
   the trusted publisher on npmjs.com for `release.yml` and remove the `NODE_AUTH_TOKEN` line of the
   workflow (check the current npm documentation for the required npm version).
4. **Approval step (recommended).** Create an **`npm`** environment (Settings → Environments) and add
   yourself as a required reviewer: each publication then waits for a click.
5. **Protect `main`.** Settings → Rules → Rulesets (or Branches → Branch protection rules), target
   `main`:
   - require a pull request before merging;
   - require the status check **`Quality`** (the job of `ci.yml`) and require branches to be up to date;
   - block force pushes and deletion;
   - no bypass, except if you need it for yourself.

   The check only appears in the list after `ci.yml` has run once on a pull request. If `develop`
   is protected too, let GitHub Actions bypass it, otherwise `sync-develop.yml` cannot push.

## Making a release

1. Create a branch from `develop`, with no `/` in its name (for example `release-X.Y.Z`).
2. In [CHANGELOG.md](./CHANGELOG.md), move the entries from `## [Unreleased]` to a new section
   `## [X.Y.Z] - YYYY-MM-DD` and leave `[Unreleased]` empty.
3. Set the version, without tagging yet, and commit:

   ```bash
   npm version X.Y.Z --no-git-tag-version
   git commit -am "chore(release): vX.Y.Z"
   ```

4. Check locally what the pipeline will check:

   ```bash
   make release-check
   make ci
   ```

5. Open a pull request into `main`. When `Quality` is green, merge it. `sync-develop.yml` then merges
   `main` into `develop` on its own.
6. Tag the merged commit **on `main`** and push the tag only:

   ```bash
   git switch main && git pull
   make release   # checks, tests, creates the local tag vX.Y.Z
   git push origin vX.Y.Z
   ```

   `release.yml` refuses a tag that is not on `main`.
7. Approve the run if you configured the `npm` environment, then verify on npm: the new version, the
   *Provenance* badge, and `npm view @mzeahmed/rich-editor`.

### What the pipeline refuses

`node scripts/release.mjs check` stops the release (before anything is published) when:

- the tagged commit is not on `main`;
- the tag is not `vX.Y.Z` or `vX.Y.Z-beta.1`, or differs from the `package.json` version;
- `CHANGELOG.md` has no `## [X.Y.Z] - YYYY-MM-DD` section, its date is missing or invalid, or it
  describes no change;
- `[Unreleased]` still contains entries (they would be forgotten);
- `package.json` is `private`, or lacks `license`, `repository` or `publishConfig.access: "public"`.

Then `npm test` must pass, and `npm publish` runs `prepack` (build and `npm run check:package`:
the built package imports in Node and ships its stylesheet).

## Pre-releases

A tag such as `v0.2.0-beta.1` (with the same version in `package.json` and a matching changelog
section) is published under the **`next`** dist-tag, never `latest`, and the GitHub release is
marked as a pre-release. Users opt in with `npm install @mzeahmed/rich-editor@next`.

## When something goes wrong

- **The pipeline failed before publishing** (check, tests): fix it, then move the tag. A tag whose
  release never happened can be deleted and recreated:

  ```bash
  git tag -d vX.Y.Z && git push --delete origin vX.Y.Z
  ```

- **A bad version was published.** Never reuse or move the tag of a published version. Deprecate it
  and release a fix:

  ```bash
  npm deprecate "@mzeahmed/rich-editor@X.Y.Z" "Broken, use X.Y.Z+1"
  ```

  `npm unpublish` is only possible during the first 72 hours and breaks anyone who installed it:
  avoid it.
