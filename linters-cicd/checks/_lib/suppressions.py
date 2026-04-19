"""Inline source-line suppression parser.

Spec: spec/02-coding-guidelines/06-cicd-integration/98-faq.md §1

Recognized syntax (in any single-line comment):
    codeguidelines:disable=RULE-ID[,RULE-ID...] — reason text
    codeguidelines:disable-next-line=RULE-ID[,...] — reason text

Rules:
- 'disable=' suppresses the line the comment sits on.
- 'disable-next-line=' suppresses the next non-blank line.
- A reason after an em dash (—) or '--' is REQUIRED. Suppressions
  without a reason are invalid and DO NOT suppress the finding.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

DISABLE_RE = re.compile(
    r"codeguidelines:(disable(?:-next-line)?)=([A-Z0-9\-,]+)\s*(?:[—-]{1,2}\s*(.+))?"
)


@dataclass(frozen=True)
class Suppression:
    rule_ids: frozenset[str]
    target_line: int
    reason: str


def parse_file(path: Path) -> list[Suppression]:
    """Return all valid suppressions found in path."""
    out: list[Suppression] = []
    lines = _read_lines(path)
    if not lines:
        return out
    for idx, raw in enumerate(lines, start=1):
        match = DISABLE_RE.search(raw)
        if not match:
            continue
        suppression = _build_suppression(match, idx, lines)
        if suppression:
            out.append(suppression)
    return out


def _read_lines(path: Path) -> list[str]:
    try:
        return path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return []


def _build_suppression(match: re.Match, line_idx: int, lines: list[str]) -> Suppression | None:
    kind, ids_csv, reason = match.group(1), match.group(2), match.group(3)
    if not _has_reason(reason):
        return None
    rule_ids = frozenset(r.strip() for r in ids_csv.split(",") if r.strip())
    target = _resolve_target(kind, line_idx, lines)
    if target == 0:
        return None
    return Suppression(rule_ids=rule_ids, target_line=target, reason=reason.strip())


def _has_reason(reason: str | None) -> bool:
    return bool(reason and reason.strip())


def _resolve_target(kind: str, comment_line: int, lines: list[str]) -> int:
    if kind == "disable":
        return comment_line
    return _next_non_blank(lines, comment_line)


def _next_non_blank(lines: list[str], after_line: int) -> int:
    for idx in range(after_line, len(lines)):
        if lines[idx].strip():
            return idx + 1
    return 0


def is_suppressed(suppressions: list[Suppression], rule_id: str, line: int) -> bool:
    """True if rule_id at line is covered by any suppression in the list."""
    for s in suppressions:
        if s.target_line == line and rule_id in s.rule_ids:
            return True
    return False
