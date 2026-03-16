from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from services.chatbot import process_message
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
    try:
        response = await process_message(chat_request.message, user_id)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))