#!/usr/bin/env bash
# ============================================================
# Forbidden Spec Paths Guard
# ============================================================
# Fails CI if either of the deprecated, pre-consolidation update
# folders re-appears under spec/, or if any MERGE-PROPOSAL.md
# (any case variant) shows up anywhere under spec/.
#
# Background:
#   spec/14-update/ is the single consolidated home for all
#   self-update, app-update, generic-update, install-script,
#   and release-pipeline specs. The two old folders below were
#   merged into it on 2026-04-17 and must never re-appear.
#   merge-proposal.md was a transient planning doc and must not
#   be re-introduced under spec/.
#
# Usage:
#   bash linter-scripts/check-forbidden-spec-paths.sh
#
# Exit codes:
#   0  no violations
#   1  one or more forbidden paths present
# ============================================================

set -euo pipefail

SPEC_ROOT="spec"
EXIT_CODE=0

if [[ ! -d "$SPEC_ROOT" ]]; then
  echo "ℹ️  No spec/ directory found — nothing to check."
  exit 0
fi

echo "🔍 Checking for forbidden spec paths under $SPEC_ROOT/ ..."

# ── Forbidden folders (re-split guards) ─────────────────────
FORBIDDEN_DIRS=(
  "$SPEC_ROOT/14-generic-update"
  "$SPEC_ROOT/15-self-update-app-update"
)

for DIR in "${FORBIDDEN_DIRS[@]}"; do
  if [[ -e "$DIR" ]]; then
    echo "::error::Forbidden folder present: $DIR"
    echo "         This folder was merged into spec/14-update/ and must not re-appear."
    EXIT_CODE=1
  fi
done

# ── Forbidden files (any-case MERGE-PROPOSAL.md) ────────────
MERGE_PROPOSAL_HITS=$(find "$SPEC_ROOT" -type f -iname 'merge-proposal.md' 2>/dev/null || true)

if [[ -n "$MERGE_PROPOSAL_HITS" ]]; then
  while IFS= read -r HIT; do
    echo "::error::Forbidden file present: $HIT"
    echo "         MERGE-PROPOSAL.md is a transient planning doc and must not be committed under spec/."
  done <<< "$MERGE_PROPOSAL_HITS"
  EXIT_CODE=1
fi

if [[ "$EXIT_CODE" -eq 0 ]]; then
  echo "✅ No forbidden spec paths detected."
else
  echo ""
  echo "❌ Forbidden spec paths detected. See errors above."
  echo "   Consolidated home: spec/14-update/"
fi

exit "$EXIT_CODE"
