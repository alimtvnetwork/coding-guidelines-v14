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


def relpath(p: Path, root: str) -> str:
    """Return p relative to root, posix-style for SARIF."""
    return str(p.resolve().relative_to(Path(root).resolve())).replace(os.sep, "/")
