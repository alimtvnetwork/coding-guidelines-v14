# Strictly Avoid: Swallowed Errors

**Rule:** Never catch and ignore errors. 🔴 CODE RED

---

## What Is Prohibited

- Empty `catch` blocks: `catch (e) {}`
- Underscore discards: `result, _ := fn()`
- Generic messages without context: `"file not found"` (WHICH file?)

## Why

Swallowed errors make debugging impossible. Every error must be explicitly handled, logged, or propagated with full context.

## What To Do Instead

- Use `apperror.Wrap(err, ErrCode, "context")` in Go
- Always include file path, entity ID, or operation name
- Use `catch (Throwable $e)` in PHP, never `catch (Exception $e)`

---

*Strictly avoid — no error swallowing — v3.1.0 — 2026-04-16*
