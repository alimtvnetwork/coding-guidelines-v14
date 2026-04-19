# Memory: index.md
Updated: today

# Project Memory

## Core
- 🔴 CODE RED: Never swallow errors. Zero-nesting (no nested if). Max 2 operands. Positively named guard functions.
- 🔴 CODE RED: Strict metrics: functions 8-15 lines, files < 300 lines, React components < 100 lines.
- 🔴 NEVER sync 01-app, 02-app-issues, 03-general, 03-tasks, or 12-consolidated-guidelines from upstream sibling repos. All maintained locally.
- Naming: PascalCase for all internal IDs, DB, JSON, Types. Exceptions: Rust uses snake_case identifiers.
- DB Schema: PascalCase naming. PKs are `{TableName}Id` (INTEGER PRIMARY KEY AUTOINCREMENT). No UUIDs.
- Workflow: Spec-First (`spec/`) and Issue-First (`03-issues/`).
- Repo: `alimtvnetwork/coding-guidelines-v14`. Install scripts live at repo root (`install.ps1` / `install.sh`).
- Execution: Break complex requests into discrete tasks. Wait for "next" prompt to continue.

## Memories
- [Axios Pinning](mem://constraints/axios-version-pinning) — Exact pinned versions only (1.14.0/0.30.3). Blocked versions: 1.14.1, 0.30.4.
- [Database Architecture](mem://architecture/database-schema) — PascalCase naming, no UUIDs, Vw prefixes for views.
- [Error Handling](mem://architecture/error-handling) — 'apperror' package, explicit file/path logging required.
- [PowerShell Style](mem://style/powershell-naming) — lowercase-kebab-case files, PascalCase Verb-Noun functions.
- [Development Workflow](mem://processes/development-workflow) — Spec-first workflow, linter enforcement, clean docs.
- [React ForwardRef Warning](mem://constraints/react-app-forwardref-warning) — Ignore lovable.js App.tsx ref console warning.
- [Code Red Guidelines](mem://standards/code-red-guidelines) — Full rules for zero-nesting, booleans, metrics.
- [Standards Enforcement](mem://processes/automated-standards-enforcement) — linter-scripts validation requirements.
- [Naming Conventions](mem://style/naming-conventions) — Zero-Underscore policy, full uppercase acronyms.
- [Caching Policy](mem://architecture/caching-policy) — Explicit TTL, deterministic keys, invalidate on mutation.
- [Nested Code Fences](mem://issues/nested-code-fence-data-corruption) — 4-backtick fences required for nested markdown blocks.
- [TypeScript Patterns](mem://standards/typescript-patterns) — Named interfaces for unions, TypedAction, explicit types.
- [Enum Standards](mem://standards/enum-standards) — Cross-language PascalCase enums, strict parsing methods.
- [Split Database](mem://architecture/split-database) — Root, App, Session hierarchical SQLite with WAL and Casbin.
- [Seedable Config](mem://architecture/seedable-configuration) — SemVer GORM merge of config.seed.json.
- [Self Update Arch](mem://features/self-update-architecture) — Rename-first deployment, atomicity with latest.json.
- [Doc Standards](mem://project/documentation-standards) — Mandatory numeric folders (01-20 Core, 21+ App), JSON tree syncing.
- [Author Attribution](mem://project/author-attribution) — Md. Alim Ul Karim, Riseup Asia LLC, SEO/footer requirements.
- [Avoid Upstream Sync](mem://constraints/avoid-app-sync) — NEVER sync app, app-issues, general, tasks, or consolidated-guidelines from upstream sibling repos.
