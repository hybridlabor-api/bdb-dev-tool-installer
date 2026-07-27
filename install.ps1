Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " 🚀 BDB DEV Tool Installer (Windows PowerShell)" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Error "Node.js is required to run the installer. Please install Node.js."
    exit 1
}

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Error "Python 3.10+ is required for BDB tools. Please install Python 3."
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
node "$scriptDir\installer.js" $args
