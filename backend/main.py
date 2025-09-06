from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import google.generativeai as genai
import asyncio
from typing import Optional, List, Dict, Any

app = FastAPI(title="AI Fake News Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API keys from .env file
from dotenv import load_dotenv
load_dotenv()

google_gemini_api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
huggingface_api_token = os.getenv("HUGGINGFACE_API_TOKEN")

# Configure Gemini AI
genai.configure(api_key=google_gemini_api_key)

class AnalysisRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    image: Optional[str] = None

class AnalysisResponse(BaseModel):
    status: str
    confidence: float
    summary: str
    sources: List[Dict[str, str]]
    is_fake: bool

@app.post("/api/analyze/", response_model=AnalysisResponse)
async def analyze_news(request: AnalysisRequest):
    user_input = request.text or request.url or ""
    
    if not user_input:
        raise HTTPException(status_code=400, detail="Input is required")

    sources = []
    summary = ""
    confidence = 0.5
    is_fake = False

    # Use Gemini AI for comprehensive fact-checking and HuggingFace as backup
    try:
        # Primary: Gemini AI for fact verification
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Analyze this news/claim for factual accuracy: "{user_input}"
        
        Please:
        1. Search your knowledge base to verify if this news/event actually happened
        2. Provide a clear TRUE/FALSE assessment
        3. Give a detailed explanation with specific facts
        4. If it's about current events, mention when it happened
        5. Rate your confidence (0-100%)
        
        Format your response as:
        VERDICT: [TRUE/FALSE]
        CONFIDENCE: [0-100]%
        EXPLANATION: [Detailed explanation with facts and context]
        """
        
        response = model.generate_content(prompt)
        gemini_text = response.text
        
        # Parse Gemini response
        verdict = "UNKNOWN"
        confidence = 50
        explanation = gemini_text
        
        if "VERDICT:" in gemini_text:
            verdict_line = gemini_text.split("VERDICT:")[1].split("\n")[0].strip()
            verdict = "TRUE" if "TRUE" in verdict_line.upper() else "FALSE"
        
        if "CONFIDENCE:" in gemini_text:
            conf_line = gemini_text.split("CONFIDENCE:")[1].split("\n")[0].strip()
            try:
                confidence = int(''.join(filter(str.isdigit, conf_line)))
            except:
                confidence = 70
        
        if "EXPLANATION:" in gemini_text:
            explanation = gemini_text.split("EXPLANATION:")[1].strip()
        
        # Determine final result
        is_fake = verdict == "FALSE"
        status = "❌ Fake" if is_fake else "✅ Real"
        final_confidence = confidence / 100.0
        
        return AnalysisResponse(
            status=status,
            confidence=final_confidence,
            summary=explanation,
            sources=[{"title": "Gemini AI Fact Check", "url": ""}],
            is_fake=is_fake
        )
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        
        # Fallback: HuggingFace for basic classification
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                hf_url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
                headers = {"Authorization": f"Bearer {huggingface_api_token}"}
                payload = {"inputs": user_input, "parameters": {"candidate_labels": ["fake news", "real news", "misleading information", "factual statement"]}}
                
                async with session.post(hf_url, headers=headers, json=payload) as response:
                    data = await response.json()
                    
                    if isinstance(data, dict) and 'scores' in data:
                        labels = data['labels']
                        scores = data['scores']
                        
                        # Find highest confidence label
                        max_idx = scores.index(max(scores))
                        top_label = labels[max_idx]
                        top_score = scores[max_idx]
                        
                        is_fake = "fake" in top_label.lower() or "misleading" in top_label.lower()
                        status = "❌ Fake" if is_fake else "✅ Real"
                        
                        return AnalysisResponse(
                            status=status,
                            confidence=top_score,
                            summary=f"AI classification: {top_label} (confidence: {top_score:.1%})",
                            sources=[{"title": "HuggingFace AI", "url": ""}],
                            is_fake=is_fake
                        )
        except Exception as hf_error:
            print(f"HuggingFace API error: {hf_error}")
    
    # Final fallback
    return AnalysisResponse(
        status="⚠️ Unable to Verify",
        confidence=0.1,
        summary="Could not verify this claim due to API limitations. Please check reliable news sources manually.",
        sources=[],
        is_fake=True
    )

async def summarize_text(text: str) -> str:
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(f"Summarize this news article in 2-3 sentences: {text}")
        return response.text
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        return "Could not summarize the article."

@app.get("/")
async def root():
    return {"message": "Fake News Detection API is running"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
