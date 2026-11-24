[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$runGuardName = "PRACTICE_TRACKER_INTEGRATION_RUN"
$runGuardValue = "isolated-postgres-only"
$pgBinName = "PRACTICE_TRACKER_PG_BIN"
$launchPrefix = "practice-tracker-it-launch-"
$markerName = ".practice_tracker_integration_launch"
$runId = [Guid]::NewGuid().ToString("N")
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$integrationPath = [System.IO.Path]::GetFullPath(
    (Join-Path $projectRoot "tests\integration")
)
$pythonPath = [System.IO.Path]::GetFullPath(
    (Join-Path $projectRoot ".venv\Scripts\python.exe")
)
$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd(
    [System.IO.Path]::DirectorySeparatorChar,
    [System.IO.Path]::AltDirectorySeparatorChar
)
$launchPath = [System.IO.Path]::GetFullPath(
    (Join-Path $tempRoot "$launchPrefix$runId")
)
$markerPath = Join-Path $launchPath $markerName
$locationPushed = $false
$launchCreated = $false
$primaryError = $null
$cleanupError = $null
$environmentNames = @(
    $runGuardName,
    $pgBinName,
    "PYTHONPATH",
    "PYTHONDONTWRITEBYTECODE",
    "APP_NAME",
    "APP_ENV",
    "APP_DEBUG",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "DATABASE_URL",
    "SECRET_KEY",
    "ALGORITHM",
    "ACCESS_TOKEN_EXPIRE_MINUTES"
)
$savedEnvironment = @{}

function Assert-NotReparsePoint {
    param(
        [Parameter(Mandatory = $true)]
        [string]$LiteralPath,

        [Parameter(Mandatory = $true)]
        [string]$Description
    )

    $item = Get-Item -LiteralPath $LiteralPath -Force
    if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "$Description must not be a reparse point, junction, or symbolic link."
    }
}

function Assert-LaunchDirectoryIdentity {
    param(
        [Parameter(Mandatory = $true)]
        [switch]$RequireMarkerOnly
    )

    $canonicalLaunch = [System.IO.Path]::GetFullPath($launchPath)
    $canonicalParent = [System.IO.Path]::GetFullPath(
        [System.IO.Directory]::GetParent($canonicalLaunch).FullName
    ).TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    )
    if ($canonicalParent -ne $tempRoot) {
        throw "Runner cleanup directory is not a direct child of the system temp directory."
    }
    if ([System.IO.Path]::GetFileName($canonicalLaunch) -ne "$launchPrefix$runId") {
        throw "Runner cleanup directory does not belong to this invocation."
    }
    if ($canonicalLaunch -eq $tempRoot -or $canonicalLaunch -eq $projectRoot) {
        throw "Refusing to use a broad or project directory for runner cleanup."
    }
    if (-not (Test-Path -LiteralPath $canonicalLaunch -PathType Container)) {
        throw "Runner cleanup directory is missing."
    }

    Assert-NotReparsePoint -LiteralPath $tempRoot -Description "System temp directory"
    Assert-NotReparsePoint -LiteralPath $canonicalLaunch -Description "Runner directory"
    if (-not (Test-Path -LiteralPath $markerPath -PathType Leaf)) {
        throw "Runner marker is missing."
    }
    Assert-NotReparsePoint -LiteralPath $markerPath -Description "Runner marker"
    if ((Get-Content -LiteralPath $markerPath -Raw).Trim() -cne $runId) {
        throw "Runner marker does not match this invocation."
    }

    if ($RequireMarkerOnly) {
        $children = @(Get-ChildItem -LiteralPath $canonicalLaunch -Force)
        if ($children.Count -ne 1 -or $children[0].Name -cne $markerName) {
            throw "Runner directory contains unrecognized files; nothing will be deleted."
        }
    }
}

function Resolve-Postgres18Bin {
    $postgresCommand = Get-Command postgres -CommandType Application -ErrorAction Stop
    $postgresPath = [System.IO.Path]::GetFullPath($postgresCommand.Source)
    $binPath = [System.IO.Path]::GetFullPath(
        [System.IO.Directory]::GetParent($postgresPath).FullName
    )
    Assert-NotReparsePoint -LiteralPath $binPath -Description "PostgreSQL bin directory"

    $detectedVersions = @{}
    foreach ($commandName in @("postgres", "initdb", "pg_ctl", "pg_isready")) {
        $candidate = [System.IO.Path]::GetFullPath(
            (Join-Path $binPath "$commandName.exe")
        )
        if ([System.IO.Directory]::GetParent($candidate).FullName -ne $binPath) {
            throw "PostgreSQL executable escaped the selected bin directory."
        }
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
            throw "Required PostgreSQL executable is missing: $commandName."
        }
        Assert-NotReparsePoint -LiteralPath $candidate -Description "$commandName executable"
        $versionOutput = (& $candidate --version 2>&1 | Out-String).Trim()
        if ($LASTEXITCODE -ne 0 -or $versionOutput -notmatch "PostgreSQL\)?\s+(18(?:\.\d+)*)") {
            throw "PostgreSQL executable $commandName is not compatible with major version 18."
        }
        $detectedVersions[$commandName] = $Matches[1]
    }
    if (@($detectedVersions.Values | Select-Object -Unique).Count -ne 1) {
        throw "PostgreSQL executables report incompatible versions."
    }

    return $binPath
}

if (-not (Test-Path -LiteralPath $pythonPath -PathType Leaf)) {
    throw "Project Python executable was not found. No dependencies will be installed."
}

foreach ($name in $environmentNames) {
    $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, "Process")
}

try {
    New-Item -ItemType Directory -Path $launchPath -ErrorAction Stop | Out-Null
    $launchCreated = $true
    Assert-NotReparsePoint -LiteralPath $launchPath -Description "Runner directory"
    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($markerPath, $runId, $utf8WithoutBom)
    Assert-LaunchDirectoryIdentity -RequireMarkerOnly

    $postgresBin = Resolve-Postgres18Bin
    [Environment]::SetEnvironmentVariable($runGuardName, $runGuardValue, "Process")
    [Environment]::SetEnvironmentVariable($pgBinName, $postgresBin, "Process")
    [Environment]::SetEnvironmentVariable(
        "PYTHONPATH",
        "$projectRoot$([System.IO.Path]::PathSeparator)$integrationPath",
        "Process"
    )
    [Environment]::SetEnvironmentVariable("PYTHONDONTWRITEBYTECODE", "1", "Process")

    $bootstrapValues = @{
        "APP_NAME" = "Practice Tracker Integration Tests"
        "APP_ENV" = "integration-test"
        "APP_DEBUG" = "False"
        "DB_HOST" = "127.0.0.1"
        "DB_PORT" = "1"
        "DB_NAME" = "practice_tracker_it_bootstrap"
        "DB_USER" = "practice_tracker_it_bootstrap"
        "DB_PASSWORD" = "bootstrap-not-a-real-password"
        "DATABASE_URL" = "postgresql+psycopg://practice_tracker_it_bootstrap:bootstrap-not-a-real-password@127.0.0.1:1/practice_tracker_it_bootstrap"
        "SECRET_KEY" = "integration-bootstrap-only"
        "ALGORITHM" = "HS256"
        "ACCESS_TOKEN_EXPIRE_MINUTES" = "60"
    }
    foreach ($entry in $bootstrapValues.GetEnumerator()) {
        [Environment]::SetEnvironmentVariable($entry.Key, $entry.Value, "Process")
    }

    Write-Warning (
        "A hard process kill or power loss cannot run cleanup. In that event, " +
        "a marked practice-tracker integration directory may remain under the system temp directory."
    )
    Push-Location -LiteralPath $launchPath
    $locationPushed = $true
    $testScript = Join-Path $integrationPath "test_student_checkin_postgres.py"
    & $pythonPath -B $testScript -v
    if ($LASTEXITCODE -ne 0) {
        throw "Integration test process failed with exit code $LASTEXITCODE."
    }
}
catch {
    $primaryError = $_
}
finally {
    try {
        if ($locationPushed) {
            Pop-Location
            $locationPushed = $false
        }
    }
    catch {
        $cleanupError = $_
    }

    try {
        foreach ($name in $environmentNames) {
            [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], "Process")
        }
    }
    catch {
        if ($null -eq $cleanupError) {
            $cleanupError = $_
        }
    }

    if ($null -eq $cleanupError -and $launchCreated) {
        try {
            if (Test-Path -LiteralPath $launchPath) {
                if (-not (Test-Path -LiteralPath $markerPath -PathType Leaf)) {
                    throw "Runner marker was not created; the launch directory was preserved."
                }
                Assert-LaunchDirectoryIdentity -RequireMarkerOnly
                Remove-Item -LiteralPath $markerPath -Force
                $remaining = @(Get-ChildItem -LiteralPath $launchPath -Force)
                if ($remaining.Count -ne 0) {
                    throw "Runner directory changed during cleanup; it was preserved."
                }
                Remove-Item -LiteralPath $launchPath -Force
            }
        }
        catch {
            $cleanupError = $_
        }
    }
}

if ($null -ne $primaryError) {
    if ($null -ne $cleanupError) {
        try {
            Write-Warning (
                "Runner cleanup did not complete safely; temporary state was preserved. " +
                "The original launch error will be reported."
            )
        }
        catch {
            # Reporting a cleanup warning must never replace the original launch error.
        }
    }
    throw $primaryError
}

if ($null -ne $cleanupError) {
    throw $cleanupError
}
