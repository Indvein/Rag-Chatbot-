from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional
from database import get_db
import models
from services.rag_service import rag_service
from services.llm_service import llm_service

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    language: str = "English"

class SourceInfo(BaseModel):
    name: str
    text: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceInfo] = []
    tokens_used: int = 0

@router.post("/", response_model=ChatResponse)
def chat_with_bot(
    request: ChatRequest, 
    req: Request,
    db: Session = Depends(get_db),
    x_api_key: Optional[str] = Header(None),
    x_ai_provider: Optional[str] = Header(None)
):
    try:
        is_trial = not x_api_key
        client_ip = req.client.host
        
        if is_trial:
            usage = db.query(models.IPTokenUsage).filter_by(ip_address=client_ip).first()
            if usage and usage.tokens_used >= 5000:
                raise HTTPException(status_code=403, detail="TRIAL_LIMIT_REACHED")
                
        # 1. Retrieve context and sources
        context, sources = rag_service.retrieve_context(request.message, db)
        
        # Generate the answer using LLM
        response_data = llm_service.generate_answer(
            query=request.message, 
            context=context,
            history=request.history,
            language=request.language,
            api_key=x_api_key,
            ai_provider=x_ai_provider
        )
        
        tokens = response_data.get("tokens_used", 0)
        
        if is_trial and tokens > 0:
            usage = db.query(models.IPTokenUsage).filter_by(ip_address=client_ip).first()
            if not usage:
                usage = models.IPTokenUsage(ip_address=client_ip, tokens_used=0)
                db.add(usage)
            usage.tokens_used += tokens
            db.commit()
            
        return ChatResponse(
            answer=response_data["answer"], 
            sources=sources,
            tokens_used=tokens
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
