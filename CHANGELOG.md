# Changelog

All notable changes to this project are documented here.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.9.0] — 2026-04-19

### Added
- **`linters-cicd/` CI/CD linter pack** — portable, language-agnostic CODE RED
  enforcement that any pipeline can integrate with one line.
  - 7 checks (Phase 1, Go + TypeScript): nested-if, boolean-naming,
    magic-strings, function-length, file-length (universal), positive-conditions,
    no-else-after-return.
  - **SARIF 2.1.0** output by default — surfaces inline on GitHub PRs (Code
    Scanning), GitLab MRs, and Azure DevOps.
  - `run-all.sh` orchestrator with text + SARIF formats and proper exit codes
    (0 clean / 1 findings / 2 tool error).
  - **GitHub composite Action** at `linters-cicd/action.yml`:
    `uses: alimtvnetwork/coding-guidelines-v14/linters-cicd@v3.9.0`.
  - **`install.sh` one-liner** with SHA-256 verification and `-d`/`-v`/`-n` flags.
  - Ready-to-paste CI templates for GitHub Actions, GitLab CI, Azure DevOps,
    Bitbucket Pipelines, Jenkins, plus a pre-commit hook.
- **`spec/02-coding-guidelines/06-cicd-integration/`** — full spec for the
  linter pack: SARIF contract, plugin model, language roadmap (Phase 2 = PHP,
  Phase 3 = Python + Rust, Phase 4+ on request), CI templates inventory,
  distribution model, rules mapping, and acceptance criteria.

### Release pipeline
- `.github/workflows/release.yml` now also packages
  `coding-guidelines-linters-vX.Y.Z.zip` on every `v*` tag, computes its
  SHA-256, appends to `checksums.txt`, and attaches both the ZIP and
  `linters-install.sh` to the GitHub Release.

### Smoke test
- Orchestrator self-tested against this repo's `src/`: all 7 checks ran,
  SARIF validated against the 2.1.0 schema, exit codes correct.

---

## [3.8.0] — 2026-04-19

### Added
- **`-n` / `--no-latest` skip-probe flag** on both installers. Pass `-n` to bypass
  the latest-version auto-probe and run the current installer as-is — useful on
  flaky networks, in CI pipelines, or when you want a fully reproducible install
  pinned to the URL you ran.
  - PowerShell: `-n`, `-NoLatest`, `-NoProbe` (all aliases of the same switch).
  - Bash: `-n`, `--no-latest`, `--no-probe` (all aliases).
- New "skip latest probe" one-liner variants surfaced in both the landing-page
  install section and the root `readme.md` so users can copy them in one click.

### Changed
- **Windows PowerShell command is now listed first** in the UI install section
  and the README's Option 1 — matching the dominant audience for this repo.
  Bash (macOS / Linux) follows immediately below.
- **Middle-out probe ordering** in `install.ps1` and `install.sh`. The 20 candidate
  versions (`current+1 .. current+20`) are now dispatched starting from the middle
  of the window and expanding outward (`mid, mid+1, mid-1, mid+2, mid-2, …`).
  The result-scan loop iterates highest → lowest so the first hit accepted is
  already the winner — no second pass, no per-iteration sort.
  - Documented as a portable trick in
    [`spec/14-update/23-install-script-version-probe.md`](spec/14-update/23-install-script-version-probe.md)
    so any other CLI's installer can adopt it.
- **Indented PowerShell output** — every `Write-Step / OK / Warn / Err / Dim / Plain`
  call (and the banner / summary blocks) now share a 4-space left gutter for a
  clean, professional column. Matches the visual rhythm of the bash output.

### Performance
- The PowerShell probe was rewritten to use in-process `System.Net.Http.HttpClient`
  async HEAD requests instead of `Start-Job` (which spawns one PowerShell process
  per candidate, ~20 s of overhead). The `Timeout = 2s` setting is now genuinely
  honoured and the probe finishes in ~2–3 s end-to-end.

### Documentation
- README's flag table updated with the full alias list:
  `--no-probe`, `--no-latest`, `-n` ↔ `-NoProbe`, `-NoLatest`, `-n`.
- New section in `spec/14-update/23-install-script-version-probe.md`:
  *"Probe ordering optimization (middle-out + descending result scan)"* —
  explains why ordering still matters under degraded parallelism (corporate
  proxies, throttled CI runners, low-fd shells) and provides reference
  pseudocode any installer can copy.

### Files touched
- `install.ps1` — `-NoLatest` / `-n` aliases, middle-out candidate array,
  descending result scan.
- `install.sh` — `--no-latest` / `-n` aliases, middle-out candidate array,
  descending `sort -n | tail -1` winner pick.
- `src/components/landing/InstallSection.tsx` — Windows-first ordering, added
  two "skip latest probe" command cards.
- `readme.md` — Reordered Option 1 (PowerShell first), added `-n` variants,
  expanded flag table.
- `spec/14-update/23-install-script-version-probe.md` — middle-out ordering spec.
- `package.json`, `version.json` — bumped to `3.8.0`.

---
