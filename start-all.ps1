<#
start-all.ps1
Starts backend (FastAPI) and frontend (React) in separate PowerShell windows.
Usage:
  Right-click and "Run with PowerShell" or run from PowerShell:
    .\start-all.ps1         # runs installs and starts both
    .\start-all.ps1 -SkipInstall  # skips npm/python installs
#>

param(
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

Write-Host "Starting backend and frontend..." -ForegroundColor Cyan

# Backend: open new PowerShell window and start backend-node if available, otherwise Python backend
$backendCmd = "if (Test-Path \"$PSScriptRoot\\backend-node\") { Set-Location -LiteralPath \"$PSScriptRoot\\backend-node\"; if (-not (Test-Path .env)) { cp .env.example .env } ; npm run dev } else { Set-Location -LiteralPath \"$PSScriptRoot\\backend\"; if (-not (Test-Path .venv)) { python -m venv .venv; & .\\.venv\\Scripts\\Activate.ps1; python -m pip install --upgrade pip; python -m pip install -r requirements.txt } else { & .\\.venv\\Scripts\\Activate.ps1 } ; python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000 }"
$backendArgs = @(
  '-NoProfile',
  '-NoExit',
  '-Command',
  $backendCmd
)
Start-Process -FilePath 'powershell' -ArgumentList $backendArgs -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal

# Frontend: open new PowerShell window and start npm
$frontInstallCmd = "npm install --legacy-peer-deps"
$frontendRunCmd = "npm start"
$frontendCommand = if ($SkipInstall) { $frontendRunCmd } else { "$frontInstallCmd; $frontendRunCmd" }
$frontendArgs = @(
  '-NoProfile',
  '-NoExit',
  '-Command',
  "Set-Location -LiteralPath `$PSScriptRoot\frontend; `n$frontendCommand"
)
Start-Process -FilePath 'powershell' -ArgumentList $frontendArgs -WorkingDirectory "$PSScriptRoot\frontend" -WindowStyle Normal

Write-Host "Launched backend and frontend in separate windows. Monitor their consoles for logs." -ForegroundColor Green
