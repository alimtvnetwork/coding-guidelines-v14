#!/usr/bin/env python3
"""Post-process the merged SARIF file.

Applies, in order:
  1. Inline suppressions (codeguidelines:disable= comments)
  2. --exclude-rules filtering
  3. --baseline subtraction (or --refresh-baseline write-back)

Spec: spec/02-coding-guidelines/06-cicd-integration/98-faq.md
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "checks"))
from _lib.suppressions import parse_file, is_suppressed  # noqa: E402


def main() -> int:
    args = _parse_args()
    doc = json.loads(Path(args.sarif).read_text(encoding="utf-8"))
    excluded = _split_csv(args.exclude_rules)

    _apply_suppressions(doc, Path(args.path))
    _apply_excludes(doc, excluded)

    if args.refresh_baseline:
        _write_baseline(doc, args.refresh_baseline)
        return 0

    if args.baseline:
        _apply_baseline(doc, args.baseline)

    Path(args.sarif).write_text(json.dumps(doc, indent=2), encoding="utf-8")
    return _exit_code_for(doc)


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--sarif", required=True)
    p.add_argument("--path", required=True)
    p.add_argument("--baseline", default=None)
    p.add_argument("--refresh-baseline", default=None)
    p.add_argument("--exclude-rules", default="")
    return p.parse_args()


def _split_csv(value: str) -> set[str]:
    return {v.strip() for v in value.split(",") if v.strip()}


def _apply_suppressions(doc: dict, root: Path) -> None:
    cache: dict[str, list] = {}
    for run in doc.get("runs", []):
        kept = []
        for result in run.get("results", []):
            if _result_suppressed(result, root, cache):
                continue
            kept.append(result)
        run["results"] = kept


def _result_suppressed(result: dict, root: Path, cache: dict) -> bool:
    rule_id, uri, line = _result_key_parts(result)
    if not uri:
        return False
    abs_path = (root / uri).resolve()
    key = str(abs_path)
    if key not in cache:
        cache[key] = parse_file(abs_path)
    return is_suppressed(cache[key], rule_id, line)


def _result_key_parts(result: dict) -> tuple[str, str, int]:
    rule_id = result.get("ruleId", "")
    loc = result.get("locations", [{}])[0]
    phys = loc.get("physicalLocation", {})
    uri = phys.get("artifactLocation", {}).get("uri", "")
    line = phys.get("region", {}).get("startLine", 0)
    return rule_id, uri, line


def _apply_excludes(doc: dict, excluded: set[str]) -> None:
    if not excluded:
        return
    for run in doc.get("runs", []):
        run["results"] = [r for r in run.get("results", []) if r.get("ruleId") not in excluded]


def _fingerprint(result: dict) -> str:
    rule_id, uri, line = _result_key_parts(result)
    msg = result.get("message", {}).get("text", "")
    digest = hashlib.sha256(msg.encode("utf-8")).hexdigest()[:16]
    return f"{rule_id}|{uri}|{line}|{digest}"


def _apply_baseline(doc: dict, baseline_path: str) -> None:
    baseline = _load_fingerprints(baseline_path)
    if baseline is None:
        return
    for run in doc.get("runs", []):
        run["results"] = [r for r in run.get("results", []) if _fingerprint(r) not in baseline]


def _load_fingerprints(path: str) -> set[str] | None:
    file = Path(path)
    if not file.exists():
        return set()
    try:
        baseline_doc = json.loads(file.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    out: set[str] = set()
    for run in baseline_doc.get("runs", []):
        for result in run.get("results", []):
            out.add(_fingerprint(result))
    return out


def _write_baseline(doc: dict, path: str) -> None:
    Path(path).write_text(json.dumps(doc, indent=2), encoding="utf-8")


def _exit_code_for(doc: dict) -> int:
    for run in doc.get("runs", []):
        if run.get("results"):
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
