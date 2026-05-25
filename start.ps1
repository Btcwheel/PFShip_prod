# Avvia backend e frontend in parallelo
Write-Host "Avvio backend FastAPI..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; uvicorn main:app --reload --port 8000"

Start-Sleep -Seconds 2

Write-Host "Avvio frontend React..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "App disponibile su: http://localhost:5250" -ForegroundColor Green
Write-Host "API docs su:        http://localhost:8000/docs" -ForegroundColor Green
