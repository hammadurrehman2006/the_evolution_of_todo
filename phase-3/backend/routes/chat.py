from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.chatbot import chatbot, process_message
from services.tools import UserContext
from dependencies import get_current_user
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

# Try to import ChatKitServer and our adapter
try:
    from services.chatkit_adapter import AgentChatKitServer
    from chatkit.server import StreamingResult, NonStreamingResult
    CHATKIT_AVAILABLE = True
except ImportError as e:
    CHATKIT_AVAILABLE = False
    logger.warning(f"ChatKit adapter import failed: {e}. Using fallback chat implementation.")

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

if CHATKIT_AVAILABLE:
    # Initialize our adapter
    # Note: MemoryStore is used by default in AgentChatKitServer for now.
    server = AgentChatKitServer(agent=chatbot)

    @router.post("/", include_in_schema=False)
    @router.post("", include_in_schema=False)
    async def chat(request: Request, user_id: str = Depends(get_current_user)):
        """
        Handle ChatKit requests.
        """
        try:
            # Create the user context
            user_context = UserContext(user_id=user_id)
            
            # Read raw body
            body = await request.body()
            
            # Process request
            result = await server.process(body, context=user_context)
            
            if isinstance(result, StreamingResult):
                return StreamingResponse(
                    result, 
                    media_type="text/event-stream"
                )
            elif isinstance(result, NonStreamingResult):
                return Response(
                    content=result.json, 
                    media_type="application/json"
                )
            else:
                 raise ValueError(f"Unknown result type: {type(result)}")

        except Exception as e:
            logger.error(f"Error in ChatKit handler: {e}")
            # If it's a validation error, we should return 400?
            # For now, 500 safety net.
            raise HTTPException(status_code=500, detail=str(e))

else:
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
