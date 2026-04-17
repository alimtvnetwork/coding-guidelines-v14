# 11 — Windows Icon Embedding (go-winres)

**Version:** 1.0.0  
**Updated:** 2026-04-17

---

## Purpose

Embed a custom icon and version metadata into compiled Windows
binaries so they appear professional in File Explorer, taskbar,
Task Manager, and Properties → Details. Uses
[`go-winres`](https://github.com/tc-hib/go-winres), a Go tool that
generates Windows resource `.syso` files automatically linked by
`go build`.

---

## How It Works

1. A `winres/` directory sits next to `main.go` containing the
   manifest (`winres.json`) and icon files.
2. `go-winres make` reads the manifest and produces
   `rsrc_windows_*.syso` files (one per architecture).
3. `go build` automatically links any `.syso` file it finds in the
   package directory — no extra build flags needed.
4. On non-Windows builds, `.syso` files are silently ignored.

---

## Directory Layout

```
<binary>/
├── main.go
├── winres/
│   ├── winres.json          ← Metadata manifest
│   ├── icon.png             ← 256×256+ app icon (PNG or ICO)
│   └── icon16.png           ← 16×16 small icon (optional)
├── rsrc_windows_amd64.syso  ← Generated, COMMITTED to repo
└── rsrc_windows_arm64.syso  ← Generated, COMMITTED to repo
```

**Critical:** the `.syso` files MUST be committed to the repository.
This means a fresh clone can `go build` without requiring
`go-winres` to be installed on the build machine.

---

## Manifest — `winres.json`

```json
{
  "RT_GROUP_ICON": {
    "APP": {
      "0000": ["icon.png", "icon16.png"]
    }
  },
  "RT_MANIFEST": {
    "APP": {
      "0000": {
        "identity": {
          "name": "<binary>",
          "version": "0.0.0.0"
        },
        "description": "<binary> — <one-line description>",
        "minimum-os": "win7",
        "execution-level": "asInvoker",
        "dpi-awareness": "per-monitor-v2",
        "use-common-controls": true
      }
    }
  },
  "RT_VERSION": {
    "#1": {
      "0000": {
        "fixed": {
          "file_version":    "0.0.0.0",
          "product_version": "0.0.0.0"
        },
        "info": {
          "0409": {
            "CompanyName":      "Riseup Asia LLC",
            "FileDescription":  "<binary> CLI",
            "InternalName":     "<binary>",
            "LegalCopyright":   "© 2026 Riseup Asia LLC",
            "OriginalFilename": "<binary>.exe",
            "ProductName":      "<binary>",
            "ProductVersion":   ""
          }
        }
      }
    }
  }
}
```

### Field reference

| Field | Purpose |
|-------|---------|
| `RT_GROUP_ICON` | References icon files (PNG or ICO, multiple sizes) |
| `RT_MANIFEST` | Windows app manifest (DPI awareness, elevation level) |
| `RT_VERSION` | Version info shown in Properties → Details tab |
| `CompanyName` | Displayed in file properties |
| `FileDescription` | Tooltip text in File Explorer |
| `ProductName` | Shown in Task Manager process list |
| `execution-level` | `asInvoker` — never request elevation for a CLI tool |

---

## Build Integration

### Prerequisite (developer machine only)

```bash
go install github.com/tc-hib/go-winres@latest
```

End users of the binary do not need this.

### Generate `.syso` files

Run from the package directory containing `main.go`:

```bash
go-winres make
```

This produces `rsrc_windows_amd64.syso` (and `arm64` if configured).

### Regeneration triggers

Regenerate `.syso` files (and re-commit) when any of these change:

- The icon files (`icon.png`, `icon16.png`).
- Any field in `winres.json`.
- The major or minor version (file_version / product_version fields
  if you keep them in sync — many projects leave them as `0.0.0.0`
  and let `-ldflags -X` carry the real version).

---

## Build Script Hook

`run.ps1` and `run.sh` SHOULD detect a stale `.syso` and warn the
developer (but never auto-regenerate, to keep builds reproducible):

```powershell
$icon = Join-Path $WinresDir "icon.png"
$syso = Join-Path $ToolDir "rsrc_windows_amd64.syso"
if ((Test-Path $icon) -and (Test-Path $syso)) {
    if ((Get-Item $icon).LastWriteTime -gt (Get-Item $syso).LastWriteTime) {
        Write-Warn "icon.png is newer than .syso — run: go-winres make"
    }
}
```

---

## Constraints

- The `winres/` directory MUST live next to `main.go`, not at the
  repo root, so `go-winres make` resolves it without flags.
- `.syso` files MUST be committed. They are platform-specific
  generated files but treated as source-of-truth for builds.
- Icon files MUST be at least 256×256 — Windows scales down for
  smaller sizes, but cannot scale up cleanly.
- `execution-level` MUST be `asInvoker` for CLI tools. Requesting
  elevation breaks pipe usage and confuses users.
- DPI awareness SHOULD be `per-monitor-v2` to render crisply on
  HiDPI displays.

---

## Cross-References

- [04-build-scripts.md](04-build-scripts.md) §Build Step — picks up `.syso` automatically
- [12-code-signing.md](12-code-signing.md) — signing the resulting `.exe`
- Upstream: <https://github.com/tc-hib/go-winres>

---

*Windows icon embedding — v1.0.0 — 2026-04-17*
