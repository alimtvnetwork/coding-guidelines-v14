# Memory Index

**Updated:** 2026-04-16  
**Version:** 3.1.0  
**Status:** Active

---

## Overview

Canonical index of all memory files in `.lovable/memory/`.

> **IMPORTANT:** There is only ONE memory folder: `.lovable/memory/`. The variant `.lovable/memories/` is prohibited.

---

## Core Rules

- 🔴 CODE RED: Never swallow errors. Zero-nesting (no nested if). Max 2 operands. Positively named guard functions.
- 🔴 CODE RED: Strict metrics: functions 8-15 lines, files < 300 lines, React components < 100 lines.
- Naming: PascalCase for all internal IDs, DB, JSON, Types. Exceptions: Rust uses snake_case identifiers.
- DB Schema: PascalCase naming. PKs are `{TableName}Id` (INTEGER PRIMARY KEY AUTOINCREMENT). No UUIDs.
- Workflow: Spec-First (`spec/`) and Issue-First (`03-issues/`).
- Global Namespace: Always use `github.com/mahin/movie-cli-v2`. Any v1 reference is a bug.
- Execution: Break complex requests into discrete tasks. Wait for "next" prompt to continue.
- Version: All spec docs and UI at v3.1.0. Never use 2.1.0 or 1.1.0.

---

## Inventory

### architecture/

| File | Description |
|------|-------------|
| `database-schema.md` | PascalCase naming, no UUIDs, Vw prefixes for views |
| `error-handling.md` | apperror package, explicit file/path logging required |
| `caching-policy.md` | Explicit TTL, deterministic keys, invalidate on mutation |
| `split-database.md` | Root, App, Session hierarchical SQLite with WAL and Casbin |
| `seedable-configuration.md` | SemVer GORM merge of config.seed.json |

### constraints/

| File | Description |
|------|-------------|
| `axios-version-pinning.md` | Exact pinned versions only (1.14.0/0.30.3). Blocked: 1.14.1, 0.30.4 |
| `react-app-forwardref-warning.md` | Ignore lovable.js App.tsx ref console warning |

### done/

| File | Description |
|------|-------------|
| `coding-guidelines-consolidation-plan.md` | Completed plan — consolidated 5 coding guideline sources into one AI-optimized guideline |

### features/

| File | Description |
|------|-------------|
| `self-update-architecture.md` | Rename-first deployment, atomicity with latest.json |
| `visual-rendering-system.md` | Complete visual rendering reference — trees, code blocks, heading animations, TOC scroll-spy |

### issues/

| File | Description |
|------|-------------|
| `nested-code-fence-rendering.md` | Nested code fence data corruption — 4-backtick fences required |

### patterns/

_(empty — add reusable patterns here)_

### processes/

| File | Description |
|------|-------------|
| `development-workflow.md` | Spec-first workflow, linter enforcement, clean docs |
| `automated-standards-enforcement.md` | linter-scripts validation requirements |

### project/

| File | Description |
|------|-------------|
| `documentation-standards.md` | Mandatory numeric folders (01-20 Core, 21+ App), JSON tree syncing |
| `author-attribution.md` | Md. Alim Ul Karim, Riseup Asia LLC, SEO/footer requirements |
| `naming-compliance-issues.md` | Known naming convention violations (all resolved) |
| `phase2-content-overlap-audit.md` | Phase 2 audit — 17 unique items, 7 contradictions, 4 broken refs |
| `phase3-consolidated-structure-design.md` | Phase 3 design — consolidated folder hierarchy |
| `v2.2-error-spec-changes.md` | v2.2.0 apperror additions — convenience constructors, merge methods |

### standards/

| File | Description |
|------|-------------|
| `code-red-guidelines.md` | Full rules for zero-nesting, booleans, metrics |
| `typescript-patterns.md` | Named interfaces for unions, TypedAction, explicit types |
| `enum-standards.md` | Cross-language PascalCase enums, strict parsing methods |

### style/

| File | Description |
|------|-------------|
| `naming-conventions.md` | Zero-Underscore policy, full uppercase acronyms |
| `powershell-naming.md` | lowercase-kebab-case files, PascalCase Verb-Noun functions |

### suggestions/

| File | Description |
|------|-------------|
| `01-suggestions-tracker.md` | 9 completed, 5 pending suggestions |

### workflow/

| File | Description |
|------|-------------|
| `01-plan-tracker.md` | 17 completed, 4 pending tasks |

---

*Memory index — v3.1.0 — 2026-04-16*
