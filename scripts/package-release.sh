#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

# Package only a committed, reproducible source version.
if [[ -n "$(git status --porcelain)" ]]; then
  printf 'ERROR: Commit or resolve pending changes before packaging.\n' >&2
  exit 1
fi

node --check src/server.js
node --check deploy/ecosystem.aws.config.js

RELEASE_COMMIT="$(git rev-parse HEAD)"
mkdir -p dist

git archive \
  --format=tar.gz \
  --output=dist/application.tar.gz \
  "$RELEASE_COMMIT" \
  src \
  package.json \
  package-lock.json \
  .nvmrc \
  deploy/ecosystem.aws.config.js

RELEASE_SHA256="$(sha256sum dist/application.tar.gz | cut -d ' ' -f 1)"

printf '{"version":"%s","sha256":"%s"}\n' \
  "$RELEASE_COMMIT" \
  "$RELEASE_SHA256" > dist/release.json

printf 'Release version: %s\n' "$RELEASE_COMMIT"
printf 'Archive SHA256: %s\n' "$RELEASE_SHA256"
printf 'Archive contents:\n'
tar -tzf dist/application.tar.gz
