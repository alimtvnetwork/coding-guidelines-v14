# Solved Issues

**Updated:** 2026-04-16  
**Version:** 3.1.0

---

## Issue #1 — BookOpen ReferenceError (Stale Build Cache)

**Date:** 2026-04-05  
**Severity:** Medium

### Symptom
`ReferenceError: BookOpen is not defined` in `SidebarBranding` component at runtime.

### Root Cause
Source code correctly used `Library` icon, but a stale Vite build cache still referenced the old `BookOpen` import that had been removed.

### Solution
Forced a rebuild by applying a minor change to `src/components/docs/DocsSidebar.tsx`. The cached bundle was invalidated and the correct `Library` icon rendered.

### Learning
Always clear build cache when renaming or removing icon imports. Stale caches can cause phantom reference errors that don't match the source code.

### What NOT to repeat
- Don't assume a reference error means the import is missing — check cache first.

---

## Issue #2 — Download Button Not Visible (Overflow Clipping)

**Date:** 2026-04-05  
**Severity:** Medium

### Symptom
Download folder button was invisible despite being present in the DOM.

### Root Cause
The download `<button>` was nested inside `SidebarMenuButton`, which has `overflow: hidden`. The button was clipped.

### Solution
Moved the download button outside `SidebarMenuButton` using a flex wrapper in `src/components/SpecTreeNav.tsx`.

### Learning
Always check parent overflow properties when child elements are invisible but present in DOM.

### What NOT to repeat
- Don't nest interactive elements inside components with `overflow: hidden`.

---

## Issue #3 — Broken Folder Structure in Sidebar

**Date:** 2026-04-05  
**Severity:** High

### Symptom
Spec tree sidebar showed flat list instead of collapsible folder hierarchy.

### Root Cause
`src/data/specTree.json` nodes were missing the required `type: "file"` or `type: "folder"` field after a regeneration.

### Solution
Regenerated `specTree.json` using a Python script that properly sets `type` fields based on filesystem structure.

### Learning
Any specTree.json regeneration script MUST include the `type` field for every node.

### What NOT to repeat
- Don't regenerate specTree.json without verifying `type` field presence on all nodes.

---

## Issue #4 — URLError Naming Inconsistency

**Date:** 2026-04-02  
**Severity:** Low

### Symptom
`URLError` / `WrapURLError` used across spec files, violating project's title-case convention.

### Root Cause
Used Go stdlib convention (`URL` all-caps) instead of project convention (`Url` title-case) matching siblings `SlugError`, `SiteError`.

### Solution
Renamed all to `UrlError` / `WrapUrlError` across 3 spec files. Verified with `grep -r "URLError" spec/`.

### Learning
Before naming new constructors, check sibling naming patterns — match project convention, not stdlib.

---

## Issue #5 — Version Inconsistency (2.1.0 vs 3.1.0)

**Date:** 2026-04-16  
**Severity:** High

### Symptom
User requested v3.1.0 but some docs and UI showed v2.1.0 or v1.1.0.

### Root Cause
Initial version bump used wrong target version. Required multiple correction passes.

### Solution
Bulk `sed` across all 319 spec MD files + UI badge and footer to v3.1.0. Verified with `grep -rn "2\.1\.0\|1\.1\.0" spec/`.

### Learning
Confirm the exact target version string BEFORE running bulk operations. Verify with grep after.

### What NOT to repeat
- Don't assume the version from context — always confirm with the user first.

---

## Issue #6 — CODE-RED and STYLE Violations (19 + 22)

**Date:** 2026-04-05  
**Severity:** High

### Symptom
Validation script found 19 CODE-RED and 22 STYLE violations.

### Root Cause
Magic strings instead of enums, functions exceeding 15-line limit, files exceeding 300-line limit.

### Solution
- Introduced `SpecNodeType` enum in `src/types/spec.ts`
- Extracted utility functions to reduce function length
- Refactored large components into smaller focused ones
- Confirmed zero violations on re-run (95 files)

### Learning
Run validate-guidelines regularly, especially after adding new features.

---

*Solved issues — v3.1.0 — 2026-04-16*
