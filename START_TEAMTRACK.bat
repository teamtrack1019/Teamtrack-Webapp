@echo off
title TeamTrack - WebApp Starten
echo ===================================================
echo   TeamTrack - Kunden, Rechnungen & Finanzamt
echo ===================================================
echo.
echo 1. Starte Backend Server auf Port 5000...
start cmd /k "cd backend && node src/server.js"

echo 2. Starte Frontend auf http://localhost:5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo TeamTrack laeuft! Oeffne deinen Browser unter: http://localhost:5173
timeout /t 3 >nul
start http://localhost:5173
