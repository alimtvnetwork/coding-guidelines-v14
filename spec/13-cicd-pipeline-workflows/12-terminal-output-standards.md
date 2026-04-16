# Terminal Output Standards

**Version:** 3.1.0  
**Updated:** 2026-04-16

---

## Purpose

Define the terminal output conventions for all CLI commands, installers, and CI pipeline output. Consistent terminal output ensures a professional user experience and makes output machine-parseable when needed.

---

## Output Formatting Rules

### Indentation

All CLI output uses **2-space indentation** from the left margin:

```
  Scanning repositories...
  Found 42 repositories in ~/projects
  Done.
```

Never use tabs. Never start output at column 0 (except for `version` command and machine-readable output).

### Status Icons

| Icon | Meaning | Usage |
|------|---------|-------|
| `[OK]` | Success/check passed | Doctor checks, verification |
| `[FAIL]` | Failure/check failed | Doctor checks, verification |
| `[WARN]` | Warning (non-fatal) | Deprecation, stdlib vulns |
| `[+]` | Added/registered | PATH registration, env set |
| `[-]` | Removed/unregistered | PATH removal, env remove |
| `[=]` | No change (already exists) | Idempotent operations |
| `[SKIP]` | Skipped (intentionally) | Already installed, cached |

**Note on Unicode**: Use ASCII-only icons (`[OK]`, `[+]`) for generated scripts and CI output. Unicode icons (`✓`, `✗`, `→`) are permitted in Go-compiled binaries only, where UTF-8 encoding is guaranteed.

### Progress Indicators

For operations with multiple steps:

```
  Scanning repositories...

  [1/4] Discovering .git directories
  [2/4] Reading commit metadata
  [3/4] Detecting project types
  [4/4] Writing database

  Done. Scanned 42 repositories in 3.2s.
```

### Error Output

Errors go to stderr with a consistent format:

```
  Error: <message> (<operation>)
```

With structured context for debugging:

```
  Error: Failed to open database at /path/to/db.sqlite
    Reason:     file is locked by another process
    Operation:  store.Open
    Suggestion: Close other instances of <binary> and retry
```

### Tables

Use fixed-width columns with header separators:

```
  NAME           PATH                          BRANCHES  LAST COMMIT
  my-project     ~/projects/my-project         5         2h ago
  other-repo     ~/projects/other-repo         3         1d ago
```

Right-align numeric columns. Left-align text columns.

---

## Command Output Samples

### Scan

```
$ <binary> scan

  <binary> v1.3.0

  Scanning ~/projects (depth: 5)...

  [1/3] Discovering repositories
  [2/3] Reading metadata
  [3/3] Writing to database

  Found 42 repositories:
    38 new, 3 updated, 1 unchanged

  Done in 3.2s.
```

### Clone

```
$ <binary> clone

  <binary> v1.3.0

  Fetching repository list from GitHub...

  Found 15 repositories to clone:

  [1/15]  owner/repo-alpha        cloning... OK
  [2/15]  owner/repo-beta         cloning... OK
  [3/15]  owner/repo-gamma        exists     [SKIP]
  ...
  [15/15] owner/repo-omega        cloning... OK

  Cloned 12 repositories, skipped 3 (already exist).
  Done in 45.1s.
```

### Release

```
$ <binary> release --bump minor

  <binary> v1.3.0

  Creating release v1.4.0...

  [1/5] Bumping version: 1.3.0 -> 1.4.0
  [2/5] Updating CHANGELOG.md
  [3/5] Committing changes
  [4/5] Creating branch: release/v1.4.0
  [5/5] Pushing to origin

  Release v1.4.0 created successfully.

    Branch: release/v1.4.0
    Commit: abc1234
    Tag:    v1.4.0 (will be created by CI)

  CI pipeline will build and publish the release.
  Track progress: https://github.com/owner/repo/actions
```

### Doctor

```
$ <binary> doctor

  <binary> v1.3.0 — System Health Check

  [OK]   Git: v2.43.0
  [OK]   Go: v1.24.2
  [OK]   Database: Connected (42 repos, 156 projects)
  [OK]   Config: Valid (config.json parsed)
  [OK]   PATH: <binary> found in PATH
  [OK]   <BINARY>_HOME: E:\<binary> (exists)
  [WARN] Legacy dirs: None found (clean)
  [OK]   Shell: PowerShell 7.4.1

  7 passed, 0 failed, 1 warning.
```

### Update (Self-Update)

```
$ <binary> update

  Checking for updates...

  Current: v1.3.0
  Latest:  v1.4.0

  Downloading v1.4.0 for windows/amd64...
  Verifying checksum... OK
  Deploying...

    [+] Renamed <binary>.exe -> <binary>.exe.old
    [+] Installed <binary>.exe v1.4.0
    [+] Cleaned up <binary>.exe.old

  Updated successfully: v1.3.0 -> v1.4.0
```

---

## CI Pipeline Output

### Build Summary

```
  ==========================================
  Build Summary
  ==========================================

  Binary                                    Size
  <binary>-v1.3.0-windows-amd64.exe        8.2MiB
  <binary>-v1.3.0-windows-arm64.exe        7.9MiB
  <binary>-v1.3.0-linux-amd64              7.8MiB
  <binary>-v1.3.0-linux-arm64              7.5MiB
  <binary>-v1.3.0-darwin-amd64             8.0MiB
  <binary>-v1.3.0-darwin-arm64             7.7MiB
```

### Test Summary

```
  ==========================================
  Test Results
  ==========================================

  Suite           Passed  Failed  Duration
  unit            45      0       2.3s
  store           12      0       1.1s
  integration     8       0       4.5s
  tui             6       0       0.8s

  Total: 71 passed, 0 failed (8.7s)
```

### Test Failure Report

```
  =========================================
  FAILURE REPORT (copy-paste ready)
  =========================================

  Suite: store
  --- FAIL: TestInsertRepo (0.02s)
      store_test.go:45: expected 1 row, got 0

  Suite: integration
  --- FAIL: TestScanDepth (0.15s)
      scan_test.go:112: depth=3 found 0 repos, expected 5

  =========================================
  2 failures across 2 suites
  =========================================
```

---

## Constraints

- 2-space indentation for all human-readable output
- ASCII-only icons in generated scripts; Unicode OK in compiled Go binaries
- Errors to stderr, success output to stdout
- `version` command: single line, no prefix, no indentation
- Tables: left-align text, right-align numbers
- Progress: `[N/M]` format for multi-step operations
- Time durations: use `Xs`, `Xm`, or human-relative (`2h ago`, `1d ago`)
- Empty lines before and after major sections for readability

---

## Cross-References

- [Version and Help](./10-version-and-help.md) — Version display and help system patterns
- [Installation Flow](./08-installation-flow.md) — Installer terminal output
- [Environment Variable Setup](./11-environment-variable-setup.md) — Env command output
- [Shared Conventions](./01-shared-conventions.md) — Platform and tooling conventions

---

*Terminal output standards — v3.1.0 — 2026-04-11*
