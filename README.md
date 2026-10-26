# 🫁 PulmoGuard AI - Lung Cancer Risk Assessment Platform

PulmoGuard is a clinical-grade, explainable AI platform designed for early lung cancer risk assessment. It integrates a calibrated **Hybrid ML Model** (Logistic Regression + LightGBM), **SHAP TreeExplainer** feature attributions, and a **GenAI Clinical Summarizer** with a modern Next.js interactive web dashboard.

---

## ⚡ Quick Start (One Command!)

You can run the entire application (both the FastAPI backend and Next.js frontend) with a single command on **Windows**, **macOS**, or **Linux**.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **[Python](https://www.python.org/downloads/) (v3.8 or higher)**
- **[Node.js](https://nodejs.org/) (v18 or higher)**

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/pulmoguard.git
cd pulmoguard
```

### 3. Add Your API Key (Optional for GenAI Reports)
Create your `.env` file (or let the launcher create it automatically):
```bash
cp .env.example .env
```
Open `.env` and add your Groq/Grok API key:
```env
GROK_API_KEY=your_actual_api_key_here
```
*(Note: Even without an API key, the Machine Learning prediction engine and SHAP risk factor analysis work 100% offline!)*

### 4. Run the Application
Run one of the following commands depending on your operating system:

- **Any OS (Universal):**
  ```bash
  python run.py
  ```
- **macOS / Linux:**
  ```bash
  ./run.sh
  ```
- **Windows:**
  Double-click **`run.bat`** (or type `run.bat` in Command Prompt / PowerShell)

---

### 🛠️ What `run.py` Does Automatically:
1. Verifies that **Python** and **Node.js** are installed.
2. Creates the Python virtual environment (`venv/`) if it doesn't exist.
3. Automatically installs all backend dependencies (`pip install -r requirements.txt`).
4. Automatically installs all frontend dependencies (`npm install` inside `frontend/`).
5. Launches the **FastAPI backend** on `http://localhost:8000`.
6. Launches the **Next.js frontend** on `http://localhost:3000`.
7. **Automatically opens your browser** directly to `http://localhost:3000`.
8. When you press `Ctrl + C`, both backend and frontend servers are shut down gracefully.

---

## 🌐 Application Endpoints

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | `http://localhost:3000` | Interactive clinical risk dashboard |
| **Backend API** | `http://localhost:8000` | FastAPI server |
| **API Docs (Swagger)**| `http://localhost:8000/docs` | Interactive API documentation & test sandbox |
| **Health Check** | `http://localhost:8000/health` | Backend status verification |

---

## 📁 Repository Structure

```
pulmoguard/
├── app.py                      # FastAPI server & REST API endpoints
├── inference.py                # Hybrid ML inference pipeline (LR + LightGBM + SHAP)
├── llm_service.py              # GenAI medical reporting service (LangChain / Groq)
├── requirements.txt            # Python dependencies
├── run.py                      # Universal one-command cross-platform runner
├── run.sh                      # Shell runner for Linux / macOS
├── run.bat                     # Batch runner for Windows
├── .gitignore                  # Git ignore rules (prevents uploading venv, secrets, etc.)
├── .env.example                # Template for environment variables
├── pulmogard_artifacts/        # Serialized ML models & preprocessor artifacts
│   ├── lr_model.pkl            # Trained Logistic Regression model
│   ├── lgb_model.pkl           # Trained LightGBM model
│   ├── preprocessor.pkl        # Scikit-learn preprocessing pipeline
│   ├── hybrid_weight.pkl       # Ensembling weights (0.75 LR / 0.25 LGB)
│   └── threshold.pkl           # Optimal classification decision threshold (0.67)
├── frontend/                   # Next.js modern UI dashboard
│   ├── src/                    # React components, pages, styles
│   ├── package.json            # Node.js dependencies
│   └── tsconfig.json           # TypeScript configuration
└── pulmoguard_ml_pipeline.ipynb # Full research & model training notebook
```

---

## 👥 Sharing via GitHub (Tips for the Owner)

When pushing this project to your GitHub account:
1. Make sure you don't commit your `.env` file (it is already protected in `.gitignore`).
2. Your friend only needs to clone the repo, add their own API key to `.env` (or use the template), and type `python run.py`.
# pulmoguard
