import os
import joblib
import numpy as np
import pandas as pd
import shap
import json

class PulmoGuardInference:
    def __init__(self, artifacts_dir: str = "pulmogard_artifacts"):
        self.artifacts_dir = artifacts_dir
        self.preprocessor = None
        self.lr_model = None
        self.lgb_model = None
        self.w = None
        self.threshold = None
        self.feature_names = None
        self.explainer = None
        self._load_artifacts()

    def _load_artifacts(self):
        """Load all required artifacts from disk."""
        self.preprocessor = joblib.load(os.path.join(self.artifacts_dir, "preprocessor.pkl"))
        self.lr_model = joblib.load(os.path.join(self.artifacts_dir, "lr_model.pkl"))
        self.lgb_model = joblib.load(os.path.join(self.artifacts_dir, "lgb_model.pkl"))
        
        weight_data = joblib.load(os.path.join(self.artifacts_dir, "hybrid_weight.pkl"))
        self.w = float(weight_data["hybrid_weight_lr"])
        
        threshold_data = joblib.load(os.path.join(self.artifacts_dir, "threshold.pkl"))
        self.threshold = float(threshold_data["threshold"])
        
        self.feature_names = joblib.load(os.path.join(self.artifacts_dir, "feature_names.pkl"))
        
        # Initialize the TreeExplainer once
        self.explainer = shap.TreeExplainer(self.lgb_model)

    def _lr_contributions(self, X_proc):
        coef = self.lr_model.coef_[0]
        intercept = self.lr_model.intercept_[0]
        contribs = X_proc * coef
        return contribs, intercept

    def _lgb_shap_contributions(self, X_proc):
        shap_values = self.explainer.shap_values(X_proc)
        if isinstance(shap_values, list):
            return shap_values[1]
        return shap_values

    def _hybrid_contributions(self, X_proc):
        lr_contribs, lr_intercept = self._lr_contributions(X_proc)
        lgb_contribs = self._lgb_shap_contributions(X_proc)
        hybrid_contribs = self.w * lr_contribs + (1 - self.w) * lgb_contribs
        return hybrid_contribs[0] # Return 1D array for single sample

    def predict(self, patient_data: dict) -> dict:
        """
        Run a full prediction pipeline for a single patient.
        """
        # 1. Convert to DataFrame (1 row)
        df = pd.DataFrame([patient_data])
        
        # 2. Preprocess
        X_proc = self.preprocessor.transform(df)
        
        # 3. Model Predictions
        lr_prob = self.lr_model.predict_proba(X_proc)[0, 1]
        lgb_prob = self.lgb_model.predict_proba(X_proc)[0, 1]
        hybrid_prob = self.w * lr_prob + (1 - self.w) * lgb_prob
        
        risk_level = "HIGH" if hybrid_prob >= self.threshold else "MEDIUM" if hybrid_prob >= (self.threshold * 0.5) else "LOW"

        # 4. Extract Explanations (Hybrid Contributions)
        contribs = self._hybrid_contributions(X_proc)
        
        # Format top 5 contributors
        top_k = 5
        sorted_idx = np.argsort(np.abs(contribs))[::-1][:top_k]
        
        top_contributors = []
        for j in sorted_idx:
            feature_name = self.feature_names[j]
            value = X_proc[0, j]
            contrib = float(contribs[j])
            
            direction = "INCREASE" if contrib > 0 else "DECREASE"
            
            top_contributors.append({
                "feature": feature_name,
                "contribution": contrib,
                "direction": direction,
                "processed_value": float(value)
            })

        # 5. Compile Evidence
        evidence = {
            "patient_id": patient_data.get("patient_id", "Unknown"),
            "risk_probability": round(float(hybrid_prob), 4),
            "risk_level": risk_level,
            "threshold": self.threshold,
            "top_contributors": top_contributors
        }
        
        return evidence

if __name__ == "__main__":
    print("Testing PulmoGuardInference initialization...")
    try:
        service = PulmoGuardInference()
        print("Initialization successful!")
        
        dummy_patient = {
            "patient_id": "TEST_001",
            "age": 65,
            "sex": "Male",
            "race": "White",
            "education": "High School",
            "bmi": 28.5,
            "smoking_status": "Current",
            "cigarettes_per_day": 20,
            "years_smoked": 40,
            "pack_years": 40,
            "years_since_quit": 0,
            "copd": "Yes",
            "emphysema": "No",
            "chronic_bronchitis": "No",
            "personal_cancer_history": "No",
            "family_lung_cancer": "No",
            "occupational_exposure": "None",
            "secondhand_smoke": "No",
            "alcohol_use": "Moderate",
            "screening_history": "None"
        }
        
        result = service.predict(dummy_patient)
        print("\nTest Prediction Result:")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")
