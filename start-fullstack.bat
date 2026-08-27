@echo off
title Visitor Pass Fullstack Launcher
echo ================================================================
echo  STARTING VISITOR PASS FULLSTACK APPLICATION (BACKEND + FRONTEND)
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Backend Node Server on Port 5000...
start "VisitorPass Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Frontend Vite App on Port 5173...
start "VisitorPass Frontend (Port 5173)" cmd /k "cd /d %~dp0vp_frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ================================================================
echo  BOTH SERVERS LAUNCHED SUCCESSFULLY!
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo ================================================================
pause
