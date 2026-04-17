# 11 — Windows Icon Embedding (go-winres)

**Version:** 2.0.0  
**Updated:** 2026-04-17  
**Reference implementation:** [gitmap-v3/gitmap/winres/winres.json](https://github.com/alimtvnetwork/gitmap-v3/blob/main/gitmap/winres/winres.json)

---

## Purpose

Embed a custom icon and version metadata into compiled Windows
binaries so they appear professional in File Explorer, taskbar,
Task Manager, and Properties → Details. Uses
[`go-winres`](https://github.com/tc-hib/go-winres), a Go tool that
generates Windows resource `.syso` files which `go build`
automatically links.

---

## How It Works

1. A `winres/` directory sits next to `main.go` containing only
   `winres.json` (the manifest).
2. Icon files live in a sibling `assets/` directory (NOT inside
   `winres/`), referenced from `winres.json` with a relative path.
3. `go-winres make` reads the manifest and produces
   `rsrc_windows_*.syso` files (one per architecture).
4. `go build` automatically links any `.syso` file it finds in the
   package directory — no extra build flags needed.
5. On non-Windows builds, `.syso` files are silently ignored.

---

## Directory Layout (reference: gitmap-v3)

```
<binary>/                            ← package directory containing main.go
├── main.go
├── go.mod
├── go.sum
├── powershell.json
├── Makefile
├── winres/
│   └── winres.json                  ← manifest only — NO icons here
├── assets/
│   ├── icon-256.png                 ← 256×256 app icon (only one needed)
│   └── icon.png                     ← optional source artwork
└── (rsrc_windows_*.syso)            ← generated at build, NOT committed
```

### Important: do NOT commit `.syso` files

The reference implementation (`gitmap-v3`) puts `*.syso` in
`.gitignore`. The build script regenerates them on every Windows
build. This avoids:

- Stale resource data when icon/manifest changes
- Binary churn in git history
- Cross-architecture confusion (amd64 vs arm64 .syso interleaving)

The build script must therefore invoke `go-winres make` BEFORE
`go build` on Windows builds.

---

## Real Manifest — `winres.json` (verbatim from gitmap-v3)

```json
{
  "RT_GROUP_ICON": {
    "APP": {
      "0000": [
        "../assets/icon-256.png"
      ]
    }
  },
  "RT_MANIFEST": {
    "#1": {
      "0409": {
        "identity": {
          "name": "<binary>",
          "version": "0.0.0.0"
        },
        "description": "<one-line description>",
        "minimum-os": "win7",
        "execution-level": "asInvoker",
        "dpi-awareness": "system",
        "ui-access": false
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
            "CompanyName":      "",
            "FileDescription":  "<binary> — <one-line description>",
            "FileVersion":      "",
            "InternalName":     "<binary>",
            "LegalCopyright":   "",
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

| Field | Purpose | gitmap-v3 value |
|-------|---------|-----------------|
| `RT_GROUP_ICON` | References icon files | `../assets/icon-256.png` |
| `RT_MANIFEST` | Windows app manifest | keyed under `#1` / `0409` (locale ID) |
| `identity.name` | Manifest identity | `gitmap` |
| `identity.version` | Manifest version | `0.0.0.0` (placeholder, real version via `-ldflags`) |
| `description` | Tooltip in File Explorer | `Git repository manager and ...` |
| `minimum-os` | Minimum Windows version | `win7` |
| `execution-level` | UAC level | `asInvoker` (NEVER `requireAdministrator` for CLI) |
| `dpi-awareness` | HiDPI rendering | `system` (gitmap's choice) |
| `ui-access` | UI Automation access | `false` |
| `RT_VERSION.fixed` | Binary version metadata | `0.0.0.0` placeholders |
| `RT_VERSION.info.0409` | English (US) locale info | empty strings — populated at build via `-ldflags` |

### Why empty strings?

Notice `CompanyName`, `FileVersion`, `LegalCopyright`, and
`ProductVersion` are empty strings in the manifest. This is
intentional — they are populated at build time so a single
`winres.json` can produce binaries for any version/year/vendor
without manifest churn.

---

## Key Naming: `APP` vs `#1` vs `0409`

The `winres.json` schema uses three different "slot" naming
conventions depending on the resource type:

| Resource | Slot key | Sub-slot | Meaning |
|----------|----------|----------|---------|
| `RT_GROUP_ICON` | `APP` | `0000` | Icon group named "APP", language-neutral |
| `RT_MANIFEST` | `#1` | `0409` | Manifest #1, en-US locale |
| `RT_VERSION` | `#1` | `0000` | Version #1, language-neutral; `info.0409` for en-US text |

`0409` is the Windows LANGID for en-US. Other locales use different
codes (e.g. `0411` for ja-JP). Most CLI tools use `0409` only.

`0000` means "no language" (language-neutral resource).

---

## Build Integration

### Prerequisite (developer / CI machine)

```bash
go install github.com/tc-hib/go-winres@latest
```

### Generate `.syso` files

Run from the package directory containing `main.go`:

```bash
go-winres make
```

This produces `rsrc_windows_amd64.syso` (and `arm64` if configured).

### Build script must regenerate before every Windows build

Because `.syso` files are not committed, `run.ps1` must invoke
`go-winres make` before `go build` on Windows:

```powershell
if ($IsWindows) {
    Push-Location $ToolDir
    try {
        Write-Step "1.5/4" "Generating Windows resources (.syso)"
        go-winres make
        if ($LASTEXITCODE -ne 0) {
            throw "go-winres make failed"
        }
    } finally {
        Pop-Location
    }
}
```

On Linux/macOS this step is skipped entirely.

---

## Embedding Real Version at Build Time

The placeholder `0.0.0.0` values in `winres.json` are overridden by
`go build -ldflags`, but `-ldflags` only patches Go variables — not
the Windows resource section. To put the real version into the
Windows file metadata, regenerate `winres.json` from a template
before each release:

```powershell
# Pseudocode — release pipeline
$tmpl = Get-Content winres.json.tmpl -Raw
$rendered = $tmpl `
    -replace '\{\{VERSION\}\}',  $version `
    -replace '\{\{COMPANY\}\}',  $company `
    -replace '\{\{COPYRIGHT\}\}', "© $year $company"
$rendered | Set-Content winres/winres.json
go-winres make
go build -ldflags "-X 'main.Version=$version'" .
```

Most projects skip this and accept `0.0.0.0` in Properties → Details
because the `<binary> version` command is the canonical version source.

---

## Constraints

- The `winres/` directory MUST live next to `main.go`, not at the
  repo root.
- `winres/` MUST contain only `winres.json` — icons live in
  `assets/`, referenced via `../assets/...`.
- `.syso` files MUST NOT be committed (add to `.gitignore`).
- The build script MUST run `go-winres make` before `go build` on
  Windows.
- Icon files MUST be at least 256×256 — Windows scales down for
  smaller sizes, but cannot scale up cleanly.
- `execution-level` MUST be `asInvoker` for CLI tools. Requesting
  elevation breaks pipe usage and confuses users.
- `dpi-awareness: system` is the conservative default; use
  `per-monitor-v2` only if the binary opens GUI windows.
- `ui-access: false` is mandatory unless the binary is a UI
  automation tool (in which case it must also be signed and
  installed in `Program Files`).

---

## Cross-References

- [04-build-scripts.md](04-build-scripts.md) §Build Step — must invoke `go-winres make` on Windows
- [12-code-signing.md](12-code-signing.md) — sign AFTER `.syso` is linked, never before
- Reference implementation: [gitmap-v3/gitmap/winres/](https://github.com/alimtvnetwork/gitmap-v3/tree/main/gitmap/winres)
- Upstream tool: <https://github.com/tc-hib/go-winres>

---

*Windows icon embedding — v2.0.0 — 2026-04-17 (reference: gitmap-v3)*
