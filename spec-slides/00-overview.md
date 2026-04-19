# Spec-Slides — Standalone Code-Review Training Deck

**Version:** 1.0.0
**Status:** Draft (spec-only — no implementation yet)
**Owner:** Md. Alim Ul Karim
**Last updated:** 2026-04-19

---

## Purpose

Build a **separate, self-contained slide presentation app** that teaches the
Code-Red coding-review curriculum using **before/after code comparisons with
animations**. The compiled output must be a **single ZIP of static HTML + CSS +
JS** that any trainer or trainee can download and open by double-clicking
`index.html` — no server, no Node, no build tools, no internet required at
runtime.

## Scope

This spec defines:

1. The directory layout and isolation of the new `slides-app/` (separate Vite +
   React project at the repo root, **not** part of the existing Lovable app).
2. The slide-authoring contract (each topic = one React component).
3. The full **10-topic curriculum** with required before/after content per
   topic.
4. Design tokens (Ubuntu typography, palette inherited from main app).
5. Animation primitives (entrance, code diff highlight, before/after morph).
6. The build pipeline that emits `slides-app/dist/` and packages it into
   `slides-app/dist.zip`.
7. The per-topic GIF generation pass (separate Remotion pipeline) that produces
   the GIFs embedded on the main landing page.
8. Quality, accessibility, and offline-readiness requirements.

## Non-goals

- Editing slides at runtime (this is a **viewer**, not an authoring tool).
- Real-time collaboration / multi-user.
- Any backend, database, auth, or analytics.
- Bundling the slide app inside the main Lovable React app.

## Reading order

| # | File | Purpose |
|---|------|---------|
| 00 | [00-overview.md](./00-overview.md) | This document |
| 01 | [01-architecture.md](./01-architecture.md) | Project layout, tech stack, isolation rules |
| 02 | [02-slide-authoring.md](./02-slide-authoring.md) | How to write a slide component |
| 03 | [03-design-tokens.md](./03-design-tokens.md) | Ubuntu typography, color tokens, spacing |
| 04 | [04-animation-primitives.md](./04-animation-primitives.md) | Entrance, code-diff highlight, before/after morph |
| 05 | [05-curriculum.md](./05-curriculum.md) | The 10 topics + before/after content per topic |
| 06 | [06-build-and-zip-pipeline.md](./06-build-and-zip-pipeline.md) | Vite static build + ZIP packaging |
| 07 | [07-gif-generation.md](./07-gif-generation.md) | Per-topic Remotion GIF pipeline for landing page |
| 08 | [08-quality-and-offline.md](./08-quality-and-offline.md) | Offline guarantees, a11y, testing |

## High-level flow

```
[ slides-app/src/slides/*.tsx ]
            │
            ▼
   bun run build  (Vite, base="./")
            │
            ▼
   slides-app/dist/   ← static HTML + CSS + JS, fully relative paths
            │
            ▼
   bun run package    ← zips dist/ into slides-app/dist.zip
            │
            ▼
   ┌─────────────────────────┐
   │  Trainer downloads zip  │
   │  Unzips anywhere        │
   │  Opens index.html       │  ← works offline, double-click
   └─────────────────────────┘

Separately:
   slides-app/scripts/render-gifs.mjs   ← Remotion pipeline
            │
            ▼
   public/gifs/<topic>.gif              ← embedded on main landing page
```

## Cross-references

- Main project README: `/readme.md`
- Code-Red guidelines: `mem://standards/code-red-guidelines`
- Main app design tokens: `src/index.css`, `tailwind.config.ts`
- Install scripts (precedent for separate runnable artifact): `/install.sh`, `/install.ps1`
