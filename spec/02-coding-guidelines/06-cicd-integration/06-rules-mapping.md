# Rules Mapping — Spec → Check → Severity

> **Version:** 1.0.0
> **Updated:** 2026-04-19

Single source of truth: every CODE RED / STYLE rule, where it is defined
in the spec, which check script enforces it, and what severity each
emits.

---

## CODE RED rules (block merge — SARIF `error`)

| ID | Rule | Spec source | Check script | Phase 1 langs |
|----|------|-------------|--------------|---------------|
| CODE-RED-001 | No nested `if` | `01-cross-language/04-code-style/` | `checks/nested-if/<lang>.py` | go, ts |
| CODE-RED-002 | Boolean naming (Is/Has/Can/Should/Was/Will) | `01-cross-language/02-boolean-principles/` | `checks/boolean-naming/<lang>.py` | go, ts |
| CODE-RED-003 | No magic strings | `01-cross-language/04-code-style/` | `checks/magic-strings/<lang>.py` | go, ts |
| CODE-RED-004 | Function length 8–15 lines | `01-cross-language/04-code-style/` | `checks/function-length/<lang>.py` | go, ts |
| CODE-RED-006 | File length ≤ 300 lines | `01-cross-language/04-code-style/` | `checks/file-length/<lang>.py` | universal |
| CODE-RED-008 | No raw negations in conditions | `01-cross-language/12-no-negatives.md` | `checks/positive-conditions/<lang>.py` | go, ts |

---

## STYLE rules (annotate — SARIF `warning`)

| ID | Rule | Spec source | Check script | Phase 1 langs |
|----|------|-------------|--------------|---------------|
| STYLE-002 | No `else` after `return`/`throw` | `01-cross-language/04-code-style/` | `checks/no-else-after-return/<lang>.py` | go, ts |

---

## Future rules (Phase 2+)

Added to this table as they ship. Removing a rule requires a major
version bump of the linter pack and a deprecation note in
[`03-language-roadmap.md`](./03-language-roadmap.md).

---

*Part of [CI/CD Integration](./00-overview.md)*
