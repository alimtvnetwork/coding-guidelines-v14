#!/usr/bin/env bash
# ============================================================
# install-hooks.sh — Install repo-tracked git hooks.
#
# Points git's hooksPath at scripts/hooks/ so every hook in
# this folder is active without copying files into .git/hooks/.
#
# Usage:
#   bash scripts/hooks/install-hooks.sh
# ============================================================

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/scripts/hooks"

if [[ ! -d "$HOOKS_DIR" ]]; then
  echo "❌ Hooks directory not found: $HOOKS_DIR"
  exit 1
fi

# Make every hook executable.
find "$HOOKS_DIR" -type f ! -name '*.sh' -exec chmod +x {} \;
chmod +x "$HOOKS_DIR"/*.sh 2>/dev/null || true

git config core.hooksPath "scripts/hooks"

echo "✅ Git hooks installed."
echo "   core.hooksPath = $(git config core.hooksPath)"
echo ""
echo "Active hooks:"
find "$HOOKS_DIR" -maxdepth 1 -type f ! -name '*.sh' ! -name 'README*' -printf '  - %f\n'
echo ""
echo "Bypass once (not recommended): git commit --no-verify"
