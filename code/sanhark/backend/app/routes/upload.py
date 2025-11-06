from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List
from app.services.file_service import FileService
from app.database.supabase_db import get_supabase
import os
from datetime import datetime
import uuid

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/")
async def upload_file(
    room_id: str = Form(...),
    file: UploadFile = File(...)
):
    """파일 업로드 - Supabase Storage + DB 저장"""
    try:
        supabase = get_supabase()
        
        # 1. 파일 읽기
        file_content = await file.read()
        file_size = len(file_content)
        
        # 2. 고유 파일명 생성
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        file_extension = os.path.splitext(file.filename)[1]
        storage_filename = f"{timestamp}_{unique_id}{file_extension}"
        storage_path = f"{room_id}/{storage_filename}"
        
        # 3. Supabase Storage에 업로드
        try:
            supabase.storage.from_("circuit-files").upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": file.content_type or "application/octet-stream"}
            )
        except Exception as e:
            print(f"Storage 업로드 에러: {e}")
            raise HTTPException(status_code=500, detail=f"Storage 업로드 실패: {str(e)}")
        
        # 4. Public URL 생성
        public_url = supabase.storage.from_("circuit-files").get_public_url(storage_path)
        
        # 5. DB에 메타데이터 저장
        file_data = {
            "room_id": room_id,
            "file_name": file.filename,
            "file_path": storage_path,
            "file_size": file_size,
            "file_type": file.content_type or "application/octet-stream",
            "storage_url": public_url
        }
        db_response = supabase.table("uploaded_files").insert(file_data).execute()
        
        return {
            "success": True,
            "message": "파일 업로드 성공",
            "data": {
                "id": db_response.data[0]["id"],
                "filename": file.filename,
                "file_size": file_size,
                "url": public_url
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"업로드 실패: {str(e)}")

@router.get("/room/{room_id}")
async def get_room_files(room_id: str):
    """채팅방의 파일 목록"""
    supabase = get_supabase()
    response = supabase.table("uploaded_files")\
        .select("*")\
        .eq("room_id", room_id)\
        .order("uploaded_at", desc=True)\
        .execute()
    return {"success": True, "data": response.data}

@router.delete("/{file_id}")
async def delete_file(file_id: str):
    """파일 삭제 - Storage + DB"""
    supabase = get_supabase()
    
    # DB에서 파일 정보 조회
    file_info = supabase.table("uploaded_files").select("*").eq("id", file_id).execute()
    if not file_info.data:
        raise HTTPException(status_code=404, detail="파일 없음")
    
    file_path = file_info.data[0]["file_path"]
    
    # Storage에서 파일 삭제
    try:
        supabase.storage.from_("circuit-files").remove([file_path])
    except Exception as e:
        print(f"Storage 삭제 에러: {e}")
    
    # DB에서 삭제
    supabase.table("uploaded_files").delete().eq("id", file_id).execute()
    
    return {"success": True, "message": "삭제 완료"}

@router.get("/download/{file_id}")
async def download_file(file_id: str):
    """파일 다운로드 URL 반환"""
    supabase = get_supabase()
    
    file_info = supabase.table("uploaded_files").select("*").eq("id", file_id).execute()
    if not file_info.data:
        raise HTTPException(status_code=404, detail="파일 없음")
    
    return {
        "success": True,
        "url": file_info.data[0]["storage_url"]
    }