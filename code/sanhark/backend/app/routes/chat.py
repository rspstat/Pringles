from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database.supabase_db import get_supabase
from app.services.gemini_service import get_ai_response, get_ai_response_stream
from fastapi.responses import StreamingResponse
import json

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

# 채팅방 이름 수정
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

# 메시지 전송 (스트리밍)
@router.post("/message/stream")
async def send_message_stream(request: ChatRequest):
    supabase = get_supabase()
    
    # 사용자 메시지 저장
    user_msg = {
        "room_id": request.room_id,
        "role": "user",
        "content": request.message
    }
    supabase.table("chat_messages").insert(user_msg).execute()
    
    # 대화 내역 가져오기
    history = supabase.table("chat_messages")\
        .select("role, content")\
        .eq("room_id", request.room_id)\
        .order("created_at", desc=False)\
        .execute()
    
    conversation_history = [
        {"role": msg["role"], "content": msg["content"]} 
        for msg in history.data
    ]
    
    # 스트리밍 응답 생성
    async def stream_response():
        full_response = ""
        for chunk in get_ai_response_stream(request.message, conversation_history):
            full_response += chunk
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        
        # 완료 후 DB에 저장
        ai_msg = {
            "room_id": request.room_id,
            "role": "assistant",
            "content": full_response
        }
        supabase.table("chat_messages").insert(ai_msg).execute()
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(stream_response(), media_type="text/event-stream")

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

# 파일 읽기
@router.post("/message/stream")
async def send_message_stream(request: ChatRequest):
    supabase = get_supabase()
    
    # 사용자 메시지 저장
    user_msg = {
        "room_id": request.room_id,
        "role": "user",
        "content": request.message
    }
    supabase.table("chat_messages").insert(user_msg).execute()
    
    # 대화 내역 가져오기
    history = supabase.table("chat_messages")\
        .select("role, content")\
        .eq("room_id", request.room_id)\
        .order("created_at", desc=False)\
        .execute()
    
    conversation_history = [
        {"role": msg["role"], "content": msg["content"]} 
        for msg in history.data
    ]
    
    # 메시지에서 파일 URL 추출 및 내용 읽기
    message_with_content = request.message
    if "[첨부된 파일]" in request.message:
        import re
        import requests
        
        # URL 패턴 추출
        urls = re.findall(r'https?://[^\s]+', request.message)
        
        for url in urls:
            try:
                # 파일 다운로드
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    # 텍스트 파일인 경우 내용 추가
                    if 'text' in response.headers.get('content-type', ''):
                        file_content = response.text
                        message_with_content += f"\n\n[파일 내용]\n{file_content}\n"
            except Exception as e:
                print(f"파일 읽기 실패: {e}")
    
    # 스트리밍 응답 생성
    async def stream_response():
        full_response = ""
        for chunk in get_ai_response_stream(message_with_content, conversation_history):
            full_response += chunk
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        
        # 완료 후 DB에 저장
        ai_msg = {
            "room_id": request.room_id,
            "role": "assistant",
            "content": full_response
        }
        supabase.table("chat_messages").insert(ai_msg).execute()
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(stream_response(), media_type="text/event-stream")