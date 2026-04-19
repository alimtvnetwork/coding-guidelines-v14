"""File walker that respects .gitignore basics and language extensions."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable


SKIP_DIRS = {
    ".git", "node_modules", "dist", "build", "vendor", "__pycache__",
    ".next", ".nuxt", ".cache", "target", "bin", "obj", ".venv", "venv",
    "release-artifacts", "coverage",
}


def walk_files(root: str, extensions: Iterable[str]) -> list[Path]:
    """Return files under root whose suffix matches one of extensions."""
    exts = tuple(e.lower() for e in extensions)
    out: list[Path] = []
    root_path = Path(root).resolve()
    for dirpath, dirnames, filenames in os.walk(root_path):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            if name.lower().endswith(exts):
                out.append(Path(dirpath) / name)
    return out


def walk_files_middle_out(root: str, extensions: Iterable[str]) -> list[Path]:
    """Walk files and reorder them median-first, alternating outward.

    Spec: spec/02-coding-guidelines/06-cicd-integration/07-performance.md §1
    Sorted by byte size, then probed from the median outward — heavier
    next, then lighter, alternating — to surface dense-code findings
    early and warm parser caches on the largest files first.
    """
    files = walk_files(root, extensions)
    files.sort(key=_safe_size)
    return _middle_out(files)


def _safe_size(path: Path) -> int:
    try:
        return path.stat().st_size
    except OSError:
        return 0


def _middle_out(items: list[Path]) -> list[Path]:
    """Reorder a sorted list median-first: D, E, C, F, B, G, A for [A..G]."""
    if not items:
        return []
    median = len(items) // 2
    out: list[Path] = [items[median]]
    right, left = median + 1, median - 1
    while right < len(items) or left >= 0:
        if right < len(items):
            out.append(items[right])
            right += 1
        if left >= 0:
            out.append(items[left])
            left -= 1
    return out


def relpath(p: Path, root: str) -> str:
    """Return p relative to root, posix-style for SARIF."""
    return str(p.resolve().relative_to(Path(root).resolve())).replace(os.sep, "/")
