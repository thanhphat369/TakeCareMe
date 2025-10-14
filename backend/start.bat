@echo off
echo ========================================
echo Take Care Me (TCM) - Startup Script
echo ========================================

echo.
echo [1/3] Starting Backend Server...
echo ========================================
start "TCM Backend" cmd /k "npm run start:dev"

echo.
echo [2/3] Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo [3/3] Starting Frontend Application...
echo ========================================
cd Index
start "TCM Frontend" cmd /k "npm start"

echo.
echo ========================================
echo TCM System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3000
echo Frontend App: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul




