# Binary Icon & Windows Resource Embedding

**Version:** 3.1.0  
**Updated:** 2026-04-16

---

## Purpose

Define how to brand CLI binaries with a custom icon using `go-winres`, ensuring the binary shows the correct icon in File Explorer, Task Manager, and the taskbar. Windows executables can embed icons, version info, and manifests into the binary using resource files (`.syso`).

---

## Tool: `go-winres`

[go-winres](https://github.com/tc-hib/go-winres) generates `.syso` resource files that the Go compiler automatically links into Windows binaries.

### Installation (CI)

Pin to an exact version in CI for reproducibility:

```bash
go install github.com/tc-hib/go-winres@v0.3.3
```

---

## Configuration

### `winres.json`

Place `winres.json` in the Go module root (next to `go.mod`):

```json
{
  "RT_GROUP_ICON": {
    "APP": {
      "0000": [
        "assets/icon.png"
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
        "description": "<description>",
        "minimum-os": "win7",
        "execution-level": "asInvoker",
        "dpi-awareness": "system"
      }
    }
  },
  "RT_VERSION": {
    "#1": {
      "0000": {
        "fixed": {
          "file_version": "0.0.0.0",
          "product_version": "0.0.0.0"
        },
        "info": {
          "0409": {
            "CompanyName": "<company>",
            "FileDescription": "<binary> -- <description>",
            "InternalName": "<binary>",
            "OriginalFilename": "<binary>.exe",
            "ProductName": "<binary>",
            "ProductVersion": "<version>"
          }
        }
      }
    }
  }
}
```

### Icon File

- Place the icon at `assets/icon.png` (relative to the module root)
- Minimum size: 256x256 PNG with transparency
- `go-winres` auto-generates all required sizes (16, 32, 48, 64, 128, 256)
- Use a distinct, recognizable design that works at 16x16

### Version Injection

The version fields in `winres.json` use placeholder values (`0.0.0.0`). At build time, override them with the actual release version:

```bash
go-winres make --product-version "$VERSION" --file-version "$VERSION"
```

---

## Build Integration

### Local Build

```bash
# 1. Generate .syso resource file
go-winres make --product-version "1.3.0" --file-version "1.3.0"

# 2. Build as normal — Go automatically links the .syso file
go build -o <binary>.exe .
```

### CI Pipeline Step

Add before the binary build step, only for Windows targets:

```yaml
- name: Generate Windows resources
  working-directory: <module-dir>
  run: |
    go install github.com/tc-hib/go-winres@v0.3.3
    VERSION="${{ steps.version.outputs.version }}"
    CLEAN_VERSION="${VERSION#v}"
    go-winres make --product-version "$CLEAN_VERSION" --file-version "$CLEAN_VERSION"
```

The generated `rsrc_windows_*.syso` files are picked up automatically by `go build` when `GOOS=windows`. They are ignored for Linux/macOS builds.

### Multiple Binaries

If the project has multiple binaries (e.g., main tool + updater), each needs its own `winres.json` and icon in its module directory:

```
<binary>/
    winres.json
    assets/icon.png
<binary>-updater/
    winres.json
    assets/icon-updater.png
```

Run `go-winres make` in each module directory before building.

---

## What Gets Embedded

| Resource | Effect |
|----------|--------|
| `RT_GROUP_ICON` | Icon shown in File Explorer, taskbar, Task Manager |
| `RT_MANIFEST` | DPI awareness, execution level, OS compatibility |
| `RT_VERSION` | "Properties → Details" tab: version, description, product name |

---

## Terminal Output

When the release pipeline generates resources:

```
  Generating Windows resources...
    Version: 1.3.0
    Icon:    assets/icon.png (256x256, transparent)
  Generated: rsrc_windows_amd64.syso
  Generated: rsrc_windows_arm64.syso
```

---

## Verification

After building, verify the icon is embedded:

1. **File Explorer**: The `.exe` should show the custom icon instead of the default Windows executable icon
2. **Right-click → Properties → Details**: Should show the product name, version, and description
3. **Task Manager**: Running process should display the custom icon

### CI Verification (Optional)

```bash
# Check that .syso files were generated
ls -la rsrc_windows_*.syso
```

---

## Constraints

- `go-winres` version is pinned in CI — never use `@latest`
- Icon PNG must be at least 256x256 with transparency
- `.syso` files must NOT be committed to Git — they are generated at build time
- Add `*.syso` to `.gitignore`
- Version in `winres.json` is a placeholder — always override at build time

---

## Cross-References

- [Shared Conventions](./01-shared-conventions.md) — Tool version pinning rules
- [Go Binary Release Pipeline](./02-go-binary-deploy/02-release-pipeline.md) — Where icon embedding fits in the release flow
- [Code Signing](./05-code-signing.md) — Signing happens after icon embedding, before compression

---

*Binary icon branding — v3.1.0 — 2026-04-11*
