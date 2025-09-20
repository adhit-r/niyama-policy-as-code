#!/usr/bin/env python3
"""
Simple BitNet Server for Niyama Policy as Code Platform
Provides mock AI-powered policy generation when model is not available
"""

import os
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Niyama BitNet AI Service",
    description="AI-powered policy generation and analysis using BitNet b1.58 2B4T",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PolicyGenerationRequest(BaseModel):
    description: str
    framework: Optional[str] = "general security"
    language: Optional[str] = "Rego"

class PolicyAnalysisRequest(BaseModel):
    policy: str
    analysis_type: str = "explain"

class PolicyAnalysisResponse(BaseModel):
    analysis: str
    suggestions: Optional[List[str]] = []
    compliance: Optional[List[str]] = []
    issues: Optional[List[str]] = []

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str

def generate_mock_policy(request: PolicyGenerationRequest) -> str:
    """Generate a mock policy when model is not available"""
    if request.language.lower() == "rego":
        return f"""package policy

# {request.description}
# Framework: {request.framework}

import rego.v1

# Policy to ensure {request.description.lower()}
deny contains msg if {{
    # Add your policy logic here
    # This is a mock policy generated when the AI model is not available
    true
    msg := "Policy violation: {request.description}"
}}

# Example rule - customize based on your requirements
allow if {{
    # Add your allow conditions here
    true
}}"""
    else:
        return f"""# {request.description}
# Framework: {request.framework}
# Language: {request.language}

# This is a mock policy generated when the AI model is not available
# Please customize this policy based on your specific requirements

policy:
  name: "{request.description}"
  framework: "{request.framework}"
  rules:
    - name: "example_rule"
      condition: "true"
      action: "allow"
      description: "Example rule - customize as needed"
"""

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model_loaded=False,  # Always false for mock mode
        version="1.0.0"
    )

@app.post("/generate-policy")
async def generate_policy(request: PolicyGenerationRequest):
    """Generate a policy from natural language description"""
    try:
        logger.info(f"Generating mock policy for: {request.description}")
        
        policy = generate_mock_policy(request)
        
        return {
            "policy": policy,
            "description": request.description,
            "framework": request.framework,
            "language": request.language,
            "note": "Generated using mock mode - AI model not available"
        }
        
    except Exception as e:
        logger.error(f"Error generating policy: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-policy", response_model=PolicyAnalysisResponse)
async def analyze_policy(request: PolicyAnalysisRequest):
    """Analyze a policy for various aspects"""
    try:
        logger.info(f"Analyzing policy with type: {request.analysis_type}")
        
        return PolicyAnalysisResponse(
            analysis=f"Mock analysis for {request.analysis_type}: {request.policy[:100]}...",
            suggestions=["This is a mock suggestion - AI model not available"],
            compliance=["Mock compliance check - AI model not available"],
            issues=["Mock issue - AI model not available"]
        )
        
    except Exception as e:
        logger.error(f"Error analyzing policy: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
