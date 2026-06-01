"""
Campaign Predictor Lite - Backend
Local AI-powered campaign analysis using Ollama + Qwen2.5
Sequential multi-agent execution for constrained hardware
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
from typing import Optional

# Initialize FastAPI app
app = FastAPI(title="Campaign Predictor Backend")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5:7b"
TIMEOUT = 300  # 5 minutes timeout for local inference

# Request/Response Models
class CampaignInput(BaseModel):
    campaign_name: str
    target_audience: str
    budget: Optional[str] = None
    platform: str
    ad_copy: str

class AnalysisResponse(BaseModel):
    campaign_name: str
    overall_score: float
    consumer_insights: str
    marketing_insights: str
    skeptic_insights: str
    final_recommendation: str

# Prompt templates
class PromptTemplates:
    @staticmethod
    def consumer_prompt(campaign_data: CampaignInput) -> str:
        return f"""You are a Consumer Behavior Analyst. Analyze this ad campaign from a consumer perspective.

Campaign Name: {campaign_data.campaign_name}
Target Audience: {campaign_data.target_audience}
Platform: {campaign_data.platform}
Budget: {campaign_data.budget or 'Not specified'}
Ad Copy: {campaign_data.ad_copy}

Provide a brief analysis (2-3 sentences) of:
1. Emotional appeal and resonance with the target audience
2. Whether the message would capture consumer attention
3. Likelihood of consumer engagement

Be concise and direct."""

    @staticmethod
    def marketing_prompt(campaign_data: CampaignInput) -> str:
        return f"""You are a Marketing Strategy Expert. Analyze this ad campaign from a marketing perspective.

Campaign Name: {campaign_data.campaign_name}
Target Audience: {campaign_data.target_audience}
Platform: {campaign_data.platform}
Budget: {campaign_data.budget or 'Not specified'}
Ad Copy: {campaign_data.ad_copy}

Provide a brief analysis (2-3 sentences) of:
1. Targeting effectiveness and audience alignment
2. Brand positioning and messaging clarity
3. Overall campaign quality and execution

Be concise and direct."""

    @staticmethod
    def skeptic_prompt(campaign_data: CampaignInput) -> str:
        return f"""You are a Critical Campaign Analyst. Analyze this ad campaign with a skeptical perspective.

Campaign Name: {campaign_data.campaign_name}
Target Audience: {campaign_data.target_audience}
Platform: {campaign_data.platform}
Budget: {campaign_data.budget or 'Not specified'}
Ad Copy: {campaign_data.ad_copy}

Provide a brief analysis (2-3 sentences) of:
1. Potential weaknesses and risks in the campaign
2. Unrealistic claims or differentiation issues
3. What could go wrong with this approach

Be concise and direct."""

# Ollama Integration
def query_ollama(prompt: str) -> str:
    """
    Send prompt to Ollama and get response.
    Sequential execution to manage RAM constraints.
    """
    try:
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "temperature": 0.7,
        }
        
        response = requests.post(
            OLLAMA_API_URL,
            json=payload,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        else:
            raise Exception(f"Ollama error: {response.status_code}")
    
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Ollama is not running. Please start Ollama locally."
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Ollama inference timed out. Model may be too large for your hardware."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def parse_score(text: str) -> float:
    """Extract a score from 0-10 from the analysis text."""
    try:
        # Look for patterns like "score: 7/10" or "7 out of 10"
        import re
        match = re.search(r'(\d+(?:\.\d+)?)\s*(?:/|out of)\s*10', text.lower())
        if match:
            score = float(match.group(1))
            return min(10, max(0, score))
        # Default to middle score if no score found
        return 5.0
    except:
        return 5.0

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "Campaign Predictor Backend"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_campaign(campaign: CampaignInput):
    """
    Main analysis endpoint.
    Sequential execution of three AI agents.
    """
    try:
        # Step 1: Consumer Agent Analysis
        print(f"[1/3] Running Consumer Agent...")
        consumer_prompt = PromptTemplates.consumer_prompt(campaign)
        consumer_insights = query_ollama(consumer_prompt)
        
        # Step 2: Marketing Agent Analysis
        print(f"[2/3] Running Marketing Agent...")
        marketing_prompt = PromptTemplates.marketing_prompt(campaign)
        marketing_insights = query_ollama(marketing_prompt)
        
        # Step 3: Skeptic Agent Analysis
        print(f"[3/3] Running Skeptic Agent...")
        skeptic_prompt = PromptTemplates.skeptic_prompt(campaign)
        skeptic_insights = query_ollama(skeptic_prompt)
        
        # Calculate overall score (average of extracted scores)
        consumer_score = parse_score(consumer_insights)
        marketing_score = parse_score(marketing_insights)
        skeptic_score = parse_score(skeptic_insights)
        overall_score = (consumer_score + marketing_score + (10 - skeptic_score)) / 3
        overall_score = round(overall_score, 1)
        
        # Generate final recommendation
        recommendation_prompt = f"""Based on these three perspectives:

Consumer View: {consumer_insights}

Marketing View: {marketing_insights}

Skeptical View: {skeptic_insights}

Provide a single sentence final recommendation for this campaign (improve it, launch it, or reconsider it)."""
        
        final_recommendation = query_ollama(recommendation_prompt)
        
        return AnalysisResponse(
            campaign_name=campaign.campaign_name,
            overall_score=overall_score,
            consumer_insights=consumer_insights,
            marketing_insights=marketing_insights,
            skeptic_insights=skeptic_insights,
            final_recommendation=final_recommendation
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Campaign Predictor Backend",
        "version": "0.1.0",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze (POST)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
