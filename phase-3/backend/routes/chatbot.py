import json
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.chatbot import process_message, process_message_stream
from dependencies import get_user_from_session

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
@router.post("", response_model=ChatResponse)
async def chat(
    request: Request,
    chat_request: ChatRequest,
    user_id: str = Depends(get_user_from_session)
):
    """Non-streaming chat endpoint for backward compatibility."""
    try:
        response = await process_message(chat_request.message, user_id)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def chat_stream(
    request: Request,
    chat_request: ChatRequest,
    user_id: str = Depends(get_user_from_session)
):
    """
    Streaming chat endpoint using Server-Sent Events (SSE).
    
    This keeps the connection alive during long-running MCP tool executions
    and prevents 504 Gateway Timeout errors by sending periodic chunks.
    """
    async def generate_stream():
        try:
            # Send start event
            yield f"data: {json.dumps({'type': 'start'})}\n\n"
            
            # Stream chunks from the chatbot
            async for chunk in process_message_stream(chat_request.message, user_id):
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            
            # Send end event
            yield f"data: {json.dumps({'type': 'end'})}\n\n"
            
        except Exception as e:
            # Send error event
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )