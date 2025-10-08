from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from app.services.file_service import FileService

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    """단일 파일 업로드"""
    try:
        result = await FileService.save_file(file)
        return {
            "success": True,
            "message": "파일 업로드 성공",
            "data": result
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"업로드 실패: {str(e)}")

@router.post("/multiple")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """다중 파일 업로드"""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="최대 10개 파일까지 가능")
    
    results = []
    errors = []
    
    for file in files:
        try:
            result = await FileService.save_file(file)
            results.append(result)
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})
    
    return {
        "success": len(errors) == 0,
        "message": f"{len(results)}개 성공, {len(errors)}개 실패",
        "uploaded": results,
        "errors": errors
    }

@router.get("/list")
async def list_files():
    """업로드된 파일 목록"""
    import os
    from app.config import settings
    
    upload_dir = settings.UPLOAD_DIR
    if not os.path.exists(upload_dir):
        return {"files": []}
    
    files = []
    for filename in os.listdir(upload_dir):
        file_path = os.path.join(upload_dir, filename)
        if os.path.isfile(file_path):
            file_info = FileService.get_file_info(file_path)
            if file_info:
                file_info["filename"] = filename
                files.append(file_info)
    
    return {"files": files}

@router.delete("/{filename}")
async def delete_file(filename: str):
    """파일 삭제"""
    import os
    from app.config import settings
    
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    if FileService.delete_file(file_path):
        return {"success": True, "message": "삭제 완료"}
    else:
        raise HTTPException(status_code=404, detail="파일 없음")
