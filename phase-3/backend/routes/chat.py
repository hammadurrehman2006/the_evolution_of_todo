from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.chatbot import process_message
from dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: Optional[str] = None
    sessionId: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: Optional[str] = None
    sessionId: str
    operationType: Optional[str] = None
    taskId: Optional[str] = None
    # ChatKit might expect specific session fields
    client_secret: Optional[str] = None 

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    try:
        # If it's a session creation request (no message)
        if not request.message:
            return ChatResponse(
                sessionId="sess_" + user_id,
                client_secret="secret_" + user_id # Placeholder
            )

        response_text = await process_message(request.message, user_id)
        session_id = request.sessionId or ("sess_" + user_id)
        
        return ChatResponse(
            response=response_text,
            sessionId=session_id
        )
    except Exception as e:
        print(f"Error in /api/chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
