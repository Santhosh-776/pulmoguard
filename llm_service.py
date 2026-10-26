import os
import json
from dotenv import load_dotenv
load_dotenv()

from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

SYSTEM_PROMPT_TEMPLATE = """You are a lung-cancer risk communication assistant for the PulmoGuard AI system.
You will receive structured model evidence for one patient.

STRICT GROUNDING RULES — FOLLOW EXACTLY:
1. Use ONLY the information provided in the structured evidence below.
2. Do NOT change the risk_probability value. Report it exactly as given.
3. Do NOT change the risk_level. Report it exactly as given (LOW / MEDIUM / HIGH).
4. Do NOT invent any patient information not present in the evidence.
5. Do NOT introduce risk factors that are not listed in top_contributors.
6. Do NOT diagnose cancer. Never state the patient has or does not have cancer.
7. Describe contributing factors as "model contributions" from the hybrid ML model.
8. Provide only general awareness recommendations, not clinical advice.
9. Clearly state that this result is a machine-learning risk estimate, NOT a medical diagnosis.
10. Recommend consultation with a qualified healthcare professional for any medical decision.

RESPONSE STRUCTURE:
- Start with a brief, neutral statement of the estimated risk level and probability.
- Describe the top factors the model identified as increasing risk.
- Describe the top factors the model identified as decreasing risk.
- Provide 2-3 general awareness recommendations (e.g., regular check-ups, smoking cessation awareness).
- End with a clear disclaimer that this is an ML estimate, not a clinical diagnosis.

PATIENT EVIDENCE:
{evidence_json}

Generate a grounded, structured risk communication response."""

class LLMService:
    def __init__(self):
        api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("GROK_API_KEY") or os.environ.get("XAI_API_KEY")
        
        if not api_key: 
            print("Warning: Neither GROQ_API_KEY nor GROK_API_KEY found in environment variables.")
            self.llm = None
        else:
            try:
                # Groq keys start with 'gsk_', xAI Grok keys start with 'xai-'
                if api_key.startswith("gsk_"):
                    base_url = "https://api.groq.com/openai/v1"
                    model = "openai/gpt-oss-120b"
                    print("Initializing LangChain with Groq (openai/gpt-oss-120b)...")
                else:
                    base_url = "https://api.x.ai/v1"
                    model = "grok-beta"
                    print("Initializing LangChain with xAI (Grok)...")

                self.llm = ChatOpenAI(
                    api_key=api_key,
                    base_url=base_url,
                    model=model,
                    temperature=0.2, # Low temperature for strict medical grounding
                )
            except Exception as e:
                print(f"Failed to initialize LangChain ChatOpenAI: {e}")
                self.llm = None
                
        self.prompt_template = PromptTemplate.from_template(SYSTEM_PROMPT_TEMPLATE)

    def generate_prompt(self, patient_evidence: dict) -> str:
        evidence_json = json.dumps(patient_evidence, indent=2)
        return self.prompt_template.format(evidence_json=evidence_json)

    def generate_report(self, patient_evidence: dict) -> str:
        if not self.llm:
            return "Error: LLM client not initialized. Please set XAI_API_KEY or GROK_API_KEY."
            
        try:
            evidence_json = json.dumps(patient_evidence, indent=2)
            
            # Use LangChain Expression Language (LCEL) to chain the prompt and model
            chain = self.prompt_template | self.llm
            
            # Invoke the chain
            response = chain.invoke({"evidence_json": evidence_json})
            
            # Return the text content of the AI message
            return response.content
        except Exception as e:
            return f"Error during generation: {e}"

if __name__ == "__main__":
    print("Testing LangChain Grok Service...")
    service = LLMService()
    test_evidence = {
        "patient_id": "TEST_001",
        "risk_probability": 0.5194,
        "risk_level": "MEDIUM",
        "threshold": 0.68,
        "top_contributors": [
            {
                "feature": "copd_Yes",
                "contribution": 0.2255,
                "direction": "INCREASE",
                "processed_value": 1.0
            }
        ]
    }
    
    print("Prompt Preview:\n")
    print(service.generate_prompt(test_evidence))
