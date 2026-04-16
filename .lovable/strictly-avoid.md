# Strictly Avoid — Quick Reference

**Version:** 3.1.0  
**Updated:** 2026-04-16

---

⛔ **Every rule below is a hard prohibition. Violating any of these is a blocking issue.**

For detailed rationale, see individual files in `.lovable/strictly-avoid/`.

---

## Folder & Structure

- **Never create `.lovable/memories/`** — only `.lovable/memory/` exists. See `strictly-avoid/no-memories-folder.md`
- **Never use `v1` namespace** — the project is `github.com/mahin/movie-cli-v2`. Any `v1` reference is a bug
- **Never touch the `.release` folder** — it is managed externally

## Error Handling

- **Never swallow errors** — no empty `catch`, no `_ := fn()`, no ignored return values. 🔴 CODE RED
- **Never use generic error messages** — always include file path, entity ID, or operation context. 🔴 CODE RED
- **Never use `fmt.Errorf`** — always use `apperror.Wrap()` with error codes

## Naming

- **Never use underscores** in names (Zero-Underscore policy) — except Rust identifiers and Go test files
- **Never use negative boolean names** — no `isNotReady`, `hasNoPermission`, `isNonActive`
- **Never use `can`, `was`, `will`, `not`, `no` as boolean prefixes** — only `is`/`has` (rarely `should`)
- **Never use UUIDs for primary keys** — integer PKs with `{TableName}Id` pattern only
- **Never use camelCase for DB columns or JSON keys** — PascalCase only

## Code Style

- **Never nest `if` blocks** — zero nesting is absolute. 🔴 CODE RED
- **Never exceed 15 lines per function** (excluding error handling and blanks)
- **Never use `any` in TypeScript** — use generics or `unknown` with narrowing
- **Never use `interface{}`/`any` in Go exported APIs**
- **Never use `unwrap()` in Rust production code**
- **Never use magic strings** — always use enums or named constants

## Dependencies

- **Never upgrade Axios beyond 1.14.0 / 0.30.3** — versions 1.14.1 and 0.30.4 are blocked

## Communication

- **Never append boilerplate** like "If you have any questions..." or "Do you understand? Always add this part..."
- **Never use older version numbers** — all docs are at v3.1.0

---

*Strictly avoid — v3.1.0 — 2026-04-16*
