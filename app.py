from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List

from inference import PulmoGuardInference
from llm_service import LLMService

app = FastAPI(title="PulmoGuard AI API", version="1.0.0")

# Enable CORS for the frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the inference and LLM services
print("Initializing inference engine...")
try:
    inference_service = PulmoGuardInference()
    print("Inference engine initialized.")
except Exception as e:
    print(f"Failed to initialize inference engine: {e}")
    inference_service = None

print("Initializing LLM service...")
llm_service = LLMService()

class PatientData(BaseModel):
    age: int
    sex: str
    race: str
    education: str
    bmi: float
    smoking_status: str
    cigarettes_per_day: int
    years_smoked: int
    pack_years: float
    years_since_quit: int
    copd: str
    emphysema: str
    chronic_bronchitis: str
    personal_cancer_history: str
    family_lung_cancer: str
    occupational_exposure: str
    secondhand_smoke: str
    alcohol_use: str
    screening_history: str

@app.get("/health")
def health_check():
    return {"status": "ok", "inference_loaded": inference_service is not None}

@app.post("/api/predict")
def predict_risk(patient: PatientData):
    if not inference_service:
        raise HTTPException(status_code=500, detail="Inference engine is not loaded.")
        
    try:
        # Convert pydantic model to dict
        patient_dict = patient.dict()
        patient_dict["patient_id"] = "USER_INPUT_001"
        
        # 1. Run Machine Learning Pipeline
        evidence = inference_service.predict(patient_dict)
        
        # 2. Generate GenAI Report based on ML evidence
        report = llm_service.generate_report(evidence)
        
        # 3. Compile final response
        return {
            "status": "success",
            "evidence": evidence,
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
