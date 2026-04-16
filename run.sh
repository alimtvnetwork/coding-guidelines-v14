#!/usr/bin/env bash
# Root-level convenience wrapper — forwards all args to linter-scripts/run.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INNER="$SCRIPT_DIR/linter-scripts/run.sh"

if [ ! -f "$INNER" ]; then
  echo "❌ Cannot find $INNER"
  exit 1
fi

exec "$INNER" "$@"
