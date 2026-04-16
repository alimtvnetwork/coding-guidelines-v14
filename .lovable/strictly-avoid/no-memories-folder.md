# Strictly Avoid: Duplicate Memory Folder

**Rule:** Never create `.lovable/memories/` — only `.lovable/memory/` exists.

---

## What Is Prohibited

Creating or maintaining a folder called `.lovable/memories/` (plural). The project uses exactly one memory folder: `.lovable/memory/` (singular).

## Why

Having both `memory/` and `memories/` causes confusion — AI models don't know which is canonical, files get split between two locations, and indexes become inconsistent.

## What To Do Instead

- Always use `.lovable/memory/` for all institutional knowledge
- If you find `.lovable/memories/`, migrate its contents to `.lovable/memory/` and delete it
- Update `.lovable/memory/index.md` after any migration

---

*Strictly avoid — no memories folder — v3.1.0 — 2026-04-16*
