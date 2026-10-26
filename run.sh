#!/usr/bin/env bash
# PulmoGuard Launcher for Linux / macOS
cd "$(dirname "$0")"

if command -v python3 &>/dev/null; then
    python3 run.py
elif command -v python &>/dev/null; then
    python run.py
else
    echo "❌ Python is not installed. Please install Python 3.8+."
    exit 1
fi
