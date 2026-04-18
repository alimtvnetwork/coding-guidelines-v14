# Git Hooks

Repo-tracked git hooks. Activated by pointing `core.hooksPath` at this
folder — no copies into `.git/hooks/`, no `husky` dependency.

## Install (one-time, per clone)

```bash
bash scripts/hooks/install-hooks.sh
```

This sets:

```
git config core.hooksPath scripts/hooks
```

## Active hooks

| Hook | What it does |
|------|--------------|
| `pre-commit` | Runs every `linter-scripts/check-*.sh` and `linter-scripts/check-*.py` guard. Blocks the commit if any guard fails. |

## Bypass

Not recommended, but available for emergencies:

```bash
git commit --no-verify
```

## Adding a new guard

Drop a `check-*.sh` or `check-*.py` script into `linter-scripts/`. The
`pre-commit` hook auto-discovers it on the next commit — no edits needed
here.
