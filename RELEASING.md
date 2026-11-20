# Releasing

Publishing is driven by a **version tag**. Pushing `vX.Y.Z` runs
[`.github/workflows/release.yml`](./.github/workflows/release.yml), which checks the release, runs the
tests, publishes to npm with provenance and creates the GitHub release. Pull requests and `main` run
[`ci.yml`](./.github/workflows/ci.yml) (tests on Node 20 and 22, build, package check, dependency
audit).

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
5. **Protect `main`.** Require the CI checks to pass before merging.

## Making a release

1. Make sure `main` is green.
2. In [CHANGELOG.md](./CHANGELOG.md), move the entries from `## [Unreleased]` to a new section
   `## [X.Y.Z] - YYYY-MM-DD` and leave `[Unreleased]` empty.
3. Set the version, without tagging yet, and commit:

   ```bash
   npm version X.Y.Z --no-git-tag-version
   git commit -am "chore(release): vX.Y.Z"
   ```

4. Check locally what the pipeline will check:

   ```bash
   node scripts/release.mjs check vX.Y.Z
   npm test && npm pack --dry-run
   ```

5. Tag and push:

   ```bash
   git tag vX.Y.Z
   git push origin main vX.Y.Z
   ```

6. Approve the run if you configured the `npm` environment, then verify on npm: the new version, the
   *Provenance* badge, and `npm view @mzeahmed/rich-editor`.

### What the pipeline refuses

`node scripts/release.mjs check` stops the release (before anything is published) when:

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
