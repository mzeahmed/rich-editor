# Commandes utiles du paquet @mzeahmed/rich-editor. `make` ou `make help` liste les cibles.
.DEFAULT_GOAL := help
.PHONY: help install test test-watch typecheck build check pack ci clean audit release-check release

VERSION := $(shell node -p "require('./package.json').version")

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Installe les dépendances exactement comme le verrou (npm ci)
	npm ci

test: ## Lance les tests (Vitest + jsdom)
	npm test

test-watch: ## Relance les tests à chaque modification
	npx vitest --environment jsdom

typecheck: ## Vérifie les types sans rien écrire
	npx tsc -p tsconfig.json --noEmit

build: ## Compile vers dist/ (JS, déclarations, style.css)
	npm run build

check: build ## Compile puis vérifie le paquet construit (import Node, style.css, exports)
	npm run check:package

pack: ## Liste le contenu de l'archive publiée, sans rien publier
	npm pack --dry-run

ci: install test check pack ## Reproduit l'intégration continue en local

audit: ## Audite les dépendances de production
	npm audit --omit=dev --audit-level=high

clean: ## Supprime dist/, coverage/ et les archives .tgz
	rm -rf dist coverage *.tgz RELEASE_NOTES.md

release-check: ## Vérifie qu'on peut publier la version de package.json (étiquette, journal, manifeste)
	node scripts/release.mjs check v$(VERSION)

release: release-check test ## Crée l'étiquette vX.Y.Z locale et affiche la commande de push (ne pousse rien)
	@test -z "$$(git status --porcelain)" || { echo "Arbre de travail non propre : commitez d'abord."; exit 1; }
	@test "$$(git branch --show-current)" = "main" || { echo "Publiez depuis la branche main."; exit 1; }
	git tag v$(VERSION)
	@echo "Étiquette v$(VERSION) créée. Pour lancer la publication : git push origin v$(VERSION)"
