from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.chatbot import process_message
from dependencies import get_current_user
import logging
import uuid

# Configure logging
logger = logging.getLogger(__name__)

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

async def get_current_user_optional(request: Request) -> Optional[str]:
    """
    Try to get authenticated user, return None if not authenticated.
    """
    try:
        # Check if Authorization header exists
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            # Import here to avoid circular imports
            from dependencies import security
            from fastapi.security import HTTPAuthorizationCredentials
            credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
            session = next(request.app.state.session_generator)
            user_id = await get_current_user(credentials, session)
            return user_id
    except Exception:
        pass
    return None

@router.post("/", response_model=ChatResponse)
@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    req: Request
):
    try:
        # Try to get authenticated user, or use anonymous
        user_id = await get_current_user_optional(req)
        if not user_id:
            user_id = f"anon_{uuid.uuid4().hex[:12]}"
        
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