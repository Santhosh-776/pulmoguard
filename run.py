#!/usr/bin/env python3
"""
PulmoGuard - One-Command Launcher
Runs both the FastAPI backend (port 8000) and Next.js frontend (port 3000).
Automatically checks environment, installs dependencies, and opens the browser.
"""

import os
import sys
import shutil
import subprocess
import time
import webbrowser
import signal

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
IS_WINDOWS = sys.platform == "win32"

# Paths to virtual environment executables
VENV_DIR = os.path.join(BASE_DIR, "venv")
if IS_WINDOWS:
    VENV_PYTHON = os.path.join(VENV_DIR, "Scripts", "python.exe")
    VENV_PIP = os.path.join(VENV_DIR, "Scripts", "pip.exe")
else:
    VENV_PYTHON = os.path.join(VENV_DIR, "bin", "python")
    VENV_PIP = os.path.join(VENV_DIR, "bin", "pip")

def check_prerequisites():
    """Verify that Python and Node.js / npm are installed on the system."""
    print("🔍 Checking prerequisites...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required.")
        sys.exit(1)

    # Check Node.js and npm
    node_path = shutil.which("node")
    npm_path = shutil.which("npm")

    if not node_path or not npm_path:
        print("\n" + "=" * 60)
        print("❌ Node.js and npm are required to run the frontend!")
        print("Please install Node.js (version 18 or newer):")
        print("👉 Download here: https://nodejs.org/")
        print("=" * 60 + "\n")
        sys.exit(1)

    print("✅ System prerequisites met: Python and Node.js found.")

def setup_environment_file():
    """Ensure .env exists by copying .env.example if needed."""
    env_file = os.path.join(BASE_DIR, ".env")
    env_example = os.path.join(BASE_DIR, ".env.example")
    
    if not os.path.exists(env_file):
        if os.path.exists(env_example):
            shutil.copy(env_example, env_file)
            print("📝 Created .env from .env.example.")
            print("ℹ️  Note: Open .env to configure your GROK_API_KEY (optional for AI summaries).")
        else:
            with open(env_file, "w") as f:
                f.write("GROK_API_KEY=\n")
            print("📝 Created blank .env file.")

def setup_python_venv():
    """Create virtualenv if missing and install python requirements."""
    if not os.path.exists(VENV_PYTHON):
        print("📦 Creating Python virtual environment in 'venv'...")
        subprocess.run([sys.executable, "-m", "venv", VENV_DIR], check=True)
        print("📦 Installing Python dependencies from requirements.txt...")
        subprocess.run([VENV_PIP, "install", "--upgrade", "pip"], check=True)
        subprocess.run([VENV_PIP, "install", "-r", "requirements.txt"], cwd=BASE_DIR, check=True)
    else:
        # Quick check if dependencies are installed
        try:
            subprocess.run([VENV_PYTHON, "-c", "import fastapi, uvicorn, lightgbm, shap, joblib, sklearn"],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except subprocess.CalledProcessError:
            print("📦 Updating/installing Python dependencies...")
            subprocess.run([VENV_PIP, "install", "-r", "requirements.txt"], cwd=BASE_DIR, check=True)

def setup_frontend():
    """Install frontend npm dependencies if node_modules is missing."""
    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    if not os.path.exists(node_modules):
        print("📦 Installing frontend dependencies (npm install)...")
        npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"
        subprocess.run([npm_cmd, "install"], cwd=FRONTEND_DIR, check=True)

def start_services():
    """Launch the FastAPI backend and Next.js frontend."""
    processes = []
    
    try:
        print("\n🚀 Starting PulmoGuard Backend (FastAPI on http://localhost:8000)...")
        backend_proc = subprocess.Popen(
            [VENV_PYTHON, "app.py"],
            cwd=BASE_DIR
        )
        processes.append(backend_proc)

        # Allow backend a moment to boot
        time.sleep(2)

        print("🚀 Starting PulmoGuard Frontend (Next.js on http://localhost:3000)...")
        npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"
        frontend_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=FRONTEND_DIR
        )
        processes.append(frontend_proc)

        time.sleep(3)

        print("\n" + "=" * 65)
        print("🎉 PulmoGuard is up and running!")
        print("   👉 Dashboard: http://localhost:3000")
        print("   👉 Backend API: http://localhost:8000")
        print("   👉 API Docs:    http://localhost:8000/docs")
        print("=" * 65)
        print("💡 Press Ctrl + C at any time to gracefully stop all services.\n")

        # Automatically open browser
        webbrowser.open("http://localhost:3000")

        # Keep running and wait for interrupt
        while True:
            # Check if any process died unexpectedly
            if backend_proc.poll() is not None:
                print("❌ Backend process terminated unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("❌ Frontend process terminated unexpectedly.")
                break
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Stopping all PulmoGuard services...")
    finally:
        for p in processes:
            if p.poll() is None:
                try:
                    p.terminate()
                    p.wait(timeout=3)
                except Exception:
                    p.kill()
        print("✅ All services stopped successfully.")

def main():
    print("=" * 65)
    print("   🏥 Welcome to PulmoGuard AI Lung Cancer Risk Assessment")
    print("=" * 65)
    check_prerequisites()
    setup_environment_file()
    setup_python_venv()
    setup_frontend()
    start_services()

if __name__ == "__main__":
    main()
