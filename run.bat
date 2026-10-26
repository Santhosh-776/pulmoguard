@echo off
REM PulmoGuard Launcher for Windows
cd /d "%~dp0"

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python run.py
) else (
    echo Python is not installed or not in PATH. Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)
pause
