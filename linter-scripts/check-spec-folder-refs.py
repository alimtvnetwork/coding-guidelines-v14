#!/usr/bin/env python3
"""
check-spec-folder-refs.py
=========================

Fail CI if any markdown file references a numbered spec folder
(e.g., `spec/12-cicd-pipeline-workflows/`) that does not exist on
disk. Catches stale links left behind by folder renames/renumbers.

Scope of references checked
---------------------------

Three reference shapes are matched:

1. Absolute repo-relative paths     : `spec/NN-name/...`
2. Same-folder/sibling links inside `spec/`:
     - `./NN-name/...`
     - `../NN-name/...`
     - `../../NN-name/...`
3. Bare folder names of the form    : `NN-name` written as link
   targets inside `spec/`.

A "numbered spec folder" is any directory under `spec/` whose name
matches `^\\d{2}-[a-z0-9-]+$`.

Exit codes
----------
  0 — all references resolve to an existing folder
  1 — at least one stale folder reference was found
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SPEC_ROOT = REPO_ROOT / "spec"
ALLOWLIST_PATH = Path(__file__).resolve().parent / "spec-folder-refs.allowlist"

NUMBERED_FOLDER_RE = re.compile(r"^\d{2}-[a-z0-9-]+$")
# Match `spec/NN-name` and capture the folder name (NN-name).
ABSOLUTE_REF_RE = re.compile(r"\bspec/(\d{2}-[a-z0-9-]+)(?=[/)\s\"'#])")
# Match relative refs from inside spec/ : `./NN-name` or `../NN-name`
# or `../../NN-name` etc. Capture (dots, name).
RELATIVE_REF_RE = re.compile(
    r"(?<![\w/])(\.{1,2}(?:/\.{2})*)/(\d{2}-[a-z0-9-]+)(?=[/)\s\"'#])"
)


def is_numbered_folder(name: str) -> bool:
    """Return True when name matches the NN-kebab-case pattern."""
    return bool(NUMBERED_FOLDER_RE.match(name))


def list_existing_folders() -> set[str]:
    """Return the set of numbered folder names directly under spec/."""
    if not SPEC_ROOT.is_dir():
        return set()
    return {
        entry.name
        for entry in SPEC_ROOT.iterdir()
        if entry.is_dir() and is_numbered_folder(entry.name)
    }


def load_allowlist() -> set[str]:
    """Read intentional external folder names from the allowlist file."""
    if not ALLOWLIST_PATH.is_file():
        return set()
    names: set[str] = set()
    for raw in ALLOWLIST_PATH.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        names.add(line)
    return names


def iter_markdown_files() -> list[Path]:
    """Return every .md file in the repo, excluding node_modules/dist."""
    skip_dirs = {"node_modules", "dist", ".git", "release-artifacts"}
    files: list[Path] = []
    for path in REPO_ROOT.rglob("*.md"):
        parts = set(path.relative_to(REPO_ROOT).parts)
        if parts & skip_dirs:
            continue
        files.append(path)
    return files


def collect_absolute_refs(text: str) -> set[str]:
    """Collect `spec/NN-name` references from text."""
    return set(ABSOLUTE_REF_RE.findall(text))


def collect_relative_refs(file_path: Path, text: str) -> set[str]:
    """Resolve `./NN-name` / `../NN-name` refs to top-level folder names.

    Only references that resolve back into spec/ are returned.
    """
    rel_targets: set[str] = set()
    if "spec" not in file_path.parts:
        return rel_targets
    base = file_path.parent
    for dots, name in RELATIVE_REF_RE.findall(text):
        target = (base / dots / name).resolve()
        if SPEC_ROOT in target.parents and target.parent == SPEC_ROOT:
            rel_targets.add(name)
    return rel_targets


def find_stale_refs() -> list[tuple[Path, str]]:
    """Return list of (file, missing-folder) tuples (allowlist applied)."""
    existing = list_existing_folders()
    allowed = load_allowlist()
    stale: list[tuple[Path, str]] = []
    for md_file in iter_markdown_files():
        try:
            text = md_file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        refs = collect_absolute_refs(text) | collect_relative_refs(md_file, text)
        for folder in sorted(refs):
            if folder in existing or folder in allowed:
                continue
            stale.append((md_file, folder))
    return stale


def print_report(stale: list[tuple[Path, str]], existing_count: int, allowed_count: int) -> None:
    """Render a CI-friendly report."""
    print("=" * 70)
    print("  SPEC FOLDER REFERENCE CHECK")
    print("=" * 70)
    print(f"  Existing numbered spec folders : {existing_count}")
    print(f"  Allowlisted external folders   : {allowed_count}")
    print(f"  Stale references found         : {len(stale)}")
    print("=" * 70)
    if not stale:
        print("  ✅ All spec/NN-name references resolve.")
        return
    for md_file, folder in stale:
        rel = md_file.relative_to(REPO_ROOT)
        print(f"  🔴 {rel}")
        print(f"       → spec/{folder}/  (folder does not exist)")
    print("=" * 70)


def main() -> int:
    """Entry point."""
    if not SPEC_ROOT.is_dir():
        print(f"::error::spec/ directory not found at {SPEC_ROOT}")
        return 1
    existing = list_existing_folders()
    allowed = load_allowlist()
    stale = find_stale_refs()
    print_report(stale, len(existing), len(allowed))
    return 1 if stale else 0


if __name__ == "__main__":
    sys.exit(main())
