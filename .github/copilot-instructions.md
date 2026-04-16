# GitHub Copilot Instructions — Coding Guidelines Integration

## Primary Reference

Read [`llm.md`](../llm.md) in the project root before generating or reviewing any code. It maps the full repository structure and provides prioritized loading order for all coding guidelines.

## CODE RED Rules (Automatic Rejection)

| # | Rule |
|---|------|
| 1 | Zero nested `if` — flatten with early returns |
| 2 | Booleans must start with `is`/`has`/`can`/`should`/`was`/`will` |
| 3 | No magic strings — use enum/typed constants |
| 4 | Max 15 lines per function |
| 5 | No boolean flag parameters — split into named methods |
| 6 | Go: `apperror.Result[T]` not `(T, error)` |
| 7 | Go: `apperror.New()`/`Wrap()` not `fmt.Errorf()` |
| 8 | Go: `type Variant byte` + `iota`, not string enums |
| 9 | TS: `Promise.all()` for independent async calls |
| 10 | PHP: `->isEqual()` for enum comparison |

## Style Rules

- Blank line before `return`/`throw` when preceded by statements
- No `else` after `return`/`throw`/`continue`/`break`
- Blank line after closing `}` when followed by code

## Detailed Specs

Load from `spec/02-coding-guidelines/06-ai-optimization/`:

1. `04-condensed-master-guidelines.md` — sub-200-line distillation of all rules
2. `01-anti-hallucination-rules.md` — 34 rules preventing common AI mistakes
3. `02-ai-quick-reference-checklist.md` — 72-check validation checklist
4. `03-common-ai-mistakes.md` — top 15 mistakes with before/after examples

## Linters & Validators

| Tool | Path |
|------|------|
| ESLint Plugin | `eslint-plugins/coding-guidelines/index.js` |
| Go Linter | `linters/golangci-lint/.golangci.yml` |
| SonarQube | `linters/sonarqube/` |
| StyleCop (C#) | `linters/stylecop/` |
| PHP_CodeSniffer | `linters/phpcs/coding-guidelines-ruleset.xml` |
| Python Validator | `scripts/validate-guidelines.py` |
| Go Validator | `scripts/validate-guidelines.go` |
