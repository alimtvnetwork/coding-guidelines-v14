<#
.SYNOPSIS
    Root-level convenience wrapper — pulls latest and runs the Go coding guidelines validator.

.DESCRIPTION
    This script forwards all arguments to linter-scripts/run.ps1.
    Place it in the repo root so you can simply run: .\run.ps1
    Use -d to skip validation and only pull.

.EXAMPLE
    .\run.ps1
    .\run.ps1 -d
    .\run.ps1 -Path "cmd" -MaxLines 20
    .\run.ps1 -Json
#>

param(
    [string]$Path = "src",
    [switch]$Json,
    [int]$MaxLines = 15,
    [switch]$d
)

$inner = Join-Path $PSScriptRoot "linter-scripts" "run.ps1"

if (-not (Test-Path $inner)) {
    Write-Host "❌ Cannot find $inner" -ForegroundColor Red
    exit 1
}

$splatArgs = @{ Path = $Path; MaxLines = $MaxLines }
if ($Json) { $splatArgs["Json"] = $true }
if ($d) { $splatArgs["d"] = $true }

& $inner @splatArgs
exit $LASTEXITCODE
