# Strictly Avoid: UUID Primary Keys

**Rule:** Never use UUIDs for primary keys.

---

## What Is Prohibited

Using `UUID`, `GUID`, or any string-based identifier as a primary key in any database table.

## Why

The project standardizes on integer auto-increment PKs with the pattern `{TableName}Id` (e.g., `UserId INTEGER PRIMARY KEY AUTOINCREMENT`). UUIDs fragment indexes, waste storage, and break the naming convention.

## What To Do Instead

- Use `{TableName}Id INTEGER PRIMARY KEY AUTOINCREMENT`
- PascalCase for all column names
- Foreign keys follow `{ReferencedTable}Id` pattern

---

*Strictly avoid — no UUID PKs — v3.1.0 — 2026-04-16*
