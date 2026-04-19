"""Common CLI parser used by every check script."""

from __future__ import annotations

import argparse


def build_parser(description: str) -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=description)
    p.add_argument("--path", default=".", help="Directory to scan (default: .)")
    p.add_argument("--format", choices=["sarif", "text"], default="sarif")
    p.add_argument("--output", default=None, help="Write to file instead of stdout")
    return p
