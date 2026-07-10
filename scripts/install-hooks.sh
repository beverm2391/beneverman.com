#!/bin/sh

set -eu

# `prepare` also runs in deployment environments where the source may not be
# a Git checkout. Hook installation is useful locally and a no-op elsewhere.
if git rev-parse --git-dir >/dev/null 2>&1; then
  git config core.hooksPath .githooks
fi
