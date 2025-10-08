from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    file_path: str = None

@router.post("/message")
async def send_message(request: ChatRequest):
    """채팅 메시지 (임시)"""
    return {
        "response": f"회로 분석 중: '{request.message}'",
        "file_analyzed": request.file_path is not None
    }
