# Version Display and Help System

**Version:** 3.1.0  
**Updated:** 2026-04-16

---

## Purpose

Define consistent patterns for version output and help systems in CLI tools. Every CLI must provide machine-parseable version output and comprehensive, structured help text. This document specifies the exact patterns and their CI/CD integration points.

---

## Version Display

### Version Constant

The version is compiled into the binary via `ldflags`:

```go
// constants/constants.go
const Version = "1.3.0"
```

Build command:

```bash
LDFLAGS="-s -w -X '<module>/constants.Version=$VERSION'"
go build -ldflags "$LDFLAGS" -o <binary> .
```

### `version` Command

The version command prints the current version and exits. It must produce **clean, machine-parseable output** on stdout (no decorations, no color):

```
$ <binary> version
1.3.0
```

Alias: `v` or `-v`

### Version at Startup

For commands that perform significant work (e.g., `scan`, `release`), print the version at the beginning:

```
$ <binary> scan

  <binary> v1.3.0

  Scanning repositories...
```

### Version at End of Operations

After long-running operations complete, print a summary that includes the version:

```
  Done. Scanned 42 repositories in 3.2s.
  <binary> v1.3.0
```

### Version Synchronization Checklist

Before every release, verify these are in sync:

1. `constants.Version` in source code
2. `CHANGELOG.md` has a matching entry
3. Release metadata file (if applicable)
4. Documentation site changelog (if applicable)
5. Git tag matches the version

---

## Help System

### Top-Level Help

When the tool is run with no arguments or with `help`, print a usage summary:

```
$ <binary>
<binary> v1.3.0 — <description>

  Usage: <binary> <command> [flags]

  Core Commands:
    scan        Scan and index Git repositories
    clone       Clone repositories from your account
    ls          List indexed repositories

  Release Commands:
    release     Create a versioned release
    deploy      Deploy the latest build

  Utility Commands:
    config      View or edit configuration
    doctor      Run system health checks
    version (v) Print version

  Run '<binary> <command> --help' for details on any command.
```

### Command-Level Help

Each command responds to `--help` or `-h` with structured documentation:

```
$ <binary> scan --help

  <binary> scan — Scan and index Git repositories

  Alias: s

  Usage:
    <binary> scan [flags]

  Flags:
    --path <dir>     Root directory to scan (default: current directory)
    --depth <n>      Maximum directory depth (default: 5)
    --verbose        Show detailed output

  Examples:
    $ <binary> scan
    $ <binary> scan --path ~/projects --depth 3
    $ <binary> scan --verbose

  See Also:
    ls    — List indexed repositories
    clone — Clone repositories
```

### Help Text Source

Help text is embedded from Markdown files using `go:embed`:

```go
//go:embed helptext/help-scan.md
var helpScan string
```

Each help file follows this structure:

```markdown
# <binary> scan

**Alias:** `s`

## Usage

    <binary> scan [flags]

## Flags

| Flag | Description |
|------|-------------|
| `--path <dir>` | Root directory to scan (default: current directory) |
| `--depth <n>` | Maximum directory depth (default: 5) |

## Examples

    $ <binary> scan
    $ <binary> scan --path ~/projects --depth 3

## See Also

- ls — List indexed repositories
- clone — Clone repositories
```

### Help File Constraints

- Maximum 120 lines per file
- 2–3 realistic examples per command
- Examples show 3–8 lines of terminal simulation
- Standard headers: Alias, Usage, Flags, Examples, See Also
- Stored in `helptext/` directory, embedded via `go:embed`

---

## Integration with CI/CD

### Version in CI Builds

CI builds use `dev-<sha>` versioning:

```bash
VERSION="dev-${GITHUB_SHA::10}"
```

Release builds use the semantic version:

```bash
VERSION="${GITHUB_REF_NAME#release/}"
```

Both are injected via the same `-X` ldflag.

### Version in Release Body

The release pipeline includes the version in the GitHub Release body and verifies it matches the tag:

```yaml
- name: Verify version
  run: |
    BINARY_VERSION=$(./dist/<binary>-*-linux-amd64 version 2>/dev/null || echo "unknown")
    TAG_VERSION="${{ steps.version.outputs.version }}"
    if [ "v$BINARY_VERSION" != "$TAG_VERSION" ]; then
      echo "::error::Version mismatch: binary=$BINARY_VERSION tag=$TAG_VERSION"
      exit 1
    fi
```

### Help in Automated Tests

Test that every command's `--help` flag produces output without errors:

```go
func TestAllCommandsHaveHelp(t *testing.T) {
    commands := []string{"scan", "clone", "ls", "release", "config", "doctor"}
    for _, cmd := range commands {
        t.Run(cmd, func(t *testing.T) {
            // Verify help text is non-empty and contains expected headers
        })
    }
}
```

---

## Terminal Output Samples

### Version

```
$ <binary> version
1.3.0

$ <binary> v
1.3.0
```

### Help (no args)

```
$ <binary>
<binary> v1.3.0 — <description>

  Usage: <binary> <command> [flags]

  Core Commands:
    scan   (s)   Scan and index Git repositories
    clone  (cl)  Clone repositories from your account
    ls     (l)   List indexed repositories

  Release Commands:
    release (r)   Create a versioned release
    deploy  (dp)  Deploy the latest build

  Utility Commands:
    config  (cfg) View or edit configuration
    doctor  (dr)  Run system health checks
    update  (up)  Self-update to the latest version

  Info Commands:
    version (v)   Print version
    help          Show this help message

  Run '<binary> <command> --help' for details on any command.
```

### Unknown Command

```
$ <binary> foobar

  Error: unknown command "foobar"

  Run '<binary> help' for a list of available commands.
```

---

## Constraints

- `version` output must be a single line with no prefix (e.g., `1.3.0`, not `version: 1.3.0`)
- Help text must work in 80-column terminals (no line wrapping issues)
- All command aliases are shown in parentheses: `scan (s)`
- Group commands logically: Core, Release, Tooling, Info
- Help text uses 2-space indentation for visual hierarchy

---

## Cross-References

- [Changelog Integration](./09-changelog-integration.md) — How changelogs are tracked and extracted
- [Terminal Output Standards](./12-terminal-output-standards.md) — Output formatting rules
- [Shared Conventions](./01-shared-conventions.md) — Version resolution patterns

---

*Version and help — v3.1.0 — 2026-04-11*
