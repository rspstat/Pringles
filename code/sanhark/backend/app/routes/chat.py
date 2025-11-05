from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database.supabase_db import get_supabase
# from app.services.openai_service import get_ai_response
from app.services.gemini_service import get_ai_response

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    room_id: str
    message: str

class CreateRoomRequest(BaseModel):
    name: str
    description: Optional[str] = None

class UpdateRoomRequest(BaseModel):
    name: str

# 채팅방 생성
@router.post("/rooms")
async def create_room(request: CreateRoomRequest):
    supabase = get_supabase()
    data = {"name": request.name, "description": request.description}
    response = supabase.table("chat_rooms").insert(data).execute()
    return {"success": True, "data": response.data[0]}

# 채팅방 목록
@router.get("/rooms")
async def get_rooms():
    supabase = get_supabase()
    response = supabase.table("chat_rooms").select("*").order("created_at", desc=True).execute()
    return {"success": True, "data": response.data}

# 채팅방 이름 수정 - 새로 추가
@router.put("/rooms/{room_id}")
async def update_room(room_id: str, request: UpdateRoomRequest):
    supabase = get_supabase()
    response = supabase.table("chat_rooms").update({"name": request.name}).eq("id", room_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="채팅방을 찾을 수 없습니다")
    return {"success": True, "data": response.data[0]}

# 채팅방 삭제
@router.delete("/rooms/{room_id}")
async def delete_room(room_id: str):
    supabase = get_supabase()
    response = supabase.table("chat_rooms").delete().eq("id", room_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="채팅방을 찾을 수 없습니다")
    return {"success": True, "message": "채팅방이 삭제되었습니다"}

# 메시지 전송
@router.post("/message")
async def send_message(request: ChatRequest):
    supabase = get_supabase()
    
    # 사용자 메시지 저장
    user_msg = {
        "room_id": request.room_id,
        "role": "user",
        "content": request.message
    }
    supabase.table("chat_messages").insert(user_msg).execute()
    
    # 이전 대화 내역 가져오기
    history = supabase.table("chat_messages")\
        .select("role, content")\
        .eq("room_id", request.room_id)\
        .order("created_at", desc=False)\
        .execute()
    
    conversation_history = [
        {"role": msg["role"], "content": msg["content"]} 
        for msg in history.data
    ]
    
    # OpenAI로 응답 생성
    ai_response = get_ai_response(request.message, conversation_history)
    
    # AI 응답 저장
    ai_msg = {
        "room_id": request.room_id,
        "role": "assistant",
        "content": ai_response
    }
    supabase.table("chat_messages").insert(ai_msg).execute()
    
    return {"success": True, "response": ai_response}

# 메시지 조회
@router.get("/messages/{room_id}")
async def get_messages(room_id: str):
    supabase = get_supabase()
    response = supabase.table("chat_messages")\
        .select("*")\
        .eq("room_id", room_id)\
        .order("created_at", desc=False)\
        .execute()
    return {"success": True, "data": response.data}