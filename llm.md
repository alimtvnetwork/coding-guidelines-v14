# LLM Knowledge Base — Coding Guidelines Specification System

> **Purpose:** This file is the single entry point for any AI/LLM model to understand, navigate, and enforce the coding guidelines in this repository. Feed this file as context to enable any AI to act as a code reviewer, code generator, or specification contributor aligned with these standards.
>
> **Author:** Md. Alim Ul Karim — Chief Software Engineer, [Riseup Asia LLC](http://riseup-asia.com/)

---

## 🧠 How to Consume This Repository

### Step 1: Understand the Structure

```
spec/                                          # All specifications live here
├── 01-spec-authoring-guide/                   # How specs are written (meta-rules)
├── 02-coding-guidelines/
│   └── 03-coding-guidelines-spec/
│       ├── 01-cross-language/                 # Rules shared across ALL languages
│       ├── 02-go-specific/                    # Go-only rules
│       ├── 03-csharp-specific/                # C#-only rules
│       ├── 04-php-specific/                   # PHP-only rules
│       ├── 05-rust-specific/                  # Rust-only rules
│       └── 06-ai-optimization/                # AI-specific resources ← START HERE
├── 03-error-manage-spec/
│   └── 04-error-manage-spec/                  # Error handling architecture
├── health-dashboard.md                        # Global health tracking
└── spec-index.md                              # Searchable index of all 285+ files
```

### Step 2: Load Priority Files (Context Window Optimization)

Load these files **in this order** for maximum effectiveness with minimum tokens:

| Priority | File | Tokens (~) | Purpose |
|----------|------|-----------|---------|
| 🔴 1 | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/04-condensed-master-guidelines.md` | ~800 | **START HERE** — Sub-200-line distillation of ALL rules |
| 🔴 2 | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/01-anti-hallucination-rules.md` | ~1000 | 34 rules preventing common AI code generation mistakes |
| 🟡 3 | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/02-ai-quick-reference-checklist.md` | ~600 | 72-check pre-output validation checklist |
| 🟡 4 | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/03-common-ai-mistakes.md` | ~1400 | Top 15 AI mistakes with ❌/✅ before/after examples |
| 🟢 5 | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/05-enum-naming-quick-reference.md` | ~900 | Cross-language enum cheat sheet (Go/TS/PHP) |

**For code review tasks:** Load priorities 1–3.
**For code generation tasks:** Load priorities 1–4.
**For enum-heavy work:** Also load priority 5.

### Step 3: Language-Specific Context

After loading the condensed guidelines, add language-specific files only for the language you're working with:

| Language | Directory | Key Files |
|----------|-----------|-----------|
| **Go** | `spec/02-coding-guidelines/03-coding-guidelines-spec/02-go-specific/` | Error handling (`apperror`), enum patterns, naming |
| **TypeScript** | `spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/` | Most rules are cross-language; TS has no separate folder |
| **C#** | `spec/02-coding-guidelines/03-coding-guidelines-spec/03-csharp-specific/` | PascalCase conventions, LINQ patterns |
| **PHP** | `spec/02-coding-guidelines/03-coding-guidelines-spec/04-php-specific/` | WordPress patterns, `->isEqual()` for enums |
| **Rust** | `spec/02-coding-guidelines/03-coding-guidelines-spec/05-rust-specific/` | `Result<T, E>` patterns, snake_case conventions |

---

## 🔴 CODE RED Rules (Zero Tolerance)

These 12 rules cause **automatic PR rejection**. Any AI generating or reviewing code MUST enforce these:

| # | Rule ID | Rule | Scope |
|---|---------|------|-------|
| 1 | CODE-RED-001 | **Zero nested `if`** — flatten with early returns or named booleans | All |
| 2 | CODE-RED-002 | **Boolean naming** — every boolean MUST start with `is`, `has`, `can`, `should`, `was`, or `will` | All |
| 3 | CODE-RED-003 | **No magic strings** — all string literals in comparisons must be enum/typed constants | All |
| 4 | CODE-RED-004 | **Max 15 lines per function** — extract into named helpers | All |
| 5 | CODE-RED-005 | **No `fmt.Errorf()`** — use `apperror.New()` / `apperror.Wrap()` only | Go |
| 6 | CODE-RED-006 | **No `(T, error)` returns** — use `apperror.Result[T]` | Go |
| 7 | CODE-RED-007 | **No string-based enums** — use `type Variant byte` with `iota` | Go |
| 8 | CODE-RED-008 | **No `===` for PHP enum comparison** — use `->isEqual()` | PHP |
| 9 | CODE-RED-009 | **`Promise.all` for independent async calls** — no sequential `await` | TypeScript |
| 10 | CODE-RED-010 | **No boolean flag parameters** — split into two named methods | All |
| 11 | CODE-RED-011 | **No magic numbers** — all numeric literals in logic must be named constants | All |
| 12 | CODE-RED-012 | **Immutable by default** — `const` over `let`/`var`, no post-construction mutation | All |

---

## ⚠️ Style Rules (Warnings)

| Rule ID | Rule | Scope |
|---------|------|-------|
| STYLE-001 | Blank line before `return`/`throw` when preceded by statements | All |
| STYLE-002 | No `else` after `return`/`throw`/`continue`/`break` | All |
| STYLE-003 | Blank line after closing `}` when followed by code | All |
| STYLE-004 | Blank line before `if`/`else if` when preceded by a statement | All |

---

## 🛠️ Automated Enforcement Tools

This repo includes ready-to-use linter configs for CI/CD integration:

| Tool | Config File | Languages | How to Use |
|------|-------------|-----------|------------|
| **ESLint Plugin** | `eslint-plugins/coding-guidelines/index.js` | TypeScript, JavaScript | Already wired in `eslint.config.js` |
| **Go Linter** | `linters/golangci-lint/.golangci.yml` | Go | `golangci-lint run` |
| **SonarQube** | `linters/sonarqube/sonar-project.properties` + `coding-guidelines-profile.xml` | All | Import profile in SonarQube |
| **StyleCop** | `linters/stylecop/.stylecop.json` + `coding-guidelines.ruleset` | C# | Add to `.csproj` |
| **PHP_CodeSniffer** | `linters/phpcs/coding-guidelines-ruleset.xml` | PHP | `phpcs --standard=linters/phpcs/coding-guidelines-ruleset.xml` |
| **Python/Go Validator** | `scripts/validate-guidelines.py` / `scripts/validate-guidelines.go` | All | `python3 scripts/validate-guidelines.py --path src` |

---

## 📋 AI Pre-Output Checklist

Before outputting any code, run through this abbreviated checklist:

```
□ No nested if statements anywhere
□ All booleans start with is/has/can/should/was/will
□ No `!` negation on booleans — use antonym instead (!IsActive → IsBlocked, !HasFile → IsFileMissing)
□ No raw string literals in comparisons (use enums/constants)
□ No magic numbers in logic (use named constants: const VAT_RATE = 0.2)
□ Every variable assigned exactly once (const over let/var)
□ No post-construction object mutation (use constructors/struct literals)
□ TS/JS: Prefer class over loose exports when state is shared
□ Every function ≤ 15 lines
□ Blank line before return/throw
□ No else after return
□ Go: apperror.Result[T] not (T, error)
□ Go: apperror.New()/Wrap() not fmt.Errorf()
□ Go: byte + iota enums, not string enums
□ TS: Promise.all() for independent awaits
□ PHP: ->isEqual() for enum comparison
□ No boolean parameters — split into named methods
□ No any/interface{}/object returns — use generics
```

---

## 🏗️ Error Handling Architecture

The error system uses a **response envelope** pattern:

```
Request → Go Backend → WordPress REST API (riseup-asia-uploader)
                ↓                    ↓
         apperror.Result[T]    PHP EnvelopeBuilder
                ↓                    ↓
         Unified JSON Envelope with dual stack traces
```

Key files:
- Go: `apperror` package spec → `spec/03-error-manage-spec/04-error-manage-spec/02-error-architecture/06-apperror-package/`
- Error codes: `spec/03-error-manage-spec/04-error-manage-spec/03-error-code-registry/`
- Response envelope: `spec/03-error-manage-spec/04-error-manage-spec/02-error-architecture/05-response-envelope/`

---

## 📐 Spec Authoring Rules (For Contributing)

If the AI is generating or modifying spec files:

1. **Folder naming:** kebab-case with numeric prefix (e.g., `04-error-manage-spec/`)
2. **Required files:** Every folder MUST have `00-overview.md` and `99-consistency-report.md`
3. **Max file length:** 300 lines (soft limit 400)
4. **Cross-references:** Always relative paths, always include `.md` extension
5. **Metadata:** Every `00-overview.md` must include AI Confidence + Ambiguity scores
6. **Health Score:** 4 criteria × 25% — tracked in `spec/health-dashboard.md`

---

## 🔗 Quick Reference Links

| Resource | Path |
|----------|------|
| Root README | `readme.md` |
| Health Dashboard | `spec/health-dashboard.md` |
| Spec Index (285 files) | `spec/spec-index.md` |
| Condensed Guidelines | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/04-condensed-master-guidelines.md` |
| Anti-Hallucination Rules | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/01-anti-hallucination-rules.md` |
| Error Code Registry | `spec/03-error-manage-spec/04-error-manage-spec/03-error-code-registry/` |
| ESLint Plugin | `eslint-plugins/coding-guidelines/index.js` |
| Python Validator | `scripts/validate-guidelines.py` |
| Go Validator | `scripts/validate-guidelines.go` |

---

## 💡 Usage Scenarios

### "I want to review code"
1. Load `04-condensed-master-guidelines.md`
2. Check every function against the 10 CODE RED rules
3. Use the pre-output checklist above
4. Flag violations with the rule ID (e.g., `CODE-RED-001`)

### "I want to generate code"
1. Load `04-condensed-master-guidelines.md` + `01-anti-hallucination-rules.md`
2. Load language-specific files for the target language
3. Generate code following all rules
4. Self-validate against `02-ai-quick-reference-checklist.md`

### "I want to add a new spec"
1. Read `spec/01-spec-authoring-guide/00-overview.md`
2. Follow the folder structure, naming, and metadata conventions
3. Create `00-overview.md` and `99-consistency-report.md`
4. Update `spec/spec-index.md` and `spec/health-dashboard.md`

### "I want to set up CI linting"
1. Pick the relevant linter config from `linters/`
2. Copy to your project and integrate into CI pipeline
3. Use `scripts/validate-guidelines.py` or `.go` as a catch-all validator
4. See `scripts/run.sh` or `scripts/run.ps1` for automated pull + validate

---

> **This file is the AI entry point.** When feeding this repository to any LLM (ChatGPT, Claude, Gemini, Copilot, Cursor, etc.), start with this file. It provides the map; the linked files provide the territory.
