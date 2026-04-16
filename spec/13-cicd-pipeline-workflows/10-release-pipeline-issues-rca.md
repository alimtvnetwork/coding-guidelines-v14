# 10 — Release Pipeline Issues: Root Cause Analysis & Prevention

**Version:** 1.0.0  
**Created:** 2026-04-16  
**Status:** Active reference  
**Audience:** Any AI model or engineer maintaining the CI/CD pipeline  
**Goal:** Document every release/CI failure encountered, with root cause and durable fix, so the same mistakes never recur.

---

## Purpose

This document is a living **post-mortem ledger** for the project's GitHub Actions CI and Release pipelines. Each entry captures:

1. **Symptom** — exact error message as seen in CI logs
2. **Trigger** — what action/commit/state caused it
3. **Root cause** — the *why*, not just the *what*
4. **Fix applied** — the concrete change committed
5. **Prevention rule** — the durable guideline future contributors and AI models must follow

Read this file **before** modifying `.github/workflows/*.yml`, `release.sh`, `install.sh`, `install.ps1`, or `package.json` version-related fields.

---

## Pipeline Architecture (1-line summary)

- **CI** (`.github/workflows/ci.yml`): runs on push/PR to `main`. Validates linter scripts (Go + Python) and Axios pinning. **No Node/npm involvement.**
- **Release** (`.github/workflows/release.yml`): runs on `v*` tags. Executes `release.sh` to build artifacts, then publishes a GitHub Release. **No Node/npm involvement.**

> ⚠️ **CRITICAL INVARIANT:** Neither workflow may invoke `npm ci`, `npm install`, `node`, or any JS toolchain. The repository ships a `package.json` for *local* preview tooling only — the lockfile is **not** kept in sync with `package.json` and must never be relied on in CI.

---

## Issue Ledger

### Issue #1 — `npm ci` fails: lockfile out of sync

**Date observed:** 2026-04-16  
**Workflow:** Release (`release.yml`)  
**Tag:** `v1.4.0`

**Symptom:**
```
npm error `npm ci` can only install packages when your package.json and
package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: @monaco-editor/react@4.7.0 from lock file
npm error Missing: monaco-editor@0.55.1 from lock file
... (40+ missing packages)
Error: Process completed with exit code 1.
```

**Trigger:**  
The release workflow ran `npm ci` to bootstrap a Node environment so it could call `node -p "require('./package.json').version"` to read the version string.

**Root cause:**  
1. `package.json` is updated by Lovable's preview environment whenever new deps are added.
2. `package-lock.json` is **read-only** in this project and is *not* regenerated on every dep change.
3. Therefore `package.json` and `package-lock.json` drift out of sync continuously.
4. `npm ci` enforces strict sync — it fails immediately.
5. **Deeper cause:** the release pipeline had no business depending on Node at all. Reading a version string does not require `npm ci`.

**Fix applied:**
- Removed `actions/setup-node` and `npm ci` from `release.yml`.
- Replaced `node -p` with a shell `resolve_version` function in `release.sh` that:
  1. Prefers `$RELEASE_VERSION` env var (set by workflow from `GITHUB_REF_NAME`).
  2. Falls back to `sed`-based extraction from `package.json`.
- Workflow now passes `RELEASE_VERSION: ${{ steps.version.outputs.version }}` into `release.sh`.

**Prevention rule:**  
🔴 **NEVER add `npm ci`, `npm install`, or `actions/setup-node` to any CI/CD workflow in this repo.** The lockfile is not maintained. If a workflow needs a value from `package.json`, extract it with `sed`/`grep`/`jq` (jq is preinstalled on `ubuntu-latest`). If a workflow genuinely needs Node tooling, it must first regenerate the lockfile with `npm install --package-lock-only` and accept the resulting drift — but this is **discouraged**.

---

### Issue #2 — `setup-python` cache fails: no `requirements.txt`

**Date observed:** 2026-04-16  
**Workflow:** CI (`ci.yml`)

**Symptom:**
```
Error: No file in /home/runner/work/coding-guidelines-v14/coding-guidelines-v14
matched to [**/requirements.txt or **/pyproject.toml], make sure you have
checked out the target repository
```

**Trigger:**  
`actions/setup-python@v5` was configured with `cache: 'pip'`. The built-in pip cache requires a dependency manifest (`requirements.txt` or `pyproject.toml`) to compute its cache key. The repo has neither — the Python validator (`linter-scripts/validate-guidelines.py`) uses only the standard library.

**Root cause:**  
Built-in caching in `setup-python` and `setup-go` assumes the project has a canonical dependency manifest at a discoverable path. This repo is *not* a Python or Go project — it merely *contains* validator scripts in those languages with zero external deps. Built-in caching is the wrong tool.

**Fix applied:**
- Removed `cache: 'pip'` from `setup-python` and `cache: true` from `setup-go`.
- Added explicit `actions/cache@v4` steps with cache keys derived from `hashFiles('linter-scripts/**/*.go')` and `hashFiles('linter-scripts/**/*.py')`.
- Cache paths: `~/.cache/go-build`, `~/go/pkg/mod` for Go; `~/.cache/pip` for pip.

**Prevention rule:**  
🔴 **Do not enable built-in `cache:` on `setup-python` or `setup-go` in this repo.** Always use explicit `actions/cache@v4` with `hashFiles()` keyed on the script files themselves. If a future contributor adds a real `requirements.txt` or `go.mod`, only then may built-in caching be reconsidered.

---

### Issue #3 — Release script depended on Node at runtime

**Date observed:** 2026-04-16 (same incident as Issue #1)  
**Workflow:** Release (`release.sh`)

**Symptom:**  
`release.sh` invoked `node -p "require('./package.json').version"`, which forced the workflow to install Node and run `npm ci`, cascading into Issue #1.

**Root cause:**  
The release script was written assuming a JS-tooled environment. A version-bump workflow does not need a JS runtime to read a JSON field.

**Fix applied:**  
`resolve_version()` shell function in `release.sh`:
```bash
resolve_version() {
  if [ -n "${RELEASE_VERSION:-}" ]; then
    echo "${RELEASE_VERSION#v}"
    return
  fi
  sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' package.json | head -1
}
```

**Prevention rule:**  
🔴 **`release.sh` and any future CI shell scripts must remain language-agnostic.** Never invoke `node`, `npm`, `python`, or `go` from `release.sh` unless the script's *purpose* is to build that language's artifacts. Use POSIX shell utilities (`sed`, `awk`, `grep`, `jq`, `cut`) for parsing.

---

## Standing Rules (apply to every CI/CD change)

| # | Rule | Rationale |
|---|------|-----------|
| 1 | No `npm ci` / `npm install` in any workflow | Lockfile is not kept in sync; will always fail |
| 2 | No `actions/setup-node` in any workflow | No Node-based build step exists in this repo |
| 3 | No built-in `cache:` on language setup actions | No canonical manifests exist for those languages |
| 4 | All `actions/*` versions pinned to exact major (e.g. `@v6`) | Reproducibility |
| 5 | Tool versions pinned exactly (e.g. `golangci-lint@v1.64.8`) | Reproducibility |
| 6 | Version reads from `package.json` use `sed`, not `node` | Avoid Issue #1 |
| 7 | Every code change bumps at least the minor version | Per `.lovable/user-preferences` |
| 8 | Touching `release-artifacts/` outside of `release.sh` is forbidden | Generated content; do not hand-edit |

---

## Pre-flight Checklist for Workflow Edits

Before committing changes to `.github/workflows/*.yml`:

- [ ] Does this change introduce `npm`, `node`, `setup-node`, or any JS dep? → **STOP**, refer to Issue #1.
- [ ] Does this change enable built-in `cache:` on `setup-python` / `setup-go`? → **STOP**, refer to Issue #2.
- [ ] Are all action versions pinned (`@v6`, not `@latest`)?
- [ ] Are all tool versions pinned (e.g. `@v1.64.8`)?
- [ ] Does `release.sh` still resolve version without Node? → grep for `node ` and `require(` to confirm absence.
- [ ] Has the version in `package.json` been bumped (minor or major)?
- [ ] Has this ledger been updated if a new failure mode was discovered?

---

## Cross-References

| Reference | Location |
|-----------|----------|
| CI pipeline spec | [`./01-ci-pipeline.md`](./01-ci-pipeline.md) |
| Release pipeline spec | [`./02-release-pipeline.md`](./02-release-pipeline.md) |
| Shared conventions | [`./01-shared-conventions.md`](./01-shared-conventions.md) |
| Current CI workflow | `.github/workflows/ci.yml` |
| Current Release workflow | `.github/workflows/release.yml` |
| Current release script | `release.sh` |
| Coding standards | `spec/02-coding-guidelines/00-overview.md` |

---

## Update Protocol

When a new CI/CD failure occurs:

1. Capture the **exact** error message (do not paraphrase).
2. Add a new `### Issue #N` section using the template structure above.
3. Add a corresponding rule to **Standing Rules** if the failure mode is generalizable.
4. Update the **Pre-flight Checklist** if a new check is warranted.
5. Bump the version of this document in the front-matter.
6. Cross-reference the issue from the affected spec (e.g., `02-release-pipeline.md`).
