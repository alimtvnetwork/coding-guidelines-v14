# MERGE PROPOSAL — Folders 14 + 15 → One

**Version:** 1.0.0  
**Updated:** 2026-04-17  
**Status:** Awaiting decision  
**Author:** Riseup Asia LLC

---

## TL;DR

Folders `14-generic-update/` and `15-self-update-app-update/` carry
**byte-identical content** for their 6 overlapping files (~1,575
lines duplicated). Folder 15 owns 11 additional release/install
files. The duplication is now provably unintentional: `diff` returns
zero between every pair.

This proposal recommends **merging both folders into a single folder
named `14-update/`**, preserving folder 15's number-15 slot for the
next reuse, and renaming the consolidated folder for clarity.

Three options are presented below with full pros/cons. The author's
recommendation is **Option A (Hard Merge)**.

---

## Current State (after Task 3 backfill)

```
spec/14-generic-update/                 (13 files, 2,919 lines)
├── 00-overview.md                      ← inventory
├── 01-self-update-overview.md          ← duplicate of 15/01 (+ skip-if-current)
├── 02-deploy-path-resolution.md        ← duplicate of 15/02
├── 03-rename-first-deploy.md           ← duplicate of 15/03
├── 04-build-scripts.md                 ← duplicate of 15/04
├── 05-handoff-mechanism.md             ← duplicate of 15/05 (+ two-phase summary)
├── 06-cleanup.md                       ← duplicate of 15/06 (+ mandatory auto-cleanup)
├── 07-console-safe-handoff.md
├── 08-repo-path-sync.md
├── 09-version-verification.md          ← NEW (Task 3)
├── 10-last-release-detection.md        ← NEW (Task 3)
├── 11-windows-icon-embedding.md        ← NEW (Task 3)
├── 12-code-signing.md                  ← NEW (Task 3)
└── 99-consistency-report.md

spec/15-self-update-app-update/         (20 files, ~4,800 lines)
├── 00-overview.md
├── 01-self-update-overview.md          ← byte-identical to 14/01 body
├── 02-deploy-path-resolution.md        ← byte-identical to 14/02 body
├── 03-rename-first-deploy.md           ← byte-identical to 14/03 body
├── 04-build-scripts.md                 ← byte-identical to 14/04 body
├── 05-handoff-mechanism.md             ← byte-identical to 14/05 body
├── 06-cleanup.md                       ← byte-identical to 14/06 body
├── 07-release-assets.md                ← UNIQUE
├── 08-checksums-verification.md        ← UNIQUE
├── 09-release-versioning.md            ← UNIQUE (700 lines!)
├── 10-cross-compilation.md             ← UNIQUE
├── 11-release-pipeline.md              ← UNIQUE
├── 12-install-scripts.md               ← UNIQUE
├── 13-updater-binary.md                ← UNIQUE
├── 14-network-requirements.md          ← UNIQUE
├── 15-config-file.md                   ← UNIQUE
├── 16-update-command-workflow.md       ← UNIQUE
├── 17-install-script-version-probe.md  ← UNIQUE (linked from 14/00)
├── 99-consistency-report.md
└── diagrams/
```

**Cross-reference fan-out:**

| Target | Inbound refs |
|--------|--------------|
| `15-self-update-app-update/` | **24 files** across `00-overview`, `01-spec-authoring-guide`, `12-cicd-pipeline-workflows`, `14-generic-update`, `17-consolidated-guidelines`, `dashboard-data.json`, `spec-index.md` |
| `14-generic-update/` | **4 files** (mostly own newly-added cross-refs) |

---

## Why the Merge Is Now Obvious

| Evidence | Implication |
|----------|-------------|
| 6 overlapping files have `diff = 0` | No content is being preserved by separation |
| ~1,575 lines duplicated | Every edit must be made twice — Code Red violation |
| Folder names overlap semantically (`generic-update` ⊂ `self-update`) | Readers cannot predict which folder owns what |
| Task 3 backfill was added only to folder 14 | Folders are now *out of sync* — the duplication is already broken |
| Cross-refs already mix the two folders inconsistently | Confusion is shipping |

---

## Three Options

### Option A — Hard Merge (recommended)

**Action:** Move all 11 unique files from folder 15 into folder 14,
delete folder 15, rename folder 14 to a clearer name, and rewrite
all 24 inbound cross-references.

```
spec/14-update/                         (24 files, ~5,300 lines)
├── 00-overview.md                      ← single inventory
├── 01-self-update-overview.md          ← canonical (with skip-if-current)
├── 02-deploy-path-resolution.md
├── 03-rename-first-deploy.md
├── 04-build-scripts.md
├── 05-handoff-mechanism.md             ← canonical (with two-phase summary)
├── 06-cleanup.md                       ← canonical (mandatory auto-cleanup)
├── 07-console-safe-handoff.md
├── 08-repo-path-sync.md
├── 09-version-verification.md
├── 10-last-release-detection.md
├── 11-windows-icon-embedding.md
├── 12-code-signing.md
├── 13-release-assets.md                ← from 15/07
├── 14-checksums-verification.md        ← from 15/08
├── 15-release-versioning.md            ← from 15/09
├── 16-cross-compilation.md             ← from 15/10
├── 17-release-pipeline.md              ← from 15/11
├── 18-install-scripts.md               ← from 15/12
├── 19-updater-binary.md                ← from 15/13
├── 20-network-requirements.md          ← from 15/14
├── 21-config-file.md                   ← from 15/15
├── 22-update-command-workflow.md       ← from 15/16
├── 23-install-script-version-probe.md  ← from 15/17
├── 99-consistency-report.md            ← consolidated
└── diagrams/                           ← merged
```

**Pros:**
- ✅ Eliminates 1,575 duplicated lines permanently.
- ✅ Single source of truth — every `update`/`install` topic lives in one folder.
- ✅ Numeric ordering tells the story: install-time → build → deploy → handoff → verify → cleanup → release-pipeline → install-probe.
- ✅ Slot 15 freed for next major spec (e.g., `15-monitoring`, `15-telemetry`).
- ✅ Aligns with gitmap-v3 gold standard, which uses a single `03-general/` folder for all related concerns.
- ✅ Cuts dashboard duplication; `99-consistency-report.md` becomes simpler.

**Cons:**
- ❌ 24 inbound cross-references must be rewritten (mostly mechanical).
- ❌ Git history of folder 15 files is "lost" without a `git mv` chain (acceptable — content is preserved).
- ❌ Rename invalidates any external bookmarks/issues referencing `15-self-update-app-update/`.
- ❌ Touches `dashboard-data.json` and `spec-index.md` — needs regeneration.

**Effort:** ~30 minutes (mostly automated find/replace).

**Risk:** Low — no semantic change, only structural.

---

### Option B — Soft Merge with Stub Folder

**Action:** Same as Option A, but keep `15-self-update-app-update/`
as a stub folder containing only forwarding stubs:

```
spec/15-self-update-app-update/
└── README.md  ← "This folder has moved. See spec/14-update/."
```

**Pros:**
- ✅ All Option A pros.
- ✅ External bookmarks still resolve to *something* useful.
- ✅ Cross-references can be migrated lazily over time.

**Cons:**
- ❌ Stub folder pollutes the spec tree.
- ❌ "Two homes" confusion persists for readers who land on the stub.
- ❌ The lazy migration tends to never finish — stubs become permanent.
- ❌ Dashboard health score still penalizes the empty folder.

**Effort:** ~20 minutes.

**Risk:** Medium — stubs tend to outlive their purpose.

---

### Option C — Status Quo + Deduplication-by-Reference

**Action:** Keep both folders. Replace the body of folder 15's
6 duplicate files with a single line: "See `../14-generic-update/<file>`".

**Pros:**
- ✅ Zero cross-reference rewrites.
- ✅ External bookmarks unchanged.
- ✅ Eliminates the duplication itself.

**Cons:**
- ❌ Two folders with overlapping scope still confuse readers.
- ❌ "Which folder owns the new pattern?" question persists.
- ❌ The 11 unique files in folder 15 stay separated from their
     conceptual neighbors in folder 14.
- ❌ Folder 14's `00-overview` still needs to point readers to
     folder 15 for release/install topics — incomplete index.
- ❌ Doesn't match gold standard's flat single-folder structure.

**Effort:** ~10 minutes.

**Risk:** Low, but kicks the can down the road.

---

## Recommendation

**Option A — Hard Merge.**

The diff-zero evidence makes the duplication structural, not
intentional. Every additional week of two-folder coexistence will
add new drift (Task 3's backfill already drifted folder 14 ahead
of folder 15). The 24 cross-reference rewrites are a one-time cost
that prevents an unbounded future cost.

The renamed folder `14-update/` is shorter, more accurate, and
matches the gold standard's `03-general/` model.

---

## Execution Plan (if Option A approved)

The merge runs as **Task 5** with these sub-steps:

1. **Move unique files** from folder 15 → folder 14 with renumbering
   (07→13, 08→14, …, 17→23). Use `code--rename`.
2. **Move `diagrams/`** from folder 15 → folder 14.
3. **Merge `00-overview.md`** — single inventory of all 24 files.
4. **Merge `99-consistency-report.md`** — combined audit.
5. **Rename folder** `14-generic-update/` → `14-update/`.
6. **Delete folder** `15-self-update-app-update/`.
7. **Rewrite cross-references** in 24 files. Single `sed`-style pass:
   - `15-self-update-app-update/01-…` → `14-update/01-…`
   - `15-self-update-app-update/02-…` → `14-update/02-…`
   - … (full mapping table generated from step 1)
   - `14-generic-update/` → `14-update/`
8. **Regenerate** `spec/dashboard-data.json` and `spec/spec-index.md`.
9. **Verify** with `grep -rln '14-generic-update\|15-self-update-app-update' spec/` — must return 0 hits.
10. **Bump** `package.json` to a minor version (currently 1.19.0 → 1.20.0).

---

## Decision Required

Reply with one of:

| Reply | Meaning |
|-------|---------|
| `option a` / `merge` / `next` | Execute Option A (Hard Merge) |
| `option b` | Execute Option B (Soft Merge with Stub) |
| `option c` | Execute Option C (Deduplication-by-Reference) |
| `cancel merge` | Keep both folders as-is, accept the duplication |

---

*Merge proposal — v1.0.0 — 2026-04-17*
