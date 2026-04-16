# Pending Issues

**Updated:** 2026-04-16  
**Version:** 3.1.0

---

## Issue #1 — End-to-End Testing Not Performed

**Priority:** Medium  
**Status:** Open

### Description
The docs viewer has not been tested end-to-end in a browser. All 4 view modes (Preview, Source, Edit, Split), download buttons, folder navigation, and theme toggle need manual verification.

### Risk
UI regressions may exist undetected — especially after the folder structure fix and specTree.json regeneration.

### Recommended Action
Use browser tools to test each view mode, download a folder as ZIP, toggle syntax themes, and verify folder collapse/expand.

---

## Issue #2 — Mobile Responsiveness Unverified

**Priority:** Low  
**Status:** Open

### Description
No mobile viewport testing has been done on the docs viewer. Sidebar collapse behavior, touch interactions, and download button placement are untested.

### Recommended Action
Set viewport to 375px and 768px, verify sidebar toggles correctly and content remains readable.

---

## Issue #3 — Cross-Reference Link Staleness Risk

**Priority:** Low  
**Status:** Open

### Description
Last cross-reference validation was 2026-04-05. Subsequent spec restructuring (error-manage flattening, version bumps) may have introduced broken internal links.

### Recommended Action
Run a link checker script across all `spec/` MD files to verify zero broken `[text](path)` references.

---

*Pending issues — v3.1.0 — 2026-04-16*
