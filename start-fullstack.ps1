<#
.SYNOPSIS
    Fullstack Launcher PowerShell Script for Visitor Pass Application.
.DESCRIPTION
    Launches both Backend Node Server (Port 5000) and Frontend Vite App (Port 5173) and opens browser.
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path $ScriptDir

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " STARTING VISITOR PASS FULLSTACK APPLICATION" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Starting Backend Server (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; npm start"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Frontend App (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\vp_frontend'; npm run dev"

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host " FULLSTACK APPLICATION RUNNING!" -ForegroundColor Yellow
Write-Host " Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host " Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "================================================================" -ForegroundColor Cyan
