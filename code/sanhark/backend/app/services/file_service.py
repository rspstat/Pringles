import os
import uuid
import aiofiles
from datetime import datetime
from fastapi import UploadFile
from app.config import settings
from app.utils.file_validator import FileValidator

class FileService:
    @staticmethod
    async def save_file(file: UploadFile) -> dict:
        """파일 저장"""
        file_size = FileValidator.validate_file_size(file)
        extension = FileValidator.validate_file_extension(file.filename)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        safe_filename = FileValidator.sanitize_filename(file.filename)
        new_filename = f"{timestamp}_{unique_id}_{safe_filename}"
        
        upload_dir = settings.UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, new_filename)
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return {
            "filename": new_filename,
            "original_filename": file.filename,
            "file_path": file_path,
            "file_size": file_size,
            "extension": extension,
            "uploaded_at": datetime.now().isoformat()
        }
    
    @staticmethod
    def get_file_info(file_path: str) -> dict:
        """파일 정보 조회"""
        if not os.path.exists(file_path):
            return None
        
        stat = os.stat(file_path)
        return {
            "file_path": file_path,
            "file_size": stat.st_size,
            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat()
        }
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """파일 삭제"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
