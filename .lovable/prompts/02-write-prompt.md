# Write Memory Prompt

**Version:** 3.3.0  
**Updated:** 2026-04-16

---

## Purpose

This is the mandatory end-of-session memory persistence protocol. When someone says **"write memory"**, **"end memory"**, or **"update memory"**, execute this prompt.

---

## Core Principle

> **The memory system is the project's brain.** If you did something and didn't write it down, it didn't happen. If something is pending and you didn't record it, it will be lost. Write memory as if the next AI has amnesia — because it does.

---

## Phase 1 — Audit Current State

Before writing anything, take inventory. Answer these questions internally:

### What was done this session?

- List every task completed (features, fixes, refactors)
- List every file created, modified, or deleted
- List every decision made and why

### What is still pending?

- List tasks that were started but not finished
- List tasks that were discussed but not started
- List blockers or dependencies that prevented completion

### What was learned?

- New patterns or conventions discovered
- Gotchas or edge cases encountered
- User preferences expressed (explicitly or implicitly)

### What went wrong?

- Bugs encountered and their root causes
- Approaches that failed and why
- Things that should never be repeated

---

## Phase 2 — Update Memory Files

### Target: `.lovable/memory/`

Update institutional knowledge based on Phase 1 audit.

#### Step 2.1 — Read the current index

```
Read: .lovable/memory/index.md
```

Understand what memory files already exist. Do not create duplicates.

#### Step 2.2 — Update existing memory files

For each existing memory file affected by this session's work:

- Open the file
- Add new information in the appropriate section
- Mark completed items as done (use `[x]` or `✅`)
- Preserve all existing content — **never truncate or overwrite unrelated entries**

#### Step 2.3 — Create new memory files (if needed)

If this session produced knowledge that doesn't fit any existing file:

1. Create a new file in `.lovable/memory/` using the naming convention: `kebab-case-name.md` in the appropriate subfolder
2. **Immediately update** `.lovable/memory/index.md` to include the new file

#### Step 2.4 — Update workflow state

```
Target: .lovable/memory/workflow/
```

Update workflow files to reflect:

- What phases/milestones are **done**
- What is **in progress**
- What is **next**

Use clear status markers:

| Status | Marker |
|--------|--------|
| Done | `✅ Done` |
| In Progress | `🔄 In Progress` |
| Pending | `⏳ Pending` |
| Blocked | `🚫 Blocked — [reason]` |
| Avoid or Skip | `🚫 Blocked — [avoid]` |

---

## Phase 3 — Update Plans & Suggestions

### 3A — Plans

```
Target: .lovable/plan.md
```

- Update task statuses (done / in progress / pending)
- Add any new tasks discovered during this session
- If a plan item is **fully complete**, move it to a `## Completed` section at the bottom (do not delete it)
- Keep the plan file as the **single source of truth** for project roadmap

### 3B — Suggestions

```
Target: .lovable/suggestions.md
```

Maintain a **single file** for all suggestions. Structure:

```markdown
## Active Suggestions

### [Suggestion Title]
- **Status:** Pending | In Review | Approved | Rejected
- **Priority:** High | Medium | Low
- **Description:** What and why
- **Added:** [date or session reference]

## Implemented Suggestions

### [Suggestion Title]
- **Implemented:** [date or session reference]
- **Notes:** Any relevant details about the implementation
```

When a suggestion is implemented:

1. Move it from `## Active Suggestions` to `## Implemented Suggestions`
2. Add implementation notes
3. Reference the relevant file or task if applicable

---

## Phase 4 — Update Issues

### 4A — Pending Issues

```
Target: .lovable/pending-issues/
```

For every **unresolved** bug or issue, create or update a file:

**Filename:** `nn-short-description.md`

**Required structure:**

```markdown
# [Issue Title]

## Description
What is broken or unexpected.

## Root Cause
Why it happens (if known). If unknown, write "Under investigation."

## Steps to Reproduce
1. Step one
2. Step two
3. Expected vs actual behavior

## Attempted Solutions
- [ ] Approach 1 — [result]
- [ ] Approach 2 — [result]

## Priority
High | Medium | Low

## Blocked By (if applicable)
What dependency or decision is needed before this can be fixed.
```

### 4B — Solved Issues

```
Target: .lovable/solved-issues/
```

When an issue is **resolved**, move it from `pending-issues/` to `solved-issues/` and add:

```markdown
## Solution
What fixed it.

## Iteration Count
How many attempts it took.

## Learning
What we learned from this issue.

## What NOT to Repeat
Specific anti-patterns or mistakes to avoid in the future.
```

### 4C — Strictly Avoided Patterns

```
Target: .lovable/strictly-avoid.md
```

If a solved issue revealed a pattern that must **never** be used again, add it here:

```markdown
- **[Pattern Name]:** [Why it's forbidden]. See: `.lovable/solved-issues/nn-filename.md`
```

Also create a detailed file in `.lovable/strictly-avoid/` for each rule.

---

## Phase 5 — Consistency Validation

### 5.1 — Index Integrity

Verify that **every file** in `.lovable/memory/` (including subfolders) is listed in `index.md`. If not, add it.

### 5.2 — Cross-Reference Check

- Every task marked `✅ Done` in `plan.md` should have corresponding evidence
- Every item in `pending-issues/` should be reflected in `plan.md` or `suggestions.md` if actionable
- No file should exist in both `pending-issues/` and `solved-issues/`

### 5.3 — Orphan Check

- No memory file should exist without an index entry
- No suggestion should be marked "Implemented" without evidence
- No issue should be in `solved-issues/` without a `## Solution` section

### 5.4 — Final Confirmation

After all checks pass, respond with:

```
✅ Memory update complete.

Session Summary:
- Tasks completed: [X]
- Tasks pending: [Y]
- New memory files created: [Z]
- Issues resolved: [N]
- Issues opened: [M]
- Suggestions added: [S]
- Suggestions implemented: [T]

Files modified:
- [list every file touched during this memory update]

Inconsistencies found and fixed:
- [list any, or "None"]

The next AI session can pick up from: [describe the current state and next logical step]
```

---

## Anti-Corruption Rules

1. **Never delete history** — Mark items as done, move them to completed sections. Never remove them entirely.
2. **Never overwrite blindly** — Always read a file before writing to it. Preserve existing content.
3. **Never leave orphans** — Every file must be indexed. Every reference must resolve.
4. **Never split what should be unified** — Plans and suggestions each live in ONE file. Do not fragment.
5. **Never mix states** — An issue cannot be both pending and solved. A task cannot be both done and in progress.
6. **Never skip the index update** — If you create a file in `.lovable/memory/`, update `index.md` in the same operation.
7. **Never assume the next AI knows anything** — Write as if explaining to a stranger who has only the files to go on.

---

*Write memory prompt — v3.3.0 — 2026-04-16*
