# Project Overview

**Version:** 3.1.0  
**Updated:** 2026-04-16

---

## What Is This Project?

A **specification-driven documentation system** for a multi-language CLI toolchain (`github.com/mahin/movie-cli-v2`). It contains:

- **285+ specification files** across 17 modules covering coding guidelines, error management, database architecture, CI/CD, design systems, and more
- **A React docs viewer app** for browsing, searching, and reading specs
- **Institutional memory** in `.lovable/memory/` for AI session persistence

---

## Quick Navigation

| Location | Purpose |
|----------|---------|
| `spec/` | All formal specifications (numbered folders `01–23`) |
| `spec/17-consolidated-guidelines/` | AI-readable summaries of every spec module |
| `.lovable/memory/` | Institutional knowledge (patterns, decisions, rules) |
| `.lovable/strictly-avoid.md` | ⛔ Things you must NEVER do |
| `.lovable/plan.md` | Current active roadmap |
| `.lovable/suggestions.md` | Pending improvement ideas |
| `src/` | React docs viewer application |

---

## Core Rules (CODE RED)

These are the highest-priority rules. Violations are blocking.

1. **Never swallow errors** — every error must be explicitly handled
2. **Zero nesting** — no nested `if` blocks, ever
3. **Max 2 operands** per conditional expression
4. **Positively named booleans** — `isPending` not `isNotReady`; `is`/`has` prefix mandatory
5. **Functions ≤ 15 lines**, files < 300 lines, React components < 100 lines
6. **PascalCase** for all DB columns, JSON keys, type names, enum values
7. **No UUIDs** — integer PKs with `{TableName}Id` pattern

---

## Naming Conventions

| Context | Convention |
|---------|-----------|
| DB columns, JSON keys, types | PascalCase |
| Go exported identifiers | PascalCase |
| Rust identifiers | snake_case (RFC 430) |
| Spec files/folders | `NN-kebab-case.md` |
| Memory folders | `kebab-case/` (no numeric prefix) |

---

## Project Namespace

**Always:** `github.com/mahin/movie-cli-v2`  
**Never:** Any `v1` reference — that is a bug.

---

## Version

All specs, memory, and UI are at **v3.1.0**. Never reference older versions.

---

## For Full Onboarding

See `spec/01-spec-authoring-guide/04-ai-onboarding-prompt.md` for the comprehensive multi-phase reading prompt.

---

*Project overview — v3.1.0 — 2026-04-16*
