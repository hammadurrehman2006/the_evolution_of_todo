from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.chatbot import process_message
from dependencies import get_current_user
from database import get_session
import logging
import uuid

# Configure logging
logger = logging.getLogger(__name__)

# Optional security scheme (doesn't auto-reject)
security_optional = HTTPBearer(auto_error=False)

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
    client_secret: Optional[str] = None

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)
) -> str:
    """
    Try to get authenticated user, return anonymous ID if not authenticated.
    """
    if credentials:
        try:
            # Try to get authenticated user
            session = next(get_session())
            user_id = await get_current_user(credentials, session)
            return user_id
        except Exception as e:
            logger.info(f"Auth failed, using anonymous: {e}")
    # Return anonymous user ID
    return f"anon_{uuid.uuid4().hex[:12]}"

@router.post("/", response_model=ChatResponse)
@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_optional)
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