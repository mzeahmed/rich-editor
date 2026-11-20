# Useful commands for @mzeahmed/rich-editor. `make` or `make help` lists the targets.
.DEFAULT_GOAL := help
.PHONY: help install test test-watch typecheck build check pack ci clean audit release-check release

VERSION := $(shell node -p "require('./package.json').version")

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install the dependencies exactly as locked (npm ci)
	npm ci

test: ## Run the tests (Vitest + jsdom)
	npm test

test-watch: ## Re-run the tests on every change
	npx vitest --environment jsdom

typecheck: ## Type-check without writing anything
	npx tsc -p tsconfig.json --noEmit

build: ## Compile to dist/ (JS, declarations, style.css)
	npm run build

check: build ## Build, then check the built package (Node import, style.css, exports)
	npm run check:package

pack: ## List the contents of the published archive, without publishing
	npm pack --dry-run

ci: install test check pack audit ## Reproduce the continuous integration locally

audit: ## Audit the production dependencies
	npm audit --omit=dev --audit-level=high

clean: ## Remove dist/, coverage/ and the .tgz archives
	rm -rf dist coverage *.tgz RELEASE_NOTES.md

release-check: ## Check that the package.json version can be published (tag, changelog, manifest)
	node scripts/release.mjs check v$(VERSION)

release: release-check test ## Create the local vX.Y.Z tag and print the push command (pushes nothing)
	@test -z "$$(git status --porcelain)" || { echo "Working tree not clean: commit first."; exit 1; }
	@test "$$(git branch --show-current)" = "main" || { echo "Release from the main branch."; exit 1; }
	git tag v$(VERSION)
	@echo "Tag v$(VERSION) created. To start the release: git push origin v$(VERSION)"
