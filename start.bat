@echo off
title JKSPDC Web Platform Runner
set "PATH=%~dp0.node\node-v20.15.0-win-x64;%PATH%"

echo ===================================================
echo Starting JKSPDC Web Platform (Frontend ^& Backend)
echo ===================================================
echo.

"%~dp0.node\node-v20.15.0-win-x64\node.exe" "%~dp0dev.js"

pause
