#!/usr/bin/env bash
# ============================================================
# linters-cicd/run-all.sh
#
# Orchestrator — runs every check listed in checks/registry.json
# and merges results into a single SARIF 2.1.0 file.
#
# Usage:
#   ./run-all.sh [--path DIR] [--languages go,typescript]
#                [--output coding-guidelines.sarif] [--format sarif|text]
#
# Exit codes:
#   0  no findings
#   1  one or more checks emitted findings
#   2  tool error
# ============================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PATH_ARG="."
LANGUAGES=""
OUTPUT="coding-guidelines.sarif"
FORMAT="sarif"

while [ $# -gt 0 ]; do
    case "$1" in
        --path)       PATH_ARG="$2"; shift 2 ;;
        --languages)  LANGUAGES="$2"; shift 2 ;;
        --output)     OUTPUT="$2"; shift 2 ;;
        --format)     FORMAT="$2"; shift 2 ;;
        -h|--help)
            sed -n '2,16p' "$0"; exit 0 ;;
        *)
            echo "Unknown arg: $1" >&2; exit 2 ;;
    esac
done

if ! command -v python3 >/dev/null 2>&1; then
    echo "::error::python3 is required (>= 3.10)" >&2
    exit 2
fi

REGISTRY="$SCRIPT_DIR/checks/registry.json"
if [ ! -f "$REGISTRY" ]; then
    echo "::error::registry not found at $REGISTRY" >&2
    exit 2
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

EXIT=0
RAN=0

echo "    🔍 coding-guidelines linters-cicd v1.0.0"
echo "       path:      $PATH_ARG"
echo "       output:    $OUTPUT"
echo "       format:    $FORMAT"
echo "       languages: ${LANGUAGES:-auto}"
echo ""

# Iterate registry via python (no jq dependency)
SCRIPTS=$(python3 - "$REGISTRY" "$LANGUAGES" <<'PY'
import json, sys
registry_path, langs_csv = sys.argv[1], sys.argv[2]
wanted = set(l.strip() for l in langs_csv.split(",") if l.strip())
with open(registry_path) as f:
    reg = json.load(f)
for rule_id, meta in reg.items():
    for lang, script in meta["languages"].items():
        if wanted and lang != "universal" and lang not in wanted:
            continue
        print(f"{rule_id}|{lang}|{script}")
PY
)

while IFS='|' read -r RULE_ID LANG SCRIPT; do
    [ -z "$RULE_ID" ] && continue
    OUT="$TMP_DIR/$RULE_ID-$LANG.sarif"
    SCRIPT_PATH="$SCRIPT_DIR/$SCRIPT"
    if [ ! -f "$SCRIPT_PATH" ]; then
        echo "    ⚠️  skipped $RULE_ID/$LANG — script missing"
        continue
    fi
    RAN=$((RAN + 1))
    printf "    ▸ %-30s %-12s ... " "$RULE_ID" "$LANG"
    if python3 "$SCRIPT_PATH" --path "$PATH_ARG" --format sarif --output "$OUT"; then
        echo "✅ clean"
    else
        rc=$?
        if [ "$rc" -eq 1 ]; then
            COUNT=$(python3 -c "import json; print(len(json.load(open('$OUT'))['runs'][0]['results']))")
            echo "❌ $COUNT finding(s)"
            EXIT=1
        else
            echo "‼️  tool error (rc=$rc)"
            EXIT=2
        fi
    fi
done <<< "$SCRIPTS"

echo ""
echo "    ────────────────────────────────────────────────"

# Merge all per-tool SARIF files into one
python3 "$SCRIPT_DIR/scripts/merge-sarif.py" "$TMP_DIR" "$OUTPUT" "$FORMAT"

echo "    📄 merged → $OUTPUT"
echo "    🏁 ran $RAN check(s) — exit $EXIT"
exit "$EXIT"
