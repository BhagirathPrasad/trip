# start-backend-python.ps1
Set-Location -LiteralPath "$PSScriptRoot\backend"
if (-not (Test-Path .venv)) { python -m venv .venv; & .\.venv\Scripts\Activate.ps1; python -m pip install --upgrade pip; python -m pip install -r requirements.txt } else { & .\.venv\Scripts\Activate.ps1 }
Write-Host "Starting python backend (uvicorn) in $PWD" -ForegroundColor Cyan
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000