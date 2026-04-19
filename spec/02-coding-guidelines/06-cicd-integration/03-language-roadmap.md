# Language Roadmap

> **Version:** 1.0.0
> **Updated:** 2026-04-19

Phased rollout per user direction. Each phase is independently shippable
and adds **only** new plugins under `linters-cicd/checks/<rule>/<lang>.py`
plus registry entries.

---

## Phase 1 — Go + TypeScript (✅ shipping in v3.9.0)

| Check | Go | TypeScript |
|-------|----|------------|
| nested-if (CODE-RED-001) | ✅ regex+AST hybrid | ✅ regex+AST hybrid |
| function-length (CODE-RED-004) | ✅ | ✅ |
| file-length (CODE-RED-006) | ✅ | ✅ |
| magic-strings (CODE-RED-003) | ✅ | ✅ |
| boolean-naming (CODE-RED-002) | ✅ | ✅ |
| positive-conditions (CODE-RED-008) | ✅ | ✅ |
| no-else-after-return (STYLE-002) | ✅ | ✅ |

**Why Go + TS first:** they are the languages used in this repo, so the
checks can be self-tested against the spec's own corpus.

---

## Phase 2 — PHP (planned)

Triggered by next user request. PHP rules already exist in
`spec/02-coding-guidelines/04-php/` — only the AST walkers need writing,
likely using the `phply` package or regex fallbacks for WordPress code.

---

## Phase 3 — Python + Rust (planned)

Python uses the standard library `ast` module — trivial. Rust uses
`tree-sitter-rust` Python bindings.

---

## Phase 4+ — On request

Any additional language (Java, Kotlin, Swift, C#, …) is added on user
request following [`02-plugin-model.md`](./02-plugin-model.md). The
orchestrator and SARIF contract remain unchanged.

---

## Promotion criteria (todo → shipping)

A language graduates from "planned" to "shipping" when:

1. All 7 Phase 1 checks have a working plugin with fixtures.
2. `linters-cicd/checks/<rule>/fixtures/<lang>/` has ≥ 1 bad and ≥ 1 good
   fixture per check.
3. CI runs `validate-sarif.py` on every emission.
4. The rule appears in `06-rules-mapping.md` with status `shipping`.

---

*Part of [CI/CD Integration](./00-overview.md)*
