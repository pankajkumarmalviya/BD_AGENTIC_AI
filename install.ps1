# Bridge CLI Skill Installer for Windows PowerShell

$ErrorActionPreference = "Stop"

Write-Host "Bridge CLI Skill Installer" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Detected Node.js $nodeVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Error: Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 18 or higher: https://nodejs.org/"
    exit 1
}

# Check Node version
$versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($versionNumber -lt 18) {
    Write-Host "Error: Node.js version 18 or higher is required" -ForegroundColor Red
    Write-Host "Current version: $nodeVersion"
    exit 1
}

Write-Host ""

# Determine if running from local clone or remote
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$installScript = Join-Path $scriptDir "cli\install.js"

if (Test-Path $installScript) {
    Write-Host "Running from local clone" -ForegroundColor Yellow
    node $installScript $args
} else {
    Write-Host "Downloading installer..." -ForegroundColor Yellow
    $tempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
    New-Item -ItemType Directory -Path $tempDir | Out-Null

    $installerUrl = "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/cli/install.js"
    $installerPath = Join-Path $tempDir "install.js"

    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

    Write-Host "Running installer..." -ForegroundColor Yellow
    node $installerPath $args

    Remove-Item -Recurse -Force $tempDir
}
