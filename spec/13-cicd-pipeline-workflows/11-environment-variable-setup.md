# Environment Variable Setup

**Version:** 3.1.0  
**Updated:** 2026-04-16

---

## Purpose

Define an `env` command that manages persistent, cross-platform environment variables and PATH entries. The command allows users to define a custom drive or directory (e.g., `E:\tools` or `/opt/tools`) where the tool is installed, and ensures the environment variable is always set — automatically registering it if missing.

This is particularly useful for portable installations where the binary lives on a non-standard drive or path, and the user needs the system to "just work" without manual `PATH` or environment variable configuration.

---

## Core Concept

```
User specifies: E:\<binary> (or /opt/<binary>)
Tool ensures:   <BINARY>_HOME=E:\<binary> is set persistently
                E:\<binary> is in PATH if not already present
```

If the environment variable is already set and valid → no action taken.
If the environment variable is missing or points to a stale path → auto-register it.

---

## Command Interface

```
<binary> env                        # Show all managed variables
<binary> env set <key> <value>      # Set a persistent environment variable
<binary> env remove <key>           # Remove a managed environment variable
<binary> env path add <dir>         # Add a directory to PATH persistently
<binary> env path remove <dir>      # Remove a directory from PATH
<binary> env home <dir>             # Set <BINARY>_HOME and add to PATH
<binary> env doctor                 # Verify all managed variables are active
```

### Alias: `ev`

---

## `env home` — Drive/Directory Setup

This is the primary power feature. The user specifies where the tool lives:

```
$ <binary> env home E:\<binary>
```

This does:

1. Validates the directory exists (or creates it with confirmation)
2. Sets `<BINARY>_HOME=E:\<binary>` persistently
3. Adds `E:\<binary>` to PATH if not already present
4. Records the registration in `env-registry.json`
5. Prints activation command

### Terminal Output

```
$ <binary> env home E:\<binary>

  Setting <BINARY>_HOME...

    [+] <BINARY>_HOME = E:\<binary>

  Registering PATH...

    [+] Windows Registry (User PATH)
    [+] PowerShell profile
    [=] Git Bash profile (already registered)

  ============================================
  Environment configured!

  To activate in this session:

    $env:<BINARY>_HOME = "E:\<binary>"
    $env:Path = "E:\<binary>;" + $env:Path

  Or restart your terminal.
  ============================================
```

### Auto-Registration on Startup

When the tool starts, it checks if `<BINARY>_HOME` is set. If not, and if the tool can determine its own location, it auto-registers:

```go
func ensureHomeEnv() {
    home := os.Getenv("<BINARY>_HOME")
    if home != "" && dirExists(home) {
        return // Already configured and valid
    }

    // Resolve from binary location
    binaryDir := resolveBinaryDir()
    if binaryDir == "" {
        return
    }

    // Auto-register
    setEnvPersistent("<BINARY>_HOME", binaryDir)
    addToPath(binaryDir)
    fmt.Printf("  Auto-configured <BINARY>_HOME=%s\n", binaryDir)
}
```

---

## Platform-Specific Persistence

### Windows

Environment variables are set via the Windows Registry:

```go
// User-level variable
key, _ := registry.OpenKey(registry.CURRENT_USER, `Environment`, registry.SET_VALUE)
key.SetStringValue("<BINARY>_HOME", value)

// Notify the system of the change
syscall.SendMessage(syscall.HWND_BROADCAST, syscall.WM_SETTINGCHANGE, 0, "Environment")
```

PATH is updated in both:
- Registry (`HKCU\Environment\Path`)
- PowerShell profile (`$PROFILE`)
- Git Bash profiles (`~/.bashrc`, `~/.bash_profile`)

### Unix (Linux / macOS)

Environment variables are persisted by writing to shell profiles:

```bash
# Appended to ~/.bashrc, ~/.zshrc, etc.
export <BINARY>_HOME="/opt/<binary>"  # <binary>-env
```

The marker comment (`# <binary>-env`) enables idempotent updates and clean removal.

### Shell Override Flag

```
<binary> env set KEY VALUE --shell bash   # Only write to .bashrc
<binary> env set KEY VALUE --shell zsh    # Only write to .zshrc
```

---

## Environment Registry

The tool maintains an `env-registry.json` file to track all managed variables:

```json
{
  "variables": [
    {
      "key": "<BINARY>_HOME",
      "value": "E:\\<binary>",
      "createdAt": "2026-04-09T14:30:00Z",
      "platforms": ["registry", "powershell-profile", "git-bash"]
    }
  ],
  "pathEntries": [
    {
      "directory": "E:\\<binary>",
      "createdAt": "2026-04-09T14:30:00Z"
    }
  ]
}
```

This registry enables:
- `env remove` to know which profiles to clean
- `env doctor` to verify all registrations are still active
- Uninstall to remove all managed variables

---

## `env doctor` — Verification

```
$ <binary> env doctor

  Checking managed environment variables...

    [OK]   <BINARY>_HOME = E:\<binary> (directory exists)
    [OK]   E:\<binary> is in PATH

  Checking shell profiles...

    [OK]   PowerShell profile: <BINARY>_HOME registered
    [OK]   Git Bash profile: <BINARY>_HOME registered
    [WARN] Zsh profile: not found (not applicable on Windows)

  All checks passed.
```

### Failure Output

```
$ <binary> env doctor

  Checking managed environment variables...

    [FAIL] <BINARY>_HOME = E:\<binary> (directory does NOT exist)
    [WARN] E:\<binary> is NOT in PATH

  Suggested fix:

    <binary> env home E:\<binary>    # Re-register with valid path

  1 failure, 1 warning.
```

---

## `env set` / `env remove`

### Set

```
$ <binary> env set EDITOR "code --wait"

    [+] EDITOR = code --wait

  Registered in:
    [+] Windows Registry (User)
    [+] PowerShell profile
    [+] Git Bash profile

  To activate: restart your terminal or run:
    $env:EDITOR = "code --wait"
```

### Remove

```
$ <binary> env remove EDITOR

    [-] EDITOR removed from:
    [-] Windows Registry (User)
    [-] PowerShell profile
    [-] Git Bash profile

  To deactivate in this session:
    Remove-Item Env:\EDITOR
```

---

## Integration with Install Scripts

The install scripts (`install.ps1`, `install.sh`) should call `env home` logic after installation:

```powershell
# install.ps1 — after binary extraction
& "$InstallDir\<binary>.exe" env home "$InstallDir" --quiet
```

```bash
# install.sh — after binary extraction
"$INSTALL_DIR/<binary>" env home "$INSTALL_DIR" --quiet 2>/dev/null || true
```

The `--quiet` flag suppresses the detailed output since the installer already prints its own summary.

---

## Integration with CI/CD Pipeline

### Release Workflow

The release pipeline should verify that the installed binary can set its own home:

```yaml
- name: Verify env home
  run: |
    ./dist/<binary>-*-linux-amd64 env home /tmp/test-install --quiet
    test -n "$(<BINARY>_HOME)" || echo "::warning::env home did not persist (expected in CI)"
```

---

## File Organization

```
cmd/
    env.go                      # Subcommand routing (env, env set, env remove, env home, env doctor)
    envops.go                   # CRUD operations for variables and PATH
    envplatform_windows.go      # Registry + profile writes (Windows)
    envplatform_unix.go         # Shell profile writes (Linux/macOS)

constants/
    constants_env.go            # All env-related messages, defaults, and SQL

model/
    envregistry.go              # EnvRegistry struct and JSON serialization
```

---

## Constraints

- All environment variable writes must be idempotent (marker-based)
- Registry writes on Windows must broadcast `WM_SETTINGCHANGE`
- Shell profile writes use `# <binary>-env` markers for clean removal
- `env home` validates the directory exists before registering
- Auto-registration at startup is silent (no error on failure)
- `env doctor` never modifies the system — read-only verification
- PowerShell 5.1 compatibility (no `??`, no multi-arg `Join-Path`)

---

## Cross-References

- [Installation Flow](./08-installation-flow.md) — How install scripts register PATH
- [Terminal Output Standards](./12-terminal-output-standards.md) — Output formatting conventions
- [Deploy Path Resolution](../14-self-update-app-update/02-deploy-path-resolution.md) — How the binary location is resolved

---

*Environment variable setup — v3.1.0 — 2026-04-11*
