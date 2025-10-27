from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List
from app.services.file_service import FileService
from app.database.supabase_db import get_supabase

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/")
async def upload_file(
    room_id: str = Form(...),
    file: UploadFile = File(...)
):
    """단일 파일 업로드 + Supabase 저장"""
    try:
        # 로컬 저장
        result = await FileService.save_file(file)
        
        # Supabase에 메타데이터 저장
        supabase = get_supabase()
        file_data = {
            "room_id": room_id,
            "file_name": result["original_filename"],
            "file_path": result["file_path"],
            "file_size": result["file_size"],
            "file_type": result["extension"]
        }
        db_response = supabase.table("uploaded_files").insert(file_data).execute()
        
        return {
            "success": True,
            "message": "파일 업로드 성공",
            "data": {**result, "db_id": db_response.data[0]["id"]}
        }
    except HTTPException as e:
        raise e
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
    """파일 삭제"""
    supabase = get_supabase()
    
    # DB에서 파일 정보 조회
    file_info = supabase.table("uploaded_files").select("*").eq("id", file_id).execute()
    if not file_info.data:
        raise HTTPException(status_code=404, detail="파일 없음")
    
    # 로컬 파일 삭제
    file_path = file_info.data[0]["file_path"]
    FileService.delete_file(file_path)
    
    # DB에서 삭제
    supabase.table("uploaded_files").delete().eq("id", file_id).execute()
    
    return {"success": True, "message": "삭제 완료"}