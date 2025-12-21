# start-backend-node.ps1
Set-Location -LiteralPath "$PSScriptRoot\backend-node"
if (-not (Test-Path .env)) { cp .env.example .env }
Write-Host "Starting backend-node (npm run dev) in $PWD" -ForegroundColor Cyan
npm run dev