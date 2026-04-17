# Generic Update — Overview

**Version:** 1.0.0  
**Updated:** 2026-04-16  
**Status:** Active  
**AI Confidence:** Production-Ready  
**Ambiguity:** None

---

## Purpose

Reusable blueprint for the **CLI self-update mechanism** used across all Go CLI tools in the Riseup Asia stack. Defines the rename-first deployment model, deploy-path resolution, handoff between old and new binaries, post-update cleanup, and console safety on Windows. Any CLI that ships a `self-update` (or `update`) subcommand MUST follow the contracts in this folder.

---

## Keywords

`self-update` · `cli-update` · `rename-first-deploy` · `handoff` · `cleanup` · `deploy-path` · `console-safe` · `winres` · `latest-json`

---

## Scoring

| Metric | Value |
|--------|-------|
| AI Confidence | Production-Ready |
| Ambiguity | None |
| Health Score | 100/100 (A+) |

---

## Architecture (One-Liner)

```
check latest.json → download new asset → verify checksum → rename current bin
  → write new bin to canonical deploy path → exec new bin (handoff)
  → new bin cleans up old rename → done
```

The defining property: **the running binary is renamed, never deleted, before the new one is written.** This avoids Windows file-lock errors and guarantees rollback is always one rename away.

---

## File Inventory

| # | File | Description | Status |
|---|------|-------------|--------|
| 01 | [01-self-update-overview.md](./01-self-update-overview.md) | Top-level self-update contract: triggers, version comparison, latest.json schema | ✅ Active |
| 02 | [02-deploy-path-resolution.md](./02-deploy-path-resolution.md) | Canonical deploy path resolution per OS, env-var overrides, PATH registration | ✅ Active |
| 03 | [03-rename-first-deploy.md](./03-rename-first-deploy.md) | Rename-first algorithm, atomicity guarantees, Windows file-lock handling | ✅ Active |
| 04 | [04-build-scripts.md](./04-build-scripts.md) | Build/release scripts that produce update-compatible artifacts (LDFLAGS, asset naming) | ✅ Active |
| 05 | [05-handoff-mechanism.md](./05-handoff-mechanism.md) | Old → new binary handoff: exec, env passthrough, exit codes, signal forwarding | ✅ Active |
| 06 | [06-cleanup.md](./06-cleanup.md) | Post-handoff cleanup: removing renamed old binary, retry on Windows lock | ✅ Active |
| 07 | [07-console-safe-handoff.md](./07-console-safe-handoff.md) | Windows console safety: detached vs attached, stdout/stderr inheritance | ✅ Active |
| 08 | [08-repo-path-sync.md](./08-repo-path-sync.md) | Cross-repo path sync: keeping deploy paths consistent across CLI tools | ✅ Active |
| 09 | [`../15-self-update-app-update/17-install-script-version-probe.md`](../15-self-update-app-update/17-install-script-version-probe.md) | Install-script latest-version probe + hand-off (lives in 15/, referenced here) | 🔗 Linked |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| CI/CD self-update mechanism (shared) | `../12-cicd-pipeline-workflows/06-self-update-mechanism.md` |
| Self-update full app specs | `../15-self-update-app-update/00-overview.md` |
| Generic CLI blueprint | `../13-generic-cli/00-overview.md` |
| Release pipeline (asset production) | `../16-generic-release/02-release-pipeline.md` |
| Consolidated summary | `../17-consolidated-guidelines/17-self-update-app-update.md` |

---

## Placement Rules

```
AI INSTRUCTION:

1. ALL generic (cross-CLI) self-update content belongs in this folder.
2. App-specific update behavior (UI prompts, app-side gating) goes in 21-app/ instead.
3. Pipeline-side concerns (how releases are built/signed) go in 12-cicd-pipeline-workflows/.
4. Each file follows the standard {NN}-{kebab-case-name}.md naming convention.
5. Add new files to the Feature Inventory above and update 99-consistency-report.md.
```

---

*Overview — updated: 2026-04-16*
