@echo off
cd C:\dev\un.playground\web
title Un Playground
echo Starting Un Playground development server...
echo.
echo Opening browser to http://localhost:5174
echo.
pause
echo Closing server...
timeout /t 1 /nobreak >nul
taskkill /f /im vite.exe 2>nul